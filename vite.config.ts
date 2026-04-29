import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/rr-management-frontend/",
  server: {
    port: 5173
  }
});
