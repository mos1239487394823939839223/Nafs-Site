import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import DailyAgenda from '../../components/doctor/DailyAgenda'
import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const { user } = useAuth()
  const { appointments } = useClinic()

  // Current doctor's appointments
  const doctorAppointments = appointments.filter(app =>
    app.doctorId === user?.id ||
    app.doctorId === user?.email ||
    app.doctorName === user?.name
  )

  const todayStats = {
    totalSessions: doctorAppointments.length,
    completed: doctorAppointments.filter(a => a.status === 'completed').length,
    upcoming: doctorAppointments.filter(a => a.status === 'confirmed' || a.status === 'waiting' || a.status === 'scheduled').length
  }

  const patientQueue = doctorAppointments.map(app => ({
    id: app.id,
    name: app.patientName,
    time: app.time,
    type: 'Video',
    status: app.status,
    reason: app.specialty || 'General Consultation',
    history: 'Shared clinical history'
  }))


  const weekSchedule = [
    { day: 'Mon', slots: 8, booked: 6 },
    { day: 'Tue', slots: 8, booked: 8 },
    { day: 'Wed', slots: 8, booked: 5 },
    { day: 'Thu', slots: 8, booked: 7 },
    { day: 'Fri', slots: 6, booked: 4 },
    { day: 'Sat', slots: 4, booked: 3 },
    { day: 'Sun', slots: 0, booked: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Sessions</p>
              <p className="text-3xl font-bold mt-1 text-primary">{todayStats.totalSessions}</p>
              <p className="text-text-muted text-xs mt-1">Today</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1 text-green-600">{todayStats.completed}</p>
              <p className="text-text-muted text-xs mt-1">Sessions</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Upcoming</p>
              <p className="text-3xl font-bold mt-1 text-secondary">{todayStats.upcoming}</p>
              <p className="text-text-muted text-xs mt-1">Sessions</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="w-7 h-7 text-secondary" />
            </div>
          </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientQueue.map((patient) => (
                <div key={patient.id} className="p-4 border border-border rounded-2xl hover:border-primary transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-3">
                        <h4 className="font-semibold text-text-heading truncate">{patient.name}</h4>
                        <Badge variant={patient.status === 'waiting' ? 'warning' : 'primary'}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{patient.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      variant={patient.status === 'waiting' ? 'primary' : 'outline'}
                      onClick={() => {
                        if (patient.status === 'waiting') {
                          navigate('/dashboard/doctor/messages')
                        } else {
                          setSelectedPatient(patient)
                          setIsDetailsModalOpen(true)
                        }
                      }}
                    >
                      {patient.status === 'waiting' ? 'Join Now' : 'View Details'}
                    </Button>
                  </div>
                  <div className="bg-background p-3 rounded-xl text-sm">
                    <p className="text-text-heading"><strong>Reason:</strong> {patient.reason}</p>
                    <p className="text-text-muted mt-1"><strong>History:</strong> {patient.history}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Agenda */}
        <DailyAgenda />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">Update Schedule</h3>
            <p className="text-sm text-text-muted mt-2">Manage your availability</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">Medical Records</h3>
            <p className="text-sm text-text-muted mt-2">Access patient files</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8 text-accent-dark" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">Messages</h3>
            <p className="text-sm text-text-muted mt-2">Chat with patients</p>
          </div>
        </Card>
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Patient Details"
        size="md"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {selectedPatient.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text">{selectedPatient.name}</h3>
                <Badge variant={selectedPatient.status === 'waiting' ? 'warning' : 'primary'}>
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="bg-background p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-text-heading">Appointment Time:</span>
                <span className="text-text-muted">{selectedPatient.time}</span>
              </div>
              <div>
                <span className="font-medium text-text-heading">Reason:</span>
                <p className="text-text-muted mt-1">{selectedPatient.reason}</p>
              </div>
              <div>
                <span className="font-medium text-text-heading">History:</span>
                <p className="text-text-muted mt-1">{selectedPatient.history}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  navigate('/dashboard/doctor/messages')
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
