import { cn } from '../../lib/utils'

export default function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-background-subtle text-text-muted border border-border',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
