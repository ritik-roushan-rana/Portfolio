/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx,mdx}", "./components/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      // Mirrors of the custom properties declared in app/globals.css, so the
      // handful of places that reach for a Tailwind utility (text-ink,
      // border-line) stay in step with the CSS the rest of the site uses.
      colors: {
        ground: "var(--ground)",
        "ground-raised": "var(--ground-raised)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        ember: "var(--ember)",
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
    },
  },
  plugins: [],
}
