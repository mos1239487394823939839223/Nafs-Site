import { Brain, Heart, BookOpen, Calendar, ArrowLeft, ArrowRight, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

type ActionKey = "sessions" | "content" | "programs" | "assessment";

type Action = {
  key: ActionKey;
  icon: LucideIcon;
  path: string;
};

const actions: Action[] = [
  { key: "sessions",   icon: Calendar, path: "/dashboard/patient/reserve" },
  { key: "content",    icon: BookOpen, path: "/dashboard/patient/blogs"   },
  { key: "programs",   icon: Heart,    path: "/dashboard/patient/treatment-program" },
  { key: "assessment", icon: Brain,    path: "/dashboard/patient/tests"   },
];

export const QuickActions = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"

    >
      {actions.map((a) => (
        <article
          key={a.key}
          className="group min-h-[150px] rounded-xl border border-border bg-background-paper p-4 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-hover"
        >
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#78a794]/10 text-[#78a794] transition-transform group-hover:scale-105">
            <a.icon className="h-5 w-5" />
          </div>
          <h3 className="mb-1.5 text-base font-extrabold text-text-heading">
            {t(`patientHome.quickActions.${a.key}.title`)}
          </h3>
          <p className="mx-auto mb-3 min-h-[36px] max-w-[150px] text-xs leading-5 text-text-light">
            {t(`patientHome.quickActions.${a.key}.desc`)}
          </p>
          <button
            onClick={() => navigate(a.path)}
            className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-secondary transition-colors hover:text-primary"
          >
            {t(`patientHome.quickActions.${a.key}.cta`)}
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </article>
      ))}
    </section>
  );
};
