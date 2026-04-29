import { Quote } from "lucide-react";
import t1 from "../assets/testimonial-1.jpg";
import t2 from "../assets/testimonial-2.jpg";
import t3 from "../assets/testimonial-3.jpg";

const items = [
  { img: t3, name: "فاطمة علي", role: "عميلة", quote: "الدعم كان سريع والمختصين متفهمين جداً." },
  { img: t2, name: "أحمد محمود", role: "عميل", quote: "ساعدوني في تخطي مرحلة صعبة باحترافية وخصوصية تامة." },
  { img: t1, name: "منى خالد", role: "عميلة", quote: "منصة رائعة، حسيت بفهم حقيقي لمشكلتي. الدكتورة كانت رائعة." },
];

export const Testimonials = () => (
  <section className="container mx-auto px-4 py-12">
    <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
      ماذا يقول عملاؤنا
    </h2>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.name}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <Quote className="h-5 w-5 text-brand/60" />
          <p className="mt-3 text-sm leading-relaxed text-foreground/80 text-right">
            {it.quote}
          </p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{it.name}</p>
              <p className="text-xs text-muted-foreground">{it.role}</p>
            </div>
            <img
              src={it.img}
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
