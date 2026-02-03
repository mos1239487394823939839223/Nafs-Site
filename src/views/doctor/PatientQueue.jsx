import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Filter } from 'lucide-react'
import { useToast } from '../../components/ui/Toast' // Adjusted import path
import QueueList from '../../components/doctor/queue/QueueList'
import QueueStats from '../../components/doctor/queue/QueueStats'

export default function PatientQueue() {
  const toast = useToast()
  const [filter, setFilter] = useState('all') // all, waiting, in-progress, completed

  const [patients, setPatients] = useState([
    { id: 'p-101', name: 'Sarah Connor', status: 'in-progress', waitTime: 0 },
    { id: 'p-102', name: 'John Doe', status: 'waiting', waitTime: 15 },
    { id: 'p-103', name: 'Alice Smith', status: 'waiting', waitTime: 45 },
    { id: 'p-104', name: 'Bob Wilson', status: 'waiting', waitTime: 5 },
    { id: 'p-105', name: 'Emily Davis', status: 'completed', waitTime: 10 },
  ])

  // Stats calculation
  const stats = {
    waiting: patients.filter(p => p.status === 'waiting').length,
    completed: patients.filter(p => p.status === 'completed').length,
    avgWait: Math.round(patients.reduce((acc, p) => acc + p.waitTime, 0) / patients.length) || 0
  }

  const handleAction = (action, id) => {
    setPatients(prev => prev.map(p => {
        if (p.id !== id) return p

        if (action === 'start') {
            toast.success(`Session started with ${p.name}`)
            return { ...p, status: 'in-progress' }
        }
        if (action === 'complete') {
            toast.success(`Session completed for ${p.name}`)
            return { ...p, status: 'completed' }
        }
        if (action === 'no-show') {
            toast.info(`Marked ${p.name} as No Show`)
            return { ...p, status: 'cancelled' }
        }
        return p
    }))
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'waiting', label: 'Waiting' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Patient Queue</h1>
          <p className="text-text-light">Manage today's consultations in real-time</p>
        </div>
        <div className="p-2 bg-white border border-border rounded-lg shadow-sm">
            <span className="text-sm font-medium text-text-light flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Patients: {patients.length}
            </span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Queue List */}
        <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="w-5 h-5 text-text-light mr-2" />
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                            filter === f.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white text-text-light border border-border hover:bg-gray-50'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className='min-h-[400px]'>
                <QueueList 
                    patients={patients} 
                    filter={filter} 
                    onAction={handleAction} 
                />
            </div>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
            <QueueStats stats={stats} />
            
            {/* Quick Actions / Notes area could go here */}
            <div className="bg-sage-light/10 p-6 rounded-2xl border border-sage-light/30">
                <h3 className="font-semibold text-text mb-2">👨‍⚕️ Doctor's Note</h3>
                <p className="text-sm text-text-light">
                    Remember to complete patient notes within 15 minutes of session end.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
