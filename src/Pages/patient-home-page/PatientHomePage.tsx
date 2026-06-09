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
    <main className="mx-auto w-full max-w-[1240px] min-w-0 space-y-8 pb-10">
      <HeroCard isNewPatient={journey.isNewPatient} />
      <MoodCheckIn />
      <UpcomingSession session={journey.upcomingSession} loading={journey.loading} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MoodGauge assessment={journey.assessment} hasCompletedSession={journey.hasCompletedSession} loading={journey.loading} />
        <TreatmentProgram program={journey.program} hasCompletedSession={journey.hasCompletedSession} completedCount={journey.completedCount} loading={journey.loading} />
      </div>
      <JourneyUpdate update={journey.latestTherapistUpdate} therapistName={journey.latestTherapistName} hasCompletedSession={journey.hasJourneyStarted} />
      <QuickActions />
      <SuggestedDoctors />
    </main>
  );
};
