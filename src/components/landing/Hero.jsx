import { ShieldCheck, UserCheck, CalendarClock, Phone, Video, MessageSquare, Sparkles, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import LandingButton from "./LandingButton";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const trust = [
    { icon: ShieldCheck, label: t("landing.hero.trust.privacy") },
    { icon: UserCheck, label: t("landing.hero.trust.doctors") },
    { icon: CalendarClock, label: t("landing.hero.trust.flexibility") },
  ];

  const previewArticles = [
    t("landing.hero.preview.articles.0"),
    t("landing.hero.preview.articles.1"),
    t("landing.hero.preview.articles.2"),
  ];

  return (
    <section className="w-full pb-16">
      <div className="w-full bg-gradient-to-br from-background-subtle to-background p-8 md:p-14 lg:p-20 shadow-lg">
        {/* Headline */}
        <div className="max-w-5xl mx-auto text-start">
          <h1 
            className="font-display font-extrabold text-4xl md:text-5xl lg:text-7xl text-text-heading mb-6"
            style={{ lineHeight: '1.3' }}
          >
            {t("landing.hero.headline.part1")}{" "}
            <span className="text-primary">{t("landing.hero.headline.tech")}</span>
            {t("landing.hero.headline.and")}
            <span className="text-primary">{t("landing.hero.headline.humanity")}</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-light leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-start">
            <LandingButton 
              variant="hero" 
              size="lg" 
              className="rounded-full px-10"
              onClick={() => navigate('/auth/login')}
            >
              {t("landing.hero.startFree")}
            </LandingButton>
            <LandingButton 
              variant="outline" 
              size="lg" 
              className="rounded-full bg-background-paper px-10"
              onClick={() => navigate('/auth/login')}
            >
              {t("landing.hero.learnMore")}
            </LandingButton>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-background-paper/70 backdrop-blur rounded-2xl px-5 py-4 border border-border/50">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-text">{label}</span>
            </div>
          ))}
        </div>

        {/* Preview card */}
        <div className="mt-12 bg-background-paper rounded-3xl p-6 md:p-8 shadow-md border border-border/50 max-w-6xl mx-auto">
          <div className="text-start text-base font-semibold text-text-heading mb-6">{t("landing.hero.preview.title")}</div>

          {/* Communication */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5 mb-4">
            <div className="flex flex-wrap gap-2 justify-start mb-4">
              <Pill icon={MessageSquare} label={t("landing.hero.preview.chat")} />
              <Pill icon={Video} label={t("landing.hero.preview.video")} />
              <Pill icon={Phone} label={t("landing.hero.preview.voice")} active />
            </div>
            <p className="text-sm text-start text-text-light leading-relaxed">{t("landing.hero.preview.commDesc")}</p>
          </div>

          {/* AI Assessment */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5 mb-4">
            <div className="text-start font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>{t("landing.hero.preview.aiTitle")}</span>
            </div>
            <div className="bg-background-paper rounded-xl p-4 text-start text-sm text-text-light border border-border/60">
              {t("landing.hero.preview.aiDesc")}
            </div>
          </div>

          {/* Articles */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5">
            <div className="text-start font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>{t("landing.hero.preview.articlesTitle")}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {previewArticles.map((a) => (
                <div 
                  key={a} 
                  className="bg-background-paper rounded-xl px-4 py-3 text-sm text-start border border-border/60 flex items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => navigate('/auth/login')}
                >
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pill = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-colors ${active ? "bg-primary/10 border-primary/30 text-primary" : "bg-background-paper border-border text-text/70"}`}>
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </div>
);

export default Hero;
