import { useState } from 'react'
import DynamicSidebar from './DynamicSidebar'
import Header from './Header'
import { Menu, Close as X } from '@mui/icons-material'
import { useLanguage } from '../../contexts/LanguageContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isRTL } = useLanguage()

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dynamic Sidebar */}
      <DynamicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
