import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const pwaConfig = {
  mode: "development",
  base: "/",
  includeAssets: ["/*.png"],
  manifest: {
    name: "Inspection Report App",
    short_name: "Inspection App",
    description: "Inspection Report App for Correct Inspections, Australia",
    theme_color: "#000000",
    background_color: "#000000",
    icons: [
      {
        src: "logo512.png",
        type: "image/png",
        sizes: "512x512",
      },
      {
        src: "logo512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any maskable",
      },
      {
        src: "logo192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
  },
  devOptions: {
    enabled: true,
    type: "module",
    navigateFallback: "index.html",
  },
  srcDir: "src/worker",
  filename: "sw.js",
  strategies: "injectManifest",
  registerType: "autoUpdate",
  injectRegister: null,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        file: "webworker.js",
      },
    },
  },
});
