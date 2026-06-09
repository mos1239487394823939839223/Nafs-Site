import { Button } from "@/components/ui/button";
import { User, Heart, Baby, Users, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Services = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const services = [
    { icon: Users, titleKey: "landing.services.family.title", descKey: "landing.services.family.desc" },
    { icon: Heart, titleKey: "landing.services.relationships.title", descKey: "landing.services.relationships.desc" },
    { icon: User, titleKey: "landing.services.individual.title", descKey: "landing.services.individual.desc" },
    { icon: Baby, titleKey: "landing.services.children.title", descKey: "landing.services.children.desc" },
    { icon: Brain, titleKey: "landing.services.programs.title", descKey: "landing.services.programs.desc" },
  ];

  return (
  <section id="services" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:py-24">
    <h2 className="text-center text-2xl sm:text-3xl font-black text-foreground">{t("landing.services.title")}</h2>
    <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {services.map(({ icon: Icon, titleKey, descKey }) => (
        <div
          key={titleKey}
          className="group min-h-[220px] rounded-[24px] border border-border/70 bg-card p-6 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-[var(--shadow-soft)]"
        >
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h3 className="text-base font-bold text-foreground">{t(titleKey)}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(descKey)}</p>
        </div>
      ))}
    </div>
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        onClick={() => navigate("/auth/login")}
        className="border-border bg-card text-foreground hover:bg-secondary"
      >
        {t("landing.services.viewAll")}
      </Button>
    </div>
  </section>
  );
};
