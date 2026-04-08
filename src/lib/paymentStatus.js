export const PAYMENT_STATUS = {
  PENDING: 1,
  COMPLETED: 2,
  FAILED: 3,
  REFUNDED: 4,
};

const PAYMENT_STATUS_MAP = {
  [PAYMENT_STATUS.PENDING]: {
    key: "pending",
    en: "Pending",
    ar: "في انتظار الدفع",
    badgeVariant: "warning",
    chipClass: "bg-amber-500/15 text-amber-300 border-amber-500/35",
  },
  [PAYMENT_STATUS.COMPLETED]: {
    key: "completed",
    en: "Completed",
    ar: "تم الدفع بنجاح",
    badgeVariant: "success",
    chipClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
  },
  [PAYMENT_STATUS.FAILED]: {
    key: "failed",
    en: "Failed",
    ar: "فشل الدفع",
    badgeVariant: "danger",
    chipClass: "bg-red-500/15 text-red-300 border-red-500/35",
  },
  [PAYMENT_STATUS.REFUNDED]: {
    key: "refunded",
    en: "Refunded",
    ar: "تم استرداد المبلغ",
    badgeVariant: "secondary",
    chipClass: "bg-sky-500/15 text-sky-300 border-sky-500/35",
  },
};

const PAYMENT_STATUS_TEXT_MAP = {
  pending: 1,
  completed: 2,
  complete: 2,
  confirmed: 2,
  success: 2,
  successful: 2,
  approved: 2,
  failed: 3,
  fail: 3,
  rejected: 3,
  reject: 3,
  refunded: 4,
  refund: 4,
};

export function normalizePaymentStatus(statusValue) {
  const numeric = Number(statusValue);
  if (Number.isFinite(numeric) && PAYMENT_STATUS_MAP[numeric]) {
    return numeric;
  }

  const normalizedText = String(statusValue ?? "")
    .trim()
    .toLowerCase();
  if (!normalizedText) {
    return PAYMENT_STATUS.PENDING;
  }

  for (const [keyword, value] of Object.entries(PAYMENT_STATUS_TEXT_MAP)) {
    if (normalizedText.includes(keyword)) {
      return value;
    }
  }

  return PAYMENT_STATUS.PENDING;
}

export function getPaymentStatusMeta(statusValue, options = {}) {
  const { isRTL = false } = options;
  const normalized = normalizePaymentStatus(statusValue);
  const source =
    PAYMENT_STATUS_MAP[normalized] ||
    PAYMENT_STATUS_MAP[PAYMENT_STATUS.PENDING];

  return {
    value: normalized,
    key: source.key,
    label: isRTL ? source.ar : source.en,
    badgeVariant: source.badgeVariant,
    chipClass: source.chipClass,
  };
}

export function getPaymentStatusFilterOptions(options = {}) {
  const { isRTL = false } = options;

  return [
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.COMPLETED,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.REFUNDED,
  ].map((status) => {
    const meta = getPaymentStatusMeta(status, { isRTL });
    return {
      value: String(status),
      label: meta.label,
    };
  });
}
