const steps = [
  { n: "01", title: "قيّم حالتك", desc: "أجب عن أسئلة قصيرة يطرحها المساعد الذكي." },
  { n: "02", title: "اختر معالجك", desc: "نقترح لك أفضل المعالجين بناءً على نتيجتك." },
  { n: "03", title: "ابدأ جلستك", desc: "صوت، فيديو أو شات — في الوقت الذي يناسبك." },
];

const HowItWorks = () => (
  <section className="px-6 lg:px-10 py-20">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold">كيف يعمل نَفَس؟</h2>
        <p className="text-muted-foreground mt-4">ثلاث خطوات بسيطة تفصلك عن راحتك النفسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((s) => (
          <div key={s.n} className="bg-gradient-hero rounded-3xl p-8 text-right border border-border/40">
            <div className="font-display font-extrabold text-5xl text-primary/30 mb-4">{s.n}</div>
            <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
