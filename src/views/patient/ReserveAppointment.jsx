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
import { Search, MedicalServices as Stethoscope, CalendarToday as Calendar, AccessTime as Clock, ChevronRight, Person as User, ArrowBack as ArrowLeft, CheckCircle, Cancel as XCircle, ChevronLeft, Sync as Loader2, Visibility as Eye, ViewList, GridView, Star, Send, ThumbUp, Badge as BadgeIcon, FlashOn, AccountBalanceWallet, RadioButtonUnchecked, CheckCircle as SelectedIcon, UploadFile as UploadIcon, ReceiptLong } from '@mui/icons-material';

import { useAuth } from "../../contexts/AuthContext";
import { patientAPI, paymentAPI } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import DoctorDocumentsViewer from "../../components/patient/DoctorDocumentsViewer";
import Modal from "../../components/ui/Modal";
import { useSearchParams } from "react-router-dom";

export default function ReserveAppointment() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { t, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // BookingStatus enum
  const BookingStatusMap = {
    0: { label: t('bookingStatus.pending'), variant: 'warning' },
    1: { label: t('bookingStatus.confirmed'), variant: 'primary' },
    2: { label: t('bookingStatus.inProgress'), variant: 'info' },
    3: { label: t('bookingStatus.completed'), variant: 'success' },
    4: { label: t('bookingStatus.cancelled'), variant: 'danger' },
    5: { label: t('bookingStatus.noShow'), variant: 'danger' },
  };
  const [step, setStep] = useState(searchParams.get("doctorId") ? 2 : 1); // 1: Doctor List, 2: Calendar/Details, 3: Success
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlot, setBookedSlot] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [mainTab, setMainTab] = useState("reserve"); // reserve, status
  const [viewMode, setViewMode] = useState("grid"); // list or grid
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

  // Doctor reviews state
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  
  // Documents modal state
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState('instapay');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bookingPendingReview, setBookingPendingReview] = useState(false);

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
      const doctorIdFromUrl = searchParams.get("doctorId");
      if (doctorIdFromUrl) {
        handleSelectDoctor(doctorIdFromUrl);
      }
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
          setReviews(doctorData.Reviews || []);
          setSearchParams({ doctorId: doctorId }); // Save to URL

          // Fetch available slots from dedicated API
          await fetchDoctorSlots(doctorId, selectedDate);

          setStep(2);
        } else {
          toast.error(t('errors.doctorNotFound'));
          setStep(1);
          setSearchParams({});
        }
      } else {
        toast.error(response.Message || t('errors.loadDoctorsFailed'));
        setStep(1);
        setSearchParams({});
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
      toast.error(t('errors.loadDoctorsFailed'));
      setStep(1);
      setSearchParams({});
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

  const initiatePaymentForBooking = async (bookingId, amount) => {
    if (!bookingId) return;
    const safeAmount = Number(amount || 0);
    if (safeAmount <= 0) {
      toast.error(isRTL ? 'لا يمكن بدء الدفع بدون قيمة صحيحة' : 'Cannot initiate payment without a valid amount');
      return;
    }

    setPaymentLoading(true);
    try {
      const providerValue = selectedPaymentProvider === 'instapay' ? 2 : 3;
      const response = await paymentAPI.initiatePayment({
        BookingId: bookingId,
        Provider: providerValue,
        Amount: safeAmount,
        Screenshot: paymentScreenshot,
        ReferenceNumber: selectedPaymentProvider === 'instapay' ? referenceNumber : undefined,
      });

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t('errors.unexpectedError'));
        return;
      }

      toast.success(
        isRTL
          ? 'تم إرسال إثبات الدفع. سيظل الحجز قيد المراجعة حتى يراجعه الدعم الفني.'
          : 'Payment proof submitted. Booking will stay pending until technical support reviews it.'
      );
      fetchPatientBookings(bookingsPagination.pageIndex);
    } catch (error) {
      toast.error(error?.response?.data?.Message || (isRTL ? 'فشل بدء عملية الدفع' : 'Failed to initiate payment'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmBookingClick = () => {
    if (!bookedSlot) return;
    setPaymentScreenshot(null);
    setReferenceNumber('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentProviderSelect = (providerId) => {
    setSelectedPaymentProvider(providerId);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentScreenshot) {
      toast.error(isRTL ? 'يرجى إرفاق صورة التحويل' : 'Please attach a transfer screenshot');
      return;
    }
    if (selectedPaymentProvider === 'instapay' && !referenceNumber.trim()) {
      toast.error(isRTL ? 'يرجى إدخال رقم المرجع' : 'Please enter the reference number');
      return;
    }
    setIsPaymentModalOpen(false);
    await confirmBooking();
  };

  const checkBookingPaymentStatus = async (bookingId) => {
    if (!bookingId) return;
    setPaymentLoading(true);
    try {
      const response = await paymentAPI.getPaymentStatus(bookingId);
      if (response?.IsSuccess === false || !response?.Data) {
        toast.error(response?.Message || t('errors.unexpectedError'));
        return;
      }

      const paid = Number(response.Data.Status) === 2;
      toast.success(
        paid
          ? (isRTL ? 'تم تأكيد الدفع' : 'Payment confirmed')
          : (isRTL ? 'الدفع غير مكتمل بعد' : 'Payment is not completed yet')
      );

      fetchPatientBookings(bookingsPagination.pageIndex);
    } catch (error) {
      toast.error(error?.response?.data?.Message || (isRTL ? 'فشل التحقق من الدفع' : 'Failed to check payment status'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayNowFromStatus = async (bookingId) => {
    const amountInput = window.prompt(isRTL ? 'أدخل مبلغ الدفع (EGP)' : 'Enter payment amount (EGP)');
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(isRTL ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid payment amount');
      return;
    }
    await initiatePaymentForBooking(bookingId, amount);
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
        const bookingId = response?.Data?.BookingId;
        const doctorFee = Number(selectedDoctor?.ConsultationFee || 0);

        if (bookingId && doctorFee > 0) {
          await initiatePaymentForBooking(bookingId, doctorFee);
        }

        setBookingPendingReview(true);
        setStep(3);
        toast.success(
          isRTL
            ? 'تم إرسال طلب الحجز والدفع بنجاح وهو الآن قيد المراجعة.'
            : 'Booking and payment request submitted successfully and is now pending review.'
        );
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
                onClick={() => {
                  setStep(1);
                  setSelectedDoctor(null);
                  setSearchParams({}); // Clear from URL
                }}
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
                  <div className="flex items-center gap-2 bg-background-subtle p-1 rounded-lg border border-border mt-2 md:mt-0">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-background-paper shadow-sm text-primary' : 'text-text-muted hover:text-text-heading'}`}
                      title="List View"
                    >
                      <ViewList className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-background-paper shadow-sm text-primary' : 'text-text-muted hover:text-text-heading'}`}
                      title="Grid View"
                    >
                      <GridView className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Doctors Views */}
                <div>
                  {loading ? (
                    <div className="p-12 flex justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {viewMode === 'list' ? (
                        <div className="bg-background-paper rounded-xl border border-border overflow-hidden shadow-sm">
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
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                              <Card key={doctor.Id} className="hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-[#15201b] border-[#1f2d26] rounded-2xl shadow-sm" onClick={() => handleSelectDoctor(doctor.Id)}>
                                <CardContent className="p-5 flex flex-col h-full">
                                  {/* Header: Image & Name */}
                                  <div className="flex items-start gap-4 mb-3">
                                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#0f1714] flex items-center justify-center border border-[#1f2d26] shadow-inner ml-0 rtl:ml-3 mr-3 rtl:mr-0">
                                      {doctor.Image ? (
                                        <img src={doctor.Image} alt={doctor.Name} className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-8 h-8 text-primary" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center text-left rtl:text-right mt-1">
                                      <h3 className="font-bold text-gray-100 text-base sm:text-lg truncate leading-tight mb-1">{doctor.Name}</h3>
                                      <p className="text-xs sm:text-sm text-gray-400 truncate mb-1">{t('common.doctor')}</p>

                                      {/* Rating */}
                                      <div className="flex items-center gap-1.5 justify-start rtl:flex-row-reverse mb-1">
                                        <div className="flex text-[#4ade80] rtl:flex-row-reverse">
                                          <Star className="w-[14px] h-[14px]" />
                                          <Star className="w-[14px] h-[14px]" />
                                          <Star className="w-[14px] h-[14px]" />
                                          <Star className="w-[14px] h-[14px]" />
                                          <Star className="w-[14px] h-[14px]" />
                                        </div>
                                        <span className="text-[13px] font-semibold text-gray-300 mt-[1px]">4.8</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed line-clamp-3 mb-5 mt-2 flex-grow text-left rtl:text-right" title={doctor.Description}>
                                    {doctor.Description || t('common.noDescription')}
                                  </p>

                                  {/* Badges footer */}
                                  <div className="flex flex-wrap gap-2 mt-auto justify-end rtl:justify-start">
                                    {doctor.Specialist && doctor.Specialist.length > 0 ? (
                                      doctor.Specialist.map((spec, idx) => (
                                        <span key={idx} className="text-[10px] sm:text-xs px-2.5 py-1 font-medium rounded-md bg-[#0a0f0d] text-gray-400 border border-[#1f2d26]">
                                          {spec}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] sm:text-xs px-2.5 py-1 font-medium rounded-md bg-[#0a0f0d] text-gray-400 border border-[#1f2d26]">
                                        {t('common.general')}
                                      </span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="col-span-full py-12 text-center text-text-muted bg-background-paper rounded-xl border border-border shadow-sm">
                              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                              <p className="font-medium">{t('patient.noDoctorsFound')}</p>
                            </div>
                          )}
                        </div>
                      )}

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

            {step === 2 && !selectedDoctor && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {step === 2 && selectedDoctor && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* ── Doctor Details Card ── */}
                <Card className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
                  <CardContent className="p-6">
                    <div className={`flex flex-col md:flex-row gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow">
                          {selectedDoctor.Image
                            ? <img src={selectedDoctor.Image} alt={selectedDoctor.Name} className="w-full h-full object-cover" />
                            : <User className="w-12 h-12 text-primary" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400' : 'text-border'}`} />)}
                          <span className="text-sm font-bold text-text-heading ms-1">4.8</span>
                        </div>
                        <span className="text-xs text-text-muted">{isRTL ? '(٢٤ مراجعة)' : '(24 reviews)'}</span>
                      </div>
                      {/* Info */}
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h2 className="text-2xl font-bold text-text-heading">{isRTL ? 'د.' : 'Dr.'} {selectedDoctor.Name}</h2>
                        {selectedDoctor.Specialist && selectedDoctor.Specialist.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedDoctor.Specialist.map((sp, i) => (
                              <span key={i} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{sp}</span>
                            ))}
                          </div>
                        )}
                        {selectedDoctor.Description && (
                          <p className="text-sm text-text-muted mt-3 leading-relaxed">{selectedDoctor.Description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="p-3 bg-background-subtle rounded-xl">
                            <p className="text-xs text-text-muted">{isRTL ? 'سنوات الخبرة' : 'Experience'}</p>
                            <p className="font-bold text-text-heading">{selectedDoctor.YearsOfExperience || '—'} {isRTL ? 'سنة' : 'yrs'}</p>
                          </div>
                          <div className="p-3 bg-background-subtle rounded-xl">
                            <p className="text-xs text-text-muted">{isRTL ? 'رسوم الاستشارة' : 'Consultation Fee'}</p>
                            <p className="font-bold text-text-heading">{selectedDoctor.ConsultationFee ? `${selectedDoctor.ConsultationFee} EGP` : isRTL ? 'متاح' : 'Available'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ── Doctor Documents & Certificates Card ── */}
                <Card className="overflow-hidden">
                  <CardContent className={`p-4 md:p-6 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <BadgeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <h3 className="font-semibold text-text-heading">{t('doctor.docs.title', 'Documents & Certificates')}</h3>
                        <p className="text-sm text-text-muted">{t('patient.viewDocs', 'View verified certificates and licenses')}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsDocsModalOpen(true)}>
                      {isRTL ? 'عرض' : 'View'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Documents Modal */}
                <Modal
                  isOpen={isDocsModalOpen}
                  onClose={() => setIsDocsModalOpen(false)}
                  title={t('doctor.docs.title', 'Documents & Certificates')}
                  size="4xl"
                >
                  <DoctorDocumentsViewer doctorId={selectedDoctor.Id} />
                </Modal>

                {/* ── Slot Picker + Summary ── */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Slot Picker */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-text-heading">{t('patient.selectTimeSlot')}</h3>
                      <p className="text-text-muted text-sm">{t('patient.bookingWith')} {selectedDoctor.Name}</p>
                    </div>

                    {/* Week navigation */}
                    <div className="flex items-center justify-between bg-background-paper border border-border rounded-xl p-3">
                      <button
                        onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()-7); setSelectedDate(d); }}
                        className="p-2 rounded-lg hover:bg-background-subtle transition-colors"
                      >
                        {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                      </button>
                      <span className="font-semibold text-text-heading">
                        {selectedDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()+7); setSelectedDate(d); }}
                        className="p-2 rounded-lg hover:bg-background-subtle transition-colors"
                      >
                        {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Days with slots */}
                    {(() => {
                      const weekDates = [];
                      const base = new Date(selectedDate);
                      base.setDate(base.getDate() - base.getDay());
                      for (let i = 0; i < 7; i++) {
                        const d = new Date(base);
                        d.setDate(base.getDate() + i);
                        weekDates.push(d);
                      }
                      const today = new Date(); today.setHours(0,0,0,0);
                      const dayNames = isRTL
                        ? ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت']
                        : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

                      return (
                        <div className="space-y-3">
                          {weekDates.map((date, di) => {
                            const isPast = date < today;
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth()+1).padStart(2,'0');
                            const dd = String(date.getDate()).padStart(2,'0');
                            const dateKey = `${yyyy}-${mm}-${dd}`;
                            const daySlots = Object.entries(slots)
                              .filter(([k]) => k.startsWith(dateKey) && slots[k] === 'available')
                              .map(([k]) => parseInt(k.split('-').pop()));

                            if (isPast && daySlots.length === 0) return null;

                            return (
                              <div key={di} className="bg-background-paper border border-border rounded-xl p-4">
                                <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <span className="font-semibold text-text-heading">{dayNames[date.getDay()]}</span>
                                  <span className="text-sm text-text-muted">
                                    {date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  {date.toDateString() === new Date().toDateString() && (
                                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{isRTL ? 'اليوم' : 'Today'}</span>
                                  )}
                                </div>
                                {daySlots.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {daySlots.sort((a,b)=>a-b).map(hour => {
                                      const isSelected = bookedSlot && bookedSlot.date.toDateString() === date.toDateString() && bookedSlot.hour === hour;
                                      const label = hour > 12 ? `${hour-12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
                                      return (
                                        <button
                                          key={hour}
                                          onClick={() => handleSlotClick(date, hour)}
                                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                                            isSelected
                                              ? 'bg-primary text-white border-primary shadow-md scale-105'
                                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-text-muted">{isRTL ? 'لا توجد مواعيد متاحة' : 'No available slots'}</p>
                                )}
                              </div>
                            );
                          })}
                          {Object.keys(slots).length === 0 && (
                            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                              <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                              <p className="text-amber-700 font-medium">{t('patient.noSlotsAvailable')}</p>
                              <p className="text-amber-600 text-sm mt-1">{t('patient.trySlotsNextWeek')}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Booking Summary */}
                  <div>
                    <Card className="p-6 border-l-4 border-l-primary sticky top-4">
                      <h3 className="font-bold text-lg mb-4">{t('patient.bookingSummary')}</h3>
                      <div className="space-y-4">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {selectedDoctor.Image
                              ? <img src={selectedDoctor.Image} alt={selectedDoctor.Name} className="w-full h-full rounded-full object-cover" />
                              : <User className="w-5 h-5 text-primary" />}
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="text-xs text-text-light">{t('common.doctor')}</p>
                            <p className="font-medium">{selectedDoctor.Name}</p>
                          </div>
                        </div>
                        {selectedDoctor.Specialist && (
                          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Stethoscope className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className={isRTL ? 'text-right' : ''}>
                              <p className="text-xs text-text-light">{t('common.specialty')}</p>
                              <p className="font-medium text-sm">{selectedDoctor.Specialist.join(', ')}</p>
                            </div>
                          </div>
                        )}
                        {bookedSlot && (
                          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className={isRTL ? 'text-right' : ''}>
                              <p className="text-xs text-text-muted">{t('patient.selectedTime')}</p>
                              <p className="font-medium text-text-heading" dir="ltr">
                                {bookedSlot.date.toLocaleDateString()} – {bookedSlot.hour > 12 ? `${bookedSlot.hour-12}:00 PM` : `${bookedSlot.hour}:00 AM`}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                          <p className="text-xs text-text-muted font-semibold mb-2">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                id: 'instapay',
                                label: 'InstaPay',
                                icon: FlashOn,
                                desc: isRTL ? 'تحويل فوري عبر التطبيق' : 'Instant app transfer',
                                accent: 'from-amber-500/20 to-orange-500/10',
                                iconBg: 'bg-amber-500/15',
                                iconColor: 'text-amber-400',
                              },
                              {
                                id: 'cash_wallet',
                                label: isRTL ? 'كاش وولت' : 'Cash Wallet',
                                icon: AccountBalanceWallet,
                                desc: isRTL ? 'محفظة نقدية رقمية' : 'Digital cash wallet',
                                accent: 'from-emerald-500/20 to-teal-500/10',
                                iconBg: 'bg-emerald-500/15',
                                iconColor: 'text-emerald-400',
                              },
                            ].map((p) => (
                              (() => {
                                const Icon = p.icon;
                                const isSelected = selectedPaymentProvider === p.id;
                                return (
                              <button
                                key={p.id}
                                onClick={() => handlePaymentProviderSelect(p.id)}
                                className={`relative overflow-hidden flex flex-col items-start gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left ${isRTL ? 'text-right' : ''} ${
                                  isSelected
                                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 ring-1 ring-primary/30'
                                    : 'border-border bg-background-paper hover:border-primary/40 hover:bg-primary/5'
                                }`}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-70`} />
                                <div className={`relative w-full flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-9 h-9 rounded-lg ${p.iconBg} flex items-center justify-center`}> 
                                    <Icon className={`w-5 h-5 ${p.iconColor}`} />
                                  </div>
                                  {isSelected ? (
                                    <SelectedIcon className="w-5 h-5 text-primary" />
                                  ) : (
                                    <RadioButtonUnchecked className="w-5 h-5 text-text-muted" />
                                  )}
                                </div>
                                <span className={`relative text-xs font-bold ${isSelected ? 'text-primary' : 'text-text-heading'}`}>{p.label}</span>
                                <span className="relative text-[10px] text-text-muted">{p.desc}</span>
                              </button>
                                );
                              })()
                            ))}
                          </div>
                        </div>

                        <div className={`space-y-1 ${isRTL ? 'text-right' : ''}`}>
                          <p className="text-xs text-text-muted">{isRTL ? 'قيمة الجلسة' : 'Session Fee'}</p>
                          <p className="font-semibold text-text-heading">
                            {selectedDoctor?.ConsultationFee ? `${selectedDoctor.ConsultationFee} EGP` : (isRTL ? 'غير محدد' : 'Not specified')}
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-6" disabled={!bookedSlot} onClick={handleConfirmBookingClick}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {t('patient.confirmAppointment')}
                      </Button>
                    </Card>
                  </div>
                </div>

                {/* ── Payment Instructions Modal ── */}
                <Modal
                  isOpen={isPaymentModalOpen}
                  onClose={() => setIsPaymentModalOpen(false)}
                  title={isRTL ? 'تفاصيل الدفع' : 'Payment Details'}
                  size="md"
                >
                  <div className="space-y-5">
                    {/* Provider badge */}
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
                      selectedPaymentProvider === 'instapay'
                        ? 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-700'
                        : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
                    }`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selectedPaymentProvider === 'instapay' ? 'bg-violet-500/15' : 'bg-emerald-500/15'}`}>
                        {selectedPaymentProvider === 'instapay'
                          ? <FlashOn className="w-6 h-6 text-violet-500" />
                          : <AccountBalanceWallet className="w-6 h-6 text-emerald-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-text-heading text-base">
                          {selectedPaymentProvider === 'instapay' ? 'InstaPay' : (isRTL ? 'كاش وولت' : 'Cash Wallet')}
                        </p>
                        <p className="text-xs text-text-muted">
                          {isRTL ? 'يرجى اتباع التعليمات بدقة' : 'Please follow the instructions carefully'}
                        </p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-background-subtle rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-text-heading">{isRTL ? 'تعليمات التحويل' : 'Transfer Instructions'}</p>
                      <div className="space-y-2 text-sm text-text-muted">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                          <p>{isRTL ? `قم بتحويل المبلغ المطلوب عبر ${selectedPaymentProvider === 'instapay' ? 'InstaPay' : 'كاش وولت'}` : `Transfer the required amount via ${selectedPaymentProvider === 'instapay' ? 'InstaPay' : 'Cash Wallet'}`}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                          <div>
                            <p className="text-text-heading font-semibold">{isRTL ? 'إلى الحساب:' : 'To account:'}</p>
                            <p className="font-mono text-primary text-base font-bold mt-0.5">01XXXXXXXXXX</p>
                            <p className="text-xs text-text-muted mt-0.5">{isRTL ? 'اسم الحساب: نفس للصحة النفسية' : 'Account name: Nafs Mental Health'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                          <p>{isRTL ? 'المبلغ المطلوب:' : 'Amount:'} <span className="font-bold text-text-heading">{selectedDoctor?.ConsultationFee ? `${selectedDoctor.ConsultationFee} EGP` : '—'}</span></p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                          <p>{isRTL ? 'التقط سكرين شوت وارفعه أدناه' : 'Take a screenshot and upload it below'}</p>
                        </div>
                      </div>
                    </div>

                    {/* InstaPay-only: Reference Number */}
                    {selectedPaymentProvider === 'instapay' && (
                      <div>
                        <label className="text-sm font-semibold text-text-heading block mb-1.5">
                          <ReceiptLong className="w-4 h-4 inline-block mr-1" />
                          {isRTL ? 'رقم المرجع (Reference Number)' : 'Reference Number'}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder={isRTL ? 'أدخل رقم المرجع من الإيصال' : 'Enter reference number from receipt'}
                          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {/* Screenshot Upload */}
                    <div>
                      <label className="text-sm font-semibold text-text-heading block mb-1.5">
                        {isRTL ? 'إرفاق سكرين شوت' : 'Attach Screenshot'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <label className={`flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        paymentScreenshot
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-primary/3'
                      }`}>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                        />
                        {paymentScreenshot ? (
                          <>
                            <CheckCircle className="w-7 h-7 text-primary" />
                            <p className="text-sm font-semibold text-primary">{paymentScreenshot.name}</p>
                            <p className="text-xs text-text-muted">{isRTL ? 'اضغط لتغيير الصورة' : 'Click to change'}</p>
                          </>
                        ) : (
                          <>
                            <UploadIcon className="w-7 h-7 text-text-muted" />
                            <p className="text-sm text-text-muted">{isRTL ? 'اضغط لرفع صورة التحويل' : 'Click to upload transfer screenshot'}</p>
                            <p className="text-xs text-text-muted">PNG, JPG, WEBP</p>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-border">
                      <Button variant="outline" className="flex-1" onClick={() => setIsPaymentModalOpen(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={handlePaymentSubmit}
                        disabled={loading || !paymentScreenshot || (selectedPaymentProvider === 'instapay' && !referenceNumber.trim())}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isRTL ? 'دفع وإرسال الإثبات' : 'Pay & Submit Proof'}
                      </Button>
                    </div>
                  </div>
                </Modal>

                {/* ── Reviews Section ── */}
                <div className="space-y-5">
                  <h3 className={`text-xl font-bold text-text-heading flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Star className="w-6 h-6 text-amber-400" />
                    {isRTL ? 'تقييمات الدكتور' : 'Doctor Reviews'}
                  </h3>

                  {/* Add Review */}
                  <Card className="p-5">
                    <h4 className={`font-semibold text-text-heading mb-3 ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'أضف تقييمك' : 'Add Your Review'}
                    </h4>
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setNewReview(r => ({...r, rating: s}))} className="transition-transform hover:scale-110">
                          <Star className={`w-7 h-7 ${s <= newReview.rating ? 'text-amber-400' : 'text-border'}`} />
                        </button>
                      ))}
                      <span className="text-sm text-text-muted ms-2">{newReview.rating}/5</span>
                    </div>
                    <textarea
                      value={newReview.comment}
                      onChange={e => setNewReview(r => ({...r, comment: e.target.value}))}
                      placeholder={isRTL ? 'اكتب تجربتك مع الطبيب...' : 'Share your experience with this doctor...'}
                      rows={3}
                      className={`w-full p-3 border border-border rounded-xl bg-background text-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isRTL ? 'text-right' : ''}`}
                    />
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mt-3`}>
                      <Button
                        size="sm"
                        disabled={!newReview.comment.trim() || newReview.rating === 0 || submittingReview}
                        onClick={async () => {
                          if (!newReview.comment.trim() || newReview.rating === 0) return;
                          setSubmittingReview(true);
                          
                          try {
                            const response = await patientAPI.addDoctorReview({
                              DoctorId: selectedDoctor.Id,
                              Rate: newReview.rating,
                              Comment: newReview.comment,
                            });
                            
                            if (response?.IsSuccess !== false) {
                              toast.success(isRTL ? 'تمت إضافة التقييم بنجاح' : 'Review added successfully');
                              
                              // Optimistically update UI
                              setReviews(prev => [{
                                Id: Date.now(),
                                ProfileImage: currentUser?.Image || null,
                                Rate: newReview.rating,
                                Comment: newReview.comment,
                                CreatedAt: new Date().toISOString(),
                              }, ...prev]);
                            } else {
                              toast.error(response?.Message || (isRTL ? 'حدث خطأ أثناء الإضافة' : 'Failed to add review'));
                            }
                          } catch (error) {
                            console.error("Error adding review:", error);
                            toast.error(error.response?.data?.Message || (isRTL ? 'حدث خطأ أثناء الإضافة' : 'Failed to add review'));
                          } finally {
                            setNewReview({ rating: 0, comment: '' });
                            setSubmittingReview(false);
                          }
                        }}
                        className="gap-2"
                      >
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isRTL ? 'إرسال' : 'Submit'}
                      </Button>
                    </div>
                  </Card>

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((r, i) => (
                        <Card key={r.Id || i} className="p-5">
                          <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {r.ProfileImage ? (
                                  <img src={r.ProfileImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div className={isRTL ? 'text-right' : ''}>
                                <p className="font-semibold text-text-heading text-sm">{isRTL ? 'مريض' : 'Patient'}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.Rate ? 'text-amber-400' : 'text-border'}`} />)}
                                </div>
                              </div>
                            </div>
                            {r.CreatedAt && (
                              <span className="text-xs text-text-muted flex-shrink-0">
                                {new Date(r.CreatedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm text-text-muted mt-3 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                            {r.Comment}
                          </p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-muted bg-background-paper border rounded-xl shadow-sm">
                      <Star className="w-10 h-10 mx-auto text-amber-200 mb-2" />
                      <p>{isRTL ? 'لا توجد تقييمات حتى الآن' : 'No reviews yet'}</p>
                    </div>
                  )}
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
                  {bookingPendingReview
                    ? (isRTL ? 'تم استلام طلبك' : 'Request Submitted')
                    : t('patient.bookingConfirmedTitle')}
                </h2>
                <p className="text-text-muted mb-8">
                  {bookingPendingReview
                    ? (isRTL
                      ? 'حجزك الآن في حالة Pending حتى يقوم فريق الدعم الفني بمراجعة إثبات التحويل.'
                      : 'Your booking is currently pending until technical support reviews your transfer proof.')
                    : t('patient.bookingConfirmedDesc')}
                </p>
                <Button className="w-full" onClick={() => {
                  setStep(1);
                  setSelectedDoctor(null);
                  setBookedSlot(null);
                  setBookingPendingReview(false);
                  setSearchParams({});
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

                            {!booking.PaymentConfirmed && booking.Status !== 4 && booking.Status !== 5 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePayNowFromStatus(booking.Id)}
                                disabled={paymentLoading}
                              >
                                {isRTL ? 'ادفع الآن' : 'Pay Now'}
                              </Button>
                            )}

                            {!booking.PaymentConfirmed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => checkBookingPaymentStatus(booking.Id)}
                                disabled={paymentLoading}
                              >
                                {isRTL ? 'تحقق من الدفع' : 'Check Payment'}
                              </Button>
                            )}

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
