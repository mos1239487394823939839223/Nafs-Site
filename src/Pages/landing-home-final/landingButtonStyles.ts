import { cn } from "@/lib/utils";

/** Outline CTA used across the landing home page (matches «احجز الآن» / «عرض جميع الخدمات»). */
export const landingBtnOutline =
  "rounded-md border border-[#0F5C43] bg-white font-bold text-[#0F5C43] shadow-none hover:bg-neutral-50";

export const landingBtnSm = cn(landingBtnOutline, "h-10 px-6 text-sm");
export const landingBtnMd = cn(landingBtnOutline, "h-11 px-8 text-sm");
export const landingBtnLg = cn(landingBtnOutline, "h-12 px-8 text-[15px]");
export const landingBtnNav = cn(landingBtnOutline, "h-9 px-4 text-[13px] font-semibold");
export const landingBtnNavPrimary = cn(
  "h-9 rounded-md border border-[#0F5C43] bg-[#0F5C43] px-4 text-[13px] font-semibold text-white shadow-none hover:bg-[#0b4e38]",
);
export const landingBtnPrimary = cn(
  "h-11 rounded-md border border-[#0F5C43] bg-[#0F5C43] px-8 text-sm font-bold text-white shadow-none hover:bg-[#0b4e38]",
);
export const landingBtnBlock = cn(landingBtnSm, "w-full");
