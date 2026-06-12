import { Award, Clock3, LockKeyhole, Star } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

const FEATURES = [
  {
    icon: Star,
    titleAr: "تقييم عالي",
    descAr: "4.9 من 5 نجوم",
    titleEn: "High Rating",
    descEn: "4.9 out of 5 stars",
  },
  {
    icon: Clock3,
    titleAr: "متاح 24/7",
    descAr: "نحن هنا عند الحاجة",
    titleEn: "Available 24/7",
    descEn: "Here whenever you need",
  },
  {
    icon: Award,
    titleAr: "دكاترة معتمدون",
    descAr: "+100 متخصص",
    titleEn: "Certified Doctors",
    descEn: "+100 specialists",
  },
  {
    icon: LockKeyhole,
    titleAr: "سرية تامة",
    descAr: "خصوصيتك أولويتنا",
    titleEn: "Full Privacy",
    descEn: "Your privacy comes first",
  },
];

export const Journey = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <section
      id="about"
      dir={isAr ? "rtl" : "ltr"}
      className="relative z-10 -mt-[52px] px-5 sm:px-10"
    >
      <div className="mx-auto max-w-[860px] rounded-2xl bg-white px-8 py-5 shadow-[0_4px_24px_-4px_rgba(15,76,58,0.15)]">
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-[#EEF3F0] sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, titleAr, descAr, titleEn, descEn }, i) => (
            <div
              key={titleAr}
              className={`flex items-center justify-center gap-3 ${
                i !== 0 ? "sm:border-s sm:border-[#EEF3F0]" : ""
              } px-4 py-1 sm:px-5`}
            >
              <Icon
                className="h-[22px] w-[22px] shrink-0 text-[#7FAE97]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-[13px] font-bold leading-snug text-[#0F4C3A]">
                  {isAr ? titleAr : titleEn}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-[#6B8278]">
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
