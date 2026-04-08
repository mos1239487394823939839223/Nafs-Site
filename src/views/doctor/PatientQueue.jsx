import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  People as Users,
  FilterList as Filter,
  Sync as Loader2,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useToast } from "../../components/ui/Toast";

import QueueItem from "../../components/doctor/queue/QueueItem";
import { doctorAPI } from "../../lib/api";
import { getAppointmentStatusKey } from "../../lib/appointmentStatus";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSignalR } from "../../hooks/useSignalR";

export default function PatientQueue() {
  const toast = useToast();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    bookingId: null,
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getBookings(pageIndex, pageSize);
      if (response.IsSuccess && response.Data) {
        setBookings(response.Data.Items || []);
        setTotalPages(response.Data.Pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pageIndex]);

  useSignalR({
    enabled: true,
    disconnectOnUnmount: true,
    handlers: {
      BookingStatusUpdated: fetchBookings,
      ManualPaymentStatusUpdated: fetchBookings,
      PaymentStatusUpdated: fetchBookings,
      SlotCancelled: fetchBookings,
      SlotDeleted: fetchBookings,
    },
  });

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Map bookings to patient queue format
  const patients = bookings
    .map((booking) => {
      const now = new Date();
      const sessionStart = new Date(booking.SessionStartTime);
      const diffMs = sessionStart.getTime() - now.getTime();
      const joinWindowMs = 24 * 60 * 60 * 1000;
      const waitTime = Math.max(0, Math.floor((now - sessionStart) / 60000));
      const statusKey = getAppointmentStatusKey(booking.Status, booking);

      const canCancel =
        statusKey === "pending" ||
        statusKey === "approved" ||
        statusKey === "paid";
      const showJoin =
        (statusKey === "approved" || statusKey === "paid") &&
        diffMs >= 0 &&
        diffMs <= joinWindowMs;

      return {
        id: booking.Id,
        bookingId: booking.Id,
        patientId: booking.PatientId,
        name: booking.PatientName || "Unknown Patient",
        status: statusKey,
        statusCode: booking.Status,
        waitTime:
          statusKey === "pending" ||
          statusKey === "approved" ||
          statusKey === "paid"
            ? waitTime
            : 0,
        specialty: "Consultation",
        time: formatTime(booking.SessionStartTime),
        sessionTimeLabel: formatTime(booking.SessionStartTime),
        sessionDateLabel: formatDate(booking.SessionStartTime),
        duration: booking.DurationMinutes,
        meetingUrl: booking.MeetingUrl,
        paymentConfirmed: booking.PaymentConfirmed,
        canCancel,
        showJoin,
      };
    })
    .filter(
      (booking) =>
        booking.status === "pending" ||
        booking.status === "approved" ||
        booking.status === "paid",
    );

  const handleJoin = async (patient) => {
    setActionLoading({ type: "join", bookingId: patient.bookingId });
    try {
      if (patient?.meetingUrl) {
        window.open(patient.meetingUrl, "_blank");
        toast.success(isRTL ? "تم فتح الجلسة" : "Session opened successfully");
        return;
      }

      const params = new URLSearchParams();
      if (
        patient?.patientId !== undefined &&
        patient?.patientId !== null &&
        String(patient.patientId) !== ""
      ) {
        params.set("patientId", String(patient.patientId));
      }
      if (
        patient?.bookingId !== undefined &&
        patient?.bookingId !== null &&
        String(patient.bookingId) !== ""
      ) {
        params.set("bookingId", String(patient.bookingId));
      }

      const query = params.toString();
      navigate(`/dashboard/doctor/messages${query ? `?${query}` : ""}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.Message ||
          (isRTL ? "فشل فتح الجلسة" : "Failed to open session"),
      );
    } finally {
      setActionLoading({ type: null, bookingId: null });
    }
  };

  const handleCancel = async (patient) => {
    const confirmed = window.confirm(
      isRTL
        ? "هل أنت متأكد أنك تريد إلغاء هذا الموعد؟"
        : "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) return;

    setActionLoading({ type: "cancel", bookingId: patient.bookingId });
    try {
      const response = await doctorAPI.cancelBooking(
        patient.bookingId,
        isRTL ? "تم الإلغاء بواسطة الطبيب" : "Cancelled by doctor",
      );
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.failedCancelAppointment"));
        return;
      }

      // Optimistic update to reduce perceived delay.
      setBookings((prev) =>
        prev.map((booking) =>
          booking.Id === patient.bookingId
            ? {
                ...booking,
                Status: 4,
                CancellationReason: isRTL
                  ? "تم الإلغاء بواسطة الطبيب"
                  : "Cancelled by doctor",
              }
            : booking,
        ),
      );

      toast.success(t("success.appointmentCancelled"));
      fetchBookings();
    } catch (error) {
      toast.error(
        error?.response?.data?.Message || t("errors.failedCancelAppointment"),
      );
    } finally {
      setActionLoading({ type: null, bookingId: null });
    }
  };

  const handleAction = (action, patient) => {
    if (action === "join") {
      handleJoin(patient);
      return;
    }

    if (action === "cancel") {
      handleCancel(patient);
      return;
    }

    toast.error(isRTL ? "إجراء غير مدعوم" : "Unsupported action");
  };

  const filters = [
    { id: "all", label: t("common.all") },
    { id: "pending", label: t("bookingStatus.pending") },
    { id: "approved", label: t("bookingStatus.approved") },
    { id: "completed", label: t("bookingStatus.completed") },
    { id: "cancelled", label: t("bookingStatus.cancelled") },
  ];

  // Filter patients based on selected filter
  const filteredPatients = patients.filter((p) => {
    if (filter === "all") return true;
    if (filter === "approved") {
      return p.status === "approved" || p.status === "paid";
    }
    return p.status === filter;
  });

  // Sort: approved first, then pending, then completed.
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const statusOrder = {
      approved: 0,
      paid: 0,
      pending: 1,
      completed: 2,
      cancelled: 3,
      rejected: 3,
      noShow: 4,
    };
    return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading mb-2">
            {t("doctor.patientQueue")}
          </h1>
          <p className="text-text-muted">{t("doctor.manageConsultations")}</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Main Queue List */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-text-light mr-2" />
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-background-paper text-text-muted border border-border hover:bg-background-subtle"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : sortedPatients.length === 0 ? (
              <div className="text-center py-12 bg-background-paper rounded-xl border border-dashed border-border">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">{t("doctor.noPatientsFound")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPatients.map((patient) => (
                  <QueueItem
                    key={patient.id}
                    patient={patient}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                className="p-2 rounded-lg border border-border hover:bg-background-subtle disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-muted">
                {t("common.page")} {pageIndex} {t("common.of")} {totalPages}
              </span>
              <button
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex((prev) => prev + 1)}
                className="p-2 rounded-lg border border-border hover:bg-background-subtle disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
