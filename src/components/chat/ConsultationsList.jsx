import { useState } from 'react'
import { Search } from 'lucide-react'

export default function ConsultationsList({ consultations, activeId, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('')

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffMinutes = Math.floor((now - messageTime) / 60000)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`
    return messageTime.toLocaleDateString()
  }

  // Filter consultations based on search query
  const filteredConsultations = consultations.filter((consultation) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const name = consultation.participant.name.toLowerCase()
    const role = consultation.participant.role.toLowerCase()
    const lastMessage = consultation.lastMessage.toLowerCase()
    
    return name.includes(query) || role.includes(query) || lastMessage.includes(query)
  })

  return (
    <div className="h-full flex flex-col bg-white border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text mb-3">Active Consultations</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Consultations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConsultations.length > 0 ? (
          filteredConsultations.map((consultation) => (
            <button
              key={consultation.id}
              onClick={() => onSelect(consultation.id)}
              className={`
                w-full p-4 border-b border-border-light text-left transition-colors
                ${activeId === consultation.id 
                  ? 'bg-primary/5 border-l-4 border-l-primary' 
                  : 'hover:bg-background-gray'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {consultation.participant.avatar ? (
                      <img 
                        src={consultation.participant.avatar} 
                        alt={consultation.participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {consultation.participant.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Online Status */}
                  {consultation.participant.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-text truncate">
                      {consultation.participant.name}
                    </h3>
                    <span className="text-xs text-text-light flex-shrink-0 ml-2">
                      {formatTimestamp(consultation.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-secondary mb-1">
                    {consultation.participant.role}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-light truncate flex-1">
                      {consultation.lastMessage}
                    </p>
                    {consultation.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {consultation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Search className="w-12 h-12 text-text-light mb-3" />
            <p className="text-text-light text-sm">No conversations found</p>
            <p className="text-text-light text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}
