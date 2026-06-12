import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { assessmentSkill } from "../assets";
import { landingBtnPrimary } from "../landingButtonStyles";

export const Assessment = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <div className="overflow-hidden rounded-xl border border-[#E8EEE9] bg-[#eff4ee] p-6 md:p-8 lg:p-10">
        <div
          dir="ltr"
          className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14"
        >
          {/* Illustration — physical left */}
          <div className="flex min-h-[280px] items-center justify-center rounded-lg bg-[#EFF4EE] px-4 py-6 md:min-h-[320px]">
            <img
              src={assessmentSkill}
              alt={isAr ? "استبيان تقييم نفسي" : "Mental health assessment clipboard"}
              className="h-full max-h-[280px] w-full object-contain md:max-h-[320px]"
            />
          </div>

          {/* Copy — physical right */}
          <div dir={isAr ? "rtl" : "ltr"} className="text-center">
            <h2 className="text-2xl font-black leading-tight text-[#17483A] md:text-[2rem] lg:text-4xl">
              {isAr ? "اعرف حالتك النفسية في دقائق" : "Understand your mental state in minutes"}
            </h2>
            <p className="mt-4 max-w-lg text-sm font-semibold leading-8 text-[#63776F] md:text-[15px]">
              {isAr
                ? "اختبار علمي بسيط يساعدك على فهم حالتك النفسية ويرشح لك الدكتور المناسب لك."
                : "A simple scientific assessment helps you understand your state and recommends the right doctor for you."}
            </p>
            <Button
              onClick={() => navigate("/auth/login")}
              className={`mt-6 ${landingBtnPrimary}`}
            >
              {isAr ? "ابدأ التقييم الآن" : "Start assessment now"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
