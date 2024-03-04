/// <reference types="vitest" />

import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import react from "@vitejs/plugin-react";
// @ts-ignore
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [UnoCSS(), react()],
  base: "/v1-demo-windowed",
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "he-tree-react": path.resolve("./lib/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      enabled: true,
    },
  },
});
