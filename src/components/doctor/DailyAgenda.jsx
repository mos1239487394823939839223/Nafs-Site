import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, FileText, Calendar, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'

export default function DailyAgenda() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateInputRef = useRef(null)

  const { user } = useAuth()
  const { appointments, doctorAvailability } = useClinic()

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value))
  }

  // Generate dynamic slots based on context
  const dateStr = selectedDate.toISOString().split('T')[0]
  const docId = user?.id || user?.email
  const availableHours = doctorAvailability[docId]?.[dateStr] || []
  const dailyApps = appointments.filter(app =>
    (app.doctorId === docId || app.doctorName === user?.name) && app.date === dateStr
  )

  const timeSlots = []
  for (let h = 8; h <= 19; h++) {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h
    const timeKey = `${displayHour < 10 ? '0' : ''}${displayHour}:00`
    const timeFull = `${displayHour}:00 ${period}`

    const app = dailyApps.find(a => a.time.includes(timeFull))

    if (app) {
      timeSlots.push({
        hour: timeKey,
        period,
        type: 'appointment',
        patient: app.patientName,
        sessionType: 'video',
        reason: app.specialty || 'Consultation',
        priority: 'routine'
      })
    } else if (availableHours.includes(h)) {
      timeSlots.push({ hour: timeKey, period, type: 'available' })
    } else if (h === 12) {
      timeSlots.push({ hour: '12:00', period: 'PM', type: 'break', label: 'Lunch Break' })
    } else {
      timeSlots.push({ hour: timeKey, period, type: 'off' })
    }
  }

  const getSlotColor = (type, priority) => {
    if (type === 'break' || type === 'off') return 'bg-background-subtle border-border opacity-60'
    if (type === 'available') return 'bg-background border-border'
    if (priority === 'urgent') return 'bg-red-500/10 border-red-500/20'
    return 'bg-primary/5 border-primary/20'
  }

  const getSlotHoverColor = (type) => {
    if (type === 'break' || type === 'off') return ''
    if (type === 'available') return 'hover:bg-primary/5 hover:border-primary/30'
    return 'hover:border-primary'
  }

  const stats = {
    appointments: timeSlots.filter(s => s.type === 'appointment').length,
    available: timeSlots.filter(s => s.type === 'available').length,
    urgent: timeSlots.filter(s => s.priority === 'urgent').length
  }

  return (
    <div className="bg-background-paper rounded-2xl shadow-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-heading">Daily Agenda</h2>
          <p className="text-sm text-text-muted mt-1">{formatDate(selectedDate)}</p>
        </div>
        <div className="relative inline-block">
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="absolute top-full right-0 mt-2 opacity-0 w-0 h-0"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => dateInputRef.current?.showPicker()}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Change Date
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {timeSlots.map((slot, index) => (
          <div
            key={index}
            className={`
              border rounded-xl p-3 transition-all duration-200
              ${getSlotColor(slot.type, slot.priority)}
              ${getSlotHoverColor(slot.type)}
              ${slot.type === 'appointment' ? 'cursor-pointer' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Time */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-sm font-semibold text-text-heading">
                  {slot.hour}
                </div>
                <div className="text-xs text-text-muted">{slot.period}</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {slot.type === 'available' && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Available</span>
                  </div>
                )}

                {slot.type === 'break' && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{slot.label || 'Break'}</span>
                  </div>
                )}

                {slot.type === 'appointment' && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text-heading">{slot.patient}</span>
                      {slot.priority === 'urgent' && (
                        <Badge variant="danger" size="sm">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-2">{slot.reason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {slot.type === 'appointment' && (
                <div className="flex-shrink-0">
                  <Button
                    size="sm"
                    variant={slot.priority === 'urgent' ? 'primary' : 'outline'}
                    onClick={() => navigate('/dashboard/doctor/messages')}
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{stats.appointments}</div>
            <div className="text-xs text-text-muted mt-1">Appointments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{stats.available}</div>
            <div className="text-xs text-text-muted mt-1">Available Slots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-dark">{stats.urgent}</div>
            <div className="text-xs text-text-muted mt-1">Urgent</div>
          </div>
        </div>
      </div>
    </div>
  )
}
