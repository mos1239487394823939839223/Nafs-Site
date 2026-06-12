import { ShieldAlert } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const BlackmailProtectionCard = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-5 text-white shadow-xl shadow-black/10 backdrop-blur">
      <div className="mb-3 flex items-center justify-center gap-2">
        <ShieldAlert className="h-6 w-6 text-emerald-200" />
        <h4 className="text-center text-base font-extrabold">{t("sidebar.blackmail.title", "تتعرض لابتزاز أو تهديد؟")}</h4>
      </div>
      <p className="mb-4 text-center text-xs leading-6 text-white/75">
        {t("sidebar.blackmail.desc", "نحن هنا لحمايتك. يمكنك طلب المساعدة بسرية تامة.")}
      </p>
      <p className="mb-4 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-center text-[10px] leading-5 text-emerald-100/90">
        {t(
          "sidebar.blackmail.privacyNotice",
          "Your case is private. Only the dedicated support specialist (and authorized admin) can access it. We record the date and time your request is created.",
        )}
      </p>
      <button
        onClick={onClick}
        className="w-full rounded-2xl bg-[#48A868] px-4 py-3 text-sm font-bold text-white shadow-md shadow-black/10 transition-colors hover:bg-[#3f965d]"
      >
        {t("sidebar.blackmail.cta", "طلب حماية")}
      </button>
    </div>
  );
};
