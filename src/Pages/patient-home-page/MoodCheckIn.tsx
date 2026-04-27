import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

type MoodKey = "terrible" | "bad" | "okay" | "good" | "great";

const moods: { emoji: string; key: MoodKey; color: string }[] = [
  { emoji: "😄", key: "great",    color: "bg-mood-5" },
  { emoji: "🙂", key: "good",     color: "bg-mood-4" },
  { emoji: "😐", key: "okay",     color: "bg-mood-3" },
  { emoji: "😕", key: "bad",      color: "bg-mood-2" },
  { emoji: "😣", key: "terrible", color: "bg-mood-1" },
];

export const MoodCheckIn = () => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card text-center" dir="ltr">
      <h3 className="font-bold text-lg mb-1">{t("patientHome.moodCheckIn.title")}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {t("patientHome.moodCheckIn.subtitle")}
      </p>

      <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
        {moods.map((m, i) => (
          <button
            key={m.key}
            onClick={() => setSelected(i)}
            className="flex flex-col items-center gap-2 group"
            aria-label={t(`patientHome.moodCheckIn.${m.key}`)}
          >
            <span
              className={`w-14 h-14 rounded-full ${m.color} text-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                selected === i ? "ring-4 ring-primary/40 scale-110" : ""
              }`}
            >
              {m.emoji}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(`patientHome.moodCheckIn.${m.key}`)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
