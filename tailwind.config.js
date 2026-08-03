/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        // === Zahasky Brand Palette ===
        cream: {
          DEFAULT: "#F9F3DB", // base background
          50: "#FFFDF6",
          100: "#F9F3DB",
          200: "#F3E9C2"
        },
        blush: {
          DEFAULT: "#F3D3CB", // soft accent background
          light: "#FDE7E2",
          dark: "#EBB9AE"
        },
        rose: {
          DEFAULT: "#BE5468", // primary accent (CTA highlight, badges)
          dark: "#A6425A"
        },
        espresso: {
          DEFAULT: "#441B07", // deep brown accent / hover states
          light: "#644639"
        },
        ink: {
          DEFAULT: "#1A1A1A", // primary black (buttons, headings, text)
          soft: "#2E2E2E"
        },
        graychalk: "#9CA3AF" // inactive / muted text
      },
      fontFamily: {
        // Heading / Display
        serif: ["'Playfair Display'", "serif"],
        // Body & Navigation
        sans: ["'Poppins'", "sans-serif"],
        // Code / Numbers / Badges
        mono: ["'JetBrains Mono'", "'Geist Mono'", "monospace"]
      },
      borderRadius: {
        pill: "9999px"
      },
      maxWidth: {
        "7xl": "80rem"
      }
    }
  },
  plugins: []
};