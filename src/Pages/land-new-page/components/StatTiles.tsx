import { CalendarDays, FileText, Star, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { statTiles } from "./data";

const iconMap = { CalendarDays, FileText, Star, BarChart3 };

interface StatTilesProps {
  todayCount?: number;
}

export const StatTiles = ({ todayCount }: StatTilesProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statTiles.map((tile) => {
        const Icon = iconMap[tile.icon as keyof typeof iconMap];

        // The schedule tile shows a live count; others use their static translation
        const descText =
          tile.icon === "CalendarDays" && todayCount !== undefined
            ? isRTL
              ? `لديك ${todayCount} جلسة اليوم`
              : `You have ${todayCount} session${todayCount !== 1 ? "s" : ""} today`
            : t(tile.descKey);

        return (
          <div
            key={tile.titleKey}
            className="rounded-2xl bg-card border border-border shadow-card p-5 text-center flex flex-col items-center"
          >
            <Icon className="size-6 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">{t(tile.titleKey)}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
              {descText}
            </p>
            <Link
              to={tile.href}
              className="text-sm font-semibold text-primary hover:text-primary/80 mt-auto"
            >
              {t(tile.ctaKey)}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

