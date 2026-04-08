import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import QueueItem from "../../components/doctor/queue/QueueItem";
import {
  AccessTime as Clock,
  People as Users,
  CheckCircle,
  Sync as Loader2,
} from "@mui/icons-material";
import { useLanguage } from "../../contexts/LanguageContext";
import { doctorAPI } from "../../lib/api";
import { getAppointmentStatusKey } from "../../lib/appointmentStatus";
import { useToast } from "../../components/ui/Toast";
import { useSignalR } from "../../hooks/useSignalR";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    bookingId: null,
  });

  const toast = useToast();
  const { t, isRTL } = useLanguage();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getBookings(1, 50);
      if (response.IsSuccess && response.Data) {
        setBookings(response.Data.Items || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

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

  // Stats from real data
  const todayStats = {
    totalSessions: bookings.length,
    completed: bookings.filter((b) => b.Status === 3).length,
    upcoming: bookings.filter((b) => b.Status === 0 || b.Status === 1).length,
  };

  // Format date/time for display
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Active bookings for queue (not completed/cancelled)
  const patientQueue = bookings
    .map((booking) => {
      const now = new Date();
      const sessionStart = new Date(booking.SessionStartTime);
      const diffMs = sessionStart.getTime() - now.getTime();
      const joinWindowMs = 24 * 60 * 60 * 1000;
      const waitTime = Math.max(0, Math.floor((now - sessionStart) / 60000));
      const statusKey = getAppointmentStatusKey(booking.Status, booking);

      return {
        id: booking.Id,
        bookingId: booking.Id,
        patientId: booking.PatientId,
        name: booking.PatientName || t("common.unknown", "Unknown"),
        status: statusKey,
        statusCode: booking.Status,
        waitTime:
          statusKey === "pending" ||
          statusKey === "approved" ||
          statusKey === "paid"
            ? waitTime
            : 0,
        sessionTimeLabel: formatTime(booking.SessionStartTime),
        sessionDateLabel: formatDate(booking.SessionStartTime),
        duration: booking.DurationMinutes,
        meetingUrl: booking.MeetingUrl,
        paymentConfirmed: booking.PaymentConfirmed,
        canCancel:
          statusKey === "pending" ||
          statusKey === "approved" ||
          statusKey === "paid",
        showJoin:
          (statusKey === "approved" || statusKey === "paid") &&
          diffMs >= 0 &&
          diffMs <= joinWindowMs,
      };
    })
    .filter(
      (booking) =>
        booking.status !== "completed" &&
        booking.status !== "cancelled" &&
        booking.status !== "rejected" &&
        booking.status !== "noShow",
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

  const handleQueueAction = (action, patient) => {
    if (action === "join") {
      handleJoin(patient);
      return;
    }
    if (action === "cancel") {
      handleCancel(patient);
      return;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Stats Overview */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">
                {t("admin.totalSessions", "Total Sessions")}
              </p>
              <p className="text-3xl font-bold mt-1 text-primary">
                {todayStats.totalSessions}
              </p>
              <p className="text-text-muted text-xs mt-1">
                {t("doctor.allBookings", "All bookings")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">
                {t("admin.completed", "Completed")}
              </p>
              <p className="text-3xl font-bold mt-1 text-green-600">
                {todayStats.completed}
              </p>
              <p className="text-text-muted text-xs mt-1">
                {t("doctor.sessions", "Sessions")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">
                {t("admin.upcoming", "Upcoming")}
              </p>
              <p className="text-3xl font-bold mt-1 text-secondary">
                {todayStats.upcoming}
              </p>
              <p className="text-text-muted text-xs mt-1">
                {t("doctor.sessions", "Sessions")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="w-7 h-7 text-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Queue */}
      <Card>
        <CardHeader>
          <CardTitle>{t("doctor.patientQueue", "Patient Queue")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : patientQueue.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("doctor.noActiveBookings", "No active bookings")}</p>
            </div>
          ) : (
            <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
              {patientQueue.map((patient) => (
                <QueueItem
                  key={patient.id}
                  patient={patient}
                  onAction={handleQueueAction}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
