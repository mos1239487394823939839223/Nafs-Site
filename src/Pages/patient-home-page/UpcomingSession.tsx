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
    new Date(iso).toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("ar-EG", {
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
    if (!session || !bookingId || meetingLoading || !canStartMeeting) return;
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
    <section className="pt-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/patient/reserve")}
          className="text-sm font-medium leading-5 text-[#2B7A5F] hover:underline"
        >
          عرض جميع الجلسات
        </button>
        <h2 className="text-xl font-bold leading-7 text-[#1F2937]">جلساتك القادمة</h2>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#F3F4F6] bg-white p-[25px] text-center shadow-sm">
          <p className="text-sm text-[#6B7280]">{t("patientHome.upcomingSession.loading")}</p>
        </div>
      ) : !session ? (
        <div className="rounded-2xl border border-dashed border-[#2F855A]/40 bg-white p-[25px] text-center shadow-sm">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#2F855A]" />
          <h3 className="text-lg font-black text-[#12372A]">{t("patientHome.upcomingSession.startNow")}</h3>
          <p className="mb-5 mt-2 text-sm text-[#60766C]">{t("patientHome.upcomingSession.startNowDesc")}</p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="rounded-xl bg-[#2F6955] px-6 py-3 text-sm font-bold text-white"
          >
            {t("patientHome.upcomingSession.bookFirst")}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#F3F4F6] bg-white p-[25px] shadow-sm" dir="ltr">
          <div className="grid items-center gap-6 lg:grid-cols-[192px_1fr_auto]">
            <div className="order-3 flex items-center justify-end gap-4 lg:order-3">
              <div className="text-right">
                <p className="text-lg font-bold leading-7 text-[#1F2937]">{session.DoctorName}</p>
                <p className="pb-1 text-sm leading-5 text-[#6B7280]">
                  {session.Specialist || session.DoctorSpecialty || "معالج"}
                </p>
                <span className="inline-block rounded-full bg-[#F0FDF4] px-3 py-1 text-xs leading-4 text-[#2B7A5F]">
                  {t("patientHome.upcomingSession.sessionType")}
                </span>
              </div>
              <img
                src={session.DoctorImage || fallbackDoc}
                alt={session.DoctorName}
                width={65}
                height={73}
                loading="lazy"
                className="h-[73px] w-[65px] flex-shrink-0 rounded-full bg-[#F3F4F6] object-cover"
              />
            </div>

            <div className="order-2 flex flex-col items-center justify-center gap-3 text-base leading-6 text-[#4B5563] sm:flex-row sm:gap-8 lg:order-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 flex-shrink-0 text-[#9CA3AF]" />
                <span dir="rtl">{formatDate(session.SessionStartTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 flex-shrink-0 text-[#9CA3AF]" />
                <span dir="rtl">{formatTime(session.SessionStartTime)}</span>
              </div>
            </div>

            <div className="order-1 flex w-full flex-col gap-3 lg:order-1 lg:w-48">
              <button
                onClick={handleStartMeeting}
                disabled={!canStartMeeting || meetingLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2F6955] px-5 text-base font-medium leading-6 text-white transition-colors hover:bg-[#255845] disabled:cursor-not-allowed disabled:bg-[#D8DED9] disabled:text-[#9AA69E]"
              >
                {meetingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                الدخول للجلسة
              </button>
              <button
                onClick={() => navigate("/dashboard/patient/reserve")}
                className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-5 text-base font-medium leading-6 text-[#4B5563] transition-colors hover:bg-[#F8FAF8]"
              >
                تفاصيل الجلسة
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
