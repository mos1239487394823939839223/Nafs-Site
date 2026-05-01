import { useState, useEffect } from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Activity, Heart, Thermometer, TrendingUp, Calendar, Clock, Video, MessageSquare, Bot, Loader2, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AIAssistant from "../../components/shared/AIAssistant";
import BookingModal from "../../components/modals/BookingModal";
import HealthJourneyTimeline from "../../components/patient/HealthJourneyTimeline";
import { useAuth } from "../../contexts/AuthContext";
import { patientAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getAppointmentStatusKey,
  getAppointmentStatusMeta,
} from "../../lib/appointmentStatus";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [showAI, setShowAI] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch patient bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await patientAPI.getPatientBookings(1, 20);
        if (response?.IsSuccess === true && response?.Data) {
          setBookings(response.Data.Items || response.Data || []);
        }
      } catch (error) {
        console.error("Failed to fetch patient bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Mock health data (these would come from health tracking APIs in the future)
  const bloodPressureData = [
    { date: "Jan", systolic: 120, diastolic: 80 },
    { date: "Feb", systolic: 118, diastolic: 78 },
    { date: "Mar", systolic: 122, diastolic: 82 },
    { date: "Apr", systolic: 119, diastolic: 79 },
    { date: "May", systolic: 121, diastolic: 81 },
  ];

  const heartRateData = [
    { day: "Mon", bpm: 72 },
    { day: "Tue", bpm: 75 },
    { day: "Wed", bpm: 70 },
    { day: "Thu", bpm: 73 },
    { day: "Fri", bpm: 71 },
    { day: "Sat", bpm: 68 },
    { day: "Sun", bpm: 69 },
  ];

  // Upcoming appointments from real API data
  const upcomingAppointments = bookings
    .filter((b) => {
      const statusKey = getAppointmentStatusKey(b.Status, b);
      return (
        statusKey === "pending" ||
        statusKey === "confirmed" ||
        statusKey === "pendingPayment" ||
        statusKey === "inProgress"
      );
    })
    .sort((a, b) => new Date(a.SessionStartTime) - new Date(b.SessionStartTime))
    .slice(0, 3)
    .map((booking) => {
      const sessionDate = booking.SessionStartTime
        ? new Date(booking.SessionStartTime)
        : null;
      return {
        id: booking.Id,
        doctor: booking.DoctorName
          ? `${t("common.dr", "Dr.")} ${booking.DoctorName}`
          : t("common.doctor", "Doctor"),
        specialty: t("patient.consultation", "Consultation"),
        date:
          sessionDate?.toLocaleDateString(t("auto.enus"), {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) || "N/A",
        time:
          sessionDate?.toLocaleTimeString(t("auto.enus"), {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }) || "N/A",
        type: t("patient.video", "Video"),
        status: getAppointmentStatusMeta(booking.Status, { t, isRTL, booking })
          .label,
      };
    });

  // Next checkup calculation
  const nextAppointment = upcomingAppointments[0];
  const daysUntilNext = nextAppointment
    ? Math.max(
        0,
        Math.ceil(
          (new Date(
            bookings.find((b) => b.Id === nextAppointment.id)?.SessionStartTime,
          ) -
            new Date()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div className="space-y-6" >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{t("patient.heartRate")}</p>
              <p className="text-3xl font-bold mt-1">
                72 {t("patient.bpm", "BPM")}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {t("patient.normal")}
              </p>
            </div>
            <Heart className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">
                {t("patient.bloodPressure")}
              </p>
              <p className="text-3xl font-bold mt-1">120/80</p>
              <p className="text-white/60 text-xs mt-1">
                {t("patient.optimal")}
              </p>
            </div>
            <Activity className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">
                {t("patient.totalSessions")}
              </p>
              <p className="text-3xl font-bold mt-1">{bookings.length}</p>
              <p className="text-white/60 text-xs mt-1">
                {
                  bookings.filter(
                    (b) => getAppointmentStatusKey(b.Status, b) === "completed",
                  ).length
                }{" "}
                {t("patient.completed")}
              </p>
            </div>
            <Thermometer className="w-12 h-12 text-white/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">
                {t("patient.nextCheckup")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {daysUntilNext !== null
                  ? `${daysUntilNext} ${t("patient.days")}`
                  : t("patient.none")}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {nextAppointment?.date || t("patient.noUpcoming")}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-white/30" />
          </div>
        </Card>
      </div>

      {/* Health Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("patient.bloodPressureTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#8993A4" />
                <YAxis stroke="#8993A4" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#7DAE9F"
                  strokeWidth={2}
                  dot={{ fill: "#7DAE9F" }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#93B5C6"
                  strokeWidth={2}
                  dot={{ fill: "#93B5C6" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-text-muted">
                  {t("patient.systolic")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-sm text-text-muted">
                  {t("patient.diastolic")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("patient.weeklyHeartRate")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#8993A4" />
                <YAxis stroke="#8993A4" />
                <Tooltip />
                <Bar dataKey="bpm" fill="#7DAE9F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Journey Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthJourneyTimeline />
        </div>

        {/* Upcoming Sessions Summary */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>{t("patient.upcomingSessions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 bg-background rounded-xl border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-text">
                          {appointment.doctor}
                        </span>
                      </div>
                      <div
                        className={`text-xs text-text-muted ${
                          "text-start"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-text-muted text-sm py-4">
                    {t("patient.noUpcomingSessions")}
                  </p>
                )}
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => setShowBooking(true)}
                >
                  <Calendar className="w-4 h-4 me-2" />
                  {t("patient.bookNewSession")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("patient.upcomingAppointments")}</CardTitle>
          <Button onClick={() => setShowBooking(true)}>
            <Calendar className="w-4 h-4 me-2" />
            {t("patient.bookAppointment")}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-heading">
                        {appointment.doctor}
                      </h4>
                      <p className="text-sm text-text-muted">
                        {appointment.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="flex items-center gap-2 text-text-heading">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium" dir="ltr">
                        {appointment.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted mt-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm" dir="ltr">
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                  <Badge variant="primary">{appointment.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-muted py-8">
              {t("patient.bookAppointmentNow")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card
          hover
          className="cursor-pointer"
          onClick={() => setShowBooking(true)}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">
              {t("patient.bookAppointment")}
            </h3>
            <p className="text-sm text-text-muted mt-2">
              {t("patient.scheduleSession")}
            </p>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">
              {t("patient.virtualClinic")}
            </h3>
            <p className="text-sm text-text-muted mt-2">
              {t("patient.joinVideoConsultation")}
            </p>
          </div>
        </Card>

        <Card hover className="cursor-pointer" onClick={() => setShowAI(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-accent-dark" />
            </div>
            <h3 className="font-semibold text-text-heading mt-4">
              {t("patient.aiHealthAssistant")}
            </h3>
            <p className="text-sm text-text-muted mt-2">
              {t("patient.getInstantHealthAdvice")}
            </p>
          </div>
        </Card>

        {/* Emergency Button */}
        <div
          className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all p-5 flex flex-col items-center justify-center gap-3 text-center"
          onClick={() => navigate('/dashboard/patient/messages?type=support&caseType=emergency')}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-white text-base">
            {t("patient.emergency", "Emergency")}
          </h3>
          <p className="text-white/80 text-sm">
            {t("patient.emergencyDesc", "Get immediate support")}
          </p>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
      />
    </div>
  );
}
