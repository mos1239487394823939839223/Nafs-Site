import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter, Calendar } from 'lucide-react'
import Button from '../../components/ui/Button'
import HistoryStats from '../../components/doctor/history/HistoryStats'
import HistoryList from '../../components/doctor/history/HistoryList'

import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'

export default function SessionHistory() {
  const { user } = useAuth()
  const { appointments } = useClinic()

  const sessions = appointments
    .filter(app => (app.doctorId === 1 || app.doctorName === user?.name) && (app.status === 'completed' || app.status === 'cancelled'))
    .map(app => ({
      id: app.id,
      date: app.date,
      time: app.time,
      patientName: app.patientName,
      patientId: 'ID-' + app.id,
      type: app.specialty || 'Consultation',
      duration: app.status === 'completed' ? 45 : 0,
      outcome: app.status
    }))

  const stats = {
    totalPatients: sessions.filter(s => s.outcome === 'completed').length,
    totalHours: Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60 * 10) / 10,
    earnings: sessions.reduce((acc, s) => acc + (s.outcome === 'completed' ? 500 : 0), 0)
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
