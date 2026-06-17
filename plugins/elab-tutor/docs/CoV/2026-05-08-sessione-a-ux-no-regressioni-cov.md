# CoV - Sessione parallela A UX/no-regressioni

Data: 2026-05-08  
Scope: Lavagna, pannelli, gomma, persistenza disegno, sessioni salvate, Manuale/Video/Fumetto, tre pulsanti, simulatori Arduino/Scratch, bridge azioni UNLIM.  
Vincolo rispettato: non ho toccato il core linguistico UNLIM; ho toccato solo runtime/UX/action bridge quando bloccante.

## Verdetto

PASS per test mirati, Playwright locale desktop+iPad proxy, build locale e deploy preview Vercel.

Non dichiaro PASS per Apple Pencil fisica, Safari iPad reale, microfono/STT/TTS reale o qualita LLM live: qui sono stati verificati UI, bridge, persistenza, action exposure e regressioni locali. Serve prova hardware/HTTPS prima di promuovere produzione.

Preview deploy:

- https://elab-tutor-6ei86l26j-andreas-projects-6d4e9791.vercel.app

## Fix verificati

- Pannelli ridimensionabili da tutti i lati:
  - pannelli flottanti Lavagna/UNLIM via `FloatingWindow`
  - pannello Passo Passo/ComponentDrawer
- Gomma: non salva piu tratti trasparenti/biancastri, cancella i tratti colpiti e ha stato attivo piu leggibile.
- Disegni: dopo `ESCI` restano visibili sullo schermo, ma la toolbar si nasconde.
- Salvataggio sessione: una sessione API-raced ora viene inizializzata prima del finalize; salvataggio anonimo accoda sync locale invece di generare 401 bloccante.
- UNLIM dopo caricamento esperimento: il pannello Galileo resta visibile in CLEAN/BUILD/CODE/RUN.
- Tre pulsanti: Percorso, Passo Passo, Gia Montato visibili e non coperti dal layer canvas su iPad.
- Manuale e Video aprono; video non genera piu 404 da thumbnail YouTube stale.
- Fumetto/report apre popup o feedback visibile.
- Bridge azioni UNLIM espone funzioni operative principali: loadExperiment, setBuildMode, nextStep, prevStep, showEditor, setEditorMode, loadScratchWorkspace, compile, captureScreenshot.

## Test

Targeted unit/regression:

```txt
15 test files passed
478 tests passed
2 todo
```

Suite inclusa:

- DrawingOverlay migration/persistence/gomma
- drawingStorage/drawingPersistence
- LavagnaStateManager
- Lavagna edge cases/modalita
- GalileoAdapter mode tabs
- MicPermissionNudge
- actionCommands/voiceCommands
- simulator API/events
- unlimChat/clawbot-template-router/intent-parser

Build locale:

```txt
npm run build: PASS
PWA generateSW: PASS
```

Warning non bloccanti rimasti:

- CSS minify `Unexpected "/"` su commento/generato CSS.
- chunk >1000 kB, soprattutto `react-pdf` e blocchi simulatore/lavagna.
- warning storici su classi generate `[file:*]` osservati nella build locale precedente.

## Playwright

Locale `http://127.0.0.1:5173/#lavagna`, desktop + iPad/touch proxy:

```txt
PASS desktop experiment loaded: v1-cap6-esp1, 94 esperimenti
PASS header buttons: UNLIM, Manuale, Video, Salva, Fumetto
PASS three mode buttons visible
PASS UNLIM remains present after experiment load
PASS UNLIM floating panel resizes from all sides
PASS Passo Passo panel resizes from all sides
PASS drawing persists after Esci
PASS eraser deletes instead of coloring
PASS Manuale opens
PASS Video opens
PASS Salva creates saved session
PASS Fumetto/report opens popup
PASS UNLIM action bridge exposes expected core actions
PASS iPad/Apple Pencil proxy: panels usable and drawing persists after exit
PASS browser console/page errors: count 0
```

Evidenze:

- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/playwright-results.json`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/desktop-loaded.png`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/desktop-passo-passo-resized.png`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/desktop-drawing-after-exit.png`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/desktop-drawing-after-eraser.png`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/desktop-manuale.png`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/desktop-video.png`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/ipad-passo-passo-pencil-exit.png`

## Deploy

Preview Vercel riuscito:

```txt
Deployment id: dpl_7xLeJnd9b7HDW9gexxoqQdZ9NfJB
Ready state: READY
Preview: https://elab-tutor-6ei86l26j-andreas-projects-6d4e9791.vercel.app
Inspect: https://vercel.com/andreas-projects-6d4e9791/elab-tutor/7xLeJnd9b7HDW9gexxoqQdZ9NfJB
```

Non ho promosso produzione/alias stabile.

