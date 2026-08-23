// Golden-path §8 — config Playwright di apps/studio (la config in eval/ resta
// scoped al solo replay-kill-test). testDir e2e/: smoke di superficie reale
// contro il dev server vite. Locale-first: nessun job CI aggiunto qui.
import { defineConfig } from "@playwright/test"

const externalBaseURL = process.env.ARDESIA_STUDIO_E2E_BASE_URL?.trim()
const baseURL = externalBaseURL || "http://localhost:5199"

export default defineConfig({
  testDir: "./e2e",
  // 60s, non 30. Misurato 2026-08-24 dentro il batch dei sedici (tempi per
  // journey, avvio del dev server incluso): montaggio-canvas 32s,
  // sim-multi-experiment-restore 33s, sim-passo-passo 33s,
  // elab-lab-canvas-colors 47s. Con un tetto di 30s i journey pesanti di
  // canvas correvano a pochi secondi dal soffitto, e sotto carico lo
  // superavano: il flake visto tre volte (giri 23, 27, 29 — tre spec
  // diverse, sempre in batch, sempre verdi da sole) era
  // `Test timeout of 30000ms exceeded`, letto nel trace del giro 29.
  // COSTO dichiarato: un blocco vero adesso impiega il doppio a farsi
  // vedere. E' il prezzo per un rosso che significa qualcosa.
  timeout: 60_000,
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
