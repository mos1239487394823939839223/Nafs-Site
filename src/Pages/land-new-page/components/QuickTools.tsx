import { BookOpen, ClipboardList, SlidersHorizontal, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { quickTools } from "./data";

const iconMap = { BookOpen, ClipboardList, SlidersHorizontal, UserPlus };

export const QuickTools = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <section className="mb-7 rounded-[26px] border border-border bg-background-paper p-5 shadow-card sm:p-7">
      <h2 className="mb-6 text-start text-xl font-extrabold text-text-heading">
        {t("doctor.dashboardHome.quickTools.title")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        {quickTools.map((tool) => {
          const Icon = iconMap[tool.icon as keyof typeof iconMap];
          return (
            <button
              key={tool.titleKey}
              type="button"
              onClick={() => navigate(tool.href)}
              className={`group flex min-h-[104px] items-center gap-4 rounded-[20px] border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:bg-background-subtle hover:shadow-md ${
                "text-start"
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-background-subtle text-primary group-hover:bg-primary group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-text-heading">{t(tool.titleKey)}</p>
                <p className="mt-1 truncate text-xs font-medium text-text-light">{t(tool.descKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
