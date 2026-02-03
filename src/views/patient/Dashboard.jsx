import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'
import { 
  Activity, 
  Heart, 
  Thermometer, 
  TrendingUp,
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Bot
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AIAssistant from '../../components/shared/AIAssistant'
import BookingModal from '../../components/modals/BookingModal'
import HealthJourneyTimeline from '../../components/patient/HealthJourneyTimeline'

export default function PatientDashboard() {
  const [showAI, setShowAI] = useState(false)
  const [showBooking, setShowBooking] = useState(false)

  // Mock health data
  const bloodPressureData = [
    { date: 'Jan', systolic: 120, diastolic: 80 },
    { date: 'Feb', systolic: 118, diastolic: 78 },
    { date: 'Mar', systolic: 122, diastolic: 82 },
    { date: 'Apr', systolic: 119, diastolic: 79 },
    { date: 'May', systolic: 121, diastolic: 81 },
  ]

  const heartRateData = [
    { day: 'Mon', bpm: 72 },
    { day: 'Tue', bpm: 75 },
    { day: 'Wed', bpm: 70 },
    { day: 'Thu', bpm: 73 },
    { day: 'Fri', bpm: 71 },
    { day: 'Sat', bpm: 68 },
    { day: 'Sun', bpm: 69 },
  ]

  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Ahmed Hassan', specialty: 'Cardiology', date: '2026-01-30', time: '10:00 AM', type: 'Video' },
    { id: 2, doctor: 'Dr. Fatima Ali', specialty: 'General Medicine', date: '2026-02-05', time: '2:30 PM', type: 'Audio' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Heart Rate</p>
              <p className="text-3xl font-bold mt-1">72 BPM</p>
              <p className="text-white/60 text-xs mt-1">Normal</p>
            </div>
            <Heart className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Blood Pressure</p>
              <p className="text-3xl font-bold mt-1">120/80</p>
              <p className="text-white/60 text-xs mt-1">Optimal</p>
            </div>
            <Activity className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Temperature</p>
              <p className="text-3xl font-bold mt-1">36.8°C</p>
              <p className="text-white/60 text-xs mt-1">Normal</p>
            </div>
            <Thermometer className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Next Checkup</p>
              <p className="text-2xl font-bold mt-1">5 Days</p>
              <p className="text-white/60 text-xs mt-1">Jan 30, 2026</p>
            </div>
            <Calendar className="w-12 h-12 text-white/30" />
          </div>
        </Card>
      </div>

      {/* Health Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#8993A4" />
                <YAxis stroke="#8993A4" />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#7DAE9F" strokeWidth={2} dot={{ fill: '#7DAE9F' }} />
                <Line type="monotone" dataKey="diastolic" stroke="#93B5C6" strokeWidth={2} dot={{ fill: '#93B5C6' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-clinical-gray">Systolic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-sm text-clinical-gray">Diastolic</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Heart Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#8993A4" />
                <YAxis stroke="#8993A4" />
                <Tooltip />
                <Bar dataKey="bpm" fill="#7DAE9F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Journey Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthJourneyTimeline />
        </div>

        {/* Upcoming Sessions Summary */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 bg-background rounded-xl border border-border hover:border-primary transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text">{appointment.doctor}</span>
                  </div>
                  <div className="text-xs text-text-light">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button className="w-full" size="sm" onClick={() => setShowBooking(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Book New Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Appointments</CardTitle>
          <Button onClick={() => setShowBooking(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-clinical-darkGray">{appointment.doctor}</h4>
                    <p className="text-sm text-clinical-gray">{appointment.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-clinical-darkGray">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-clinical-gray mt-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{appointment.time}</span>
                  </div>
                </div>
                <Badge variant="primary">{appointment.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="cursor-pointer" onClick={() => setShowBooking(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-clinical-darkGray mt-4">Book Appointment</h3>
            <p className="text-sm text-clinical-gray mt-2">Schedule a session with a doctor</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-clinical-darkGray mt-4">Virtual Clinic</h3>
            <p className="text-sm text-clinical-gray mt-2">Join video consultation</p>
          </div>
        </Card>

        <Card hover className="cursor-pointer" onClick={() => setShowAI(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-accent-dark" />
            </div>
            <h3 className="font-semibold text-clinical-darkGray mt-4">AI Health Assistant</h3>
            <p className="text-sm text-clinical-gray mt-2">Get instant health advice</p>
          </div>
        </Card>
      </div>

      {/* AI Assistant Sidebar */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Booking Modal */}
      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  )
}
