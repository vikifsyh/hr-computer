import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B8C78",
          50: "#e8f4f2",
          100: "#b8dbd5",
          200: "#96cac1",
          300: "#66b2a5",
          400: "#49a393",
          600: "#197f6d",
          700: "#136355",
          800: "#0f4d42",
          900: "#0b3b32",
        },
        neutral: {
          DEFAULT: "#D3D1D8",
          50: "#E7E7E7",
          100: "#B4B4B4",
          200: "#909090",
          300: "#5D5D5D",
          400: "#3D3D3D",
          500: "#0D0D0D",
          600: "#0C0C0C",
          700: "#090909",
          800: "#070707",
          900: "#050505",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
