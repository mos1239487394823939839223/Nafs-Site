import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import en from "../../../i18n/en.js";
import ar from "../../../i18n/ar.js";
import { testimonial1 as t1, testimonial2 as t2, testimonial3 as t3 } from "../assets";

interface TestimonialItem { name: string; role: string; quote: string; }

export const Testimonials = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const translations: any = isAr ? ar : en;

  const items = useMemo<TestimonialItem[]>(() => {
    const translated = translations?.landing?.testimonials?.items || [];
    const extra = isAr
      ? [
          { name: "ريم سامح", role: "مستخدمة", quote: "سهولة الحجز واختيار طريقة الجلسة جعلت البداية أقل توترًا بكثير." },
          { name: "عمر ياسر", role: "مستخدم", quote: "وجدت المعالج المناسب بسرعة، والمتابعة بعد الجلسة كانت ممتازة." },
          { name: "ندى حسن", role: "مستخدمة", quote: "التجربة آمنة ومريحة، وشعرت أن خصوصيتي محترمة في كل خطوة." },
        ]
      : [
          { name: "Reem Sameh", role: "User", quote: "Easy booking and flexible session formats made getting started much less stressful." },
          { name: "Omar Yasser", role: "User", quote: "I found the right therapist quickly, and the follow-up after my session was excellent." },
          { name: "Nada Hassan", role: "User", quote: "The experience felt safe and comfortable, with my privacy respected at every step." },
        ];
    return [...translated, ...extra];
  }, [isAr, translations]);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const move = (direction: number) =>
    setActive((current) => (current + direction + items.length) % items.length);
  const handleTouchEnd = (endX: number) => {
    if (touchStart.current == null) return;
    const distance = endX - touchStart.current;
    if (Math.abs(distance) > 45) {
      move(distance > 0 ? (isAr ? -1 : 1) : (isAr ? 1 : -1));
    }
    touchStart.current = null;
  };

  const visible = [0, 1, 2].map((offset) => items[(active + offset) % items.length]);
  const photos = [t1, t2, t3];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:py-24">
      <div className="mb-9 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground md:text-3xl">{t("landing.testimonials.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAr ? "تجارب حقيقية من مستخدمين بدأوا رحلتهم مع نفس." : "Real experiences from users who started their journey with Nafas."}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => move(isAr ? 1 : -1)} className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-brand hover:bg-brand-soft" aria-label="Previous">
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button onClick={() => move(isAr ? -1 : 1)} className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-brand hover:bg-brand-soft" aria-label="Next">
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div
        className="grid touch-pan-y gap-5 md:grid-cols-3"
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
      >
        {visible.map((item, idx) => (
          <article key={`${active}-${idx}`} className={`rounded-[24px] border bg-card p-6 shadow-[var(--shadow-card)] transition ${idx > 0 ? "hidden md:block" : ""} ${idx === 0 ? "border-brand/30 md:-translate-y-2 md:shadow-[var(--shadow-soft)]" : "border-border/60"}`}>
            <div className="flex items-center justify-between">
              <Quote className="h-7 w-7 text-brand/45" />
              <div className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
            </div>
            <p className="mt-5 min-h-[92px] text-sm leading-7 text-foreground/80">{item.quote}</p>
            <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
              <img src={photos[idx]} alt={item.name} className="h-12 w-12 rounded-2xl object-cover" />
              <div>
                <p className="text-sm font-bold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-7 flex justify-center gap-2">
        {items.map((_, index) => <button key={index} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${active === index ? "w-7 bg-brand" : "w-2 bg-border"}`} aria-label={`Testimonial ${index + 1}`} />)}
      </div>
    </section>
  );
};
