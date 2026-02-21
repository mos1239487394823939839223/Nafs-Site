import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-background-subtle text-text-muted border border-border/50',
        primary: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary/15 text-primary-dark border border-secondary/30',
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
        info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(badgeVariants({ variant }), className)}
    {...props}
  />
))
Badge.displayName = 'Badge'

export default Badge
export { Badge, badgeVariants }
