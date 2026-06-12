import { CalendarDays, Clock, FileText, MessageSquare, Play, User, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { APPOINTMENT_STATUS, getAppointmentStatusMeta } from "../../../lib/appointmentStatus";
import {
  doctorHistoryUrl,
  doctorMedicalRecordsUrl,
  doctorMessagesUrl,
} from "../../../lib/doctorPatientRoutes";

interface BookingDto {
  BookingId?: number | string;
  Id?: number | string;
  PatientId?: number | string;
  PatientName?: string;
  SessionStartTime?: string;
  SessionEndTime?: string;
  Status?: number;
  DurationMinutes?: number;
  DoctorImage?: string;
  MeetingUrl?: string;
  [key: string]: unknown;
}

interface TodayScheduleProps {
  bookings?: BookingDto[];
  loading?: boolean;
}

function formatTimeRange(start?: string, end?: string): string {
  if (!start) return "";
  const fmt = (s: string) =>
    new Date(s).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function bookingIdOf(b: BookingDto) {
  return b.BookingId ?? b.Id;
}

export const TodaySchedule = ({ bookings = [], loading = false }: TodayScheduleProps) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const startSession = (b: BookingDto) => {
    const meetingUrl = b.MeetingUrl as string | undefined;
    if (meetingUrl) {
      window.open(meetingUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const bookingId = bookingIdOf(b);
    const patientId = b.PatientId;
    navigate(doctorMessagesUrl(patientId, bookingId));
  };

  return (
    <section className="mb-7 rounded-[26px] border border-[#DCE8E2] bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,76,58,0.4)] sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#1F2D2A]">
          {t("doctor.dashboardHome.schedule.title")}
        </h2>
        <Link
          to="/dashboard/doctor/schedule"
          className="rounded-xl bg-[#EAF5F0] px-3 py-2 text-xs font-bold text-[#2D7A61] hover:bg-[#DCEFE5]"
        >
          {t("doctor.dashboardHome.schedule.viewFull")}
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between gap-4 p-3 rounded-2xl animate-pulse">
              <div className="h-9 w-24 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="rounded-[22px] border border-dashed border-[#CFE0D8] bg-[#FBFDFC] px-5 py-12 text-center">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF5F0] text-[#2D7A61]">
            <CalendarDays className="size-6" />
          </span>
          <p className="font-extrabold text-[#1F2D2A]">{t("doctor.dashboardHome.schedule.noSessions")}</p>
          <p className="mt-2 text-xs font-medium text-[#71857C]">
            {isRTL ? "لا توجد جلسات مجدولة اليوم. راجع الجدول الكامل للجلسات القادمة." : "Your day is clear. Review the full calendar for upcoming sessions."}
          </p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="flex flex-col gap-3">
          {bookings.map((b, i) => {
            const isPrimary = b.Status === APPOINTMENT_STATUS.IN_PROGRESS;
            const isUpcoming = b.Status === APPOINTMENT_STATUS.CONFIRMED;
            const status = getAppointmentStatusMeta(b.Status, { t, isRTL, booking: b });
            const timeLabel = formatTimeRange(
              b.SessionStartTime as string | undefined,
              b.SessionEndTime as string | undefined,
            );
            const avatar =
              (b.DoctorImage as string | undefined) ??
              `https://i.pravatar.cc/100?img=${(i % 10) + 1}`;
            const patientId = b.PatientId;
            const bookingId = bookingIdOf(b);

            return (
              <div
                key={String(bookingId ?? i)}
                className={`group relative flex flex-col gap-4 rounded-[20px] border p-4 transition-all hover:shadow-sm sm:p-5 ${
                  isPrimary
                    ? "border-[#2D7A61] bg-[#EAF5F0] shadow-md shadow-[#0F4C3A]/10"
                    : isUpcoming
                      ? "border-violet-200 bg-violet-50/40"
                      : "border-[#E4EEE9] bg-[#FBFDFC]"
                }`}
              >
                <span className={`absolute bottom-4 start-0 top-4 w-1 rounded-full ${isPrimary ? "bg-[#0F4C3A]" : isUpcoming ? "bg-violet-400" : "bg-[#CFE0D8]"}`} />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <img
                      src={avatar}
                      alt={b.PatientName as string ?? ""}
                      className="size-12 shrink-0 rounded-2xl object-cover ring-4 ring-white sm:size-14"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-[#1F2D2A] sm:text-base">
                        {b.PatientName as string ?? ""}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-[#71857C]">
                        {t("doctor.dashboardHome.schedule.sessionTypes.individual")}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          status.variant === "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : status.variant === "danger"
                              ? "bg-red-100 text-red-700"
                              : status.variant === "primary"
                                ? "bg-violet-100 text-violet-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 ms-auto">
                    {timeLabel && (
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#60766C] shadow-sm sm:text-sm">
                        <Clock className="size-4 text-[#2D7A61]" />
                        <span dir="ltr">{timeLabel}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => startSession(b)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                        isPrimary
                          ? "bg-[#0F4C3A] text-white shadow-md shadow-[#0F4C3A]/15 hover:bg-[#0A3F32]"
                          : "border border-[#CFE0D8] bg-white text-[#0F4C3A] hover:bg-[#EAF5F0]"
                      }`}
                    >
                      <Video className="me-1 inline size-4" />
                      {t("doctor.dashboardHome.schedule.enterNow")}
                    </button>
                  </div>
                </div>

                {patientId && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#E4EEE9] pt-3">
                    <Link
                      to={doctorMedicalRecordsUrl(patientId)}
                      title={t("doctor.viewProfile", "View profile")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFE0D8] bg-white px-3 py-2 text-[11px] font-bold text-[#0F4C3A] hover:bg-[#EAF5F0]"
                    >
                      <User className="size-3.5" />
                      {t("doctor.viewProfile", "View profile")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => startSession(b)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFE0D8] bg-white px-3 py-2 text-[11px] font-bold text-[#0F4C3A] hover:bg-[#EAF5F0]"
                    >
                      <Play className="size-3.5" />
                      {t("doctor.joinNow", "Start session")}
                    </button>
                    <Link
                      to={doctorHistoryUrl({ tab: "records", bookingId, action: "note" })}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFE0D8] bg-white px-3 py-2 text-[11px] font-bold text-[#0F4C3A] hover:bg-[#EAF5F0]"
                    >
                      <FileText className="size-3.5" />
                      {t("doctor.addNote", "Add notes")}
                    </Link>
                    <Link
                      to={doctorHistoryUrl({ tab: "records", patientId })}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFE0D8] bg-white px-3 py-2 text-[11px] font-bold text-[#0F4C3A] hover:bg-[#EAF5F0]"
                    >
                      <CalendarDays className="size-3.5" />
                      {t("doctor.clinicalHistory", "View history")}
                    </Link>
                    <Link
                      to={doctorMessagesUrl(patientId, bookingId)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F4C3A] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#0A3F32]"
                    >
                      <MessageSquare className="size-3.5" />
                      {t("chat.sendMessage", "Send message")}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
