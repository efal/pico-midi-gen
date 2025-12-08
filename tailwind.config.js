/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                gray: {
                    850: '#1f2937',
                    900: '#111827',
                    950: '#030712',
                },
                primary: {
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                },
                accent: {
                    400: '#38bdf8',
                    500: '#0ea5e9',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
