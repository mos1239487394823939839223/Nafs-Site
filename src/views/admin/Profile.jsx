import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { userAPI } from '../../lib/api'
import { PhotoCamera as Camera, Person as User, Mail, Phone, Lock, Sync as Loader2 } from '@mui/icons-material'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'

export default function AdminProfile() {
    const { user, updateProfile } = useAuth()
    const toast = useToast()
    const { t } = useLanguage()

    const [formData, setFormData] = useState({
        name: user?.name || user?.Name || '',
        email: user?.email || user?.Email || '',
        phone: user?.phone || user?.PhoneNumber || '',
    })
    const [avatar, setAvatar] = useState(user?.image || user?.Image || null)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

    // Change password state
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordLoading, setPasswordLoading] = useState(false)

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatar(URL.createObjectURL(file))
            setUploadingImage(true)
            try {
                const reader = new FileReader()
                reader.onload = async () => {
                    const base64 = reader.result.split(',')[1]
                    const response = await userAPI.updateImage(user?.ID || user?.id, base64)
                    if (response?.IsSuccess !== false) {
                        updateProfile({ image: response.Data || reader.result })
                        toast.success(t('success.photoUpdated'))
                    } else {
                        toast.error(response?.Message || t('errors.somethingWentWrong'))
                    }
                    setUploadingImage(false)
                }
                reader.readAsDataURL(file)
            } catch (error) {
                toast.error(t('errors.somethingWentWrong'))
                setUploadingImage(false)
            }
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

            if (response?.IsSuccess !== false) {
                updateProfile(formData)
                toast.success(t('success.profileUpdated'))
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error(t('errors.fillPasswordFields'))
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error(t('errors.passwordTooShort'))
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('errors.passwordMismatch'))
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
            toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-heading mb-2">{t('admin.adminProfile')}</h1>
                    <p className="text-text-muted">{t('admin.manageAccount')}</p>
                </div>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
                >
                    {/* Decorative Top Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-sage-light" />

                    <div className="p-6 md:p-8 space-y-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background-gray/30 rounded-2xl border border-dashed border-border">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-primary/5">
                                    {uploadingImage ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    ) : avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-primary">{formData.name.charAt(0)}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <label className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-transform hover:scale-105 shadow-lg">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div className="text-center md:text-left space-y-2">
                                <h3 className="text-lg font-semibold text-text">{t('settings.profilePhoto')}</h3>
                                <p className="text-sm text-text-light max-w-xs">
                                    {t('admin.uploadProfessionalPhoto')}
                                </p>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
                            <div className="md:col-span-2 pb-2 border-b border-border-light mb-2">
                                <h3 className="font-semibold text-text">{t('settings.personalInformation')}</h3>
                            </div>

                            <Input
                                label={t('common.fullName')}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                icon={User}
                                className="bg-background-gray/20"
                            />
                            <Input
                                label={t('common.emailAddress')}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                icon={Mail}
                                className="bg-background-gray/50"
                                disabled
                            />
                            <Input
                                label={t('common.phoneNumber')}
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                icon={Phone}
                                className="bg-background-gray/20"
                            />
                        </div>

                        <div className="flex justify-end pt-6">
                            <Button size="lg" className="w-full md:w-auto px-8" onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('common.saving')}
                                    </div>
                                ) : t('common.save')}
                            </Button>
                        </div>
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
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 pt-4 border-t border-border"
                            >
                                {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-text-muted mb-2">
                                            {field === 'currentPassword' ? t('auth.currentPassword') : field === 'newPassword' ? t('auth.newPassword') : t('auth.confirmNewPassword')}
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
                                        {passwordLoading ? t('common.updating') : t('settings.updatePassword')}
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
