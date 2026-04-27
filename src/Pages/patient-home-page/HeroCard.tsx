import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import heroImg from "./assets/hero-illustration.jpg";

export const HeroCard = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-hero shadow-card mb-6">
      <div className={`flex flex-col items-center ${isRTL ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <div className={`flex-1 p-8 md:p-12 ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3">
            {t("patientHome.hero.title")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("patientHome.hero.subtitle")}
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="inline-flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-cta transition-opacity"
          >
            {t("patientHome.hero.bookSession")}
            <Arrow className="w-4 h-4" />
          </button>
        </div>
        <div className="md:w-1/2 lg:w-2/5">
          <img
            src={heroImg}
            alt={t("patientHome.hero.title")}
            width={1024}
            height={768}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};
