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
    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            className="group flex min-h-[220px] flex-col items-center rounded-[22px] border border-[#DCE8E2] bg-white p-6 text-center shadow-[0_12px_35px_-28px_rgba(15,76,58,0.45)] transition-all hover:-translate-y-1 hover:border-[#B9D8C9] hover:shadow-[0_18px_40px_-25px_rgba(15,76,58,0.4)]"
          >
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A] transition-colors group-hover:bg-[#0F4C3A] group-hover:text-white">
              <Icon className="size-6" />
            </span>
            <h3 className="mb-2 text-base font-extrabold text-[#1F2D2A]">{t(tile.titleKey)}</h3>
            <p className="mb-5 whitespace-pre-line text-xs font-medium leading-6 text-[#71857C]">
              {descText}
            </p>
            <Link
              to={tile.href}
              className="mt-auto text-sm font-bold text-[#2D7A61] hover:text-[#0F4C3A]"
            >
              {t(tile.ctaKey)}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

