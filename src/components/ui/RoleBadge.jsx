import Chip from '@mui/material/Chip'
import { Roles } from '../../contexts/AuthContext'

export default function RoleBadge({ role, size = 'md', sx }) {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'medium',
  }

  const roleConfig = {
    [Roles.PATIENT]: { label: 'Patient', color: 'primary' },
    [Roles.DOCTOR]: { label: 'Doctor', color: 'secondary' },
    [Roles.ADMIN]: { label: 'Admin', color: 'warning' },
    [Roles.STAFF]: { label: 'Support Staff', color: 'info' },
  }

  const config = roleConfig[role] || { label: role, color: 'default' }

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant="outlined"
      size={sizeMap[size] || 'medium'}
      sx={{
        borderRadius: '999px',
        fontWeight: 500,
        ...(size === 'lg' && {
          fontSize: '1rem',
          height: 36,
          '& .MuiChip-label': { px: 2 },
        }),
        ...sx,
      }}
    />
  )
}
