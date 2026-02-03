import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { validateEmail } from '../../lib/validation'
import { Mail, UserPlus, Send, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function InviteStaff() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    permissions: 'support-agent',
  })
  const [errors, setErrors] = useState({})

  // Mock invited staff data
  const [invitations, setInvitations] = useState([
    { id: 1, email: 'sarah@clinc.com', role: 'Customer Service', permissions: 'Support Agent', status: 'accepted', date: '2026-01-20' },
    { id: 2, email: 'ahmed@clinc.com', role: 'Customer Service', permissions: 'Manager', status: 'pending', date: '2026-01-25' },
    { id: 3, email: 'fatima@clinc.com', role: 'Customer Service', permissions: 'View Only', status: 'pending', date: '2026-01-27' },
  ])

  const permissionLevels = [
    { value: 'view-only', label: 'View Only', description: 'Can view tickets and patient information' },
    { value: 'support-agent', label: 'Support Agent', description: 'Can respond to tickets and manage patient queries' },
    { value: 'manager', label: 'Manager', description: 'Full access including team management and reporting' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.permissions) {
      newErrors.permissions = 'Please select a permission level'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      
      // Add to invitations list
      const newInvitation = {
        id: Date.now(),
        email: formData.email,
        role: 'Customer Service',
        permissions: permissionLevels.find(p => p.value === formData.permissions)?.label || '',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      }
      setInvitations(prev => [newInvitation, ...prev])

      toast.success(`Invitation sent to ${formData.email}`)
      setFormData({ email: '', role: '', permissions: 'support-agent' })
    }, 1000)
  }

  const resendInvitation = (email) => {
    toast.success(`Invitation resent to ${email}`)
  }

  const cancelInvitation = (id) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id))
    toast.success('Invitation cancelled')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-clinical-darkGray">Invite Staff Members</h2>
        <p className="text-clinical-gray mt-1">Add customer service team members to your platform</p>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="staff@clinc.com"
              />

              <Select
                label="Permission Level"
                name="permissions"
                value={formData.permissions}
                onChange={handleChange}
                error={errors.permissions}
              >
                {permissionLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Permission Description */}
            {formData.permissions && (
              <div className="bg-medical-lightBlue p-4 rounded-lg">
                <p className="text-sm text-medical-blue">
                  <strong>{permissionLevels.find(p => p.value === formData.permissions)?.label}:</strong>{' '}
                  {permissionLevels.find(p => p.value === formData.permissions)?.description}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Sent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-clinical-gray" />
                      <span className="font-medium">{invitation.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{invitation.role}</TableCell>
                  <TableCell>{invitation.permissions}</TableCell>
                  <TableCell>
                    {invitation.status === 'accepted' && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    )}
                    {invitation.status === 'pending' && (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {invitation.status === 'expired' && (
                      <Badge variant="danger">
                        <XCircle className="w-3 h-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{invitation.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resendInvitation(invitation.email)}
                          >
                            Resend
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelInvitation(invitation.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Invited staff members will receive an email with a unique registration link. 
          The invitation is valid for 7 days.
        </p>
      </div>
    </div>
  )
}
