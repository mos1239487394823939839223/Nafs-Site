import { BookOpen, ClipboardList, SlidersHorizontal, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { quickTools } from "./data";

const iconMap = { BookOpen, ClipboardList, SlidersHorizontal, UserPlus };

export const QuickTools = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-4 md:p-5">
      <h2 className="text-base font-bold text-foreground text-center mb-4">
        {t("doctor.dashboardHome.quickTools.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {(isRTL ? [...quickTools].reverse() : quickTools).map((tool) => {
          const Icon = iconMap[tool.icon as keyof typeof iconMap];
          return (
            <button
              key={tool.titleKey}
              type="button"
              onClick={() => navigate(tool.href)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors text-start ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Icon className="size-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{t(tool.titleKey)}</p>
                <p className="text-xs text-muted-foreground truncate">{t(tool.descKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
