import { Users, BadgeCheck, ThumbsUp, Clock } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Stats = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const stats = [
    { icon: Users, valueKey: "landing.stats.users.value", labelKey: "landing.stats.users.label" },
    { icon: BadgeCheck, valueKey: "landing.stats.doctors.value", labelKey: "landing.stats.doctors.label" },
    { icon: ThumbsUp, valueKey: "landing.stats.satisfaction.value", labelKey: "landing.stats.satisfaction.label" },
    { icon: Clock, valueKey: "landing.stats.available.value", labelKey: "landing.stats.available.label" },
  ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:py-24">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, valueKey, labelKey }) => (
          <div key={labelKey} className="flex flex-col items-center gap-3 rounded-[24px] bg-card border border-border shadow-[var(--shadow-card)] px-4 py-7">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="text-center">
              <p className="text-xl font-bold text-brand leading-tight">{t(valueKey)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t(labelKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
