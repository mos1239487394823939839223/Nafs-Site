import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { chatAPI, filesAPI, MessageType, userAPI } from '../../lib/api'
import ChatWindow from '../../components/chat/ChatWindow'
import StartDirectMessageDialog from '../../components/chat/StartDirectMessageDialog'
import SelectDropdown from '../../components/ui/SelectDropdown'
import { Search, MessageSquare, Loader2, RefreshCw, Stethoscope, Headphones, FileEdit as EditNoteIcon, Wrench, HeartPulse, AlertTriangle, CreditCard, CalendarClock, UserCog, CircleHelp, ShieldAlert, FileText, LockKeyhole, Paperclip, X } from 'lucide-react'
const SupportAgent = Headphones
import { useToast } from '../../components/ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { startChatConnection, subscribeToChatMessages } from '../../lib/signalr'
import { setActiveChatRoomForNotifications } from '../../lib/notificationUtils'
import { canStaffViewSupportRoom } from '../../lib/supportAccess'
import { getRoomCaseTypeMeta, sortSupportRooms } from '../../lib/supportCaseTypes'
import { applySupportLifecycleToRooms, getSupportConversationStatus, readSupportArchiveMeta } from '../../lib/supportChatLifecycle'
import SupportCaseTag from '../../components/support/SupportCaseTag'
import SupportPriorityTag from '../../components/support/SupportPriorityTag'

// ─── helpers ──────────────────────────────────────────────────────────────────

const getIncomingRoomId = (msg) =>
  String(msg?.RoomId || msg?.roomId || msg?.ActiveRoom || msg?.activeRoom || msg?.ChatRoomId || msg?.chatRoomId || '')

const getIncomingContent = (msg) =>
  msg?.Content ?? msg?.content ?? msg?.Text ?? msg?.text ?? ''

const getIncomingAttachmentUrl = (msg) =>
  msg?.AttachmentUrl ?? msg?.attachmentUrl ?? msg?.FileUrl ?? msg?.fileUrl ?? msg?.MediaUrl ?? msg?.mediaUrl ?? msg?.Url ?? msg?.url ?? ''

const getIncomingAttachmentName = (msg) =>
  msg?.AttachmentName ?? msg?.attachmentName ?? msg?.FileName ?? msg?.fileName ?? msg?.Name ?? msg?.name ?? 'Attachment'

const getIncomingMessageType = (msg) =>
  Number(msg?.MessageType ?? msg?.messageType ?? msg?.Type ?? msg?.type ?? 0)

const buildIncomingAttachments = (msg) => {
  const url = getIncomingAttachmentUrl(msg)
  if (!url) return []
  return [{ name: getIncomingAttachmentName(msg), url, type: url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? 'image' : 'file' }]
}

const normalizeValue = (v) => String(v ?? '').trim().toLowerCase()

const getMessageUniqueKey = (msg) => {
  const id = msg?.Id ?? msg?.id
  // Use just the backend ID for dedup — composite keys cause mismatches between
  // SignalR payloads and API responses for the same message.
  if (id !== undefined && id !== null && String(id).trim() !== '' && !String(id).startsWith('optimistic-')) {
    const strId = String(id).trim()
    return strId.startsWith('id:') ? strId : `id:${strId}`
  }

  // Fallback for messages without a stable backend ID
  const sender = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.From ?? msg?.from ?? msg?.sender)
  const content = normalizeValue(getIncomingContent(msg))
  const createdAt = normalizeValue(msg?.CreatedAt ?? msg?.createdAt ?? msg?.timestamp)
  return `fallback:${sender}|${content}|${createdAt}`
}

const sortMessagesByTime = (msgs) => {
  const withIndex = msgs.map((msg, idx) => ({ msg, idx }))
  withIndex.sort((a, b) => {
    const ta = new Date(a.msg?.CreatedAt || a.msg?.createdAt || a.msg?.timestamp || 0).getTime()
    const tb = new Date(b.msg?.CreatedAt || b.msg?.createdAt || b.msg?.timestamp || 0).getTime()
    if (ta === tb) return a.idx - b.idx
    return ta - tb
  })
  return withIndex.map((item) => item.msg)
}

const mergeMessages = (currentMessages, fetchedMessages) => {
  const fetchedKeys = new Set(fetchedMessages.map(getMessageUniqueKey))
  // Drop optimistic messages once real fetched messages arrive
  const onlyCurrent = currentMessages.filter((msg) => {
    if (fetchedKeys.has(getMessageUniqueKey(msg))) return false
    // Remove optimistic messages if we got fresh data that likely includes them
    if (fetchedMessages.length > 0 && String(msg.id || '').startsWith('optimistic-')) return false
    return true
  })
  return sortMessagesByTime([...fetchedMessages, ...onlyCurrent])
}

const extractMessagesFromResponse = (response) => {
  if (!response) return []
  if (Array.isArray(response)) return response

  const candidates = [
    response?.Data,
    response?.data,
    response?.Data?.Items,
    response?.Data?.items,
    response?.data?.Items,
    response?.data?.items,
    response?.Data?.Messages,
    response?.Data?.messages,
    response?.data?.Messages,
    response?.data?.messages,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  return []
}

const formatLastSeen = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const now = new Date()
  const diff = now - d
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days === 1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const logSupportDebug = (...args) => {
  if (!import.meta.env.DEV) return
  console.log('[SupportChat]', ...args)
}

const ROOM_CASE_KEY = 'nafs_room_case_types'

// Maps string case type key → backend ChatType integer
// Backend enum: 2=General Support, 3=Emergency, 4=Bullying
const CASE_TYPE_CHAT_TYPE_MAP = {
  technical: 2,
  medical: 2,
  billing: 2,
  emergency: 3,
  appointment: 2,
  account: 2,
  other: 2,
  blackmail_abuse: 4,
}

const PATIENT_SUPPORT_CASE_KEYS = ['technical', 'medical', 'billing', 'emergency']

const getConversationStatusLabel = (status, t) => {
  if (status === 'archived') return t('chat.statusArchived', 'Archived')
  if (status === 'closed') return t('chat.statusClosed', 'Closed')
  return t('chat.statusActive', 'Active')
}

const SUPPORT_CASE_TYPES = [
  {
    key: 'technical',
    labelEn: 'Technical Issue',
    labelAr: 'مشكلة تقنية',
    descEn: 'Platform issues, login problems, and bugs.',
    descAr: 'مشاكل المنصة أو تسجيل الدخول أو الأعطال التقنية.',
    icon: Wrench,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    activeColor: 'bg-orange-600 text-white border-orange-600',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  {
    key: 'medical',
    labelEn: 'Medical Inquiry',
    labelAr: 'استفسار علاجي',
    descEn: 'Questions about symptoms, sessions, or treatment guidance.',
    descAr: 'أسئلة عن الأعراض أو الجلسات أو الإرشاد العلاجي.',
    icon: HeartPulse,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    key: 'billing',
    labelEn: 'Billing Issue',
    labelAr: 'مشكلة في الدفع',
    descEn: 'Payments, invoices, refunds, and billing questions.',
    descAr: 'المدفوعات والفواتير والاسترداد وأي استفسار مالي.',
    icon: CreditCard,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeColor: 'bg-emerald-600 text-white border-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },
  {
    key: 'appointment',
    labelEn: 'Appointment Issue',
    labelAr: 'مشكلة في الموعد',
    descEn: 'Booking, rescheduling, cancellation, or session access.',
    descAr: 'الحجز أو تغيير الموعد أو الإلغاء أو الدخول إلى الجلسة.',
    icon: CalendarClock,
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    activeColor: 'bg-violet-600 text-white border-violet-600',
    badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    key: 'account',
    labelEn: 'Account Issue',
    labelAr: 'مشكلة في الحساب',
    descEn: 'Profile, login, privacy, or account settings.',
    descAr: 'الملف الشخصي أو الدخول أو الخصوصية أو إعدادات الحساب.',
    icon: UserCog,
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    activeColor: 'bg-sky-600 text-white border-sky-600',
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  {
    key: 'other',
    labelEn: 'Other',
    labelAr: 'أخرى',
    descEn: 'Any request that does not match the listed categories.',
    descAr: 'أي طلب لا يندرج تحت التصنيفات السابقة.',
    icon: CircleHelp,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    activeColor: 'bg-slate-600 text-white border-slate-600',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    key: 'emergency',
    labelEn: 'Emergency',
    labelAr: 'حالة طارئة',
    descEn: 'Urgent request that needs immediate support attention.',
    descAr: 'طلب عاجل يحتاج إلى تدخل سريع من فريق الدعم.',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-700 border-red-200',
    activeColor: 'bg-red-600 text-white border-red-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    key: 'blackmail_abuse',
    labelEn: 'Blackmail / Abuse Case',
    labelAr: 'ابتزاز / عنف',
    descEn: 'Private high-priority routing to the dedicated sensitive-cases support account.',
    descAr: 'توجيه سري عالي الأولوية لحساب الدعم المختص بالحالات الحساسة.',
    icon: ShieldAlert,
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    activeColor: 'bg-rose-800 text-white border-rose-800',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
]

/**
 * ChatRoomDto from API:
 * Id, DoctorId, DoctorName, DoctorImage, PatientId, PatientName, PatientImage,
 * BookingId, LastMessageAt, LastMessage, UnreadCount, IsActive
 *
 * We need to figure out "the other participant" relative to the current user.
 */
const resolveParticipant = (room, currentUserId) => {
  const otherName = room.OtherParticipantName || room.otherParticipantName
  const otherImage = room.OtherParticipantImage || room.otherParticipantImage
  const otherRole = String(room.OtherParticipantRole || room.otherParticipantRole || '').toLowerCase()

  if (otherName) {
    return {
      name: otherName,
      image: otherImage || null,
      role: otherRole || 'user',
    }
  }

  if (room.SupportAgentName || room.supportAgentName) {
    return {
      name: room.SupportAgentName || room.supportAgentName || 'Technical Support',
      image: null,
      role: 'support',
    }
  }

  const doctorId = String(room.DoctorId || room.doctorId || '')
  const patientId = String(room.PatientId || room.patientId || '')
  const uid = String(currentUserId || '')

  // If current user is the doctor → other participant is the patient
  if (uid && uid === doctorId) {
    return {
      name: room.PatientName || room.patientName || 'Patient',
      image: room.PatientImage || room.patientImage || null,
      role: 'patient',
    }
  }
  // If current user is the patient → other participant is the doctor
  if (uid && uid === patientId) {
    return {
      name: room.DoctorName || room.doctorName || 'Therapist',
      image: room.DoctorImage || room.doctorImage || null,
      role: 'doctor',
    }
  }
  // Fallback: prefer doctor info if available, else patient
  if (room.DoctorName || room.doctorName) {
    return {
      name: room.DoctorName || room.doctorName || 'Therapist',
      image: room.DoctorImage || room.doctorImage || null,
      role: 'doctor',
    }
  }
  return {
    name: room.PatientName || room.patientName || 'User',
    image: room.PatientImage || room.patientImage || null,
    role: 'patient',
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user, role } = useAuth()
  const { t, isRTL } = useLanguage()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialRoomId = searchParams.get('room')
  const initialPatientId = searchParams.get('patientId')
  const initialBookingId = searchParams.get('bookingId')
  const supportParam = String(searchParams.get('support') || '').toLowerCase()
  const shouldAutoOpenSupport = supportParam === '1' || supportParam === 'true' || supportParam === 'yes'
  const initialType = String(searchParams.get('type') || '').toLowerCase()
  const initialCaseType = String(searchParams.get('caseType') || '').toLowerCase()
  const currentUserId = String(userAPI.resolveUserId(user) || '').trim()

  const [activeRoom, setActiveRoom] = useState(null)
  const [pendingRoomId] = useState(initialRoomId || null)
  const [pendingPatientId] = useState(initialPatientId || null)
  const [pendingBookingId] = useState(initialBookingId || null)
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [supportRoomLoading, setSupportRoomLoading] = useState(false)
  const [directMessageOpen, setDirectMessageOpen] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [sidebarFilter, setSidebarFilter] = useState('all')
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [contactType, setContactType] = useState(() => {
    if (shouldAutoOpenSupport || initialType === 'support') return 'support'
    return 'doctors'
  })
  const [supportCaseType, setSupportCaseType] = useState(() => {
    return SUPPORT_CASE_TYPES.some((option) => option.key === initialCaseType) ? initialCaseType : ''
  })
  const [localRoomCaseTypes, setLocalRoomCaseTypes] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(ROOM_CASE_KEY) || '{}')
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })
  const activeRoomRef = useRef(null)
  const roomsRef = useRef([])
  const messagesRef = useRef([])
  const hydrationTimersRef = useRef({})
  const optimisticSafetyTimersRef = useRef({})
  const supportRoomIdsRef = useRef(new Set())
  const supportRoomMetaRef = useRef({})
  const supportAutoOpenHandledRef = useRef(false)
  const messagesFetchInFlightRef = useRef(new Map())
  const lastMessagesFetchAtRef = useRef(new Map())
  const debouncedFetchRoomsTimerRef = useRef(null)
  const selectedRoomFetchRef = useRef('')

  const saveRoomCaseType = useCallback((roomId, caseType) => {
    if (!roomId) return
    setLocalRoomCaseTypes((prev) => {
      const next = { ...prev, [String(roomId)]: caseType }
      try {
        localStorage.setItem(ROOM_CASE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage quota errors and keep in-memory value.
      }
      return next
    })
  }, [])

  const normalizeRoomId = useCallback((room) => String(room?.Id || room?.id || ''), [])

  const enrichRoomsWithSupportMeta = useCallback((roomsList) => {
    const enriched = roomsList.map((room) => {
      const roomId = normalizeRoomId(room)
      const supportMeta = supportRoomMetaRef.current[roomId]
      if (!supportMeta) return room

      return {
        ...room,
        OtherParticipantRole: room?.OtherParticipantRole || supportMeta.role || 'support',
        OtherParticipantName:
          room?.OtherParticipantName ||
          room?.otherParticipantName ||
          supportMeta.name ||
          t('chat.technicalTeam', 'Technical Support'),
        SupportCaseType: room?.SupportCaseType || room?.supportCaseType || supportMeta.caseType,
      }
    })

    if (role !== Roles.PATIENT) return enriched

    return [...enriched].sort((a, b) => {
      const aId = normalizeRoomId(a)
      const bId = normalizeRoomId(b)
      const aIsSupport = supportRoomIdsRef.current.has(aId)
      const bIsSupport = supportRoomIdsRef.current.has(bId)
      if (aIsSupport === bIsSupport) return 0
      return aIsSupport ? -1 : 1
    })
  }, [normalizeRoomId, role, t])

  // ── isCurrentUserMessage ────────────────────────────────────────────────────
  const isCurrentUserMessage = useCallback((msg) => {
    if (msg?.sender === 'current-user') return true
    if (msg?.sender === 'other') return false
    if (msg?.IsMine === true || msg?.isMine === true) return true
    const senderId = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.FromUserId ?? msg?.fromUserId)
    if (currentUserId && senderId) return currentUserId === senderId
    const currentUserName = normalizeValue(user?.Name ?? user?.name ?? user?.UserName ?? user?.Username)
    const senderName = normalizeValue(msg?.SenderName ?? msg?.senderName ?? msg?.From ?? msg?.from)
    if (currentUserName && senderName) return currentUserName === senderName
    return false
  }, [user, currentUserId])

  // ── Sync ref ────────────────────────────────────────────────────────────────
  useEffect(() => { activeRoomRef.current = activeRoom }, [activeRoom])
  useEffect(() => { roomsRef.current = rooms }, [rooms])
  useEffect(() => { messagesRef.current = messages }, [messages])

  const isPatient = role === Roles.PATIENT
  const isSupportOperator = role === Roles.STAFF

  const isSupportRoom = useCallback((room) => {
    const roomId = String(room?.Id || room?.id || '')
    if (roomId && supportRoomIdsRef.current.has(roomId)) return true

    const participant = resolveParticipant(room || {}, currentUserId)
    const participantRole = String(participant.role || room?.OtherParticipantRole || room?.otherParticipantRole || '').toLowerCase()
    const participantName = String(participant.name || '').toLowerCase()

    if (participantRole === 'support' || participantRole === 'staff' || participantRole === 'admin' || participantRole === '2' || participantRole === '3') {
      return true
    }

    return participantName.includes('support') || participantName.includes('الدعم')
  }, [currentUserId])

  // ── Sync URL ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const nextParams = {}
    const roomId = String(activeRoom?.Id || activeRoom?.id || '')

    if (roomId) {
      nextParams.room = roomId
    }

    if (isPatient) {
      nextParams.type = contactType === 'support' ? 'support' : 'doctors'
      if (contactType === 'support' && supportCaseType) {
        nextParams.caseType = supportCaseType
      }
    }

    const roomMatches = (searchParams.get('room') || '') === (nextParams.room || '')
    const typeMatches = !isPatient || (searchParams.get('type') || 'doctors') === nextParams.type
    const caseMatches = !isPatient || (searchParams.get('caseType') || '') === (nextParams.caseType || '')
    if (roomMatches && typeMatches && caseMatches) return

    setSearchParams(nextParams, { replace: true })
  }, [activeRoom, contactType, isPatient, searchParams, setSearchParams, supportCaseType])

  // ── Restore from URL ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pendingRoomId && rooms.length > 0 && !activeRoom) {
      const match = rooms.find((r) => String(r.Id || r.id) === String(pendingRoomId))
      if (match) {
        setActiveRoom(match)
        return
      }
      setActiveRoom({
        Id: pendingRoomId,
        OtherParticipantName: contactType === 'support' ? t('chat.technicalTeam', 'Technical Support') : t('chat.newConversation', 'Conversation'),
        OtherParticipantRole: contactType === 'support' ? 'support' : 'user',
        LastMessage: '',
        LastMessageAt: new Date().toISOString(),
        UnreadCount: 0,
        SupportCaseType: supportCaseType || localRoomCaseTypes[String(pendingRoomId)] || undefined,
      })
    }
  }, [rooms, pendingRoomId, activeRoom, contactType, localRoomCaseTypes, supportCaseType, t])

  useEffect(() => {
    if (activeRoom || rooms.length === 0 || pendingRoomId) return

    const patientId = String(pendingPatientId || '')
    const bookingId = String(pendingBookingId || '')
    if (!patientId && !bookingId) return

    const match = rooms.find((room) => {
      const roomPatientId = String(room?.PatientId || room?.patientId || '')
      const roomBookingId = String(room?.BookingId || room?.bookingId || '')
      if (patientId && roomPatientId === patientId) return true
      if (bookingId && roomBookingId === bookingId) return true
      return false
    })

    if (match) {
      setActiveRoom(match)
    }
  }, [activeRoom, rooms, pendingRoomId, pendingPatientId, pendingBookingId])

  // ── Fetch Rooms ─────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      logSupportDebug('fetchRooms:start', { role })
      const response = await chatAPI.getRooms()
      const incomingRooms = response?.Data
        ? (Array.isArray(response.Data) ? response.Data : response.Data.Items || [])
        : (Array.isArray(response) ? response : [])
      const normalizedRooms = enrichRoomsWithSupportMeta(
        applySupportLifecycleToRooms(incomingRooms, localRoomCaseTypes),
      )
      const visibleRooms =
        role === Roles.STAFF
          ? normalizedRooms.filter((room) =>
              canStaffViewSupportRoom(room, user, role, localRoomCaseTypes),
            )
          : normalizedRooms

      const activeRoomId = String(activeRoomRef.current?.Id || activeRoomRef.current?.id || '')
      const activeRole = String(activeRoomRef.current?.OtherParticipantRole || '').toLowerCase()
      const activeName = String(activeRoomRef.current?.OtherParticipantName || '').toLowerCase()
      const activeRoomKnownAsSupport =
        supportRoomIdsRef.current.has(activeRoomId) ||
        activeRole === 'support' ||
        activeRole === 'staff' ||
        activeRole === 'admin' ||
        activeName.includes('support') ||
        activeName.includes('الدعم')
      const shouldKeepSyntheticSupport =
        role === Roles.PATIENT &&
        activeRoomId &&
        activeRoomKnownAsSupport &&
        !visibleRooms.some((room) => String(room?.Id || room?.id || '') === activeRoomId)

      logSupportDebug('fetchRooms:result', {
        incomingCount: incomingRooms.length,
        normalizedCount: visibleRooms.length,
        activeRoomId,
        activeRole,
        activeRoomKnownAsSupport,
        shouldKeepSyntheticSupport,
      })

      if (shouldKeepSyntheticSupport) {
        logSupportDebug('fetchRooms:keepSyntheticSupport', {
          id: activeRoomId,
          name: activeRoomRef.current?.OtherParticipantName || null,
        })
        setRooms([
          {
            Id: activeRoomId,
            OtherParticipantName: activeRoomRef.current?.OtherParticipantName || t('chat.technicalTeam', 'Technical Support'),
            OtherParticipantRole: 'support',
            LastMessage: activeRoomRef.current?.LastMessage || '',
            LastMessageAt: activeRoomRef.current?.LastMessageAt || new Date().toISOString(),
            UnreadCount: activeRoomRef.current?.UnreadCount || 0,
          },
          ...visibleRooms,
        ])
      } else {
        setRooms(visibleRooms)
      }
    } catch (error) {
      logSupportDebug('fetchRooms:error', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      })
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [enrichRoomsWithSupportMeta, localRoomCaseTypes, role, t, user])

  // ── Fetch Messages ──────────────────────────────────────────────────────────
  const fetchLatestMessages = useCallback(async (roomId) => {
    const pageSize = 50

    const readPagesFromResponse = (response) => {
      const pages = Number(response?.Data?.Pages ?? response?.data?.Pages ?? 1)
      if (!Number.isFinite(pages) || pages <= 0) return 1
      return Math.min(pages, 20)
    }

    const collectByStartIndex = async (startIndex) => {
      const first = await chatAPI.getRoomMessages(roomId, startIndex, pageSize)
      const firstFailed = first?.IsSuccess === false
      const firstMessages = firstFailed ? [] : extractMessagesFromResponse(first)
      const pages = firstFailed ? 0 : readPagesFromResponse(first)

      if (pages <= 1) {
        return {
          messages: firstMessages,
          pages,
          failed: firstFailed,
          strategy: startIndex,
        }
      }

      const nextPageIndexes = Array.from({ length: pages - 1 }, (_, idx) => startIndex + idx + 1)
      const nextResults = await Promise.allSettled(
        nextPageIndexes.map((pageIndex) => chatAPI.getRoomMessages(roomId, pageIndex, pageSize)),
      )

      const allMessages = [...firstMessages]
      let failedCalls = firstFailed ? 1 : 0
      for (const result of nextResults) {
        if (result.status !== 'fulfilled') {
          failedCalls += 1
          continue
        }
        const response = result.value
        if (response?.IsSuccess === false) {
          failedCalls += 1
          continue
        }
        allMessages.push(...extractMessagesFromResponse(response))
      }

      return {
        messages: allMessages,
        pages,
        failed: failedCalls > 0,
        strategy: startIndex,
      }
    }

    // Keep one request strategy to avoid duplicate room message calls.
    const selected = await collectByStartIndex(1)
    const merged = selected.messages

    logSupportDebug('fetchLatestMessages:loaded', {
      roomId: String(roomId),
      count: merged.length,
      selectedStrategy: selected.strategy,
      pages: selected.pages,
      hadFailures: selected.failed,
    })

    const deduped = []
    const seen = new Set()
    for (const msg of merged) {
      const key = getMessageUniqueKey(msg)
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(msg)
    }
    logSupportDebug('fetchLatestMessages:deduped', {
      roomId: String(roomId),
      rawCount: merged.length,
      dedupedCount: deduped.length,
    })
    return sortMessagesByTime(deduped)
  }, [])

  const fetchMessages = useCallback(async (roomId, options = {}) => {
    const { silent = false, force = false } = options
    const roomKey = String(roomId || '')
    if (!roomKey) return

    const inFlight = messagesFetchInFlightRef.current.get(roomKey)
    if (inFlight) {
      await inFlight
      return
    }

    const now = Date.now()
    const lastFetchAt = lastMessagesFetchAtRef.current.get(roomKey) || 0
    const minFetchIntervalMs = 5000
    if (!force && now - lastFetchAt < minFetchIntervalMs) {
      logSupportDebug('fetchMessages:skippedCooldown', {
        roomId: roomKey,
        silent,
        elapsedMs: now - lastFetchAt,
      })
      return
    }

    const run = (async () => {
      if (!silent) setMessagesLoading(true)
      try {
        if (!silent) setMessagesError('')
        const msgs = await fetchLatestMessages(roomKey)
        if (silent) {
          setMessages((prev) => mergeMessages(prev, msgs))
        } else {
          setMessages(msgs)
        }
        lastMessagesFetchAtRef.current.set(roomKey, Date.now())
        await chatAPI.markAsRead(roomKey).catch(() => {})
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        if (!silent) setMessagesError(error?.message || t('errors.loadFailed', 'Failed to load messages'))
      } finally {
        if (!silent) setMessagesLoading(false)
      }
    })()

    messagesFetchInFlightRef.current.set(roomKey, run)
    try {
      await run
    } finally {
      messagesFetchInFlightRef.current.delete(roomKey)
    }
  }, [fetchLatestMessages, t])

  const debouncedFetchRooms = useCallback(() => {
    if (debouncedFetchRoomsTimerRef.current) clearTimeout(debouncedFetchRoomsTimerRef.current)
    debouncedFetchRoomsTimerRef.current = setTimeout(() => {
      fetchRooms()
      debouncedFetchRoomsTimerRef.current = null
    }, 2000)
  }, [fetchRooms])

  const scheduleSilentHydration = useCallback((roomId) => {
    const key = String(roomId || '')
    if (!key) return
    const existing = hydrationTimersRef.current[key]
    if (existing) clearTimeout(existing)
    hydrationTimersRef.current[key] = setTimeout(() => {
      fetchMessages(key, { silent: true })
      delete hydrationTimersRef.current[key]
    }, 450)
  }, [fetchMessages])

  // ── Update room list preview / unread locally (no network refetch) ──────────
  const applyIncomingMessageToRooms = useCallback((msg, { fromCurrentUser, isActiveRoom }) => {
    const msgRoomId = String(getIncomingRoomId(msg) || '').trim()
    if (!msgRoomId) return

    const known = roomsRef.current.some(
      (room) => String(room?.Id || room?.id || '') === msgRoomId,
    )

    // Brand-new conversation we don't track yet → one debounced rooms sync (fallback).
    if (!known) {
      if (!fromCurrentUser) debouncedFetchRooms()
      return
    }

    const previewText = getIncomingContent(msg) || (getIncomingAttachmentUrl(msg) ? 'Attachment' : '')
    const previewTime = msg?.CreatedAt || msg?.createdAt || msg?.timestamp || new Date().toISOString()

    setRooms((prev) => {
      let touched = false
      const next = prev.map((room) => {
        if (String(room?.Id || room?.id || '') !== msgRoomId) return room
        touched = true
        const prevUnread = Number(room.UnreadCount || 0)
        const nextUnread = isActiveRoom ? 0 : fromCurrentUser ? prevUnread : prevUnread + 1
        return {
          ...room,
          LastMessage: previewText,
          LastMessageAt: previewTime,
          UnreadCount: nextUnread,
        }
      })
      if (!touched) return prev
      // Surface the most recently active conversation at the top of the list.
      const idx = next.findIndex((room) => String(room?.Id || room?.id || '') === msgRoomId)
      if (idx > 0) {
        const [moved] = next.splice(idx, 1)
        next.unshift(moved)
      }
      return next
    })
  }, [debouncedFetchRooms])

  // ── SignalR: single stable ReceiveMessage handler ───────────────────────────
  const handleReceiveMessage = useCallback((msg) => {
    const currentRoom = activeRoomRef.current
    const currentRoomId = String(currentRoom?.Id || currentRoom?.id || '').trim()
    const msgRoomId = String(getIncomingRoomId(msg) || '').trim()
    const fromCurrentUser = isCurrentUserMessage(msg)
    const hasStableId = msg?.Id !== undefined && msg?.Id !== null ? true : msg?.id !== undefined && msg?.id !== null
    const isActiveRoom = Boolean(currentRoomId) && currentRoomId === msgRoomId

    logSupportDebug('SignalR:ReceiveMessage', {
      msgRoomId,
      currentRoomId,
      match: isActiveRoom,
      fromCurrentUser,
      hasStableId,
      content: getIncomingContent(msg)?.substring(0, 30),
      rawKeys: Object.keys(msg || {}),
    })

    if (isActiveRoom) {
      // Backend can emit an optimistic self-echo before DB persistence; reconcile
      // confirmed self messages via silent hydration instead of rendering twice.
      if (fromCurrentUser && !hasStableId) {
        scheduleSilentHydration(msgRoomId)
        applyIncomingMessageToRooms(msg, { fromCurrentUser, isActiveRoom })
        return
      }
      const msgContent = getIncomingContent(msg)
      const uiMessage = {
        id: msg?.Id ?? msg?.id ?? getMessageUniqueKey(msg),
        sender: fromCurrentUser ? 'current-user' : 'other',
        content: msgContent,
        messageType: getIncomingMessageType(msg),
        timestamp: msg.CreatedAt || msg.createdAt || new Date().toISOString(),
        attachments: buildIncomingAttachments(msg),
      }
      setMessages((prev) => {
        // If from current user, replace the matching optimistic message in place.
        if (fromCurrentUser) {
          const optimisticIdx = prev.findIndex((m) => {
            if (!String(m.id || '').startsWith('optimistic-')) return false
            return normalizeValue(m.content) === normalizeValue(msgContent)
          })
          if (optimisticIdx !== -1) {
            const next = [...prev]
            next[optimisticIdx] = uiMessage
            return next
          }
        }
        // Avoid duplicate if the message already exists (by stable / fallback key).
        const uiMessageKey = getMessageUniqueKey(uiMessage)
        if (prev.some((m) => getMessageUniqueKey(m) === uiMessageKey)) return prev
        return [...prev, uiMessage]
      })
      chatAPI.markAsRead(msgRoomId).catch(() => {})

      // Clear the optimistic safety timer once we get a real echo from current user.
      if (fromCurrentUser && hasStableId && optimisticSafetyTimersRef.current[msgRoomId]) {
        clearTimeout(optimisticSafetyTimersRef.current[msgRoomId])
        delete optimisticSafetyTimersRef.current[msgRoomId]
        logSupportDebug('SignalR:clearedSafetyTimer', { roomId: msgRoomId })
      }
    }

    if (!fromCurrentUser) {
      const incomingRoom = roomsRef.current.find(
        (room) => String(room?.Id || room?.id || '') === msgRoomId,
      )
      const incomingMeta = getRoomCaseTypeMeta(incomingRoom || msg, isRTL, localRoomCaseTypes)
      if (incomingMeta.priority && !isActiveRoom) {
        toast.error(
          t('support.emergencyNewMessage', 'New message in an emergency support case'),
        )
      }
    }

    // Update room preview / unread locally — no full refetch per message.
    applyIncomingMessageToRooms(msg, { fromCurrentUser, isActiveRoom })
  }, [applyIncomingMessageToRooms, isCurrentUserMessage, isRTL, localRoomCaseTypes, scheduleSilentHydration, t, toast])

  // Keep a fresh handler in a ref so the SignalR subscription registers exactly
  // ONCE per lifecycle (a stable wrapper) yet always runs the latest logic.
  const handleReceiveMessageRef = useRef(handleReceiveMessage)
  useEffect(() => { handleReceiveMessageRef.current = handleReceiveMessage }, [handleReceiveMessage])

  useEffect(() => {
    if (!user) return undefined
    // Register the handler synchronously (before start) so no incoming message is
    // missed during connection startup. Single-slot subscription replaces any prior
    // chat handler, so StrictMode / HMR / remounts never accumulate duplicates.
    const unsubscribe = subscribeToChatMessages((msg) => handleReceiveMessageRef.current(msg))
    startChatConnection().catch((err) => console.error('SignalR Setup Error:', err))
    return () => unsubscribe()
  }, [user])

  // Clean up all pending chat timers on unmount.
  useEffect(() => () => {
    Object.values(hydrationTimersRef.current).forEach((timerId) => clearTimeout(timerId))
    hydrationTimersRef.current = {}
    Object.values(optimisticSafetyTimersRef.current).forEach((timerId) => clearTimeout(timerId))
    optimisticSafetyTimersRef.current = {}
    if (debouncedFetchRoomsTimerRef.current) clearTimeout(debouncedFetchRoomsTimerRef.current)
  }, [])

  const activeRoomId = String(activeRoom?.Id || activeRoom?.id || '')

  useEffect(() => {
    setActiveChatRoomForNotifications(activeRoomId || null)
    return () => setActiveChatRoomForNotifications(null)
  }, [activeRoomId])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  useEffect(() => {
    if (!activeRoomId) {
      selectedRoomFetchRef.current = ''
      return
    }
    if (selectedRoomFetchRef.current === activeRoomId) return
    selectedRoomFetchRef.current = activeRoomId
    fetchMessages(activeRoomId, { force: true })
  }, [activeRoomId, fetchMessages])

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSendMessage = async (msgData) => {
    const roomId = activeRoom?.Id || activeRoom?.id
    if (!roomId || messageSending) return
    const savedCaseType = localRoomCaseTypes[String(roomId)]
    if (isPatient && isSupportRoom(activeRoom) && !supportCaseType && !savedCaseType) {
      toast.warning(t('chat.caseTypeRequired', 'Select a support case type before sending your first message.'))
      return
    }

    // Optimistic message — show immediately in UI
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const msgContent = msgData.content || ''
    const optimisticMsg = {
      id: optimisticId,
      sender: 'current-user',
      content: msgContent,
      timestamp: new Date().toISOString(),
      attachments: (msgData.attachments || []).map(a => ({
        name: a.name,
        url: a.url || '',
        type: a.type || 'file',
      })),
    }
    setMessages(prev => [...prev, optimisticMsg])

    // Safety net: if SignalR doesn't echo back within 3s, hydrate from server
    const safetyKey = String(roomId)
    if (optimisticSafetyTimersRef.current[safetyKey]) clearTimeout(optimisticSafetyTimersRef.current[safetyKey])
    optimisticSafetyTimersRef.current[safetyKey] = setTimeout(() => {
      if (messagesRef.current.some(m => String(m.id || '').startsWith('optimistic-'))) {
        fetchMessages(safetyKey, { silent: true, force: true })
      }
      delete optimisticSafetyTimersRef.current[safetyKey]
    }, 3000)

    try {
      const outgoingAttachments = msgData.attachments || []
      if (outgoingAttachments.length === 0) {
        const response = await chatAPI.sendMessage(roomId, msgContent)
        if (response?.IsSuccess === false) throw new Error(response?.Message || 'Failed to send message')
        debouncedFetchRooms()
        return
      }
      for (let i = 0; i < outgoingAttachments.length; i++) {
        const attachment = outgoingAttachments[i]
        const uploadResponse = await filesAPI.uploadFile(attachment.file)
        const url = uploadResponse?.Data?.PublicUrl
        const name = uploadResponse?.Data?.FileName || attachment.name
        await chatAPI.sendMessage(roomId, i === 0 ? (msgContent || '') : '', MessageType.Attachment, url || attachment.url, name)
      }
      debouncedFetchRooms()
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      const fallback = t("auto.failedToSendMessage")
      toast.error(String(error?.message || fallback))
        } finally {
          setMessageSending(false)
        }
      }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const roomAttachments = useMemo(() => {
    return messages
      .filter((msg) => getIncomingAttachmentUrl(msg))
      .map((msg) => ({
        name: getIncomingAttachmentName(msg),
        url: getIncomingAttachmentUrl(msg),
        timestamp: msg.CreatedAt || msg.timestamp,
      }))
  }, [messages])

  const getConversation = (room) => {
    if (!room) return null
    const participant = resolveParticipant(room, currentUserId)
    const onlineSignals = [
      room?.OtherParticipantOnline,
      room?.otherParticipantOnline,
      room?.IsOnline,
      room?.isOnline,
      participant.role === 'doctor' ? room?.DoctorIsOnline : null,
    ].filter((value) => value !== undefined && value !== null)
    return {
      id: room.Id || room.id,
      bookingId: room.BookingId || room.bookingId || room.ActiveBookingId || room.activeBookingId || null,
      rawRoom: room,
      participant: {
        name: participant.name,
        avatar: participant.image,
        role: participant.role,
        online: onlineSignals.length > 0
          ? onlineSignals.some((value) => value === true || String(value).toLowerCase() === 'true')
          : false,
      },
      caseTypeMeta: (role === Roles.STAFF || isSupportRoom(room))
        ? getRoomCaseTypeMeta(room, isRTL, localRoomCaseTypes)
        : null,
      messages: messages.map((msg, idx) => ({
        id: `${getMessageUniqueKey(msg)}:${idx}`,
        sender: isCurrentUserMessage(msg) ? 'current-user' : 'other',
        content: getIncomingContent(msg),
        timestamp: msg.CreatedAt || msg.timestamp || new Date().toISOString(),
        attachments: buildIncomingAttachments(msg).map((item) => ({ ...item, size: '' })),
      })),
    }
  }

  const currentConversation = getConversation(activeRoom)
  const safeConversation = currentConversation && Array.isArray(currentConversation.messages) && currentConversation.messages.length === 0 && (activeRoom?.LastMessage || activeRoom?.lastMessage)
    ? {
      ...currentConversation,
      messages: [
        {
          id: `fallback-last-${String(activeRoom?.Id || activeRoom?.id || Date.now())}`,
          sender: 'other',
          content: String(activeRoom?.LastMessage || activeRoom?.lastMessage || ''),
          timestamp: activeRoom?.LastMessageAt || activeRoom?.lastMessageAt || new Date().toISOString(),
          attachments: [],
        },
      ],
    }
    : currentConversation

  const handleStartMeeting = useCallback((conversation) => {
    const bookingId =
      conversation?.bookingId ||
      activeRoomRef.current?.BookingId ||
      activeRoomRef.current?.bookingId ||
      activeRoomRef.current?.ActiveBookingId ||
      activeRoomRef.current?.activeBookingId

    if (!bookingId) {
      toast.warning(t('chat.noLinkedBooking', 'No active booking is linked to this conversation.'))
      return
    }

    navigate(`/dashboard/patient/meeting/${bookingId}`, {
      state: {
        session: activeRoomRef.current,
      },
    })
  }, [navigate, t, toast])

  const filteredByContactType = isPatient
    ? rooms.filter((room) => {
      if (contactType === 'support') return isSupportRoom(room)
      return !isSupportRoom(room)
    })
    : isSupportOperator
      ? rooms.filter((room) => {
          const participant = resolveParticipant(room, currentUserId)
          const participantRole = String(participant.role || '').toLowerCase()
          return ['patient', 'doctor', '1', '2', '3'].includes(participantRole)
        })
      : rooms

  const filteredRooms = sortSupportRooms(
    filteredByContactType.filter((room) => {
      const participant = resolveParticipant(room, currentUserId)
      const caseMeta = getRoomCaseTypeMeta(room, isRTL, localRoomCaseTypes)
      const matchesSearch =
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(room.LastMessage || room.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = roomTypeFilter === 'all' || caseMeta.key === roomTypeFilter
      return matchesSearch && matchesType
    }),
    localRoomCaseTypes,
  )

  const selectedSupportCaseType = SUPPORT_CASE_TYPES.find((option) => option.key === supportCaseType) || null
  const patientSupportCaseOptions = useMemo(() => {
    const keys = [...PATIENT_SUPPORT_CASE_KEYS]
    if (initialCaseType === 'blackmail_abuse' || supportCaseType === 'blackmail_abuse') {
      keys.push('blackmail_abuse')
    }
    return SUPPORT_CASE_TYPES.filter((option) => keys.includes(option.key))
  }, [initialCaseType, supportCaseType])

  const unreadTotal = rooms.reduce((acc, r) => acc + (r.UnreadCount || 0), 0)
  const supportRoomsCount = rooms.filter((room) => isSupportRoom(room)).length
  const therapistRoomsCount = rooms.length - supportRoomsCount

  const handleSelectRoom = (room) => {
    if (isPatient && isSupportRoom(room)) {
      const savedCaseType = localRoomCaseTypes[String(room?.Id || room?.id || '')]
      if (!supportCaseType && !savedCaseType) {
        setContactType('support')
        toast.warning(t('chat.caseTypeRequired', 'Select a support case type before opening the conversation.'))
        return
      }
      if (!supportCaseType && savedCaseType) setSupportCaseType(savedCaseType)
    }
    setActiveRoom(room)
  }

  const handleDirectMessageStarted = useCallback(async (response, targetUser) => {
    const data = response?.Data ?? response?.data ?? response
    const roomId = String(
      data?.RoomId ||
      data?.roomId ||
      data?.Id ||
      data?.id ||
      data?.ChatRoomId ||
      data?.chatRoomId ||
      ''
    )
    const targetName =
      targetUser?.Name ||
      targetUser?.name ||
      targetUser?.UserName ||
      targetUser?.Email ||
      t('chat.newConversation', 'New conversation')

    setMessageSending(true)
    try {
      const roomsResponse = await chatAPI.getRooms()
      const roomList = Array.isArray(roomsResponse?.Data)
        ? roomsResponse.Data
        : Array.isArray(roomsResponse?.Data?.Items)
          ? roomsResponse.Data.Items
          : Array.isArray(roomsResponse)
            ? roomsResponse
            : []
      const normalizedRooms = enrichRoomsWithSupportMeta(roomList)
      setRooms(normalizedRooms)
      const matchedRoom = normalizedRooms.find((room) => String(room?.Id || room?.id || '') === roomId)
      if (matchedRoom) {
        setActiveRoom(matchedRoom)
        return
      }
    } catch (error) {
      console.error('Failed to refresh rooms after starting direct chat:', error)
    }

    if (roomId) {
      const syntheticRoom = {
        Id: roomId,
        OtherParticipantName: targetName,
        OtherParticipantImage: targetUser?.Image || targetUser?.image || null,
        OtherParticipantRole: targetUser?.RoleName || targetUser?.roleName || 'user',
        LastMessage: '',
        LastMessageAt: new Date().toISOString(),
        UnreadCount: 0,
      }
      setRooms((prev) => [syntheticRoom, ...prev.filter((room) => String(room?.Id || room?.id || '') !== roomId)])
      setActiveRoom(syntheticRoom)
    }
  }, [enrichRoomsWithSupportMeta, t])

  const openSupportChat = useCallback(async (requestedCaseType) => {
    if (!currentUserId) {
      toast.error(t("auto.unableToResolvePatientId"))
      return
    }
    const caseType = requestedCaseType || supportCaseType || 'technical'
    if (isPatient && !caseType) {
      toast.warning(t('chat.caseTypeRequired', 'Select a support case type before starting a support conversation.'))
      return
    }

    setContactType('support')
    if (caseType !== supportCaseType) setSupportCaseType(caseType)

    setSupportRoomLoading(true)
    try {
      logSupportDebug('openSupportChat:start')
      const chatType = CASE_TYPE_CHAT_TYPE_MAP[caseType] ?? 2
      const priority = caseType === 'emergency' || caseType === 'blackmail_abuse' ? 'urgent' : null
      const supportResponse = await chatAPI.openPatientSupportChat(currentUserId, chatType, caseType, priority)
      logSupportDebug('openSupportChat:response', supportResponse)
      const supportSuccess = supportResponse?.IsSuccess ?? supportResponse?.isSuccess
      if (supportSuccess === false) {
        throw new Error(supportResponse?.Message || supportResponse?.message || 'Failed to open support chat')
      }

      const supportData = supportResponse?.Data ?? supportResponse?.data ?? supportResponse

      const supportRoomId = String(
        supportData?.RoomId ||
        supportData?.roomId ||
        supportData?.Id ||
        supportData?.id ||
        supportData?.ChatRoomId ||
        supportData?.chatRoomId ||
        ''
      )
      const supportAgentName =
        supportData?.SupportAgentName ||
        supportData?.supportAgentName ||
        t('chat.technicalTeam', 'Technical Support')

      if (supportRoomId) {
        supportRoomIdsRef.current.add(supportRoomId)
        supportRoomMetaRef.current[supportRoomId] = {
          role: 'support',
          name: supportAgentName,
          caseType,
        }
      }

      const roomsResponse = await chatAPI.getRooms()
      const roomList = Array.isArray(roomsResponse?.Data)
        ? roomsResponse.Data
        : Array.isArray(roomsResponse?.Data?.Items)
          ? roomsResponse.Data.Items
          : Array.isArray(roomsResponse)
            ? roomsResponse
            : []

      logSupportDebug('openSupportChat:roomsLoaded', {
        supportRoomId,
        roomCount: roomList.length,
      })

      const normalizedRooms = enrichRoomsWithSupportMeta(roomList)
      setRooms(normalizedRooms)

      const matchedRoom = normalizedRooms.find((room) => {
        const id = String(room?.Id || room?.id || '')
        if (supportRoomId && id === supportRoomId) return true

        const participantRole = String(room?.OtherParticipantRole || room?.otherParticipantRole || '').toLowerCase()
        if (participantRole === 'staff' || participantRole === 'support' || participantRole === 'admin' || participantRole === '2' || participantRole === '3') return true

        const participantName = String(
          room?.OtherParticipantName ||
          room?.otherParticipantName ||
          room?.SupportAgentName ||
          room?.supportAgentName ||
          room?.Name ||
          ''
        ).toLowerCase()

        return participantName.includes('support') || participantName.includes('الدعم')
      })

      if (matchedRoom) {
        logSupportDebug('openSupportChat:matchedRoom', {
          matchedRoomId: String(matchedRoom?.Id || matchedRoom?.id || ''),
          participantName: matchedRoom?.OtherParticipantName || matchedRoom?.Name || null,
          participantRole: matchedRoom?.OtherParticipantRole || null,
        })
        setActiveRoom(matchedRoom)
        saveRoomCaseType(matchedRoom?.Id || matchedRoom?.id, caseType)
        return
      }

      if (supportRoomId) {
        const syntheticSupportRoom = {
          Id: supportRoomId,
          OtherParticipantName: supportAgentName,
          OtherParticipantRole: 'support',
          SupportCaseType: caseType,
          LastMessage: '',
          LastMessageAt: new Date().toISOString(),
          UnreadCount: 0,
        }

        setRooms((prev) => {
          const filtered = prev.filter((room) => String(room?.Id || room?.id || '') !== String(supportRoomId))
          return [syntheticSupportRoom, ...filtered]
        })

        logSupportDebug('openSupportChat:syntheticRoomCreated', {
          supportRoomId,
          syntheticName: syntheticSupportRoom.OtherParticipantName,
        })
        setActiveRoom(syntheticSupportRoom)
        saveRoomCaseType(supportRoomId, caseType)
      }
    } catch (error) {
      logSupportDebug('openSupportChat:error', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      })
      toast.error(
        String(
          error?.response?.data?.Message ||
          error?.response?.data?.message ||
          error?.message ||
          (t("auto.failedToOpenSupportChat"))
        )
      )
      console.error('Failed to open support chat room:', error)
    } finally {
      setSupportRoomLoading(false)
    }
  }, [currentUserId, enrichRoomsWithSupportMeta, isPatient, isRTL, saveRoomCaseType, supportCaseType, t, toast])

  useEffect(() => {
    if (!supportCaseType || !activeRoom || !isSupportRoom(activeRoom)) return
    saveRoomCaseType(activeRoom?.Id || activeRoom?.id, supportCaseType)
  }, [activeRoom, isSupportRoom, saveRoomCaseType, supportCaseType])

  useEffect(() => {
    if (!isPatient || !shouldAutoOpenSupport) return
    if (!supportCaseType) return
    if (supportAutoOpenHandledRef.current) return

    supportAutoOpenHandledRef.current = true
    openSupportChat()
  }, [isPatient, openSupportChat, shouldAutoOpenSupport, supportCaseType])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex min-h-[calc(100vh-6rem)] h-[calc(100vh-4.25rem)] overflow-hidden rounded-[26px] border border-border/70 shadow-[0_20px_55px_-35px_rgba(15,76,58,0.55)] bg-background-paper"
    >

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <div className={`
        flex flex-col bg-background-paper border-e border-border/60
        w-full lg:w-[340px] xl:w-[380px] 2xl:w-[420px] flex-shrink-0 overflow-hidden
        ${activeRoom ? 'hidden lg:flex' : 'flex'}
      `}>

        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-text-heading">{t('chat.messages', 'Messages')}</h2>
              {unreadTotal > 0 && (
                <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadTotal > 99 ? '99+' : unreadTotal}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isSupportOperator && (
                <button
                  onClick={() => setDirectMessageOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t('chat.startMessage', 'Start Message')}
                </button>
              )}
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text-muted hover:text-primary"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category Tabs (Therapists vs Support) */}
          <div className="grid grid-cols-2 gap-2 w-full bg-background-subtle p-1 rounded-2xl border border-border/65">
            <button
              onClick={() => {
                setContactType('doctors');
                setSidebarFilter('all');
              }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 ${
                contactType === 'doctors'
                  ? 'bg-background-paper text-primary shadow-sm border border-border/40'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                {t('chat.talkToDoctors', 'Talk to therapists')}
                <span className="rounded-full px-1.5 py-0.5 text-[9px] bg-primary/10 text-primary">{therapistRoomsCount}</span>
              </span>
            </button>

            <button
              onClick={() => {
                setContactType('support');
                setSidebarFilter('all');
              }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 ${
                contactType === 'support'
                  ? 'bg-background-paper text-primary shadow-sm border border-border/40'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {supportRoomLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <SupportAgent className="w-3.5 h-3.5" />
                )}
                {t('chat.talkToSupport', 'Talk to support')}
                <span className="rounded-full px-1.5 py-0.5 text-[9px] bg-primary/10 text-primary">{supportRoomsCount}</span>
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={t('chat.searchConversations', 'Search conversations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-2 bg-background-subtle border border-border/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-text placeholder:text-text-muted"
            />
          </div>

          {/* Sidebar sub-filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              ['all', t('common.all', 'All')],
              ['unread', t('chat.unread', 'Unread')],
              ['emergency', t('support.emergency', 'Emergency')],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSidebarFilter(value)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                  sidebarFilter === value
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border bg-background-paper text-text-muted hover:border-primary/40 hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Support conversation category */}
          {contactType === 'support' && isPatient && (
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <label className="text-xs font-semibold text-text-heading flex items-center justify-between gap-2">
                <span>{t('chat.selectCaseType', 'Select Case Type')}</span>
                <span className="text-[10px] text-red-600">{t('chat.required', 'Required')}</span>
              </label>
              <SelectDropdown
                size="sm"
                value={supportCaseType}
                onChange={(val) => setSupportCaseType(val)}
                options={patientSupportCaseOptions.map((option) => ({
                  value: option.key,
                  label: isRTL ? option.labelAr : option.labelEn,
                  icon: (
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${option.badgeColor}`}>
                      <option.icon className="w-3.5 h-3.5" />
                    </span>
                  ),
                }))}
              />

              {selectedSupportCaseType && (
                <p className="text-[11px] text-text-muted leading-4">
                  {isRTL ? selectedSupportCaseType.descAr : selectedSupportCaseType.descEn}
                </p>
              )}
              {supportCaseType === 'blackmail_abuse' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-start">
                  <div className="flex items-center gap-2 text-rose-800">
                    <LockKeyhole className="h-4 w-4" />
                    <p className="text-xs font-black">{isRTL ? 'بلاغ سري ومحمي' : 'Private and protected report'}</p>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-rose-700">
                    {isRTL
                      ? 'يصل البلاغ للمختصين المعتمدين فقط، وتتم معالجة بياناتك بسرية تامة وبأقل عدد من الخطوات.'
                      : 'Only approved specialists can access this report. Your information is handled confidentially with minimal steps.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-xs text-text-muted">{t('common.loading', 'Loading...')}</p>
              </div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                {contactType === 'support' ? <Headphones className="w-7 h-7 text-primary" /> : <Stethoscope className="w-7 h-7 text-primary" />}
              </div>
              <p className="text-sm font-bold text-text-heading">
                {searchQuery ? t('chat.noResults', 'No results found') : t('chat.noConversations', 'No conversations yet')}
              </p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-text-muted">
                {contactType === 'support'
                  ? t('chat.noSupportCasesDesc', 'Choose a conversation type above, then start chatting with support.')
                  : t('chat.noTherapistChatsDesc', 'Your therapist conversations will appear here after they become available.')}
              </p>
            </div>
          ) : (
            <div className="py-2 px-2 space-y-1">
              {filteredRooms.map((room) => {
                const isActive = (activeRoom?.Id || activeRoom?.id) === (room.Id || room.id)
                const participant = resolveParticipant(room, currentUserId)
                const name = participant.name
                const avatar = participant.image
                const roomInitials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                const hasUnread = (room.UnreadCount || 0) > 0
                const lastTime = formatLastSeen(room.LastMessageAt || room.lastMessageAt)
                const caseMeta = getRoomCaseTypeMeta(room, isRTL, localRoomCaseTypes)
                const isEmergency = caseMeta.priority || caseMeta.key === 'emergency' || room.SupportCaseType === 'emergency'
                const conversationStatus =
                  room?.ConversationStatus || getSupportConversationStatus(room, readSupportArchiveMeta())
                const statusLabel = getConversationStatusLabel(conversationStatus, t)

                return (
                  <button
                    key={room.Id || room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`
                      w-full px-4 py-3.5 transition-all text-start relative block rounded-2xl border
                      ${isEmergency
                        ? 'border-red-300 bg-red-50/70 shadow-md shadow-red-100/30 ring-2 ring-red-100/50 animate-pulse-subtle'
                        : isActive
                          ? 'bg-primary/8 border-primary/20 shadow-sm'
                          : 'border-transparent hover:border-border hover:bg-background-subtle/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center overflow-hidden">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-primary">{roomInitials}</span>
                          )}
                        </div>
                        {participant.role === 'doctor' && (
                          <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-background-paper rounded-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-text-heading'}`}>
                            {name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isEmergency && (
                              <span className="bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                                {isRTL ? 'حالة طارئة' : 'Emergency'}
                              </span>
                            )}
                            {(role === Roles.STAFF || (isPatient && isSupportRoom(room))) && (
                              <SupportCaseTag room={room} isRTL={isRTL} localMap={localRoomCaseTypes} />
                            )}
                            {role === Roles.STAFF && <SupportPriorityTag room={room} isRTL={isRTL} />}
                            {lastTime && (
                              <span className="text-[10px] text-text-muted whitespace-nowrap">{lastTime}</span>
                            )}
                            {hasUnread && (
                              <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {room.UnreadCount > 9 ? '9+' : room.UnreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-text font-medium' : 'text-text-muted'}`}>
                          {room.LastMessage || room.lastMessage || t('chat.noMessagesYet', 'No messages yet')}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                          {participant.role === 'doctor'
                            ? t('common.therapist', 'Therapist')
                            : participant.role === 'support'
                              ? t('chat.supportTeam', 'Support team')
                              : participant.role}
                          {isSupportRoom(room) ? ` · ${statusLabel}` : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ CHAT AREA ════════════════════ */}
      <div className={`
        flex-1 flex flex-col overflow-hidden bg-background-paper
        ${!activeRoom ? 'hidden lg:flex' : 'flex'}
      `}>
        {activeRoom ? (
          messagesLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-text-muted">{t('chat.loadingMessages', 'Loading messages...')}</p>
              </div>
            </div>
          ) : messagesError ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="max-w-sm">
                <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-600" />
                <h3 className="text-lg font-bold text-text-heading">{t('chat.messagesLoadFailed', 'Messages could not be loaded')}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{messagesError}</p>
                <button
                  onClick={() => fetchMessages(activeRoomId, { force: true })}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-dark"
                >
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            </div>
          ) : (
            <ChatWindow
              conversation={safeConversation}
              onSendMessage={handleSendMessage}
              onBack={() => { setActiveRoom(null); setMessages([]) }}
              composerDisabled={isPatient && isSupportRoom(activeRoom) && !supportCaseType && !localRoomCaseTypes[String(activeRoom?.Id || activeRoom?.id || '')]}
              composerDisabledReason={t('chat.caseTypeRequired', 'Select a support case type before sending your first message.')}
              sending={messageSending}
              onToggleDetails={() => setShowDetailsPanel(prev => !prev)}
              showDetails={showDetailsPanel}
              onStartMeeting={handleStartMeeting}
            />
          )
        ) : (
          /* Premium Empty states */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 start-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 end-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
            </div>
            {contactType === 'doctors' ? (
              <div className="relative z-10 max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Stethoscope className="w-9 h-9 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-heading mb-2">
                  {isRTL ? 'تواصل مع معالجك الخاص' : 'Consult Your Therapist'}
                </h3>
                <p className="text-sm text-text-muted leading-6 mb-6">
                  {isRTL 
                    ? 'هنا تظهر محادثاتك مع الأطباء والمعالجين. يمكنك البدء بحجز جلسة جديدة مباشرة.' 
                    : 'Your active therapist sessions and messages will appear here. Book a session to get started.'}
                </p>
                {isPatient && (
                  <button
                    onClick={() => navigate('/dashboard/patient/reserve')}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-md shadow-primary/20"
                  >
                    {isRTL ? 'احجز جلسة مع معالج' : 'Book Session with Therapist'}
                  </button>
                )}
              </div>
            ) : (
              <div className="relative z-10 max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Headphones className="w-9 h-9 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-heading mb-2">
                  {isRTL ? 'الدعم الفني والمساعدة' : 'Support Desk'}
                </h3>
                <p className="text-sm text-text-muted leading-6 mb-6">
                  {isRTL 
                    ? 'هل تواجه أي مشكلة؟ فريق الدعم متواجد لمساعدتك وحل جميع استفساراتك الفنية والطبية.' 
                    : 'Facing any issues? Start a direct chat with our support team.'}
                </p>
                {!isSupportOperator ? (
                  <button
                    onClick={() => openSupportChat('technical')}
                    disabled={supportRoomLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-md shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {supportRoomLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isRTL ? 'ابدأ محادثة دعم' : 'Start Support Chat'}
                  </button>
                ) : (
                  <p className="text-xs text-text-muted">{t('chat.selectConversationDesc', 'Choose a conversation from the sidebar to start chatting')}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════ DETAILS PANEL ════════════════════ */}
      {showDetailsPanel && activeRoom && (
        <div className={`
          hidden xl:flex flex-col bg-background-paper border-s border-border/60
          w-[320px] xl:w-[360px] flex-shrink-0 overflow-y-auto p-6 transition-all duration-300
        `}>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-6">
            <h3 className="text-base font-bold text-text-heading">{t('chat.details', 'Details')}</h3>
            <button
              onClick={() => setShowDetailsPanel(false)}
              className="p-1.5 hover:bg-background-subtle rounded-lg text-text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile details */}
          {(() => {
            const participant = resolveParticipant(activeRoom, currentUserId)
            const initials = participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            const isSupport = isSupportRoom(activeRoom)
            const caseMeta = isSupport ? getRoomCaseTypeMeta(activeRoom, isRTL, localRoomCaseTypes) : null
            
            return (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center overflow-hidden ring-4 ring-primary/10 mb-4">
                    {participant.image ? (
                      <img src={participant.image} alt={participant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-2xl">{initials}</span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-text-heading">{participant.name}</h4>
                  <span className="mt-1 inline-flex rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                    {participant.role === 'doctor'
                      ? t('common.therapist', 'Therapist')
                      : participant.role === 'support'
                        ? t('chat.supportTeam', 'Support team')
                        : participant.role}
                  </span>
                </div>

                {/* Support conversation info */}
                {isSupport && caseMeta && (
                  <div className="bg-background-subtle rounded-2xl p-4 border border-border/60 space-y-3">
                    <h5 className="text-xs font-bold text-text-heading uppercase tracking-wider">
                      {isRTL ? 'معلومات المحادثة' : 'Conversation Info'}
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">{t('chat.caseType', 'Case Type')}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${caseMeta.solidClassName || caseMeta.className}`}>
                          {caseMeta.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">{t('chat.priority', 'Priority')}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          caseMeta.priority ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {caseMeta.priority ? t('support.urgentPriority', 'Urgent') : t('support.normalPriority', 'Normal')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                <div>
                  <h5 className="text-xs font-bold text-text-heading uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{t('chat.sharedFiles', 'Shared Files')}</span>
                    <span className="text-text-muted text-[10px]">({roomAttachments.length})</span>
                  </h5>
                  {roomAttachments.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-2 text-start">{t('chat.noFilesYet', 'No shared files yet.')}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {roomAttachments.map((file, i) => {
                        const isImg = file.url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
                        return (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square rounded-xl bg-background-subtle border border-border/55 overflow-hidden flex items-center justify-center hover:opacity-95 transition-all"
                            title={file.name}
                          >
                            {isImg ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-6 h-6 text-primary" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
    <StartDirectMessageDialog
      open={directMessageOpen}
      onOpenChange={setDirectMessageOpen}
      onStarted={handleDirectMessageStarted}
    />
    </>
  )
}
