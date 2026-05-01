import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { validateEmail } from '../../lib/validation'
import { Mail, CheckCircle, XCircle, Loader2, UserPlus, User, Lock, Phone, UserCog, Users, Award, Headphones, X, Search, RefreshCw, Shield, ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { authAPI, userAPI, extractErrorMessage } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

// ── Add Staff Modal ──────────────────────────────────────────────────────────
function AddStaffModal({ open, onClose, onSuccess, t }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    permissions: 'support-agent',
    isBullyingSpecialist: false,
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const permissionLevels = [
    {
      value: 'support-agent',
      label: t('admin.supportAgent'),
      description: t('admin.supportAgentDesc'),
      icon: Headphones,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      value: 'manager',
      label: t('admin.manager'),
      description: t('admin.managerDesc'),
      icon: ShieldCheck,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
  ]

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', phoneNumber: '', permissions: 'support-agent', isBullyingSpecialist: false })
    setErrors({})
    setStep(1)
    setShowPassword(false)
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = t('errors.required')
    if (!validateEmail(formData.email)) newErrors.email = t('errors.invalidEmail')
    if (!formData.password || formData.password.length < 6) newErrors.password = t('errors.passwordTooShort')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const registerData = {
        Name: formData.name,
        Email: formData.email,
        Password: formData.password,
        PhoneNumber: formData.phoneNumber || null,
        Gender: 0,
        Birthday: '2000-01-01',
        Role: 3,
        IsBullyingSpecialist: formData.isBullyingSpecialist,
      }
      const response = await authAPI.register(registerData)
      if (response?.IsSuccess === true) {
        toast.success(t('success.staffAdded'))
        handleClose()
        onSuccess()
      } else {
        toast.error(response?.Message || t('errors.somethingWentWrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background-paper shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-heading">{t('admin.addStaff')}</h2>
                  <p className="text-xs text-text-muted">
                    {step === 1 ? t('admin.basicInfoStep') || 'Basic information' : t('admin.permissionsStep') || 'Set permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-subtle hover:text-text-heading"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="mt-5 flex gap-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Input
                    label={<>{t('settings.fullName')} <span className="text-red-500">*</span></>}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ahmed Mohamed"
                    icon={User}
                    error={errors.name}
                  />

                  <Input
                    label={<>{t('settings.emailAddress')} <span className="text-red-500">*</span></>}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="staff@nafs.com"
                    icon={Mail}
                    error={errors.email}
                  />

                  <Input
                    label={<>{t('common.password')} <span className="text-red-500">*</span></>}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    icon={Lock}
                    error={errors.password}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.5 }}
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        ),
                      },
                    }}
                  />

                  <Input
                    label={t('admin.phoneOptional')}
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+20 1xx xxx xxxx"
                    icon={Phone}
                  />

                  <Button
                    onClick={handleNext}
                    className="mt-2 w-full"
                  >
                    {t('common.next')} →
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-text-muted">{t('admin.permissionLevel')}</p>

                  {permissionLevels.map((level) => {
                    const Icon = level.icon
                    const selected = formData.permissions === level.value
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, permissions: level.value }))}
                        className={`w-full rounded-xl border-2 p-4 text-start transition-all ${
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background-subtle hover:border-primary/40 hover:bg-primary/3'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${level.iconBg}`}>
                            <Icon className={`h-5 w-5 ${level.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-text-heading">{level.label}</span>
                              {selected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{level.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {/* Bullying Specialist Toggle — only for support agents */}
                  {formData.permissions === 'support-agent' && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isBullyingSpecialist: !prev.isBullyingSpecialist }))}
                    className={`w-full rounded-xl border-2 p-4 text-start transition-all ${
                      formData.isBullyingSpecialist
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-border bg-background-subtle hover:border-orange-300 hover:bg-orange-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        formData.isBullyingSpecialist ? 'bg-orange-100' : 'bg-background-paper'
                      }`}>
                        <ShieldAlert className={`h-5 w-5 ${
                          formData.isBullyingSpecialist ? 'text-orange-600' : 'text-text-muted'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-text-heading">
                            {t('admin.bullyingSpecialist')}
                          </span>
                          <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                            formData.isBullyingSpecialist ? 'bg-orange-500' : 'bg-border'
                          }`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              formData.isBullyingSpecialist ? 'translate-x-[18px]' : 'translate-x-0.5'
                            }`} />
                          </div>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                          {t('admin.bullyingSpecialistDesc')}
                        </p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Summary */}
                  <div className="rounded-xl border border-border bg-background-subtle p-3 text-xs text-text-muted">
                    <p className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span>
                        <span className="font-semibold text-text-heading">{formData.name || '—'}</span>
                        {' · '}
                        {formData.email || '—'}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      ← {t('common.back')}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      isLoading={loading}
                      className="flex-1"
                    >
                      {!loading && t('admin.registerStaffMember')}
                      {loading && t('admin.registering')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function InviteStaff() {
  const { t } = useLanguage()
  const [fetchLoading, setFetchLoading] = useState(true)
  const [staffList, setStaffList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchStaff = async () => {
    try {
      setFetchLoading(true)
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

  useEffect(() => { fetchStaff() }, [])

  const activeCount = staffList.filter(m => m.IsActive !== false).length
  const inactiveCount = staffList.length - activeCount

  const filtered = staffList.filter(m => {
    const q = searchQuery.toLowerCase()
    return (m.Name || m.UserName || '').toLowerCase().includes(q) ||
      (m.Email || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen space-y-6 p-2 md:p-0">
      {/* ── Hero Header ── */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-background-paper p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <UserCog className="h-3.5 w-3.5" />
              {t('admin.addStaff')}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-heading">
              {t('admin.currentStaffMembers')}
            </h1>
            <p className="mt-2 max-w-md text-sm text-text-muted">
              {t('admin.registerTeamMembers')}
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background-paper px-5 py-3 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-heading">{staffList.length}</p>
                <p className="text-[11px] text-text-muted">{t('common.total') || 'Total'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
                <p className="text-[11px] text-emerald-600/70">{t('common.active')}</p>
              </div>
            </div>
            {inactiveCount > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">{inactiveCount}</p>
                  <p className="text-[11px] text-red-600/70">{t('common.inactive')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('common.search') || 'Search staff…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background-subtle py-2.5 ps-10 pe-4 text-sm text-text-heading placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStaff}
            disabled={fetchLoading}
            className="w-10 h-10 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${fetchLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            id="add-staff-btn"
            size="sm"
            onClick={() => setShowModal(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {t('admin.addStaff')}
          </Button>
        </div>
      </div>

      {/* ── Staff Table ── */}
      <div className="rounded-2xl border border-border bg-background-paper shadow-sm overflow-hidden">
        {fetchLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-text-muted">{t('common.loading')}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background-subtle">
              <Users className="h-8 w-8 text-text-muted" />
            </div>
            <p className="text-lg font-semibold text-text-muted">
              {searchQuery ? t('common.noResults', 'No results found') : t('admin.noStaffMembers')}
            </p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-border bg-background-subtle">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                    {t('common.name')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                    {t('common.email')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                    {t('common.phone')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-center">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-center">
                    {t('common.role')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((member, idx) => {
                  const name = member.Name || member.UserName || 'Staff'
                  const isActive = member.IsActive !== false

                  return (
                    <motion.tr
                      key={member.Id || member.Email}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group transition-colors hover:bg-background-subtle"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                            <span className="text-sm font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
                            <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background-paper ${isActive ? 'bg-emerald-400' : 'bg-border'}`} />
                          </div>
                          <span className="font-semibold text-text-heading text-sm">
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Mail className="h-3.5 w-3.5 text-text-muted/50" />
                          {member.Email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Phone className="h-3.5 w-3.5 text-text-muted/50" />
                          {member.PhoneNumber || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Badge variant={isActive ? 'success' : 'default'}>
                          {isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Badge variant="secondary">
                          <Headphones className="h-3 w-3" />
                          {t('admin.supportAgent')}
                        </Badge>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Staff Modal ── */}
      <AddStaffModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchStaff}
        t={t}
      />
    </div>
  )
}
