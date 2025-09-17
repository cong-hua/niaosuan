import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        purine: {
          low: "#34d399",
          mid: "#facc15",
          high: "#f87171",
          unknown: "#9ca3af"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
