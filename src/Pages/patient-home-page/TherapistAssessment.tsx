import { HeartPulse, CalendarDays, Loader2, Award, ClipboardList } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

type Assessment = {
  summary: string;
  level: string;
  recommendations: string;
  note: string;
  updatedAt: string;
  doctorName?: string;
};

export const TherapistAssessment = ({
  assessment,
  loading,
}: {
  assessment: Assessment | null;
  loading: boolean;
}) => {
  const { language } = useLanguage();

  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[#DCE8E2] bg-white p-6 shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="text-start">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2D7A61]">
            {language === "ar" ? "التقييم المهني" : "Professional Evaluation"}
          </p>
          <h3 className="mt-1 text-xl font-black text-[#1F2D2A]">
            {language === "ar" ? "تقييم المعالج" : "Therapist Assessment"}
          </h3>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A]">
          <HeartPulse className="h-6 w-6" />
        </span>
      </div>

      {loading ? (
        <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
      ) : !assessment ? (
        <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
          <ClipboardList className="h-12 w-12 text-[#2D7A61] opacity-50" />
          <h4 className="mt-4 text-base font-bold text-[#1F2D2A]">
            {language === "ar" ? "لم يتم تقييم الحالة بعد" : "No assessment recorded yet"}
          </h4>
          <p className="mt-2 text-xs leading-5 text-[#60766C] max-w-[280px]">
            {language === "ar" 
              ? "سيقوم المعالج بإضافة تقييم حالتك وملاحظاته وتوصياته بعد جلستك الأولى." 
              : "Your therapist will add your condition assessment, notes, and recommendations after your first session."}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between space-y-4 text-start">
          <div className="space-y-4">
            {/* Condition / Current Status */}
            <div>
              <p className="text-xs font-bold text-[#2D7A61]">
                {language === "ar" ? "الحالة الحالية" : "Current Condition"}
              </p>
              <p className="mt-1 text-base font-black text-[#1F2D2A]">{assessment.summary}</p>
            </div>

            {/* Severity Level */}
            {assessment.level && (
              <div>
                <p className="text-xs font-bold text-[#2D7A61]">
                  {language === "ar" ? "مستوى الشدة" : "Severity Level"}
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800 border border-orange-200">
                  <Award className="h-3.5 w-3.5" />
                  {assessment.level}
                </span>
              </div>
            )}

            {/* Therapist Notes */}
            {assessment.note && (
              <div>
                <p className="text-xs font-bold text-[#2D7A61]">
                  {language === "ar" ? "ملاحظات المعالج" : "Therapist Notes"}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#60766C] bg-[#F7FAF8] p-3 rounded-xl border border-[#DCE8E2]/50">
                  {assessment.note}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {assessment.recommendations && (
              <div>
                <p className="text-xs font-bold text-[#2D7A61]">
                  {language === "ar" ? "التوصيات" : "Recommendations"}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#60766C] bg-[#F7FAF8] p-3 rounded-xl border border-[#DCE8E2]/50">
                  {assessment.recommendations}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-[#DCE8E2]/65 pt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#6B8278]">
              {assessment.doctorName && (
                <span>
                  {language === "ar" ? "المعالج: " : "Therapist: "}
                  {assessment.doctorName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-[#2D7A61]" />
                {new Date(assessment.updatedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
