import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsultationsList from './ConsultationsList'
import ChatWindow from './ChatWindow'
import { Menu, X } from 'lucide-react'

export default function ChatInterface({ consultations, currentUserId }) {
  const navigate = useNavigate()
  const [activeConsultationId, setActiveConsultationId] = useState(consultations[0]?.id || null)
  const [showConsultationsList, setShowConsultationsList] = useState(false)

  const activeConsultation = consultations.find(c => c.id === activeConsultationId)

  const handleSendMessage = (messageData) => {
    // In production, this would send to backend/WebSocket
    console.log('Sending message:', messageData)
    
    // Mock: Add message to conversation
    const newMessage = {
      id: Date.now(),
      sender: 'current-user',
      content: messageData.content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: messageData.attachments || []
    }
    
    // Update conversation (in production, this would be handled by state management)
    activeConsultation.messages.push(newMessage)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border">
        <button
          onClick={() => setShowConsultationsList(!showConsultationsList)}
          className="p-2 hover:bg-background-gray rounded-xl transition-colors"
        >
          {showConsultationsList ? (
            <X className="w-6 h-6 text-text" />
          ) : (
            <Menu className="w-6 h-6 text-text" />
          )}
        </button>
        <h1 className="text-lg font-semibold text-text">Messages</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Consultations List - Mobile Overlay / Desktop Sidebar */}
        <div
          className={`
            ${showConsultationsList ? 'fixed inset-0 z-40 bg-white' : 'hidden'}
            lg:block lg:relative lg:w-80 lg:flex-shrink-0
          `}
        >
          <ConsultationsList
            consultations={consultations}
            activeId={activeConsultationId}
            onSelect={(id) => {
              setActiveConsultationId(id)
              setShowConsultationsList(false)
            }}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          <ChatWindow
            conversation={activeConsultation}
            onSendMessage={handleSendMessage}
            onBack={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  )
}
