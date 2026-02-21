import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { validateEmail } from '../../lib/validation'
import { Mail, ArrowLeft, Shield, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../lib/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const toast = useToast()

  // Steps: 1 = Enter Email, 2 = Enter OTP, 3 = New Password
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [otpTimer, setOtpTimer] = useState(0)

  // Step 1: Send forgot password OTP
  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await authAPI.forgotPassword(email)
      if (response?.IsSuccess !== false) {
        toast.success('Verification code sent to your email')
        setStep(2)
        setOtpTimer(60)
        const interval = setInterval(() => {
          setOtpTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(response?.Message || 'Failed to send verification code')
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Confirm OTP
  const handleConfirmOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit verification code' })
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await authAPI.confirmOTPForChangePassword(email, otp)
      if (response?.IsSuccess !== false) {
        // The response might contain a token for password change
        const token = response?.Data?.Token || response?.Data
        setResetToken(token)
        toast.success('Code verified successfully')
        setStep(3)
      } else {
        toast.error(response?.Message || 'Invalid verification code')
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set new password
  const handleResetPassword = async () => {
    const newErrors = {}
    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await authAPI.changePasswordByToken(resetToken, newPassword)
      if (response?.IsSuccess !== false) {
        toast.success('Password reset successfully! Please sign in.')
        navigate('/auth/login')
      } else {
        toast.error(response?.Message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const response = await authAPI.forgotPassword(email)
      if (response?.IsSuccess !== false) {
        toast.success('Verification code resent')
        setOtpTimer(60)
        const interval = setInterval(() => {
          setOtpTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(response?.Message || 'Failed to resend code')
      }
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background-paper to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Nafs</h1>
          <p className="text-text-light mt-2">Reset Your Password</p>
        </div>

        {/* Card */}
        <div className="bg-background-paper rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-heading">Forgot Password</h2>
                    <p className="text-sm text-text-muted">Enter your email to receive a verification code</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({})
                    }}
                    error={errors.email}
                    placeholder="you@example.com"
                  />

                  <Button
                    className="w-full"
                    onClick={handleSendOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-heading">Enter Verification Code</h2>
                    <p className="text-sm text-text-muted">Code sent to {email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-primary font-medium">Check your inbox for the 6-digit code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-2">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ''))
                        if (errors.otp) setErrors({})
                      }}
                      className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text ${errors.otp ? 'border-red-500' : 'border-border'}`}
                      placeholder="000000"
                    />
                    {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
                  </div>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-text-muted">
                        Resend code in <span className="font-semibold text-primary">{otpTimer}s</span>
                      </p>
                    ) : (
                      <button onClick={handleResendOTP} className="text-sm text-primary hover:underline" disabled={loading}>
                        Resend verification code
                      </button>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleConfirmOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-heading">Set New Password</h2>
                    <p className="text-sm text-text-muted">Create a strong password for your account</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }))
                        }}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text ${errors.newPassword ? 'border-red-500' : 'border-border'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text ${errors.confirmPassword ? 'border-red-500' : 'border-border'}`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth/login')}
              className="text-sm text-text-muted hover:text-primary flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
