import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { userAPI, filesAPI, extractErrorMessage } from '../../lib/api'
import {
  Camera, User, Mail, Phone, Lock, Loader2,
  Pencil as Edit, X, ShieldCheck, CheckCircle2,
  BadgeCheck, Sparkles, Copy, ExternalLink,
  ChevronRight, KeyRound, Settings2, Activity,
  Eye, EyeOff,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
})

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, valueClass = '', copyable = false }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    if (!value || value === '—') return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0 group">
      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-200">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold text-text-heading truncate mt-0.5 ${valueClass}`}>{value || '—'}</p>
      </div>
      {copyable && value && value !== '—' && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-background-subtle text-text-muted hover:text-primary"
        >
          {copied
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            : <Copy className="w-3.5 h-3.5" />
          }
        </button>
      )}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, index }) {
  return (
    <motion.div
      {...fadeUp(0.1 + index * 0.07)}
      className="bg-background-paper border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-base font-bold text-text-heading truncate mt-0.5">{value || '—'}</p>
      </div>
    </motion.div>
  )
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, delay = 0, action }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-background-paper border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-subtle/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-text-heading text-sm">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

// ─── Profile Completion ───────────────────────────────────────────────────────
function ProfileCompletion({ fields }) {
  const filled = fields.filter(f => f.done).length
  const pct = Math.round((filled / fields.length) * 100)
  const { t } = useLanguage()
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-text-heading">{pct}%</p>
          <p className="text-xs text-text-muted mt-0.5">{t('profile.completionLabel', 'Profile Completion')}</p>
        </div>
        {pct === 100 && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" />
            {t('profile.complete', 'Complete')}
          </span>
        )}
      </div>
      {/* Bar */}
      <div className="h-2.5 bg-background-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
        />
      </div>
      {/* Checklist */}
      <div className="space-y-2 pt-1">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.done ? 'bg-primary text-white' : 'border-2 border-border'}`}>
              {f.done && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span className={f.done ? 'text-text-heading font-medium' : 'text-text-muted'}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-semibold group hover:shadow-sm ${
        danger
          ? 'border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300'
          : 'border-border text-text-heading hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
        danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-background-subtle group-hover:bg-primary/10'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-start">{label}</span>
      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
    </button>
  )
}

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ open, onClose, onSave, loading, t }) {
  const [data, setData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ current: false, newP: false, confirm: false })
  const reset = () => setData({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => { if (!open) reset() }, [open])

  const handleSave = () => onSave(data)

  const fields = [
    { key: 'currentPassword', label: t('auth.currentPassword', 'Current Password'), showKey: 'current' },
    { key: 'newPassword', label: t('auth.newPassword', 'New Password'), showKey: 'newP' },
    { key: 'confirmPassword', label: t('auth.confirmNewPassword', 'Confirm New Password'), showKey: 'confirm' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
          >
            <div className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/8 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-heading">{t('settings.changePassword', 'Change Password')}</h2>
                  <p className="text-xs text-text-muted">{t('settings.updateAccountPassword', 'Update your account password')}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {fields.map(({ key, label, showKey }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-text-muted mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={show[showKey] ? 'text' : 'password'}
                      value={data[key]}
                      onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 pe-10 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-text transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                    >
                      {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-border pt-4">
              <Button variant="ghost" onClick={onClose}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleSave} isLoading={loading} className="gap-2 px-6">
                {!loading && <KeyRound className="w-4 h-4" />}
                {loading ? t('common.updating', 'Updating...') : t('settings.updatePassword', 'Update Password')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ open, onClose, formData, onChange, onSave, saving, t }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
          >
            <div className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/8 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-heading">{t('admin.editDetails', 'Edit Details')}</h2>
                  <p className="text-xs text-text-muted">{t('admin.updateYourInfo', 'Update your personal information')}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label={t('common.fullName', 'Full Name')}
                value={formData.name}
                onChange={e => onChange('name', e.target.value)}
                icon={User}
              />
              <Input
                label={t('common.emailAddress', 'Email Address')}
                value={formData.email}
                onChange={e => onChange('email', e.target.value)}
                icon={Mail}
                disabled
              />
              <Input
                label={t('common.phoneNumber', 'Phone Number')}
                value={formData.phone}
                onChange={e => onChange('phone', e.target.value)}
                icon={Phone}
              />
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-border pt-4">
              <Button variant="ghost" onClick={onClose}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={onSave} isLoading={saving} className="gap-2 px-6">
                {!saving && <CheckCircle2 className="w-4 h-4" />}
                {saving ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminProfile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const { t, isRTL } = useLanguage()

  const [formData, setFormData] = useState({
    name: user?.name || user?.Name || '',
    email: user?.email || user?.Email || '',
    phone: user?.phone || user?.PhoneNumber || '',
  })
  const [avatar, setAvatar] = useState(user?.image || user?.Image || null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  useEffect(() => {
    const img = user?.image || user?.Image || null
    if (img) setAvatar(img)
  }, [user?.image, user?.Image])

  useEffect(() => {
    setFormData({
      name: user?.name || user?.Name || '',
      email: user?.email || user?.Email || '',
      phone: user?.phone || user?.PhoneNumber || '',
    })
  }, [user])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatar(URL.createObjectURL(file))
    setUploadingImage(true)
    try {
      const uploadResponse = await filesAPI.uploadFile(file)
      const imageUrl = uploadResponse?.Data?.PublicUrl || uploadResponse?.Data
      if (!imageUrl) { toast.error(t('errors.somethingWentWrong')); setUploadingImage(false); return }
      const response = await userAPI.updateCurrentUserImage(user, imageUrl)
      if (response?.IsSuccess === true) {
        setAvatar(imageUrl)
        updateProfile({ image: imageUrl })
        toast.success(t('success.photoUpdated'))
      } else {
        toast.error(response?.Message || t('errors.somethingWentWrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await userAPI.editMainInfo({
        name: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
      })
      if (response?.IsSuccess === true) {
        updateProfile(formData)
        toast.success(t('success.profileUpdated'))
        setEditModalOpen(false)
      } else {
        toast.error(response?.Message || t('errors.somethingWentWrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (passwordData) => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t('errors.fillPasswordFields')); return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t('errors.passwordTooShort')); return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.passwordMismatch')); return
    }
    try {
      const response = await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (response?.IsSuccess === true) {
        toast.success(t('success.passwordChanged'))
        setPasswordModalOpen(false)
      } else {
        toast.error(response?.Message || t('errors.somethingWentWrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
    }
  }

  const displayName = formData.name || user?.name || user?.Name || 'Admin'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Profile completion fields
  const completionFields = useMemo(() => [
    { label: t('common.fullName', 'Full Name'), done: !!formData.name },
    { label: t('common.emailAddress', 'Email'), done: !!formData.email },
    { label: t('common.phoneNumber', 'Phone'), done: !!formData.phone },
    { label: t('profile.profilePhoto', 'Profile Photo'), done: !!avatar },
  ], [formData, avatar, t])

  const stats = useMemo(() => [
    { label: t('admin.role', 'Role'), value: t('admin.roleName', 'Administrator'), icon: ShieldCheck },
    { label: t('common.phoneNumber', 'Phone'), value: formData.phone, icon: Phone },
    { label: t('admin.accountStatus', 'Account Status'), value: t('common.active', 'Active'), icon: Activity },
    { label: t('profile.accountType', 'Account Type'), value: t('admin.adminAccount', 'Admin Account'), icon: BadgeCheck },
  ], [formData.phone, t])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background">

      {/* ─── Hero Cover ─────────────────────────────────────────────────────── */}
      <div className="relative h-52 sm:h-64 md:h-72 w-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-primary/60" />
        {/* Decorative shapes */}
        <div className="absolute -top-10 -start-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 end-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-8 end-8 w-32 h-32 bg-white/8 rounded-full blur-2xl" />
        {/* Dot grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        {/* Sparkle badge top-right */}
        <div className="absolute top-5 end-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-bold">{t('admin.adminDashboard', 'Admin Dashboard')}</span>
        </div>
      </div>

      {/* ─── Profile Identity Row ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="relative -mt-20 sm:-mt-24 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">

            {/* Avatar */}
            <div className="flex justify-center sm:justify-start">
              <div className="relative group flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl border-4 border-background-paper shadow-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/20">
                  {uploadingImage
                    ? <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    : avatar
                      ? <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                      : <span className="text-4xl font-black text-primary">{initials}</span>
                  }
                </div>
                {/* Upload overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-white text-[10px] font-bold">{t('profile.changePhoto', 'Change')}</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                {/* Online status dot */}
                <div className="absolute -bottom-1 -end-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-background-paper shadow-sm" title="Online" />
              </div>
            </div>

            {/* Name + meta + actions */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 min-w-0">
              <div className="text-center sm:text-start min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black text-text-heading leading-tight">{displayName}</h1>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <BadgeCheck className="w-3 h-3" />
                    {t('admin.verified', 'Verified')}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-text-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    {t('admin.roleName', 'Administrator')}
                  </span>
                  {formData.email && (
                    <span className="flex items-center gap-1.5 text-sm text-text-muted">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      {formData.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {t('common.online', 'Online')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap pb-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordModalOpen(true)}
                  className="flex items-center gap-2 !rounded-xl"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('settings.changePassword', 'Change Password')}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-2 !rounded-xl shadow-md shadow-primary/20"
                >
                  <Edit className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('admin.editDetails', 'Edit Details')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={i} index={i} {...s} />)}
        </div>

        {/* ─── Main Content Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">

          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <SectionCard
              title={t('settings.personalInformation', 'Personal Information')}
              icon={User}
              delay={0.1}
              action={
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {t('common.edit', 'Edit')}
                </button>
              }
            >
              <div className="space-y-0">
                <InfoRow icon={User} label={t('common.fullName', 'Full Name')} value={displayName} copyable />
                <InfoRow icon={Mail} label={t('common.emailAddress', 'Email Address')} value={formData.email} copyable />
                <InfoRow icon={Phone} label={t('common.phoneNumber', 'Phone Number')} value={formData.phone} copyable />
              </div>
            </SectionCard>

            {/* Account Info */}
            <SectionCard
              title={t('admin.accountInfo', 'Account Information')}
              icon={ShieldCheck}
              delay={0.15}
            >
              <div className="space-y-0">
                <InfoRow
                  icon={ShieldCheck}
                  label={t('admin.role', 'Role')}
                  value={t('admin.roleName', 'Administrator')}
                />
                <InfoRow
                  icon={Activity}
                  label={t('admin.accountStatus', 'Account Status')}
                  value={t('common.active', 'Active')}
                  valueClass="text-emerald-500"
                />
                <InfoRow
                  icon={BadgeCheck}
                  label={t('profile.accountType', 'Account Type')}
                  value={t('admin.adminAccount', 'Admin Account')}
                />
                <InfoRow
                  icon={Lock}
                  label={t('settings.changePassword', 'Password')}
                  value="••••••••••"
                />
              </div>
            </SectionCard>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">

            {/* Profile Completion */}
            <SectionCard
              title={t('profile.completionTitle', 'Profile Completion')}
              icon={Sparkles}
              delay={0.2}
            >
              <ProfileCompletion fields={completionFields} />
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard
              title={t('profile.quickActions', 'Quick Actions')}
              icon={Settings2}
              delay={0.25}
            >
              <div className="space-y-2">
                <QuickAction
                  icon={Edit}
                  label={t('admin.editDetails', 'Edit Details')}
                  onClick={() => setEditModalOpen(true)}
                />
                <QuickAction
                  icon={KeyRound}
                  label={t('settings.changePassword', 'Change Password')}
                  onClick={() => setPasswordModalOpen(true)}
                />
                <QuickAction
                  icon={ExternalLink}
                  label={t('profile.viewPublicProfile', 'View Public Profile')}
                  onClick={() => {}}
                />
              </div>
            </SectionCard>

          </div>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      <EditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        formData={formData}
        onChange={handleChange}
        onSave={handleSave}
        saving={saving}
        t={t}
      />

      <PasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={handleChangePassword}
        loading={false}
        t={t}
      />
    </div>
  )
}
