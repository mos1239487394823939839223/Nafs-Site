import { ClipboardCheck, UserPlus, CalendarCheck } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Journey = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const steps = [
    { number: 1, icon: ClipboardCheck, titleKey: "landing.journey.step1.title", descKey: "landing.journey.step1.desc" },
    { number: 2, icon: UserPlus, titleKey: "landing.journey.step2.title", descKey: "landing.journey.step2.desc" },
    { number: 3, icon: CalendarCheck, titleKey: "landing.journey.step3.title", descKey: "landing.journey.step3.desc" },
  ];

  return (
    <section id="about" dir={isAr ? "rtl" : "ltr"} className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-12">
          {t("landing.journey.title")}
        </h2>

        <div className="relative max-w-5xl mx-auto">
          {/* Dotted connector line (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 end-[12%] start-[12%] -translate-y-1/2 border-t-2 border-dashed border-brand/40 z-0"
          />
          {/* Connector dots */}
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 end-[33%] -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand z-0"
          />
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 start-[33%] -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map(({ number, icon: Icon, titleKey, descKey }) => (
              <div
                key={number}
                className="relative bg-card border border-border rounded-2xl p-6 pt-8 shadow-[var(--shadow-card)] text-end"
              >
                <span className="absolute top-4 start-4 w-8 h-8 rounded-full bg-brand text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {number}
                </span>
                <Icon className="w-10 h-10 text-brand mb-4" strokeWidth={1.75} />
                <h3 className="text-lg font-bold text-foreground mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
