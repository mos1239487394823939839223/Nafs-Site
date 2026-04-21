import { useNavigate } from "react-router-dom";
import LandingButton from "./LandingButton";
import { useLanguage } from "../../contexts/LanguageContext";

const CTA = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="px-6 lg:px-10 pb-20">
      <div className="max-w-7xl mx-auto bg-primary rounded-[2.5rem] p-10 md:p-16 text-start relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-transparent" />
        <div className="relative">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white">{t("landing.cta.title")}</h2>
          <p className="mt-4 text-white/85">{t("landing.cta.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-start">
            <LandingButton 
              size="lg" 
              variant="secondary" 
              className="rounded-full bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/auth/login')}
            >
              {t("landing.cta.button")}
            </LandingButton>
            <LandingButton 
              size="lg" 
              variant="outline" 
              className="rounded-full bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
              onClick={() => navigate('/auth/login')}
            >
              {t("landing.cta.browse")}
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
