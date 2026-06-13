import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLanguage } from "../../../contexts/LanguageContext";

interface DashboardStats {
  completionRate?: number;
  followUpRate?: number;
  improvementRate?: number;
  weeklySessions?: { day: string; sessions: number }[];
  monthlyPatients?: { month: string; patients: number }[];
}

interface PerformanceSummaryProps {
  stats?: DashboardStats;
  loading?: boolean;
}

export const PerformanceSummary = ({ stats, loading = false }: PerformanceSummaryProps) => {
  const { t, isRTL } = useLanguage();
  const progress = [
    { label: isRTL ? "اكتمال الجلسات" : "Session completion", value: stats?.completionRate ?? 0, color: "bg-secondary" },
    { label: isRTL ? "متابعة المرضى" : "Patient follow-up", value: stats?.followUpRate ?? 0, color: "bg-blue-500" },
    { label: isRTL ? "معدل تحسن الحالات" : "Case improvement", value: stats?.improvementRate ?? 0, color: "bg-primary" },
  ];

  return (
    <section className="mb-7 rounded-[26px] border border-border bg-background-paper p-5 shadow-card sm:p-7">
      <h2 className="mb-6 text-start text-xl font-extrabold text-text-heading">{t("doctor.dashboardHome.performance.title")}</h2>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
        <ChartPanel title={isRTL ? "الجلسات الأسبوعية" : "Weekly sessions"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.weeklySessions ?? []}>
              <defs><linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
              <Area type="monotone" dataKey="sessions" stroke="var(--color-primary)" fill="url(#sessionsFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title={isRTL ? "المرضى شهريًا" : "Monthly patients"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.monthlyPatients ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="patients" fill="var(--ds-info)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <div className="space-y-5 rounded-[20px] border border-border bg-background p-5">
          <p className="text-sm font-extrabold text-text-heading">{isRTL ? "نظرة عامة على النشاط" : "Activity overview"}</p>
          {progress.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-text-light"><span>{item.label}</span><span>{loading ? "-" : `${item.value}%`}</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-border"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-[20px] border border-border bg-background p-4"><p className="mb-4 text-sm font-extrabold text-text-heading">{title}</p><div className="h-52">{children}</div></div>;
}
