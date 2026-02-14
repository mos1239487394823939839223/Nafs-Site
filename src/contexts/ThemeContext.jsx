import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    // Initialize state from local storage or default to 'light'
    const [theme, setTheme] = useState(() => {
        if (localStorage.getItem('theme')) {
            return localStorage.getItem('theme')
        }
        return 'light' // Default to light
    })

    useEffect(() => {
        const root = window.document.documentElement

        // Remove the old theme class and add the new one
        root.classList.remove('light', 'dark')
        root.classList.add(theme)

        // Save preference to local storage
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
    }

    const value = {
        theme,
        toggleTheme,
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
