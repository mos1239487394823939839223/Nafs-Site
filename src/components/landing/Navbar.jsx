import { Globe, Moon, Sun, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import Logo from "./Logo";
import LandingButton from "./LandingButton";

const navItems = ["المزايا", "المعالجون", "الحجز", "المقالات"];

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="w-full px-6 lg:px-10 py-5 flex items-center justify-between gap-6">
      <Logo />

      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <button 
            key={item} 
            type="button"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-medium text-text-light hover:text-primary transition-colors cursor-pointer"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <LandingButton 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </LandingButton>
        <LandingButton 
          variant="ghost" 
          size="sm" 
          className="rounded-full gap-1.5"
          onClick={toggleLanguage}
        >
          <Globe className="w-4 h-4" /> {language === 'ar' ? 'EN' : 'AR'}
        </LandingButton>
        <LandingButton 
          variant="ghost" 
          size="sm" 
          className="hidden sm:inline-flex rounded-full"
          onClick={() => navigate('/auth/login')}
        >
          تسجيل دخول / حساب
        </LandingButton>
        <LandingButton 
          variant="hero" 
          size="sm" 
          className="gap-1"
          onClick={() => navigate('/auth/role-selection')}
        >
          <ChevronLeft className="w-4 h-4" /> احجز جلسة الآن
        </LandingButton>
      </div>
    </header>
  );
};

export default Navbar;
