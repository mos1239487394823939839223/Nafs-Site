/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Brand Color - Deep Navy Blue
                primary: {
                    DEFAULT: '#1C4D8D', // Medium Blue
                    light: '#4988C4', // Lighter Blue
                    dark: '#0F2854', // Dark Navy
                },
                // Secondary Color - Sky Blue
                secondary: {
                    DEFAULT: '#4988C4', // Lighter Blue
                    light: '#BDE8F5', // Light Cyan
                    dark: '#1C4D8D', // Medium Blue
                },
                // Background Colors - Clean & Professional
                background: {
                    DEFAULT: '#F8FBFE', // Very Light Blue Tint
                    white: '#FFFFFF', // Pure White
                    gray: '#F0F5FA', // Light Blue Gray
                },
                // Border & Stroke
                border: {
                    DEFAULT: '#BDE8F5', // Light Cyan
                    light: '#E5F4F9',
                    dark: '#4988C4', // Lighter Blue
                },
                // Text Colors - Professional & Clear
                text: {
                    DEFAULT: '#0F2854', // Dark Navy
                    light: '#1C4D8D', // Medium Blue
                    dark: '#0A1A35', // Darker Navy
                },
                // Accent Colors - Vibrant Blue
                accent: {
                    DEFAULT: '#4988C4', // Lighter Blue
                    light: '#BDE8F5', // Light Cyan
                    dark: '#1C4D8D', // Medium Blue
                },
                // Legacy colors (updated to new blue palette for backward compatibility)
                medical: {
                    blue: '#4988C4', // Lighter Blue
                    teal: '#1C4D8D', // Medium Blue
                    lightBlue: '#BDE8F5', // Light Cyan
                    darkBlue: '#0F2854', // Dark Navy
                },
                clinical: {
                    white: '#F8FBFE', // Very Light Blue Tint
                    gray: '#1C4D8D', // Medium Blue
                    darkGray: '#0F2854', // Dark Navy
                },
                // Status Colors
                sage: {
                    DEFAULT: '#7DAE9F',
                    light: '#A3C9BC',
                    dark: '#5A8A7D',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
