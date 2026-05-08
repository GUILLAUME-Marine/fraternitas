import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        gold: { DEFAULT: "#B8973A", light: "#D4AF5A", pale: "#F0E3C0", dark: "#8B6914" },
        ink: { DEFAULT: "#111009" },
        cream: { DEFAULT: "#F7F3EC", 2: "#EEE8DA" },
      },
      animation: {
        "in": "fadeIn 0.3s ease",
        "slide-in-from-right-4": "slideInRight 0.3s ease",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
