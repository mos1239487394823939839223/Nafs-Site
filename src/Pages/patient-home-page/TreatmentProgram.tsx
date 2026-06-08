import { Leaf, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type Program = { name: string; currentSession: number; totalSessions: number | null };

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const total = program?.totalSessions || 8;
  const current = program?.currentSession || Math.max(completedCount, hasCompletedSession ? 4 : 0);
  const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const programName = program?.name || (hasCompletedSession ? "برنامج إدارة القلق" : t("patientHome.treatmentProgram.emptyTitle"));

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_40px_rgba(15,81,50,0.06)]">
      <Leaf className="absolute -start-6 bottom-2 h-36 w-36 -rotate-12 text-[#2F855A]/10" />
      <div className="relative">
        <p className="mb-3 text-end text-sm font-bold text-[#60766C]">{t("patientHome.treatmentProgram.label")}</p>

        {loading ? (
          <Loader2 className="mx-auto my-14 h-7 w-7 animate-spin text-[#2F855A]" />
        ) : (
          <>
            <h3 className="mb-5 text-end text-2xl font-black text-[#12372A]">{programName}</h3>
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-[#466257]">
              <span>{percent}%</span>
              <span>جلسة {current} من {total}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#2F855A]" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-4 text-end text-sm leading-6 text-[#60766C]">
              {program ? t("patientHome.treatmentProgram.continueDesc", "تابع خطوات برنامجك العلاجي") : t("patientHome.treatmentProgram.emptyDesc")}
            </p>
            <button
              onClick={() => navigate("/dashboard/patient/tests")}
              className="mt-5 h-11 w-full rounded-2xl border border-[#E5E7EB] text-sm font-extrabold text-[#2F855A] transition-colors hover:bg-[#F8FAF8]"
            >
              متابعة البرنامج
            </button>
          </>
        )}
      </div>
    </section>
  );
};
