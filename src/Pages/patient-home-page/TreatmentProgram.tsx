import { CalendarDays, Check, Circle, Flag, Leaf, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type Program = { name: string; currentSession: number; totalSessions: number | null; updatedAt?: string };

export const TreatmentProgram = ({
  program,
  hasCompletedSession,
  completedCount,
  loading,
}: {
  program: Program | null;
  hasCompletedSession: boolean;
  completedCount: number;
  loading: boolean;
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const total = program?.totalSessions || 8;
  const current = program?.currentSession || Math.max(completedCount, hasCompletedSession ? 4 : 0);
  const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const programName =
    program?.name ||
    (hasCompletedSession
      ? t("patientHome.treatmentProgram.defaultTitle")
      : t("patientHome.treatmentProgram.emptyTitle"));

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#DCE8E2] bg-white p-6 shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)]">
      <Leaf className="absolute -start-6 bottom-2 h-36 w-36 -rotate-12 text-[#2D7A61]/10" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="text-start">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2D7A61]">{t("patientHome.treatmentProgram.label")}</p>
            <h3 className="mt-1 text-xl font-black text-[#1F2D2A]" dir="auto">{programName}</h3>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A]">
            <Flag className="h-6 w-6" />
          </span>
        </div>

        {loading ? (
          <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-[#466257]">
              <span className="text-lg font-black text-[#0F4C3A]">{percent}%</span>
              <span>
                {t("patientHome.treatmentProgram.session")} {current} {t("patientHome.treatmentProgram.of")} {total}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#EAF5F0]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#2D7A61] to-[#0F4C3A]" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                [true, language === "ar" ? "بدأت البرنامج" : "Program started"],
                [current >= Math.ceil(total / 2), language === "ar" ? "منتصف الرحلة" : "Halfway point"],
                [current >= total, language === "ar" ? "اكتمال البرنامج" : "Program completed"],
              ].map(([done, label]) => (
                <div key={String(label)} className="text-center">
                  <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${done ? "bg-[#0F4C3A] text-white" : "bg-[#F7FAF8] text-[#9AAC9F]"}`}>
                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </span>
                  <p className="mt-2 text-[11px] font-bold leading-4 text-[#60766C]">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-start text-sm leading-6 text-[#60766C]">
              {program ? t("patientHome.treatmentProgram.continueDesc") : t("patientHome.treatmentProgram.emptyDesc")}
            </p>
            <p className="mt-3 flex items-center gap-2 text-start text-xs font-bold text-[#6B8278]">
              <CalendarDays className="h-4 w-4 text-[#2D7A61]" />
              {program?.updatedAt
                ? new Date(program.updatedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                : language === "ar" ? "سيظهر آخر تحديث من المعالج هنا" : "The latest therapist update will appear here"}
            </p>
            <button
              onClick={() => navigate("/dashboard/patient/tests")}
              className="mt-5 h-12 w-full rounded-xl border border-[#DCE8E2] text-sm font-extrabold text-[#0F4C3A] transition-colors hover:bg-[#EAF5F0]"
            >
              {t("patientHome.treatmentProgram.continue")}
            </button>
          </>
        )}
      </div>
    </section>
  );
};
