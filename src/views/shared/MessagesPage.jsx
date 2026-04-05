import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { chatAPI, filesAPI, MessageType } from '../../lib/api'
import ChatWindow from '../../components/chat/ChatWindow'
import {
  Search, ChatBubbleOutline as MessageSquare, Sync as Loader2,
  Refresh as RefreshCw, MedicalServices as Stethoscope, Person as User,
  Headphones, Support as SupportAgent, EditNote as EditNoteIcon,
} from '@mui/icons-material'
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
  if (id !== undefined && id !== null && String(id).trim() !== '') return `id:${String(id)}`
  const sender = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.From ?? msg?.from ?? msg?.sender)
  const content = normalizeValue(getIncomingContent(msg))
  const createdAt = normalizeValue(msg?.CreatedAt ?? msg?.createdAt ?? msg?.timestamp)
  const attachmentUrl = normalizeValue(getIncomingAttachmentUrl(msg))
  return `fallback:${sender}|${content}|${createdAt}|${attachmentUrl}`
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
  const onlyCurrent = currentMessages.filter((msg) => !fetchedKeys.has(getMessageUniqueKey(msg)))
  return sortMessagesByTime([...fetchedMessages, ...onlyCurrent])
}

const extractMessagesFromResponse = (response) => {
  if (!response) return []
  if (Array.isArray(response?.Data)) return response.Data
  if (Array.isArray(response?.Data?.Items)) return response.Data.Items
  if (Array.isArray(response)) return response
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

/**
 * ChatRoomDto from API:
 * Id, DoctorId, DoctorName, DoctorImage, PatientId, PatientName, PatientImage,
 * BookingId, LastMessageAt, LastMessage, UnreadCount, IsActive
 *
 * We need to figure out "the other participant" relative to the current user.
 */
const resolveParticipant = (room, currentUserId) => {
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
  const { user } = useAuth()
  const { t, isRTL } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialRoomId = searchParams.get('room')
  const currentUserId = String(user?.ID ?? user?.Id ?? user?.id ?? '')

  const [activeRoom, setActiveRoom] = useState(null)
  const [pendingRoomId] = useState(initialRoomId || null)
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const connectionRef = useRef(null)
  const activeRoomRef = useRef(null)
  const hydrationTimersRef = useRef({})

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

  // ── Sync URL ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const params = {}
    if (activeRoom) params.room = String(activeRoom.Id || activeRoom.id)
    setSearchParams(params, { replace: true })
  }, [activeRoom, setSearchParams])

  // ── Restore from URL ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pendingRoomId && rooms.length > 0 && !activeRoom) {
      const match = rooms.find((r) => String(r.Id || r.id) === String(pendingRoomId))
      if (match) setActiveRoom(match)
    }
  }, [rooms, pendingRoomId, activeRoom])

  // ── Fetch Rooms ─────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await chatAPI.getRooms()
      if (response?.Data) {
        setRooms(Array.isArray(response.Data) ? response.Data : response.Data.Items || [])
      } else if (Array.isArray(response)) {
        setRooms(response)
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch Messages ──────────────────────────────────────────────────────────
  const fetchLatestMessages = useCallback(async (roomId) => {
    const [pageZero, pageOne] = await Promise.allSettled([
      chatAPI.getRoomMessages(roomId, 0, 100),
      chatAPI.getRoomMessages(roomId, 1, 100),
    ])
    const merged = []
    if (pageZero.status === 'fulfilled') merged.push(...extractMessagesFromResponse(pageZero.value))
    if (pageOne.status === 'fulfilled') merged.push(...extractMessagesFromResponse(pageOne.value))
    const deduped = []
    const seen = new Set()
    for (const msg of merged) {
      const key = getMessageUniqueKey(msg)
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(msg)
    }
    return sortMessagesByTime(deduped)
  }, [])

  const fetchMessages = useCallback(async (roomId, options = {}) => {
    const { silent = false } = options
    if (!silent) setMessagesLoading(true)
    try {
      const msgs = await fetchLatestMessages(roomId)
      if (silent) {
        setMessages((prev) => mergeMessages(prev, msgs))
      } else {
        setMessages(msgs)
      }
      await chatAPI.markAsRead(roomId).catch(() => {})
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      if (!silent) setMessagesLoading(false)
    }
  }, [fetchLatestMessages])

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
        conn.on('ReceiveMessage', (msg) => {
          const currentRoom = activeRoomRef.current
          const currentRoomId = String(currentRoom?.Id || currentRoom?.id || '')
          const msgRoomId = getIncomingRoomId(msg)
          const fromCurrentUser = isCurrentUserMessage(msg)
          const hasStableId = msg?.Id !== undefined && msg?.Id !== null ? true : msg?.id !== undefined && msg?.id !== null
          if (currentRoomId && currentRoomId === msgRoomId) {
            if (fromCurrentUser && !hasStableId) { scheduleSilentHydration(msgRoomId); return }
            const uiMessage = {
              id: msg.Id || msg.id || Date.now(),
              sender: fromCurrentUser ? 'current-user' : 'other',
              content: getIncomingContent(msg),
              messageType: getIncomingMessageType(msg),
              timestamp: msg.CreatedAt || msg.createdAt || new Date().toISOString(),
              attachments: buildIncomingAttachments(msg),
            }
            setMessages(prev => [...prev, uiMessage])
            chatAPI.markAsRead(msgRoomId).catch(() => {})
            scheduleSilentHydration(msgRoomId)
          }
          fetchRooms()
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
      if (connectionRef.current) connectionRef.current.off('ReceiveMessage')
    }
  }, [user, fetchRooms, scheduleSilentHydration, isCurrentUserMessage])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  useEffect(() => {
    if (activeRoom) fetchMessages(activeRoom.Id || activeRoom.id)
  }, [activeRoom, fetchMessages])

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSendMessage = async (msgData) => {
    const roomId = activeRoom?.Id || activeRoom?.id
    if (!roomId) return
    try {
      const outgoingAttachments = msgData.attachments || []
      if (outgoingAttachments.length === 0) {
        const response = await chatAPI.sendMessage(roomId, msgData.content)
        if (response?.IsSuccess === false) throw new Error(response?.Message || 'Failed to send message')
        return
      }
      for (let i = 0; i < outgoingAttachments.length; i++) {
        const attachment = outgoingAttachments[i]
        const uploadResponse = await filesAPI.uploadFile(attachment.file)
        const url = uploadResponse?.Data?.PublicUrl
        const name = uploadResponse?.Data?.FileName || attachment.name
        await chatAPI.sendMessage(roomId, i === 0 ? (msgData.content || '') : '', MessageType.Attachment, url || attachment.url, name)
      }
      await fetchMessages(roomId)
    } catch (error) {
      console.error('Failed to send message:', error)
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
      messages: messages.map(msg => ({
        id: msg.Id || msg.id || Math.random(),
        sender: isCurrentUserMessage(msg) ? 'current-user' : 'other',
        content: getIncomingContent(msg),
        timestamp: msg.CreatedAt || msg.timestamp || new Date().toISOString(),
        attachments: buildIncomingAttachments(msg).map((item) => ({ ...item, size: '' })),
      })),
    }
  }

  const currentConversation = getConversation(activeRoom)

  const filteredRooms = rooms.filter(r => {
    const participant = resolveParticipant(r, currentUserId)
    return participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const unreadTotal = rooms.reduce((acc, r) => acc + (r.UnreadCount || 0), 0)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-background-paper"
      dir={isRTL ? 'rtl' : 'ltr'}
    >

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <div className={`
        flex flex-col bg-background-paper border-r border-border/60
        w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 overflow-hidden
        ${activeRoom ? 'hidden lg:flex' : 'flex'}
      `}>

        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/50">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text-muted hover:text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none`} />
            <input
              type="text"
              placeholder={t('chat.searchConversations', 'Search conversations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-background-subtle border border-border/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-text placeholder:text-text-muted`}
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
                      w-full px-4 py-3.5 transition-all text-left relative
                      ${isActive
                        ? `bg-primary/8 ${isRTL ? 'border-l-2 border-l-primary' : 'border-r-2 border-r-primary'}`
                        : `hover:bg-background-subtle/80 ${isRTL ? 'border-l-2 border-l-transparent' : 'border-r-2 border-r-transparent'}`
                      }
                    `}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center overflow-hidden">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-primary">{roomInitials}</span>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-background-paper rounded-full" />
                      </div>

                      {/* Content */}
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center justify-between gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-text-heading'}`}>
                            {name}
                          </h4>
                          <div className={`flex items-center gap-1.5 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
              conversation={currentConversation}
              onSendMessage={handleSendMessage}
              onBack={() => { setActiveRoom(null); setMessages([]) }}
            />
          )
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
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
