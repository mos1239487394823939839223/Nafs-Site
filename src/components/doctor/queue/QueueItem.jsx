import { motion } from 'framer-motion'
import { Clock, Play, XCircle } from 'lucide-react'
import Button from '../../ui/Button'

export default function QueueItem({ patient, onAction }) {
  const statusColors = {
    waiting: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl border border-border-light shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      {/* Patient Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
          {patient.name.charAt(0)}
        </div>
        <div>
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text">{patient.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[patient.status]} capitalize`}>
                    {patient.status}
                </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-light mt-1">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Waited: {patient.waitTime} mins
                </span>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        {patient.status === 'waiting' && (
            <>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200"
                    onClick={() => onAction('no-show', patient.id)}
                >
                    <XCircle className="w-4 h-4 mr-1" />
                    No Show
                </Button>
                <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary-dark text-white"
                    onClick={() => onAction('start', patient.id)}
                >
                    <Play className="w-4 h-4 mr-1" />
                    Start Session
                </Button>
            </>
        )}
        
        {patient.status === 'in-progress' && (
            <Button 
                size="sm" 
                className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-green-700 border border-green-300"
                onClick={() => onAction('complete', patient.id)}
            >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete Session
            </Button>
        )}
      </div>
    </motion.div>
  )
}

function CheckCircle({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}
