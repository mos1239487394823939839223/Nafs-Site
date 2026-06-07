import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import heroImg from "./assets/hero-illustration.jpg";

export const HeroCard = ({ isNewPatient = false }: { isNewPatient?: boolean }) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-hero shadow-card mb-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 p-5 sm:p-8 md:p-12 text-start w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2 sm:mb-3">
            {isNewPatient ? t("patientHome.hero.newPatientTitle") : t("patientHome.hero.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            {isNewPatient ? t("patientHome.hero.newPatientSubtitle") : t("patientHome.hero.subtitle")}
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="inline-flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-cta transition-opacity text-sm sm:text-base"
          >
            {isNewPatient ? t("patientHome.hero.firstSession") : t("patientHome.hero.bookSession")}
            <Arrow className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full md:w-1/2 lg:w-2/5">
          <img
            src={heroImg}
            alt={t("patientHome.hero.title")}
            width={1024}
            height={768}
            className="w-full h-full object-contain max-h-[200px] md:max-h-none"
          />
        </div>
      </div>
    </section>
  );
};
