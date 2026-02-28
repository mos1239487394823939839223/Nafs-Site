import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Close as X, Send, SmartToy as Bot } from '@mui/icons-material'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'

export default function AIAssistant({ isOpen, onClose }) {
  const { t, isRTL } = useLanguage()
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: t('patient.aiWelcome', "Hello! I'm your AI Health Assistant. How can I help you today?") },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = { id: Date.now(), type: 'user', text: inputValue }
    setMessages([...messages, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: t('patient.aiSimulateRec', "I understand your concern. Based on your symptoms, I recommend scheduling a consultation with a doctor. Would you like me to help you book an appointment?")
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)

    setInputValue('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className={`fixed ${isRTL ? 'left-0' : 'right-0'} top-0 h-screen w-96 bg-background-paper shadow-2xl z-50 flex flex-col border-l border-border`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-border bg-primary text-white ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="font-semibold">{t('patient.aiHealthAssistant', 'AI Health Assistant')}</h3>
                <p className="text-xs text-white/80">{t('patient.alwaysHereToHelp', 'Always here to help')}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-background-subtle text-text'
                    }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('patient.typeMessage', "Type your message...")}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
              />
              <Button onClick={handleSend} size="md">
                <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
