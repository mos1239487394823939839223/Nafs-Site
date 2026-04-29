import { Button } from "@/components/ui/button";
import { User, Heart, Baby, Users, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  { icon: User, title: "جلسات فردية", desc: "دعم نفسي فردي مع متخصصين" },
  { icon: Heart, title: "دعم العلاقات", desc: "تحسين علاقاتك وفهم نفسك والآخرين" },
  { icon: Baby, title: "دعم الأطفال", desc: "جلسات للأطفال والمراهقين" },
  { icon: Users, title: "إرشاد أسري", desc: "حل المشكلات الأسرية وتحسين التواصل" },
  { icon: Brain, title: "برامج علاجية", desc: "برامج متخصصة لعلاج القلق والاكتئاب" },
];

export const Services = () => {
  const navigate = useNavigate();
  return (
  <section id="services" className="container mx-auto px-4 py-12">
    <h2 className="text-center text-3xl font-bold text-foreground">خدماتنا</h2>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {services.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        >
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        onClick={() => navigate("/auth/login")}
        className="rounded-full border-border bg-card px-7 text-foreground hover:bg-secondary"
      >
        عرض جميع الخدمات
      </Button>
    </div>
  </section>
  );
};
