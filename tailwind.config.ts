import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF7DF",
          100: "#F5E7BC",
          500: "#D4A017",
          600: "#0F3D2E",
          700: "#D4A017",
          primary: "#0F3D2E",
          secondary: "#D4A017",
          background: "#081C15",
          surface: "#11241D",
          text: "#FFFFFF",
          muted: "#C8C8C8",
        },
        ink: "#FFFFFF",
        muted: "#C8C8C8",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(212, 160, 23, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
