import { AlertTriangle, CalendarClock, Check, Headphones, MessageSquare, Settings2, Trash2 } from "lucide-react";
import SupportCaseTag from "../support/SupportCaseTag";
import { useLanguage } from "../../contexts/LanguageContext";
import { getRoomCaseTypeMeta } from "../../lib/supportCaseTypes";

const categoryStyles = {
  appointments: { Icon: CalendarClock, className: "bg-violet-100 text-violet-700", dot: "bg-violet-500", card: "bg-violet-50/80 border-violet-200 hover:border-violet-400" },
  messages: { Icon: MessageSquare, className: "bg-blue-100 text-blue-700", dot: "bg-blue-500", card: "bg-blue-50/80 border-blue-200 hover:border-blue-400" },
  emergency: { Icon: AlertTriangle, className: "bg-red-100 text-red-700", dot: "bg-red-500", card: "bg-red-50 border-red-300 hover:border-red-500 shadow-sm shadow-red-100" },
  support: { Icon: Headphones, className: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", card: "bg-emerald-50/80 border-emerald-200 hover:border-emerald-400" },
  system: { Icon: Settings2, className: "bg-slate-100 text-slate-700", dot: "bg-slate-500", card: "bg-slate-50/80 border-slate-200 hover:border-slate-400" },
};

const supportCardStyles = {
  emergency: "bg-red-50 border-red-300 hover:border-red-500 shadow-sm shadow-red-100",
  blackmail_abuse: "bg-rose-50 border-rose-300 hover:border-rose-600 shadow-sm shadow-rose-100",
  technical: "bg-orange-50 border-orange-200 hover:border-orange-400",
  medical: "bg-blue-50 border-blue-200 hover:border-blue-400",
  billing: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
  appointment: "bg-violet-50 border-violet-200 hover:border-violet-400",
  general: "bg-gray-100/80 border-gray-300 hover:border-gray-400",
  other: "bg-slate-50 border-slate-200 hover:border-slate-300",
};

export default function NotificationItem({ notification, onClick, onMarkAsRead, onDelete, compact = false }) {
  const { isRTL } = useLanguage();
  const style = categoryStyles[notification.category] || categoryStyles.system;
  const Icon = style.Icon;
  const date = new Date(notification.date);
  const showSupportCaseTag =
    notification.category === "support" || notification.category === "emergency";
  const supportRoom = {
    ...(notification.raw || {}),
    ...(
      notification.category === "emergency" &&
      !notification.raw?.SupportCaseType &&
      !notification.raw?.supportCaseType &&
      !notification.raw?.CaseType &&
      !notification.raw?.caseType
        ? { SupportCaseType: "emergency" }
        : {}
    ),
  };
  const supportType = getRoomCaseTypeMeta(supportRoom, isRTL).key;
  const cardStyle = showSupportCaseTag
    ? supportCardStyles[supportType] || supportCardStyles.general
    : style.card;

  return (
    <article
      onClick={() => onClick?.(notification)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick?.(notification);
      }}
      className={`w-full text-start rounded-xl border transition-all ${
        compact ? "p-3" : "p-4"
      } ${cardStyle} ${notification.isRead ? "opacity-70" : "ring-1 ring-current/10 shadow-sm"} cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.className}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex flex-wrap items-center gap-2">
              <p className="font-semibold text-text-heading text-sm line-clamp-1">{notification.title}</p>
              {showSupportCaseTag && (
                <SupportCaseTag room={supportRoom} isRTL={isRTL} />
              )}
            </div>
            {!notification.isRead && <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />}
          </div>
          {notification.body && <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-5">{notification.body}</p>}
          <p className="text-[11px] text-text-light mt-2">
            {Number.isNaN(date.getTime()) ? "" : date.toLocaleString()}
          </p>
          {!compact && (onMarkAsRead || onDelete) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-current/10 pt-3">
              {!notification.isRead && onMarkAsRead && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMarkAsRead(notification);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isRTL ? "تحديد كمقروء" : "Mark as read"}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(notification);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isRTL ? "حذف" : "Delete"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
