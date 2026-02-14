/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Brand Color - Sage Green
                primary: {
                    DEFAULT: 'var(--color-primary)', // Sage Green
                    light: 'var(--color-primary-light)', // Light Sage
                    dark: 'var(--color-primary-dark)', // Dark Sage
                },
                // Secondary Color - Soft Green
                secondary: {
                    DEFAULT: 'var(--color-secondary)', // Light Sage
                    light: 'var(--color-secondary-light)', // Very Light Green
                    dark: 'var(--color-secondary-dark)', // Sage Green
                },
                // Background Colors - Clean & Professional
                background: {
                    DEFAULT: 'var(--color-background)', // Very Light Green Tint / Dark Green
                    white: 'var(--color-background-paper)', // Pure White / Dark Card
                    gray: 'var(--color-background-subtle)', // Light Green Gray / Dark Subtle
                    paper: 'var(--color-background-paper)',
                    subtle: 'var(--color-background-subtle)',
                },
                // Border & Stroke
                border: {
                    DEFAULT: 'var(--color-border)', // Light Green Border / Dark Border
                    light: 'var(--color-border-light)', // Very Light Green Border
                    dark: 'var(--color-border-dark)', // Sage Border
                },
                // Text Colors - Professional & Clear
                text: {
                    DEFAULT: 'var(--color-text)', // Dark Green-Gray / Off-white
                    light: 'var(--color-text-light)', // Medium Green / Muted
                    dark: 'var(--color-text-heading)', // Very Dark Green / White
                    muted: 'var(--color-text-light)',
                    heading: 'var(--color-text-heading)',
                },
                // Accent Colors - Sage Green
                accent: {
                    DEFAULT: 'var(--color-primary)', // Sage Green
                    light: 'var(--color-secondary-light)', // Light Green
                    dark: 'var(--color-primary-dark)', // Dark Sage
                },
                // Legacy colors (updated to new green palette for backward compatibility)
                medical: {
                    blue: 'var(--color-primary-light)', // Light Sage
                    teal: 'var(--color-primary)', // Sage Green
                    lightBlue: 'var(--color-secondary-light)', // Very Light Green
                    darkBlue: 'var(--color-text)', // Dark Green-Gray
                },
                clinical: {
                    white: 'var(--color-background)', // Very Light Green Tint
                    gray: 'var(--color-primary)', // Sage Green
                    darkGray: 'var(--color-text)', // Dark Green-Gray
                },
                // Status Colors
                sage: {
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
