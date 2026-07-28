import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F7F6F1",
          100: "#E5C477",
          500: "#C99A3D",
          600: "#0B3B2E",
          700: "#06271F",
          primary: "#0B3B2E",
          secondary: "#C99A3D",
          lightGold: "#E5C477",
          background: "#06271F",
          surface: "#0B3B2E",
          warm: "#F7F6F1",
          main: "#17201D",
          verification: "#178A58",
          warning: "#B76A18",
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
