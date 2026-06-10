import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, ArrowLeft, X, File as FileIcon, MessageSquare, LockKeyhole, Loader2, Phone, Video, Info, MoreVertical } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import MessageBubble from './MessageBubble'
import SupportCaseTag from '../support/SupportCaseTag'

export default function ChatWindow({ conversation, onSendMessage, onBack, isTyping: isOtherTyping = false, onTyping, onStopTyping, composerDisabled = false, composerDisabledReason = '', sending = false, onToggleDetails, showDetails }) {
  const { theme } = useTheme()
  const { t, isRTL } = useLanguage()
  const [messageInput, setMessageInput] = useState('')
  const [localIsTyping, setLocalIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const prevMsgCountRef = useRef(0)
  const prevConversationIdRef = useRef(null)
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const isNearBottom = () => {
    const el = scrollContainerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150
  }

  const scrollToBottom = (force = false) => {
    if (!force && !isNearBottom()) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const msgs = conversation?.messages
    const conversationId = conversation?.id ?? conversation?.Id ?? null
    const msgCount = msgs?.length ?? 0

    // New conversation opened → always scroll to bottom instantly
    if (conversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = conversationId
      prevMsgCountRef.current = msgCount
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      return
    }

    // No new messages (polling returned same data) → do nothing
    if (msgCount <= prevMsgCountRef.current) return

    const lastMsg = msgs[msgCount - 1]
    const isMine = lastMsg?.sender === 'current-user'
    prevMsgCountRef.current = msgCount

    // Scroll only if it's my own message OR user is already near bottom
    scrollToBottom(isMine)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.messages?.length, conversation?.id, conversation?.Id])

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
    if (composerDisabled || sending) return
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
      <div className="relative px-4 md:px-6 py-4 border-b border-border/60 bg-background-paper">
        {/* subtle gradient line at top */}
        <div className="absolute top-0 start-0 end-0 h-0.5 bg-gradient-to-r from-primary/60 via-secondary/40 to-transparent" />

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
              <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-background-paper rounded-full" />
            )}
          </div>

          {/* Name + status */}
          <div className={`flex-1 min-w-0 text-start`}>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-text-heading text-sm truncate">{conversation.participant.name}</h3>
              {conversation.caseTypeMeta && (
                <SupportCaseTag type={conversation.caseTypeMeta.key} isRTL={isRTL} />
              )}
            </div>
            <p className="text-xs text-emerald-500 font-medium">
              {conversation.participant.online ? t('common.online', 'Online') : t('common.offline', 'Offline')}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {conversation.participant.role === 'doctor'
                ? t('common.therapist', 'Therapist')
                : conversation.participant.role === 'support'
                  ? t('chat.supportTeam', 'Support team')
                  : conversation.participant.role}
            </span>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {conversation.participant.role === 'doctor' && (
              <button
                onClick={() => {
                  window.open(`/dashboard/patient/meeting/${conversation.id}`, '_blank');
                }}
                className="p-2 hover:bg-background-subtle rounded-xl text-primary hover:text-primary-dark transition-colors"
                title={t('chat.startMeeting', 'Start Meeting')}
              >
                <Video className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              onClick={() => alert(t('chat.callingNotSupported', 'Voice calls are coming soon.'))}
              className="p-2 hover:bg-background-subtle rounded-xl text-text-muted hover:text-text transition-colors"
              title={t('chat.call', 'Call')}
            >
              <Phone className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onToggleDetails}
              className={`p-2 rounded-xl transition-all ${
                showDetails ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-text hover:bg-background-subtle'
              }`}
              title={t('chat.viewProfile', 'View Profile')}
            >
              <Info className="w-4.5 h-4.5" />
            </button>
            <button
              className="p-2 hover:bg-background-subtle rounded-xl text-text-muted hover:text-text transition-colors"
              title={t('common.more', 'More')}
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-5 space-y-1 sm:px-5 md:px-8"
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

        {conversation.messages.length === 0 && (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h4 className="text-base font-bold text-text-heading mb-1">{t('chat.startConversation', 'Start the conversation')}</h4>
            <p className="text-sm text-text-muted max-w-sm">{t('chat.startConversationDesc', 'Send your first message and the team will reply here.')}</p>
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
            <div className="bg-background-subtle border border-border/50 px-4 py-3 rounded-2xl rounded-es-sm shadow-sm">
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
                      className="absolute top-1 end-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="px-3 py-3.5 border-t border-border/60 bg-background-paper sm:px-5">
        {composerDisabled && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800">
            <LockKeyhole className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium">{composerDisabledReason}</p>
          </div>
        )}
        <div className={`flex items-end gap-2 rounded-2xl border border-border/60 bg-background-subtle/50 p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>

          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={composerDisabled || sending}
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
              disabled={composerDisabled || sending}
              placeholder={composerDisabled ? composerDisabledReason : t('chat.typeMessage', 'Type a message...')}
              rows="1"
              className={`w-full py-2.5 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none max-h-32 bg-background-paper text-text text-sm transition-all placeholder:text-text-muted px-4 pe-10`}
            />
            {/* Emoji button inside input */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute bottom-2.5 text-text-muted hover:text-primary transition-colors end-3`}
            >
              <Smile className="w-4.5 h-4.5" style={{ fontSize: 18 }} />
            </button>

            {showEmojiPicker && (
              <div ref={emojiPickerRef} className={`absolute bottom-12 z-50 end-0`}>
                <EmojiPicker onEmojiClick={onEmojiClick} theme={theme} width={300} height={380} />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={composerDisabled || sending || (!messageInput.trim() && attachments.length === 0)}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm shadow-primary/20"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />}
          </button>
        </div>
      </div>
    </div>
  )
}
