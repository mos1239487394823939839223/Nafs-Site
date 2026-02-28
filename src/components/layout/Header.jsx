import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Menu as MuiMenu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { Notifications as Bell, Search, Person as User, Menu as MenuIcon, DarkMode as Moon, LightMode as Sun, SettingsSystemDaydream as SystemIcon, Language as Globe, Check } from '@mui/icons-material'
import Badge from '../ui/Badge'
import RoleBadge from '../ui/RoleBadge'

export default function Header({ onMenuClick }) {
  const { role, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t, isRTL } = useLanguage()
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeNotifTab, setActiveNotifTab] = useState('patient')

  // Menu states
  const [anchorElLang, setAnchorElLang] = useState(null)
  const [anchorElTheme, setAnchorElTheme] = useState(null)

  const handleLangClick = (event) => setAnchorElLang(event.currentTarget)
  const handleLangClose = () => setAnchorElLang(null)
  const handleLangChange = (lang) => {
    setLanguage(lang)
    handleLangClose()
  }

  const handleThemeClick = (event) => setAnchorElTheme(event.currentTarget)
  const handleThemeClose = () => setAnchorElTheme(null)
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    handleThemeClose()
  }

  // Notifications placeholder (will be replaced with real API)
  const notifications = []

  const roleLabels = {
    patient: t('nav.patientPortal'),
    doctor: t('nav.doctorWorkspace'),
    admin: t('nav.users'),
    staff: t('nav.customerService'),
  }

  const notifTabs = [
    { id: 'patient', label: t('admin.patients') },
    { id: 'doctor', label: t('admin.doctors') },
    { id: 'admin', label: t('nav.adminDashboard') }
  ]

  return (
    <header className="bg-background-paper border-b border-border px-4 md:px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className={`lg:hidden p-2 hover:bg-background-subtle rounded-xl transition-colors ${isRTL ? '-mr-2' : '-ml-2'}`}
          >
            <MenuIcon className="w-6 h-6 text-text" />
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
          <button
            onClick={handleLangClick}
            className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text flex items-center gap-1"
            title={t('common.language')}
          >
            <Globe className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-xs font-bold hidden sm:inline">{language === 'en' ? 'EN' : 'AR'}</span>
          </button>

          <MuiMenu
            anchorEl={anchorElLang}
            open={Boolean(anchorElLang)}
            onClose={handleLangClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { mt: 1, minWidth: 150, borderRadius: '12px' }
            }}
          >
            <MenuItem onClick={() => handleLangChange('en')} selected={language === 'en'}>
              <ListItemIcon>
                {language === 'en' && <Check fontSize="small" />}
              </ListItemIcon>
              <ListItemText>English</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleLangChange('ar')} selected={language === 'ar'}>
              <ListItemIcon>
                {language === 'ar' && <Check fontSize="small" />}
              </ListItemIcon>
              <ListItemText>العربية</ListItemText>
            </MenuItem>
          </MuiMenu>

          {/* Theme Dropdown */}
          <button
            onClick={handleThemeClick}
            className="p-2 hover:bg-background-subtle rounded-xl transition-colors text-text"
            title={t('common.theme')}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5 md:w-6 md:h-6" /> : <Sun className="w-5 h-5 md:w-6 md:h-6" />}
          </button>

          <MuiMenu
            anchorEl={anchorElTheme}
            open={Boolean(anchorElTheme)}
            onClose={handleThemeClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { mt: 1, minWidth: 160, borderRadius: '12px' }
            }}
          >
            <MenuItem onClick={() => handleThemeChange('light')} selected={theme === 'light'}>
              <ListItemIcon><Sun fontSize="small" /></ListItemIcon>
              <ListItemText>{t('common.lightMode') || 'Light'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('dark')} selected={theme === 'dark'}>
              <ListItemIcon><Moon fontSize="small" /></ListItemIcon>
              <ListItemText>{t('common.darkMode') || 'Dark'}</ListItemText>
            </MenuItem>
          </MuiMenu>


        </div>
      </div>
    </header>
  )
}
