import { CalendarDays, CheckCircle2, Clock, Loader2, MessageSquare, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePatientJourney } from "../../Pages/patient-home-page/usePatientJourney";

export default function TreatmentProgramDetails() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const journey = usePatientJourney();
  const program = journey.program;
  const total = program?.totalSessions || 8;
  const completed = program?.currentSession || journey.completedCount || 0;
  const remaining = Math.max(total - completed, 0);
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const updatedAt = program?.updatedAt
    ? new Date(program.updatedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")
    : "";

  if (journey.loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background-paper to-secondary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("patientHome.treatmentProgram.label", "Treatment Program")}
            </p>
            <h1 className="mt-2 text-2xl font-black text-text-heading sm:text-3xl" dir="auto">
              {program?.name || t("patientHome.treatmentProgram.awaitingTitle", "Awaiting treatment program")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              {program
                ? t("patientHome.treatmentProgram.continueDesc", "Continue your treatment program steps")
                : t(
                    "patientHome.treatmentProgram.emptyDesc",
                    "After the first session, your therapist will select the most suitable treatment program based on your assessment.",
                  )}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(program ? "/dashboard/patient/messages?type=doctors" : "/dashboard/patient/reserve")}
            className="gap-2"
          >
            {program ? <MessageSquare className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
            {program
              ? t("nav.messages", "Messages")
              : t("patientHome.treatmentProgram.bookSession", "Book a session")}
          </Button>
        </div>
      </div>

      {program ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label={t("patientHome.treatmentProgram.progress", "Progress")} value={`${progress}%`} icon={CheckCircle2} tone="text-emerald-700 bg-emerald-50" />
            <MetricCard label={t("patientHome.treatmentProgram.completed", "Completed sessions")} value={completed} icon={CheckCircle2} tone="text-primary bg-primary/10" />
            <MetricCard label={t("patientHome.treatmentProgram.remaining", "Remaining sessions")} value={remaining} icon={Clock} tone="text-amber-700 bg-amber-50" />
            <MetricCard label={t("patientHome.treatmentProgram.total", "Total sessions")} value={total} icon={CalendarDays} tone="text-blue-700 bg-blue-50" />
          </div>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>{t("patientHome.treatmentProgram.details", "Program details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-text-heading">
                  <span>{t("patientHome.treatmentProgram.progress", "Progress")}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-background-subtle">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow label={t("patientHome.treatmentProgram.programName", "Program name")} value={program.name} />
                <InfoRow label={t("patientHome.treatmentProgram.therapist", "Therapist")} value={program.doctorName || journey.latestTherapistName || "-"} icon={Stethoscope} />
                <InfoRow label={t("support.lastUpdated", "Last updated")} value={updatedAt || "-"} icon={CalendarDays} />
                <InfoRow label={t("patientHome.treatmentProgram.remaining", "Remaining sessions")} value={remaining} />
              </div>

              <div className="rounded-2xl border border-border bg-background-subtle p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {t("patientHome.treatmentProgram.lastTherapistUpdate", "Last therapist update")}
                </p>
                <p className="mt-2 text-sm leading-7 text-text-heading" dir="auto">
                  {journey.latestTherapistUpdate || t("chat.noMessagesYet", "No updates yet")}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border border-border shadow-sm">
          <CardContent className="py-14 text-center">
            <Stethoscope className="mx-auto mb-4 h-12 w-12 text-primary/60" />
            <h2 className="text-xl font-bold text-text-heading">
              {t("patientHome.treatmentProgram.emptyTitle", "Start your first session to identify the right program")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-muted">
              {t(
                "patientHome.treatmentProgram.emptyDesc",
                "After the first session, your therapist will select the most suitable treatment program based on your assessment.",
              )}
            </p>
            <Button className="mt-6" onClick={() => navigate("/dashboard/patient/reserve")}>
              {t("patientHome.treatmentProgram.bookSession", "Book a session")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-border bg-background-paper p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-text-muted">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-black text-text-heading">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-background-paper p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="font-semibold text-text-heading" dir="auto">{value}</p>
    </div>
  );
}
