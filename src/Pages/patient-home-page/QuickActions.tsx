import { Brain, Heart, BookOpen, Calendar, LucideIcon } from "lucide-react";
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
  { key: "programs",   icon: Heart,    path: "/dashboard/patient/tests"   },
  { key: "assessment", icon: Brain,    path: "/dashboard/patient/tests"   },
];

export const QuickActions = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <section
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      
    >
      {actions.map((a) => (
        <article
          key={a.key}
          className={`bg-card rounded-2xl p-5 shadow-card text-start hover:shadow-cta transition-shadow`}
        >
          <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
            <a.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-foreground mb-1">
            {t(`patientHome.quickActions.${a.key}.title`)}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 min-h-[32px]">
            {t(`patientHome.quickActions.${a.key}.desc`)}
          </p>
          <button
            onClick={() => navigate(a.path)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t(`patientHome.quickActions.${a.key}.cta`)}
          </button>
        </article>
      ))}
    </section>
  );
};
