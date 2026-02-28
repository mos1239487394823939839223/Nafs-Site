import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { People as Users, FilterList as Filter, Sync as Loader2, ChevronLeft, ChevronRight, AccessTime as Clock } from '@mui/icons-material'
import { useToast } from '../../components/ui/Toast'

import QueueItem from '../../components/doctor/queue/QueueItem'
import { doctorAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

// BookingStatus enum
const BookingStatusMap = {
  0: 'waiting',
  1: 'confirmed',
  2: 'in-progress',
  3: 'completed',
  4: 'cancelled',
  5: 'cancelled',
}

export default function PatientQueue() {
  const toast = useToast()
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageIndex, setPageIndex] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await doctorAPI.getBookings(pageIndex, pageSize)
      if (response.IsSuccess && response.Data) {
        setBookings(response.Data.Items || [])
        setTotalPages(response.Data.Pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      toast.error(t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [pageIndex])

  // Format time for display
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  // Map bookings to patient queue format
  const patients = bookings.map(booking => {
    const now = new Date()
    const sessionStart = new Date(booking.SessionStartTime)
    const waitTime = Math.max(0, Math.floor((now - sessionStart) / 60000))

    return {
      id: booking.Id,
      name: booking.PatientName || 'Unknown Patient',
      status: BookingStatusMap[booking.Status] || 'waiting',
      statusCode: booking.Status,
      waitTime: booking.Status === 0 || booking.Status === 1 ? waitTime : 0,
      specialty: 'Consultation',
      time: formatTime(booking.SessionStartTime),
      duration: booking.DurationMinutes,
      meetingUrl: booking.MeetingUrl,
      paymentConfirmed: booking.PaymentConfirmed,
    }
  })

  // Stats calculation
  const stats = {
    waiting: patients.filter(p => p.status === 'waiting' || p.status === 'confirmed').length,
    completed: patients.filter(p => p.status === 'completed').length,
    avgWait: patients.length > 0
      ? Math.round(patients.filter(p => p.status === 'waiting' || p.status === 'confirmed').reduce((acc, p) => acc + p.waitTime, 0) /
        Math.max(1, patients.filter(p => p.status === 'waiting' || p.status === 'confirmed').length))
      : 0
  }

  const handleAction = (action, id) => {
    // Actions would need a backend endpoint to update booking status
    // For now, show a toast and refresh
    toast.success(`Action "${action}" triggered for booking #${id}`)
    // Could call an API to update status here in the future
    fetchBookings()
  }

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'waiting', label: t('doctor.waiting') },
    { id: 'in-progress', label: t('bookingStatus.inProgress') },
    { id: 'completed', label: t('bookingStatus.completed') },
  ]

  // Filter patients based on selected filter
  const filteredPatients = patients.filter(p => {
    if (filter === 'all') return true
    if (filter === 'waiting') return p.status === 'waiting' || p.status === 'confirmed'
    return p.status === filter
  })

  // Sort: In-progress first, then waiting, then completed
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'waiting': 1, 'confirmed': 1, 'completed': 2, 'cancelled': 3 }
    return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading mb-2">{t('doctor.patientQueue')}</h1>
          <p className="text-text-muted">{t('doctor.manageConsultations')}</p>
        </div>

      </motion.div>

      <div className="space-y-6">
        {/* Main Queue List */}
        <div className="space-y-6">
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : sortedPatients.length === 0 ? (
              <div className="text-center py-12 bg-background-paper rounded-xl border border-dashed border-border">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">{t('doctor.noPatientsFound')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPatients.map((patient) => (
                  <QueueItem key={patient.id} patient={patient} onAction={handleAction} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-lg border border-border hover:bg-background-subtle disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-muted">
                {t('common.page')} {pageIndex} {t('common.of')} {totalPages}
              </span>
              <button
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex(prev => prev + 1)}
                className="p-2 rounded-lg border border-border hover:bg-background-subtle disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
