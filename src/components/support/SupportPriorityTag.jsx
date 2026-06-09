import { AlertCircle, ArrowDown, Minus } from "lucide-react";

const priorityMeta = {
  high: {
    icon: AlertCircle,
    labelEn: "High Priority",
    labelAr: "أولوية مرتفعة",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  medium: {
    icon: Minus,
    labelEn: "Medium Priority",
    labelAr: "أولوية متوسطة",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  low: {
    icon: ArrowDown,
    labelEn: "Low Priority",
    labelAr: "أولوية منخفضة",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function getSupportPriority(room = {}) {
  const raw = String(
    room.Priority ?? room.priority ?? room.SupportPriority ?? room.supportPriority ?? "",
  ).toLowerCase();
  if (room.IsHighPriority === true || room.isHighPriority === true || raw === "urgent") return "high";
  if (["high", "medium", "low"].includes(raw)) return raw;
  return Number(room.UnreadCount ?? room.unreadCount ?? 0) > 0 ? "medium" : "low";
}

export default function SupportPriorityTag({ priority, room, isRTL = false }) {
  const key = priority || getSupportPriority(room);
  const meta = priorityMeta[key] || priorityMeta.low;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.className}`}>
      <Icon className="h-3 w-3" />
      {isRTL ? meta.labelAr : meta.labelEn}
    </span>
  );
}
