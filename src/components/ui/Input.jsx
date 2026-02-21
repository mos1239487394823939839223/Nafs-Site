import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(
  ({ className, type = 'text', label, error, icon: Icon, startContent, ...props }, ref) => {
    const IconComp = Icon || (startContent ? () => startContent : null)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {IconComp && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none">
              {Icon ? <Icon className="w-4 h-4" /> : startContent}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border bg-background-subtle/50 px-4 py-2 text-sm text-text transition-all duration-200',
              'placeholder:text-text-light/50',
              'hover:bg-background-subtle hover:border-border-dark',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-border-light',
              IconComp ? 'pl-10' : '',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <select
        className={cn(
          'flex h-11 w-full rounded-xl border bg-background-subtle/50 px-4 py-2 text-sm text-text transition-all duration-200',
          'hover:bg-background-subtle hover:border-border-dark',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer appearance-none',
          error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-border-light',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'flex w-full rounded-xl border bg-background-subtle/50 px-4 py-3 text-sm text-text transition-all duration-200 resize-none min-h-[88px]',
          'placeholder:text-text-light/50',
          'hover:bg-background-subtle hover:border-border-dark',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-border-light',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

export default Input
