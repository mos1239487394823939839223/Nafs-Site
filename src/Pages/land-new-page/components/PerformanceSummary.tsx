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
  const { t, isRTL } = useLanguage();

  const liveValues = [
    stats?.rating ?? null,
    stats?.totalSessions ?? null,
    stats?.totalHours ?? null,
    stats?.activePatients ?? null,
  ];

  const orderedCards = performanceCards.map((m, idx) => ({ ...m, value: liveValues[idx] }));
  if (isRTL) orderedCards.reverse();

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-4 md:p-5">
      <h2 className="text-base font-bold text-foreground text-center mb-4">
        {t("doctor.dashboardHome.performance.title")}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {orderedCards.map((m) => {
          const Icon = iconMap[m.icon as keyof typeof iconMap];
          const displayValue =
            loading
              ? "—"
              : (m.value !== null && m.value !== undefined)
              ? String(m.value)
              : "—";
          return (
            <div key={m.labelKey} className="text-center flex flex-col items-center">
              <Icon className="size-5 mb-1 text-primary" />
              <p className="text-2xl font-extrabold text-foreground">{displayValue}</p>
              <p className="text-sm text-foreground/80 mt-0.5">{t(m.labelKey)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t(m.deltaKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
