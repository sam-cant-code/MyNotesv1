/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans your source files for Tailwind classes
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  // --- ADD THIS PLUGINS SECTION ---
  plugins: [
    require('@tailwindcss/typography'),
  ],
}