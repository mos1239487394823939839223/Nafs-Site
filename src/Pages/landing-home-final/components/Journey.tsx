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
      className="relative z-10 -mt-[52px] px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl rounded-tl-md rounded-tr-[3rem] rounded-b-xl bg-white px-10 py-7  sm:px-12 sm:py-8">
        <div className="grid grid-cols-2 gap-y-4 divide-x divide-x-reverse divide-[#EEF3F0] sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, titleAr, descAr, titleEn, descEn }, i) => (
            <div
              key={titleAr}
              className={`flex items-center justify-center gap-4 ${
                i !== 0 ? "sm:border-s sm:border-[#EEF3F0]" : ""
              } px-4 py-2 sm:px-6`}
            >
              <Icon
                className="h-7 w-7 shrink-0 text-[#7FAE97] sm:h-8 sm:w-8"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-[15px] font-bold leading-snug text-[#0F4C3A] sm:text-base">
                  {isAr ? titleAr : titleEn}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#6B8278] sm:text-sm">
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
