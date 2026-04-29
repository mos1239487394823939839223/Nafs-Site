import { ClipboardCheck, UserPlus, CalendarCheck } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: ClipboardCheck,
    title: "تقييم حالتك النفسية",
    desc: "أجب على بعض الأسئلة البسيطة لفهم حالتك بشكل أفضل",
  },
  {
    number: 2,
    icon: UserPlus,
    title: "اختر دكتورك المناسب",
    desc: "نرشح لك أفضل الدكاترة المتخصصين حسب حالتك واحتياجك",
  },
  {
    number: 3,
    icon: CalendarCheck,
    title: "احجز جلستك وابدأ",
    desc: "اختر الوقت المناسب لك وابدأ رحلتك نحو حياة أفضل",
  },
];

export const Journey = () => {
  return (
    <section dir="rtl" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-12">
          كيف تبدأ رحلتك؟
        </h2>

        <div className="relative max-w-5xl mx-auto">
          {/* Dotted connector line (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 right-[12%] left-[12%] -translate-y-1/2 border-t-2 border-dashed border-brand/40 z-0"
          />
          {/* Connector dots */}
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 right-[33%] -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand z-0"
          />
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 left-[33%] -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map(({ number, icon: Icon, title, desc }) => (
              <div
                key={number}
                className="relative bg-card border border-border rounded-2xl p-6 pt-8 shadow-[var(--shadow-card)] text-right"
              >
                <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-brand text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {number}
                </span>
                <Icon className="w-10 h-10 text-brand mb-4" strokeWidth={1.75} />
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
