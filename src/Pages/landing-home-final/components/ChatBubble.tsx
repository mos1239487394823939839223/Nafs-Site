import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ChatBubble = () => {
  const navigate = useNavigate();
  return (
  <button
    aria-label="ابدأ المحادثة"
    onClick={() => navigate("/auth/login")}
    className="fixed bottom-6 left-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-[var(--shadow-soft)] transition hover:scale-105 hover:bg-brand/90"
  >
    <MessageCircle className="h-6 w-6" />
  </button>
  );
};
