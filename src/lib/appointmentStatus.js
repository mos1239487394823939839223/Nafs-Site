export const APPOINTMENT_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  LEGACY_IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  NO_SHOW: 5,
};

import { normalizePaymentStatus, PAYMENT_STATUS } from "./paymentStatus";

const REJECT_REASON_REGEX = /reject|declin|refus|مرفوض|رفض/i;

const isPaidBooking = (booking) => {
  const paymentStatus = normalizePaymentStatus(
    booking?.PaymentStatus ?? booking?.paymentStatus,
  );
  return (
    booking?.PaymentConfirmed === true ||
    paymentStatus === PAYMENT_STATUS.COMPLETED
  );
};

const normalizeStatusValue = (status) => {
  const numeric = Number(status);
  if (Number.isFinite(numeric)) return numeric;
  return String(status || "").toLowerCase();
};

const isRejectedBooking = (booking) =>
  REJECT_REASON_REGEX.test(
    String(booking?.CancellationReason || booking?.RejectionReason || ""),
  );

export const getAppointmentStatusKey = (status, booking) => {
  const normalized = normalizeStatusValue(status);

  if (typeof normalized === "number") {
    if (normalized === APPOINTMENT_STATUS.PENDING) return "pending";
    if (
      normalized === APPOINTMENT_STATUS.APPROVED ||
      normalized === APPOINTMENT_STATUS.LEGACY_IN_PROGRESS
    ) {
      return isPaidBooking(booking) ? "paid" : "approved";
    }
    if (normalized === APPOINTMENT_STATUS.COMPLETED) return "completed";
    if (normalized === APPOINTMENT_STATUS.CANCELLED) {
      return isRejectedBooking(booking) ? "rejected" : "cancelled";
    }
    if (normalized === APPOINTMENT_STATUS.NO_SHOW) return "noShow";
    return "pending";
  }

  if (
    normalized.includes("reject") ||
    normalized.includes("declin") ||
    normalized.includes("refin")
  ) {
    return "rejected";
  }
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("no") && normalized.includes("show")) return "noShow";
  if (normalized.includes("complete")) return "completed";
  if (
    normalized.includes("approve") ||
    normalized.includes("confirm") ||
    normalized.includes("progress")
  ) {
    return "approved";
  }
  if (normalized.includes("pend") || normalized.includes("wait"))
    return "pending";
  return "pending";
};

export const getAppointmentStatusMeta = (status, options = {}) => {
  const { t = (_, fallback) => fallback, isRTL = false, booking } = options;
  const key = getAppointmentStatusKey(status, booking);

  const metaByKey = {
    pending: {
      label: t("bookingStatus.pending", isRTL ? "قيد الانتظار" : "Pending"),
      variant: "warning",
    },
    approved: {
      label: t("bookingStatus.approved", isRTL ? "تمت الموافقة" : "Approved"),
      variant: "primary",
    },
    paid: {
      label: t("bookingStatus.paid", isRTL ? "مدفوع" : "Paid"),
      variant: "success",
    },
    completed: {
      label: t("bookingStatus.completed", isRTL ? "مكتمل" : "Completed"),
      variant: "success",
    },
    cancelled: {
      label: t("bookingStatus.cancelled", isRTL ? "ملغي" : "Cancelled"),
      variant: "danger",
    },
    rejected: {
      label: t("bookingStatus.rejected", isRTL ? "مرفوض" : "Rejected"),
      variant: "danger",
    },
    noShow: {
      label: t("bookingStatus.noShow", isRTL ? "لم يحضر" : "No Show"),
      variant: "danger",
    },
    unknown: {
      label: t("common.unknown", isRTL ? "غير معروف" : "Unknown"),
      variant: "secondary",
    },
  };

  return {
    key,
    ...metaByKey[key],
  };
};
