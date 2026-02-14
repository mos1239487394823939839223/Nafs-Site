import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
  MessageSquare,
  Users,
  Stethoscope,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  User,
  ShieldAlert
} from 'lucide-react'
import ActiveTickets from '../../components/staff/ActiveTickets'
import { useClinic } from '../../contexts/ClinicContext'

export default function CustomerServiceDashboard() {
  const [activeTab, setActiveTab] = useState('overview') // overview, patients, doctors, emergency

  const { tickets, updateTicketStatus, appointments } = useClinic()

  const stats = [
    { label: 'Patient Inquiries', value: tickets.filter(t => t.role === 'patient').length, icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Doctor Requests', value: tickets.filter(t => t.role === 'doctor').length, icon: Stethoscope, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Live Sessions', value: appointments.filter(a => a.status === 'in-progress').length, icon: Calendar, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
    { label: 'Urgent Cases', value: tickets.filter(t => t.priority === 'urgent').length, icon: ShieldAlert, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
  ]

  const patientInquiries = tickets.filter(t => t.role === 'patient')
  const doctorRequests = tickets.filter(t => t.role === 'doctor')


  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">Customer Service Hub</h1>
          <p className="text-text-muted">Bridge between Patients, Doctors, and Support</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-background-paper px-4 py-2 rounded-xl border border-border flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">8 Agents Online</span>
          </div>
          <Button variant="primary" size="sm">
            View Active Monitor
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
                <p className="text-2xl font-bold text-text-heading">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-background-subtle p-1 rounded-2xl w-fit">
        {['overview', 'patients', 'doctors', 'emergency'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
                            px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all
                            ${activeTab === tab
                ? 'bg-background-paper text-primary shadow-sm'
                : 'text-text-muted hover:text-text'
              }
                        `}
          >
            {tab}
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
                  {activeTab === 'patients' ? 'Patient Support Queue' : 'Doctor Support Queue'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      placeholder="Search cases..."
                      className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" /> Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {(activeTab === 'patients' ? patientInquiries : doctorRequests).map((item) => (
                    <div key={item.id} className="p-4 hover:bg-background-subtle transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background-subtle flex items-center justify-center">
                          <User className="w-5 h-5 text-text-muted" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-text-heading">{item.user}</h4>
                            <Badge variant={
                              item.priority === 'urgent' ? 'danger' :
                                item.priority === 'high' ? 'warning' : 'primary'
                            } size="sm">
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-light">{item.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <Clock className="w-4 h-4" />
                          <span>{item.time} ago</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-background-subtle'}`} />
                          <span className="capitalize">{item.status}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="gap-2">
                          Handle <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Emergency Protocols</h2>
              <p className="text-red-600/80 dark:text-red-400/80 max-w-md mx-auto mb-6">
                These cases require immediate intervention. All currently available agents will be redirected to assist.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Button variant="outline" className="bg-background-paper border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/5">
                  Notify Medical Directors
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Activate Rapid Response
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
