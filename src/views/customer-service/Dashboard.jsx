import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import { useToast } from "../../components/ui/Toast";
import {
  Search,
  Filter,
  Loader2,
  CheckCircle,
  X,
  ExternalLink as OpenInNew,
  Receipt as ReceiptLong,
  Clock as PendingActions,
  BadgeCheck as Verified,
  Wallet as AccountBalanceWallet,
  User as Person,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import { customerSupportAPI, chatAPI, extractErrorMessage } from "../../lib/api";
import { Roles, useAuth } from "../../contexts/AuthContext";
import { canStaffViewSupportRoom, isSensitiveSupportRoom } from "../../lib/supportAccess";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getPaymentStatusFilterOptions,
  getPaymentStatusMeta,
  normalizePaymentStatus,
} from "../../lib/paymentStatus";
import { getRoomCaseTypeMeta, getSupportRoomTimestamp, readLocalRoomCaseTypes, sortSupportRooms } from "../../lib/supportCaseTypes";
import SupportCaseTag from "../../components/support/SupportCaseTag";
import SupportPriorityTag, { getSupportPriority } from "../../components/support/SupportPriorityTag";
import { getAppointmentStatusKey } from "../../lib/appointmentStatus";
import { readCustomerSupportAvailability } from "../../lib/customerSupportAvailability";

export default function CustomerServiceDashboard() {
  const { t, isRTL } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeModule, setActiveModule] = useState("manual-payments");

  const [manualPayments, setManualPayments] = useState([]);
  const [manualPaymentsLoading, setManualPaymentsLoading] = useState(false);
  const [manualPaymentsPage, setManualPaymentsPage] = useState(1);
  const [manualPaymentsPagesCount, setManualPaymentsPagesCount] = useState(1);
  const [manualPaymentsSearch, setManualPaymentsSearch] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundsPage, setRefundsPage] = useState(1);
  const [refundsPagesCount, setRefundsPagesCount] = useState(1);
  const [refundsStatusFilter, setRefundsStatusFilter] = useState("all");
  const [refundSearch, setRefundSearch] = useState("");
  const [processingRefundId, setProcessingRefundId] = useState(null);
  const [refundProcessMode, setRefundProcessMode] = useState(null);
  const [processingRefundItem, setProcessingRefundItem] = useState(null);
  const [refundProcessNotes, setRefundProcessNotes] = useState("");

  // Chat rooms state
  const [chatRooms, setChatRooms] = useState([]);
  const [chatRoomsLoading, setChatRoomsLoading] = useState(false);
  const [chatRoomsSearch, setChatRoomsSearch] = useState("");
  const [chatRoomsTypeFilter, setChatRoomsTypeFilter] = useState("all");
  const [priorityUpdatingRoomId, setPriorityUpdatingRoomId] = useState(null);
  const [isSupportAvailable, setIsSupportAvailable] = useState(() => readCustomerSupportAvailability(user) ?? false);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);

  const tx = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  useEffect(() => {
    const currentAvailability = readCustomerSupportAvailability(user);
    if (currentAvailability !== null) {
      setIsSupportAvailable(currentAvailability);
    }
  }, [user]);

  const statusFilterOptions = [
    { value: "all", label: t("common.allStatuses") },
    ...getPaymentStatusFilterOptions({ isRTL }),
  ];

  const refundStatusOptions = [
    { value: "all", label: t("common.allStatuses") },
    { value: "1", label: t("auto.pendingReview") },
    { value: "2", label: t("auto.approved") },
    { value: "3", label: t("auto.rejected") },
  ];

  const getRefundStatusMeta = (statusValue) => {
    const normalized = Number(statusValue);
    if (normalized === 2) {
      return {
        value: 2,
        label: t("auto.approved"),
        chipClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (normalized === 3) {
      return {
        value: 3,
        label: t("auto.rejected"),
        chipClass: "bg-red-50 text-red-700 border-red-200",
      };
    }

    return {
      value: 1,
      label: t("auto.pendingReview"),
      chipClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  };

  const fetchManualPayments = async (
    page = 1,
    statusFilter = selectedStatusFilter,
  ) => {
    setManualPaymentsLoading(true);
    try {
      const statusValue = statusFilter === "all" ? null : Number(statusFilter);
      const response = await customerSupportAPI.getManualPayments(
        page,
        20,
        statusValue,
      );
      if (response?.IsSuccess !== false && response?.Data) {
        setManualPayments(response.Data.Items || []);
        setManualPaymentsPage(Number(response.Data.PageIndex || page));
        setManualPaymentsPagesCount(Number(response.Data.Pages || 1));
      } else {
        toast.error(response?.Message || t("errors.loadFailed"));
      }
    } catch (error) {
      console.error("Failed to fetch manual payments:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setManualPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchManualPayments(1, selectedStatusFilter);
  }, [selectedStatusFilter]);

  const fetchRefunds = async (page = 1, statusFilter = refundsStatusFilter) => {
    setRefundsLoading(true);
    try {
      const statusValue = statusFilter === "all" ? null : Number(statusFilter);
      const response = await customerSupportAPI.getRefunds(
        page,
        20,
        statusValue,
      );

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.loadFailed"));
        setRefunds([]);
        return;
      }

      const data = response?.Data ?? response?.data ?? response;
      const items = Array.isArray(data?.Items)
        ? data.Items
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];

      setRefunds(items);
      setRefundsPage(Number(data?.PageIndex || data?.pageIndex || page));
      setRefundsPagesCount(Number(data?.Pages || data?.pages || 1));
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      toast.error(t("errors.loadFailed"));
      setRefunds([]);
    } finally {
      setRefundsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds(1, refundsStatusFilter);
  }, [refundsStatusFilter]);

  const fetchChatRooms = useCallback(async () => {
    setChatRoomsLoading(true);
    try {
      const response = await chatAPI.getRooms();
      const data = response?.Data ?? response?.data ?? response;
      const items = Array.isArray(data?.Items)
        ? data.Items
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];
      setChatRooms(items);
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
    } finally {
      setChatRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const getProviderLabel = (providerValue) => {
    const value = Number(providerValue);
    if (value === 2) return "InstaPay";
    if (value === 3) return t("staff.cashWallet");
    return `${t("staff.provider")} #${providerValue ?? "-"}`;
  };

  const getManualPaymentParticipants = (item) => {
    const bookingId = String(item?.BookingId ?? item?.bookingId ?? "");
    const patientId = String(item?.PatientId ?? item?.patientId ?? "");
    const matchedRoom = chatRooms.find((room) => {
      const roomBookingId = String(room?.BookingId ?? room?.bookingId ?? "");
      if (bookingId && roomBookingId === bookingId) return true;
      const roomPatientId = String(room?.PatientId ?? room?.patientId ?? "");
      return !bookingId && patientId && roomPatientId === patientId;
    });

    return {
      patientName:
        item?.PatientName ??
        item?.patientName ??
        item?.Patient?.Name ??
        item?.patient?.name ??
        item?.Booking?.PatientName ??
        item?.booking?.patientName ??
        matchedRoom?.PatientName ??
        matchedRoom?.patientName ??
        t("common.unknownPatient", "Unknown patient"),
      doctorName:
        item?.DoctorName ??
        item?.doctorName ??
        item?.DoctorFullName ??
        item?.TherapistName ??
        item?.Doctor?.Name ??
        item?.doctor?.name ??
        item?.Booking?.DoctorName ??
        item?.booking?.doctorName ??
        matchedRoom?.DoctorName ??
        matchedRoom?.doctorName ??
        t("common.unknownDoctor", "Unknown doctor"),
    };
  };

  const hasCancellationLock = (item) => {
    const cancellationStatus = String(
      item?.CancellationStatus ??
        item?.CancellationRequestStatus ??
        item?.RefundStatus ??
        "",
    ).toLowerCase();
    const bookingStatus =
      item?.BookingStatus ?? item?.bookingStatus ?? item?.AppointmentStatus;
    return (
      item?.IsCancellationPending === true ||
      item?.CancellationRequested === true ||
      item?.IsCancelled === true ||
      cancellationStatus.includes("pending") ||
      cancellationStatus.includes("approve") ||
      cancellationStatus.includes("cancel") ||
      (bookingStatus !== undefined &&
        getAppointmentStatusKey(bookingStatus, item) === "cancelled")
    );
  };

  const filteredManualPayments = useMemo(() => {
    const q = manualPaymentsSearch.trim().toLowerCase();
    return manualPayments.filter((item) => {
      if (!q) return true;

      const patientName = String(item?.PatientName || "").toLowerCase();
      const { doctorName } = getManualPaymentParticipants(item);
      const referenceNumber = String(item?.ReferenceNumber || "").toLowerCase();
      const bookingId = String(item?.BookingId || "").toLowerCase();
      const paymentId = String(item?.Id || "").toLowerCase();

      return (
        patientName.includes(q) ||
        String(doctorName).toLowerCase().includes(q) ||
        referenceNumber.includes(q) ||
        bookingId.includes(q) ||
        paymentId.includes(q)
      );
    });
  }, [chatRooms, manualPayments, manualPaymentsSearch]);

  const manualSummary = useMemo(() => {
    const pending = manualPayments.filter(
      (item) => normalizePaymentStatus(item?.Status) === 1,
    ).length;
    const completed = manualPayments.filter(
      (item) => normalizePaymentStatus(item?.Status) === 2,
    ).length;
    const failed = manualPayments.filter(
      (item) => normalizePaymentStatus(item?.Status) === 3,
    ).length;
    const refunded = manualPayments.filter(
      (item) => normalizePaymentStatus(item?.Status) === 4,
    ).length;
    return {
      total: manualPayments.length,
      pending,
      completed,
      failed,
      refunded,
    };
  }, [manualPayments]);

  const refundsSummary = useMemo(() => {
    const pending = refunds.filter(
      (item) => Number(item?.Status ?? item?.status) === 1,
    ).length;
    const approved = refunds.filter(
      (item) => Number(item?.Status ?? item?.status) === 2,
    ).length;
    const rejected = refunds.filter(
      (item) => Number(item?.Status ?? item?.status) === 3,
    ).length;

    return {
      total: refunds.length,
      pending,
      approved,
      rejected,
    };
  }, [refunds]);

  const getCaseTypeMeta = (room) => {
    const meta = getRoomCaseTypeMeta(room, isRTL, readLocalRoomCaseTypes());
    return { ...meta, cls: meta.className };
  };

  const visibleChatRooms = useMemo(() => {
    const localMap = readLocalRoomCaseTypes();
    const query = chatRoomsSearch.trim().toLowerCase();
    return sortSupportRooms(
      chatRooms.filter((room) => {
        const meta = getRoomCaseTypeMeta(room, isRTL, localMap);
        const matchesType = chatRoomsTypeFilter === "all" || meta.key === chatRoomsTypeFilter;
        const matchesSearch =
          !query ||
          String(room.OtherParticipantName || room.Name || "").toLowerCase().includes(query) ||
          String(room.LastMessage || "").toLowerCase().includes(query);
        const canView = canStaffViewSupportRoom(room, user, role, localMap);
        return matchesType && matchesSearch && canView;
      }),
      localMap,
    );
  }, [chatRooms, chatRoomsSearch, chatRoomsTypeFilter, isRTL, role, user]);

  const moduleTabs = [
    {
      id: "manual-payments",
      icon: ReceiptLong,
      title: t("auto.manualPayments"),
      subtitle: t("auto.reviewTransferProofs"),
      count: manualSummary.pending,
    },
    {
      id: "refunds",
      icon: AccountBalanceWallet,
      title: t("auto.refundRequests"),
      subtitle: t("auto.approveOrRejectRefunds"),
      count: refundsSummary.pending,
    },
    {
      id: "chat-rooms",
      icon: MessageSquare,
      title: t("auto.chatRooms"),
      subtitle: t("auto.patientConversations"),
      count: chatRooms.filter((r) => Number(r.UnreadCount) > 0).length,
    },
  ];

  const activeModuleMeta =
    moduleTabs.find((item) => item.id === activeModule) || moduleTabs[0];

  const supportOverview = useMemo(() => {
    const localMap = readLocalRoomCaseTypes();
    return {
      total: chatRooms.length,
      urgent: chatRooms.filter((room) => getRoomCaseTypeMeta(room, false, localMap).priority).length,
      unread: chatRooms.filter((room) => Number(room.UnreadCount) > 0).length,
      resolved: chatRooms.filter((room) => room.IsActive === false).length,
    };
  }, [chatRooms]);

  const supportTypeOverview = useMemo(() => {
    const localMap = readLocalRoomCaseTypes();
    const order = ["technical", "medical", "billing", "emergency", "blackmail_abuse"];
    return order.map((key) => {
      const sampleRoom = { SupportCaseType: key };
      const meta = getRoomCaseTypeMeta(sampleRoom, isRTL, localMap);
      return {
        key,
        label: meta.label,
        className: meta.className,
        count: chatRooms.filter((room) => getRoomCaseTypeMeta(room, false, localMap).key === key).length,
      };
    });
  }, [chatRooms, isRTL]);

  const handleConfirmPayment = async (paymentItem) => {
    if (hasCancellationLock(paymentItem)) {
      toast.error(
        t("staff.cancelledBookingCannotBeApproved", "A cancelled or cancellation-pending session cannot be approved."),
      );
      return;
    }
    setActionLoadingId(paymentItem.Id);
    try {
      const response = await customerSupportAPI.confirmManualPayment(
        paymentItem.Id,
      );
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.somethingWentWrong"));
      } else {
        toast.success(t("staff.paymentConfirmed"));
        await fetchManualPayments(manualPaymentsPage, selectedStatusFilter);
      }
    } catch (error) {
      console.error("Failed to confirm manual payment:", error);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (paymentItem) => {
    setRejectingPayment(paymentItem);
    setRejectionReason("");
  };

  const handleRejectPayment = async () => {
    if (!rejectingPayment) return;

    setActionLoadingId(rejectingPayment.Id);
    try {
      const response = await customerSupportAPI.rejectManualPayment(
        rejectingPayment.Id,
        rejectionReason.trim(),
      );
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.somethingWentWrong"));
      } else {
        toast.success(t("staff.paymentRejected"));
        setRejectingPayment(null);
        setRejectionReason("");
        await fetchManualPayments(manualPaymentsPage, selectedStatusFilter);
      }
    } catch (error) {
      console.error("Failed to reject manual payment:", error);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRefundProcessModal = (refundItem, mode) => {
    setProcessingRefundItem(refundItem);
    setRefundProcessMode(mode);
    setRefundProcessNotes("");
  };

  const handleProcessRefund = async () => {
    if (!processingRefundItem || !refundProcessMode) return;

    const notesPrefix =
      refundProcessMode === "approve"
        ? t("auto.approvedByTechnicalSupport")
        : t("auto.rejectedByTechnicalSupport");
    const notesValue = String(refundProcessNotes || "").trim();
    const notes = notesValue ? `${notesPrefix}: ${notesValue}` : notesPrefix;

    setProcessingRefundId(processingRefundItem?.Id);
    try {
      const response = refundProcessMode === "approve"
        ? await customerSupportAPI.processRefund(processingRefundItem?.Id, notes)
        : await customerSupportAPI.rejectRefund(processingRefundItem?.Id, notes);
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.somethingWentWrong"));
      } else {
        toast.success(
          refundProcessMode === "approve"
            ? t("auto.refundApproved")
            : t("auto.refundRejected"),
        );
        setProcessingRefundItem(null);
        setRefundProcessMode(null);
        setRefundProcessNotes("");
        await fetchRefunds(refundsPage, refundsStatusFilter);
      }
    } catch (error) {
      console.error("Failed to process refund:", error);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setProcessingRefundId(null);
    }
  };

  const handlePriorityChange = async (room, priority) => {
    const roomId = room?.Id || room?.id;
    if (!roomId) return;

    const previousRooms = chatRooms;
    const patchRoom = (item) => {
      const itemId = item?.Id || item?.id;
      if (String(itemId) !== String(roomId)) return item;
      return {
        ...item,
        Priority: priority,
        SupportPriority: priority,
        IsHighPriority: priority === "urgent",
      };
    };

    setPriorityUpdatingRoomId(roomId);
    setChatRooms((items) => items.map(patchRoom));
    try {
      const response = await chatAPI.updateSupportPriority(roomId, priority);
      if (response?.IsSuccess === false) {
        throw new Error(response?.Message || response?.message);
      }
      toast.success(tx("support.priorityUpdated", "Priority updated"));
    } catch (error) {
      console.error("Failed to update support priority:", error);
      setChatRooms(previousRooms);
      toast.error(tx("support.priorityUpdateFailed", "Could not update priority"));
    } finally {
      setPriorityUpdatingRoomId(null);
    }
  };

  const handleAvailabilityChange = async (nextAvailability) => {
    if (availabilityUpdating || role !== Roles.STAFF) return;

    const previousAvailability = isSupportAvailable;
    setIsSupportAvailable(nextAvailability);
    setAvailabilityUpdating(true);

    try {
      const response = await customerSupportAPI.updateAvailability(nextAvailability);
      if (response?.IsSuccess === false) {
        throw new Error(response?.Message || response?.message);
      }

      const confirmedAvailability = nextAvailability;
      setIsSupportAvailable(confirmedAvailability);
      toast.success(
        confirmedAvailability
          ? tx("support.nowActive", "You are now Active")
          : tx("support.nowInactive", "You are now Inactive"),
      );
    } catch (error) {
      setIsSupportAvailable(previousAvailability);
      toast.error(
        extractErrorMessage(
          error,
          tx("support.availabilityUpdateFailed", "Could not update your availability. Please try again."),
        ),
      );
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const filteredRefunds = useMemo(() => {
    const q = String(refundSearch || "")
      .trim()
      .toLowerCase();
    if (!q) return refunds;

    return refunds.filter((item) => {
      const patientName = String(
        item?.PatientName || item?.patientName || "",
      ).toLowerCase();
      const bookingId = String(
        item?.BookingId || item?.bookingId || "",
      ).toLowerCase();
      const refundId = String(item?.Id || item?.id || "").toLowerCase();
      const reason = String(
        item?.Reason || item?.CancellationReason || "",
      ).toLowerCase();
      return (
        patientName.includes(q) ||
        bookingId.includes(q) ||
        refundId.includes(q) ||
        reason.includes(q)
      );
    });
  }, [refunds, refundSearch]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-secondary/10 to-background-paper p-4 sm:p-6 md:p-8"
      >
        <div className="absolute -top-16 -end-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -start-14 h-52 w-52 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative grid lg:grid-cols-3 gap-4 sm:gap-5 items-center">
          <div className="lg:col-span-2 space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-heading">
              {activeModuleMeta.title}
            </h1>
            <p className="text-text-muted max-w-2xl">
              {activeModule === "manual-payments"
                ? t("staff.manualPaymentDesc")
                : t(
                    "auto.trackRefundRequestsCreatedFromPaidCancellationsThenApproveOrRejectEachRequestWithClearNotes",
                  )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeModule === "manual-payments" ? (
              <>
                <SummaryChip
                  icon={ReceiptLong}
                  label={t("common.total")}
                  value={manualSummary.total}
                  tone="text-primary"
                />
                <SummaryChip
                  icon={PendingActions}
                  label={t("auto.pending")}
                  value={manualSummary.pending}
                  tone="text-amber-300"
                />
                <SummaryChip
                  icon={Verified}
                  label={t("auto.completed")}
                  value={manualSummary.completed}
                  tone="text-emerald-300"
                />
                <SummaryChip
                  icon={X}
                  label={t("auto.failed")}
                  value={manualSummary.failed}
                  tone="text-red-300"
                />
                <SummaryChip
                  icon={AccountBalanceWallet}
                  label={t("auto.refunded")}
                  value={manualSummary.refunded}
                  tone="text-sky-300"
                />
              </>
            ) : (
              <>
                <SummaryChip
                  icon={AccountBalanceWallet}
                  label={t("common.total")}
                  value={refundsSummary.total}
                  tone="text-primary"
                />
                <SummaryChip
                  icon={PendingActions}
                  label={t("auto.pendingReview")}
                  value={refundsSummary.pending}
                  tone="text-amber-300"
                />
                <SummaryChip
                  icon={CheckCircle}
                  label={t("auto.approved")}
                  value={refundsSummary.approved}
                  tone="text-emerald-300"
                />
                <SummaryChip
                  icon={X}
                  label={t("auto.rejected")}
                  value={refundsSummary.rejected}
                  tone="text-red-300"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [MessageSquare, tx("support.totalCases", "Total cases"), supportOverview.total, "bg-blue-50 text-blue-700"],
          [AlertTriangle, tx("support.emergencyCases", "Emergency cases"), supportOverview.urgent, "bg-red-50 text-red-700"],
          [PendingActions, tx("support.waitingReply", "Waiting reply"), supportOverview.unread, "bg-amber-50 text-amber-700"],
          [Verified, tx("staff.resolved", "Resolved"), supportOverview.resolved, "bg-emerald-50 text-emerald-700"],
        ].map(([Icon, label, value, tone]) => (
          <div key={label} className="rounded-[20px] border border-border bg-background-paper p-4 shadow-[var(--ds-shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-2xl font-black text-text-heading">{value}</p><p className="mt-1 text-xs font-bold text-text-muted">{label}</p></div>
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-background-paper p-3 shadow-sm">
        {supportTypeOverview.map((item) => (
          <span key={item.key} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${item.className}`}>
            {item.label}
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px]">{item.count}</span>
          </span>
        ))}
      </div>

      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {moduleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeModule === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveModule(tab.id)}
                  className={`w-full rounded-2xl border p-4 text-start transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-background-subtle text-primary"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-heading">
                          {tab.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {tab.subtitle}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        tab.count > 0
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-background-subtle text-text-muted border-border"
                      }`}
                    >
                      {tab.count} {t("auto.pending")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {activeModule === "manual-payments" && (
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-4">
            <CardTitle className="text-xl">{t("staff.requestsList")}</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  value={manualPaymentsSearch}
                  onChange={(e) => setManualPaymentsSearch(e.target.value)}
                  placeholder={t("staff.searchManualPayment")}
                  className="ps-9 pe-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text w-full"
                />
              </div>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text"
              >
                {statusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fetchManualPayments(manualPaymentsPage, selectedStatusFilter)
                }
              >
                <Filter className="w-4 h-4" />
                {t("common.refresh")}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-5 space-y-4">
            {manualPaymentsLoading ? (
              <div className="text-center py-16 text-text-muted">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                {t("staff.loadingManualPayments")}
              </div>
            ) : filteredManualPayments.length === 0 ? (
              <div className="text-center py-16 text-text-muted">
                <ReceiptLong className="w-10 h-10 mx-auto mb-2 opacity-40" />
                {t("staff.noManualPayments")}
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {filteredManualPayments.map((item, index) => {
                  const { patientName, doctorName } = getManualPaymentParticipants(item);
                  const statusMeta = getPaymentStatusMeta(item?.Status, {
                    isRTL,
                  });
                  const createdAtText = item?.CreatedAt
                    ? new Date(item.CreatedAt).toLocaleString()
                    : "-";
                  const sessionTimeText = item?.SessionStartTime
                    ? new Date(item.SessionStartTime).toLocaleString()
                    : "-";
                  const isBusy = actionLoadingId === item.Id;
                  const isPendingPayment = statusMeta.value === 1;
                  const cancellationLocked = hasCancellationLock(item);

                  return (
                    <motion.div
                      key={item.Id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="rounded-2xl border border-border bg-background-paper p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-heading truncate text-sm sm:text-base">
                            {patientName}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            {t("common.doctor", "Doctor")}: {doctorName} · {t("common.patient", "Patient")}: {patientName}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border font-medium whitespace-nowrap shrink-0 ${statusMeta.chipClass}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-text-muted mb-4">
                        <p className="flex items-center gap-2 min-w-0">
                          <AccountBalanceWallet className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{getProviderLabel(item.Provider)}</span>
                        </p>
                        <p className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-text-muted shrink-0">{t("staff.referenceNumber")}:</span>
                          <span className="truncate text-text-heading font-medium" dir="ltr">{item.ReferenceNumber || "-"}</span>
                        </p>
                        <p className="text-xs">
                          <span className="text-text-muted">{t("staff.sessionTime")}: </span>
                          <span dir="ltr" className="text-text-heading">{sessionTimeText}</span>
                        </p>
                        <p className="text-xs">
                          <span className="text-text-muted">{t("staff.submittedAt")}: </span>
                          <span dir="ltr" className="text-text-heading">{createdAtText}</span>
                        </p>
                        {item.RejectionReason && (
                          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mt-2">
                            <span className="font-medium">{t("staff.rejectionReason")}:</span> {item.RejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
                        {item.ScreenshotUrl ? (
                          <a
                            href={item.ScreenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0"
                          >
                            <Button variant="outline" size="sm" className="whitespace-nowrap gap-1.5">
                              <OpenInNew className="w-4 h-4" />
                              {t("common.view")}
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted inline-flex items-center gap-1.5 shrink-0">
                            <Person className="w-3.5 h-3.5" />
                            {t("staff.noScreenshot")}
                          </span>
                        )}

                        {isPendingPayment && !cancellationLocked ? (
                          <div className="flex flex-wrap items-center gap-2 ms-auto">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isBusy}
                              onClick={() => handleConfirmPayment(item)}
                              className="whitespace-nowrap gap-1.5"
                            >
                              {isBusy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {t("auto.markCompleted")}
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isBusy}
                              onClick={() => openRejectModal(item)}
                              className="whitespace-nowrap gap-1.5"
                            >
                              <X className="w-4 h-4" />
                              {t("auto.markFailed")}
                            </Button>
                          </div>
                        ) : cancellationLocked ? (
                          <span className="text-xs font-semibold text-amber-700 ms-auto">
                            {t("auto.cancellationPending", "Cancellation pending review")}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted ms-auto">
                            {t("auto.alreadyProcessed")}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {manualPaymentsPagesCount > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-text-muted">
                  {t("common.page")} {manualPaymentsPage} {t("common.of")}{" "}
                  {manualPaymentsPagesCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={manualPaymentsPage <= 1 || manualPaymentsLoading}
                    onClick={() =>
                      fetchManualPayments(
                        manualPaymentsPage - 1,
                        selectedStatusFilter,
                      )
                    }
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      manualPaymentsPage >= manualPaymentsPagesCount ||
                      manualPaymentsLoading
                    }
                    onClick={() =>
                      fetchManualPayments(
                        manualPaymentsPage + 1,
                        selectedStatusFilter,
                      )
                    }
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeModule === "refunds" && (
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-4">
            <CardTitle className="text-xl">
              {t("auto.refundRequests")}
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  value={refundSearch}
                  onChange={(e) => setRefundSearch(e.target.value)}
                  placeholder={t("auto.searchByPatientOrBooking")}
                  className="ps-9 pe-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text w-full"
                />
              </div>

              <select
                value={refundsStatusFilter}
                onChange={(e) => setRefundsStatusFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text"
              >
                {refundStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRefunds(refundsPage, refundsStatusFilter)}
              >
                <Filter className="w-4 h-4" />
                {t("common.refresh")}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-5 space-y-4">
            {refundsLoading ? (
              <div className="text-center py-16 text-text-muted">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                {t("auto.loadingRefundRequests")}
              </div>
            ) : filteredRefunds.length === 0 ? (
              <div className="text-center py-16 text-text-muted">
                <AccountBalanceWallet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                {t("auto.noRefundRequestsFound")}
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {filteredRefunds.map((item, index) => {
                  const itemId = item?.Id ?? item?.id;
                  const bookingId = item?.BookingId ?? item?.bookingId;
                  const statusMeta = getRefundStatusMeta(
                    item?.Status ?? item?.status,
                  );
                  const isPending = statusMeta.value === 1;
                  const isBusy = processingRefundId === itemId;
                  const createdAt =
                    item?.CreatedAt ||
                    item?.createdAt ||
                    item?.RequestedAt ||
                    item?.requestedAt;
                  const createdAtText = createdAt
                    ? new Date(createdAt).toLocaleString()
                    : "-";
                  const amount = Number(
                    item?.Amount ?? item?.RefundAmount ?? item?.amount ?? 0,
                  );
                  const reason =
                    item?.Reason ||
                    item?.CancellationReason ||
                    item?.Notes ||
                    "-";

                  return (
                    <motion.div
                      key={String(itemId || index)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="rounded-2xl border border-border bg-background-paper p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-heading truncate text-sm sm:text-base">
                            {item?.PatientName ||
                              item?.patientName ||
                              t("common.unknownPatient")}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            #{itemId || "-"} · {t("auto.booking")} #{bookingId || "-"}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border font-medium whitespace-nowrap shrink-0 ${statusMeta.chipClass}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <p className="flex items-center justify-between gap-2">
                          <span className="text-text-muted text-xs">{t("auto.amount")}</span>
                          <span className="font-semibold text-text-heading" dir="ltr">
                            {Number.isFinite(amount) && amount > 0 ? `${amount} EGP` : "-"}
                          </span>
                        </p>
                        <p className="text-xs">
                          <span className="text-text-muted">{t("auto.cancellationReason")}: </span>
                          <span className="text-text-heading break-words">{reason}</span>
                        </p>
                        <p className="text-xs">
                          <span className="text-text-muted">{t("auto.requestedAt")}: </span>
                          <span dir="ltr" className="text-text-heading">{createdAtText}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/60">
                        {isPending ? (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isBusy}
                              onClick={() =>
                                openRefundProcessModal(item, "approve")
                              }
                              className="whitespace-nowrap gap-1.5"
                            >
                              {isBusy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {t("auto.approve")}
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isBusy}
                              onClick={() =>
                                openRefundProcessModal(item, "reject")
                              }
                              className="whitespace-nowrap gap-1.5"
                            >
                              <X className="w-4 h-4" />
                              {t("auto.reject")}
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted">
                            {t("auto.alreadyProcessed")}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {refundsPagesCount > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-text-muted">
                  {t("common.page")} {refundsPage} {t("common.of")}{" "}
                  {refundsPagesCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={refundsPage <= 1 || refundsLoading}
                    onClick={() =>
                      fetchRefunds(refundsPage - 1, refundsStatusFilter)
                    }
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      refundsPage >= refundsPagesCount || refundsLoading
                    }
                    onClick={() =>
                      fetchRefunds(refundsPage + 1, refundsStatusFilter)
                    }
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeModule === "chat-rooms" && (
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-4">
            <div>
              <CardTitle className="text-xl">{t("auto.chatRooms")}</CardTitle>
              <p className="mt-1 text-xs text-text-muted">{t("auto.patientConversations")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {role === Roles.STAFF && (
                <Switch
                  checked={isSupportAvailable}
                  loading={availabilityUpdating}
                  disabled={availabilityUpdating}
                  onCheckedChange={handleAvailabilityChange}
                  checkedLabel={tx("support.available", "Available")}
                  uncheckedLabel={tx("support.unavailable", "Unavailable")}
                  ariaLabel={tx("support.availabilityStatus", "Support availability status")}
                  className="justify-center sm:justify-start"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchChatRooms}
                disabled={chatRoomsLoading}
                className="gap-2"
              >
                <Loader2
                  className={`w-4 h-4 ${chatRoomsLoading ? "animate-spin" : "hidden"}`}
                />
                {t("auto.refresh")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={chatRoomsSearch}
                  onChange={(event) => setChatRoomsSearch(event.target.value)}
                  placeholder={t("chat.searchConversations", "Search conversations...")}
                  className="h-12 w-full rounded-xl border border-border bg-background ps-10 pe-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  ["all", t("common.all", "All")],
                  ["emergency", t("support.emergency", "Emergency")],
                  ["technical", t("staff.technical")],
                  ["medical", t("support.medicalInquiry", "Medical")],
                  ["billing", t("staff.payment")],
                  ["appointment", t("staff.appointment")],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setChatRoomsTypeFilter(value)}
                    className={`h-11 whitespace-nowrap rounded-xl border px-3 text-xs font-bold ${
                      chatRoomsTypeFilter === value
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background-paper text-text-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {chatRoomsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : visibleChatRooms.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("auto.noChatRoomsYet")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleChatRooms.map((room) => {
                  const meta = getCaseTypeMeta(room);
                  const updatedAt = getSupportRoomTimestamp(room);
                  const localMap = readLocalRoomCaseTypes();
                  const sensitive = isSensitiveSupportRoom(room, localMap);
                  return (
                    <div
                      key={room.Id || room.id}
                      onClick={() => navigate(`/dashboard/staff/messages?room=${room.Id || room.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/dashboard/staff/messages?room=${room.Id || room.id}`);
                        }
                      }}
                      className={`p-4 rounded-[20px] flex items-center gap-4 border transition-all ${
                        sensitive || meta.priority
                          ? meta.key === "blackmail_abuse"
                            ? "bg-rose-50 border-rose-400 shadow-md shadow-rose-100 ring-1 ring-rose-200"
                            : "bg-red-50 border-red-300 shadow-md shadow-red-100"
                          : "bg-background-paper border-border shadow-[var(--ds-shadow-card)]"
                      } cursor-pointer hover:-translate-y-0.5 hover:border-primary/40`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Person className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-text-heading truncate">
                            {room.OtherParticipantName ||
                              room.Name ||
                              t("auto.unknown")}
                          </h4>
                          <SupportCaseTag room={room} isRTL={isRTL} localMap={readLocalRoomCaseTypes()} size="md" />
                          <SupportPriorityTag room={room} isRTL={isRTL} />
                          <select
                            value={getSupportPriority(room)}
                            disabled={String(priorityUpdatingRoomId || "") === String(room.Id || room.id || "")}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              handlePriorityChange(room, event.target.value);
                            }}
                            className="h-8 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-text outline-none focus:border-primary"
                            aria-label={tx("support.priority", "Priority")}
                          >
                            <option value="normal">{tx("support.normalPriority", "Normal")}</option>
                            <option value="urgent">{tx("support.urgentPriority", "Urgent")}</option>
                          </select>
                          {sensitive && (
                            <span className="rounded-full border border-rose-300 bg-rose-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                              {t("support.sensitiveCase", "Sensitive")}
                            </span>
                          )}
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            Number(room.UnreadCount) > 0
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : room.IsActive === false
                                ? "border-slate-200 bg-slate-50 text-slate-600"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}>
                            {Number(room.UnreadCount) > 0
                              ? t("support.waitingReply", "Waiting reply")
                              : room.IsActive === false
                                ? t("staff.resolved")
                                : t("staff.inProgress")}
                          </span>
                          {Number(room.UnreadCount) > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                              {room.UnreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted truncate mt-0.5">
                          {room.LastMessage || t("auto.noMessagesYet")}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                          <span>{t("support.createdAt", "Created")}: {new Date(room.CreatedAt || room.createdAt || updatedAt).toLocaleString()}</span>
                          <span>{t("support.lastUpdated", "Last updated")}: {new Date(updatedAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); navigate(`/dashboard/staff/messages?room=${room.Id || room.id}`); }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />{tx("support.startChat", "Start chat")}
                          </button>
                          <button type="button" onClick={(event) => { event.stopPropagation(); toast.success(tx("support.caseAssigned", "Case assigned to you")); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-bold text-text">
                            <UserPlus className="h-3.5 w-3.5" />{tx("support.assignCase", "Assign case")}
                          </button>
                          {meta.priority && (
                            <button type="button" onClick={(event) => { event.stopPropagation(); toast.success(tx("support.caseEscalated", "Case escalated")); }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700">
                              <ArrowUpRight className="h-3.5 w-3.5" />{tx("support.escalate", "Escalate")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={Boolean(rejectingPayment)}
        onClose={() => {
          setRejectingPayment(null);
          setRejectionReason("");
        }}
        title={t("staff.rejectManualPayment")}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">{t("staff.rejectPrompt")}</p>

          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder={t("staff.rejectionReasonPlaceholder")}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingPayment(null);
                setRejectionReason("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectPayment}
              disabled={
                !rejectingPayment || actionLoadingId === rejectingPayment?.Id
              }
            >
              {actionLoadingId === rejectingPayment?.Id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {t("common.reject")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(processingRefundItem)}
        onClose={() => {
          setProcessingRefundItem(null);
          setRefundProcessMode(null);
          setRefundProcessNotes("");
        }}
        title={
          refundProcessMode === "approve"
            ? t("auto.approveRefund")
            : t("auto.rejectRefund")
        }
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            {refundProcessMode === "approve"
              ? t("auto.youCanAddAnOptionalNoteBeforeApproval")
              : t("auto.addANoteToClarifyTheRejectionReason")}
          </p>

          <textarea
            value={refundProcessNotes}
            onChange={(e) => setRefundProcessNotes(e.target.value)}
            rows={4}
            placeholder={t("auto.notes")}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setProcessingRefundItem(null);
                setRefundProcessMode(null);
                setRefundProcessNotes("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={refundProcessMode === "approve" ? "primary" : "danger"}
              onClick={handleProcessRefund}
              disabled={
                !processingRefundItem ||
                processingRefundId === processingRefundItem?.Id
              }
            >
              {processingRefundId === processingRefundItem?.Id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : refundProcessMode === "approve" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {refundProcessMode === "approve"
                ? t("auto.confirmApproval")
                : t("auto.confirmRejection")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryChip({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background-paper/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-muted">{label}</p>
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <p className="text-xl font-bold text-text-heading mt-1">{value}</p>
    </div>
  );
}
