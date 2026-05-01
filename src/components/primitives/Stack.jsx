import React from 'react'
import { cn } from '../../lib/utils'

/**
 * A layout primitive that enforces flex-col direction.
 * Usage: <Stack gap="4" align="center">...</Stack>
 */
export function Stack({ 
  children, 
  className, 
  gap = '4', 
  align = 'stretch', 
  justify = 'start', 
  ...props 
}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
          'justify-between': justify === 'between',
        },
        gap && `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
