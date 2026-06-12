import { Button } from "@/components/ui/button";
import { LockKeyhole, PhoneCall, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { landingBtnMd } from "../landingButtonStyles";

export const EmergencyBand = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const items = [
    {
      icon: LockKeyhole,
      title: isAr ? "شعرت بخطر؟" : "Feeling unsafe?",
      desc: isAr ? "لا تتردد، اطلب المساعدة الآن، سلامتك أولاً." : "Do not hesitate. Ask for help now — your safety comes first.",
      cta: isAr ? "طلب مساعدة" : "Ask for help",
      primary: false,
    },
    {
      icon: PhoneCall,
      title: isAr ? "اتصل للطوارئ!" : "Emergency call",
      desc: isAr ? "تحدث مع مختص فورًا بشكل سري وآمن." : "Speak with a specialist immediately, privately and safely.",
      cta: isAr ? "اتصال طارئ" : "Emergency call",
      primary: true,
    },
    {
      icon: ShieldCheck,
      title: isAr ? "تعرضت للابتزاز؟" : "Facing blackmail?",
      desc: isAr ? "تواصل معنا بسرية تامة، سنوفر لك الدعم والحماية." : "Contact us confidentially for support and protection.",
      cta: isAr ? "طلب حماية" : "Protection request",
      primary: false,
    },
  ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl rounded-md border border-[#E8EEE9] bg-[#F5F7F2] px-5 py-10 md:px-10">
 
        <h2 className="text-center text-2xl font-black text-[#17483A] md:text-3xl">
          {isAr ? "محتاجة مساعدة الآن؟ نحن هنا من أجلك" : "Need help now? We are here for you"}
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, cta, primary }) => (
            <article
              key={title}
              dir={isAr ? "rtl" : "ltr"}
              className={`rounded-md p-7 ${
                primary
                  ? "border border-[#D6E3DD] bg-white shadow-[0_16px_38px_-32px_rgba(15,76,58,.4)]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-6 md:gap-8">
                <Icon
                  className="h-12 w-12 shrink-0 text-[#7AA797] md:h-14 md:w-14"
                  strokeWidth={1.5}
                />
                <div className="min-w-0 flex-1 text-start">
                  <h3 className="text-lg font-black leading-snug text-[#17483A]">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-[#63776F]">{desc}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => navigate("/auth/login")}
                  variant="outline"
                  className={landingBtnMd}
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
