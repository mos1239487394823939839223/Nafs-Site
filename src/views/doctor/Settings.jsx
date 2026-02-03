import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Shield, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast' 
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'
import NotificationSettings from '../../components/doctor/settings/NotificationSettings'
import SecuritySettings from '../../components/doctor/settings/SecuritySettings'

export default function Settings() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Manage your personal info' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Control your alerts' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password & 2FA' },
  ]

  const handleSave = (data) => {
    console.log('Saving settings:', data)
    // Simulate API call
    setTimeout(() => {
        toast.success('Settings saved successfully')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
            <h1 className="text-4xl font-bold text-text mb-3">Settings</h1>
            <p className="text-lg text-text-light">Manage your account preferences and security.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                            activeTab === tab.id 
                            ? 'bg-white shadow-md text-primary' 
                            : 'hover:bg-white/50 text-text-light hover:text-text'
                        }`}
                    >
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                                activeTab === tab.id ? 'bg-primary/10' : 'bg-transparent group-hover:bg-primary/5'
                            }`}>
                                <tab.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{tab.label}</h3>
                                <p className="text-xs opacity-70">{tab.desc}</p>
                            </div>
                        </div>
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTabIndicator"
                                className="absolute left-0 top-0 bottom-0 w-1 bg-primary" 
                            />
                        )}
                    </button>
                ))}

                <button 
                    onClick={logout}
                    className="w-full text-left p-4 rounded-xl hover:bg-red-50 text-text-light hover:text-red-600 transition-all mt-8 flex items-center gap-4 group"
                >
                     <div className="p-2 rounded-lg bg-transparent group-hover:bg-red-100/50">
                        <LogOut className="w-5 h-5" />
                     </div>
                     <span className="font-semibold text-sm">Sign Out</span>
                </button>
            </div>

            {/* Main Content Card */}
            <div className="lg:col-span-9">
                <motion.div 
                    layout
                    className="bg-white rounded-3xl shadow-lg border border-border-light overflow-hidden min-h-[600px] relative"
                >
                    {/* Decorative Top Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-sage-light" />
                    
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-text capitalize mb-1">{activeTab}</h2>
                                    <p className="text-text-light text-sm">Update your information below</p>
                                </div>
                                <div className="max-w-3xl">
                                    {activeTab === 'profile' && <ProfileSettings user={user} onSave={handleSave} />}
                                    {activeTab === 'notifications' && <NotificationSettings onSave={handleSave} />}
                                    {activeTab === 'security' && <SecuritySettings onSave={handleSave} />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

        </div>
      </div>
    </div>
  )
}
