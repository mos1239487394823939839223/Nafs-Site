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

export default function MedicalHistory() {
    const { user } = useAuth()
    const toast = useToast()

    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newRecord, setNewRecord] = useState({ summary: '', medications: '' })
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    // Local medical records (stored in memory since there's no dedicated medical history API)
    const [localRecords, setLocalRecords] = useState(() => {
        try {
            const stored = localStorage.getItem('nafs_medical_records')
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    })

    // Fetch bookings from API to extract patient list
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true)
                const response = await doctorAPI.getBookings(0, 100)
                if (response.IsSuccess && response.Data) {
                    setBookings(response.Data.Items || [])
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error)
                toast.error('Failed to load patient data')
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

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
            const completedSessions = patientBookings.filter(b => b.Status === 3).length
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

    const filteredPatients = myPatients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const patientHistory = localRecords.filter(h => h.patientId === selectedPatient?.id)

    // Save records to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('nafs_medical_records', JSON.stringify(localRecords))
    }, [localRecords])

    const handleAddRecord = () => {
        if (!newRecord.summary) {
            toast.error('Please enter a summary')
            return
        }

        const record = {
            id: Date.now().toString(),
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            date: new Date().toISOString().split('T')[0],
            doctorName: user?.name || user?.Name || 'Doctor',
            summary: newRecord.summary,
            medications: newRecord.medications.split(',').map(m => m.trim()).filter(m => m)
        }

        setLocalRecords(prev => [record, ...prev])

        toast.success('Medical record added successfully')
        setIsAddModalOpen(false)
        setNewRecord({ summary: '', medications: '' })
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
                                <h1 className="text-3xl font-bold mb-2 text-text-heading">Patients Medical History</h1>
                                <p className="text-text-muted">Access and manage patient clinical records</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-gray" />
                                <input
                                    type="text"
                                    placeholder="Search patient name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                                />
                            </div>
                        </div>

                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-20 bg-background-paper rounded-3xl border-2 border-dashed border-border">
                                <User className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold text-text-heading mb-2">No patients found</h3>
                                <p className="text-text-muted">Patients will appear here once they book sessions with you.</p>
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
                                    <p className="text-text-muted text-sm">Clinical history and notes • {selectedPatient.totalSessions} sessions</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" className="flex-1 sm:flex-none gap-2" onClick={() => {
                                    window.location.href = '/dashboard/doctor/messages'
                                }}>
                                    <MessageSquare className="w-4 h-4" /> Message
                                </Button>
                                <Button className="flex-1 sm:flex-none gap-2" onClick={() => setIsAddModalOpen(true)}>
                                    <Plus className="w-4 h-4" /> Add Note
                                </Button>
                            </div>
                        </div>

                        {/* Session History from Bookings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Session History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const patientBookings = bookings
                                        .filter(b => b.PatientId === selectedPatient.id)
                                        .sort((a, b) => new Date(b.SessionStartTime) - new Date(a.SessionStartTime))

                                    if (patientBookings.length === 0) {
                                        return <p className="text-text-muted text-center py-4">No sessions found</p>
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

                        {/* Clinical Notes */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-text-heading">Clinical Notes</h3>
                            {patientHistory.length > 0 ? (
                                patientHistory.map((record) => (
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
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <h4 className="text-xs font-black italic uppercase tracking-widest text-text-muted mb-2">Session Summary</h4>
                                                <p className="text-text-heading leading-relaxed">{record.summary}</p>
                                            </div>
                                            {record.medications && record.medications.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-black italic uppercase tracking-widest text-text-muted mb-2">Prescribed Medications</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {record.medications.map((med, idx) => (
                                                            <Badge key={idx} variant="primary" className="flex items-center gap-1 bg-primary/5 text-primary border-primary/20">
                                                                <Pill className="w-3 h-3" /> {med}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-background-paper rounded-3xl border-2 border-dashed border-border">
                                    <FileText className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-text-heading mb-2">No clinical records found</h3>
                                    <p className="text-text-muted">Start by adding a new session note for this patient.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={`Add Clinical Record for ${selectedPatient?.name}`}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">Session Summary</label>
                        <textarea
                            value={newRecord.summary}
                            onChange={(e) => setNewRecord({ ...newRecord, summary: e.target.value })}
                            placeholder="Describe the session highlights, patient progress, etc..."
                            className="w-full h-40 p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-text"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black italic text-text-muted uppercase tracking-tighter">Medications (comma-separated)</label>
                        <input
                            type="text"
                            value={newRecord.medications}
                            onChange={(e) => setNewRecord({ ...newRecord, medications: e.target.value })}
                            placeholder="e.g. Aspirin, Ibuprofen"
                            className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                        />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1 gap-2" onClick={handleAddRecord}>
                            <Save className="w-4 h-4" /> Save Record
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
