import { createContext, useContext, useState, useEffect } from 'react'

// Role definitions
export const Roles = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  STAFF: 'staff',
}

// Role display names
export const RoleNames = {
  [Roles.PATIENT]: 'Patient',
  [Roles.DOCTOR]: 'Doctor',
  [Roles.ADMIN]: 'Admin',
  [Roles.STAFF]: 'Customer Service',
}

// Role-specific dashboard routes
export const RoleDashboards = {
  [Roles.PATIENT]: '/dashboard/patient',
  [Roles.DOCTOR]: '/dashboard/doctor',
  [Roles.ADMIN]: '/admin/users',
  [Roles.STAFF]: '/dashboard/staff',
}

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      try {
        const { user, role } = JSON.parse(storedAuth)
        setUser(user)
        setRole(role)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse stored auth:', error)
        localStorage.removeItem('auth')
      }
    }
    setLoading(false)
  }, [])

  // Login function
  const login = (userData, userRole) => {
    setUser(userData)
    setRole(userRole)
    setIsAuthenticated(true)

    // Persist to localStorage
    localStorage.setItem('auth', JSON.stringify({ user: userData, role: userRole }))
  }

  // Logout function
  const logout = () => {
    setUser(null)
    setRole(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth')
  }

  // Get dashboard route for current role
  const getDashboardRoute = () => {
    return role ? RoleDashboards[role] : '/auth/login'
  }

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return role === requiredRole
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.includes(role)
  }

  const value = {
    isAuthenticated,
    user,
    role,
    loading,
    login,
    logout,
    getDashboardRoute,
    hasRole,
    hasAnyRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
