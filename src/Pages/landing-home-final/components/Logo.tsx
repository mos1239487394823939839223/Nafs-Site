import { Leaf } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
    <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-brand text-brand-foreground flex-shrink-0">
      <Leaf className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
    </span>
    <span className="text-xl sm:text-2xl font-bold text-brand tracking-tight">nafas</span>
  </div>
);
