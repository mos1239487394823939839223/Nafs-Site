import { ClipboardList, UserSearch, CalendarCheck } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

const STEPS = [
  {
    num: 1,
    icon: ClipboardList,
    titleAr: "تقييم حالتك النفسية",
    descAr: "أجب على بعض الأسئلة البسيطة لفهم حالتك بشكل أفضل",
    titleEn: "Assess your mental state",
    descEn: "Answer a few simple questions to better understand your mental health",
  },
  {
    num: 2,
    icon: UserSearch,
    titleAr: "اختر دكتورك المناسب",
    descAr: "نرشح لك أفضل الدكاترة المتخصصين حسب حالتك واحتياجاتك",
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

export const HowItWorks = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  /*
    Layout vertical math (from top of each step card):
      badge:     h-8  (32px)
      mb-4:             16px   → total: 48px
      icon box:  h-[88px]     → center at 48 + 44 = 92px from card top
    So the horizontal line sits at top-[92px] relative to the grid.

    Horizontal: line runs between icon-box centers of col-1 and col-3.
    Each col = 1/3 width, icon centered → centers at 1/6 and 5/6.
    Gap between them: from 1/6 to 5/6 = 4/6 = 66.7% width,
    starting at left = 16.67%.
  */

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <h2 className="text-center text-3xl font-black text-text-heading">
        {isAr ? "كيف تبدأ رحلتك؟" : "How do you start your journey?"}
      </h2>

      <div className="relative mt-10 grid gap-5 md:grid-cols-3">
        {/* Connecting dashed line — sits at icon-box vertical center */}
        <div
          aria-hidden
          className="absolute hidden md:block"
          style={{
            top: "92px",
            left: "calc(100% / 6)",
            width: "calc(100% * 4 / 6)",
            borderTop: "2px dashed var(--token-border)",
          }}
        />

        {STEPS.map(({ num, icon: Icon, titleAr, descAr, titleEn, descEn }) => (
          <div key={num} className="relative z-10 flex flex-col items-center text-center">
            {/* Step number badge */}
            <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
              {num}
            </span>

            {/* Icon box */}
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-border bg-background-paper shadow-card">
              <Icon className="h-9 w-9 text-text-light" strokeWidth={1.5} />
            </div>

            <h3 className="mt-5 text-base font-black text-text-heading">
              {isAr ? titleAr : titleEn}
            </h3>
            <p className="mx-auto mt-2 max-w-[200px] text-sm font-semibold leading-7 text-text-light">
              {isAr ? descAr : descEn}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
