import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'
import { userAPI } from '../../lib/api'
import { Lock } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleSave = async (data) => {
    try {
      const response = await userAPI.editMainInfo({
        name: data.name,
        phoneNumber: data.phone,
        email: data.email,
      })

      if (response?.IsSuccess !== false) {
        updateProfile(data)
        toast.success('Settings saved successfully')
      } else {
        toast.error(response?.Message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error(error.response?.data?.Message || 'Failed to save settings')
    }
  }

  const handleImageUpload = async (file) => {
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]
        const response = await userAPI.updateImage(user?.ID || user?.id, base64)
        if (response?.IsSuccess !== false) {
          updateProfile({ image: response.Data || reader.result })
          toast.success('Profile photo updated')
        } else {
          toast.error(response?.Message || 'Failed to update photo')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const response = await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (response?.IsSuccess !== false) {
        toast.success('Password changed successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordSection(false)
      } else {
        toast.error(response?.Message || 'Failed to change password')
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Profile</h1>
          <p className="text-text-muted">Manage your personal information.</p>
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
                  <h3 className="font-semibold text-text">Change Password</h3>
                  <p className="text-sm text-text-muted">Update your account password</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? 'Cancel' : 'Change'}
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
                      {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordData[field]}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
                      placeholder="••••••••"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update Password'}
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
