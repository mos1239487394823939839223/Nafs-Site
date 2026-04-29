import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import illus from "../assets/assessment-illustration.jpg";

export const Assessment = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  return (
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-10">
    <div className="grid items-center gap-6 overflow-hidden rounded-[2rem] bg-brand-soft/70 p-6 md:grid-cols-2 md:p-10">
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
      <div className="order-1 text-center md:order-2 md:text-right">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          {t("landing.assessment.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("landing.assessment.desc")}
        </p>
        <Button
          onClick={() => navigate("/auth/login")}
          className="mt-6 rounded-full bg-brand px-7 py-6 text-base text-brand-foreground hover:bg-brand/90"
        >
          {t("landing.assessment.cta")}
        </Button>
      </div>
    </div>
  </section>
  );
};
