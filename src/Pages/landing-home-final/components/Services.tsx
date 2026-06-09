import { Button } from "@/components/ui/button";
import { ArrowUpLeft, Baby, Brain, Heart, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Services = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const services = [
    { icon: Users, titleKey: "landing.services.family.title", descKey: "landing.services.family.desc", color: "from-[#E5F3EB] to-[#F7FBF9]", iconColor: "bg-[#17614D] text-white" },
    { icon: Heart, titleKey: "landing.services.relationships.title", descKey: "landing.services.relationships.desc", color: "from-[#F9E9EC] to-[#FFF9FA]", iconColor: "bg-[#9A4655] text-white" },
    { icon: User, titleKey: "landing.services.individual.title", descKey: "landing.services.individual.desc", color: "from-[#E9EFF9] to-[#FAFCFF]", iconColor: "bg-[#4267A9] text-white" },
    { icon: Baby, titleKey: "landing.services.children.title", descKey: "landing.services.children.desc", color: "from-[#FFF1D8] to-[#FFFCF5]", iconColor: "bg-[#C4831D] text-white" },
    { icon: Brain, titleKey: "landing.services.programs.title", descKey: "landing.services.programs.desc", color: "from-[#EEEAF9] to-[#FCFBFF]", iconColor: "bg-[#7156A3] text-white", customDesc: isAr ? "اكتشف أهدافك وحدد خطواتك القادمة." : "Discover your goals and define your next steps." },
  ];
  return (
    <section id="services" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-16 md:py-20">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#2D7A61]">{isAr ? "رعاية متكاملة" : "Complete care"}</p><h2 className="landing-section-title mt-3 text-3xl md:text-4xl">{t("landing.services.title")}</h2></div><Button onClick={() => navigate("/auth/login")} variant="outline" className="rounded-xl border-[#0F4C3A]/15 bg-white font-black text-[#0F4C3A]">{t("landing.services.viewAll")}<ArrowUpLeft className={`ms-2 h-4 w-4 ${isAr ? "" : "-rotate-90"}`} /></Button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {services.map(({ icon: Icon, titleKey, descKey, color, iconColor, customDesc }, index) => (
          <article key={titleKey} className={`group relative overflow-hidden rounded-[28px] border border-[#0F4C3A]/10 bg-gradient-to-br ${color} p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#0F4C3A]/10 ${index < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}>
            <span className={`mb-8 grid h-14 w-14 place-items-center rounded-2xl shadow-lg transition-transform group-hover:-rotate-6 group-hover:scale-110 ${iconColor}`}><Icon className="h-6 w-6" /></span>
            <h3 className="text-lg font-black text-[#183C32]">{t(titleKey)}</h3><p className="mt-3 min-h-12 text-sm font-medium leading-7 text-[#657D74]">{customDesc || t(descKey)}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-xs font-black text-[#2D7A61]">{isAr ? "اعرف المزيد" : "Learn more"}<ArrowUpLeft className={`h-3.5 w-3.5 ${isAr ? "" : "-rotate-90"}`} /></span>
          </article>
        ))}
      </div>
    </section>
  );
};
