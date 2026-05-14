import { Link } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { APPOINTMENT_STATUS } from "../../../lib/appointmentStatus";

interface BookingDto {
  BookingId?: number | string;
  PatientId?: number | string;
  PatientName?: string;
  SessionStartTime?: string;
  Status?: number;
  DoctorImage?: string;
  [key: string]: unknown;
}

interface RecentPatientsProps {
  patients?: BookingDto[];
  loading?: boolean;
}

function statusVariant(status?: number): "active" | "followUp" {
  if (
    status === APPOINTMENT_STATUS.CONFIRMED ||
    status === APPOINTMENT_STATUS.IN_PROGRESS ||
    status === APPOINTMENT_STATUS.COMPLETED
  )
    return "active";
  return "followUp";
}

function statusKey(status?: number): string {
  if (
    status === APPOINTMENT_STATUS.CONFIRMED ||
    status === APPOINTMENT_STATUS.IN_PROGRESS ||
    status === APPOINTMENT_STATUS.COMPLETED
  )
    return "doctor.dashboardHome.recentPatients.status.active";
  return "doctor.dashboardHome.recentPatients.status.followUp";
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const RecentPatients = ({ patients = [], loading = false }: RecentPatientsProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="rounded-3xl bg-card border border-border shadow-card p-4 sm:p-6 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">
          {t("doctor.dashboardHome.recentPatients.title")}
        </h2>
        <Link
          to="/dashboard/doctor/history"
          className="text-sm font-semibold text-primary hover:text-primary/80"
        >
          {t("doctor.dashboardHome.recentPatients.viewAll")}
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
              <div className="size-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted hidden sm:block" />
            </div>
          ))}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <p className="text-center text-muted-foreground py-6 text-sm">
          {t("doctor.dashboardHome.recentPatients.noPatients")}
        </p>
      )}

      {!loading && patients.length > 0 && (
        <div className="flex flex-col gap-2">
          {patients.map((p, i) => {
            const variant = statusVariant(p.Status as number | undefined);
            const sKey = statusKey(p.Status as number | undefined);
            const avatar =
              (p.DoctorImage as string | undefined) ??
              `https://i.pravatar.cc/100?img=${(i % 10) + 1}`;
            const date = formatDate(p.SessionStartTime as string | undefined);

            return (
              <div
                key={p.BookingId ?? i}
                className="flex flex-wrap items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={avatar}
                    alt={p.PatientName as string ?? ""}
                    className="size-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {p.PatientName as string ?? ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {`${t("doctor.dashboardHome.recentPatients.lastSession")} ${date}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ms-auto sm:ms-0">
                  <span dir="ltr" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">{date}</span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      variant === "active"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {t(sKey)}
                  </span>

                  <Link
                    to="/dashboard/doctor/history"
                    className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 whitespace-nowrap"
                  >
                    {t("doctor.dashboardHome.recentPatients.viewFile")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
