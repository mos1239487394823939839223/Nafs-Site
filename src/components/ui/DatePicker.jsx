import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar as CalendarIcon } from 'lucide-react'
import { forwardRef } from 'react'

/**
 * Custom trigger button rendered by react-datepicker
 */
const CustomInput = forwardRef(({ value, onClick, placeholder, label, error, icon: Icon, disabled }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-text-heading mb-1.5">
        {label}
      </label>
    )}
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-start
        transition-all duration-200 bg-background
        focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
        disabled:opacity-60 disabled:cursor-not-allowed
        ${error
          ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
          : 'border-border hover:border-primary/60'
        }
      `}
    >
      {Icon ? (
        <Icon className="w-4 h-4 text-text-muted flex-shrink-0" />
      ) : (
        <CalendarIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
      )}
      <span className={`flex-1 text-sm ${value ? 'text-text-heading font-medium' : 'text-text-muted'}`}>
        {value || placeholder || 'Select date…'}
      </span>
      <CalendarIcon className="w-4 h-4 text-primary opacity-60 flex-shrink-0" />
    </button>
    {error && (
      <p className="mt-1 text-xs text-red-500">{error}</p>
    )}
  </div>
))

CustomInput.displayName = 'CustomInput'

/**
 * DatePicker – project-wide date picker component.
 *
 * Props:
 *  - value        : string  "YYYY-MM-DD"  (controlled)
 *  - onChange     : (dateStr: string) => void
 *  - label        : string
 *  - placeholder  : string
 *  - error        : string
 *  - icon         : MUI SvgIconComponent
 *  - minDate      : Date
 *  - maxDate      : Date
 *  - disabled     : bool
 *  - className    : string (wrapper)
 */
export default function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  error,
  icon,
  minDate,
  maxDate,
  disabled = false,
  className = '',
}) {
  // Convert string "YYYY-MM-DD" → Date for react-datepicker
  const selected = value ? new Date(value + 'T00:00:00') : null

  const handleChange = (date) => {
    if (!date) { onChange(''); return }
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
  }

  return (
    <div className={`nafs-datepicker ${className}`}>
      <ReactDatePicker
        selected={selected}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperPlacement="bottom-start"
        popperModifiers={[
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'preventOverflow', options: { padding: 16 } },
        ]}
        customInput={
          <CustomInput
            label={label}
            placeholder={placeholder}
            error={error}
            icon={icon}
            disabled={disabled}
          />
        }
      />
    </div>
  )
}
