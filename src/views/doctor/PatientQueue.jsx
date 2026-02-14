import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Filter } from 'lucide-react'
import { useToast } from '../../components/ui/Toast' // Adjusted import path
import QueueList from '../../components/doctor/queue/QueueList'
import QueueStats from '../../components/doctor/queue/QueueStats'
import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'

export default function PatientQueue() {
  const toast = useToast()
  const [filter, setFilter] = useState('all') // all, waiting, in-progress, completed

  const { user } = useAuth()
  const { appointments, updateAppointmentStatus } = useClinic()

  // Filter appointments for this doctor
  const patients = appointments
    .filter(app => {
      const isMyId = app.doctorId === user?.id || app.doctorId === user?.email;
      const isMyName = app.doctorName?.toLowerCase() === user?.name?.toLowerCase();
      // Special fallback for demo: if user is 'doctor' and app is for 'Dr. Ahmed Hassan'
      const isDemoMatch = (user?.email === 'doctor@example.com' || user?.name === 'doctor') &&
        (app.doctorId === 1 || app.doctorName === 'Dr. Ahmed Hassan');

      return isMyId || isMyName || isDemoMatch;
    })
    .map(app => ({
      id: app.id,
      name: app.patientName,
      status: app.status,
      waitTime: Math.floor(Math.random() * 30), // Scenario wait time
      specialty: app.specialty,
      time: app.time
    }))


  // Stats calculation
  const stats = {
    waiting: patients.filter(p => p.status === 'waiting' || p.status === 'confirmed').length,
    completed: patients.filter(p => p.status === 'completed').length,
    avgWait: Math.round(patients.reduce((acc, p) => acc + p.waitTime, 0) / patients.length) || 0
  }

  const handleAction = (action, id) => {
    let newStatus = ''
    if (action === 'start') newStatus = 'in-progress'
    else if (action === 'complete') newStatus = 'completed'
    else if (action === 'cancel' || action === 'no-show') newStatus = 'cancelled'

    if (newStatus) {
      updateAppointmentStatus(id, newStatus)
      toast.success(`Action updated for patient session`)
    }
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading mb-2">Patient Queue</h1>
          <p className="text-text-muted">Manage today's consultations in real-time</p>
        </div>
        <div className="p-2 px-3 bg-background-paper border border-border rounded-lg shadow-sm self-start sm:self-auto">
          <span className="text-sm font-medium text-text-muted flex items-center gap-2">
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-background-paper text-text-muted border border-border hover:bg-background-subtle'
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
          <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
            <h3 className="font-semibold text-text-heading mb-2">👨‍⚕️ Doctor's Note</h3>
            <p className="text-sm text-text-muted">
              Remember to complete patient notes within 15 minutes of session end.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
