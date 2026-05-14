import { Filter as FilterIcon } from 'lucide-react'

/**
 * Responsive filter-chip row.
 *
 *  - On wide screens chips lay out naturally in a row.
 *  - On narrow screens the row becomes horizontally scrollable; each chip keeps
 *    its intrinsic width via `shrink-0 min-w-fit whitespace-nowrap`.
 *  - Works with RTL out-of-the-box (uses logical properties).
 *  - The global `* { min-width: 0 }` rule is neutralised on chips so flex
 *    cannot squash them and clip their Arabic labels.
 *
 * Props:
 *   - items      : Array<{ id, label, icon? }>
 *   - value      : currently selected id
 *   - onChange   : (id) => void
 *   - showIcon   : boolean — show the Filter icon at the start
 *   - size       : 'sm' | 'md'  (default 'md')
 *   - className  : extra classes for the wrapper
 *   - variant    : 'pill' (default) | 'soft'
 */
export default function FilterChips({
    items = [],
    value,
    onChange,
    showIcon = true,
    size = 'md',
    className = '',
    variant = 'pill',
}) {
    const padding = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

    return (
        <div
            className={`flex items-center gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 -mx-1 px-1 no-scrollbar ${className}`}
            role="tablist"
        >
            {showIcon && (
                <FilterIcon className="w-5 h-5 text-text-light shrink-0 me-1" />
            )}
            {items.map((item) => {
                const active = value === item.id
                const ItemIcon = item.icon
                const base = `shrink-0 min-w-fit whitespace-nowrap rounded-full font-medium transition-all inline-flex items-center gap-1.5 ${padding}`
                const tone = active
                    ? variant === 'soft'
                        ? 'bg-primary/10 text-primary border border-primary/40'
                        : 'bg-primary text-white shadow-md border border-primary'
                    : 'bg-background-paper text-text-muted border border-border hover:bg-background-subtle'

                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange?.(item.id)}
                        className={`${base} ${tone}`}
                    >
                        {ItemIcon && <ItemIcon className="w-3.5 h-3.5 shrink-0" />}
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}
