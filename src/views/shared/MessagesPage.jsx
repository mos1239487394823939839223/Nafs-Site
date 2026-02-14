import { useState } from 'react'
import ChatInterface from '../../components/chat/ChatInterface'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { useClinic } from '../../contexts/ClinicContext'
import Badge from '../../components/ui/Badge'

export default function MessagesPage() {
  const { user } = useAuth()
  const { messages, addMessage } = useClinic()
  const [activeTab, setActiveTab] = useState('patient') // patient, doctor, admin

  const isStaff = user?.role === Roles.STAFF

  // Filter messages based on tab for staff
  const filteredMessages = isStaff
    ? messages.filter(m => m.participant.role === activeTab)
    : messages

  const tabs = [
    { id: 'patient', label: 'Patients' },
    { id: 'doctor', label: 'Doctors' },
    { id: 'admin', label: 'Admin' }
  ]

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-4rem)]">
      {isStaff && (
        <div className="bg-background-paper border-b border-border px-6 pt-4 flex gap-4 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 text-sm font-bold uppercase tracking-tighter italic transition-all border-b-2 
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
                }`}
            >
              <div className="flex items-center gap-2">
                {tab.label}
                <Badge variant={activeTab === tab.id ? 'primary' : 'outline'} className="text-[10px] px-1.5 py-0">
                  {messages.filter(m => m.participant.role === tab.id).length}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          consultations={filteredMessages}
          currentUserId={user?.id || 'current-user'}
          onSendMessage={(consultationId, messageData) => addMessage(consultationId, messageData)}
        />
      </div>
    </div>
  )
}
