import { Users, BadgeCheck, ThumbsUp, Clock } from "lucide-react";

const stats = [
  { icon: Users, value: "+10K", label: "مستخدم ساعدناهم" },
  { icon: BadgeCheck, value: "+100", label: "دكتور متخصص" },
  { icon: ThumbsUp, value: "98%", label: "رضا المستخدمين" },
  { icon: Clock, value: "24/7", label: "متاح دائماً" },
];

export const Stats = () => (
  <section className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center justify-center gap-3">
          <Icon className="h-7 w-7 text-brand" strokeWidth={1.8} />
          <div className="text-right">
            <p className="text-2xl font-bold text-brand">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
