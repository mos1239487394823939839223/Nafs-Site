import { useState, useEffect } from 'react'
import Badge from '../ui/Badge'
import { Clock, User, AlertCircle, CheckCircle, MessageSquare, Loader2 } from 'lucide-react'
import { chatAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ActiveTickets() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch chat rooms as "tickets" for customer service
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      try {
        const response = await chatAPI.getRooms()
        if (response?.IsSuccess !== false && response?.Data) {
          const rooms = response.Data || []
          const mappedTickets = rooms.map((room, index) => ({
            id: room.Id || index,
            user: room.Name || room.OtherUserName || 'Unknown User',
            role: 'patient',
            issue: room.LastMessage || 'No message yet',
            priority: 'medium',
            status: room.UnreadCount > 0 ? 'open' : 'resolved',
            time: room.LastMessageTime ? new Date(room.LastMessageTime).toLocaleTimeString() : 'N/A',
            category: 'general',
            assignee: null,
          }))
          setTickets(mappedTickets)
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
        // Use empty array on error
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const updateTicketStatus = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const handleMoveStatus = (id, newStatus) => {
    updateTicketStatus(id, newStatus)
  }

  const categories = [
    { value: 'all', label: t('staff.allTickets'), count: tickets.length },
    { value: 'payment', label: t('staff.payment'), count: tickets.filter(tk => tk.category === 'payment').length },
    { value: 'technical', label: t('staff.technical'), count: tickets.filter(tk => tk.category === 'technical').length },
    { value: 'appointment', label: t('staff.appointment'), count: tickets.filter(tk => tk.category === 'appointment').length },
    { value: 'general', label: t('common.general'), count: tickets.filter(tk => tk.category === 'general').length },
  ]

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.category === filter)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'primary'
    }
  }

  const groupedByStatus = {
    open: filteredTickets.filter(t => t.status === 'open'),
    'in-progress': filteredTickets.filter(t => t.status === 'in-progress'),
    resolved: filteredTickets.filter(t => t.status === 'resolved')
  }

  if (loading) {
    return (
      <div className="bg-background-paper rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-paper rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-heading">{t('staff.activeTickets')}</h2>
          <p className="text-sm text-text-muted mt-1">{t('staff.manageRequests')}</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
              ${filter === cat.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-background-subtle text-text-muted hover:bg-primary/10'
              }
            `}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Open Column */}
        <div className="bg-background-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-text-heading">{t('staff.open')}</h3>
            <span className="ms-auto text-sm text-text-muted bg-background-paper px-2 py-1 rounded-full">
              {groupedByStatus.open.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedByStatus.open.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">{t('staff.noOpenTickets')}</p>
            )}
            {groupedByStatus.open.map((ticket) => (
              <div key={ticket.id} className="bg-background-paper rounded-xl p-3 border border-border hover:border-primary transition-colors cursor-pointer shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-sm text-text">{ticket.user}</h4>
                    <span className="text-[10px] uppercase font-bold text-primary/60">{ticket.role}</span>
                  </div>
                  <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.time}</span>
                  </div>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{ticket.assignee}</span>
                    </div>
                  ) : (
                    <span className="text-red-500">{t('staff.unassigned')}</span>
                  )}
                </div>
                <button
                  onClick={() => handleMoveStatus(ticket.id, 'in-progress')}
                  className="w-full mt-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                >
                  {t('staff.startCase')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-background-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-text-heading">{t('staff.inProgress')}</h3>
            <span className="ms-auto text-sm text-text-muted bg-background-paper px-2 py-1 rounded-full">
              {groupedByStatus['in-progress'].length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedByStatus['in-progress'].length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">{t('staff.noTicketsInProgress')}</p>
            )}
            {groupedByStatus['in-progress'].map((ticket) => (
              <div key={ticket.id} className="bg-background-paper rounded-xl p-3 border border-border hover:border-primary transition-colors cursor-pointer shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-sm text-text">{ticket.user}</h4>
                    <span className="text-[10px] uppercase font-bold text-primary/60">{ticket.role}</span>
                  </div>
                  <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{ticket.assignee || 'Staff'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleMoveStatus(ticket.id, 'resolved')}
                  className="w-full mt-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                >
                  {t('staff.resolveTicket')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resolved Column */}
        <div className="bg-background-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-text-heading">{t('staff.resolved')}</h3>
            <span className="ms-auto text-sm text-text-muted bg-background-paper px-2 py-1 rounded-full">
              {groupedByStatus.resolved.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedByStatus.resolved.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">{t('staff.noResolvedTickets')}</p>
            )}
            {groupedByStatus.resolved.map((ticket) => (
              <div key={ticket.id} className="bg-background-paper rounded-xl p-3 border border-border hover:border-primary transition-colors cursor-pointer shadow-sm opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-sm text-text">{ticket.user}</h4>
                    <span className="text-[10px] uppercase font-bold text-primary/60">{ticket.role}</span>
                  </div>
                  <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{ticket.assignee || 'Staff'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
