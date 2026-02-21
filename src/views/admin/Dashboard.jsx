import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import {
  TrendingUp,
  Users,
  Activity,
  Star,
  Calendar,
  Loader2,
  Stethoscope,
  ClipboardList
} from 'lucide-react'
import KPICard from '../../components/admin/KPICard'
import { adminAPI, userAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [doctors, setDoctors] = useState([])
  const [bookings, setBookings] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [doctorsRes, bookingsRes, usersRes] = await Promise.allSettled([
          adminAPI.getDoctors(1, 50),
          adminAPI.getBookings({ pageIndex: 0, pageSize: 50 }),
          userAPI.getUsers({ pageIndex: 1, pageSize: 1 }), // Just to get count
        ])

        if (doctorsRes.status === 'fulfilled' && doctorsRes.value?.Data) {
          const items = doctorsRes.value.Data.Items || doctorsRes.value.Data || []
          setDoctors(Array.isArray(items) ? items : [])
        }

        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.Data) {
          const items = bookingsRes.value.Data.Items || bookingsRes.value.Data || []
          setBookings(Array.isArray(items) ? items : [])
        }

        if (usersRes.status === 'fulfilled' && usersRes.value?.Data) {
          setUsersCount(usersRes.value.Data.Records || usersRes.value.Data.Items?.length || 0)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Stats from real data
  const completedBookings = bookings.filter(b => b.Status === 3).length
  const activeBookings = bookings.filter(b => b.Status === 0 || b.Status === 1 || b.Status === 2).length
  const activeDoctors = doctors.filter(d => d.IsActive !== false).length

  const platformStats = {
    totalSessions: bookings.length,
    totalDoctors: activeDoctors,
    totalPatients: usersCount,
    activeSessions: activeBookings,
  }

  // Top Doctors by booking count
  const doctorBookingCount = {}
  bookings.forEach(b => {
    const dName = b.DoctorName || 'Unknown'
    const dId = b.DoctorId
    if (!doctorBookingCount[dId]) {
      doctorBookingCount[dId] = { name: dName, sessions: 0, completed: 0, id: dId }
    }
    doctorBookingCount[dId].sessions++
    if (b.Status === 3) doctorBookingCount[dId].completed++
  })

  const topDoctors = Object.values(doctorBookingCount)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5)
    .map(d => {
      const doctorInfo = doctors.find(doc => String(doc.Id) === String(d.id))
      return {
        id: d.id,
        name: d.name,
        specialty: doctorInfo?.Specialist?.join(', ') || 'General',
        sessions: d.sessions,
        completed: d.completed,
        status: doctorInfo?.IsActive !== false ? 'Active' : 'Inactive',
      }
    })

  // Recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.SessionStartTime || 0) - new Date(a.SessionStartTime || 0))
    .slice(0, 8)

  const BookingStatusMap = {
    0: { label: t('bookingStatus.pending'), variant: 'warning' },
    1: { label: t('bookingStatus.confirmed'), variant: 'primary' },
    2: { label: t('bookingStatus.inProgress'), variant: 'info' },
    3: { label: t('bookingStatus.completed'), variant: 'success' },
    4: { label: t('bookingStatus.cancelled'), variant: 'danger' },
    5: { label: t('bookingStatus.noShow'), variant: 'danger' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={t('admin.totalSessions')}
          value={platformStats.totalSessions}
          change={completedBookings > 0 ? Math.round((completedBookings / Math.max(1, platformStats.totalSessions)) * 100) : 0}
          trend="up"
          sparklineData={[{ value: 10 }, { value: 20 }, { value: 30 }, { value: 40 }, { value: platformStats.totalSessions }]}
          icon={Calendar}
          color="primary"
        />
        <KPICard
          title={t('admin.activeDoctors')}
          value={platformStats.totalDoctors}
          change=""
          trend="up"
          sparklineData={[{ value: platformStats.totalDoctors }]}
          icon={Activity}
          color="primary"
        />
        <KPICard
          title={t('admin.activeBookings')}
          value={platformStats.activeSessions}
          change=""
          trend="up"
          sparklineData={[{ value: platformStats.activeSessions }]}
          icon={ClipboardList}
          color="secondary"
        />
        <KPICard
          title={t('admin.totalUsers')}
          value={platformStats.totalPatients}
          change=""
          trend="up"
          sparklineData={[{ value: platformStats.totalPatients }]}
          icon={Users}
          color="accent"
        />
      </div>

      {/* Top Doctors & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              {t('admin.topDoctors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDoctors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.doctor')}</TableHead>
                    <TableHead>{t('common.specialty')}</TableHead>
                    <TableHead>{t('admin.sessions')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium text-text-heading">{doctor.name}</TableCell>
                      <TableCell className="text-text-muted">{doctor.specialty}</TableCell>
                      <TableCell>
                        <Badge variant="primary">{doctor.sessions}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.status === 'Active' ? 'success' : 'secondary'}>
                          {doctor.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t('admin.noDoctorData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t('admin.recentBookings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const statusInfo = BookingStatusMap[booking.Status] || { label: 'Unknown', variant: 'secondary' }
                  const sessionDate = booking.SessionStartTime ? new Date(booking.SessionStartTime) : null
                  return (
                    <div key={booking.Id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-background-subtle/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-heading text-sm truncate">
                            {booking.PatientName || 'Patient'}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            Dr. {booking.DoctorName || 'Doctor'}
                            {sessionDate && ` • ${sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusInfo.variant} className="flex-shrink-0 ml-2">
                        {statusInfo.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t('admin.noBookingsYet')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
