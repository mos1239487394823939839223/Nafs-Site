import { Roles } from '../../contexts/AuthContext'

export default function RoleBadge({ role, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const roleStyles = {
    [Roles.PATIENT]: 'bg-primary/10 text-primary border-primary/20',
    [Roles.DOCTOR]: 'bg-secondary/10 text-secondary border-secondary/20',
    [Roles.ADMIN]: 'bg-accent/20 text-accent-dark border-accent/30',
    [Roles.STAFF]: 'bg-secondary/10 text-secondary-dark border-secondary/20',
  }

  const roleLabels = {
    [Roles.PATIENT]: 'Patient',
    [Roles.DOCTOR]: 'Doctor',
    [Roles.ADMIN]: 'Admin',
    [Roles.STAFF]: 'Support Staff',
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full border
        ${sizeClasses[size]}
        ${roleStyles[role] || 'bg-gray-100 text-gray-600 border-gray-200'}
      `}
    >
      {roleLabels[role] || role}
    </span>
  )
}
