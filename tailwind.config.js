/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Brand Color - Sage Green
                primary: {
                    DEFAULT: '#6B9E8A', // Sage Green
                    light: '#8FBDAA', // Light Sage
                    dark: '#4A7E6D', // Dark Sage
                },
                // Secondary Color - Soft Green
                secondary: {
                    DEFAULT: '#8FBDAA', // Light Sage
                    light: '#D4EAE0', // Very Light Green
                    dark: '#6B9E8A', // Sage Green
                },
                // Background Colors - Clean & Professional
                background: {
                    DEFAULT: '#F5FAF7', // Very Light Green Tint
                    white: '#FFFFFF', // Pure White
                    gray: '#EDF5F0', // Light Green Gray
                },
                // Border & Stroke
                border: {
                    DEFAULT: '#C8DFD3', // Light Green Border
                    light: '#E0EFE7', // Very Light Green Border
                    dark: '#8FBDAA', // Sage Border
                },
                // Text Colors - Professional & Clear
                text: {
                    DEFAULT: '#2D3D35', // Dark Green-Gray
                    light: '#4A7E6D', // Medium Green
                    dark: '#1A2B23', // Very Dark Green
                },
                // Accent Colors - Sage Green
                accent: {
                    DEFAULT: '#6B9E8A', // Sage Green
                    light: '#D4EAE0', // Light Green
                    dark: '#4A7E6D', // Dark Sage
                },
                // Legacy colors (updated to new green palette for backward compatibility)
                medical: {
                    blue: '#8FBDAA', // Light Sage
                    teal: '#6B9E8A', // Sage Green
                    lightBlue: '#D4EAE0', // Very Light Green
                    darkBlue: '#2D3D35', // Dark Green-Gray
                },
                clinical: {
                    white: '#F5FAF7', // Very Light Green Tint
                    gray: '#6B9E8A', // Sage Green
                    darkGray: '#2D3D35', // Dark Green-Gray
                },
                // Status Colors
                sage: {
                    DEFAULT: '#6B9E8A',
                    light: '#8FBDAA',
                    dark: '#4A7E6D',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
