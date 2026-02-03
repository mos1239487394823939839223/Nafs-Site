import { Users, Clock, DollarSign } from 'lucide-react'

export default function HistoryStats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-light">Total Patients</span>
          <Users className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-bold text-text">{stats.totalPatients}</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-light">Total Hours</span>
          <Clock className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-text">{stats.totalHours}h</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-light">Earnings</span>
          <DollarSign className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-text">${stats.earnings}</p>
      </div>
    </div>
  )
}
