import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Badge from '../../ui/Badge'
import Button from '../../ui/Button'

export default function HistoryList({ sessions }) {
  const getStatusBadge = (outcome) => {
    switch (outcome) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'follow-up':
        return <Badge variant="warning">Follow-up</Badge>
      case 'cancelled':
        return <Badge variant="error" className="bg-red-100 text-red-700">Cancelled</Badge>
      default:
        return <Badge variant="default">{outcome}</Badge>
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-background-gray border-b border-border-light">
                <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-text-light">Date & Time</th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-light">Patient</th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-light">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-light">Duration</th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-light">Outcome</th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-light text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
                {sessions.map((session, index) => (
                    <motion.tr 
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                    >
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-medium text-text">{session.date}</span>
                                <span className="text-xs text-text-light">{session.time}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {session.patientName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text">{session.patientName}</p>
                                    <p className="text-xs text-text-light">ID: #{session.patientId}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-sm text-text-light">{session.type}</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-text-light">
                                <Clock className="w-3.5 h-3.5" />
                                {session.duration}m
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {getStatusBadge(session.outcome)}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                                <FileText className="w-4 h-4 mr-1" />
                                Notes
                            </Button>
                        </td>
                    </motion.tr>
                ))}
            </tbody>
        </table>
      </div>
      
      {sessions.length === 0 && (
          <div className="p-8 text-center text-text-light">
              No past sessions found.
          </div>
      )}
    </div>
  )
}
