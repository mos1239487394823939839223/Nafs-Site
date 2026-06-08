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
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-start text-xl font-bold leading-7 text-[#1F2937]">{title}</h2>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-sm font-medium leading-5 text-[#2B7A5F] hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
}
