import { BadgeCheck, Clock, ThumbsUp, Users } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Stats = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const stats = [
    { icon: Users, valueKey: "landing.stats.users.value", labelKey: "landing.stats.users.label", tone: "bg-[#E5F3EB] text-[#17614D]" },
    { icon: BadgeCheck, valueKey: "landing.stats.doctors.value", labelKey: "landing.stats.doctors.label", tone: "bg-[#E9EFF9] text-[#4267A9]" },
    { icon: ThumbsUp, valueKey: "landing.stats.satisfaction.value", labelKey: "landing.stats.satisfaction.label", tone: "bg-[#FFF1D8] text-[#B37516]" },
    { icon: Clock, valueKey: "landing.stats.available.value", labelKey: "landing.stats.available.label", tone: "bg-[#F9E9EC] text-[#9A4655]" },
  ];
  return <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16"><div className="rounded-[32px] border border-[#0F4C3A]/10 bg-white/75 p-4 shadow-[0_25px_60px_-45px_rgba(15,76,58,.55)] backdrop-blur md:p-6"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(({ icon: Icon, valueKey, labelKey, tone }) => <div key={labelKey} className="group rounded-[24px] p-5 text-center transition hover:bg-[#F7FBF9] md:p-7"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl transition-transform group-hover:scale-110 ${tone}`}><Icon className="h-6 w-6" /></span><p className="mt-4 text-3xl font-black text-[#153C30] md:text-4xl">{t(valueKey)}</p><p className="mt-2 text-xs font-bold text-[#6A8178]">{t(labelKey)}</p></div>)}</div></div></section>;
};
