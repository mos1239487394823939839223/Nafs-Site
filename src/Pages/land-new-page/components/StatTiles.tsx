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

  const orderedTiles = isRTL ? [...statTiles].reverse() : statTiles;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {orderedTiles.map((tile) => {
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
            className="rounded-xl bg-card border border-border shadow-card p-3 text-center flex flex-col items-center"
          >
            <Icon className="size-5 text-primary mb-1.5" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t(tile.titleKey)}</h3>
            <p className="text-xs text-muted-foreground leading-snug whitespace-pre-line mb-2">
              {descText}
            </p>
            <Link
              to={tile.href}
              className="text-xs font-semibold text-primary hover:text-primary/80 mt-auto"
            >
              {t(tile.ctaKey)}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

