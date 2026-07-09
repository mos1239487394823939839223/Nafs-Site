import { UserAvatar } from "../ui/Avatar";

/**
 * Responsive card representation of a table row, used below the md breakpoint.
 * Mirrors the table's hierarchy: user identity → badges → secondary meta →
 * actions. `meta` is [{ label, value }]; `badges` and `actions` are nodes.
 */
export default function UserCard({ name, email, avatar, badges, meta = [], actions }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background-paper p-4 shadow-[var(--ds-shadow-card)] transition-all hover:border-primary/30">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar name={name} src={avatar} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-heading">{name || "—"}</p>
          {email && <p className="truncate text-xs text-text-muted">{email}</p>}
        </div>
        {badges}
      </div>

      {meta.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/60 pt-3">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-[11px] font-medium text-text-muted">{m.label}</dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-text-heading" dir="auto">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex items-center justify-end gap-1 border-t border-border/60 pt-3">{actions}</div>
    </div>
  );
}
