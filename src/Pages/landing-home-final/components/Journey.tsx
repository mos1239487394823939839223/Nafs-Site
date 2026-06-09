import { CalendarCheck, ClipboardCheck, UserPlus } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Journey = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const steps = [
    { icon: ClipboardCheck, titleKey: "landing.journey.step1.title", descKey: "landing.journey.step1.desc", tone: "bg-[#E8F4EE] text-[#17614D]" },
    { icon: UserPlus, titleKey: "landing.journey.step2.title", descKey: "landing.journey.step2.desc", tone: "bg-[#FFF2DA] text-[#A36B12]" },
    { icon: CalendarCheck, titleKey: "landing.journey.step3.title", descKey: "landing.journey.step3.desc", tone: "bg-[#E9EEF9] text-[#4267A9]" },
  ];
  return (
    <section id="about" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-16 md:py-20">
      <div className="mb-10 text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-[#2D7A61]">{isAr ? "بداية بسيطة" : "A simple start"}</p><h2 className="landing-section-title mt-3 text-3xl md:text-4xl">{t("landing.journey.title")}</h2></div>
      <div className="relative mx-auto max-w-6xl">
        <div className="absolute start-[12%] end-[12%] top-12 hidden h-px bg-gradient-to-r from-transparent via-[#2D7A61]/35 to-transparent md:block" />
        <div className="relative grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, titleKey, descKey, tone }, index) => (
            <article key={titleKey} className="landing-card group relative rounded-[26px] p-6 text-start transition-all duration-300 md:p-7">
              <div className="mb-6 flex items-center justify-between"><span className={`grid h-16 w-16 place-items-center rounded-2xl transition-transform group-hover:scale-110 ${tone}`}><Icon className="h-7 w-7" /></span><span className="text-5xl font-black text-[#0F4C3A]/[.07]">0{index + 1}</span></div>
              <h3 className="text-lg font-black text-[#183C32]">{t(titleKey)}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#6A8178]">{t(descKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
