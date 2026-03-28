import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FilterList as Filter, CalendarToday as Calendar, Sync as Loader2, ChevronLeft, ChevronRight } from '@mui/icons-material'
import Button from '../../components/ui/Button'
import SelectDropdown from '../../components/ui/SelectDropdown'
import HistoryStats from '../../components/doctor/history/HistoryStats'
import HistoryList from '../../components/doctor/history/HistoryList'
import { doctorAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function SessionHistory() {
  const { t, isRTL } = useLanguage()

  const BookingStatusMap = {
    0: t('bookingStatus.pending'),
    1: t('bookingStatus.confirmed'),
    2: t('bookingStatus.inProgress'),
    3: t('bookingStatus.completed'),
    4: t('bookingStatus.cancelled'),
    5: t('bookingStatus.noShow'),
  }
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(null) // null = all
  const [pageIndex, setPageIndex] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const pageSize = 20

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await doctorAPI.getBookings(pageIndex, pageSize, statusFilter)
      if (response.IsSuccess && response.Data) {
        setBookings(response.Data.Items || [])
        setTotalPages(response.Data.Pages || 1)
        setTotalRecords(response.Data.Records || 0)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [pageIndex, statusFilter])

  // Format booking data for display
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const sessions = bookings.map(booking => ({
    id: booking.Id,
    date: formatDate(booking.SessionStartTime),
    time: formatTime(booking.SessionStartTime),
    patientName: booking.PatientName,
    patientId: `ID-${booking.PatientId}`,
    type: t('patient.consultation', 'Consultation'),
    duration: booking.DurationMinutes || 0,
    outcome: BookingStatusMap[booking.Status] || t('common.unknown', 'unknown'),
    paymentConfirmed: booking.PaymentConfirmed,
  }))

  // Calculate stats
  const stats = {
    totalPatients: totalRecords,
    totalHours: Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60 * 10) / 10,
    earnings: sessions.reduce((acc, s) => acc + (s.outcome === t('bookingStatus.completed') ? 500 : 0), 0)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPageIndex(1) // Reset to first page on filter change
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">{t('doctor.sessionHistory')}</h1>
          <p className="text-text-light">{t('doctor.sessionHistoryDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {t('doctor.thisMonth')}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('doctor.exportCSV')}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <HistoryStats stats={stats} />

      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-text-light text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span>{t('common.filterBy')}:</span>
          </div>
          <SelectDropdown
            value={statusFilter === null ? '' : String(statusFilter)}
            onChange={(val) => handleStatusFilter(val === '' ? null : parseInt(val))}
            size="sm"
            options={[
              { value: '', label: t('common.allStatus') },
              { value: '0', label: t('bookingStatus.pending') },
              { value: '1', label: t('bookingStatus.confirmed') },
              { value: '2', label: t('bookingStatus.inProgress') },
              { value: '3', label: t('bookingStatus.completed') },
              { value: '4', label: t('bookingStatus.cancelled') },
              { value: '5', label: t('bookingStatus.noShow') },
            ]}
            className="w-48"
          />
        </div>
        <div className="text-sm text-text-muted">
          {t('common.showing')} <span className="font-semibold text-text-heading">{totalRecords}</span> {t('common.results')}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <HistoryList sessions={sessions} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
              >
                {isRTL ? <ChevronRight className="w-4 h-4 mr-1" /> : <ChevronLeft className="w-4 h-4 mr-1" />}
                {t('common.previous')}
              </Button>
              <span className="text-sm text-text-muted">
                {t('common.page')} {pageIndex} {t('common.of')} {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex(prev => prev + 1)}
              >
                {t('common.next')}
                {isRTL ? <ChevronLeft className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
