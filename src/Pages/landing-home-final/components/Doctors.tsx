import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { patientAPI } from "../../../lib/api";
import { doctor1, doctor2, doctor3, doctor4 } from "../assets";

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
  const visibleDoctors = (doctors.length > 0 ? doctors : fallbackDoctors).slice(0, 4);

  useEffect(() => {
    patientAPI
      .getAllDoctors(1, 4)
      .then((res: any) => {
        if (res?.IsSuccess && res?.Data) {
          const list: DoctorDto[] = res.Data.Items || res.Data || [];
          setDoctors(list);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section id="doctors" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-7 flex items-end justify-between gap-4">
        <a href="/auth/login" className="text-sm font-bold text-[#0F6A52] hover:underline">
          {isAr ? "عرض جميع الدكاترة" : "View all doctors"}
        </a>
        <h2 className="text-center text-3xl font-black text-[#17483A]">{isAr ? "اختر دكتورك المناسب" : "Choose the right doctor"}</h2>
        <span className="hidden w-[120px] md:block" />
      </div>

      <div className="relative">
        <button className="absolute -start-8 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#E4ECE8] bg-white text-[#7AA797] md:grid">
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <button className="absolute -end-8 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#E4ECE8] bg-white text-[#7AA797] md:grid">
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleDoctors.map((doc) => {
            const specialty = Array.isArray(doc.Specialist) ? doc.Specialist.join(" | ") : doc.Specialist || "";
            return (
              <article key={doc.Id} className="overflow-hidden rounded-md border border-[#E4ECE8] bg-white text-center">
                <div className="h-44 bg-[#F1F5F2]">
                  {doc.Image ? (
                    <img src={doc.Image} alt={doc.Name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-3xl font-black text-[#0F6A52]">{doc.Name?.charAt(0) || "د"}</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black text-[#17483A]">{doc.Name}</h3>
                  <p className="mt-2 min-h-5 text-sm font-semibold text-[#63776F]">{specialty}</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-[#17483A]">
                    <span>{Number(doc.Rate || 4.8).toFixed(1)}</span>
                    <Star className="h-4 w-4 fill-[#F6C453] text-[#F6C453]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#63776F]">
                    {doc.SessionPrice || 350} {isAr ? "جنيه للجلسة" : "EGP per session"}
                  </p>
                  <Button
                    onClick={() => navigate("/auth/login")}
                    variant="outline"
                    className="mt-4 h-10 w-full rounded-md border-[#AFC6BC] bg-white font-bold text-[#17483A] hover:bg-[#F7FAF8]"
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
