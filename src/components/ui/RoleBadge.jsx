import Chip from '@mui/material/Chip'
import { Roles } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

export default function RoleBadge({ role, size = 'md', sx }) {
  const { t } = useLanguage()
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'medium',
  }

  const roleConfig = {
    [Roles.PATIENT]: { label: t('auth.patient'), color: 'primary' },
    [Roles.DOCTOR]: { label: t('auth.doctor'), color: 'secondary' },
    [Roles.ADMIN]: { label: t('auth.admin'), color: 'warning' },
    [Roles.STAFF]: { label: t('auth.staff'), color: 'info' },
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
