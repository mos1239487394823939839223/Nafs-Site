import { useEffect, useMemo, useState } from "react";
import { medicalAPI, patientAPI } from "../../lib/api";
import { getAppointmentStatusKey } from "../../lib/appointmentStatus";

type AnyRecord = Record<string, any>;

const asItems = (response: AnyRecord | null) => {
  const data = response?.Data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.Items)) return data.Items;
  return [];
};

const firstValue = (records: AnyRecord[], keys: string[]) => {
  for (const record of records) {
    for (const key of keys) {
      const value = record?.[key];
      if (value !== null && value !== undefined && String(value).trim()) {
        return String(value).trim();
      }
    }
  }
  return "";
};

export const usePatientJourney = () => {
  const [bookings, setBookings] = useState<AnyRecord[]>([]);
  const [history, setHistory] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJourney = async () => {
      setLoading(true);
      const [bookingsResult, historyResult] = await Promise.allSettled([
        patientAPI.getPatientBookings(1, 100),
        medicalAPI.getMyHistory(1, 100),
      ]);

      if (bookingsResult.status === "fulfilled") setBookings(asItems(bookingsResult.value));
      if (historyResult.status === "fulfilled") setHistory(asItems(historyResult.value));
      setLoading(false);
    };

    loadJourney();
  }, []);

  return useMemo(() => {
    const now = new Date();
    const completedBookings = bookings.filter(
      (booking) => getAppointmentStatusKey(booking.Status, booking) === "completed",
    );
    const upcomingSessions = bookings
      .filter((booking) => {
        const status = getAppointmentStatusKey(booking.Status, booking);
        return (
          status === "inProgress" ||
          (["pending", "confirmed", "pendingPayment"].includes(status) &&
            new Date(booking.SessionStartTime) >= now)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.SessionStartTime).getTime() -
          new Date(b.SessionStartTime).getTime(),
      );

    const sortedHistory = [...history].sort(
      (a, b) =>
        new Date(b.Date || b.RecordedAt || 0).getTime() -
        new Date(a.Date || a.RecordedAt || 0).getTime(),
    );
    const latestRecord = sortedHistory[0] || null;
    const latestTest = sortedHistory.find((item) => Number(item.Type) === 1) || null;
    const latestNote = sortedHistory.find(
      (item) => Number(item.Type) === 2 && item.DoctorNote,
    );
    const latestBookingNote = [...completedBookings]
      .sort(
        (a, b) =>
          new Date(b.SessionStartTime || 0).getTime() -
          new Date(a.SessionStartTime || 0).getTime(),
      )
      .find((booking) => booking.DoctorNotes || booking.DoctorNote);
    const resultEntries = sortedHistory.flatMap((item) =>
      Array.isArray(item.Results) ? item.Results : [],
    );
    const clinicalRecords = [...sortedHistory, ...completedBookings];

    const programName = firstValue(clinicalRecords, [
      "TreatmentProgram",
      "TreatmentProgramName",
      "ProgramName",
      "PlanName",
      "ApprovedProgramName",
    ]);
    const programTotal = Number(
      firstValue(clinicalRecords, [
        "ProgramTotalSessions",
        "TreatmentProgramSessions",
        "TotalSessions",
      ]),
    );
    const assessmentLevel = firstValue(
      [...clinicalRecords, ...resultEntries],
      ["AssessmentLevel", "ConditionLevel", "Severity", "Level"],
    );
    const recommendations = firstValue(
      [...clinicalRecords, ...resultEntries],
      ["Recommendations", "Recommendation", "Notes", "notes"],
    );
    const assessmentSummary =
      firstValue([...clinicalRecords, ...resultEntries], [
        "Assessment",
        "AssessmentSummary",
        "Condition",
        "Diagnosis",
        "Result",
        "result",
      ]) || latestTest?.TestTypeName || "";

    const program = programName
      ? {
          name: programName,
          currentSession: completedBookings.length,
          totalSessions: Number.isFinite(programTotal) && programTotal > 0 ? programTotal : null,
        }
      : null;
    const assessment =
      assessmentSummary ||
      assessmentLevel ||
      recommendations ||
      latestNote?.DoctorNote ||
      latestBookingNote?.DoctorNotes ||
      latestBookingNote?.DoctorNote
        ? {
            summary: assessmentSummary,
            level: assessmentLevel,
            recommendations,
            note:
              latestNote?.DoctorNote ||
              latestBookingNote?.DoctorNotes ||
              latestBookingNote?.DoctorNote ||
              "",
            updatedAt: latestRecord?.Date || latestRecord?.RecordedAt || "",
          }
        : null;
    const isNewPatient = completedBookings.length === 0 && !program && !assessment;

    return {
      loading,
      completedCount: completedBookings.length,
      hasCompletedSession: completedBookings.length > 0,
      hasJourneyStarted: !isNewPatient,
      isNewPatient,
      upcomingSession: upcomingSessions[0] || null,
      hasUpcomingSession: upcomingSessions.length > 0,
      program,
      assessment,
      latestTherapistUpdate:
        latestNote?.DoctorNote ||
        latestBookingNote?.DoctorNotes ||
        latestBookingNote?.DoctorNote ||
        recommendations ||
        "",
      latestTherapistName:
        latestNote?.DoctorName ||
        latestBookingNote?.DoctorName ||
        latestRecord?.DoctorName ||
        "",
    };
  }, [bookings, history, loading]);
};
