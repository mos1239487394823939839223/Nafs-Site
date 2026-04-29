import { Button } from "@/components/ui/button";
import { ShieldAlert, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const EmergencyBand = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const items = [
    { icon: ShieldAlert, titleKey: "landing.emergency.blackmail.title", descKey: "landing.emergency.blackmail.desc", ctaKey: "landing.emergency.blackmail.cta", highlight: false },
    { icon: Phone, titleKey: "landing.emergency.call.title", descKey: "landing.emergency.call.desc", ctaKey: "landing.emergency.call.cta", highlight: true },
    { icon: Lock, titleKey: "landing.emergency.danger.title", descKey: "landing.emergency.danger.desc", ctaKey: "landing.emergency.danger.cta", highlight: false },
  ];

  return (
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-10">
    <div className="rounded-[2rem] bg-cream-deep p-6 md:p-10">
      <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
        {t("landing.emergency.title")}
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map(({ icon: Icon, titleKey, descKey, ctaKey, highlight }) => (
          <div
            key={titleKey}
            className={`flex flex-col items-center rounded-2xl p-6 text-center transition ${
              highlight
                ? "bg-brand-soft ring-2 ring-brand/30"
                : "bg-card shadow-[var(--shadow-card)]"
            }`}
          >
            <span
              className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${
                highlight ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-bold text-foreground">{t(titleKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
            <Button
              onClick={() => navigate("/auth/login")}
              className={`mt-5 rounded-full px-6 ${
                highlight
                  ? "bg-brand text-brand-foreground hover:bg-brand/90"
                  : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              {t(ctaKey)}
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
