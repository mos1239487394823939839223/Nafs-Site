import { cn } from '../../lib/utils'

export default function Input({
  label,
  error,
  className,
  type = 'text',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-text placeholder-text-muted',
          error ? 'border-red-500' : 'border-border',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-text',
          error ? 'border-red-500' : 'border-border',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background text-text placeholder-text-muted',
          error ? 'border-red-500' : 'border-border',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
