import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Bell, Menu, Moon, Sun, Monitor, Globe, Check, CheckCheck, ArrowRight } from 'lucide-react'
import RoleBadge from '../ui/RoleBadge'
import { UserAvatar } from '../ui/Avatar'
import NotificationItem from '../notifications/NotificationItem'
import { useNotifications } from '../../contexts/NotificationContext'

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
    <div ref={ref} className="absolute top-full mt-2 end-0 z-50 min-w-[150px] bg-background-paper border border-border rounded-xl shadow-lg py-1 animate-fade-in">
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
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t, isRTL } = useLanguage()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showTheme, setShowTheme] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const handleReadNotification = async (notification) => {
    await markAsRead(notification.id)
    setShowNotifications(false)
    if (notification.actionUrl) navigate(notification.actionUrl)
  }

  const roleLabels = {
    patient: t('nav.patientPortal'),
    doctor: t('nav.doctorWorkspace'),
    admin: t('nav.users'),
    staff: t('nav.customerService'),
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  const displayName = user?.name || user?.Name || user?.fullName || user?.FullName || t('common.user', 'User')
  const firstName = String(displayName).trim().split(/\s+/)[0] || displayName
  const avatarSrc = user?.image || user?.Image || user?.avatar || user?.Avatar

  if (role === Roles.PATIENT) {
    return (
      <header className="bg-[#F8FAF8] px-4 py-5">
        <div className="mx-auto flex w-full max-w-[920px] items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-2xl border border-[#E5E7EB] bg-white text-[#12372A] shadow-sm"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => { setShowLang(v => !v); setShowTheme(false); setShowNotifications(false) }}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-transparent bg-transparent text-[#12372A] transition-colors hover:border-[#E5E7EB] hover:bg-white"
                title={t('settings.language')}
                aria-label={t('settings.language')}
              >
                <Globe className="h-5 w-5" />
              </button>
              <DropdownMenu open={showLang} onClose={() => setShowLang(false)}>
                <DropdownItem onClick={() => { setLanguage('en'); setShowLang(false) }} active={language === 'en'} label="English" />
                <DropdownItem onClick={() => { setLanguage('ar'); setShowLang(false) }} active={language === 'ar'} label="العربية" />
              </DropdownMenu>
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowTheme(v => !v); setShowLang(false); setShowNotifications(false) }}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-transparent bg-transparent text-[#12372A] transition-colors hover:border-[#E5E7EB] hover:bg-white"
                title={t('common.theme') || 'Theme'}
                aria-label={t('common.theme') || 'Theme'}
              >
                <ThemeIcon className="h-5 w-5" />
              </button>
              <DropdownMenu open={showTheme} onClose={() => setShowTheme(false)}>
                <DropdownItem onClick={() => { setTheme('light'); setShowTheme(false) }} active={theme === 'light'} icon={Sun} label={t('common.lightMode') || 'Light'} />
                <DropdownItem onClick={() => { setTheme('dark'); setShowTheme(false) }} active={theme === 'dark'} icon={Moon} label={t('common.darkMode') || 'Dark'} />
              </DropdownMenu>
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(v => !v); setShowLang(false); setShowTheme(false) }}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-transparent bg-transparent text-[#12372A] transition-colors hover:border-[#E5E7EB] hover:bg-white"
                aria-label={t('common.notifications') || 'Notifications'}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#F8FAF8] flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <DropdownMenu open={showNotifications} onClose={() => setShowNotifications(false)}>
                <div className="w-[calc(100vw-2rem)] max-w-[23rem] sm:w-96 p-2">
                  <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-border">
                    <span className="font-bold text-sm">{t('common.notifications') || 'Notifications'}</span>
                    <button onClick={markAllAsRead} disabled={unreadCount === 0} className="text-xs text-primary hover:underline disabled:opacity-40 inline-flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t('common.markAllRead') || 'Mark all read'}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-text-muted py-4">{t('common.noAlerts') || 'No new notifications'}</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {notifications.slice(0, 8).map(n => (
                        <NotificationItem key={n.id} notification={n} onClick={handleReadNotification} compact />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/notifications') }}
                    className="w-full mt-2 pt-3 border-t border-border text-sm font-semibold text-primary flex items-center justify-center gap-2 hover:underline"
                  >
                    {t('notifications.viewAll', 'View all notifications')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserAvatar name={displayName} src={avatarSrc} size="lg" />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-lg font-black text-[#12372A]">
                {t('patientHome.header.welcome')}, {firstName} 👋
              </p>
              <p className="text-sm font-medium text-[#557568]">{t('patientHome.header.feelingToday')}</p>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-background-paper border-b border-border px-3 sm:px-4 md:px-6 py-3 md:py-4 transition-colors duration-300">
      <div className="flex items-center justify-between gap-2">
        {/* Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-background-subtle rounded-xl transition-colors -ms-2 flex-shrink-0"
          >
            <Menu className="w-6 h-6 text-text" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-base sm:text-xl md:text-2xl font-semibold text-text truncate">
              {roleLabels[role] || t('nav.dashboard')}
            </h2>
            <div className="hidden md:block flex-shrink-0">
              <RoleBadge role={role} size="sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(v => !v); setShowLang(false); setShowTheme(false) }}
              className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text relative"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background-paper flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <DropdownMenu open={showNotifications} onClose={() => setShowNotifications(false)}>
              <div className="w-[calc(100vw-2rem)] max-w-[23rem] sm:w-96 p-2">
                <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-border">
                  <span className="font-bold text-sm">{t('common.notifications') || 'Notifications'}</span>
                  <button onClick={markAllAsRead} disabled={unreadCount === 0} className="text-xs text-primary hover:underline disabled:opacity-40 inline-flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    {t('common.markAllRead') || 'Mark all read'}
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-text-muted py-4">{t('common.noAlerts') || 'No new notifications'}</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notifications.slice(0, 8).map(n => (
                      <NotificationItem key={n.id} notification={n} onClick={handleReadNotification} compact />
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setShowNotifications(false); navigate('/notifications') }}
                  className="w-full mt-2 pt-3 border-t border-border text-sm font-semibold text-primary flex items-center justify-center gap-2 hover:underline"
                >
                  {t('notifications.viewAll', 'View all notifications')}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </DropdownMenu>
          </div>

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
