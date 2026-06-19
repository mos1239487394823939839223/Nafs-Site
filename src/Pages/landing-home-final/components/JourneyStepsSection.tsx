import { ClipboardCheck, Stethoscope, CalendarCheck } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

const STEPS = [
  {
    num: 1,
    icon: ClipboardCheck,
    titleAr: "تقييم حالتك النفسية",
    descAr: "أجب على بعض الأسئلة البسيطة لفهم حالتك بشكل أفضل",
    titleEn: "Assess your mental state",
    descEn: "Answer a few simple questions to better understand your condition",
  },
  {
    num: 2,
    icon: Stethoscope,
    titleAr: "اختر دكتورك المناسب",
    descAr: "نرشح لك أفضل الأطباء المتخصصين حسب حالتك واحتياجاتك",
    titleEn: "Choose your doctor",
    descEn: "We recommend the best specialists based on your condition and needs",
  },
  {
    num: 3,
    icon: CalendarCheck,
    titleAr: "احجز جلستك وابدأ",
    descAr: "اختر الوقت المناسب لك وابدأ رحلتك نحو حياة أفضل",
    titleEn: "Book and start",
    descEn: "Choose a convenient time and begin your journey to a better life",
  },
];

export const JourneyStepsSection = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
      {/* Title */}
      <h2 className="text-center text-2xl font-black text-primary md:text-3xl mb-12">
        {isAr ? "كيف تبدأ رحلتك؟" : "How to start your journey?"}
      </h2>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16">
        {STEPS.map(({ num, icon: Icon, titleAr, descAr, titleEn, descEn }) => (
          <div key={num} className="relative z-10 h-full">
            {/* Connecting Line between cards (Desktop/Large screen only) */}
            {num !== 3 && (
              <div className="absolute top-1/2 -translate-y-1/2 w-12 rtl:-left-14 ltr:-right-14 hidden lg:flex items-center justify-between pointer-events-none z-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="flex-1 border-t-2 border-dashed border-primary/45 mx-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            )}

            {/* Inner Card Box */}
            <div className="relative bg-background-paper border border-border-light rounded-[20px] pt-10 pb-8 px-6 flex flex-col items-center text-center shadow-card hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 h-full z-10">
              
              {/* Step Number Circle */}
              <div className="absolute -top-3.5 rtl:right-6 ltr:left-6 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md border-2 border-background-paper z-20">
                {num}
              </div>

              {/* Icon wrapper */}
              <div className="text-[#78a794] mb-5 flex items-center justify-center">
                <Icon className="w-12 h-12 stroke-[1.5]" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-text-heading mb-3">
                {isAr ? titleAr : titleEn}
              </h3>

              {/* Description */}
              <p className="text-sm font-semibold leading-relaxed text-text-light max-w-[280px]">
                {isAr ? descAr : descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};
