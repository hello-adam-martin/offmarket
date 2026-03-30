import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        border: "var(--color-border)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-light": "var(--color-accent-light)",
        secondary: "var(--color-secondary)",
        "secondary-light": "var(--color-secondary-light)",
        "text-base": "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
        success: "var(--color-success)",
        "success-light": "var(--color-success-light)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        "error-light": "var(--color-error-light)",
        info: "var(--color-info)",
      },
      fontFamily: {
        display: ["var(--font-general-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "3xl": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "2xl": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        xl: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        lg: ["18px", { lineHeight: "1.5", fontWeight: "400" }],
        md: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        sm: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        xs: ["12px", { lineHeight: "1.4", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
      spacing: {
        "2xs": "2px",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
} satisfies Config;
