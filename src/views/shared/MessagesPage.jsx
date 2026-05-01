import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { chatAPI, filesAPI, MessageType, userAPI } from '../../lib/api'
import ChatWindow from '../../components/chat/ChatWindow'
import SelectDropdown from '../../components/ui/SelectDropdown'
import { Search, MessageSquare, Loader2, RefreshCw, Stethoscope, Headphones, FileEdit as EditNoteIcon, Wrench, HeartPulse, ShieldAlert, AlertTriangle } from 'lucide-react'
const SupportAgent = Headphones
import { useToast } from '../../components/ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { startChatConnection } from '../../lib/signalr'

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
  billing: 4,
  emergency: 3,
}

const SUPPORT_CASE_TYPES = [
  {
    key: 'technical',
    labelEn: 'Technical Issue',
    labelAr: 'مشكلة تقنية',
    descEn: 'Platform issues, login problems, and bugs.',
    descAr: 'مشاكل المنصة، تسجيل الدخول، والأخطاء.',
    icon: Wrench,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    key: 'medical',
    labelEn: 'Medical Inquiry',
    labelAr: 'استفسار طبي',
    descEn: 'Questions about symptoms, sessions, or treatment guidance.',
    descAr: 'أسئلة عن الأعراض أو الجلسات أو الإرشاد العلاجي.',
    icon: HeartPulse,
    color: 'bg-green-50 text-green-700 border-green-200',
    activeColor: 'bg-green-600 text-white border-green-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    key: 'billing',
    labelEn: 'Bullying',
    labelAr: 'التنمر',
    descEn: 'Reporting bullying or harassment incidents.',
    descAr: 'الإبلاغ عن حوادث التنمر أو التحرش.',
    icon: ShieldAlert,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    activeColor: 'bg-orange-600 text-white border-orange-600',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    key: 'emergency',
    labelEn: 'Emergency',
    labelAr: 'طارئ',
    descEn: 'Urgent request that needs immediate support attention.',
    descAr: 'طلب عاجل يحتاج تدخل سريع من فريق الدعم.',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-700 border-red-200',
    activeColor: 'bg-red-600 text-white border-red-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
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
      name: room.DoctorName || room.doctorName || 'Doctor',
      image: room.DoctorImage || room.doctorImage || null,
      role: 'doctor',
    }
  }
  // Fallback: prefer doctor info if available, else patient
  if (room.DoctorName || room.doctorName) {
    return {
      name: room.DoctorName || room.doctorName || 'Doctor',
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
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
  const connectionRef = useRef(null)
  const activeRoomRef = useRef(null)
  const hydrationTimersRef = useRef({})
  const optimisticSafetyTimersRef = useRef({})
  const supportRoomIdsRef = useRef(new Set())
  const supportRoomMetaRef = useRef({})
  const supportAutoOpenHandledRef = useRef(false)
  const messagesFetchInFlightRef = useRef(new Map())
  const lastMessagesFetchAtRef = useRef(new Map())
  const debouncedFetchRoomsTimerRef = useRef(null)
  const pollingIntervalRef = useRef(null)

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

  const isPatient = role === Roles.PATIENT

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
      if (match) setActiveRoom(match)
    }
  }, [rooms, pendingRoomId, activeRoom])

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
      const normalizedRooms = enrichRoomsWithSupportMeta(incomingRooms)

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
        !normalizedRooms.some((room) => String(room?.Id || room?.id || '') === activeRoomId)

      logSupportDebug('fetchRooms:result', {
        incomingCount: incomingRooms.length,
        normalizedCount: normalizedRooms.length,
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
          ...normalizedRooms,
        ])
      } else {
        setRooms(normalizedRooms)
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
  }, [enrichRoomsWithSupportMeta, role, t])

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
    const minFetchIntervalMs = silent ? 3000 : 900
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
  }, [fetchLatestMessages])

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

  // ── SignalR ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const setupSignalR = async () => {
      try {
        const conn = await startChatConnection()
        if (!mounted) return
        connectionRef.current = conn

        const handleMessage = (msg) => {
          const currentRoom = activeRoomRef.current
          const currentRoomId = String(currentRoom?.Id || currentRoom?.id || '').trim()
          const msgRoomId = String(getIncomingRoomId(msg) || '').trim()
          const fromCurrentUser = isCurrentUserMessage(msg)
          const hasStableId = msg?.Id !== undefined && msg?.Id !== null ? true : msg?.id !== undefined && msg?.id !== null

          logSupportDebug('SignalR:ReceiveMessage', {
            msgRoomId,
            currentRoomId,
            match: currentRoomId === msgRoomId,
            fromCurrentUser,
            hasStableId,
            content: getIncomingContent(msg)?.substring(0, 30),
            rawKeys: Object.keys(msg || {}),
          })

          if (currentRoomId && currentRoomId === msgRoomId) {
            if (fromCurrentUser && !hasStableId) { scheduleSilentHydration(msgRoomId); return }
            const msgContent = getIncomingContent(msg)
            const uiMessage = {
              id: msg?.Id ?? msg?.id ?? getMessageUniqueKey(msg),
              sender: fromCurrentUser ? 'current-user' : 'other',
              content: msgContent,
              messageType: getIncomingMessageType(msg),
              timestamp: msg.CreatedAt || msg.createdAt || new Date().toISOString(),
              attachments: buildIncomingAttachments(msg),
            }
            setMessages(prev => {
              // If from current user, find and replace the matching optimistic message
              if (fromCurrentUser) {
                const optimisticIdx = prev.findIndex(m => {
                  if (!String(m.id || '').startsWith('optimistic-')) return false
                  return normalizeValue(m.content) === normalizeValue(msgContent)
                })
                if (optimisticIdx !== -1) {
                  const next = [...prev]
                  next[optimisticIdx] = uiMessage
                  return next
                }
              }
              // Avoid duplicate if message already exists (by key)
              const uiMessageKey = getMessageUniqueKey(uiMessage)
              if (prev.some(m => getMessageUniqueKey(m) === uiMessageKey)) return prev
              return [...prev, uiMessage]
            })
            chatAPI.markAsRead(msgRoomId).catch(() => {})
            
            // Clear safety timer when we get a real echo from current user
            if (fromCurrentUser && hasStableId) {
              if (optimisticSafetyTimersRef.current[msgRoomId]) {
                clearTimeout(optimisticSafetyTimersRef.current[msgRoomId])
                delete optimisticSafetyTimersRef.current[msgRoomId]
                logSupportDebug('SignalR:clearedSafetyTimer', { roomId: msgRoomId })
              }
            }
          }
          debouncedFetchRooms()
        }

        conn.off('ReceiveMessage')
        conn.on('ReceiveMessage', handleMessage)

        // Re-register handler on reconnect
        conn.onreconnected(() => {
          logSupportDebug('SignalR:reconnected')
          conn.off('ReceiveMessage')
          conn.on('ReceiveMessage', handleMessage)
          // Refresh messages after reconnect to catch any missed ones
          const roomId = String(activeRoomRef.current?.Id || activeRoomRef.current?.id || '')
          if (roomId) fetchMessages(roomId, { silent: true, force: true })
          fetchRooms()
        })

        conn.onclose(() => {
          logSupportDebug('SignalR:closed')
        })
      } catch (err) {
        console.error('SignalR Setup Error:', err)
      }
    }
    setupSignalR()
    return () => {
      mounted = false
      Object.values(hydrationTimersRef.current).forEach((t) => clearTimeout(t))
      hydrationTimersRef.current = {}
      Object.values(optimisticSafetyTimersRef.current).forEach((t) => clearTimeout(t))
      optimisticSafetyTimersRef.current = {}
      if (debouncedFetchRoomsTimerRef.current) clearTimeout(debouncedFetchRoomsTimerRef.current)
      if (connectionRef.current) {
        connectionRef.current.off('ReceiveMessage')
        connectionRef.current.off('reconnected')
        connectionRef.current.off('close')
      }
    }
  }, [user, fetchRooms, fetchMessages, debouncedFetchRooms, scheduleSilentHydration, isCurrentUserMessage])

  const activeRoomId = String(activeRoom?.Id || activeRoom?.id || '')

  // ── Polling fallback: catch messages SignalR might miss ─────────────────────
  useEffect(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    if (!activeRoomId) return

    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(activeRoomId, { silent: true })
    }, 5000)

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [activeRoomId, fetchMessages])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  useEffect(() => {
    if (!activeRoomId) return
    fetchMessages(activeRoomId, { force: true })
  }, [activeRoomId, fetchMessages])

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSendMessage = async (msgData) => {
    const roomId = activeRoom?.Id || activeRoom?.id
    if (!roomId) return

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
      setMessages(prev => {
        if (prev.some(m => String(m.id || '').startsWith('optimistic-'))) {
          fetchMessages(safetyKey, { silent: true, force: true })
        }
        return prev
      })
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
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const getConversation = (room) => {
    if (!room) return null
    const participant = resolveParticipant(room, currentUserId)
    return {
      id: room.Id || room.id,
      participant: {
        name: participant.name,
        avatar: participant.image,
        role: participant.role,
        online: true,
      },
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

  const filteredByContactType = isPatient
    ? rooms.filter((room) => {
      if (contactType === 'support') return isSupportRoom(room)
      return !isSupportRoom(room)
    })
    : rooms

  const filteredRooms = filteredByContactType.filter((room) => {
    const participant = resolveParticipant(room, currentUserId)
    return participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedSupportCaseType = SUPPORT_CASE_TYPES.find((option) => option.key === supportCaseType) || null

  const unreadTotal = rooms.reduce((acc, r) => acc + (r.UnreadCount || 0), 0)

  const openSupportChat = useCallback(async () => {
    if (!isPatient) return
    if (!currentUserId) {
      toast.error(t("auto.unableToResolvePatientId"))
      return
    }

    setContactType('support')

    setSupportRoomLoading(true)
    try {
      logSupportDebug('openSupportChat:start')
      const chatType = CASE_TYPE_CHAT_TYPE_MAP[supportCaseType] ?? 2
      const supportResponse = await chatAPI.openPatientSupportChat(currentUserId, chatType)
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
        if (supportCaseType) {
          saveRoomCaseType(matchedRoom?.Id || matchedRoom?.id, supportCaseType)
        }
        return
      }

      if (supportRoomId) {
        const syntheticSupportRoom = {
          Id: supportRoomId,
          OtherParticipantName: supportAgentName,
          OtherParticipantRole: 'support',
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
        if (supportCaseType) {
          saveRoomCaseType(supportRoomId, supportCaseType)
        }
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
    if (!isPatient || contactType !== 'support') return
    if (supportRoomLoading || loading) return
    if (rooms.some((room) => isSupportRoom(room))) return
    openSupportChat()
  }, [contactType, isPatient, isSupportRoom, loading, openSupportChat, rooms, supportRoomLoading])

  useEffect(() => {
    if (!supportCaseType || !activeRoom || !isSupportRoom(activeRoom)) return
    saveRoomCaseType(activeRoom?.Id || activeRoom?.id, supportCaseType)
  }, [activeRoom, isSupportRoom, saveRoomCaseType, supportCaseType])

  useEffect(() => {
    if (!isPatient || !shouldAutoOpenSupport) return
    if (supportAutoOpenHandledRef.current) return

    supportAutoOpenHandledRef.current = true
    openSupportChat()
  }, [isPatient, openSupportChat, shouldAutoOpenSupport])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex min-h-[calc(100vh-6rem)] h-[calc(100vh-4.25rem)] overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-background-paper"
      
    >

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <div className={`
        flex flex-col bg-background-paper border-e border-border/60
        w-full lg:w-[340px] xl:w-[380px] 2xl:w-[420px] flex-shrink-0 overflow-hidden
        ${activeRoom ? 'hidden lg:flex' : 'flex'}
      `}>

        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
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
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text-muted hover:text-primary"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {isPatient && (
            <div className="mb-3 space-y-3">
              <div className="inline-flex p-1 rounded-2xl border border-border bg-background-subtle gap-1">
                <button
                  onClick={() => setContactType('doctors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    contactType === 'doctors'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-heading hover:bg-background-paper'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {t('chat.talkToDoctors', 'Talk to Doctors')}
                  </span>
                </button>

                <button
                  onClick={() => setContactType('support')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    contactType === 'support'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-heading hover:bg-background-paper'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {supportRoomLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <SupportAgent className="w-3.5 h-3.5" />
                    )}
                    {t('chat.talkToSupport', 'Talk to Support')}
                  </span>
                </button>
              </div>

              {contactType === 'support' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-muted">
                    {t('chat.selectCaseType', 'Select Case Type')}
                  </label>
                  <SelectDropdown
                    size="sm"
                    value={supportCaseType}
                    onChange={(val) => setSupportCaseType(val)}
                    options={SUPPORT_CASE_TYPES.map((option) => ({
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
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none`} />
            <input
              type="text"
              placeholder={t('chat.searchConversations', 'Search conversations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ps-10 pe-4 py-2 bg-background-subtle border border-border/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-text placeholder:text-text-muted`}
            />
          </div>
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
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-text-muted">
                {searchQuery ? t('chat.noResults', 'No results found') : t('chat.noConversations', 'No conversations yet')}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredRooms.map((room) => {
                const isActive = (activeRoom?.Id || activeRoom?.id) === (room.Id || room.id)
                const participant = resolveParticipant(room, currentUserId)
                const name = participant.name
                const avatar = participant.image
                const roomInitials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                const hasUnread = (room.UnreadCount || 0) > 0
                const lastTime = formatLastSeen(room.LastMessageAt || room.lastMessageAt)

                return (
                  <button
                    key={room.Id || room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`
                      w-full px-4 py-3.5 transition-all text-start relative
                      ${isActive
                        ? 'bg-primary/8 border-s-2 border-s-primary'
                        : 'hover:bg-background-subtle/80 border-s-2 border-s-transparent'
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
                        <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-background-paper rounded-full" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-text-heading'}`}>
                            {name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isPatient && isSupportRoom(room) && localRoomCaseTypes[String(room.Id || room.id)] && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                (() => {
                                  const type = SUPPORT_CASE_TYPES.find((option) => option.key === localRoomCaseTypes[String(room.Id || room.id)])
                                  return type?.badgeColor ?? 'bg-secondary/10 text-secondary border-secondary/20'
                                })()
                              }`}>
                                {(() => {
                                  const type = SUPPORT_CASE_TYPES.find((option) => option.key === localRoomCaseTypes[String(room.Id || room.id)])
                                  return type ? (isRTL ? type.labelAr : type.labelEn) : ''
                                })()}
                              </span>
                            )}
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
        flex-1 flex flex-col overflow-hidden
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
          ) : (
            <ChatWindow
              conversation={safeConversation}
              onSendMessage={handleSendMessage}
              onBack={() => { setActiveRoom(null); setMessages([]) }}
            />
          )
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 start-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 end-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <EditNoteIcon className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-heading mb-2">
                {t('chat.selectConversation', 'Select a conversation')}
              </h3>
              <p className="text-sm text-text-muted max-w-xs">
                {t('chat.selectConversationDesc', 'Choose a conversation from the sidebar to start chatting')}
              </p>
              {rooms.length > 0 && (
                <div className="mt-6 flex items-center gap-2 justify-center text-xs text-text-muted">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{rooms.length} {t('chat.conversations', 'conversations')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
