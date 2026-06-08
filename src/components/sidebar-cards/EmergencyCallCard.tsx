import { Phone } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const EmergencyCallCard = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-5 text-white shadow-xl shadow-black/10 backdrop-blur">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-950/30">
        <Phone className="h-8 w-8" />
      </div>
      <h4 className="mb-2 text-center text-base font-extrabold">{t("sidebar.emergency.title", "تحتاج مساعدة فورية؟")}</h4>
      <p className="mb-4 text-center text-xs leading-6 text-white/75">
        {t("sidebar.emergency.desc", "تواصل الآن مع فريق الدعم المختص")}
      </p>
      <button
        onClick={onClick}
        className="w-full rounded-2xl bg-[#48A868] px-4 py-3 text-sm font-bold text-white shadow-md shadow-black/10 transition-colors hover:bg-[#3f965d]"
      >
        {t("sidebar.emergency.cta", "اتصال طارئ")}
      </button>
    </div>
  );
};
