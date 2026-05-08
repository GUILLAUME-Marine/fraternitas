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
        gold: {
          DEFAULT: "#B8973A",
          light: "#D4AF5A",
          pale: "#F0E3C0",
          dark: "#8B6914",
        },
        ink: {
          DEFAULT: "#111009",
          80: "rgba(17,16,9,0.80)",
          60: "rgba(17,16,9,0.60)",
          40: "rgba(17,16,9,0.40)",
          15: "rgba(17,16,9,0.15)",
          6: "rgba(17,16,9,0.06)",
        },
        cream: {
          DEFAULT: "#F7F3EC",
          dark: "#EEE8DA",
        },
        dark: {
          DEFAULT: "#0D0C08",
          2: "#181610",
          surface: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.09)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.8s ease forwards",
        "pulse-ring": "pulse-ring 3s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.4", transform: "translate(-50%,-50%) scale(1)" },
          "50%": { opacity: "0.8", transform: "translate(-50%,-50%) scale(1.03)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
