import { useState } from 'react'
import DynamicSidebar from './DynamicSidebar'
import Header from './Header'
import { useAuth, Roles } from '../../contexts/AuthContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { role } = useAuth()
  const isPatient = role === Roles.PATIENT

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAF8]" >
      {/* Dynamic Sidebar */}
      <DynamicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0 w-full ${isPatient ? 'lg:ms-[310px]' : 'lg:ms-64'}`}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAF8] p-3 sm:p-4 md:p-6">
          <div className={`${isPatient ? 'w-full' : 'max-w-7xl'} mx-auto`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
