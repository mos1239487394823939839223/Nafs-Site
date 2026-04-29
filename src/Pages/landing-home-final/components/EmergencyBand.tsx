import { Button } from "@/components/ui/button";
import { ShieldAlert, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const items = [
  {
    icon: ShieldAlert,
    title: "تعرضت للابتزاز؟",
    desc: "تواصل معنا بسرية تامة، سنوفر لك الدعم والحماية.",
    cta: "طلب حماية",
    highlight: false,
  },
  {
    icon: Phone,
    title: "اتصل للطوارئ",
    desc: "تحدث مع مختص فوراً بشكل سري وآمن.",
    cta: "اتصال طوارئ",
    highlight: true,
  },
  {
    icon: Lock,
    title: "شعرت بخطر؟",
    desc: "لا تتردد. اطلب المساعدة الآن، سلامتك أولاً.",
    cta: "طلب مساعدة",
    highlight: false,
  },
];

export const EmergencyBand = () => {
  const navigate = useNavigate();
  return (
  <section className="container mx-auto px-4 py-10">
    <div className="rounded-[2rem] bg-cream-deep p-6 md:p-10">
      <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
        محتاجة مساعدة الآن؟ نحن هنا من أجلك
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map(({ icon: Icon, title, desc, cta, highlight }) => (
          <div
            key={title}
            className={`flex flex-col items-center rounded-2xl p-6 text-center transition ${
              highlight
                ? "bg-brand-soft ring-2 ring-brand/30"
                : "bg-card shadow-[var(--shadow-card)]"
            }`}
          >
            <span
              className={`mb-3 grid h-12 w-12 place-items-center rounded-full ${
                highlight ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            <Button
              onClick={() => navigate("/auth/login")}
              className={`mt-5 rounded-full px-6 ${
                highlight
                  ? "bg-brand text-brand-foreground hover:bg-brand/90"
                  : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              {cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
