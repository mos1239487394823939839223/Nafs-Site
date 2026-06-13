import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * SelectDropdown – Beautiful custom dropdown to replace all <select> elements.
 *
 * Props:
 *  - options    : Array<{ value: any, label: string, icon?: ReactNode }>
 *  - value      : any   (controlled)
 *  - onChange   : (value: any) => void
 *  - label      : string
 *  - placeholder: string  (shown when nothing selected)
 *  - error      : string
 *  - disabled   : bool
 *  - className  : string (wrapper)
 *  - size       : 'sm' | 'md' (default 'md')
 */
export default function SelectDropdown({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select…',
  error,
  disabled = false,
  className = '',
  size = 'md',
}) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({})
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const id = useId()

  const selected = options.find(o => String(o.value) === String(value))

  // Position the portal menu relative to trigger
  const updateMenuPos = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const menuH = Math.min(options.length * 44 + 8, 260)
    const above = spaceBelow < menuH && rect.top > menuH

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(above
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }

  const toggle = () => {
    if (disabled) return
    if (!open) updateMenuPos()
    setOpen(o => !o)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Update position on scroll/resize
  useEffect(() => {
    if (!open) return
    const update = () => updateMenuPos()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  const handleSelect = (opt) => {
    onChange(opt.value)
    setOpen(false)
  }

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-sm min-h-[36px]'
    : 'px-4 py-2.5 text-sm min-h-[44px]'

  return (
    <div className={`nafs-select w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-heading mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 rounded-xl border
          bg-background transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary
          disabled:opacity-60 disabled:cursor-not-allowed
          ${sizeClasses}
          ${error
            ? 'border-red-400 focus:ring-red-300'
            : open
              ? 'border-secondary ring-2 ring-secondary/20'
              : 'border-border hover:border-secondary/60'
          }
        `}
      >
        <span className={`flex-1 text-start truncate ${selected ? 'text-text-heading font-medium' : 'text-text-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-secondary' : ''}`}
          style={{ width: 18, height: 18 }}
        />
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Portal dropdown menu */}
      {open && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="nafs-select-menu bg-background-paper border border-border rounded-2xl shadow-2xl overflow-hidden"
          role="listbox"
        >
          <div className="overflow-y-auto max-h-60 py-1">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-secondary/10 text-secondary font-semibold'
                      : 'text-text-heading hover:bg-background-subtle'
                    }
                  `}
                >
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="flex-1">{opt.label}</span>
                  {isSelected && (
                    <Check style={{ width: 16, height: 16 }} className="text-secondary flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
