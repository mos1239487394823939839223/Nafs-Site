import { Plus } from "lucide-react";
import heroDoctor from "../assets/hero-doctor.jpg";
import { useLanguage } from "../../../contexts/LanguageContext";

interface HeroCardProps {
  doctorName?: string;
}

export const HeroCard = ({ doctorName }: HeroCardProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="rounded-3xl bg-card border border-border shadow-card mb-6 overflow-hidden">
      <div className={`flex flex-col items-stretch ${isRTL ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <div className="flex-1 text-center p-5 sm:p-8 md:p-10 flex flex-col justify-center md:text-start">
          {doctorName && (
            <p className="text-sm font-medium text-primary mb-1">
              {t("doctor.dashboardHome.hero.greeting")},{" "}
              <span className="font-bold">{doctorName}</span>
            </p>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug text-foreground mb-2 sm:mb-3">
            {t("doctor.dashboardHome.hero.titleLine1")}
            <br />
            {t("doctor.dashboardHome.hero.titleLine2")}
          </h1>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm md:text-base">
            {t("doctor.dashboardHome.hero.subtitle")}
          </p>
          <div>
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-card text-sm sm:text-base"
            >
              <Plus className="size-4" />
              <span>{t("doctor.dashboardHome.hero.addSession")}</span>
            </button>
          </div>
        </div>

        <div className="w-full md:w-[44%] shrink-0 self-stretch max-h-[200px] md:max-h-none">
          <img
            src={heroDoctor}
            alt={t("doctor.dashboardHome.hero.imageAlt")}
            width={768}
            height={640}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

