import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMultiStepForm } from '../../../hooks/useMultiStepForm'
import { useToast } from '../../../components/ui/Toast'
import ProgressStepper from '../../../components/forms/ProgressStepper'
import Button from '../../../components/ui/Button'
import Input, { Select, Textarea } from '../../../components/ui/Input'
import { validateRequired, validateFileSize, validateFileType } from '../../../lib/validation'
import { 
  ArrowLeft, 
  ArrowRight, 
  Stethoscope, 
  Upload, 
  Calendar, 
  FileText,
  X,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function DoctorRegistration() {
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    license: null,
    certificates: []
  })

  const steps = [
    { id: 1, title: 'Professional Details', subtitle: 'Your expertise', icon: Stethoscope },
    { id: 2, title: 'Documentation', subtitle: 'Verify credentials', icon: FileText },
    { id: 3, title: 'Availability', subtitle: 'Set schedule', icon: Calendar },
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
    specialty: '',
    yearsOfExperience: '',
    bio: '',
    consultationFee: '',
    languages: [],
    // Step 2
    licenseNumber: '',
    // Step 3
    availability: {
      monday: { enabled: false, start: '09:00', end: '17:00' },
      tuesday: { enabled: false, start: '09:00', end: '17:00' },
      wednesday: { enabled: false, start: '09:00', end: '17:00' },
      thursday: { enabled: false, start: '09:00', end: '17:00' },
      friday: { enabled: false, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' },
    },
  }, 3)

  const specialties = [
    'Cardiology',
    'Dermatology',
    'General Medicine',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Gynecology',
    'Ophthalmology',
    'ENT (Ear, Nose, Throat)',
  ]

  const languages = ['Arabic', 'English', 'French', 'German']

  // Step 1 Validation
  const validateStep1 = () => {
    let isValid = true

    if (!validateRequired(formData.specialty)) {
      setFieldError('specialty', 'Please select your specialty')
      isValid = false
    }

    if (!validateRequired(formData.yearsOfExperience) || formData.yearsOfExperience < 0) {
      setFieldError('yearsOfExperience', 'Please enter valid years of experience')
      isValid = false
    }

    if (!validateRequired(formData.bio) || formData.bio.length < 50) {
      setFieldError('bio', 'Bio must be at least 50 characters')
      isValid = false
    }

    if (!validateRequired(formData.consultationFee) || formData.consultationFee < 100) {
      setFieldError('consultationFee', 'Minimum consultation fee is 100 EGP')
      isValid = false
    }

    if (!formData.languages || formData.languages.length === 0) {
      setFieldError('languages', 'Please select at least one language')
      isValid = false
    }

    return isValid
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (!uploadedFiles.license) {
      toast.error('Please upload your medical license')
      return false
    }

    if (!validateRequired(formData.licenseNumber)) {
      setFieldError('licenseNumber', 'License number is required')
      return false
    }

    return true
  }

  // Step 3 Validation
  const validateStep3 = () => {
    const hasAvailability = Object.values(formData.availability).some(day => day.enabled)
    if (!hasAvailability) {
      toast.error('Please set at least one day of availability')
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
    
    // Simulate API call and Register User
    setTimeout(() => {
      setLoading(false)
      
      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        email: tempRegData.email,
        password: tempRegData.password,
        role: 'doctor', // Explicitly set role
        ...formData,
        status: 'pending' // Doctors need approval
      }
      
      // Save to "Database" (localStorage)
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      // Clear temp data
      sessionStorage.removeItem('temp_reg_data')

      navigate('/auth/pending-approval')
    }, 2000)
  }

  const handleFieldChange = (field, value) => {
    updateFormData({ [field]: value })
    clearFieldError(field)
  }

  const toggleLanguage = (language) => {
    const current = formData.languages || []
    const updated = current.includes(language)
      ? current.filter(l => l !== language)
      : [...current, language]
    handleFieldChange('languages', updated)
  }

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files)
    
    for (const file of files) {
      if (!validateFileSize(file, 5)) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`)
        continue
      }

      if (!validateFileType(file)) {
        toast.error(`${file.name} has invalid format. Use PDF, JPG, or PNG`)
        continue
      }

      if (type === 'license') {
        setUploadedFiles(prev => ({ ...prev, license: file }))
        toast.success('Medical license uploaded')
      } else {
        setUploadedFiles(prev => ({
          ...prev,
          certificates: [...prev.certificates, file]
        }))
        toast.success(`Certificate uploaded: ${file.name}`)
      }
    }
  }

  const removeFile = (type, index = null) => {
    if (type === 'license') {
      setUploadedFiles(prev => ({ ...prev, license: null }))
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        certificates: prev.certificates.filter((_, i) => i !== index)
      }))
    }
  }

  const toggleDayAvailability = (day) => {
    const updated = {
      ...formData.availability,
      [day]: {
        ...formData.availability[day],
        enabled: !formData.availability[day].enabled
      }
    }
    handleFieldChange('availability', updated)
  }

  const updateDayTime = (day, field, value) => {
    const updated = {
      ...formData.availability,
      [day]: {
        ...formData.availability[day],
        [field]: value
      }
    }
    handleFieldChange('availability', updated)
  }

  return (
    <div className="min-h-screen bg-clinical-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-clinical-darkGray">Doctor Registration</h1>
          <p className="text-clinical-gray mt-2">Join our network of healthcare professionals</p>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Professional Details */}
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
                    <Stethoscope className="w-6 h-6 text-medical-blue" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">Professional Details</h2>
                    <p className="text-sm text-clinical-gray">Tell us about your medical expertise</p>
                  </div>
                </div>

                <Select
                  label="Medical Specialty"
                  value={formData.specialty}
                  onChange={(e) => handleFieldChange('specialty', e.target.value)}
                  error={errors.specialty}
                >
                  <option value="">Select your specialty</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </Select>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleFieldChange('yearsOfExperience', e.target.value)}
                    error={errors.yearsOfExperience}
                    placeholder="e.g., 10"
                  />
                  <Input
                    label="Consultation Fee (EGP)"
                    type="number"
                    min="100"
                    value={formData.consultationFee}
                    onChange={(e) => handleFieldChange('consultationFee', e.target.value)}
                    error={errors.consultationFee}
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-clinical-darkGray mb-3">
                    Languages Spoken
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map((language) => (
                      <label key={language} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={(formData.languages || []).includes(language)}
                          onChange={() => toggleLanguage(language)}
                          className="w-4 h-4 text-medical-blue border-gray-300 rounded focus:ring-medical-blue"
                        />
                        <span className="text-sm text-clinical-darkGray">{language}</span>
                      </label>
                    ))}
                  </div>
                  {errors.languages && (
                    <p className="mt-1 text-sm text-red-500">{errors.languages}</p>
                  )}
                </div>

                <Textarea
                  label="Professional Bio"
                  value={formData.bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  error={errors.bio}
                  placeholder="Tell patients about your experience, approach to healthcare, and what makes you unique..."
                  rows={6}
                />
                <p className="text-xs text-clinical-gray">
                  {formData.bio.length}/50 characters minimum
                </p>
              </motion.div>
            )}

            {/* Step 2: Documentation */}
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
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">Documentation</h2>
                    <p className="text-sm text-clinical-gray">Upload your credentials for verification</p>
                  </div>
                </div>

                <Input
                  label="Medical License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                  error={errors.licenseNumber}
                  placeholder="e.g., EG-12345-2020"
                />

                {/* Medical License Upload */}
                <div>
                  <label className="block text-sm font-medium text-clinical-darkGray mb-2">
                    Medical License <span className="text-red-500">*</span>
                  </label>
                  {!uploadedFiles.license ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-medical-blue hover:bg-medical-lightBlue/30 transition-all">
                      <Upload className="w-8 h-8 text-clinical-gray mb-2" />
                      <p className="text-sm text-clinical-gray">Click to upload medical license</p>
                      <p className="text-xs text-clinical-gray mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'license')}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-clinical-darkGray">{uploadedFiles.license.name}</p>
                          <p className="text-xs text-clinical-gray">{(uploadedFiles.license.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('license')}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Certificates Upload */}
                <div>
                  <label className="block text-sm font-medium text-clinical-darkGray mb-2">
                    Additional Certificates (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-medical-blue hover:bg-medical-lightBlue/30 transition-all">
                    <Upload className="w-8 h-8 text-clinical-gray mb-2" />
                    <p className="text-sm text-clinical-gray">Click to upload certificates</p>
                    <p className="text-xs text-clinical-gray mt-1">Board certifications, training certificates, etc.</p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'certificate')}
                    />
                  </label>

                  {uploadedFiles.certificates.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.certificates.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-medical-blue" />
                            <div>
                              <p className="text-sm font-medium text-clinical-darkGray">{file.name}</p>
                              <p className="text-xs text-clinical-gray">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile('certificate', index)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All documents will be reviewed by our admin team. You'll receive approval within 24-48 hours.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Availability */}
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
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">Set Your Availability</h2>
                    <p className="text-sm text-clinical-gray">Choose your working days and hours</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(formData.availability).map(([day, schedule]) => (
                    <div key={day} className={`p-4 border rounded-lg transition-all ${schedule.enabled ? 'border-medical-blue bg-medical-lightBlue/30' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={() => toggleDayAvailability(day)}
                            className="w-5 h-5 text-medical-blue border-gray-300 rounded focus:ring-medical-blue"
                          />
                          <span className="font-medium text-clinical-darkGray capitalize">{day}</span>
                        </label>
                        {schedule.enabled && (
                          <div className="flex items-center gap-2 text-sm text-clinical-gray">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.start} - {schedule.end}</span>
                          </div>
                        )}
                      </div>

                      {schedule.enabled && (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-clinical-gray mb-1">Start Time</label>
                            <input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => updateDayTime(day, 'start', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-clinical-gray mb-1">End Time</label>
                            <input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => updateDayTime(day, 'end', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-medical-lightBlue p-4 rounded-lg">
                  <p className="text-sm text-medical-blue">
                    <strong>Tip:</strong> You can always update your availability later from your dashboard.
                  </p>
                </div>
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
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit for Approval
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
