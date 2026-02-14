import { cn } from '../../lib/utils'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-sm',
    outline: 'border border-primary text-primary hover:bg-primary/5 focus:ring-primary',
    ghost: 'text-text-muted hover:text-text hover:bg-background-subtle focus:ring-border',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
