/**
 * ZAHASKY — Tailwind Configuration
 * Palette: Cream & Espresso (muted, warm, editorial feel)
 */
module.exports = {
  // Tailwind hanya akan men-generate class yang benar-benar dipakai di file-file ini
  content: ["./public/**/*.html", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        cream: "#F9F3DB",   // Base background
        brown: "#441B07",   // Primary dark — text, buttons, footer bg
        ink: "#1A1A1A",     // Black — untuk teks aktif
        muted: "#8A8A8A",   // Abu-abu — untuk teks/elemen yang belum aktif
      },
      fontFamily: {
        // Override default Tailwind font stacks langsung, jadi tinggal pakai
        // class bawaan: font-serif (heading), font-sans (body, default), font-mono (angka/badge/code)
        sans: ["Poppins", "sans-serif"],
        serif: ["'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};