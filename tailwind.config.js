/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e85d26",
          dark: "#c94d1c",
        },
        dark: {
          DEFAULT: "#1b1b1b",
          soft: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        site: "1400px",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
