// Golden-path §8 — config Playwright di apps/studio (la config in eval/ resta
// scoped al solo replay-kill-test). testDir e2e/: smoke di superficie reale
// contro il dev server vite. Locale-first: nessun job CI aggiunto qui.
import { defineConfig } from "@playwright/test"

const externalBaseURL = process.env.ARDESIA_STUDIO_E2E_BASE_URL?.trim()
const baseURL = externalBaseURL || "http://localhost:5199"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL,
    headless: true,
    // Un journey che fallisce deve LASCIARE PROVE. Misurato il 2026-08-24: senza
    // queste tre righe un fallimento lasciava in `test-results/` soltanto un
    // `error-context.md` — zero trace, zero screenshot, zero video — e il passo
    // `upload-artifact` del job e2e-journey caricava quasi niente. Il flake visto
    // due volte (una spec rossa in batch e verde da sola) non e' stato
    // diagnosticabile per QUESTO motivo, non perche' fosse irriproducibile.
    // `retain-on-failure`: nessun costo sui verdi.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          // MAI pipe sull'output del dev server (gotcha SIGPIPE): lo gestisce Playwright.
          command: "npx vite --port 5199 --strictPort",
          url: "http://localhost:5199",
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
})
