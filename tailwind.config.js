/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Custom colors if needed, but standard Tailwind palette should suffice for the request
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
