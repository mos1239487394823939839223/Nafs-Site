import { Users, Clock, CheckCircle } from 'lucide-react'

export default function QueueStats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-light">Waiting</span>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-text">{stats.waiting}</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-light">Avg Wait</span>
          <Clock className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-text">{stats.avgWait}m</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-light">Completed</span>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-text">{stats.completed}</p>
      </div>
    </div>
  )
}
