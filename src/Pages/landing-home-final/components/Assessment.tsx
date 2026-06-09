import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { assessmentIllustration as illus } from "../assets";

export const Assessment = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  return (
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:py-24">
    <div className="grid items-center gap-8 overflow-hidden rounded-[32px] border border-brand/10 bg-brand-soft/70 p-6 shadow-[var(--shadow-card)] md:grid-cols-2 md:p-10">
      <div className="order-2 md:order-1">
        <img
          src={illus}
          alt={t("landing.assessment.title")}
          width={1024}
          height={768}
          loading="lazy"
          className="mx-auto max-h-72 w-auto object-contain"
        />
      </div>
      <div className="order-1 text-center md:order-2 md:text-end">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          {t("landing.assessment.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("landing.assessment.desc")}
        </p>
        <Button
          onClick={() => navigate("/auth/login")}
          className="mt-6 bg-brand text-base text-brand-foreground shadow-[0_12px_28px_rgba(15,76,58,0.16)] hover:bg-brand/90"
        >
          {t("landing.assessment.cta")}
        </Button>
      </div>
    </div>
  </section>
  );
};
