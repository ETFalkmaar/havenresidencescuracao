import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // Disable auto-dark-mode. The site is always light; we only opt in via an
  // explicit `class="dark"` on <html> (which we never set).
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0B0B0B",
          soft: "#1A1A1A",
          mute: "#525252",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          tint: "#F7F6F2",
          warm: "#F2EFE8",
        },
        brand: {
          50: "#EEF5FF",
          100: "#D9E8FF",
          400: "#3F8AFE",
          500: "#1F6BF0",
          600: "#1551C7",
          700: "#103E99",
        },
      },
      boxShadow: {
        pill: "0 8px 30px rgba(15, 23, 42, 0.08)",
        soft: "0 18px 60px -12px rgba(15, 23, 42, 0.18)",
        ring: "0 0 0 1px rgba(15, 23, 42, 0.08), 0 24px 60px -20px rgba(15, 23, 42, 0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        floatUp: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        ringPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(31, 107, 240, 0.3)" },
          "50%": { boxShadow: "0 0 0 12px rgba(31, 107, 240, 0)" },
        },
      },
      animation: {
        floatUp: "floatUp 6s ease-in-out infinite",
        ringPulse: "ringPulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
