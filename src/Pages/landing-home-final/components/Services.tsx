import { Button } from "@/components/ui/button";
import { User, Heart, Baby, Users, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Services = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const services = [
    { icon: User, titleKey: "landing.services.individual.title", descKey: "landing.services.individual.desc" },
    { icon: Heart, titleKey: "landing.services.relationships.title", descKey: "landing.services.relationships.desc" },
    { icon: Baby, titleKey: "landing.services.children.title", descKey: "landing.services.children.desc" },
    { icon: Users, titleKey: "landing.services.family.title", descKey: "landing.services.family.desc" },
    { icon: Brain, titleKey: "landing.services.programs.title", descKey: "landing.services.programs.desc" },
  ];

  return (
  <section id="services" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12">
    <h2 className="text-center text-2xl sm:text-3xl font-bold text-foreground">{t("landing.services.title")}</h2>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {services.map(({ icon: Icon, titleKey, descKey }) => (
        <div
          key={titleKey}
          className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        >
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h3 className="text-base font-bold text-foreground">{t(titleKey)}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t(descKey)}</p>
        </div>
      ))}
    </div>
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        onClick={() => navigate("/auth/login")}
        className="rounded-full border-border bg-card px-7 text-foreground hover:bg-secondary"
      >
        {t("landing.services.viewAll")}
      </Button>
    </div>
  </section>
  );
};
