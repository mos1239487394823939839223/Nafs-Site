import { HeroCard } from "./HeroCard";
import { QuickActions } from "./QuickActions";
import { UpcomingSession } from "./UpcomingSession";
import { SuggestedDoctors } from "./SuggestedDoctors";
import { MoodGauge } from "./MoodGauge";
import { TreatmentProgram } from "./TreatmentProgram";
import { MoodCheckIn } from "./MoodCheckIn";
import { usePatientJourney } from "./usePatientJourney";

export const PatientHomePage = () => {
  const journey = usePatientJourney();

  return (
    <main className="mx-auto w-full max-w-[1240px] min-w-0 space-y-6 pb-10">
      <HeroCard isNewPatient={journey.isNewPatient} />
      <QuickActions />
      <UpcomingSession session={journey.upcomingSession} loading={journey.loading} />
      <SuggestedDoctors />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TreatmentProgram program={journey.program} hasCompletedSession={journey.hasCompletedSession} completedCount={journey.completedCount} hasUpcomingSession={journey.hasUpcomingSession} loading={journey.loading} />
        <MoodGauge assessment={journey.assessment} hasCompletedSession={journey.hasCompletedSession} loading={journey.loading} />
      </div>
      <div id="mood-check-in-section">
        <MoodCheckIn />
      </div>
    </main>
  );
};
