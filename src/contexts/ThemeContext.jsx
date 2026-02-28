import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme } from '../theme/muiTheme'
import { useLanguage } from './LanguageContext'
import rtlPlugin from 'stylis-plugin-rtl'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

const ThemeContext = createContext(null)

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const { isRTL } = useLanguage()

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

    // Create MUI theme based on current mode and direction
    const muiTheme = useMemo(() => createAppTheme(theme, isRTL ? 'rtl' : 'ltr'), [theme, isRTL])

    const value = {
        theme,
        setTheme,
        toggleTheme,
    }

    // Generate Emotion caches for RTL/LTR
    const cacheRtl = useMemo(
        () =>
            createCache({
                key: 'muirtl',
                stylisPlugins: [rtlPlugin],
            }),
        []
    )

    const cacheLtr = useMemo(
        () =>
            createCache({
                key: 'muiltr',
                stylisPlugins: [],
            }),
        []
    )

    const currentCache = isRTL ? cacheRtl : cacheLtr

    return (
        <ThemeContext.Provider value={value}>
            <CacheProvider value={currentCache}>
                <MuiThemeProvider theme={muiTheme}>
                    <CssBaseline />
                    {children}
                </MuiThemeProvider>
            </CacheProvider>
        </ThemeContext.Provider>
    )
}
