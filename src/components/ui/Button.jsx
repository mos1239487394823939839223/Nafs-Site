import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30',
        secondary: 'bg-secondary/15 text-primary border border-secondary/30 hover:bg-secondary/25',
        outline: 'border border-border bg-transparent text-text hover:bg-background-subtle hover:border-primary/40',
        ghost: 'text-text-light hover:bg-background-subtle hover:text-text',
        danger: 'bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-5',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, isLoading, disabled, children, onClick, onPress, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={onPress || onClick}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {children}
          </>
        ) : children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export default Button
export { Button, buttonVariants }
