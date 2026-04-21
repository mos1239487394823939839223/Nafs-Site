import { useLanguage } from "../../contexts/LanguageContext";
import Logo from "./Logo";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="px-6 lg:px-10 py-10 border-t border-border/60">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo />

        <p className="text-xs text-text-light">{t("landing.footer.rights")}</p>
      </div>
    </footer>
  );
};

export default Footer;
