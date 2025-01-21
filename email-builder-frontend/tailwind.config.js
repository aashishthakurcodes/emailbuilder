/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ensure all component files are included
    "./src/styles/**/*.css", // Include main Tailwind file
    "./src/components/**/*.css", // Include your custom CSS files
  ],
  theme: {
    extend: {
     
    },
  },
  plugins: [],
}