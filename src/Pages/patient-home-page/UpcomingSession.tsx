import { useState } from "react";
import { Calendar, Clock, Loader2, Sparkles, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { extractErrorMessage, meetingAPI } from "../../lib/api";
import { getAppointmentStatusKey } from "../../lib/appointmentStatus";
import fallbackDoc from "./assets/doctor-2.jpg";

interface BookingDto {
  [key: string]: any;
  Id: number;
  BookingId?: number | string;
  DoctorName: string;
  DoctorImage: string | null;
  SessionStartTime: string;
  SessionEndTime: string;
  MeetingUrl: string | null;
  Status: number;
}

export const UpcomingSession = ({
  session,
  loading,
}: {
  session: BookingDto | null;
  loading: boolean;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [meetingLoading, setMeetingLoading] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(t("auto.enus"), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(t("auto.enus"), {
      hour: "2-digit",
      minute: "2-digit",
    });

  const bookingId = session?.BookingId || session?.Id;
  const statusKey = session ? getAppointmentStatusKey(session.Status, session) : "";
  const startTime = session?.SessionStartTime ? new Date(session.SessionStartTime).getTime() : NaN;
  const endTime = session?.SessionEndTime ? new Date(session.SessionEndTime).getTime() : NaN;
  const now = Date.now();
  const startWindowMs = 15 * 60 * 1000;
  const fallbackEnd = Number.isFinite(startTime) ? startTime + 90 * 60 * 1000 : NaN;
  const allowedEnd = Number.isFinite(endTime) ? endTime : fallbackEnd;
  const isWithinStartWindow =
    Number.isFinite(startTime) && Number.isFinite(allowedEnd)
      ? now >= startTime - startWindowMs && now <= allowedEnd
      : Boolean(session?.MeetingUrl);

  const therapistSignals = [
    session?.DoctorIsOnline,
    session?.IsDoctorOnline,
    session?.DoctorAvailable,
    session?.IsDoctorAvailable,
    session?.TherapistOnline,
    session?.TherapistAvailable,
    session?.Doctor?.IsOnline,
    session?.Doctor?.IsAvailable,
  ];
  const hasTherapistSignal = therapistSignals.some((value) => value !== undefined && value !== null);
  const isTherapistAvailable = hasTherapistSignal
    ? therapistSignals.some((value) => value === true || String(value).toLowerCase() === "true")
    : Boolean(session?.MeetingUrl);

  const paymentStatus = String(
    session?.PaymentStatusText ||
      session?.PaymentStatusName ||
      session?.PaymentStatus ||
      session?.paymentStatus ||
      "",
  ).toLowerCase();
  const paidSignals = [
    session?.IsPaid,
    session?.Paid,
    session?.PaymentConfirmed,
    session?.IsPaymentConfirmed,
  ];
  const hasPaymentSignal = paidSignals.some((value) => value !== undefined && value !== null) || paymentStatus;
  const isPaid = hasPaymentSignal
    ? paidSignals.some((value) => value === true || String(value).toLowerCase() === "true") ||
      paymentStatus === "2" ||
      paymentStatus.includes("paid") ||
      paymentStatus.includes("confirmed")
    : Boolean(session?.MeetingUrl);

  const isConfirmed = ["confirmed", "inProgress"].includes(statusKey);
  const canStartMeeting = Boolean(
    session && bookingId && isTherapistAvailable && isPaid && isConfirmed && isWithinStartWindow,
  );

  const handleStartMeeting = async () => {
    if (!session || !bookingId || meetingLoading) return;
    setMeetingLoading(true);
    try {
      const response = await meetingAPI.startBookingMeeting(bookingId);
      if (response?.IsSuccess === false || response?.isSuccess === false) {
        throw new Error(response?.Message || response?.message || "Failed to start meeting");
      }
      const meeting = response?.Data ?? response?.data ?? response;
      const meetingUrl =
        meeting?.MeetingUrl ||
        meeting?.meetingUrl ||
        meeting?.RoomUrl ||
        meeting?.roomUrl ||
        meeting?.JoinUrl ||
        meeting?.joinUrl ||
        session.MeetingUrl ||
        "";

      navigate(`/dashboard/patient/meeting/${bookingId}`, {
        state: { session, meeting, meetingUrl },
      });
    } catch (error) {
      console.error("Failed to start meeting:", error);
      toast.error(extractErrorMessage(error, t("patientHome.upcomingSession.meetingStartFailed", "Could not start the session.")));
    } finally {
      setMeetingLoading(false);
    }
  };

  return (
    <section className="bg-card rounded-2xl p-4 sm:p-6 shadow-card mb-6">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/dashboard/patient/reserve")}
          className="text-sm text-primary font-semibold hover:underline"
        >
          {t("patientHome.upcomingSession.viewAll")}
        </button>
        <h2 className="text-lg font-bold">{t("patientHome.upcomingSession.title")}</h2>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("patientHome.upcomingSession.loading")}
        </p>
      ) : !session ? (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary-soft/40 p-6 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg">{t("patientHome.upcomingSession.startNow")}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {t("patientHome.upcomingSession.startNowDesc")}
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="bg-primary text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            {t("patientHome.upcomingSession.bookFirst")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex items-center gap-3 md:min-w-[240px]">
            <img
              src={session.DoctorImage || fallbackDoc}
              alt={session.DoctorName}
              width={56}
              height={56}
              loading="lazy"
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
            <div className="text-start">
              <p className="font-bold">{session.DoctorName}</p>
              <span className="inline-block mt-1 text-[11px] bg-primary-soft text-primary px-2 py-0.5 rounded-full">
                {t("patientHome.upcomingSession.sessionType")}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 text-sm text-muted-foreground md:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formatDate(session.SessionStartTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formatTime(session.SessionStartTime)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:min-w-[180px]">
            {canStartMeeting && (
              <button
                onClick={handleStartMeeting}
                disabled={meetingLoading}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-60 text-primary-foreground font-semibold py-2.5 px-5 rounded-xl text-sm transition-opacity"
              >
                {meetingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                {t("patientHome.upcomingSession.startMeeting", "ابدأ الجلسة")}
              </button>
            )}
            <button
              onClick={() => navigate("/dashboard/patient/reserve")}
              className="border border-border text-foreground hover:bg-muted font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors"
            >
              {t("patientHome.upcomingSession.sessionDetails")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
