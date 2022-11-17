/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'emerald': '#38E8C6',
        'emerald-light': '#68FADE',
        'emerald-dark': '#09BC99'
      },
      light: {
        DEFAULT: "#FAFBFC",
        lighter: "#F3F4F6",
      },
      fontFamily: {
        'flow': ['sans-serif'],
      },
      boxShadow: {
        'emerald': '0px 5px 25px -5px rgba(0,0,0,0.2)'
      }
    }
  },
  plugins: [],
}