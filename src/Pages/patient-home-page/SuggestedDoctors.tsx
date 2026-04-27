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
          setDoctors(response.Data.Items || response.Data || []);
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

      <div className="relative">
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
                    className="rounded-2xl border border-border p-4 flex flex-col items-center gap-3 animate-pulse"
                  >
                    <div className="w-20 h-20 rounded-full bg-muted" />
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-2 w-16 bg-muted rounded" />
                    <div className="h-8 w-full bg-muted rounded-lg" />
                  </div>
                ))
              : doctors.map((d) => (
                  <article
                    key={d.Id}
                    className="rounded-2xl border border-border p-4 text-center hover:shadow-card transition-shadow"
                  >
                    {d.Image ? (
                      <img
                        src={d.Image}
                        alt={d.Name}
                        width={80}
                        height={80}
                        loading="lazy"
                        className="w-20 h-20 rounded-full mx-auto object-cover mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full mx-auto bg-primary-soft flex items-center justify-center mb-3 text-primary text-2xl font-bold">
                        {d.Name.charAt(0)}
                      </div>
                    )}
                    <h4 className="font-bold text-sm">{d.Name}</h4>
                    {d.Specialist && d.Specialist.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {d.Specialist[0]}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-1 text-xs mb-3">
                      <span className="font-semibold">{d.Rate.toFixed(1)}</span>
                      <Star className="w-3.5 h-3.5 fill-mood-3 text-mood-3" />
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/patient/reserve?doctorId=${d.Id}`)
                      }
                      className="w-full border border-border hover:bg-primary-soft hover:border-primary hover:text-primary text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      {t("patientHome.suggestedDoctors.bookNow")}
                    </button>
                  </article>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};
