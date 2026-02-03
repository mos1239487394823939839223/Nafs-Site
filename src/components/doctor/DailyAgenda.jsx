import { Clock, Video, Phone, FileText, Calendar, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function DailyAgenda() {
  const timeSlots = [
    { hour: '08:00', period: 'AM', type: 'available' },
    { hour: '09:00', period: 'AM', type: 'available' },
    {
      hour: '10:00',
      period: 'AM',
      type: 'appointment',
      patient: 'Sarah Mohamed',
      sessionType: 'video',
      reason: 'Follow-up consultation',
      priority: 'routine'
    },
    {
      hour: '11:00',
      period: 'AM',
      type: 'appointment',
      patient: 'Ahmed Ali',
      sessionType: 'audio',
      reason: 'General checkup',
      priority: 'routine'
    },
    { hour: '12:00', period: 'PM', type: 'break', label: 'Lunch Break' },
    { hour: '01:00', period: 'PM', type: 'break' },
    {
      hour: '02:00',
      period: 'PM',
      type: 'appointment',
      patient: 'Fatima Hassan',
      sessionType: 'video',
      reason: 'Diabetes consultation',
      priority: 'urgent'
    },
    { hour: '03:00', period: 'PM', type: 'available' },
    {
      hour: '04:00',
      period: 'PM',
      type: 'appointment',
      patient: 'Omar Khalil',
      sessionType: 'video',
      reason: 'Post-surgery follow-up',
      priority: 'routine'
    },
    { hour: '05:00', period: 'PM', type: 'available' },
    { hour: '06:00', period: 'PM', type: 'available' },
    { hour: '07:00', period: 'PM', type: 'available' },
  ]

  const getSlotColor = (type, priority) => {
    if (type === 'break') return 'bg-gray-100 border-gray-200'
    if (type === 'available') return 'bg-background border-border'
    if (priority === 'urgent') return 'bg-red-50 border-red-200'
    return 'bg-primary/5 border-primary/20'
  }

  const getSlotHoverColor = (type) => {
    if (type === 'break') return ''
    if (type === 'available') return 'hover:bg-primary/5 hover:border-primary/30'
    return 'hover:border-primary'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text">Daily Agenda</h2>
          <p className="text-sm text-text-light mt-1">Today, January 28, 2026</p>
        </div>
        <Button size="sm" variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Change Date
        </Button>
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
                <div className="text-sm font-semibold text-text">
                  {slot.hour}
                </div>
                <div className="text-xs text-text-light">{slot.period}</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {slot.type === 'available' && (
                  <div className="flex items-center gap-2 text-text-light">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Available</span>
                  </div>
                )}

                {slot.type === 'break' && (
                  <div className="flex items-center gap-2 text-text-light">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{slot.label || 'Break'}</span>
                  </div>
                )}

                {slot.type === 'appointment' && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text">{slot.patient}</span>
                      {slot.priority === 'urgent' && (
                        <Badge variant="danger" size="sm">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-light mb-2">{slot.reason}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-text-light">
                        {slot.sessionType === 'video' ? (
                          <>
                            <Video className="w-3 h-3 text-primary" />
                            <span>Video Call</span>
                          </>
                        ) : (
                          <>
                            <Phone className="w-3 h-3 text-secondary" />
                            <span>Audio Call</span>
                          </>
                        )}
                      </div>
                      <button className="text-xs text-primary hover:text-primary-dark font-medium transition-colors">
                        View Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {slot.type === 'appointment' && (
                <div className="flex-shrink-0">
                  <Button size="sm" variant={slot.priority === 'urgent' ? 'primary' : 'outline'}>
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
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-xs text-text-light mt-1">Appointments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">6</div>
            <div className="text-xs text-text-light mt-1">Available Slots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-dark">1</div>
            <div className="text-xs text-text-light mt-1">Urgent</div>
          </div>
        </div>
      </div>
    </div>
  )
}
