import * as React from 'react'
import MuiAvatar from '@mui/material/Avatar'

function stringToColor(string) {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

const Avatar = React.forwardRef(({ className, children, src, alt, sx, ...props }, ref) => (
  <MuiAvatar
    ref={ref}
    src={src}
    alt={alt}
    className={className}
    sx={{
      width: 40,
      height: 40,
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiAvatar>
))
Avatar.displayName = 'Avatar'

// For compatibility - just pass through to MUI Avatar's built-in image handling
const AvatarImage = React.forwardRef(({ className, src, alt, ...props }, ref) => null)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <>{children}</>
))
AvatarFallback.displayName = 'AvatarFallback'

// Helper component that combines Avatar + Fallback for easy use
function UserAvatar({ name, src, size = 'md', className, sx }) {
  const sizes = {
    sm: { width: 32, height: 32, fontSize: '0.625rem' },
    md: { width: 40, height: 40, fontSize: '0.75rem' },
    lg: { width: 48, height: 48, fontSize: '0.875rem' },
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  const sizeStyle = sizes[size] || sizes.md

  return (
    <MuiAvatar
      src={src}
      alt={name}
      className={className}
      sx={{
        ...sizeStyle,
        bgcolor: name ? stringToColor(name) : 'primary.main',
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        ring: 2,
        border: (theme) => `2px solid ${theme.palette.primary.main}33`,
        boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.default}, 0 0 0 4px ${theme.palette.primary.main}33`,
        ...sx,
      }}
    >
      {!src ? getInitials(name) : null}
    </MuiAvatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
