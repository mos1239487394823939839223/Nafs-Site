import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, Phone, Video, X } from 'lucide-react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ conversation, onSendMessage }) {
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState([])
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSend = () => {
    if (messageInput.trim() || attachments.length > 0) {
      onSendMessage({
        content: messageInput,
        attachments: attachments
      })
      setMessageInput('')
      setAttachments([])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file)
    }))
    setAttachments([...attachments, ...newAttachments])
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smile className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">No conversation selected</h3>
          <p className="text-text-light">Select a consultation to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {conversation.participant.avatar ? (
                  <img 
                    src={conversation.participant.avatar} 
                    alt={conversation.participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-semibold">
                    {conversation.participant.name.charAt(0)}
                  </span>
                )}
              </div>
              {conversation.participant.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* Info */}
            <div>
              <h3 className="font-semibold text-text">{conversation.participant.name}</h3>
              <p className="text-xs text-text-light">
                {conversation.participant.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-background-gray rounded-xl transition-colors hidden md:block">
              <Phone className="w-5 h-5 text-text" />
            </button>
            <button className="p-2 hover:bg-background-gray rounded-xl transition-colors hidden md:block">
              <Video className="w-5 h-5 text-text" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSent={message.sender === 'current-user'}
          />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-text-light rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-text-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-text-light rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-4 md:px-6 py-3 border-t border-border bg-background-gray">
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative flex-shrink-0">
                {attachment.type === 'image' ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative p-3 bg-white rounded-xl border border-border">
                    <p className="text-xs font-medium truncate max-w-[100px]">{attachment.name}</p>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 md:px-6 py-4 border-t border-border bg-white">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-background-gray rounded-xl transition-colors flex-shrink-0"
          >
            <Paperclip className="w-5 h-5 text-text" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              className="w-full px-4 py-3 pr-12 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-32"
            />
            <button className="absolute right-3 bottom-3 text-text-light hover:text-text">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!messageInput.trim() && attachments.length === 0}
            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
