import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { heroBg } from "../assets";
import { landingBtnLg, landingBtnLgPrimary } from "../landingButtonStyles";

export const Hero = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background-paper pb-12 md:pb-16"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle overlay so the text stays readable on top of the background image */}
      <div
        aria-hidden
          className={`pointer-events-none absolute inset-0 ${
          isAr
            ? "bg-gradient-to-l via-background-paper/60 to-background-paper/95"
            : "bg-gradient-to-r via-background-paper/60 to-background-paper/95"
        }`}
      />

      {/*
        Layout container always dir="ltr" so:
          col-1 (left)  → TEXT
          col-2 (right) → empty / image shows through background
        The inner text div uses dir="rtl" for Arabic text rendering.
      */}
      <div
        dir="ltr"
        className="relative mx-auto grid max-w-screen-xl grid-cols-1 min-h-[580px] items-center lg:grid-cols-2 lg:min-h-[640px]"
      >
        {/* ── TEXT COLUMN – left side ── */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="flex flex-col justify-center px-8 py-16 lg:px-14 xl:px-20"
        >
          <h1 className="text-[40px] font-black leading-[1.22] text-primary lg:text-[56px]">
            {isAr ? (
              <>
                خُذ نفس،
                <br />
                ونحن معك.
              </>
            ) : (
              <>
                Take a breath,
                <br />
                we're with you.
              </>
            )}
          </h1>

          <p className="mt-6 max-w-[340px] text-[15px] font-medium leading-[1.9] text-text">
            {isAr
              ? "منصة دعم نفسي سرية وآمنة تساعدك على فهم نفسك والتحدث مع متخصصين متى احتجت."
              : "A private, secure mental health platform that helps you understand yourself and talk with specialists whenever you need."}
          </p>

          <div
            className={`mt-8 flex flex-wrap gap-3 ${
              isAr ? "flex-row-reverse justify-end" : ""
            }`}
          >
            <Button
              onClick={() => navigate("/auth/role-selection")}
              className={landingBtnLgPrimary}
            >
              {isAr ? "احجز جلسة الآن" : "Book a Session"}
            </Button>
            <Button
              onClick={() => navigate("/auth/role-selection")}
              variant="outline"
              className={landingBtnLg}
            >
              {isAr ? "تقييم نفسي مجاني" : "Free Assessment"}
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN – transparent, image shows through background ── */}
        <div className="hidden lg:block min-h-[640px]" />
      </div>
    </section>
  );
};
