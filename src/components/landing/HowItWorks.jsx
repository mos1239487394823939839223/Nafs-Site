import { useLanguage } from "../../contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { n: "01", key: "step1" },
    { n: "02", key: "step2" },
    { n: "03", key: "step3" },
  ];

  return (
    <section className="px-6 lg:px-10 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-start mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-text-heading">{t("landing.howItWorks.title")}</h2>
          <p className="text-text-light mt-4">{t("landing.howItWorks.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s) => (
            <div key={s.n} className="bg-gradient-to-br from-background-subtle to-background rounded-3xl p-8 text-start border border-border/40">
              <div className="font-extrabold text-5xl text-primary/30 mb-4">{s.n}</div>
              <h3 className="font-bold text-xl mb-2 text-text-heading">{t(`landing.howItWorks.${s.key}.title`)}</h3>
              <p className="text-text-light text-sm leading-relaxed">{t(`landing.howItWorks.${s.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
