import * as React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-300',
      hover && 'cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold leading-none tracking-tight text-text-heading', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0', className)}
    {...props}
  />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export default Card
export { Card, CardHeader, CardTitle, CardContent, CardFooter }
