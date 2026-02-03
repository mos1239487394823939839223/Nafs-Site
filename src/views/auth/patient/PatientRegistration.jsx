import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMultiStepForm } from '../../../hooks/useMultiStepForm'
import { useAuth, Roles } from '../../../contexts/AuthContext'
import { useToast } from '../../../components/ui/Toast'
import ProgressStepper from '../../../components/forms/ProgressStepper'
import Button from '../../../components/ui/Button'
import Input, { Select, Textarea } from '../../../components/ui/Input'
import { validateRequired, validatePhone, validateDate, calculateAge, formatPhone } from '../../../lib/validation'
import { ArrowLeft, ArrowRight, CheckCircle, User, Heart, Shield } from 'lucide-react'

export default function PatientRegistration() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const steps = [
    { id: 1, title: 'Basic Info', subtitle: 'Personal details', icon: User },
    { id: 2, title: 'Medical Profile', subtitle: 'Health information', icon: Heart },
    { id: 3, title: 'Verification', subtitle: 'Verify phone', icon: Shield },
  ]

  const {
    currentStep,
    formData,
    errors,
    updateFormData,
    nextStep,
    previousStep,
    setFieldError,
    clearFieldError,
    isFirstStep,
    isLastStep,
  } = useMultiStepForm({
    // Step 1
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    // Step 2
    bloodType: '',
    chronicDiseases: [],
    allergies: '',
    medications: '',
    emergencyContact: '',
    emergencyPhone: '',
    // Step 3
    otp: '',
  }, 3)

  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Step 1 Validation
  const validateStep1 = () => {
    let isValid = true

    if (!validateRequired(formData.firstName)) {
      setFieldError('firstName', 'First name is required')
      isValid = false
    }

    if (!validateRequired(formData.lastName)) {
      setFieldError('lastName', 'Last name is required')
      isValid = false
    }

    if (!validatePhone(formData.phone)) {
      setFieldError('phone', 'Please enter a valid Egyptian phone number')
      isValid = false
    }

    if (!validateDate(formData.dateOfBirth)) {
      setFieldError('dateOfBirth', 'Please enter a valid date of birth')
      isValid = false
    } else {
      const age = calculateAge(formData.dateOfBirth)
      if (age < 13) {
        setFieldError('dateOfBirth', 'You must be at least 13 years old')
        isValid = false
      }
    }

    if (!validateRequired(formData.gender)) {
      setFieldError('gender', 'Please select your gender')
      isValid = false
    }

    return isValid
  }

  // Step 2 Validation
  const validateStep2 = () => {
    // Medical profile is optional but we can validate format
    if (formData.emergencyContact && !validateRequired(formData.emergencyPhone)) {
      setFieldError('emergencyPhone', 'Please provide emergency contact phone')
      return false
    }

    if (formData.emergencyPhone && !validatePhone(formData.emergencyPhone)) {
      setFieldError('emergencyPhone', 'Please enter a valid phone number')
      return false
    }

    return true
  }

  // Step 3 - Send OTP
  const handleSendOTP = () => {
    setLoading(true)
    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false)
      setOtpSent(true)
      setOtpTimer(60)
      toast.success(`OTP sent to ${formatPhone(formData.phone)}`)

      // Countdown timer
      const interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 1000)
  }

  // Step 3 Validation
  const validateStep3 = () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setFieldError('otp', 'Please enter the 6-digit OTP')
      return false
    }
    return true
  }

  const handleNext = () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    } else if (currentStep === 3) {
      isValid = validateStep3()
    }

    if (isValid) {
      if (isLastStep) {
        handleSubmit()
      } else {
        nextStep()
      }
    } else {
      toast.error('Please fix the errors before continuing')
    }
  }

  const handleSubmit = () => {
    setLoading(true)
    // Get temporary credentials
    const tempRegData = JSON.parse(sessionStorage.getItem('temp_reg_data') || '{}')

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      
      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        email: tempRegData.email,
        password: tempRegData.password,
        role: Roles.PATIENT,
        ...formData
      }
      
      // Save to "Database" (localStorage)
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      // Clear temp data
      sessionStorage.removeItem('temp_reg_data')

      // Auto-login
      login(
        { ...newUser, name: `${formData.firstName} ${formData.lastName}` },
        Roles.PATIENT
      )

      toast.success('Registration successful! Welcome to Clinc!')
      navigate('/dashboard/patient')
    }, 2000)
  }

  const handleFieldChange = (field, value) => {
    updateFormData({ [field]: value })
    clearFieldError(field)
  }

  const toggleChronicDisease = (disease) => {
    const current = formData.chronicDiseases || []
    const updated = current.includes(disease)
      ? current.filter(d => d !== disease)
      : [...current, disease]
    handleFieldChange('chronicDiseases', updated)
  }

  return (
    <div className="min-h-screen bg-clinical-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-clinical-darkGray">Patient Registration</h1>
          <p className="text-clinical-gray mt-2">Complete your profile to get started</p>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-medical-lightBlue rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-medical-blue" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">Basic Information</h2>
                    <p className="text-sm text-clinical-gray">Tell us about yourself</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    error={errors.firstName}
                    placeholder="Ahmed"
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    error={errors.lastName}
                    placeholder="Hassan"
                  />
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="+20 XXX XXX XXXX"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                    error={errors.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    error={errors.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                {formData.dateOfBirth && validateDate(formData.dateOfBirth) && (
                  <div className="bg-medical-lightBlue p-4 rounded-lg">
                    <p className="text-sm text-medical-blue">
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Medical Profile */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">Medical Profile</h2>
                    <p className="text-sm text-clinical-gray">Help us provide better care</p>
                  </div>
                </div>

                <Select
                  label="Blood Type"
                  value={formData.bloodType}
                  onChange={(e) => handleFieldChange('bloodType', e.target.value)}
                >
                  <option value="">Select blood type (optional)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>

                <div>
                  <label className="block text-sm font-medium text-clinical-darkGray mb-3">
                    Chronic Diseases (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Kidney Disease', 'None'].map((disease) => (
                      <label key={disease} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={(formData.chronicDiseases || []).includes(disease)}
                          onChange={() => toggleChronicDisease(disease)}
                          className="w-4 h-4 text-medical-blue border-gray-300 rounded focus:ring-medical-blue"
                        />
                        <span className="text-sm text-clinical-darkGray">{disease}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Allergies"
                  value={formData.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  placeholder="List any allergies (medications, food, etc.)"
                  rows={3}
                />

                <Textarea
                  label="Current Medications"
                  value={formData.medications}
                  onChange={(e) => handleFieldChange('medications', e.target.value)}
                  placeholder="List any medications you're currently taking"
                  rows={3}
                />

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-clinical-darkGray mb-4">Emergency Contact</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Contact Name"
                      value={formData.emergencyContact}
                      onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                      placeholder="Full name"
                    />
                    <Input
                      label="Contact Phone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleFieldChange('emergencyPhone', e.target.value)}
                      error={errors.emergencyPhone}
                      placeholder="+20 XXX XXX XXXX"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: OTP Verification */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">Phone Verification</h2>
                    <p className="text-sm text-clinical-gray">Verify your phone number</p>
                  </div>
                </div>

                <div className="bg-medical-lightBlue p-6 rounded-lg text-center">
                  <p className="text-clinical-darkGray mb-2">We'll send a verification code to:</p>
                  <p className="text-xl font-semibold text-medical-blue">{formatPhone(formData.phone)}</p>
                </div>

                {!otpSent ? (
                  <Button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-clinical-darkGray mb-2">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.otp}
                        onChange={(e) => handleFieldChange('otp', e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue ${
                          errors.otp ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="000000"
                      />
                      {errors.otp && (
                        <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
                      )}
                    </div>

                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <p className="text-sm text-clinical-gray">
                          Resend code in <span className="font-semibold text-medical-blue">{otpTimer}s</span>
                        </p>
                      ) : (
                        <button
                          onClick={handleSendOTP}
                          className="text-sm text-medical-blue hover:underline"
                        >
                          Resend verification code
                        </button>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> Use code <code className="bg-yellow-100 px-2 py-1 rounded">123456</code> to verify
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={isFirstStep || loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading || (currentStep === 3 && !otpSent)}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Registration
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
