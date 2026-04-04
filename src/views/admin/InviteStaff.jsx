import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { validateEmail } from '../../lib/validation'
import {
  Mail,
  CheckCircle,
  Cancel as XCircle,
  Sync as Loader2,
  PersonAdd as UserPlus,
  PersonOutline,
  LockOutlined,
  PhoneOutlined,
  SupervisorAccount,
  Groups,
  WorkspacePremium,
  SupportAgent,
  Close,
  Search,
  Refresh,
  Shield,
  AdminPanelSettings,
} from '@mui/icons-material'
import { authAPI, userAPI, extractErrorMessage } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

// ── Add Staff Modal ──────────────────────────────────────────────────────────
function AddStaffModal({ open, onClose, onSuccess, t }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1 = basic info, 2 = permissions
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    permissions: 'support-agent',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const permissionLevels = [
    {
      value: 'support-agent',
      label: t('admin.supportAgent'),
      description: t('admin.supportAgentDesc'),
      icon: SupportAgent,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/10 border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      value: 'manager',
      label: t('admin.manager'),
      description: t('admin.managerDesc'),
      icon: AdminPanelSettings,
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-500/10 border-violet-500/30',
      textColor: 'text-violet-400',
    },
  ]

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', phoneNumber: '', permissions: 'support-agent' })
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
        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0f1a14] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow accents */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-secondary/15 blur-3xl" />

          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('admin.addStaff')}</h2>
                  <p className="text-xs text-white/40">
                    {step === 1 ? t('admin.basicInfoStep') || 'Basic information' : t('admin.permissionsStep') || 'Set permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Close className="h-4 w-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="mt-5 flex gap-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="relative px-6 pb-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/70">
                      {t('settings.fullName')} <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <PersonOutline className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ahmed Mohamed"
                        className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-2 focus:ring-primary/50 ${
                          errors.name ? 'border-red-500/60' : 'border-white/10 focus:border-primary/50'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/70">
                      {t('settings.emailAddress')} <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="staff@nafs.com"
                        className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-2 focus:ring-primary/50 ${
                          errors.email ? 'border-red-500/60' : 'border-white/10 focus:border-primary/50'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/70">
                      {t('common.password')} <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <LockOutlined className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-2 focus:ring-primary/50 ${
                          errors.password ? 'border-red-500/60' : 'border-white/10 focus:border-primary/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/70">
                      {t('admin.phoneOptional')}
                    </label>
                    <div className="relative">
                      <PhoneOutlined className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+20 1xx xxx xxxx"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:shadow-primary/30 active:scale-[0.98]"
                  >
                    {t('common.next')} →
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-white/50">{t('admin.permissionLevel')}</p>

                  {permissionLevels.map((level) => {
                    const Icon = level.icon
                    const selected = formData.permissions === level.value
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, permissions: level.value }))}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? `border-primary/60 bg-primary/10`
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${level.color} shadow-md`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-white">{level.label}</span>
                              {selected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs leading-relaxed text-white/45">{level.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {/* Summary */}
                  <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-xs text-white/40">
                    <p className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary/70" />
                      <span>
                        <span className="font-semibold text-white/60">{formData.name || '—'}</span>
                        {' '}·{' '}
                        {formData.email || '—'}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
                    >
                      ← {t('common.back')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('admin.registering')}
                        </span>
                      ) : (
                        t('admin.registerStaffMember')
                      )}
                    </button>
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

  // Avatar color based on initials
  const avatarColors = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-blue-500 to-cyan-600',
    'from-rose-500 to-pink-600',
  ]
  const getAvatarColor = (name = '') => {
    const index = name.charCodeAt(0) % avatarColors.length
    return avatarColors[index] || avatarColors[0]
  }

  return (
    <div className="min-h-screen space-y-8 p-2 md:p-0">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1f16] via-[#0f2018] to-[#091510] border border-white/8 px-8 py-10">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-12 h-32 w-32 -translate-y-1/2 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <SupervisorAccount className="h-3.5 w-3.5" />
              {t('admin.addStaff')}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t('admin.currentStaffMembers')}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/45">
              {t('admin.registerTeamMembers')}
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <Groups className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{staffList.length}</p>
                <p className="text-[11px] text-white/40">{t('common.total') || 'Total'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-400">{activeCount}</p>
                <p className="text-[11px] text-emerald-400/60">{t('common.active')}</p>
              </div>
            </div>
            {inactiveCount > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-red-400">{inactiveCount}</p>
                  <p className="text-[11px] text-red-400/60">{t('common.inactive')}</p>
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder={t('common.search') || 'Search staff…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStaff}
            disabled={fetchLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
          >
            <Refresh className={`h-4 w-4 ${fetchLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="add-staff-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-primary/40 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            {t('admin.addStaff')}
          </button>
        </div>
      </div>

      {/* ── Staff Table ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f1a14] shadow-2xl backdrop-blur-sm">
        {fetchLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-white/30">Loading team…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Groups className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-lg font-semibold text-white/40">
              {searchQuery ? 'No results found' : t('admin.noStaffMembers')}
            </p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 border-r border-white/5 last:border-0">
                    {t('common.name')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 border-r border-white/5 last:border-0">
                    {t('common.email')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 border-r border-white/5 last:border-0">
                    {t('common.phone')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 border-r border-white/5 last:border-0 text-center">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 text-center">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((member, idx) => {
                  const name = member.Name || member.UserName || 'Staff'
                  const initial = name.charAt(0).toUpperCase()
                  const isActive = member.IsActive !== false
                  const colorClass = getAvatarColor(name)

                  return (
                    <motion.tr
                      key={member.Id || member.Email}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group transition-colors hover:bg-white/3"
                    >
                      <td className="px-6 py-4 border-r border-white/5 last:border-0 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} shadow-lg transition-transform group-hover:scale-110`}>
                            <span className="text-sm font-bold text-white tracking-widest">{initial}</span>
                            <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f1a14] ${isActive ? 'bg-emerald-400' : 'bg-white/20'}`} />
                          </div>
                          <span className="font-semibold text-white group-hover:text-primary transition-colors text-sm">
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 last:border-0 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Mail className="h-3.5 w-3.5 text-white/20" />
                          {member.Email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 last:border-0 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <PhoneOutlined className="h-3.5 w-3.5 text-white/20" />
                          {member.PhoneNumber || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-white/5 last:border-0 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/5 text-white/30 border border-white/5'
                        }`}>
                          {isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
                          Staff
                        </span>
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
