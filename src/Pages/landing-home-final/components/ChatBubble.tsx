import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const ChatBubble = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
  <button
    aria-label={t("landing.chat.start")}
    onClick={() => navigate("/auth/role-selection")}
    className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-[var(--shadow-soft)] transition hover:scale-105 hover:bg-brand/90"
  >
    <MessageCircle className="h-6 w-6" />
  </button>
  );
};
