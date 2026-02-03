import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import ActiveTickets from '../../components/staff/ActiveTickets'

export default function CustomerServiceDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Open Tickets</p>
              <p className="text-3xl font-bold mt-1">12</p>
            </div>
            <AlertCircle className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Resolved Today</p>
              <p className="text-3xl font-bold mt-1">28</p>
            </div>
            <CheckCircle className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary-dark text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold mt-1">3 min</p>
            </div>
            <Clock className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent-dark text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Active Chats</p>
              <p className="text-3xl font-bold mt-1">5</p>
            </div>
            <MessageSquare className="w-12 h-12 text-white/30" />
          </div>
        </Card>
      </div>

      {/* Active Tickets Kanban Board */}
      <ActiveTickets />
    </div>
  )
}
