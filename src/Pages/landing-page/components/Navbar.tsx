import { Button } from "./ui/button";
import { Globe, Moon, ChevronLeft } from "lucide-react";
import Logo from "./Logo";

const navItems = ["المزايا", "المعالجون", "الحجز", "المقالات"];

const Navbar = () => {
  return (
    <header className="w-full px-6 lg:px-10 py-5 flex items-center justify-between gap-6">
      <Logo />

      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <a key={item} href="#" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            {item}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full"><Moon className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
          <Globe className="w-4 h-4" /> EN
        </Button>
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full">تسجيل دخول / حساب</Button>
        <Button variant="hero" size="sm" className="gap-1">
          <ChevronLeft className="w-4 h-4" /> احجز جلسة الآن
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
