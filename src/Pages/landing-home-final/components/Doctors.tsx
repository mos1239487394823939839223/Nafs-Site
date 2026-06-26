import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { patientAPI } from "../../../lib/api";
import { doctor1, doctor2, doctor3, doctor4 } from "../assets";
import { landingBtnBlock } from "../landingButtonStyles";

interface DoctorDto {
  Id: number;
  Name: string;
  Specialist: string[] | string | null;
  Image: string | null;
  Rate: number;
  SessionPrice?: number | null;
}

const fallbackDoctors: DoctorDto[] = [
  { Id: -1, Name: "د. سارة أحمد", Specialist: "أخصائية نفسية إكلينيكية", Image: doctor1, Rate: 4.9, SessionPrice: 350 },
  { Id: -2, Name: "د. محمد علي", Specialist: "أخصائي نفسي", Image: doctor2, Rate: 4.8, SessionPrice: 300 },
  { Id: -3, Name: "د. ندى إبراهيم", Specialist: "أخصائية علاج معرفي سلوكي", Image: doctor3, Rate: 4.9, SessionPrice: 400 },
  { Id: -4, Name: "د. أحمد حسن", Specialist: "أخصائي نفسي إكلينيكي", Image: doctor4, Rate: 4.7, SessionPrice: 350 },
];

export const Doctors = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const visibleDoctors = (loaded ? doctors : fallbackDoctors).slice(0, 4);

  useEffect(() => {
    patientAPI
      .getAllDoctors(1, 4)
      .then(async (res: any) => {
        if (res?.IsSuccess && res?.Data) {
          const baseDoctors: DoctorDto[] = res.Data.Items || res.Data || [];

          const priceResults = await Promise.allSettled(
            baseDoctors.map((doc) => patientAPI.getDoctorById(String(doc.Id))),
          );
          const enriched = baseDoctors.map((doc, index) => {
            const result = priceResults[index];
            if (result.status === "fulfilled" && (result.value as any)?.IsSuccess) {
              const data = (result.value as any).Data;
              const detail = data?.Items?.length > 0 ? data.Items[0] : data;
              return { ...doc, SessionPrice: detail?.SessionPrice ?? doc.SessionPrice };
            }
            return doc;
          });

          setDoctors(enriched);
          setLoaded(true);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section id="doctors" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto mb-4 flex max-w-6xl items-end justify-between gap-4">
        <a href="/auth/role-selection" className="text-xs font-bold text-[#397b62] hover:underline md:text-[13px]">
          {isAr ? "عرض جميع الدكاترة" : "View all doctors"}
        </a>
        <h2 className="text-center text-2xl font-bold text-[#234c3f] md:text-[26px]">
          {isAr ? "اختر دكتورك المناسب" : "Choose the right doctor"}
        </h2>
        <span className="hidden w-[105px] md:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <button className="absolute -start-14 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#edf1ee] bg-white text-[#8a9993] shadow-[0_2px_8px_rgba(35,76,63,0.04)] md:grid">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <button className="absolute -end-14 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#edf1ee] bg-white text-[#8a9993] shadow-[0_2px_8px_rgba(35,76,63,0.04)] md:grid">
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleDoctors.map((doc) => {
            const specialty = Array.isArray(doc.Specialist) ? doc.Specialist.join(" | ") : doc.Specialist || "";
            return (
              <article key={doc.Id} className="overflow-hidden rounded-xl border border-[#edf1ee] bg-white text-center shadow-[0_2px_8px_rgba(35,76,63,0.025)]">
                <div className="relative h-44 bg-[#f4f6f5] md:h-48">
                  {doc.Image ? (
                    <img src={doc.Image} alt={doc.Name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <span className="grid h-full place-items-center text-3xl font-black text-primary">{doc.Name?.charAt(0) || "د"}</span>
                  )}
                </div>
                <div className="relative px-4 pb-4 pt-3">
                  <h3 className="text-[13px] font-bold leading-6 text-[#294b40] md:text-sm">{doc.Name}</h3>
                  <p className="mt-1 min-h-5 truncate text-xs font-medium text-[#687871]">{specialty}</p>
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[#4f615a]">
                    <span>{Number(doc.Rate || 4.8).toFixed(1)}</span>
                    <Star className="h-3.5 w-3.5 fill-[#e9b949] text-[#e9b949]" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#687871]">
                    {doc.SessionPrice || 350} {isAr ? "جنيه للجلسة" : "EGP per session"}
                  </p>
                  <Button
                    onClick={() => navigate("/auth/role-selection")}
                    variant="outline"
                    className={`mt-3 !h-9 !rounded-lg !px-4 !text-xs ${landingBtnBlock} border-[#8fb1a3] text-[#315548]`}
                  >
                    {isAr ? "احجز الآن" : "Book now"}
                  </Button>
                </div>
           
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
