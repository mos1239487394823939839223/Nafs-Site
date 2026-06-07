import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarClock, ExternalLink, Loader2, Video } from "lucide-react";
import { extractErrorMessage, meetingAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../components/ui/Toast";

const pickMeetingUrl = (data, fallback = "") =>
  data?.MeetingUrl ||
  data?.meetingUrl ||
  data?.RoomUrl ||
  data?.roomUrl ||
  data?.JoinUrl ||
  data?.joinUrl ||
  fallback ||
  "";

export default function MeetingRoom() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const toast = useToast();
  const [loading, setLoading] = useState(!location.state?.meeting);
  const [meeting, setMeeting] = useState(location.state?.meeting || null);
  const [meetingUrl, setMeetingUrl] = useState(
    pickMeetingUrl(location.state?.meeting, location.state?.meetingUrl),
  );

  const session = location.state?.session || {};
  const doctorName =
    session.DoctorName ||
    session.doctorName ||
    meeting?.DoctorName ||
    meeting?.doctorName ||
    t("common.therapist", "Therapist");

  useEffect(() => {
    if (location.state?.meeting || !bookingId) return;

    let mounted = true;
    const startMeeting = async () => {
      setLoading(true);
      try {
        const response = await meetingAPI.startBookingMeeting(bookingId);
        if (response?.IsSuccess === false || response?.isSuccess === false) {
          throw new Error(response?.Message || response?.message || "Failed to start meeting");
        }
        const data = response?.Data ?? response?.data ?? response;
        if (!mounted) return;
        setMeeting(data);
        setMeetingUrl(pickMeetingUrl(data));
      } catch (error) {
        console.error("Failed to start meeting:", error);
        toast.error(extractErrorMessage(error, t("patientHome.upcomingSession.meetingStartFailed", "Could not start the session.")));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    startMeeting();
    return () => {
      mounted = false;
    };
  }, [bookingId, location.state?.meeting, t, toast]);

  const startedAt = useMemo(() => {
    const value = meeting?.StartedAt || meeting?.startedAt || new Date().toISOString();
    return new Date(value).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [meeting]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background-paper to-secondary/10 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <Video className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-heading">
                {t("patientHome.upcomingSession.directMeeting", "Direct Meeting")}
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                {t("patientHome.upcomingSession.connectedWith", "Connected with")} {doctorName}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-background-paper px-4 py-2 text-sm font-semibold text-primary">
            <CalendarClock className="h-4 w-4" />
            {startedAt}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-background-paper shadow-card">
        <div className="flex min-h-[420px] items-center justify-center bg-background-subtle/70 p-6 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="text-sm font-medium text-text-muted">
                {t("patientHome.upcomingSession.preparingRoom", "Preparing your private session room...")}
              </p>
            </div>
          ) : meetingUrl ? (
            <div className="max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Video className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-text-heading">
                {t("patientHome.upcomingSession.roomReady", "Your room is ready")}
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                {t("patientHome.upcomingSession.roomReadyDesc", "Open the secure meeting room to start your session.")}
              </p>
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
              >
                {t("patientHome.upcomingSession.openMeeting", "Open Meeting")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div className="max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Video className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-text-heading">
                {t("patientHome.upcomingSession.roomPending", "Session room is pending")}
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                {t("patientHome.upcomingSession.roomPendingDesc", "The booking was opened, but no meeting link was returned yet.")}
              </p>
              <button
                onClick={() => navigate("/dashboard/patient/home")}
                className="mt-5 rounded-2xl border border-border px-6 py-3 text-sm font-bold text-text-heading transition-colors hover:bg-background-subtle"
              >
                {t("common.back", "Back")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
