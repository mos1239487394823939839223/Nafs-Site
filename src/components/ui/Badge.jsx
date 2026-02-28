import * as React from 'react'
import Chip from '@mui/material/Chip'

const colorMap = {
  default: { color: 'default', variant: 'outlined' },
  primary: { color: 'primary', variant: 'outlined' },
  secondary: { color: 'secondary', variant: 'outlined' },
  success: { color: 'success', variant: 'outlined' },
  warning: { color: 'warning', variant: 'outlined' },
  danger: { color: 'error', variant: 'outlined' },
  info: { color: 'info', variant: 'outlined' },
}

const Badge = React.forwardRef(({ className, variant = 'default', children, sx, ...props }, ref) => {
  const mapped = colorMap[variant] || colorMap.default

  return (
    <Chip
      ref={ref}
      label={children}
      color={mapped.color}
      variant={mapped.variant}
      size="small"
      className={className}
      sx={{
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 'auto',
        '& .MuiChip-label': {
          px: 1.25,
          py: 0.25,
        },
        ...sx,
      }}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export default Badge
export { Badge }
