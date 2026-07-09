import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

/**
 * Compact action group: a few always-visible primary actions plus an overflow
 * "More" (…) menu for the rest.
 *
 *   primary: [{ key, label, icon, onClick, tone? }]
 *   more:    [{ key, label, icon, onClick, tone?, divider? }]
 *
 * tone: "default" | "danger". The menu is rendered in a portal and positioned
 * under the trigger, closes on outside click / Escape, and is keyboard-navigable.
 */
export default function ActionMenu({ primary = [], more = [], align = "end", labels = {} }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const width = 200;
      const left = align === "end" ? r.right - width : r.left;
      setCoords({ top: r.bottom + 6, left: Math.max(8, left), width });
    }
    setOpen((v) => !v);
  };

  return (
    <div className="inline-flex items-center justify-end gap-1">
      {primary.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            aria-label={action.label}
            title={action.label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-subtle hover:text-text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      {more.length > 0 && (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={labels.more || "More"}
            title={labels.more || "More"}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              open ? "bg-background-subtle text-text-heading" : "text-text-muted hover:bg-background-subtle hover:text-text-heading"
            }`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {open &&
            coords &&
            createPortal(
              <div
                ref={menuRef}
                role="menu"
                style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width, zIndex: 60 }}
                className="overflow-hidden rounded-xl border border-border bg-background-paper py-1 shadow-[var(--ds-shadow-hover)]"
              >
                {more.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.key}>
                      {action.divider && <div className="my-1 h-px bg-border" />}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          action.onClick?.();
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors hover:bg-background-subtle focus:outline-none focus-visible:bg-background-subtle ${
                          action.tone === "danger" ? "text-red-600" : "text-text-heading"
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{action.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
