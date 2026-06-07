import { AlertTriangle } from "lucide-react";
import { getRoomCaseTypeMeta, getSupportCaseTypeMeta } from "../../lib/supportCaseTypes";

export default function SupportCaseTag({
  type,
  room,
  isRTL = false,
  localMap = {},
  selected = false,
  showDot = true,
  size = "sm",
  className = "",
}) {
  const meta = room
    ? getRoomCaseTypeMeta(room, isRTL, localMap)
    : getSupportCaseTypeMeta(type, isRTL);
  const sizeClass = size === "md" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold whitespace-nowrap ${sizeClass} ${
        selected ? meta.solidClassName : meta.className
      } ${meta.priority ? "ring-1 ring-red-300" : ""} ${className}`}
    >
      {meta.priority ? (
        <AlertTriangle className="w-3 h-3" />
      ) : showDot ? (
        <span className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-white" : meta.dotClassName}`} />
      ) : null}
      {meta.label}
    </span>
  );
}
