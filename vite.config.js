import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    https: false, // 開發環境使用 HTTP
    port: 5173,
  },
  base: './', // 編譯時使用相對路徑，確保 HTTPS 環境相容性
});