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
      <div className="overflow-hidden rounded-xl border border-[#E8EEE9] bg-[#eff4ee] ">
        <div
          dir="ltr"
          className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14"
        >
          {/* Illustration — physical left */}
          <div className="flex items-center justify-center overflow-hidden rounded-s-xl bg-[#EFF4EE]">
            <img
              src={assessmentSkill}
              alt={isAr ? "استبيان تقييم نفسي" : "Mental health assessment clipboard"}
              className="h-full w-full object-cover"
              style={{ minHeight: "260px", maxHeight: "360px" }}
            />
          </div>

          {/* Copy — physical right */}
          <div dir={isAr ? "rtl" : "ltr"} className="px-8 py-10 text-start lg:px-10 lg:py-12">
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
