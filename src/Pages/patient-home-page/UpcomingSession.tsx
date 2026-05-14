import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { patientAPI } from "../../lib/api";
import fallbackDoc from "./assets/doctor-2.jpg";

interface BookingDto {
  Id: number;
  DoctorName: string;
  DoctorImage: string | null;
  SessionStartTime: string;
  SessionEndTime: string;
  MeetingUrl: string | null;
  Status: number;
}

const UPCOMING_STATUSES = new Set([2, 7]); // Confirmed, PendingPayment

export const UpcomingSession = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [session, setSession] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await patientAPI.getPatientBookings(1, 20);
        if (response?.IsSuccess && response?.Data) {
          const items: BookingDto[] = response.Data.Items || response.Data || [];
          const now = new Date();
          const upcoming = items
            .filter(
              (b) =>
                UPCOMING_STATUSES.has(b.Status) &&
                new Date(b.SessionStartTime) > now
            )
            .sort(
              (a, b) =>
                new Date(a.SessionStartTime).getTime() -
                new Date(b.SessionStartTime).getTime()
            );
          setSession(upcoming[0] ?? null);
        }
      } catch {
        // leave session null — shows empty state
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(t("auto.enus"), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(t("auto.enus"), {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="bg-card rounded-2xl p-4 sm:p-6 shadow-card mb-6" dir="ltr">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/dashboard/patient/reserve")}
          className="text-sm text-primary font-semibold hover:underline"
        >
          {t("patientHome.upcomingSession.viewAll")}
        </button>
        <h2 className="text-lg font-bold">{t("patientHome.upcomingSession.title")}</h2>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("patientHome.upcomingSession.loading")}
        </p>
      ) : !session ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("patientHome.upcomingSession.noUpcoming")}
        </p>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          {/* Doctor */}
          <div className="flex items-center gap-3 md:min-w-[240px]">
            <img
              src={session.DoctorImage || fallbackDoc}
              alt={session.DoctorName}
              width={56}
              height={56}
              loading="lazy"
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
            <div className="text-start">
              <p className="font-bold">{session.DoctorName}</p>
              <span className="inline-block mt-1 text-[11px] bg-primary-soft text-primary px-2 py-0.5 rounded-full">
                {t("patientHome.upcomingSession.sessionType")}
              </span>
            </div>
          </div>

          {/* Date/time */}
          <div className="flex-1 flex flex-col gap-2 text-sm text-muted-foreground md:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formatDate(session.SessionStartTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formatTime(session.SessionStartTime)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 md:min-w-[180px]">
            <button
              onClick={() => session.MeetingUrl && window.open(session.MeetingUrl, "_blank")}
              disabled={!session.MeetingUrl}
              className="bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold py-2.5 px-5 rounded-xl text-sm transition-opacity"
            >
              {t("patientHome.upcomingSession.enterSession")}
            </button>
            <button
              onClick={() => navigate("/dashboard/patient/reserve")}
              className="border border-border text-foreground hover:bg-muted font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors"
            >
              {t("patientHome.upcomingSession.sessionDetails")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
