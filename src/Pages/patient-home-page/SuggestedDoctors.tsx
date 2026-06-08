import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patientAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { SectionHeading } from "./SectionHeading";

interface DoctorDto {
  Id: number;
  Name: string;
  Specialist: string[] | null;
  Image: string | null;
  Rate: number;
  SessionPrice?: number | null;
}

const AVATAR_SIZE = 84;
const CARD_HEIGHT = 324;

export const SuggestedDoctors = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await patientAPI.getAllDoctors(1, 4);
        if (response?.IsSuccess && response?.Data) {
          const baseDoctors: DoctorDto[] = response.Data.Items || response.Data || [];
          const priceResults = await Promise.allSettled(
            baseDoctors.map((doctor) => patientAPI.getDoctorById(String(doctor.Id))),
          );

          const enriched = baseDoctors.map((doctor, index) => {
            const result = priceResults[index];
            if (result.status === "fulfilled" && result.value?.IsSuccess) {
              const data = result.value.Data;
              const detail = data?.Items && data.Items.length > 0 ? data.Items[0] : data;
              return { ...doctor, SessionPrice: detail?.SessionPrice ?? null };
            }
            return doctor;
          });

          setDoctors(enriched);
        }
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const skeletonCards = Array.from({ length: 4 });
  const maxScroll = Math.max(0, doctors.length - 4);
  const avatarStyle = {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    minWidth: AVATAR_SIZE,
    minHeight: AVATAR_SIZE,
    maxWidth: AVATAR_SIZE,
    maxHeight: AVATAR_SIZE,
  };

  return (
    <section className="pt-4">
      <SectionHeading
        title={t("patientHome.suggestedDoctors.title")}
        actionLabel={t("patientHome.suggestedDoctors.viewAll")}
        onAction={() => navigate("/dashboard/patient/reserve")}
      />

      <div className="relative px-7 md:px-9">
        <button
          onClick={() => setScroll(Math.max(0, scroll - 1))}
          disabled={scroll === 0}
          aria-label="previous"
          className="absolute start-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#F3F4F6] bg-white text-[#9CA3AF] shadow-sm transition-colors hover:bg-[#F8FAF8] disabled:opacity-40 md:flex"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>

        <button
          onClick={() => setScroll(Math.min(maxScroll, scroll + 1))}
          disabled={scroll >= maxScroll}
          aria-label="next"
          className="absolute end-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#F3F4F6] bg-white text-[#9CA3AF] shadow-sm transition-colors hover:bg-[#F8FAF8] disabled:opacity-40 md:flex"
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>

        <div className="overflow-hidden" dir="ltr">
          <div
            className="grid grid-cols-1 gap-6 transition-transform duration-300 sm:grid-cols-2 lg:grid-cols-4"
            style={{ transform: `translateX(-${scroll * 25}%)` }}
          >
            {loading
              ? skeletonCards.map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse flex-col items-center rounded-2xl border border-[#F3F4F6] bg-white px-[21px] py-8 shadow-sm"
                    style={{ height: CARD_HEIGHT, minHeight: CARD_HEIGHT, maxHeight: CARD_HEIGHT }}
                  >
                    <div className="rounded-full bg-muted" style={avatarStyle} />
                    <div className="flex w-full flex-1 flex-col items-center gap-3 pt-5">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2 w-16 rounded bg-muted" />
                      <div className="h-2 w-12 rounded bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted" />
                      <div className="mt-auto h-10 w-full rounded-xl bg-muted" />
                    </div>
                  </div>
                ))
              : doctors.map((doctor) => (
                  <article
                    key={doctor.Id}
                    className="flex flex-col items-center rounded-2xl border border-[#F3F4F6] bg-white px-[21px] py-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,81,50,0.10)]"
                    style={{ height: CARD_HEIGHT, minHeight: CARD_HEIGHT, maxHeight: CARD_HEIGHT }}
                  >
                    <div
                      className="overflow-hidden rounded-full bg-[#F9FAFB]"
                      style={{ ...avatarStyle, flex: `0 0 ${AVATAR_SIZE}px` }}
                    >
                      {doctor.Image ? (
                        <img
                          src={doctor.Image}
                          alt={doctor.Name}
                          loading="lazy"
                          className="block rounded-full object-cover object-top"
                          style={avatarStyle}
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center bg-primary-soft text-3xl font-bold text-primary"
                          style={avatarStyle}
                        >
                          {doctor.Name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center pt-5">
                      <h4
                        className="w-full truncate text-center text-base font-bold leading-6 text-[#1F2937]"
                        dir="auto"
                      >
                        {doctor.Name}
                      </h4>
                      {doctor.Specialist && doctor.Specialist.length > 0 && (
                        <p className="w-full truncate text-center text-xs leading-4 text-[#6B7280]" dir="auto">
                          {doctor.Specialist[0]}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-center gap-1 text-sm leading-5">
                        <Star className="h-3 w-3 fill-[#FACC15] text-[#FACC15]" />
                        <span className="font-medium text-[#374151]">{Number(doctor.Rate || 0).toFixed(1)}</span>
                      </div>

                      <p className="pb-4 pt-2 text-xs font-bold leading-4 text-[#374151]">
                        {doctor.SessionPrice && doctor.SessionPrice > 0
                          ? `${doctor.SessionPrice} ${t("patientHome.suggestedDoctors.perSession")}`
                          : `300 ${t("patientHome.suggestedDoctors.perSession")}`}
                      </p>

                      <button
                        onClick={() => navigate(`/dashboard/patient/reserve?doctorId=${doctor.Id}`)}
                        className="mt-auto h-10 w-full rounded-xl border border-[#E5E7EB] text-sm font-medium leading-5 text-[#374151] transition-colors hover:border-[#2B7A5F] hover:bg-[#F0FDF4] hover:text-[#2B7A5F]"
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
