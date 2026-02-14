import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, Search, User, Menu } from 'lucide-react'
import Badge from '../ui/Badge'
import RoleBadge from '../ui/RoleBadge'

import { useClinic } from '../../contexts/ClinicContext'

export default function Header({ onMenuClick }) {
  const { role, user } = useAuth()
  const { notifications: sharedNotifications } = useClinic()
  const [showNotifications, setShowNotifications] = useState(false)
  // Mock notifications split by source for Staff
  const [activeNotifTab, setActiveNotifTab] = useState('patient')

  // Filter shared notifications
  const notifications = role === 'staff'
    ? sharedNotifications.filter(n => n.source === activeNotifTab || n.role === 'staff')
    : sharedNotifications.filter(n => n.role === role || n.role === 'all')

  const roleLabels = {
    patient: 'Patient Portal',
    doctor: 'Doctor Workspace',
    admin: 'Admin Dashboard',
    staff: 'Customer Service',
  }

  const notifTabs = [
    { id: 'patient', label: 'Patients' },
    { id: 'doctor', label: 'Doctors' },
    { id: 'admin', label: 'Admin' }
  ]

  return (
    <header className="bg-white border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-background-gray rounded-xl transition-colors -ml-2"
          >
            <Menu className="w-6 h-6 text-text" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-text truncate max-w-[120px] sm:max-w-none">
              {roleLabels[role] || 'Dashboard'}
            </h2>
            <div className="hidden sm:block">
              <RoleBadge role={role} size="sm" />
            </div>
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />

                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-clinical-darkGray font-black italic uppercase tracking-tighter">Notifications</h3>
                    <Badge variant="outline">{notifications.length}</Badge>
                  </div>

                  {role === 'staff' && (
                    <div className="flex bg-background border-b border-border">
                      {notifTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveNotifTab(tab.id)}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest italic transition-all
                                    ${activeNotifTab === tab.id ? 'bg-white text-primary' : 'text-clinical-gray hover:bg-white/50'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-border-light hover:bg-background-gray transition-colors cursor-pointer group">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-clinical-darkGray leading-tight group-hover:text-primary transition-colors">{notif.message}</p>
                              <p className="text-[10px] font-bold italic text-clinical-gray mt-1 uppercase">{notif.time} ago</p>
                            </div>
                            <Badge variant="primary" className="text-[9px] px-1 overflow-hidden">{notif.type}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-text-light opacity-50">
                        No new {activeNotifTab} alerts
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-background border-t border-border text-center">
                    <button className="text-[10px] font-black uppercase italic text-primary hover:underline">Mark all as read</button>
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
