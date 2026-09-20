import { Leaf } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export const Logo = ({ className = "" }: { className?: string }) => {
  const { isRTL } = useLanguage();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-[0_4px_12px_rgba(15,76,58,0.18)]">
        <Leaf className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <span className="text-lg font-black tracking-tight text-brand">{isRTL ? "نفس" : "Nafas"}</span>
    </div>
  );
};
