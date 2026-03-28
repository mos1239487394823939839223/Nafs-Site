import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import SelectDropdown from '../../components/ui/SelectDropdown'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { validateEmail } from '../../lib/validation'
import { Mail, Send, CheckCircle, AccessTime as Clock, Cancel as XCircle, Sync as Loader2, PersonAdd as UserPlus } from '@mui/icons-material'
import { authAPI, userAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function InviteStaff() {
  const toast = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [staffList, setStaffList] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    permissions: 'support-agent',
  })
  const [errors, setErrors] = useState({})

  const permissionLevels = [
    { value: 'view-only', label: t('admin.viewOnly'), description: t('admin.viewOnlyDesc') },
    { value: 'support-agent', label: t('admin.supportAgent'), description: t('admin.supportAgentDesc') },
    { value: 'manager', label: t('admin.manager'), description: t('admin.managerDesc') },
  ]

  // Fetch staff list from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setFetchLoading(true)
        // Role 3 = Staff/CustomerService (adjust if backend uses different role number)
        const response = await userAPI.getUsers({ pageIndex: 1, pageSize: 50, role: 3 })
        if (response?.Data) {
          const items = response.Data.Items || response.Data || []
          setStaffList(Array.isArray(items) ? items : [])
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchStaff()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('errors.required')
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = t('errors.invalidEmail')
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = t('errors.passwordTooShort')
    }

    if (!formData.permissions) {
      newErrors.permissions = t('errors.required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error(t('errors.fixFormErrors'))
      return
    }

    setLoading(true)

    try {
      const registerData = {
        Name: formData.name,
        Email: formData.email,
        Password: formData.password,
        PhoneNumber: formData.phoneNumber || null,
        Gender: 0,
        Birthday: '2000-01-01',
        Role: 3, // Staff role
      }

      const response = await authAPI.register(registerData)

      if (response?.IsSuccess !== false) {
        toast.success(t('success.staffAdded'))
        setFormData({ name: '', email: '', password: '', phoneNumber: '', permissions: 'support-agent' })

        // Refresh staff list
        const refreshResponse = await userAPI.getUsers({ pageIndex: 1, pageSize: 50, role: 3 })
        if (refreshResponse?.Data) {
          const items = refreshResponse.Data.Items || refreshResponse.Data || []
          setStaffList(Array.isArray(items) ? items : [])
        }
      } else {
        toast.error(response?.Message || t('errors.somethingWentWrong'))
      }
    } catch (error) {
      console.error('Staff registration error:', error)
      toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-heading">{t('admin.addStaff')}</h2>
        <p className="text-text-muted mt-1">{t('admin.registerTeamMembers')}</p>
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            {t('admin.registerNewStaff')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label={t('settings.fullName')}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="John Doe"
              />

              <Input
                label={t('settings.emailAddress')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="staff@nafs.com"
              />

              <Input
                label={t('common.password')}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder={t('admin.minChars')}
              />

              <Input
                label={t('admin.phoneOptional')}
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+20 xxx xxxx xxx"
              />
            </div>

            <SelectDropdown
              label={t('admin.permissionLevel')}
              value={formData.permissions}
              onChange={(val) => setFormData(prev => ({ ...prev, permissions: val }))}
              error={errors.permissions}
              options={permissionLevels.map(level => ({ value: level.value, label: level.label }))}
            />

            {/* Permission Description */}
            {formData.permissions && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-sm text-primary">
                  <strong>{permissionLevels.find(p => p.value === formData.permissions)?.label}:</strong>{' '}
                  {permissionLevels.find(p => p.value === formData.permissions)?.description}
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('admin.registering')}</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('admin.registerStaffMember')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.currentStaffMembers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('admin.noStaffMembers')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('common.email')}</TableHead>
                  <TableHead>{t('common.phone')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((member) => (
                  <TableRow key={member.Id || member.Email}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-secondary">
                            {(member.Name || member.UserName || 'S').charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-text-heading">{member.Name || member.UserName || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-text-muted" />
                        <span>{member.Email || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted">{member.PhoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={member.IsActive !== false ? 'success' : 'danger'}>
                        {member.IsActive !== false ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> {t('common.active')}</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> {t('common.inactive')}</>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
        <p className="text-sm text-primary">
          <strong>{t('common.notes')}:</strong> {t('admin.staffNote')}
        </p>
      </div>
    </div>
  )
}
