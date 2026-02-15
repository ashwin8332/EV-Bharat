
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'pagani-black': '#1a1a1a',
                'pagani-gold': '#D4AF37',
                'bright-gold': '#FFD700',
                'carbon-gray': '#2a2a2a',
            },
            fontFamily: {
                'orbitron': ['"Orbitron"', 'sans-serif'],
                'rajdhani': ['"Rajdhani"', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
