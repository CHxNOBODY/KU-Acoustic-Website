import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// This repo deploys to GitHub *project* Pages, served from
// https://<user>.github.io/KU-Acoustic-Website/ — production assets need that
// prefix. Dev stays on "/" so `npm run dev` is just http://localhost:5173/.
// Moving to a custom domain or a <user>.github.io repo? Set this to "/".
const PROD_BASE = "/KU-Acoustic-Website/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? PROD_BASE : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
}));
