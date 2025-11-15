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
          50: '#fef1f7',
          100: '#fee5f0',
          200: '#fecce3',
          300: '#ffa2ca',
          400: '#fe68a6',
          500: '#f83b87',
          600: '#e71d68',
          700: '#c9104d',
          800: '#a61140',
          900: '#8a1238',
        },
      },
    },
  },
  plugins: [],
}
