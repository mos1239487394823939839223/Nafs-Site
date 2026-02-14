import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsultationsList from './ConsultationsList'
import ChatWindow from './ChatWindow'
import { Menu, X } from 'lucide-react'

export default function ChatInterface({ consultations, currentUserId, onSendMessage }) {
  const navigate = useNavigate()
  const [activeConsultationId, setActiveConsultationId] = useState(consultations[0]?.id || null)
  const [showConsultationsList, setShowConsultationsList] = useState(false)

  const activeConsultation = consultations.find(c => c.id === activeConsultationId)

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: Date.now(),
      sender: 'current-user',
      content: messageData.content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: messageData.attachments || []
    }

    if (onSendMessage) {
      onSendMessage(activeConsultationId, newMessage)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Mobile Header */}
      {!activeConsultationId || showConsultationsList ? (
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border">
          <h1 className="text-lg font-bold text-primary italic uppercase tracking-tighter">Conversations</h1>
          <div className="w-10"></div>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Consultations List */}
        <div
          className={`
            ${showConsultationsList || !activeConsultationId ? 'fixed inset-0 z-40 bg-white' : 'hidden md:block'}
            lg:block lg:relative lg:w-80 lg:shrink-0
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
        <div className={`flex-1 ${showConsultationsList ? 'hidden lg:block' : 'block'}`}>
          <ChatWindow
            conversation={activeConsultation}
            onSendMessage={handleSendMessage}
            onBack={() => {
              if (window.innerWidth < 1024) {
                setShowConsultationsList(true)
              } else {
                navigate(-1)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
