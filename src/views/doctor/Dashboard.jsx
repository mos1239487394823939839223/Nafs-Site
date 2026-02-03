import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video,
  Phone,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import DailyAgenda from '../../components/doctor/DailyAgenda'

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Mock data
  const todayStats = {
    totalSessions: 12,
    completed: 8,
    upcoming: 4
  }

  const patientQueue = [
    { 
      id: 1, 
      name: 'Sarah Mohamed', 
      time: '10:00 AM', 
      type: 'Video', 
      status: 'waiting',
      reason: 'Follow-up consultation',
      history: 'Previous visit: Hypertension management'
    },
    { 
      id: 2, 
      name: 'Ahmed Ali', 
      time: '11:00 AM', 
      type: 'Audio', 
      status: 'scheduled',
      reason: 'General checkup',
      history: 'First-time patient'
    },
    { 
      id: 3, 
      name: 'Fatima Hassan', 
      time: '2:00 PM', 
      type: 'Video', 
      status: 'scheduled',
      reason: 'Diabetes consultation',
      history: 'Regular patient - Type 2 Diabetes'
    },
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Sessions</p>
              <p className="text-3xl font-bold mt-1">{todayStats.totalSessions}</p>
              <p className="text-white/60 text-xs mt-1">Today</p>
            </div>
            <Users className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">{todayStats.completed}</p>
              <p className="text-white/60 text-xs mt-1">Sessions</p>
            </div>
            <CheckCircle className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Upcoming</p>
              <p className="text-3xl font-bold mt-1">{todayStats.upcoming}</p>
              <p className="text-white/60 text-xs mt-1">Sessions</p>
            </div>
            <Clock className="w-12 h-12 text-white/30" />
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-clinical-darkGray">{patient.name}</h4>
                        <Badge variant={patient.status === 'waiting' ? 'warning' : 'primary'}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-clinical-gray">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{patient.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {patient.type === 'Video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                          <span>{patient.type}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant={patient.status === 'waiting' ? 'primary' : 'outline'}>
                      {patient.status === 'waiting' ? 'Join Now' : 'View Details'}
                    </Button>
                  </div>
                  <div className="bg-background p-3 rounded-xl text-sm">
                    <p className="text-clinical-darkGray"><strong>Reason:</strong> {patient.reason}</p>
                    <p className="text-clinical-gray mt-1"><strong>History:</strong> {patient.history}</p>
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
            <h3 className="font-semibold text-clinical-darkGray mt-4">Update Schedule</h3>
            <p className="text-sm text-clinical-gray mt-2">Manage your availability</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-clinical-darkGray mt-4">Medical Records</h3>
            <p className="text-sm text-clinical-gray mt-2">Access patient files</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8 text-accent-dark" />
            </div>
            <h3 className="font-semibold text-clinical-darkGray mt-4">Messages</h3>
            <p className="text-sm text-clinical-gray mt-2">Chat with patients</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
