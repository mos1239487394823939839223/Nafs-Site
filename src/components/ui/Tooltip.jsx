import * as React from 'react'
import MuiTooltip from '@mui/material/Tooltip'

const TooltipProvider = ({ children }) => <>{children}</>

// Compound Tooltip that collects Trigger + Content
function Tooltip({ children }) {
  let triggerChild = null
  let tooltipTitle = ''

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === TooltipTrigger || child.type?.displayName === 'TooltipTrigger') {
      triggerChild = child
    }
    if (child.type === TooltipContent || child.type?.displayName === 'TooltipContent') {
      tooltipTitle = child.props.children
    }
  })

  if (!triggerChild) return <>{children}</>

  // Get the actual trigger element (handle asChild)
  const triggerElement = triggerChild.props.asChild
    ? triggerChild.props.children
    : triggerChild.props.children

  return (
    <MuiTooltip title={tooltipTitle || ''} arrow placement="top">
      {React.isValidElement(triggerElement)
        ? triggerElement
        : <span>{triggerElement}</span>
      }
    </MuiTooltip>
  )
}

const TooltipTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  return React.isValidElement(children)
    ? React.cloneElement(children, { ref, ...props })
    : <span ref={ref} {...props}>{children}</span>
})
TooltipTrigger.displayName = 'TooltipTrigger'

const TooltipContent = React.forwardRef(({ children, ...props }, ref) => {
  return null // Content is extracted by parent Tooltip
})
TooltipContent.displayName = 'TooltipContent'

// Simplified tooltip for direct usage
function SimpleTooltip({ title, children, placement = 'top', arrow = true, ...props }) {
  return (
    <MuiTooltip title={title} placement={placement} arrow={arrow} {...props}>
      {children}
    </MuiTooltip>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SimpleTooltip }
export default SimpleTooltip
