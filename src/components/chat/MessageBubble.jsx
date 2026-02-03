import { Check, CheckCheck } from 'lucide-react'

export default function MessageBubble({ message, isSent }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[70%] px-4 py-3 rounded-2xl shadow-sm
          ${isSent 
            ? 'bg-primary text-white ml-auto' 
            : 'bg-gray-100 text-text mr-auto'
          }
        `}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed break-words">
          {message.content}
        </p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div
                key={index}
                className={`
                  flex items-center gap-2 p-2 rounded-xl
                  ${isSent ? 'bg-primary-dark/20' : 'bg-white'}
                `}
              >
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full rounded-lg max-h-48 object-cover"
                  />
                ) : (
                  <>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSent ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <span className={`text-xs font-semibold ${isSent ? 'text-white' : 'text-primary'}`}>
                        {attachment.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isSent ? 'text-white' : 'text-text'}`}>
                        {attachment.name}
                      </p>
                      <p className={`text-xs ${isSent ? 'text-white/70' : 'text-text-light'}`}>
                        {attachment.size}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp and Read Status */}
        <div className={`flex items-center gap-1 mt-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isSent ? 'text-white/70' : 'text-text-light'}`}>
            {formatTime(message.timestamp)}
          </span>
          {isSent && (
            <span className="text-white/70">
              {message.read ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
