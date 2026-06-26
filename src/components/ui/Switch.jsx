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
}) {
  const label = checked ? checkedLabel : uncheckedLabel;

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
