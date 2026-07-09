/**
 * Horizontal filter bar. Options: [{ value, label, count? }].
 * The selected filter is highlighted; the bar scrolls horizontally on small
 * screens so it never wraps into a heavy stack.
 */
export default function FilterBar({ options, value, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={`no-scrollbar flex items-center gap-2 overflow-x-auto ${className}`}
    >
      {options.map((option) => {
        const isActive = String(option.value) === String(value);
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isActive
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-border bg-background-paper text-text-muted hover:border-primary/30 hover:text-text-heading"
            }`}
          >
            {option.label}
            {option.count !== undefined && option.count !== null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  isActive ? "bg-white/20 text-white" : "bg-background-subtle text-text-muted"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
