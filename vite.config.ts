import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  base: "/",
  server: {
    allowedHosts: [
      "continuously-vinegarish-catalina.ngrok-free.dev"
    ]
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    netlify(),
  ],
  build: {
    outDir: "dist", // 👈 Força o compilador do cliente a salvar na pasta dist na raiz
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});