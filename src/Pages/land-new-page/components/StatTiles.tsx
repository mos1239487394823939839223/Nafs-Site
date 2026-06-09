import { CalendarDays, CheckCircle2, Star, Users, XCircle } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

interface StatTilesProps {
  todayCount?: number;
  stats?: {
    activePatients?: number;
    completedSessions?: number;
    cancelledSessions?: number;
    rating?: string | null;
  };
}

export const StatTiles = ({ todayCount = 0, stats }: StatTilesProps) => {
  const { isRTL } = useLanguage();
  const tiles = [
    { label: isRTL ? "إجمالي المرضى" : "Total patients", value: stats?.activePatients ?? 0, icon: Users, tone: "bg-blue-50 text-blue-700" },
    { label: isRTL ? "جلسات اليوم" : "Today's sessions", value: todayCount, icon: CalendarDays, tone: "bg-violet-50 text-violet-700" },
    { label: isRTL ? "الجلسات المكتملة" : "Completed sessions", value: stats?.completedSessions ?? 0, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: isRTL ? "الجلسات الملغاة" : "Cancelled sessions", value: stats?.cancelledSessions ?? 0, icon: XCircle, tone: "bg-red-50 text-red-700" },
    { label: isRTL ? "متوسط التقييم" : "Average rating", value: stats?.rating ?? "-", icon: Star, tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.label} className="rounded-[22px] border border-[#DCE8E2] bg-white p-4 shadow-[0_12px_35px_-28px_rgba(15,76,58,0.45)] transition-all hover:-translate-y-1 hover:border-[#B9D8C9] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-[#123D30] sm:text-3xl">{tile.value}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-[#71857C]">{tile.label}</p>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tile.tone}`}>
                <Icon className="size-5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
