/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "#333333",
        input: "#333333",
        ring: "#00ff41",
        background: "#000000",
        foreground: "#00ff41",
        primary: {
          DEFAULT: "#00ff41",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#333333",
          foreground: "#888888",
        },
        accent: {
          DEFAULT: "#00ffff",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      animation: {
        gradient: "gradient 3s ease infinite",
        scan: "scan 3s infinite",
        float: "float 3s ease-in-out infinite",
        "float-reverse": "float-reverse 4s ease-in-out infinite",
        "float-slow": "float-slow 3.5s ease-in-out infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(320px)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(5deg)" },
          "66%": { transform: "translateY(5px) rotate(-3deg)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(10px) rotate(-5deg)" },
          "66%": { transform: "translateY(-5px) rotate(3deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(3deg)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}