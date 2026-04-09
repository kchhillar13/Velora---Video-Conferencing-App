import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          1: '#1C1F2E',
          2: '#161925',
          3: '#252A41',
        },
        blue: {
          1: '#0E78F9', 
        },
        sky: {
          1: '#C9DDFF',
        },
        // The following colors will be used for the dashboard cards
        orange: {
          1: '#FF742E',
        },
        purple: {
          1: '#830EF9',
        },
        yellow: {
          1: '#F9A90E',
        }
      },
      backgroundImage: {
        hero: "url('/images/hero-background.png')",
      }
    },
  },
  plugins: [],
};

export default config;