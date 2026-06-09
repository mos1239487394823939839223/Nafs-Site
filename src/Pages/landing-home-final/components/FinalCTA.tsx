import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

export const FinalCTA = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  return (
  <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:py-24">
    <div className="relative overflow-hidden rounded-[32px] bg-brand px-6 py-12 shadow-[0_24px_60px_-32px_rgba(15,76,58,0.7)] md:px-10 md:py-14 text-center">
      {/* Decorative leaves */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 end-0 w-1/3 opacity-20">
        <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
          <path d="M40 180 C40 100 100 40 180 40" stroke="currentColor" strokeWidth="2" className="text-brand-foreground" />
          <ellipse cx="60" cy="160" rx="14" ry="6" transform="rotate(-40 60 160)" fill="currentColor" className="text-brand-foreground" />
          <ellipse cx="90" cy="120" rx="16" ry="7" transform="rotate(-40 90 120)" fill="currentColor" className="text-brand-foreground" />
          <ellipse cx="130" cy="80" rx="16" ry="7" transform="rotate(-40 130 80)" fill="currentColor" className="text-brand-foreground" />
        </svg>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-1/3 opacity-20 scale-x-[-1]">
        <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
          <path d="M40 180 C40 100 100 40 180 40" stroke="currentColor" strokeWidth="2" className="text-brand-foreground" />
          <ellipse cx="60" cy="160" rx="14" ry="6" transform="rotate(-40 60 160)" fill="currentColor" className="text-brand-foreground" />
          <ellipse cx="90" cy="120" rx="16" ry="7" transform="rotate(-40 90 120)" fill="currentColor" className="text-brand-foreground" />
          <ellipse cx="130" cy="80" rx="16" ry="7" transform="rotate(-40 130 80)" fill="currentColor" className="text-brand-foreground" />
        </svg>
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-foreground">
          {t("landing.finalCta.title")}
        </h2>
        <p className="mt-3 text-brand-foreground/85 text-sm md:text-base">
          {t("landing.finalCta.desc")}
        </p>
        <Button
          onClick={() => navigate("/auth/login")}
          className="mt-6 bg-brand-foreground px-8 text-brand hover:bg-brand-foreground/90"
        >
          {t("landing.finalCta.button")}
        </Button>
      </div>
    </div>
  </section>
  );
};
