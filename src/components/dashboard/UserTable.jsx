import { UserAvatar } from "../ui/Avatar";

/**
 * Enterprise data table for user lists.
 *
 *   columns: [{ key, header, align?, className?, render?(row) }]
 *            A column with key "user" is special-cased into the avatar + name +
 *            email cell when no custom render is given.
 *   rows:    array of user objects
 *   rowKey:  (row) => string
 *   getUser: (row) => ({ name, email, avatar }) for the special user cell
 *
 * Sticky header, hover highlight, generous row spacing, horizontal scroll on
 * overflow. Mobile rendering is handled separately by the caller (cards).
 */
export default function UserTable({ columns, rows, rowKey, getUser, emptyState }) {
  if (!rows.length) return emptyState || null;

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-background-subtle/60 backdrop-blur">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-4 py-3 text-${col.align || "start"} text-[11px] font-semibold uppercase tracking-wide text-text-muted ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-background-subtle/50"
            >
              {columns.map((col) => {
                if (col.key === "user" && !col.render) {
                  const u = getUser(row);
                  return (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar name={u.name} src={u.avatar} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text-heading">{u.name || "—"}</p>
                          {u.email && <p className="truncate text-xs text-text-muted">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                  );
                }
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-${col.align || "start"} ${col.cellClassName || "text-text-muted"}`}
                  >
                    {col.render ? col.render(row) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
