import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
))
Avatar.displayName = 'Avatar'

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
))
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white text-xs font-semibold',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'

// Helper component that combines Avatar + Fallback for easy use
function UserAvatar({ name, src, size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (
    <Avatar className={cn(sizes[size], 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background', className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
