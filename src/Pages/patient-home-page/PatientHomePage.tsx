import { HeroCard } from "./HeroCard";
import { QuickActions } from "./QuickActions";
import { UpcomingSession } from "./UpcomingSession";
import { SuggestedDoctors } from "./SuggestedDoctors";
import { MoodGauge } from "./MoodGauge";
import { TreatmentProgram } from "./TreatmentProgram";
import { MoodCheckIn } from "./MoodCheckIn";

export const PatientHomePage = () => {
  return (
    <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 w-full">
      <HeroCard />
      <QuickActions />
      <UpcomingSession />
      <SuggestedDoctors />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MoodGauge />
        <TreatmentProgram />
      </div>
      <MoodCheckIn />
    </main>
  );
};
