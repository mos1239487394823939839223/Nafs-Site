import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Switch from '../../components/ui/Switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/Dialog'
import { TooltipProvider } from '../../components/ui/Tooltip'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import {
    DashboardCard,
    KPIWidget,
    FilterBar,
    StatusBadge,
    ActionMenu,
    UserTable,
    UserCard,
    TableSkeleton,
} from '../../components/dashboard'
import { Users, UserPlus, Search, Mail, Stethoscope, User, RefreshCw, Phone, Lock, FileText, ToggleLeft, ToggleRight, ShieldCheck, ShieldAlert, Shield, X, Camera, Eye, EyeOff, Headphones, CheckCircle, Wallet, Pencil, RotateCcw, Filter, MinusCircle } from 'lucide-react'
import { adminAPI, userAPI, documentsAPI, authAPI, extractErrorMessage } from '../../lib/api'
import { getConfiguredBlackmailSupportUserId, setConfiguredBlackmailSupportUserId } from '../../lib/supportRouting'
import { motion, AnimatePresence } from 'framer-motion'
import { validateEmail } from '../../lib/validation'
import { useLanguage } from '../../contexts/LanguageContext'
import LocalDocumentsManager from '../../components/shared/LocalDocumentsManager'

const ADD_DOCTOR_DOCS_STORAGE_KEY = 'nafs:admin:add-doctor-documents'

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
            const response = await adminAPI.addUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber || null,
                role: 4,
                isBullyingSpecialist: formData.isBullyingSpecialist,
            })
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
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-border'}`}
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
                                    <Button onClick={handleNext} className="mt-2 w-full">
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
                                                className={`w-full rounded-xl border-2 p-4 text-start transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border bg-background-subtle hover:border-primary/40 hover:bg-primary/3'}`}
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

                                    {/* Bullying Specialist Toggle */}
                                    {formData.permissions === 'support-agent' && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isBullyingSpecialist: !prev.isBullyingSpecialist }))}
                                            className={`w-full rounded-xl border-2 p-4 text-start transition-all ${formData.isBullyingSpecialist ? 'border-orange-400 bg-orange-50' : 'border-border bg-background-subtle hover:border-orange-300 hover:bg-orange-50/40'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${formData.isBullyingSpecialist ? 'bg-orange-100' : 'bg-background-paper'}`}>
                                                    <ShieldAlert className={`h-5 w-5 ${formData.isBullyingSpecialist ? 'text-orange-600' : 'text-text-muted'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-text-heading">{t('admin.bullyingSpecialist')}</span>
                                                        <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${formData.isBullyingSpecialist ? 'bg-orange-500' : 'bg-border'}`}>
                                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${formData.isBullyingSpecialist ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                                        </div>
                                                    </div>
                                                    <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{t('admin.bullyingSpecialistDesc')}</p>
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
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                            ← {t('common.back')}
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={loading} isLoading={loading} className="flex-1">
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

// ─────────────────────────────────────────────────────────────────────────────

const readStagedDocuments = () => {
    try {
        const raw = localStorage.getItem(ADD_DOCTOR_DOCS_STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
        const result = reader.result
        if (typeof result !== 'string') {
            reject(new Error('INVALID_FILE_RESULT'))
            return
        }
        const base64 = result.split(',')[1]
        if (!base64) {
            reject(new Error('BASE64_CONVERSION_FAILED'))
            return
        }
        resolve(base64)
    }
    reader.onerror = () => reject(new Error('FILE_READ_ERROR'))
    reader.readAsDataURL(file)
})

const dataUrlToFile = (dataUrl, fallbackName, fallbackType) => {
    if (typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
        throw new Error('INVALID_DATA_URL')
    }

    const [header, data] = dataUrl.split(',', 2)
    const mimeMatch = header.match(/data:(.*?);base64/)
    const mimeType = mimeMatch?.[1] || fallbackType || 'application/octet-stream'
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i)
    }

    return new File([bytes], fallbackName || `document-${Date.now()}`, { type: mimeType })
}

const normalizeDocumentType = (value) => {
    const parsed = Number(value)
    return [1, 2, 3].includes(parsed) ? parsed : 1
}

export default function UserManagement() {
    const navigate = useNavigate()
    const toast = useToast()
    const { t, isRTL } = useLanguage()
    const [modalOpen, setModalOpen] = useState(false)
    const [staffModalOpen, setStaffModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('doctors')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [statusFilter, setStatusFilter] = useState('all')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [detailsUser, setDetailsUser] = useState(null)
    const [editUser, setEditUser] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '', specialist: '', isActive: true, isBullyingSpecialist: false })
    const [editSubmitting, setEditSubmitting] = useState(false)
    const [resetModalOpen, setResetModalOpen] = useState(false)
    const [resetTarget, setResetTarget] = useState(null)
    const [resetPasswordValue, setResetPasswordValue] = useState('')
    const [resetSubmitting, setResetSubmitting] = useState(false)
    // Doctors data
    const [doctors, setDoctors] = useState([])
    const [doctorsPage, setDoctorsPage] = useState(1)
    const [doctorsTotalPages, setDoctorsTotalPages] = useState(1)

    // Patients data
    const [patients, setPatients] = useState([])
    const [patientsPage, setPatientsPage] = useState(1)
    const [patientsTotalPages, setPatientsTotalPages] = useState(1)

    // Support staff data
    const [supportStaff, setSupportStaff] = useState([])
    const [supportPage, setSupportPage] = useState(1)
    const [supportTotalPages, setSupportTotalPages] = useState(1)
    const [blackmailSupportUserId, setBlackmailSupportUserId] = useState(() => getConfiguredBlackmailSupportUserId())

    // Add Doctor Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        description: '',
        specialist: '',
        image: null,
        imagePreview: null
    })

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        try {
            const response = await adminAPI.getDoctors(doctorsPage - 1, 20)
            if (response?.Data) {
                setDoctors(response.Data.Items || response.Data || [])
                if (response.Data.TotalPages) {
                    setDoctorsTotalPages(response.Data.TotalPages)
                }
            } else if (Array.isArray(response)) {
                setDoctors(response)
            }
        } catch (error) {
            console.error('Failed to fetch doctors:', error)
            toast.error(t('errors.failedLoadDoctors'))
        } finally {
            setLoading(false)
        }
    }, [doctorsPage])

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        try {
            const response = await userAPI.getUsers({ pageIndex: patientsPage, pageSize: 20, role: 3 })
            if (response?.Data) {
                setPatients(response.Data.Items || response.Data || [])
                if (response.Data.TotalPages) {
                    setPatientsTotalPages(response.Data.TotalPages)
                }
            } else if (Array.isArray(response)) {
                setPatients(response)
            }
        } catch (error) {
            console.error('Failed to fetch patients:', error)
            toast.error(t('errors.somethingWentWrong'))
        } finally {
            setLoading(false)
        }
    }, [patientsPage])

    const fetchSupportStaff = useCallback(async () => {
        setLoading(true)
        try {
            const staffRes = await userAPI.getUsers({ pageIndex: 1, pageSize: 100, role: 4 })
            const staffItems = staffRes?.Data?.Items || (Array.isArray(staffRes) ? staffRes : [])
            setSupportStaff(staffItems)
            setSupportTotalPages(1)
            return staffItems
        } catch (error) {
            console.error('Failed to fetch support staff:', error)
            toast.error(t('errors.somethingWentWrong'))
            return []
        } finally {
            setLoading(false)
        }
    }, [supportPage])

    useEffect(() => {
        if (activeTab === 'doctors') {
            fetchDoctors()
        } else if (activeTab === 'patients') {
            fetchPatients()
        } else if (activeTab === 'support') {
            fetchSupportStaff()
        }
    }, [activeTab, fetchDoctors, fetchPatients, fetchSupportStaff])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddDoctor = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.password) {
            toast.error(t('errors.fillRequired'))
            return
        }

        setSubmitting(true)
        try {
            const response = await adminAPI.addDoctor({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                description: formData.description,
                specialist: formData.specialist ? [formData.specialist] : null,
            })

            if (response?.IsSuccess !== false) {
                const newDoctorId = response.Data || response.data?.Data

                if (!newDoctorId) {
                    toast.error(t('errors.somethingWentWrong'))
                    return
                }

                // If image is provided, upload it using the new endpoint /user/UpdateImage
                if (formData.image && newDoctorId) {
                    try {
                        const base64 = await fileToBase64(formData.image)
                        await userAPI.updateImage(newDoctorId, base64)
                    } catch (err) {
                        console.error('Failed to upload doctor image:', err)
                        toast.error(t('errors.imageUploadFailed', 'Therapist created, but image upload failed'))
                    }
                }

                const stagedDocs = readStagedDocuments()
                const docsToUpload = stagedDocs.filter((doc) => doc?.dataUrl)

                if (docsToUpload.length > 0) {
                    const uploadResults = await Promise.allSettled(
                        docsToUpload.map((doc, index) => {
                            const fileName = doc.name || doc.title || `doctor-document-${index + 1}`
                            const file = dataUrlToFile(doc.dataUrl, fileName, doc.type)
                            return documentsAPI.uploadDocument({
                                file,
                                ownerUserId: newDoctorId,
                                title: doc.title || fileName,
                                documentType: normalizeDocumentType(doc.documentType),
                            })
                        })
                    )

                    const failedUploads = uploadResults.filter((result) => result.status === 'rejected').length
                    if (failedUploads > 0) {
                        toast.error(t('documents.uploadFailed', 'Failed to upload selected files.'))
                    }
                }

                toast.success(t('success.doctorAdded'))
                localStorage.removeItem(ADD_DOCTOR_DOCS_STORAGE_KEY)
                setModalOpen(false)
                setFormData({ name: '', email: '', password: '', phoneNumber: '', description: '', specialist: '', image: null, imagePreview: null })
                fetchDoctors()
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggleDoctor = async (doctorId) => {
        try {
            const response = await adminAPI.toggleDoctor(doctorId)
            if (response?.IsSuccess !== false) {
                toast.success(t('success.statusUpdated'))
                fetchDoctors()
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            toast.error(error.response?.data?.Message || t('errors.somethingWentWrong'))
        }
    }

    const openResetPasswordModal = (userItem) => {
        setResetTarget(userItem)
        setResetPasswordValue('')
        setResetModalOpen(true)
    }

    const handleResetPassword = async () => {
        const userId = resetTarget?.Id || resetTarget?.ID || resetTarget?.id
        if (!userId) {
            toast.error(t('errors.somethingWentWrong'))
            return
        }
        if (!resetPasswordValue || resetPasswordValue.length < 6) {
            toast.error(t('errors.passwordTooShort'))
            return
        }

        setResetSubmitting(true)
        try {
            const response = await userAPI.resetPassword(resetPasswordValue, userId)
            if (response?.IsSuccess !== false) {
                toast.success(t('success.passwordReset'))
                setResetModalOpen(false)
                setResetTarget(null)
                setResetPasswordValue('')
            } else {
                toast.error(response?.Message || t('errors.somethingWentWrong'))
            }
        } catch (error) {
            toast.error(error?.response?.data?.Message || t('errors.somethingWentWrong'))
        } finally {
            setResetSubmitting(false)
        }
    }

    const openDoctorFinancePage = (doctor) => {
        const doctorId = doctor?.Id || doctor?.ID || doctor?.id
        if (!doctorId) {
            toast.error(t('errors.somethingWentWrong'))
            return
        }

        navigate(`/admin/users/${doctorId}/finance`, {
            state: {
                doctor,
            },
        })
    }

    const handleSaveBlackmailSupport = () => {
        setConfiguredBlackmailSupportUserId(blackmailSupportUserId)
        toast.success(t('success.saved', 'Saved successfully'))
    }

    const getUserId = (item) => item?.Id || item?.ID || item?.id || item?.UserId || item?.userId
    const getUserSpecialistText = (item) => {
        const specialist = item?.Specialist || item?.specialist || item?.Speciality || item?.speciality || []
        return Array.isArray(specialist) ? specialist.join(', ') : String(specialist || '')
    }
    const getActiveFlag = (item) => item?.IsActive ?? item?.isActive ?? true
    const getBullyingSpecialistFlag = (item) => Boolean(item?.IsBullyingSpecialist ?? item?.isBullyingSpecialist)

    const openDetailsModal = (userItem) => {
        setDetailsUser(userItem)
    }

    const openEditModal = (userItem) => {
        setEditUser(userItem)
        setEditForm({
            name: userItem?.Name || userItem?.name || '',
            email: userItem?.Email || userItem?.email || '',
            phoneNumber: userItem?.PhoneNumber || userItem?.phoneNumber || '',
            specialist: getUserSpecialistText(userItem),
            isActive: getActiveFlag(userItem) !== false,
            isBullyingSpecialist: Boolean(userItem?.IsBullyingSpecialist ?? userItem?.isBullyingSpecialist),
        })
    }

    const handleEditUserSubmit = async () => {
        const userId = getUserId(editUser)
        if (!userId || !editForm.name.trim() || !validateEmail(editForm.email)) {
            toast.error(t('errors.fillRequired'))
            return
        }

        setEditSubmitting(true)
        // Carry forward existing values so the full-field EditUser endpoint
        // never overwrites untouched data (Description, Gender, DateOfBirth)
        // with null.
        const payload = {
            name: editForm.name.trim(),
            email: editForm.email.trim(),
            phoneNumber: editForm.phoneNumber.trim() || null,
            specialist: editForm.specialist.trim()
                ? editForm.specialist.split(',').map((item) => item.trim()).filter(Boolean)
                : (editUser?.Specialist ?? editUser?.specialist ?? null),
            description: editUser?.Description ?? editUser?.description ?? null,
            gender: editUser?.Gender ?? editUser?.gender ?? null,
            dateOfBirth: editUser?.DateOfBirth ?? editUser?.dateOfBirth ?? null,
            isActive: editForm.isActive,
        }

        if (activeTab === 'support') {
            payload.isBullyingSpecialist = editForm.isBullyingSpecialist
        } else {
            payload.isBullyingSpecialist = editUser?.IsBullyingSpecialist ?? editUser?.isBullyingSpecialist ?? false
        }

        try {
            const response = activeTab === 'doctors'
                ? await adminAPI.updateDoctor(userId, payload)
                : await adminAPI.updateUser(userId, payload)
            if (response?.IsSuccess === false) {
                throw new Error(response?.Message || response?.message)
            }
            toast.success(t('success.updated', 'Updated successfully'))
            setEditUser(null)
            if (activeTab === 'doctors') await fetchDoctors()
            else if (activeTab === 'patients') await fetchPatients()
            else {
                // Refetch the list and confirm the backend actually persisted /
                // returns the flag. If the saved value and the GET value differ,
                // the backend is dropping IsBullyingSpecialist — not the frontend.
                const refreshed = await fetchSupportStaff()
                const updated = refreshed.find((u) => String(getUserId(u)) === String(userId))
                const savedValue = payload.isBullyingSpecialist
                const returnedValue = updated ? getBullyingSpecialistFlag(updated) : undefined
                console.log('[EditUser] IsBullyingSpecialist — sent:', savedValue, '| returned by GET /user/get:', returnedValue)
                if (updated && returnedValue !== savedValue) {
                    console.warn('[EditUser] Backend did not return the saved IsBullyingSpecialist value. The PUT succeeded but the field is not persisted/returned by the backend.')
                }
            }
        } catch (error) {
            console.error('Failed to update user:', error)
            toast.error(extractErrorMessage(error, t('errors.somethingWentWrong')))
        } finally {
            setEditSubmitting(false)
        }
    }

    const getSessionsCount = (item) => Number(item.SessionsCount ?? item.sessionsCount ?? item.SessionCount ?? item.sessionCount ?? item.CompletedSessions ?? item.completedSessions ?? 0)
    const getPatientsCount = (item) => Number(item.PatientsCount ?? item.patientsCount ?? item.PatientCount ?? item.patientCount ?? 0)
    const getOpenCasesCount = (item) => Number(item.OpenCasesCount ?? item.openCasesCount ?? item.ActiveCases ?? item.activeCases ?? 0)
    const getClosedCasesCount = (item) => Number(item.ClosedCasesCount ?? item.closedCasesCount ?? item.ResolvedCases ?? item.resolvedCases ?? 0)
    const getTreatmentProgram = (item) => item.TreatmentProgram || item.treatmentProgram || item.ProgramName || item.programName || '—'

    const sortItems = useCallback((items) => {
        return [...items].sort((a, b) => {
            if (sortBy === 'status') return Number(b.IsActive !== false) - Number(a.IsActive !== false)
            if (sortBy === 'sessions') return getSessionsCount(b) - getSessionsCount(a)
            if (sortBy === 'patients') return getPatientsCount(b) - getPatientsCount(a)
            if (sortBy === 'openCases') return getOpenCasesCount(b) - getOpenCasesCount(a)
            const aName = String(a.Name || a.name || a.Email || a.email || '').toLowerCase()
            const bName = String(b.Name || b.name || b.Email || b.email || '').toLowerCase()
            return aName.localeCompare(bName)
        })
    }, [sortBy])

    const filteredDoctors = useMemo(() =>
        sortItems(doctors.filter(d => {
            const name = (d.Name || d.name || '').toLowerCase()
            const email = (d.Email || d.email || '').toLowerCase()
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? getActiveFlag(d) !== false : getActiveFlag(d) === false)
            return matchesSearch && matchesStatus
        })), [doctors, searchTerm, sortItems, statusFilter]
    )

    const filteredPatients = useMemo(() =>
        sortItems(patients.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase()
            const email = (p.Email || p.email || '').toLowerCase()
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? getActiveFlag(p) !== false : getActiveFlag(p) === false)
            return matchesSearch && matchesStatus
        })), [patients, searchTerm, sortItems, statusFilter]
    )

    const filteredSupportStaff = useMemo(() =>
        sortItems(supportStaff.filter(s => {
            const name = (s.Name || s.name || '').toLowerCase()
            const email = (s.Email || s.email || '').toLowerCase()
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? getActiveFlag(s) !== false : getActiveFlag(s) === false)
            return matchesSearch && matchesStatus
        })), [supportStaff, searchTerm, sortItems, statusFilter]
    )

    const doctorsStats = useMemo(() => {
        const active = doctors.filter((doctor) => doctor.IsActive !== false).length
        const inactive = Math.max(0, doctors.length - active)
        return { active, inactive }
    }, [doctors])

    const patientsStats = useMemo(() => {
        const active = patients.filter((patient) => patient.IsActive !== false).length
        return { active }
    }, [patients])

    // ── Derived: filters, current dataset, helpers for the redesigned table ──────
    const handleRefresh = () =>
        activeTab === 'doctors' ? fetchDoctors() : activeTab === 'patients' ? fetchPatients() : fetchSupportStaff()

    const resetFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setSortBy('name')
    }
    const filtersActive = searchTerm !== '' || statusFilter !== 'all' || sortBy !== 'name'

    const statusFilterOptions = [
        { value: 'all', label: t('common.allStatuses', 'All statuses') },
        { value: 'active', label: t('common.active') },
        { value: 'inactive', label: t('common.inactive') },
    ]

    const sortOptions = [
        { value: 'name', label: t('common.name') },
        { value: 'status', label: t('common.status') },
        ...(activeTab === 'doctors' ? [{ value: 'patients', label: t('admin.patientCount', 'Patients count') }] : []),
        ...(activeTab === 'patients' ? [{ value: 'sessions', label: t('admin.sessionsCount', 'Sessions count') }] : []),
        ...(activeTab === 'support' ? [{ value: 'openCases', label: t('admin.openCases', 'Open cases') }] : []),
    ]

    const tabs = [
        { value: 'doctors', label: t('admin.doctors'), icon: Stethoscope, count: doctors.length },
        { value: 'support', label: t('admin.customerSupport', 'Customer Support'), icon: Headphones, count: supportStaff.length },
        { value: 'patients', label: t('admin.patients', 'Patients'), icon: Users, count: patients.length },
    ]

    const isAdminStaff = (item) => item?.RoleID === 1 || item?.RoleName?.toUpperCase() === 'ADMIN'

    const getUserFields = (item) => ({
        name: item?.Name || item?.name,
        email: item?.Email || item?.email,
        avatar: item?.Image || item?.image,
    })

    const renderStatusBadge = (item) => (
        <StatusBadge status={getActiveFlag(item) !== false ? 'active' : 'inactive'}>
            {getActiveFlag(item) !== false ? t('common.active') : t('common.inactive')}
        </StatusBadge>
    )

    const renderBullyingSpecialistBadge = (item) => {
        const isSpecialist = getBullyingSpecialistFlag(item)
        return (
            <StatusBadge status={isSpecialist ? 'active' : 'neutral'} icon={isSpecialist ? ShieldCheck : MinusCircle}>
                {isSpecialist ? t('admin.bullyingSpecialistYes', 'Specialist') : t('admin.bullyingSpecialistNo', 'Not Specialist')}
            </StatusBadge>
        )
    }

    // Builds the compact View / Edit / More action group for a user row.
    const buildActions = (item, { onView, onEdit, onFinance, onToggle, onReset }) => {
        const primary = [
            { key: 'view', label: t('common.view'), icon: FileText, onClick: () => onView(item) },
            { key: 'edit', label: t('common.edit', 'Edit'), icon: Pencil, onClick: () => onEdit(item) },
        ]
        const more = []
        if (onFinance) more.push({ key: 'finance', label: t('admin.finance', 'Finance'), icon: Wallet, onClick: () => onFinance(item) })
        if (onReset) more.push({ key: 'reset', label: t('auth.resetPassword'), icon: RotateCcw, onClick: () => onReset(item) })
        if (onToggle) {
            more.push({
                key: 'toggle',
                label: getActiveFlag(item) !== false ? t('common.inactive') : t('common.active'),
                icon: getActiveFlag(item) !== false ? ToggleLeft : ToggleRight,
                onClick: () => onToggle(getUserId(item)),
                divider: more.length > 0,
            })
        }
        return <ActionMenu primary={primary} more={more} labels={{ more: t('common.more', 'More') }} />
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* ── Page header ─────────────────────────────────────────────── */}
                <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">
                            {t('admin.userManagement')}
                        </h1>
                        <p className="mt-1 text-sm text-text-muted">{t('admin.manageDoctorsPatients')}</p>
                    </div>
                    <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'justify-start lg:justify-end' : ''}`}>
                        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
                            <UserPlus className="h-4 w-4" />
                            {t('admin.addDoctor')}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setStaffModalOpen(true)} className="gap-1.5">
                            <Headphones className="h-4 w-4" />
                            {t('admin.addStaff')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-1.5">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </Button>
                    </div>
                </header>

                {/* ── KPI row ─────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <KPIWidget icon={Users} label={t('common.total', 'Total Users')} value={doctors.length + supportStaff.length + patients.length} tone="neutral" />
                    <KPIWidget icon={Stethoscope} label={t('admin.doctors', 'Therapists')} value={doctors.length} tone="success" />
                    <KPIWidget icon={Users} label={t('admin.patients', 'Patients')} value={patients.length} tone="info" />
                    <KPIWidget icon={Headphones} label={t('admin.customerSupport', 'Customer Support')} value={supportStaff.length} tone="info" />
                </div>

                {/* ── Tabs + filter toolbar + table ───────────────────────────── */}
                <DashboardCard className="overflow-visible">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const active = activeTab === tab.value
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => { setActiveTab(tab.value); resetFilters() }}
                                    className={`relative inline-flex items-center gap-2 whitespace-nowrap px-4 py-3.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                        active ? 'text-primary' : 'text-text-muted hover:text-text-heading'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                        active ? 'bg-primary/10 text-primary' : 'bg-background-subtle text-text-muted'
                                    }`}>
                                        {tab.count}
                                    </span>
                                    {active && (
                                        <motion.span
                                            layoutId="userTabIndicator"
                                            className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Filter toolbar */}
                    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder={`${t('common.search')}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background-subtle/50 ps-10 pe-9 text-sm text-text outline-none transition-all placeholder:text-text-muted/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-heading">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="h-10 rounded-xl border border-border bg-background-subtle/50 px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            {statusFilterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                            className="h-10 rounded-xl border border-border bg-background-subtle/50 px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            disabled={!filtersActive}
                            className="gap-1.5"
                        >
                            <Filter className="h-4 w-4" />
                            {t('common.reset', 'Reset')}
                        </Button>
                    </div>

                    <div className="p-4">
                    {/* Doctors Tab */}
                    {activeTab === 'doctors' && (
                        loading ? (
                            <TableSkeleton cols={8} />
                        ) : (
                            <>
                                {/* ── Mobile cards ── */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {filteredDoctors.length === 0 ? (
                                        <EmptyState icon={Stethoscope} message={t('admin.noDoctorsFound')} />
                                    ) : filteredDoctors.map((doctor) => (
                                        <UserCard
                                            key={getUserId(doctor) || doctor.Email}
                                            {...getUserFields(doctor)}
                                            badges={renderStatusBadge(doctor)}
                                            meta={[
                                                { label: t('common.specialty'), value: getUserSpecialistText(doctor) || '—' },
                                                { label: t('admin.patientCount', 'Patients'), value: getPatientsCount(doctor) },
                                                { label: t('common.phone'), value: doctor.PhoneNumber || doctor.phoneNumber || '—' },
                                            ]}
                                            actions={buildActions(doctor, {
                                                onView: openDetailsModal,
                                                onEdit: openEditModal,
                                                onFinance: openDoctorFinancePage,
                                                onToggle: handleToggleDoctor,
                                                onReset: openResetPasswordModal,
                                            })}
                                        />
                                    ))}
                                </div>

                                {/* ── Desktop table ── */}
                                <UserTable
                                    rows={filteredDoctors}
                                    rowKey={(d) => getUserId(d) || d.Email}
                                    getUser={getUserFields}
                                    emptyState={<EmptyState icon={Stethoscope} message={t('admin.noDoctorsFound')} />}
                                    columns={[
                                        { key: 'user', header: t('common.name') },
                                        {
                                            key: 'specialty', header: t('common.specialty'),
                                            render: (d) => {
                                                const list = d.Specialist || d.specialist || []
                                                return list.length > 0
                                                    ? <div className="flex flex-wrap gap-1">{list.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}</div>
                                                    : '—'
                                            },
                                        },
                                        { key: 'email', header: t('common.email'), cellClassName: 'text-text-muted max-w-[200px] truncate', render: (d) => d.Email || d.email },
                                        { key: 'phone', header: t('common.phone'), cellClassName: 'text-text-muted whitespace-nowrap', render: (d) => d.PhoneNumber || d.phoneNumber || '—' },
                                        { key: 'patients', header: t('admin.patientCount', 'Patients'), cellClassName: 'font-semibold text-text-heading', render: (d) => getPatientsCount(d) },
                                        { key: 'status', header: t('common.status'), render: renderStatusBadge },
                                        {
                                            key: 'account', header: t('admin.accountStatus', 'Account'),
                                            render: (d) => (
                                                <StatusBadge status={d.AccountStatus === 'Suspended' ? 'suspended' : 'neutral'}>
                                                    {d.AccountStatus || d.accountStatus || (getActiveFlag(d) !== false ? t('common.active') : t('common.inactive'))}
                                                </StatusBadge>
                                            ),
                                        },
                                        {
                                            key: 'actions', header: t('common.actions'), align: 'end',
                                            render: (d) => buildActions(d, {
                                                onView: openDetailsModal, onEdit: openEditModal, onFinance: openDoctorFinancePage,
                                                onToggle: handleToggleDoctor, onReset: openResetPasswordModal,
                                            }),
                                        },
                                    ]}
                                />

                                <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                                    <span className="text-sm text-text-muted">{filteredDoctors.length} {t('admin.doctors')}</span>
                                    <Pagination page={doctorsPage} total={doctorsTotalPages} onChange={setDoctorsPage} />
                                </div>
                            </>
                        )
                    )}

                    {/* Patients Tab */}
                    {activeTab === 'patients' && (
                        loading ? (
                            <TableSkeleton cols={7} />
                        ) : (
                            <>
                                {/* ── Mobile cards ── */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {filteredPatients.length === 0 ? (
                                        <EmptyState icon={Users} message={t('admin.noUsersFound')} />
                                    ) : filteredPatients.map((patient) => (
                                        <UserCard
                                            key={getUserId(patient) || patient.Email}
                                            {...getUserFields(patient)}
                                            badges={renderStatusBadge(patient)}
                                            meta={[
                                                { label: t('admin.sessionsCount', 'Sessions'), value: getSessionsCount(patient) },
                                                { label: t('patientHome.treatmentProgram.label', 'Treatment Program'), value: getTreatmentProgram(patient) },
                                                { label: t('common.phone'), value: patient.PhoneNumber || patient.phoneNumber || '—' },
                                            ]}
                                            actions={buildActions(patient, {
                                                onView: openDetailsModal, onEdit: openEditModal, onReset: openResetPasswordModal,
                                            })}
                                        />
                                    ))}
                                </div>

                                {/* ── Desktop table ── */}
                                <UserTable
                                    rows={filteredPatients}
                                    rowKey={(p) => getUserId(p) || p.Email}
                                    getUser={getUserFields}
                                    emptyState={<EmptyState icon={Users} message={t('admin.noUsersFound')} />}
                                    columns={[
                                        { key: 'user', header: t('common.name') },
                                        { key: 'phone', header: t('common.phone'), cellClassName: 'text-text-muted whitespace-nowrap', render: (p) => p.PhoneNumber || p.phoneNumber || '—' },
                                        { key: 'sessions', header: t('admin.sessionsCount', 'Sessions'), cellClassName: 'font-semibold text-text-heading', render: (p) => getSessionsCount(p) },
                                        { key: 'program', header: t('patientHome.treatmentProgram.label', 'Treatment Program'), cellClassName: 'max-w-[180px] truncate text-text-muted', render: (p) => getTreatmentProgram(p) },
                                        { key: 'status', header: t('common.status'), render: renderStatusBadge },
                                        {
                                            key: 'actions', header: t('common.actions'), align: 'end',
                                            render: (p) => buildActions(p, { onView: openDetailsModal, onEdit: openEditModal, onReset: openResetPasswordModal }),
                                        },
                                    ]}
                                />

                                <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                                    <span className="text-sm text-text-muted">{filteredPatients.length} {t('admin.users')}</span>
                                    <Pagination page={patientsPage} total={patientsTotalPages} onChange={setPatientsPage} />
                                </div>
                            </>
                        )
                    )}

                    {/* Customer Support Tab */}
                    {activeTab === 'support' && (
                        loading ? (
                            <TableSkeleton cols={7} />
                        ) : (
                            <>
                                {/* Blackmail / abuse routing config */}
                                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                                                <ShieldAlert className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-rose-950">
                                                    {t('admin.blackmailSupportRouting', 'Blackmail / Abuse Case Routing')}
                                                </h3>
                                                <p className="mt-1 text-xs text-rose-800/80">
                                                    {t('admin.blackmailSupportRoutingDesc', 'Choose the dedicated support account that should receive sensitive high-priority reports.')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <select
                                                value={blackmailSupportUserId}
                                                onChange={(event) => setBlackmailSupportUserId(event.target.value)}
                                                className="min-w-[240px] rounded-xl border border-rose-200 bg-background-paper px-3 py-2 text-sm text-text outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                                            >
                                                <option value="">{t('common.select', 'Select')}</option>
                                                {supportStaff.map((staff) => {
                                                    const staffId = staff.Id || staff.ID || staff.id
                                                    const name = staff.Name || staff.name || staff.Email || staff.email || staffId
                                                    return (
                                                        <option key={staffId} value={staffId}>
                                                            {name}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                            <Button size="sm" variant="danger" onClick={handleSaveBlackmailSupport}>
                                                {t('common.save', 'Save')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 md:hidden">
                                    {filteredSupportStaff.length === 0 ? (
                                        <EmptyState icon={Headphones} message={t('admin.noSupportStaffFound', 'No support staff found')} />
                                    ) : filteredSupportStaff.map((staff) => (
                                        <UserCard
                                            key={getUserId(staff) || staff.Email}
                                            {...getUserFields(staff)}
                                            badges={renderStatusBadge(staff)}
                                            meta={[
                                                { label: t('common.role'), value: isAdminStaff(staff) ? t('admin.adminRole', 'Admin') : t('admin.customerSupport', 'Customer Support') },
                                                ...(isAdminStaff(staff) ? [] : [{ label: t('admin.bullyingSpecialistColumn', 'Bullying Specialist'), value: renderBullyingSpecialistBadge(staff) }]),
                                                { label: t('admin.openCases', 'Open cases'), value: getOpenCasesCount(staff) },
                                                { label: t('admin.closedCases', 'Closed cases'), value: getClosedCasesCount(staff) },
                                            ]}
                                            actions={buildActions(staff, {
                                                onView: openDetailsModal, onEdit: openEditModal, onReset: openResetPasswordModal,
                                            })}
                                        />
                                    ))}
                                </div>

                                {/* ── Desktop table ── */}
                                <UserTable
                                    rows={filteredSupportStaff}
                                    rowKey={(s) => getUserId(s) || s.Email}
                                    getUser={getUserFields}
                                    emptyState={<EmptyState icon={Headphones} message={t('admin.noSupportStaffFound', 'No support staff found')} />}
                                    columns={[
                                        { key: 'user', header: t('common.name') },
                                        { key: 'phone', header: t('common.phone'), cellClassName: 'text-text-muted whitespace-nowrap', render: (s) => s.PhoneNumber || s.phoneNumber || '—' },
                                        {
                                            key: 'role', header: t('common.role'),
                                            render: (s) => isAdminStaff(s)
                                                ? <StatusBadge status="admin" icon={ShieldCheck}>{t('admin.adminRole', 'Admin')}</StatusBadge>
                                                : <StatusBadge status="support" icon={Headphones}>{t('admin.customerSupport', 'Customer Support')}</StatusBadge>,
                                        },
                                        {
                                            key: 'bullyingSpecialist',
                                            header: t('admin.bullyingSpecialistColumn', 'Bullying Specialist'),
                                            render: (s) => isAdminStaff(s) ? '—' : renderBullyingSpecialistBadge(s),
                                        },
                                        { key: 'open', header: t('admin.openCases', 'Open cases'), cellClassName: 'font-semibold text-text-heading', render: (s) => getOpenCasesCount(s) },
                                        { key: 'closed', header: t('admin.closedCases', 'Closed cases'), cellClassName: 'font-semibold text-text-heading', render: (s) => getClosedCasesCount(s) },
                                        { key: 'status', header: t('common.status'), render: renderStatusBadge },
                                        {
                                            key: 'actions', header: t('common.actions'), align: 'end',
                                            render: (s) => buildActions(s, { onView: openDetailsModal, onEdit: openEditModal, onReset: openResetPasswordModal }),
                                        },
                                    ]}
                                />

                                <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                                    <span className="text-sm text-text-muted">
                                        {filteredSupportStaff.filter(s => !isAdminStaff(s)).length} {t('admin.customerSupport', 'Customer Support')}
                                        {' · '}
                                        {filteredSupportStaff.filter(s => isAdminStaff(s)).length} {t('admin.adminRole', 'Admin')}
                                    </span>
                                    <Pagination page={supportPage} total={supportTotalPages} onChange={setSupportPage} />
                                </div>
                            </>
                        )
                    )}
                    </div>
                </DashboardCard>

                {/* Add Doctor Dialog */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent maxWidth="md" sx={{ '& .MuiDialog-paper': { maxHeight: '88vh', overflowY: 'auto', overflowX: 'hidden' } }}>
                        <form onSubmit={handleAddDoctor} className="flex flex-col">
                            <DialogHeader sx={{ p: 0, borderBottom: 'none' }}>
                                <div className="px-5 pt-5 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent rounded-t-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-background-paper border border-primary/15 shadow-sm">
                                            <UserPlus className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl">{t('admin.addNewDoctor')}</DialogTitle>
                                            <DialogDescription className="mt-1">{t('admin.manageDoctorsPatients')}</DialogDescription>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-5 space-y-4 bg-gradient-to-b from-background to-background-subtle/20">
                                <div className="rounded-2xl border border-primary/15 bg-background-paper p-5 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                                        <div className="relative mx-auto md:mx-0">
                                            <div className="w-28 h-28 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden bg-background-subtle">
                                                {formData.imagePreview ? (
                                                    <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-12 h-12 text-text-light/40" />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-1 -end-1 p-2.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-all shadow-lg">
                                                <Camera className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0]
                                                        if (file) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                image: file,
                                                                imagePreview: URL.createObjectURL(file)
                                                            }))
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        <div className="flex-1 text-center md:text-start">
                                            <h3 className="text-lg font-semibold text-text-heading">{t('settings.profilePhoto')}</h3>
                                            <p className="text-sm text-text-muted mt-1">Upload a clear professional photo for the doctor account.</p>
                                            <p className="text-xs text-text-light mt-2">Recommended: JPG or PNG, square ratio.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-background-paper p-5 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-text-heading">Account Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label={t('common.fullName')}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Therapist Ahmed Hassan"
                                            required
                                            icon={User}
                                        />
                                        <Input
                                            label={t('common.emailAddress')}
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="name@example.com"
                                            required
                                            icon={Mail}
                                        />
                                        <Input
                                            label={t('common.password')}
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder={t('admin.minChars')}
                                            required
                                            icon={Lock}
                                        />
                                        <Input
                                            label={t('common.phoneNumber')}
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="+201234567890"
                                            icon={Phone}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-background-paper p-5 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-text-heading">Professional Details</h3>
                                    </div>

                                    <Input
                                        label={t('common.specialty')}
                                        name="specialist"
                                        value={formData.specialist}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Psychiatry"
                                        icon={Stethoscope}
                                    />

                                    <Textarea
                                        label={t('common.description')}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder={t('admin.professionalBio')}
                                        rows={3}
                                    />
                                </div>

                                <div className="rounded-2xl border border-border bg-background-paper p-5 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-text-heading">{t('documents.title')}</h3>
                                    </div>
                                    <p className="text-sm text-text-muted">Add certificates and documentation and classify each file type before upload.</p>
                                    <LocalDocumentsManager
                                        storageKey={ADD_DOCTOR_DOCS_STORAGE_KEY}
                                        allowDocumentTypeSelection
                                        title={t('documents.title')}
                                        buttonLabel={t('documents.addButton')}
                                        emptyMessage={t('documents.empty')}
                                    />
                                </div>
                            </div>

                            <DialogFooter sx={{ position: 'sticky', bottom: 0, backgroundColor: 'background.paper', zIndex: 2, borderTop: '1px solid', borderColor: 'divider', boxShadow: '0 -8px 20px rgba(0,0,0,0.04)' }}>
                                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" isLoading={submitting} className="px-6">
                                    {!submitting && <UserPlus className="w-4 h-4" />}
                                    {submitting ? t('admin.creating') : t('admin.createDoctorAccount')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(detailsUser)} onOpenChange={(open) => !open && setDetailsUser(null)}>
                    <DialogContent maxWidth="sm">
                        <DialogHeader>
                            <DialogTitle>{t('common.view', 'View')} {detailsUser?.Name || detailsUser?.name || ''}</DialogTitle>
                            <DialogDescription>
                                {t('admin.userDetails', 'User details and role-specific summary.')}
                            </DialogDescription>
                        </DialogHeader>

                        {detailsUser && (
                            <div className="space-y-3">
                                {[
                                    [t('common.name'), detailsUser.Name || detailsUser.name || '—'],
                                    [t('common.email'), detailsUser.Email || detailsUser.email || '—'],
                                    [t('common.phone'), detailsUser.PhoneNumber || detailsUser.phoneNumber || '—'],
                                    [t('common.status'), getActiveFlag(detailsUser) !== false ? t('common.active') : t('common.inactive')],
                                    activeTab === 'doctors' ? [t('common.specialty'), getUserSpecialistText(detailsUser) || '—'] : null,
                                    activeTab === 'doctors' ? [t('admin.patientCount', 'Patients'), getPatientsCount(detailsUser)] : null,
                                    activeTab === 'patients' ? [t('admin.sessionsCount', 'Sessions'), getSessionsCount(detailsUser)] : null,
                                    activeTab === 'patients' ? [t('patientHome.treatmentProgram.label', 'Treatment Program'), getTreatmentProgram(detailsUser)] : null,
                                    activeTab === 'support' ? [t('admin.openCases', 'Open cases'), getOpenCasesCount(detailsUser)] : null,
                                    activeTab === 'support' ? [t('admin.closedCases', 'Closed cases'), getClosedCasesCount(detailsUser)] : null,
                                ].filter(Boolean).map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background-subtle px-4 py-3 text-sm">
                                        <span className="font-medium text-text-muted">{label}</span>
                                        <span className="text-end font-semibold text-text-heading" dir="auto">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setDetailsUser(null)}>
                                {t('common.close', 'Close')}
                            </Button>
                            {detailsUser && (
                                <Button onClick={() => { openEditModal(detailsUser); setDetailsUser(null) }}>
                                    {t('common.edit', 'Edit')}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(editUser)} onOpenChange={(open) => !open && setEditUser(null)}>
                    <DialogContent maxWidth="sm">
                        <DialogHeader>
                            <DialogTitle>{t('common.edit', 'Edit')} {editUser?.Name || editUser?.name || ''}</DialogTitle>
                            <DialogDescription>
                                {t('admin.roleBasedEditNotice', 'Only fields allowed for this role are editable.')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <Input
                                label={t('common.fullName')}
                                value={editForm.name}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                                icon={User}
                            />
                            <Input
                                label={t('common.emailAddress')}
                                type="email"
                                value={editForm.email}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                                icon={Mail}
                            />
                            <Input
                                label={t('common.phoneNumber')}
                                value={editForm.phoneNumber}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                                icon={Phone}
                            />
                            {activeTab === 'doctors' && (
                                <Input
                                    label={t('common.specialty')}
                                    value={editForm.specialist}
                                    onChange={(event) => setEditForm((prev) => ({ ...prev, specialist: event.target.value }))}
                                    icon={Stethoscope}
                                />
                            )}
                            {activeTab === 'support' && !isAdminStaff(editUser) && (
                                <div
                                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-4 transition-colors duration-200 ${editForm.isBullyingSpecialist ? 'border-primary/40 bg-primary/5' : 'border-border bg-background-subtle hover:border-primary/30'}`}
                                >
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${editForm.isBullyingSpecialist ? 'bg-primary/10' : 'bg-background-paper'}`}>
                                        <ShieldAlert className={`h-5 w-5 transition-colors duration-200 ${editForm.isBullyingSpecialist ? 'text-primary' : 'text-text-muted'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-text-heading">{t('admin.bullyingSpecialist')}</span>
                                        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{t('admin.bullyingSpecialistDesc')}</p>
                                    </div>
                                    <Switch
                                        bare
                                        checked={editForm.isBullyingSpecialist}
                                        disabled={editSubmitting}
                                        onCheckedChange={(next) => setEditForm((prev) => ({ ...prev, isBullyingSpecialist: next }))}
                                        ariaLabel={t('admin.bullyingSpecialist')}
                                        className="ms-1"
                                    />
                                </div>
                            )}
                            <label className="flex items-center justify-between rounded-xl border border-border bg-background-subtle px-4 py-3 text-sm font-semibold text-text-heading">
                                {t('common.active')}
                                <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                                    className="h-4 w-4 accent-primary"
                                />
                            </label>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEditUser(null)}>
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={handleEditUserSubmit} isLoading={editSubmitting}>
                                {t('common.save', 'Save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
                    <DialogContent maxWidth="sm">
                        <DialogHeader>
                            <DialogTitle>{t('auth.resetPassword')}</DialogTitle>
                            <DialogDescription>
                                {`Reset password for ${resetTarget?.Name || resetTarget?.name || resetTarget?.Email || ''}`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <Input
                                label={t('auth.newPassword')}
                                type="password"
                                value={resetPasswordValue}
                                onChange={(e) => setResetPasswordValue(e.target.value)}
                                placeholder="Minimum 6 characters"
                                icon={Lock}
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={handleResetPassword} isLoading={resetSubmitting}>
                                {t('auth.resetPassword')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>

            <AddStaffModal
                open={staffModalOpen}
                onClose={() => setStaffModalOpen(false)}
                onSuccess={fetchSupportStaff}
                t={t}
            />
        </TooltipProvider>
    )
}

// Shared empty-state placeholder for the user lists.
function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-background-subtle">
                <Icon className="h-7 w-7 text-text-muted" />
            </div>
            <p className="font-medium text-text-muted">{message}</p>
        </div>
    )
}
