import { cn } from '../../lib/utils'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-medical-blue text-white hover:bg-medical-darkBlue focus:ring-medical-blue shadow-sm',
    secondary: 'bg-medical-teal text-white hover:bg-green-600 focus:ring-medical-teal shadow-sm',
    outline: 'border-2 border-medical-blue text-medical-blue hover:bg-medical-lightBlue focus:ring-medical-blue',
    ghost: 'text-clinical-darkGray hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
