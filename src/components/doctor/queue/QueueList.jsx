import { motion, AnimatePresence } from 'framer-motion'
import QueueItem from './QueueItem'

export default function QueueList({ patients, filter, onAction }) {
  const filteredPatients = patients.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  // Sort: In-progress first, then Waiting (by wait time desc), then Completed
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'waiting': 1, 'completed': 2, 'cancelled': 3 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    // Secondary sort by wait time (longer wait first for waiting patients)
    if (a.status === 'waiting' && b.status === 'waiting') {
        return b.waitTime - a.waitTime
    }
    return 0
  })

  if (sortedPatients.length === 0) {
    return (
      <div className="text-center py-12 bg-background-gray/50 rounded-xl border border-dashed border-border-dark">
        <p className="text-text-light">No patients found within this filter.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sortedPatients.map((patient) => (
          <QueueItem key={patient.id} patient={patient} onAction={onAction} />
        ))}
      </AnimatePresence>
    </div>
  )
}
