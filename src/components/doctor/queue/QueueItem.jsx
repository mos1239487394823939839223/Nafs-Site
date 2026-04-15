import { motion } from "framer-motion";
import {
  AccessTime as Clock,
  PlayArrow as Play,
  CalendarToday as Calendar,
  Close as Cancel,
  Timer as Duration,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function QueueItem({ patient, onAction, actionLoading }) {
  const { t, isRTL } = useLanguage();
  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    pendingPayment: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    inProgress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    noShow: "bg-slate-500/10 text-slate-600 border-slate-400/20",
    unknown: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  const statusLabelMap = {
    pending: t("bookingStatus.pending", "Pending"),
    confirmed: t("bookingStatus.confirmed", "Confirmed"),
    pendingPayment: t("bookingStatus.pendingPayment", "Pending Payment"),
    inProgress: t("bookingStatus.inProgress", "In Progress"),
    completed: t("bookingStatus.completed", "Completed"),
    cancelled: t("bookingStatus.cancelled", "Cancelled"),
    noShow: t("bookingStatus.noShow", "No Show"),
    unknown: t("bookingStatus.pending", "Pending"),
  };

  const isJoining =
    actionLoading?.type === "join" &&
    actionLoading?.bookingId === patient.bookingId;
  const isCancelling =
    actionLoading?.type === "cancel" &&
    actionLoading?.bookingId === patient.bookingId;

  const isBusy = isJoining || isCancelling;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-background-paper p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isRTL ? "flex-row-reverse" : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Patient Info */}
      <div
        className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
          {patient.name.charAt(0)}
        </div>
        <div className={isRTL ? "text-right" : "text-left"}>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-heading">{patient.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                statusColors[patient.status] || statusColors.unknown
              } capitalize`}
            >
              {statusLabelMap[patient.status] || patient.status}
            </span>
            {patient.paymentConfirmed && (
              <Badge variant="success" className="text-xs">
                <PaymentIcon className="w-3 h-3 mr-0.5" />
                {t("common.paid", "Paid")}
              </Badge>
            )}
          </div>
          <div
            className={`flex items-center gap-4 text-sm text-text-muted mt-1 flex-wrap ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`flex items-center gap-1 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Calendar className="w-3 h-3" />
              {patient.sessionDateLabel}
            </span>
            <span
              className={`flex items-center gap-1 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Clock className="w-3 h-3" />
              {patient.sessionTimeLabel}
            </span>
            {patient.duration > 0 && (
              <span
                className={`flex items-center gap-1 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Duration className="w-3 h-3" />
                {patient.duration} {t("common.min", "min")}
              </span>
            )}
          </div>
          <div
            className={`flex items-center gap-4 text-xs text-text-muted mt-1 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`flex items-center gap-1 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Clock className="w-3 h-3" />
              {t("doctor.waited", "Waited")}: {patient.waitTime}{" "}
              {t("common.min", "min")}
            </span>
            {patient.showJoin ? (
              <span className="text-emerald-600">
                {isRTL ? "متاح الانضمام" : "Join available"}
              </span>
            ) : (
              <span>
                {isRTL
                  ? "الانضمام قبل الموعد بـ 24 ساعة"
                  : "Join opens within 24h"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`flex items-center gap-2 self-end md:self-auto ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        {patient.canCancel && (
          <Button
            size="sm"
            variant="outline"
            disabled={isBusy}
            className={`border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
            onClick={() => onAction("cancel", patient)}
          >
            {isCancelling ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isRTL ? "جار الإلغاء" : "Cancelling"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Cancel className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                {t("common.cancel", "Cancel")}
              </span>
            )}
          </Button>
        )}

        {patient.showJoin && (
          <Button
            size="sm"
            className={`bg-primary hover:bg-primary-dark text-white ${
              isRTL ? "flex-row-reverse" : ""
            }`}
            disabled={isBusy}
            onClick={() => onAction("join", patient)}
          >
            {isJoining ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isRTL ? "جار الانضمام" : "Joining"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Play className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                {t("doctor.joinNow", "Join")}
              </span>
            )}
          </Button>
        )}

        {(patient.status === "pending" ||
          patient.status === "confirmed" ||
          patient.status === "pendingPayment" ||
          patient.status === "inProgress") &&
          !patient.showJoin &&
          !patient.canCancel && (
            <Button size="sm" variant="outline" disabled className="opacity-60">
              {isRTL ? "الإجراءات غير متاحة" : "No actions available"}
            </Button>
          )}
      </div>
    </motion.div>
  );
}
