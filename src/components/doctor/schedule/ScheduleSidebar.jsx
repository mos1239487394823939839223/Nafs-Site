import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react'

export default function ScheduleSidebar({ stats }) {
  return (
    <div className="md:col-span-1 space-y-6">
      {/* Today's Summary Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-border-light"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text">Today's Summary</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-background rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-light">Total Sessions</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-text">{stats.totalSessions}</p>
          </div>

          <div className="p-4 bg-sage-light/20 rounded-xl border border-sage-light/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-light">Available Slots</span>
              <CheckCircle className="w-4 h-4 text-sage" />
            </div>
            <p className="text-2xl font-bold text-sage-dark">{stats.availableSlots}</p>
          </div>

          <div className="p-4 bg-secondary-light/20 rounded-xl border border-secondary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-light">Booked Hours</span>
              <Clock className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary-dark">{stats.bookedHours}h</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-border-light"
      >
        <h3 className="font-semibold text-text mb-4">Legend</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-sage border border-sage-dark/20"></div>
            <span className="text-sm text-text-light">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
            <span className="text-sm text-text-light">Not Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-primary-light/80 border border-primary/20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#ffffff20_2px,#ffffff20_4px)]"></div>
            <span className="text-sm text-text-light">Booked Appointment</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
