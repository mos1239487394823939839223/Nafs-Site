import { Leaf } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_8px_20px_rgba(15,76,58,0.2)] flex-shrink-0 sm:h-12 sm:w-12">
      <Leaf className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
    </span>
    <span className="text-2xl font-black text-brand tracking-tight sm:text-[28px]">nafas</span>
  </div>
);
