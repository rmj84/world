import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1d4ed8",
          dark: "#1e3a8a",
        },
      },
      fontSize: {
        "2xl-plus": ["1.75rem", { lineHeight: "2.25rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
