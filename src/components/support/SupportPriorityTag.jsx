import { AlertCircle, Minus } from "lucide-react";

const priorityMeta = {
  urgent: {
    icon: AlertCircle,
    labelEn: "Urgent",
    labelAr: "عاجل",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  normal: {
    icon: Minus,
    labelEn: "Normal",
    labelAr: "عادي",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

export function getSupportPriority(room = {}) {
  const raw = String(
    room.Priority ?? room.priority ?? room.SupportPriority ?? room.supportPriority ?? "",
  ).toLowerCase();
  if (room.IsHighPriority === true || room.isHighPriority === true) return "urgent";
  if (["urgent", "high", "critical"].includes(raw)) return "urgent";
  return "normal";
}

export default function SupportPriorityTag({ priority, room, isRTL = false }) {
  const key = priority || getSupportPriority(room);
  const meta = priorityMeta[key] || priorityMeta.normal;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.className}`}>
      <Icon className="h-3 w-3" />
      {isRTL ? meta.labelAr : meta.labelEn}
    </span>
  );
}
