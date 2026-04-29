import { Button } from "@/components/ui/button";
import { Lock, BadgeCheck, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero-armchair.jpg";

const badges = [
  { icon: Star, title: "تقييم عالي", sub: "4.9 من 5 نجوم" },
  { icon: Clock, title: "متاح 24/7", sub: "نحن هنا متى احتجت" },
  { icon: BadgeCheck, title: "دكاترة معتمدين", sub: "+100 دكتور متخصص" },
  { icon: Lock, title: "سرية تامة", sub: "خصوصيتك أولويتنا" },
];

export const Hero = () => {
  const navigate = useNavigate();
  return (
  <section id="home" className="relative overflow-hidden bg-cream-deep pt-10">
    <div className="container relative z-10 mx-auto px-4">
      <div className="grid min-h-[500px] grid-cols-1 items-center gap-8 pb-28 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-36">
        <div className="order-2 text-right lg:order-1">
          <h1 className="max-w-xl font-bold leading-[1.12] text-brand text-4xl md:text-5xl lg:text-[64px]">
            خــذ نفس،
            <br />
            ونحن معــك.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-[2] text-muted-foreground md:text-lg">
            منصة دعم نفسي سرية وآمنة تساعدك على فهم نفسك
            والتحدث مع متخصصين معتمدين متى احتجت.
          </p>
          <div className="mt-8 flex flex-wrap justify-end gap-3 lg:justify-start">
            <Button
              className="h-auto rounded-xl bg-brand px-8 py-4 text-base font-medium text-brand-foreground hover:bg-brand/90"
              onClick={() => navigate("/auth/login")}
            >
              احجز جلسة الآن
            </Button>
            <Button
              variant="outline"
              className="h-auto rounded-xl border-border bg-card px-7 py-4 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => navigate("/auth/login")}
            >
              تقييم نفسي مجاني
            </Button>
          </div>
        </div>

        <div className="order-1 relative mx-auto h-[280px] w-full max-w-[590px] md:h-[380px] lg:order-2 lg:h-[440px] lg:max-w-none">
          <img
            src={heroImg}
            alt="غرفة هادئة بكرسي أخضر للعلاج النفسي"
            width={1280}
            height={1024}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </div>

    <svg
      className="absolute inset-x-0 bottom-[104px] z-20 h-[170px] w-full lg:bottom-[116px] lg:h-[210px]"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 132 C145 150 238 120 330 74 C436 21 558 8 690 54 C810 96 900 128 1012 86 C1123 45 1252 -2 1440 34 L1440 220 L0 220 Z"
        fill="hsl(var(--background))"
      />
    </svg>

    <div className="relative z-30 bg-background pb-8 pt-10 lg:pt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6 place-items-center">
          {badges.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 text-right">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};
