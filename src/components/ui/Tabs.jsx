import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-12 items-center gap-1 rounded-xl bg-background-subtle/50 p-1',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
      'text-text-muted hover:text-text hover:bg-background-paper/60',
      'data-[state=active]:bg-background-paper data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:shadow-primary/10',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none animate-fade-in',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
