import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { validateEmail } from '../../lib/validation'
import { Mail, ArrowBack as ArrowLeft, Security as Shield, Lock, CheckCircle, Visibility as Eye, VisibilityOff as EyeOff } from '@mui/icons-material'
import { authAPI, extractErrorMessage } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useLanguage()

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
      setErrors({ email: t('errors.invalidEmail') })
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await authAPI.forgotPassword(email)
      if (response?.IsSuccess === true) {
        toast.success(t('success.otpSent'))
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
        toast.error(response?.Message || t('errors.failedSendOtp'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.failedSendOtp')))
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Confirm OTP
  const handleConfirmOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: t('errors.otpInvalid') })
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await authAPI.confirmOTPForChangePassword(email, otp)
      if (response?.IsSuccess === true) {
        // The response might contain a token for password change
        const token = response?.Data?.Token || response?.Data
        setResetToken(token)
        toast.success(t('success.codeVerified'))
        setStep(3)
      } else {
        toast.error(response?.Message || t('errors.failedVerifyOtp'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.failedVerifyOtp')))
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set new password
  const handleResetPassword = async () => {
    const newErrors = {}
    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = t('errors.passwordTooShort')
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch')
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await authAPI.changePasswordByToken(resetToken, newPassword)
      if (response?.IsSuccess === true) {
        toast.success(t('success.passwordReset'))
        navigate('/auth/login')
      } else {
        toast.error(response?.Message || t('errors.failedResetPassword'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.failedResetPassword')))
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const response = await authAPI.forgotPassword(email)
      if (response?.IsSuccess === true) {
        toast.success(t('success.otpResent'))
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
        toast.error(response?.Message || t('errors.failedSendOtp'))
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t('errors.failedSendOtp')))
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
          <h1 className="text-4xl font-bold text-primary">{t('auth.platformName')}</h1>
          <p className="text-text-light mt-2">{t('auth.resetYourPassword')}</p>
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
                    <h2 className="text-xl font-semibold text-text-heading">{t('auth.forgotPasswordTitle')}</h2>
                    <p className="text-sm text-text-muted">{t('auth.enterEmail')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    type="email"
                    label={t('auth.email')}
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
                        <span>{t('common.sending')}</span>
                      </div>
                    ) : (
                      t('auth.sendVerificationCode')
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
                    <h2 className="text-xl font-semibold text-text-heading">{t('auth.enterVerificationCode')}</h2>
                    <p className="text-sm text-text-muted">{t('auth.codeSentTo')} {email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-primary font-medium">{t('auth.checkInbox')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-2">{t('auth.verificationCode')}</label>
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
                        {t('auth.resendIn')} <span className="font-semibold text-primary">{otpTimer}s</span>
                      </p>
                    ) : (
                      <button onClick={handleResendOTP} className="text-sm text-primary hover:underline" disabled={loading}>
                        {t('auth.resendOtp')}
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
                        <span>{t('common.verifying')}</span>
                      </div>
                    ) : (
                      t('auth.verifyCode')
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
                    <h2 className="text-xl font-semibold text-text-heading">{t('auth.setNewPassword')}</h2>
                    <p className="text-sm text-text-muted">{t('auth.setNewPasswordDesc')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">{t('auth.newPassword')}</label>
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
                    <label className="block text-sm font-medium text-text-muted mb-2">{t('auth.confirmPassword')}</label>
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
                        <span>{t('common.resetting')}</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('auth.resetPassword')}
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
              {t('auth.backToSignIn')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
