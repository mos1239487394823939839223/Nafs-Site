import { MessageType } from '../../lib/api'

export default function MessageBubble({ message, isSent, showAvatar = true, participantName = '', participantAvatar = null }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const initials = participantName
    ? participantName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  // ── System Message ──────────────────────────────────────────────────────────
  if (message.type === MessageType.System || message.messageType === MessageType.System) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-text-muted bg-background-subtle/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/40">
          {message.content}
        </span>
      </div>
    )
  }

  // ── Regular Message ─────────────────────────────────────────────────────────
  const hasContent = Boolean(message.content)
  const hasAttachments = message.attachments && message.attachments.length > 0

  return (
    <div className={`flex items-end gap-2 mb-2 ${isSent ? 'flex-row-reverse' : ''}`}>

      {/* Avatar — only for received messages */}
      {!isSent && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mb-0.5"
          style={{ opacity: showAvatar ? 1 : 0 }}
        >
          {participantAvatar ? (
            <img src={participantAvatar} alt={participantName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-primary">{initials}</span>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[84%] sm:max-w-[72%] flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 shadow-sm transition-shadow hover:shadow-md
            ${isSent
              ? 'bg-primary text-white rounded-[20px] rounded-ee-sm'
              : 'bg-background-paper border border-border/70 text-text rounded-[20px] rounded-es-sm'
            }
          `}
        >
          {/* Text content */}
          {hasContent && (
            <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${isSent ? 'text-white' : 'text-text'}`}>
              {message.content}
            </p>
          )}

          {/* Attachments */}
          {hasAttachments && (
            <div className={`space-y-2 ${hasContent ? 'mt-2' : ''}`}>
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.type === 'image' ? (
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full rounded-xl max-h-52 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                        isSent ? 'bg-white/15 hover:bg-white/20' : 'bg-background-paper hover:bg-background-subtle'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSent ? 'bg-white/20' : 'bg-primary/10'}`}>
                        <span className={`text-[10px] font-bold ${isSent ? 'text-white' : 'text-primary'}`}>
                          {attachment.name.split('.').pop().toUpperCase().slice(0, 4)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSent ? 'text-white' : 'text-text'}`}>
                          {attachment.name}
                        </p>
                        {attachment.size && (
                          <p className={`text-[10px] ${isSent ? 'text-white/60' : 'text-text-muted'}`}>
                            {attachment.size}
                          </p>
                        )}
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isSent ? 'bg-white/20' : 'bg-primary/10'}`}>
                        <svg className={`w-3 h-3 ${isSent ? 'text-white' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp + Status checkmarks */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-text-muted">
            {formatTime(message.timestamp)}
          </span>
          {isSent && (
            <span className="flex items-center">
              {(message.isRead !== false && message.isRead !== undefined) ? (
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7M8 17l4 4L22 10" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Spacer for sent messages (no avatar) */}
      {isSent && <div className="w-7 flex-shrink-0" />}
    </div>
  )
}
