import { useState } from 'react'
import Badge from '../ui/Badge'
import { Clock, User, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react'

export default function ActiveTickets() {
  const [filter, setFilter] = useState('all')

  const tickets = [
    { id: 1, patient: 'Sarah Mohamed', issue: 'Payment issue', category: 'payment', priority: 'high', status: 'open', time: '5 min ago', assignee: 'John Doe' },
    { id: 2, patient: 'Ahmed Ali', issue: 'Appointment rescheduling', category: 'appointment', priority: 'medium', status: 'in-progress', time: '15 min ago', assignee: 'Jane Smith' },
    { id: 3, patient: 'Fatima Hassan', issue: 'Technical support', category: 'technical', priority: 'low', status: 'in-progress', time: '1 hour ago', assignee: 'John Doe' },
    { id: 4, patient: 'Omar Khalil', issue: 'Prescription refill', category: 'general', priority: 'medium', status: 'open', time: '2 hours ago', assignee: null },
    { id: 5, patient: 'Layla Ibrahim', issue: 'Video call not working', category: 'technical', priority: 'high', status: 'open', time: '3 hours ago', assignee: null },
    { id: 6, patient: 'Mohamed Saad', issue: 'Insurance verification', category: 'payment', priority: 'low', status: 'resolved', time: '5 hours ago', assignee: 'Jane Smith' },
  ]

  const categories = [
    { value: 'all', label: 'All Tickets', count: tickets.length },
    { value: 'payment', label: 'Payment', count: tickets.filter(t => t.category === 'payment').length },
    { value: 'technical', label: 'Technical', count: tickets.filter(t => t.category === 'technical').length },
    { value: 'appointment', label: 'Appointment', count: tickets.filter(t => t.category === 'appointment').length },
    { value: 'general', label: 'General', count: tickets.filter(t => t.category === 'general').length },
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'in-progress': return 'primary'
      case 'open': return 'warning'
      default: return 'primary'
    }
  }

  const groupedByStatus = {
    open: filteredTickets.filter(t => t.status === 'open'),
    'in-progress': filteredTickets.filter(t => t.status === 'in-progress'),
    resolved: filteredTickets.filter(t => t.status === 'resolved')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text">Active Tickets</h2>
          <p className="text-sm text-text-light mt-1">Manage customer support requests</p>
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
                : 'bg-background text-text-light hover:bg-primary/10'
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
        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-text">Open</h3>
            <span className="ml-auto text-sm text-text-light bg-white px-2 py-1 rounded-full">
              {groupedByStatus.open.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedByStatus.open.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl p-3 border border-border hover:border-primary transition-colors cursor-pointer shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-text">{ticket.patient}</h4>
                  <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-xs text-text-light mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs text-text-light">
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
                    <span className="text-red-500">Unassigned</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-text">In Progress</h3>
            <span className="ml-auto text-sm text-text-light bg-white px-2 py-1 rounded-full">
              {groupedByStatus['in-progress'].length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedByStatus['in-progress'].map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl p-3 border border-border hover:border-primary transition-colors cursor-pointer shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-text">{ticket.patient}</h4>
                  <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-xs text-text-light mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs text-text-light">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{ticket.assignee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolved Column */}
        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-text">Resolved</h3>
            <span className="ml-auto text-sm text-text-light bg-white px-2 py-1 rounded-full">
              {groupedByStatus.resolved.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedByStatus.resolved.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl p-3 border border-border hover:border-primary transition-colors cursor-pointer shadow-sm opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-text">{ticket.patient}</h4>
                  <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-xs text-text-light mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs text-text-light">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{ticket.assignee}</span>
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
