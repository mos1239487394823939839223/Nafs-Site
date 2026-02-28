import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
}

export default function Spinner({ className, size = 'md', label, sx }) {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        ...sx,
      }}
    >
      <CircularProgress
        size={sizeMap[size] || sizeMap.md}
        thickness={size === 'sm' ? 4 : 3.5}
      />
      {label && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  )
}
