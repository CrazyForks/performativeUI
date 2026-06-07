import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

// Library build → publishable npm package in /dist
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      outDir: "dist",
      rollupTypes: true,
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PerformativeUI",
      formats: ["es"],
      fileName: () => "performative-ui.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "performative-ui.css";
          return assetInfo.name ?? "asset";
        },
      },
    },
    cssCodeSplit: false,
  },
});
