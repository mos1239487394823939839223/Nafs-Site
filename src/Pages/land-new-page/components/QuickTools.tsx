import { BookOpen, ClipboardList, SlidersHorizontal, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { quickTools } from "./data";

const iconMap = { BookOpen, ClipboardList, SlidersHorizontal, UserPlus };

export const QuickTools = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <section className="mb-7 rounded-[26px] border border-[#DCE8E2] bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,76,58,0.4)] sm:p-7">
      <h2 className="mb-6 text-start text-xl font-extrabold text-[#1F2D2A]">
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
              className={`group flex min-h-[104px] items-center gap-4 rounded-[20px] border border-[#E1ECE7] bg-[#FBFDFC] p-4 transition-all hover:-translate-y-0.5 hover:border-[#BFDCCD] hover:bg-[#F1F8F4] hover:shadow-md ${
                "text-start"
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EAF5F0] text-[#0F4C3A] group-hover:bg-[#0F4C3A] group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#1F2D2A]">{t(tool.titleKey)}</p>
                <p className="mt-1 truncate text-xs font-medium text-[#71857C]">{t(tool.descKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
