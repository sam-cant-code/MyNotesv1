/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans your source files for Tailwind classes
  ],
  darkMode: 'class', // <-- This is the crucial line that enables class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}