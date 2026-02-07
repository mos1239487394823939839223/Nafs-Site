import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import CalendarGrid from '../../components/doctor/schedule/CalendarGrid'
import ScheduleSidebar from '../../components/doctor/schedule/ScheduleSidebar'
import { useClinic } from '../../contexts/ClinicContext'
import { useAuth } from '../../contexts/AuthContext'

export default function Schedule() {
  const toast = useToast()
  const { user } = useAuth()
  const { doctorAvailability, updateDoctorSlots } = useClinic()
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Local state for editing before save
  const [localSlots, setLocalSlots] = useState({})
  const [saving, setSaving] = useState(false)

  // Current doctor ID
  const doctorId = user?.id || user?.email

  // Load slots from context on mount
  useEffect(() => {
    const docSlots = doctorAvailability[doctorId] || {}
    const mapped = {}
    Object.entries(docSlots).forEach(([date, hours]) => {
      hours.forEach(h => {
        mapped[`${date}-${h}`] = 'available'
      })
    })
    setLocalSlots(mapped)
  }, [doctorAvailability, doctorId])

  // Calculate stats for sidebar
  const todayStr = new Date().toISOString().split('T')[0]
  const todayStats = Object.entries(localSlots).reduce((acc, [key, status]) => {
    if (key.startsWith(todayStr)) {
      if (status === 'booked') acc.bookedHours += 1
      if (status === 'available') acc.availableSlots += 1
    }
    return acc
  }, { totalSessions: 0, availableSlots: 0, bookedHours: 0 })

  todayStats.totalSessions = todayStats.availableSlots + todayStats.bookedHours

  const handleSlotClick = (date, hour) => {
    const key = `${date.toISOString().split('T')[0]}-${hour}`
    setLocalSlots(prev => {
      const newSlots = { ...prev }
      if (newSlots[key] === 'available') {
        delete newSlots[key]
      } else {
        newSlots[key] = 'available'
      }
      return newSlots
    })
  }

  const handleSave = () => {
    setSaving(true)

    // Group localSlots back to { date: [hours] }
    const grouped = {}
    Object.entries(localSlots).forEach(([key, status]) => {
      if (status === 'available') {
        const [date, hour] = [key.slice(0, 10), parseInt(key.slice(11))]
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(hour)
      }
    })

    // Update context
    Object.entries(grouped).forEach(([date, hours]) => {
      updateDoctorSlots(doctorId, date, hours)
    })

    setTimeout(() => {
      setSaving(false)
      toast.success('Availability schedule updated successfully')
    }, 800)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">My Schedule</h1>
          <p className="text-text-light">Manage your weekly availability</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CalendarGrid
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              slots={localSlots}
              onSlotClick={handleSlotClick}
            />
          </motion.div>
        </div>

        <ScheduleSidebar stats={todayStats} />
      </div>
    </div>
  )
}
