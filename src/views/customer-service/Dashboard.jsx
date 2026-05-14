import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
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
} from "lucide-react";
import { customerSupportAPI, chatAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getPaymentStatusFilterOptions,
  getPaymentStatusMeta,
  normalizePaymentStatus,
} from "../../lib/paymentStatus";

export default function CustomerServiceDashboard() {
  const { t, isRTL } = useLanguage();
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

  const tx = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

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
    if (activeModule === "chat-rooms") fetchChatRooms();
  }, [activeModule, fetchChatRooms]);

  const getProviderLabel = (providerValue) => {
    const value = Number(providerValue);
    if (value === 2) return "InstaPay";
    if (value === 3) return t("staff.cashWallet");
    return `${t("staff.provider")} #${providerValue ?? "-"}`;
  };

  const filteredManualPayments = useMemo(() => {
    const q = manualPaymentsSearch.trim().toLowerCase();
    return manualPayments.filter((item) => {
      if (!q) return true;

      const patientName = String(item?.PatientName || "").toLowerCase();
      const referenceNumber = String(item?.ReferenceNumber || "").toLowerCase();
      const bookingId = String(item?.BookingId || "").toLowerCase();
      const paymentId = String(item?.Id || "").toLowerCase();

      return (
        patientName.includes(q) ||
        referenceNumber.includes(q) ||
        bookingId.includes(q) ||
        paymentId.includes(q)
      );
    });
  }, [manualPayments, manualPaymentsSearch]);

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
    const type = Number(
      room?.RoomType ?? room?.ChatRoomType ?? room?.Type ?? 2,
    );
    const map = {
      1: {
        label: t("auto.booking"),
        cls: "bg-blue-50 text-blue-700 border-blue-200",
      },
      2: {
        label: t("auto.generalSupport"),
        cls: "bg-gray-50 text-gray-700 border-gray-200",
      },
      3: {
        label: t("auto.emergency"),
        cls: "bg-red-50 text-red-700 border-red-200",
      },
      4: {
        label: t("auto.bullying"),
        cls: "bg-orange-50 text-orange-700 border-orange-200",
      },
    };
    return map[type] || map[2];
  };

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

  const handleConfirmPayment = async (paymentItem) => {
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
      const response = await customerSupportAPI.processRefund(
        processingRefundItem?.Id,
        notes,
      );
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
                            {item.PatientName || t("common.unknownPatient")}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            #{item.Id || "-"} · {t("auto.booking")} #{item.BookingId || "-"}
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

                        {isPendingPayment ? (
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
            <CardTitle className="text-xl">{t("auto.chatRooms")}</CardTitle>
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
          </CardHeader>
          <CardContent className="pt-4">
            {chatRoomsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("auto.noChatRoomsYet")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatRooms.map((room) => {
                  const meta = getCaseTypeMeta(room);
                  return (
                    <div
                      key={room.Id || room.id}
                      className="p-4 bg-background-subtle border border-border rounded-xl flex items-center gap-4"
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
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.cls}`}
                          >
                            {meta.label}
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
