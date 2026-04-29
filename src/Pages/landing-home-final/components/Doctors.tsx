import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { patientAPI } from "../../../lib/api";

interface DoctorDto {
  Id: number;
  Name: string;
  Specialist: string[] | null;
  Image: string | null;
  Rate: number;
  SessionPrice?: number | null;
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-[var(--shadow-card)] animate-pulse">
    <div className="mx-auto h-28 w-28 rounded-full bg-muted" />
    <div className="mt-4 h-4 w-2/3 mx-auto rounded bg-muted" />
    <div className="mt-2 h-3 w-1/2 mx-auto rounded bg-muted" />
    <div className="mt-3 h-3 w-1/3 mx-auto rounded bg-muted" />
    <div className="mt-4 h-9 w-full rounded-full bg-muted" />
  </div>
);

export const Doctors = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getAllDoctors(1, 4)
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
  <section id="doctors" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12">
    <div className="mb-6 flex items-center justify-between">
      <a href="/auth/login" className="text-sm font-medium text-brand hover:underline">
        {t("landing.doctors.viewAll")}
      </a>
      <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("landing.doctors.title")}</h2>
    </div>

    <div className="relative">
      <button
        aria-label={isAr ? "السابق" : "Previous"}
        className="absolute -start-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-card)] hover:bg-secondary md:block"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
      <button
        aria-label={isAr ? "التالي" : "Next"}
        className="absolute -end-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-card)] hover:bg-secondary md:block"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : doctors.map((doc) => (
          <article
            key={doc.Id}
            className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-[var(--shadow-card)]"
          >
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-muted">
              {doc.Image ? (
                <img
                  src={doc.Image}
                  alt={doc.Name}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-full w-full object-cover"
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
              <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                <span className="font-bold text-foreground">{doc.Rate.toFixed(1)}</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
            )}
            {doc.SessionPrice != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                {doc.SessionPrice} {t("landing.doctors.perSession")}
              </p>
            )}
            <Button
              onClick={() => navigate("/auth/login")}
              className="mt-4 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {t("landing.doctors.bookNow")}
            </Button>
          </article>
        ))}
      </div>
    </div>
  </section>
  );
};
