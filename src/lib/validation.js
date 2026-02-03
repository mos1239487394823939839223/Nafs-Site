// Validation utilities for forms

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
    }
}

export const getPasswordStrength = (password) => {
    const validation = validatePassword(password)
    const score = [
        validation.minLength,
        validation.hasUpperCase,
        validation.hasLowerCase,
        validation.hasNumber,
        validation.hasSpecialChar,
    ].filter(Boolean).length

    if (score <= 2) return { strength: 'weak', color: 'red', percentage: 33 }
    if (score <= 4) return { strength: 'medium', color: 'orange', percentage: 66 }
    return { strength: 'strong', color: 'green', percentage: 100 }
}

export const validatePhone = (phone) => {
    // Egyptian phone number format: +20 followed by 10 digits
    const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const formatPhone = (phone) => {
    // Format as: +20 XXX XXX XXXX
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('20')) {
        const match = cleaned.match(/^(20)(\d{3})(\d{3})(\d{4})$/)
        if (match) return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`
    }
    return phone
}

export const validateDate = (date) => {
    const dateObj = new Date(date)
    const now = new Date()
    return dateObj < now && dateObj > new Date('1900-01-01')
}

export const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

export const validateRequired = (value) => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined
}

export const validateFileSize = (file, maxSizeMB = 5) => {
    return file.size <= maxSizeMB * 1024 * 1024
}

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
    return allowedTypes.includes(file.type)
}
