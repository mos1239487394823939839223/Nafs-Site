import * as React from 'react'
import MuiButton from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Map custom variants to MUI variants + color
const variantMap = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  outline: { variant: 'outlined', color: 'inherit' },
  ghost: { variant: 'text', color: 'inherit' },
  danger: { variant: 'contained', color: 'error' },
  glass: { variant: 'outlined', color: 'inherit' },
  link: { variant: 'text', color: 'primary' },
}

const sizeMap = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
  icon: 'medium',
}

const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', asChild = false, isLoading, disabled, children, onClick, onPress, style, sx, ...props }, ref) => {
    const mapped = variantMap[variant] || variantMap.primary
    const muiSize = sizeMap[size] || 'medium'

    // Handle icon-only button
    if (size === 'icon') {
      return (
        <IconButton
          ref={ref}
          disabled={disabled || isLoading}
          onClick={onPress || onClick}
          color={mapped.color}
          className={className}
          sx={{
            width: 40,
            height: 40,
            ...sx,
          }}
          {...props}
        >
          {isLoading ? <CircularProgress size={16} color="inherit" /> : children}
        </IconButton>
      )
    }

    // Glass variant gets special styling
    const glassSx = variant === 'glass' ? {
      backgroundColor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(255,255,255,0.2)',
      color: '#fff',
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.3)',
      },
    } : {}

    // Link variant styling
    const linkSx = variant === 'link' ? {
      padding: 0,
      height: 'auto',
      minWidth: 'auto',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
        backgroundColor: 'transparent',
      },
    } : {}

    return (
      <MuiButton
        ref={ref}
        variant={mapped.variant}
        color={mapped.color}
        size={muiSize}
        disabled={disabled || isLoading}
        onClick={onPress || onClick}
        className={className}
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{
          minWidth: 40,
          borderRadius: 'var(--ds-radius-control)',
          ...glassSx,
          ...linkSx,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
export { Button }
