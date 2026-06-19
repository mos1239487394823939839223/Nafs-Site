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
    <section className="flex h-full flex-col rounded-xl border border-border bg-background-paper p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-start">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">
            {language === "ar" ? "التقييم المهني" : "Professional Evaluation"}
          </p>
          <h3 className="mt-1 text-lg font-black text-text-heading">
            {language === "ar" ? "تقييم المعالج" : "Therapist Assessment"}
          </h3>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#78a794]/10 text-[#78a794]">
          <HeartPulse className="h-[18px] w-[18px]" />
        </span>
      </div>

      {loading ? (
        <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-secondary" />
      ) : !assessment ? (
        <div className="my-auto flex flex-col items-center justify-center py-6 text-center">
          <ClipboardList className="h-10 w-10 text-[#78a794] opacity-60" />
          <h4 className="mt-4 text-base font-bold text-text-heading">
            {language === "ar" ? "لم يتم تقييم الحالة بعد" : "No assessment recorded yet"}
          </h4>
          <p className="mt-2 text-xs leading-5 text-text-light max-w-[280px]">
            {language === "ar" 
              ? "سيقوم المعالج بإضافة تقييم حالتك وملاحظاته وتوصياته بعد جلستك الأولى." 
              : "Your therapist will add your condition assessment, notes, and recommendations after your first session."}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between space-y-3 text-start">
          <div className="space-y-3">
            {/* Condition / Current Status */}
            <div>
              <p className="text-xs font-bold text-secondary">
                {language === "ar" ? "الحالة الحالية" : "Current Condition"}
              </p>
              <p className="mt-1 text-base font-black text-text-heading">{assessment.summary}</p>
            </div>

            {/* Severity Level */}
            {assessment.level && (
              <div>
                <p className="text-xs font-bold text-secondary">
                  {language === "ar" ? "مستوى الشدة" : "Severity Level"}
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-secondary-light px-2.5 py-1 text-xs font-bold text-secondary border border-secondary/20">
                  <Award className="h-3.5 w-3.5" />
                  {assessment.level}
                </span>
              </div>
            )}

            {/* Therapist Notes */}
            {assessment.note && (
              <div>
                <p className="text-xs font-bold text-secondary">
                  {language === "ar" ? "ملاحظات المعالج" : "Therapist Notes"}
                </p>
                <p className="mt-1 text-sm leading-6 text-text-light bg-background p-3 rounded-xl border border-border/50">
                  {assessment.note}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {assessment.recommendations && (
              <div>
                <p className="text-xs font-bold text-secondary">
                  {language === "ar" ? "التوصيات" : "Recommendations"}
                </p>
                <p className="mt-1 text-sm leading-6 text-text-light bg-background p-3 rounded-xl border border-border/50">
                  {assessment.recommendations}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-border/65 pt-3">
            <div className="flex items-center justify-between text-xs font-bold text-text-light">
              {assessment.doctorName && (
                <span>
                  {language === "ar" ? "المعالج: " : "Therapist: "}
                  {assessment.doctorName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-[#78a794]" />
                {new Date(assessment.updatedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
