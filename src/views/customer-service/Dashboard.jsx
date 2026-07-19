import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import { useToast } from "../../components/ui/Toast";
import {
  Search,
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
  LayoutGrid,
  Timer,
  RotateCw,
  Sun,
  Sunrise,
  Moon,
} from "lucide-react";
import {
  DashboardCard,
  KPIWidget,
  FilterBar,
  QuickModule,
  RequestCard,
} from "../../components/dashboard";
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
  const mutationInFlightRef = useRef(new Set());
  const availabilityInFlightRef = useRef(false);
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

  const supportOverview = useMemo(() => {
    const localMap = readLocalRoomCaseTypes();
    return {
      total: chatRooms.length,
      urgent: chatRooms.filter((room) => getRoomCaseTypeMeta(room, false, localMap).priority).length,
      unread: chatRooms.filter((room) => Number(room.UnreadCount) > 0).length,
      resolved: chatRooms.filter((room) => room.IsActive === false).length,
    };
  }, [chatRooms]);

  const handleConfirmPayment = async (paymentItem) => {
    const actionKey = `confirm-payment:${paymentItem?.Id || ""}`;
    if (mutationInFlightRef.current.has(actionKey)) return;

    if (hasCancellationLock(paymentItem)) {
      toast.error(
        t("staff.cancelledBookingCannotBeApproved", "A cancelled or cancellation-pending session cannot be approved."),
      );
      return;
    }
    mutationInFlightRef.current.add(actionKey);
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
      mutationInFlightRef.current.delete(actionKey);
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (paymentItem) => {
    setRejectingPayment(paymentItem);
    setRejectionReason("");
  };

  const handleRejectPayment = async () => {
    if (!rejectingPayment) return;
    const actionKey = `reject-payment:${rejectingPayment.Id}`;
    if (mutationInFlightRef.current.has(actionKey)) return;

    mutationInFlightRef.current.add(actionKey);
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
      mutationInFlightRef.current.delete(actionKey);
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
    const actionKey = `${refundProcessMode}-refund:${processingRefundItem?.Id}`;
    if (mutationInFlightRef.current.has(actionKey)) return;

    const notesPrefix =
      refundProcessMode === "approve"
        ? t("auto.approvedByTechnicalSupport")
        : t("auto.rejectedByTechnicalSupport");
    const notesValue = String(refundProcessNotes || "").trim();
    const notes = notesValue ? `${notesPrefix}: ${notesValue}` : notesPrefix;

    mutationInFlightRef.current.add(actionKey);
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
      mutationInFlightRef.current.delete(actionKey);
      setProcessingRefundId(null);
    }
  };

  const handlePriorityChange = async (room, priority) => {
    const roomId = room?.Id || room?.id;
    if (!roomId) return;
    const actionKey = `priority:${roomId}`;
    if (mutationInFlightRef.current.has(actionKey)) return;

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

    mutationInFlightRef.current.add(actionKey);
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
      mutationInFlightRef.current.delete(actionKey);
      setPriorityUpdatingRoomId(null);
    }
  };

  const handleAvailabilityChange = async (nextAvailability) => {
    if (availabilityInFlightRef.current || availabilityUpdating || role !== Roles.STAFF) return;

    const previousAvailability = isSupportAvailable;
    setIsSupportAvailable(nextAvailability);
    availabilityInFlightRef.current = true;
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
      availabilityInFlightRef.current = false;
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

  // ── Greeting + date (derived locally, no extra requests) ────────────────────
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? { text: tx("dashboard.goodMorning", isRTL ? "صباح الخير" : "Good morning"), icon: Sunrise }
      : hour < 18
        ? { text: tx("dashboard.goodAfternoon", isRTL ? "مساء الخير" : "Good afternoon"), icon: Sun }
        : { text: tx("dashboard.goodEvening", isRTL ? "مساء الخير" : "Good evening"), icon: Moon };
  const agentName =
    user?.Name || user?.name || user?.UserName || user?.userName || "";
  const todayLabel = now.toLocaleDateString(isRTL ? "ar-EG" : undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Unified KPI row (combines metrics already computed above) ────────────────
  const kpis = [
    { icon: LayoutGrid, label: tx("support.totalCases", "Total cases"), value: supportOverview.total, tone: "neutral" },
    { icon: MessageSquare, label: t("staff.inProgress"), value: chatRooms.filter((r) => r.IsActive !== false).length, tone: "info" },
    { icon: PendingActions, label: tx("support.waitingReply", "Waiting reply"), value: supportOverview.unread, tone: "warning" },
    { icon: Verified, label: tx("staff.resolved", "Resolved"), value: supportOverview.resolved, tone: "success" },
    { icon: ReceiptLong, label: tx("staff.failedPayments", isRTL ? "مدفوعات فاشلة" : "Failed payments"), value: manualSummary.failed, tone: "danger" },
    { icon: AccountBalanceWallet, label: t("auto.refundRequests"), value: refundsSummary.pending, tone: "info" },
    { icon: AlertTriangle, label: tx("support.emergencyCases", "Emergency"), value: supportOverview.urgent, tone: "danger" },
    { icon: Timer, label: tx("support.avgResponseTime", isRTL ? "متوسط وقت الرد" : "Avg. response"), value: "—", tone: "neutral" },
  ];

  const refreshActiveModule = () => {
    if (activeModule === "manual-payments") fetchManualPayments(manualPaymentsPage, selectedStatusFilter);
    else if (activeModule === "refunds") fetchRefunds(refundsPage, refundsStatusFilter);
    else fetchChatRooms();
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium text-text-muted">
            <greeting.icon className="h-4 w-4 text-primary" />
            <span>
              {greeting.text}
              {agentName ? `${isRTL ? "، " : ", "}${agentName}` : ""}
            </span>
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">
            {tx("support.supportDashboard", isRTL ? "لوحة خدمة العملاء" : "Support Dashboard")}
          </h1>
          <p className="text-xs text-text-muted">{todayLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role === Roles.STAFF && (
            <Switch
              checked={isSupportAvailable}
              loading={availabilityUpdating}
              disabled={availabilityUpdating}
              onCheckedChange={handleAvailabilityChange}
              checkedLabel={tx("support.available", "Available")}
              uncheckedLabel={tx("support.unavailable", "Unavailable")}
              ariaLabel={tx("support.availabilityStatus", "Support availability status")}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/staff/messages")}
            className="gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            {t("nav.messages", "Messages")}
          </Button>
          <Button variant="primary" size="sm" onClick={refreshActiveModule} className="gap-1.5">
            <RotateCw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </motion.header>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KPIWidget
            key={kpi.label}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            tone={kpi.tone}
            loading={chatRoomsLoading && kpi.value === 0}
          />
        ))}
      </div>

      {/* ── Quick modules ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moduleTabs.map((tab) => (
          <QuickModule
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            description={tab.subtitle}
            count={tab.count}
            active={activeModule === tab.id}
            onClick={() => setActiveModule(tab.id)}
          />
        ))}
      </div>

      {activeModule === "manual-payments" && (
        <DashboardCard>
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-heading">{t("staff.requestsList")}</h2>
              <p className="mt-0.5 text-xs text-text-muted">{t("staff.manualPaymentDesc")}</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={manualPaymentsSearch}
                onChange={(e) => setManualPaymentsSearch(e.target.value)}
                placeholder={t("staff.searchManualPayment")}
                className="w-full rounded-xl border border-border bg-background py-2.5 pe-4 ps-10 text-sm text-text outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="border-b border-border px-5 py-3">
            <FilterBar
              options={statusFilterOptions}
              value={selectedStatusFilter}
              onChange={setSelectedStatusFilter}
            />
          </div>

          <div className="space-y-4 p-5">
            {manualPaymentsLoading ? (
              <RequestListSkeleton />
            ) : filteredManualPayments.length === 0 ? (
              <EmptyState icon={ReceiptLong} message={t("staff.noManualPayments")} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredManualPayments.map((item, index) => {
                  const { patientName, doctorName } = getManualPaymentParticipants(item);
                  const statusMeta = getPaymentStatusMeta(item?.Status, { isRTL });
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
                    <RequestCard
                      key={item.Id}
                      index={index}
                      title={patientName}
                      subtitle={`${t("common.doctor", "Doctor")}: ${doctorName}`}
                      badges={[{ label: statusMeta.label, className: statusMeta.chipClass }]}
                      details={[
                        { label: t("staff.provider"), value: getProviderLabel(item.Provider) },
                        { label: t("staff.referenceNumber"), value: item.ReferenceNumber || "-", dir: "ltr" },
                        { label: t("staff.sessionTime"), value: sessionTimeText, dir: "ltr" },
                        { label: t("staff.submittedAt"), value: createdAtText, dir: "ltr" },
                      ]}
                      note={
                        item.RejectionReason ? (
                          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20">
                            <span className="font-semibold">{t("staff.rejectionReason")}:</span>{" "}
                            {item.RejectionReason}
                          </p>
                        ) : null
                      }
                      actions={
                        <>
                          {item.ScreenshotUrl ? (
                            <a
                              href={item.ScreenshotUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0"
                            >
                              <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
                                <OpenInNew className="h-4 w-4" />
                                {t("common.view")}
                              </Button>
                            </a>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
                              <Person className="h-3.5 w-3.5" />
                              {t("staff.noScreenshot")}
                            </span>
                          )}

                          {isPendingPayment && !cancellationLocked ? (
                            <div className="ms-auto flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={isBusy}
                                onClick={() => handleConfirmPayment(item)}
                                className="gap-1.5 whitespace-nowrap"
                              >
                                {isBusy ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                {t("auto.markCompleted")}
                              </Button>

                              <Button
                                size="sm"
                                variant="danger"
                                disabled={isBusy}
                                onClick={() => openRejectModal(item)}
                                className="gap-1.5 whitespace-nowrap"
                              >
                                <X className="h-4 w-4" />
                                {t("auto.markFailed")}
                              </Button>
                            </div>
                          ) : cancellationLocked ? (
                            <span className="ms-auto text-xs font-semibold text-amber-600">
                              {t("auto.cancellationPending", "Cancellation pending review")}
                            </span>
                          ) : (
                            <span className="ms-auto text-xs text-text-muted">
                              {t("auto.alreadyProcessed")}
                            </span>
                          )}
                        </>
                      }
                    />
                  );
                })}
              </div>
            )}

            {manualPaymentsPagesCount > 1 && (
              <Pagination
                page={manualPaymentsPage}
                pagesCount={manualPaymentsPagesCount}
                loading={manualPaymentsLoading}
                onPrev={() => fetchManualPayments(manualPaymentsPage - 1, selectedStatusFilter)}
                onNext={() => fetchManualPayments(manualPaymentsPage + 1, selectedStatusFilter)}
                t={t}
              />
            )}
          </div>
        </DashboardCard>
      )}

      {activeModule === "refunds" && (
        <DashboardCard>
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-heading">{t("auto.refundRequests")}</h2>
              <p className="mt-0.5 text-xs text-text-muted">{t("auto.approveOrRejectRefunds")}</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={refundSearch}
                onChange={(e) => setRefundSearch(e.target.value)}
                placeholder={t("auto.searchByPatientOrBooking")}
                className="w-full rounded-xl border border-border bg-background py-2.5 pe-4 ps-10 text-sm text-text outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="border-b border-border px-5 py-3">
            <FilterBar
              options={refundStatusOptions}
              value={refundsStatusFilter}
              onChange={setRefundsStatusFilter}
            />
          </div>

          <div className="space-y-4 p-5">
            {refundsLoading ? (
              <RequestListSkeleton />
            ) : filteredRefunds.length === 0 ? (
              <EmptyState icon={AccountBalanceWallet} message={t("auto.noRefundRequestsFound")} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredRefunds.map((item, index) => {
                  const itemId = item?.Id ?? item?.id;
                  const bookingId = item?.BookingId ?? item?.bookingId;
                  const statusMeta = getRefundStatusMeta(item?.Status ?? item?.status);
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
                    item?.Reason || item?.CancellationReason || item?.Notes || "-";

                  return (
                    <RequestCard
                      key={String(itemId || index)}
                      index={index}
                      title={item?.PatientName || item?.patientName || t("common.unknownPatient")}
                      subtitle={`#${itemId || "-"} · ${t("auto.booking")} #${bookingId || "-"}`}
                      badges={[{ label: statusMeta.label, className: statusMeta.chipClass }]}
                      details={[
                        {
                          label: t("auto.amount"),
                          value: Number.isFinite(amount) && amount > 0 ? `${amount} EGP` : "-",
                          dir: "ltr",
                        },
                        { label: t("auto.requestedAt"), value: createdAtText, dir: "ltr" },
                        { label: t("auto.cancellationReason"), value: reason, full: true },
                      ]}
                      actions={
                        isPending ? (
                          <div className="ms-auto flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isBusy}
                              onClick={() => openRefundProcessModal(item, "approve")}
                              className="gap-1.5 whitespace-nowrap"
                            >
                              {isBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              {t("auto.approve")}
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isBusy}
                              onClick={() => openRefundProcessModal(item, "reject")}
                              className="gap-1.5 whitespace-nowrap"
                            >
                              <X className="h-4 w-4" />
                              {t("auto.reject")}
                            </Button>
                          </div>
                        ) : (
                          <span className="ms-auto text-xs text-text-muted">
                            {t("auto.alreadyProcessed")}
                          </span>
                        )
                      }
                    />
                  );
                })}
              </div>
            )}

            {refundsPagesCount > 1 && (
              <Pagination
                page={refundsPage}
                pagesCount={refundsPagesCount}
                loading={refundsLoading}
                onPrev={() => fetchRefunds(refundsPage - 1, refundsStatusFilter)}
                onNext={() => fetchRefunds(refundsPage + 1, refundsStatusFilter)}
                t={t}
              />
            )}
          </div>
        </DashboardCard>
      )}

      {activeModule === "chat-rooms" && (
        <DashboardCard>
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-heading">{t("auto.chatRooms")}</h2>
              <p className="mt-0.5 text-xs text-text-muted">{t("auto.patientConversations")}</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={chatRoomsSearch}
                onChange={(event) => setChatRoomsSearch(event.target.value)}
                placeholder={t("chat.searchConversations", "Search conversations...")}
                className="w-full rounded-xl border border-border bg-background py-2.5 pe-4 ps-10 text-sm text-text outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="border-b border-border px-5 py-3">
            <FilterBar
              options={[
                { value: "all", label: t("common.all", "All") },
                { value: "emergency", label: t("support.emergency", "Emergency") },
                { value: "technical", label: t("staff.technical") },
                { value: "medical", label: t("support.medicalInquiry", "Medical") },
                { value: "billing", label: t("staff.payment") },
                { value: "appointment", label: t("staff.appointment") },
              ]}
              value={chatRoomsTypeFilter}
              onChange={setChatRoomsTypeFilter}
            />
          </div>

          <div className="p-5">
            {chatRoomsLoading ? (
              <RequestListSkeleton rows={4} columns={1} />
            ) : visibleChatRooms.length === 0 ? (
              <EmptyState icon={MessageSquare} message={t("auto.noChatRoomsYet")} />
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
          </div>
        </DashboardCard>
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

// ── Local presentational helpers ──────────────────────────────────────────────

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-background-subtle">
        <Icon className="h-7 w-7 text-text-muted" />
      </div>
      <p className="text-sm font-medium text-text-muted">{message}</p>
    </div>
  );
}

function RequestListSkeleton({ rows = 4, columns = 2 }) {
  return (
    <div className={`grid gap-4 ${columns === 1 ? "" : "lg:grid-cols-2"}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-background-paper p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-32 animate-pulse rounded bg-background-subtle" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-background-subtle" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-2.5 w-14 animate-pulse rounded bg-background-subtle" />
                <div className="h-3.5 w-20 animate-pulse rounded bg-background-subtle" />
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border/60 pt-4">
            <div className="h-8 w-28 animate-pulse rounded-lg bg-background-subtle" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, pagesCount, loading, onPrev, onNext, t }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-sm text-text-muted">
        {t("common.page")} {page} {t("common.of")} {pagesCount}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={onPrev}>
          {t("common.previous")}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pagesCount || loading} onClick={onNext}>
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
