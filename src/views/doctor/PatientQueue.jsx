import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  TestTube,
  ClipboardCheck as ResultsIcon,
} from "lucide-react";
import { useToast } from "../../components/ui/Toast";

import QueueItem from "../../components/doctor/queue/QueueItem";
import QueueStats from "../../components/doctor/queue/QueueStats";
import Button from "../../components/ui/Button";
import FilterChips from "../../components/shared/FilterChips";
import { doctorAPI, medicalAPI } from "../../lib/api";
import {
  APPOINTMENT_STATUS,
  getAppointmentStatusKey,
} from "../../lib/appointmentStatus";
import { useLanguage } from "../../contexts/LanguageContext";
import { doctorHistoryUrl, doctorMedicalRecordsUrl, doctorMessagesUrl } from "../../lib/doctorPatientRoutes";
import { useSignalR } from "../../hooks/useSignalR";

export default function PatientQueue() {
  const toast = useToast();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    bookingId: null,
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelConfirmPatient, setCancelConfirmPatient] = useState(null);
  const [showResultPatient, setShowResultPatient] = useState(null);
  const [showResultLoading, setShowResultLoading] = useState(false);
  const [showResultItems, setShowResultItems] = useState([]);
  const [addTestPatient, setAddTestPatient] = useState(null);
  const [testTypes, setTestTypes] = useState([]);
  const [loadingTestTypes, setLoadingTestTypes] = useState(false);
  const [addTestForm, setAddTestForm] = useState({
    testTypeId: "",
    scanUrl: "",
    examNotes: "",
    testDate: "",
  });
  const pageSize = 20;

  // Map filter key to API BookingStatus value
  const filterToStatus = {
    all: null,
    pending: APPOINTMENT_STATUS.PENDING,
    confirmed: APPOINTMENT_STATUS.CONFIRMED,
    pendingPayment: APPOINTMENT_STATUS.PENDING_PAYMENT,
    inProgress: APPOINTMENT_STATUS.IN_PROGRESS,
    completed: APPOINTMENT_STATUS.COMPLETED,
    cancelled: APPOINTMENT_STATUS.CANCELLED,
    noShow: APPOINTMENT_STATUS.NO_SHOW,
  };

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const status = filterToStatus[filter] ?? null;
      const response = await doctorAPI.getBookings(pageIndex, pageSize, status);
      if (response.IsSuccess && response.Data) {
        setBookings(response.Data.Items || []);
        setTotalPages(response.Data.Pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pageIndex, filter]);

  useSignalR({
    enabled: true,
    handlers: {
      BookingStatusUpdated: fetchBookings,
      ManualPaymentStatusUpdated: fetchBookings,
      PaymentStatusUpdated: fetchBookings,
      SlotCancelled: fetchBookings,
      SlotDeleted: fetchBookings,
    },
  });

  const loadTestTypes = async () => {
    try {
      setLoadingTestTypes(true);
      const response = await medicalAPI.getTestTypes(1, 200);
      const items = response?.Data?.Items || [];
      setTestTypes(items);
      return items;
    } catch {
      setTestTypes([]);
      toast.error(t("auto.failedToLoadTestTypes"));
      return [];
    } finally {
      setLoadingTestTypes(false);
    }
  };

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString(t("auto.enus"), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString(t("auto.enus"), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Map bookings to patient queue format
  const patients = bookings.map((booking) => {
    const now = new Date();
    const sessionStart = new Date(booking.SessionStartTime);
    const diffMs = sessionStart.getTime() - now.getTime();
    const joinWindowMs = 24 * 60 * 60 * 1000;
    const waitTime = Math.max(0, Math.floor((now - sessionStart) / 60000));
    const statusKey = getAppointmentStatusKey(booking.Status, booking);
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    const canCancel =
      (statusKey === "pending" ||
        statusKey === "confirmed" ||
        statusKey === "pendingPayment") &&
      diffMs >= twoDaysMs;
    const showJoin =
      (statusKey === "confirmed" || statusKey === "inProgress") &&
      diffMs >= 0 &&
      diffMs <= joinWindowMs;

    return {
      id: booking.Id,
      bookingId: booking.Id,
      patientId: booking.PatientId,
      name: booking.PatientName || "Unknown Patient",
      status: statusKey,
      statusCode: booking.Status,
      waitTime:
        statusKey === "pending" ||
        statusKey === "confirmed" ||
        statusKey === "pendingPayment" ||
        statusKey === "inProgress"
          ? waitTime
          : 0,
      specialty: "Consultation",
      time: formatTime(booking.SessionStartTime),
      sessionTimeLabel: formatTime(booking.SessionStartTime),
      sessionDateLabel: formatDate(booking.SessionStartTime),
      duration: booking.DurationMinutes,
      meetingUrl: booking.MeetingUrl,
      paymentConfirmed: booking.PaymentConfirmed,
      paymentStatus: booking.PaymentStatus,
      canCancel,
      showJoin,
    };
  });

  const handleJoin = async (patient) => {
    setActionLoading({ type: "join", bookingId: patient.bookingId });
    try {
      if (patient?.meetingUrl) {
        window.open(patient.meetingUrl, "_blank");
        toast.success(t("auto.sessionOpenedSuccessfully"));
        return;
      }

      const params = new URLSearchParams();
      if (
        patient?.patientId !== undefined &&
        patient?.patientId !== null &&
        String(patient.patientId) !== ""
      ) {
        params.set("patientId", String(patient.patientId));
      }
      if (
        patient?.bookingId !== undefined &&
        patient?.bookingId !== null &&
        String(patient.bookingId) !== ""
      ) {
        params.set("bookingId", String(patient.bookingId));
      }

      const query = params.toString();
      navigate(`/dashboard/doctor/messages${query ? `?${query}` : ""}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.Message || t("auto.failedToOpenSession"),
      );
    } finally {
      setActionLoading({ type: null, bookingId: null });
    }
  };

  const handleCancel = async (patient) => {
    setActionLoading({ type: "cancel", bookingId: patient.bookingId });
    try {
      const response = await doctorAPI.cancelBooking(
        patient.bookingId,
        t("auto.cancelledByDoctor"),
      );
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.failedCancelAppointment"));
        return;
      }

      // Optimistic update to reduce perceived delay.
      setBookings((prev) =>
        prev.map((booking) =>
          booking.Id === patient.bookingId
            ? {
                ...booking,
                Status: APPOINTMENT_STATUS.CANCELLED,
                CancellationReason: t("auto.cancelledByDoctor"),
              }
            : booking,
        ),
      );

      toast.success(t("success.appointmentCancelled"));
      fetchBookings();
    } catch (error) {
      toast.error(
        error?.response?.data?.Message || t("errors.failedCancelAppointment"),
      );
    } finally {
      setActionLoading({ type: null, bookingId: null });
    }
  };

  const handleShowResults = async (patient) => {
    if (!patient?.patientId) {
      toast.error(t("auto.patientIdIsMissing"));
      return;
    }

    setActionLoading({ type: "showResults", bookingId: patient.bookingId });
    setShowResultLoading(true);
    setShowResultPatient(patient);

    try {
      const response = await medicalAPI.getPatientHistory(
        String(patient.patientId),
        1,
        200,
      );
      const records = response?.Data?.Items || [];
      const mapped = records
        .map((record) => ({
          id: String(record?.RecordID ?? record?.RecordId ?? record?.id ?? ""),
          testTypeName:
            record?.TestTypeName || record?.testTypeName || t("auto.test"),
          testDate:
            record?.TestDate ||
            record?.testDate ||
            record?.CreatedAt ||
            record?.createdAt ||
            null,
          result: String(record?.Result ?? record?.result ?? "").trim(),
          examNotes: String(
            record?.ExamNotes ?? record?.examNotes ?? "",
          ).trim(),
        }))
        .sort((a, b) => {
          const aDate = a.testDate ? new Date(a.testDate).getTime() : 0;
          const bDate = b.testDate ? new Date(b.testDate).getTime() : 0;
          return bDate - aDate;
        });

      setShowResultItems(mapped);
    } catch (error) {
      setShowResultItems([]);
      toast.error(
        error?.response?.data?.Message || t("auto.failedToLoadResults"),
      );
    } finally {
      setShowResultLoading(false);
      setActionLoading({ type: null, bookingId: null });
    }
  };

  const handleAction = (action, patient) => {
    if (action === "join") {
      handleJoin(patient);
      return;
    }

    if (action === "viewProfile") {
      if (!patient?.patientId) {
        toast.error(t("auto.patientIdIsMissing"));
        return;
      }
      navigate(doctorMedicalRecordsUrl(patient.patientId));
      return;
    }

    if (action === "viewHistory") {
      if (!patient?.patientId) {
        toast.error(t("auto.patientIdIsMissing"));
        return;
      }
      navigate(doctorHistoryUrl({ tab: "records", patientId: patient.patientId }));
      return;
    }

    if (action === "addNote") {
      if (!patient?.bookingId) {
        toast.error(t("errors.somethingWentWrong"));
        return;
      }
      navigate(
        doctorHistoryUrl({
          tab: "records",
          bookingId: patient.bookingId,
          action: "note",
        }),
      );
      return;
    }

    if (action === "message") {
      handleJoin(patient);
      return;
    }

    if (action === "cancel") {
      setCancelConfirmPatient(patient);
      return;
    }

    if (action === "showResults") {
      handleShowResults(patient);
      return;
    }

    if (action === "addTest") {
      const openModal = async () => {
        if (!patient?.patientId) {
          toast.error(t("auto.patientIdIsMissing"));
          return;
        }

        setActionLoading({ type: "addTest", bookingId: patient.bookingId });
        try {
          let availableTypes = testTypes;
          if (!availableTypes.length) {
            availableTypes = await loadTestTypes();
          }

          const now = new Date();
          const localDateTime = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16);
          const firstType = availableTypes[0];
          const firstTypeId =
            firstType?.ID ?? firstType?.Id ?? firstType?.id ?? "";

          setAddTestForm({
            testTypeId: firstTypeId ? String(firstTypeId) : "",
            scanUrl: String(firstType?.Url ?? firstType?.url ?? "").trim(),
            examNotes: "",
            testDate: localDateTime,
          });
          setAddTestPatient(patient);
        } finally {
          setActionLoading({ type: null, bookingId: null });
        }
      };

      openModal();
      return;
    }

    toast.error(t("auto.unsupportedAction"));
  };

  const handleSubmitAddTest = async () => {
    if (!addTestPatient?.patientId) {
      toast.error(t("auto.patientIdIsMissing"));
      return;
    }

    if (!addTestForm.testTypeId) {
      toast.error(t("auto.pleaseSelectATestType"));
      return;
    }

    setActionLoading({ type: "addTest", bookingId: addTestPatient.bookingId });
    try {
      const selectedType = testTypes.find((type) => {
        const typeId = type?.ID ?? type?.Id ?? type?.id;
        return String(typeId) === String(addTestForm.testTypeId);
      });
      const selectedTypeScanUrl = String(
        selectedType?.Url ?? selectedType?.url ?? "",
      ).trim();

      const payload = {
        PatientID: String(addTestPatient.patientId),
        TestTypeID: String(addTestForm.testTypeId),
        ScanUrl: selectedTypeScanUrl || null,
        ExamNotes: addTestForm.examNotes?.trim() || null,
        TestDate: addTestForm.testDate
          ? new Date(addTestForm.testDate).toISOString()
          : new Date().toISOString(),
      };

      const response = await medicalAPI.addPatientTest(payload);
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("auto.failedToAddTest"));
        return;
      }

      toast.success(t("auto.testAddedSuccessfully"));
      setAddTestPatient(null);
    } catch (error) {
      toast.error(error?.response?.data?.Message || t("auto.failedToAddTest"));
    } finally {
      setActionLoading({ type: null, bookingId: null });
    }
  };

  const filters = [
    { id: "all", label: t("common.all") },
    { id: "pending", label: t("bookingStatus.pending") },
    { id: "confirmed", label: t("bookingStatus.confirmed") },
    { id: "pendingPayment", label: t("bookingStatus.pendingPayment") },
    { id: "inProgress", label: t("bookingStatus.inProgress") },
    { id: "completed", label: t("bookingStatus.completed") },
    { id: "cancelled", label: t("bookingStatus.cancelled") },
    { id: "noShow", label: t("bookingStatus.noShow") },
  ];

  // Sort: active sessions first, then pending payment/pending, then completed, then terminal states.
  const sortedPatients = [...patients].sort((a, b) => {
    const statusOrder = {
      inProgress: 0,
      confirmed: 1,
      pendingPayment: 2,
      pending: 3,
      completed: 4,
      cancelled: 5,
      noShow: 6,
    };
    return (statusOrder[a.status] || 6) - (statusOrder[b.status] || 6);
  });

  // Compute stats from current page
  const stats = {
    waiting: patients.filter(
      (p) =>
        p.status === "pending" ||
        p.status === "confirmed" ||
        p.status === "pendingPayment" ||
        p.status === "inProgress",
    ).length,
    avgWait:
      patients.filter((p) => p.waitTime > 0).length > 0
        ? Math.round(
            patients
              .filter((p) => p.waitTime > 0)
              .reduce((sum, p) => sum + p.waitTime, 0) /
              patients.filter((p) => p.waitTime > 0).length,
          )
        : 0,
    completed: patients.filter((p) => p.status === "completed").length,
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading mb-2">
            {t("doctor.patientQueue")}
          </h1>
          <p className="text-text-muted">{t("doctor.manageConsultations")}</p>
        </div>
      </motion.div>

      {/* Cancellation Policy Banner */}
      <div className="flex items-center gap-3 p-4 mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
        <span className="text-amber-600 text-lg shrink-0">⚠️</span>
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
          {t(
            "doctor.cancelWindowHint",
            "Cancellation is allowed only 2 days before the slot start time.",
          )}
        </p>
      </div>

      <div className="space-y-6">
        {/* Queue Stats */}
        <QueueStats stats={stats} />

        {/* Main Queue List */}
        <div className="space-y-6">
          {/* Filters */}
          <FilterChips
            items={filters}
            value={filter}
            onChange={(id) => {
              setFilter(id);
              setPageIndex(1);
            }}
          />

          {/* List */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : sortedPatients.length === 0 ? (
              <div className="text-center py-12 bg-background-paper rounded-xl border border-dashed border-border">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">{t("doctor.noPatientsFound")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPatients.map((patient) => (
                  <QueueItem
                    key={patient.id}
                    patient={patient}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                className="p-2 rounded-lg border border-border hover:bg-background-subtle disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-muted">
                {t("common.page")} {pageIndex} {t("common.of")} {totalPages}
              </span>
              <button
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex((prev) => prev + 1)}
                className="p-2 rounded-lg border border-border hover:bg-background-subtle disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCancelConfirmPatient(null)}
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
                  {t("auto.cancelAppointment")}
                </h3>
                <p className="text-sm text-text-muted mb-1">
                  {cancelConfirmPatient.name}
                </p>
                <p className="text-sm text-text-muted mb-6">
                  {t("auto.areYouSureYouWantToCancelThisAppointment")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setCancelConfirmPatient(null)}
                  >
                    {t("auto.noKeepIt")}
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => {
                      handleCancel(cancelConfirmPatient);
                      setCancelConfirmPatient(null);
                    }}
                    isLoading={
                      actionLoading?.type === "cancel" &&
                      actionLoading?.bookingId ===
                        cancelConfirmPatient.bookingId
                    }
                  >
                    {t("auto.yesCancel")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Test Modal */}
      <AnimatePresence>
        {addTestPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setAddTestPatient(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
            >
              <div className="p-6">
                <div
                  className={`flex items-center gap-2 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-start">
                    <h3 className="text-lg font-bold text-text-heading">
                      {t("auto.addTestForPatient")}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {addTestPatient.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-1">
                      {t("auto.testType")}
                    </label>
                    <select
                      value={addTestForm.testTypeId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedType = testTypes.find((type) => {
                          const typeId = type?.ID ?? type?.Id ?? type?.id;
                          return String(typeId) === String(selectedId);
                        });
                        const selectedTypeScanUrl = String(
                          selectedType?.Url ?? selectedType?.url ?? "",
                        ).trim();

                        setAddTestForm((prev) => ({
                          ...prev,
                          testTypeId: selectedId,
                          scanUrl: selectedTypeScanUrl,
                        }));
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={loadingTestTypes}
                    >
                      <option value="">{t("auto.selectTestType")}</option>
                      {testTypes.map((type) => {
                        const typeId = type?.ID ?? type?.Id ?? type?.id;
                        const typeName =
                          type?.Name ||
                          type?.name ||
                          type?.Title ||
                          type?.title ||
                          `${t("auto.test")} ${typeId}`;
                        return (
                          <option key={String(typeId)} value={String(typeId)}>
                            {typeName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-1">
                      {t("auto.scanUrlFromTestType")}
                    </label>
                    <input
                      type="url"
                      value={addTestForm.scanUrl}
                      readOnly
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t("auto.noUrlConfiguredForThisTestType")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-1">
                      {t("auto.examNotes")}
                    </label>
                    <textarea
                      rows={3}
                      value={addTestForm.examNotes}
                      onChange={(e) =>
                        setAddTestForm((prev) => ({
                          ...prev,
                          examNotes: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder={t("auto.addNotes")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-1">
                      {t("auto.testDate")}
                    </label>
                    <input
                      type="datetime-local"
                      value={addTestForm.testDate}
                      onChange={(e) =>
                        setAddTestForm((prev) => ({
                          ...prev,
                          testDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div
                  className={`mt-6 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Button
                    variant="outline"
                    onClick={() => setAddTestPatient(null)}
                    className="flex-1"
                    disabled={actionLoading?.type === "addTest"}
                  >
                    {t("auto.cancel")}
                  </Button>
                  <Button
                    onClick={handleSubmitAddTest}
                    className="flex-1"
                    isLoading={actionLoading?.type === "addTest"}
                  >
                    {t("auto.saveTest")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Show Results Modal */}
      <AnimatePresence>
        {showResultPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowResultPatient(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-background-paper rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
            >
              <div className="p-6">
                <div
                  className={`flex items-center gap-2 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ResultsIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-start">
                    <h3 className="text-lg font-bold text-text-heading">
                      {t("auto.testResults")}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {showResultPatient.name}
                    </p>
                  </div>
                </div>

                {showResultLoading ? (
                  <div className="py-14 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : showResultItems.length === 0 ? (
                  <div className="py-14 text-center text-text-muted border border-dashed border-border rounded-xl">
                    {t("auto.noTestResultsFoundForThisPatient")}
                  </div>
                ) : (
                  <div className="max-h-[60vh] overflow-y-auto space-y-3 pe-1">
                    {showResultItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-border bg-background"
                      >
                        <div
                          className={`flex items-center justify-between gap-3 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <h4 className="font-semibold text-text-heading">
                            {item.testTypeName}
                          </h4>
                          <span className="text-xs text-text-muted">
                            {item.testDate
                              ? new Date(item.testDate).toLocaleString(
                                  t("auto.enus"),
                                )
                              : "-"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-text-muted">
                            {t("auto.result")}
                          </p>
                          <p className="text-sm text-text-heading whitespace-pre-wrap">
                            {item.result || t("auto.noResultSubmittedYet")}
                          </p>
                        </div>

                        {item.examNotes ? (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm text-text-muted">
                              {t("auto.examNotes")}
                            </p>
                            <p className="text-sm text-text-heading whitespace-pre-wrap">
                              {item.examNotes}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                <div className={`mt-6 flex ${t("auto.justifyend")}`}>
                  <Button
                    variant="outline"
                    onClick={() => setShowResultPatient(null)}
                  >
                    {t("auto.close")}
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
