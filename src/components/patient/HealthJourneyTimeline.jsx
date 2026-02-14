import { Calendar, TestTube, Pill, FileText, CheckCircle, Clock } from 'lucide-react'
import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'

const eventTypeConfig = {
  appointment: {
    icon: Calendar,
    color: 'primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
    textColor: 'text-primary'
  },
  test: {
    icon: TestTube,
    color: 'secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary',
    textColor: 'text-secondary'
  },
  prescription: {
    icon: Pill,
    color: 'accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent',
    textColor: 'text-accent-dark'
  },
  diagnosis: {
    icon: FileText,
    color: 'text',
    bgColor: 'bg-background-subtle',
    borderColor: 'border-border',
    textColor: 'text-text'
  }
}

export default function HealthJourneyTimeline() {
  const { user } = useAuth()
  const { medicalHistory } = useClinic()

  const journeyEvents = medicalHistory
    .filter(record => record.patientName === user?.name)
    .map(record => ({
      id: record.id,
      date: record.date,
      type: record.type || 'diagnosis', // default to diagnosis if missing
      title: record.summary,
      status: record.status || 'Ongoing',
      details: record.details || `Administered by ${record.doctorName}. Medications: ${record.medications?.join(', ') || 'None'}`,
      doctor: record.doctorName
    }))

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="bg-background-paper rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-heading">Health Journey</h2>
          <p className="text-sm text-text-muted mt-1">Your medical history timeline</p>
        </div>
        <button className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
          View All
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

        {/* Timeline events */}
        <div className="space-y-6">
          {journeyEvents.map((event, index) => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon

            return (
              <div key={event.id} className="relative pl-16 group">
                {/* Timeline dot */}
                <div className={`absolute left-0 w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center border-2 ${config.borderColor} bg-background-paper transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${config.textColor}`} />
                </div>

                {/* Event card */}
                <div className="bg-background-paper rounded-2xl p-4 border border-border hover:border-primary transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{event.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-text-muted">{formatDate(event.date)}</span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className="text-sm text-text-muted">{getRelativeTime(event.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === 'Normal' || event.status === 'Completed' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          {event.status}
                        </span>
                      ) : event.status === 'Active' || event.status === 'Ongoing' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {event.status}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-text-muted bg-background-subtle px-2 py-1 rounded-full">
                          {event.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-text-muted mb-2">{event.details}</p>

                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{event.doctor}</span>
                    {event.duration && (
                      <span className="text-accent-dark font-medium">Duration: {event.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* View more button */}
      <div className="mt-6 text-center">
        <button className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
          Load More Events
        </button>
      </div>
    </div>
  )
}
