import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Star,
  Calendar
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import KPICard from '../../components/admin/KPICard'

export default function AdminDashboard() {
  // Mock analytics data
  const platformStats = {
    totalRevenue: 125000,
    totalDoctors: 45,
    totalPatients: 1250,
    activeSessions: 23
  }

  const revenueData = [
    { month: 'Jan', revenue: 18000 },
    { month: 'Feb', revenue: 22000 },
    { month: 'Mar', revenue: 25000 },
    { month: 'Apr', revenue: 28000 },
    { month: 'May', revenue: 32000 },
  ]

  const sessionTypeData = [
    { name: 'Video', value: 65, color: '#7DAE9F' },
    { name: 'Audio', value: 25, color: '#93B5C6' },
    { name: 'Chat', value: 10, color: '#D3C5E5' },
  ]

  const topDoctors = [
    { id: 1, name: 'Dr. Ahmed Hassan', specialty: 'Cardiology', rating: 4.9, sessions: 145, revenue: 72500 },
    { id: 2, name: 'Dr. Fatima Ali', specialty: 'General Medicine', rating: 4.8, sessions: 132, revenue: 39600 },
    { id: 3, name: 'Dr. Mohamed Saad', specialty: 'Dermatology', rating: 4.7, sessions: 98, revenue: 39200 },
    { id: 4, name: 'Dr. Layla Ibrahim', specialty: 'Pediatrics', rating: 4.9, sessions: 120, revenue: 42000 },
    { id: 5, name: 'Dr. Omar Khalil', specialty: 'Orthopedics', rating: 4.6, sessions: 87, revenue: 43500 },
  ]

  const patientRetention = [
    { month: 'Jan', returning: 65, new: 35 },
    { month: 'Feb', returning: 70, new: 30 },
    { month: 'Mar', returning: 72, new: 28 },
    { month: 'Apr', returning: 75, new: 25 },
    { month: 'May', returning: 78, new: 22 },
  ]

  // Sparkline data for KPIs
  const revenueSparkline = [
    { value: 18000 }, { value: 22000 }, { value: 25000 }, { value: 28000 }, { value: 32000 }, { value: 35000 }, { value: 38000 }
  ]

  const sessionsSparkline = [
    { value: 450 }, { value: 520 }, { value: 580 }, { value: 610 }, { value: 650 }, { value: 680 }, { value: 720 }
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Sessions"
          value="720"
          change="12.5"
          trend="up"
          sparklineData={sessionsSparkline}
          icon={Calendar}
          color="primary"
        />
        <KPICard
          title="Active Doctors"
          value={platformStats.totalDoctors}
          change="8.3"
          trend="up"
          sparklineData={[{ value: 38 }, { value: 40 }, { value: 42 }, { value: 43 }, { value: 44 }, { value: 45 }, { value: 45 }]}
          icon={Activity}
          color="primary"
        />
        <KPICard
          title="Patient Retention"
          value="78%"
          change="5.2"
          trend="up"
          sparklineData={[{ value: 65 }, { value: 70 }, { value: 72 }, { value: 75 }, { value: 76 }, { value: 77 }, { value: 78 }]}
          icon={Users}
          color="secondary"
        />
        <KPICard
          title="Total Revenue"
          value={`${platformStats.totalRevenue.toLocaleString()} EGP`}
          change="15.8"
          trend="up"
          sparklineData={revenueSparkline}
          icon={DollarSign}
          color="accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#8993A4" />
                <YAxis stroke="#8993A4" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#7DAE9F" strokeWidth={3} dot={{ fill: '#7DAE9F', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Patient Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Retention & Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientRetention}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#8993A4" />
              <YAxis stroke="#8993A4" />
              <Tooltip />
              <Legend />
              <Bar dataKey="returning" fill="#7DAE9F" name="Returning Patients %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="new" fill="#93B5C6" name="New Patients %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Doctors Table - ERP Style */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Revenue (EGP)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="font-medium text-clinical-darkGray">{doctor.name}</div>
                  </TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{doctor.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary">{doctor.sessions}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">{doctor.revenue.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
