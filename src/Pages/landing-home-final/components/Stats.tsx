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
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map(({ icon: Icon, valueKey, labelKey }) => (
        <div key={labelKey} className="flex items-center justify-center gap-3">
          <Icon className="h-7 w-7 text-brand" strokeWidth={1.8} />
          <div className="text-end">
            <p className="text-2xl font-bold text-brand">{t(valueKey)}</p>
            <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
  );
};
