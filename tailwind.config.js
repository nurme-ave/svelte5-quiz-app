/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      screens: {
        'xsm': '400px',
        '3xl': '1920px'
      }
    }
  },
  plugins: []
};
