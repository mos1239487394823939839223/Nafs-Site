import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { CalendarToday as CalendarIcon, AccessTime as Clock, People as Users, CheckCircle, Sync as Loader2 } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { doctorAPI } from '../../lib/api'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const { t, isRTL } = useLanguage()

  // BookingStatus enum mapping
  const BookingStatusMap = {
    0: t('bookingStatus.pending', 'Pending'),
    1: t('bookingStatus.confirmed', 'Confirmed'),
    2: t('bookingStatus.inProgress', 'In Progress'),
    3: t('bookingStatus.completed', 'Completed'),
    4: t('bookingStatus.cancelled', 'Cancelled'),
    5: t('bookingStatus.noShow', 'No Show'),
  }

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await doctorAPI.getBookings(1, 50)
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

  // Active bookings for queue (not completed/cancelled)
  const patientQueue = bookings
    .filter(b => b.Status !== 3 && b.Status !== 4 && b.Status !== 5)
    .map(booking => ({
      id: booking.Id,
      name: booking.PatientName,
      time: formatTime(booking.SessionStartTime),
      date: formatDate(booking.SessionStartTime),
      duration: booking.DurationMinutes,
      type: t('patient.video', 'Video'),
      status: BookingStatusMap[booking.Status] || t('common.unknown', 'Unknown'),
      statusCode: booking.Status,
      reason: booking.PatientNotes || t('doctorReg.generalConsultation', 'General Consultation'),
      meetingUrl: booking.MeetingUrl,
      paymentConfirmed: booking.PaymentConfirmed,
      doctorImage: booking.DoctorImage,
    }))

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats Overview */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">{t('admin.totalSessions', 'Total Sessions')}</p>
              <p className="text-3xl font-bold mt-1 text-primary">{todayStats.totalSessions}</p>
              <p className="text-text-muted text-xs mt-1">{t('doctor.allBookings', 'All bookings')}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">{t('admin.completed', 'Completed')}</p>
              <p className="text-3xl font-bold mt-1 text-green-600">{todayStats.completed}</p>
              <p className="text-text-muted text-xs mt-1">{t('doctor.sessions', 'Sessions')}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">{t('admin.upcoming', 'Upcoming')}</p>
              <p className="text-3xl font-bold mt-1 text-secondary">{todayStats.upcoming}</p>
              <p className="text-text-muted text-xs mt-1">{t('doctor.sessions', 'Sessions')}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="w-7 h-7 text-secondary" />
            </div>
          </div>
        </Card>

      </div>

      {/* Patient Queue */}
      <Card>
        <CardHeader>
          <CardTitle>{t('doctor.patientQueue', 'Patient Queue')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : patientQueue.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('doctor.noActiveBookings', 'No active bookings')}</p>
            </div>
          ) : (
            <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
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
                          <Badge variant="warning">{t('common.unpaid', 'Unpaid')}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span dir="ltr">{patient.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span dir="ltr">{patient.date}</span>
                        </div>
                        {patient.duration > 0 && (
                          <span dir="ltr">{patient.duration} {t('common.min', 'min')}</span>
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
                        } else {
                          setSelectedPatient(patient)
                          setIsDetailsModalOpen(true)
                        }
                      }}
                    >
                      {patient.statusCode === 1 || patient.statusCode === 2 ? t('doctor.joinNow', 'Join Now') : t('common.viewDetails', 'View Details')}
                    </Button>
                  </div>
                  <div className="bg-background p-3 rounded-xl text-sm">
                    <p className="text-text-heading"><strong>{t('common.notes', 'Notes')}:</strong> {patient.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={t('common.patientDetails', 'Patient Details')}
        size="md"
      >
        {selectedPatient && (
          <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
                <span className="font-medium text-text-heading">{t('doctor.appointmentTime', 'Appointment Time')}:</span>
                <span className="text-text-muted" dir="ltr">{selectedPatient.time} - {selectedPatient.date}</span>
              </div>
              {selectedPatient.duration > 0 && (
                <div>
                  <span className="font-medium text-text-heading">{t('doctor.duration', 'Duration')}:</span>
                  <span className="text-text-muted mx-2" dir="ltr">{selectedPatient.duration} {t('common.minutes', 'minutes')}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-text-heading">{t('common.notes', 'Notes')}:</span>
                <p className="text-text-muted mt-1">{selectedPatient.reason}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {selectedPatient.meetingUrl && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsModalOpen(false)
                    window.open(selectedPatient.meetingUrl, '_blank')
                  }}
                >
                  {t('doctor.joinMeeting', 'Join Meeting')}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                {t('common.close', 'Close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
