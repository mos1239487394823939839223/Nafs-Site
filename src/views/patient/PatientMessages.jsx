import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Stethoscope,
    Users,
    ChevronRight,
    ArrowLeft,
    Send,
    User,
    Headphones,
    CheckCircle,
    Clock
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ChatWindow from '../../components/chat/ChatWindow'
import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'


export default function PatientMessages() {
    const { user } = useAuth()
    const { addMessage, addTicket, startNewConsultation, doctors, messages } = useClinic()

    const [mode, setMode] = useState('selection') // selection, doctor-list, chat
    const [target, setTarget] = useState(null) // 'doctor' or 'staff'
    const [activeConversation, setActiveConversation] = useState(null)
    const [isWaitingForStaff, setIsWaitingForStaff] = useState(false)
    const [doctorSearch, setDoctorSearch] = useState('')

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(doctorSearch.toLowerCase())
    )

    const handleStartStaffChat = () => {
        setIsWaitingForStaff(true)
        const consultationId = `staff-chat-${user?.name || 'guest'}`

        setTimeout(() => {
            setIsWaitingForStaff(false)
            const staffChat = {
                id: consultationId,
                participant: { name: 'Support Staff', role: 'staff', online: true },
                messages: [
                    { id: 1, sender: 'other', content: 'Hello! How can we help you today?', timestamp: new Date().toISOString() }
                ],
                lastMessage: 'Hello! How can we help you today?'
            }
            startNewConsultation(staffChat)
            setActiveConversation(staffChat)
            setMode('chat')
        }, 1500)
    }

    const startDoctorChat = (doctor) => {
        const consultationId = `doctor-${doctor.id}-${user?.name || 'guest'}`
        const docChat = {
            id: consultationId,
            participant: { ...doctor, role: 'doctor' },
            messages: [
                { id: 1, sender: 'other', content: `Hello! This is ${doctor.name}. How are you feeling today?`, timestamp: new Date().toISOString() }
            ],
            lastMessage: `Hello! This is ${doctor.name}. How are you feeling today?`
        }
        startNewConsultation(docChat)
        setActiveConversation(docChat)
        setMode('chat')
    }

    // Keep active conversation synced with context
    const currentConversation = activeConversation
        ? messages.find(m => m.id === activeConversation.id) || activeConversation
        : null

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <AnimatePresence mode="wait">
                {/* ... (selection, specialty, doctor-list steps unchanged) ... */}
                {mode === 'selection' && (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-8"
                    >
                        <h1 className="text-3xl font-bold text-text mb-4 text-center">How can we help you?</h1>
                        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                            <Card
                                className="p-8 cursor-pointer hover:border-primary border-2 border-transparent transition-all group"
                                onClick={() => {
                                    setTarget('doctor')
                                    setMode('doctor-list')
                                }}
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Stethoscope className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Contact a Doctor</h3>
                                <p className="text-text-light text-sm">Send a message to a specialized healthcare professional.</p>
                                <ChevronRight className="w-6 h-6 text-text-light mt-4 group-hover:translate-x-2 transition-transform" />
                            </Card>

                            <Card
                                className="p-8 cursor-pointer hover:border-secondary border-2 border-transparent transition-all group"
                                onClick={handleStartStaffChat}
                            >
                                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Headphones className="w-8 h-8 text-secondary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Talk to Support</h3>
                                <p className="text-text-light text-sm">Chat with our support team for platform-related help.</p>
                                <ChevronRight className="w-6 h-6 text-text-light mt-4 group-hover:translate-x-2 transition-transform" />
                            </Card>
                        </div>

                        {isWaitingForStaff && (
                            <div className="flex items-center gap-3 text-primary animate-pulse font-medium">
                                <Clock className="w-5 h-5" />
                                Please wait, connecting you to support...
                            </div>
                        )}
                    </motion.div>
                )}

                {/* (Specialty and Doctor List steps truncated for brevity as they are unchanged) */}

                {mode === 'doctor-list' && (
                    <motion.div
                        key="doctor-list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => setMode('selection')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <h2 className="text-2xl font-bold">Contact an Expert</h2>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                                <input
                                    type="text"
                                    placeholder="Search doctor name..."
                                    value={doctorSearch}
                                    onChange={(e) => setDoctorSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredDoctors.map(doctor => (
                                <Card key={doctor.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                                                    <User className="w-8 h-8 text-secondary" />
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${doctor.online ? 'bg-green-500' : 'bg-text-light'}`}></div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{doctor.name}</h3>
                                                <p className="text-text-light text-sm">{doctor.online ? 'Online' : 'Offline'}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" onClick={() => startDoctorChat(doctor)}>
                                            Message
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {currentConversation && mode === 'chat' && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-border"
                    >
                        <ChatWindow
                            conversation={currentConversation}
                            onBack={() => setMode('selection')}
                            onSendMessage={(msg) => {
                                const newMsg = {
                                    id: Date.now(),
                                    sender: 'current-user',
                                    content: msg.content,
                                    timestamp: new Date().toISOString(),
                                    from: user?.name || 'Patient',
                                    to: currentConversation.participant.name
                                }

                                addMessage(currentConversation.id, newMsg)

                                if (currentConversation.participant.role === 'staff') {
                                    addTicket({
                                        user: user?.name || 'Patient',
                                        role: 'patient',
                                        issue: msg.content,
                                        category: 'general',
                                        priority: 'medium',
                                        status: 'open'
                                    })
                                }
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    )
}
