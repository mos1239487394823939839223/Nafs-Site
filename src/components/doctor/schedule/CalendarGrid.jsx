import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarGrid({ selectedDate, onDateChange, slots, onSlotClick }) {
  const hours = Array.from({ length: 9 }, (_, i) => i + 9) // 9 AM to 5 PM
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Helper to generate dates for the current week view
  const getWeekDates = (baseDate) => {
    const dates = []
    const current = new Date(baseDate)
    current.setDate(current.getDate() - current.getDay()) // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const weekDates = getWeekDates(selectedDate)

  // Navigate weeks
  const changeWeek = (direction) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction * 7))
    onDateChange(newDate)
  }

  const getSlotStatus = (date, hour) => {
    const key = `${date.toISOString().split('T')[0]}-${hour}`
    return slots[key] || 'none' // 'available', 'booked', 'none'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border-light flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <button 
              onClick={() => changeWeek(-1)}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-text-light" />
            </button>
            <button 
              onClick={() => changeWeek(1)}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-text-light" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onDateChange(new Date())}
                className="px-3 py-1 text-sm bg-white border border-border-light rounded-lg text-text-light hover:text-primary transition-colors"
            >
                Today
            </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-border-light">
            <div className="p-4 text-center font-medium text-text-light border-r border-border-light bg-background/50">
              Time
            </div>
            {weekDates.map((date, i) => (
              <div key={i} className={`p-4 text-center border-r border-border-light last:border-r-0 ${
                date.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''
              }`}>
                <div className="text-sm font-medium text-text-light">{days[date.getDay()]}</div>
                <div className={`text-lg font-bold ${
                    date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-text'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border-light last:border-b-0">
              {/* Time Label */}
              <div className="p-3 text-sm text-text-light font-medium border-r border-border-light bg-background/50 flex items-center justify-center">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>

              {/* Day Slots */}
              {weekDates.map((date, i) => {
                const status = getSlotStatus(date, hour)
                const isPast = date < new Date().setHours(0,0,0,0)

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isPast || status === 'booked'}
                    onClick={() => onSlotClick(date, hour)}
                    className={`h-16 border-r border-border-light last:border-r-0 transition-all relative group ${
                        isPast ? 'bg-gray-50 cursor-not-allowed' :
                        status === 'booked' ? 'bg-primary-light/20 cursor-not-allowed' :
                        status === 'available' ? 'bg-sage text-white' :
                        'hover:bg-gray-50'
                    }`}
                  >
                    {/* Content */}
                    <div className="flex flex-col items-center justify-center h-full">
                        {status === 'booked' && (
                            <span className="text-xs font-semibold text-primary">Booked</span>
                        )}
                        {status === 'available' && (
                             <span className="text-xs font-medium">Available</span>
                        )}
                        {!isPast && status === 'none' && (
                            <span className="opacity-0 group-hover:opacity-100 text-xs text-sage-dark font-medium transition-opacity">
                                Add Slot
                            </span>
                        )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
