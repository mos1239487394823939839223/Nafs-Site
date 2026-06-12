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
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={value} className="text-center">
            <Icon className="mx-auto h-10 w-10 text-[#7AA797]" strokeWidth={1.7} />
            <p className="mt-3 text-3xl font-black text-[#0F6A52]">{value}</p>
            <p className="mt-1 text-sm font-bold text-[#63776F]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
