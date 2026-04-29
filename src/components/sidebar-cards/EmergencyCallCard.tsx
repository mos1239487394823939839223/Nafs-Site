import { Phone } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const EmergencyCallCard = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-background-subtle p-4 border border-border">
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
        <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <h4 className="font-bold text-sm mb-1 text-text">{t("sidebar.emergency.title")}</h4>
      <p className="text-xs text-text-light leading-relaxed mb-3">
        {t("sidebar.emergency.desc")}
      </p>
      <button
        onClick={onClick}
        className="w-full bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold py-2 rounded-lg transition-opacity"
      >
        {t("sidebar.emergency.cta")}
      </button>
    </div>
  );
};
