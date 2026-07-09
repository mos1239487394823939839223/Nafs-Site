import { Loader2 } from "lucide-react";

export default function Switch({
  checked = false,
  disabled = false,
  loading = false,
  onCheckedChange,
  checkedLabel = "Active",
  uncheckedLabel = "Inactive",
  ariaLabel,
  className = "",
  bare = false,
}) {
  const label = checked ? checkedLabel : uncheckedLabel;

  // Track + thumb only — no label or bordered wrapper. Use inside cards/rows
  // that already render their own icon and text.
  if (bare) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        disabled={disabled || loading}
        onClick={() => onCheckedChange?.(!checked)}
        className={`group relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background-paper disabled:cursor-not-allowed disabled:opacity-50 ${
          checked
            ? "bg-primary hover:bg-primary-dark"
            : "bg-gray-300 hover:bg-gray-400 dark:bg-background-subtle"
        } ${className}`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          }`}
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted" />}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      disabled={disabled || loading}
      onClick={() => onCheckedChange?.(!checked)}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-background-paper text-text-muted"
      } ${className}`}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-emerald-500" : "bg-background-subtle border border-border"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {label}
      </span>
    </button>
  );
}
