import { useMemo, useState, useEffect, useCallback } from "react";
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
import { Search, Stethoscope, Calendar, Clock, ChevronRight, User, ArrowLeft, CheckCircle, XCircle, ChevronLeft, Loader2, Eye, List as ViewList, LayoutGrid as GridView, Star, Send, ThumbsUp as ThumbUp, Badge as BadgeIcon, Zap as FlashOn, Wallet as AccountBalanceWallet, Upload as UploadIcon, Receipt as ReceiptLong, Filter, SlidersHorizontal, X, Video } from "lucide-react";
import DoctorFilterPanel from "../../components/patient/DoctorFilterPanel";

import { useAuth } from "../../contexts/AuthContext";
import { patientAPI, paymentAPI, filesAPI, meetingAPI, extractErrorMessage } from "../../lib/api";
import { getPaymentStatusMeta } from "../../lib/paymentStatus";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSignalR } from "../../hooks/useSignalR";
import DoctorDocumentsViewer from "../../components/patient/DoctorDocumentsViewer";
import Modal from "../../components/ui/Modal";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getDoctorSpecialtyTheme } from "../../lib/doctorSpecialtyTheme";
import { getAppointmentStatusMeta } from "../../lib/appointmentStatus";
import {
  SESSION_DURATION_MINUTES,
  canStartPatientSession,
  findNearestAvailableFromApiSlots,
  formatDateKey as bookingFormatDateKey,
  formatNearestSlotLabel,
  getDoctorNearestSlotDate,
} from "../../lib/patientBookingSlots";

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;

export default function ReserveAppointment() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "status"
      ? "status"
      : searchParams.get("tab") === "available"
      ? "available"
      : "all";

  const [step, setStep] = useState(searchParams.get("doctorId") ? 2 : 1); // 1: Doctor List, 2: Calendar/Details, 3: Success
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlot, setBookedSlot] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [mainTab, setMainTab] = useState(initialTab); // all, available, status
  const [viewMode, setViewMode] = useState("grid"); // list or grid

  // Filter & sort state
  const [filterSpecialties, setFilterSpecialties] = useState([]);
  const [filterGender, setFilterGender] = useState(null);
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [slots, setSlots] = useState({});
  const [slotDetailsByKey, setSlotDetailsByKey] = useState({});
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 200,
    totalPages: 0,
    totalRecords: 0,
  });

  // Available doctors state (HasSlotsOnly=true)
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);

  // Patient bookings states (My Reservation Status)
  const [patientBookings, setPatientBookings] = useState([]);
  const [bookingsForSlots, setBookingsForSlots] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPagination, setBookingsPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [cancellingId, setCancellingId] = useState(null);

  // Doctor reviews state
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [slotPeriodFilter, setSlotPeriodFilter] = useState('all');
  const [slotShowAvailableOnly, setSlotShowAvailableOnly] = useState(false);

  // Documents modal state
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState("");
  const [paymentProviders, setPaymentProviders] = useState([]);
  const [paymentProvidersLoading, setPaymentProvidersLoading] = useState(false);
  const [paymentInstruction, setPaymentInstruction] = useState(null);
  const [paymentInstructionLoading, setPaymentInstructionLoading] =
    useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [
    pendingManualPaymentBookingId,
    setPendingManualPaymentBookingId,
  ] = useState(null);
  const [bookingPendingReview, setBookingPendingReview] = useState(false);
  const [startingMeetingId, setStartingMeetingId] = useState(null);

  const getNumericFee = (doctor) => {
    const rawFee =
      doctor?.SessionPrice ??
      doctor?.ConsultationFee ??
      doctor?.Price ??
      doctor?.price ??
      0;
    const parsed = Number(rawFee);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const getDoctorRating = (doctor) => {
    const parsed = Number(doctor?.Rate ?? doctor?.Rating ?? doctor?.rating);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const getDoctorExperience = (doctor) => {
    const parsed = Number(
      doctor?.YearsOfExperience ?? doctor?.ExperienceYears ?? doctor?.yearsOfExperience,
    );
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };

  const getDoctorReviewCount = (doctor) => {
    const parsed = Number(
      doctor?.ReviewsCount ?? doctor?.ReviewCount ?? doctor?.RatingsCount ?? doctor?.NumberOfReviews,
    );
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const getDoctorSessionTypes = (doctor) => {
    const configured = doctor?.SessionTypes ?? doctor?.ConsultationTypes ?? doctor?.AvailableSessionTypes;
    if (Array.isArray(configured) && configured.length > 0) return configured.map(String);
    return [
      t("patient.videoConsultation", "Video"),
      t("patient.audioConsultation", "Audio"),
      t("patient.writtenConsultation", "Chat"),
    ];
  };

  const getNextAvailableSlot = (doctor) => getDoctorNearestSlotDate(doctor);

  const formatNearestAvailability = (doctor) =>
    formatNearestSlotLabel(getDoctorNearestSlotDate(doctor), { t, language });

  const fetchNearestSlotForDoctor = async (doctorId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    const response = await patientAPI.getDoctorSlots(
      String(doctorId),
      bookingFormatDateKey(today),
      bookingFormatDateKey(end),
    );
    if (response?.IsSuccess) {
      return findNearestAvailableFromApiSlots(response.Data);
    }
    return null;
  };

  const getTransferFeeAmount = (baseFee, provider) => {
    if (!baseFee || baseFee <= 0) return 0;
    const providerName = String(provider?.Name || "").toLowerCase();
    const providerId = Number(provider?.ID);
    const isInstaPay = providerName.includes("insta") || providerId === 2;
    const ratio = isInstaPay ? 0.015 : 0.02;
    const minimum = isInstaPay ? 5 : 7;
    return Math.max(minimum, Math.round(baseFee * ratio));
  };

  const formatCurrency = (amount) =>
    `${Number(amount || 0).toLocaleString(t("auto.enus"))} EGP`;

  const getProviderUiMeta = (provider) => {
    if (!provider) {
      return {
        icon: AccountBalanceWallet,
        label: t("auto.notSelected"),
        desc: t("auto.selectPaymentProvider"),
        accent: "from-slate-100 to-slate-50",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        requireReference: false,
      };
    }

    const name = String(provider?.Name || "").toLowerCase();
    const id = Number(provider?.ID);
    const isInsta = name.includes("insta") || id === 2;
    if (isInsta) {
      return {
        icon: FlashOn,
        label: provider?.Name || (t("auto.instapay")),
        desc: t("auto.instantTransfer"),
        accent: "from-amber-100 to-orange-50",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-700",
        requireReference: true,
      };
    }

    return {
      icon: AccountBalanceWallet,
      label: provider?.Name || (t("auto.digitalWallet")),
      desc: t("auto.manualTransfer"),
      accent: "from-emerald-100 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      requireReference: false,
    };
  };

  const enrichDoctorsWithDetails = async (items = []) => {
    const enriched = [];
    const batchSize = 10;

    for (let index = 0; index < items.length; index += batchSize) {
      const batch = items.slice(index, index + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (doctor) => {
        let merged = doctor;
        const alreadyHasPrice = getNumericFee(doctor) > 0;
        const alreadyHasDetails =
          alreadyHasPrice &&
          (getDoctorExperience(doctor) !== null || doctor.Gender !== undefined);

        if (!alreadyHasDetails) {
          try {
            const response = await patientAPI.getDoctorById(String(doctor.Id));
            const details = response?.Data;
            if (details) {
              merged = {
                ...doctor,
                ...(details?.Items?.[0] || details),
                NextAvailableSlot: doctor.NextAvailableSlot,
              };
            }
          } catch {
            merged = doctor;
          }
        }

        if (!merged._nearestSlotAt) {
          try {
            const nearest = await fetchNearestSlotForDoctor(merged.Id);
            if (nearest) {
              const iso = nearest.toISOString();
              merged = {
                ...merged,
                NextAvailableSlot: iso,
                _nearestSlotAt: iso,
              };
            }
          } catch {
            // Keep list usable if slot lookup fails for one doctor.
          }
        }

        return merged;
        }),
      );
      enriched.push(...batchResults);
    }

    return enriched;
  };

  // Fetch Doctors (all, large page to support client-side filtering)
  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const response = await patientAPI.getAllDoctors(page, 200);
      if (response.IsSuccess) {
        const items = response.Data.Items || [];
        setDoctors(items);
        enrichDoctorsWithDetails(items).then(setDoctors);
        setPagination({
          pageIndex: response.Data.PageIndex,
          pageSize: response.Data.PageSize,
          totalPages: response.Data.Pages,
          totalRecords: response.Data.Records,
        });
      } else {
        toast.error(response.Message || t("errors.loadDoctorsFailed"));
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Available Doctors (HasSlotsOnly=true)
  const fetchAvailableDoctors = useCallback(async () => {
    setAvailableLoading(true);
    try {
      const response = await patientAPI.getAllDoctors(1, 200, true);
      if (response.IsSuccess) {
        const items = response.Data.Items || [];
        setAvailableDoctors(items);
        enrichDoctorsWithDetails(items).then(setAvailableDoctors);
      } else {
        toast.error(response.Message || t("errors.loadDoctorsFailed"));
      }
    } catch (error) {
      console.error("Error fetching available doctors:", error);
      toast.error(t("errors.networkError"));
    } finally {
      setAvailableLoading(false);
    }
  }, [t]);

  // Fetch Patient Bookings for status tab
  const fetchPatientBookings = async (page = 1) => {
    setBookingsLoading(true);
    try {
      const response = await patientAPI.getPatientBookings(
        page,
        bookingsPagination.pageSize,
      );
      if (response.IsSuccess && response.Data) {
        setPatientBookings(response.Data.Items || []);
        setBookingsPagination({
          pageIndex: response.Data.PageIndex || page,
          pageSize: response.Data.PageSize || 10,
          totalPages: response.Data.Pages || 1,
        });
      } else {
        toast.error(response?.Message || t("errors.loadBookingsFailed"));
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(t("errors.loadBookingsFailed"));
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchBookingsForSlots = async () => {
    try {
      const response = await patientAPI.getPatientBookings(1, 100);
      if (response?.IsSuccess && response?.Data) {
        setBookingsForSlots(response.Data.Items || []);
      }
    } catch (error) {
      console.error("Error fetching bookings for slots:", error);
    }
  };

  useEffect(() => {
    if (mainTab === "all") {
      fetchDoctors(1);
      fetchBookingsForSlots();
      const doctorIdFromUrl = searchParams.get("doctorId");
      if (doctorIdFromUrl) {
        handleSelectDoctor(doctorIdFromUrl);
      }
    } else if (mainTab === "available") {
      fetchAvailableDoctors();
      fetchBookingsForSlots();
    } else if (mainTab === "status") {
      fetchPatientBookings(1);
    }
  }, [mainTab]);

  useEffect(() => {
    if (mainTab !== "status") return undefined;
    const intervalId = setInterval(() => {
      fetchPatientBookings(bookingsPagination.pageIndex || 1);
    }, 20000);
    return () => clearInterval(intervalId);
  }, [mainTab, bookingsPagination.pageIndex]);

  useEffect(() => {
    if ((mainTab !== "all" && mainTab !== "available") || step !== 2 || !selectedDoctor)
      return undefined;
    const intervalId = setInterval(() => {
      fetchDoctorSlots(selectedDoctor.Id, selectedDate);
      fetchBookingsForSlots();
    }, 20000);
    return () => clearInterval(intervalId);
  }, [mainTab, step, selectedDoctor, selectedDate]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (mainTab === "status") {
      nextParams.set("tab", "status");
    } else if (mainTab === "available") {
      nextParams.set("tab", "available");
    } else {
      nextParams.delete("tab");
    }

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [mainTab, searchParams, setSearchParams]);

  // Re-fetch doctor slots when the user navigates to a different week
  useEffect(() => {
    if (step === 2 && selectedDoctor) {
      fetchDoctorSlots(selectedDoctor.Id, selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchPaymentProviders = async () => {
      setPaymentProvidersLoading(true);
      try {
        const response = await paymentAPI.getProviders();
        if (
          response?.IsSuccess !== false &&
          Array.isArray(response?.Data) &&
          response.Data.length > 0
        ) {
          setPaymentProviders(response.Data);
          if (
            !response.Data.some(
              (p) => Number(p.ID) === Number(selectedPaymentProvider),
            )
          ) {
            setSelectedPaymentProvider(response.Data[0].ID);
          }
        } else {
          setPaymentProviders([]);
          setSelectedPaymentProvider("");
        }
      } catch {
        setPaymentProviders([]);
        setSelectedPaymentProvider("");
      } finally {
        setPaymentProvidersLoading(false);
      }
    };

    fetchPaymentProviders();
  }, []);

  useEffect(() => {
    const fetchPaymentInstructions = async () => {
      if (
        selectedPaymentProvider === null ||
        selectedPaymentProvider === undefined ||
        selectedPaymentProvider === ""
      ) {
        setPaymentInstruction(null);
        return;
      }

      setPaymentInstructionLoading(true);
      try {
        const response = await paymentAPI.getPaymentInstructions(
          Number(selectedPaymentProvider),
        );

        if (response?.IsSuccess === false) {
          setPaymentInstruction(null);
          return;
        }

        const instructions = Array.isArray(response?.Data)
          ? response.Data
          : [];
        const matchedInstruction = instructions.find(
          (item) => Number(item?.Provider) === Number(selectedPaymentProvider),
        );

        setPaymentInstruction(matchedInstruction || instructions[0] || null);
      } catch {
        setPaymentInstruction(null);
      } finally {
        setPaymentInstructionLoading(false);
      }
    };

    fetchPaymentInstructions();
  }, [selectedPaymentProvider]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDoctors(newPage);
    }
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buildSlotKeyFromDateTime = (dateTimeValue) => {
    if (!dateTimeValue) return null;
    const d = new Date(dateTimeValue);
    if (Number.isNaN(d.getTime())) return null;
    const dateKey = formatDateKey(d);
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${dateKey}-${hour}:${minute}`;
  };

  const pickEventField = (payload, keys = []) => {
    for (const key of keys) {
      if (payload?.[key] !== undefined && payload?.[key] !== null) {
        return payload[key];
      }
    }
    return null;
  };

  const getEventBookingId = (payload) =>
    pickEventField(payload, ["BookingId", "bookingId", "Id", "id"]);

  const getEventDoctorId = (payload) =>
    pickEventField(payload, [
      "DoctorId",
      "doctorId",
      "ProviderId",
      "providerId",
    ]);

  const getEventSlotKey = (payload) => {
    const slotKey = pickEventField(payload, ["SlotKey", "slotKey"]);
    if (slotKey) return String(slotKey);

    const dateTimeValue = pickEventField(payload, [
      "SessionStartTime",
      "sessionStartTime",
      "StartDateTime",
      "startDateTime",
      "SlotStart",
      "slotStart",
      "Date",
      "date",
      "StartTimeIso",
      "startTimeIso",
    ]);

    const fromDateTime = buildSlotKeyFromDateTime(dateTimeValue);
    if (fromDateTime) return fromDateTime;

    const rawDate = pickEventField(payload, ["SpecificDate", "specificDate"]);
    const rawStartTime = pickEventField(payload, ["StartTime", "startTime"]);
    if (!rawDate || !rawStartTime) return null;

    const datePart = String(rawDate).split("T")[0];
    const timePart = String(rawStartTime).slice(0, 5);
    if (!datePart || !timePart.includes(":")) return null;

    return `${datePart}-${timePart}`;
  };

  const applyPaymentStatusUpdate = (payload) => {
    const bookingId = getEventBookingId(payload);
    if (!bookingId) return;

    const eventPaymentStatus = pickEventField(payload, [
      "PaymentStatus",
      "paymentStatus",
      "Status",
      "status",
    ]);

    const normalizedStatus =
      eventPaymentStatus !== null && eventPaymentStatus !== undefined
        ? Number(eventPaymentStatus)
        : null;

    const nextPaymentConfirmed =
      normalizedStatus === 2 ||
      String(eventPaymentStatus || "")
        .toLowerCase()
        .includes("confirm") ||
      String(eventPaymentStatus || "")
        .toLowerCase()
        .includes("complete");

    setPatientBookings((prev) =>
      prev.map((booking) =>
        String(booking?.Id) === String(bookingId)
          ? {
              ...booking,
              ...(normalizedStatus !== null && Number.isFinite(normalizedStatus)
                ? { PaymentStatus: normalizedStatus }
                : {}),
              ...(nextPaymentConfirmed ? { PaymentConfirmed: true } : {}),
            }
          : booking,
      ),
    );
  };

  const handleSlotCancelledRealtime = (payload) => {
    if (!selectedDoctor) return;

    const payloadDoctorId = getEventDoctorId(payload);
    if (
      payloadDoctorId !== null &&
      payloadDoctorId !== undefined &&
      String(payloadDoctorId) !== String(selectedDoctor?.Id)
    ) {
      return;
    }

    const targetSlotKey = getEventSlotKey(payload);
    if (targetSlotKey) {
      setSlots((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, targetSlotKey)) {
          return prev;
        }
        const next = { ...prev };
        delete next[targetSlotKey];
        return next;
      });

      setSlotDetailsByKey((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, targetSlotKey)) {
          return prev;
        }
        const next = { ...prev };
        delete next[targetSlotKey];
        return next;
      });

      if (bookedSlot) {
        const selectedSlotKey = `${formatDateKey(bookedSlot.date)}-${
          bookedSlot.timeKey
        }`;
        if (selectedSlotKey === targetSlotKey) {
          setBookedSlot(null);
          toast.error(
            t("auto.theSelectedSlotWasCancelledByTheDoctorPleaseChooseAnotherSlot"),
          );
        }
      }
    }

    fetchDoctorSlots(selectedDoctor.Id, selectedDate);
    fetchBookingsForSlots();
  };

  const getBookingStatusMeta = (statusValue) => {
    const statusMeta = getAppointmentStatusMeta(statusValue, {
      t,
      isRTL,
    });

    const classNameByKey = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-blue-50 text-blue-700 border-blue-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      noShow: "bg-slate-100 text-slate-700 border-slate-300",
      unknown: "bg-primary/15 text-primary border-primary/35",
    };

    return {
      label: statusMeta.label,
      className: classNameByKey[statusMeta.key] || classNameByKey.unknown,
    };
  };

  // Get date range: always today → today+30 days
  const getWeekRange = (baseDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = today;
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
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
        formatDateKey(end),
      );

      console.log("Doctor Slots API response:", response);

      const mappedSlots = {};
      const mappedSlotDetails = {};

      if (response.IsSuccess && response.Data) {
        // API returns { DoctorId, DoctorName, Slots: [...] }
        const slotsData =
          response.Data.Slots ||
          response.Data.Items ||
          (Array.isArray(response.Data) ? response.Data : []);

        console.log("Slots data parsed:", slotsData);

        slotsData.forEach((slot) => {
          // Handle various field names for the time
          const slotTime =
            slot.StartTime ||
            slot.Date ||
            slot.Start ||
            slot.SessionStartTime ||
            slot.SlotStart;
          if (slotTime) {
            const slotDate = new Date(slotTime);
            const dateKey = formatDateKey(slotDate);
            const hour = String(slotDate.getHours()).padStart(2, "0");
            const minute = String(slotDate.getMinutes()).padStart(2, "0");
            const key = `${dateKey}-${hour}:${minute}`;

            const rawDuration = Number(
              slot.DurationMinute ?? slot.DurationMinutes ?? slot.Duration,
            );
            const durationMinutes =
              Number.isFinite(rawDuration) && rawDuration > 0
                ? rawDuration
                : SESSION_DURATION_MINUTES;

            const slotEndTime =
              slot.EndTime || slot.End || slot.SessionEndTime || null;
            let endTimeKey = null;
            if (slotEndTime) {
              const endDate = new Date(slotEndTime);
              if (!Number.isNaN(endDate.getTime())) {
                const endHour = String(endDate.getHours()).padStart(2, "0");
                const endMinute = String(endDate.getMinutes()).padStart(2, "0");
                endTimeKey = `${endHour}:${endMinute}`;
              }
            } else if (durationMinutes) {
              const computedEnd = new Date(slotDate);
              computedEnd.setMinutes(
                computedEnd.getMinutes() + durationMinutes,
              );
              const endHour = String(computedEnd.getHours()).padStart(2, "0");
              const endMinute = String(computedEnd.getMinutes()).padStart(
                2,
                "0",
              );
              endTimeKey = `${endHour}:${endMinute}`;
            }

            mappedSlotDetails[key] = {
              durationMinutes,
              endTimeKey,
            };

            // Respect backend reserved state; IsReserved is used in swagger SlotDto.
            const isReserved = Boolean(
              slot.IsReserved ?? slot.IsBooked ?? slot.Booked,
            );
            if (isReserved) {
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
      if (
        Object.keys(mappedSlots).length === 0 &&
        selectedDoctor?.DoctoreSchualings
      ) {
        const apiSchedules = selectedDoctor.DoctoreSchualings || [];
        apiSchedules.forEach((schedule) => {
          if (schedule.Aviable && schedule.Date) {
            const scheduleDate = new Date(schedule.Date);
            const dateKey = formatDateKey(scheduleDate);
            const hour = String(scheduleDate.getHours()).padStart(2, "0");
            const minute = String(scheduleDate.getMinutes()).padStart(2, "0");
            const key = `${dateKey}-${hour}:${minute}`;
            mappedSlots[key] = "available";
          }
        });
      }

      setSlots(mappedSlots);
      setSlotDetailsByKey(mappedSlotDetails);
    } catch (error) {
      console.error("Error fetching doctor slots:", error);
      // Fallback to DoctoreSchualings if the slots API fails
      if (selectedDoctor?.DoctoreSchualings) {
        const mappedSlots = {};
        selectedDoctor.DoctoreSchualings.forEach((schedule) => {
          if (schedule.Aviable && schedule.Date) {
            const scheduleDate = new Date(schedule.Date);
            const dateKey = formatDateKey(scheduleDate);
            const hour = String(scheduleDate.getHours()).padStart(2, "0");
            const minute = String(scheduleDate.getMinutes()).padStart(2, "0");
            const key = `${dateKey}-${hour}:${minute}`;
            mappedSlots[key] = "available";
          }
        });
        setSlots(mappedSlots);
        setSlotDetailsByKey({});
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
        const doctorData =
          response.Data?.Items && response.Data.Items.length > 0
            ? response.Data.Items[0]
            : response.Data && !response.Data.Items
            ? response.Data
            : null;

        if (doctorData) {
          setSelectedDoctor(doctorData);
          setReviews(doctorData.Reviews || []);
          setSearchParams({ doctorId: doctorId }); // Save to URL

          // Fetch available slots from dedicated API
          await fetchDoctorSlots(doctorId, selectedDate);

          setStep(2);
        } else {
          toast.error(t("errors.doctorNotFound"));
          setStep(1);
          setSearchParams({});
        }
      } else {
        toast.error(response.Message || t("errors.loadDoctorsFailed"));
        setStep(1);
        setSearchParams({});
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
      toast.error(t("errors.loadDoctorsFailed"));
      setStep(1);
      setSearchParams({});
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (bookingId) => {
    const targetBooking = patientBookings.find(
      (booking) => String(booking?.Id) === String(bookingId),
    );
    const sessionStart = targetBooking?.SessionStartTime
      ? new Date(targetBooking.SessionStartTime)
      : null;

    if (
      sessionStart &&
      !Number.isNaN(sessionStart.getTime()) &&
      sessionStart.getTime() - Date.now() < TWO_DAYS_IN_MS
    ) {
      toast.error(
        t("auto.cancellationIsAllowedOnlyAtLeast48HoursBeforeTheAppointment"),
      );
      return;
    }

    setCancellingId(bookingId);
    try {
      const response = await patientAPI.cancelBooking(
        bookingId,
        "Cancelled by patient",
      );
      if (response?.IsSuccess !== false) {
        toast.success(t("success.appointmentCancelled"));
        // Refresh bookings
        fetchPatientBookings(bookingsPagination.pageIndex);
        fetchBookingsForSlots();
      } else {
        toast.error(response?.Message || t("errors.cancelFailed"));
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || t("errors.cancelFailed"));
    } finally {
      setCancellingId(null);
    }
  };

  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const cancelConfirmBooking = useMemo(
    () =>
      patientBookings.find(
        (booking) => String(booking?.Id) === String(cancelConfirmId),
      ) || null,
    [patientBookings, cancelConfirmId],
  );

  const cancelConfirmPaymentStatus = cancelConfirmBooking
    ? getPaymentStatusMeta(
        cancelConfirmBooking?.PaymentStatus ??
          cancelConfirmBooking?.paymentStatus ??
          (cancelConfirmBooking?.PaymentConfirmed ? 2 : 1),
        { isRTL },
      )
    : null;

  const cancelWillRefund =
    Number(cancelConfirmPaymentStatus?.value) === 2 ||
    cancelConfirmBooking?.PaymentConfirmed === true;

  const confirmCancelReservation = (bookingId) => {
    setCancelConfirmId(bookingId);
  };

  const handleConfirmCancel = () => {
    if (cancelConfirmId) {
      handleCancelReservation(cancelConfirmId);
      setCancelConfirmId(null);
    }
  };

  const submitManualPaymentForBooking = async (bookingId) => {
    if (!bookingId) return false;
    const hasSelectedProvider =
      selectedPaymentProvider !== null &&
      selectedPaymentProvider !== undefined &&
      selectedPaymentProvider !== "";

    if (!hasSelectedProvider) {
      toast.error(
        t("auto.pleaseChooseAPaymentProviderFirst"),
      );
      return false;
    }

    if (!paymentScreenshot) {
      toast.error(
        t("auto.pleaseAttachATransferScreenshot"),
      );
      return false;
    }

    setPaymentLoading(true);
    try {
      const uploadResponse = await filesAPI.uploadFile(paymentScreenshot);
      const screenshotUrl = uploadResponse?.Data?.PublicUrl;

      if (!screenshotUrl) {
        toast.error(
          t("auto.failedToUploadTransferScreenshot"),
        );
        return false;
      }

      const response = await paymentAPI.submitManualPayment({
        BookingId: bookingId,
        ScreenshotUrl: screenshotUrl,
        ReferenceNumber: referenceNumber.trim() || null,
        PaymentMethod: Number(selectedPaymentProvider),
      });

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.unexpectedError"));
        return false;
      }

      toast.success(
        t("auto.paymentProofSubmittedBookingWillStayPendingUntilTechnicalSupportReviewsIt"),
      );
      fetchPatientBookings(bookingsPagination.pageIndex);
      fetchBookingsForSlots();
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.Message ||
          (t("auto.failedToSubmitPaymentProof")),
      );
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmBookingClick = () => {
    if (!bookedSlot) return;
    setPendingManualPaymentBookingId(null);
    setPaymentScreenshot(null);
    setReferenceNumber("");
    setIsPaymentModalOpen(true);
  };

  const handlePaymentProviderSelect = (providerId) => {
    setSelectedPaymentProvider(providerId);
  };

  const handlePaymentSubmit = async () => {
    if (
      selectedPaymentProvider === null ||
      selectedPaymentProvider === undefined ||
      selectedPaymentProvider === ""
    ) {
      toast.error(
        t("auto.pleaseChooseAPaymentProviderFirst"),
      );
      return;
    }

    if (!paymentScreenshot) {
      toast.error(
        t("auto.pleaseAttachATransferScreenshot"),
      );
      return;
    }

    if (pendingManualPaymentBookingId) {
      setIsPaymentModalOpen(false);
      await submitManualPaymentForBooking(pendingManualPaymentBookingId);
      setPendingManualPaymentBookingId(null);
      return;
    }

    setIsPaymentModalOpen(false);
    await confirmBooking();
  };

  useSignalR({
    enabled: Boolean(currentUser),
    disconnectOnUnmount: true,
    handlers: {
      PaymentStatusUpdated: applyPaymentStatusUpdate,
      BookingPaymentStatusUpdated: applyPaymentStatusUpdate,
      ManualPaymentStatusUpdated: applyPaymentStatusUpdate,
      SlotDeleted: handleSlotCancelledRealtime,
      SlotCancelled: handleSlotCancelledRealtime,
      AvailabilityDeleted: handleSlotCancelledRealtime,
      DoctorSlotDeleted: handleSlotCancelledRealtime,
    },
    onConnectionError: () => {
      // Polling effects keep data synced if real-time channel fails.
    },
  });

  const resolveStatusInfo = (booking) => {
    return getAppointmentStatusMeta(booking?.Status, {
      t,
      isRTL,
      booking,
    });
  };

  const resolvePaymentStatusInfo = (booking) => {
    const rawPaymentStatus = booking?.PaymentStatus ?? booking?.paymentStatus;

    if (
      rawPaymentStatus !== undefined &&
      rawPaymentStatus !== null &&
      String(rawPaymentStatus) !== ""
    ) {
      return getPaymentStatusMeta(rawPaymentStatus, { isRTL });
    }

    // Backward compatibility if API still returns PaymentConfirmed without PaymentStatus
    if (booking?.PaymentConfirmed === true) {
      return getPaymentStatusMeta(2, { isRTL });
    }

    return getPaymentStatusMeta(1, { isRTL });
  };

  const handleSlotClick = (date, timeKey) => {
    // Consistent date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const key = `${dateKey}-${timeKey}`;
    console.log("Slot clicked:", key, "status:", slots[key]);

    // Allow booking if slot is available
    if (slots[key] === "available") {
      setBookedSlot({ date, timeKey });
      console.log("Booked slot set:", { date: dateKey, timeKey });
    }
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !bookedSlot) return;

    setLoading(true);
    try {
      // Construct booking request
      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        // Format: YYYY-MM-DDTHH:mm:ss (ISO 8601 without Z if backend expects local, or with Z if UTC)
        // Swagger says "date-time". Usually ISO.
        // Let's create a date object with the booked hour
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const bookingDate = new Date(bookedSlot.date);
      const [hour, minute] = (bookedSlot.timeKey || "00:00")
        .split(":")
        .map(Number);
      bookingDate.setHours(Number.isFinite(hour) ? hour : 0);
      bookingDate.setMinutes(Number.isFinite(minute) ? minute : 0);
      bookingDate.setSeconds(0);

      const bookingRequest = {
        DoctorId: selectedDoctor.Id,
        SessionStartTime: formatDate(bookingDate),
        DurationMinutes: SESSION_DURATION_MINUTES,
        PatientNotes: "Booked via Web App",
      };

      // Re-check availability right before booking to avoid race conditions with slot cancellations.
      try {
        const { start, end } = getWeekRange(bookingDate);
        const latestSlotsResponse = await patientAPI.getDoctorSlots(
          String(selectedDoctor.Id),
          formatDateKey(start),
          formatDateKey(end),
        );

        const latestSlotsData =
          latestSlotsResponse?.Data?.Slots ||
          latestSlotsResponse?.Data?.Items ||
          (Array.isArray(latestSlotsResponse?.Data)
            ? latestSlotsResponse.Data
            : []);

        const targetSlotKey = buildSlotKeyFromDateTime(bookingDate);
        const isStillAvailable = latestSlotsData.some((slot) => {
          const slotTime =
            slot.StartTime ||
            slot.Date ||
            slot.Start ||
            slot.SessionStartTime ||
            slot.SlotStart;
          const slotKey = buildSlotKeyFromDateTime(slotTime);
          if (!slotKey || slotKey !== targetSlotKey) return false;
          const isReserved = Boolean(
            slot.IsReserved ?? slot.IsBooked ?? slot.Booked,
          );
          return !isReserved;
        });

        if (!isStillAvailable) {
          setBookedSlot(null);
          fetchDoctorSlots(selectedDoctor.Id, selectedDate);
          fetchBookingsForSlots();
          toast.error(
            t("auto.thisSlotIsNoLongerAvailablePleaseChooseAnotherSlot"),
          );
          return;
        }
      } catch {
        // Continue to backend booking validation when pre-check fails.
      }

      const response = await patientAPI.createBooking(bookingRequest);
      if (response.IsSuccess) {
        const bookingId = response?.Data?.BookingId;
        if (bookingId) {
          const submitted = await submitManualPaymentForBooking(bookingId);
          if (!submitted) {
            return;
          }
        }

        setBookingPendingReview(true);
        setStep(3);
        toast.success(
          t("auto.bookingAndPaymentRequestSubmittedSuccessfullyAndIsNowPendingReview"),
        );
      } else {
        toast.error(response.Message || t("errors.bookingFailed"));
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMsg =
        error.response?.data?.Message || t("errors.bookingFailed");
      if (
        String(errorMsg).toLowerCase().includes("not available") ||
        String(errorMsg).toLowerCase().includes("cancel")
      ) {
        setBookedSlot(null);
        fetchDoctorSlots(selectedDoctor.Id, selectedDate);
        fetchBookingsForSlots();
        toast.error(
          t("auto.thisSlotIsNoLongerAvailablePleaseChooseAnotherSlot"),
        );
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = async (booking) => {
    const bookingId = booking?.BookingId || booking?.Id;
    if (!bookingId || startingMeetingId || !canStartPatientSession(booking)) return;

    setStartingMeetingId(bookingId);
    try {
      const response = await meetingAPI.startBookingMeeting(bookingId);
      if (response?.IsSuccess === false || response?.isSuccess === false) {
        throw new Error(response?.Message || response?.message || "Failed to start meeting");
      }
      const meeting = response?.Data ?? response?.data ?? response;
      const meetingUrl =
        meeting?.MeetingUrl ||
        meeting?.meetingUrl ||
        meeting?.RoomUrl ||
        meeting?.roomUrl ||
        meeting?.JoinUrl ||
        meeting?.joinUrl ||
        booking?.MeetingUrl ||
        "";

      navigate(`/dashboard/patient/meeting/${bookingId}`, {
        state: { session: booking, meeting, meetingUrl },
      });
    } catch (error) {
      console.error("Failed to start meeting:", error);
      toast.error(
        extractErrorMessage(
          error,
          t("patientHome.upcomingSession.meetingStartFailed", "Could not start the session."),
        ),
      );
    } finally {
      setStartingMeetingId(null);
    }
  };

  const formatHourLabel = (timeKey) => {
    const [rawHour, rawMinute] = String(timeKey || "00:00").split(":");
    const hour = Number(rawHour);
    const minute = Number(rawMinute);

    const safeHour = Number.isFinite(hour) ? hour : 0;
    const safeMinute = Number.isFinite(minute) ? minute : 0;
    const displayHour = safeHour % 12 === 0 ? 12 : safeHour % 12;
    const suffix = safeHour >= 12 ? "PM" : "AM";

    return `${displayHour}:${String(safeMinute).padStart(2, "0")} ${suffix}`;
  };

  const getWeekDates = (baseDate) => {
    const weekDates = [];
    const base = new Date(baseDate);
    base.setDate(base.getDate() - base.getDay());

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      weekDates.push(d);
    }

    return weekDates;
  };

  // Unique specialties across the current tab's doctor list
  const allSpecialties = useMemo(() => {
    const src = mainTab === "available" ? availableDoctors : doctors;
    return [...new Set(src.flatMap((d) => d.Specialist || []))].sort();
  }, [doctors, availableDoctors, mainTab]);

  // Client-side filtered + sorted doctor list
  const processedDoctors = useMemo(() => {
    let src = mainTab === "available" ? availableDoctors : doctors;

    if (mainTab === "available") {
      src = src.filter((d) => getDoctorNearestSlotDate(d));
    }

    if (doctorSearch.trim()) {
      const q = doctorSearch.toLowerCase();
      src = src.filter((d) => d.Name?.toLowerCase().includes(q));
    }

    if (filterSpecialties.length > 0) {
      src = src.filter((d) =>
        filterSpecialties.some((s) => (d.Specialist || []).includes(s)),
      );
    }

    if (filterGender !== null) {
      src = src.filter((d) => {
        const gender = Number(d.Gender ?? d.gender);
        return filterGender === 2 ? gender === 2 || gender === 0 : gender === filterGender;
      });
    }

    if (filterPriceMin !== "") {
      src = src.filter(
        (d) => getNumericFee(d) >= Number(filterPriceMin),
      );
    }
    if (filterPriceMax !== "") {
      src = src.filter(
        (d) => getNumericFee(d) <= Number(filterPriceMax),
      );
    }

    if (filterAvailability !== "all") {
      const today = new Date();
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);
      src = src.filter((d) => {
        const slot = getNextAvailableSlot(d);
        if (!slot) return false;
        if (filterAvailability === "now") {
          const diff = slot.getTime() - today.getTime();
          return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
        }
        return filterAvailability === "today"
          ? slot.toDateString() === today.toDateString()
          : slot <= weekEnd;
      });
    }

    const sorted = [...src];
    if (sortBy === "rating")
      sorted.sort((a, b) => (getDoctorRating(b) ?? -1) - (getDoctorRating(a) ?? -1));
    else if (sortBy === "priceAsc")
      sorted.sort((a, b) => getNumericFee(a) - getNumericFee(b));
    else if (sortBy === "priceDesc")
      sorted.sort((a, b) => getNumericFee(b) - getNumericFee(a));
    else if (sortBy === "availability")
      sorted.sort((a, b) => {
        const aSlot = getNextAvailableSlot(a);
        const bSlot = getNextAvailableSlot(b);
        if (!aSlot) return 1;
        if (!bSlot) return -1;
        return aSlot - bSlot;
      });

    return sorted;
  }, [
    doctors,
    availableDoctors,
    mainTab,
    doctorSearch,
    filterSpecialties,
    filterGender,
    filterPriceMin,
    filterPriceMax,
    filterAvailability,
    sortBy,
  ]);

  const hasActiveFilters =
    filterSpecialties.length > 0 ||
    filterGender !== null ||
    filterPriceMin !== "" ||
    filterPriceMax !== "" ||
    filterAvailability !== "all" ||
    sortBy !== "default";

  const clearFilters = () => {
    setFilterSpecialties([]);
    setFilterGender(null);
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterAvailability("all");
    setSortBy("default");
  };

  const availablePaymentProviders = paymentProviders;
  const activeProvider =
    availablePaymentProviders.find(
      (p) => Number(p.ID) === Number(selectedPaymentProvider),
    ) || null;
  const activeProviderMeta = getProviderUiMeta(activeProvider);
  const selectedDoctorTheme = getDoctorSpecialtyTheme(
    selectedDoctor?.Specialist || selectedDoctor?.specialty || [],
  );
  const bookingBaseFee = getNumericFee(selectedDoctor);
  const transferFee = getTransferFeeAmount(bookingBaseFee, activeProvider);
  const bookingTotalFee = bookingBaseFee + transferFee;
  const mySlotBookingsByKey = useMemo(() => {
    if (!selectedDoctor?.Id) return {};
    const map = {};
    bookingsForSlots.forEach((booking) => {
      if (String(booking?.DoctorId) !== String(selectedDoctor.Id)) return;
      const key = buildSlotKeyFromDateTime(booking?.SessionStartTime);
      if (!key) return;
      map[key] = booking;
    });
    return map;
  }, [bookingsForSlots, selectedDoctor]);

  return (
    <div
      className="max-w-6xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6"
      
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading">
            {t("patient.appointments")}
          </h1>
          <p className="text-text-muted mt-1 text-sm sm:text-base">
            {t("patient.manageBookSessions")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-2 z-20 grid w-full grid-cols-3 gap-1 overflow-x-auto rounded-2xl border border-border bg-background-paper/95 p-1.5 shadow-[0_16px_42px_-28px_rgba(15,76,58,0.45)] backdrop-blur no-scrollbar scroll-smooth mb-6 sm:mb-8">
        <button
          onClick={() => { setMainTab("all"); setStep(1); setSelectedDoctor(null); setSearchParams({}); }}
          className={`min-w-max px-3 sm:px-5 md:px-8 py-3 text-[11px] sm:text-sm md:text-base font-semibold transition-all duration-300 relative whitespace-nowrap rounded-xl ${
            mainTab === "all"
              ? "bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary/40"
              : "text-text-muted hover:text-text-heading hover:bg-background-paper"
          }`}
          aria-pressed={mainTab === "all"}
        >
          {t("patient.allDoctors", "All Therapists")}
        </button>
        <button
          onClick={() => { setMainTab("available"); setStep(1); setSelectedDoctor(null); setSearchParams({ tab: "available" }); }}
          className={`min-w-max px-3 sm:px-5 md:px-8 py-3 text-[11px] sm:text-sm md:text-base font-semibold transition-all duration-300 relative whitespace-nowrap rounded-xl ${
            mainTab === "available"
              ? "bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary/40"
              : "text-text-muted hover:text-text-heading hover:bg-background-paper"
          }`}
          aria-pressed={mainTab === "available"}
        >
          {t("patient.availableDoctors", "Available Therapists")}
        </button>
        <button
          onClick={() => { setMainTab("status"); setSearchParams({ tab: "status" }); }}
          className={`min-w-max px-3 sm:px-5 md:px-8 py-3 text-[11px] sm:text-sm md:text-base font-semibold transition-all duration-300 relative whitespace-nowrap rounded-xl ${
            mainTab === "status"
              ? "bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary/40"
              : "text-text-muted hover:text-text-heading hover:bg-background-paper"
          }`}
          aria-pressed={mainTab === "status"}
        >
          {t("patient.myReservationStatus", "My Reservation Status")}
        </button>
      </div>

      {(mainTab === "all" || mainTab === "available") ? (
        <div className="space-y-6">
          {step > 1 && step < 3 && (
            <div className={`flex ${t("auto.justifystart")}`}>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setSelectedDoctor(null);
                  setSearchParams({}); // Clear from URL
                }}
                className="gap-2 hover:bg-primary/10"
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
                {t("common.backToList")}
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
                      {t("patient.selectDoctor")}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters((v) => !v)}
                      className={`p-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border text-sm font-medium ${
                        showFilters || hasActiveFilters
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-background-subtle border-border text-text-muted hover:text-text-heading"
                      }`}
                      title={t("patient.filterDoctors", "Filters")}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      {hasActiveFilters && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </button>
                    <div className="flex items-center gap-1 bg-background-subtle p-1 rounded-lg border border-border">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                          viewMode === "list"
                            ? "bg-background-paper shadow-sm text-primary"
                            : "text-text-muted hover:text-text-heading"
                        }`}
                        title="List View"
                      >
                        <ViewList className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                          viewMode === "grid"
                            ? "bg-background-paper shadow-sm text-primary"
                            : "text-text-muted hover:text-text-heading"
                        }`}
                        title="Grid View"
                      >
                        <GridView className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <DoctorFilterPanel
                    specialties={allSpecialties}
                    filterSpecialties={filterSpecialties}
                    onSpecialtiesChange={setFilterSpecialties}
                    filterGender={filterGender}
                    onGenderChange={setFilterGender}
                    filterPriceMin={filterPriceMin}
                    filterPriceMax={filterPriceMax}
                    onPriceChange={(min, max) => { setFilterPriceMin(min); setFilterPriceMax(max); }}
                    filterAvailability={filterAvailability}
                    onAvailabilityChange={setFilterAvailability}
                    showAvailabilityFilter
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                    t={t}
                    isRTL={isRTL}
                  />
                )}

                {/* Doctors Views */}
                <div>
                  {(loading || availableLoading) ? (
                    <div className="p-12 flex justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-text-muted mb-3">
                        {processedDoctors.length} {t("patient.therapistsFound")}
                      </p>
                      {viewMode === "list" ? (
                        <div className="bg-background-paper rounded-xl border border-border overflow-hidden shadow-sm">
                          <Table>
                            <TableHeader>
                              <TableRow hover={false}>
                                <TableHead className="w-[30%]">
                                  {t("common.doctor")}
                                </TableHead>
                                <TableHead className="w-[20%]">
                                  {t("common.specialty")}
                                </TableHead>
                                <TableHead className="w-[35%]">
                                  {t("patient.bookingDetails")}
                                </TableHead>
                                <TableHead
                                  className={`w-[15%] ${
                                    "text-end"
                                  }`}
                                >
                                  {t("common.action")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {processedDoctors.length > 0 ? (
                                processedDoctors.map((doctor) => (
                                  <TableRow key={doctor.Id}>
                                    <TableCell className="py-4">
                                      {(() => {
                                        const specialtyTheme = getDoctorSpecialtyTheme(
                                          doctor.Specialist ||
                                            doctor.specialty ||
                                            [],
                                        );
                                        return (
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-sm ${specialtyTheme.avatar}`}
                                            >
                                              {doctor.Image ? (
                                                <img
                                                  src={doctor.Image}
                                                  alt={doctor.Name}
                                                  className="w-full h-full rounded-full object-cover"
                                                />
                                              ) : (
                                                <User className="w-6 h-6 text-primary" />
                                              )}
                                            </div>
                                            <div>
                                              <p className="font-bold text-text-heading text-base">
                                                {doctor.Name}
                                              </p>
                                              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                                getNextAvailableSlot(doctor)
                                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                                                  : "bg-slate-100 text-slate-500 border-slate-200"
                                              }`}>
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                {formatNearestAvailability(doctor)}
                                              </span>
                                              <p className="text-xs text-text-muted">
                                                {t("common.doctor")}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </TableCell>
                                    <TableCell className="py-4">
                                      {doctor.Specialist &&
                                      doctor.Specialist.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {doctor.Specialist.map(
                                            (spec, idx) => (
                                              <Badge
                                                key={idx}
                                                variant="outline"
                                                className={`text-xs px-2.5 py-1 ${
                                                  getDoctorSpecialtyTheme(spec)
                                                    .badge
                                                }`}
                                              >
                                                {spec}
                                              </Badge>
                                            ),
                                          )}
                                        </div>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {t("common.general")}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                      <div className="space-y-1 text-sm text-text-muted">
                                        {getDoctorExperience(doctor) !== null && (
                                          <p>{getDoctorExperience(doctor)} {t("patient.yearsExperience")}</p>
                                        )}
                                        {getDoctorRating(doctor) !== null && (
                                          <p className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            {getDoctorRating(doctor).toFixed(1)}
                                          </p>
                                        )}
                                        <p className="font-semibold text-text-heading">
                                          {getNumericFee(doctor) > 0
                                            ? formatCurrency(getNumericFee(doctor))
                                            : t("patient.priceNotAvailable")}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell
                                      className={`py-4 ${
                                        "text-end"
                                      }`}
                                    >
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                          handleSelectDoctor(doctor.Id)
                                        }
                                        disabled={!getNextAvailableSlot(doctor)}
                                        className="gap-2 transition-all"
                                      >
                                        <Calendar className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                          {getNextAvailableSlot(doctor)
                                            ? t("patient.bookAppointment")
                                            : t("patient.unavailable")}
                                        </span>
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center py-12 text-text-muted"
                                  >
                                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">
                                      {t("patient.noDoctorsFound")}
                                    </p>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {processedDoctors.length > 0 ? (
                            processedDoctors.map((doctor) => {
                              const specialtyTheme = getDoctorSpecialtyTheme(
                                doctor.Specialist || doctor.specialty || [],
                              );
                              return (
                                <Card
                                  key={doctor.Id}
                                  dir={isRTL ? "rtl" : "ltr"}
                                  className={`group overflow-hidden hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 rounded-[24px] shadow-[0_16px_42px_-28px_rgba(15,76,58,0.45)] hover:shadow-[0_24px_60px_-28px_rgba(15,76,58,0.6)] border ${specialtyTheme.surface}`}
                                >
                                  <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                                    {/* Header: Image & Name */}
                                    <div className="flex items-start gap-3 sm:gap-4 mb-3 min-h-[88px]">
                                      <div
                                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border shadow-inner ${specialtyTheme.avatar}`}
                                      >
                                        {doctor.Image ? (
                                          <img
                                            src={doctor.Image}
                                            alt={doctor.Name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <User className="w-8 h-8 text-primary" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0 flex flex-col justify-center text-start mt-1">
                                        <h3 className="font-bold text-text-heading text-base sm:text-lg truncate leading-tight mb-1">
                                          {doctor.Name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-text-muted truncate mb-1">
                                          {t("common.doctor")}
                                        </p>

                                        {getDoctorRating(doctor) !== null && (
                                          <div className="flex items-center gap-1.5 justify-start mb-1">
                                            <Star className="w-[14px] h-[14px] text-amber-400 fill-amber-400" />
                                            <span className="text-[13px] font-semibold text-text">
                                              {getDoctorRating(doctor).toFixed(1)}
                                            </span>
                                            <span className="text-[11px] text-text-muted">
                                              ({getDoctorReviewCount(doctor)} {t("patient.reviews", "reviews")})
                                            </span>
                                          </div>
                                        )}

                                      </div>
                                    </div>

                                    {/* Next available slot */}
                                    <div className={`flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                                      getNextAvailableSlot(doctor)
                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}>
                                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span className="truncate">
                                        {getNextAvailableSlot(doctor)
                                          ? `${t("patient.nextAvailableSlot")}: ${formatNearestAvailability(doctor)}`
                                          : formatNearestAvailability(doctor)}
                                      </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                      {getDoctorSessionTypes(doctor).slice(0, 3).map((type) => (
                                        <span key={type} className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary">
                                          {type}
                                        </span>
                                      ))}
                                    </div>

                                    {getDoctorExperience(doctor) !== null && (
                                      <p className="text-xs text-text-muted mt-2">
                                        {getDoctorExperience(doctor)} {t("patient.yearsExperience")}
                                      </p>
                                    )}

                                    {/* Description */}
                                    <p
                                      className="text-xs sm:text-[13px] text-text-muted leading-relaxed line-clamp-3 mb-5 mt-2 min-h-[60px] text-start"
                                      title={doctor.Description}
                                    >
                                      {doctor.Description ||
                                        t("common.noDescription")}
                                    </p>

                                    {/* Badges footer */}
                                    <div className="flex flex-wrap content-start gap-2 mt-auto pt-5 min-h-[57px] justify-start">
                                      {getNumericFee(doctor) > 0 && (
                                        <span className="text-[10px] sm:text-xs px-2.5 py-1 font-medium rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                                          {formatCurrency(getNumericFee(doctor))}
                                        </span>
                                      )}
                                      {doctor.Specialist &&
                                      doctor.Specialist.length > 0 ? (
                                        doctor.Specialist.map((spec, idx) => (
                                          <span
                                            key={idx}
                                            className={`text-[10px] sm:text-xs px-2.5 py-1 font-medium rounded-md border ${
                                              getDoctorSpecialtyTheme(spec)
                                                .badge
                                            }`}
                                          >
                                            {spec}
                                          </span>
                                        ))
                                      ) : (
                                        <span
                                          className={`text-[10px] sm:text-xs px-2.5 py-1 font-medium rounded-md border ${
                                            getDoctorSpecialtyTheme("general")
                                              .badge
                                          }`}
                                        >
                                          {t("common.general")}
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-background-paper/80 px-3 py-2.5">
                                      <span className="text-xs font-semibold text-text-muted">{t("patient.sessionPrice", "Session price")}</span>
                                      <span className="text-base font-black text-primary">
                                        {getNumericFee(doctor) > 0 ? formatCurrency(getNumericFee(doctor)) : t("patient.priceNotAvailable")}
                                      </span>
                                    </div>
                                    <Button
                                      className="w-full !mt-4 gap-2"
                                      onClick={() => handleSelectDoctor(doctor.Id)}
                                      disabled={!getNextAvailableSlot(doctor)}
                                    >
                                      <Calendar className="w-4 h-4" />
                                      {getNextAvailableSlot(doctor)
                                        ? t("patient.bookAppointment")
                                        : t("patient.unavailable")}
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })
                          ) : (
                            <div className="col-span-full py-12 text-center text-text-muted bg-background-paper rounded-xl border border-border shadow-sm">
                              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                              <p className="font-medium">
                                {t("patient.noDoctorsFound")}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pagination Controls - only show when no filters active */}
                      {!hasActiveFilters && pagination.totalPages > 1 && mainTab === "all" && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-background-subtle/30">
                          <span className="text-sm text-text-muted font-medium">
                            {t("common.page")} {pagination.pageIndex}{" "}
                            {t("common.of")} {pagination.totalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pagination.pageIndex <= 1}
                              onClick={() =>
                                handlePageChange(pagination.pageIndex - 1)
                              }
                              className="gap-1"
                            >
                              {isRTL ? (
                                <ChevronRight className="w-4 h-4" />
                              ) : (
                                <ChevronLeft className="w-4 h-4" />
                              )}
                              {t("common.previous")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                pagination.pageIndex >= pagination.totalPages
                              }
                              onClick={() =>
                                handlePageChange(pagination.pageIndex + 1)
                              }
                              className="gap-1"
                            >
                              {t("common.next")}
                              {isRTL ? (
                                <ChevronLeft className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
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
                className="mx-auto w-full max-w-5xl space-y-8"
              >
                {/* ── Doctor Overview ── */}
                <Card className="overflow-hidden border border-border/80">
                  <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary-light" />
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div
                      className={`grid grid-cols-1 lg:grid-cols-12 items-center gap-4 sm:gap-6 ${
                        "text-start"
                      }`}
                    >
                      <div
                        className={`lg:col-span-7 flex flex-col sm:flex-row items-center gap-4 ${
                          isRTL ? "sm:flex-row-reverse text-end" : ""
                        }`}
                      >
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center overflow-hidden border-2 shadow-sm mx-auto sm:mx-0 flex-shrink-0 ${selectedDoctorTheme.avatar}`}
                        >
                          {selectedDoctor.Image ? (
                            <img
                              src={selectedDoctor.Image}
                              alt={selectedDoctor.Name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-12 h-12 text-primary" />
                          )}
                        </div>

                        <div className={`flex-1 space-y-3 ${isRTL ? "text-end" : "text-start"}`}>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-text-heading leading-tight">
                              {t("auto.dr")} {selectedDoctor.Name}
                            </h2>
                            <div
                              className={`mt-2 flex items-center gap-2 ${
                                isRTL ? "flex-row-reverse justify-end" : ""
                              }`}
                            >
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-4 h-4 ${
                                      s <= 4 ? "text-amber-400" : "text-border"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-text-heading">
                                4.8
                              </span>
                              <span className="text-xs text-text-muted">
                                {t("auto.24Reviews")}
                              </span>
                            </div>
                          </div>

                          {selectedDoctor.Specialist &&
                            selectedDoctor.Specialist.length > 0 && (
                              <div
                                className={`flex flex-wrap gap-2 ${
                                  isRTL ? "justify-end" : ""
                                }`}
                              >
                                {selectedDoctor.Specialist.map((sp, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs px-3 py-1 rounded-full font-medium border ${
                                      getDoctorSpecialtyTheme(sp).badge
                                    }`}
                                  >
                                    {sp}
                                  </span>
                                ))}
                              </div>
                            )}

                          {selectedDoctor.Description && (
                            <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
                              {selectedDoctor.Description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-5 w-full space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 sm:p-4 bg-background-subtle rounded-xl border border-border/60">
                            <p className="text-xs text-text-muted mb-1">
                              {t("auto.experience")}
                            </p>
                            <p className="font-bold text-text-heading text-sm sm:text-base">
                              {selectedDoctor.YearsOfExperience || "—"}{" "}
                              {t("auto.yrs")}
                            </p>
                          </div>

                          <div className="p-3 sm:p-4 bg-background-subtle rounded-xl border border-border/60">
                            <p className="text-xs text-text-muted mb-1">
                              {t("auto.consultationFee")}
                            </p>
                            <p className="font-bold text-text-heading text-sm sm:text-base">
                              {selectedDoctor.ConsultationFee
                                ? `${selectedDoctor.ConsultationFee} EGP`
                                : t("auto.notSpecified")}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl border border-primary/20 bg-primary/5">
                          <div
                            className={`flex items-center justify-between gap-3 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`flex items-center gap-3 min-w-0 ${
                                isRTL ? "flex-row-reverse" : ""
                              }`}
                            >
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-text-heading truncate">
                                  {t(
                                    "doctor.docs.title",
                                    "Documents & Certificates",
                                  )}
                                </p>
                                <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 truncate">
                                  {t(
                                    "patient.viewDocs",
                                    "View verified certificates and licenses",
                                  )}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDocsModalOpen(true)}
                              className="flex-shrink-0"
                            >
                              {t("auto.view")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Modal */}
                <Modal
                  isOpen={isDocsModalOpen}
                  onClose={() => setIsDocsModalOpen(false)}
                  title={t("doctor.docs.title", "Documents & Certificates")}
                  size="4xl"
                >
                  <DoctorDocumentsViewer doctorId={selectedDoctor.Id} />
                </Modal>

                {/* ── Slot Picker + Summary ── */}
                <div className="mx-auto grid w-full xl:grid-cols-12 gap-4 sm:gap-6 items-start">
                  <div className="xl:col-span-8 space-y-4">
                    <Card className="overflow-hidden border border-border shadow-lg rounded-2xl">
                      <CardContent className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                        <div
                          className={`flex items-start justify-between gap-4 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className={isRTL ? "text-end" : ""}>
                            <h3
                              className={`text-lg md:text-xl font-bold text-text-heading flex items-center gap-2 ${
                                isRTL ? "flex-row-reverse justify-end" : ""
                              }`}
                            >
                              <Calendar className="w-5 h-5 text-primary" />
                              {t("patient.selectTimeSlot")}
                            </h3>
                            <p className="text-text-muted text-sm mt-1">
                              {t("patient.bookingWith")} {selectedDoctor.Name}
                            </p>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                            <Clock className="w-4 h-4" />
                            <span>
                              {t("auto.pickOneSlot")}
                            </span>
                          </div>
                        </div>

                        {/* Period filter chips + Available-only toggle */}
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { id: "all", label: `${t("auto.all")} 🗓` },
                            { id: "morning", label: `${t("auto.morning")} 🌅` },
                            { id: "afternoon", label: `${t("auto.afternoon")} ☀️` },
                            { id: "evening", label: `${t("auto.evening")} 🌙` },
                          ].map((chip) => (
                            <button
                              key={chip.id}
                              onClick={() => setSlotPeriodFilter(chip.id)}
                              className={`shrink-0 min-w-fit whitespace-nowrap text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                                slotPeriodFilter === chip.id
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "bg-background-paper text-text-muted border-border hover:border-primary/50 hover:text-primary"
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                          <button
                            onClick={() => setSlotShowAvailableOnly((v) => !v)}
                            className={`shrink-0 min-w-fit whitespace-nowrap ms-auto text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                              slotShowAvailableOnly
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-background-paper text-text-muted border-border hover:border-emerald-500/50 hover:text-emerald-600"
                            }`}
                          >
                            {t("auto.availableOnly")}
                          </button>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary block" />
                            <span>{t("auto.selected")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                            <span>{t("auto.available")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                            <span>{t("auto.myRequest")}</span>
                          </div>
                          {!slotShowAvailableOnly && (
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 block" />
                              <span>{t("auto.booked")}</span>
                            </div>
                          )}
                        </div>

                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const dayNames = isRTL
                            ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
                            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

                          // Period filter hour ranges
                          const periodHours = {
                            morning: { min: 5, max: 12 },
                            afternoon: { min: 12, max: 17 },
                            evening: { min: 17, max: 24 },
                          };

                          // Derive unique sorted date keys from slots + myBookings (today onwards only)
                          const todayKey = new Date().toISOString().slice(0, 10);
                          const allDateKeys = Array.from(
                            new Set([
                              ...Object.keys(slots).map((k) => k.slice(0, 10)),
                              ...Object.keys(mySlotBookingsByKey).map((k) => k.slice(0, 10)),
                            ])
                          )
                            .filter((dk) => dk >= todayKey)
                            .sort();

                          return (
                            <div className="max-h-[60vh] overflow-y-auto pe-1 space-y-3">
                              {allDateKeys.map((dateKey, di) => {
                                const [yyyy, mm, dd] = dateKey.split("-").map(Number);
                                const date = new Date(yyyy, mm - 1, dd);

                                const dayAvailableSlots = Object.entries(slots)
                                  .filter(
                                    ([k]) =>
                                      k.startsWith(dateKey) &&
                                      slots[k] === "available",
                                  )
                                  .map(([k]) => k.replace(`${dateKey}-`, ""));
                                const dayMyBookedSlots = Object.keys(
                                  mySlotBookingsByKey,
                                )
                                  .filter((k) => k.startsWith(dateKey))
                                  .map((k) => k.replace(`${dateKey}-`, ""));
                                const dayBookedSlotsByOthers = Object.entries(
                                  slots,
                                )
                                  .filter(
                                    ([k, status]) =>
                                      k.startsWith(dateKey) &&
                                      status === "booked" &&
                                      !mySlotBookingsByKey[k],
                                  )
                                  .map(([k]) => k.replace(`${dateKey}-`, ""));
                                const matchesPeriod = (timeKey) => {
                                  if (slotPeriodFilter === "all") return true;
                                  const h = parseInt(timeKey.split(":")[0], 10);
                                  if (slotPeriodFilter === "morning") return h >= 5 && h < 12;
                                  if (slotPeriodFilter === "afternoon") return h >= 12 && h < 17;
                                  if (slotPeriodFilter === "evening") return h >= 17;
                                  return true;
                                };
                                const filteredAvailable = dayAvailableSlots.filter(matchesPeriod);
                                const filteredMyBooked = dayMyBookedSlots.filter(matchesPeriod);
                                const filteredBookedByOthers = slotShowAvailableOnly
                                  ? []
                                  : dayBookedSlotsByOthers.filter(matchesPeriod);
                                const daySlots = Array.from(
                                  new Set([
                                    ...filteredAvailable,
                                    ...filteredMyBooked,
                                    ...filteredBookedByOthers,
                                  ]),
                                );
                                const availableCount = filteredAvailable.length;
                                const myRequestsCount = filteredMyBooked.length;
                                const bookedCount = filteredBookedByOthers.length;
                                const totalCount = daySlots.length;

                                if (daySlots.length === 0) {
                                  return null;
                                }

                                return (
                                  <div
                                    key={dateKey}
                                    className="bg-background-subtle/50 border border-border rounded-xl p-2.5 sm:p-4"
                                  >
                                    <div
                                      className={`flex flex-wrap items-center justify-between gap-2 mb-3 ${
                                        isRTL ? "flex-row-reverse" : ""
                                      }`}
                                    >
                                      <div
                                        className={`flex items-center gap-2 ${
                                          isRTL ? "flex-row-reverse" : ""
                                        }`}
                                      >
                                        <span className="font-semibold text-text-heading">
                                          {dayNames[date.getDay()]}
                                        </span>
                                        <span className="text-sm text-text-muted">
                                          {date.toLocaleDateString(
                                            t("auto.enus"),
                                            { month: "short", day: "numeric" },
                                          )}
                                        </span>
                                        {date.toDateString() ===
                                          new Date().toDateString() && (
                                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                            {t("auto.today")}
                                          </span>
                                        )}
                                      </div>

                                      <div
                                        className={`flex items-center gap-1.5 sm:gap-2 flex-wrap ${
                                          isRTL ? "flex-row-reverse" : ""
                                        }`}
                                      >
                                        <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/25 text-primary">
                                          {totalCount}{" "}
                                          {t("auto.totalSlots")}
                                        </span>
                                        {availableCount > 0 && (
                                          <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                                            {availableCount}{" "}
                                            {t("auto.available")}
                                          </span>
                                        )}
                                        {myRequestsCount > 0 && (
                                          <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                                            {myRequestsCount}{" "}
                                            {t("auto.myRequest")}
                                          </span>
                                        )}
                                        {bookedCount > 0 && (
                                          <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700">
                                            {bookedCount}{" "}
                                            {t("auto.booked")}
                                          </span>
                                        )}
                                        {availableCount === 0 &&
                                          myRequestsCount === 0 && (
                                            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-background-subtle border border-border text-text-muted">
                                              {t("auto.unavailable")}
                                            </span>
                                          )}
                                      </div>
                                    </div>

                                    {(() => {
                                      const sortedDaySlots = [...daySlots].sort(
                                        (a, b) => {
                                          const [ah, am] = a
                                            .split(":")
                                            .map(Number);
                                          const [bh, bm] = b
                                            .split(":")
                                            .map(Number);
                                          return ah * 60 + am - (bh * 60 + bm);
                                        },
                                      );

                                      const periodBuckets = [
                                        {
                                          id: "early",
                                          label: t("auto.earlyMorning"),
                                          min: 0,
                                          max: 8,
                                          chipClass:
                                            "bg-sky-50 border-sky-200 text-sky-700",
                                        },
                                        {
                                          id: "morning",
                                          label: t("auto.morning"),
                                          min: 8,
                                          max: 12,
                                          chipClass:
                                            "bg-emerald-50 border-emerald-200 text-emerald-700",
                                        },
                                        {
                                          id: "afternoon",
                                          label: t("auto.afternoon"),
                                          min: 12,
                                          max: 17,
                                          chipClass:
                                            "bg-amber-50 border-amber-200 text-amber-700",
                                        },
                                        {
                                          id: "evening",
                                          label: t("auto.evening"),
                                          min: 17,
                                          max: 24,
                                          chipClass:
                                            "bg-indigo-50 border-indigo-200 text-indigo-700",
                                        },
                                      ];

                                      const groupedSlots = periodBuckets
                                        .map((bucket) => ({
                                          ...bucket,
                                          slots: sortedDaySlots.filter(
                                            (timeKey) => {
                                              const [h] = timeKey
                                                .split(":")
                                                .map(Number);
                                              return (
                                                h >= bucket.min &&
                                                h < bucket.max
                                              );
                                            },
                                          ),
                                        }))
                                        .filter(
                                          (bucket) => bucket.slots.length > 0,
                                        );

                                      return (
                                        <div
                                          className={`space-y-3 ${
                                            totalCount >= 4
                                              ? "rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 p-3 border border-border/70"
                                              : ""
                                          }`}
                                        >
                                          {groupedSlots.map((bucket) => (
                                            <div
                                              key={bucket.id}
                                              className="rounded-xl border border-border/80 bg-background-paper/70 p-2 sm:p-2.5 min-w-0 overflow-hidden"
                                            >
                                              <div
                                                className={`flex items-center justify-between gap-2 mb-2 ${
                                                  isRTL
                                                    ? "flex-row-reverse"
                                                    : ""
                                                }`}
                                              >
                                                <div
                                                  className={`flex items-center gap-1.5 text-xs font-semibold text-text-muted min-w-0 ${
                                                    isRTL
                                                      ? "flex-row-reverse"
                                                      : ""
                                                  }`}
                                                >
                                                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                  <span className="whitespace-nowrap">{bucket.label}</span>
                                                </div>
                                                <span
                                                  className={`text-[11px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap flex-shrink-0 ${bucket.chipClass}`}
                                                >
                                                  {bucket.slots.length}{" "}
                                                  {t("auto.slots")}
                                                </span>
                                              </div>

                                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                                                {bucket.slots.map((timeKey) => {
                                                  const slotKey = `${dateKey}-${timeKey}`;
                                                  const myBooking =
                                                    mySlotBookingsByKey[
                                                      slotKey
                                                    ];
                                                  const slotDetails =
                                                    slotDetailsByKey[slotKey] ||
                                                    null;
                                                  const myBookingStatus = myBooking
                                                    ? getBookingStatusMeta(
                                                        myBooking.Status,
                                                      )
                                                    : null;
                                                  const isSelected =
                                                    bookedSlot &&
                                                    bookedSlot.date.toDateString() ===
                                                      date.toDateString() &&
                                                    bookedSlot.timeKey ===
                                                      timeKey;
                                                  const isAvailableSlot =
                                                    slots[slotKey] ===
                                                    "available";
                                                  const isBookedByOthers =
                                                    !myBooking &&
                                                    slots[slotKey] === "booked";
                                                  const isClickableSlot =
                                                    myBooking ||
                                                    isAvailableSlot;
                                                  const detailParts = [];

                                                  if (
                                                    slotDetails?.durationMinutes &&
                                                    slotDetails.durationMinutes >
                                                      0
                                                  ) {
                                                    detailParts.push(
                                                      isRTL
                                                        ? `المدة ${slotDetails.durationMinutes} د`
                                                        : `${slotDetails.durationMinutes} min`,
                                                    );
                                                  }

                                                  if (slotDetails?.endTimeKey) {
                                                    detailParts.push(
                                                      isRTL
                                                        ? `ينتهي ${formatHourLabel(
                                                            slotDetails.endTimeKey,
                                                          )}`
                                                        : `Ends ${formatHourLabel(
                                                            slotDetails.endTimeKey,
                                                          )}`,
                                                    );
                                                  }

                                                  return (
                                                    <button
                                                      key={timeKey}
                                                      onClick={() => {
                                                        if (myBooking) {
                                                          setMainTab("status");
                                                          return;
                                                        }
                                                        if (isBookedByOthers) {
                                                          return;
                                                        }
                                                        handleSlotClick(
                                                          date,
                                                          timeKey,
                                                        );
                                                      }}
                                                      className={`group w-full min-w-0 rounded-xl border-2 p-2.5 sm:p-3 text-center overflow-hidden transition-all duration-200 ${
                                                        myBooking
                                                          ? `${myBookingStatus.className} hover:opacity-95 shadow-sm`
                                                          : isBookedByOthers
                                                          ? "bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed"
                                                          : isSelected
                                                          ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                                                          : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm"
                                                      }`}
                                                      disabled={
                                                        !isClickableSlot
                                                      }
                                                    >
                                                      <div className="flex items-center justify-center gap-1 font-bold">
                                                        {isSelected && (
                                                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        )}
                                                        <span
                                                          dir="ltr"
                                                          className="text-sm sm:text-base truncate"
                                                        >
                                                          {formatHourLabel(
                                                            timeKey,
                                                          )}
                                                        </span>
                                                      </div>

                                                      <div className="mt-1.5 flex items-center justify-center">
                                                        {myBooking && (
                                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 border border-current/30 truncate max-w-full">
                                                            {
                                                              myBookingStatus.label
                                                            }
                                                          </span>
                                                        )}
                                                        {isBookedByOthers && (
                                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 border border-slate-300 text-slate-700 truncate max-w-full">
                                                            {t("auto.booked")}
                                                          </span>
                                                        )}
                                                        {!myBooking &&
                                                          !isBookedByOthers &&
                                                          !isSelected && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-300/70 text-emerald-700 truncate max-w-full">
                                                              {t("auto.available")}
                                                            </span>
                                                          )}
                                                        {isSelected && (
                                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 border border-white/40 truncate max-w-full">
                                                            {t("auto.selected")}
                                                          </span>
                                                        )}
                                                      </div>

                                                      {(detailParts.length >
                                                        0 ||
                                                        isAvailableSlot) && (
                                                        <div className="mt-1.5 text-[10px] sm:text-[11px] font-medium opacity-80 flex items-center justify-center gap-1 min-w-0">
                                                          <Clock className="w-3 h-3 flex-shrink-0" />
                                                          <span
                                                            dir="ltr"
                                                            className="truncate"
                                                          >
                                                            {detailParts.join(
                                                              " • ",
                                                            ) ||
                                                              (t("auto.tapToReserve"))}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                );
                              })}

                              {Object.keys(slots).length === 0 && (
                                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                                  <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                  <p className="text-amber-700 font-medium">
                                    {t("patient.noSlotsAvailable")}
                                  </p>
                                  <p className="text-amber-600 text-sm mt-1">
                                    {t("patient.trySlotsNextWeek")}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="xl:col-span-4">
                    <Card className="p-4 sm:p-5 md:p-6 sticky top-4 border border-border/80">
                      <h3
                        className={`font-bold text-lg text-text-heading ${
                          isRTL ? "text-end" : ""
                        }`}
                      >
                        {t("patient.bookingSummary")}
                      </h3>

                      <div className="mt-4 space-y-5">
                        <div
                          className={`flex items-center gap-3 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border ${selectedDoctorTheme.avatar}`}
                          >
                            {selectedDoctor.Image ? (
                              <img
                                src={selectedDoctor.Image}
                                alt={selectedDoctor.Name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>

                          <div className={isRTL ? "text-end" : ""}>
                            <p className="text-xs text-text-light">
                              {t("common.doctor")}
                            </p>
                            <p className="font-semibold text-text-heading">
                              {selectedDoctor.Name}
                            </p>
                          </div>
                        </div>

                        {selectedDoctor.Specialist &&
                          selectedDoctor.Specialist.length > 0 && (
                            <div
                              className={`flex items-start gap-3 ${
                                isRTL ? "flex-row-reverse" : ""
                              }`}
                            >
                              <Stethoscope className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div className={isRTL ? "text-end" : ""}>
                                <p className="text-xs text-text-light">
                                  {t("common.specialty")}
                                </p>
                                <p
                                  className={`font-medium text-sm inline-flex items-center rounded-full px-2.5 py-1 border ${selectedDoctorTheme.badge}`}
                                >
                                  {selectedDoctor.Specialist.join(", ")}
                                </p>
                              </div>
                            </div>
                          )}

                        <div className="rounded-xl border border-border bg-background-subtle p-3.5">
                          <p
                            className={`text-xs text-text-muted mb-1 ${
                              isRTL ? "text-end" : ""
                            }`}
                          >
                            {t("patient.selectedTime")}
                          </p>
                          {bookedSlot ? (
                            <p
                              className={`font-semibold text-text-heading text-sm ${
                                isRTL ? "text-end" : ""
                              }`}
                              dir="ltr"
                            >
                              {bookedSlot.date.toLocaleDateString()} -{" "}
                              {formatHourLabel(bookedSlot.timeKey)}
                            </p>
                          ) : (
                            <p
                              className={`text-sm text-text-muted ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("auto.noSlotSelectedYet")}
                            </p>
                          )}
                        </div>

                        <div
                          className={`space-y-2 ${isRTL ? "text-end" : ""}`}
                        >
                          <p className="text-xs text-text-muted font-semibold">
                            {t("auto.paymentMethod")}
                          </p>
                          {paymentProvidersLoading && (
                            <p className="text-xs text-text-muted">
                              {t("auto.loadingPaymentProviders")}
                            </p>
                          )}
                          <div className="rounded-xl border border-border bg-background-subtle p-3">
                            <label className="text-[11px] text-text-muted block mb-1.5">
                              {t("auto.choosePaymentProvider")}
                            </label>
                            <select
                              value={selectedPaymentProvider}
                              onChange={(e) =>
                                handlePaymentProviderSelect(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              disabled={availablePaymentProviders.length === 0}
                              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background-paper text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              {availablePaymentProviders.length === 0 ? (
                                <option value="">
                                  {t("auto.noPaymentProvidersAvailableRightNow")}
                                </option>
                              ) : null}
                              {availablePaymentProviders.map((provider) => (
                                <option key={provider.ID} value={provider.ID}>
                                  {provider.Name}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-text-muted mt-2">
                              {activeProviderMeta.label} -{" "}
                              {activeProviderMeta.desc}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border bg-background-paper p-3 mt-3 space-y-2">
                            <p className="text-[11px] text-text-muted">
                              {t("auto.paymentInstructions")}
                            </p>

                            {paymentInstructionLoading ? (
                              <p className="text-xs text-text-muted">
                                {t("auto.loadingPaymentInstructions")}
                              </p>
                            ) : paymentInstruction ? (
                              <>
                                {paymentInstruction?.Title ? (
                                  <p className="text-sm font-semibold text-text-heading">
                                    {paymentInstruction.Title}
                                  </p>
                                ) : null}

                                {paymentInstruction?.AccountNumber ? (
                                  <p className="text-xs text-text-muted">
                                    {t("auto.accountNumber")}{" "}
                                    <span className="font-mono text-text-heading font-semibold">
                                      {paymentInstruction.AccountNumber}
                                    </span>
                                  </p>
                                ) : null}

                                {paymentInstruction?.AccountName ? (
                                  <p className="text-xs text-text-muted">
                                    {t("auto.accountName")}{" "}
                                    <span className="text-text-heading font-medium">
                                      {paymentInstruction.AccountName}
                                    </span>
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <p className="text-xs text-text-muted">
                                {t("auto.noInstructionsAreCurrentlyAvailableForThisProvider")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          className={`space-y-1 ${isRTL ? "text-end" : ""}`}
                        >
                          <p className="text-xs text-text-muted">
                            {t("auto.sessionFee")}
                          </p>
                          <p className="font-semibold text-text-heading text-base">
                            {bookingBaseFee > 0
                              ? formatCurrency(bookingBaseFee)
                              : t("auto.notSpecified")}
                          </p>
                        </div>

                        <div
                          className={`space-y-1 ${isRTL ? "text-end" : ""}`}
                        >
                          <p className="text-xs text-text-muted">
                            {t("auto.transferFees")}
                          </p>
                          <p className="font-semibold text-text-heading text-base">
                            {bookingBaseFee > 0
                              ? formatCurrency(transferFee)
                              : "—"}
                          </p>
                        </div>

                        <div
                          className={`pt-3 border-t border-border ${
                            isRTL ? "text-end" : ""
                          }`}
                        >
                          <p className="text-xs text-text-muted">
                            {t("auto.totalPrice")}
                          </p>
                          <p className="font-bold text-lg text-primary">
                            {bookingBaseFee > 0
                              ? formatCurrency(bookingTotalFee)
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-6"
                        disabled={!bookedSlot || !activeProvider}
                        onClick={handleConfirmBookingClick}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin me-2" />
                        ) : null}
                        {t("patient.confirmAppointment")}
                      </Button>
                    </Card>
                  </div>
                </div>

                {/* ── Payment Instructions Modal ── */}
                <Modal
                  isOpen={isPaymentModalOpen}
                  onClose={() => setIsPaymentModalOpen(false)}
                  title={t("auto.paymentDetails")}
                  size="md"
                >
                  <div className="space-y-5">
                    {/* Provider badge */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
                        activeProviderMeta.requireReference
                          ? "bg-violet-50 border-violet-200"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          activeProviderMeta.requireReference
                            ? "bg-violet-500/15"
                            : "bg-emerald-500/15"
                        }`}
                      >
                        {activeProviderMeta.requireReference ? (
                          <FlashOn className="w-6 h-6 text-violet-500" />
                        ) : (
                          <AccountBalanceWallet className="w-6 h-6 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-text-heading text-base">
                          {activeProviderMeta.label}
                        </p>
                        <p className="text-xs text-text-muted">
                          {t("auto.pleaseFollowTheInstructionsCarefully")}
                        </p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-background-subtle rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-text-heading">
                        {t("auto.transferInstructions")}
                      </p>
                      <div className="space-y-2 text-sm text-text-muted">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <p>
                            {isRTL
                              ? `قم بتحويل المبلغ المطلوب عبر ${activeProviderMeta.label}`
                              : `Transfer the required amount via ${activeProviderMeta.label}`}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <div>
                            <p className="text-text-heading font-semibold">
                              {t("auto.toAccount")}
                            </p>
                            <p className="font-mono text-primary text-base font-bold mt-0.5">
                              {paymentInstruction?.AccountNumber || "—"}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {t("auto.accountName")}{" "}
                              {paymentInstruction?.AccountName || "—"}
                            </p>
                          </div>
                        </div>
                        {paymentInstruction?.Instructions ? (
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              3
                            </span>
                            <p>{paymentInstruction.Instructions}</p>
                          </div>
                        ) : null}
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {paymentInstruction?.Instructions ? 4 : 3}
                          </span>
                          <p>
                            {t("auto.sessionFee")}{" "}
                            <span className="font-bold text-text-heading">
                              {bookingBaseFee > 0
                                ? formatCurrency(bookingBaseFee)
                                : "—"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {paymentInstruction?.Instructions ? 5 : 4}
                          </span>
                          <p>
                            {t("auto.transferFees")}{" "}
                            <span className="font-bold text-text-heading">
                              {bookingBaseFee > 0
                                ? formatCurrency(transferFee)
                                : "—"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {paymentInstruction?.Instructions ? 6 : 5}
                          </span>
                          <p>
                            {t("auto.totalAmount")}{" "}
                            <span className="font-bold text-text-heading">
                              {bookingBaseFee > 0
                                ? formatCurrency(bookingTotalFee)
                                : "—"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {paymentInstruction?.Instructions ? 7 : 6}
                          </span>
                          <p>
                            {t("auto.takeAScreenshotAndUploadItBelow")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* InstaPay-only: Reference Number */}
                    {activeProviderMeta.requireReference && (
                      <div>
                        <label className="text-sm font-semibold text-text-heading block mb-1.5">
                          <ReceiptLong className="w-4 h-4 inline-block me-1" />
                          {t("auto.referenceNumber")}
                          <span className="text-text-muted ms-1">
                            ({t("auto.optional")})
                          </span>
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder={
                            t("auto.enterReferenceNumberFromReceipt")
                          }
                          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {/* Screenshot Upload */}
                    <div>
                      <label className="text-sm font-semibold text-text-heading block mb-1.5">
                        {t("auto.attachScreenshot")}
                        <span className="text-red-500 ms-1">*</span>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          paymentScreenshot
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-primary/3"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setPaymentScreenshot(e.target.files?.[0] || null)
                          }
                        />
                        {paymentScreenshot ? (
                          <>
                            <CheckCircle className="w-7 h-7 text-primary" />
                            <p className="text-sm font-semibold text-primary">
                              {paymentScreenshot.name}
                            </p>
                            <p className="text-xs text-text-muted">
                              {t("auto.clickToChange")}
                            </p>
                          </>
                        ) : (
                          <>
                            <UploadIcon className="w-7 h-7 text-text-muted" />
                            <p className="text-sm text-text-muted">
                              {t("auto.clickToUploadTransferScreenshot")}
                            </p>
                            <p className="text-xs text-text-muted">
                              PNG, JPG, WEBP
                            </p>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsPaymentModalOpen(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={handlePaymentSubmit}
                        disabled={
                          loading || paymentLoading || !paymentScreenshot
                        }
                      >
                        {loading || paymentLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        {t("auto.paySubmitProof")}
                      </Button>
                    </div>
                  </div>
                </Modal>

                {/* ── Reviews Section ── */}
                <div className="space-y-5">
                  <h3
                    className={`text-xl font-bold text-text-heading flex items-center gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Star className="w-6 h-6 text-amber-400" />
                    {t("auto.doctorReviews")}
                  </h3>

                  {/* Add Review */}
                  <Card className="p-5">
                    <h4
                      className={`font-semibold text-text-heading mb-3 ${
                        isRTL ? "text-end" : ""
                      }`}
                    >
                      {t("auto.addYourReview")}
                    </h4>
                    <div
                      className={`flex items-center gap-2 mb-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            setNewReview((r) => ({ ...r, rating: s }))
                          }
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              s <= newReview.rating
                                ? "text-amber-400"
                                : "text-border"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-text-muted ms-2">
                        {newReview.rating}/5
                      </span>
                    </div>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview((r) => ({ ...r, comment: e.target.value }))
                      }
                      placeholder={
                        t("auto.shareYourExperienceWithThisDoctor")
                      }
                      rows={3}
                      className={`w-full p-3 border border-border rounded-xl bg-background text-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        isRTL ? "text-end" : ""
                      }`}
                    />
                    <div
                      className={`flex ${
                        t("auto.justifyend")
                      } mt-3`}
                    >
                      <Button
                        size="sm"
                        disabled={
                          !newReview.comment.trim() ||
                          newReview.rating === 0 ||
                          submittingReview
                        }
                        onClick={async () => {
                          if (
                            !newReview.comment.trim() ||
                            newReview.rating === 0
                          )
                            return;
                          setSubmittingReview(true);

                          try {
                            const response = await patientAPI.addDoctorReview({
                              DoctorId: selectedDoctor.Id,
                              Rate: newReview.rating,
                              Comment: newReview.comment,
                            });

                            if (response?.IsSuccess !== false) {
                              toast.success(
                                t("auto.reviewAddedSuccessfully"),
                              );

                              // Optimistically update UI
                              setReviews((prev) => [
                                {
                                  Id: Date.now(),
                                  ProfileImage: currentUser?.Image || null,
                                  Rate: newReview.rating,
                                  Comment: newReview.comment,
                                  CreatedAt: new Date().toISOString(),
                                },
                                ...prev,
                              ]);
                            } else {
                              toast.error(
                                response?.Message ||
                                  (t("auto.failedToAddReview")),
                              );
                            }
                          } catch (error) {
                            console.error("Error adding review:", error);
                            toast.error(
                              error.response?.data?.Message ||
                                (t("auto.failedToAddReview")),
                            );
                          } finally {
                            setNewReview({ rating: 0, comment: "" });
                            setSubmittingReview(false);
                          }
                        }}
                        className="gap-2"
                      >
                        {submittingReview ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {t("auto.submit")}
                      </Button>
                    </div>
                  </Card>

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((r, i) => (
                        <Card key={r.Id || i} className="p-5">
                          <div
                            className={`flex items-start justify-between gap-3 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`flex items-center gap-3 ${
                                isRTL ? "flex-row-reverse" : ""
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {r.ProfileImage ? (
                                  <img
                                    src={r.ProfileImage}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div className={isRTL ? "text-end" : ""}>
                                <p className="font-semibold text-text-heading text-sm">
                                  {t("auto.patient")}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${
                                        s <= r.Rate
                                          ? "text-amber-400"
                                          : "text-border"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {r.CreatedAt && (
                              <span className="text-xs text-text-muted flex-shrink-0">
                                {new Date(r.CreatedAt).toLocaleDateString(
                                  t("auto.enus"),
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm text-text-muted mt-3 leading-relaxed ${
                              isRTL ? "text-end" : ""
                            }`}
                          >
                            {r.Comment}
                          </p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-muted bg-background-paper border rounded-xl shadow-sm">
                      <Star className="w-10 h-10 mx-auto text-amber-200 mb-2" />
                      <p>
                        {t("auto.noReviewsYet")}
                      </p>
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
                    ? t("auto.requestSubmitted")
                    : t("patient.bookingConfirmedTitle")}
                </h2>
                <p className="text-text-muted mb-8">
                  {bookingPendingReview
                    ? t("auto.yourBookingIsCurrentlyPendingUntilTechnicalSupportReviewsYourTransferProof")
                    : t("patient.bookingConfirmedDesc")}
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    setStep(1);
                    setSelectedDoctor(null);
                    setBookedSlot(null);
                    setBookingPendingReview(false);
                    setSearchParams({});
                  }}
                >
                  {t("patient.backToDoctors")}
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
                patientBookings.map((booking, bookingIndex) => {
                  const statusInfo = resolveStatusInfo(booking);
                  const paymentStatusInfo = resolvePaymentStatusInfo(booking);
                  const sessionDate = booking.SessionStartTime
                    ? new Date(booking.SessionStartTime)
                    : null;
                  const isBefore48h =
                    sessionDate &&
                    !Number.isNaN(sessionDate.getTime()) &&
                    sessionDate.getTime() - Date.now() >= TWO_DAYS_IN_MS;
                  const canCancelByStatus =
                    statusInfo.key === "pending" ||
                    statusInfo.key === "confirmed" ||
                    statusInfo.key === "pendingPayment" ||
                    statusInfo.key === "approved" ||
                    statusInfo.key === "paid";
                  const canCancel = canCancelByStatus && Boolean(isBefore48h);
                  const canStart = canStartPatientSession(booking);
                  const bookingId = booking?.BookingId || booking?.Id;

                  return (
                    <Card
                      key={`${String(booking?.Id ?? "booking")}-${String(
                        booking?.SessionStartTime ?? bookingIndex,
                      )}-${bookingIndex}`}
                      className="p-4 sm:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {booking.DoctorImage ? (
                              <img
                                src={booking.DoctorImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-text-heading truncate">
                              {booking.DoctorName || t("common.doctor")}
                            </h3>
                            <p className="text-text-muted text-xs sm:text-sm">
                              {booking.DurationMinutes
                                ? `${booking.DurationMinutes} ${t(
                                    "patient.minSession",
                                  )}`
                                : t("patient.consultation")}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                          <div className="text-sm">
                            {sessionDate && (
                              <>
                                <div className="flex items-center gap-2 text-text-heading">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span className="font-medium">
                                    {sessionDate.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-text-muted mt-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {sessionDate.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>

                            <Badge variant={paymentStatusInfo.badgeVariant}>
                              {t("auto.payment")}
                              {paymentStatusInfo.label}
                            </Badge>

                            {canStart && (
                              <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleStartMeeting(booking)}
                                disabled={String(startingMeetingId) === String(bookingId)}
                              >
                                {String(startingMeetingId) === String(bookingId) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Video className="w-4 h-4" />
                                )}
                                {t("patientHome.upcomingSession.enterSession")}
                              </Button>
                            )}

                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-300 hover:text-red-700 hover:bg-red-50 gap-1.5"
                                onClick={() =>
                                  confirmCancelReservation(booking.Id)
                                }
                                disabled={cancellingId === booking.Id}
                              >
                                {cancellingId === booking.Id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    <span>
                                      {Number(paymentStatusInfo?.value) === 2 ||
                                      booking?.PaymentConfirmed === true
                                        ? t("auto.cancelRefund")
                                        : t("patient.cancelAppointment")}
                                    </span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {booking.PatientNotes && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm text-text-muted">
                          <span className="font-bold text-text-heading">
                            {t("patient.notes")}:
                          </span>{" "}
                          {booking.PatientNotes}
                        </div>
                      )}

                      {booking.CancellationReason &&
                        statusInfo.key === "cancelled" && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                          <span className="font-bold">
                            {t("patient.cancellationReason")}:
                          </span>{" "}
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
                    {t("patient.noReservationsFound")}
                  </h3>
                  <p className="text-text-muted mt-2">
                    {t("patient.noReservationsDesc")}
                  </p>
                  <Button
                    className="mt-6"
                    variant="outline"
                    onClick={() => setMainTab("reserve")}
                  >
                    {t("patient.bookNow")}
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {bookingsPagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-border">
                  <span className="text-sm text-text-muted font-medium">
                    {t("common.page")} {bookingsPagination.pageIndex}{" "}
                    {t("common.of")} {bookingsPagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPagination.pageIndex <= 1}
                      onClick={() =>
                        fetchPatientBookings(bookingsPagination.pageIndex - 1)
                      }
                      className="gap-1"
                    >
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronLeft className="w-4 h-4" />
                      )}
                      {t("common.previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        bookingsPagination.pageIndex >=
                        bookingsPagination.totalPages
                      }
                      onClick={() =>
                        fetchPatientBookings(bookingsPagination.pageIndex + 1)
                      }
                      className="gap-1"
                    >
                      {t("common.next")}
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Cancel Appointment Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCancelConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-2">
                  {cancelWillRefund
                    ? t("auto.cancelAppointmentRefund")
                    : t("auto.cancelAppointment")}
                </h3>
                <p className="text-sm text-text-muted mb-6">
                  {cancelWillRefund
                    ? t("auto.areYouSureYouWantToCancelThisAppointmentARefundRequestWillBeSentToTechnicalSupportBecausePaymentIsConfirmed")
                    : t("auto.areYouSureYouWantToCancelThisAppointment")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setCancelConfirmId(null)}
                  >
                    {t("common.cancel", "No, Keep it")}
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleConfirmCancel}
                    isLoading={cancellingId === cancelConfirmId}
                  >
                    {cancelWillRefund
                      ? t("auto.yesCancelRefund")
                      : t("auto.yesCancel")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
