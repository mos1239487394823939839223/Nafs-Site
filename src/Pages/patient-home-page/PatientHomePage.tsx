import { HeroCard } from "./HeroCard";
import { QuickActions } from "./QuickActions";
import { UpcomingSession } from "./UpcomingSession";
import { SuggestedDoctors } from "./SuggestedDoctors";
import { MoodGauge } from "./MoodGauge";
import { TreatmentProgram } from "./TreatmentProgram";
import { MoodCheckIn } from "./MoodCheckIn";
import { JourneyUpdate } from "./JourneyUpdate";
import { usePatientJourney } from "./usePatientJourney";

export const PatientHomePage = () => {
  const journey = usePatientJourney();

  return (
    <main className="flex-1 min-w-0 w-full space-y-6 pb-8">
      <HeroCard isNewPatient={journey.isNewPatient} />
      <QuickActions />
      <UpcomingSession session={journey.upcomingSession} loading={journey.loading} />
      <SuggestedDoctors />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodGauge assessment={journey.assessment} hasCompletedSession={journey.hasCompletedSession} loading={journey.loading} />
        <TreatmentProgram program={journey.program} hasCompletedSession={journey.hasCompletedSession} completedCount={journey.completedCount} loading={journey.loading} />
      </div>
      <JourneyUpdate update={journey.latestTherapistUpdate} therapistName={journey.latestTherapistName} hasCompletedSession={journey.hasJourneyStarted} />
      <MoodCheckIn />
    </main>
  );
};
