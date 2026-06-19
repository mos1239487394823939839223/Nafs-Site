import { Leaf, Loader2 } from "lucide-react";
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const total = program?.totalSessions || 8;
  const current = program?.currentSession || Math.max(completedCount, hasCompletedSession ? 4 : 0);
  const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden" dir="ltr">
      <Leaf
        className="absolute bottom-2 w-32 h-32 text-primary opacity-10 -rotate-12 pointer-events-none -start-2"
      />

      <div className="relative">
        <p className="text-xs text-muted-foreground text-center mb-1">
          {t("patientHome.treatmentProgram.label")}
        </p>
        <h3 className="text-xl font-bold text-center mb-4">
          {program ? program.name : t("patientHome.treatmentProgram.title")}
        </h3>

        {loading ? (
          <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-secondary" />
        ) : (
          <>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold">{percent}%</span>
              <span className="text-muted-foreground">
                {t("patientHome.treatmentProgram.session")} {current} {t("patientHome.treatmentProgram.of")} {total}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
            </div>

            <button
              onClick={() => navigate("/dashboard/patient/treatment-program")}
              className="w-full border border-border hover:bg-primary-soft hover:border-primary hover:text-primary font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {t("patientHome.treatmentProgram.continue")}
            </button>
          </>
        )}
      </div>
    </section>
  );
};
