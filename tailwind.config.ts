import type { Config } from "tailwindcss";

// Tokens copied verbatim from the K-Nexus design system (knexus-design-system.md §1, §4, §5).
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#1a3a8f",
          "blue-dark": "#152d72",
          navy: "#0f172a",
          soft: "#eaf1ff",
          violet: "#8B5CF6",
          green: "#16a34a",
          "green-dark": "#15803d",
        },
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-mid": "float 4.5s ease-in-out infinite",
        "float-fast": "float 3.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.35s ease-out both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 10px 30px -5px rgba(26,58,143,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
