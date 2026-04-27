import { ShieldAlert } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const BlackmailProtectionCard = () => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-background-subtle p-4 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-sm text-text">{t("sidebar.blackmail.title")}</h4>
      </div>
      <p className="text-xs text-text-light leading-relaxed mb-3">
        {t("sidebar.blackmail.desc")}
      </p>
      <button className="w-full bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold py-2 rounded-lg transition-opacity">
        {t("sidebar.blackmail.cta")}
      </button>
    </div>
  );
};
