import { Leaf } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <div dir="ltr" className={`flex items-center gap-2 ${className}`}>
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-[0_4px_12px_rgba(15,76,58,0.18)]">
      <Leaf className="h-4 w-4" strokeWidth={2.2} />
    </span>
    <span className="text-lg font-black tracking-tight text-brand">nafas</span>
  </div>
);
