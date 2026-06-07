export const ROOM_CASE_KEY = "nafs_room_case_types";

const CASE_TYPES = {
  blackmail_abuse: { labelEn: "Blackmail / Abuse Case", labelAr: "ابتزاز / عنف", className: "bg-rose-100 text-rose-900 border-rose-300", solidClassName: "bg-rose-800 text-white border-rose-800", dotClassName: "bg-rose-800", priority: true },
  emergency: { labelEn: "Emergency / Urgent", labelAr: "طارئ / عاجل", className: "bg-red-100 text-red-800 border-red-300", solidClassName: "bg-red-600 text-white border-red-600", dotClassName: "bg-red-600", priority: true },
  technical: { labelEn: "Technical Issue", labelAr: "مشكلة تقنية", className: "bg-orange-100 text-orange-800 border-orange-300", solidClassName: "bg-orange-600 text-white border-orange-600", dotClassName: "bg-orange-500" },
  medical: { labelEn: "Medical Inquiry", labelAr: "استفسار علاجي", className: "bg-blue-100 text-blue-800 border-blue-300", solidClassName: "bg-blue-600 text-white border-blue-600", dotClassName: "bg-blue-500" },
  billing: { labelEn: "Billing Issue", labelAr: "مشكلة في الدفع", className: "bg-emerald-100 text-emerald-800 border-emerald-300", solidClassName: "bg-emerald-600 text-white border-emerald-600", dotClassName: "bg-emerald-500" },
  appointment: { labelEn: "Appointment Issue", labelAr: "مشكلة في الموعد", className: "bg-violet-100 text-violet-800 border-violet-300", solidClassName: "bg-violet-600 text-white border-violet-600", dotClassName: "bg-violet-500" },
  account: { labelEn: "Account Issue", labelAr: "مشكلة في الحساب", className: "bg-sky-100 text-sky-800 border-sky-300" },
  general: { labelEn: "General Inquiry", labelAr: "استفسار عام", className: "bg-gray-100 text-gray-700 border-gray-300", solidClassName: "bg-gray-600 text-white border-gray-600", dotClassName: "bg-gray-500" },
  other: { labelEn: "Other", labelAr: "أخرى", className: "bg-slate-50 text-slate-700 border-slate-200", solidClassName: "bg-slate-500 text-white border-slate-500", dotClassName: "bg-slate-400" },
};

const CHAT_TYPE_MAP = { 2: "general", 3: "emergency", 4: "other" };

export function readLocalRoomCaseTypes() {
  try {
    return JSON.parse(localStorage.getItem(ROOM_CASE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getRoomCaseTypeKey(room = {}, localMap = {}) {
  const roomId = String(room.Id ?? room.id ?? "");
  const priority = String(
    room.Priority ?? room.priority ?? room.SupportPriority ?? room.supportPriority ?? "",
  ).toLowerCase();
  const raw = String(
    room.SupportCaseType ??
      room.supportCaseType ??
      room.CaseType ??
      room.caseType ??
      room.RequestType ??
      room.requestType ??
      localMap[roomId] ??
      "",
  ).toLowerCase().trim();

  if (CASE_TYPES[raw]) return raw;
  if (raw.includes("blackmail") || raw.includes("abuse") || raw.includes("bullying") || raw.includes("ابتزاز") || raw.includes("عنف")) return "blackmail_abuse";
  if (raw.includes("emergency") || raw.includes("urgent")) return "emergency";
  if (
    room.IsHighPriority === true ||
    room.isHighPriority === true ||
    priority === "high" ||
    priority === "urgent"
  ) {
    return "emergency";
  }
  if (raw.includes("technical")) return "technical";
  if (raw.includes("medical")) return "medical";
  if (raw.includes("billing") || raw.includes("payment")) return "billing";
  if (raw.includes("appointment") || raw.includes("booking")) return "appointment";
  if (raw.includes("account")) return "account";
  if (raw.includes("other")) return "other";
  const numeric = Number(
    room.ChatType ??
      room.chatType ??
      room.RoomType ??
      room.roomType ??
      room.ChatRoomType ??
      room.Type ??
      room.CaseType ??
      room.caseType,
  );
  return CHAT_TYPE_MAP[numeric] || "general";
}

export function getRoomCaseTypeMeta(room, isRTL = false, localMap = {}) {
  const key = getRoomCaseTypeKey(room, localMap);
  return getSupportCaseTypeMeta(key, isRTL);
}

export function getSupportCaseTypeMeta(key, isRTL = false) {
  const normalizedKey = CASE_TYPES[key] ? key : "other";
  const meta = CASE_TYPES[normalizedKey];
  return {
    key: normalizedKey,
    label: isRTL ? meta.labelAr : meta.labelEn,
    solidClassName: meta.solidClassName || meta.className,
    dotClassName: meta.dotClassName || "bg-slate-400",
    ...meta,
  };
}
