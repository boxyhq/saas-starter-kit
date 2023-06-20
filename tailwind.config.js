module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'purple-light': '#D6BCFA', // Light Purple
        'purple-default': '#7C3AED', // Default Purple
        'purple-dark': '#4C1D95', // Dark Purple
      },
    },
  },
  daisyui: {
    themes: ['winter', 'emerald'],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
};
