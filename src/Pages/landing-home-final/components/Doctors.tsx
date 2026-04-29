import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import d1 from "../assets/doctor-1.jpg";
import d2 from "../assets/doctor-2.jpg";
import d3 from "../assets/doctor-3.jpg";
import d4 from "../assets/doctor-4.jpg";

const doctors = [
  { img: d1, name: "د. سارة أحمد", specialty: "أخصائية نفسية إكلينيكية", rating: "4.9", price: "350 جنيه للجلسة" },
  { img: d2, name: "د. محمد علي", specialty: "أخصائي نفسي", rating: "4.8", price: "300 جنيه للجلسة" },
  { img: d3, name: "د. ندى إبراهيم", specialty: "أخصائية علاج معرفي سلوكي", rating: "4.9", price: "400 جنيه للجلسة" },
  { img: d4, name: "د. أحمد حسن", specialty: "أخصائي نفسي إكلينيكي", rating: "4.7", price: "350 جنيه للجلسة" },
];

export const Doctors = () => {
  const navigate = useNavigate();
  return (
  <section id="doctors" className="container mx-auto px-4 py-12">
    <div className="mb-6 flex items-center justify-between">
      <a href="#" className="text-sm font-medium text-brand hover:underline">
        عرض جميع الدكاترة
      </a>
      <h2 className="text-2xl font-bold text-foreground md:text-3xl">اختر دكتورك المناسب</h2>
    </div>

    <div className="relative">
      <button
        aria-label="السابق"
        className="absolute -start-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-card)] hover:bg-secondary md:block"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
      <button
        aria-label="التالي"
        className="absolute -end-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-card)] hover:bg-secondary md:block"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((doc) => (
          <article
            key={doc.name}
            className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-[var(--shadow-card)]"
          >
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-muted">
              <img
                src={doc.img}
                alt={doc.name}
                width={512}
                height={512}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">{doc.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{doc.specialty}</p>
            <div className="mt-3 flex items-center justify-center gap-1 text-sm">
              <span className="font-bold text-foreground">{doc.rating}</span>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{doc.price}</p>
            <Button
              onClick={() => navigate("/auth/login")}
              className="mt-4 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              احجز الآن
            </Button>
          </article>
        ))}
      </div>
    </div>
  </section>
  );
};
