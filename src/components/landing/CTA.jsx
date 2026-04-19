import { useNavigate } from "react-router-dom";
import LandingButton from "./LandingButton";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="px-6 lg:px-10 pb-20">
      <div className="max-w-7xl mx-auto bg-primary rounded-[2.5rem] p-10 md:p-16 text-right relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-transparent" />
        <div className="relative">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white">خذ نَفَساً عميقاً، نحن هنا</h2>
          <p className="mt-4 text-white/85">ابدأ رحلتك نحو راحة نفسية حقيقية اليوم — التقييم الأول مجاني تماماً.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LandingButton 
              size="lg" 
              variant="secondary" 
              className="rounded-full bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/auth/role-selection')}
            >
              ابدأ التقييم المجاني
            </LandingButton>
            <LandingButton 
              size="lg" 
              variant="outline" 
              className="rounded-full bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
              onClick={() => navigate('/auth/role-selection')}
            >
              تصفّح المعالجين
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
