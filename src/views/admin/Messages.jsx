import { useState, useEffect, useCallback } from 'react'
import { Search, MessageSquare, Headphones, Stethoscope, Loader2, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button'
import ChatWindow from '../../components/chat/ChatWindow'
import { chatAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminMessages() {
    const { user } = useAuth()
    const [activeRoom, setActiveRoom] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [rooms, setRooms] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [messagesLoading, setMessagesLoading] = useState(false)

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

    const fetchMessages = useCallback(async (roomId) => {
        setMessagesLoading(true)
        try {
            const response = await chatAPI.getRoomMessages(roomId)
            if (response?.Data) {
                const msgs = Array.isArray(response.Data) ? response.Data : response.Data.Items || []
                setMessages(msgs)
            } else if (Array.isArray(response)) {
                setMessages(response)
            }
            await chatAPI.markAsRead(roomId).catch(() => {})
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            setMessagesLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRooms()
    }, [fetchRooms])

    useEffect(() => {
        if (activeRoom) {
            fetchMessages(activeRoom.Id || activeRoom.id)
        }
    }, [activeRoom, fetchMessages])

    const handleSendMessage = async (msgData) => {
        const roomId = activeRoom?.Id || activeRoom?.id
        if (!roomId) return

        try {
            const response = await chatAPI.sendMessage(roomId, msgData.content)
            if (response?.IsSuccess !== false) {
                const newMessage = {
                    id: Date.now(),
                    sender: 'current-user',
                    content: msgData.content,
                    timestamp: new Date().toISOString(),
                }
                setMessages(prev => [...prev, newMessage])
            }
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    const currentConversation = activeRoom ? {
        id: activeRoom.Id || activeRoom.id,
        participant: {
            name: activeRoom.OtherParticipantName || activeRoom.Name || 'Chat',
            avatar: activeRoom.OtherParticipantImage || null,
            role: activeRoom.OtherParticipantRole || 'staff',
            online: true,
        },
        messages: messages.map(msg => ({
            id: msg.Id || msg.id || Math.random(),
            sender: msg.SenderId === (user?.ID || user?.id) ? 'current-user' : 'other',
            content: msg.Content || msg.content || '',
            timestamp: msg.CreatedAt || msg.timestamp || new Date().toISOString(),
        })),
    } : null

    const filteredRooms = rooms.filter(r => {
        const name = (r.OtherParticipantName || r.Name || '').toLowerCase()
        return name.includes(searchQuery.toLowerCase())
    })

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-background p-6">
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Sidebar */}
                <div className={`
                    w-full lg:w-80 flex flex-col bg-background-paper rounded-2xl shadow-sm border border-border overflow-hidden
                    ${activeRoom ? 'hidden lg:flex' : 'flex'}
                `}>
                    <div className="p-4 border-b border-border bg-background-paper">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-text-heading">Communications</h2>
                            <Button variant="ghost" size="sm" onClick={fetchRooms} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
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
                                <p>No conversations</p>
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
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                                            {room.OtherParticipantImage ? (
                                                <img
                                                    src={room.OtherParticipantImage}
                                                    alt=""
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <Stethoscope className="w-6 h-6 text-primary" />
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
                                                {room.LastMessage || 'No messages yet'}
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
                    flex-1 bg-background-paper rounded-2xl shadow-sm border border-border overflow-hidden
                    ${!activeRoom ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex flex-col'}
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
                            <h3 className="text-xl font-bold text-text-heading mb-2">Internal Messaging</h3>
                            <p className="text-text-muted">Select a contact to start a conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
