import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { userAPI, filesAPI, patientAPI, extractErrorMessage } from '../../lib/api'
import { Camera, User, Mail, Phone, Lock, Loader2, Pencil as Edit, X, CheckCircle as CheckCircle2, Calendar, MapPin, Heart, Heart as HeartOutline, History as HistoryIcon } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useLanguage } from '../../contexts/LanguageContext'
import { medicalAPI } from '../../lib/api'

export default function PatientProfile() {
    const { user, updateProfile } = useAuth()
    const toast = useToast()
    const { t, isRTL } = useLanguage()

    const [formData, setFormData] = useState({
        name: user?.name || user?.Name || '',
        email: user?.email || user?.Email || '',
        phone: user?.phone || user?.PhoneNumber || '',
        address: user?.address || '',
        dob: user?.dob || user?.Birthday || '',
        emergencyContact: user?.emergencyContact || '',
    })
    const [avatar, setAvatar] = useState(user?.image || user?.Image || null)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [bookings, setBookings] = useState([])
    const [bookingsLoading, setBookingsLoading] = useState(true)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [myHistory, setMyHistory] = useState(null)
    const [isLoadingMyHistory, setIsLoadingMyHistory] = useState(false)

    useEffect(() => {
        const img = user?.image || user?.Image || null
        if (img) setAvatar(img)
    }, [user?.image, user?.Image])

    useEffect(() => {
        setFormData({
            name: user?.name || user?.Name || '',
            email: user?.email || user?.Email || '',
            phone: user?.phone || user?.PhoneNumber || '',
            address: user?.address || '',
            dob: user?.dob || user?.Birthday || '',
            emergencyContact: user?.emergencyContact || '',
        })
    }, [user])

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setBookingsLoading(true)
                const response = await patientAPI.getPatientBookings(1, 100)
                if (response?.IsSuccess === true && response?.Data) {
                    setBookings(response.Data.Items || response.Data || [])
                }
            } catch {
                // silent
            } finally {
                setBookingsLoading(false)
            }
        }
        fetchBookings()
    }, [])

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAvatar(URL.createObjectURL(file))
        setUploadingImage(true)
        try {
            const uploadResponse = await filesAPI.uploadFile(file)
            const imageUrl = uploadResponse?.Data?.PublicUrl || uploadResponse?.Data
            if (!imageUrl) { toast.error(t('errors.somethingWentWrong')); return }
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

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error(t('errors.fillPasswordFields')); return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error(t('errors.passwordTooShort')); return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('errors.passwordMismatch')); return
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

    const handleViewMyHistory = async () => {
        setIsHistoryModalOpen(true)
        setIsLoadingMyHistory(true)
        try {
            const response = await medicalAPI.getMyHistory(1, 100)
            if (response?.IsSuccess === true && response?.Data) {
                setMyHistory(response.Data)
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
                setIsHistoryModalOpen(false)
            }
        } catch (error) {
            toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
            setIsHistoryModalOpen(false)
        } finally {
            setIsLoadingMyHistory(false)
        }
    }

    const displayName = formData.name || user?.name || user?.Name || t('patient.patient', 'Patient')
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)



    return (
        <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ─── Cover + Avatar Hero ─── */}
            <div className="relative">
                <div className="h-56 md:h-72 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                    <div className="absolute top-8 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
                </div>

                <div className={`absolute ${isRTL ? 'right-6 md:right-16' : 'left-6 md:left-16'} -bottom-16 z-10`}>
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
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                            <Camera className="w-7 h-7 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background-paper shadow" />
                    </div>
                </div>
            </div>

            {/* ─── Profile Info Bar ─── */}
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className={`pt-20 md:pt-6 ${isRTL ? 'md:pr-48' : 'md:pl-48'} flex flex-col md:flex-row items-center md:items-end justify-between gap-4 pb-6 border-b border-border`}>
                    <div className={`text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-heading">{displayName}</h1>
                        <div className={`flex items-center justify-center ${isRTL ? 'md:justify-end' : 'md:justify-start'} gap-2 mt-1.5 flex-wrap`}>
                            <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                                <HeartOutline className="w-3.5 h-3.5" />
                                {t('patient.patient', 'Patient')}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('common.active', 'Active')}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                {t('common.online', 'Online')}
                            </span>
                        </div>
                        <p className={`text-sm text-text-muted mt-1.5 flex items-center justify-center ${isRTL ? 'md:justify-end' : 'md:justify-start'} gap-1.5`}>
                            <Mail className="w-3.5 h-3.5" />
                            {formData.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewMyHistory}
                            className="flex items-center gap-2"
                        >
                            <HistoryIcon className="w-4 h-4" />
                            {t('patient.myHistory', 'My History')}
                        </Button>
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



                {/* ─── Personal Info Card ─── */}
                <div className="py-6">
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
                            {formData.dob && (
                                <InfoRow icon={Calendar} label={t('common.dateOfBirth', 'Date of Birth')} value={new Date(formData.dob).toLocaleDateString()} />
                            )}
                            {formData.address && (
                                <InfoRow icon={MapPin} label={t('common.address', 'Address')} value={formData.address} />
                            )}
                            {formData.emergencyContact && (
                                <InfoRow icon={Heart} label={t('settings.emergencyContact', 'Emergency Contact')} value={formData.emergencyContact} />
                            )}
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
                                <Input
                                    label={t('common.address', 'Address')}
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    icon={MapPin}
                                />
                                <Input
                                    label={t('settings.emergencyContact', 'Emergency Contact')}
                                    value={formData.emergencyContact}
                                    onChange={(e) => handleChange('emergencyContact', e.target.value)}
                                    icon={Heart}
                                    placeholder={t('settings.nameAndPhoneNumber', 'Name & Phone Number')}
                                />
                            </div>

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

            {/* ─── Medical History Modal ─── */}
            <AnimatePresence>
                {isHistoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsHistoryModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="px-6 pt-6 pb-4 bg-background-paper border-b border-border flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <HistoryIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-text-heading">{t('patient.myHistory', 'My History')}</h2>
                                        <p className="text-xs text-text-muted">{t('patient.yourMedicalRecords', 'Your medical records and history')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsHistoryModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-subtle transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {isLoadingMyHistory ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-sm text-text-muted">{t('common.loading', 'Loading...')}</p>
                                    </div>
                                ) : !myHistory?.Items || myHistory.Items.length === 0 ? (
                                    <div className="text-center py-8">
                                        <HistoryIcon className="w-12 h-12 text-text-muted/30 mx-auto mb-2" />
                                        <p className="text-sm text-text-muted">{t('patient.noHistoryFound', 'No medical history found')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myHistory.Items.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border border-border/50 rounded-xl p-4 bg-background-subtle/20 hover:bg-background-subtle/40 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                item.Type === 1
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                                {item.Type === 1 ? t('patient.medicalTest', 'Medical Test') : t('patient.doctorNote', 'Doctor Note')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-text-heading">
                                                            {t('patient.doctor', 'Doctor')}: {item.DoctorName}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-text-muted whitespace-nowrap">
                                                        {new Date(item.Date).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {item.Type === 1 && (
                                                    <div className="space-y-2 mb-3 border-t border-border/30 pt-3">
                                                        {item.TestTypeName && (
                                                            <div>
                                                                <p className="text-xs text-text-muted">{t('patient.testType', 'Test Type')}</p>
                                                                <p className="text-sm font-medium text-text-heading">{item.TestTypeName}</p>
                                                            </div>
                                                        )}
                                                        {item.TestTypeDescription && (
                                                            <div>
                                                                <p className="text-xs text-text-muted">{t('patient.description', 'Description')}</p>
                                                                <p className="text-sm text-text-heading">{item.TestTypeDescription}</p>
                                                            </div>
                                                        )}
                                                        {item.ExamNotes && (
                                                            <div>
                                                                <p className="text-xs text-text-muted">{t('patient.examNotes', 'Exam Notes')}</p>
                                                                <p className="text-sm text-text-heading">{item.ExamNotes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.Type === 2 && item.DoctorNote && (
                                                    <div className="mb-3 border-t border-border/30 pt-3">
                                                        <p className="text-xs text-text-muted mb-1.5">{t('patient.doctorNotes', 'Doctor Notes')}</p>
                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 rounded-lg p-3 text-sm border border-yellow-200 dark:border-yellow-800">
                                                            {item.DoctorNote}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.Result && (
                                                    <div className="mb-3 border-t border-border/30 pt-3">
                                                        <p className="text-xs text-text-muted mb-1.5">{t('patient.result', 'Result')}</p>
                                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 rounded-lg p-3 text-sm border border-emerald-200 dark:border-emerald-800">
                                                            {item.Result}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.ScanUrl && (
                                                    <div className="mb-3 border-t border-border/30 pt-3">
                                                        <p className="text-xs text-text-muted mb-1">{t('patient.scanUrl', 'Scan URL')}</p>
                                                        <a
                                                            href={item.ScanUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline break-all"
                                                        >
                                                            {item.ScanUrl.length > 50 ? item.ScanUrl.substring(0, 50) + '...' : item.ScanUrl}
                                                        </a>
                                                    </div>
                                                )}

                                                <div className="flex gap-4 text-xs text-text-muted border-t border-border/30 pt-3">
                                                    {item.RecordID && (
                                                        <span>{t('patient.recordId', 'Record ID')}: {item.RecordID}</span>
                                                    )}
                                                    {item.BookingID && (
                                                        <span>{t('patient.bookingId', 'Booking ID')}: {item.BookingID}</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 pb-6 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-background-paper">
                                <Button variant="ghost" onClick={() => setIsHistoryModalOpen(false)} className="mt-4">
                                    {t('common.close', 'Close')}
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
