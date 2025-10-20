/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        scroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'scroll-reverse': {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        scroll: 'scroll 120s linear infinite',
        'scroll-slow': 'scroll 180s linear infinite',
        'scroll-reverse': 'scroll-reverse 120s linear infinite',
        'scroll-reverse-slow': 'scroll-reverse 180s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};


