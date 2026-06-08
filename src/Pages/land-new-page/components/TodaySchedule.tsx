import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { APPOINTMENT_STATUS } from "../../../lib/appointmentStatus";

interface BookingDto {
  BookingId?: number | string;
  PatientId?: number | string;
  PatientName?: string;
  SessionStartTime?: string;
  SessionEndTime?: string;
  Status?: number;
  DurationMinutes?: number;
  DoctorImage?: string;
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

export const TodaySchedule = ({ bookings = [], loading = false }: TodayScheduleProps) => {
  const { t, isRTL } = useLanguage();

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
        <p className="text-center text-muted-foreground py-6 text-sm">
          {t("doctor.dashboardHome.schedule.noSessions")}
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="flex flex-col gap-3">
          {bookings.map((b, i) => {
            const isPrimary =
              b.Status === APPOINTMENT_STATUS.IN_PROGRESS;
            const ctaKey =
              b.Status === APPOINTMENT_STATUS.CONFIRMED ||
              b.Status === APPOINTMENT_STATUS.IN_PROGRESS
                ? "doctor.dashboardHome.schedule.enterNow"
                : "doctor.dashboardHome.schedule.join";
            const timeLabel = formatTimeRange(
              b.SessionStartTime as string | undefined,
              b.SessionEndTime as string | undefined,
            );
            const avatar =
              (b.DoctorImage as string | undefined) ??
              `https://i.pravatar.cc/100?img=${(i % 10) + 1}`;

            return (
              <div
                key={b.BookingId ?? i}
                className="group flex flex-wrap items-center gap-4 rounded-[20px] border border-transparent bg-[#FBFDFC] p-4 transition-all hover:border-[#DCE8E2] hover:bg-[#F1F8F4] hover:shadow-sm sm:p-5"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
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
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ms-auto sm:ms-0">
                  {timeLabel && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#60766C] shadow-sm sm:text-sm">
                      <Clock className="size-4 text-[#2D7A61]" />
                      <span dir="ltr">{timeLabel}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                      isPrimary
                        ? "bg-[#0F4C3A] text-white shadow-md shadow-[#0F4C3A]/15 hover:bg-[#0A3F32]"
                        : "border border-[#CFE0D8] bg-white text-[#0F4C3A] hover:bg-[#EAF5F0]"
                    }`}
                  >
                    {t(ctaKey)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
