# ELAB Tutor — Simulatore di Circuiti per Scuole

**Tutor educativo per elettronica e Arduino, bambini 8-14 anni.**

Live: https://www.elabtutor.school

## Cosa fa ELAB

ELAB e' un prodotto completo per l'insegnamento dell'elettronica nelle scuole:

- **Simulatore di circuiti** proprietario con 94 lesson-paths + 37 Capitoli (3 volumi)
- **Tutor AI "UNLIM"** che guida la classe passo passo (Principio Zero v3.1)
- **Scratch/Blockly** per programmare Arduino visualmente
- **Compilatore Arduino** (C++ -> HEX -> emulazione AVR in browser)
- **Dashboard docente** con tracciamento progressi e report
- **4 giochi didattici** (Trova il Guasto, Prevedi e Spiega, Circuito Misterioso, Controlla Circuito)
- **PWA** funzionante offline
- **Report "fumetto"** della lezione stampabile in PDF

## Quick Start

```bash
git clone https://github.com/AndreaMarro/elabtutor.git
cd elabtutor
npm install
npm run dev        # http://localhost:5173
npm run test:ci    # 12498+ test (baseline post Sprint Q 2026-04-25)
npm run build      # Build produzione (32 precache 4.8MB)
```

## Stack

| Tecnologia | Ruolo |
|-----------|-------|
| React 19 + Vite 7 | Frontend |
| Vitest | Test (12498+) |
| Zod 4.3 | Schema validation (Capitolo + Wiki) |
| Vercel | Deploy produzione |
| Supabase | Backend (DB + Edge Functions) |
| avr8js | Emulazione CPU Arduino ATmega328p |
| CSS Modules | Styling |
| Workbox | PWA / Service Worker |

**Nota**: NON usiamo react-router. Il routing e' custom con useState e hash (#admin, #login, etc.).

## Struttura progetto

```
src/
  components/
    simulator/              <- CORE: simulatore di circuiti
      engine/               <- CircuitSolver (MNA/KCL), AVRBridge, PlacementEngine
      canvas/               <- SVG canvas, wire bezier routing, DrawingOverlay
      components/           <- 21 componenti SVG (LED, resistore, Arduino, breadboard...)
      panels/               <- Code editor, properties, serial monitor, Scratch
      hooks/                <- useCircuitHandlers, useSimulatorAPI, useExperimentLoader
      utils/                <- Pin mapping, breadboard snap, error translator, HEX cache
    lavagna/                <- Redesign interfaccia "Lavagna" (IN CORSO)
    unlim/                  <- UNLIM mode: chat AI, mascotte, voice, report fumetto
    tutor/                  <- ElabTutorV4 (shell principale), tab, giochi
    dashboard/              <- Dashboard docente (TeacherDashboard)
    admin/                  <- Admin panel + gestionale ERP
    common/                 <- ElabIcons, ConfirmModal, ConsentBanner, Toast
    auth/                   <- Login, RequireLicense
  data/
    experiments-vol1.js     <- 38 esperimenti Volume 1 (circuiti passivi)
    experiments-vol2.js     <- 18 esperimenti Volume 2 (condensatori, transistor)
    experiments-vol3.js     <- 27 esperimenti Volume 3 (Arduino, codice)
    lesson-paths/           <- 94 percorsi lezione JSON (legacy flat)
    capitoli/               <- 37 Capitoli JSON (Sprint Q1, narrative-preserving)
    schemas/Capitolo.js     <- Zod schema Capitolo (Sprint Q1.A)
  services/
    api.js                  <- API calls (chat, compile, diagnose, hints)
    voiceCommands.js        <- 24 comandi vocali
    simulator-api.js        <- window.__ELAB_API (API globale simulatore)
    supabaseSync.js         <- Sync sessioni con Supabase (offline queue)
    unlimMemory.js          <- Memoria 3-tier (local + Supabase + nanobot)
  hooks/                    <- useSessionTracker, useTTS, useSTT
  context/AuthContext.jsx   <- Autenticazione + ruoli
  styles/design-system.css  <- CSS variables, palette, tipografia
```

## I 3 Volumi

| Volume | Capitoli | Esperimenti | Tipo | Colore |
|--------|----------|-------------|------|--------|
| Vol. 1 | 14 (5 teoria + 9 sperimentali) | 38 lesson-paths | Circuiti passivi (LED, resistori, parallelo/serie) | Lime #4A7A25 |
| Vol. 2 | 12 (3 teoria + 9 sperimentali/capstone) | 27 lesson-paths | Condensatori, transistor, fototransistor, motore DC | Orange #E8941C |
| Vol. 3 | 9 (4 teoria + 5 esperimenti/capstone) | 29 lesson-paths | Arduino (digitalWrite, analogRead, PWM, Servo, LCD) | Red #E54B3D |
| Bonus Vol3 | 2 | 2 freestyle (lcd-hello, servo-sweep) | Capstone bonus | Navy #1E4D8C |
| **TOT** | **37 Capitoli** | **94 lesson-paths** | | |

Vedi: `docs/data/volume-structure.json` (Sprint Q0 analysis), `docs/sprint-q/SPRINT-Q-HISTORY-COMPREHENSIVE.md`.

## Palette colori

| Colore | HEX | Uso |
|--------|-----|-----|
| Navy | #1E4D8C | Primario, header, testi principali |
| Lime | #4A7A25 | Volume 1, azioni positive |
| Orange | #E8941C | Volume 2, warning |
| Red | #E54B3D | Volume 3, errori |

Font: Oswald (titoli) + Open Sans (body) + Fira Code (codice)

## Deploy

```bash
# Frontend
npm run build && npx vercel --prod --yes

# Backend Supabase
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref vxvqalmxqtezvgiboxyv
```

## Regole per sviluppatori

Leggi CONTRIBUTING.md per le regole complete. In breve:

1. Mai push su main — sempre branch + Pull Request
2. Mai dati finti — tutto deve funzionare con dati reali
3. Mai emoji nei componenti — usa ElabIcons.jsx
4. Sempre npm run test:ci && npm run build prima di pushare
5. Target: bambini 8-14 — testi semplici, bottoni grandi (44x44px min)
6. WCAG AA: contrasto minimo 4.5:1, font minimo 13px

## Built-bundle smoke test (iter 79 Atom 79.0 — P0 BLOCKER)

```bash
npm run test:build-smoke
```

Compila la build di produzione (`vite build` + obfuscator), avvia `vite preview`
sulla porta 4173, e verifica con Playwright che i 4 route critici (`#compile-home`,
`#lavagna`, `#tutor`, `#dashboard`) renderizzino senza error boundary e senza
eccezioni JavaScript non catturate.

### Quando eseguire

- **OBBLIGATORIO** prima di ogni `git push origin` su branch principali.
- Prima di ogni deploy Vercel (`npx vercel --prod`).
- Dopo modifiche a file in `SKIP_PATTERNS` dentro `vite.config.js`.
- Dopo refactor JSX che usano short-circuit + property access
  (es. `{cond && <>{obj.prop}</>}`).

### Perché esiste

Iter 78 PROD regression (commit `6e639e07`) ha rivelato che il revisore Codex
Pattern V/C sorgente non rileva le regressioni indotte dall'obfuscator perché
il bug compare solo DOPO il passaggio `javascript-obfuscator` (hoisting di
property access fuori dal guard JSX). I test unitari + i test source-level
passano comunque. Solo il rendering del bundle compilato in browser cattura
questa classe di bug.

### Debug failure

Se il comando fallisce:

1. **Identifica il route che ha fallito** nell'output (es. `/#lavagna`).
2. **Leggi pageErrors / consoleErrors** nel messaggio di assertion — contengono
   stack trace troncato delle eccezioni reali.
3. **Riproduci localmente**:
   ```bash
   npm run build && npx vite preview --port 4173
   # poi apri http://localhost:4173/#<route> in Chrome DevTools
   ```
4. **Verifica obfuscation**: se il bug NON si riproduce in `npm run dev` ma SI in
   `npm run build`, è un'interazione con l'obfuscator. Aggiungi il chunk a
   `SKIP_PATTERNS` in `vite.config.js` come hotfix, e refactora il JSX per usare
   optional chaining defensive.
5. **Artifacts** in `results/artifacts-build-smoke/` (screenshot + trace
   Playwright on failure).

### Limitazioni note

- Solo Chromium (Firefox/Webkit fuori scope iter 79). Le regressioni di
  obfuscation sono browser-agnostic, quindi Chromium è sufficiente come
  primo livello di difesa.
- Porta 4173 hardcoded. Liberala prima con
  `lsof -ti:4173 | xargs kill -9 2>/dev/null || true` se necessario.
- Build cache vite (`node_modules/.vite/`) può servire chunk obsoleti in CI —
  pulire con `rm -rf node_modules/.vite dist` per garantire fresh.

## Documentazione approfondita

| Doc | Descrizione |
|-----|-------------|
| [CLAUDE.md](CLAUDE.md) | Contesto Claude Code + regole immutabili |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guida sviluppatori |
| [docs/HISTORY.md](docs/HISTORY.md) | Storia progetto sprint history |
| [docs/sprint-q/SPRINT-Q-HISTORY-COMPREHENSIVE.md](docs/sprint-q/SPRINT-Q-HISTORY-COMPREHENSIVE.md) | Sprint Q dettagliato Q0-Q6 (2026-04-25) |
| [docs/pdr/PDR-MASTER-NEXT-DAYS-2026-04-26.md](docs/pdr/PDR-MASTER-NEXT-DAYS-2026-04-26.md) | PDR Master prossimi giorni |
| [docs/pdr/PDR-MAC-MINI.md](docs/pdr/PDR-MAC-MINI.md) | Setup Mac Mini infrastructure |
| [docs/pdr/PDR-AGENT-ORCHESTRATION.md](docs/pdr/PDR-AGENT-ORCHESTRATION.md) | Multi-agent strategy |
| [docs/handoff/2026-04-26/00-NEXT-SESSION-PROMPT.md](docs/handoff/2026-04-26/00-NEXT-SESSION-PROMPT.md) | Prompt next session + activation string |
| [docs/data/volume-structure.json](docs/data/volume-structure.json) | Schema 35 Cap reali Tresjolie |
| [docs/audits/](docs/audits/) | Audit doc per sprint (Q0-Q6 + storici) |
| [docs/unlim-wiki/](docs/unlim-wiki/) | Wiki LLM L2 (30 concept md) |

## Licenza

Proprietario. Andrea Marro 2026. Tutti i diritti riservati.
