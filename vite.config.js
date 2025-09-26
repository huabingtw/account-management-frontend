import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from 'fs';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost-cert.pem'),
    },
    port: 5175,
    host: 'localhost',
  },
  base: './',
});