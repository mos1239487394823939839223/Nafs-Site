import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../components/ui/Toast";

type MoodKey = "terrible" | "bad" | "okay" | "good" | "great";

const moodMeta: Array<{
  key: MoodKey;
  labelKey: string;
  emoji: string;
  color: string;
  ring: string;
}> = [
  { key: "terrible", labelKey: "patientHome.moodCheckIn.terrible", emoji: "😣", color: "bg-mood-1", ring: "ring-mood-1/50" },
  { key: "bad", labelKey: "patientHome.moodCheckIn.bad", emoji: "🙁", color: "bg-mood-2", ring: "ring-mood-2/50" },
  { key: "okay", labelKey: "patientHome.moodCheckIn.okay", emoji: "😐", color: "bg-mood-3", ring: "ring-mood-3/50" },
  { key: "good", labelKey: "patientHome.moodCheckIn.good", emoji: "🙂", color: "bg-mood-4", ring: "ring-mood-4/50" },
  { key: "great", labelKey: "patientHome.moodCheckIn.great", emoji: "😊", color: "bg-mood-5", ring: "ring-mood-5/50" },
];

export const MoodCheckIn = () => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("patient_daily_mood");
    if (!stored) return;
    try {
      const entry = JSON.parse(stored);
      if (entry?.date === new Date().toISOString().slice(0, 10)) {
        setSelected(entry.mood);
        setSaved(true);
      }
    } catch {
      localStorage.removeItem("patient_daily_mood");
    }
  }, []);

  const saveMood = (mood: MoodKey) => {
    setSelected(mood);
    setSaved(true);
    localStorage.setItem("patient_daily_mood", JSON.stringify({
      mood,
      date: new Date().toISOString().slice(0, 10),
      recordedAt: new Date().toISOString(),
    }));
    window.dispatchEvent(new CustomEvent("patient-mood-updated", { detail: { mood } }));
    toast.success(language === "ar" ? "تم حفظ حالتك اليومية" : "Your daily mood has been saved");
  };

  return (
    <section className="rounded-xl border border-border bg-[linear-gradient(135deg,var(--color-background-paper)_0%,var(--color-background)_100%)] p-4 text-center shadow-card md:p-5">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:text-start">
        <div>
      <h3 className="text-xl font-black text-text-heading">
        {t("patientHome.moodCheckIn.title", "كيف تشعر اليوم؟")}
      </h3>
      <p className="mt-2 text-sm font-medium text-text-light">
        {t("patientHome.moodCheckIn.subtitle", "شاركنا مشاعرك لمساعدتك بشكل أفضل")}
      </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-2 rounded-full bg-background-subtle px-4 py-2 text-xs font-bold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {language === "ar" ? "تم تسجيل حالة اليوم" : "Today's mood recorded"}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {moodMeta.map((mood) => {
          const isSelected = selected === mood.key;

          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => saveMood(mood.key)}
              className={`group min-h-[84px] rounded-2xl border bg-background-paper px-2.5 py-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lg ${
                isSelected
                  ? `border-primary ring-4 ${mood.ring}`
                  : "border-border"
              }`}
              aria-pressed={isSelected}
            >
              <span
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${mood.color} text-lg shadow-sm transition-transform duration-200 group-hover:scale-110`}
              >
                {mood.emoji}
              </span>
              <span className="mt-2 block text-xs font-bold text-text-heading">
                {t(mood.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
