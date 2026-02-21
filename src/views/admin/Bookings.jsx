import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Calendar, Filter, Loader2, ChevronLeft, ChevronRight, Users, Search } from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { useToast } from '../../components/ui/Toast'

const BookingStatusMap = {
  0: { label: 'Pending', variant: 'warning' },
  1: { label: 'Confirmed', variant: 'primary' },
  2: { label: 'In Progress', variant: 'info' },
  3: { label: 'Completed', variant: 'success' },
  4: { label: 'Cancelled', variant: 'danger' },
  5: { label: 'No Show', variant: 'danger' },
}

export default function AdminBookings() {
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageIndex, setPageIndex] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 20

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = {
        pageIndex,
        pageSize,
      }
      if (statusFilter !== null) {
        params.status = statusFilter
      }
      const response = await adminAPI.getBookings(params)
      if (response?.IsSuccess !== false && response?.Data) {
        setBookings(response.Data.Items || response.Data || [])
        setTotalPages(response.Data.Pages || 1)
        setTotalRecords(response.Data.Records || 0)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [pageIndex, statusFilter])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const filteredBookings = searchQuery
    ? bookings.filter(b =>
      (b.PatientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.DoctorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    : bookings

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-heading">All Bookings</h2>
          <p className="text-text-muted mt-1">
            Manage and monitor all platform bookings
            {totalRecords > 0 && ` • ${totalRecords} total`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by patient or doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-text"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={statusFilter === null ? '' : statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value === '' ? null : parseInt(e.target.value))
                  setPageIndex(1)
                }}
                className="border border-border rounded-xl px-3 py-2.5 bg-background text-text focus:ring-2 focus:ring-primary/20 outline-none text-sm"
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
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Bookings List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-text-muted">No bookings found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const statusInfo = BookingStatusMap[booking.Status] || { label: 'Unknown', variant: 'secondary' }
                      return (
                        <TableRow key={booking.Id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {(booking.PatientName || 'U').charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium text-text-heading truncate">
                                {booking.PatientName || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-text-muted">
                            Dr. {booking.DoctorName || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-text-muted whitespace-nowrap">
                            {formatDate(booking.SessionStartTime)}
                          </TableCell>
                          <TableCell className="text-text-muted whitespace-nowrap">
                            {formatTime(booking.SessionStartTime)}
                          </TableCell>
                          <TableCell className="text-text-muted">
                            {booking.DurationMinutes ? `${booking.DurationMinutes} min` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={booking.PaymentConfirmed ? 'success' : 'warning'}>
                              {booking.PaymentConfirmed ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageIndex <= 1}
                    onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-text-muted">
                    Page {pageIndex} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageIndex >= totalPages}
                    onClick={() => setPageIndex(prev => prev + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
