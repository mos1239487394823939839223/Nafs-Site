import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, Search, User } from 'lucide-react'
import Badge from '../ui/Badge'
import RoleBadge from '../ui/RoleBadge'

export default function Header() {
  const { role, user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications (in production, this would come from API/context)
  const notifications = [
    { id: 1, type: 'appointment', message: 'Upcoming appointment in 2 hours', time: '2 hours' },
    { id: 2, type: 'reminder', message: 'Complete your health quiz', time: '1 day' },
  ]



  const roleLabels = {
    patient: 'Patient Portal',
    doctor: 'Doctor Workspace',
    admin: 'Admin Dashboard',
    staff: 'Customer Service',
  }

  return (
    <header className="bg-white border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-semibold text-text">
              {roleLabels[role] || 'Dashboard'}
            </h2>
            <RoleBadge role={role} size="sm" />
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-background-gray rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-text" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border z-50">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-text">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-border-light hover:bg-background-gray transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-text">{notif.message}</p>
                              <p className="text-xs text-text-light mt-1">{notif.time} ago</p>
                            </div>
                            <Badge variant="primary">{notif.type}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-text-light">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <button className="flex items-center gap-3 p-2 hover:bg-background-gray rounded-xl transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm md:text-base">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
