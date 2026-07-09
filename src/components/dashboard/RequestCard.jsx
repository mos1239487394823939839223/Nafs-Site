import { motion } from "framer-motion";

/**
 * Modern support-ticket card with a clear visual hierarchy:
 *
 *   Top:    title (patient name)  +  status / priority / type badges
 *   Middle: secondary detail rows ([{ label, value, dir? }])
 *   Bottom: actions (relevant to the current status only)
 *
 * Generic enough to render manual-payment, refund, and other ticket types
 * without re-implementing the chrome each time.
 */
export default function RequestCard({
  title,
  subtitle,
  badges = [],
  details = [],
  note,
  actions,
  index = 0,
  highlight = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className={`flex flex-col rounded-2xl border bg-background-paper p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--ds-shadow-hover)] ${
        highlight ? "border-red-300 ring-1 ring-red-100" : "border-border hover:border-primary/30"
      }`}
    >
      {/* Top: name + status / priority / type */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-text-heading">{title}</p>
          {subtitle && <p className="mt-0.5 truncate text-xs text-text-muted">{subtitle}</p>}
        </div>
        {badges.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {badges.map((badge, i) =>
              badge ? (
                <span
                  key={i}
                  className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    badge.className || "border-border bg-background-subtle text-text-muted"
                  }`}
                >
                  {badge.label}
                </span>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* Middle: secondary details */}
      {details.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {details.map((row, i) =>
            row ? (
              <div key={i} className={row.full ? "col-span-2" : ""}>
                <dt className="text-[11px] font-medium text-text-muted">{row.label}</dt>
                <dd
                  dir={row.dir}
                  className={`mt-0.5 truncate text-sm font-semibold ${row.tone || "text-text-heading"}`}
                  title={typeof row.value === "string" ? row.value : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      )}

      {note}

      {/* Bottom: actions */}
      {actions && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
