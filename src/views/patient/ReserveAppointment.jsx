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

// BookingStatus enum
const BookingStatusMap = {
  0: { label: 'Pending', variant: 'warning' },
  1: { label: 'Confirmed', variant: 'primary' },
  2: { label: 'In Progress', variant: 'info' },
  3: { label: 'Completed', variant: 'success' },
  4: { label: 'Cancelled', variant: 'danger' },
  5: { label: 'No Show', variant: 'danger' },
};

export default function ReserveAppointment() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
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
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
  });

  // Patient bookings states (My Reservation Status)
  const [patientBookings, setPatientBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPagination, setBookingsPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
  });
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch Doctors with Pagination
  const fetchDoctors = async (page = 0) => {
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
        toast.error(response.Message || "Failed to load doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Network error while fetching doctors");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Patient Bookings for status tab
  const fetchPatientBookings = async (page = 0) => {
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
        toast.error(response?.Message || "Failed to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === "reserve") {
      fetchDoctors(0);
    } else if (mainTab === "status") {
      fetchPatientBookings(0);
    }
  }, [mainTab]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchDoctors(newPage);
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

          // Map DoctoreSchualings (scheduling) to the slots grid
          const apiSchedules = doctorData.DoctoreSchualings || [];
          const mappedSlots = {};

          const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          apiSchedules.forEach(schedule => {
            if (schedule.Aviable && schedule.Date) {
              const scheduleDate = new Date(schedule.Date);
              const dateKey = formatDate(scheduleDate);
              const hour = scheduleDate.getHours();
              const key = `${dateKey}-${hour}`;
              mappedSlots[key] = "available";
            }
          });

          setSlots(mappedSlots);
          setStep(2);
        } else {
          toast.error("Doctor details not found.");
        }
      } else {
        toast.error(response.Message || "Failed to load doctor details");
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
      toast.error("Failed to load doctor profile and calendar");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const response = await patientAPI.cancelBooking(bookingId, "Cancelled by patient");
      if (response?.IsSuccess !== false) {
        toast.success("Appointment cancelled successfully");
        // Refresh bookings
        fetchPatientBookings(bookingsPagination.pageIndex);
      } else {
        toast.error(response?.Message || "Failed to cancel appointment");
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || "Failed to cancel appointment");
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

    // Allow booking if slot is available
    if (slots[key] === "available") {
      setBookedSlot({ date, hour });
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
        DurationMinutes: 60, // Default duration, or fetch from slot if available
        PatientNotes: "Booked via Web App"
      };

      const response = await patientAPI.createBooking(bookingRequest);
      if (response.IsSuccess) {
        setStep(3);
        toast.success("Booking confirmed successfully!");
      } else {
        toast.error(response.Message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("An error occurred while booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">Appointments</h1>
          <p className="text-text-muted">
            Manage and book your health sessions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setMainTab("reserve")}
          className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${mainTab === "reserve"
            ? "text-primary"
            : "text-text-muted hover:text-text-heading"
            }`}
        >
          Available Doctors
          {mainTab === "reserve" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setMainTab("status")}
          className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${mainTab === "status"
            ? "text-primary"
            : "text-text-muted hover:text-text-heading"
            }`}
        >
          My Reservation Status
          {mainTab === "status" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {mainTab === "reserve" ? (
        <div className="space-y-6">
          {step > 1 && step < 3 && (
            <div className="flex justify-start">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to List
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Select a Doctor
                  </h2>
                  {/* Search can be implemented server-side later if API supports it */}
                  {/* <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                    <input
                      type="text"
                      placeholder="Search doctor name..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-text"
                    />
                  </div> */}
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
                            <TableHead>Doctor</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Experience/Bio</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                              <TableRow key={doctor.Id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                      {doctor.Image ? (
                                        <img src={doctor.Image} alt={doctor.Name} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <User className="w-5 h-5 text-secondary" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-text-heading">{doctor.Name}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {doctor.Specialist && doctor.Specialist.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {doctor.Specialist.map((spec, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {spec}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-text-muted italic">General</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <p className="max-w-xs truncate text-text-muted" title={doctor.Description}>
                                    {doctor.Description || "No description available"}
                                  </p>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectDoctor(doctor.Id)}
                                    title="View Calendar"
                                    className="text-primary hover:text-primary-dark hover:bg-primary/10"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                                No doctors found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      {/* Pagination Controls */}
                      {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background-subtle/30">
                          <span className="text-sm text-text-muted">
                            Page {pagination.pageIndex + 1} of {pagination.totalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pagination.pageIndex === 0}
                              onClick={() => handlePageChange(pagination.pageIndex - 1)}
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pagination.pageIndex >= pagination.totalPages - 1}
                              onClick={() => handlePageChange(pagination.pageIndex + 1)}
                            >
                              Next <ChevronRight className="w-4 h-4 ml-1" />
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
                    <CardTitle>Select a Time Slot</CardTitle>
                    <p className="text-text-muted">Booking with Dr. {selectedDoctor.Name}</p>
                  </CardHeader>
                  <CalendarGrid
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    slots={slots}
                    onSlotClick={handleSlotClick}
                  />
                </div>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
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
                          <p className="text-xs text-text-light">Doctor</p>
                          <p className="font-medium">{selectedDoctor.Name}</p>
                        </div>
                      </div>

                      {selectedDoctor.Specialist && (
                        <div className="flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-text-light">Specialty</p>
                            <p className="font-medium text-sm">{selectedDoctor.Specialist.join(", ")}</p>
                          </div>
                        </div>
                      )}

                      {bookedSlot && (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-text-muted">
                              Selected Time
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
                      Confirm Appointment
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
                  Booking Confirmed!
                </h2>
                <p className="text-text-muted mb-8">
                  Your appointment with {selectedDoctor?.Name} has been
                  successfully scheduled. You will receive a notification before
                  the session starts.
                </p>
                <Button className="w-full" onClick={() => {
                  setStep(1);
                  setSelectedDoctor(null);
                  setBookedSlot(null);
                }}>
                  Back to Doctors
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
                            <h3 className="font-bold text-lg text-text-heading">{booking.DoctorName || 'Doctor'}</h3>
                            <p className="text-text-muted text-sm">
                              {booking.DurationMinutes ? `${booking.DurationMinutes} min session` : 'Consultation'}
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
                                title="Cancel Appointment"
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
                          <span className="font-bold text-text-heading">Notes:</span>{" "}
                          {booking.PatientNotes}
                        </div>
                      )}

                      {booking.CancellationReason && booking.Status === 4 && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                          <span className="font-bold">Reason for cancellation:</span>{" "}
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
                    No reservations found
                  </h3>
                  <p className="text-text-muted mt-2">
                    You haven't booked any appointments yet.
                  </p>
                  <Button
                    className="mt-6"
                    variant="outline"
                    onClick={() => setMainTab("reserve")}
                  >
                    Book Now
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {bookingsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-text-muted">
                    Page {bookingsPagination.pageIndex + 1} of {bookingsPagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPagination.pageIndex === 0}
                      onClick={() => fetchPatientBookings(bookingsPagination.pageIndex - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPagination.pageIndex >= bookingsPagination.totalPages - 1}
                      onClick={() => fetchPatientBookings(bookingsPagination.pageIndex + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
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
