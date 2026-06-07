import { MessageCircle, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

export const JourneyUpdate = ({
  update,
  therapistName,
  hasCompletedSession,
}: {
  update: string;
  therapistName: string;
  hasCompletedSession: boolean;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!hasCompletedSession) return null;

  return (
    <section className="bg-card rounded-2xl p-5 sm:p-6 shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
            <NotebookPen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">{t("patientHome.journeyUpdate.title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {update || t("patientHome.journeyUpdate.awaiting")}
            </p>
            {therapistName && <p className="text-xs text-primary mt-2">{therapistName}</p>}
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/patient/messages")}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90"
        >
          <MessageCircle className="w-4 h-4" />
          {t("patientHome.journeyUpdate.messageTherapist")}
        </button>
      </div>
    </section>
  );
};
