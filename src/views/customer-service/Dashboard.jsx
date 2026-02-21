import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
  MessageSquare,
  Users,
  Stethoscope,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronRight,
  User,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import ActiveTickets from '../../components/staff/ActiveTickets'
import { chatAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function CustomerServiceDashboard() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await chatAPI.getRooms()
        if (response?.IsSuccess !== false && response?.Data) {
          setChatRooms(response.Data || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalChats = chatRooms.length
  const unreadChats = chatRooms.filter(r => (r.UnreadCount || 0) > 0).length

  const stats = [
    { label: t('staff.activeChats'), value: totalChats, icon: MessageSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t('staff.unreadMessages'), value: unreadChats, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
    { label: t('staff.liveSessions'), value: 0, icon: Calendar, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
    { label: t('staff.urgentCases'), value: 0, icon: ShieldAlert, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">{t('staff.customerServiceHub')}</h1>
          <p className="text-text-muted">{t('staff.hubSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-background-paper px-4 py-2 rounded-xl border border-border flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-text">{t('staff.online')}</span>
          </div>
          <Button variant="primary" size="sm">
            {t('staff.viewActiveMonitor')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-text-heading">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-background-subtle p-1 rounded-2xl w-fit">
        {[
          { key: 'overview', label: t('staff.overview') },
          { key: 'patients', label: t('staff.patients') },
          { key: 'doctors', label: t('staff.doctors') },
          { key: 'emergency', label: t('staff.emergency') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
                            px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                            ${activeTab === tab.key
                ? 'bg-background-paper text-primary shadow-sm'
                : 'text-text-muted hover:text-text'
              }
                        `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <ActiveTickets />
          </motion.div>
        )}

        {(activeTab === 'patients' || activeTab === 'doctors') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <CardTitle className="text-xl">
                  {activeTab === 'patients' ? t('staff.patientSupportQueue') : t('staff.doctorSupportQueue')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      placeholder={t('staff.searchCases')}
                      className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" /> {t('common.filter')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center py-12 text-text-muted">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('staff.noSupportRequests')}</p>
                  <p className="text-sm mt-1">{t('staff.newRequestsAppear')}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'emergency' && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-500/20 bg-red-500/10 p-8 text-center">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{t('staff.emergencyProtocols')}</h2>
              <p className="text-red-600/80 dark:text-red-400/80 max-w-md mx-auto mb-6">
                {t('staff.emergencyDesc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Button variant="outline" className="bg-background-paper border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/5">
                  {t('staff.notifyMedicalDirectors')}
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  {t('staff.activateRapidResponse')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
