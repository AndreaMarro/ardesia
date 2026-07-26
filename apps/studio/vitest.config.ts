import { defineConfig } from "vitest/config"
import viteConfig from "./vite.config"

export default defineConfig({
  ...viteConfig,
  test: {
    // e2e/** è Playwright (runner proprio): vitest non deve raccoglierlo.
    exclude: ["node_modules/**", "dist/**", "eval/**", "e2e/**"],
    // PROFILO UNICO: quello che gira in locale è quello che decide il merge.
    // Prima queste opzioni stavano solo nel workflow (npx vitest run --pool=…),
    // quindi `npm run verify` girava con un runner diverso da quello di CI:
    // pool forks vs threads, timeout 15s vs 30s. Un gate locale che non è il
    // gate di merge è un gate che mente. Ora la sorgente è questo file e
    // .github/workflows/ci.yml chiama `npm test`.
    pool: "threads",
    maxWorkers: 1,
    // Room/Excalidraw integration specs are jsdom-heavy and pass in isolation.
    // Serial file execution keeps the gate deterministic on loaded dev machines.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Drena dopo ogni test il lavoro React rimandato a un macrotask: un task
    // del React scheduler sopravvissuto al file esplode dopo il teardown jsdom
    // con "ReferenceError: window is not defined" (unhandled error: test verdi,
    // exit 1). Motivazione completa in src/__tests__/reactWorkDrain.ts.
    setupFiles: ["./src/__tests__/vitest.setup.ts"],
    // Excalidraw importa open-color.json senza import-attribute: Node ESM lo rifiuta
    // se il pacchetto resta esternalizzato. Inline = lo trasforma Vite (come nel build).
    server: { deps: { inline: [/@excalidraw\/excalidraw/] } },
  },
})
