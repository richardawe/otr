import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri expects a fixed, relative base so the built assets resolve inside
// the webview regardless of the host OS's file:// quirks.
export default defineConfig({
  plugins: [react()],
  base: "./",
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: "dist",
    // Tauri on Windows uses webview2 (Chromium-based); no legacy targets needed.
    target: "es2021",
    sourcemap: true,
    // Vite's default modulepreload polyfill calls fetch() to warm chunks.
    // The app has a strict no-network guarantee (see index.html's CSP and
    // scripts/check-no-network.mjs), so that polyfill is disabled outright
    // rather than merely relied upon to be blocked at runtime.
    modulePreload: false
  }
});
