import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { landingBtnNav, landingBtnNavPrimary } from "../landingButtonStyles";

const links = [
  { href: "#home", ar: "الرئيسية", en: "Home" },
  { href: "#services", ar: "الخدمات", en: "Services" },
  { href: "#doctors", ar: "الدكاترة", en: "Doctors" },
  { href: "#about", ar: "عن نفس", en: "About Nafas" },
  { href: "#pricing", ar: "الأسعار", en: "Pricing" },
];

export const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAr = language === "ar";

  return (
    <header dir="ltr" className="sticky top-0 z-50 border-b border-border bg-background-paper/95 backdrop-blur">
      <nav className="container mx-auto flex h-[68px] items-center justify-between gap-4 px-4 md:h-[76px] lg:gap-6 lg:px-6">
        {/* Logo — always on the left (matches reference design) */}
        <Logo className="[&>span:first-child]:h-10 [&>span:first-child]:w-10 [&>span:last-child]:text-xl" />

        {/* Center: nav links — kept in RTL reading order for Arabic */}
        <ul dir={isAr ? "rtl" : "ltr"} className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-semibold text-text transition hover:text-primary"
              >
                {isAr ? link.ar : link.en}
              </a>
            </li>
          ))}
        </ul>

        {/* Right (RTL: Left): CTAs + Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center rounded-full border border-border bg-background-subtle p-1 text-xs font-black"
            aria-label={isAr ? "تغيير اللغة" : "Change language"}
          >
            {(["ar", "en"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={`rounded-full px-2.5 py-1.5 transition-colors ${
                  language === lang
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="outline"
              size="sm"
              className={landingBtnNav}
              onClick={() => navigate("/auth/login")}
            >
              {isAr ? "تسجيل الدخول" : "Login"}
            </Button>
            <Button size="sm" className={landingBtnNavPrimary} onClick={() => navigate("/auth/role-selection")}>
              {isAr ? "احجز جلسة الآن" : "Book now"}
            </Button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background-paper text-primary lg:hidden"
            aria-label={isAr ? "فتح القائمة" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div dir={isAr ? "rtl" : "ltr"} className="border-t border-border bg-background-paper p-4 lg:hidden">
          <div className="container mx-auto space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-text hover:bg-background-subtle"
              >
                {isAr ? link.ar : link.en}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Button
                size="sm"
                onClick={() => navigate("/auth/login")}
                variant="outline"
                className={landingBtnNav}
              >
                {isAr ? "تسجيل الدخول" : "Login"}
              </Button>
              <Button size="sm" className={landingBtnNavPrimary} onClick={() => navigate("/auth/role-selection")}>
                {isAr ? "احجز الآن" : "Book now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
