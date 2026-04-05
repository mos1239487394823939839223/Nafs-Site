import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { chatAPI, filesAPI, MessageType } from '../../lib/api'
import ChatWindow from '../../components/chat/ChatWindow'
import { Search, ChatBubbleOutline as MessageSquare, Sync as Loader2, Refresh as RefreshCw, MedicalServices as Stethoscope, Person as User, Headphones } from '@mui/icons-material'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { startChatConnection } from '../../lib/signalr'

export default function MessagesPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialRoomId = searchParams.get('room')

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

  const getIncomingRoomId = (msg) =>
    String(
      msg?.RoomId ||
      msg?.roomId ||
      msg?.ActiveRoom ||
      msg?.activeRoom ||
      msg?.ChatRoomId ||
      msg?.chatRoomId ||
      ''
    )

  const getIncomingContent = (msg) =>
    msg?.Content ?? msg?.content ?? msg?.Text ?? msg?.text ?? ''

  const getIncomingAttachmentUrl = (msg) =>
    msg?.AttachmentUrl ??
    msg?.attachmentUrl ??
    msg?.FileUrl ??
    msg?.fileUrl ??
    msg?.MediaUrl ??
    msg?.mediaUrl ??
    msg?.Url ??
    msg?.url ??
    ''

  const getIncomingAttachmentName = (msg) =>
    msg?.AttachmentName ??
    msg?.attachmentName ??
    msg?.FileName ??
    msg?.fileName ??
    msg?.Name ??
    msg?.name ??
    'Attachment'

  const getIncomingMessageType = (msg) =>
    Number(msg?.MessageType ?? msg?.messageType ?? msg?.Type ?? msg?.type ?? 0)

  const buildIncomingAttachments = (msg) => {
    const attachmentUrl = getIncomingAttachmentUrl(msg)
    if (!attachmentUrl) return []
    const attachmentName = getIncomingAttachmentName(msg)
    return [{
      name: attachmentName,
      url: attachmentUrl,
      type: (attachmentUrl || '').match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? 'image' : 'file',
    }]
  }

  const getMessageUniqueKey = (msg) => {
    const id = msg?.Id ?? msg?.id
    if (id !== undefined && id !== null && String(id).trim() !== '') {
      return `id:${String(id)}`
    }

    const sender = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.From ?? msg?.from ?? msg?.sender)
    const content = normalizeValue(getIncomingContent(msg))
    const createdAt = normalizeValue(msg?.CreatedAt ?? msg?.createdAt ?? msg?.timestamp)
    const attachmentUrl = normalizeValue(getIncomingAttachmentUrl(msg))

    return `fallback:${sender}|${content}|${createdAt}|${attachmentUrl}`
  }

  const mergeMessages = (currentMessages, fetchedMessages) => {
    const fetchedKeys = new Set(fetchedMessages.map(getMessageUniqueKey))
    const onlyCurrent = currentMessages.filter((msg) => !fetchedKeys.has(getMessageUniqueKey(msg)))
    return [...fetchedMessages, ...onlyCurrent]
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

  const extractMessagesFromResponse = (response) => {
    if (!response) return []
    if (Array.isArray(response?.Data)) return response.Data
    if (Array.isArray(response?.Data?.Items)) return response.Data.Items
    if (Array.isArray(response)) return response
    return []
  }

  const fetchLatestMessages = useCallback(async (roomId) => {
    const [pageZero, pageOne] = await Promise.allSettled([
      chatAPI.getRoomMessages(roomId, 0, 100),
      chatAPI.getRoomMessages(roomId, 1, 100),
    ])

    const merged = []
    if (pageZero.status === 'fulfilled') {
      merged.push(...extractMessagesFromResponse(pageZero.value))
    }
    if (pageOne.status === 'fulfilled') {
      merged.push(...extractMessagesFromResponse(pageOne.value))
    }

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

  const normalizeValue = (value) =>
    String(value ?? '').trim().toLowerCase()

  const isCurrentUserMessage = (msg) => {
    if (msg?.sender === 'current-user') return true
    if (msg?.sender === 'other') return false

    if (msg?.IsMine === true || msg?.isMine === true || msg?.IsCurrentUser === true || msg?.isCurrentUser === true) {
      return true
    }

    const currentUserId = normalizeValue(user?.ID ?? user?.Id ?? user?.id)
    const senderId = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.FromUserId ?? msg?.fromUserId)
    if (currentUserId && senderId) {
      return currentUserId === senderId
    }

    const currentUserName = normalizeValue(user?.Name ?? user?.name ?? user?.UserName ?? user?.Username)
    const senderName = normalizeValue(msg?.SenderName ?? msg?.senderName ?? msg?.From ?? msg?.from)
    if (currentUserName && senderName) {
      return currentUserName === senderName
    }

    return false
  }

  // Keep the ref in sync with state
  useEffect(() => {
    activeRoomRef.current = activeRoom
  }, [activeRoom])

  // Sync active room to URL
  useEffect(() => {
    const params = {}
    if (activeRoom) params.room = String(activeRoom.Id || activeRoom.id)
    setSearchParams(params, { replace: true })
  }, [activeRoom, setSearchParams])

  // Restore active room from URL after rooms load
  useEffect(() => {
    if (pendingRoomId && rooms.length > 0 && !activeRoom) {
      const match = rooms.find(
        (r) => String(r.Id || r.id) === String(pendingRoomId)
      )
      if (match) {
        setActiveRoom(match)
      }
    }
  }, [rooms, pendingRoomId, activeRoom])

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

  const fetchMessages = useCallback(async (roomId, options = {}) => {
    const { silent = false } = options
    if (!silent) setMessagesLoading(true)
    try {
      const msgs = await fetchLatestMessages(roomId)
      if (silent) {
        setMessages((prev) => sortMessagesByTime(mergeMessages(prev, msgs)))
      } else {
        setMessages(msgs)
      }
      await chatAPI.markAsRead(roomId).catch(() => {})
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      if (!silent) setMessagesLoading(false)
    }
  }, [])

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

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // SignalR Real-time Integration — register ONCE on mount
  useEffect(() => {
    let mounted = true

    const setupSignalR = async () => {
      try {
        const conn = await startChatConnection()
        if (!mounted) return
        connectionRef.current = conn
        console.log('📡 SignalR Connected — listening for ReceiveMessage')

        conn.on('ReceiveMessage', (msg) => {
          const currentRoom = activeRoomRef.current
          const currentRoomId = String(currentRoom?.Id || currentRoom?.id || '')
          const msgRoomId = getIncomingRoomId(msg)
          const incomingContent = getIncomingContent(msg)
          const incomingType = getIncomingMessageType(msg)
          const incomingAttachments = buildIncomingAttachments(msg)
          const fromCurrentUser = isCurrentUserMessage(msg)
          const hasStableId = msg?.Id !== undefined && msg?.Id !== null
            ? true
            : msg?.id !== undefined && msg?.id !== null

          console.log('📨 [ReceiveMessage]', {
            msgRoom: msgRoomId,
            activeRoom: currentRoomId,
            match: currentRoomId === msgRoomId,
            from: msg.SenderName || msg.senderName || msg.SenderId || msg.senderId,
            text: String(incomingContent).substring(0, 50),
          })

          // If message is for the room currently open, inject it into the chat
          if (currentRoomId && currentRoomId === msgRoomId) {
            // Backend can emit an optimistic self-echo before DB persistence.
            // Render only confirmed self messages that have a stable id.
            if (fromCurrentUser && !hasStableId) {
              scheduleSilentHydration(msgRoomId)
              return
            }

            const uiMessage = {
              id: msg.Id || msg.id || Date.now(),
              sender: fromCurrentUser ? 'current-user' : 'other',
              content: incomingContent,
              messageType: incomingType,
              timestamp: msg.CreatedAt || msg.createdAt || new Date().toISOString(),
              attachments: incomingAttachments,
            }
            setMessages(prev => [...prev, uiMessage])
            chatAPI.markAsRead(msgRoomId).catch(() => {})
            // Reconcile authoritative server state without UI spinner.
            scheduleSilentHydration(msgRoomId)
          }

          // Always refresh rooms sidebar for unread counts
          fetchRooms()
        })
      } catch (err) {
        console.error('SignalR Setup Error:', err)
      }
    }

    setupSignalR()

    return () => {
      mounted = false
      Object.values(hydrationTimersRef.current).forEach((timerId) => clearTimeout(timerId))
      hydrationTimersRef.current = {}
      if (connectionRef.current) {
        connectionRef.current.off('ReceiveMessage')
        console.log('🔌 SignalR ReceiveMessage listener removed')
      }
    }
  }, [user, fetchRooms, scheduleSilentHydration]) // NO activeRoom here — we use the ref instead

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.Id || activeRoom.id)
    }
  }, [activeRoom, fetchMessages])

  const handleSendMessage = async (msgData) => {
    const roomId = activeRoom?.Id || activeRoom?.id
    if (!roomId) return

    try {
      const outgoingAttachments = msgData.attachments || []

      if (outgoingAttachments.length === 0) {
        const response = await chatAPI.sendMessage(roomId, msgData.content)
        if (response?.IsSuccess === false) {
          throw new Error(response?.Message || 'Failed to send message')
        }
        return
      }

      for (let i = 0; i < outgoingAttachments.length; i += 1) {
        const attachment = outgoingAttachments[i]
        const uploadResponse = await filesAPI.uploadFile(attachment.file)
        const url = uploadResponse?.Data?.PublicUrl
        const name = uploadResponse?.Data?.FileName || attachment.name

        await chatAPI.sendMessage(
          roomId,
          i === 0 ? (msgData.content || '') : '',
          MessageType.Attachment,
          url || attachment.url,
          name,
        )
      }

      await fetchMessages(roomId)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return <Stethoscope className="w-6 h-6 text-primary" />
      case 'patient': return <User className="w-6 h-6 text-secondary" />
      default: return <Headphones className="w-6 h-6 text-primary" />
    }
  }

  const currentConversation = activeRoom ? {
    id: activeRoom.Id || activeRoom.id,
    participant: {
      name: activeRoom.OtherParticipantName || activeRoom.Name || 'Chat',
      avatar: activeRoom.OtherParticipantImage || null,
      role: activeRoom.OtherParticipantRole || 'user',
      online: true,
    },
    messages: messages.map(msg => ({
      id: msg.Id || msg.id || Math.random(),
      sender: isCurrentUserMessage(msg) ? 'current-user' : 'other',
      content: getIncomingContent(msg),
      timestamp: msg.CreatedAt || msg.timestamp || new Date().toISOString(),
      attachments: buildIncomingAttachments(msg).map((item) => ({ ...item, size: '' })),
    })),
  } : null

  const filteredRooms = rooms.filter(r => {
    const name = (r.OtherParticipantName || r.Name || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-4rem)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`
          w-full lg:w-80 flex flex-col bg-background-paper border-r border-border overflow-hidden shrink-0
          ${activeRoom ? 'hidden lg:flex' : 'flex'}
        `}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-text-heading">{t('chat.messages')}</h2>
              <Button variant="ghost" size="sm" onClick={fetchRooms} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={t('chat.searchConversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('chat.noConversations')}</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.Id || room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`
                    w-full p-4 border-b border-border/50 text-left transition-all
                    ${(activeRoom?.Id || activeRoom?.id) === (room.Id || room.id) ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-background-subtle'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
                      {room.OtherParticipantImage ? (
                        <img
                          src={room.OtherParticipantImage}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getRoleIcon(room.OtherParticipantRole)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-text-heading truncate">
                          {room.OtherParticipantName || room.Name || 'Chat'}
                        </h4>
                        {room.UnreadCount > 0 && (
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ml-2">
                            {room.UnreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted truncate">
                        {room.LastMessage || t('chat.noMessagesYet')}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`
          flex-1 flex flex-col
          ${!activeRoom ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex'}
        `}>
          {activeRoom ? (
            messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ChatWindow
                conversation={currentConversation}
                onSendMessage={handleSendMessage}
                onBack={() => {
                  setActiveRoom(null)
                  setMessages([])
                }}
              />
            )
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-heading mb-2">{t('chat.messages')}</h3>
              <p className="text-text-muted">{t('chat.selectConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
