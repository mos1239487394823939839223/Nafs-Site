import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type MoodKey = "terrible" | "bad" | "okay" | "good" | "great";

export const MoodGauge = ({
  loading,
}: {
  assessment: any | null;
  hasCompletedSession: boolean;
  loading: boolean;
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [dailyMood, setDailyMood] = useState<{ mood: MoodKey; date: string; recordedAt: string } | null>(null);

  const moodScores: Record<MoodKey, number> = { terrible: 20, bad: 35, okay: 55, good: 75, great: 95 };

  const getMoodNameAr = (mood: MoodKey) => {
    const map = { terrible: "سيئ جداً", bad: "سيئ", okay: "مقبول", good: "جيد", great: "ممتاز" };
    return map[mood] || mood;
  };

  const getMoodNameEn = (mood: MoodKey) => {
    const map = { terrible: "Terrible", bad: "Bad", okay: "Okay", good: "Good", great: "Great" };
    return map[mood] || mood;
  };

  useEffect(() => {
    const readStoredMood = () => {
      try {
        const entry = JSON.parse(localStorage.getItem("patient_daily_mood") || "null");
        setDailyMood(entry);
      } catch {
        setDailyMood(null);
      }
    };

    const handleMoodUpdate = (event: Event) => {
      const mood = (event as CustomEvent<{ mood: MoodKey }>).detail?.mood;
      if (mood) {
        setDailyMood({
          mood,
          date: new Date().toISOString().slice(0, 10),
          recordedAt: new Date().toISOString(),
        });
      }
    };

    readStoredMood();
    window.addEventListener("patient-mood-updated", handleMoodUpdate);
    return () => window.removeEventListener("patient-mood-updated", handleMoodUpdate);
  }, []);

  const moodLabel = dailyMood
    ? (language === "ar" ? getMoodNameAr(dailyMood.mood) : getMoodNameEn(dailyMood.mood))
    : "";

  // TODO: backend doesn't expose a mood-history/improvement endpoint yet — show a static
  // placeholder preview (matching the design reference) instead of the empty state until that's wired up.
  const isFallback = !dailyMood;
  const value = dailyMood ? moodScores[dailyMood.mood] : 75;

  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card flex flex-col" dir="ltr">
      <h3 className="text-center font-bold mb-2">{t("patientHome.moodGauge.title")}</h3>

      {loading ? (
        <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-secondary" />
      ) : (
        <>
          <div className="relative flex items-end justify-center mt-2">
            <svg width="220" height="120" viewBox="0 0 220 120">
              <path
                d="M 20 110 A 80 80 0 0 1 200 110"
                fill="none"
                stroke="var(--color-background-subtle)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20 110 A 80 80 0 0 1 200 110"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-2 text-center">
              <p className="text-3xl font-bold text-primary">{value}%</p>
              <p className="text-xs text-muted-foreground">
                {isFallback ? t("patientHome.moodGauge.improvement") : moodLabel}
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-3">
            {t("patientHome.moodGauge.encouragement")}
          </p>

          <button
            onClick={() => navigate("/dashboard/patient/tests")}
            className="mt-4 mx-auto text-sm text-primary font-semibold hover:underline"
          >
            {t("patientHome.moodGauge.history")}
          </button>
        </>
      )}
    </section>
  );
};
