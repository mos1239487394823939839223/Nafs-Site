import React from 'react'
import { cn } from '../../lib/utils'

/**
 * A layout primitive that enforces flex-row direction safely.
 * Usage: <Row gap="4" justify="between" items="center">...</Row>
 */
export function Row({ 
  children, 
  className, 
  gap = '4', 
  align = 'center', 
  justify = 'start', 
  wrap = false, 
  ...props 
}) {
  return (
    <div
      className={cn(
        'flex flex-row',
        {
          'flex-wrap': wrap,
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
