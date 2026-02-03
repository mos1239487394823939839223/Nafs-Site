import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import CalendarGrid from '../../components/doctor/schedule/CalendarGrid'
import ScheduleSidebar from '../../components/doctor/schedule/ScheduleSidebar'

export default function Schedule() {
  const toast = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Mock data for initial state
  const [slots, setSlots] = useState({
    // Format: 'YYYY-MM-DD-HOUR': 'status'
    // '2023-11-20-10': 'booked'
  })

  const [saving, setSaving] = useState(false)

  // Calculate stats for sidebar
  const today = new Date().toISOString().split('T')[0]
  const todayStats = Object.entries(slots).reduce((acc, [key, status]) => {
    if (key.startsWith(today)) {
      if (status === 'booked') acc.bookedHours += 1
      if (status === 'available') acc.availableSlots += 1
    }
    return acc
  }, { totalSessions: 0, availableSlots: 0, bookedHours: 0 })
  
  todayStats.totalSessions = todayStats.availableSlots + todayStats.bookedHours

  const handleSlotClick = (date, hour) => {
    const key = `${date.toISOString().split('T')[0]}-${hour}`
    
    setSlots(prev => {
      const current = prev[key]
      const newSlots = { ...prev }
      
      if (current === 'available') {
        delete newSlots[key] // Toggle off
      } else {
        newSlots[key] = 'available' // Toggle on
      }
      return newSlots
    })
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Availability schedule updated successfully')
    }, 1000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
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

      {/* Main Grid */}
      <div className="grid md:grid-cols-4 gap-8">
        {/* Calendar Area */}
        <div className="md:col-span-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <CalendarGrid 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    slots={slots}
                    onSlotClick={handleSlotClick}
                />
            </motion.div>
        </div>

        {/* Sidebar */}
        <ScheduleSidebar stats={todayStats} />
      </div>
    </div>
  )
}
