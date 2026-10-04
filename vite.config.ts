import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The site is hosted on Vercel (ku-acoustic-website.vercel.app), which serves
// from the domain root — so assets must be referenced from "/".
// Only change this if you move to GitHub *project* Pages, which serves from a
// subpath and would need "/KU-Acoustic-Website/" instead.
const BASE = "/";

export default defineConfig(() => ({
  base: BASE,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    watch: { ignored: ['**/artifacts/**', '**/data/**'] },
    proxy: { "/api": "http://127.0.0.1:3001" },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
}));
