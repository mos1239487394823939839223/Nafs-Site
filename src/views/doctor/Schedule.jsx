import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Save, Plus, Trash2, Ban, Loader2, ChevronLeft, ChevronRight, LayoutGrid, Clock, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

// Calendar helper functions
const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const days = []

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true, date: new Date(year, month, i) })
  }

  // Next month padding
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) })
  }

  return days
}

const formatDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function Schedule() {
  const toast = useToast()
  const { user } = useAuth()
  const { t } = useLanguage()

  // Day of week mapping
  const DayOfWeekNames = [t('doctor.sunday'), t('doctor.monday'), t('doctor.tuesday'), t('doctor.wednesday'), t('doctor.thursday'), t('doctor.friday'), t('doctor.saturday')]
  const DayOfWeekShort = [t('doctor.sun'), t('doctor.mon'), t('doctor.tue'), t('doctor.wed'), t('doctor.thu'), t('doctor.fri'), t('doctor.sat')]

  const SlotDurationLabels = { 30: '30 ' + t('doctor.min'), 45: '45 ' + t('doctor.min') }

  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // View mode: 'calendar' or 'cards'
  const [viewMode, setViewMode] = useState('calendar')

  // Calendar state
  const today = new Date()
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())
  const [calendarYear, setCalendarYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(null) // date string like '2026-02-21'

  // Weekly schedule form
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false)
  const [weeklySchedules, setWeeklySchedules] = useState([
    { DayOfWeek: 1, StartTime: '09:00', EndTime: '17:00', SlotDuration: 30 }
  ])

  // Add slot form
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [slotForm, setSlotForm] = useState({
    SpecificDate: '',
    StartTime: '09:00',
    EndTime: '10:00',
    SlotDuration: 30,
  })

  // Block time form
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [blockForm, setBlockForm] = useState({
    SpecificDate: '',
    StartTime: '09:00',
    EndTime: '17:00',
  })

  // Fetch availability
  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const response = await doctorAPI.getAvailability()
      if (response.IsSuccess && response.Data) {
        setAvailability(response.Data)
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      toast.error(t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  // Handle save weekly schedule
  const handleSaveWeekly = async () => {
    try {
      setSaving(true)
      const response = await doctorAPI.setWeeklySchedule(weeklySchedules)
      if (response.IsSuccess) {
        toast.success(t('success.scheduleSaved'))
        setIsWeeklyModalOpen(false)
        fetchAvailability()
      } else {
        toast.error(response.Message || t('errors.saveFailed'))
      }
    } catch (error) {
      console.error('Failed to save weekly schedule:', error)
      toast.error(t('errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  // Handle add time slot
  const handleAddSlot = async () => {
    if (!slotForm.SpecificDate) {
      toast.error(t('errors.selectDate'))
      return
    }
    try {
      setSaving(true)
      const response = await doctorAPI.addTimeSlot(
        slotForm.SpecificDate,
        slotForm.StartTime,
        slotForm.EndTime,
        slotForm.SlotDuration
      )
      if (response.IsSuccess) {
        toast.success(t('success.slotAdded'))
        setIsSlotModalOpen(false)
        setSlotForm({ SpecificDate: '', StartTime: '09:00', EndTime: '10:00', SlotDuration: 30 })
        fetchAvailability()
      } else {
        toast.error(response.Message || t('errors.saveFailed'))
      }
    } catch (error) {
      console.error('Failed to add time slot:', error)
      toast.error(t('errors.saveFailed'))
    } finally {
      setSaving(false)
  }
  }

  // Handle block time
  const handleBlockTime = async () => {
    if (!blockForm.SpecificDate) {
      toast.error(t('errors.selectDate'))
      return
    }
    try {
    setSaving(true)
      const response = await doctorAPI.blockTime(
        blockForm.SpecificDate,
        blockForm.StartTime,
        blockForm.EndTime
      )
      if (response.IsSuccess) {
        toast.success(t('success.timeBlocked'))
        setIsBlockModalOpen(false)
        setBlockForm({ SpecificDate: '', StartTime: '09:00', EndTime: '17:00' })
        fetchAvailability()
      } else {
        toast.error(response.Message || t('errors.saveFailed'))
      }
    } catch (error) {
      console.error('Failed to block time:', error)
      toast.error(t('errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  // Handle delete availability
  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      const response = await doctorAPI.deleteAvailability(id)
      if (response.IsSuccess) {
        toast.success(t('success.deleted'))
        setAvailability(prev => prev.filter(a => a.Id !== id))
      } else {
        toast.error(response.Message || t('errors.deleteFailed'))
      }
    } catch (error) {
      console.error('Failed to delete availability:', error)
      toast.error(t('errors.deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  // Add weekly schedule row
  const addWeeklyRow = () => {
    setWeeklySchedules(prev => [
      ...prev,
      { DayOfWeek: 1, StartTime: '09:00', EndTime: '17:00', SlotDuration: 30 }
    ])
  }

  const removeWeeklyRow = (index) => {
    setWeeklySchedules(prev => prev.filter((_, i) => i !== index))
  }

  const updateWeeklyRow = (index, field, value) => {
    setWeeklySchedules(prev => prev.map((row, i) =>
      i === index ? { ...row, [field]: field === 'DayOfWeek' || field === 'SlotDuration' ? parseInt(value) : value } : row
    ))
  }

  // Group availability by type (0=Blocked, 1=Weekly, 2=SpecificSlot)
  const weeklyAvailability = availability.filter(a => a.AvailabilityType === 1)
  const specificSlots = availability.filter(a => a.AvailabilityType === 2)
  const blockedSlots = availability.filter(a => a.AvailabilityType === 0)

  // Calendar helpers
  const calendarDays = getMonthDays(calendarYear, calendarMonth)
  const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const changeMonth = (dir) => {
    let newMonth = calendarMonth + dir
    let newYear = calendarYear
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setCalendarMonth(newMonth)
    setCalendarYear(newYear)
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCalendarMonth(today.getMonth())
    setCalendarYear(today.getFullYear())
    setSelectedDay(formatDateKey(today))
  }

  // Build a map of date → events for the calendar
  const buildDateEventsMap = () => {
    const map = {}

    // Weekly availability → applies to every matching day of week
    weeklyAvailability.forEach(slot => {
      if (slot.DayOfWeek === null || slot.DayOfWeek === undefined) return
      calendarDays.forEach(({ date, currentMonth }) => {
        if (!currentMonth) return
        if (date.getDay() === slot.DayOfWeek) {
          const key = formatDateKey(date)
          if (!map[key]) map[key] = []
          map[key].push({ ...slot, _type: 'weekly' })
        }
      })
    })

    // Specific slots
    specificSlots.forEach(slot => {
      if (!slot.SpecificDate) return
      const key = slot.SpecificDate
      if (!map[key]) map[key] = []
      map[key].push({ ...slot, _type: 'specific' })
    })

    // Blocked slots
    blockedSlots.forEach(slot => {
      if (!slot.SpecificDate) return
      const key = slot.SpecificDate
      if (!map[key]) map[key] = []
      map[key].push({ ...slot, _type: 'blocked' })
    })

    return map
  }

  const dateEventsMap = buildDateEventsMap()

  // Get events for selected day
  const selectedDayEvents = selectedDay ? (dateEventsMap[selectedDay] || []) : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">{t('doctor.mySchedule')}</h1>
          <p className="text-text-light">{t('doctor.manageAvailability')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex bg-background-subtle rounded-xl border border-border p-1 gap-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <CalendarIcon className="w-4 h-4 inline mr-1.5" />
              {t('doctor.calendar')}
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-1.5" />
              {t('doctor.cards')}
            </button>
          </div>
          <Button onClick={() => setIsWeeklyModalOpen(true)} className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            {t('doctor.setWeeklySchedule')}
          </Button>
          <Button variant="outline" onClick={() => setIsSlotModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('doctor.addSlot')}
          </Button>
          <Button variant="outline" onClick={() => setIsBlockModalOpen(true)} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <Ban className="w-4 h-4" />
            {t('doctor.blockTime')}
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : viewMode === 'calendar' ? (
        /* ==================== CALENDAR VIEW ==================== */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-background-paper rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-background-subtle">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-background-paper rounded-xl transition-colors border border-transparent hover:border-border"
                >
                  <ChevronLeft className="w-5 h-5 text-text-muted" />
                </button>
                <h2 className="text-xl font-bold text-text-heading min-w-[200px] text-center">{monthName}</h2>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-background-paper rounded-xl transition-colors border border-transparent hover:border-border"
                >
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
              >
                {t('doctor.today')}
              </button>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 border-b border-border">
              {DayOfWeekShort.map((day) => (
                <div key={day} className="p-3 text-center text-xs font-bold text-text-muted uppercase tracking-wider bg-background-subtle">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map(({ day, currentMonth, date }, idx) => {
                const dateKey = formatDateKey(date)
                const events = dateEventsMap[dateKey] || []
                const isToday = dateKey === formatDateKey(today)
                const isSelected = dateKey === selectedDay
                const hasWeekly = events.some(e => e._type === 'weekly')
                const hasSpecific = events.some(e => e._type === 'specific')
                const hasBlocked = events.some(e => e._type === 'blocked')

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                    className={`
                      relative min-h-[90px] sm:min-h-[110px] p-2 border-b border-r border-border text-left transition-all
                      ${!currentMonth ? 'opacity-30' : 'hover:bg-background-subtle'}
                      ${isSelected ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
                      ${idx % 7 === 6 ? 'border-r-0' : ''}
                    `}
                  >
                    {/* Day Number */}
                    <div className={`
                      text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-primary text-white' : 'text-text-heading'}
                    `}>
                      {day}
                    </div>

                    {/* Event Dots / Indicators */}
                    {currentMonth && events.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {hasWeekly && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-[10px] text-primary font-medium truncate hidden sm:block">
                              {events.find(e => e._type === 'weekly')?.StartTime} - {events.find(e => e._type === 'weekly')?.EndTime}
                            </span>
                          </div>
                        )}
                        {hasSpecific && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                            <span className="text-[10px] text-green-600 font-medium truncate hidden sm:block">
                              {t('doctor.slot')}
                            </span>
                          </div>
                        )}
                        {hasBlocked && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            <span className="text-[10px] text-red-500 font-medium truncate hidden sm:block">
                              {t('doctor.blocked')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="px-6 py-3 border-t border-border bg-background-subtle flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                {t('doctor.weeklySchedule')}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                {t('doctor.specificSlot')}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                {t('doctor.blocked')}
              </div>
            </div>
          </div>

          {/* Selected Day Detail Panel */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-background-paper rounded-2xl shadow-sm border border-border overflow-hidden"
              >
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-heading">
                      {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-text-muted mt-0.5">
                      {selectedDayEvents.length} {selectedDayEvents.length === 1 ? t('doctor.entry') : t('doctor.entries')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-2 hover:bg-background-subtle rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                <div className="p-5">
                  {selectedDayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayEvents.map((event, i) => (
                        <div
                          key={event.Id || i}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            event._type === 'weekly'
                              ? 'bg-primary/5 border-primary/20'
                              : event._type === 'specific'
                              ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20'
                              : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              event._type === 'weekly'
                                ? 'bg-primary/10'
                                : event._type === 'specific'
                                ? 'bg-green-100 dark:bg-green-500/10'
                                : 'bg-red-100 dark:bg-red-500/10'
                            }`}>
                              {event._type === 'weekly' ? (
                                <CalendarIcon className="w-5 h-5 text-primary" />
                              ) : event._type === 'specific' ? (
                                <Clock className="w-5 h-5 text-green-600" />
                              ) : (
                                <Ban className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-text-heading">
                                  {event.StartTime} - {event.EndTime}
                                </span>
                                <Badge variant={event._type === 'weekly' ? 'primary' : event._type === 'specific' ? 'success' : 'danger'}>
                                  {event._type === 'weekly' ? t('doctor.weekly') : event._type === 'specific' ? t('doctor.slot') : t('doctor.blocked')}
                                </Badge>
                              </div>
                              {event._type !== 'blocked' && (
                                <p className="text-xs text-text-muted mt-1">
                                  {t('doctor.duration')}: {SlotDurationLabels[event.SlotDuration] || `${event.SlotDuration} ${t('doctor.min')}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(event.Id)}
                            disabled={deletingId === event.Id}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingId === event.Id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-30" />
                      <p className="text-text-muted text-sm">{t('doctor.noAvailability')}</p>
                      <div className="flex gap-2 justify-center mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSlotForm(prev => ({ ...prev, SpecificDate: selectedDay }))
                            setIsSlotModalOpen(true)
                          }}
                          className="gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t('doctor.addSlot')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBlockForm(prev => ({ ...prev, SpecificDate: selectedDay }))
                            setIsBlockModalOpen(true)
                          }}
                          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          {t('doctor.block')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* ==================== CARDS VIEW ==================== */
        <div className="space-y-8">
          {/* Weekly Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-text-heading mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {t('doctor.weeklySchedule')}
            </h2>
            {weeklyAvailability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyAvailability.map((slot) => (
                  <div key={slot.Id} className="bg-background-paper border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-text-heading">
                          {slot.DayOfWeek !== null && slot.DayOfWeek !== undefined ? DayOfWeekNames[slot.DayOfWeek] : 'N/A'}
                        </span>
                        <Badge variant={slot.IsActive ? 'success' : 'danger'}>
                          {slot.IsActive ? t('common.active') : t('common.inactive')}
                        </Badge>
        </div>
                      <button
                        onClick={() => handleDelete(slot.Id)}
                        disabled={deletingId === slot.Id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === slot.Id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-text-muted space-y-1">
                      <p><strong>{t('doctor.time')}:</strong> {slot.StartTime} - {slot.EndTime}</p>
                      <p><strong>{t('doctor.slotDuration')}:</strong> {SlotDurationLabels[slot.SlotDuration] || `${slot.SlotDuration}`}</p>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
              <div className="text-center py-10 bg-background-paper rounded-2xl border-2 border-dashed border-border">
                <CalendarIcon className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">{t('doctor.noWeeklySchedule')}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsWeeklyModalOpen(true)}>
                  {t('doctor.setWeeklySchedule')}
        </Button>
              </div>
            )}
      </motion.div>

          {/* Specific Time Slots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-text-heading mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              {t('doctor.specificTimeSlots')}
            </h2>
            {specificSlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specificSlots.map((slot) => (
                  <div key={slot.Id} className="bg-background-paper border border-green-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="success">{t('doctor.specificSlot')}</Badge>
                      <button
                        onClick={() => handleDelete(slot.Id)}
                        disabled={deletingId === slot.Id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === slot.Id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-text-muted space-y-1">
                      <p><strong>{t('doctor.date')}:</strong> {slot.SpecificDate || 'N/A'}</p>
                      <p><strong>{t('doctor.time')}:</strong> {slot.StartTime} - {slot.EndTime}</p>
                      <p><strong>{t('doctor.duration')}:</strong> {SlotDurationLabels[slot.SlotDuration] || `${slot.SlotDuration}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-background-paper rounded-2xl border-2 border-dashed border-border">
                <p className="text-text-muted text-sm">{t('doctor.noSpecificSlots')}</p>
              </div>
            )}
          </motion.div>

          {/* Blocked Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-text-heading mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-primary-dark opacity-60" />
              {t('doctor.blockedTime')}
            </h2>
            {blockedSlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockedSlots.map((slot) => (
                  <div key={slot.Id} className="bg-background-subtle border border-primary-dark/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow opacity-80 hover:opacity-100">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="default" className="bg-primary-dark/10 text-primary-dark border-primary-dark/20">{t('doctor.blocked')}</Badge>
                      <button
                        onClick={() => handleDelete(slot.Id)}
                        disabled={deletingId === slot.Id}
                        className="p-2 text-primary-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === slot.Id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-text-muted space-y-1">
                      <p><strong>{t('doctor.date')}:</strong> {slot.SpecificDate || 'N/A'}</p>
                      <p><strong>{t('doctor.time')}:</strong> {slot.StartTime} - {slot.EndTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-background-paper rounded-2xl border-2 border-dashed border-border">
                <p className="text-text-muted text-sm">{t('doctor.noBlockedTimes')}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Weekly Schedule Modal */}
      <Modal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        title={t('doctor.setWeeklySchedule')}
        size="lg"
      >
        <div className="space-y-4">
          {weeklySchedules.map((row, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-background rounded-xl border border-border">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-semibold text-text-muted mb-1 block">{t('doctor.day')}</label>
                <select
                  value={row.DayOfWeek}
                  onChange={(e) => updateWeeklyRow(index, 'DayOfWeek', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background-paper text-text text-sm"
                >
                  {DayOfWeekNames.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[110px]">
                <label className="text-xs font-semibold text-text-muted mb-1 block">{t('doctor.start')}</label>
                <input
                  type="time"
                  value={row.StartTime}
                  onChange={(e) => updateWeeklyRow(index, 'StartTime', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background-paper text-text text-sm"
                />
              </div>
              <div className="min-w-[110px]">
                <label className="text-xs font-semibold text-text-muted mb-1 block">{t('doctor.end')}</label>
                <input
                  type="time"
                  value={row.EndTime}
                  onChange={(e) => updateWeeklyRow(index, 'EndTime', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background-paper text-text text-sm"
                />
              </div>
              <div className="min-w-[120px]">
                <label className="text-xs font-semibold text-text-muted mb-1 block">{t('doctor.slotDuration')}</label>
                <select
                  value={row.SlotDuration}
                  onChange={(e) => updateWeeklyRow(index, 'SlotDuration', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background-paper text-text text-sm"
                >
                  {Object.entries(SlotDurationLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              {weeklySchedules.length > 1 && (
                <button
                  onClick={() => removeWeeklyRow(index)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
        </div>
          ))}

          <Button variant="outline" size="sm" onClick={addWeeklyRow} className="gap-2 w-full">
            <Plus className="w-4 h-4" />
            {t('doctor.addDay')}
          </Button>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsWeeklyModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1 gap-2" onClick={handleSaveWeekly} disabled={saving}>
          {saving ? (
            <>
                  <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
                  {t('doctor.saveSchedule')}
            </>
          )}
        </Button>
          </div>
        </div>
      </Modal>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={t('doctor.addTimeSlot')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.date')}</label>
            <input
              type="date"
              value={slotForm.SpecificDate}
              onChange={(e) => setSlotForm({ ...slotForm, SpecificDate: e.target.value })}
              className="w-full p-3 border border-border rounded-xl bg-background text-text"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.startTime')}</label>
              <input
                type="time"
                value={slotForm.StartTime}
                onChange={(e) => setSlotForm({ ...slotForm, StartTime: e.target.value })}
                className="w-full p-3 border border-border rounded-xl bg-background text-text"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.endTime')}</label>
              <input
                type="time"
                value={slotForm.EndTime}
                onChange={(e) => setSlotForm({ ...slotForm, EndTime: e.target.value })}
                className="w-full p-3 border border-border rounded-xl bg-background text-text"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.slotDuration')}</label>
            <select
              value={slotForm.SlotDuration}
              onChange={(e) => setSlotForm({ ...slotForm, SlotDuration: parseInt(e.target.value) })}
              className="w-full p-3 border border-border rounded-xl bg-background text-text"
            >
              {Object.entries(SlotDurationLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsSlotModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1 gap-2" onClick={handleAddSlot} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.adding')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t('doctor.addSlot')}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block Time Modal */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title={t('doctor.blockTime')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.date')}</label>
            <input
              type="date"
              value={blockForm.SpecificDate}
              onChange={(e) => setBlockForm({ ...blockForm, SpecificDate: e.target.value })}
              className="w-full p-3 border border-border rounded-xl bg-background text-text"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.startTime')}</label>
              <input
                type="time"
                value={blockForm.StartTime}
                onChange={(e) => setBlockForm({ ...blockForm, StartTime: e.target.value })}
                className="w-full p-3 border border-border rounded-xl bg-background text-text"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">{t('doctor.endTime')}</label>
              <input
                type="time"
                value={blockForm.EndTime}
                onChange={(e) => setBlockForm({ ...blockForm, EndTime: e.target.value })}
                className="w-full p-3 border border-border rounded-xl bg-background text-text"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsBlockModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1 gap-2 bg-red-600 hover:bg-red-700" onClick={handleBlockTime} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  {t('doctor.blockTime')}
                </>
              )}
            </Button>
      </div>
      </div>
      </Modal>
    </div>
  )
}
