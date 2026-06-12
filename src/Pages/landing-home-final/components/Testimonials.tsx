import { Quote, Star } from "lucide-react";
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
      <h2 className="text-center text-3xl font-black text-[#17483A]">{isAr ? "ماذا يقول عملاؤنا" : "What our clients say"}</h2>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.name} className="rounded-md border border-[#E4ECE8] bg-white p-7">
            <div className="flex items-center justify-between">
              <Quote className="h-7 w-7 text-[#9FBDAF]" />
              <div className="flex gap-0.5 text-[#F6C453]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-5 min-h-[82px] text-sm font-semibold leading-8 text-[#40584F]">{item.quote}</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-[#17483A]">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#63776F]">{item.role}</p>
              </div>
              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex justify-center gap-2">
        <span className="h-2 w-2 rounded-full border border-[#9FBDAF]" />
        <span className="h-2 w-2 rounded-full bg-[#0F6A52]" />
        <span className="h-2 w-2 rounded-full border border-[#9FBDAF]" />
      </div>
    </section>
  );
};
