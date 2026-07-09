import { motion } from "framer-motion";

/**
 * Compact KPI card: small icon, title, big number, subtle colored indicator.
 * Tones map to a restrained semantic palette (neutral by default, color only to
 * signal meaning): "neutral" | "success" | "danger" | "warning" | "info".
 */
const TONES = {
  neutral: { icon: "bg-background-subtle text-text-muted", dot: "bg-text-muted/40" },
  success: { icon: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  danger: { icon: "bg-red-50 text-red-600", dot: "bg-red-500" },
  warning: { icon: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  info: { icon: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
};

export default function KPIWidget({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  loading = false,
  onClick,
  active = false,
}) {
  const toneStyle = TONES[tone] || TONES.neutral;
  const interactive = typeof onClick === "function";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={interactive ? { y: -2 } : undefined}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      className={`group relative flex items-center gap-3 rounded-2xl border bg-background-paper p-3.5 transition-all duration-200 ${
        active
          ? "border-primary ring-1 ring-primary/30"
          : "border-border hover:border-primary/30 hover:shadow-[var(--ds-shadow-card)]"
      } ${interactive ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" : ""}`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneStyle.icon}`}>
        {Icon ? <Icon className="h-5 w-5" /> : <span className={`h-2 w-2 rounded-full ${toneStyle.dot}`} />}
      </span>
      <div className="min-w-0">
        {loading ? (
          <span className="block h-6 w-10 animate-pulse rounded-md bg-background-subtle" />
        ) : (
          <p className="text-xl font-black leading-none text-text-heading">{value}</p>
        )}
        <p className="mt-1 truncate text-[11px] font-semibold text-text-muted">{label}</p>
      </div>
    </motion.div>
  );
}
