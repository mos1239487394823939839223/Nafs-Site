import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { userAPI, filesAPI, extractErrorMessage } from '../../lib/api'
import { Camera, User, Mail, Phone, Lock, Loader2, Pencil as Edit, X, ShieldCheck, CheckCircle as CheckCircle2, Calendar } from 'lucide-react'
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
                const uploadResponse = await filesAPI.uploadFile(file)
                const imageUrl = uploadResponse?.Data?.PublicUrl || uploadResponse?.Data
                if (!imageUrl) {
                    toast.error(t('errors.somethingWentWrong'))
                    setUploadingImage(false)
                    return
                }
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
            if (response?.IsSuccess === true) {
                toast.success(t('success.passwordChanged'))
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setPasswordModalOpen(false)
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
        } finally {
            setPasswordLoading(false)
        }
    }

    const displayName = formData.name || user?.name || user?.Name || 'Admin'
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="min-h-screen bg-background">
            {/* ─── Cover Hero ─── */}
            <div className="h-56 md:h-72 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
                {/* Geometric pattern overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                {/* Blur circles */}
                <div className="absolute top-8 start-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 end-1/3 w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
            </div>

            {/* ─── Profile Info Bar ─── */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 relative">
                {/* Avatar anchored to cover bottom */}
                <div className="absolute start-4 md:start-6 -top-16 z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-background-paper shadow-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                            {uploadingImage ? (
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : avatar ? (
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-primary">{initials}</span>
                            )}
                        </div>
                        {/* Camera overlay */}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                            <Camera className="w-7 h-7 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        {/* Online indicator */}
                        <div className="absolute bottom-2 end-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background-paper shadow" />
                    </div>
                </div>
                <div className="pt-20 flex flex-row items-end justify-between pb-6 border-b border-border gap-4">
                    <div className="text-start">
                        <h1 className="text-2xl md:text-3xl font-bold text-text-heading">{displayName}</h1>
                        <div className="flex items-center justify-start gap-2 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Admin
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('common.active', 'Active')}
                            </span>
                        </div>
                        <p className="text-sm text-text-muted mt-1.5 flex items-center justify-start gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {formData.email}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPasswordModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            {t('settings.changePassword', 'Change Password')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setEditModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            {t('admin.editDetails', 'Edit Details')}
                        </Button>
                    </div>
                </div>

                {/* ─── Stats Row ─── */}
                <div className="grid grid-cols-3 gap-4 py-6 border-b border-border">
                    {[
                        { label: t('admin.role', 'Role'), value: 'Admin' },
                        { label: t('common.phoneNumber', 'Phone'), value: formData.phone || '—' },
                        { label: t('admin.accountStatus', 'Status'), value: t('common.active', 'Active') },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="text-center p-4 rounded-2xl bg-background-paper border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                        >
                            <p className="text-lg md:text-xl font-bold text-text-heading">{stat.value}</p>
                            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ─── Info Cards ─── */}
                <div className="py-6 grid md:grid-cols-2 gap-4">
                    {/* Contact Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-background-paper rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-200"
                    >
                        <h3 className="font-semibold text-text-heading mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            {t('settings.personalInformation', 'Personal Information')}
                        </h3>
                        <div className="space-y-3">
                            <InfoRow icon={User} label={t('common.fullName', 'Full Name')} value={displayName} />
                            <InfoRow icon={Mail} label={t('common.emailAddress', 'Email')} value={formData.email} />
                            <InfoRow icon={Phone} label={t('common.phoneNumber', 'Phone')} value={formData.phone || '—'} />
                        </div>
                    </motion.div>

                    {/* Account Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-background-paper rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-200"
                    >
                        <h3 className="font-semibold text-text-heading mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            {t('admin.accountInfo', 'Account Info')}
                        </h3>
                        <div className="space-y-3">
                            <InfoRow icon={ShieldCheck} label={t('admin.role', 'Role')} value="Administrator" />
                            <InfoRow icon={CheckCircle2} label={t('admin.accountStatus', 'Status')} value={t('common.active', 'Active')} valueClass="text-emerald-500" />
                            <InfoRow icon={Lock} label={t('settings.changePassword', 'Password')} value="••••••••••" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── Edit Details Modal ─── */}
            <AnimatePresence>
                {editModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                            {/* Modal Header */}
                            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Edit className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-text-heading">{t('admin.editDetails', 'Edit Details')}</h2>
                                        <p className="text-xs text-text-muted">{t('admin.updateYourInfo', 'Update your personal information')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <Input
                                    label={t('common.fullName', 'Full Name')}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    icon={User}
                                />
                                <Input
                                    label={t('common.emailAddress', 'Email Address')}
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    icon={Mail}
                                    disabled
                                />
                                <Input
                                    label={t('common.phoneNumber', 'Phone Number')}
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    icon={Phone}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 pb-6 flex gap-3 justify-end">
                                <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button onClick={handleSave} isLoading={saving} className="px-6">
                                    {!saving && <CheckCircle2 className="w-4 h-4" />}
                                    {saving ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── Change Password Modal ─── */}
            <AnimatePresence>
                {passwordModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                            {/* Modal Header */}
                            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-text-heading">{t('settings.changePassword', 'Change Password')}</h2>
                                        <p className="text-xs text-text-muted">{t('settings.updateAccountPassword', 'Update your account password')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPasswordModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                {[
                                    { key: 'currentPassword', label: t('auth.currentPassword', 'Current Password') },
                                    { key: 'newPassword', label: t('auth.newPassword', 'New Password') },
                                    { key: 'confirmPassword', label: t('auth.confirmNewPassword', 'Confirm New Password') },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
                                        <input
                                            type="password"
                                            value={passwordData[key]}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-text transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 pb-6 flex gap-3 justify-end">
                                <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button onClick={handleChangePassword} isLoading={passwordLoading} className="px-6">
                                    {!passwordLoading && <Lock className="w-4 h-4" />}
                                    {passwordLoading ? t('common.updating', 'Updating...') : t('settings.updatePassword', 'Update Password')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Helper Component ───
function InfoRow({ icon: Icon, label, value, valueClass = '' }) {
    return (
        <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-text-muted">{label}</p>
                <p className={`text-sm font-medium text-text-heading truncate ${valueClass}`}>{value}</p>
            </div>
        </div>
    )
}
