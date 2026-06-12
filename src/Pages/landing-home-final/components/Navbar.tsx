import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

const links = [
  { href: "#home",    ar: "الرئيسية", en: "Home"        },
  { href: "#services", ar: "الخدمات",  en: "Services"    },
  { href: "#doctors",  ar: "الدكاترة", en: "Doctors"     },
  { href: "#about",   ar: "عن نفس",  en: "About Nafas"  },
  { href: "#pricing", ar: "الأسعار",  en: "Pricing"     },
];

export const Navbar = () => {
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAr = language === "ar";

  return (
    <header
      dir={isAr ? "rtl" : "ltr"}
      className="sticky top-0 z-50 border-b border-[#E8EEE9] bg-white/95 backdrop-blur"
    >
      {/* ── Desktop nav ─────────────────────────────────────── */}
      <nav className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Logo />

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[13px] font-semibold text-[#2F5147] transition hover:text-[#0F4C3A]"
              >
                {isAr ? link.ar : link.en}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md border-[#C8D9D1] bg-white px-4 text-[13px] font-semibold text-[#2F5147] hover:bg-[#F7FAF8]"
            onClick={() => navigate("/auth/login")}
          >
            {isAr ? "تسجيل الدخول" : "Login"}
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-md bg-[#0F5C43] px-4 text-[13px] font-semibold text-white shadow-none hover:bg-[#0B4E38]"
            onClick={() => navigate("/auth/role-selection")}
          >
            {isAr ? "احجز جلسة الآن" : "Book now"}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid h-9 w-9 place-items-center rounded-md border border-[#DDE7E2] bg-white text-[#0F4C3A] lg:hidden"
          aria-label={isAr ? "فتح القائمة" : "Open menu"}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      {menuOpen && (
        <div className="border-t border-[#E8EEE9] bg-white p-4 lg:hidden">
          <div className="container mx-auto space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-4 py-2.5 text-[13px] font-semibold text-[#2F5147] hover:bg-[#F7FAF8]"
              >
                {isAr ? link.ar : link.en}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Button
                size="sm"
                onClick={() => navigate("/auth/login")}
                variant="outline"
                className="rounded-md text-[13px]"
              >
                {isAr ? "تسجيل الدخول" : "Login"}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/auth/role-selection")}
                className="rounded-md bg-[#0F5C43] text-[13px] text-white"
              >
                {isAr ? "احجز الآن" : "Book now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
