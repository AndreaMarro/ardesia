# ELAB Tutor — Bug List Completa (Mega Bug Hunt)

> Data: 04/04/2026 | Sessione: Ralph Loop 7 iterazioni
> Build: 1430/1430 test PASS | Build PASS | 30 precache (2397 KiB)

---

## BUG FIXATI (26 totali)

| # | Bug | File | Tipo |
|---|-----|------|------|
| 1 | 20 layout Vol3 mancanti | experiments-vol3.js | Data |
| 2 | 2 layout Vol1 incompleti | experiments-vol1.js | Data |
| 3 | 9 layout Vol2 mancanti | experiments-vol2.js | Data |
| 4 | 9 esperimenti Vol2 campi pedagogici | experiments-vol2.js | Data |
| 5 | 3 test falliti | tests/ | Test |
| 6 | Touch target VolumeViewer 36->44px | VolumeViewer.module.css | WCAG |
| 7 | Touch target ScratchEditor 32->44px | ScratchEditor.jsx | WCAG |
| 8 | color-sim-text-muted #767676->#666666 | design-system.css | WCAG |
| 9 | color-text-secondary alla fonte | design-system.css | WCAG |
| 10 | color-text-tertiary alla fonte | design-system.css | WCAG |
| 11 | SafeMarkdown CSS fallbacks | SafeMarkdown.jsx | Resilienza |
| 12 | Font preload hints | index.html | Performance |
| 13 | Capacitor clipPath fuori conditional | Capacitor.jsx | Performance |
| 14 | Prototype pollution guard | ElabTutorV4.jsx | Sicurezza |
| 15 | ChatOverlay keyframes->CSS module | ChatOverlay.jsx/.css | Performance |
| 16 | .gitignore audit screenshots | .gitignore | Pulizia |
| 17 | 4 console.log->logger | 3 file | Pulizia |
| 18 | **77 font < 14px fixati** | 15+ file CSS/JSX | WCAG |
| 19 | **ChatOverlay 1768->77KB** | vite.config.js manualChunks | Performance |
| 20 | **index-app 1306->403KB** | vite.config.js manualChunks | Performance |
| 21 | **Chunks >1MB da 5 a 3** | vite.config.js | Performance |
| 22 | Animation timer cleanup | gamificationService.js | Memory |
| 23 | Sitemap dinamico 17 URL | public/sitemap.xml | SEO |
| 24 | Copyright comments sparsi rimossi | experiments-vol2/3.js | Pulizia |
| 25 | beforeunload pre-serialized + 30s auto-save | unlimMemory.js | Affidabilita |
| 26 | Precache 3535->2397 KiB (-32%) | vite.config.js | Performance |

## FALSE POSITIVE VERIFICATI (6)

| # | Bug segnalato | Verifica | Risultato |
|---|---------------|----------|-----------|
| 1 | Timer leak supabaseSync | stopSyncInterval() in cleanup | NON un leak |
| 2 | Timer leak voiceService | clearTimeout in finally | NON un leak |
| 3 | Timer leak nudgeService | clearInterval in teardown | NON un leak |
| 4 | INTENT JSON parsing | try/catch wrappato | NON un bug |
| 5 | v1-cap13-esp2 pinAssignments | Gia presenti | NON mancanti |
| 6 | SVG gradient IDs | Gia usa useId() | NON collision |

## BUG APERTI RESIDUI (3 architetturali)

| # | Bug | Perche non fixabile in bug hunt |
|---|-----|---------------------------------|
| 1 | Supabase Auth flow mancante | Design gap: chiave docente non mappa su Supabase Auth. Serve decisione architetturale. |
| 2 | CSP unsafe-inline per style-src | Richiesto da 1900+ inline styles React. Rimozione rompe tutta l'app. |
| 3 | 48 useEffect in NewElabSimulator | Refactoring 1900 righe con rischio regressioni massicce. Non una sessione. |

## BUG FIXATI — Sessione Post-PDR 2 (04/04/2026)

| # | Bug | File | Tipo |
|---|-----|------|------|
| 27 | **MASTER_TIMEOUT 10s→30s** | api.js | UNLIM timeout su Render cold start |

## BUG APERTI — Aggiornati Post-PDR 2

| # | Bug | Note |
|---|-----|------|
| 1 | Hooks order violation NewElabSimulator | Dev-only (HMR). Pos 249: useCallback→useRef. ErrorBoundary catch. Produzione OK. |
| 2 | Nanobot 500 su circuitState complesso | Scenario 8: oggetto JSON grosso causa Internal Server Error |
| 3 | UNLIM hallucina su input invalidi | Scenari 26-28: no guardrail per esperimenti inesistenti o input vuoti |
| 4 | Supabase 401 da frontend | class_key null se utente non ha fatto login. Non un bug di codice. |

---

## RIEPILOGO FINALE

| Severita | Trovati | Fixati | False Positive | Aperti |
|----------|---------|--------|----------------|--------|
| P0 | 2 | 0 | 0 | 1 (auth) |
| P1 | 20 | 15 | 4 | 1 (useEffect) |
| P2 | 8 | 7 | 0 | 1 (CSP) |
| P3 | 9 | 6 | 2 | 3 (hooks HMR, nanobot 500, hallucination) |
| **Totale** | **39** | **27** | **6** | **6** |

## BUG FIXATI — SESSIONE PDR 04/04/2026 (16+3)

| # | Bug | File | Tipo |
|---|-----|------|------|
| 27 | v3-cap6-esp2 connections vuote | experiments-vol3.js | Data |
| 28 | v3-cap6-esp3 connections vuote | experiments-vol3.js | Data |
| 29 | v3-cap6-esp1 connections vuote | experiments-vol3.js | Data |
| 30 | v3-cap6-esp4 connections vuote | experiments-vol3.js | Data |
| 31 | v3-cap6-esp5 connections vuote | experiments-vol3.js | Data |
| 32 | v3-cap6-esp7 connections vuote | experiments-vol3.js | Data |
| 33 | v3-cap7-esp1 connections vuote | experiments-vol3.js | Data |
| 34 | v3-cap7-esp2 connections vuote | experiments-vol3.js | Data |
| 35 | v3-cap7-esp3 connections vuote | experiments-vol3.js | Data |
| 36 | v3-cap7-esp4 connections vuote | experiments-vol3.js | Data |
| 37 | v3-cap7-esp5 connections vuote | experiments-vol3.js | Data |
| 38 | v3-cap7-esp6 connections vuote | experiments-vol3.js | Data |
| 39 | v3-cap7-esp7 connections vuote | experiments-vol3.js | Data |
| 40 | v3-cap7-esp8 connections vuote | experiments-vol3.js | Data |
| 41 | v3-cap8-esp4 connections vuote | experiments-vol3.js | Data |
| 42 | v3-cap8-esp5 connections vuote | experiments-vol3.js | Data |
| 43 | Prompt UNLIM senza lista comandi | ElabTutorV4.jsx | UNLIM |
| 44 | Auth Supabase mancante (class_key) | supabaseSync.js + WelcomePage.jsx | Auth |
| 45 | Mapping volumi-app non documentato | docs/MAPPING-VOLUMI-APP.md | Docs |
| 46 | getBuildMode ritorna false per 'complete' | useSimulatorAPI.js | API |
| 47 | FloatingToolbar Select/Wire non sync simulatore | useSimulatorAPI.js + simulator-api.js + LavagnaShell.jsx | UX |
| 48 | Concept graph non iniettato nel contesto UNLIM | ElabTutorV4.jsx | Pedagogia |
| 49 | Canvas non auto-fit dopo load esperimento in Lavagna | LavagnaShell.jsx | UX/Responsive |

## BUG FIXATI — SESSIONE PDR LIVELLO SUCCESSIVO 04/04/2026 (7 fix)

| # | Bug | File | Tipo |
|---|-----|------|------|
| 50 | Barra componenti visibile in Libero mode | LavagnaShell.jsx | UX |
| 51 | **5 font < 14px in Lavagna** (13px→14px) | AppHeader/LessonBar/VideoFloat.css | WCAG |
| 52 | **5 touch targets < 44px** (28-32→44px) | VolumeViewer.module.css | WCAG |
| 53 | **PC viewbox troppo piccolo** (300x200→500x350) | SimulatorCanvas.jsx | Responsive |
| 54 | **Galileo chiuso automaticamente dalla state machine** | LavagnaStateManager.js + LavagnaShell.jsx | UX P0 |
| 55 | **drawingEnabled useState mancante** (pen tool crash) | LavagnaShell.jsx | Bug P0 |
| 56 | **Build mode switch mancante in AppHeader** | AppHeader.jsx + AppHeader.module.css | UX |

## BUG FIXATI — PDR V2 Ralph Loop 04/04/2026 (2 fix)

| # | Bug | File | Tipo |
|---|-----|------|------|
| 57 | **generateComponentId collision** — counter HMR unsafe, duplicati resist_1 | breadboardSnap.js + useCircuitHandlers.js | Bug P1 |
| 58 | **errorTranslator fallback** — errori GCC non matchati mostrati raw in inglese | errorTranslator.js | WCAG/UX |

## BUG FIXATI — PDR V3 Ralph Loop 04/04/2026 (6 fix)

| # | Bug | File | Tipo |
|---|-----|------|------|
| 59 | **PercorsoPanel non riceve esperimento** — usava getActiveExperiment (inesistente), prop da LavagnaShell + evento experimentChange + polling 300ms | PercorsoPanel.jsx + LavagnaShell.jsx | UX P0 |
| 60 | **DrawingOverlay non appare su click Penna** — stale closure drawingEnabled in useCallback deps | LavagnaShell.jsx | UX P0 |
| 61 | **Mascotte click bloccato** — e.preventDefault() su pointerdown blocca click nativo, rimosso + threshold 5px per drag | MascotPresence.jsx | UX P0 |
| 62 | **Video button senza testo** — aggiunto span "Video" accanto all'icona SVG | AppHeader.jsx | UX P1 |
| 63 | **LessonPathPanel duplicato in Lavagna** — hideLessonPath prop per evitare duplicato simulator + FloatingWindow | NewElabSimulator.jsx + LavagnaShell.jsx | UX P1 |
| 64 | **UNLIM sovrappone Percorso** — auto-close UNLIM quando si apre Percorso, LessonPathPanel default expanded | LavagnaShell.jsx + LessonPathPanel.jsx | UX P1 |

## NOTE
- Engine INTOCCATO: CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js MAI modificati (solo copyright date)
- Zero regressioni: 1430/1430 test PASS in ogni iterazione
- 91/91 esperimenti completi (16 Vol3 con connections fixate)
- Runtime browser verification: zero resist_1 duplicati post-fix (HMR artifact)
- UNLIM prompt ora include 35+ comandi disponibili
- Auth Supabase con class_key implementata (SQL + client)
- Build: 33 precache, ~2400 KiB
- Parita volumi verificata: Vol1 38=38, Vol2 26+1 derivato, Vol3 bozza+3 extra
- Percorso Lezione 5 fasi (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI) funzionante
- DrawingOverlay attivabile dal primo click Penna
- Mascotte click nativo funzionante (no più solo pointer events)
- Video button con testo "Video" nell'header
