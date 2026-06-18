import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f5",
          100: "#dcefe6",
          500: "#1f8a5b",
          600: "#176f49",
          700: "#12583b",
        },
        ink: "#17211d",
        muted: "#5d6b64",
      },
    },
  },
  plugins: [],
};

export default config;
