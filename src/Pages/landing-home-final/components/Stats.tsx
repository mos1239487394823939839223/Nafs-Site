import { Clock3, Stethoscope, ThumbsUp, Users } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Stats = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const stats = [
    { icon: Users, value: "+10K", label: isAr ? "مستخدم ساعدناهم" : "users supported" },
    { icon: Stethoscope, value: "+100", label: isAr ? "دكتور متخصص" : "specialist doctors" },
    { icon: ThumbsUp, value: "98%", label: isAr ? "رضا المستخدمين" : "user satisfaction" },
    { icon: Clock3, value: "24/7", label: isAr ? "متاح دائمًا" : "always available" },
  ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={value}
            dir="ltr"
            className="flex items-center justify-center gap-4 md:gap-6"
          >
            <Icon
              className="h-11 w-11 shrink-0 text-[#78a794] md:h-12 md:w-12"
              strokeWidth={1.6}
            />
            <div className="text-start">
              <p className="text-2xl font-black leading-none text-primary md:text-[1.75rem]">
                {value}
              </p>
              <p className="mt-1.5 text-sm font-bold text-text-light">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
