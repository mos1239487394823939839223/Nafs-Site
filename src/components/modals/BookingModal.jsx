import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input, { Select } from '../ui/Input'
import Badge from '../ui/Badge'
import { Search, CalendarToday as Calendar, AccessTime as Clock, Star, Sync as Loader2, MedicalServices as Stethoscope } from '@mui/icons-material'
import { patientAPI } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'

export default function BookingModal({ isOpen, onClose }) {
  const { t, isRTL } = useLanguage()
  const toast = useToast()
  const [step, setStep] = useState(1) // 1: Select Doctor, 2: Select Time, 3: Confirm
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Fetch doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSlots()
    }
  }, [selectedDoctor, selectedDate])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await patientAPI.getAllDoctors(1, 50)
      if (response?.IsSuccess !== false && response?.Data) {
        const items = response.Data.Items || response.Data || []
        setDoctors(Array.isArray(items) ? items : [])
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async () => {
    try {
      setSlotsLoading(true)
      const doctorId = selectedDoctor?.Id || selectedDoctor?.id
      const response = await patientAPI.getDoctorSlots(doctorId, selectedDate, selectedDate)
      if (response?.IsSuccess !== false && response?.Data) {
        const slots = response.Data || []
        setAvailableSlots(Array.isArray(slots) ? slots : [])
      } else {
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error)
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please select all booking details')
      return
    }

    setBookingLoading(true)
    try {
      const doctorId = selectedDoctor?.Id || selectedDoctor?.id
      const sessionStartTime = `${selectedDate}T${selectedTime}:00`

      const bookingData = {
        DoctorId: doctorId,
        SessionStartTime: sessionStartTime,
        DurationMinutes: 30,
      }

      const response = await patientAPI.createBooking(bookingData)

      if (response?.IsSuccess !== false) {
        toast.success('Appointment booked successfully!')
        onClose()
        setStep(1)
        setSelectedDoctor(null)
        setSelectedDate('')
        setSelectedTime('')
      } else {
        toast.error(response?.Message || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.response?.data?.Message || 'Failed to book appointment')
    } finally {
      setBookingLoading(false)
    }
  }

  // Generate time slots from available slots or use fallback
  const getTimeSlots = () => {
    if (availableSlots.length > 0) {
      return availableSlots.map(slot => ({
        time: slot.StartTime || slot.start,
        label: slot.StartTime || slot.start,
        available: slot.IsAvailable !== false,
      }))
    }
    // Fallback time slots
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ].map(t => ({ time: t, label: t, available: true }))
  }

  const timeSlots = getTimeSlots()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('patient.bookAppointment')} size="lg">
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-text-muted/50'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">{t('patient.selectDoctor', 'Select Doctor')}</span>
            </div>
            <div className="w-12 h-0.5 bg-border/50"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-text-muted/50'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'}`}>
                2
              </div>
              <span className="text-sm font-medium">{t('patient.selectTime', 'Select Time')}</span>
            </div>
            <div className="w-12 h-0.5 bg-border/50"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-text-muted/50'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-background-subtle text-text-muted'}`}>
                3
              </div>
              <span className="text-sm font-medium">{t('patient.confirm', 'Confirm')}</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">{t('patient.noDoctorsFound', 'No doctors available')}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doctors.map((doctor) => {
                  const doctorId = doctor.Id || doctor.id
                  const doctorName = doctor.Name || doctor.name || t('common.doctor')
                  const specialty = doctor.Specialist?.join(', ') || doctor.specialty || t('common.general')
                  const fee = doctor.ConsultationFee || doctor.price || 'N/A'

                  return (
                    <div
                      key={doctorId}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${(selectedDoctor?.Id || selectedDoctor?.id) === doctorId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-heading">{t('common.dr', 'Dr.')} {doctorName}</h4>
                          <p className="text-sm text-text-muted mt-1">{specialty}</p>
                          {doctor.Description && (
                            <p className="text-xs text-text-muted mt-1 line-clamp-2">{doctor.Description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {fee !== 'N/A' && (
                            <>
                              <p className="text-2xl font-bold text-primary" dir="ltr">{fee} EGP</p>
                              <p className="text-xs text-text-muted">{t('patient.perSession', 'per session')}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedDoctor}>
                {t('common.next')}
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
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedTime('')
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-heading mb-3">
                {t('patient.availableTimeSlots')}
              </label>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.filter(s => s.available).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${selectedTime === slot.time
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary text-text-muted hover:text-text'
                        }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t('common.back')}
              </Button>
              <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}>
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <div className="bg-background-subtle p-6 rounded-lg mb-6 border border-border">
              <h3 className="font-semibold text-text-heading mb-4">{t('patient.bookingSummary')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('common.doctor')}:</span>
                  <span className="font-medium text-text-heading">
                    {t('common.dr', 'Dr.')} {selectedDoctor?.Name || selectedDoctor?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('common.specialty')}:</span>
                  <span className="font-medium text-text-heading">
                    {selectedDoctor?.Specialist?.join(', ') || selectedDoctor?.specialty || t('common.general')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('common.date')}:</span>
                  <span className="font-medium text-text-heading" dir="ltr">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('common.time')}:</span>
                  <span className="font-medium text-text-heading" dir="ltr">{selectedTime}</span>
                </div>
                {(selectedDoctor?.ConsultationFee || selectedDoctor?.price) && (
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-text-muted">Total:</span>
                    <span className="text-2xl font-bold text-primary" dir="ltr">
                      {selectedDoctor?.ConsultationFee || selectedDoctor?.price} EGP
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                {t('common.back')}
              </Button>
              <Button onClick={handleBooking} disabled={bookingLoading}>
                {bookingLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('common.saving', 'Booking...')}
                  </div>
                ) : (
                  t('patient.confirmAppointment')
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
