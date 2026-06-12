import { useState } from "react";
import { Calendar, Clock, FileText, Loader2, RefreshCw, Sparkles, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { extractErrorMessage, meetingAPI, patientAPI } from "../../lib/api";
import { canStartPatientSession } from "../../lib/patientBookingSlots";
import fallbackDoc from "./assets/doctor-2.jpg";
import { SectionHeading } from "./SectionHeading";

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
  const { t, language } = useLanguage();
  const dateLocale = language === "ar" ? "ar-EG" : "en-US";
  const navigate = useNavigate();
  const toast = useToast();
  const [meetingLoading, setMeetingLoading] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(dateLocale, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const bookingId = session?.BookingId || session?.Id;
  const canStartMeeting = Boolean(session && bookingId && canStartPatientSession(session));

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
    <section>
      <SectionHeading
        title={t("patientHome.upcomingSession.title")}
        actionLabel={t("patientHome.upcomingSession.viewAll")}
        onAction={() => navigate("/dashboard/patient/reserve")}
      />

      {loading ? (
        <div className="rounded-[24px] border border-[#DCE8E2] bg-white p-7 text-center shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)]">
          <p className="text-sm text-[#6B7280]">{t("patientHome.upcomingSession.loading")}</p>
        </div>
      ) : !session ? (
        <div className="rounded-[24px] border border-dashed border-[#2D7A61]/45 bg-[linear-gradient(135deg,#FFFFFF_0%,#F1F8F4_100%)] p-8 text-center shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)]">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A]">
            <Sparkles className="h-7 w-7" />
          </span>
          <h3 className="text-xl font-black text-[#1F2D2A]">{t("patientHome.upcomingSession.startNow")}</h3>
          <p className="mb-5 mt-2 text-sm text-[#60766C]">{t("patientHome.upcomingSession.startNowDesc")}</p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="h-12 rounded-xl bg-[#0F4C3A] px-7 text-sm font-bold text-white shadow-lg shadow-[#0F4C3A]/15 transition-colors hover:bg-[#0A3F32]"
          >
            {t("patientHome.upcomingSession.bookFirst")}
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[24px] border border-[#DCE8E2] bg-white p-6 shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)] md:p-7">
          <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-[#2D7A61] to-[#0F4C3A]" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={session.DoctorImage || fallbackDoc}
                alt={session.DoctorName}
                width={65}
                height={73}
                loading="lazy"
                className="h-[76px] w-[76px] shrink-0 rounded-2xl bg-[#F3F4F6] object-cover ring-4 ring-[#EAF5F0]"
              />
              <div className="min-w-0 text-start">
                <p className="truncate text-lg font-bold leading-7 text-[#1F2937]" dir="auto">
                  {session.DoctorName}
                </p>
                <p className="pb-1 text-sm leading-5 text-[#6B7280]" dir="auto">
                  {session.Specialist || session.DoctorSpecialty || t("patientHome.upcomingSession.therapist")}
                </p>
                <span className="inline-block rounded-full bg-[#EAF5F0] px-3 py-1 text-xs font-bold leading-4 text-[#0F4C3A]">
                  {t("patientHome.upcomingSession.sessionType")}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start justify-center gap-3 text-base leading-6 text-[#4B5563] sm:flex-row sm:flex-wrap sm:items-center sm:gap-8 lg:justify-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 shrink-0 text-[#9CA3AF]" />
                <span>{formatDate(session.SessionStartTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0 text-[#9CA3AF]" />
                <span>{formatTime(session.SessionStartTime)}</span>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 lg:w-48">
              <button
                onClick={handleStartMeeting}
                disabled={!canStartMeeting || meetingLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0F4C3A] px-5 text-sm font-bold leading-6 text-white transition-colors hover:bg-[#0A3F32] disabled:cursor-not-allowed disabled:bg-[#D8DED9] disabled:text-[#9AA69E]"
              >
                {meetingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                {t("patientHome.upcomingSession.enterSession")}
              </button>
              <button
                onClick={() => navigate(`/dashboard/patient/reserve?tab=status&bookingId=${encodeURIComponent(String(bookingId))}`)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#DCE8E2] bg-white px-5 text-sm font-bold leading-6 text-[#4B5563] transition-colors hover:bg-[#EAF5F0]"
              >
                <FileText className="h-4 w-4" />
                {t("patientHome.upcomingSession.sessionDetails")}
              </button>
              <button
                onClick={() => navigate("/dashboard/patient/reserve?tab=status")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold text-[#2D7A61] transition-colors hover:bg-[#EAF5F0]"
              >
                <RefreshCw className="h-4 w-4" />
                {language === "ar" ? "إعادة الجدولة" : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
