import { useState } from 'react'
import { Search, User, MessageSquare, Headphones, Stethoscope, ChevronRight, ArrowLeft } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useClinic } from '../../contexts/ClinicContext'
import ChatWindow from '../../components/chat/ChatWindow'

export default function AdminMessages() {
    const { messages, addMessage } = useClinic()
    const [activeChat, setActiveChat] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Admin chats only with Staff and Doctors
    const adminConversations = messages.filter(c =>
        c.participant.role === 'staff' || c.participant.role === 'doctor'
    )

    const filteredConversations = adminConversations.filter(c =>
        c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSendMessage = (msgData) => {
        const newMessage = {
            id: Date.now(),
            sender: 'current-user',
            content: msgData.content,
            timestamp: new Date().toISOString()
        }
        addMessage(activeChat.id, newMessage)
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-background p-6">
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Sidebar */}
                <div className={`
                    w-full lg:w-80 flex flex-col bg-background-paper rounded-2xl shadow-sm border border-border overflow-hidden
                    ${activeChat ? 'hidden lg:flex' : 'flex'}
                `}>
                    <div className="p-4 border-b border-border bg-background-paper">
                        <h2 className="text-lg font-bold text-text-heading mb-3">Communications</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search staff/doctors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={`
                                    w-full p-4 border-b border-border/50 text-left transition-all
                                    ${activeChat?.id === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-background-subtle'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${chat.participant.role === 'staff' ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                                        {chat.participant.role === 'staff' ?
                                            <Headphones className="w-6 h-6 text-secondary" /> :
                                            <Stethoscope className="w-6 h-6 text-primary" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-text-heading truncate">{chat.participant.name}</h4>
                                            <span className="text-[10px] text-text-muted uppercase font-black italic">{chat.participant.role}</span>
                                        </div>
                                        <p className="text-sm text-text-muted truncate">{chat.lastMessage || 'No messages yet'}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`
                    flex-1 bg-background-paper rounded-2xl shadow-sm border border-border overflow-hidden
                    ${!activeChat ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex flex-col'}
                `}>
                    {activeChat ? (
                        <ChatWindow
                            conversation={messages.find(m => m.id === activeChat.id)}
                            onSendMessage={handleSendMessage}
                            onBack={() => setActiveChat(null)}
                        />
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-text-heading mb-2">Internal Messaging</h3>
                            <p className="text-text-muted">Select a contact to start an internal communication.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
