import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  Search,
  Stethoscope,
  Calendar,
  Clock,
  ChevronRight,
  User,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Loader2,
  Eye
} from "lucide-react";
import CalendarGrid from "../../components/doctor/schedule/CalendarGrid";
import { useAuth } from "../../contexts/AuthContext";
import { patientAPI } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ReserveAppointment() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { t, isRTL } = useLanguage();

  // BookingStatus enum
  const BookingStatusMap = {
    0: { label: t('bookingStatus.pending'), variant: 'warning' },
    1: { label: t('bookingStatus.confirmed'), variant: 'primary' },
    2: { label: t('bookingStatus.inProgress'), variant: 'info' },
    3: { label: t('bookingStatus.completed'), variant: 'success' },
    4: { label: t('bookingStatus.cancelled'), variant: 'danger' },
    5: { label: t('bookingStatus.noShow'), variant: 'danger' },
  };
  const [step, setStep] = useState(1); // 1: Doctor List, 2: Calendar/Details, 3: Success
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlot, setBookedSlot] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [mainTab, setMainTab] = useState("reserve"); // reserve, status
  const [slots, setSlots] = useState({});
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
  });

  // Patient bookings states (My Reservation Status)
  const [patientBookings, setPatientBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPagination, setBookingsPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch Doctors with Pagination
  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const response = await patientAPI.getAllDoctors(page, pagination.pageSize);
      if (response.IsSuccess) {
        setDoctors(response.Data.Items || []);
        setPagination({
          pageIndex: response.Data.PageIndex,
          pageSize: response.Data.PageSize,
          totalPages: response.Data.Pages,
          totalRecords: response.Data.Records,
        });
      } else {
        toast.error(response.Message || t('errors.loadDoctorsFailed'));
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Patient Bookings for status tab
  const fetchPatientBookings = async (page = 1) => {
    setBookingsLoading(true);
    try {
      const response = await patientAPI.getPatientBookings(page, bookingsPagination.pageSize);
      if (response.IsSuccess && response.Data) {
        setPatientBookings(response.Data.Items || []);
        setBookingsPagination({
          pageIndex: response.Data.PageIndex || page,
          pageSize: response.Data.PageSize || 10,
          totalPages: response.Data.Pages || 1,
        });
      } else {
        toast.error(response?.Message || t('errors.loadBookingsFailed'));
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(t('errors.loadBookingsFailed'));
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === "reserve") {
      fetchDoctors(1);
    } else if (mainTab === "status") {
      fetchPatientBookings(1);
    }
  }, [mainTab]);

  // Re-fetch doctor slots when the user navigates to a different week
  useEffect(() => {
    if (step === 2 && selectedDoctor) {
      fetchDoctorSlots(selectedDoctor.Id, selectedDate);
    }
  }, [selectedDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDoctors(newPage);
    }
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get the week date range for a given base date
  // Ensures StartDate is never in the past (backend rejects past dates)
  const getWeekRange = (baseDate) => {
    const weekStart = new Date(baseDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use today if the week start is in the past
    const start = weekStart < today ? today : weekStart;

    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  // Fetch available slots from the API for a given doctor and week
  const fetchDoctorSlots = async (doctorId, baseDate) => {
    try {
      const { start, end } = getWeekRange(baseDate);
      const response = await patientAPI.getDoctorSlots(
        String(doctorId),
        formatDateKey(start),
        formatDateKey(end)
      );

      console.log("Doctor Slots API response:", response);

      const mappedSlots = {};

      if (response.IsSuccess && response.Data) {
        // API returns { DoctorId, DoctorName, Slots: [...] }
        const slotsData = response.Data.Slots
          || response.Data.Items
          || (Array.isArray(response.Data) ? response.Data : []);

        console.log("Slots data parsed:", slotsData);

        slotsData.forEach(slot => {
          // Handle various field names for the time
          const slotTime = slot.StartTime || slot.Date || slot.Start || slot.SessionStartTime || slot.SlotStart;
          if (slotTime) {
            const slotDate = new Date(slotTime);
            const dateKey = formatDateKey(slotDate);
            const hour = slotDate.getHours();
            const key = `${dateKey}-${hour}`;

            // Check if slot is available or booked
            if (slot.IsBooked || slot.Booked) {
              mappedSlots[key] = "booked";
            } else {
              mappedSlots[key] = "available";
            }
          }
        });

        if (slotsData.length === 0) {
          console.warn("Doctor has no available slots for this period");
        }
      }

      // Fallback: also try DoctoreSchualings from doctor data if slots API returned nothing
      if (Object.keys(mappedSlots).length === 0 && selectedDoctor?.DoctoreSchualings) {
        const apiSchedules = selectedDoctor.DoctoreSchualings || [];
        apiSchedules.forEach(schedule => {
          if (schedule.Aviable && schedule.Date) {
            const scheduleDate = new Date(schedule.Date);
            const dateKey = formatDateKey(scheduleDate);
            const hour = scheduleDate.getHours();
            const key = `${dateKey}-${hour}`;
            mappedSlots[key] = "available";
          }
        });
      }

      setSlots(mappedSlots);
    } catch (error) {
      console.error("Error fetching doctor slots:", error);
      // Fallback to DoctoreSchualings if the slots API fails
      if (selectedDoctor?.DoctoreSchualings) {
        const mappedSlots = {};
        selectedDoctor.DoctoreSchualings.forEach(schedule => {
          if (schedule.Aviable && schedule.Date) {
            const scheduleDate = new Date(schedule.Date);
            const dateKey = formatDateKey(scheduleDate);
            const hour = scheduleDate.getHours();
            const key = `${dateKey}-${hour}`;
            mappedSlots[key] = "available";
          }
        });
        setSlots(mappedSlots);
      }
    }
  };

  // Get Detailed Doctor Info and Scheduling/Slots
  const handleSelectDoctor = async (doctorId) => {
    setLoading(true);
    try {
      // Use the ID as a string to maintain precision for large BigInt IDs
      const response = await patientAPI.getDoctorById(String(doctorId));

      if (response.IsSuccess) {
        // The API returns a paging DTO, so we check for Items
        const doctorData = response.Data?.Items && response.Data.Items.length > 0
          ? response.Data.Items[0]
          : (response.Data && !response.Data.Items ? response.Data : null);

        if (doctorData) {
          setSelectedDoctor(doctorData);

          // Fetch available slots from dedicated API
          await fetchDoctorSlots(doctorId, selectedDate);

          setStep(2);
        } else {
          toast.error(t('errors.doctorNotFound'));
        }
      } else {
        toast.error(response.Message || t('errors.loadDoctorsFailed'));
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
      toast.error(t('errors.loadDoctorsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const response = await patientAPI.cancelBooking(bookingId, "Cancelled by patient");
      if (response?.IsSuccess !== false) {
        toast.success(t('success.appointmentCancelled'));
        // Refresh bookings
        fetchPatientBookings(bookingsPagination.pageIndex);
      } else {
        toast.error(response?.Message || t('errors.cancelFailed'));
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || t('errors.cancelFailed'));
    } finally {
      setCancellingId(null);
    }
  };

  const handleSlotClick = (date, hour) => {
    // Consistent date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const key = `${dateKey}-${hour}`;
    console.log("Slot clicked:", key, "status:", slots[key]);

    // Allow booking if slot is available
    if (slots[key] === "available") {
      setBookedSlot({ date, hour });
      console.log("Booked slot set:", { date: dateKey, hour });
    }
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !bookedSlot) return;

    setLoading(true);
    try {
      // Construct booking request
      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        // Format: YYYY-MM-DDTHH:mm:ss (ISO 8601 without Z if backend expects local, or with Z if UTC)
        // Swagger says "date-time". Usually ISO.
        // Let's create a date object with the booked hour
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const bookingDate = new Date(bookedSlot.date);
      bookingDate.setHours(bookedSlot.hour);
      bookingDate.setMinutes(0);
      bookingDate.setSeconds(0);

      const bookingRequest = {
        DoctorId: selectedDoctor.Id,
        SessionStartTime: formatDate(bookingDate),
        DurationMinutes: 30, // Backend accepts 30 or 45 minutes only
        PatientNotes: "Booked via Web App"
      };

      const response = await patientAPI.createBooking(bookingRequest);
      if (response.IsSuccess) {
        setStep(3);
        toast.success(t('success.bookingConfirmed'));
      } else {
        toast.error(response.Message || t('errors.bookingFailed'));
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMsg = error.response?.data?.Message || t('errors.bookingFailed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">{t('patient.appointments')}</h1>
          <p className="text-text-muted mt-1">
            {t('patient.manageBookSessions')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-border mb-8 overflow-x-auto no-scrollbar scroll-smooth gap-1">
        <button
          onClick={() => setMainTab("reserve")}
          className={`px-5 md:px-8 py-3.5 font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${mainTab === "reserve"
            ? "text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]"
            : "text-text-muted hover:text-text-heading hover:bg-background-subtle"
            }`}
        >
          {t('patient.availableDoctors')}
        </button>
        <button
          onClick={() => setMainTab("status")}
          className={`px-5 md:px-8 py-3.5 font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${mainTab === "status"
            ? "text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]"
            : "text-text-muted hover:text-text-heading hover:bg-background-subtle"
            }`}
        >
          {t('patient.myReservationStatus')}
        </button>
      </div>

      {mainTab === "reserve" ? (
        <div className="space-y-6">
          {step > 1 && step < 3 && (
            <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="gap-2 hover:bg-primary/10"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {t('common.backToList')}
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-text-heading">
                      {t('patient.selectDoctor')}
                    </h2>
                  </div>
                </div>

                {/* Doctors Table */}
                <div className="bg-background-paper rounded-xl border border-border overflow-hidden shadow-sm">
                  {loading ? (
                    <div className="p-12 flex justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow hover={false}>
                            <TableHead className="w-[30%]">{t('common.doctor')}</TableHead>
                            <TableHead className="w-[20%]">{t('common.specialty')}</TableHead>
                            <TableHead className="w-[35%]">{t('patient.experienceBio')}</TableHead>
                            <TableHead className={`w-[15%] ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.action')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                              <TableRow key={doctor.Id}>
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                                      {doctor.Image ? (
                                        <img src={doctor.Image} alt={doctor.Name} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <User className="w-6 h-6 text-primary" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-text-heading text-base">{doctor.Name}</p>
                                      <p className="text-xs text-text-muted">{t('common.doctor')}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  {doctor.Specialist && doctor.Specialist.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {doctor.Specialist.map((spec, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1">
                                          {spec}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">{t('common.general')}</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="py-4">
                                  <p className="max-w-xs line-clamp-2 text-text-muted text-sm leading-relaxed" title={doctor.Description}>
                                    {doctor.Description || t('common.noDescription')}
                                  </p>
                                </TableCell>
                                <TableCell className={`py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectDoctor(doctor.Id)}
                                    className="gap-2 text-primary border-primary/30 hover:bg-primary hover:text-white transition-all"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('common.view')}</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-12 text-text-muted">
                                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">{t('patient.noDoctorsFound')}</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      {/* Pagination Controls */}
                      {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-background-subtle/30">
                          <span className="text-sm text-text-muted font-medium">
                            {t('common.page')} {pagination.pageIndex} {t('common.of')} {pagination.totalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pagination.pageIndex <= 1}
                              onClick={() => handlePageChange(pagination.pageIndex - 1)}
                              className="gap-1"
                            >
                              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                              {t('common.previous')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pagination.pageIndex >= pagination.totalPages}
                              onClick={() => handlePageChange(pagination.pageIndex + 1)}
                              className="gap-1"
                            >
                              {t('common.next')}
                              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && selectedDoctor && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2">
                  <CardHeader className="px-0">
                    <CardTitle>{t('patient.selectTimeSlot')}</CardTitle>
                    <p className="text-text-muted">{t('patient.bookingWith')} {selectedDoctor.Name}</p>
                  </CardHeader>
                  <CalendarGrid
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    slots={slots}
                    onSlotClick={handleSlotClick}
                    mode="patient"
                    selectedSlot={bookedSlot}
                  />
                  {Object.keys(slots).length === 0 && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-amber-700 font-medium">{t('patient.noSlotsAvailable') || 'No available slots for this week'}</p>
                      <p className="text-amber-600 text-sm mt-1">{t('patient.trySlotsNextWeek') || 'Try navigating to the next week, or the doctor may not have set their schedule yet.'}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="font-bold text-lg mb-4">{t('patient.bookingSummary')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {selectedDoctor.Image ? (
                            <img src={selectedDoctor.Image} alt={selectedDoctor.Name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-text-light">{t('common.doctor')}</p>
                          <p className="font-medium">{selectedDoctor.Name}</p>
                        </div>
                      </div>

                      {selectedDoctor.Specialist && (
                        <div className="flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-text-light">{t('common.specialty')}</p>
                            <p className="font-medium text-sm">{selectedDoctor.Specialist.join(", ")}</p>
                          </div>
                        </div>
                      )}

                      {bookedSlot && (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-text-muted">
                              {t('patient.selectedTime')}
                            </p>
                            <p className="font-medium text-text-heading">
                              {bookedSlot.date.toLocaleDateString()} at{" "}
                              {bookedSlot.hour > 12
                                ? `${bookedSlot.hour - 12} PM`
                                : `${bookedSlot.hour} AM`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full mt-8"
                      disabled={!bookedSlot}
                      onClick={confirmBooking}
                    >
                      {t('patient.confirmAppointment')}
                    </Button>
                  </Card>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto text-center py-12"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-text-heading mb-4">
                  {t('patient.bookingConfirmedTitle')}
                </h2>
                <p className="text-text-muted mb-8">
                  {t('patient.bookingConfirmedDesc')}
                </p>
                <Button className="w-full" onClick={() => {
                  setStep(1);
                  setSelectedDoctor(null);
                  setBookedSlot(null);
                }}>
                  {t('patient.backToDoctors')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {patientBookings.length > 0 ? (
                patientBookings.map((booking) => {
                  const statusInfo = BookingStatusMap[booking.Status] || { label: 'Unknown', variant: 'secondary' };
                  const sessionDate = booking.SessionStartTime ? new Date(booking.SessionStartTime) : null;
                  const canCancel = booking.Status === 0 || booking.Status === 1; // Pending or Confirmed

                  return (
                    <Card key={booking.Id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                            {booking.DoctorImage ? (
                              <img src={booking.DoctorImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-text-heading">{booking.DoctorName || t('common.doctor')}</h3>
                            <p className="text-text-muted text-sm">
                              {booking.DurationMinutes ? `${booking.DurationMinutes} ${t('patient.minSession')}` : t('patient.consultation')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                          <div className="text-sm">
                            {sessionDate && (
                              <>
                                <div className="flex items-center gap-2 text-text-heading">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span className="font-medium">
                                    {sessionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-text-muted mt-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>

                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                onClick={() => handleCancelReservation(booking.Id)}
                                disabled={cancellingId === booking.Id}
                                title={t('patient.cancelAppointment')}
                              >
                                {cancellingId === booking.Id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {booking.PatientNotes && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm text-text-muted">
                          <span className="font-bold text-text-heading">{t('patient.notes')}:</span>{" "}
                          {booking.PatientNotes}
                        </div>
                      )}

                      {booking.CancellationReason && booking.Status === 4 && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                          <span className="font-bold">{t('patient.cancellationReason')}:</span>{" "}
                          {booking.CancellationReason}
                        </div>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-background-subtle/20 rounded-2xl border-2 border-dashed border-border">
                  <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-medium text-text-muted">
                    {t('patient.noReservationsFound')}
                  </h3>
                  <p className="text-text-muted mt-2">
                    {t('patient.noReservationsDesc')}
                  </p>
                  <Button
                    className="mt-6"
                    variant="outline"
                    onClick={() => setMainTab("reserve")}
                  >
                    {t('patient.bookNow')}
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {bookingsPagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-border">
                  <span className="text-sm text-text-muted font-medium">
                    {t('common.page')} {bookingsPagination.pageIndex} {t('common.of')} {bookingsPagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPagination.pageIndex <= 1}
                      onClick={() => fetchPatientBookings(bookingsPagination.pageIndex - 1)}
                      className="gap-1"
                    >
                      {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPagination.pageIndex >= bookingsPagination.totalPages}
                      onClick={() => fetchPatientBookings(bookingsPagination.pageIndex + 1)}
                      className="gap-1"
                    >
                      {t('common.next')}
                      {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
