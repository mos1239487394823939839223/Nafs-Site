/**
 * Clean status badge with a leading dot. Subtle colors only — neutral by
 * default, color reserved to carry meaning.
 *
 * status: "active" | "inactive" | "suspended" | "pending" | "admin" | "support" | "neutral"
 */
const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  inactive: { dot: "bg-text-muted/50", text: "text-text-muted", bg: "bg-background-subtle", border: "border-border" },
  suspended: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  pending: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  admin: { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  support: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  neutral: { dot: "bg-text-muted/50", text: "text-text-muted", bg: "bg-background-subtle", border: "border-border" },
};

export default function StatusBadge({ status = "neutral", icon: Icon, children, className = "" }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text} ${s.border} ${className}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {children}
    </span>
  );
}
