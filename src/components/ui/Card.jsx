import { cn } from '../../lib/utils'

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
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
    <h3 className={cn('text-xl font-semibold text-clinical-darkGray', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('text-clinical-gray', className)}>
      {children}
    </div>
  )
}
