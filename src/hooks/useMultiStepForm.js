import { useState, useCallback } from 'react'

export function useMultiStepForm(initialData = {}, totalSteps = 3) {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState(initialData)
    const [errors, setErrors] = useState({})

    const updateFormData = useCallback((stepData) => {
        setFormData(prev => ({ ...prev, ...stepData }))
    }, [])

    const nextStep = useCallback(() => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1)
        }
    }, [currentStep, totalSteps])

    const previousStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }, [currentStep])

    const goToStep = useCallback((step) => {
        if (step >= 1 && step <= totalSteps) {
            setCurrentStep(step)
        }
    }, [totalSteps])

    const resetForm = useCallback(() => {
        setCurrentStep(1)
        setFormData(initialData)
        setErrors({})
    }, [initialData])

    const setFieldError = useCallback((field, error) => {
        setErrors(prev => ({ ...prev, [field]: error }))
    }, [])

    const clearFieldError = useCallback((field) => {
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
        })
    }, [])

    const clearAllErrors = useCallback(() => {
        setErrors({})
    }, [])

    return {
        currentStep,
        formData,
        errors,
        updateFormData,
        nextStep,
        previousStep,
        goToStep,
        resetForm,
        setFieldError,
        clearFieldError,
        clearAllErrors,
        isFirstStep: currentStep === 1,
        isLastStep: currentStep === totalSteps,
        progress: (currentStep / totalSteps) * 100,
    }
}
