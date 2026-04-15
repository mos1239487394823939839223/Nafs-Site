export const APPOINTMENT_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  NO_SHOW: 6,
  PENDING_PAYMENT: 7,
};

const normalizeStatusValue = (status) => {
  const numeric = Number(status);
  if (Number.isFinite(numeric)) return numeric;
  return String(status || "").toLowerCase();
};

export const getAppointmentStatusKey = (status, booking) => {
  const normalized = normalizeStatusValue(status);

  if (typeof normalized === "number") {
    // Keep legacy pending=0 compatible with older records.
    if (normalized === 0) return "pending";
    if (normalized === APPOINTMENT_STATUS.PENDING) return "pending";
    if (normalized === APPOINTMENT_STATUS.CONFIRMED) return "confirmed";
    if (normalized === APPOINTMENT_STATUS.PENDING_PAYMENT)
      return "pendingPayment";
    if (normalized === APPOINTMENT_STATUS.IN_PROGRESS) return "inProgress";
    if (normalized === APPOINTMENT_STATUS.COMPLETED) return "completed";
    if (normalized === APPOINTMENT_STATUS.CANCELLED) return "cancelled";
    if (normalized === APPOINTMENT_STATUS.NO_SHOW) return "noShow";
    return "pending";
  }

  if (normalized.includes("pending") && normalized.includes("pay"))
    return "pendingPayment";
  if (normalized.includes("confirm") || normalized.includes("approve"))
    return "confirmed";
  if (normalized.includes("progress")) return "inProgress";
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("reject") || normalized.includes("declin"))
    return "cancelled";
  if (normalized.includes("no") && normalized.includes("show")) return "noShow";
  if (normalized.includes("complete")) return "completed";
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
    confirmed: {
      label: t("bookingStatus.confirmed", isRTL ? "مؤكد" : "Confirmed"),
      variant: "primary",
    },
    pendingPayment: {
      label: t(
        "bookingStatus.pendingPayment",
        isRTL ? "في انتظار الدفع" : "Pending Payment",
      ),
      variant: "warning",
    },
    inProgress: {
      label: t(
        "bookingStatus.inProgress",
        isRTL ? "قيد التنفيذ" : "In Progress",
      ),
      variant: "primary",
    },
    completed: {
      label: t("bookingStatus.completed", isRTL ? "مكتمل" : "Completed"),
      variant: "success",
    },
    cancelled: {
      label: t("bookingStatus.cancelled", isRTL ? "ملغي" : "Cancelled"),
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
