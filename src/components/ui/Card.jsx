import { cn } from '../../lib/utils'

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-background-paper rounded-xl shadow-sm border border-border p-6',
        hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
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
