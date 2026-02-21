import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import HistoryStats from '../../components/doctor/history/HistoryStats'
import HistoryList from '../../components/doctor/history/HistoryList'
import { doctorAPI } from '../../lib/api'

// BookingStatus enum
const BookingStatusMap = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'InProgress',
  3: 'Completed',
  4: 'Cancelled',
  5: 'NoShow',
}

export default function SessionHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(null) // null = all
  const [pageIndex, setPageIndex] = useState(0)
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
    type: 'Consultation',
    duration: booking.DurationMinutes || 0,
    outcome: BookingStatusMap[booking.Status]?.toLowerCase() || 'unknown',
    paymentConfirmed: booking.PaymentConfirmed,
  }))

  // Calculate stats
  const stats = {
    totalPatients: totalRecords,
    totalHours: Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60 * 10) / 10,
    earnings: sessions.reduce((acc, s) => acc + (s.outcome === 'completed' ? 500 : 0), 0)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPageIndex(0) // Reset to first page on filter change
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Session History</h1>
          <p className="text-text-light">Archive of your past consultations and earnings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            This Month
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
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
            <span>Filter by:</span>
          </div>
          <select
            value={statusFilter === null ? '' : statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value === '' ? null : parseInt(e.target.value))}
            className="text-sm border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 bg-background text-text font-medium cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Confirmed</option>
            <option value="2">In Progress</option>
            <option value="3">Completed</option>
            <option value="4">Cancelled</option>
            <option value="5">No Show</option>
          </select>
        </div>
        <div className="text-sm text-text-muted">
          Showing <span className="font-semibold text-text-heading">{totalRecords}</span> results
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
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-text-muted">
                Page {pageIndex + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= totalPages - 1}
                onClick={() => setPageIndex(prev => prev + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
