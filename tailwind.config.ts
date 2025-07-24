import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      colors: {
        primary: "var(--ant-color-primary)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      fontSize: {
        xxs: "0.625rem",
      },
    },
  },
  plugins: [
    plugin(function ({ matchVariant, addVariant }) {
      // https://tailwindcss.com/docs/plugins#adding-variants
      addVariant("hocus", ["&:hover", "&:focus"]);
      // https://tailwindcss.com/docs/plugins#dynamic-variants
      matchVariant("override", (value) => {
        return `& ${value}`;
      });
    }),
  ],
} satisfies Config;
