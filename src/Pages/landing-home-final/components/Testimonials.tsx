import { Quote } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { testimonial1 as t1, testimonial2 as t2, testimonial3 as t3 } from "../assets";

export const Testimonials = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const items = isAr
    ? [
        { name: "منى خالد", role: "عميلة", quote: "منصة رائعة ساعدتني أفهم مشكلتي، الدكتورة كانت راقية.", image: t1 },
        { name: "أحمد محمود", role: "عميل", quote: "ساعدوني في اختيار دكتور مناسب باحترافية وخصوصية تامة.", image: t2 },
        { name: "فاطمة علي", role: "عميلة", quote: "الدعم كان سريع والمتخصصين متفهمين جدًا.", image: t3 },
      ]
    : [
        { name: "Mona Khaled", role: "Client", quote: "A wonderful platform that helped me understand my issue. The doctor was excellent.", image: t1 },
        { name: "Ahmed Mahmoud", role: "Client", quote: "They helped me choose the right doctor with care and complete privacy.", image: t2 },
        { name: "Fatma Ali", role: "Client", quote: "Support was fast and the specialists were very understanding.", image: t3 },
      ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
      <h2 className="text-center text-3xl font-black text-text-heading">
        {isAr ? "ماذا يقول عملاؤنا" : "What our clients say"}
      </h2>

      <div className="mt-8 grid gap-12 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="flex min-h-[220px] flex-col rounded-lg border border-border bg-background-paper p-6"
          >
            <Quote
              className={`h-8 w-8 shrink-0 text-[#78a794] ${isAr ? "ms-auto" : "me-auto"}`}
              strokeWidth={1.5}
            />

            <p className="mt-4 flex-1 text-start text-sm font-semibold leading-8 text-text">
              {item.quote}
            </p>

            <div className="mt-6 flex items-center justify-between gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 text-start">
                <p className="text-sm font-black text-text-heading">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-text-light">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex justify-center gap-2">
        <span className="h-2 w-2 rounded-full border border-text-light" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
        <span className="h-2 w-2 rounded-full border border-text-light" aria-hidden />
      </div>
      </div>
    </section>
  );
};
