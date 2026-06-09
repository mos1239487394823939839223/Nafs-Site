import { Button } from "@/components/ui/button";
import { ShieldAlert, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const EmergencyBand = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const items = [
    { icon: ShieldAlert, titleKey: "landing.emergency.blackmail.title", descKey: "landing.emergency.blackmail.desc", ctaKey: "landing.emergency.blackmail.cta", highlight: false },
    { icon: Phone, titleKey: "landing.emergency.call.title", descKey: "landing.emergency.call.desc", ctaKey: "landing.emergency.call.cta", highlight: true },
    { icon: Lock, titleKey: "landing.emergency.danger.title", descKey: "landing.emergency.danger.desc", ctaKey: "landing.emergency.danger.cta", highlight: false },
  ];

  return (
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-16 md:py-20">
    <div className="relative overflow-hidden rounded-[32px] border border-[#DCCFC0] bg-[linear-gradient(135deg,#FFF8EB_0%,#F7EFE4_48%,#EDF6F1_100%)] p-6 shadow-[0_28px_70px_-38px_rgba(91,58,35,0.5)] md:p-10">
      <div className="absolute -end-20 -top-24 h-64 w-64 rounded-full bg-[#E7B8A8]/20 blur-3xl" />
      <div className="absolute -bottom-24 -start-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="relative mx-auto mb-8 max-w-xl text-center">
        <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[22px] bg-[#8F3F4A] text-white shadow-lg shadow-[#8F3F4A]/25">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h2 className="text-center text-2xl font-black text-foreground md:text-3xl">
          {t("landing.emergency.title")}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {isAr ? "اختر نوع المساعدة المناسبة وسيوصلك فريقنا للخطوة الأكثر أمانًا بسرعة وخصوصية." : "Choose the support you need and our team will guide you to the safest next step quickly and privately."}
        </p>
      </div>
      <div className="relative grid gap-5 md:grid-cols-3">
        {items.map(({ icon: Icon, titleKey, descKey, ctaKey, highlight }) => (
          <div
            key={titleKey}
            className={`flex min-h-[280px] flex-col items-center rounded-[24px] border p-6 text-center transition duration-300 hover:-translate-y-1 ${
              highlight
                ? "border-[#B86B75]/30 bg-[#8F3F4A] text-white shadow-xl shadow-[#8F3F4A]/20"
                : "border-white/80 bg-white/80 shadow-[var(--shadow-card)] backdrop-blur"
            }`}
          >
            <span
              className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${
                highlight ? "bg-white/15 text-white" : "bg-brand-soft text-brand"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <h3 className={`text-lg font-bold ${highlight ? "text-white" : "text-foreground"}`}>{t(titleKey)}</h3>
            <p className={`mt-3 text-sm leading-7 ${highlight ? "text-white/80" : "text-muted-foreground"}`}>{t(descKey)}</p>
            <Button
              onClick={() => navigate("/auth/login")}
              className={`mt-auto w-full ${
                highlight
                  ? "bg-white text-[#8F3F4A] hover:bg-white/90"
                  : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              {t(ctaKey)}
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
