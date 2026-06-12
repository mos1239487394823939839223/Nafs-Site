import { Button } from "@/components/ui/button";
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
      desc: isAr ? "لا تتردد. اطلب المساعدة الآن وسنساندك أولًا." : "Do not hesitate. Ask for support and we will help you first.",
      cta: isAr ? "طلب مساعدة" : "Ask for help",
      primary: false,
    },
    {
      icon: PhoneCall,
      title: isAr ? "اتصل للطوارئ" : "Emergency call",
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
      <div className="rounded-md bg-[#F5F9F6] px-5 py-10 md:px-10">
        <h2 className="text-center text-2xl font-black text-[#17483A] md:text-3xl">
          {isAr ? "محتاجة مساعدة الآن؟ نحن هنا من أجلك" : "Need help now? We are here for you"}
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, cta, primary }) => (
            <article
              key={title}
              className={`rounded-md border bg-white p-7 text-center ${
                primary ? "border-[#D6E3DD] shadow-[0_16px_38px_-32px_rgba(15,76,58,.4)]" : "border-transparent bg-transparent"
              }`}
            >
              <Icon className="mx-auto h-12 w-12 text-[#7AA797]" strokeWidth={1.7} />
              <h3 className="mt-5 text-lg font-black text-[#17483A]">{title}</h3>
              <p className="mx-auto mt-3 max-w-[230px] text-sm font-semibold leading-7 text-[#63776F]">{desc}</p>
              <Button
                onClick={() => navigate("/auth/login")}
                variant={primary ? "default" : "outline"}
                className={`mt-6 h-11 rounded-md px-8 font-bold ${
                  primary
                    ? "bg-[#0F6A52] text-white shadow-none hover:bg-[#0B5643]"
                    : "border-[#C9D9D1] bg-white text-[#17483A] hover:bg-[#F7FAF8]"
                }`}
              >
                {cta}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
