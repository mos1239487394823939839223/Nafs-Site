import { cn } from '../../lib/utils'

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-background-paper rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary/5 border border-border/50 p-4 transition-all duration-300',
        hover && 'cursor-pointer hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-xl font-semibold text-text-heading', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('text-text', className)}>
      {children}
    </div>
  )
}
