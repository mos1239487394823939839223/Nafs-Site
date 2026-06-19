import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import heroImg from "./assets/hero-illustration.jpg";

export const HeroCard = ({ isNewPatient = false }: { isNewPatient?: boolean }) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden rounded-xl border border-border shadow-card">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#F9F2D9_0%,#F6F4EC_35%,#FDFCFA_65%,#FDFCFA_100%)]" />
      <div className="absolute inset-y-0 left-[38%] w-[26%] bg-[linear-gradient(90deg,rgba(249,242,217,0)_0%,rgba(255,255,255,0.54)_46%,rgba(255,255,255,0)_100%)] blur-2xl" />

      <div className="relative grid min-h-[230px] items-stretch md:grid-cols-[55%_45%] md:min-h-[250px] lg:grid-cols-2">
        <div className="relative z-[3] flex min-h-[190px] flex-col justify-center px-6 py-7 text-start md:min-h-[250px] md:px-10 lg:px-10">
          <h1 className="mb-3 max-w-[560px] text-[24px] font-black leading-[1.15] text-text-heading sm:text-[28px] lg:text-[32px]">
            {isNewPatient ? t("patientHome.hero.newPatientTitle") : t("patientHome.hero.title")}
          </h1>
          <p className="mb-4 text-sm font-medium leading-6 text-text sm:text-base">
            {isNewPatient ? t("patientHome.hero.newPatientSubtitle") : t("patientHome.hero.subtitle")}
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="inline-flex h-11 w-fit items-center justify-center gap-3 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-primary-hover hover:shadow-hover"
          >
            {isNewPatient ? t("patientHome.hero.firstSession") : t("patientHome.hero.bookSession")}
            <ArrowRight className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden md:min-h-[250px]">
          <img
            src={heroImg}
            alt={t("patientHome.hero.title")}
            width={1024}
            height={768}
            className="relative z-[1] h-[195px] w-[118%] max-w-none object-contain object-right-bottom md:h-[260px] md:w-[124%]"
          />
        </div>
      </div>
    </section>
  );
};
