import { useState, useEffect, useCallback } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Mail,
    CheckCircle,
    Clock,
    XCircle,
    Stethoscope,
    User,
    Loader2,
    ToggleLeft,
    ToggleRight,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Phone
} from 'lucide-react'
import { adminAPI, userAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function UserManagement() {
    const toast = useToast()
    const { t } = useLanguage()
    const [activeTab, setActiveTab] = useState('doctors')
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Doctors data
    const [doctors, setDoctors] = useState([])
    const [doctorsPage, setDoctorsPage] = useState(0)
    const [doctorsTotalPages, setDoctorsTotalPages] = useState(1)

    // Patients data
    const [patients, setPatients] = useState([])
    const [patientsPage, setPatientsPage] = useState(0)
    const [patientsTotalPages, setPatientsTotalPages] = useState(1)

    // Add Doctor Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        description: '',
        specialist: ''
    })

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        try {
            const response = await adminAPI.getDoctors(doctorsPage, 20)
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
            // Use userAPI.getUsers to fetch patients (role might be filtered)
            const response = await userAPI.getUsers({ pageIndex: patientsPage + 1, pageSize: 20 })
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

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setShowAddForm(false)
        setSearchTerm('')
    }

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
                toast.success(t('success.doctorAdded'))
                setShowAddForm(false)
                setFormData({ name: '', email: '', password: '', phoneNumber: '', description: '', specialist: '' })
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

    const filteredDoctors = doctors.filter(d => {
        const name = (d.Name || d.name || '').toLowerCase()
        const email = (d.Email || d.email || '').toLowerCase()
        return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
    })

    const filteredPatients = patients.filter(p => {
        const name = (p.Name || p.name || '').toLowerCase()
        const email = (p.Email || p.email || '').toLowerCase()
        return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-heading">{t('admin.userManagement')}</h2>
                    <p className="text-text-muted mt-1">{t('admin.manageDoctorsPatients')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={activeTab === 'doctors' ? fetchDoctors : fetchPatients} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </Button>
                    {!showAddForm && activeTab === 'doctors' && (
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => setShowAddForm(true)}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {t('admin.addDoctor')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                <button
                    onClick={() => handleTabChange('doctors')}
                    className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'doctors' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                >
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        {t('admin.doctors')}
                    </div>
                    {activeTab === 'doctors' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => handleTabChange('patients')}
                    className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'patients' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t('admin.users')}
                    </div>
                    {activeTab === 'patients' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
            </div>

            {showAddForm ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.addNewDoctor')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDoctor} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label={`${t('settings.fullName')} *`}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Dr. Ahmed Hassan"
                                    required
                                    icon={User}
                                />
                                <Input
                                    label={`${t('settings.emailAddress')} *`}
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
                                />
                                <Input
                                    label={t('settings.phoneNumber')}
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-muted mb-2">{t('common.description')}</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder={t('admin.professionalBio')}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-text resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('admin.creating')}
                                        </div>
                                    ) : t('admin.createDoctorAccount')}
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                            <input
                                type="text"
                                placeholder={`${t('common.search')} ${activeTab === 'doctors' ? t('admin.doctors') : t('admin.users')}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Data Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {activeTab === 'doctors' && (
                                                    <>
                                                        <TableHead>{t('common.name')}</TableHead>
                                                        <TableHead>{t('common.specialty')}</TableHead>
                                                        <TableHead>{t('common.email')}</TableHead>
                                                        <TableHead>{t('common.phone')}</TableHead>
                                                        <TableHead>{t('common.status')}</TableHead>
                                                        <TableHead>{t('common.actions')}</TableHead>
                                                    </>
                                                )}
                                                {activeTab === 'patients' && (
                                                    <>
                                                        <TableHead>{t('common.name')}</TableHead>
                                                        <TableHead>{t('common.email')}</TableHead>
                                                        <TableHead>{t('common.phone')}</TableHead>
                                                        <TableHead>{t('common.status')}</TableHead>
                                                    </>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeTab === 'doctors' && filteredDoctors.map((doctor) => (
                                                <TableRow key={doctor.Id || doctor.id || doctor.Email}>
                                                    <TableCell className="font-medium text-text-heading">{doctor.Name || doctor.name}</TableCell>
                                                    <TableCell>{(doctor.Specialist || doctor.specialist || []).join(', ') || 'N/A'}</TableCell>
                                                    <TableCell>{doctor.Email || doctor.email}</TableCell>
                                                    <TableCell>{doctor.PhoneNumber || doctor.phoneNumber || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={doctor.IsActive !== false ? 'success' : 'secondary'}>
                                                            {doctor.IsActive !== false ? t('common.active') : t('common.inactive')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleToggleDoctor(doctor.Id || doctor.id)}
                                                                title={doctor.IsActive !== false ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {doctor.IsActive !== false ? (
                                                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                                                ) : (
                                                                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {activeTab === 'patients' && filteredPatients.map((patient) => (
                                                <TableRow key={patient.Id || patient.id || patient.Email}>
                                                    <TableCell className="font-medium text-text-heading">{patient.Name || patient.name}</TableCell>
                                                    <TableCell>{patient.Email || patient.email}</TableCell>
                                                    <TableCell>{patient.PhoneNumber || patient.phoneNumber || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="success">{t('common.active')}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {activeTab === 'doctors' && filteredDoctors.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                                                        {t('admin.noDoctorsFound')}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {activeTab === 'patients' && filteredPatients.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                                                        {t('admin.noUsersFound')}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-text-muted">
                                    Page {(activeTab === 'doctors' ? doctorsPage : patientsPage) + 1} of {activeTab === 'doctors' ? doctorsTotalPages : patientsTotalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={(activeTab === 'doctors' ? doctorsPage : patientsPage) === 0}
                                        onClick={() => {
                                            if (activeTab === 'doctors') setDoctorsPage(p => Math.max(0, p - 1))
                                            else setPatientsPage(p => Math.max(0, p - 1))
                                        }}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={(activeTab === 'doctors' ? doctorsPage : patientsPage) + 1 >= (activeTab === 'doctors' ? doctorsTotalPages : patientsTotalPages)}
                                        onClick={() => {
                                            if (activeTab === 'doctors') setDoctorsPage(p => p + 1)
                                            else setPatientsPage(p => p + 1)
                                        }}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
