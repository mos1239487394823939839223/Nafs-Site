import { Button } from "@/components/ui/button";
import {
  ArrowUpLeft,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { assessmentIllustration as illustration } from "../assets";

export const Assessment = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const benefits = [
    {
      icon: Clock3,
      title: isAr ? "5 دقائق فقط" : "Only 5 minutes",
      desc: isAr ? "أسئلة قصيرة وواضحة" : "Short, clear questions",
    },
    {
      icon: LockKeyhole,
      title: isAr ? "خاص وآمن" : "Private and secure",
      desc: isAr ? "إجاباتك سرية بالكامل" : "Your answers stay confidential",
    },
    {
      icon: CheckCircle2,
      title: isAr ? "نتيجة فورية" : "Instant result",
      desc: isAr ? "توصيات تناسب احتياجك" : "Recommendations made for you",
    },
  ];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-16 md:py-20">
      <div className="relative overflow-hidden rounded-[38px] border border-[#0F4C3A]/10 bg-[linear-gradient(145deg,#F4FAF7_0%,#FFF9ED_54%,#ECF6F1_100%)] shadow-[0_35px_85px_-55px_rgba(15,76,58,.55)]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#7BAF98_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -end-24 -top-32 h-96 w-96 rounded-full bg-[#77BE99]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -start-24 h-96 w-96 rounded-full bg-[#E9C785]/20 blur-3xl" />

        <div className="relative grid items-center gap-8 p-6 md:p-10 lg:grid-cols-[1fr_.92fr] lg:gap-12 lg:p-14">
          <div className="text-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2D7A61]/15 bg-white/75 px-4 py-2 text-xs font-black text-[#2D7A61] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {isAr ? "خطوتك الأولى لفهم أفضل" : "Your first step toward clarity"}
            </span>

            <h2 className="landing-section-title mt-6 max-w-xl text-3xl sm:text-4xl lg:text-5xl">
              {t("landing.assessment.title")}
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-[#5D776D] md:text-base">
              {t("landing.assessment.desc")}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-white bg-white/70 p-4 shadow-[0_16px_35px_-30px_rgba(15,76,58,.45)] backdrop-blur">
                  <Icon className="h-5 w-5 text-[#2D7A61]" />
                  <p className="mt-3 text-xs font-black text-[#183C32]">{title}</p>
                  <p className="mt-1 text-[10px] font-bold leading-5 text-[#73877F]">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => navigate("/auth/login")}
                className="h-14 rounded-2xl bg-[#0F4C3A] px-7 text-base font-black text-white shadow-xl shadow-[#0F4C3A]/20 hover:-translate-y-1 hover:bg-[#0A3F32]"
              >
                {t("landing.assessment.cta")}
                <ArrowUpLeft className={`ms-2 h-5 w-5 ${isAr ? "" : "-rotate-90"}`} />
              </Button>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#627B71]">
                <Check className="h-4 w-4 rounded-full bg-[#DCEFE5] p-0.5 text-[#17614D]" />
                {isAr ? "بدون تسجيل مسبق" : "No prior signup required"}
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute inset-8 rounded-full bg-[#B8DBC9]/35 blur-3xl" />
            <div className="relative rounded-[30px] border border-white bg-white/82 p-4 shadow-[0_32px_70px_-40px_rgba(15,76,58,.6)] backdrop-blur-xl sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#0F4C3A]/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0F4C3A] text-white">
                    <Brain className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-[#183C32]">{isAr ? "تقييم حالتك النفسية" : "Mental wellness check"}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#788C84]">{isAr ? "السؤال 3 من 8" : "Question 3 of 8"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E6F3EC] px-3 py-1.5 text-[10px] font-black text-[#17614D]">38%</span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E7F0EB]">
                <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-[#0F4C3A] to-[#5BA47F]" />
              </div>

              <div className="mt-5 rounded-[24px] bg-[#F7FAF8] p-5">
                <p className="text-sm font-black leading-7 text-[#183C32]">
                  {isAr ? "كيف تصف مستوى طاقتك خلال الأيام الأخيرة؟" : "How would you describe your energy during the last few days?"}
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    isAr ? "جيدة ومستقرة" : "Good and steady",
                    isAr ? "متغيرة من يوم لآخر" : "Changes from day to day",
                    isAr ? "منخفضة معظم الوقت" : "Low most of the time",
                  ].map((answer, index) => (
                    <div key={answer} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-xs font-bold ${index === 1 ? "border-[#2D7A61] bg-[#E8F4EE] text-[#17614D]" : "border-[#DDE9E3] bg-white text-[#687F76]"}`}>
                      <span className={`grid h-5 w-5 place-items-center rounded-full border ${index === 1 ? "border-[#2D7A61] bg-[#2D7A61] text-white" : "border-[#BCD1C7]"}`}>
                        {index === 1 && <Check className="h-3 w-3" />}
                      </span>
                      {answer}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E7DDC9] bg-[#FFF9ED] p-3">
                <img src={illustration} alt="" className="h-16 w-20 rounded-xl object-cover" />
                <p className="text-[10px] font-bold leading-5 text-[#776B54]">
                  {isAr ? "لا توجد إجابة صحيحة أو خاطئة. اختر ما يعبّر عنك بصدق." : "There are no right or wrong answers. Choose what feels true to you."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
