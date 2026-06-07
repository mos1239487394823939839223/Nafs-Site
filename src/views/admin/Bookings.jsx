import { useState, useEffect, useMemo } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import SelectDropdown from "../../components/ui/SelectDropdown";
import {
  Calendar,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { adminAPI, extractErrorMessage } from "../../lib/api";
import { getAppointmentStatusMeta } from "../../lib/appointmentStatus";
import {
  getPaymentStatusFilterOptions,
  getPaymentStatusMeta,
  normalizePaymentStatus,
} from "../../lib/paymentStatus";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSignalR } from "../../hooks/useSignalR";

// ─── Booking Card (mobile) ────────────────────────────────────────────────────
function BookingCard({ booking, statusInfo, paymentMeta, formatDate, formatTime, t }) {
  return (
    <div className="bg-background-paper rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Top row: patient + badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">
              {(booking.PatientName || "U").charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-heading text-sm truncate">
              {booking.PatientName || t("common.unknown", "Unknown")}
            </p>
            <p className="text-xs text-text-muted truncate mt-0.5">
              {booking.DoctorName
                ? `${t("common.doctor")} ${booking.DoctorName}`
                : t("common.unknown", "Unknown")}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <Badge variant={paymentMeta.badgeVariant}>{paymentMeta.label}</Badge>
        </div>
      </div>

      {/* Date/time row */}
      <div className="flex items-center gap-4 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span dir="ltr">{formatDate(booking.SessionStartTime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span dir="ltr">{formatTime(booking.SessionStartTime)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, tone }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    <div className="flex items-center gap-3 bg-background-paper rounded-2xl border border-border p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tones[tone] || tones.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-text-heading leading-none">{value}</p>
        <p className="text-xs text-text-muted mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminBookings() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = { pageIndex, pageSize };
      if (statusFilter !== null) params.status = statusFilter;
      if (paymentFilter !== null) params.paymentStatus = paymentFilter;
      const response = await adminAPI.getBookings(params);
      if (response?.IsSuccess === true && response?.Data) {
        setBookings(response.Data.Items || response.Data || []);
        setTotalPages(response.Data.Pages || 1);
        setTotalRecords(response.Data.Records || 0);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error(extractErrorMessage(error, t("errors.failedLoadBookings")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [pageIndex, statusFilter, paymentFilter]);
  useEffect(() => {
    const pollingId = setInterval(() => { fetchBookings(); }, 20000);
    return () => clearInterval(pollingId);
  }, [pageIndex, statusFilter, paymentFilter]);

  const pickEventField = (payload, keys = []) => {
    for (const key of keys) {
      if (payload?.[key] !== undefined && payload?.[key] !== null) return payload[key];
    }
    return null;
  };

  const handlePaymentStatusEvent = (payload) => {
    const bookingId = pickEventField(payload, ["BookingId", "bookingId", "Id", "id"]);
    if (!bookingId) return;
    const paymentStatus = pickEventField(payload, ["PaymentStatus", "paymentStatus", "Status", "status"]);
    const normalized = paymentStatus !== null && paymentStatus !== undefined ? Number(paymentStatus) : null;
    setBookings((prev) =>
      prev.map((booking) => {
        if (String(booking?.Id) !== String(bookingId)) return booking;
        const next = { ...booking };
        if (normalized !== null && Number.isFinite(normalized)) next.PaymentStatus = normalized;
        if (normalized === 2 || String(paymentStatus || "").toLowerCase().includes("confirm") || String(paymentStatus || "").toLowerCase().includes("complete")) {
          next.PaymentConfirmed = true;
        }
        return next;
      }),
    );
  };

  useSignalR({
    enabled: true,
    disconnectOnUnmount: true,
    handlers: {
      PaymentStatusUpdated: handlePaymentStatusEvent,
      BookingPaymentStatusUpdated: handlePaymentStatusEvent,
      ManualPaymentStatusUpdated: handlePaymentStatusEvent,
    },
    onConnectionError: () => {},
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return t("common.none", "N/A");
    return new Date(dateStr).toLocaleDateString(t("auto.enus"), { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString(t("auto.enus"), { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesSearch = !searchQuery ||
      (booking.PatientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.DoctorName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const normalizedPaymentStatus = normalizePaymentStatus(booking.PaymentStatus ?? (booking.PaymentConfirmed ? 2 : 1));
    const matchesPayment = paymentFilter === null || normalizedPaymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  }), [bookings, searchQuery, paymentFilter]);

  // Derived stats
  const stats = useMemo(() => ({
    total: totalRecords,
    confirmed: bookings.filter(b => b.Status === 2).length,
    pending: bookings.filter(b => b.Status === 1 || b.Status === 7).length,
    cancelled: bookings.filter(b => b.Status === 5 || b.Status === 6).length,
  }), [bookings, totalRecords]);

  return (
    <div className="space-y-4 sm:space-y-6" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Page header ── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-heading">
          {t("admin.allBookings")}
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          {t("admin.manageBookingsDesc", "Manage and monitor all platform bookings")}
          {totalRecords > 0 && (
            <span className="ms-1 font-medium text-primary">
              • {totalRecords} {t("common.total", "total")}
            </span>
          )}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={Calendar}     label={t("common.total", "Total")}           value={stats.total}     tone="primary" />
        <StatChip icon={CheckCircle}  label={t("bookingStatus.confirmed", "Confirmed")} value={stats.confirmed} tone="emerald" />
        <StatChip icon={AlertCircle}  label={t("bookingStatus.pending", "Pending")} value={stats.pending}   tone="amber" />
        <StatChip icon={XCircle}      label={t("bookingStatus.cancelled", "Cancelled")} value={stats.cancelled} tone="red" />
      </div>

      {/* ── Filters ── */}
      <div className="bg-background-paper rounded-2xl border border-border p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={t("admin.searchPatientsDocs", "Search by patient or therapist name...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-text transition-all"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-text-muted shrink-0" />
            <SelectDropdown
              value={statusFilter === null ? "" : String(statusFilter)}
              onChange={(val) => { setStatusFilter(val === "" ? null : parseInt(val)); setPageIndex(1); }}
              size="sm"
              options={[
                { value: "", label: t("common.allStatus", "All Status") },
                { value: "1", label: t("bookingStatus.pending") },
                { value: "2", label: t("bookingStatus.confirmed") },
                { value: "7", label: t("bookingStatus.pendingPayment") },
                { value: "3", label: t("bookingStatus.inProgress") },
                { value: "4", label: t("bookingStatus.completed") },
                { value: "5", label: t("bookingStatus.cancelled") },
                { value: "6", label: t("bookingStatus.noShow") },
              ]}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-text-muted shrink-0" />
            <SelectDropdown
              value={paymentFilter === null ? "" : String(paymentFilter)}
              onChange={(val) => { setPaymentFilter(val === "" ? null : parseInt(val)); setPageIndex(1); }}
              size="sm"
              options={[
                { value: "", label: t("admin.allPayments", "All Payments") },
                ...getPaymentStatusFilterOptions({ isRTL }),
              ]}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* ── Bookings list ── */}
      <div className="bg-background-paper rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* List header */}
        <div className="flex items-center gap-2 px-4 sm:px-5 py-4 border-b border-border">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-heading">
            {t("admin.allBookings", "Bookings List")}
          </h3>
          {filteredBookings.length > 0 && (
            <span className="ms-auto text-xs text-text-muted bg-background-subtle px-2.5 py-1 rounded-full">
              {filteredBookings.length} {t("common.results", "results")}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-background-subtle flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-text-muted opacity-40" />
            </div>
            <p className="font-medium text-text-heading">{t("admin.noBookingsYet")}</p>
            <p className="text-sm text-text-muted mt-1">{t("admin.tryChangingFilters", "Try adjusting your filters")}</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards (< md) ── */}
            <div className="md:hidden flex flex-col gap-3 p-3 sm:p-4">
              {filteredBookings.map((booking) => {
                const statusInfo = getAppointmentStatusMeta(booking.Status, { t, isRTL, booking });
                const paymentMeta = getPaymentStatusMeta(
                  booking.PaymentStatus ?? (booking.PaymentConfirmed ? 2 : 1),
                  { isRTL },
                );
                return (
                  <BookingCard
                    key={booking.Id}
                    booking={booking}
                    statusInfo={statusInfo}
                    paymentMeta={paymentMeta}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    t={t}
                  />
                );
              })}
            </div>

            {/* ── Desktop table (>= md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background-subtle/40">
                    {[
                      t("common.patient", "Patient"),
                      t("common.doctor"),
                      t("common.date"),
                      t("common.time"),
                      t("common.status"),
                      t("staff.payment", "Payment"),
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredBookings.map((booking) => {
                    const statusInfo = getAppointmentStatusMeta(booking.Status, { t, isRTL, booking });
                    const paymentMeta = getPaymentStatusMeta(
                      booking.PaymentStatus ?? (booking.PaymentConfirmed ? 2 : 1),
                      { isRTL },
                    );
                    return (
                      <tr key={booking.Id} className="hover:bg-background-subtle/30 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {(booking.PatientName || "U").charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-text-heading text-sm truncate max-w-[140px]">
                              {booking.PatientName || t("common.unknown", "Unknown")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted max-w-[140px] truncate">
                          {booking.DoctorName || t("common.unknown", "Unknown")}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap" dir="ltr">
                          {formatDate(booking.SessionStartTime)}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap" dir="ltr">
                          {formatTime(booking.SessionStartTime)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={paymentMeta.badgeVariant}>{paymentMeta.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border">
                <span className="text-xs sm:text-sm text-text-muted order-2 sm:order-1">
                  {t("common.page")} <span className="font-semibold text-text-heading">{pageIndex}</span>{" "}
                  {t("common.of")} <span className="font-semibold text-text-heading">{totalPages}</span>
                </span>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageIndex <= 1}
                    onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                    className="whitespace-nowrap"
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4 me-1" /> : <ChevronLeft className="w-4 h-4 me-1" />}
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageIndex >= totalPages}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    className="whitespace-nowrap"
                  >
                    {t("common.next")}
                    {isRTL ? <ChevronLeft className="w-4 h-4 ms-1" /> : <ChevronRight className="w-4 h-4 ms-1" />}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
