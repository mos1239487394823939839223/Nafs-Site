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
    <section className="rounded-3xl bg-card border border-border shadow-card p-6 md:p-7 mb-6">
      <h2 className="text-lg font-bold text-foreground text-center mb-6">
        {t("doctor.dashboardHome.performance.title")}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceCards.map((m, idx) => {
          const Icon = iconMap[m.icon as keyof typeof iconMap];
          const displayValue =
            loading
              ? "—"
              : (liveValues[idx] !== null && liveValues[idx] !== undefined)
              ? String(liveValues[idx])
              : "—";
          return (
            <div key={m.labelKey} className="text-center flex flex-col items-center">
              <Icon className="size-6 mb-2 text-primary" />
              <p className="text-3xl font-extrabold text-foreground">{displayValue}</p>
              <p className="text-sm text-foreground/80 mt-1">{t(m.labelKey)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t(m.deltaKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
