import { Button } from "@/components/ui/button";
import { Baby, Brain, Heart, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

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
      <h2 className="text-center text-3xl font-black text-[#17483A]">{isAr ? "خدماتنا" : "Our services"}</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {services.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="min-h-[190px] rounded-md border border-[#E4ECE8] bg-white p-6 text-center">
            <Icon className="mx-auto h-12 w-12 text-[#7AA797]" strokeWidth={1.7} />
            <h3 className="mt-5 text-base font-black text-[#17483A]">{title}</h3>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#63776F]">{desc}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button
          onClick={() => navigate("/auth/login")}
          variant="outline"
          className="h-11 rounded-md border-[#AFC6BC] bg-white px-8 font-bold text-[#17483A] hover:bg-[#F7FAF8]"
        >
          {isAr ? "عرض جميع الخدمات" : "View all services"}
        </Button>
      </div>
    </section>
  );
};
