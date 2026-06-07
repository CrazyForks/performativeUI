import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Docs site build → static SPA in /dist-docs (deployed to GitHub Pages)
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, "docs"),
  // GitHub Pages serves from a subpath when not using a custom domain.
  // Use a relative base so paths work either way; HashRouter handles routing.
  base: "./",
  build: {
    outDir: resolve(__dirname, "dist-docs"),
    emptyOutDir: true,
    sourcemap: false,
  },
  resolve: {
    // Array form — order + regex specificity matters.
    // Match the styles.css path BEFORE the bare-module alias.
    alias: [
      {
        find: /^performative-ui\/styles\.css$/,
        replacement: resolve(__dirname, "src/styles.css"),
      },
      {
        find: /^performative-ui$/,
        replacement: resolve(__dirname, "src/index.ts"),
      },
    ],
  },
  server: {
    port: 5174,
    host: true,
  },
});
