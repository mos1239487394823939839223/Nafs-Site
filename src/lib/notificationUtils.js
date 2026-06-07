const text = (value) => String(value ?? "").trim();

export const NOTIFICATION_CATEGORIES = [
  "all",
  "appointments",
  "messages",
  "emergency",
  "support",
  "system",
];

export function getNotificationCategory(item = {}) {
  const raw = [
    item.Category,
    item.category,
    item.Type,
    item.type,
    item.NotificationType,
    item.notificationType,
    item.Title,
    item.title,
    item.Body,
    item.body,
  ].map(text).join(" ").toLowerCase();

  if (/blackmail|abuse|bullying|ابتزاز|عنف/.test(raw)) return "emergency";

  if (/emergency|urgent|طارئ|عاجل/.test(raw)) return "emergency";
  if (/message|chat|رسالة|محادثة/.test(raw)) return "messages";
  if (/support|ticket|refund|payment|دعم|طلب|استرداد|دفع/.test(raw)) return "support";
  if (/booking|appointment|session|موعد|حجز|جلسة/.test(raw)) return "appointments";
  return "system";
}

export function getNotificationActionUrl(item = {}, role = "patient") {
  const direct = text(item.ActionUrl ?? item.actionUrl ?? item.Url ?? item.url ?? item.Link ?? item.link);
  if (direct) return direct;

  const category = getNotificationCategory(item);
  if (category === "messages" || category === "support" || category === "emergency") {
    const roomId = text(item.RoomId ?? item.roomId ?? item.ChatRoomId ?? item.chatRoomId);
    const suffix = roomId ? `?room=${encodeURIComponent(roomId)}` : "";
    if (role === "patient") return `/dashboard/patient/messages${suffix}`;
    if (role === "doctor") return `/dashboard/doctor/messages${suffix}`;
    if (role === "staff") return `/dashboard/staff/messages${suffix}`;
    return `/admin/messages${suffix}`;
  }
  if (category === "appointments") {
    if (role === "patient") return "/dashboard/patient/reserve";
    if (role === "doctor") return "/dashboard/doctor/queue";
    if (role === "admin") return "/admin/bookings";
  }
  return "";
}

export function normalizeNotification(item = {}, role = "patient") {
  const id = item.Id ?? item.id ?? item.NotificationId ?? item.notificationId ?? `local-${Date.now()}-${Math.random()}`;
  return {
    id: String(id),
    title: text(item.Title ?? item.title ?? item.Subject ?? item.subject) || "Notification",
    body: text(item.Body ?? item.body ?? item.Message ?? item.message ?? item.Content ?? item.content),
    isRead: Boolean(item.IsRead ?? item.isRead ?? item.Read ?? item.read),
    date: item.CreatedAt ?? item.createdAt ?? item.Date ?? item.date ?? new Date().toISOString(),
    category: getNotificationCategory(item),
    actionUrl: getNotificationActionUrl(item, role),
    raw: item,
  };
}
