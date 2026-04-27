import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Bell, Search, User, Menu, Moon, Sun, Monitor, Globe, Check } from 'lucide-react'
import Badge from '../ui/Badge'
import RoleBadge from '../ui/RoleBadge'

function DropdownMenu({ open, onClose, children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])
  if (!open) return null
  return (
    <div ref={ref} className="absolute top-full mt-2 right-0 z-50 min-w-[150px] bg-background-paper border border-border rounded-xl shadow-lg py-1 animate-fade-in">
      {children}
    </div>
  )
}

function DropdownItem({ onClick, active, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background-subtle transition-colors ${active ? 'text-primary font-semibold' : 'text-text'}`}
    >
      {active ? <Check className="w-4 h-4 text-primary" /> : <span className="w-4" />}
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  )
}

export default function Header({ onMenuClick }) {
  const { role, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t, isRTL } = useLanguage()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showTheme, setShowTheme] = useState(false)

  const notifications = []

  const roleLabels = {
    patient: t('nav.patientPortal'),
    doctor: t('nav.doctorWorkspace'),
    admin: t('nav.users'),
    staff: t('nav.customerService'),
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="bg-background-paper border-b border-border px-4 md:px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className={`lg:hidden p-2 hover:bg-background-subtle rounded-xl transition-colors ${isRTL ? '-mr-2' : '-ml-2'}`}
          >
            <Menu className="w-6 h-6 text-text" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-text truncate max-w-[120px] sm:max-w-none">
              {roleLabels[role] || t('nav.dashboard')}
            </h2>
            <div className="hidden sm:block">
              <RoleBadge role={role} size="sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowLang(v => !v); setShowTheme(false) }}
              className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text flex items-center gap-1"
              title={t('settings.language')}
            >
              <Globe className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs font-bold hidden sm:inline">{language === 'en' ? 'EN' : 'AR'}</span>
            </button>
            <DropdownMenu open={showLang} onClose={() => setShowLang(false)}>
              <DropdownItem onClick={() => { setLanguage('en'); setShowLang(false) }} active={language === 'en'} label="English" />
              <DropdownItem onClick={() => { setLanguage('ar'); setShowLang(false) }} active={language === 'ar'} label="العربية" />
            </DropdownMenu>
          </div>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowTheme(v => !v); setShowLang(false) }}
              className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text"
              title={t('common.theme') || 'Theme'}
            >
              <ThemeIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <DropdownMenu open={showTheme} onClose={() => setShowTheme(false)}>
              <DropdownItem onClick={() => { setTheme('light'); setShowTheme(false) }} active={theme === 'light'} icon={Sun} label={t('common.lightMode') || 'Light'} />
              <DropdownItem onClick={() => { setTheme('dark'); setShowTheme(false) }} active={theme === 'dark'} icon={Moon} label={t('common.darkMode') || 'Dark'} />
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
