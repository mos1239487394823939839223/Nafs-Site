import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarToday as CalendarIcon,
  Save,
  Add as Plus,
  Delete as Trash2,
  EventBusy,
  Sync as Loader2,
  ChevronLeft,
  ChevronRight,
  GridView as LayoutGrid,
  AccessTime as Clock,
  Close as X,
} from "@mui/icons-material";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DatePicker from "../../components/ui/DatePicker";
import SelectDropdown from "../../components/ui/SelectDropdown";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { doctorAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";

// Calendar helper functions
const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      currentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
  }

  // Next month padding
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  return days;
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Normalize date strings from API - strips time part from ISO datetime (e.g. "2026-03-28T00:00:00" → "2026-03-28")
const normalizeDateKey = (dateStr) => {
  if (!dateStr) return null;
  return dateStr.split("T")[0];
};

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;

const buildSpecificSlotDateTime = (specificDate, startTime) => {
  const dateKey = normalizeDateKey(specificDate);
  if (!dateKey) return null;

  const normalizedTime = String(startTime || "00:00").slice(0, 5);
  if (!normalizedTime.includes(":")) return null;

  const dateTime = new Date(`${dateKey}T${normalizedTime}:00`);
  if (Number.isNaN(dateTime.getTime())) return null;
  return dateTime;
};

const slotHasBookings = (slot) => {
  const bookingCount = Number(
    slot?.BookingCount ??
      slot?.BookingsCount ??
      slot?.ReservedCount ??
      slot?.ReservationCount,
  );

  if (Number.isFinite(bookingCount) && bookingCount > 0) {
    return true;
  }

  return Boolean(
    slot?.HasBookings ??
      slot?.HasBooking ??
      slot?.IsReserved ??
      slot?.IsBooked,
  );
};

export default function Schedule() {
  const toast = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Day of week mapping
  const DayOfWeekNames = [
    t("doctor.sunday"),
    t("doctor.monday"),
    t("doctor.tuesday"),
    t("doctor.wednesday"),
    t("doctor.thursday"),
    t("doctor.friday"),
    t("doctor.saturday"),
  ];
  const DayOfWeekShort = [
    t("doctor.sun"),
    t("doctor.mon"),
    t("doctor.tue"),
    t("doctor.wed"),
    t("doctor.thu"),
    t("doctor.fri"),
    t("doctor.sat"),
  ];

  const SlotDurationLabels = {
    30: "30 " + t("doctor.min"),
    45: "45 " + t("doctor.min"),
    60: "60 " + t("doctor.min"),
  };

  // Helper: add minutes to a HH:MM string
  const addMinutesToTime = (timeStr, minutes) => {
    const [h, m] = timeStr.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  };

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // View mode: 'calendar' or 'cards'
  const [viewMode, setViewMode] = useState("cards");

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null); // date string like '2026-02-21'

  // Weekly schedule form
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState([
    { DayOfWeek: 1, StartTime: "09:00", EndTime: "17:00", SlotDuration: 30 },
  ]);

  // Add slot form
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    SpecificDate: "",
    StartTime: "09:00",
    EndTime: "09:30",
    SlotDuration: 30,
  });

  // Block time form
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    SpecificDate: "",
    StartTime: "09:00",
    EndTime: "17:00",
  });

  // Fetch availability
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAvailability();
      if (response.IsSuccess && response.Data) {
        setAvailability(response.Data);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Handle save weekly schedule
  const handleSaveWeekly = async () => {
    try {
      setSaving(true);
      const response = await doctorAPI.setWeeklySchedule(weeklySchedules);
      if (response.IsSuccess) {
        toast.success(t("success.scheduleSaved"));
        setIsWeeklyModalOpen(false);
        fetchAvailability();
      } else {
        toast.error(response.Message || t("errors.saveFailed"));
      }
    } catch (error) {
      console.error("Failed to save weekly schedule:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  // Handle add time slot
  const handleAddSlot = async () => {
    if (!slotForm.SpecificDate) {
      toast.error(t("errors.selectDate"));
      return;
    }

    const defaultFee = Number(user?.ConsultationFee ?? user?.consultationFee);
    const normalizedSessionFee =
      Number.isFinite(defaultFee) && defaultFee >= 0 ? defaultFee : 0;

    try {
      setSaving(true);
      const response = await doctorAPI.addTimeSlot(
        slotForm.SpecificDate,
        slotForm.StartTime,
        slotForm.EndTime,
        slotForm.SlotDuration,
        normalizedSessionFee,
      );
      if (response.IsSuccess) {
        toast.success(t("success.slotAdded"));
        setIsSlotModalOpen(false);
        setSlotForm({
          SpecificDate: "",
          StartTime: "09:00",
          EndTime: "09:30",
          SlotDuration: 30,
        });
        fetchAvailability();
      } else {
        toast.error(response.Message || t("errors.saveFailed"));
      }
    } catch (error) {
      console.error("Failed to add time slot:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  // Handle block time
  const handleBlockTime = async () => {
    if (!blockForm.SpecificDate) {
      toast.error(t("errors.selectDate"));
      return;
    }
    try {
      setSaving(true);
      const response = await doctorAPI.blockTime(
        blockForm.SpecificDate,
        blockForm.StartTime,
        blockForm.EndTime,
      );
      if (response.IsSuccess) {
        toast.success(t("success.timeBlocked"));
        setIsBlockModalOpen(false);
        setBlockForm({
          SpecificDate: "",
          StartTime: "09:00",
          EndTime: "17:00",
        });
        fetchAvailability();
      } else {
        toast.error(response.Message || t("errors.saveFailed"));
      }
    } catch (error) {
      console.error("Failed to block time:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  // Handle delete availability
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const response = await doctorAPI.deleteAvailability(id);
      if (response.IsSuccess) {
        toast.success(t("success.deleted"));
        setAvailability((prev) => prev.filter((a) => a.Id !== id));
      } else {
        toast.error(response.Message || t("errors.deleteFailed"));
      }
    } catch (error) {
      console.error("Failed to delete availability:", error);
      toast.error(t("errors.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  const canCancelSpecificSlot = (slot) => {
    const hasBookings = slotHasBookings(slot);
    if (!hasBookings) {
      return {
        canCancel: true,
      };
    }

    const slotDateTime = buildSpecificSlotDateTime(
      slot?.SpecificDate,
      slot?.StartTime,
    );

    if (!slotDateTime) {
      return {
        canCancel: false,
      };
    }

    const now = new Date();
    const timeDiff = slotDateTime.getTime() - now.getTime();

    return {
      canCancel: timeDiff >= TWO_DAYS_IN_MS,
    };
  };

  // Add weekly schedule row
  const addWeeklyRow = () => {
    setWeeklySchedules((prev) => [
      ...prev,
      { DayOfWeek: 1, StartTime: "09:00", EndTime: "17:00", SlotDuration: 30 },
    ]);
  };

  const removeWeeklyRow = (index) => {
    setWeeklySchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWeeklyRow = (index, field, value) => {
    setWeeklySchedules((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = {
          ...row,
          [field]:
            field === "DayOfWeek" || field === "SlotDuration"
              ? parseInt(value)
              : value,
        };
        // Auto-calculate EndTime when StartTime or SlotDuration changes
        if (field === "StartTime" || field === "SlotDuration") {
          const startTime = field === "StartTime" ? value : row.StartTime;
          const duration =
            field === "SlotDuration" ? parseInt(value) : row.SlotDuration;
          updated.EndTime = addMinutesToTime(startTime, duration);
        }
        return updated;
      }),
    );
  };

  // Group availability by type (1=Weekly, 2=SpecificSlot, 3=Blocked)
  const weeklyAvailability = availability.filter(
    (a) => a.AvailabilityType === 1,
  );
  const specificSlots = availability.filter((a) => a.AvailabilityType === 2);
  const blockedSlots = availability.filter((a) => a.AvailabilityType === 3);

  // Calendar helpers
  const calendarDays = getMonthDays(calendarYear, calendarMonth);
  const monthName = new Date(
    calendarYear,
    calendarMonth,
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const changeMonth = (dir) => {
    let newMonth = calendarMonth + dir;
    let newYear = calendarYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    setSelectedDay(formatDateKey(today));
  };

  // Build a map of date → events for the calendar
  const buildDateEventsMap = () => {
    const map = {};

    // Weekly availability → applies to every matching day of week
    weeklyAvailability.forEach((slot) => {
      if (slot.DayOfWeek === null || slot.DayOfWeek === undefined) return;
      calendarDays.forEach(({ date, currentMonth }) => {
        if (!currentMonth) return;
        if (date.getDay() === slot.DayOfWeek) {
          const key = formatDateKey(date);
          if (!map[key]) map[key] = [];
          map[key].push({ ...slot, _type: "weekly" });
        }
      });
    });

    // Specific slots
    specificSlots.forEach((slot) => {
      const key = normalizeDateKey(slot.SpecificDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({ ...slot, _type: "specific" });
    });

    // Blocked slots
    blockedSlots.forEach((slot) => {
      const key = normalizeDateKey(slot.SpecificDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({ ...slot, _type: "blocked" });
    });

    return map;
  };

  const dateEventsMap = buildDateEventsMap();

  // Get events for selected day
  const selectedDayEvents = selectedDay ? dateEventsMap[selectedDay] || [] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">
            {t("doctor.mySchedule")}
          </h1>
          <p className="text-text-light">{t("doctor.manageAvailability")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsWeeklyModalOpen(true)} className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            {t("doctor.setWeeklySchedule")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSlotModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("doctor.addSlot")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBlockModalOpen(true)}
            className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <EventBusy className="w-4 h-4" />
            {t("doctor.blockTime")}
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
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
              {t("doctor.weeklySchedule")}
            </h2>
            {weeklyAvailability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyAvailability.map((slot) => (
                  <div
                    key={slot.Id}
                    className="bg-background-paper border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-text-heading">
                          {slot.DayOfWeek !== null &&
                          slot.DayOfWeek !== undefined
                            ? DayOfWeekNames[slot.DayOfWeek]
                            : "N/A"}
                        </span>
                        <Badge variant={slot.IsActive ? "success" : "danger"}>
                          {slot.IsActive
                            ? t("common.active")
                            : t("common.inactive")}
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
                      <p>
                        <strong>{t("doctor.time")}:</strong> {slot.StartTime} -{" "}
                        {slot.EndTime}
                      </p>
                      <p>
                        <strong>{t("doctor.slotDuration")}:</strong>{" "}
                        {SlotDurationLabels[slot.SlotDuration] ||
                          `${slot.SlotDuration}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-background-paper rounded-2xl border-2 border-dashed border-border">
                <CalendarIcon className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">
                  {t("doctor.noWeeklySchedule")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsWeeklyModalOpen(true)}
                >
                  {t("doctor.setWeeklySchedule")}
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
              {t("doctor.specificTimeSlots")}
            </h2>
            {specificSlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specificSlots.map((slot) =>
                  (() => {
                    const cancelMeta = canCancelSpecificSlot(slot);
                    const canCancel = cancelMeta.canCancel;
                    const isDeleting = deletingId === slot.Id;

                    return (
                      <div
                        key={slot.Id}
                        className="bg-background-paper border border-green-200 rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="success">
                            {t("doctor.specificSlot")}
                          </Badge>
                          <button
                            onClick={() => {
                              if (!canCancel) {
                                toast.error(
                                  t(
                                    "doctor.slotDeleteWindowPassed",
                                    "This slot has bookings and can only be deleted at least 48 hours before start time.",
                                  ),
                                );
                                return;
                              }
                              handleDelete(slot.Id);
                            }}
                            disabled={isDeleting}
                            title={
                              canCancel
                                ? t("common.delete", "Delete")
                                : t(
                                    "doctor.slotDeleteWindowPassed",
                                    "This slot has bookings and can only be deleted at least 48 hours before start time.",
                                  )
                            }
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              canCancel
                                ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                                : "text-slate-300 bg-slate-100 cursor-not-allowed"
                            }`}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-sm text-text-muted space-y-1">
                          <p>
                            <strong>{t("doctor.date")}:</strong>{" "}
                            {normalizeDateKey(slot.SpecificDate) || "N/A"}
                          </p>
                          <p>
                            <strong>{t("doctor.time")}:</strong>{" "}
                            {slot.StartTime} - {slot.EndTime}
                          </p>
                          <p>
                            <strong>{t("doctor.duration")}:</strong>{" "}
                            {SlotDurationLabels[slot.SlotDuration] ||
                              `${slot.SlotDuration}`}
                          </p>
                          {slot.SessionFee ??
                          slot.ConsultationFee ??
                          slot.Fee ? (
                            <p>
                              <strong>{t("patient.consultationFee")}:</strong>{" "}
                              {slot.SessionFee ??
                                slot.ConsultationFee ??
                                slot.Fee}{" "}
                              EGP
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })(),
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-background-paper rounded-2xl border-2 border-dashed border-border">
                <p className="text-text-muted text-sm">
                  {t("doctor.noSpecificSlots")}
                </p>
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
              <EventBusy className="w-5 h-5 text-amber-500" />
              {t("doctor.blockedTime")}
            </h2>
            {blockedSlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockedSlots.map((slot) => (
                  <div
                    key={slot.Id}
                    className="bg-background-subtle border border-primary-dark/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow opacity-80 hover:opacity-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="default"
                        className="bg-primary-dark/10 text-primary-dark border-primary-dark/20"
                      >
                        {t("doctor.blocked")}
                      </Badge>
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
                      <p>
                        <strong>{t("doctor.date")}:</strong>{" "}
                        {normalizeDateKey(slot.SpecificDate) || "N/A"}
                      </p>
                      <p>
                        <strong>{t("doctor.time")}:</strong> {slot.StartTime} -{" "}
                        {slot.EndTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-background-paper rounded-2xl border-2 border-dashed border-border">
                <p className="text-text-muted text-sm">
                  {t("doctor.noBlockedTimes")}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Weekly Schedule Modal */}
      <Modal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        title={t("doctor.setWeeklySchedule")}
        size="lg"
      >
        <div className="space-y-4">
          {weeklySchedules.map((row, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-3 p-4 bg-background rounded-xl border border-border"
            >
              <div className="flex-1 min-w-[140px]">
                <SelectDropdown
                  label={t("doctor.day")}
                  value={String(row.DayOfWeek)}
                  onChange={(val) => updateWeeklyRow(index, "DayOfWeek", val)}
                  size="sm"
                  options={DayOfWeekNames.map((day, i) => ({
                    value: String(i),
                    label: day,
                  }))}
                />
              </div>
              <div className="min-w-[110px]">
                <label className="text-xs font-semibold text-text-muted mb-1 block">
                  {t("doctor.start")}
                </label>
                <input
                  type="time"
                  value={row.StartTime}
                  onChange={(e) =>
                    updateWeeklyRow(index, "StartTime", e.target.value)
                  }
                  className="w-full p-2 border border-border rounded-lg bg-background-paper text-text text-sm"
                />
              </div>
              <div className="min-w-[110px]">
                <label className="text-xs font-semibold text-text-muted mb-1 block">
                  {t("doctor.end")}
                </label>
                <input
                  type="time"
                  value={row.EndTime}
                  disabled
                  className="w-full p-2 border border-border rounded-lg bg-background-paper text-text text-sm opacity-50 cursor-not-allowed"
                />
              </div>
              <div className="min-w-[120px]">
                <SelectDropdown
                  label={t("doctor.slotDuration")}
                  value={String(row.SlotDuration)}
                  onChange={(val) =>
                    updateWeeklyRow(index, "SlotDuration", val)
                  }
                  size="sm"
                  options={Object.entries(
                    SlotDurationLabels,
                  ).map(([key, label]) => ({ value: key, label }))}
                />
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

          <Button
            variant="outline"
            size="sm"
            onClick={addWeeklyRow}
            className="gap-2 w-full"
          >
            <Plus className="w-4 h-4" />
            {t("doctor.addDay")}
          </Button>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsWeeklyModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSaveWeekly}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("doctor.saveSchedule")}
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
        title={t("doctor.addTimeSlot")}
        size="md"
      >
        <div className="space-y-4">
          <DatePicker
            label={t("doctor.date")}
            value={slotForm.SpecificDate}
            onChange={(val) => setSlotForm({ ...slotForm, SpecificDate: val })}
            placeholder={t("doctor.selectDate", "Select a date")}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">
                {t("doctor.startTime")}
              </label>
              <input
                type="time"
                value={slotForm.StartTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setSlotForm((prev) => ({
                    ...prev,
                    StartTime: newStart,
                    EndTime: addMinutesToTime(newStart, prev.SlotDuration),
                  }));
                }}
                className="w-full p-3 border border-border rounded-xl bg-background text-text"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">
                {t("doctor.endTime")}
              </label>
              <input
                type="time"
                value={slotForm.EndTime}
                disabled
                className="w-full p-3 border border-border rounded-xl bg-background text-text opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
          <SelectDropdown
            label={t("doctor.slotDuration")}
            value={String(slotForm.SlotDuration)}
            onChange={(val) =>
              setSlotForm((prev) => ({
                ...prev,
                SlotDuration: parseInt(val),
                EndTime: addMinutesToTime(prev.StartTime, parseInt(val)),
              }))
            }
            options={Object.entries(SlotDurationLabels).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsSlotModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleAddSlot}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.adding")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t("doctor.addSlot")}
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
        title={t("doctor.blockTime")}
        size="md"
      >
        <div className="space-y-4">
          <DatePicker
            label={t("doctor.date")}
            value={blockForm.SpecificDate}
            onChange={(val) =>
              setBlockForm({ ...blockForm, SpecificDate: val })
            }
            placeholder={t("doctor.selectDate", "Select a date")}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">
                {t("doctor.startTime")}
              </label>
              <input
                type="time"
                value={blockForm.StartTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setBlockForm((prev) => ({
                    ...prev,
                    StartTime: newStart,
                    EndTime: addMinutesToTime(newStart, 60),
                  }));
                }}
                className="w-full p-3 border border-border rounded-xl bg-background text-text"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-muted mb-1 block">
                {t("doctor.endTime")}
              </label>
              <input
                type="time"
                value={blockForm.EndTime}
                disabled
                className="w-full p-3 border border-border rounded-xl bg-background text-text opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsBlockModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={handleBlockTime}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <EventBusy className="w-4 h-4" />
                  {t("doctor.blockTime")}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
