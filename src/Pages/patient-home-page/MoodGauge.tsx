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

import { Activity, CalendarDays, Loader2, TrendingUp, AlertCircle } from "lucide-react";
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

  const hasMoodToday = dailyMood?.date === new Date().toISOString().slice(0, 10);
  const percent = dailyMood ? moodScores[dailyMood.mood] : 0;
  const moodLabel = dailyMood
    ? (language === "ar" ? getMoodNameAr(dailyMood.mood) : getMoodNameEn(dailyMood.mood))
    : "";

  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[#DCE8E2] bg-white p-6 shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)]">
      <div className="mb-6 flex items-center justify-between gap-3">
         <div className="text-start">
           <p className="text-xs font-bold uppercase tracking-wider text-[#2D7A61]">
             {language === "ar" ? "الاختبار اليومي" : "Daily Test"}
           </p>
           <h3 className="mt-1 text-xl font-black text-[#1F2D2A]">
             {language === "ar" ? "حالتك اليوم" : "Your Mood Today"}
           </h3>
         </div>
         <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A]">
           <Activity className="h-6 w-6" />
         </span>
      </div>

      {loading ? (
        <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
      ) : !dailyMood ? (
        <div className="flex flex-1 flex-col justify-between">
          <div className="my-6 rounded-2xl border border-dashed border-[#DCE8E2] bg-[#F7FAF8] p-6 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[#2D7A61] opacity-65" />
            <h4 className="mt-3 text-base font-bold text-[#1F2D2A]">
              {language === "ar" ? "لا توجد نتائج للاختبار اليومي بعد" : "No daily test results yet"}
            </h4>
            <p className="mt-2 text-xs leading-5 text-[#60766C]">
              {language === "ar" 
                ? "لم تقم بتسجيل حالتك النفسية اليوم بعد. إبدأ التقييم اليومي لمعرفة حالتك." 
                : "You haven't recorded your daily mental health state yet. Start the test to see your state."}
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById("mood-check-in-section") || document.querySelector("main");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-12 w-full rounded-xl bg-[#0F4C3A] text-sm font-extrabold text-white transition-all hover:bg-[#12372A]"
          >
            {language === "ar" ? "ابدأ التقييم اليومي" : "Start Daily Assessment"}
          </button>
        </div>
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
                  <p className="max-w-[80px] text-xs font-bold text-[#2D7A61]">{moodLabel}</p>
                </div>
              </div>
            </div>
            <div className="text-start">
              <p className="text-sm leading-6 text-[#60766C]">
                {language === "ar" 
                  ? `أخر نتيجة اختبار مسجلة هي: ${moodLabel}. استمر في مراجعة حالتك النفسية يومياً.` 
                  : `Your latest recorded test result is: ${moodLabel}. Keep tracking your mental health daily.`}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6B8278]">
                <CalendarDays className="h-4 w-4 text-[#2D7A61]" />
                <span>
                  {language === "ar" ? "آخر تحديث: " : "Last updated: "}
                  {new Date(dailyMood.recordedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F7FAF8] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-bold text-[#60766C]">
              <span>{language === "ar" ? "تطور نتائجك اليومية" : "Your daily progress"}</span>
              <span className="inline-flex items-center gap-1 text-[#2D7A61]"><TrendingUp className="h-4 w-4" /> +8%</span>
            </div>
            <div className="flex h-12 items-end gap-2">
              {[42, 48, 45, 57, 62, 68, percent].map((value, index) => (
                <span key={index} className="flex-1 rounded-t-lg bg-[#2D7A61]/20 last:bg-[#0F4C3A]" style={{ height: `${Math.max(20, value)}%` }} />
              ))}
            </div>
          </div>
          
          {!hasMoodToday && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                {language === "ar" 
                  ? "لم تقم بتحديث حالتك لليوم بعد. يُرجى تسجيل الدخول للتقييم اليومي." 
                  : "You have not updated your status for today yet. Please record your daily assessment."}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              const el = document.getElementById("mood-check-in-section") || document.querySelector("main");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-5 h-12 w-full rounded-xl border border-[#DCE8E2] text-sm font-extrabold text-[#0F4C3A] transition-colors hover:bg-[#EAF5F0]"
          >
            {language === "ar" ? "تحديث حالة اليوم" : "Update Today's Status"}
          </button>
        </>
      )}
    </section>
  );
};
