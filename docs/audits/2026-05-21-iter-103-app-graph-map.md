# Mappa grafo applicazione — ELAB Tutor (iter 103 prep)

**Data:** 2026-05-21 · **Tipo:** mappa read-only multi-prospettiva · **Repo:** elab-builder.
React 19 + Vite 7, 76 CSS / 190 JSX / 135 JS in `src/`.

## 1. Grafo routing

Router: `src/App.jsx`. Routing custom a hash via `useState` + `window.location.hash` (NO react-router).

| Hash | Componente | Note |
|------|-----------|------|
| `#home` (default) | `HomePage` | gestisce sottorotte chatbot-only / about-easter / glossario / **compile-home** |
| `#tutor` | `LavagnaShell` | **REDIRECT** → `#lavagna` (App.jsx:229-234). Righe 251-313 = **DEAD CODE** |
| `#lavagna` / `#lavagna-solo` | `LavagnaShell` | workspace principale |
| `#admin` `#teacher` `#dashboard` `#dashboard-v2` | lazy panels | — |
| `#vetrina` `#vetrina2` `#showcase` `#login` `#register` | lazy | — |
| `#prova` | `ElabTutorV4` | god component legacy 2552 righe — vivo solo qui |
| `/privacy` `/data-deletion` `/scuole/*` | pathname route | — |

## 2. God components

| File | Righe | Responsabilità |
|------|-------|----------------|
| `simulator/canvas/SimulatorCanvas.jsx` | 2917 | canvas SVG, zoom/pan/drag, 21 tipi componente, wire, hit-test |
| `tutor/ElabTutorV4.jsx` | 2552 | shell legacy — **vivo solo in `#prova`** (path morto) |
| `lavagna/LavagnaShell.jsx` | 1641 | god-shell corrente |
| `services/api.js` | 1335 | TUTTE le chiamate HTTP esterne |
| `lavagna/useGalileoChat.js` | 1285 | logica chat UNLIM (state, RAG, intent, TTS) |

Albero `#lavagna`: `LavagnaShell` → `AppHeader` + `NewElabSimulator` (→ `ExperimentPicker`,
`ComponentPalette`, `SimulatorCanvas`, `CircuitSolver`, `AVRBridge`, `ScratchCompileBar`→`IdeShell`,
`SerialMonitor`) + `FloatingToolbar` + `UnlimAdapter`→`ChatOverlay`→`useGalileoChat` +
`RetractablePanel` + `VideoFloat` + `MascotPresence`.

## 3. Grafo dati/stato

- **Nessun context globale.** Lo stato fluisce via props o via singleton `window.__ELAB_API`.
- **Singleton `window.__ELAB_API`** — creato in `services/simulator-api.js`. Hub pub/sub
  che ponte simulator ↔ UNLIM ↔ LavagnaShell. Nessun tipo TS, nessuna validazione di shape.
- **localStorage keys:** `elab_anon_uuid`, `elab_consent_given`, `elab.ide.mode`,
  `elab_class_key`, `elab_lavagna_active_tab`, `unlim_rate_limit_*`, `elab_session_*`.
- **Flusso:** azione utente → `SimulatorCanvas` → `__ELAB_API.emit` → `useGalileoChat`
  (circuitContext nel prompt) → `api.js sendChat` → Edge `unlim-chat` → INTENT parse →
  `intentsDispatcher.js` → `__ELAB_API.emit` (ritorno al simulatore).

## 4. Service layer (`src/services/`, 50 file)

`api.js` (HTTP) · `simulator-api.js` (singleton) · `percorsoService.js` (factory capitoli) ·
`fumettoService.js` (validator + pilot — **client-only**) · `sessionTracker.js` ·
`nudgeService.js` · `ragService.js` (BM25+dense locale, 549 chunk) · `audioService.js` (TTS) ·
`classProfile.js` (identità classe/Morfismo) · `experimentNarrativeService.js` (**DEAD**).

## 5. Grafo backend

**Supabase Edge Functions:** `unlim-chat` (pipeline: rate-limit → consent → RAG →
classifier Onniscenza → Vertex Gemini 2.5 Flash-Lite EU Frankfurt → INTENT parse → PZ V3) ·
`unlim-diagnose` · `unlim-hints` · `unlim-tts` (Voxtral) · `unlim-gdpr` · `compile-proxy`
(legacy n8n, **solo AVR**). **NON esiste `unlim-fumetto`.**

**Vercel serverless (`api/`):** `compile/nanor4.js` (proxy sicuro → Render Cloud Compile,
inietta key server-side, FQBN `arduino:renesas_uno:nanor4`) · `compile/proxy.js` (legacy n8n) ·
`warmup.js` · `rate-limit.js`.

> **Nota onesta:** il commento in `api/compile/nanor4.js:28-37` dice "503 finché Render non
> deployato" — è **stale**. iter-102 ha verificato LIVE che `/api/compile/nanor4` ritorna
> HTTP 200 con hex reale (Codex ha deployato Render a iter-101). La cross-compilazione
> **funziona in produzione**. Resta il bug `flashPercent` (repo Render) + latenza 36s.

## 6. Build/deploy

`vite.config.js` (293 righe) — React 19 + Vite 7. Obfuscator RC4+CFG con `SKIP_PATTERNS`
(esclude react-vendor, react-pdf, codemirror, ScratchEditor, ecc.). PWA `registerType:'prompt'`,
27 precache ~1952 KiB, `globPatterns` include `ScratchEditor-*.js` (offline Blockly iter 81).
**tsconfig cancellato (iter 88)** — `IdeShell.tsx` è l'unico `.tsx`, compila via esbuild
passthrough **senza type checking**. Deploy: Vercel (frontend) + Supabase (backend).

## 7. Feature → file map (4 thread)

**(a) Cross-compile NanoR4 / Blockly:** `home/HomeCompileEntry.jsx` · `ide/IdeShell.tsx`
(Blockly + CodeMirror, `__ELAB_IDE_SYNC__`) · `ide/ScratchCompileBar.jsx` ·
`ide/CompileUploadButton.jsx` · `api/compile/nanor4.js` · `api.js:compileCode()` (chain:
agent localhost:8765 → nanor4 proxy → compile-proxy → n8n) · `infra/cloud-compile/` (Render).

**(b) Percorso morfico / experiment overhaul:** `data/experiments-vol{1,2,3}.js` ·
`data/lesson-paths/` (79 JSON) · `data/capitoli/` (35 JSON) · `services/percorsoService.js` ·
`lavagna/PercorsoCapitoloView.jsx` · `adapters/percorsoMorphicAdapter.js` · `classProfile.js`.

**(c) UNLIM:** `useGalileoChat.js` · `unlim/ChatOverlay.jsx` · `unlim/MascotPresence.jsx` ·
`unlim/UnlimAdapter.jsx` · `unlim/intentsDispatcher.js` · `api.js:sendChat()` ·
`unlim-chat/index.ts` · `_shared/operational-response.ts` · `ragService.js`.

**(d) Fumetto:** `fumettoService.js` (validator + pilot) · `lavagna/FumettoPanel.jsx` ·
`lavagna/FumettoGenerator.jsx`. **Backend assente** — nessuna Edge Function.

## 8. Hotspot di rischio (input per il piano)

| Rischio | Severità | Dettaglio | Sprint |
|---------|----------|-----------|--------|
| **Import cross-runtime** | ALTA | `useGalileoChat.js` importa `operational-response.ts` (Deno TS) dentro React browser. Funziona via esbuild MA fragile se il file usa API Deno. | C/E |
| **Fumetto backend assente** | ALTA | `fumettoService.js` ha pilot client-side ma 0 Edge Function. Feature stub-complete lato client, backend mancante. | D |
| **`IdeShell.tsx` senza type-check** | Media | unico `.tsx`, tsconfig cancellato iter 88 → errori di tipo silenziosi. | B/E |
| **Dead code** | Bassa | `experimentNarrativeService.js`; `ElabTutorV4.jsx` 2552 righe vivo solo in `#prova`; `App.jsx:251-313`. | E |
| **`api.js` concentrazione import** | Media | importato da 7+ moduli — un break a cascata ovunque. | refactor futuro |
| **`__ELAB_API` senza tipi** | Media | accoppiamento runtime senza validazione shape. | refactor futuro |
| **Morfismo 3-way coupling** | Media | `percorsoMorphicAdapter` + `classProfile` + `experiments-vol*` — cambiarne uno rompe gli altri, no type safety. | C |

## 9. File essenziali

`App.jsx` · `LavagnaShell.jsx` · `useGalileoChat.js` · `api.js` · `simulator-api.js` ·
`unlim-chat/index.ts` · `NewElabSimulator.jsx` · `SimulatorCanvas.jsx` · `api/compile/nanor4.js` ·
`vite.config.js` · `IdeShell.tsx` · `percorsoMorphicAdapter.js`.
