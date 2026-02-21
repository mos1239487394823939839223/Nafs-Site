import { cn } from '../../lib/utils'

export default function Spinner({ className, size = 'md', label }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'rounded-full border-primary/30 border-t-primary animate-spin',
          sizes[size],
          className
        )}
      />
      {label && (
        <span className="text-sm text-text-muted animate-pulse">{label}</span>
      )}
    </div>
  )
}
