import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'
import { userAPI } from '../../lib/api'
import { Lock } from '@mui/icons-material'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

export default function StaffProfile() {
    const { user, updateProfile } = useAuth()
    const toast = useToast()
    const { t } = useLanguage()

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
                toast.success(t('success.infoUpdated'))
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            console.error('Save settings error:', error)
            toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
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
                        toast.success(t('success.imageUpdated'))
                    } else {
                        toast.error(response?.Message || t('errors.somethingWentWrong'))
                    }
                } catch (error) {
                    toast.error(error?.response?.data?.Message || t('errors.somethingWentWrong'))
                }
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Image upload error:', error)
            toast.error(t('errors.somethingWentWrong'))
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('errors.passwordMismatch'))
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error(t('errors.passwordTooShort'))
            return
        }
        setPasswordLoading(true)
        try {
            const response = await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
            if (response?.IsSuccess !== false) {
                toast.success(t('success.passwordChanged'))
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setShowPasswordSection(false)
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            console.error('Password change error:', error)
            toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-heading mb-2">{t('staff.staffProfile')}</h1>
                    <p className="text-text-muted">{t('staff.manageSupport')}</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
                >
                    <div className="h-1.5 w-full bg-gradient-to-r from-secondary to-primary" />
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
                                    <h3 className="font-semibold text-text">{t('settings.changePassword')}</h3>
                                    <p className="text-sm text-text-muted">{t('settings.updateAccountPassword')}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordSection(!showPasswordSection)}
                            >
                                {showPasswordSection ? t('common.cancel') : t('settings.change')}
                            </Button>
                        </div>

                        {showPasswordSection && (
                            <form onSubmit={handlePasswordChange} className="space-y-4 mt-6 pt-6 border-t border-border">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">{t('auth.currentPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-text focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">{t('auth.newPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-text focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">{t('auth.confirmNewPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-text focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={passwordLoading} className="w-full">
                                    {passwordLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {t('common.updating')}
                                        </div>
                                    ) : t('settings.updatePassword')}
                                </Button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
