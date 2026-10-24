import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Separate entry: the public artifact does not mount App or its private routes.
export default defineConfig({
  base: "/esperienza/",
  plugins: [
    react(),
    {
      name: "ardesia-public-entry",
      transformIndexHtml: {
        order: "pre",
        handler: (html) =>
          html.replace("/src/main.tsx", "/src/public-main.tsx")
            .replace(/<title>.*?<\/title>/, "<title>Ardesia Fisica — Semestre Filtro · Anteprima</title>"),
      },
    },
  ],
  resolve: { dedupe: ["react", "react-dom"] },
  build: { outDir: "dist-public", emptyOutDir: true },
});
