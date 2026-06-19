import { Button } from "@/components/ui/button";
import { ArrowUpLeft, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const FinalCTA = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  return <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-16 md:py-20"><div className="relative overflow-hidden rounded-[38px] bg-[linear-gradient(120deg,var(--primary-hover),var(--primary)_55%,var(--secondary-accent))] px-6 py-14 text-center text-white shadow-[0_35px_80px_-40px_rgba(15,76,58,.8)] md:px-12 md:py-20"><div className="absolute -start-24 -top-24 h-72 w-72 rounded-full border-[50px] border-white/5" /><div className="absolute -bottom-32 -end-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" /><span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10"><HeartHandshake className="h-8 w-8" /></span><h2 className="relative mx-auto mt-6 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{t("landing.finalCta.title")}</h2><p className="relative mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-white/75 md:text-base">{t("landing.finalCta.desc")}</p><Button onClick={() => navigate("/auth/role-selection")} className="relative mt-8 h-14 rounded-2xl bg-background-paper px-8 text-base font-black text-primary shadow-xl hover:-translate-y-1 hover:bg-background">{t("landing.finalCta.button")}<ArrowUpLeft className={`ms-2 h-5 w-5 ${isAr ? "" : "-rotate-90"}`} /></Button><div className="relative mt-6 flex flex-wrap justify-center gap-4 text-[11px] font-bold text-white/70"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />{isAr ? "آمن وخاص" : "Secure and private"}</span><span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" />{isAr ? "ابدأ في دقائق" : "Start in minutes"}</span></div></div></section>;
};
