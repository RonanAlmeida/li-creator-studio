/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0A66C2',
          'blue-dark': '#004182',
          'blue-light': '#378FE9',
          'gray-900': '#191919',
          'gray-800': '#3C3D40',
          'gray-600': '#767676',
          'gray-300': '#C4C4C4',
          'gray-200': '#E9E9E9',
          'gray-100': '#F3F2EF',
          white: '#FFFFFF',
          success: '#057642',
          error: '#CC1016',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'linkedin': '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.15)',
        'linkedin-hover': '0 0 0 1px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
