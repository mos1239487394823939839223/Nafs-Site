import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react'

export default function ScheduleSidebar({ stats }) {
  return (
    <div className="md:col-span-1 space-y-6">
      {/* Today's Summary Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-background-paper rounded-2xl shadow-lg p-6 border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-heading">Today's Summary</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-background-subtle rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Total Sessions</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-text-heading">{stats.totalSessions}</p>
          </div>

          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Available Slots</span>
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.availableSlots}</p>
          </div>

          <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Booked Hours</span>
              <Clock className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary">{stats.bookedHours}h</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-background-paper rounded-2xl shadow-lg p-6 border border-border"
      >
        <h3 className="font-semibold text-text-heading mb-4">Legend</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-primary border border-primary/20"></div>
            <span className="text-sm text-text-muted">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-background-subtle border border-border"></div>
            <span className="text-sm text-text-muted">Not Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary/20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#ffffff20_2px,#ffffff20_4px)]"></div>
            <span className="text-sm text-text-muted">Booked Appointment</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
