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
    // Node >= 24 definisce di suo un globale `localStorage` (Web Storage
    // sperimentale). E' una proprieta' PROPRIA di globalThis, quindi vince su
    // quella che jsdom installa, e senza `--localstorage-file` il suo getter
    // restituisce `undefined` — non lancia, non avvisa il test: sparisce.
    // Misurato il 2026-08-22 su Node 26.5.1: 5 file / 22 test rossi con
    // `Cannot read properties of undefined (reading 'clear')`, mentre
    // `sessionStorage` restava sano perche' Node non lo definisce.
    // Su Node 22 (quello che ci.yml installa) il globale non esiste e i 22 test
    // passano: era un rosso solo locale, e questa riga lo chiude per entrambi.
    // La forma lunga e' obbligatoria: Node 22 rifiuta `--no-webstorage` (exit 9)
    // e accetta `--no-experimental-webstorage` (exit 0).
    execArgv: ["--no-experimental-webstorage"],
  },
})
