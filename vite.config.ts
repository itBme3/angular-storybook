import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";

export default defineConfig({
  plugins: [angular()],
  server: {
    port: 4200,
    open: true,
  },
  build: {
    target: "es2020",
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
