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
      <div className="mx-auto w-full max-w-6xl rounded-tl-md rounded-tr-[3rem] rounded-b-[20px] bg-background-paper px-5 py-6 sm:px-12 sm:py-8">
        <div className="grid grid-cols-1 gap-y-4 divide-y divide-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-x-reverse">
          {FEATURES.map(({ icon: Icon, titleAr, descAr, titleEn, descEn }, i) => (
            <div
              key={titleAr}
              className={`flex items-center justify-start gap-4 sm:justify-center ${
                i !== 0 ? "sm:border-s sm:border-border" : ""
              } px-1 py-3 sm:px-6 sm:py-2`}
            >
              <Icon
                className="h-7 w-7 shrink-0 text-[#78a794] sm:h-8 sm:w-8"
                strokeWidth={1.75}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold leading-snug text-primary sm:text-base">
                  {isAr ? titleAr : titleEn}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-text-light sm:text-sm">
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
