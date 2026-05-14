import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Filter, Calendar, Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Button from "../../components/ui/Button";
import SelectDropdown from "../../components/ui/SelectDropdown";
import HistoryStats from "../../components/doctor/history/HistoryStats";
import HistoryList from "../../components/doctor/history/HistoryList";
import { doctorAPI, medicalAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { getAppointmentStatusMeta } from "../../lib/appointmentStatus";

export default function SessionHistory() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null); // null = all
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [sessionNotes, setSessionNotes] = useState({});
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const pageSize = 20;

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getBookings(
        pageIndex,
        pageSize,
        statusFilter,
      );
      if (response.IsSuccess && response.Data) {
        setBookings(response.Data.Items || []);
        setTotalPages(response.Data.Pages || 1);
        setTotalRecords(response.Data.Records || 0);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pageIndex, statusFilter]);

  // Format booking data for display
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sessions = bookings.map((booking) => {
    const statusInfo = getAppointmentStatusMeta(booking.Status, {
      t,
      isRTL,
      booking,
    });
    return {
      id: booking.Id,
      date: formatDate(booking.SessionStartTime),
      time: formatTime(booking.SessionStartTime),
      patientName: booking.PatientName,
      patientId: `ID-${booking.PatientId}`,
      duration: booking.DurationMinutes || 0,
      statusKey: statusInfo.key,
      outcome: statusInfo.label,
      paymentConfirmed: booking.PaymentConfirmed,
      note: sessionNotes[booking.Id] || "",
    };
  });

  // Calculate stats
  const stats = {
    totalPatients: totalRecords,
    totalHours:
      Math.round((sessions.reduce((acc, s) => acc + s.duration, 0) / 60) * 10) /
      10,
    earnings: sessions.reduce(
      (acc, s) => acc + (s.statusKey === "completed" ? 500 : 0),
      0,
    ),
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPageIndex(1); // Reset to first page on filter change
  };

  const handleOpenNoteModal = (session) => {
    setSelectedSession(session);
    setNoteText(session?.note || "");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedSession?.id) return;

    try {
      setIsSavingNote(true);
      const response = await doctorAPI.addBookingNote(selectedSession.id, noteText.trim());

      if (response.IsSuccess) {
        setSessionNotes((prev) => ({
          ...prev,
          [selectedSession.id]: noteText.trim(),
        }));

        setIsNoteModalOpen(false);
        setSelectedSession(null);
        setNoteText("");
        toast.success(t("success.saved", "Saved successfully"));
      } else {
        toast.error(response.Message || t("errors.somethingWentWrong", "Something went wrong"));
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error(t("errors.somethingWentWrong", "Something went wrong"));
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleViewPatientHistory = async (session) => {
    if (!session?.id) return;

    try {
      setIsLoadingHistory(true);
      setSelectedSession(session);
      setIsViewNoteModalOpen(true);

      // Extract patientId from patientId field (format: "ID-123" or just the ID)
      const patientIdValue = session.patientId?.replace(/^ID-/, '') || session.id;

      const response = await medicalAPI.getPatientHistory(patientIdValue, 1, 100);

      if (response.IsSuccess && response.Data) {
        setPatientHistory(response.Data);
      } else {
        toast.error(response.Message || t("errors.somethingWentWrong", "Something went wrong"));
      }
    } catch (error) {
      console.error("Failed to fetch patient history:", error);
      toast.error(t("errors.somethingWentWrong", "Something went wrong"));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto" >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
            {t("doctor.sessionHistory")}
          </h1>
          <p className="text-sm sm:text-base text-text-light">{t("doctor.sessionHistoryDesc")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {t("doctor.thisMonth")}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t("doctor.exportCSV")}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <HistoryStats stats={stats} />

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background-paper p-3 sm:p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-text-light text-sm font-medium shrink-0">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.filterBy")}:</span>
          </div>
          <SelectDropdown
            value={statusFilter === null ? "" : String(statusFilter)}
            onChange={(val) =>
              handleStatusFilter(val === "" ? null : parseInt(val))
            }
            size="sm"
            options={[
              { value: "", label: t("common.allStatus") },
              { value: "1", label: t("bookingStatus.pending") },
              { value: "2", label: t("bookingStatus.confirmed") },
              { value: "7", label: t("bookingStatus.pendingPayment") },
              { value: "3", label: t("bookingStatus.inProgress") },
              { value: "4", label: t("bookingStatus.completed") },
              { value: "5", label: t("bookingStatus.cancelled") },
              { value: "6", label: t("bookingStatus.noShow") },
            ]}
            className="w-full sm:w-48"
          />
        </div>
        <div className="text-sm text-text-muted">
          {t("common.showing")}{" "}
          <span className="font-semibold text-text-heading">
            {totalRecords}
          </span>{" "}
          {t("common.results")}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <HistoryList sessions={sessions} onNoteClick={handleOpenNoteModal} onViewNoteClick={handleViewPatientHistory} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4 me-1" />
                ) : (
                  <ChevronLeft className="w-4 h-4 me-1" />
                )}
                {t("common.previous")}
              </Button>
              <span className="text-sm text-text-muted">
                {t("common.page")} {pageIndex} {t("common.of")} {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex((prev) => prev + 1)}
              >
                {t("common.next")}
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4 ms-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 ms-1" />
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedSession(null);
          setNoteText("");
        }}
        title={t("common.notes", "Notes")}
        size="md"
      >
        <div className="space-y-4" >
          {selectedSession && (
            <div className="rounded-xl border border-border bg-background-subtle p-3 text-sm text-text-muted">
              <p>
                {t("auto.session")}{" "}
                <span className="font-semibold text-text-heading">
                  {selectedSession.patientName}
                </span>
              </p>
              <p>
                {t("auto.date")}{" "}
                <span className="font-medium text-text-heading">
                  {selectedSession.date}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              {t("auto.writeNoteDescription")}
            </label>
            <textarea
              rows={5}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={
                t("auto.writeYourNoteHere")
              }
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsNoteModalOpen(false);
                setSelectedSession(null);
                setNoteText("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveNote}
              className="gap-2"
              disabled={!noteText.trim() || isSavingNote}
              loading={isSavingNote}
            >
              <FileText className="w-4 h-4" />
              {isSavingNote ? t("common.saving", "Saving...") : t("common.save", "Save")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Patient History Modal */}
      <Modal
        isOpen={isViewNoteModalOpen}
        onClose={() => {
          setIsViewNoteModalOpen(false);
          setSelectedSession(null);
          setPatientHistory(null);
        }}
        title={t("doctor.medicalHistory", "Medical History")}
        size="lg"
      >
        <div className="space-y-4" >
          {selectedSession && (
            <div className="rounded-xl border border-border bg-background-subtle p-3 text-sm text-text-muted">
              <p>
                {t("auto.patient")}{" "}
                <span className="font-semibold text-text-heading">
                  {selectedSession.patientName}
                </span>
              </p>
              <p>
                {t("auto.date")}{" "}
                <span className="font-medium text-text-heading">
                  {selectedSession.date}
                </span>
              </p>
            </div>
          )}

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : patientHistory?.Items && patientHistory.Items.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {patientHistory.Items.map((record, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-border rounded-lg bg-background hover:bg-background-subtle transition-colors space-y-2"
                >
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        record.Type === 1
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {record.Type === 1 ? (t("auto.medicalTest")) : (t("auto.doctorNote"))}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {record.Date ? new Date(record.Date).toLocaleDateString() : "Invalid Date"}
                    </span>
                  </div>

                  {/* Doctor Name */}
                  {record.DoctorName && (
                    <div>
                      <p className="text-sm font-semibold text-text-heading">
                        {t("auto.doctor")} {record.DoctorName}
                      </p>
                    </div>
                  )}

                  {/* Test Type Name */}
                  {record.TestTypeName && (
                    <div>
                      <p className="text-xs font-medium text-text-muted mb-1">
                        {t("auto.testType")}
                      </p>
                      <p className="text-sm text-text-light">{record.TestTypeName}</p>
                    </div>
                  )}

                  {/* Test Type Description */}
                  {record.TestTypeDescription && (
                    <div>
                      <p className="text-xs font-medium text-text-muted mb-1">
                        {t("auto.description")}
                      </p>
                      <p className="text-sm text-text-light">{record.TestTypeDescription}</p>
                    </div>
                  )}

                  {/* Doctor Note (Type 2) */}
                  {record.DoctorNote && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded">
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        {t("auto.doctorNote")}
                      </p>
                      <p className="text-sm text-yellow-900 dark:text-yellow-200">{record.DoctorNote}</p>
                    </div>
                  )}

                  {/* Exam Notes */}
                  {record.ExamNotes && (
                    <div>
                      <p className="text-xs font-medium text-text-muted mb-1">
                        {t("auto.examNotes")}
                      </p>
                      <p className="text-sm text-text-light">{record.ExamNotes}</p>
                    </div>
                  )}

                  {/* Result */}
                  {record.Result && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 rounded">
                      <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                        {t("auto.result")}
                      </p>
                      <p className="text-sm text-green-900 dark:text-green-200 font-medium">{record.Result}</p>
                    </div>
                  )}

                  {/* Scan URL */}
                  {record.ScanUrl && (
                    <div>
                      <p className="text-xs font-medium text-text-muted mb-1">
                        {t("auto.file")}
                      </p>
                      <a
                        href={record.ScanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {record.ScanUrl.length > 50
                          ? `${record.ScanUrl.substring(0, 50)}...`
                          : record.ScanUrl}
                      </a>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted">
              {t("auto.noMedicalHistoryFound")}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewNoteModalOpen(false);
                setSelectedSession(null);
                setPatientHistory(null);
              }}
            >
              {t("common.close", "Close")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
