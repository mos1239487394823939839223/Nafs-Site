import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import en from '../i18n/en'
import ar from '../i18n/ar'
import { userAPI } from '../lib/api'

const translations = { en, ar }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Load saved language from localStorage or default to 'en'
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('app_language')
      return saved || 'en'
    } catch {
      return 'en'
    }
  })

  const isRTL = language === 'ar'

  // Get nested translation by dot-notation key, e.g. 'auth.login'
  const t = useCallback((key, fallback) => {
    const keys = key.split('.')
    let value = translations[language]
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English, then to fallback string, then to the key itself
        let enValue = translations.en
        for (const ek of keys) {
          if (enValue && typeof enValue === 'object' && ek in enValue) {
            enValue = enValue[ek]
          } else {
            return fallback || key
          }
        }
        return typeof enValue === 'string' ? enValue : (fallback || key)
      }
    }
    return typeof value === 'string' ? value : (fallback || key)
  }, [language])

  // Change language and persist + sync with API
  const setLanguage = useCallback(async (lang) => {
    if (lang === language) return

    setLanguageState(lang)
    localStorage.setItem('app_language', lang)

    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang

    // Sync with backend API if user is logged in
    const isGuest = !localStorage.getItem('auth')
    if (!isGuest) {
      try {
        await userAPI.updateLang(lang)
      } catch (error) {
        // API sync is best-effort; don't block UI for this
        console.warn('Failed to sync language with API:', error)
      }
    }
  }, [language])

  // Toggle between en and ar
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }, [language, setLanguage])

  // Set initial document direction on mount
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isRTL,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
