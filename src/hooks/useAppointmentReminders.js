import { useEffect, useRef } from "react";
import { Roles } from "../contexts/AuthContext";
import { doctorAPI, patientAPI } from "../lib/api";
import { scheduleBookingReminders } from "../lib/appointmentReminders";

export function useAppointmentReminders({ enabled, role, onReminder }) {
  const onReminderRef = useRef(onReminder);
  onReminderRef.current = onReminder;

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let timers = [];

    const clearTimers = () => {
      timers.forEach((timerId) => clearTimeout(timerId));
      timers = [];
    };

    const loadAndSchedule = async () => {
      clearTimers();
      try {
        let bookings = [];
        if (role === Roles.PATIENT) {
          const response = await patientAPI.getPatientBookings(1, 100);
          const data = response?.Data ?? response?.data ?? response;
          bookings = Array.isArray(data?.Items) ? data.Items : Array.isArray(data?.items) ? data.items : [];
        } else if (role === Roles.DOCTOR) {
          const response = await doctorAPI.getBookings(1, 100);
          const data = response?.Data ?? response?.data ?? response;
          bookings = Array.isArray(data?.Items) ? data.Items : Array.isArray(data?.items) ? data.items : [];
        }

        if (cancelled) return;

        timers = scheduleBookingReminders(bookings, {
          role,
          onReminder: (notification) => onReminderRef.current?.(notification),
        });
      } catch (error) {
        console.error("Failed to schedule appointment reminders", error);
      }
    };

    loadAndSchedule();
    const intervalId = setInterval(loadAndSchedule, 15 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      clearTimers();
    };
  }, [enabled, role]);
}
