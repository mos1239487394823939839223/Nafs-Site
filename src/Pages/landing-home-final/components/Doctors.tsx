import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { extractErrorMessage, homeAPI } from "../../../lib/api";
import { landingBtnBlock } from "../landingButtonStyles";
import "swiper/css";
import "swiper/css/navigation";

interface HomeDoctor {
  Id: string;
  Name: string | null;
  Specialist: string[] | string | null;
  Description: string | null;
  Image: string | null;
  Rate: number | null;
  NextAvailableSlot: string | null;
}

interface HomeDoctorsPage {
  PageSize: number;
  PageIndex: number;
  Records: number;
  Pages: number;
  Items: HomeDoctor[];
}

interface HomeDoctorsResponse {
  Data: HomeDoctorsPage | null;
  IsSuccess: boolean;
  Message: string;
  ErrorCode: number;
  IsAuthorized: boolean;
}

const DOCTORS_QUERY = {
  pageIndex: 1,
  pageSize: 20,
} as const;

const SKELETON_CARD_COUNT = 4;

const formatDoctorSpecialty = (
  specialist: HomeDoctor["Specialist"],
  fallback: string,
  separator: string,
) => {
  if (Array.isArray(specialist)) {
    const values = specialist.map((item) => String(item || "").trim()).filter(Boolean);
    return values.length ? values.join(separator) : fallback;
  }

  const value = String(specialist || "").trim();
  return value || fallback;
};

const formatNextAvailableSlot = (slot: string | null, locale: string, fallback: string) => {
  if (!slot) return fallback;

  const date = new Date(slot);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getRating = (rate: number | null) => {
  const rating = Number(rate);
  return Number.isFinite(rating) ? rating : 0;
};

const DoctorCardSkeleton = () => (
  <article className="h-full overflow-hidden rounded-xl border border-[#edf1ee] bg-white text-center shadow-[0_2px_8px_rgba(35,76,63,0.025)]">
    <div className="h-44 animate-pulse bg-[#f4f6f5] md:h-48" />
    <div className="px-4 pb-4 pt-3">
      <div className="mx-auto h-5 w-28 animate-pulse rounded bg-[#edf1ee]" />
      <div className="mx-auto mt-2 h-4 w-36 animate-pulse rounded bg-[#edf1ee]" />
      <div className="mx-auto mt-3 h-10 w-full animate-pulse rounded bg-[#edf1ee]" />
      <div className="mx-auto mt-3 h-4 w-16 animate-pulse rounded bg-[#edf1ee]" />
      <div className="mx-auto mt-3 h-9 w-full animate-pulse rounded bg-[#edf1ee]" />
      <div className="mx-auto mt-3 h-9 w-28 animate-pulse rounded-lg bg-[#edf1ee]" />
    </div>
  </article>
);

interface DoctorCardProps {
  doctor: HomeDoctor;
  copy: {
    bookNow: string;
    doctorFallback: string;
    generalPractitioner: string;
    noAppointments: string;
    noDescription: string;
  };
  isAr: boolean;
  locale: string;
  onBook: () => void;
}

const DoctorCard = ({ doctor, copy, isAr, locale, onBook }: DoctorCardProps) => {
  const name = doctor.Name?.trim() || copy.generalPractitioner;
  const specialty = formatDoctorSpecialty(
    doctor.Specialist,
    copy.generalPractitioner,
    isAr ? "، " : " | ",
  );
  const description = doctor.Description?.trim() || copy.noDescription;
  const nextSlot = formatNextAvailableSlot(doctor.NextAvailableSlot, locale, copy.noAppointments);
  const rating = getRating(doctor.Rate);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#edf1ee] bg-white text-center shadow-[0_2px_8px_rgba(35,76,63,0.025)]">
      <div className="relative h-44 shrink-0 bg-[#f4f6f5] md:h-48">
        {doctor.Image ? (
          <img src={doctor.Image} alt={name} className="h-full w-full object-cover object-top" />
        ) : (
          <span className="grid h-full place-items-center text-3xl font-black text-primary">
            {name.charAt(0) || copy.doctorFallback}
          </span>
        )}
      </div>
      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className="text-[13px] font-bold leading-6 text-[#294b40] md:text-sm">{name}</h3>
        <p className="mt-1 min-h-5 truncate text-xs font-medium text-[#687871]">{specialty}</p>
        <p className="mt-2 h-10 overflow-hidden text-xs font-medium leading-5 text-[#687871]" title={description}>
          {description}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[#4f615a]">
          <span>{rating.toFixed(1)}</span>
          <Star className="h-3.5 w-3.5 fill-[#e9b949] text-[#e9b949]" />
        </div>
        <p className="mt-2 min-h-9 text-xs font-medium leading-[18px] text-[#687871]">{nextSlot}</p>
        <Button
          onClick={onBook}
          variant="outline"
          className={`mt-auto !h-9 !rounded-lg !px-4 !text-xs ${landingBtnBlock} border-[#8fb1a3] text-[#315548]`}
        >
          {copy.bookNow}
        </Button>
      </div>
    </article>
  );
};

export const Doctors = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isAr = language === "ar";
  const locale = isAr ? "ar-EG" : "en-US";
  const [doctors, setDoctors] = useState<HomeDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadErrorRef = useRef("");

  const copy = useMemo(
    () => ({
      viewAll: isAr ? "عرض جميع الدكاترة" : "View all doctors",
      title: isAr ? "اختر دكتورك المناسب" : "Choose the right doctor",
      bookNow: isAr ? "احجز الآن" : "Book now",
      generalPractitioner: isAr ? "طبيب عام" : "General Practitioner",
      noDescription: isAr ? "لا يوجد وصف متاح" : "No description available",
      noAppointments: isAr ? "لا توجد مواعيد متاحة" : "No available appointments",
      noDoctors: isAr ? "لا يوجد أطباء متاحون" : "No doctors available",
      loadError: isAr
        ? "تعذر تحميل الأطباء الآن. يرجى المحاولة مرة أخرى."
        : "We couldn't load doctors right now. Please try again.",
      retry: t("common.retry", isAr ? "إعادة المحاولة" : "Retry"),
      doctorFallback: isAr ? "د" : "D",
    }),
    [isAr, t],
  );

  useEffect(() => {
    loadErrorRef.current = copy.loadError;
  }, [copy.loadError]);

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = (await homeAPI.getDoctors(DOCTORS_QUERY)) as HomeDoctorsResponse;

      if (!response?.IsSuccess) {
        throw new Error(response?.Message || loadErrorRef.current);
      }

      setDoctors(Array.isArray(response.Data?.Items) ? response.Data.Items : []);
    } catch (err) {
      setDoctors([]);
      const fallback = err instanceof Error && err.message ? err.message : loadErrorRef.current;
      setError(extractErrorMessage(err, fallback));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleBook = useCallback(() => {
    navigate("/auth/role-selection");
  }, [navigate]);

  const hasCarousel = isLoading || (!error && doctors.length > 0);

  return (
    <section id="doctors" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto mb-4 flex max-w-6xl items-end justify-between gap-4">
        <a href="/auth/role-selection" className="text-xs font-bold text-[#397b62] hover:underline md:text-[13px]">
          {copy.viewAll}
        </a>
        <h2 className="text-center text-2xl font-bold text-[#234c3f] md:text-[26px]">{copy.title}</h2>
        <span className="hidden w-[105px] md:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          className={`home-doctors-prev absolute -start-14 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#edf1ee] bg-white text-[#8a9993] shadow-[0_2px_8px_rgba(35,76,63,0.04)] ${
            hasCarousel ? "md:grid" : "md:hidden"
          }`}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <button
          type="button"
          className={`home-doctors-next absolute -end-14 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#edf1ee] bg-white text-[#8a9993] shadow-[0_2px_8px_rgba(35,76,63,0.04)] ${
            hasCarousel ? "md:grid" : "md:hidden"
          }`}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>

        {!isLoading && error && (
          <div className="grid min-h-[360px] place-items-center rounded-xl border border-[#edf1ee] bg-white px-6 text-center shadow-[0_2px_8px_rgba(35,76,63,0.025)]">
            <div>
              <p className="text-sm font-semibold text-[#294b40]">{error}</p>
              <Button
                onClick={loadDoctors}
                variant="outline"
                className={`mt-4 !h-9 !rounded-lg !px-4 !text-xs ${landingBtnBlock} border-[#8fb1a3] text-[#315548]`}
              >
                {copy.retry}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && doctors.length === 0 && (
          <div className="grid min-h-[360px] place-items-center rounded-xl border border-[#edf1ee] bg-white px-6 text-center shadow-[0_2px_8px_rgba(35,76,63,0.025)]">
            <p className="text-sm font-semibold text-[#294b40]">{copy.noDoctors}</p>
          </div>
        )}

        {hasCarousel && (
          <Swiper
            key={language}
            modules={[Navigation]}
            navigation={{
              prevEl: ".home-doctors-prev",
              nextEl: ".home-doctors-next",
            }}
            dir={isAr ? "rtl" : "ltr"}
            spaceBetween={20}
            slidesPerView={1.1}
            watchOverflow
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="!overflow-hidden"
          >
            {isLoading &&
              Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
                <SwiperSlide key={index} className="!h-auto">
                  <DoctorCardSkeleton />
                </SwiperSlide>
              ))}

            {!isLoading &&
              doctors.map((doctor) => (
                <SwiperSlide key={doctor.Id} className="!h-auto">
                  <DoctorCard doctor={doctor} copy={copy} isAr={isAr} locale={locale} onBook={handleBook} />
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};
