import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { People as Users, PersonAdd as UserPlus, Search, Mail, MedicalServices as Stethoscope, Person as User, Refresh as RefreshCw, Phone, Lock, Description as FileText, ToggleOff as ToggleLeft, ToggleOn as ToggleRight, VerifiedUser as ShieldCheck, ShowChart as Activity, Close as X, PhotoCamera as Camera } from '@mui/icons-material'
import { adminAPI, userAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function UserManagement() {
    const toast = useToast()
    const { t } = useLanguage()
    const [modalOpen, setModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('doctors')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Doctors data
    const [doctors, setDoctors] = useState([])
    const [doctorsPage, setDoctorsPage] = useState(1)
    const [doctorsTotalPages, setDoctorsTotalPages] = useState(1)

    // Patients data
    const [patients, setPatients] = useState([])
    const [patientsPage, setPatientsPage] = useState(1)
    const [patientsTotalPages, setPatientsTotalPages] = useState(1)

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
            const response = await userAPI.getUsers({ pageIndex: patientsPage, pageSize: 20 })
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

    useEffect(() => {
        if (activeTab === 'doctors') {
            fetchDoctors()
        } else if (activeTab === 'patients') {
            fetchPatients()
        }
    }, [activeTab, fetchDoctors, fetchPatients])

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

                // If image is provided, upload it using the new endpoint /user/UpdateImage
                if (formData.image && newDoctorId) {
                    try {
                        const reader = new FileReader()
                        reader.onload = async () => {
                            const base64 = reader.result.split(',')[1]
                            await userAPI.updateImage(newDoctorId, base64)
                        }
                        reader.readAsDataURL(formData.image)
                    } catch (err) {
                        console.error('Failed to upload doctor image:', err)
                        toast.error(t('errors.imageUploadFailed', 'Doctor created, but image upload failed'))
                    }
                }

                toast.success(t('success.doctorAdded'))
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

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text-heading">{t('admin.userManagement')}</h2>
                        <p className="text-text-muted mt-1 text-sm">{t('admin.manageDoctorsPatients')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={activeTab === 'doctors' ? fetchDoctors : fetchPatients}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </Button>
                        {activeTab === 'doctors' && (
                            <Button size="sm" onClick={() => setModalOpen(true)}>
                                <UserPlus className="w-4 h-4" />
                                {t('admin.addDoctor')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchTerm('') }}>
                    <TabsList>
                        <TabsTrigger value="doctors">
                            <Stethoscope className="w-4 h-4" />
                            {t('admin.doctors')}
                            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {doctors.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="patients">
                            <Users className="w-4 h-4" />
                            {t('admin.users')}
                            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {patients.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                        <input
                            type="text"
                            placeholder={`${t('common.search')} ${activeTab === 'doctors' ? t('admin.doctors') : t('admin.users')}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:max-w-sm h-10 pl-10 pr-10 rounded-xl border border-border-light bg-background-subtle/50 text-sm text-text placeholder:text-text-light/50 hover:bg-background-subtle hover:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
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
                                                        <div className="flex items-center gap-3">
                                                            <UserAvatar name={doctor.Name || doctor.name} src={doctor.Image || doctor.image} size="sm" />
                                                            <span className="font-semibold text-text-heading">{doctor.Name || doctor.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(doctor.Specialist || doctor.specialist || []).length > 0
                                                                ? (doctor.Specialist || doctor.specialist).map((s, i) => (
                                                                    <Badge key={i} variant="secondary">{s}</Badge>
                                                                ))
                                                                : <span className="text-text-muted">—</span>
                                                            }
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-text-muted">{doctor.Email || doctor.email}</TableCell>
                                                    <TableCell className="text-text-muted">{doctor.PhoneNumber || doctor.phoneNumber || '—'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={doctor.IsActive !== false ? 'success' : 'default'}>
                                                            <Activity className="w-3 h-3" />
                                                            {doctor.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => handleToggleDoctor(doctor.Id || doctor.id)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-subtle transition-colors"
                                                                >
                                                                    {doctor.IsActive !== false ? (
                                                                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                                                                    ) : (
                                                                        <ToggleLeft className="w-5 h-5 text-text-muted" />
                                                                    )}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {doctor.IsActive !== false ? t('common.inactive') : t('common.active')}
                                                            </TooltipContent>
                                                        </Tooltip>
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

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-text-muted">
                                        {filteredDoctors.length} {t('admin.doctors')}
                                    </span>
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
                                <Table>
                                    <TableHeader>
                                        <TableRow hover={false}>
                                            <TableHead>{t('common.name')}</TableHead>
                                            <TableHead>{t('common.email')}</TableHead>
                                            <TableHead>{t('common.phone')}</TableHead>
                                            <TableHead>{t('common.role')}</TableHead>
                                            <TableHead>{t('common.status')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => (
                                                <TableRow key={patient.Id || patient.id || patient.Email}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <UserAvatar
                                                                name={patient.Name || patient.name}
                                                                src={patient.Image || patient.image}
                                                                size="sm"
                                                                className="ring-secondary/30"
                                                            />
                                                            <span className="font-semibold text-text-heading">{patient.Name || patient.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-text-muted">{patient.Email || patient.email}</TableCell>
                                                    <TableCell className="text-text-muted">{patient.PhoneNumber || patient.phoneNumber || '—'}</TableCell>
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
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow hover={false}>
                                                <TableCell colSpan={5} className="text-center py-12">
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

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-text-muted">
                                        {filteredPatients.length} {t('admin.users')}
                                    </span>
                                    <Pagination page={patientsPage} total={patientsTotalPages} onChange={setPatientsPage} />
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Add Doctor Dialog */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <form onSubmit={handleAddDoctor}>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                                        <UserPlus className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle>{t('admin.addNewDoctor')}</DialogTitle>
                                        <DialogDescription>{t('admin.manageDoctorsPatients')}</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-6 space-y-5">
                                {/* Doctor Image Upload */}
                                <div className="flex flex-col items-center justify-center p-4 bg-background-subtle/30 rounded-2xl border border-dashed border-border mb-2">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden bg-background-paper">
                                            {formData.imagePreview ? (
                                                <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-text-light/30" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-all shadow-md">
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
                                    <p className="text-xs text-text-muted mt-2">{t('settings.profilePhoto')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label={`${t('common.fullName')} *`}
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Dr. Ahmed Hassan"
                                        required
                                        icon={User}
                                    />
                                    <Input
                                        label={`${t('common.emailAddress')} *`}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="name@example.com"
                                        required
                                        icon={Mail}
                                    />
                                    <Input
                                        label={`${t('common.password')} *`}
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
                                    <Input
                                        label={t('common.specialty')}
                                        name="specialist"
                                        value={formData.specialist}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Psychiatry"
                                        icon={Stethoscope}
                                    />
                                </div>
                                <Textarea
                                    label={t('common.description')}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={t('admin.professionalBio')}
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" isLoading={submitting}>
                                    {!submitting && <UserPlus className="w-4 h-4" />}
                                    {submitting ? t('admin.creating') : t('admin.createDoctorAccount')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    )
}
