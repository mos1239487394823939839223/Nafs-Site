import { Button } from "@/components/ui/button";
import {
  ArrowUpLeft,
  Clock3,
  LockKeyhole,
  MessageCircleMore,
  PhoneCall,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const EmergencyBand = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const items = [
    {
      icon: MessageCircleMore,
      number: "01",
      titleKey: "landing.emergency.blackmail.title",
      descKey: "landing.emergency.blackmail.desc",
      ctaKey: "landing.emergency.blackmail.cta",
      eyebrow: isAr ? "دعم بسرية تامة" : "Completely confidential",
      accent: "text-[#7A3850]",
      iconStyle: "bg-[#F8E9EE] text-[#8F3F5A]",
      buttonStyle: "bg-[#8F3F5A] text-white hover:bg-[#78344B]",
      glow: "bg-[#D98DA6]",
    },
    {
      icon: PhoneCall,
      number: "02",
      titleKey: "landing.emergency.call.title",
      descKey: "landing.emergency.call.desc",
      ctaKey: "landing.emergency.call.cta",
      eyebrow: isAr ? "استجابة فورية" : "Immediate response",
      accent: "text-[#A1444F]",
      iconStyle: "bg-[#A1444F] text-white shadow-lg shadow-[#A1444F]/20",
      buttonStyle: "bg-[#0F5A46] text-white hover:bg-[#0B4939]",
      glow: "bg-[#E2A0A5]",
      featured: true,
    },
    {
      icon: LockKeyhole,
      number: "03",
      titleKey: "landing.emergency.danger.title",
      descKey: "landing.emergency.danger.desc",
      ctaKey: "landing.emergency.danger.cta",
      eyebrow: isAr ? "خطة أمان شخصية" : "Personal safety plan",
      accent: "text-[#17614D]",
      iconStyle: "bg-[#E3F1EB] text-[#17614D]",
      buttonStyle: "bg-[#17614D] text-white hover:bg-[#104D3D]",
      glow: "bg-[#8FC9AF]",
    },
  ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-16 md:py-24">
      <div className="relative overflow-hidden rounded-[36px] border border-[#E5D9CB] bg-[#FBF5EA] px-5 py-10 shadow-[0_30px_80px_-50px_rgba(64,38,25,0.55)] sm:px-8 md:px-12 md:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(#CBB9A7_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="pointer-events-none absolute -end-24 -top-28 h-80 w-80 rounded-full bg-[#E9B7AD]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -start-20 h-80 w-80 rounded-full bg-[#9ACCB4]/25 blur-3xl" />

        <div className="relative mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#A1444F]/30" />
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A1444F]/15 bg-white/70 px-4 py-2 text-xs font-extrabold text-[#873A45] shadow-sm backdrop-blur">
              <ShieldAlert className="h-4 w-4" />
              {isAr ? "مساحة آمنة لك" : "A safe space for you"}
            </span>
            <span className="h-px w-10 bg-[#A1444F]/30" />
          </div>
          <h2 className="text-3xl font-black leading-tight text-[#183C32] md:text-5xl">
            {t("landing.emergency.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-8 text-[#557369] md:text-base">
            {isAr
              ? "اختر نوع المساعدة الأنسب لك. سيوصلك فريقنا بالخطوة الأكثر أمانًا بسرعة، وخصوصية، ومن دون أحكام."
              : "Choose the support that fits your situation. Our team will guide you to the safest next step quickly, privately, and without judgment."}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-[#526E64]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5"><Clock3 className="h-3.5 w-3.5 text-[#A1444F]" />{isAr ? "متاح على مدار الساعة" : "Available 24/7"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5"><LockKeyhole className="h-3.5 w-3.5 text-[#17614D]" />{isAr ? "خصوصية كاملة" : "Fully private"}</span>
          </div>
        </div>

        <div className="relative grid gap-4 lg:grid-cols-3">
          {items.map(({ icon: Icon, number, titleKey, descKey, ctaKey, eyebrow, accent, iconStyle, buttonStyle, glow, featured }) => (
            <article
              key={titleKey}
              className={`group relative flex min-h-[330px] overflow-hidden rounded-[28px] border bg-white/85 p-6 text-start shadow-[0_20px_45px_-35px_rgba(37,67,56,0.5)] backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_55px_-32px_rgba(37,67,56,0.42)] md:p-7 ${
                featured ? "border-[#A1444F]/35 ring-4 ring-[#A1444F]/5" : "border-white"
              }`}
            >
              <div className={`pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-2xl transition-transform duration-500 group-hover:scale-125 ${glow}`} />
              <span className="absolute end-5 top-4 text-5xl font-black text-[#173F33]/[0.055]">{number}</span>

              <div className="relative flex w-full flex-col">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span className={`grid h-14 w-14 place-items-center rounded-[20px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${iconStyle}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  {featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F1] px-3 py-1.5 text-[10px] font-black text-[#A1444F]">
                      <Sparkles className="h-3 w-3" />
                      {isAr ? "الأسرع" : "Fastest"}
                    </span>
                  )}
                </div>

                <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.12em] ${accent}`}>{eyebrow}</p>
                <h3 className="text-xl font-black text-[#183C32]">{t(titleKey)}</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-[#667E75]">{t(descKey)}</p>

                <Button
                  onClick={() => navigate("/auth/login")}
                  className={`mt-auto h-12 w-full rounded-2xl text-sm font-extrabold shadow-none transition-all group-hover:shadow-lg ${buttonStyle}`}
                >
                  <span>{t(ctaKey)}</span>
                  <ArrowUpLeft className={`ms-2 h-4 w-4 ${isAr ? "" : "-rotate-90"}`} />
                </Button>
              </div>
            </article>
          ))}
        </div>

        <p className="relative mt-7 text-center text-xs font-bold text-[#6C8179]">
          {isAr ? "في حالة الخطر المباشر، تواصل فورًا مع خدمات الطوارئ المحلية." : "If you are in immediate danger, contact your local emergency services now."}
        </p>
      </div>
    </section>
  );
};
