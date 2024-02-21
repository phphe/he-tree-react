/// <reference types="vitest" />

import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [UnoCSS(), react()],
  base: "/he-tree-react",
  test: {
    globals: true,
    // environment: "js-dom",
  },
});
