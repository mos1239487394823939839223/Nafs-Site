import { Quote } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import en from "../../../i18n/en.js";
import ar from "../../../i18n/ar.js";
import t1 from "../assets/testimonial-1.jpg";
import t2 from "../assets/testimonial-2.jpg";
import t3 from "../assets/testimonial-3.jpg";

const photos = [t3, t2, t1];

interface TestimonialItem { name: string; role: string; quote: string; }

export const Testimonials = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const translations: any = isAr ? ar : en;
  const items: TestimonialItem[] = translations?.landing?.testimonials?.items || [];

  return (
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12">
    <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
      {t("landing.testimonials.title")}
    </h2>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <Quote className="h-5 w-5 text-brand/60" />
          <p className="mt-3 text-sm leading-relaxed text-foreground/80 text-end">
            {it.quote}
          </p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <div className="text-end">
              <p className="text-sm font-bold text-foreground">{it.name}</p>
              <p className="text-xs text-muted-foreground">{it.role}</p>
            </div>
            <img
              src={photos[idx]}
              alt={it.name}
              width={512}
              height={512}
              loading="lazy"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 flex items-center justify-center gap-2">
      <span className="h-2 w-2 rounded-full bg-border" />
      <span className="h-2 w-6 rounded-full bg-brand" />
      <span className="h-2 w-2 rounded-full bg-border" />
    </div>
  </section>
  );
};
