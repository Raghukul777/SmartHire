/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#a78bfa',
                    DEFAULT: '#7c3aed',
                    dark: '#5b21b6',
                },
                secondary: '#06b6d4',
                accent: '#f43f5e',
            },
        },
    },
    plugins: [],
}
