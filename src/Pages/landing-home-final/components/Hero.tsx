import { Button } from "@/components/ui/button";
import { ArrowUpLeft, BadgeCheck, HeartHandshake, Lock, Play, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { heroArmchair as heroImg, testimonial1 } from "../assets";

export const Hero = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  return (
    <section id="home" dir={isAr ? "rtl" : "ltr"} className="relative overflow-hidden bg-[linear-gradient(145deg,#F4FBF7_0%,#FFF9EE_55%,#EDF7F2_100%)]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#72A88F_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="absolute -start-32 top-20 h-80 w-80 rounded-full bg-[#7CC9A1]/20 blur-3xl" />
      <div className="container relative mx-auto grid min-h-[680px] items-center gap-10 px-4 py-12 lg:grid-cols-[1.02fr_.98fr] lg:py-16">
        <div className="landing-reveal text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2D7A61]/15 bg-white/75 px-4 py-2 text-xs font-black text-[#2D7A61] shadow-sm"><Sparkles className="h-4 w-4" />{isAr ? "رعاية نفسية تناسبك أنت" : "Mental care built around you"}</span>
          <h1 className="landing-section-title mt-6 max-w-2xl text-4xl sm:text-5xl lg:text-[68px]">{t("landing.hero.heading")}</h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#5D776D] lg:text-lg">{t("landing.hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/auth/role-selection")} className="h-14 rounded-2xl bg-[#0F4C3A] px-7 text-base font-black text-white shadow-xl shadow-[#0F4C3A]/20 hover:-translate-y-1 hover:bg-[#0A3F32]">{t("landing.hero.bookNow")}<ArrowUpLeft className={`ms-2 h-5 w-5 ${isAr ? "" : "-rotate-90"}`} /></Button>
            <Button onClick={() => navigate("/auth/login")} variant="outline" className="h-14 rounded-2xl border-[#0F4C3A]/15 bg-white/80 px-7 text-base font-black text-[#0F4C3A] hover:-translate-y-1 hover:bg-white"><Play className="me-2 h-4 w-4 fill-current" />{t("landing.hero.freeAssessment")}</Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#557369]">
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#2D7A61]" />{isAr ? "معالجون معتمدون" : "Certified therapists"}</span>
            <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-[#2D7A61]" />{isAr ? "خصوصية كاملة" : "Fully private"}</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="relative overflow-hidden rounded-[36px] border-[8px] border-white bg-white shadow-[0_35px_80px_-35px_rgba(15,76,58,.45)]">
            <img src={heroImg} alt={t("landing.hero.heading")} className="h-[430px] w-full object-cover sm:h-[540px]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0F4C3A]/65 to-transparent" />
            <div className="absolute bottom-5 start-5 end-5 flex items-center justify-between rounded-2xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md">
              <div><p className="text-xs font-bold text-white/75">{isAr ? "متوسط التقييم" : "Average rating"}</p><p className="mt-1 flex items-center gap-1 text-xl font-black">4.9 <Star className="h-4 w-4 fill-amber-300 text-amber-300" /></p></div>
              <div className="flex -space-x-2 rtl:space-x-reverse"><img src={testimonial1} className="h-10 w-10 rounded-full border-2 border-white object-cover" /><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#2D7A61] text-xs font-black">+12k</span></div>
            </div>
          </div>
          <div className="landing-float absolute -start-5 top-14 hidden rounded-2xl border border-white bg-white/90 p-4 shadow-xl sm:flex sm:items-center sm:gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E3F2EA] text-[#0F4C3A]"><HeartHandshake /></span><div><p className="text-xs font-black text-[#183C32]">{isAr ? "دعم قريب منك" : "Support that feels close"}</p><p className="mt-1 text-[10px] text-[#6A8178]">{isAr ? "بخطوات بسيطة وآمنة" : "Simple and secure steps"}</p></div></div>
        </div>
      </div>
    </section>
  );
};
