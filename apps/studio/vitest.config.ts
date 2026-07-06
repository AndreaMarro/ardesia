import { defineConfig } from "vitest/config"
import viteConfig from "./vite.config"

export default defineConfig({
  ...viteConfig,
  test: {
    // e2e/** è Playwright (runner proprio): vitest non deve raccoglierlo.
    exclude: ["node_modules/**", "dist/**", "eval/**", "e2e/**"],
    // Room/Excalidraw integration specs are jsdom-heavy and pass in isolation.
    // Serial file execution keeps the gate deterministic on loaded dev machines.
    fileParallelism: false,
    testTimeout: 15000,
    // Excalidraw importa open-color.json senza import-attribute: Node ESM lo rifiuta
    // se il pacchetto resta esternalizzato. Inline = lo trasforma Vite (come nel build).
    server: { deps: { inline: [/@excalidraw\/excalidraw/] } },
  },
})
