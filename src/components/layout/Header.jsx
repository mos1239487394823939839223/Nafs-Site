import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Bell, Search, User, Menu, Moon, Sun, Monitor, Globe, Check } from 'lucide-react'
import Badge from '../ui/Badge'
import RoleBadge from '../ui/RoleBadge'
import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging'
import { notificationAPI } from '../../lib/api'

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
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t, isRTL } = useLanguage()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showTheme, setShowTheme] = useState(false)

  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(() => {
    notificationAPI.getNotifications(1, 20)
      .then(res => {
        const items = res?.Data?.Items || [];
        if (Array.isArray(items)) {
          setNotifications(items.map(n => ({
            id: n.Id || n.id,
            title: n.Title || n.title,
            body: n.Body || n.body || n.Message || n.message,
            isRead: n.IsRead || n.isRead || false,
            date: n.CreatedAt || n.createdAt || new Date()
          })));
        }
      })
      .catch(err => console.error("Failed to load notifications", err));
  }, []);

  const onNewNotification = useCallback((payload) => {
    setNotifications(prev => [{
      id: Date.now(),
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body,
      isRead: false,
      date: new Date()
    }, ...prev])
  }, []);

  useFirebaseMessaging(!!user, onNewNotification, fetchNotifications)

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  const handleReadNotification = async (n) => {
    if (n.isRead) return;
    try {
      await notificationAPI.markAsRead(n.id);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const roleLabels = {
    patient: t('nav.patientPortal'),
    doctor: t('nav.doctorWorkspace'),
    admin: t('nav.users'),
    staff: t('nav.customerService'),
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

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
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background-paper" />
              )}
            </button>
            <DropdownMenu open={showNotifications} onClose={() => setShowNotifications(false)}>
              <div className="w-[calc(100vw-2rem)] max-w-[20rem] sm:w-80 p-2 max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-border">
                  <span className="font-bold text-sm">{t('common.notifications') || 'Notifications'}</span>
                  <button onClick={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} className="text-xs text-primary hover:underline">{t('common.markAllRead') || 'Mark all read'}</button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-text-muted py-4">{t('common.noAlerts') || 'No new notifications'}</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleReadNotification(n)}
                      className={`p-2 mb-1 rounded-lg cursor-pointer transition-colors ${n.isRead ? 'bg-background-paper hover:bg-background-subtle' : 'bg-background-subtle border border-primary/20'}`}
                    >
                      <p className="text-sm font-semibold text-text-heading">{n.title}</p>
                      <p className="text-xs text-text-muted">{n.body}</p>
                    </div>
                  ))
                )}
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
