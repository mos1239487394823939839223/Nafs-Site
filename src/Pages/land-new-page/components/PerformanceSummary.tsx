import { Star, Users, Clock, Smile } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { performance as performanceCards } from "./data";

const iconMap = { Star, Users, Clock, Smile };

interface DashboardStats {
  rating: string | null;
  totalSessions: number;
  activePatients: number;
  totalHours: number;
}

interface PerformanceSummaryProps {
  stats?: DashboardStats;
  loading?: boolean;
}

export const PerformanceSummary = ({
  stats,
  loading = false,
}: PerformanceSummaryProps) => {
  const { t } = useLanguage();

  const liveValues = [
    stats?.rating ?? null,
    stats?.totalSessions ?? null,
    stats?.totalHours ?? null,
    stats?.activePatients ?? null,
  ];

  return (
    <section className="mb-7 rounded-[26px] border border-[#DCE8E2] bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,76,58,0.4)] sm:p-7">
      <h2 className="mb-6 text-start text-xl font-extrabold text-[#1F2D2A]">
        {t("doctor.dashboardHome.performance.title")}
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        {performanceCards.map((m, idx) => {
          const Icon = iconMap[m.icon as keyof typeof iconMap];
          const displayValue =
            loading
              ? "—"
              : (liveValues[idx] !== null && liveValues[idx] !== undefined)
              ? String(liveValues[idx])
              : "—";
          return (
            <div key={m.labelKey} className="flex min-h-[170px] flex-col items-center rounded-[20px] border border-[#E4EEE9] bg-[#FBFDFC] p-4 text-center sm:p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-[#EAF5F0] text-[#2D7A61]">
                <Icon className="size-5" />
              </span>
              <p className="text-3xl font-black text-[#123D30] sm:text-4xl">{displayValue}</p>
              <p className="mt-2 text-xs font-bold text-[#465D53] sm:text-sm">{t(m.labelKey)}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#4C9879]">{t(m.deltaKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
