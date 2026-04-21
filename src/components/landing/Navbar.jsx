import { Globe, Moon, Sun, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import Logo from "./Logo";
import LandingButton from "./LandingButton";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const navItems = [
    { label: t("landing.nav.features"), key: "features" },
    { label: t("landing.nav.therapists"), key: "therapists" },
    { label: t("landing.nav.booking"), key: "booking" },
    { label: t("landing.nav.articles"), key: "articles" },
  ];

  return (
    <header className="w-full px-6 lg:px-10 py-5 flex items-center justify-between gap-6">
      <Logo />

      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <button 
            key={item.key} 
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm font-medium text-text-light hover:text-primary transition-colors cursor-pointer"
          >
            {item.label}
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
          {t("landing.nav.login")}
        </LandingButton>
        <LandingButton 
          variant="hero" 
          size="sm" 
          className="gap-1"
          onClick={() => navigate('/auth/login')}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> {t("landing.nav.bookNow")}
        </LandingButton>
      </div>
    </header>
  );
};

export default Navbar;
