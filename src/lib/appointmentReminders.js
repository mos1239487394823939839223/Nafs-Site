import { normalizeNotification } from "./notificationUtils";

export const REMINDER_WINDOWS = [
  { key: "24h", ms: 24 * 60 * 60 * 1000 },
  { key: "1h", ms: 60 * 60 * 1000 },
  { key: "10m", ms: 10 * 60 * 1000 },
];

const SENT_REMINDERS_KEY = "nafs_sent_appointment_reminders";

export function readSentReminderKeys() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SENT_REMINDERS_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markReminderSent(key) {
  const sent = readSentReminderKeys();
  sent.add(key);
  try {
    localStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify([...sent].slice(-500)));
  } catch {
    // ignore quota errors
  }
}

function getBookingStartTime(booking) {
  const raw =
    booking?.SessionStartTime ??
    booking?.sessionStartTime ??
    booking?.StartTime ??
    booking?.startTime;
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getBookingId(booking) {
  return String(booking?.BookingId ?? booking?.Id ?? booking?.id ?? "").trim();
}

function isUpcomingConfirmedBooking(booking, now = Date.now()) {
  const start = getBookingStartTime(booking);
  if (!start || start.getTime() <= now) return false;

  const status = Number(booking?.Status ?? booking?.status);
  if ([4, 5, 6].includes(status)) return false;

  const statusText = String(booking?.StatusText ?? booking?.statusText ?? "").toLowerCase();
  if (statusText.includes("cancel") || statusText.includes("complete")) return false;

  return true;
}

export function buildAppointmentReminderNotification(booking, window, role) {
  const bookingId = getBookingId(booking);
  const start = getBookingStartTime(booking);
  const doctorName = booking?.DoctorName ?? booking?.doctorName ?? "";
  const patientName = booking?.PatientName ?? booking?.patientName ?? "";

  const titleByWindow = {
    "24h": "Session in 24 hours",
    "1h": "Session in 1 hour",
    "10m": "Session in 10 minutes",
  };

  const bodyParts = [];
  if (doctorName) bodyParts.push(doctorName);
  if (patientName && role === "doctor") bodyParts.push(patientName);
  if (start) bodyParts.push(start.toLocaleString());

  return normalizeNotification(
    {
      Id: `local-reminder-${bookingId}-${window.key}`,
      Title: titleByWindow[window.key] || "Session reminder",
      Body: bodyParts.filter(Boolean).join(" · "),
      Type: "appointments",
      NotificationType: "AppointmentReminder",
      BookingId: bookingId,
      SessionStartTime: start?.toISOString(),
      ReminderWindow: window.key,
      IsRead: false,
    },
    role,
  );
}

/**
 * Schedules client-side reminders as a complement to backend push notifications.
 * Returns timeout ids for cleanup.
 */
export function scheduleBookingReminders(bookings = [], { onReminder, role }) {
  const timers = [];
  const now = Date.now();
  const sent = readSentReminderKeys();

  bookings.filter((booking) => isUpcomingConfirmedBooking(booking, now)).forEach((booking) => {
    const bookingId = getBookingId(booking);
    const start = getBookingStartTime(booking);
    if (!bookingId || !start) return;

    REMINDER_WINDOWS.forEach((window) => {
      const fireAt = start.getTime() - window.ms;
      const reminderKey = `${bookingId}:${window.key}`;
      if (fireAt <= now || sent.has(reminderKey)) return;

      const delay = Math.min(fireAt - now, 2147483647);
      const timerId = setTimeout(() => {
        markReminderSent(reminderKey);
        onReminder?.(buildAppointmentReminderNotification(booking, window, role));
      }, delay);
      timers.push(timerId);
    });
  });

  return timers;
}
