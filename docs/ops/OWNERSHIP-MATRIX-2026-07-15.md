# OWNERSHIP MATRIX — ARDESIA/ELAB — 2026-07-15 (NOTTE-15, PR1)

Matrice file/area → **owner logico** (ruolo, non persona). Serve a: (a) instradare PR e review,
(b) capire chi "possiede" un seam quando due aree si toccano, (c) evitare modifiche fuori
confine (le zone marcate 🔒 hanno guardie automatiche).

Owner logici: **Scene Forge** · **Sim Plugin** · **Shell/UX** · **LessonOS/Dashboard** ·
**Entitlement** · **Arduino** · **Factory** · **QA**.

---

## Scene Forge (fixture, schema scena, bridge, grading visivo)

| Path | Note |
|---|---|
| `apps/studio/sim/elab/elabScene.ts` | schema zod circuit-scene/2 (congelato), read-shim v1→v2 |
| `apps/studio/sim/elab/elabSceneAdapter.ts` | ElabScene → payload sim, fail-closed sui ref |
| `apps/studio/sim/elab/fixtureAdapter.ts` | adapter legacy v1 |
| `apps/studio/src/toolhost/elabSceneBridge.ts` | bridge → SimulationSceneV1; allowlist tipi (:33-40) — chokepoint multi-pin |
| `apps/studio/sim/fixtures/*.json` | fixture scena candidate/verified |
| `apps/studio/sim/breadboard/simulationBreadboard.ts` | geometria griglia, parse ref fori |
| `apps/studio/sim/breadboard/sceneAuthoring.ts` | label italiane fori |
| `apps/studio/sim/visual/structuralGrader.ts` | grading px vs griglia (evidence-only) |
| `apps/studio/scripts/visual-overlay-report.ts` | regen overlay → `docs/ops/overlays/` (drift-guarded) |
| `docs/ops/overlays/` | output overlay committati (report.json drift-guarded da test) |

Seam condivisi: il bridge consegna a **Sim Plugin** (SimulationSceneV1); le fixture citano i
manuali per pagina (nessun contenuto testuale nel repo).

## Sim Plugin (registry, solver, catalogo esperimenti, passo-passo, render post-it)

| Path | Note |
|---|---|
| `apps/studio/src/toolhost/simulationPluginRegistry.ts` | registry deny-by-default |
| `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx` | render SVG post-it + registrazione a module-scope (⚠️ l'import registra: non rimuovere da Room.tsx) |
| `apps/studio/src/toolhost/elabExperimentCatalog.ts` | catalogo onestà (3/88 montati) |
| `apps/studio/src/toolhost/simulationStepMode.ts` | modello passo-passo puro |
| `apps/studio/sim/elab/didacticSteps.ts` | grammatica predicati topologici |
| `apps/studio/sim/solver/elabSolver.ts` | wrapper tipato, ADR-0003 stress LED |
| `apps/studio/sim/solver/catalog.ts` | catalogo elettrico host (incl. potentiometer/rgb-led) |
| `apps/studio/sim/solver/engine/` 🔒 | **VENDORED, byte-identical, sha256 drift-guard — MAI editare** |
| `apps/studio/sim/solver/components/` 🔒 | idem (drift-guard) |

## Shell/UX (router, lavagna, viste, design system, LIM/iPad)

| Path | Note |
|---|---|
| `apps/studio/src/App.tsx` | router ternario `?vista=` |
| `apps/studio/src/Room.tsx` | shell lavagna, toolbar, drawer, mount Excalidraw, branch recap/replay/studente |
| `apps/studio/src/design/ViewNav.tsx` | nav 4 viste (preserva hash room) |
| `apps/studio/src/design/excalidrawConfig.ts` | config Excalidraw canonica (unico punto di modifica) |
| `apps/studio/src/design/ElabLab.tsx` | vista ?vista=elab-lab (mount canvas plugin, montaggio libero) |
| `apps/studio/src/design/EmptyState.tsx` | stati vuoto/errore condivisi (fail-visible) |
| `apps/studio/src/design/icons.tsx` | sistema icone (no emoji-as-icon) |
| `apps/studio/src/tokens.css` | token "carta & inchiostro" + bridge variabili `.excalidraw` (test-enforced) |
| `apps/studio/src/index.css` | layer responsive (breakpoint ≤768px), chrome shell |
| `apps/studio/src/RecapView.tsx` / `src/ReplayView.tsx` | viste recap/replay |
| `apps/studio/src/design/SavedLessonsView.tsx` | vista lezioni salvate |

Seam condivisi: `ElabLab.tsx` monta il canvas di **Arduino** (plugin) via `renderEmbeddable.jsx`;
il fix dei segnaposto neri (token CSS plugin) sta sul confine Shell/UX ↔ Arduino.

## LessonOS / Dashboard (event-log, projector, cruscotto, journal, graph RPC)

| Path | Note |
|---|---|
| `apps/studio/src/lessonos/eventlog.ts` | tassonomia eventi + porta store + EvidenceRef |
| `apps/studio/src/lessonos/indexedDbEventLog.ts` | backend IndexedDB (seq, recovery, JSONL) |
| `apps/studio/src/lessonos/bootstrap.ts` | preflight storage + telemetria data-loss |
| `apps/studio/src/lessonos/teacherDashboardProjection.ts` | projector puro v1 (unico seam derivazione) |
| `apps/studio/src/lessonos/materializer.ts` / `recall.ts` | grafo lezione + neighbors deterministico |
| `apps/studio/src/lessonos/journalBridge.ts` | promozione journal→event-log (idempotente) |
| `apps/studio/src/store/JournalRecorder.ts` | secondo log (journal per-lezione) |
| `apps/studio/src/design/TeacherDashboardView.tsx` | cruscotto ?vista=cruscotto (stats, Z7, ripasso) |
| `apps/studio/src/toolhost/caps/graph.ts` | capability graph.query (read-only, limit 500) |
| `apps/studio/src/toolhost/panelHost.ts` | mount ToolHost del plugin ripasso |

## Entitlement (licenze, token, email, accesso)

| Path | Note |
|---|---|
| `apps/studio/src/entitlements/entitlementCore.ts` | core puro (hash-only, anti-enumeration) |
| `apps/studio/src/entitlements/mailSink.ts` | EmailAdapter + LocalMailSink (provider reale = gate-Andrea) |
| `apps/studio/src/toolhost/caps/storage.ts` | StorageDriverLike — shape store che un backend deve rispettare |
| `plugins/elab-tutor/src/services/licenseService.js` | ⚠️ sistema LEGACY parallelo (n8n/Notion) — da unificare o ritirare |

## Arduino (plugin ELAB, simulatore AVR, compilazione, upload, hex)

| Path | Note |
|---|---|
| `plugins/elab-tutor/src/plugin/renderEmbeddable.jsx` | seam embeddable del plugin nel canvas studio |
| `plugins/elab-tutor/src/components/simulator/canvas/SimulatorCanvas.jsx` | canvas SVG 3149 righe (touch, pinch, zoom) |
| `plugins/elab-tutor/src/components/simulator/components/` | SVG componenti (NanoR4Board, BreadboardFull, …) + registry.js |
| `plugins/elab-tutor/src/components/simulator/engine/AVRBridge.js` / `avrWorker.js` | avr8js wrapper + Worker |
| `plugins/elab-tutor/src/services/inBrowserAvrCompiler.js` | compilatore subset in-browser |
| `plugins/elab-tutor/src/components/lavagna/{WebSerialUploadButton,R4DfuUploadButton,UniversalUploadButton}.jsx` | upload hardware reale |
| `plugins/elab-tutor/public/hex/` | artefatti HEX precompilati (sha256-ancorati via test QA) |
| `plugins/elab-tutor/src/data/experiment-visibility.js` | VISIBLE_EXP_IDS (fonte unica visibilità picker) |
| `plugins/elab-tutor/src/styles/design-system.css` | variabili `--elab-hex-*`/`--color-*` (dipendenza di TUTTI gli SVG) |
| `packs/elab-tutor/` 🔒 | SOLO data+method (zero-tolleranza CI: no shell/auth/dashboard) |
| `plugins/elab-tutor/nanobot/server.py` | backend FastAPI tutor AI (VPS) |
| `plugins/elab-tutor/server/compile-server.js` | micro-server compile remoto (arduino-cli) |

Vincolo repo-wide 🔒: `bin/ci/elab_boundary_gate.py` — la superficie standalone di
plugins/elab-tutor (auth/dashboard/App.jsx) non può crescere vs baseline.

## Factory (manifest, installer, lifecycle, marketplace, authoring)

| Path | Note |
|---|---|
| `apps/studio/src/toolhost-protocol/manifest.ts` | ToolManifestSchema (zod strict, ed25519, integrity) |
| `apps/studio/src/toolhost-protocol/capabilities.ts` | vocabolario capability chiuso |
| `apps/studio/src/toolhost-protocol/messages.ts` | wire schema RPC (graph.*, SDK version) |
| `apps/studio/src/toolhost/installer.ts` | installTool/verifyInstalledTool (fail-closed) |
| `apps/studio/src/toolhost/pluginManager.ts` | unica autorità lifecycle + kill-switch |
| `apps/studio/src/toolhost/marketplace/localCatalog.ts` | catalogo locale + preview pre-install |
| `apps/studio/src/toolhost/authoring/{scaffoldPlugin,packageFile,authoringLint,testHarness}.ts` | authoring end-to-end `.maestrotool` |

## QA (CI, CoV, merge protocol, scanner, e2e)

| Path | Note |
|---|---|
| `bin/monorepo.sh` | runner monorepo (test-core, typecheck-core, build-core, preview-check) |
| `bin/pr-merge-verify.sh` | ciclo merge sicuro (gate CI + verifica post-merge) |
| `bin/ci/nul_scan.py` / `secret_scan.py` / `elab_boundary_gate.py` (+ baseline) | igiene repo |
| `.github/workflows/ci.yml` | job studio/engine/hygiene |
| `.github/workflows/studio-preview-readiness.yml` | gate preview no-deploy |
| `apps/studio/vitest.config.ts` / `playwright.config.ts` | profili test studio |
| `apps/studio/e2e/` | 14+ spec Playwright (locale-first, NON in CI) |
| `apps/studio/src/__tests__/` | 135+ file vitest (incl. drift-guard: VisualOverlayReport, ElabVol3HexTruth) |
| `plugins/elab-tutor/vitest.config.js` / `playwright.config.js` | suite plugin (separata dal gate core) |
| `packages/engine/tests/` + `packages/engine/eval/gate.sh` | pytest engine + eval gate |
| `apps/studio/AGENTS.md` / root `AGENTS.md` | gotcha operativi (tsc -b unica verità typecheck, profilo vitest deterministico) |

---

## Regole trasversali (chi tocca cosa)

1. 🔒 `apps/studio/sim/solver/{engine,components}` — mai editare (sha256 drift-guard).
2. 🔒 `packs/` — solo data+method (gate CI zero-tolleranza).
3. Modifiche Excalidraw SOLO via `design/excalidrawConfig.ts` + `tokens.css` (test verbatim).
4. Nuovi esperimenti visibili SOLO via `experiment-visibility.js` (VISIBLE_EXP_IDS).
5. Nuovi hex SOLO con ancora sha256 nel pattern `ElabVol3HexTruth.test.ts`.
6. Ogni derivazione cruscotto passa dal projector puro (`teacherDashboardProjection.ts`) — mai leggere lo store direttamente dalle viste.
7. Cross-area: chi apre un seam (es. bridge multi-pin) coinvolge entrambi gli owner (Scene Forge + Sim Plugin).
