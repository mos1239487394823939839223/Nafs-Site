import { Link } from "react-router-dom";
import { FileClock, MessageSquare, PlayCircle, User } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { APPOINTMENT_STATUS } from "../../../lib/appointmentStatus";
import { doctorMedicalRecordsUrl, doctorMessagesUrl, doctorHistoryUrl } from "../../../lib/doctorPatientRoutes";

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
    <section className="rounded-[26px] border border-border bg-background-paper p-5 shadow-card sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-text-heading">
          {t("doctor.dashboardHome.recentPatients.title")}
        </h2>
        <Link
          to="/dashboard/doctor/history"
          className="rounded-xl bg-background-subtle px-3 py-2 text-xs font-bold text-secondary hover:bg-background"
        >
          {t("doctor.dashboardHome.recentPatients.viewAll")}
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col gap-2.5">
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
                className="flex flex-wrap items-center gap-4 rounded-[20px] border border-transparent bg-background p-4 transition-all hover:border-border hover:bg-background-subtle sm:p-5"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={avatar}
                    alt={p.PatientName as string ?? ""}
                    className="size-12 shrink-0 rounded-2xl object-cover ring-4 ring-white sm:size-14"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-text-heading">
                      {p.PatientName as string ?? ""}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-text-light">
                      {`${t("doctor.dashboardHome.recentPatients.lastSession")} ${date}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ms-auto sm:ms-0">
                  <span dir="ltr" className="hidden whitespace-nowrap text-xs font-semibold text-text-light sm:inline sm:text-sm">{date}</span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      variant === "active"
                        ? "bg-[#E4F5EC] text-[#237253]"
                        : "bg-[#FFF4DA] text-[#9A6A14]"
                    }`}
                  >
                    {t(sKey)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link title={t("doctor.dashboardHome.recentPatients.viewFile")} to={doctorMedicalRecordsUrl(p.PatientId)} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background-paper text-primary hover:bg-background-subtle">
                      <User className="size-4" />
                    </Link>
                    <Link title={isRTL ? "عرض السجل" : "View history"} to={doctorHistoryUrl({ tab: "records", patientId: p.PatientId })} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background-paper text-primary hover:bg-background-subtle">
                      <FileClock className="size-4" />
                    </Link>
                    <Link title={isRTL ? "إرسال رسالة" : "Send message"} to={doctorMessagesUrl(p.PatientId, p.BookingId)} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background-paper text-primary hover:bg-background-subtle">
                      <MessageSquare className="size-4" />
                    </Link>
                    <Link title={isRTL ? "بدء الجلسة" : "Start session"} to={doctorMessagesUrl(p.PatientId, p.BookingId)} className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 text-xs font-bold text-white hover:bg-primary-dark">
                      <PlayCircle className="size-4" />{isRTL ? "بدء" : "Start"}
                    </Link>
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
