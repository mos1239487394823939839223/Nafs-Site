import { useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, Mail, MailOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import NotificationItem from "../../components/notifications/NotificationItem";
import { useNotifications } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { NOTIFICATION_CATEGORIES } from "../../lib/notificationUtils";

export default function NotificationsPage() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [category, setCategory] = useState("all");
  const [readState, setReadState] = useState("all");

  const filtered = useMemo(
    () => notifications.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesReadState = readState === "all" || (readState === "unread" ? !item.isRead : item.isRead);
      return matchesCategory && matchesReadState;
    }),
    [category, notifications, readState],
  );
  const categoryCounts = useMemo(
    () => NOTIFICATION_CATEGORIES.reduce((counts, item) => ({
      ...counts,
      [item]: item === "all"
        ? notifications.length
        : notifications.filter((notification) => notification.category === item).length,
    }), {}),
    [notifications],
  );

  const openNotification = async (item) => {
    await markAsRead(item.id);
    if (item.actionUrl) navigate(item.actionUrl);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6 max-w-5xl mx-auto">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background-paper to-secondary/10 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-heading">{t("common.notifications", "Notifications")}</h1>
              <p className="text-sm text-text-muted">{unreadCount} {t("chat.unread", "unread")}</p>
            </div>
          </div>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0} className="gap-2">
            <CheckCheck className="w-4 h-4" />
            {t("common.markAllRead", "Mark all as read")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {NOTIFICATION_CATEGORIES.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold whitespace-nowrap transition-all ${
              category === item ? "bg-primary text-white border-primary shadow-lg shadow-primary/15" : "bg-background-paper text-text-muted border-border hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {t(`notifications.categories.${item}`, item)}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${category === item ? "bg-white/15 text-white" : "bg-primary/10 text-primary"}`}>
              {categoryCounts[item]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          ["all", Bell, t("common.all", "All")],
          ["unread", Mail, t("chat.unread", "Unread")],
          ["read", MailOpen, t("notifications.read", "Read")],
        ].map(([value, Icon, label]) => (
          <button
            key={value}
            onClick={() => setReadState(value)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
              readState === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background-paper text-text-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background-paper py-16 text-center">
          <Bell className="w-12 h-12 mx-auto text-text-muted opacity-30 mb-3" />
          <p className="font-semibold text-text-heading">{t("common.noAlerts", "No notifications")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onClick={openNotification}
              onMarkAsRead={(notification) => markAsRead(notification.id)}
              onDelete={(notification) => deleteNotification(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
