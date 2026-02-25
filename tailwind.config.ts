import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        group1: "#EF4444",
        group2: "#F97316",
        group3: "#EAB308",
        group4: "#22C55E",
        group5: "#3B82F6",
        group6: "#A855F7",
        group7: "#EC4899",
      },
      fontFamily: {
        display: ["'Fredoka One'", "cursive"],
        body: ["'Nunito'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
