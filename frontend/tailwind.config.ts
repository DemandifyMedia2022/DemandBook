import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        warning: "#f59e0b",
        success: "#10b981",
        danger: "#ef4444",
        error: "#ba1a1a"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "gutter-md": "1rem",
        unit: "4px",
        "sidebar-width": "260px",
        "sidebar-collapsed": "64px",
        "container-max": "1440px",
        "margin-page": "2rem"
      },
      fontFamily: {
        sans: ["Manrope", "var(--font-manrope)", "sans-serif"],
        "display-lg": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "display-lg-mobile": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "headline-md": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "headline-sm": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "body-lg": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "body-md": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "body-sm": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "label-md": ["Manrope", "var(--font-manrope)", "sans-serif"],
        "mono-data": ["var(--font-jetbrains-mono)", "monospace"]
      },
      fontSize: {
        "display-lg": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "mono-data": ["13px", { lineHeight: "20px", fontWeight: "450" }]
      }
    },
  },
  plugins: [],
};
export default config;
