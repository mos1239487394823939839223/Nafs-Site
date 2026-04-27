import { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign as MoneyIcon, RefreshCw as RefreshIcon } from "lucide-react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSignalR } from "../../hooks/useSignalR";
import { doctorAPI, paymentAPI } from "../../lib/api";
import { getPaymentStatusMeta } from "../../lib/paymentStatus";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function DoctorEarnings() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [earnings, setEarnings] = useState(null);
  const [providersMap, setProvidersMap] = useState({});

  const formatCurrency = (value) => {
    const numeric = toNumber(value, 0);
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numeric)} EGP`;
  };

  const formatSummaryAmount = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return formatCurrency(value);
  };

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const [earningsResponse, providersResponse] = await Promise.all([
        doctorAPI.getEarnings(pageIndex, 20),
        paymentAPI.getProviders(),
      ]);

      const response = earningsResponse;
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.somethingWentWrong"));
        return;
      }

      const data = response?.Data || null;
      setEarnings(data);
      setTotalPages(toNumber(data?.Transactions?.Pages, 1));

      const providers = Array.isArray(providersResponse?.Data)
        ? providersResponse.Data
        : [];
      const map = providers.reduce((acc, item) => {
        const key = Number(item.ID);
        if (Number.isFinite(key)) {
          acc[key] = item.Name;
        }
        return acc;
      }, {});
      setProvidersMap(map);
    } catch (error) {
      toast.error(error?.response?.data?.Message || t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [pageIndex, t, toast]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  useSignalR({
    enabled: true,
    handlers: {
      BookingStatusUpdated: fetchEarnings,
      ManualPaymentStatusUpdated: fetchEarnings,
      PaymentStatusUpdated: fetchEarnings,
    },
  });

  const transactions = useMemo(() => {
    if (Array.isArray(earnings?.Transactions?.Items)) {
      return earnings.Transactions.Items;
    }
    return [];
  }, [earnings]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-2xl font-bold text-text-heading">
          {t("doctor.earningsTitle", isRTL ? "الأرباح" : "Earnings")}
        </h2>
        <p className="text-text-muted mt-1">
          {t(
            "doctor.earningsSubtitle",
            isRTL
              ? "راجع ملخص أرباحك وحركة المدفوعات"
              : "Review your earnings summary and payment transactions",
          )}
        </p>
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={fetchEarnings}>
            <RefreshIcon className="w-4 h-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label={t("common.loading")} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.totalConfirmed", "Total Confirmed")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatSummaryAmount(earnings?.TotalConfirmedAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.totalPending", "Total Pending")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatSummaryAmount(earnings?.TotalPendingAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.totalPayedOut", "Total Paid Out")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatSummaryAmount(earnings?.TotalPayedOut)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.remainingBalance", "Remaining Balance")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatSummaryAmount(earnings?.RemainingBalance)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.recentTransactions", "Recent Transactions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("common.patient", isRTL ? "المريض" : "Patient")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.type")}</TableHead>
                    <TableHead className="text-right">{t("common.total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((item, idx) => (
                      <TableRow key={item.PaymentId || idx}>
                        {(() => {
                          const paymentStatus = getPaymentStatusMeta(item.Status, {
                            isRTL,
                          });
                          const providerName =
                            providersMap[Number(item.Provider)] ||
                            item.ProviderName ||
                            item.Provider ||
                            "-";

                          return (
                            <>
                        <TableCell>
                          {item.CreatedAt
                            ? new Date(item.CreatedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>{item.PatientName || "-"}</TableCell>
                        <TableCell>{paymentStatus.label}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-text-muted">
                            <MoneyIcon className="w-4 h-4" />
                            {providerName}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-text-heading">
                          {formatCurrency(item.Amount)}
                        </TableCell>
                            </>
                          );
                        })()}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow hover={false}>
                      <TableCell colSpan={5} className="text-center py-12 text-text-muted">
                        {t(
                          "admin.noTransactions",
                          isRTL
                            ? "لا توجد معاملات مدفوعة بعد"
                            : "No paid transactions yet",
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <Pagination page={pageIndex} total={totalPages} onChange={setPageIndex} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
