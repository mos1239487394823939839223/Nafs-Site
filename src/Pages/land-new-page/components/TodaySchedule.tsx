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
    new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

export const TodaySchedule = ({ bookings = [], loading = false }: TodayScheduleProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <Link
          to="/dashboard/doctor/schedule"
          className="text-xs font-semibold text-primary hover:text-primary/80"
        >
          {t("doctor.dashboardHome.schedule.viewFull")}
        </Link>
        <h2 className="text-base font-bold text-foreground">
          {t("doctor.dashboardHome.schedule.title")}
        </h2>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between gap-4 p-2 rounded-xl animate-pulse">
              <div className="h-8 w-20 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted" />
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
        <div className="flex flex-col gap-2">
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
                className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isPrimary
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {t(ctaKey)}
                </button>

                {timeLabel && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{timeLabel}</span>
                    <Clock className="size-3.5" />
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 min-w-0 ${
                    t("auto.flexrowTextstart")
                  }`}
                >
                  <img
                    src={avatar}
                    alt={b.PatientName as string ?? ""}
                    className="size-9 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {b.PatientName as string ?? ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t("doctor.dashboardHome.schedule.sessionTypes.individual")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
