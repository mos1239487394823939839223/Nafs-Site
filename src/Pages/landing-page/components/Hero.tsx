import { Button } from "./ui/button";
import { ShieldCheck, UserCheck, CalendarClock, Phone, Video, MessageSquare, Sparkles, BookOpen } from "lucide-react";

const trust = [
  { icon: ShieldCheck, label: "خصوصية مشفّرة" },
  { icon: UserCheck, label: "أطباء معتمدون" },
  { icon: CalendarClock, label: "مرونة في المواعيد" },
];

const articles = ["كيف أفهم نوبات القلق؟", "روتين بسيط لهدوء يومك", "العلاقات وحدودك النفسية"];

const Hero = () => {
  return (
    <section className="w-full pb-16">
      <div className="w-full bg-gradient-hero p-8 md:p-14 shadow-soft">
        {/* Headline */}
        <div className="max-w-3xl text-end">
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.3] text-foreground">
            دعم نفسي رقمي يجمع بين <span className="text-primary">التكنولوجيا</span> و <span className="text-primary">الإنسانية</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            نَفَس يقدّم لك جلسات علاج نفسي بالصوت أو الفيديو أو الشات، مع روبوت ذكي للتقييم الأولي ومحتوى توعوي موثوق.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-end">
            <Button variant="outline" size="lg" className="rounded-full bg-card">تعرّف على المزايا</Button>
            <Button variant="hero" size="lg" className="rounded-full">ابدأ التقييم المجاني</Button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-end gap-2 bg-card/70 backdrop-blur rounded-2xl px-5 py-3.5 border border-border/50">
              <span className="text-sm font-medium text-foreground/80">{label}</span>
              <Icon className="w-4 h-4 text-primary" />
            </div>
          ))}
        </div>

        {/* Preview card */}
        <div className="mt-8 bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50">
          <div className="text-end text-sm text-muted-foreground mb-5">معاينة التطبيق</div>

          {/* Communication */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5 mb-4">
            <div className="flex flex-wrap gap-2 justify-end mb-3">
              <Pill icon={MessageSquare} label="شات" />
              <Pill icon={Video} label="فيديو" />
              <Pill icon={Phone} label="صوت" active />
            </div>
            <p className="text-sm text-end text-muted-foreground">اختر طريقة التواصل الأنسب لك. جميع الجلسات تتم بتشفير وحفاظ كامل على السرية.</p>
          </div>

          {/* AI Assessment */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5 mb-4">
            <div className="text-end font-semibold mb-2 flex items-center justify-end gap-2">
              تقييم ذكي لحالتك <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card rounded-xl p-4 text-end text-sm text-muted-foreground border border-border/60">
              ✨ أسئلة قصيرة لتقييم أولي (قلق / اكتئاب / توتر). في النهاية نقترح لك المعالج الأنسب.
            </div>
          </div>

          {/* Articles */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5">
            <div className="text-end font-semibold mb-3 flex items-center justify-end gap-2">
              مقالات للصحة النفسية <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {articles.map((a) => (
                <div key={a} className="bg-card rounded-xl px-4 py-3 text-sm text-end border border-border/60 flex items-center justify-end gap-2 hover:border-primary/40 transition-colors cursor-pointer">
                  {a}
                  <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pill = ({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-colors ${active ? "bg-primary-soft border-primary/30 text-primary" : "bg-card border-border text-foreground/70"}`}>
    <span>{label}</span>
    <Icon className="w-4 h-4" />
  </div>
);

export default Hero;
