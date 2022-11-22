/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'drizzle': '#00d588',
        'drizzle-dark': '#00a368',
        'drizzle-light': '#95e7c1',
        'drizzle-ultralight': '#e9faf3', 
        'catalog': '#4F517D'
      },
      light: {
        DEFAULT: "#FAFBFC",
        lighter: "#F3F4F6",
      },
      fontFamily: {
        'flow': ['sans-serif'],
      },
      boxShadow: {
        'drizzle': '0px 5px 25px -5px rgba(0,0,0,0.2)'
      }
    }
  },
  plugins: [],
}