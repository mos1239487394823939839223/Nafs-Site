import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import heroDoctor from "../assets/hero-doctor.jpg";
import { useLanguage } from "../../../contexts/LanguageContext";
import { doctorScheduleAddSlotUrl } from "../../../lib/doctorPatientRoutes";

interface HeroCardProps {
  doctorName?: string;
}

export const HeroCard = ({ doctorName }: HeroCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-xl border border-border shadow-card">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#F9F2D9_0%,#F6F4EC_35%,#FDFCFA_65%,#FDFCFA_100%)]" />
      <div className="absolute inset-y-0 left-[38%] w-[26%] bg-[linear-gradient(90deg,rgba(249,242,217,0)_0%,rgba(255,255,255,0.54)_46%,rgba(255,255,255,0)_100%)] blur-2xl" />

      <div className="relative grid min-h-[230px] items-stretch md:grid-cols-[55%_45%] md:min-h-[250px] lg:grid-cols-2">
        <div className="relative z-[3] flex min-h-[190px] flex-col justify-center px-6 py-7 text-start md:min-h-[250px] md:px-10 lg:px-10">
          {doctorName && (
            <p className="mb-1 text-sm font-medium text-primary">
              {t("doctor.dashboardHome.hero.greeting")},{" "}
              <span className="font-bold">{doctorName}</span>
            </p>
          )}
          <h1 className="mb-3 max-w-[560px] text-[24px] font-black leading-[1.15] text-text-heading sm:text-[28px] lg:text-[32px]">
            {t("doctor.dashboardHome.hero.titleLine1")}
            <br />
            {t("doctor.dashboardHome.hero.titleLine2")}
          </h1>
          <p className="mb-4 text-sm font-medium leading-6 text-text sm:text-base">
            {t("doctor.dashboardHome.hero.subtitle")}
          </p>
          <button
            type="button"
            onClick={() => navigate(doctorScheduleAddSlotUrl())}
            className="inline-flex h-11 w-fit items-center justify-center gap-3 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-primary-hover hover:shadow-hover"
          >
            {t("doctor.dashboardHome.hero.addSession")}
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden md:min-h-[250px]">
          <img
            src={heroDoctor}
            alt={t("doctor.dashboardHome.hero.imageAlt")}
            width={768}
            height={640}
            className="relative z-[1] h-[195px] w-[118%] max-w-none object-contain object-right-bottom md:h-[260px] md:w-[124%]"
          />
        </div>
      </div>
    </section>
  );
};
