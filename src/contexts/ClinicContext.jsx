import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ClinicContext = createContext()

// Helper to persist state to localStorage with tab synchronization
const usePersistedState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
        try {
            const stored = localStorage.getItem(key)
            return stored ? JSON.parse(stored) : defaultValue
        } catch (e) {
            return defaultValue
        }
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    // Synchronization across tabs
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === key && e.newValue) {
                setState(JSON.parse(e.newValue))
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [key])

    return [state, setState]
}

export function ClinicProvider({ children }) {
    // --- UTILS ---
    const getTodayStr = () => new Date().toISOString().split('T')[0]
    const getTomorrowStr = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    // --- STATE (MOCK DATABASE) ---

    // 0. Master User Registry (persistent across sessions)
    const [users, setUsers] = usePersistedState('clinic_users_registry', [
        { email: 'patient@example.com', password: 'password', name: 'Sarah Connor', role: 'patient' },
        {
            email: 'doctor@example.com', password: 'password', name: 'Dr. Ahmed Hassan',
            role: 'doctor', specialty: 'Psychiatry', rating: 4.9, bio: 'Expert in clinical psychiatry.', online: true
        },
        { email: 'admin@example.com', password: 'password', name: 'System Admin', role: 'admin' },
        { email: 'staff@example.com', password: 'password', name: 'Support Agent', role: 'staff' }
    ])

    // Derived Doctors list for booking
    const doctors = users.filter(u => u.role === 'doctor')

    // 1. Appointments
    const [appointments, setAppointments] = usePersistedState('clinic_appointments', [
        { id: 1, doctorId: 'doctor@example.com', doctorName: 'Dr. Ahmed Hassan', patientName: 'Sarah Connor', specialty: 'Psychiatry', date: getTodayStr(), time: '10:00 AM', status: 'waiting' },
        { id: 2, doctorId: 'fatima@example.com', doctorName: 'Dr. Fatima Ali', patientName: 'John Doe', specialty: 'Clinical Psychology', date: getTodayStr(), time: '11:00 AM', status: 'confirmed' },
    ])

    // 2. Support Tickets
    const [tickets, setTickets] = usePersistedState('clinic_tickets', [
        { id: 101, user: 'Sarah Connor', role: 'patient', issue: 'Trouble uploading medical history', category: 'technical', priority: 'high', status: 'open', time: '15 min ago' },
    ])

    // 3. Chat Conversations
    const [messages, setMessages] = usePersistedState('clinic_messages', [
        {
            id: 'admin-staff-1',
            participant: { name: 'Customer Service (Main)', role: 'staff', online: true },
            lastMessage: 'Admin, we need more staff for the night shift.',
            timestamp: new Date().toISOString(),
            messages: [{ id: 1, sender: 'other', content: 'Admin, we need more staff for the night shift.', timestamp: new Date(Date.now() - 3600000).toISOString() }]
        },
        {
            id: 'admin-doctor-1',
            participant: { name: 'Dr. Ahmed Hassan', role: 'doctor', online: true },
            lastMessage: 'Update on the new psychiatric protocols.',
            timestamp: new Date().toISOString(),
            messages: [{ id: 1, sender: 'other', content: 'Doctor, please review the new protocols sent to your email.', timestamp: new Date(Date.now() - 7200000).toISOString() }]
        }
    ])

    // 4. Doctor Availability (By Doctor Email)
    const [doctorAvailability, setDoctorAvailability] = usePersistedState('clinic_availability', {
        'doctor@example.com': { [getTodayStr()]: [10, 12, 14, 16], [getTomorrowStr()]: [9, 11, 13, 15] },
        'fatima@example.com': { [getTodayStr()]: [11, 13, 15], [getTomorrowStr()]: [10, 12, 14] }
    })

    // 5. Medical History
    const [medicalHistory, setMedicalHistory] = usePersistedState('clinic_medical_history', [
        { id: 1, patientName: 'Sarah Connor', date: '2026-01-20', doctorName: 'Dr. Ahmed Hassan', doctorId: 'doctor@example.com', summary: 'Patient reported improved mood.', medications: ['Aspirin'] },
    ])

    // 6. Notifications System
    const [notifications, setNotifications] = usePersistedState('clinic_notifications', [
        { id: 1, source: 'patient', message: 'Sarah Connor booked a session', time: '5m', type: 'appointment', role: 'staff' },
    ])

    // --- ACTIONS ---

    const addAppointment = useCallback((appointment) => {
        setAppointments(prev => [appointment, ...prev])
        addNotification({
            source: 'patient',
            message: `${appointment.patientName} booked with ${appointment.doctorName}`,
            time: 'Just now',
            type: 'appointment',
            role: 'staff'
        })
        const hour = parseInt(appointment.time)
        if (!isNaN(hour)) {
            removeDoctorSlot(appointment.doctorId, appointment.date, hour)
        }
    }, [])

    const updateAppointmentStatus = useCallback((id, status) => {
        setAppointments(prev => prev.map(app => {
            if (app.id === id) {
                addNotification({
                    source: 'system',
                    message: `Appointment for ${app.patientName} is now: ${status}`,
                    time: 'Just now',
                    type: 'status_update',
                    role: 'staff'
                })
                return { ...app, status }
            }
            return app
        }))
    }, [])

    const addTicket = useCallback((ticket) => {
        setTickets(prev => [{ ...ticket, id: Date.now() }, ...prev])
        addNotification({
            source: ticket.role,
            message: `New ticket from ${ticket.user}: ${ticket.issue.substring(0, 30)}...`,
            time: 'Just now',
            type: 'ticket',
            role: 'staff'
        })
    }, [])

    const updateTicketStatus = useCallback((id, status) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    }, [])

    const addChatMessage = useCallback((consultationId, message) => {
        setMessages(prev => {
            const exists = prev.find(c => c.id === consultationId)
            if (!exists) {
                // If message is sent to a non-existent room, we could create it here but better to use startNewConsultation
                console.warn(`Attempted to send message to non-existent consultation: ${consultationId}`)
                return prev
            }
            return prev.map(c =>
                c.id === consultationId
                    ? {
                        ...c,
                        messages: [...c.messages, { ...message, id: Date.now(), sender: message.sender === 'current-user' ? 'current-user' : 'other' }],
                        lastMessage: message.content,
                        timestamp: new Date().toISOString()
                    }
                    : c
            )
        })
    }, [])

    const startNewConsultation = useCallback((consultation) => {
        setMessages(prev => {
            if (prev.find(c => c.id === consultation.id)) return prev
            return [{ ...consultation, timestamp: new Date().toISOString() }, ...prev]
        })
    }, [])

    const updateDoctorSlots = useCallback((doctorId, date, slots) => {
        setDoctorAvailability(prev => ({
            ...prev,
            [doctorId]: { ...(prev[doctorId] || {}), [date]: slots }
        }))
    }, [])

    const removeDoctorSlot = useCallback((doctorId, date, hour) => {
        setDoctorAvailability(prev => {
            const currentSlots = prev[doctorId]?.[date] || []
            return {
                ...prev,
                [doctorId]: {
                    ...(prev[doctorId] || {}),
                    [date]: currentSlots.filter(h => h !== hour)
                }
            }
        })
    }, [])

    const addMedicalRecord = useCallback((record) => {
        setMedicalHistory(prev => [{ ...record, id: Date.now() }, ...prev])
    }, [])

    const addNotification = useCallback((notif) => {
        setNotifications(prev => [{ ...notif, id: Date.now() }, ...prev])
    }, [])

    const registerUser = useCallback((userData) => {
        setUsers(prev => {
            if (prev.find(u => u.email === userData.email)) return prev
            const newUser = { ...userData, id: userData.id || userData.email }
            return [...prev, newUser]
        })
    }, [setUsers])

    const updateUser = useCallback((email, updatedData) => {
        setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updatedData } : u))
    }, [setUsers])

    const resetClinicData = () => {
        localStorage.clear()
        window.location.reload()
    }

    return (
        <ClinicContext.Provider value={{
            users,
            doctors,
            appointments,
            tickets,
            messages,
            doctorAvailability,
            medicalHistory,
            notifications,
            registerUser,
            updateUser,
            addAppointment,
            updateAppointmentStatus,
            addTicket,
            updateTicketStatus,
            addMessage: addChatMessage,
            startNewConsultation,
            updateDoctorSlots,
            addMedicalRecord,
            addNotification,
            resetClinicData
        }}>
            {children}
        </ClinicContext.Provider>
    )
}

export const useClinic = () => {
    const context = useContext(ClinicContext)
    if (!context) throw new Error('useClinic must be used within ClinicProvider')
    return context
}
