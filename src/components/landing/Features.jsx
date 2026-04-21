import { Video, CalendarCheck, CreditCard, Bot, BookOpen, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const featureIcons = [Video, CalendarCheck, CreditCard, Bot, BookOpen, ShieldCheck];

  return (
    <section className="px-6 lg:px-10 py-20 bg-gradient-to-b from-background to-background-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-start mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-text-heading">{t("landing.features.title")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureIcons.map((Icon, idx) => (
            <div key={idx} className="bg-background-paper rounded-3xl p-7 border border-border/60 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-start text-text-heading">{t(`landing.features.items.${idx}.title`)}</h3>
              <p className="text-sm text-text-light text-start leading-relaxed">{t(`landing.features.items.${idx}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
