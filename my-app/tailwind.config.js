/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-1': '#07111b',
        'bg-2': '#0d1929',
        'card': 'rgba(8, 14, 23, 0.76)',
        'card-border': 'rgba(255, 255, 255, 0.2)',
        'text': '#ecf3ff',
        'muted': '#afc0d6',
        'accent': '#7ed4ff',
        't-accent': '#ff9f43',
        'ct-accent': '#63b6ff',
      },
      fontFamily: {
        'exo': ['"Exo 2"', 'sans-serif'],
      },
      backdropBlur: {
        'panel': '3px',
      },
    },
  },
  plugins: [],
};