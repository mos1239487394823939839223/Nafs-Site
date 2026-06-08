import { Loader2 } from "lucide-react";
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
  const percent = assessment || hasCompletedSession ? 75 : 25;
  const statusText =
    assessment?.level ||
    (hasCompletedSession
      ? t("patientHome.moodGauge.improvement")
      : t("patientHome.moodGauge.startAssessment"));

  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_14px_40px_rgba(15,81,50,0.06)]">
      <h3 className="mb-5 text-xl font-black text-[#12372A]">{t("patientHome.moodGauge.title")}</h3>

      {loading ? (
        <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
      ) : (
        <>
          <div
            className="mx-auto grid h-36 w-36 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#57B36B ${percent * 3.6}deg, #DDE8DF 0deg)`,
            }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-inner">
              <div>
                <p className="text-3xl font-black text-[#12372A]">{percent}%</p>
                <p className="text-xs font-bold text-[#2F855A]">{statusText}</p>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#60766C]">
            {assessment?.summary || t("patientHome.moodGauge.encouragement")}
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/tests")}
            className="mt-5 h-11 w-full rounded-2xl border border-[#E5E7EB] text-sm font-extrabold text-[#2F855A] transition-colors hover:bg-[#F8FAF8]"
          >
            {t("patientHome.moodGauge.history")}
          </button>
        </>
      )}
    </section>
  );
};
