import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, AlertCircle, Eye as ViewIcon } from "lucide-react";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function HistoryList({ sessions, onNoteClick, onViewNoteClick }) {
  const { t, isRTL } = useLanguage();
  const getStatusBadge = (session) => {
    if (session.statusKey === "completed") {
      return (
        <Badge variant="success">
          {t("bookingStatus.completed", "Completed")}
        </Badge>
      );
    } else if (session.statusKey === "confirmed") {
      return (
        <Badge variant="primary">
          {t("bookingStatus.confirmed", "Confirmed")}
        </Badge>
      );
    } else if (session.statusKey === "inProgress") {
      return (
        <Badge variant="primary">
          {t("bookingStatus.inProgress", "In Progress")}
        </Badge>
      );
    } else if (session.statusKey === "pendingPayment") {
      return (
        <Badge variant="warning">
          {t("bookingStatus.pendingPayment", "Pending Payment")}
        </Badge>
      );
    } else if (session.statusKey === "cancelled" || session.statusKey === "noShow") {
      return (
        <Badge variant="error" className="bg-red-100 text-red-700">
          {session.statusKey === "noShow"
            ? t("bookingStatus.noShow", "No Show")
            : t("bookingStatus.cancelled", "Cancelled")}
        </Badge>
      );
    } else {
      return <Badge variant="default">{session.outcome}</Badge>;
    }
  };

  return (
    <div
      className={`bg-background-paper rounded-2xl border border-border/50 shadow-sm overflow-hidden ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-subtle/40 border-b border-border/50">
            <tr>
              <th
                className={`px-6 py-5 text-xs font-semibold text-text-muted uppercase tracking-wider ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("admin.dateAndTime", "Date and Time")}
              </th>
              <th
                className={`px-6 py-5 text-xs font-semibold text-text-muted uppercase tracking-wider ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("common.patient", "Patient")}
              </th>
              <th
                className={`px-6 py-5 text-xs font-semibold text-text-muted uppercase tracking-wider ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("doctor.duration", "Duration")}
              </th>
              <th
                className={`px-6 py-5 text-xs font-semibold text-text-muted uppercase tracking-wider ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("common.status", "Status")}
              </th>
              <th
                className={`px-6 py-5 text-xs font-semibold text-text-muted uppercase tracking-wider ${
                  isRTL ? "text-left" : "text-right"
                }`}
              >
                {t("common.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sessions.map((session, index) => (
              <motion.tr
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-background-subtle/30 transition-colors duration-200"
              >
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-text-heading text-sm">
                      {session.date}
                    </span>
                    <span className="text-xs text-text-muted">
                      {session.time}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {session.patientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text-heading">
                      {session.patientName}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-sm text-text-muted">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{session.duration}</span>
                    <span className="text-xs">{t("common.min", "min")}</span>
                  </div>
                </td>
                <td className="px-6 py-5">{getStatusBadge(session)}</td>
                <td
                  className={`px-6 py-5 ${isRTL ? "text-left" : "text-right"}`}
                >
                  <div className={`flex gap-1 ${isRTL ? "flex-row-reverse" : "flex-row"} justify-end`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 p-1.5"
                      onClick={() => onViewNoteClick?.(session)}
                      title={t("common.view", "View")}
                    >
                      <ViewIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 p-1.5"
                      onClick={() => onNoteClick?.(session)}
                      title={t("common.edit", "Edit")}
                    >
                      <FileText className="w-5 h-5" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length === 0 && (
        <div className="p-8 text-center text-text-muted">
          {t("doctor.noSessionsFound", "No past sessions found.")}
        </div>
      )}
    </div>
  );
}
