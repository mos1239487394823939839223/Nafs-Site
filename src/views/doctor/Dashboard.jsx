import { useState, useEffect } from 'react'
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
  AlertCircle,
  Loader2
} from 'lucide-react'
import DailyAgenda from '../../components/doctor/DailyAgenda'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../lib/api'

// BookingStatus enum mapping
const BookingStatusMap = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'InProgress',
  3: 'Completed',
  4: 'Cancelled',
  5: 'NoShow',
}

const getStatusVariant = (status) => {
  const s = typeof status === 'number' ? status : parseInt(status)
  switch (s) {
    case 0: return 'warning'
    case 1: return 'primary'
    case 2: return 'info'
    case 3: return 'success'
    case 4: return 'error'
    case 5: return 'error'
    default: return 'default'
  }
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await doctorAPI.getBookings(0, 50)
        if (response.IsSuccess && response.Data) {
          setBookings(response.Data.Items || [])
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  // Stats from real data
  const todayStats = {
    totalSessions: bookings.length,
    completed: bookings.filter(b => b.Status === 3).length,
    upcoming: bookings.filter(b => b.Status === 0 || b.Status === 1).length
  }

  // Format date/time for display
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Active bookings for queue (not completed/cancelled)
  const patientQueue = bookings
    .filter(b => b.Status !== 3 && b.Status !== 4 && b.Status !== 5)
    .map(booking => ({
      id: booking.Id,
      name: booking.PatientName,
      time: formatTime(booking.SessionStartTime),
      date: formatDate(booking.SessionStartTime),
      duration: booking.DurationMinutes,
      type: 'Video',
      status: BookingStatusMap[booking.Status] || 'Unknown',
      statusCode: booking.Status,
      reason: booking.PatientNotes || 'General Consultation',
      meetingUrl: booking.MeetingUrl,
      paymentConfirmed: booking.PaymentConfirmed,
      doctorImage: booking.DoctorImage,
    }))

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Sessions</p>
              <p className="text-3xl font-bold mt-1 text-primary">{todayStats.totalSessions}</p>
              <p className="text-text-muted text-xs mt-1">All bookings</p>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : patientQueue.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientQueue.map((patient) => (
                  <div key={patient.id} className="p-4 border border-border rounded-2xl hover:border-primary transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-3">
                          <h4 className="font-semibold text-text-heading truncate">{patient.name}</h4>
                          <Badge variant={getStatusVariant(patient.statusCode)}>
                            {patient.status}
                          </Badge>
                          {!patient.paymentConfirmed && (
                            <Badge variant="warning">Unpaid</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{patient.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{patient.date}</span>
                          </div>
                          {patient.duration && (
                            <span>{patient.duration} min</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        variant={patient.statusCode === 1 || patient.statusCode === 2 ? 'primary' : 'outline'}
                        onClick={() => {
                          if (patient.meetingUrl) {
                            window.open(patient.meetingUrl, '_blank')
                          } else if (patient.statusCode === 1 || patient.statusCode === 2) {
                            navigate('/dashboard/doctor/messages')
                          } else {
                            setSelectedPatient(patient)
                            setIsDetailsModalOpen(true)
                          }
                        }}
                      >
                        {patient.statusCode === 1 || patient.statusCode === 2 ? 'Join Now' : 'View Details'}
                      </Button>
                    </div>
                    <div className="bg-background p-3 rounded-xl text-sm">
                      <p className="text-text-heading"><strong>Notes:</strong> {patient.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Agenda */}
        <DailyAgenda />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="cursor-pointer" onClick={() => navigate('/dashboard/doctor/schedule')}>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">Update Schedule</h3>
            <p className="text-sm text-text-muted mt-2">Manage your availability</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer" onClick={() => navigate('/dashboard/doctor/medical-history')}>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">Medical Records</h3>
            <p className="text-sm text-text-muted mt-2">Access patient files</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer" onClick={() => navigate('/dashboard/doctor/messages')}>
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
                <Badge variant={getStatusVariant(selectedPatient.statusCode)}>
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="bg-background p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-text-heading">Appointment Time:</span>
                <span className="text-text-muted">{selectedPatient.time} - {selectedPatient.date}</span>
              </div>
              {selectedPatient.duration && (
                <div>
                  <span className="font-medium text-text-heading">Duration:</span>
                  <span className="text-text-muted ml-2">{selectedPatient.duration} minutes</span>
                </div>
              )}
              <div>
                <span className="font-medium text-text-heading">Notes:</span>
                <p className="text-text-muted mt-1">{selectedPatient.reason}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  if (selectedPatient.meetingUrl) {
                    window.open(selectedPatient.meetingUrl, '_blank')
                  } else {
                    navigate('/dashboard/doctor/messages')
                  }
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
