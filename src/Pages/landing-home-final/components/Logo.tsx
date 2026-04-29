import { Leaf } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground">
      <Leaf className="h-5 w-5" strokeWidth={2.2} />
    </span>
    <span className="text-2xl font-bold text-brand tracking-tight">nafas</span>
  </div>
);
