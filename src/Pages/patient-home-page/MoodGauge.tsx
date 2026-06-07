import { Brain, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type Assessment = {
  summary: string;
  level: string;
  recommendations: string;
  note: string;
  updatedAt: string;
};

export const MoodGauge = ({
  assessment,
  hasCompletedSession,
  loading,
}: {
  assessment: Assessment | null;
  hasCompletedSession: boolean;
  loading: boolean;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card flex flex-col">
      <h3 className="text-center font-bold mb-2">{t("patientHome.moodGauge.title")}</h3>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto my-10" />
      ) : !assessment ? (
        <div className="text-center py-5">
          <Brain className="w-10 h-10 text-primary mx-auto mb-3" />
          <h4 className="font-bold mb-2">
            {hasCompletedSession
              ? t("patientHome.moodGauge.awaitingTitle")
              : t("patientHome.moodGauge.emptyTitle")}
          </h4>
          <p className="text-sm text-muted-foreground mb-5">
            {hasCompletedSession
              ? t("patientHome.moodGauge.awaitingDesc")
              : t("patientHome.moodGauge.emptyDesc")}
          </p>
          {!hasCompletedSession && (
            <button
              onClick={() => navigate("/dashboard/patient/reserve")}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm"
            >
              {t("patientHome.moodGauge.bookFirst")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {assessment.summary && (
            <div className="rounded-xl bg-primary-soft p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("patientHome.moodGauge.assessment")}</p>
              <p className="font-semibold">{assessment.summary}</p>
            </div>
          )}
          {assessment.level && <p className="text-sm"><strong>{t("patientHome.moodGauge.level")}:</strong> {assessment.level}</p>}
          {assessment.note && <p className="text-sm"><strong>{t("patientHome.moodGauge.notes")}:</strong> {assessment.note}</p>}
          {assessment.recommendations && <p className="text-sm"><strong>{t("patientHome.moodGauge.recommendations")}:</strong> {assessment.recommendations}</p>}
          {assessment.updatedAt && (
            <p className="text-xs text-muted-foreground">
              {t("patientHome.moodGauge.lastUpdate")}: {new Date(assessment.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
