import { useState } from 'react'
import DynamicSidebar from './DynamicSidebar'
import Header from './Header'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { EmergencyAction } from '../../Pages/patient-home-page/EmergencyAction'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t, isRTL } = useLanguage()
  const { role } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-background" >
      {/* Dynamic Sidebar */}
      <DynamicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full lg:ms-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {role === Roles.PATIENT && <EmergencyAction />}
    </div>
  )
}
