import { Activity, CalendarDays, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [dailyMoodScore, setDailyMoodScore] = useState<number | null>(null);
  const level = String(assessment?.level || "").toLowerCase();
  const percent = level.includes("urgent") || level.includes("عاجل")
    ? 20
    : level.includes("follow") || level.includes("متابعة")
      ? 40
      : level.includes("medium") || level.includes("متوسط")
        ? 55
        : level.includes("good") || level.includes("جيد")
          ? 75
          : level.includes("excellent") || level.includes("ممتاز")
            ? 92
            : assessment || hasCompletedSession
              ? 72
              : 25;
  const statusText =
    assessment?.level ||
    (hasCompletedSession
      ? t("patientHome.moodGauge.improvement")
      : t("patientHome.moodGauge.startAssessment"));
  useEffect(() => {
    const moodScores: Record<string, number> = { terrible: 20, bad: 35, okay: 55, good: 75, great: 95 };
    const readStoredMood = () => {
      try {
        const entry = JSON.parse(localStorage.getItem("patient_daily_mood") || "null");
        setDailyMoodScore(entry?.mood ? moodScores[entry.mood] : null);
      } catch {
        setDailyMoodScore(null);
      }
    };
    const handleMoodUpdate = (event: Event) => {
      const mood = (event as CustomEvent<{ mood: string }>).detail?.mood;
      setDailyMoodScore(moodScores[mood] ?? null);
    };
    readStoredMood();
    window.addEventListener("patient-mood-updated", handleMoodUpdate);
    return () => window.removeEventListener("patient-mood-updated", handleMoodUpdate);
  }, []);

  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[#DCE8E2] bg-white p-6 shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="text-start">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2D7A61]">
            {language === "ar" ? "الحالة الحالية" : "Current status"}
          </p>
          <h3 className="mt-1 text-xl font-black text-[#1F2D2A]">{t("patientHome.moodGauge.title")}</h3>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A]">
          <Activity className="h-6 w-6" />
        </span>
      </div>

      {loading ? (
        <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-[150px_1fr] sm:items-center">
            <div
              className="mx-auto grid h-36 w-36 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#0F4C3A ${percent * 3.6}deg, #EAF5F0 0deg)`,
              }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-inner">
                <div className="text-center">
                  <p className="text-3xl font-black text-[#1F2D2A]">{percent}%</p>
                  <p className="max-w-[80px] text-xs font-bold text-[#2D7A61]">{statusText}</p>
                </div>
              </div>
            </div>
            <div className="text-start">
              <p className="text-sm leading-6 text-[#60766C]">
                {assessment?.summary || t("patientHome.moodGauge.encouragement")}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6B8278]">
                <CalendarDays className="h-4 w-4 text-[#2D7A61]" />
                <span>
                  {assessment?.updatedAt
                    ? new Date(assessment.updatedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                    : language === "ar" ? "ابدأ أول تقييم لعرض التاريخ" : "Start your first assessment to see the date"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F7FAF8] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-bold text-[#60766C]">
              <span>{language === "ar" ? "تطور نتائجك" : "Your progress"}</span>
              <span className="inline-flex items-center gap-1 text-[#2D7A61]"><TrendingUp className="h-4 w-4" /> +8%</span>
            </div>
            <div className="flex h-12 items-end gap-2">
              {[42, 48, 45, 57, 62, 68, dailyMoodScore ?? percent].map((value, index) => (
                <span key={index} className="flex-1 rounded-t-lg bg-[#2D7A61]/20 last:bg-[#0F4C3A]" style={{ height: `${Math.max(20, value)}%` }} />
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/patient/tests")}
            className="mt-5 h-12 w-full rounded-xl border border-[#DCE8E2] text-sm font-extrabold text-[#0F4C3A] transition-colors hover:bg-[#EAF5F0]"
          >
            {t("patientHome.moodGauge.history")}
          </button>
        </>
      )}
    </section>
  );
};
