import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, User, Plus, Calendar, Clock, ChevronRight, ArrowLeft, Save, Pill, MessageSquare, Loader2 } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { doctorAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { medicalAPI } from '../../lib/api'
import { getAppointmentStatusKey } from '../../lib/appointmentStatus'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { doctorMessagesUrl } from '../../lib/doctorPatientRoutes'

export default function MedicalHistory() {
    const { user } = useAuth()
    const toast = useToast()
    const { t } = useLanguage()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const initialPatientId = searchParams.get('patientId')
    const shouldOpenAdd = searchParams.get('add') === '1'
    const workspaceSection = searchParams.get('section') === 'assessments' ? 'assessments' : 'records'

    const setWorkspaceSection = (section) => {
        const next = new URLSearchParams(searchParams)
        if (section === 'records') next.delete('section')
        else next.set('section', section)
        setSearchParams(next, { replace: true })
    }

    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newRecord, setNewRecord] = useState({
        summary: '',
        medications: '',
        treatmentProgram: '',
        customProgram: '',
        programSessions: 8,
        assessment: '',
        assessmentLevel: '',
        recommendations: '',
    })
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [patientHistory, setPatientHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [testTypes, setTestTypes] = useState([])
    const [selectedTestTypeId, setSelectedTestTypeId] = useState('')
    const [creatingType, setCreatingType] = useState(false)
    const [updatingResultId, setUpdatingResultId] = useState(null)

    const tryParseJSON = (str) => {
        if (!str) return null
        const trimmed = str.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmed)
                if (parsed && typeof parsed === 'object') return parsed
            } catch {
                return null
            }
        }
        return null
    }

    const fetchPatientHistory = async (patientId) => {
        if (!patientId) {
            setPatientHistory([])
            return
        }

        try {
            setHistoryLoading(true)
            const response = await medicalAPI.getPatientHistory(patientId, 1, 100)
            const records = response?.Data?.Items || []
            const mapped = records.map((record) => ({
                id: String(record.RecordID),
                date: record.TestDate ? new Date(record.TestDate).toISOString().split('T')[0] : '',
                doctorName: record.DoctorName || user?.name || user?.Name || 'Therapist',
                testTypeName: record.TestTypeName || 'Test',
                examNotes: record.ExamNotes || '',
                result: record.Result || '',
                medications: [],
            }))
            setPatientHistory(mapped)
        } catch {
            toast.error(t('errors.loadFailed'))
            setPatientHistory([])
        } finally {
            setHistoryLoading(false)
        }
    }

    // Fetch bookings from API to extract patient list
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true)
                const response = await doctorAPI.getBookings(1, 100)
                if (response.IsSuccess && response.Data) {
                    setBookings(response.Data.Items || [])
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error)
                toast.error(t('errors.loadFailed'))
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    useEffect(() => {
        const loadTestTypes = async () => {
            try {
                const response = await medicalAPI.getTestTypes(1, 100)
                const items = response?.Data?.Items || []
                setTestTypes(items)
                if (items.length > 0) {
                    setSelectedTestTypeId(String(items[0].ID))
                }
            } catch {
                setTestTypes([])
            }
        }
        loadTestTypes()
    }, [])

    useEffect(() => {
        fetchPatientHistory(selectedPatient?.id)
    }, [selectedPatient, toast, t, user])

    // Extract unique patients from bookings
    const myPatients = []
    const seenPatients = new Set()
    bookings.forEach(booking => {
        const patientId = booking.PatientId
        const patientName = booking.PatientName
        if (patientId && !seenPatients.has(patientId)) {
            seenPatients.add(patientId)
            // Count bookings for this patient
            const patientBookings = bookings.filter(b => b.PatientId === patientId)
            const completedSessions = patientBookings.filter(
                b => getAppointmentStatusKey(b.Status, b) === 'completed'
            ).length
            const lastSession = patientBookings
                .filter(b => b.SessionStartTime)
                .sort((a, b) => new Date(b.SessionStartTime) - new Date(a.SessionStartTime))[0]

            myPatients.push({
                id: patientId,
                name: patientName || 'Unknown Patient',
                totalSessions: patientBookings.length,
                completedSessions,
                lastSessionDate: lastSession?.SessionStartTime
                    ? new Date(lastSession.SessionStartTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A',
            })
        }
    })

    useEffect(() => {
        if (!initialPatientId || loading) return
        const match = myPatients.find((p) => String(p.id) === String(initialPatientId))
        if (match) {
            setSelectedPatient(match)
            if (shouldOpenAdd) setIsAddModalOpen(true)
        }
    }, [initialPatientId, shouldOpenAdd, loading, bookings.length])

    const filteredPatients = myPatients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddRecord = () => {
        if (!newRecord.summary && !newRecord.treatmentProgram && !newRecord.assessment) {
            toast.error(t('errors.enterSummary'))
            return
        }

        const saveRecord = async () => {
            try {
                if (!selectedTestTypeId) {
                    toast.error(t('errors.unexpectedError'))
                    return
                }

                const selectedType = testTypes.find((type) => {
                    const typeId = type?.ID ?? type?.Id ?? type?.id
                    return String(typeId) === String(selectedTestTypeId)
                })
                const selectedTypeScanUrl = String(selectedType?.Url ?? selectedType?.url ?? '').trim()

                const notesObj = {
                    isStructured: true,
                    examNotes: newRecord.summary,
                    medications: newRecord.medications,
                    treatmentProgram: newRecord.treatmentProgram === 'custom' ? newRecord.customProgram : newRecord.treatmentProgram,
                    treatmentProgramSessions: newRecord.treatmentProgram ? Number(newRecord.programSessions) || 8 : null,
                    assessment: newRecord.assessment,
                    assessmentLevel: newRecord.assessmentLevel,
                    recommendations: newRecord.recommendations,
                }

                const response = await medicalAPI.addPatientTest({
                    PatientID: String(selectedPatient.id),
                    TestTypeID: String(selectedTestTypeId),
                    ScanUrl: selectedTypeScanUrl || null,
                    ExamNotes: JSON.stringify(notesObj),
                    TestDate: new Date().toISOString(),
                })

                if (response?.IsSuccess === false) {
                    toast.error(response?.Message || t('errors.unexpectedError'))
                    return
                }

                toast.success(t('success.recordAdded'))
                setIsAddModalOpen(false)
                setNewRecord({
                    summary: '',
                    medications: '',
                    treatmentProgram: '',
                    customProgram: '',
                    programSessions: 8,
                    assessment: '',
                    assessmentLevel: '',
                    recommendations: '',
                })

                await fetchPatientHistory(selectedPatient.id)
            } catch {
                toast.error(t('errors.unexpectedError'))
            }
        }

        saveRecord()
    }

    const handleUpdateResult = async (record) => {
        const entered = window.prompt('Enter test result', record.result || '')
        if (entered === null) return

        const value = entered.trim()
        if (!value) {
            toast.error(t('errors.required'))
            return
        }

        setUpdatingResultId(record.id)
        try {
            const response = await medicalAPI.updatePatientTestResult(record.id, value)
            if (response?.IsSuccess === false) {
                toast.error(response?.Message || t('errors.unexpectedError'))
                return
            }
            toast.success(t('success.infoUpdated'))
            await fetchPatientHistory(selectedPatient?.id)
        } catch {
            toast.error(t('errors.unexpectedError'))
        } finally {
            setUpdatingResultId(null)
        }
    }

    const handleCreateTestType = async () => {
        const entered = window.prompt('Enter new test type name')
        if (!entered) return
        const name = entered.trim()
        if (!name) return

        setCreatingType(true)
        try {
            const response = await medicalAPI.createTestType({
                Name: name,
                Description: null,
                RelatedTagIDs: null,
            })
            if (response?.IsSuccess === false) {
                toast.error(response?.Message || t('errors.unexpectedError'))
                return
            }

            const reload = await medicalAPI.getTestTypes(1, 100)
            const items = reload?.Data?.Items || []
            setTestTypes(items)
            const created = items.find((item) => item.Name?.toLowerCase() === name.toLowerCase())
            if (created?.ID) setSelectedTestTypeId(String(created.ID))
            toast.success(t('success.infoUpdated'))
        } catch {
            toast.error(t('errors.unexpectedError'))
        } finally {
            setCreatingType(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <AnimatePresence mode="wait">
                {!selectedPatient ? (
                    <motion.div
                        key="patient-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-text-heading">{t('doctor.medicalHistory')}</h1>
                                <p className="text-text-muted">{t('doctor.manageClinicalRecords')}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant={workspaceSection === 'records' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setWorkspaceSection('records')}
                              >
                                {t('doctor.historyTabs.records', 'Medical records')}
                              </Button>
                              <Button
                                variant={workspaceSection === 'assessments' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setWorkspaceSection('assessments')}
                              >
                                {t('doctor.historyTabs.assessments', 'Assessments')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  if (filteredPatients.length === 0) {
                                    toast.error(t('doctor.patientsAppearHere'))
                                    return
                                  }
                                  setSearchParams({ add: '1', ...(workspaceSection === 'assessments' ? { section: 'assessments' } : {}) }, { replace: true })
                                }}
                              >
                                <Plus className="w-4 h-4" />
                                {t('doctor.dashboardHome.quickTools.items.addPatient.title', 'Add patient record')}
                              </Button>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-gray" />
                                <input
                                    type="text"
                                    placeholder={t('doctor.searchPatient')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full ps-10 pe-4 py-2 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                                />
                            </div>
                        </div>

                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-20 bg-background-paper rounded-3xl border-2 border-dashed border-border">
                                <User className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold text-text-heading mb-2">{t('doctor.noPatientsFound')}</h3>
                                <p className="text-text-muted">{t('doctor.patientsAppearHere')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPatients.map((patient) => (
                                    <Card
                                        key={patient.id}
                                        hover
                                        className="p-6 cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all group"
                                        onClick={() => setSelectedPatient(patient)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <User className="w-7 h-7 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-text-heading truncate">{patient.name}</h3>
                                                <p className="text-sm text-text-muted">
                                                    {patient.completedSessions} completed • Last: {patient.lastSessionDate}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="history-detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => setSelectedPatient(null)} className="h-10 w-10 p-0 rounded-full flex-shrink-0">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-2xl font-bold text-text-heading truncate">{selectedPatient.name}</h2>
                                    <p className="text-text-muted text-sm">{t('doctor.clinicalHistory')} • {selectedPatient.totalSessions} {t('doctor.sessions')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" className="flex-1 sm:flex-none gap-2" onClick={() => {
                                    navigate(doctorMessagesUrl(selectedPatient.id))
                                }}>
                                    <MessageSquare className="w-4 h-4" /> {t('chat.message')}
                                </Button>
                                <Button className="flex-1 sm:flex-none gap-2" onClick={() => setIsAddModalOpen(true)}>
                                    <Plus className="w-4 h-4" /> {workspaceSection === 'assessments' ? t('doctor.historyTabs.assessments', 'Assessment') : t('doctor.addNote')}
                                </Button>
                            </div>
                        </div>

                        {/* Session History from Bookings */}
                        {workspaceSection === 'records' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    {t('doctor.sessionHistory')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const patientBookings = bookings
                                        .filter(b => b.PatientId === selectedPatient.id)
                                        .sort((a, b) => new Date(b.SessionStartTime) - new Date(a.SessionStartTime))

                                    if (patientBookings.length === 0) {
                                        return <p className="text-text-muted text-center py-4">{t('doctor.noSessionsFound')}</p>
                                    }

                                    const StatusMap = {
                                        0: { label: 'Pending', variant: 'warning' },
                                        1: { label: 'Confirmed', variant: 'primary' },
                                        2: { label: 'In Progress', variant: 'info' },
                                        3: { label: 'Completed', variant: 'success' },
                                        4: { label: 'Cancelled', variant: 'danger' },
                                        5: { label: 'No Show', variant: 'danger' },
                                    }

                                    return (
                                        <div className="space-y-2">
                                            {patientBookings.map(booking => {
                                                const statusInfo = StatusMap[booking.Status] || { label: 'Unknown', variant: 'secondary' }
                                                const sessionDate = booking.SessionStartTime ? new Date(booking.SessionStartTime) : null
                                                return (
                                                    <div key={booking.Id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5 text-sm text-text-muted">
                                                                <Calendar className="w-4 h-4" />
                                                                {sessionDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-sm text-text-muted">
                                                                <Clock className="w-4 h-4" />
                                                                {sessionDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || 'N/A'}
                                                            </div>
                                                            {booking.DurationMinutes && (
                                                                <span className="text-xs text-text-muted">{booking.DurationMinutes} min</span>
                                                            )}
                                                        </div>
                                                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                        )}

                        {/* Clinical Notes */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-text-heading">
                              {workspaceSection === 'assessments'
                                ? t('doctor.historyTabs.assessments', 'Patient assessments')
                                : t('doctor.clinicalNotes')}
                            </h3>
                            {historyLoading ? (
                                <div className="text-center py-12 text-text-muted">{t('common.loading')}</div>
                            ) : patientHistory.filter((record) => {
                                if (workspaceSection !== 'assessments') return true
                                const parsed = tryParseJSON(record.examNotes)
                                return Boolean(parsed?.assessment || parsed?.assessmentLevel || parsed?.recommendations)
                            }).length > 0 ? (
                                patientHistory.filter((record) => {
                                  if (workspaceSection !== 'assessments') return true
                                  const parsed = tryParseJSON(record.examNotes)
                                  return Boolean(parsed?.assessment || parsed?.assessmentLevel || parsed?.recommendations)
                                }).map((record) => {
                                    const parsed = tryParseJSON(record.examNotes)
                                    const actualNotes = parsed ? parsed.examNotes : record.examNotes
                                    const medications = parsed ? parsed.medications : record.medications

                                    return (
                                        <Card key={record.id} className="overflow-hidden border-border/50">
                                            <div className="bg-background px-4 md:px-6 py-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-muted">
                                                    <div className="flex items-center gap-1.5 font-bold italic text-text-heading">
                                                        <Calendar className="w-4 h-4" />
                                                        {record.date}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold italic text-text-heading">
                                                        <User className="w-4 h-4" />
                                                        {record.doctorName}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateResult(record)}
                                                    disabled={updatingResultId === record.id}
                                                >
                                                    {updatingResultId === record.id ? t('common.updating') : 'Update Result'}
                                                </Button>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-black italic uppercase tracking-widest text-text-muted mb-2">{t('doctor.sessionSummary')}</h4>
                                                    <p className="text-text-heading leading-relaxed font-bold">{record.testTypeName}</p>

                                                    {parsed && parsed.treatmentProgram && (
                                                        <div className="mt-2 text-sm text-text-muted">
                                                            <span className="font-bold text-primary">البرنامج العلاجي:</span> {parsed.treatmentProgram} ({parsed.treatmentProgramSessions} جلسات)
                                                        </div>
                                                    )}

                                                    {parsed && parsed.assessment && (
                                                        <div className="mt-2 text-sm text-text-muted">
                                                            <span className="font-bold text-primary">تقييم المعالج:</span> {parsed.assessment}
                                                            {parsed.assessmentLevel && <span className="ms-2 inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">{parsed.assessmentLevel}</span>}
                                                        </div>
                                                    )}

                                                    {parsed && parsed.recommendations && (
                                                        <div className="mt-2 text-sm text-text-muted">
                                                            <span className="font-bold text-primary">التوصيات:</span> {parsed.recommendations}
                                                        </div>
                                                    )}

                                                    {!!actualNotes && (
                                                        <div className="mt-2">
                                                            <span className="font-bold text-xs text-text-muted uppercase">ملاحظات:</span>
                                                            <p className="text-text-light mt-1 whitespace-pre-wrap">{actualNotes}</p>
                                                        </div>
                                                    )}

                                                    {!!record.result && <p className="text-primary mt-2">Result: {record.result}</p>}
                                                </div>
                                                {medications && medications.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-black italic uppercase tracking-widest text-text-muted mb-2">{t('doctor.prescribedMedications')}</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {typeof medications === 'string' ? (
                                                                medications.split(',').map((med, idx) => (
                                                                    <Badge key={idx} variant="primary" className="flex items-center gap-1 bg-primary/5 text-primary border-primary/20">
                                                                        <Pill className="w-3 h-3" /> {med.trim()}
                                                                    </Badge>
                                                                ))
                                                            ) : Array.isArray(medications) ? (
                                                                medications.map((med, idx) => (
                                                                    <Badge key={idx} variant="primary" className="flex items-center gap-1 bg-primary/5 text-primary border-primary/20">
                                                                        <Pill className="w-3 h-3" /> {med}
                                                                    </Badge>
                                                                ))
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )
                                })
                            ) : (
                                <div className="text-center py-20 bg-background-paper rounded-3xl border-2 border-dashed border-border">
                                    <FileText className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-text-heading mb-2">{t('doctor.noClinicalRecords')}</h3>
                                    <p className="text-text-muted">{t('doctor.addSessionNote')}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={`${t('doctor.addClinicalRecordFor')} ${selectedPatient?.name}`}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.testType')}</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedTestTypeId}
                                    onChange={(e) => setSelectedTestTypeId(e.target.value)}
                                    className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                                >
                                    {testTypes.length === 0 ? (
                                        <option value="">{t('doctor.noTestTypesAvailable')}</option>
                                    ) : (
                                        testTypes.map((type) => (
                                            <option key={type.ID} value={String(type.ID)}>{type.Name}</option>
                                        ))
                                    )}
                                </select>
                                <Button variant="outline" className="shrink-0 whitespace-nowrap" onClick={handleCreateTestType} disabled={creatingType}>
                                    {creatingType ? t('common.saving') : t('doctor.createTestType')}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.treatmentProgram')}</label>
                            <select
                                value={newRecord.treatmentProgram}
                                onChange={(e) => setNewRecord({ ...newRecord, treatmentProgram: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                            >
                                <option value="">{t('doctor.noProgramOption')}</option>
                                <option value="برنامج إدارة القلق">{t('doctor.anxietyProgram')}</option>
                                <option value="برنامج علاج الاكتئاب">{t('doctor.depressionProgram')}</option>
                                <option value="برنامج التخلص من التوتر">{t('doctor.stressProgram')}</option>
                                <option value="برنامج تعزيز الثقة بالنفس">{t('doctor.selfEsteemProgram')}</option>
                                <option value="برنامج التحكم في الغضب">{t('doctor.angerProgram')}</option>
                                <option value="برنامج الدعم السلوكي المعرفي">{t('doctor.cbtProgram')}</option>
                                <option value="custom">{t('doctor.customProgramOption')}</option>
                            </select>
                        </div>
                    </div>

                    {newRecord.treatmentProgram === 'custom' && (
                        <div className="space-y-2">
                            <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.customProgramName')}</label>
                            <input
                                type="text"
                                value={newRecord.customProgram}
                                onChange={(e) => setNewRecord({ ...newRecord, customProgram: e.target.value })}
                                placeholder={t('doctor.enterProgramName')}
                                className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                            />
                        </div>
                    )}

                    {newRecord.treatmentProgram && (
                        <div className="space-y-2">
                            <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.programSessionsTotal')}</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={newRecord.programSessions}
                                onChange={(e) => setNewRecord({ ...newRecord, programSessions: parseInt(e.target.value) || 8 })}
                                className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.assessmentSummary')}</label>
                            <input
                                type="text"
                                value={newRecord.assessment}
                                onChange={(e) => setNewRecord({ ...newRecord, assessment: e.target.value })}
                                placeholder={t('doctor.assessmentSummaryPlaceholder')}
                                className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.severityLevel')}</label>
                            <select
                                value={newRecord.assessmentLevel}
                                onChange={(e) => setNewRecord({ ...newRecord, assessmentLevel: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                            >
                                <option value="">{t('doctor.selectSeverityLevel')}</option>
                                <option value="خفيف (Mild)">{t('doctor.severityMild')}</option>
                                <option value="متوسط (Moderate)">{t('doctor.severityModerate')}</option>
                                <option value="شديد (Severe)">{t('doctor.severitySevere')}</option>
                                <option value="عاجل (Urgent)">{t('doctor.severityUrgent')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.therapistRecommendations')}</label>
                        <textarea
                            value={newRecord.recommendations}
                            onChange={(e) => setNewRecord({ ...newRecord, recommendations: e.target.value })}
                            placeholder={t('doctor.recommendationsPlaceholder')}
                            className="w-full h-24 p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-text"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.sessionSummary')}</label>
                        <textarea
                            value={newRecord.summary}
                            onChange={(e) => setNewRecord({ ...newRecord, summary: e.target.value })}
                            placeholder={t('doctor.sessionSummaryPlaceholder')}
                            className="w-full h-32 p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-text"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">{t('doctor.medications')}</label>
                        <input
                            type="text"
                            value={newRecord.medications}
                            onChange={(e) => setNewRecord({ ...newRecord, medications: e.target.value })}
                            placeholder={t('doctor.medicationsPlaceholder')}
                            className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button className="flex-1 gap-2" onClick={handleAddRecord}>
                            <Save className="w-4 h-4" /> {t('common.save')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
