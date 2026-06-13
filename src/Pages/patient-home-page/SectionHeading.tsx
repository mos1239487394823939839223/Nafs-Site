export function SectionHeading({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-start text-xl font-black leading-7 text-text-heading">{title}</h2>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold leading-5 text-secondary transition-colors hover:bg-background-subtle hover:text-primary"
      >
        {actionLabel}
      </button>
    </div>
  );
}
