import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { userAPI, filesAPI, extractErrorMessage } from '../../lib/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ProfileHero from '../../components/shared/ProfileHero'
import { Camera, User, Mail, Phone, Lock, Loader2, Pencil as Edit, X, Headphones as SupportAgent, CheckCircle as CheckCircle2, ShieldCheck as VerifiedUser } from 'lucide-react'

export default function StaffProfile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const { t, isRTL } = useLanguage()

  const tx = (key, fallback) => {
    const value = t(key)
    return value && value !== key ? value : fallback
  }

  const [formData, setFormData] = useState({
    name: user?.name || user?.Name || '',
    email: user?.email || user?.Email || '',
    phone: user?.phone || user?.PhoneNumber || '',
  })

  const [avatar, setAvatar] = useState(user?.image || user?.Image || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    setAvatar(user?.image || user?.Image || null)
    setFormData({
      name: user?.name || user?.Name || '',
      email: user?.email || user?.Email || '',
      phone: user?.phone || user?.PhoneNumber || '',
    })
  }, [user])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatar(URL.createObjectURL(file))
    setUploadingImage(true)

    try {
      const uploadResponse = await filesAPI.uploadFile(file)
      const imageUrl = uploadResponse?.Data?.PublicUrl || uploadResponse?.Data

      if (!imageUrl) {
        toast.error(tx('errors.somethingWentWrong', 'Something went wrong'))
        return
      }

      const response = await userAPI.updateCurrentUserImage(user, imageUrl)
      if (response?.IsSuccess === true) {
        setAvatar(imageUrl)
        updateProfile({ image: imageUrl })
        toast.success(tx('success.photoUpdated', 'Profile photo updated'))
      } else {
        toast.error(response?.Message || tx('errors.somethingWentWrong', 'Something went wrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, tx('errors.somethingWentWrong', 'Something went wrong')))
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
        updateProfile({ name: formData.name, email: formData.email, phone: formData.phone })
        toast.success(tx('success.profileUpdated', 'Profile updated successfully'))
        setEditModalOpen(false)
      } else {
        toast.error(response?.Message || tx('errors.somethingWentWrong', 'Something went wrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, tx('errors.somethingWentWrong', 'Something went wrong')))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(tx('errors.fillPasswordFields', 'Please fill in all password fields'))
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(tx('errors.passwordTooShort', 'New password must be at least 6 characters'))
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(tx('errors.passwordMismatch', 'Passwords do not match'))
      return
    }

    setPasswordLoading(true)
    try {
      const response = await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (response?.IsSuccess === true) {
        toast.success(tx('success.passwordChanged', 'Password changed successfully'))
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setPasswordModalOpen(false)
      } else {
        toast.error(response?.Message || tx('errors.somethingWentWrong', 'Something went wrong'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, tx('errors.somethingWentWrong', 'Something went wrong')))
    } finally {
      setPasswordLoading(false)
    }
  }

  const displayName = formData.name || tx('staff.staff', 'Staff')
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ProfileHero
        avatar={avatar}
        uploadingImage={uploadingImage}
        initials={initials}
        displayName={displayName}
        email={formData.email || '-'}
        onAvatarChange={handleFileChange}
        patternId="staff-grid"
        badges={[
          { icon: SupportAgent, label: tx('staff.staffProfile', 'Support Staff'), tone: 'primary' },
          { icon: VerifiedUser, label: tx('common.active', 'Active'), tone: 'emerald' },
          { label: tx('common.online', 'Online'), tone: 'emerald', pulse: true },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)} className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="whitespace-nowrap">{tx('settings.changePassword', 'Change Password')}</span>
            </Button>
            <Button size="sm" onClick={() => setEditModalOpen(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span className="whitespace-nowrap">{tx('admin.editDetails', 'Edit Details')}</span>
            </Button>
          </>
        }
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-6 border-b border-border">
          {[
            { label: tx('admin.role', 'Role'), value: tx('staff.staffProfile', 'Support Staff') },
            { label: tx('common.phoneNumber', 'Phone'), value: formData.phone || '-' },
            { label: tx('common.emailAddress', 'Email'), value: formData.email || '-' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-4 rounded-2xl bg-background-paper border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <p className="text-lg md:text-xl font-bold text-text-heading truncate">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="py-6 grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-background-paper rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="font-semibold text-text-heading mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {tx('settings.personalInformation', 'Personal Information')}
            </h3>
            <div className="space-y-3">
              <InfoRow icon={User} label={tx('common.fullName', 'Full Name')} value={displayName} />
              <InfoRow icon={Mail} label={tx('common.emailAddress', 'Email')} value={formData.email || '-'} />
              <InfoRow icon={Phone} label={tx('common.phoneNumber', 'Phone')} value={formData.phone || '-'} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-background-paper rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="font-semibold text-text-heading mb-4 flex items-center gap-2">
              <SupportAgent className="w-4 h-4 text-primary" />
              {tx('staff.supportProfile', 'Support Profile')}
            </h3>
            <div className="space-y-3">
              <InfoRow icon={VerifiedUser} label={tx('admin.accountStatus', 'Status')} value={tx('common.active', 'Active')} valueClass="text-emerald-500" />
              <InfoRow icon={SupportAgent} label={tx('staff.department', 'Department')} value={tx('staff.customerServiceHub', 'Customer Service')} />
              <InfoRow icon={Lock} label={tx('settings.security', 'Security')} value={tx('settings.passwordManaged', 'Password managed securely')} />
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
            >
              <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Edit className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-heading">{tx('admin.editDetails', 'Edit Details')}</h2>
                    <p className="text-xs text-text-muted">{tx('admin.updateYourInfo', 'Update your personal information')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  label={tx('common.fullName', 'Full Name')}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  icon={User}
                />
                <Input
                  label={tx('common.emailAddress', 'Email Address')}
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  icon={Mail}
                  disabled
                />
                <Input
                  label={tx('common.phoneNumber', 'Phone Number')}
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  icon={Phone}
                />
              </div>

              <div className="px-6 pb-6 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                  {tx('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={handleSave} isLoading={saving} className="px-6">
                  {!saving && <CheckCircle2 className="w-4 h-4" />}
                  {saving ? tx('common.saving', 'Saving...') : tx('common.saveChanges', 'Save Changes')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPasswordModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
            >
              <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-heading">{tx('settings.changePassword', 'Change Password')}</h2>
                    <p className="text-xs text-text-muted">{tx('settings.updateAccountPassword', 'Update your account password')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPasswordModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  label={tx('auth.currentPassword', 'Current Password')}
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  icon={Lock}
                />
                <Input
                  label={tx('auth.newPassword', 'New Password')}
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  icon={Lock}
                />
                <Input
                  label={tx('auth.confirmNewPassword', 'Confirm New Password')}
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  icon={Lock}
                />
              </div>

              <div className="px-6 pb-6 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>
                  {tx('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={handleChangePassword} disabled={passwordLoading} className="px-6">
                  {passwordLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tx('common.updating', 'Updating...')}
                    </span>
                  ) : (
                    tx('settings.updatePassword', 'Update Password')
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, valueClass = '' }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background-subtle px-3 py-2.5">
      <p className="text-[11px] text-text-muted flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <p className={`text-sm font-medium text-text-heading break-words ${valueClass}`}>{value}</p>
    </div>
  )
}
