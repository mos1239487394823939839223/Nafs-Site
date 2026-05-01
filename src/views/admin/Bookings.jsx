import { useState, useEffect } from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import SelectDropdown from "../../components/ui/SelectDropdown";
import { Calendar, Filter, Loader2, ChevronLeft, ChevronRight, Users, Search } from "lucide-react";
import { adminAPI, extractErrorMessage } from "../../lib/api";
import { getAppointmentStatusMeta } from "../../lib/appointmentStatus";
import {
  getPaymentStatusFilterOptions,
  getPaymentStatusMeta,
  normalizePaymentStatus,
} from "../../lib/paymentStatus";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSignalR } from "../../hooks/useSignalR";

export default function AdminBookings() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        pageIndex,
        pageSize,
      };
      if (statusFilter !== null) {
        params.status = statusFilter;
      }
      if (paymentFilter !== null) {
        params.paymentStatus = paymentFilter;
      }
      const response = await adminAPI.getBookings(params);
      if (response?.IsSuccess === true && response?.Data) {
        setBookings(response.Data.Items || response.Data || []);
        setTotalPages(response.Data.Pages || 1);
        setTotalRecords(response.Data.Records || 0);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error(extractErrorMessage(error, t("errors.failedLoadBookings")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pageIndex, statusFilter, paymentFilter]);

  useEffect(() => {
    const pollingId = setInterval(() => {
      fetchBookings();
    }, 20000);

    return () => clearInterval(pollingId);
  }, [pageIndex, statusFilter, paymentFilter]);

  const pickEventField = (payload, keys = []) => {
    for (const key of keys) {
      if (payload?.[key] !== undefined && payload?.[key] !== null) {
        return payload[key];
      }
    }
    return null;
  };

  const handlePaymentStatusEvent = (payload) => {
    const bookingId = pickEventField(payload, [
      "BookingId",
      "bookingId",
      "Id",
      "id",
    ]);
    if (!bookingId) return;

    const paymentStatus = pickEventField(payload, [
      "PaymentStatus",
      "paymentStatus",
      "Status",
      "status",
    ]);
    const normalized =
      paymentStatus !== null && paymentStatus !== undefined
        ? Number(paymentStatus)
        : null;

    setBookings((prev) =>
      prev.map((booking) => {
        if (String(booking?.Id) !== String(bookingId)) return booking;

        const next = { ...booking };
        if (normalized !== null && Number.isFinite(normalized)) {
          next.PaymentStatus = normalized;
        }
        if (
          normalized === 2 ||
          String(paymentStatus || "")
            .toLowerCase()
            .includes("confirm") ||
          String(paymentStatus || "")
            .toLowerCase()
            .includes("complete")
        ) {
          next.PaymentConfirmed = true;
        }
        return next;
      }),
    );
  };

  useSignalR({
    enabled: true,
    disconnectOnUnmount: true,
    handlers: {
      PaymentStatusUpdated: handlePaymentStatusEvent,
      BookingPaymentStatusUpdated: handlePaymentStatusEvent,
      ManualPaymentStatusUpdated: handlePaymentStatusEvent,
    },
    onConnectionError: () => {
      // Polling fallback is active.
    },
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return t("common.none", "N/A");
    return new Date(dateStr).toLocaleDateString(t("auto.enus"), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString(t("auto.enus"), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      !searchQuery ||
      (booking.PatientName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (booking.DoctorName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const normalizedPaymentStatus = normalizePaymentStatus(
      booking.PaymentStatus ?? (booking.PaymentConfirmed ? 2 : 1),
    );
    const matchesPayment =
      paymentFilter === null || normalizedPaymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-6" >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-heading">
            {t("admin.allBookings")}
          </h2>
          <p className="text-text-muted mt-1">
            {t(
              "admin.manageBookingsDesc",
              "Manage and monitor all platform bookings",
            )}
            {totalRecords > 0 &&
              ` • ${totalRecords} ${t("common.total", "total")}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                className={`absolute ${
                  "start-3"
                } top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted`}
              />
              <input
                type="text"
                placeholder={t(
                  "admin.searchPatientsDocs",
                  "Search by patient or doctor name...",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${
                  "ps-10 pe-4"
                } py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-text`}
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <SelectDropdown
                value={statusFilter === null ? "" : String(statusFilter)}
                onChange={(val) => {
                  setStatusFilter(val === "" ? null : parseInt(val));
                  setPageIndex(1);
                }}
                size="sm"
                options={[
                  { value: "", label: t("common.allStatus", "All Status") },
                  { value: "1", label: t("bookingStatus.pending") },
                  { value: "2", label: t("bookingStatus.confirmed") },
                  { value: "7", label: t("bookingStatus.pendingPayment") },
                  { value: "3", label: t("bookingStatus.inProgress") },
                  { value: "4", label: t("bookingStatus.completed") },
                  { value: "5", label: t("bookingStatus.cancelled") },
                  { value: "6", label: t("bookingStatus.noShow") },
                ]}
                className="w-48"
              />
            </div>

            {/* Payment filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <SelectDropdown
                value={paymentFilter === null ? "" : String(paymentFilter)}
                onChange={(val) => {
                  setPaymentFilter(val === "" ? null : parseInt(val));
                  setPageIndex(1);
                }}
                size="sm"
                options={[
                  { value: "", label: t("admin.allPayments", "All Payments") },
                  ...getPaymentStatusFilterOptions({ isRTL }),
                ]}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t("admin.allBookings", "Bookings List")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-text-muted">{t("admin.noBookingsYet")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.patient", "Patient")}</TableHead>
                      <TableHead>{t("common.doctor")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.time")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("staff.payment", "Payment")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const statusInfo = getAppointmentStatusMeta(
                        booking.Status,
                        {
                          t,
                          isRTL,
                          booking,
                        },
                      );
                      const paymentMeta = getPaymentStatusMeta(
                        booking.PaymentStatus ??
                          (booking.PaymentConfirmed ? 2 : 1),
                        { isRTL },
                      );
                      return (
                        <TableRow key={booking.Id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {(booking.PatientName || "U").charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium text-text-heading truncate">
                                {booking.PatientName ||
                                  t("common.unknown", "Unknown")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-text-muted">
                            {t("common.doctor")}{" "}
                            {booking.DoctorName ||
                              t("common.unknown", "Unknown")}
                          </TableCell>
                          <TableCell className="text-text-muted whitespace-nowrap">
                            {formatDate(booking.SessionStartTime)}
                          </TableCell>
                          <TableCell className="text-text-muted whitespace-nowrap">
                            {formatTime(booking.SessionStartTime)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={paymentMeta.badgeVariant}>
                              {paymentMeta.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageIndex <= 1}
                    onClick={() =>
                      setPageIndex((prev) => Math.max(1, prev - 1))
                    }
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
        </CardContent>
      </Card>
    </div>
  );
}
