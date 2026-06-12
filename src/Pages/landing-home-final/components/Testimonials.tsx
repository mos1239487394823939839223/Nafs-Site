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
      <h2 className="text-center text-3xl font-black text-[#17483A]">
        {isAr ? "ماذا يقول عملاؤنا" : "What our clients say"}
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="flex min-h-[220px] flex-col rounded-xl border border-[#E4ECE8] bg-white p-7"
          >
            <Quote
              className={`h-8 w-8 shrink-0 text-[#9FBDAF] ${isAr ? "ms-auto" : "me-auto"}`}
              strokeWidth={1.5}
            />

            <p className="mt-4 flex-1 text-start text-sm font-semibold leading-8 text-[#40584F]">
              {item.quote}
            </p>

            <div className="mt-6 flex items-center justify-between gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover md:h-[4.5rem] md:w-[4.5rem]"
              />
              <div className="min-w-0 text-start">
                <p className="text-sm font-black text-[#17483A]">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#63776F]">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex justify-center gap-2">
        <span className="h-2 w-2 rounded-full border border-[#9FBDAF]" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[#0F5C43]" aria-hidden />
        <span className="h-2 w-2 rounded-full border border-[#9FBDAF]" aria-hidden />
      </div>
    </section>
  );
};
