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
      <h2 className="text-start text-xl font-black leading-7 text-[#1F2D2A]">{title}</h2>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold leading-5 text-[#2D7A61] transition-colors hover:bg-[#EAF5F0] hover:text-[#0F4C3A]"
      >
        {actionLabel}
      </button>
    </div>
  );
}
