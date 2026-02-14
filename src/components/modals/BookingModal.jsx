import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input, { Select } from '../ui/Input'
import Badge from '../ui/Badge'
import { Search, Calendar, Clock, Star } from 'lucide-react'
import { useClinic } from '../../contexts/ClinicContext'

export default function BookingModal({ isOpen, onClose }) {
  const { doctors } = useClinic()
  const [step, setStep] = useState(1) // 1: Select Doctor, 2: Select Time, 3: Confirm
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]

  const handleBooking = () => {
    // Simulate booking
    alert('Appointment booked successfully!')
    onClose()
    setStep(1)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book an Appointment" size="lg">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-text-muted/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Select Doctor</span>
          </div>
          <div className="w-12 h-0.5 bg-border/50"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-text-muted/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Select Time</span>
          </div>
          <div className="w-12 h-0.5 bg-border/50"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-text-muted/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Confirm</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <Select label="Filter by Specialty">
              <option value="">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="general">General Medicine</option>
              <option value="dermatology">Dermatology</option>
              <option value="pediatrics">Pediatrics</option>
            </Select>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-heading">{doctor.name}</h4>
                    <p className="text-sm text-text-muted mt-1">{doctor.specialty}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-text-heading">{doctor.rating}</span>
                      </div>
                      <span className="text-sm text-text-muted">{doctor.experience}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{doctor.price} EGP</p>
                    <p className="text-xs text-text-muted">per session</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selectedDoctor}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Time */}
      {step === 2 && (
        <div>
          <div className="mb-6">
            <Input
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-heading mb-3">
              Available Time Slots
            </label>
            <div className="grid grid-cols-4 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary text-text-muted hover:text-text'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <div className="bg-background-subtle p-6 rounded-lg mb-6 border border-border">
            <h3 className="font-semibold text-text-heading mb-4">Booking Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Doctor:</span>
                <span className="font-medium text-text-heading">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Specialty:</span>
                <span className="font-medium text-text-heading">{selectedDoctor?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Date:</span>
                <span className="font-medium text-text-heading">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Time:</span>
                <span className="font-medium text-text-heading">{selectedTime}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="text-text-muted">Total:</span>
                <span className="text-2xl font-bold text-primary">{selectedDoctor?.price} EGP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={handleBooking}>
              Confirm & Pay
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
