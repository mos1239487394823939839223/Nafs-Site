import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/Dialog'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/Tooltip'
import { UserAvatar } from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import { Users, UserPlus, Search, Mail, Stethoscope, User, RefreshCw, Phone, Lock, FileText, ToggleLeft, ToggleRight, ShieldCheck, ShieldAlert, Shield, Activity, X, Camera, Eye, EyeOff, Headphones, CheckCircle } from 'lucide-react'
import { adminAPI, userAPI, documentsAPI, authAPI, extractErrorMessage } from '../../lib/api'
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
    const [activeTab, setActiveTab] = useState('support')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
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
            // Fetch both staff (role 4) and admins (role 1) in parallel
            const [staffRes, adminRes] = await Promise.all([
                userAPI.getUsers({ pageIndex: 1, pageSize: 100, role: 4 }),
                userAPI.getUsers({ pageIndex: 1, pageSize: 100, role: 1 }),
            ])
            const staffItems = staffRes?.Data?.Items || (Array.isArray(staffRes) ? staffRes : [])
            const adminItems = adminRes?.Data?.Items || (Array.isArray(adminRes) ? adminRes : [])
            setSupportStaff([...staffItems, ...adminItems])
            setSupportTotalPages(1)
        } catch (error) {
            console.error('Failed to fetch support staff:', error)
            toast.error(t('errors.somethingWentWrong'))
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

    const filteredDoctors = useMemo(() =>
        doctors.filter(d => {
            const name = (d.Name || d.name || '').toLowerCase()
            const email = (d.Email || d.email || '').toLowerCase()
            return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
        }), [doctors, searchTerm]
    )

    const filteredPatients = useMemo(() =>
        patients.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase()
            const email = (p.Email || p.email || '').toLowerCase()
            return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
        }), [patients, searchTerm]
    )

    const filteredSupportStaff = useMemo(() =>
        supportStaff.filter(s => {
            const name = (s.Name || s.name || '').toLowerCase()
            const email = (s.Email || s.email || '').toLowerCase()
            return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
        }), [supportStaff, searchTerm]
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

    return (
        <TooltipProvider>
            <div className="space-y-6" >
                {/* Hero */}
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-background-paper p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-text-heading flex items-center gap-2">
                                <Users className="w-8 h-8 text-primary" />
                                {t('admin.userManagement')}
                            </h2>
                            <p className="text-text-muted mt-2">{t('admin.manageDoctorsPatients')}</p>
                        </div>
                        <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-start lg:justify-end' : ''}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={activeTab === 'doctors' ? fetchDoctors : activeTab === 'patients' ? fetchPatients : fetchSupportStaff}
                                disabled={loading}
                                className="gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                {t('common.refresh')}
                            </Button>
                            <Button size="sm" onClick={() => setModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                                <UserPlus className="w-4 h-4" />
                                {t('admin.addDoctor')}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setStaffModalOpen(true)} className="gap-2">
                                <Headphones className="w-4 h-4" />
                                {t('admin.addStaff')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-5 shadow-sm">
                        <p className="text-sm text-white/80">{t('admin.doctors')}</p>
                        <p className="text-3xl font-bold mt-1">{doctors.length}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark text-white p-5 shadow-sm">
                        <p className="text-sm text-white/80">{t('common.active')}</p>
                        <p className="text-3xl font-bold mt-1">{doctorsStats.active}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-white p-5 shadow-sm">
                        <p className="text-sm text-white/80">{t('common.inactive')}</p>
                        <p className="text-3xl font-bold mt-1">{doctorsStats.inactive}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-primary-dark to-secondary text-white p-5 shadow-sm">
                        <p className="text-sm text-white/80">{t('admin.users')}</p>
                        <p className="text-3xl font-bold mt-1">{patients.length}</p>
                        <p className="text-xs text-white/70 mt-1">
                            {t('common.active')}: {patientsStats.active}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Card className="border border-border shadow-sm">
                    <CardContent className="space-y-5">
                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchTerm('') }}>
                            <TabsList className="w-full sm:w-auto bg-background-subtle rounded-xl p-1">
                        <TabsTrigger value="support">
                            <Headphones className="w-4 h-4" />
                            {t('admin.staff', 'Staff')}
                            <span className="ms-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {supportStaff.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="doctors">
                            <Stethoscope className="w-4 h-4" />
                            {t('admin.doctors')}
                            <span className="ms-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {doctors.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="patients">
                            <Users className="w-4 h-4" />
                            {t('admin.patients', 'Patients')}
                            <span className="ms-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {patients.length}
                            </span>
                        </TabsTrigger>
                            </TabsList>

                            {/* Search Bar */}
                            <div className="relative">
                        <Search className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light`} />
                        <input
                            type="text"
                            placeholder={`${t('common.search')} ${activeTab === 'doctors' ? t('admin.doctors') : t('admin.users')}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full sm:max-w-sm h-10 ${t("auto.ps10Pe10")} rounded-xl border border-border-light bg-background-subtle/50 text-sm text-text placeholder:text-text-light/50 hover:bg-background-subtle hover:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className={`absolute end-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                            </div>

                    {/* Doctors Tab */}
                    <TabsContent value="doctors">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Spinner label={t('common.loading')} />
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile cards (hidden on md+) ── */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {filteredDoctors.length === 0 ? (
                                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center">
                                                <Stethoscope className="w-7 h-7 text-text-muted" />
                                            </div>
                                            <p className="text-text-muted font-medium">{t('admin.noDoctorsFound')}</p>
                                        </div>
                                    ) : filteredDoctors.map((doctor) => (
                                        <div key={doctor.Id || doctor.id || doctor.Email}
                                            className="bg-background-paper border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <UserAvatar name={doctor.Name || doctor.name} src={doctor.Image || doctor.image} size="md" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-text-heading truncate">{doctor.Name || doctor.name}</p>
                                                    <p className="text-xs text-text-muted truncate">{doctor.Email || doctor.email}</p>
                                                </div>
                                                <Badge variant={doctor.IsActive !== false ? 'success' : 'default'} className="shrink-0">
                                                    {doctor.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                </Badge>
                                            </div>
                                            {(doctor.Specialist || doctor.specialist || []).length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {(doctor.Specialist || doctor.specialist).map((s, i) => (
                                                        <Badge key={i} variant="secondary">{s}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 pt-1 border-t border-border">
                                                <button onClick={() => openDoctorFinancePage(doctor)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border hover:bg-background-subtle transition-colors">
                                                    <Eye className="w-4 h-4 text-secondary" />
                                                    {t('common.view')}
                                                </button>
                                                <button onClick={() => handleToggleDoctor(doctor.Id || doctor.id)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border hover:bg-background-subtle transition-colors">
                                                    {doctor.IsActive !== false
                                                        ? <><ToggleRight className="w-4 h-4 text-emerald-500" />{t('common.inactive')}</>
                                                        : <><ToggleLeft className="w-4 h-4 text-text-muted" />{t('common.active')}</>}
                                                </button>
                                                <button onClick={() => openResetPasswordModal(doctor)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border hover:bg-background-subtle transition-colors">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    {t('auth.resetPassword')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Desktop table (hidden on mobile) ── */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow hover={false}>
                                                <TableHead>{t('common.name')}</TableHead>
                                                <TableHead>{t('common.specialty')}</TableHead>
                                                <TableHead>{t('common.email')}</TableHead>
                                                <TableHead>{t('common.phone')}</TableHead>
                                                <TableHead>{t('common.status')}</TableHead>
                                                <TableHead className="text-center">{t('common.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredDoctors.length > 0 ? (
                                                filteredDoctors.map((doctor) => (
                                                    <TableRow key={doctor.Id || doctor.id || doctor.Email}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <UserAvatar name={doctor.Name || doctor.name} src={doctor.Image || doctor.image} size="sm" />
                                                                <span className="font-semibold text-text-heading truncate">{doctor.Name || doctor.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(doctor.Specialist || doctor.specialist || []).length > 0
                                                                    ? (doctor.Specialist || doctor.specialist).map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)
                                                                    : <span className="text-text-muted">—</span>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-text-muted max-w-[180px] truncate">{doctor.Email || doctor.email}</TableCell>
                                                        <TableCell className="text-text-muted whitespace-nowrap">{doctor.PhoneNumber || doctor.phoneNumber || '—'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={doctor.IsActive !== false ? 'success' : 'default'}>
                                                                <Activity className="w-3 h-3" />
                                                                {doctor.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Tooltip><TooltipTrigger asChild>
                                                                    <button onClick={() => openDoctorFinancePage(doctor)}
                                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-subtle transition-colors">
                                                                        <Eye className="w-4 h-4 text-secondary" />
                                                                    </button>
                                                                </TooltipTrigger><TooltipContent>{t('common.view')}</TooltipContent></Tooltip>
                                                                <Tooltip><TooltipTrigger asChild>
                                                                    <button onClick={() => handleToggleDoctor(doctor.Id || doctor.id)}
                                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-subtle transition-colors">
                                                                        {doctor.IsActive !== false
                                                                            ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                                                                            : <ToggleLeft className="w-5 h-5 text-text-muted" />}
                                                                    </button>
                                                                </TooltipTrigger><TooltipContent>{doctor.IsActive !== false ? t('common.inactive') : t('common.active')}</TooltipContent></Tooltip>
                                                                <Tooltip><TooltipTrigger asChild>
                                                                    <button onClick={() => openResetPasswordModal(doctor)}
                                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-subtle transition-colors">
                                                                        <Lock className="w-4 h-4 text-primary" />
                                                                    </button>
                                                                </TooltipTrigger><TooltipContent>{t('auth.resetPassword')}</TooltipContent></Tooltip>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow hover={false}>
                                                    <TableCell colSpan={6} className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center">
                                                                <Stethoscope className="w-7 h-7 text-text-muted" />
                                                            </div>
                                                            <p className="text-text-muted font-medium">{t('admin.noDoctorsFound')}</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4">
                                    <span className="text-sm text-text-muted">{filteredDoctors.length} {t('admin.doctors')}</span>
                                    <Pagination page={doctorsPage} total={doctorsTotalPages} onChange={setDoctorsPage} />
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Patients Tab */}
                    <TabsContent value="patients">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Spinner label={t('common.loading')} />
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile cards ── */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {filteredPatients.length === 0 ? (
                                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center">
                                                <Users className="w-7 h-7 text-text-muted" />
                                            </div>
                                            <p className="text-text-muted font-medium">{t('admin.noUsersFound')}</p>
                                        </div>
                                    ) : filteredPatients.map((patient) => (
                                        <div key={patient.Id || patient.id || patient.Email}
                                            className="bg-background-paper border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <UserAvatar name={patient.Name || patient.name} src={patient.Image || patient.image} size="md" className="ring-secondary/30" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-text-heading truncate">{patient.Name || patient.name}</p>
                                                    <p className="text-xs text-text-muted truncate">{patient.Email || patient.email}</p>
                                                </div>
                                                <Badge variant={patient.IsActive !== false ? 'success' : 'default'} className="shrink-0">
                                                    {patient.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1 border-t border-border">
                                                <button onClick={() => openResetPasswordModal(patient)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border hover:bg-background-subtle transition-colors">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    {t('auth.resetPassword')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Desktop table ── */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow hover={false}>
                                                <TableHead>{t('common.name')}</TableHead>
                                                <TableHead>{t('common.email')}</TableHead>
                                                <TableHead>{t('common.phone')}</TableHead>
                                                <TableHead>{t('common.role')}</TableHead>
                                                <TableHead>{t('common.status')}</TableHead>
                                                <TableHead className="text-center">{t('common.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map((patient) => (
                                                    <TableRow key={patient.Id || patient.id || patient.Email}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <UserAvatar name={patient.Name || patient.name} src={patient.Image || patient.image} size="sm" className="ring-secondary/30" />
                                                                <span className="font-semibold text-text-heading truncate">{patient.Name || patient.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-text-muted max-w-[180px] truncate">{patient.Email || patient.email}</TableCell>
                                                        <TableCell className="text-text-muted whitespace-nowrap">{patient.PhoneNumber || patient.phoneNumber || '—'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="primary">
                                                                <ShieldCheck className="w-3 h-3" />
                                                                {patient.RoleName || patient.roleName || '—'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={patient.IsActive !== false ? 'success' : 'default'}>
                                                                {patient.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Tooltip><TooltipTrigger asChild>
                                                                <button onClick={() => openResetPasswordModal(patient)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-subtle transition-colors">
                                                                    <Lock className="w-4 h-4 text-primary" />
                                                                </button>
                                                            </TooltipTrigger><TooltipContent>{t('auth.resetPassword')}</TooltipContent></Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow hover={false}>
                                                    <TableCell colSpan={6} className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center">
                                                                <Users className="w-7 h-7 text-text-muted" />
                                                            </div>
                                                            <p className="text-text-muted font-medium">{t('admin.noUsersFound')}</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4">
                                    <span className="text-sm text-text-muted">{filteredPatients.length} {t('admin.users')}</span>
                                    <Pagination page={patientsPage} total={patientsTotalPages} onChange={setPatientsPage} />
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Customer Support Tab */}
                    <TabsContent value="support">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Spinner label={t('common.loading')} />
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile cards ── */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {filteredSupportStaff.length === 0 ? (
                                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center">
                                                <Headphones className="w-7 h-7 text-text-muted" />
                                            </div>
                                            <p className="text-text-muted font-medium">{t('admin.noSupportStaffFound', 'No support staff found')}</p>
                                        </div>
                                    ) : filteredSupportStaff.map((staff) => (
                                        <div key={staff.Id || staff.id || staff.Email}
                                            className="bg-background-paper border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <UserAvatar name={staff.Name || staff.name} src={staff.Image || staff.image} size="md" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-text-heading truncate">{staff.Name || staff.name}</p>
                                                    <p className="text-xs text-text-muted truncate">{staff.Email || staff.email}</p>
                                                </div>
                                                <Badge variant={staff.IsActive !== false ? 'success' : 'default'} className="shrink-0">
                                                    {staff.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {(staff.RoleID === 1 || staff.RoleName?.toUpperCase() === 'ADMIN') ? (
                                                    <Badge variant="primary"><ShieldCheck className="w-3 h-3" />{t('admin.adminRole', 'Admin')}</Badge>
                                                ) : (
                                                    <Badge variant="secondary"><Headphones className="w-3 h-3" />{t('admin.customerSupport', 'Customer Support')}</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 pt-1 border-t border-border">
                                                <button onClick={() => openResetPasswordModal(staff)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border hover:bg-background-subtle transition-colors">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    {t('auth.resetPassword')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Desktop table ── */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow hover={false}>
                                                <TableHead>{t('common.name')}</TableHead>
                                                <TableHead>{t('common.email')}</TableHead>
                                                <TableHead>{t('common.phone')}</TableHead>
                                                <TableHead>{t('common.role')}</TableHead>
                                                <TableHead>{t('common.status')}</TableHead>
                                                <TableHead className="text-center">{t('common.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSupportStaff.length > 0 ? (
                                                filteredSupportStaff.map((staff) => (
                                                    <TableRow key={staff.Id || staff.id || staff.Email}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <UserAvatar name={staff.Name || staff.name} src={staff.Image || staff.image} size="sm" />
                                                                <span className="font-semibold text-text-heading truncate">{staff.Name || staff.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-text-muted max-w-[180px] truncate">{staff.Email || staff.email}</TableCell>
                                                        <TableCell className="text-text-muted whitespace-nowrap">{staff.PhoneNumber || staff.phoneNumber || '—'}</TableCell>
                                                        <TableCell>
                                                            {(staff.RoleID === 1 || staff.RoleName?.toUpperCase() === 'ADMIN') ? (
                                                                <Badge variant="primary"><ShieldCheck className="w-3 h-3" />{t('admin.adminRole', 'Admin')}</Badge>
                                                            ) : (
                                                                <Badge variant="secondary"><Headphones className="w-3 h-3" />{t('admin.customerSupport', 'Customer Support')}</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={staff.IsActive !== false ? 'success' : 'default'}>
                                                                {staff.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Tooltip><TooltipTrigger asChild>
                                                                <button onClick={() => openResetPasswordModal(staff)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-subtle transition-colors">
                                                                    <Lock className="w-4 h-4 text-primary" />
                                                                </button>
                                                            </TooltipTrigger><TooltipContent>{t('auth.resetPassword')}</TooltipContent></Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow hover={false}>
                                                    <TableCell colSpan={6} className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center">
                                                                <Headphones className="w-7 h-7 text-text-muted" />
                                                            </div>
                                                            <p className="text-text-muted font-medium">{t('admin.noSupportStaffFound', 'No support staff found')}</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4">
                                    <span className="text-sm text-text-muted">
                                        {filteredSupportStaff.filter(s => s.RoleID !== 1 && s.RoleName?.toUpperCase() !== 'ADMIN').length} {t('admin.customerSupport', 'Customer Support')}
                                        {' · '}
                                        {filteredSupportStaff.filter(s => s.RoleID === 1 || s.RoleName?.toUpperCase() === 'ADMIN').length} {t('admin.adminRole', 'Admin')}
                                    </span>
                                    <Pagination page={supportPage} total={supportTotalPages} onChange={setSupportPage} />
                                </div>
                            </>
                        )}
                    </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

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
