/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      textStroke: {
        'dark-red': ['2px #4D041A'], // Define stroke color and width
        'black': ['2px #000000'], // Define stroke color and width

      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-stroke-dark-red': {
          '-webkit-text-stroke': '2px #4D041A',
          'text-stroke': '2px #4D041A', // For future compatibility
        },
         '.text-stroke-black': {
          '-webkit-text-stroke': '2px #000000',
          'text-stroke': '2px #000000', // For future compatibility
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
