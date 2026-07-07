# PRODUCT READINESS AUDIT — ARDESIA/ELAB — 2026-07-15 (NOTTE-15, PR1)

Baseline verificata (firsthand, sessione NOTTE-15): `main 755179c8`, `tsc -b` 0 errori,
vitest **1276 pass / 5 skip** (profilo deterministico), pytest engine **2044 pass / 7 skip**,
`vite build` 0 errori. Audit condotto su worktree pulita da `origin/main` (755179c8).

Metodo: 7 mappe di sottosistema (agent paralleli, read-only, stessa commit) + **20 claim
chiave ri-verificati firsthand** (Read/grep in worktree pulita) prima della scrittura.
Ogni finding cita `file:line` reali. Nessun contenuto testuale dei volumi (solo path/pagina/hash).

Severità (lente prodotto):
- **P0** — blocca un flusso utente pagante o rompe la demo visibile.
- **P1** — pilastro mancante/degradato con workaround; danneggia la promessa di prodotto.
- **P2** — debito/polish; non blocca il flusso ma va tracciato.

---

## 1. Stato per area

### 1.1 Lavagna (whiteboard shell)

Stato: **funzionante e curata** — è la parte più matura del prodotto.

- Excalidraw ^0.18.1 montato con config canonica unica (`apps/studio/src/design/excalidrawConfig.ts:8-31`):
  it-IT, tema chiaro fisso, AI off, canvasActions ridotte, tool immagine off. Bridge token CSS
  in `apps/studio/src/tokens.css:35-43`.
- Router senza react-router: catena ternaria su `?vista=` (`apps/studio/src/App.tsx:25-31`),
  nav a 4 viste (`apps/studio/src/design/ViewNav.tsx:9-31`), hash = room id.
- Recap (`apps/studio/src/RecapView.tsx:35`) e Replay scrubbable con audio WebM
  (`apps/studio/src/ReplayView.tsx:28`) esistono e sono raggiungibili da `?vista=`.
- **[P1] Toolbar Excalidraw stock, zero tuning LIM**: nessuna config zoom/pinch, nessuna
  "toolbar morfica" del canone design (`excalidrawConfig.ts:8-31`; `Room.tsx:807-897` personalizza
  solo MainMenu/WelcomeScreen).
- **[P1] Touch target sotto i 44px**: `.st-ghost` padding 6px 13px ≈ 29px di altezza
  (`apps/studio/src/index.css:106-109`); solo i bottoni zoom del canvas plugin rispettano 44px.
- **[P2] Glifi hamburger come testo** `✕`/`☰` invece del sistema icone (`apps/studio/src/Room.tsx:684`).
- **[P2] Commento toolbar stantio**: dice "Catalogo scene montate (2/88)" ma le montate sono 3
  (`apps/studio/src/Room.tsx:698-699` vs `apps/studio/src/toolhost/elabExperimentCatalog.ts:40,55,74`).

### 1.2 Simulation Plugin (registry, solver, catalogo, passo-passo)

Stato: **solido sul solve, stretto sul catalogo**.

- Registry deny-by-default (`apps/studio/src/toolhost/simulationPluginRegistry.ts:52-62`);
  registrazione a module-scope in `ToolCanvasEmbeddable.tsx` (gotcha noto: l'import È la registrazione).
- Solver wrapper fail-closed su tipi non a catalogo (`apps/studio/sim/solver/elabSolver.ts:155-168`);
  ADR-0003 stress LED a 4 zone; doppio golden deliberato 15.3 mA engine vs 14.9 mA UI
  (`apps/studio/src/__tests__/ElabSolver.test.ts:1-20`).
- **Sblocco multi-pin NOTTE-13 verificato**: potentiometer (vcc/signal/gnd) e rgb-led
  (red/common/green/blue) registrati a catalogo (`apps/studio/sim/solver/catalog.ts:110-138`),
  con suite di falsificazione esp6 (`apps/studio/src/__tests__/ElabSolverEsp6Rgb.test.ts`).
- **[P1] Catalogo onesto ma minuscolo**: `ELAB_CORPUS_TOTAL = 88`, montati **3**
  (v1-cap6-esp1/2/3, tutti `sceneStatus: "candidate"`) (`elabExperimentCatalog.ts:29,40,55,74`).
  v1-cap9-esp6 è **solve-only** (ElabLab via URL): nessuna fixture scena, nessun post-it, nessun passo-passo.
- **[P1] Passo-passo solo per esp1/esp2**: la grammatica dei predicati è solo topologica —
  esp3 ("cambia resistenza 470→220") è inesprimibile, `passoPasso:false` onesto
  (`apps/studio/src/toolhost/simulationStepMode.ts:40-124`; `apps/studio/sim/elab/didacticSteps.ts:50-57`).
- **[P2] `buildSimulationInsert` hard-coda i 3 rami esperimento invece di derivare dal catalogo
  (`apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:488-549`).

### 1.3 Scene pipeline (bridge, renderer, multi-pin)

Stato: **fail-closed corretto, ma il multi-pin è bloccato a valle del solver**.

- Pipeline: fixture circuit-scene/2 → zod (`apps/studio/sim/elab/elabScene.ts:100-142`) →
  adapter fail-closed su ref irrisolvibili (`apps/studio/sim/elab/elabSceneAdapter.ts:131-168`) →
  bridge → SimulationSceneV1.
- **[P1] Due throw distinti bloccano pot/rgb-led nel bridge**: allowlist COMPONENT_TYPES
  (`apps/studio/src/toolhost/elabSceneBridge.ts:33-40`, throw a `:111-112`) e guard
  "scena non battery-led" (`:138`). Il solver è già pronto (catalog.ts:110-138) — il collo è qui.
- **[P1] Nessun renderer SVG per pot/rgb-led**; ResistorSvg/LedSvg hard-codano id `r1`/`led1`
  e geometria 2-pin (`apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:41,1253,1285`).
- **[P2] `fromCircuitSceneV1` shim throws su connections v1 con waypoints (migrazione non implementata)
  (`apps/studio/sim/elab/elabScene.ts:266-270`).
- Grader strutturale con evidenza px vs griglia (`apps/studio/sim/visual/structuralGrader.ts:62-193`);
  `visualMatch` resta onestamente "unknown".

### 1.4 ELABTutor (plugin + catena Arduino)

Stato: **contenuto ricco, visibilità congelata, catena Arduino a due velocità**.

- `VISIBLE_EXP_IDS` = **8 esperimenti visibili su 94** (selezione Andrea 25/05/2026), con
  `RESTORE_ALL` documentato per rollback (`plugins/elab-tutor/src/data/experiment-visibility.js:46-58,101`).
- `packs/elab-tutor` = solo data+method (88 lesson-path, volume-references), zero-tolleranza CI su `packs/`.
- Compilatore in-browser: subset limitato a `pinMode/digitalWrite/delay/const-int`
  (`plugins/elab-tutor/src/services/inBrowserAvrCompiler.js:10-16`); tutto il resto (Serial, analogRead/Write,
  tone, loop runtime) richiede la catena di compilazione remota (rete).
- avr8js con Worker + fallback main-thread (`plugins/elab-tutor/src/components/simulator/engine/AVRBridge.js`);
  upload reale WebSerial stk500v1 (AVR) e WebUSB DFU (Nano R4/RA4M1) con dispatcher per board.
- **[P1] esp5 (semaforo) in quarantena**: `hexFile` dichiarato ma file ASSENTE — 13 hex in
  `plugins/elab-tutor/public/hex/` e `v3-cap6-esp5.hex` non esiste; quarantena caratterizzata dal
  test verità (`apps/studio/src/__tests__/ElabVol3HexTruth.test.ts:9-12`). esp4 sha256-ancorato.
- **[P2] elab-tutor stesso non passa dalla pipeline manifest firmata**: è first-party via
  `plugins/elab-tutor/src/plugin/renderEmbeddable.jsx` (accettabile, ma va dichiarato).

### 1.5 Dashboard docente (cruscotto + LessonOS event-log)

Stato: **architettura giusta, cruscotto vivo ma vuoto di dati reali**.

- Event-log append-only con EvidenceRef obbligatorio (`apps/studio/src/lessonos/eventlog.ts:45-122`),
  IndexedDB con seq espliciti/recovery/export JSONL (`apps/studio/src/lessonos/indexedDbEventLog.ts:63-293`),
  projector puro v1 (`apps/studio/src/lessonos/teacherDashboardProjection.ts:8-67`).
- Ripasso su ToolHost reale con capability `graph.query` e audit log
  (`apps/studio/src/toolhost/panelHost.ts:1-50`; `apps/studio/src/toolhost/caps/graph.ts:45-83`).
- **[P0] Nessun producer di `lesson.started`/`lesson.ended` nell'app**: esistono solo commenti
  stand-in (`apps/studio/src/Room.tsx:458,819-820`) e i test. Conseguenza live: `lessons.count=0`,
  conteggi journal-derivati=0, Z7 `fromRoom` sempre "fuori lezione"
  (`apps/studio/src/design/TeacherDashboardView.tsx:330`).
- **[P0] Il cruscotto non passa `journalEvents`/`focusNodeId` al projector** — chiama
  `projectTeacherDashboard` con soli `lessonEvents/teacherId/locale/generatedAt`
  (`TeacherDashboardView.tsx:126-133`): stats a zero e graphView sempre vuota nel live.
- **[P1] Zone Z3–Z6/Z10–Z12 dichiarate `unavailable` dal projector stesso
  (`teacherDashboardProjection.ts:416-424`); renderizzate solo stats + coda Z7 + ripasso.
- **[P2] Zero librerie chart (numeri `<strong>` puri); zona ripasso render-once statica
  (`TeacherDashboardView.tsx:101-123`).

### 1.6 Entitlement (monetizzazione Tutor 15€/mese)

Stato: **core crittografico pronto, prodotto NON collegato — la monetizzazione oggi non è esercitabile**.

- Core puro e ben fatto: licenza `ELAB-XXXX-…` hash-only, redeem one-time constant-time,
  token email 128-bit TTL 15 min, sessione anti-fixation, errore uniforme anti-enumeration
  (`apps/studio/src/entitlements/entitlementCore.ts:28-282`).
- **[P0] Zero consumer di prodotto**: gli unici riferimenti a `redeemLicenseKey/issueAccessToken/checkAccess`
  nell'intero repo sono il core e il suo unit test (`apps/studio/src/__tests__/EntitlementCore.test.ts`).
  Nessuna UI, nessuna route, nessun gate su feature.
- **[P0] Nessuna autorità server**: `registerLicenseKey` scrive nello stesso store locale da cui il
  client fa redeem — il trust boundary non esiste (`entitlementCore.ts:130-146`, nessuna chiamata remota).
- **[P1] Nessun provider email reale** — solo `LocalMailSink`; provider vero esplicitamente
  gate-Andrea (`apps/studio/src/entitlements/mailSink.ts:3-6,24-30`).
- **[P1] Due sistemi licenza scollegati**: entitlementCore (studio) vs legacy
  `plugins/elab-tutor/src/services/licenseService.js:14,87,163` (webhook n8n→Notion, azioni
  verify/release). Nessun modello condiviso.
- **[P2] Zero codice pagamenti** (Stripe solo in doc di pricing e come pattern nello scanner segreti).

### 1.7 Arduino (dettaglio operativo)

Vedi §1.4. Sintesi: simulazione avr8js e upload hardware reali sono presenti e ben strutturati;
i limiti sono di copertura (subset compilatore, esp5 assente) — non di architettura. Le verità hex
sono sha256-ancorate (`ElabVol3HexTruth.test.ts:42-49`): pattern giusto da estendere a ogni nuovo hex.

### 1.8 Plugin factory (manifest, installer, marketplace, authoring)

Stato: **pipeline completa e fail-closed; distribuzione limitata al file locale**.

- Manifest zod strict con ed25519 + `integrity.bundleSha256` (`apps/studio/src/toolhost-protocol/manifest.ts:31`);
  vocabolario capability chiuso deny-by-default (`toolhost-protocol/capabilities.ts:7`).
- `installTool` verifica firma sui byte ORIGINALI, kill-list, hash bundle pre-write con rollback
  (`apps/studio/src/toolhost/installer.ts:133`); `PluginManager` unica autorità lifecycle con
  kill-switch overlay (`apps/studio/src/toolhost/pluginManager.ts:58`).
- Authoring end-to-end: scaffold firmato → `.maestrotool` → install via pipeline REALE, nessun
  canale privilegiato (`apps/studio/src/toolhost/authoring/scaffoldPlugin.ts:242`;
  `authoring/packageFile.ts:36,91`).
- **[P1] Catena di trust auto-referenziale** (pubkey nel manifest stesso): riscrittura coerente
  manifest+install.json non rilevabile senza trust anchor esterno — limite DICHIARATO nel codice
  (`installer.ts:314-319`). Accettabile per locale-first, gate per marketplace remoto.
- **[P2] Nessun marketplace remoto** (by design oggi): catalogo = soli tool installati nel workspace
  (`apps/studio/src/toolhost/marketplace/localCatalog.ts:49,149`).

### 1.9 CI / CoV

Stato: **gate core solidi; e2e fuori CI; niente scanner PII**.

- CI 3 job: studio (typecheck → vitest deterministico → build, `.github/workflows/ci.yml:13-33`),
  engine (pytest, `:35-45`), hygiene (nul_scan, secret_scan, elab_boundary_gate, `:47-59`).
- Merge protocol codificato: `bin/pr-merge-verify.sh` (gate CI all-pass + MERGEABLE/CLEAN +
  merge-commit + suite completa post-merge su origin/main detached, `:1-30`).
- **[P1] Playwright NON gira in CI** ("Locale-first: nessun job CI aggiunto qui",
  `apps/studio/playwright.config.ts:3`): le regressioni e2e emergono solo in locale.
- **[P1] Rosso e2e noto pre-esistente**: `montaggio-canvas.spec.ts:51` (click bb1:i9 intercettato
  dal canvas Excalidraw, da NOTTE-10) + flake noto `Welcome.test.tsx:13-15` sotto carico.
- **[P2] Nessuno scanner PII dedicato**: `bin/ci/` contiene solo nul_scan.py, secret_scan.py,
  elab_boundary_gate.py + baseline (ls verificato) — la regola no-PII è convenzione.
- **[P2] `tsx` non è devDependency dichiarata di apps/studio; la regen overlay dipende da npx ad hoc.

### 1.10 UI LIM / iPad

Stato: **desktop-first; la LIM è la persona target ma non è servita**.

- **[P0] SEGNAPOSTO NERI in ElabLab (root cause verificata)**: gli SVG del plugin usano
  `var(--elab-hex-*)` SENZA fallback (81 occorrenze nel solo `NanoR4Board.jsx`, conteggio verificato);
  le variabili vivono solo in `plugins/elab-tutor/src/styles/design-system.css:343+`;
  né `renderEmbeddable.jsx` (import verificati: solo react-dom + SimulatorCanvas) né lo studio host
  (`apps/studio/src/main.tsx:3` importa solo `./index.css`) le caricano → `var()` irrisolta in
  fill SVG = fill nero. Ogni board/componente in ElabLab è una silhouette nera.
  Fix seam: importare (o estrarre) i token dal `renderEmbeddable.jsx`.
- **[P0] Montaggio libero solo da tastiera**: il docente deve DIGITARE `led2:anode` / `bb1:a1`
  in input `size={7}`/`size={12}` (`apps/studio/src/design/ElabLab.tsx:445,452,523,530`).
  Zero drag/touch: inutilizzabile su LIM.
- **[P1] Pannello ElabLab fisso 360px assoluto senza breakpoint** (`apps/studio/src/index.css:406-410`);
  nessuno dei tre blocchi `@media (max-width:768px)` (`:332,371,520`) lo tocca: su iPad portrait
  copre metà canvas, su phone quasi tutto.
- **[P1] Header ElabLab senza gestione mobile** (picker clippato da `.st-bar` overflow:hidden ≤768px,
  `ElabLab.tsx:266-307` + `index.css:367`); nessun error boundary/loading per il mount del canvas
  plugin (`ElabLab.tsx:246-251,319`).
- **[P1] Due simulatori visivamente diversi per lo stesso esperimento** (post-it board = SVG studio,
  ElabLab = SimulatorCanvas plugin) — due linguaggi visivi (`ToolCanvasEmbeddable.tsx:489-520` vs
  `ElabLab.tsx:249`).
- **[P2] Copertura viewport test: solo desktop default e 390x844; nessun iPad/LIM/4K in alcuna spec
  (`apps/studio/e2e/sim-passo-passo.spec.ts:73`; `sim-esp2-senza-resistore.spec.ts:47`).

---

## 2. Flussi utente end-to-end (oggi, evidenza alla mano)

### 2.1 Studente (gratuito)

| Passo | Stato | Evidenza |
|---|---|---|
| Apre lavagna condivisa in sola lettura | ✅ funziona | `Room.tsx` view studente read-only (`?vista=studente`) |
| Vede post-it simulazione esp1/2/3 su lavagna | ✅ funziona | `ToolCanvasEmbeddable.tsx:488-549`, golden 14.9 mA |
| Apre ElabLab e sceglie tra gli 8 esperimenti visibili | ⚠️ degradato | picker ok (`ElabLab.tsx:276-301`) ma **canvas plugin nero** (§1.10 P0) |
| Segue il passo-passo | ⚠️ parziale | solo esp1/esp2 (`simulationStepMode.ts:43-47`) |
| Prova esp6 (lampada RGB) | ⚠️ solve-only | numeri sì, scena no (`elabExperimentCatalog.ts` senza esp6) |

**Si rompe a**: resa visiva del canvas plugin (nero) e montaggio libero digitato.

### 2.2 Tutor (15€/mese)

| Passo | Stato | Evidenza |
|---|---|---|
| Paga/attiva la licenza | ❌ **impossibile** | zero consumer entitlement, zero pagamenti (§1.6 P0) |
| Fa lezione su lavagna (ink, PDF cite, sim, export .lesson) | ✅ funziona | Room.tsx + JournalRecorder + promoteJournalToLessonOs (`Room.tsx:427-451`) |
| Rivede la lezione (recap/replay) | ✅ funziona | `RecapView.tsx:35`, `ReplayView.tsx:28` |
| Apre il cruscotto e vede statistiche | ❌ **zeri** | nessun lesson.started producer + projector senza journalEvents (§1.5 P0×2) |
| Genera student-pack dalla coda errori | ⚠️ parziale | Z7 funziona SE esistono `error.observed` (bus plugin), ma `fromRoom` sempre "fuori lezione" (`TeacherDashboardView.tsx:330`) |
| Riceve token di accesso via email | ❌ solo LocalMailSink | `mailSink.ts:3-6` |

**Si rompe a**: monetizzazione (non esiste il percorso) e valore-dati del cruscotto (vuoto).

### 2.3 Scuola

| Passo | Stato | Evidenza |
|---|---|---|
| Scope scuola/classe modellato | ✅ nel core | `EntitlementScope {schoolId, classId, featureLookupKey}` (`entitlementCore.ts:44-48`) |
| Acquisto/attivazione multi-classe | ❌ non esiste | nessuna autorità server, nessuna UI (§1.6) |
| Revoca/gestione licenze | ⚠️ core-only | `revokeEntitlement` esiste, mai chiamato dal prodotto |
| Garanzie dati (no-PII) | ⚠️ convenzione | nessuno scanner PII in `bin/ci/` (ls verificato); event-log evita PII by design |

**Si rompe a**: tutto ciò che sta sopra il core crittografico.

---

## 3. TOP 10 GAP (ordinati per impatto prodotto)

| # | Sev | Gap | Evidenza chiave |
|---|---|---|---|
| 1 | P0 | **Monetizzazione non esercitabile**: entitlementCore senza UI/route/autorità server; email solo sink locale; sistema legacy n8n scollegato | `entitlementCore.ts:130-146`; grep consumer = solo test; `mailSink.ts:3-6`; `licenseService.js:14` |
| 2 | P0 | **Canvas plugin nero in ElabLab** (var `--elab-hex-*` mai caricate nell'host) — la demo core è visivamente rotta | 81 hit `var(--elab-hex` in NanoR4Board.jsx; `design-system.css:343`; `renderEmbeddable.jsx:4-5`; `main.tsx:3` |
| 3 | P0 | **Cruscotto docente a zero**: nessun producer lesson.started/ended + projector mai alimentato con journalEvents/focusNodeId | `Room.tsx:458,819-820`; `TeacherDashboardView.tsx:126-133,330` |
| 4 | P0 | **Montaggio libero non touch** (pin/fori digitati in input testo): inutilizzabile su LIM, la persona target | `ElabLab.tsx:445,452,523,530` |
| 5 | P1 | **Copertura contenuto minima**: 3 scene montate su 88 (esp6 solve-only); 8 esperimenti visibili su 94 | `elabExperimentCatalog.ts:29,40-78`; `experiment-visibility.js:46-58` |
| 6 | P1 | **Multi-pin bloccato a valle del solver**: 2 throw nel bridge + nessun renderer pot/rgb-led (solver già pronto) | `elabSceneBridge.ts:33-40,111-112,138`; `catalog.ts:110-138`; `ToolCanvasEmbeddable.tsx:41` |
| 7 | P1 | **Responsive iPad/LIM assente dove serve**: pannello 360px fisso, header ElabLab clippato, touch target 29px, nessun test viewport iPad/LIM | `index.css:406-410,106-109,367`; e2e solo 390x844 |
| 8 | P1 | **e2e fuori CI + rosso noto + flake noto**: regressioni di superficie invisibili al gate | `playwright.config.ts:3`; `montaggio-canvas.spec.ts:51`; `Welcome.test.tsx:13-15` |
| 9 | P1 | **Due simulatori visivi per lo stesso esperimento** (post-it board vs ElabLab): incoerenza di linguaggio e doppio costo manutenzione | `ToolCanvasEmbeddable.tsx:489-520` vs `ElabLab.tsx:249` |
| 10 | P1 | **Trust chain plugin auto-referenziale** (limite dichiarato): ok locale-first, gate bloccante per qualunque distribuzione remota | `installer.ts:314-319`; `localCatalog.ts:49` |

Menzioni P2 (tracciate, non in top-10): esp5 hex assente-quarantenato (`ElabVol3HexTruth.test.ts:9-12`),
subset compilatore in-browser (`inBrowserAvrCompiler.js:10-16`), niente scanner PII (`bin/ci/`),
commento "2/88" stantio (`Room.tsx:698-699`), `tsx` non dichiarata, glifi testo `✕/☰` (`Room.tsx:684`).

---

## 4. Nota di onestà

Questo audit riporta SOLO claim verificati firsthand su worktree pulita a `755179c8`.
Nessun claim su metriche di qualità AI (recall/moat) è incluso né implicato.
I numeri di baseline (1276/5, 2044/7) sono quelli della verifica di sessione NOTTE-15 e
coincidono con l'atteso del handoff (`docs/ops/PROMPT-NEXT-FABLE-2026-07-15-NOTTE13.md:16`, "~1276/5").
