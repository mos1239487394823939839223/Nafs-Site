import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, X, Globe } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLanguage } from "../../../contexts/LanguageContext";

const links = [
  { href: "#home",     ar: "الرئيسية", en: "Home" },
  { href: "#services", ar: "الخدمات",  en: "Services" },
  { href: "#doctors",  ar: "الدكاترة", en: "Doctors" },
  { href: "#about",    ar: "عن نفس",   en: "About" },
  { href: "#pricing",  ar: "الأسعار",  en: "Pricing" },
];

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAr = language === "ar";

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      dir={isAr ? "rtl" : "ltr"}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur"
    >
      <nav className="container mx-auto flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-4">
        {/* Logo */}
        <div className="flex-shrink-0 min-w-0">
          <Logo />
        </div>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-brand"
              >
                {isAr ? l.ar : l.en}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-bold text-foreground/70 transition hover:bg-secondary hover:text-brand"
            aria-label="Toggle language"
          >
            {isAr ? "EN" : "عربي"}
          </button>

          <button
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-foreground/70 transition hover:bg-secondary hover:text-brand"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Button
            variant="outline"
            className="rounded-full border-border bg-card text-foreground hover:bg-secondary"
            onClick={() => navigate("/auth/login")}
          >
            {isAr ? "تسجيل الدخول" : "Login"}
          </Button>
          <Button
            className="rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
            onClick={() => navigate("/auth/login")}
          >
            {isAr ? "احجز جلسة الآن" : "Book Now"}
          </Button>
        </div>

        {/* Mobile / Tablet: hamburger only */}
        <button
          className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-foreground/70 lg:hidden flex-shrink-0 transition hover:bg-secondary hover:text-brand"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
            {/* Links */}
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-brand transition"
                    onClick={closeMenu}
                  >
                    {isAr ? l.ar : l.en}
                  </a>
                </li>
              ))}
            </ul>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
              <Button
                className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => { closeMenu(); navigate("/auth/login"); }}
              >
                {isAr ? "احجز جلسة الآن" : "Book Now"}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-border bg-card text-foreground hover:bg-secondary"
                onClick={() => { closeMenu(); navigate("/auth/login"); }}
              >
                {isAr ? "تسجيل الدخول" : "Login"}
              </Button>
            </div>

            {/* Settings row: language + theme */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setLanguage(isAr ? "en" : "ar")}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-secondary hover:text-brand"
                aria-label="Toggle language"
              >
                <Globe className="h-4 w-4" />
                <span>{isAr ? "English" : "العربية"}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-secondary hover:text-brand"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>{isAr ? "فاتح" : "Light"}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>{isAr ? "داكن" : "Dark"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
