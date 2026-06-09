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
  { key: "programs",   icon: Heart,    path: "/dashboard/patient/tests"   },
  { key: "assessment", icon: Brain,    path: "/dashboard/patient/tests"   },
];

export const QuickActions = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <section
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      
    >
      {actions.map((a) => (
        <article
          key={a.key}
          className="group min-h-[210px] rounded-[24px] border border-[#DCE8E2] bg-white p-6 text-center shadow-[0_16px_42px_-28px_rgba(15,76,58,0.4)] transition-all duration-200 hover:-translate-y-1 hover:border-[#2D7A61]/40 hover:shadow-[0_22px_55px_-28px_rgba(15,76,58,0.5)]"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#0F4C3A] transition-transform group-hover:scale-105">
            <a.icon className="h-9 w-9" />
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-[#12372A]">
            {t(`patientHome.quickActions.${a.key}.title`)}
          </h3>
          <p className="mx-auto mb-5 min-h-[44px] max-w-[150px] text-sm leading-6 text-[#60766C]">
            {t(`patientHome.quickActions.${a.key}.desc`)}
          </p>
          <button
            onClick={() => navigate(a.path)}
            className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-[#2D7A61] transition-colors hover:text-[#0F4C3A]"
          >
            {t(`patientHome.quickActions.${a.key}.cta`)}
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </article>
      ))}
    </section>
  );
};
