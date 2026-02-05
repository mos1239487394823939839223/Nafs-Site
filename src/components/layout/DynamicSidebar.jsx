import { NavLink } from 'react-router-dom'
import { useAuth, Roles } from '../../contexts/AuthContext'
import RoleBadge from '../ui/RoleBadge'
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Activity,
  DollarSign,
  BarChart3,
  UserPlus,
  Pill,
  TestTube,
  FolderOpen,
  Clock,
  TrendingUp,
  Headphones,
  Phone,
  TicketIcon,
} from 'lucide-react'

// Navigation items for each role
const navigationConfig = {
  [Roles.PATIENT]: [
    { name: 'Reserve Appointment', path: '/dashboard/patient/reserve', icon: Calendar },
    { name: 'Messages', path: '/dashboard/patient/messages', icon: MessageSquare },
    { name: 'Profile', path: '/dashboard/patient/profile', icon: Settings },
  ],
  [Roles.DOCTOR]: [
    { name: 'Dashboard', path: '/dashboard/doctor', icon: Home },
    { name: 'Patient Queue', path: '/dashboard/doctor/queue', icon: Users },
    { name: 'My Schedule', path: '/dashboard/doctor/schedule', icon: Calendar },
    { name: 'Session History', path: '/dashboard/doctor/history', icon: Activity },
    { name: 'Messages', path: '/dashboard/doctor/messages', icon: MessageSquare },
    { name: 'Profile', path: '/dashboard/doctor/settings', icon: Settings },
  ],
  [Roles.ADMIN]: [
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Profile', path: '/admin/profile', icon: Settings },
  ],
  [Roles.STAFF]: [
    { name: 'Dashboard', path: '/dashboard/staff', icon: Home },
    { name: 'Messages', path: '/dashboard/staff/messages', icon: MessageSquare },
    { name: 'Profile', path: '/dashboard/staff/profile', icon: Settings },
  ],
}

export default function DynamicSidebar({ isOpen, onClose }) {
  const { role, user, logout } = useAuth()

  const navItems = navigationConfig[role] || []

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-border
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">Clinc</h1>
            <p className="text-sm text-text-light mt-1">Telemedicine Platform</p>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">
                  {user?.name || 'User'}
                </p>
                <RoleBadge role={role} size="sm" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      onClick={() => {
                        if (onClose && window.innerWidth < 1024) onClose()
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-primary/10 text-primary border-l-4 border-primary'
                          : 'text-text hover:bg-background-gray hover:text-primary'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
