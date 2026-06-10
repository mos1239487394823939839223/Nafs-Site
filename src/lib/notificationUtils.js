import { Roles } from "../contexts/AuthContext";

const text = (value) => String(value ?? "").trim();

export function extractRelatedEntities(item = {}) {
  return {
    bookingId: text(item.BookingId ?? item.bookingId ?? item.AppointmentId ?? item.appointmentId),
    messageId: text(item.MessageId ?? item.messageId ?? item.ChatMessageId ?? item.chatMessageId),
    roomId: text(item.RoomId ?? item.roomId ?? item.ChatRoomId ?? item.chatRoomId),
    supportCaseId: text(
      item.SupportCaseId ??
        item.supportCaseId ??
        item.CaseId ??
        item.caseId ??
        item.TicketId ??
        item.ticketId,
    ),
    emergencyCaseId: text(item.EmergencyCaseId ?? item.emergencyCaseId),
  };
}

function isSupportPayload(item = {}) {
  const raw = [
    item.Type,
    item.type,
    item.NotificationType,
    item.notificationType,
    item.SupportCaseType,
    item.supportCaseType,
    item.CaseType,
    item.caseType,
    item.Title,
    item.title,
    item.Body,
    item.body,
  ]
    .map(text)
    .join(" ")
    .toLowerCase();

  if (item.IsSupport === true || item.isSupport === true) return true;
  if (/blackmail|abuse|bullying|ابتزاز|عنف/.test(raw)) return true;
  if (/emergency|urgent|طارئ|عاجل/.test(raw)) return true;
  return /support|ticket|دعم/.test(raw);
}

function messagesBasePath(role) {
  if (role === Roles.PATIENT) return "/dashboard/patient/messages";
  if (role === Roles.DOCTOR) return "/dashboard/doctor/messages";
  if (role === Roles.STAFF) return "/dashboard/staff/messages";
  return "/admin/messages";
}

function appointmentsBasePath(role) {
  if (role === Roles.PATIENT) return "/dashboard/patient/reserve";
  if (role === Roles.DOCTOR) return "/dashboard/doctor/queue";
  return "/admin/bookings";
}

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
  ]
    .map(text)
    .join(" ")
    .toLowerCase();

  if (/blackmail|abuse|bullying|ابتزاز|عنف/.test(raw)) return "emergency";
  if (/emergency|urgent|طارئ|عاجل|high priority/.test(raw)) return "emergency";
  if (/message|chat|رسالة|محادثة/.test(raw)) return isSupportPayload(item) ? "support" : "messages";
  if (/support|ticket|refund|payment|دعم|طلب|استرداد|دفع/.test(raw)) return "support";
  if (/booking|appointment|session|reminder|موعد|حجز|جلسة|تذكير/.test(raw)) return "appointments";
  return "system";
}

export function getNotificationActionUrl(item = {}, role = "patient") {
  const direct = text(item.ActionUrl ?? item.actionUrl ?? item.Url ?? item.url ?? item.Link ?? item.link);
  if (direct.startsWith("/")) return direct;

  const related = extractRelatedEntities(item);
  const category = getNotificationCategory(item);
  const params = new URLSearchParams();

  if (category === "messages" || category === "support" || category === "emergency") {
    if (related.roomId) params.set("room", related.roomId);
    if (isSupportPayload(item)) {
      params.set("type", "support");
      const caseType = text(item.SupportCaseType ?? item.supportCaseType ?? item.CaseType ?? item.caseType);
      if (caseType) params.set("caseType", caseType);
      params.set("support", "1");
    } else {
      params.set("type", "doctors");
    }
    const query = params.toString();
    return query ? `${messagesBasePath(role)}?${query}` : messagesBasePath(role);
  }

  if (category === "appointments") {
    if (role === Roles.PATIENT) {
      if (related.bookingId && /10m|start|now|join|meeting/i.test(text(item.Title ?? item.title))) {
        return `/dashboard/patient/meeting/${encodeURIComponent(related.bookingId)}`;
      }
      params.set("tab", "status");
      if (related.bookingId) params.set("bookingId", related.bookingId);
      return `${appointmentsBasePath(role)}?${params.toString()}`;
    }
    if (related.bookingId) params.set("bookingId", related.bookingId);
    const query = params.toString();
    return query ? `${appointmentsBasePath(role)}?${query}` : appointmentsBasePath(role);
  }

  return "";
}

export function normalizeNotification(item = {}, role = "patient") {
  const id = item.Id ?? item.id ?? item.NotificationId ?? item.notificationId ?? `local-${Date.now()}-${Math.random()}`;
  const related = extractRelatedEntities(item);

  return {
    id: String(id),
    title: text(item.Title ?? item.title ?? item.Subject ?? item.subject) || "Notification",
    body: text(item.Body ?? item.body ?? item.Message ?? item.message ?? item.Content ?? item.content),
    isRead: Boolean(item.IsRead ?? item.isRead ?? item.Read ?? item.read),
    date: item.CreatedAt ?? item.createdAt ?? item.Date ?? item.date ?? new Date().toISOString(),
    category: getNotificationCategory(item),
    actionUrl: getNotificationActionUrl(item, role),
    relatedEntity: related,
    raw: item,
  };
}

export function mapRealtimeNotification(eventName, payload = {}, role = "patient") {
  const source = payload?.notification ? { ...payload.notification, ...(payload.data || {}) } : payload;
  const event = String(eventName || "").toLowerCase();

  const defaults = { IsRead: false };

  if (event.includes("bookingcreated") || event.includes("newbooking")) {
    defaults.Type = "appointments";
    defaults.Title = source.Title || "New booking created";
  } else if (event.includes("bookingconfirmed")) {
    defaults.Type = "appointments";
    defaults.Title = source.Title || "Booking confirmed";
  } else if (event.includes("bookingcancel")) {
    defaults.Type = "appointments";
    defaults.Title = source.Title || "Booking cancelled";
  } else if (event.includes("bookingstatus") || event.includes("bookingupdated")) {
    defaults.Type = "appointments";
    defaults.Title = source.Title || "Booking status updated";
  } else if (event.includes("appointmentreminder") || event.includes("sessionreminder")) {
    defaults.Type = "appointments";
    defaults.NotificationType = "AppointmentReminder";
    defaults.Title = source.Title || "Session reminder";
  } else if (event.includes("emergency") || event.includes("blackmail") || event.includes("abuse")) {
    defaults.Type = "emergency";
    defaults.Title = source.Title || "Emergency alert";
  } else if (event.includes("support")) {
    defaults.Type = "support";
    defaults.Title = source.Title || "Support update";
  } else if (event.includes("message") || event.includes("chat")) {
    defaults.Type = isSupportPayload(source) ? "support" : "messages";
    defaults.Title =
      source.Title ||
      (defaults.Type === "support" ? "New support message" : "New therapist message");
  }

  return normalizeNotification({ ...defaults, ...source }, role);
}
