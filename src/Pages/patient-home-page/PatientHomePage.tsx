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
    <main className="flex-1 min-w-0 px-2 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 w-full">
      <HeroCard isNewPatient={journey.isNewPatient} />
      <QuickActions />
      <UpcomingSession session={journey.upcomingSession} loading={journey.loading} />
      {!journey.hasUpcomingSession && journey.isNewPatient && <SuggestedDoctors />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MoodGauge assessment={journey.assessment} hasCompletedSession={journey.hasCompletedSession} loading={journey.loading} />
        <TreatmentProgram program={journey.program} hasCompletedSession={journey.hasCompletedSession} completedCount={journey.completedCount} loading={journey.loading} />
      </div>
      <JourneyUpdate update={journey.latestTherapistUpdate} therapistName={journey.latestTherapistName} hasCompletedSession={journey.hasJourneyStarted} />
      {journey.hasJourneyStarted && <MoodCheckIn />}
    </main>
  );
};
