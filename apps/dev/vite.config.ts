import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [UnoCSS(), react()],
  base: "/v1-demo-windowed",
  server: {
    port: 3000,
  },
});
