import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, User, Plus, Calendar, Clock, ChevronRight, ArrowLeft, Save, Pill, MessageSquare } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'

export default function MedicalHistory() {
    const { user } = useAuth()
    const { medicalHistory, appointments, addMedicalRecord } = useClinic()
    const toast = useToast()

    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newRecord, setNewRecord] = useState({ summary: '', medications: '' })

    // Unique patients from appointments
    const doctorId = user?.id || user?.email
    const myPatients = Array.from(new Set(appointments
        .filter(app => app.doctorId === doctorId || app.doctorName === user?.name)
        .map(app => app.patientName)
    )).map(name => ({ name }))

    const filteredPatients = myPatients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const patientHistory = medicalHistory.filter(h => h.patientName === selectedPatient?.name)

    const handleAddRecord = () => {
        if (!newRecord.summary) {
            toast.error('Please enter a summary')
            return
        }

        addMedicalRecord({
            patientName: selectedPatient.name,
            date: new Date().toISOString().split('T')[0],
            doctorName: user?.name || 'Doctor',
            summary: newRecord.summary,
            medications: newRecord.medications.split(',').map(m => m.trim()).filter(m => m)
        })

        toast.success('Medical record added successfully')
        setIsAddModalOpen(false)
        setNewRecord({ summary: '', medications: '' })
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
                                <h1 className="text-3xl font-bold text-text mb-2 text-clinical-darkGray">Patients Medical History</h1>
                                <p className="text-text-light text-clinical-gray">Access and manage patient clinical records</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-gray" />
                                <input
                                    type="text"
                                    placeholder="Search patient name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPatients.map((patient, i) => (
                                <Card
                                    key={i}
                                    hover
                                    className="p-6 cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all group"
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <User className="w-7 h-7 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-clinical-darkGray truncate">{patient.name}</h3>
                                            <p className="text-sm text-clinical-gray">View medical history</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-clinical-gray group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                            ))}
                        </div>
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
                                    <h2 className="text-xl md:text-2xl font-bold text-clinical-darkGray truncate">{selectedPatient.name}</h2>
                                    <p className="text-clinical-gray text-sm">Clinical history and notes</p>
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

                        <div className="space-y-6">
                            {patientHistory.length > 0 ? (
                                patientHistory.map((record) => (
                                    <Card key={record.id} className="overflow-hidden border-border/50">
                                        <div className="bg-background px-4 md:px-6 py-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-clinical-gray">
                                                <div className="flex items-center gap-1.5 font-bold italic text-clinical-darkGray">
                                                    <Calendar className="w-4 h-4" />
                                                    {record.date}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-bold italic text-clinical-darkGray">
                                                    <User className="w-4 h-4" />
                                                    {record.doctorName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <h4 className="text-xs font-black italic uppercase tracking-widest text-clinical-gray mb-2">Session Summary</h4>
                                                <p className="text-clinical-darkGray leading-relaxed">{record.summary}</p>
                                            </div>
                                            {record.medications && record.medications.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-black italic uppercase tracking-widest text-clinical-gray mb-2">Prescribed Medications</h4>
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
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-border">
                                    <FileText className="w-16 h-16 text-clinical-gray mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-clinical-darkGray mb-2">No clinical records found</h3>
                                    <p className="text-clinical-gray">Start by adding a new session note for this patient.</p>
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
                        <label className="text-sm font-black italic text-clinical-gray uppercase tracking-tighter">Session Summary</label>
                        <textarea
                            value={newRecord.summary}
                            onChange={(e) => setNewRecord({ ...newRecord, summary: e.target.value })}
                            placeholder="Describe the session highlights, patient progress, etc..."
                            className="w-full h-40 p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black italic text-clinical-gray uppercase tracking-tighter">Medications (comma-separated)</label>
                        <input
                            type="text"
                            value={newRecord.medications}
                            onChange={(e) => setNewRecord({ ...newRecord, medications: e.target.value })}
                            placeholder="e.g. Aspirin, Ibuprofen"
                            className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
