import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, X } from "lucide-react";
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

  return (
    <header
      dir={isAr ? "rtl" : "ltr"}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur"
    >
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Logo />

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 lg:flex">
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-bold text-foreground/70 transition hover:bg-secondary hover:text-brand"
            aria-label="Toggle language"
          >
            {isAr ? "EN" : "عربي"}
          </button>

          {/* Theme toggle */}
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
            className="hidden rounded-full border-border bg-card text-foreground hover:bg-secondary sm:inline-flex"
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

          {/* Mobile menu toggle */}
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-border/60 bg-background px-4 pb-4 lg:hidden">
          <ul className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block text-sm font-medium text-foreground/70 hover:text-brand"
                  onClick={() => setMenuOpen(false)}
                >
                  {isAr ? l.ar : l.en}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};
