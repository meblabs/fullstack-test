/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
        secondary: 'rgba(0, 0, 0, 0.65)'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
