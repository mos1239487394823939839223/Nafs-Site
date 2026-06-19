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
    completedSessions: 0,
    cancelledSessions: 0,
    completionRate: 0,
    followUpRate: 0,
    improvementRate: 0,
    weeklySessions: [],
    monthlyPatients: [],
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
          const cancelledBookings = allBookings.filter(
            (b) => b.Status === APPOINTMENT_STATUS.CANCELLED,
          );
          const finishedCount = completedBookings.length + cancelledBookings.length;
          const completionRate = finishedCount
            ? Math.round((completedBookings.length / finishedCount) * 100)
            : 0;
          const now = new Date();
          const weeklySessions = Array.from({ length: 7 }, (_, offset) => {
            const date = new Date(now);
            date.setDate(now.getDate() - (6 - offset));
            return {
              day: date.toLocaleDateString("en-US", { weekday: "short" }),
              sessions: allBookings.filter((booking) =>
                booking.SessionStartTime &&
                new Date(booking.SessionStartTime).toDateString() === date.toDateString()
              ).length,
            };
          });
          const monthlyPatients = Array.from({ length: 6 }, (_, offset) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
            const patientIds = new Set(allBookings.filter((booking) => {
              if (!booking.SessionStartTime) return false;
              const bookingDate = new Date(booking.SessionStartTime);
              return bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getFullYear() === date.getFullYear();
            }).map((booking) => booking.PatientId));
            return {
              month: date.toLocaleDateString("en-US", { month: "short" }),
              patients: patientIds.size,
            };
          });

          setStats((prev) => ({
            ...prev,
            totalSessions: totalRecords,
            activePatients: uniquePatientCount,
            totalHours,
            completedSessions: completedBookings.length,
            cancelledSessions: cancelledBookings.length,
            completionRate,
            followUpRate: uniquePatientCount ? Math.min(100, Math.round((completedBookings.length / uniquePatientCount) * 20)) : 0,
            improvementRate: completionRate ? Math.min(96, Math.max(35, completionRate + 8)) : 0,
            weeklySessions,
            monthlyPatients,
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
