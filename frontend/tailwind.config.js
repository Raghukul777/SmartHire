/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Base layers
                graphite: {
                    50: '#f5f3f0',   // fog white / warm off-white
                    100: '#ece9e4',  // slightly warm gray
                    200: '#d8d3cc',
                    300: '#b8b0a5',
                    400: '#918679',
                    500: '#6b5f53',
                    600: '#4a4039',
                    700: '#352e28',
                    800: '#252019',  // deep graphite
                    900: '#1a1612',  // soft charcoal
                    950: '#0f0d0a',
                },
                // Primary: Muted indigo-blue
                indigo: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',  // primary brand anchor
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                // Soft violet-lavender
                lavender: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                },
                // Desaturated cyan / ice-blue
                ice: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#6ee7c2',
                    400: '#38cca5',
                    500: '#18a88a',
                    600: '#0e8a72',
                    700: '#0c6d5b',
                    800: '#0d5649',
                    900: '#0a3d34',
                },
                // Pale mint / cool teal for success
                mint: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#157f3c',
                    800: '#166534',
                    900: '#14532d',
                },
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'soft': '0 4px 24px -2px rgba(0, 0, 0, 0.06)',
                'glow-indigo': '0 0 30px -5px rgba(99, 102, 241, 0.25)',
                'glow-lavender': '0 0 30px -5px rgba(168, 85, 247, 0.2)',
                'float': '0 12px 40px -8px rgba(0, 0, 0, 0.1)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'breathe': 'breathe 8s ease-in-out infinite',
                'gradient-shift': 'gradientShift 15s ease infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                breathe: {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
                    '50%': { opacity: '0.7', transform: 'scale(1.05)' },
                },
                gradientShift: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
            transitionTimingFunction: {
                'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
        },
    },
    plugins: [],
}
