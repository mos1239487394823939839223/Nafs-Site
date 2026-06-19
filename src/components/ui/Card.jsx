import * as React from 'react'
import MuiCard from '@mui/material/Card'
import MuiCardContent from '@mui/material/CardContent'
import MuiCardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const Card = React.forwardRef(({ className, hover = false, children, sx, onClick, ...props }, ref) => (
  <MuiCard
    ref={ref}
    className={className}
    onClick={onClick}
    elevation={1}
    sx={{
      borderRadius: 'var(--ds-radius-card)',
      border: '1px solid',
      borderColor: 'divider',
      p: 2.5,
      boxShadow: 'var(--ds-shadow-card)',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(hover && {
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 'var(--ds-shadow-hover)',
          transform: 'translateY(-4px)',
          borderColor: (theme) => `${theme.palette.primary.main}4D`,
        },
      }),
      ...(onClick && {
        cursor: 'pointer',
      }),
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiCard>
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, title, action, children, sx, ...props }, ref) => (
  <Box
    ref={ref}
    className={className}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
      pb: 2,
      ...sx,
    }}
    {...props}
  >
    {title ? (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', lineHeight: 1 }}>
          {title}
        </Typography>
        {action}
      </Box>
    ) : children}
  </Box>
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, children, sx, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="h6"
    component="h3"
    className={className}
    sx={{
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1,
      letterSpacing: '-0.01em',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Typography>
))
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef(({ className, children, sx, ...props }, ref) => (
  <Box
    ref={ref}
    className={className}
    sx={{
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, children, sx, ...props }, ref) => (
  <MuiCardActions
    ref={ref}
    className={className}
    sx={{
      px: 0,
      pt: 1,
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiCardActions>
))
CardFooter.displayName = 'CardFooter'

export default Card
export { Card, CardHeader, CardTitle, CardContent, CardFooter }
