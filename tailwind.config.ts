import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        reality: {
          canvas: "#F7F8F5",
          surface: "#FFFFFF",
          surfaceMuted: "#F1F4F0",
          surfaceBrand: "#EAF5EF",
          brandEmphasis: "#0B5F46",
          surfaceDark: "#063D2D",
          brand: {
            50: "#ECFDF6",
            100: "#D1FAE8",
            500: "#118A64",
            600: "#0E7354",
            700: "#0B5F46",
            900: "#063D2D",
          },
          bg: {
            page: "#FFFFFF",
            subtle: "#F9FAFB",
            muted: "#F5F5F5",
            inverse: "#171717",
          },
          text: {
            primary: "#171717",
            secondary: "#404040",
            tertiary: "#525252",
            quaternary: "#525252",
            inverse: "#FFFFFF",
            brand: "#0B5F46",
          },
          border: {
            primary: "#D4D4D4",
            secondary: "#E5E7EB",
            subtle: "#F5F5F5",
          },
          alpha: {
            white: "rgba(255,255,255,0.62)",
            black20: "rgba(0,0,0,0.2)",
            black70: "rgba(0,0,0,0.7)",
          },
          status: {
            approved: "#118A64",
            pending: "#B7791F",
            rejected: "#B42318",
            info: "#2563EB",
          },
        },
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
        display: ["var(--font-display-stack)", "var(--font-display)", "serif"],
        heading: ["var(--font-heading-legacy)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        reality: "12px",
        "reality-lg": "32px",
      },
      maxWidth: {
        reality: "1328px",
        "reality-wide": "1328px",
        "reality-form": "450px",
        "reality-mobile": "393px",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(212, 160, 23, 0.18)",
        "reality-xs": "0 1px 2px rgba(0, 0, 0, 0.05)",
        "reality-sm": "0 4px 7.5px rgba(0, 0, 0, 0.04)",
        "reality-inner": "inset 0 0 0 1px rgba(0, 0, 0, 0.18), inset 0 -2px 0 rgba(0, 0, 0, 0.05)",
      },
      spacing: {
        "reality-page-x": "296px",
        "reality-field": "56px",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      reality: "1328px",
    },
  },
  plugins: [],
};

export default config;
