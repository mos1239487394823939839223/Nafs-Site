import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { assessmentIllustration as illustration } from "../assets";

export const Assessment = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-10 md:py-14">
      <div className="grid items-center gap-8 rounded-md bg-[#F3F8F4] p-6 md:grid-cols-[0.95fr_1.05fr] md:p-10">
        <div className="order-2 md:order-1">
          <img
            src={illustration}
            alt={isAr ? "استبيان تقييم نفسي" : "Mental health assessment clipboard"}
            className="h-56 w-full object-contain"
          />
        </div>

        <div className="order-1 text-center md:order-2 md:text-start">
          <h2 className="text-3xl font-black leading-tight text-[#17483A] md:text-4xl">
            {isAr ? "اعرف حالتك النفسية في دقائق" : "Understand your mental state in minutes"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-8 text-[#63776F] md:mx-0">
            {isAr
              ? "اختبار علمي بسيط يساعدك على فهم حالتك النفسية ويرشح لك الدكتور المناسب لك."
              : "A simple scientific assessment helps you understand your state and recommends the right doctor for you."}
          </p>
          <Button
            onClick={() => navigate("/auth/login")}
            className="mt-6 h-12 rounded-md bg-[#0F6A52] px-8 font-bold text-white shadow-none hover:bg-[#0B5643]"
          >
            {isAr ? "ابدأ التقييم الآن" : "Start assessment now"}
          </Button>
        </div>
      </div>
    </section>
  );
};
