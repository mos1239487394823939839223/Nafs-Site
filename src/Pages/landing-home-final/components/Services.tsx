import { Button } from "@/components/ui/button";
import { Baby, Brain, Heart, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { landingBtnMd } from "../landingButtonStyles";

export const Services = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const services = [
    {
      icon: Brain,
      title: isAr ? "برامج علاجية" : "Treatment programs",
      desc: isAr ? "برامج متخصصة لحل القلق والاكتئاب" : "Specialized programs for anxiety and depression",
    },
    {
      icon: Users,
      title: isAr ? "إرشاد أسري" : "Family counseling",
      desc: isAr ? "حل المشكلات الأسرية وتحسين التواصل" : "Resolve family issues and improve communication",
    },
    {
      icon: Baby,
      title: isAr ? "دعم الأطفال" : "Children support",
      desc: isAr ? "جلسات للأطفال والمراهقين" : "Sessions for children and teenagers",
    },
    {
      icon: Heart,
      title: isAr ? "دعم العلاقات" : "Relationship support",
      desc: isAr ? "تحسين علاقاتك وفهم نفسك والآخرين" : "Improve relationships and understand yourself and others",
    },
    {
      icon: User,
      title: isAr ? "جلسات فردية" : "Individual sessions",
      desc: isAr ? "دعم نفسي فردي مع متخصصين" : "Individual mental support with specialists",
    },
  ];

  return (
    <section id="services" dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-[#234c3f] md:text-[26px]">
          {isAr ? "خدماتنا" : "Our services"}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {services.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="flex min-h-[160px] flex-col items-center rounded-xl border border-[#edf1ee] bg-white px-4 py-5 text-center shadow-[0_2px_7px_rgba(35,76,63,0.025)] md:min-h-[166px]"
            >
              <Icon className="h-10 w-10 text-[#78a794] md:h-11 md:w-11" strokeWidth={1.65} />
              <h3 className="mt-3 text-[14px] font-bold leading-6 text-[#294b40] md:text-[15px]">
                {title}
              </h3>
              <p className="mt-2 max-w-[170px] text-xs font-medium leading-6 text-[#5f7069] md:text-[13px]">
                {desc}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-7 text-center">
          <Button
            onClick={() => navigate("/auth/role-selection")}
            variant="outline"
            className={`${landingBtnMd} border-[#c8d8d1] text-[#315548]`}
          >
            {isAr ? "عرض جميع الخدمات" : "View all services"}
          </Button>
        </div>
      </div>
    </section>
  );
};
