import { BookOpen, ClipboardList, SlidersHorizontal, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { quickTools } from "./data";

const iconMap = { BookOpen, ClipboardList, SlidersHorizontal, UserPlus };

export const QuickTools = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <section className="rounded-3xl bg-card border border-border shadow-card p-6 md:p-7 mb-6">
      <h2 className="text-lg font-bold text-foreground text-center mb-6">
        {t("doctor.dashboardHome.quickTools.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickTools.map((tool) => {
          const Icon = iconMap[tool.icon as keyof typeof iconMap];
          return (
            <button
              key={tool.titleKey}
              type="button"
              onClick={() => navigate(tool.href)}
              className={`flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors ${
                isRTL ? "text-right flex-row-reverse" : "text-left"
              }`}
            >
              <Icon className="size-5 text-primary shrink-0" />
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
