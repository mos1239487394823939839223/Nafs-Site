import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, ArrowLeft, X, Download, File as FileIcon } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ conversation, onSendMessage, onBack, isTyping: isOtherTyping = false, onTyping, onStopTyping }) {
  const { theme } = useTheme()
  const { t, isRTL } = useLanguage()
  const [messageInput, setMessageInput] = useState('')
  const [localIsTyping, setLocalIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji)
    handleTyping()
  }

  const handleTyping = () => {
    if (!localIsTyping) {
      setLocalIsTyping(true)
      if (onTyping) onTyping()
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setLocalIsTyping(false)
      if (onStopTyping) onStopTyping()
    }, 3000)
  }

  const handleSend = () => {
    if (messageInput.trim() || attachments.length > 0) {
      onSendMessage({ content: messageInput, attachments })
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
      file,
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

  const initials = conversation?.participant?.name
    ? conversation.participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smile className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">{t('chat.noConversation', 'No conversation selected')}</h3>
          <p className="text-text-muted">{t('chat.selectToStart', 'Select a conversation to start chatting')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background-paper">

      {/* ── Header ── */}
      <div className="relative px-4 md:px-5 py-3.5 border-b border-border/60 bg-background-paper">
        {/* subtle gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-secondary/40 to-transparent" />

        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text-muted hover:text-text flex-shrink-0"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
              {conversation.participant.avatar ? (
                <img src={conversation.participant.avatar} alt={conversation.participant.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">{initials}</span>
              )}
            </div>
            {conversation.participant.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-background-paper rounded-full" />
            )}
          </div>

          {/* Name + status */}
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="font-semibold text-text-heading text-sm truncate">{conversation.participant.name}</h3>
            <p className="text-xs text-emerald-500 font-medium">
              {conversation.participant.online ? t('common.online', 'Online') : t('common.offline', 'Offline')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-1"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, var(--color-primary, #7DAE9F)08 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-secondary, #93B5C6)06 0%, transparent 40%)',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Date group (future enhancement — placeholder) */}
        {conversation.messages.length > 0 && (
          <div className="flex justify-center mb-4">
            <span className="text-xs text-text-muted bg-background-subtle/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/40">
              {new Date(conversation.messages[0].timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}

        {conversation.messages.map((message, idx) => {
          const prevMsg = conversation.messages[idx - 1]
          const showAvatar = !prevMsg || prevMsg.sender !== message.sender
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isSent={message.sender === 'current-user'}
              showAvatar={showAvatar}
              participantName={conversation.participant.name}
              participantAvatar={conversation.participant.avatar}
            />
          )
        })}

        {/* Typing Indicator */}
        {isOtherTyping && (
          <div className={`flex items-end gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''} mb-2`}>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-primary font-bold">{initials}</span>
            </div>
            <div className="bg-background-subtle border border-border/50 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex items-center gap-1.5">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Attachment Preview ── */}
      {attachments.length > 0 && (
        <div className="px-4 md:px-6 py-3 border-t border-border/60 bg-background-subtle/60">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                {attachment.type === 'image' ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-primary/20">
                    <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2 px-3 py-2 bg-background-paper rounded-xl border border-border/60 max-w-[140px]">
                    <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs font-medium truncate text-text">{attachment.name}</p>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="px-4 md:px-5 py-3.5 border-t border-border/60 bg-background-paper">
        <div className={`flex items-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>

          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-background-subtle rounded-xl transition-colors flex-shrink-0 text-text-muted hover:text-primary"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => { setMessageInput(e.target.value); handleTyping() }}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.typeMessage', 'Type a message...')}
              rows="1"
              className={`w-full py-2.5 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none max-h-32 bg-background-subtle text-text text-sm transition-all placeholder:text-text-muted ${isRTL ? 'px-4 pl-10' : 'px-4 pr-10'}`}
            />
            {/* Emoji button inside input */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute bottom-2.5 text-text-muted hover:text-primary transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
            >
              <Smile className="w-4.5 h-4.5" style={{ fontSize: 18 }} />
            </button>

            {showEmojiPicker && (
              <div ref={emojiPickerRef} className={`absolute bottom-12 z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                <EmojiPicker onEmojiClick={onEmojiClick} theme={theme} width={300} height={380} />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!messageInput.trim() && attachments.length === 0}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm shadow-primary/20"
          >
            <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
