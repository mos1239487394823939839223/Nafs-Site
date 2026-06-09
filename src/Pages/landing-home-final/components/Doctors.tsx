import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { patientAPI } from "../../../lib/api";
import { doctor1, doctor2, doctor3, doctor4 } from "../assets";

interface DoctorDto {
  Id: number;
  Name: string;
  Specialist: string[] | null;
  Image: string | null;
  Rate: number;
  SessionPrice?: number | null;
  SessionsCount?: number | null;
}

const SkeletonCard = () => (
  <div className="min-w-[86%] snap-start rounded-2xl border border-border/60 bg-card p-5 text-center shadow-[var(--shadow-card)] animate-pulse sm:min-w-[calc(50%_-_10px)] lg:min-w-[calc(25%_-_15px)]">
    <div className="mx-auto h-28 w-28 rounded-full bg-muted" />
    <div className="mt-4 h-4 w-2/3 mx-auto rounded bg-muted" />
    <div className="mt-2 h-3 w-1/2 mx-auto rounded bg-muted" />
    <div className="mt-3 h-3 w-1/3 mx-auto rounded bg-muted" />
    <div className="mt-4 h-9 w-full rounded-full bg-muted" />
  </div>
);

const fallbackDoctors: DoctorDto[] = [
  { Id: -1, Name: "معالجة سارة أحمد", Specialist: ["العلاج النفسي"], Image: doctor1, Rate: 4.9, SessionPrice: 450, SessionsCount: 320 },
  { Id: -2, Name: "معالج محمد علي", Specialist: ["العلاقات والإرشاد الأسري"], Image: doctor2, Rate: 4.8, SessionPrice: 500, SessionsCount: 275 },
  { Id: -3, Name: "معالجة نور خالد", Specialist: ["دعم الأطفال والمراهقين"], Image: doctor3, Rate: 4.9, SessionPrice: 400, SessionsCount: 210 },
  { Id: -4, Name: "معالج أحمد حسن", Specialist: ["التطوير والتوجيه"], Image: doctor4, Rate: 4.7, SessionPrice: 450, SessionsCount: 185 },
];

export const Doctors = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const visibleDoctors = doctors.length > 0 ? doctors : fallbackDoctors;
  const scrollCards = (direction: number) => {
    const amount = Math.min(carouselRef.current?.clientWidth || 360, 720) * direction;
    carouselRef.current?.scrollBy({ left: isAr ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    patientAPI.getAllDoctors(1, 12)
      .then((res: any) => {
        if (res?.IsSuccess && res?.Data) {
          const list: DoctorDto[] = res.Data.Items || res.Data || [];
          setDoctors(list);
        }
      })
      .catch(() => {/* leave empty */})
      .finally(() => setLoading(false));
  }, []);

  return (
  <section id="doctors" dir={isAr ? "rtl" : "ltr"} className="bg-[#F1F8F4] py-16 md:py-20">
    <div className="container mx-auto px-4">
    <div className="mb-9 flex items-end justify-between gap-4">
      <div>
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#2D7A61]">{isAr ? "خبراء موثوقون" : "Trusted experts"}</p>
      <h2 className="landing-section-title mt-3 text-3xl md:text-4xl">{t("landing.doctors.title")}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {isAr ? "تعرّف على متخصصين معتمدين واختر الأنسب لاحتياجاتك وطريقة التواصل التي تفضلها." : "Meet certified specialists and choose the right therapist for your needs and preferred communication style."}
      </p>
      </div>
      <a href="/auth/login" className="text-sm font-medium text-brand hover:underline">
        {t("landing.doctors.viewAll")}
      </a>
    </div>

    <div className="relative">
      <button
        onClick={() => scrollCards(-1)}
        aria-label={isAr ? "السابق" : "Previous"}
        className="absolute -start-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-card)] hover:bg-secondary md:block"
      >
        <ChevronLeft className="h-5 w-5 text-foreground rtl:rotate-180" />
      </button>
      <button
        onClick={() => scrollCards(1)}
        aria-label={isAr ? "التالي" : "Next"}
        className="absolute -end-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-card)] hover:bg-secondary md:block"
      >
        <ChevronRight className="h-5 w-5 text-foreground rtl:rotate-180" />
      </button>

      <div ref={carouselRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 py-3 scroll-smooth no-scrollbar">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : visibleDoctors.map((doc) => (
          <article
            key={doc.Id}
            className="group min-w-[88%] snap-start rounded-[28px] border border-[#0F4C3A]/10 bg-white p-4 text-start shadow-[0_25px_55px_-42px_rgba(15,76,58,.55)] transition duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#0F4C3A]/10 sm:min-w-[calc(50%_-_10px)] lg:min-w-[calc(25%_-_15px)]"
          >
            <div className="mx-auto h-48 w-full overflow-hidden rounded-[22px] bg-muted">
              {doc.Image ? (
                <img
                  src={doc.Image}
                  alt={doc.Name}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand">
                  {doc.Name?.charAt(0) ?? "د"}
                </span>
              )}
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">{doc.Name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {Array.isArray(doc.Specialist) ? doc.Specialist.join(" | ") : doc.Specialist ?? ""}
            </p>
            {doc.Rate != null && (
              <div className="mt-3 flex items-center gap-1 text-sm">
                <span className="font-bold text-foreground">{doc.Rate.toFixed(1)}</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
            )}
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {doc.SessionsCount ?? 120}+ {isAr ? "جلسة مكتملة" : "completed sessions"}
            </p>
            {doc.SessionPrice != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                {doc.SessionPrice} {t("landing.doctors.perSession")}
              </p>
            )}
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#F5FAF7] p-2.5 text-[10px] font-bold text-[#2D7A61]"><CalendarClock className="h-4 w-4" />{isAr ? "أقرب موعد متاح اليوم" : "Next available today"}</p>
            <Button
              onClick={() => navigate("/auth/login")}
              className="mt-4 h-11 w-full rounded-xl bg-[#0F4C3A] font-black text-white hover:bg-[#0A3F32]"
            >
              {t("landing.doctors.bookNow")}
            </Button>
          </article>
        ))}
      </div>
    </div>
    </div>
  </section>
  );
};
