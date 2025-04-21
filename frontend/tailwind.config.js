// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        glitch: 'glitch 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glitch: {
          '0%, 100%': { textShadow: '2px 2px #f00, -2px -2px #0ff' },
          '25%': { textShadow: '-2px 2px #0f0, 2px -2px #f0f' },
          '50%': { textShadow: '2px -2px #0ff, -2px 2px #f00' },
          '75%': { textShadow: '-2px -2px #ff0, 2px 2px #00f' },
        },
      },
    },
  },
  plugins: [],
};
