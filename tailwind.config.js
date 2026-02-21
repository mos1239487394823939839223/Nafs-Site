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
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                    foreground: '#ffffff',
                },
                // Secondary Color - Soft Green
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    light: 'var(--color-secondary-light)',
                    dark: 'var(--color-secondary-dark)',
                },
                // Background Colors
                background: {
                    DEFAULT: 'var(--color-background)',
                    white: 'var(--color-background-paper)',
                    gray: 'var(--color-background-subtle)',
                    paper: 'var(--color-background-paper)',
                    subtle: 'var(--color-background-subtle)',
                },
                // Border & Stroke
                border: {
                    DEFAULT: 'var(--color-border)',
                    light: 'var(--color-border-light)',
                    dark: 'var(--color-border-dark)',
                },
                // Text Colors
                text: {
                    DEFAULT: 'var(--color-text)',
                    light: 'var(--color-text-light)',
                    dark: 'var(--color-text-heading)',
                    muted: 'var(--color-text-light)',
                    heading: 'var(--color-text-heading)',
                },
                // Accent Colors
                accent: {
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-secondary-light)',
                    dark: 'var(--color-primary-dark)',
                },
                // shadcn/ui semantic colors
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: 'var(--color-background-subtle)',
                    foreground: 'var(--color-text-light)',
                },
                popover: {
                    DEFAULT: 'var(--color-background-paper)',
                    foreground: 'var(--color-text)',
                },
                card: {
                    DEFAULT: 'var(--color-background-paper)',
                    foreground: 'var(--color-text)',
                },
                // Legacy colors
                medical: {
                    blue: 'var(--color-primary-light)',
                    teal: 'var(--color-primary)',
                    lightBlue: 'var(--color-secondary-light)',
                    darkBlue: 'var(--color-text)',
                },
                clinical: {
                    white: 'var(--color-background)',
                    gray: 'var(--color-primary)',
                    darkGray: 'var(--color-text)',
                },
                sage: {
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                lg: '0.75rem',
                md: '0.5rem',
                sm: '0.375rem',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'fade-out': {
                    from: { opacity: '1' },
                    to: { opacity: '0' },
                },
                'slide-in-from-top': {
                    from: { transform: 'translateY(-100%)' },
                    to: { transform: 'translateY(0)' },
                },
                'slide-in-from-bottom': {
                    from: { transform: 'translateY(100%)' },
                    to: { transform: 'translateY(0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'fade-out': 'fade-out 0.2s ease-out',
                'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
                'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
}
