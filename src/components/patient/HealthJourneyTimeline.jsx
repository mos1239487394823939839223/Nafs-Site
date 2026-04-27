import { useState, useEffect } from "react";
import { Calendar, FlaskConical as TestTube, Pill, FileText, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { patientAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getAppointmentStatusKey,
  getAppointmentStatusMeta,
} from "../../lib/appointmentStatus";

const eventTypeConfig = {
  appointment: {
    icon: Calendar,
    color: "primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary",
    textColor: "text-primary",
  },
  test: {
    icon: TestTube,
    color: "secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary",
    textColor: "text-secondary",
  },
  prescription: {
    icon: Pill,
    color: "accent",
    bgColor: "bg-accent/20",
    borderColor: "border-accent",
    textColor: "text-accent-dark",
  },
  diagnosis: {
    icon: FileText,
    color: "text",
    bgColor: "bg-background-subtle",
    borderColor: "border-border",
    textColor: "text-text",
  },
};

export default function HealthJourneyTimeline() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [journeyEvents, setJourneyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Fetch completed, confirmed, and in-progress bookings as journey events.
        const completedRes = await patientAPI.getPatientBookings(0, 20, 4); // Completed
        const confirmedRes = await patientAPI.getPatientBookings(0, 20, 2); // Confirmed
        const inProgressRes = await patientAPI.getPatientBookings(
          0,
          20,
          3,
        ); // In progress

        let allBookings = [];
        if (completedRes?.IsSuccess !== false && completedRes?.Data?.Items) {
          allBookings = [...allBookings, ...completedRes.Data.Items];
        }
        if (confirmedRes?.IsSuccess !== false && confirmedRes?.Data?.Items) {
          allBookings = [...allBookings, ...confirmedRes.Data.Items];
        }
        if (inProgressRes?.IsSuccess !== false && inProgressRes?.Data?.Items) {
          allBookings = [...allBookings, ...inProgressRes.Data.Items];
        }

        const events = allBookings.map((booking) => ({
          id: booking.Id,
          date: booking.SessionStartTime,
          type: "appointment",
          title: `${t("patient.sessionWith", "Session with")} ${t(
            "common.dr",
            "Dr.",
          )} ${booking.DoctorName || t("common.unknown")}`,
          status: booking.Status !== undefined ? booking.Status : null, // keep the numeric or map later
          details: `${booking.DurationMinutes || 30} ${t(
            "common.minuteConsultation",
            "minute consultation",
          )}${
            booking.DoctorSpecialist ? ` - ${booking.DoctorSpecialist}` : ""
          }`,
          doctor: `${t("common.dr", "Dr.")} ${
            booking.DoctorName || t("common.unknown")
          }`,
          duration: `${booking.DurationMinutes || 30} ${t(
            "common.min",
            "min",
          )}`,
        }));

        // Sort by date descending
        events.sort((a, b) => new Date(b.date) - new Date(a.date));
        setJourneyEvents(events);
      } catch (error) {
        console.error("Failed to fetch health journey:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", options);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("common.today", "Today");
    if (diffDays === 1) return t("common.yesterday", "Yesterday");
    if (diffDays < 7) return `${diffDays} ${t("common.daysAgo", "days ago")}`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} ${t("common.weeksAgo", "weeks ago")}`;
    return `${Math.floor(diffDays / 30)} ${t(
      "common.monthsAgo",
      "months ago",
    )}`;
  };

  const getStatusText = (status) => {
    return getAppointmentStatusMeta(status, { t, isRTL }).label;
  };

  if (loading) {
    return (
      <div className="bg-background-paper rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="text-xl font-bold text-text-heading">
              {t("patient.healthJourney", "Health Journey")}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {t("patient.healthJourneyDesc", "Your medical history timeline")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-background-paper rounded-2xl shadow-sm p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h2 className="text-xl font-bold text-text-heading">
            {t("patient.healthJourney", "Health Journey")}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {t("patient.healthJourneyDesc", "Your medical history timeline")}
          </p>
        </div>
      </div>

      {journeyEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-semibold text-text-heading mb-1">
            {t("patient.noEventsYet", "No events yet")}
          </h3>
          <p className="text-sm text-text-muted">
            {t(
              "patient.noEventsDesc",
              "Your health journey will appear here as you attend sessions.",
            )}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className={`absolute ${
              isRTL ? "right-6" : "left-6"
            } top-0 bottom-0 w-0.5 bg-border`}
          ></div>

          {/* Timeline events */}
          <div className="space-y-6">
            {journeyEvents.map((event) => {
              const config =
                eventTypeConfig[event.type] || eventTypeConfig.appointment;
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className={`relative group ${
                    isRTL ? "pr-16 text-right" : "pl-16 text-left"
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute ${
                      isRTL ? "right-0" : "left-0"
                    } w-12 h-12 ${
                      config.bgColor
                    } rounded-full flex items-center justify-center border-2 ${
                      config.borderColor
                    } bg-background-paper transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                  </div>

                  {/* Event card */}
                  <div className="bg-background-paper rounded-2xl p-4 border border-border hover:border-primary transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">
                          {event.title}
                        </h3>
                        <div
                          className={`flex items-center gap-3 mt-1 ${
                            isRTL ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <span className="text-sm text-text-muted">
                            {formatDate(event.date)}
                          </span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-sm text-text-muted">
                            {getRelativeTime(event.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getAppointmentStatusKey(event.status, event) ===
                        "completed" ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            {getStatusText(event.status)}
                          </span>
                        ) : getAppointmentStatusKey(event.status, event) ===
                            "confirmed" ||
                          getAppointmentStatusKey(event.status, event) ===
                            "inProgress" ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {getStatusText(event.status)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-text-muted bg-background-subtle px-2 py-1 rounded-full">
                            {getStatusText(event.status)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-text-muted mb-2">
                      {event.details}
                    </p>

                    <div className="flex items-center justify-between text-xs text-text-muted mt-2">
                      <span>{event.doctor}</span>
                      {event.duration && (
                        <span className="text-accent-dark font-medium">
                          {t("common.duration", "Duration")}: {event.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
