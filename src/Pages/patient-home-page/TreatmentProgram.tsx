import { CalendarDays, Check, Circle, Flag, Leaf, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type Program = { 
  name: string; 
  currentSession: number; 
  totalSessions: number | null; 
  updatedAt?: string;
  doctorName?: string;
};

export const TreatmentProgram = ({
  program,
  hasCompletedSession,
  completedCount,
  hasUpcomingSession,
  loading,
}: {
  program: Program | null;
  hasCompletedSession: boolean;
  completedCount: number;
  hasUpcomingSession: boolean;
  loading: boolean;
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const total = program?.totalSessions || 8;
  const current = program?.currentSession || Math.max(completedCount, hasCompletedSession ? 4 : 0);
  const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-background-paper p-6 shadow-card">
      <Leaf className="absolute -start-6 bottom-2 h-36 w-36 -rotate-12 text-secondary/10" />
      <div className="relative flex flex-col h-full justify-between">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="text-start">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              {t("patientHome.treatmentProgram.label")}
            </p>
            <h3 className="mt-1 text-xl font-black text-text-heading" dir="auto">
              {program ? program.name : (language === "ar" ? "البرنامج العلاجي" : "Treatment Program")}
            </h3>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-background-subtle text-primary">
            <Flag className="h-6 w-6" />
          </span>
        </div>

        {loading ? (
          <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
        ) : !program ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="my-4 text-start">
              <p className="text-sm leading-6 text-text-light">
                {language === "ar"
                  ? "لم يتم تحديد برنامج علاجي بعد. سيقوم المعالج بتحديد البرنامج المناسب بعد أول جلسة."
                  : "No treatment program has been assigned yet. The therapist will determine the appropriate program after the first session."}
              </p>
            </div>
            
            {hasUpcomingSession ? (
              <button
                onClick={() => navigate("/dashboard/patient/messages")}
                className="mt-5 h-12 w-full rounded-xl bg-primary text-sm font-extrabold text-white transition-all hover:bg-primary-dark"
              >
                {language === "ar" ? "ابدأ جلستك الأولى" : "Start your first session"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard/patient/reserve")}
                className="mt-5 h-12 w-full rounded-xl bg-primary text-sm font-extrabold text-white transition-all hover:bg-primary-dark"
              >
                {language === "ar" ? "احجز جلسة مع معالج" : "Book a session with a therapist"}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-text-light">
              <span className="text-lg font-black text-primary">{percent}%</span>
              <span>
                {t("patientHome.treatmentProgram.session")} {current} {t("patientHome.treatmentProgram.of")} {total}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-background-subtle">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                [true, language === "ar" ? "بدأت البرنامج" : "Program started"],
                [current >= Math.ceil(total / 2), language === "ar" ? "منتصف الرحلة" : "Halfway point"],
                [current >= total, language === "ar" ? "اكتمال البرنامج" : "Program completed"],
              ].map(([done, label]) => (
                <div key={String(label)} className="text-center">
                  <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${done ? "bg-primary text-white" : "bg-background text-text-light"}`}>
                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </span>
                  <p className="mt-2 text-[11px] font-bold leading-4 text-text-light">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-start text-sm leading-6 text-text-light">
              {t("patientHome.treatmentProgram.continueDesc")}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-text-light">
              {program.doctorName && (
                <span>
                  {language === "ar" ? "بواسطة: " : "By: "}
                  {program.doctorName}
                </span>
              )}
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-secondary" />
                {program.updatedAt
                  ? new Date(program.updatedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                  : ""}
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard/patient/treatment-program")}
              className="mt-5 h-12 w-full rounded-xl border border-border text-sm font-extrabold text-primary transition-colors hover:bg-background-subtle"
            >
              {t("patientHome.treatmentProgram.continue")}
            </button>
          </>
        )}
      </div>
    </section>
  );
};
