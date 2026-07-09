import { motion } from "framer-motion";

/**
 * Compact dashboard shortcut: icon, title, small description, count badge,
 * hover animation. Used to switch the active module (acts like a tab).
 */
export default function QuickModule({
  icon: Icon,
  title,
  description,
  count = 0,
  active = false,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      aria-pressed={active}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active
          ? "border-primary bg-primary/5 shadow-[var(--ds-shadow-card)]"
          : "border-border bg-background-paper hover:border-primary/30 hover:shadow-[var(--ds-shadow-card)]"
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
          active ? "bg-primary text-white" : "bg-background-subtle text-primary group-hover:bg-primary/10"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text-heading">{title}</p>
        {description && (
          <p className="mt-0.5 truncate text-xs text-text-muted">{description}</p>
        )}
      </div>

      {count > 0 && (
        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          {count}
        </span>
      )}
    </motion.button>
  );
}
