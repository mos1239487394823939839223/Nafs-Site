import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { patientAPI } from "../../lib/api";

interface DoctorDto {
  Id: number;
  Name: string;
  Specialist: string[] | null;
  Image: string | null;
  Rate: number;
  SessionPrice?: number | null;
}

export const SuggestedDoctors = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await patientAPI.getAllDoctors(1, 4);
        if (response?.IsSuccess && response?.Data) {
          const baseDoctors: DoctorDto[] = response.Data.Items || response.Data || [];

          // Fetch session price for each doctor in parallel
          const priceResults = await Promise.allSettled(
            baseDoctors.map((d) => patientAPI.getDoctorById(String(d.Id)))
          );

          const enriched = baseDoctors.map((d, i) => {
            const result = priceResults[i];
            if (result.status === "fulfilled" && result.value?.IsSuccess) {
              const data = result.value.Data;
              const detail =
                data?.Items && data.Items.length > 0 ? data.Items[0] : data;
              return { ...d, SessionPrice: detail?.SessionPrice ?? null };
            }
            return d;
          });

          setDoctors(enriched);
        }
      } catch {
        // leave doctors empty — skeleton stays visible
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const skeletonCards = Array.from({ length: 4 });

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card mb-6" dir="ltr">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/dashboard/patient/reserve")}
          className="text-sm text-primary font-semibold hover:underline"
        >
          {t("patientHome.suggestedDoctors.viewAll")}
        </button>
        <h2 className="text-lg font-bold">{t("patientHome.suggestedDoctors.title")}</h2>
      </div>

      <div className="relative px-10">
        <button
          onClick={() => setScroll(Math.max(0, scroll - 1))}
          disabled={scroll === 0}
          aria-label="previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card shadow-card border border-border hidden md:flex items-center justify-center hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setScroll(scroll + 1)}
          disabled={scroll >= Math.max(0, doctors.length - 4)}
          aria-label="next"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card shadow-card border border-border hidden md:flex items-center justify-center hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="overflow-hidden">
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 transition-transform duration-300"
            style={{
              transform: `translateX(-${scroll * 25}%)`,
            }}
          >
            {loading
              ? skeletonCards.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border flex flex-col overflow-hidden animate-pulse"
                  >
                    <div className="w-full aspect-[4/3] bg-muted" />
                    <div className="p-4 flex flex-col gap-3 items-center w-full">
                      <div className="h-3 w-24 bg-muted rounded" />
                      <div className="h-2 w-16 bg-muted rounded" />
                      <div className="h-2 w-12 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-8 w-full bg-muted rounded-lg" />
                    </div>
                  </div>
                ))
              : doctors.map((d) => (
                  <article
                    key={d.Id}
                    className="rounded-2xl border border-border text-center hover:shadow-card transition-shadow flex flex-col overflow-hidden"
                  >
                    {/* Portrait photo — fills card top */}
                    <div className="w-full aspect-[4/3] overflow-hidden bg-muted">
                      {d.Image ? (
                        <img
                          src={d.Image}
                          alt={d.Name}
                          loading="lazy"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-soft flex items-center justify-center text-primary text-4xl font-bold">
                          {d.Name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col items-center flex-1">
                      <h4 className="font-bold text-sm mb-0.5">{d.Name}</h4>
                      {d.Specialist && d.Specialist.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {d.Specialist[0]}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-1 text-xs mb-2">
                        <span className="font-semibold">{d.Rate.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-mood-3 text-mood-3" />
                      </div>
                      {d.SessionPrice != null && d.SessionPrice > 0 && (
                        <p className="text-sm font-semibold text-primary mb-3">
                          {d.SessionPrice} {t("patientHome.suggestedDoctors.perSession")}
                        </p>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/dashboard/patient/reserve?doctorId=${d.Id}`)
                        }
                        className="w-full mt-auto border border-primary text-primary hover:bg-primary-soft text-sm font-semibold py-2 rounded-lg transition-colors"
                      >
                        {t("patientHome.suggestedDoctors.bookNow")}
                      </button>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};
