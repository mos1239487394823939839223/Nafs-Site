import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useToast } from '../../components/ui/Toast'
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'
import LocalDocumentsManager from '../../components/shared/LocalDocumentsManager'
import { userAPI } from '../../lib/api'
import { Lock } from '@mui/icons-material'
import Button from '../../components/ui/Button'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const { t, isRTL } = useLanguage()
  const toast = useToast()

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const doctorDocumentsStorageKey = useMemo(() => {
    const userId = userAPI.resolveUserId(user) || 'doctor-current'
    return `nafs:doctor:documents:${userId}`
  }, [user])

  const handleSave = async (data) => {
    try {
      const response = await userAPI.editMainInfo({
        name: data.name,
        phoneNumber: data.phone,
        email: data.email,
      })

      if (response?.IsSuccess !== false) {
        updateProfile(data)
        toast.success(t('success.settingsSaved', 'Settings saved successfully'))
      } else {
        toast.error(response?.Message || t('errors.unexpectedError', 'Failed to save settings'))
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error(error.response?.data?.Message || t('errors.unexpectedError', 'Failed to save settings'))
    }
  }

  const handleImageUpload = async (file) => {
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1]
          const response = await userAPI.updateCurrentUserImage(user, base64)
          if (response?.IsSuccess !== false) {
            updateProfile({ image: response.Data || reader.result })
            toast.success(t('success.photoUpdated', 'Profile photo updated'))
          } else {
            toast.error(response?.Message || t('errors.unexpectedError', 'Failed to update photo'))
          }
        } catch (error) {
          toast.error(error?.response?.data?.Message || t('errors.unexpectedError', 'Failed to update photo'))
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(t('errors.unexpectedError', 'Failed to upload image'))
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t('errors.fillPasswordFields', 'Please fill in all password fields'))
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t('errors.passwordTooShort', 'New password must be at least 6 characters'))
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.passwordMismatch', 'Passwords do not match'))
      return
    }

    setPasswordLoading(true)
    try {
      const response = await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (response?.IsSuccess !== false) {
        toast.success(t('success.passwordChanged', 'Password changed successfully'))
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordSection(false)
      } else {
        toast.error(response?.Message || t('errors.unexpectedError', 'Failed to change password'))
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || t('errors.unexpectedError', 'Failed to change password'))
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">{t('settings.profile', 'Profile')}</h1>
          <p className="text-text-muted">{t('settings.manageProfile', 'Manage your personal information.')}</p>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary/50" />

          <div className="p-6 md:p-8">
            <ProfileSettings user={user} onSave={handleSave} onImageUpload={handleImageUpload} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-8 bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <LocalDocumentsManager
              storageKey={doctorDocumentsStorageKey}
              title="Doctor Certificates & Documentation"
              buttonLabel="Add Certificate && docementation"
            />
          </div>
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{t('settings.changePassword', 'Change Password')}</h3>
                  <p className="text-sm text-text-muted">{t('settings.updateAccountPassword', 'Update your account password')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? t('common.cancel', 'Cancel') : t('common.change', 'Change')}
              </Button>
            </div>

            {showPasswordSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-border"
              >
                {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      {field === 'currentPassword' ? t('auth.currentPassword', 'Current Password') : field === 'newPassword' ? t('auth.newPassword', 'New Password') : t('auth.confirmNewPassword', 'Confirm New Password')}
                    </label>
                    <input
                      type="password"
                      value={passwordData[field]}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
                      dir="ltr"
                      placeholder="••••••••"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={passwordLoading}>
                    {passwordLoading ? t('common.updating', 'Updating...') : t('settings.updatePassword', 'Update Password')}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
