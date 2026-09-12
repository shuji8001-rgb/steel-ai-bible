/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f4f6f8',
          100: '#e1e6eb',
          200: '#c5d0db',
          300: '#9cb1c4',
          400: '#6d8da9',
          500: '#4e708f',
          600: '#3c5874',
          700: '#32475e',
          800: '#2c3c4e',
          900: '#1b2633',
          950: '#0f161e',
        },
        flame: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        weld: {
          cyan: '#06b6d4',
          electric: '#38bdf8',
        }
      },
    },
  },
  plugins: [],
};
