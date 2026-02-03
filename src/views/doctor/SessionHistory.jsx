import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter, Calendar } from 'lucide-react'
import Button from '../../components/ui/Button'
import HistoryStats from '../../components/doctor/history/HistoryStats'
import HistoryList from '../../components/doctor/history/HistoryList'

export default function SessionHistory() {
  // Mock Data
  const [sessions] = useState([
    { id: 1, date: '2023-10-25', time: '09:30 AM', patientName: 'John Doe', patientId: '9842', type: 'Consultation', duration: 45, outcome: 'completed' },
    { id: 2, date: '2023-10-25', time: '11:00 AM', patientName: 'Sarah Connor', patientId: '1029', type: 'Check-up', duration: 30, outcome: 'follow-up' },
    { id: 3, date: '2023-10-24', time: '02:15 PM', patientName: 'Emily Davis', patientId: '3321', type: 'Emergency', duration: 60, outcome: 'completed' },
    { id: 4, date: '2023-10-23', time: '10:00 AM', patientName: 'Michael Brown', patientId: '5543', type: 'Therapy', duration: 50, outcome: 'cancelled' },
    { id: 5, date: '2023-10-22', time: '04:30 PM', patientName: 'Jessica Wilson', patientId: '7765', type: 'Consultation', duration: 40, outcome: 'completed' },
  ])

  // Mock Stats Calculation
  const stats = {
    totalPatients: sessions.length,
    totalHours: Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60 * 10) / 10,
    earnings: sessions.reduce((acc, s) => acc + (s.outcome === 'cancelled' ? 0 : 500), 0) // Assume 500 flat fee per completed/follow-up
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Session History</h1>
          <p className="text-text-light">Archive of your past consultations and earnings</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                This Month
            </Button>
            <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
            </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <HistoryStats stats={stats} />

      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-text-light text-sm font-medium">
                <Filter className="w-4 h-4" />
                <span>Filter by:</span>
            </div>
            <select className="text-sm border-none focus:ring-0 bg-transparent text-text font-medium cursor-pointer">
                <option>All Outcomes</option>
                <option>Completed</option>
                <option>Follow-up</option>
                <option>Cancelled</option>
            </select>
            <div className="w-px h-4 bg-border-light"></div>
            <select className="text-sm border-none focus:ring-0 bg-transparent text-text font-medium cursor-pointer">
                <option>All Types</option>
                <option>Consultation</option>
                <option>Check-up</option>
                <option>Emergency</option>
            </select>
        </div>
        <div className="text-sm text-text-light">
            Showing <span className="font-semibold text-text">{sessions.length}</span> results
        </div>
      </div>

      {/* Main List */}
      <HistoryList sessions={sessions} />
    </div>
  )
}
