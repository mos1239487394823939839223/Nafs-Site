import React from 'react'
import { cn } from '../../lib/utils'

/**
 * An Icon wrapper that handles mirroring in RTL mode automatically.
 * Set `directional=true` for arrows, chevrons, etc.
 * Usage: <DirectionalIcon icon={ChevronRight} directional={true} className="w-5 h-5" />
 */
export function DirectionalIcon({ 
  icon: IconComponent, 
  directional = true, 
  className, 
  ...props 
}) {
  if (!IconComponent) return null;
  
  return (
    <IconComponent 
      className={cn(
        className,
        // Automatically flips the icon on the X-axis when the document is RTL
        directional && "rtl:scale-x-[-1]"
      )} 
      {...props}
    />
  )
}
