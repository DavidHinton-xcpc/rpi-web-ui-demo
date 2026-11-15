import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built demo also opens straight from disk (file://).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
