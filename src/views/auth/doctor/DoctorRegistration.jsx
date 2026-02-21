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

import { useAuth } from '../../../contexts/AuthContext'
import { api, authAPI } from '../../../lib/api'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function DoctorRegistration() {
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    license: null,
    certificates: []
  })

  const steps = [
    { id: 1, title: t('doctorReg.professionalDetails'), subtitle: t('doctorReg.yourExpertise'), icon: Stethoscope },
    { id: 2, title: t('doctorReg.documentation'), subtitle: t('doctorReg.verifyCredentials'), icon: FileText },
    { id: 3, title: t('doctorReg.availability'), subtitle: t('doctorReg.setSchedule'), icon: Calendar },
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
      setFieldError('specialty', t('errors.selectSpecialty'))
      isValid = false
    }

    if (!validateRequired(formData.yearsOfExperience) || formData.yearsOfExperience < 0) {
      setFieldError('yearsOfExperience', t('errors.validExperience'))
      isValid = false
    }

    if (!validateRequired(formData.bio) || formData.bio.length < 50) {
      setFieldError('bio', t('errors.bioMinLength'))
      isValid = false
    }

    if (!validateRequired(formData.consultationFee) || formData.consultationFee < 100) {
      setFieldError('consultationFee', t('errors.minFee'))
      isValid = false
    }

    if (!formData.languages || formData.languages.length === 0) {
      setFieldError('languages', t('errors.selectLanguage'))
      isValid = false
    }

    return isValid
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (!uploadedFiles.license) {
      toast.error(t('errors.uploadLicense'))
      return false
    }

    if (!validateRequired(formData.licenseNumber)) {
      setFieldError('licenseNumber', t('errors.licenseRequired'))
      return false
    }

    return true
  }

  // Step 3 Validation
  const validateStep3 = () => {
    const hasAvailability = Object.values(formData.availability).some(day => day.enabled)
    if (!hasAvailability) {
      toast.error(t('errors.setAvailability'))
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
      toast.error(t('errors.fixErrors'))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Get temporary credentials from sessionStorage
      const tempRegData = JSON.parse(sessionStorage.getItem('temp_reg_data') || '{}')

      // Build the doctor registration payload for Admin/AddDoctor
      const doctorPayload = {
        name: tempRegData.name || `${tempRegData.firstName || ''} ${tempRegData.lastName || ''}`.trim(),
        email: tempRegData.email,
        password: tempRegData.password,
        phoneNumber: tempRegData.phone || '',
        description: formData.bio || null,
        specialist: formData.specialty ? [formData.specialty] : null,
      }

      // Try registering via the general Auth/Register first (as patient), 
      // then the admin can approve as doctor. Or use Admin/AddDoctor if available.
      // For self-registration, use Auth/Register and then navigate to pending approval.
      const registerPayload = {
        Name: doctorPayload.name,
        PhoneNumber: doctorPayload.phoneNumber,
        Email: doctorPayload.email,
        Password: doctorPayload.password,
        Gender: tempRegData.gender === 'female' ? 2 : 1,
        Birthday: tempRegData.dateOfBirth ? new Date(tempRegData.dateOfBirth).toISOString() : null,
      }

      const response = await api.post('/Auth/Register', registerPayload)

      if (response.data?.IsSuccess !== false && response.status === 200) {
        // Send OTP for email verification
        try {
          await authAPI.sendOtp(doctorPayload.email)
        } catch (otpErr) {
          console.warn('OTP send failed after doctor registration:', otpErr)
        }

        sessionStorage.removeItem('temp_reg_data')
        toast.success(t('auth.registrationSubmitted'))
        navigate('/auth/pending-approval')
      } else {
        toast.error(response.data?.Message || t('errors.somethingWentWrong'))
      }
    } catch (error) {
      console.error('Doctor registration error:', error)
      const errorMessage = error.response?.data?.Message || error.message || t('errors.somethingWentWrong')
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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
        toast.error(`${file.name} ${t('errors.fileTooLarge')}`)
        continue
      }

      if (!validateFileType(file)) {
        toast.error(`${file.name} ${t('errors.invalidFileFormat')}`)
        continue
      }

      if (type === 'license') {
        setUploadedFiles(prev => ({ ...prev, license: file }))
        toast.success(t('success.licenseUploaded'))
      } else {
        setUploadedFiles(prev => ({
          ...prev,
          certificates: [...prev.certificates, file]
        }))
        toast.success(`${t('success.certificateUploaded')} ${file.name}`)
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-heading">{t('doctorReg.title')}</h1>
          <p className="text-text-muted mt-2">{t('doctorReg.subtitle')}</p>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Form Card */}
        <div className="bg-background-paper rounded-2xl shadow-lg p-8 mt-8 border border-border">
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
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-heading">{t('doctorReg.professionalDetails')}</h2>
                    <p className="text-sm text-text-muted">{t('doctorReg.tellUsExpertise')}</p>
                  </div>
                </div>

                <Select
                  label={t('doctorReg.medicalSpecialty')}
                  value={formData.specialty}
                  onChange={(e) => handleFieldChange('specialty', e.target.value)}
                  error={errors.specialty}
                >
                  <option value="">{t('doctorReg.selectSpecialty')}</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </Select>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label={t('doctorReg.yearsOfExperience')}
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleFieldChange('yearsOfExperience', e.target.value)}
                    error={errors.yearsOfExperience}
                    placeholder="e.g., 10"
                  />
                  <Input
                    label={t('doctorReg.consultationFee')}
                    type="number"
                    min="100"
                    value={formData.consultationFee}
                    onChange={(e) => handleFieldChange('consultationFee', e.target.value)}
                    error={errors.consultationFee}
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-3">
                    {t('doctorReg.languagesSpoken')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map((language) => (
                      <label key={language} className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-background-subtle transition-colors">
                        <input
                          type="checkbox"
                          checked={(formData.languages || []).includes(language)}
                          onChange={() => toggleLanguage(language)}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text-heading">{language}</span>
                      </label>
                    ))}
                  </div>
                  {errors.languages && (
                    <p className="mt-1 text-sm text-red-500">{errors.languages}</p>
                  )}
                </div>

                <Textarea
                  label={t('doctorReg.professionalBio')}
                  value={formData.bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  error={errors.bio}
                  placeholder={t('doctorReg.bioPlaceholder')}
                  rows={6}
                />
                <p className="text-xs text-clinical-gray">
                  {formData.bio.length}/50 {t('doctorReg.bioMinChars')}
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
                    <h2 className="text-xl font-semibold text-text-heading">{t('doctorReg.documentation')}</h2>
                    <p className="text-sm text-text-muted">{t('doctorReg.uploadCredentials')}</p>
                  </div>
                </div>

                <Input
                  label={t('doctorReg.medicalLicenseNumber')}
                  value={formData.licenseNumber}
                  onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                  error={errors.licenseNumber}
                  placeholder="e.g., EG-12345-2020"
                />

                {/* Medical License Upload */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {t('doctorReg.medicalLicense')} <span className="text-red-500">*</span>
                  </label>
                  {!uploadedFiles.license ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-all">
                      <Upload className="w-8 h-8 text-text-muted mb-2" />
                      <p className="text-sm text-text-light">{t('doctorReg.uploadLicense')}</p>
                      <p className="text-xs text-text-muted mt-1">{t('doctorReg.fileFormats')}</p>
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
                          <p className="text-sm font-medium text-text-heading">{uploadedFiles.license.name}</p>
                          <p className="text-xs text-text-muted">{(uploadedFiles.license.size / 1024).toFixed(2)} KB</p>
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
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {t('doctorReg.additionalCertificates')}
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-all">
                    <Upload className="w-8 h-8 text-text-muted mb-2" />
                    <p className="text-sm text-text-light">{t('doctorReg.uploadCertificates')}</p>
                    <p className="text-xs text-text-muted mt-1">{t('doctorReg.certificateTypes')}</p>
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
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-text-heading">{file.name}</p>
                              <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
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

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    {t('doctorReg.documentReviewNote')}
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
                    <h2 className="text-xl font-semibold text-text-heading">{t('doctorReg.setYourAvailability')}</h2>
                    <p className="text-sm text-text-muted">{t('doctorReg.chooseWorkingDays')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(formData.availability).map(([day, schedule]) => (
                    <div key={day} className={`p-4 border rounded-lg transition-all ${schedule.enabled ? 'border-primary bg-primary/10' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={() => toggleDayAvailability(day)}
                            className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                          />
                          <span className="font-medium text-text-heading capitalize">{day}</span>
                        </label>
                        {schedule.enabled && (
                          <div className="flex items-center gap-2 text-sm text-clinical-gray">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.start} - {schedule.end}</span>
                          </div>
                        )}
                      </div>

                      {schedule.enabled && (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                          <div>
                            <label className="block text-xs font-medium text-text-muted mb-1">{t('doctorReg.startTime')}</label>
                            <input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => updateDayTime(day, 'start', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-muted mb-1">{t('doctorReg.endTime')}</label>
                            <input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => updateDayTime(day, 'end', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-text"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-primary-dark">
                    {t('doctorReg.availabilityTip')}
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
              {t('common.back')}
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.submitting')}</span>
                </div>
              ) : isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('doctorReg.submitForApproval')}
                </>
              ) : (
                <>
                  {t('common.next')}
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
