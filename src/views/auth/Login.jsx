import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { useAuth, Roles } from '../../contexts/AuthContext'
import { validateEmail, validatePassword, getPasswordStrength } from '../../lib/validation'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})

  const passwordStrength = !isLogin && formData.password ? getPasswordStrength(formData.password) : null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must meet all requirements'
      }
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!isLogin && !agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (isLogin) {
        // 1. Check for registered user in localStorage (Simulating Backend)
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
        const foundUser = storedUsers.find(u => u.email === formData.email && u.password === formData.password)

        if (foundUser) {
          // Login with registered user's role
          login(
            { ...foundUser, name: foundUser.name || formData.email.split('@')[0] },
            foundUser.role
          )
          toast.success('Login successful!')
          
          const dashboardRoutes = {
            [Roles.PATIENT]: '/dashboard/patient',
            [Roles.DOCTOR]: '/dashboard/doctor',
            [Roles.ADMIN]: '/admin',
            [Roles.STAFF]: '/dashboard/staff',
          }
          navigate(dashboardRoutes[foundUser.role])
          return
        }

        // 2. Demo Fallback: Determine role based on email domain for testing
        // Only if user is not in "database"
        let userRole = Roles.PATIENT
        if (formData.email.includes('doctor')) {
          userRole = Roles.DOCTOR
        } else if (formData.email.includes('admin')) {
          userRole = Roles.ADMIN
        } else if (formData.email.includes('staff') || formData.email.includes('support')) {
          userRole = Roles.STAFF
        }

        // Login with inferred role
        login(
          { name: formData.email.split('@')[0], email: formData.email },
          userRole
        )

        toast.success('Login successful!')
        
        // Navigate to role-specific dashboard
        const dashboardRoutes = {
          [Roles.PATIENT]: '/dashboard/patient',
          [Roles.DOCTOR]: '/dashboard/doctor',
          [Roles.ADMIN]: '/admin',
          [Roles.STAFF]: '/dashboard/staff',
        }
        navigate(dashboardRoutes[userRole])
      } else {
        // Store credentials temporarily for the next registration steps
        sessionStorage.setItem('temp_reg_data', JSON.stringify({
          email: formData.email,
          password: formData.password
        }))
        
        toast.success('Account created! Please select your role.')
        navigate('/auth/role-selection')
      }
    }, 1500)
  }

  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In integration coming soon!')
    // In production, this would trigger OAuth flow
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Clinc</h1>
          <p className="text-text-light mt-2">Telemedicine Platform</p>
        </div>

        {/* Demo Credentials Info */}
        {isLogin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 border border-accent/30 rounded-2xl p-4 mb-4"
          >
            <p className="text-sm font-semibold text-accent-dark mb-2">🎯 Demo Login Guide</p>
            <div className="text-xs text-text space-y-1">
              <p>• <strong>Patient:</strong> patient@example.com</p>
              <p>• <strong>Doctor:</strong> doctor@example.com</p>
              <p>• <strong>Admin:</strong> admin@example.com</p>
              <p>• <strong>Staff:</strong> staff@example.com</p>
              <p className="text-text-light mt-2">Password: any password</p>
            </div>
          </motion.div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-text-light mt-2">
              {isLogin ? 'Sign in to continue to your account' : 'Join our healthcare platform'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-clinical-darkGray mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-gray hover:text-clinical-darkGray"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}

              {/* Password Strength Indicator */}
              {!isLogin && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-clinical-gray">Password Strength:</span>
                    <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {[
                      { key: 'minLength', label: 'At least 8 characters' },
                      { key: 'hasUpperCase', label: 'One uppercase letter' },
                      { key: 'hasLowerCase', label: 'One lowercase letter' },
                      { key: 'hasNumber', label: 'One number' },
                      { key: 'hasSpecialChar', label: 'One special character' },
                    ].map(({ key, label }) => {
                      const validation = validatePassword(formData.password)
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full ${validation[key] ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={validation[key] ? 'text-green-600' : 'text-gray-500'}>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Terms & Conditions (Register only) */}
            {!isLogin && (
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-medical-blue border-gray-300 rounded focus:ring-medical-blue"
                  />
                  <span className="text-sm text-clinical-gray">
                    I agree to the{' '}
                    <a href="#" className="text-medical-blue hover:underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-medical-blue hover:underline">
                      Privacy Policy
                    </a>
                    {' '}regarding medical data handling
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-clinical-gray">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-clinical-gray">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors({})
                  setFormData({ email: '', password: '', confirmPassword: '' })
                  setAgreedToTerms(false)
                }}
                className="text-medical-blue font-medium hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
