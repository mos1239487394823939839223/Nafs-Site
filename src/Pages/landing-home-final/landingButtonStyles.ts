import { cn } from "@/lib/utils";

/** Outline CTA used across the landing home page (matches «احجز الآن» / «عرض جميع الخدمات»). */
export const landingBtnOutline =
  "rounded-xl border border-primary bg-background-paper font-semibold text-primary shadow-none hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40";

export const landingBtnSm = cn(landingBtnOutline, "h-10 px-6 text-sm");
export const landingBtnMd = cn(landingBtnOutline, "h-11 px-8 text-sm");
export const landingBtnLg = cn(landingBtnOutline, "h-12 px-8 text-[15px]");
export const landingBtnNav = cn(landingBtnOutline, "h-9 px-4 text-[13px] font-semibold");
export const landingBtnNavPrimary = cn(
  "h-9 rounded-xl border border-primary bg-primary px-4 text-[13px] font-semibold text-white shadow-none hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
);
export const landingBtnPrimary = cn(
  "h-11 rounded-xl border border-primary bg-primary px-8 text-sm font-semibold text-white shadow-none hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
);
export const landingBtnBlock = cn(landingBtnSm, "w-full");
