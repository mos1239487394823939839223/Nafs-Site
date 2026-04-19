import { Video, CalendarCheck, CreditCard, Bot, BookOpen, ShieldCheck } from "lucide-react";

const features = [
  { icon: Video, title: "جلسات فيديو وصوت وشات", desc: "تواصل مباشر مع معالجك بالطريقة التي تناسبك، من أي مكان." },
  { icon: CalendarCheck, title: "حجز مرن", desc: "مواعيد متعددة لكل معالج مع تذكيرات ذكية وتكامل التقويم." },
  { icon: CreditCard, title: "دفع آمن", desc: "خيارات دفع موثوقة ومحلية — سهلة وسريعة." },
  { icon: Bot, title: "مساعد ذكي للتقييم", desc: "روبوت يطرح أسئلة قصيرة لاقتراح أنسب معالج لحالتك." },
  { icon: BookOpen, title: "مكتبة محتوى توعوي", desc: "مقالات وأدوات موثوقة كتبها مختصون في الصحة النفسية." },
  { icon: ShieldCheck, title: "خصوصية كاملة", desc: "تشفير من طرف لطرف وحماية صارمة لبياناتك." },
];

const Features = () => {
  return (
    <section className="px-6 lg:px-10 py-20 bg-gradient-to-b from-background to-background-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-text-heading">كل ما تحتاجه في مكان واحد</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-background-paper rounded-3xl p-7 border border-border/60 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-right text-text-heading">{title}</h3>
              <p className="text-sm text-text-light text-right leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
