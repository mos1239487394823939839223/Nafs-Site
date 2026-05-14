import { HeroCard } from "./components/HeroCard";
import { StatTiles } from "./components/StatTiles";
import { TodaySchedule } from "./components/TodaySchedule";
import { PerformanceSummary } from "./components/PerformanceSummary";
import { QuickTools } from "./components/QuickTools";
import { RecentPatients } from "./components/RecentPatients";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDoctorDashboard } from "../../hooks/useDoctorDashboard";

const MainDoctorDashboard = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { todayBookings, recentPatients, stats, loading } = useDoctorDashboard();

  const doctorName = user?.Name ?? user?.name ?? "";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <main className="p-3 sm:p-5 md:p-8 max-w-[1100px] mx-auto w-full">
        <HeroCard doctorName={doctorName} />
        <StatTiles todayCount={todayBookings.length} />
        <TodaySchedule bookings={todayBookings} loading={loading} />
        <PerformanceSummary stats={stats} loading={loading} />
        <QuickTools />
        <RecentPatients patients={recentPatients} loading={loading} />
      </main>
    </div>
  );
};

export default MainDoctorDashboard;
