import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

export default function CalendarGrid({ selectedDate, onDateChange, slots, onSlotClick, mode = 'doctor', selectedSlot = null }) {
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
    // Use local YYYY-MM-DD format to match the backend/fetch logic and avoid UTC shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const key = `${dateKey}-${hour}`;
    return slots[key] || 'none' // 'available', 'booked', 'none'
  }

  const isSelected = (date, hour) => {
    if (!selectedSlot) return false;
    const slotDate = selectedSlot.date;
    return slotDate.getFullYear() === date.getFullYear()
      && slotDate.getMonth() === date.getMonth()
      && slotDate.getDate() === date.getDate()
      && selectedSlot.hour === hour;
  }

  return (
    <div className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border-light flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => changeWeek(-1)}
              className="p-1 hover:bg-background-subtle rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-text-muted" />
            </button>
            <button
              onClick={() => changeWeek(1)}
              className="p-1 hover:bg-background-subtle rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 text-sm bg-background-paper border border-border rounded-lg text-text-muted hover:text-primary transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-4 text-center font-medium text-text-muted border-r border-border bg-background-subtle">
              Time
            </div>
            {weekDates.map((date, i) => (
              <div key={i} className={`p-4 text-center border-r border-border last:border-r-0 ${date.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''
                }`}>
                <div className="text-sm font-medium text-text-muted">{days[date.getDay()]}</div>
                <div className={`text-lg font-bold ${date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-text'
                  }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
              {/* Time Label */}
              <div className="p-3 text-sm text-text-muted font-medium border-r border-border bg-background-subtle flex items-center justify-center">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>

              {/* Day Slots */}
              {weekDates.map((date, i) => {
                const status = getSlotStatus(date, hour)
                const isPast = date < new Date().setHours(0, 0, 0, 0)

                const isPatient = mode === 'patient'
                const isDisabled = isPast || status === 'booked' || (isPatient && status === 'none')
                const selected = isSelected(date, hour)

                return (
                  <motion.button
                    key={i}
                    whileHover={!isDisabled ? { scale: 0.98 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    disabled={isDisabled}
                    onClick={() => onSlotClick(date, hour)}
                    className={`h-16 border-r border-border last:border-r-0 transition-all relative group ${isPast ? 'bg-gray-100 cursor-not-allowed opacity-50' :
                      status === 'booked' ? 'bg-orange-100 border-2 border-orange-300 cursor-not-allowed' :
                        selected ? 'bg-emerald-600 ring-4 ring-emerald-300 text-white cursor-pointer shadow-lg z-10' :
                          status === 'available' ? 'bg-emerald-100 border-2 border-emerald-400 cursor-pointer hover:bg-emerald-200' :
                            isPatient ? 'cursor-default' :
                              'hover:bg-background-subtle cursor-pointer'
                      }`}
                  >
                    {/* Content */}
                    <div className="flex flex-col items-center justify-center h-full">
                      {status === 'booked' && (
                        <span className="text-xs font-semibold text-orange-600">Booked</span>
                      )}
                      {selected && (
                        <span className="text-sm font-bold">✓ Selected</span>
                      )}
                      {status === 'available' && !selected && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-1"></div>
                          <span className="text-xs font-semibold text-emerald-700">Available</span>
                        </>
                      )}
                      {!isPast && status === 'none' && !isPatient && (
                        <span className="opacity-0 group-hover:opacity-100 text-xs text-primary font-medium transition-opacity">
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
