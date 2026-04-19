import { Button } from "./ui/button";

const CTA = () => (
  <section className="px-6 lg:px-10 pb-20">
    <div className="max-w-7xl mx-auto bg-primary rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-glow/20 to-transparent" />
      <div className="relative">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground">خذ نَفَساً عميقاً، نحن هنا</h2>
        <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto">ابدأ رحلتك نحو راحة نفسية حقيقية اليوم — التقييم الأول مجاني تماماً.</p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button size="lg" variant="secondary" className="rounded-full">ابدأ التقييم المجاني</Button>
          <Button size="lg" variant="outline" className="rounded-full bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground">تصفّح المعالجين</Button>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
