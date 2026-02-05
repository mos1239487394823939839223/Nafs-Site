import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Search, Stethoscope, Calendar, Clock, ChevronRight, User, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import CalendarGrid from '../../components/doctor/schedule/CalendarGrid'

// Mock Data
const specialties = [
    'Psychiatry',
    'Clinical Psychology',
    'Family Counseling',
    'Child Behavior',
    'Addiction Recovery'
]

const doctors = [
    { id: 1, name: 'Dr. Ahmed Hassan', specialty: 'Psychiatry', rating: 4.9, image: null, bio: 'Expert in clinical psychiatry with 15 years of experience.' },
    { id: 2, name: 'Dr. Fatima Ali', specialty: 'Clinical Psychology', rating: 4.8, image: null, bio: 'Specializing in CBT and anxiety disorders.' },
    { id: 3, name: 'Dr. Mohamed Saad', specialty: 'Psychiatry', rating: 4.7, image: null, bio: 'Focuses on depression and mood disorders.' },
    { id: 4, name: 'Sarah Ahmed', specialty: 'Family Counseling', rating: 4.9, image: null, bio: 'Helping families navigate complex relationship dynamics.' },
]

export default function ReserveAppointment() {
    const [step, setStep] = useState(1) // 1: Specialty, 2: Doctor, 3: Calendar, 4: Success
    const [selectedSpecialty, setSelectedSpecialty] = useState('')
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [bookedSlot, setBookedSlot] = useState(null)
    const [doctorSearch, setDoctorSearch] = useState('')
    const [mainTab, setMainTab] = useState('reserve') // reserve, status

    // Mock Reservation Status Data
    const [reservations, setReservations] = useState([
        { id: 1, doctor: 'Dr. Ahmed Hassan', specialty: 'Psychiatry', date: '2026-02-10', time: '10:00 AM', status: 'confirmed' },
        { id: 2, doctor: 'Dr. Fatima Ali', specialty: 'Clinical Psychology', date: '2026-02-05', time: '02:00 PM', status: 'cancelled', reason: 'Emergency case' },
        { id: 3, doctor: 'Dr. Mohamed Saad', specialty: 'Psychiatry', date: '2026-01-25', time: '11:00 AM', status: 'completed' },
    ])

    const filteredDoctors = doctors.filter(d =>
        d.specialty === selectedSpecialty &&
        d.name.toLowerCase().includes(doctorSearch.toLowerCase())
    )

    // Mock slots for selected doctor
    const [slots, setSlots] = useState({
        [`${new Date().toISOString().split('T')[0]}-10`]: 'available',
        [`${new Date().toISOString().split('T')[0]}-14`]: 'available',
        [`${new Date(Date.now() + 86400000).toISOString().split('T')[0]}-11`]: 'available',
    })

    const handleCancelReservation = (id) => {
        setReservations(prev => prev.map(res =>
            res.id === id
                ? { ...res, status: 'cancelled', reason: 'Cancelled by patient' }
                : res
        ))
    }

    const handleSlotClick = (date, hour) => {
        const key = `${date.toISOString().split('T')[0]}-${hour}`
        if (slots[key] === 'available') {
            setBookedSlot({ date, hour })
            // In a real app, this would show a confirmation modal or proceed to payment
        }
    }

    const confirmBooking = () => {
        setStep(4)
        // Add new reservation to list
        const newRes = {
            id: Date.now(),
            doctor: selectedDoctor.name,
            specialty: selectedDoctor.specialty,
            date: bookedSlot.date.toISOString().split('T')[0],
            time: bookedSlot.hour > 12 ? `${bookedSlot.hour - 12}:00 PM` : `${bookedSlot.hour}:00 AM`,
            status: 'confirmed'
        }
        setReservations(prev => [newRes, ...prev])
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-text">Appointments</h1>
                    <p className="text-text-light">Manage and book your health sessions</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-8">
                <button
                    onClick={() => setMainTab('reserve')}
                    className={`px-6 py-3 font-medium transition-colors relative ${mainTab === 'reserve' ? 'text-primary' : 'text-text-light hover:text-text'
                        }`}
                >
                    Reserve Appointment
                    {mainTab === 'reserve' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setMainTab('status')}
                    className={`px-6 py-3 font-medium transition-colors relative ${mainTab === 'status' ? 'text-primary' : 'text-text-light hover:text-text'
                        }`}
                >
                    My Reservation Status
                    {mainTab === 'status' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
            </div>

            {mainTab === 'reserve' ? (
                <div className="space-y-6">
                    {step > 1 && step < 4 && (
                        <div className="flex justify-start">
                            <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {specialties.map((specialty) => (
                                    <Card
                                        key={specialty}
                                        hover
                                        className="cursor-pointer group p-6 text-center border-2 border-transparent hover:border-primary/50 transition-all"
                                        onClick={() => {
                                            setSelectedSpecialty(specialty)
                                            setStep(2)
                                        }}
                                    >
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Stethoscope className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-text">{specialty}</h3>
                                        <p className="text-text-light text-sm mt-2">View available experts in this field</p>
                                    </Card>
                                ))}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5 text-primary" />
                                        Available Doctors for {selectedSpecialty}
                                    </h2>
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
                                    {filteredDoctors.map((doctor) => (
                                        <Card key={doctor.id} className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-8 h-8 text-secondary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                                                    <p className="text-primary text-sm font-medium">{doctor.specialty}</p>
                                                    <p className="text-text-light text-sm mt-2 line-clamp-2">{doctor.bio}</p>
                                                    <Button
                                                        className="mt-4 w-full"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedDoctor(doctor)
                                                            setStep(3)
                                                        }}
                                                    >
                                                        Select Doctor
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid lg:grid-cols-3 gap-8"
                            >
                                <div className="lg:col-span-2">
                                    <CardHeader className="px-0">
                                        <CardTitle>Select a Time Slot</CardTitle>
                                    </CardHeader>
                                    <CalendarGrid
                                        selectedDate={selectedDate}
                                        onDateChange={setSelectedDate}
                                        slots={slots}
                                        onSlotClick={handleSlotClick}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Card className="p-6 border-l-4 border-l-primary">
                                        <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-text-light">Doctor</p>
                                                    <p className="font-medium">{selectedDoctor?.name}</p>
                                                </div>
                                            </div>
                                            {bookedSlot && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs text-text-light">Selected Time</p>
                                                        <p className="font-medium">
                                                            {bookedSlot.date.toLocaleDateString()} at {bookedSlot.hour > 12 ? `${bookedSlot.hour - 12} PM` : `${bookedSlot.hour} AM`}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            className="w-full mt-8"
                                            disabled={!bookedSlot}
                                            onClick={confirmBooking}
                                        >
                                            Confirm Appointment
                                        </Button>
                                    </Card>
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 italic text-sm text-blue-700">
                                        Note: Appointment availability is managed by the healthcare professional.
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-md mx-auto text-center py-12"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <CheckCircle className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-bold text-text mb-4">Booking Confirmed!</h2>
                                <p className="text-text-light mb-8">
                                    Your appointment with {selectedDoctor?.name} has been successfully scheduled.
                                    You will receive a notification before the session starts.
                                </p>
                                <Button className="w-full" onClick={() => setStep(1)}>
                                    Done
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="grid gap-4">
                        {reservations.length > 0 ? (
                            reservations.map((res) => (
                                <Card key={res.id} className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{res.doctor}</h3>
                                                <p className="text-text-light text-sm">{res.specialty}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 text-text">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="font-medium">{res.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-text-light mt-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{res.time}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        res.status === 'confirmed' ? 'primary' :
                                                            res.status === 'cancelled' ? 'danger' :
                                                                'secondary'
                                                    }
                                                >
                                                    {res.status.toUpperCase()}
                                                </Badge>

                                                {res.status === 'confirmed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                                        onClick={() => handleCancelReservation(res.id)}
                                                        title="Cancel Appointment"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {res.status === 'cancelled' && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                                            <span className="font-bold">Reason for cancellation:</span> {res.reason}
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-background-gray/20 rounded-2xl border-2 border-dashed border-border">
                                <Calendar className="w-16 h-16 text-text-light mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-medium text-text-light">No reservations found</h3>
                                <p className="text-text-light mt-2">You haven't booked any appointments yet.</p>
                                <Button className="mt-6" variant="outline" onClick={() => setMainTab('reserve')}>
                                    Book Now
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
