import { useState, useEffect } from "react";
import { doctorAPI, patientAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { APPOINTMENT_STATUS } from "../lib/appointmentStatus";

/**
 * Centralises all data fetching for the doctor home dashboard.
 *
 * Returns:
 *  todayBookings  – bookings whose SessionStartTime falls on today
 *  recentPatients – last 3 unique patients (by PatientId), latest session first
 *  stats          – { rating, totalSessions, activePatients, totalHours }
 *  loading        – true while any request is in-flight
 *  error          – first error caught, or null
 */
export function useDoctorDashboard() {
  const { user } = useAuth();

  const [todayBookings, setTodayBookings] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [stats, setStats] = useState({
    rating: null,
    totalSessions: 0,
    activePatients: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Resolve doctor id from whichever casing the auth object uses
        const doctorId = user?.ID ?? user?.Id ?? null;

        const [bookingsResult, profileResult] = await Promise.allSettled([
          doctorAPI.getBookings(1, 100),
          doctorId
            ? patientAPI.getDoctorById(doctorId)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        // ── Bookings ──────────────────────────────────────────────────────
        if (
          bookingsResult.status === "fulfilled" &&
          bookingsResult.value?.IsSuccess
        ) {
          const allBookings = bookingsResult.value.Data?.Items ?? [];
          const totalRecords =
            bookingsResult.value.Data?.Records ?? allBookings.length;

          // Today's bookings (client-side date filter)
          const todayStr = new Date().toDateString();
          const todays = allBookings.filter((b) => {
            if (!b.SessionStartTime) return false;
            return new Date(b.SessionStartTime).toDateString() === todayStr;
          });
          setTodayBookings(todays);

          // Last 3 unique patients sorted by most-recent session first
          const sorted = [...allBookings].sort(
            (a, b) =>
              new Date(b.SessionStartTime) - new Date(a.SessionStartTime),
          );
          const seen = new Set();
          const unique = [];
          for (const b of sorted) {
            if (!seen.has(b.PatientId) && unique.length < 3) {
              seen.add(b.PatientId);
              unique.push(b);
            }
          }
          setRecentPatients(unique);

          // Derive stats from bookings
          const completedBookings = allBookings.filter(
            (b) => b.Status === APPOINTMENT_STATUS.COMPLETED,
          );
          const totalHours = Math.round(
            completedBookings.reduce(
              (sum, b) => sum + (b.DurationMinutes ?? 0),
              0,
            ) / 60,
          );
          const uniquePatientCount = new Set(
            allBookings.map((b) => b.PatientId),
          ).size;

          setStats((prev) => ({
            ...prev,
            totalSessions: totalRecords,
            activePatients: uniquePatientCount,
            totalHours,
          }));
        }

        // ── Doctor profile (for rating) ───────────────────────────────────
        if (
          profileResult.status === "fulfilled" &&
          profileResult.value?.IsSuccess
        ) {
          const profile = profileResult.value.Data;
          const rating =
            profile?.Rate != null
              ? Number(profile.Rate).toFixed(1)
              : null;
          setStats((prev) => ({ ...prev, rating }));
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user?.ID, user?.Id]);

  return { todayBookings, recentPatients, stats, loading, error };
}
