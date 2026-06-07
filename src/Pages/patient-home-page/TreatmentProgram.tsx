import { Leaf, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type Program = { name: string; currentSession: number; totalSessions: number | null };

export const TreatmentProgram = ({
  program,
  hasCompletedSession,
  completedCount,
  loading,
}: {
  program: Program | null;
  hasCompletedSession: boolean;
  completedCount: number;
  loading: boolean;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const total = program?.totalSessions;
  const percent = total ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
      <Leaf className="absolute bottom-2 w-32 h-32 text-primary opacity-10 -rotate-12 pointer-events-none -start-2" />
      <div className="relative">
        <p className="text-xs text-muted-foreground text-center mb-1">
          {t("patientHome.treatmentProgram.label")}
        </p>

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto my-10" />
        ) : !program ? (
          <div className="text-center py-5">
            <h3 className="text-lg font-bold mb-2">
              {hasCompletedSession
                ? t("patientHome.treatmentProgram.awaitingTitle")
                : t("patientHome.treatmentProgram.emptyTitle")}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {hasCompletedSession
                ? t("patientHome.treatmentProgram.awaitingDesc")
                : t("patientHome.treatmentProgram.emptyDesc")}
            </p>
            {!hasCompletedSession && (
              <button
                onClick={() => navigate("/dashboard/patient/reserve")}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm"
              >
                {t("patientHome.treatmentProgram.bookFirst")}
              </button>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-center mb-4">{program.name}</h3>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold">{total ? `${percent}%` : completedCount}</span>
              <span className="text-muted-foreground">
                {t("patientHome.treatmentProgram.session")} {completedCount}
                {total ? ` ${t("patientHome.treatmentProgram.of")} ${total}` : ""}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <button
              onClick={() => navigate("/dashboard/patient/reserve")}
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
