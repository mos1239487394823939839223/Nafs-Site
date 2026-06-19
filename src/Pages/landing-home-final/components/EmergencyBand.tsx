import { Button } from "../../../components/ui/button";
import { LockKeyhole, PhoneCall, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const EmergencyBand = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const items = [
    {
      icon: LockKeyhole,
      title: isAr ? "شعرت بخطر؟" : "Feeling unsafe?",
      desc: isAr
        ? "لا تتردد، اطلب المساعدة الآن، سلامتك أولاً."
        : "Do not hesitate. Ask for help now — your safety comes first.",
      cta: isAr ? "طلب مساعدة" : "Ask for help",
      primary: false,
    },
    {
      icon: PhoneCall,
      title: isAr ? "اتصل للطوارئ" : "Emergency call",
      desc: isAr
        ? "تحدث مع مختص فوراً بشكل سري وآمن."
        : "Speak with a specialist immediately, privately and safely.",
      cta: isAr ? "اتصال طوارئ" : "Emergency call",
      primary: true,
    },
    {
      icon: ShieldCheck,
      title: isAr ? "تعرضت للابتزاز؟" : "Facing blackmail?",
      desc: isAr
        ? "تواصل معنا بسرية تامة، سنوفر لك الدعم والحماية."
        : "Contact us confidentially for support and protection.",
      cta: isAr ? "طلب حماية" : "Protection request",
      primary: false,
    },
  ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl rounded-[18px] bg-[#f6f9f6] px-5 py-6 md:px-8 md:py-5">
        <h2 className="text-center text-lg font-bold text-[#234c3f] md:text-xl">
          {isAr
            ? "محتاجة مساعدة الآن؟ نحن هنا من أجلك"
            : "Need help now? We are here for you"}
        </h2>

        <div className="mt-4 grid items-stretch gap-3 md:grid-cols-[1fr_1.08fr_1fr] md:gap-5">
          {items.map(({ icon: Icon, title, desc, cta, primary }) => (
            <article
              key={title}
              dir={isAr ? "rtl" : "ltr"}
              className={`flex min-h-[150px] items-center justify-center gap-4 rounded-xl px-3 py-4 text-start md:min-h-[156px] ${
                primary
                  ? "border border-[#e2e9e5] bg-white shadow-[0_2px_8px_rgba(31,75,61,0.035)]"
                  : ""
              }`}
            >
              <Icon
                className="h-10 w-10 shrink-0 text-[#78a794] md:h-11 md:w-11"
                strokeWidth={1.65}
              />

              <div className="flex min-w-0 flex-col items-center text-center">
                <h3 className={`text-[15px] font-bold leading-6 md:text-base ${primary ? "text-[#397b62]" : "text-[#294b40]"}`}>
                  {title}
                </h3>
                <p className="mt-1 max-w-[190px] text-xs font-medium leading-6 text-[#5f7069] md:text-[13px]">
                  {desc}
                </p>
                <Button
                  onClick={() => navigate("/auth/login")}
                  variant="outline"
                  className={`mt-3 !h-9 min-w-[128px] !rounded-lg !px-5 !text-xs ${
                    primary
                      ? "border border-[#0e5a3c] bg-[#0e5a3c] text-white hover:bg-[#0b4b32]"
                      : "border border-[#c8d8d1] bg-transparent text-[#315548] hover:bg-white"
                  }`}
                >
                  {cta}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
