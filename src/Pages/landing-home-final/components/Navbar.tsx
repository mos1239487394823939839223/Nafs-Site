import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ArrowUpLeft, Globe, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLanguage } from "../../../contexts/LanguageContext";

const links = [
  { href: "#home", ar: "الرئيسية", en: "Home" },
  { href: "#about", ar: "كيف تعمل", en: "How it works" },
  { href: "#services", ar: "الخدمات", en: "Services" },
  { href: "#doctors", ar: "المعالجون", en: "Therapists" },
];

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAr = language === "ar";

  return (
    <header dir={isAr ? "rtl" : "ltr"} className="sticky top-0 z-50 border-b border-[#0F4C3A]/10 bg-[#F8FBF9]/90 backdrop-blur-xl">
      <nav className="container mx-auto flex h-[82px] items-center justify-between gap-4 px-4">
        <div className="scale-110"><Logo /></div>
        <ul className="hidden items-center gap-1 rounded-full border border-[#0F4C3A]/10 bg-white/70 p-1.5 shadow-sm lg:flex">
          {links.map((link) => (
            <li key={link.href}><a href={link.href} className="block rounded-full px-4 py-2 text-sm font-bold text-[#557369] transition hover:bg-[#E6F3EC] hover:text-[#0F4C3A]">{isAr ? link.ar : link.en}</a></li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <button onClick={() => setLanguage(isAr ? "en" : "ar")} className="grid h-11 min-w-11 place-items-center rounded-xl border border-[#0F4C3A]/10 bg-white text-xs font-black text-[#315F50] hover:bg-[#E6F3EC]">{isAr ? "EN" : "ع"}</button>
          <button onClick={toggleTheme} className="grid h-11 w-11 place-items-center rounded-xl border border-[#0F4C3A]/10 bg-white text-[#315F50] hover:bg-[#E6F3EC]">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <Button variant="outline" className="h-11 rounded-xl border-[#0F4C3A]/15 bg-white px-5 font-extrabold text-[#0F4C3A]" onClick={() => navigate("/auth/login")}>{isAr ? "تسجيل الدخول" : "Login"}</Button>
          <Button className="h-11 rounded-xl bg-[#0F4C3A] px-5 font-extrabold text-white shadow-lg shadow-[#0F4C3A]/15 hover:bg-[#0A3F32]" onClick={() => navigate("/auth/role-selection")}>
            {isAr ? "ابدأ رحلتك" : "Start your journey"}<ArrowUpLeft className={`ms-2 h-4 w-4 ${isAr ? "" : "-rotate-90"}`} />
          </Button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-xl border border-[#0F4C3A]/10 bg-white text-[#0F4C3A] lg:hidden">{menuOpen ? <X /> : <Menu />}</button>
      </nav>
      {menuOpen && (
        <div className="border-t border-[#0F4C3A]/10 bg-[#F8FBF9] p-4 lg:hidden">
          <div className="container mx-auto space-y-2">
            {links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 font-bold text-[#315F50] hover:bg-white">{isAr ? link.ar : link.en}</a>)}
            <div className="grid grid-cols-2 gap-2 pt-2"><Button onClick={() => navigate("/auth/login")} variant="outline">{isAr ? "دخول" : "Login"}</Button><Button onClick={() => navigate("/auth/role-selection")} className="bg-[#0F4C3A] text-white">{isAr ? "إنشاء حساب" : "Sign up"}</Button></div>
            <button onClick={() => setLanguage(isAr ? "en" : "ar")} className="flex w-full items-center justify-center gap-2 rounded-xl p-3 text-sm font-bold text-[#315F50]"><Globe className="h-4 w-4" />{isAr ? "English" : "العربية"}</button>
          </div>
        </div>
      )}
    </header>
  );
};
