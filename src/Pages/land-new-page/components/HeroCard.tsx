import { ArrowUpRight, Plus, Sparkles } from "lucide-react";
import heroDoctor from "../assets/hero-doctor.jpg";
import { useLanguage } from "../../../contexts/LanguageContext";

interface HeroCardProps {
  doctorName?: string;
}

export const HeroCard = ({ doctorName }: HeroCardProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#DCE8E2] shadow-[0_18px_50px_-30px_rgba(15,76,58,0.35)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#F5FAF7_0%,#F8FBF9_42%,#F9F5E8_72%,#F8EDD0_100%)]" />
      <div className="absolute inset-y-0 start-[43%] w-[28%] bg-[linear-gradient(90deg,rgba(245,250,247,0)_0%,rgba(255,255,255,0.68)_48%,rgba(248,237,208,0)_100%)] blur-2xl" />
      <div className="absolute -top-20 end-[30%] h-56 w-56 rounded-full bg-[#BFE2D2]/25 blur-3xl" />
      <div className={`relative flex min-h-[300px] flex-col items-stretch ${isRTL ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <div className="relative z-[3] flex flex-1 flex-col justify-center p-6 text-center sm:p-8 md:p-10 md:text-start lg:p-12">
          {doctorName && (
            <p className="mb-3 inline-flex items-center justify-center gap-2 text-xs font-bold text-[#2D7A61] md:justify-start">
              <Sparkles className="h-4 w-4" />
              {t("doctor.dashboardHome.hero.greeting")},{" "}
              <span>{doctorName}</span>
            </p>
          )}
          <h1 className="mb-3 text-2xl font-black leading-[1.45] text-[#123D30] sm:text-3xl lg:text-[34px]">
            {t("doctor.dashboardHome.hero.titleLine1")}
            <br />
            {t("doctor.dashboardHome.hero.titleLine2")}
          </h1>
          <p className="mb-6 max-w-xl text-sm font-medium leading-7 text-[#6B8278] md:text-base">
            {t("doctor.dashboardHome.hero.subtitle")}
          </p>
          <div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0F4C3A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0F4C3A]/20 hover:-translate-y-0.5 hover:bg-[#0A3F32]"
            >
              <Plus className="size-4" />
              <span>{t("doctor.dashboardHome.hero.addSession")}</span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative min-h-[220px] w-full shrink-0 self-stretch overflow-hidden md:w-[43%]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,rgba(255,237,170,0.38)_0%,rgba(248,237,208,0.34)_48%,rgba(248,237,208,0)_78%)]" />
          <img
            src={heroDoctor}
            alt={t("doctor.dashboardHome.hero.imageAlt")}
            width={768}
            height={640}
            className="relative z-[1] h-full w-full object-cover object-center opacity-95"
            style={{
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 16%, #000 34%, #000 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 16%, #000 34%, #000 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 z-[2] hidden w-[38%] bg-gradient-to-r from-[#F8FBF9] via-[#F8FBF9]/55 to-transparent md:block" />
        </div>
      </div>
    </section>
  );
};

