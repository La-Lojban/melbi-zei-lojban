/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors if needed
      },
      fontFamily: {
        // We'll use custom @font-face and set classes manually
      }
    },
  },
  plugins: [],
}
