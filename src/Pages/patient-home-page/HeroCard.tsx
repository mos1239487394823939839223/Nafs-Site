import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import heroImg from "./assets/hero-illustration.jpg";

export const HeroCard = ({ isNewPatient = false }: { isNewPatient?: boolean }) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-border shadow-[0_18px_45px_rgba(15,81,50,0.08)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#F9F2D9_0%,#F6F4EC_35%,#FDFCFA_65%,#FDFCFA_100%)]" />
      <div className="absolute inset-y-0 left-[38%] w-[26%] bg-[linear-gradient(90deg,rgba(249,242,217,0)_0%,rgba(255,255,255,0.54)_46%,rgba(255,255,255,0)_100%)] blur-2xl" />

      <div className="relative grid min-h-[300px] items-stretch md:grid-cols-[45%_55%] lg:grid-cols-2">
        <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden md:min-h-[300px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_45%,rgba(255,237,170,0.46)_0%,rgba(249,242,217,0.74)_42%,rgba(249,242,217,0)_72%)]" />
          <img
            src={heroImg}
            alt={t("patientHome.hero.title")}
            width={1024}
            height={768}
            className="relative z-[1] h-[250px] w-[118%] max-w-none object-contain object-left-bottom opacity-95 md:h-[335px] md:w-[124%]"
            style={{
              WebkitMaskImage:
                "linear-gradient(90deg, #000 0%, #000 70%, rgba(0,0,0,0.72) 84%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(90deg, #000 0%, #000 70%, rgba(0,0,0,0.72) 84%, rgba(0,0,0,0) 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-[-2px] z-[2] w-[42%] bg-gradient-to-r from-transparent via-background/70 to-background-paper" />
        </div>

        <div className="relative z-[3] flex min-h-[260px] flex-col justify-center px-8 py-10 text-start md:min-h-[300px] md:px-12 lg:px-16">
          <h1 className="mb-5 max-w-[560px] text-[30px] font-black leading-[1.12] text-text-heading sm:text-[36px] lg:text-[42px]">
            {isNewPatient ? t("patientHome.hero.newPatientTitle") : t("patientHome.hero.title")}
          </h1>
          <p className="mb-9 text-base font-medium leading-7 text-text sm:text-lg">
            {isNewPatient ? t("patientHome.hero.newPatientSubtitle") : t("patientHome.hero.subtitle")}
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/reserve")}
            className="inline-flex h-[52px] w-fit items-center justify-center gap-4 rounded-xl bg-primary px-9 text-base font-bold text-white shadow-[0_10px_22px_rgba(15,76,58,0.18)] transition-colors hover:bg-primary-dark"
          >
            {isNewPatient ? t("patientHome.hero.firstSession") : t("patientHome.hero.bookSession")}
            <ArrowRight className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
};
