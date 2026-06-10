import { getAppointmentStatusKey } from "./appointmentStatus";

/** Default session length for all patient bookings (minutes). */
export const SESSION_DURATION_MINUTES = 60;

const START_WINDOW_MS = 15 * 60 * 1000;

export const extractSlotStartTime = (slot) =>
  slot?.StartTime ||
  slot?.Date ||
  slot?.Start ||
  slot?.SessionStartTime ||
  slot?.SlotStart ||
  null;

export const isSlotReserved = (slot) =>
  Boolean(slot?.IsReserved ?? slot?.IsBooked ?? slot?.Booked);

export const parseSlotDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Nearest future slot from Doctor/Slots API payload.
 */
export const findNearestAvailableFromApiSlots = (slotsPayload, now = new Date()) => {
  const slotsData =
    slotsPayload?.Slots ||
    slotsPayload?.Items ||
    (Array.isArray(slotsPayload) ? slotsPayload : []);

  if (!Array.isArray(slotsData)) return null;

  const candidates = slotsData
    .filter((slot) => !isSlotReserved(slot))
    .map((slot) => parseSlotDate(extractSlotStartTime(slot)))
    .filter((date) => date && date > now)
    .sort((a, b) => a - b);

  return candidates[0] || null;
};

export const findNearestFromDoctorSchedules = (doctor, now = new Date()) => {
  const schedules = Array.isArray(doctor?.DoctoreSchualings)
    ? doctor.DoctoreSchualings
    : [];

  const candidates = schedules
    .filter((slot) => slot?.Aviable !== false && slot?.Date)
    .map((slot) => parseSlotDate(slot.Date))
    .filter((date) => date && date > now)
    .sort((a, b) => a - b);

  return candidates[0] || null;
};

export const getDoctorNearestSlotDate = (doctor, now = new Date()) => {
  const computed = parseSlotDate(doctor?._nearestSlotAt);
  if (computed && computed > now) return computed;

  const fromApiField = parseSlotDate(
    doctor?.NextAvailableSlot ?? doctor?.nextAvailableSlot,
  );
  if (fromApiField && fromApiField > now) return fromApiField;

  return findNearestFromDoctorSchedules(doctor, now);
};

export const formatNearestSlotLabel = (slotDate, { t, language = "en" }) => {
  if (!slotDate) return t("patient.noAvailableAppointments");

  const locale = language === "ar" ? "ar-EG" : "en-US";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slotDay = new Date(
    slotDate.getFullYear(),
    slotDate.getMonth(),
    slotDate.getDate(),
  );
  const dayDiff = Math.round((slotDay.getTime() - today.getTime()) / 86400000);

  const dayLabel =
    dayDiff === 0
      ? t("patient.availabilityToday")
      : dayDiff === 1
        ? t("patient.availabilityTomorrow")
        : slotDate.toLocaleDateString(locale, { weekday: "long" });

  const timeLabel = slotDate.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dayLabel} ${timeLabel}`;
};

const bookingPaid = (booking) => {
  const paymentStatus = String(
    booking?.PaymentStatusText ||
      booking?.PaymentStatusName ||
      booking?.PaymentStatus ||
      booking?.paymentStatus ||
      "",
  ).toLowerCase();

  const paidSignals = [
    booking?.IsPaid,
    booking?.Paid,
    booking?.PaymentConfirmed,
    booking?.IsPaymentConfirmed,
  ];
  const hasPaymentSignal =
    paidSignals.some((value) => value !== undefined && value !== null) ||
    paymentStatus;

  if (!hasPaymentSignal) return Boolean(booking?.MeetingUrl);

  return (
    paidSignals.some(
      (value) => value === true || String(value).toLowerCase() === "true",
    ) ||
    paymentStatus === "2" ||
    paymentStatus.includes("paid") ||
    paymentStatus.includes("confirm")
  );
};

const therapistAvailable = (booking) => {
  const therapistSignals = [
    booking?.DoctorIsOnline,
    booking?.IsDoctorOnline,
    booking?.DoctorAvailable,
    booking?.IsDoctorAvailable,
    booking?.TherapistOnline,
    booking?.TherapistAvailable,
    booking?.Doctor?.IsOnline,
    booking?.Doctor?.IsAvailable,
  ];
  const hasTherapistSignal = therapistSignals.some(
    (value) => value !== undefined && value !== null,
  );
  if (!hasTherapistSignal) return Boolean(booking?.MeetingUrl);
  return therapistSignals.some(
    (value) => value === true || String(value).toLowerCase() === "true",
  );
};

export const canStartPatientSession = (booking, now = Date.now()) => {
  if (!booking) return false;

  const bookingId = booking?.BookingId || booking?.Id;
  if (!bookingId) return false;

  const statusKey = getAppointmentStatusKey(booking.Status, booking);
  const isConfirmed = ["confirmed", "inProgress"].includes(statusKey);
  if (!isConfirmed) return false;

  if (!bookingPaid(booking)) return false;
  if (!therapistAvailable(booking)) return false;

  const startTime = booking?.SessionStartTime
    ? new Date(booking.SessionStartTime).getTime()
    : NaN;
  const endTime = booking?.SessionEndTime
    ? new Date(booking.SessionEndTime).getTime()
    : NaN;
  const fallbackEnd = Number.isFinite(startTime)
    ? startTime + SESSION_DURATION_MINUTES * 60 * 1000
    : NaN;
  const allowedEnd = Number.isFinite(endTime) ? endTime : fallbackEnd;

  if (!Number.isFinite(startTime) || !Number.isFinite(allowedEnd)) {
    return Boolean(booking?.MeetingUrl);
  }

  return now >= startTime - START_WINDOW_MS && now <= allowedEnd;
};

export const formatDateKey = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
