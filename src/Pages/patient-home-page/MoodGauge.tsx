import { useLanguage } from "../../contexts/LanguageContext";

export const MoodGauge = () => {
  const { t } = useLanguage();
  const value = 75;
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card flex flex-col" dir="ltr">
      <h3 className="text-center font-bold mb-2">{t("patientHome.moodGauge.title")}</h3>

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
          <p className="text-xs text-muted-foreground">{t("patientHome.moodGauge.improvement")}</p>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-3">
        {t("patientHome.moodGauge.encouragement")}
      </p>

      <button className="mt-4 mx-auto text-sm text-primary font-semibold hover:underline">
        {t("patientHome.moodGauge.history")}
      </button>
    </section>
  );
};
