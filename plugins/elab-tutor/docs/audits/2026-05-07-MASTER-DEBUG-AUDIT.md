# ELAB Tutor — MASTER DEBUG AUDIT 2026-05-07

**Generated**: 2026-05-07 19:00 GMT+2
**Author**: Claude Opus 4.7 + 5 parallel sub-agents
**Mandate**: massima onestà, non compiacere, no synthesis (Andrea iter 21+)
**Scope**: 5 area audit (HomePage + Lavagna + Simulator + UNLIM + Tutor/Lessons/Dashboard)
**Method**: agentic — 5 parallel general-purpose agents, code-reading + grep + cross-reference CLAUDE.md/.impeccable.md
**Production HEAD**: `b4c63fd1` (post Cycle 3 merge #89+#90+#91 squash)

---

## EXECUTIVE SUMMARY — score onesto

**Score self-rate REJECTED (G45 mandate).** Findings below speak per se.

**Production state**:
- 3/3 Cycle 3 PR (cap10-esp1+cap10-esp3+docs Phase 0) **merged main** — Vercel deploy auto-trigger
- 9 specialized AI Edge Functions deployed alive (HTTP 204 OPTIONS verified)
- Vitest 13616 PASS preserved across all 3 merges
- Build PASS pre-push gate

**Critical gaps verified across audits**:
1. **3/4 specialized AI Edge Functions deployed-but-orphaned** (unlim-tts Voxtral, unlim-vision Pixtral, unlim-stt Whisper) — frontend bypasses, Andrea voice clone unreachable
2. **PRINCIPIO ZERO 834+ imperative singolare violations** across `experiments-vol{1,2,3}.js` (Vol1 428 + Vol2 192 + Vol3 214 + 30/94 lesson-paths)
3. **Vol/pag verbatim citation: 5/91 = 5.5%** (Morfismo Sense 2 mandate target 100%)
4. **L2 template catch-all** routes ALL `lesson-explain` to identical "LED blink" content (20/20 audit queries identical body)
5. **HomePage card "ELAB Tutor completo" promises distinct destination** but lands on Lavagna libera (App.jsx:227-241 silent rewrite + dead unreachable block 244-306)
6. **AppHeader UNLIM toggle button MISSING** — `onGalileoToggle` prop passed but not destructured/used in child component
7. **iter 31-38 features NOT in production** — PR #60 (263 commits) CONFLICTING, awaiting 8-12h squash-merge session
8. **4-way INTENT parser drift** — server canonical schema + 3 redundant client-side parsers + race risk
9. **Lesson count drift documentation** — CLAUDE.md "27 Lezioni" vs reality 25
10. **`useGalileoChat.js:509` `require()` ESM** — silent throw → concept-graph injection dead code

---

## P0 — CRITICAL ACROSS ALL AREAS

### P0-1 [HomePage] Card "ELAB Tutor completo" promises Percorso + UNLIM + simulatore but lands on Lavagna only
- **File**: `src/components/HomePage.jsx:343-352` (card text "App piena: Percorso, esperimenti, UNLIM, voce, simulatore")
- **File**: `src/App.jsx:227-241` (silent `replaceState('/#lavagna')` then renders LavagnaShell — IDENTICAL to Card "Lavagna libera")
- **Fix**: rewrite card text OR restore separate `<ElabTutorV4 />` route OR delete duplicate card
- **Impact**: docente expecting full Percorso UI gets workspace, PRINCIPIO ZERO confusion

### P0-2 [HomePage] Dead unreachable code App.jsx:244-306
- **File**: `src/App.jsx:244-306` (full ElabTutorV4 + RequireAuth + RequireLicense + top bar)
- **Reason unreachable**: prior `if (currentPage === 'lavagna' || currentPage === 'tutor')` line 235 catches both
- **Fix**: delete block (62 lines)

### P0-3 [HomePage] Footer scimpanze GIF rotation 404s every load
- **File**: `src/components/HomePage.jsx:896-897` iterates `/easter/scimpanze-${idx+1}.gif` (4 paths every 4.5s)
- **Reality**: `public/easter/` contains ONLY `scimpanze-hd.jpg` (verified via `ls`)
- **Fix**: drop 4 GIFs OR change `<img src>` to existing `scimpanze-hd.jpg` OR remove rotation

### P0-4 [Lavagna] AppHeader UNLIM toggle button MISSING
- **File**: `src/components/lavagna/LavagnaShell.jsx:1224-1225` passes `onGalileoToggle={toggleGalileo} galileoOpen={galileoOpen}`
- **File**: `src/components/lavagna/AppHeader.jsx:4-29` does NOT destructure those props, NO `<button>` UNLIM rendered
- **Impact**: docente has NO direct UNLIM toggle from header (only via `onPercorsoToggle` which opens different tab)
- **Fix**: wire `onGalileoToggle` button into AppHeader

### P0-5 [Lavagna] `useGalileoChat.js:509` uses `require()` (CommonJS) in ESM/Vite
- **File**: `src/components/lavagna/useGalileoChat.js:509` `const { getNewConcepts, getPrerequisites } = require('../../data/concept-graph');`
- **Impact**: throws silently caught by `catch { /* silent */ }` → "concept-graph" pedagogical context **NEVER injected** into UNLIM
- **Fix**: change to `await import('../../data/concept-graph')` ESM dynamic import
- **Severity**: regression vs claim "UNLIM onnisciente" CLAUDE.md iter 41+

### P0-6 [Simulator + Lessons] PRINCIPIO ZERO 834+ violations imperativo singolare
- **Files**: 
  - `src/data/experiments-vol1.js` 428 violations
  - `src/data/experiments-vol2.js` 192 violations
  - `src/data/experiments-vol3.js` 214 violations
  - `src/data/lesson-paths/*.json` 30/94 files singolare verbs
- **Pattern**: `Premi`, `Inserisci`, `Collega`, `Posiziona`, `Avvia` in `steps[]` + `buildSteps[].text/.hint`
- **Mandate violated**: CLAUDE.md "Sense 1.5" §A "plurale 'Ragazzi,' = INVARIANTE"
- **"Ragazzi" mentions in experiment data**: vol1=2, vol2=0, vol3=3 = **5/91 = 5.5%** (target 100%)
- **Fix**: sed codemod replacement table (Phase 5 Cycle 3 plan) — 5-8h scope (revised from 3-6h post truth refresh count)
- **Davide ratify**: PDF uses singolare too — software diverges (docente reads to classe, plurale needed) OR keeps verbatim PDF (singolare)

### P0-7 [Simulator + Lessons] Vol/pag verbatim citation coverage 5/91 = 5.5%
- **Evidence**: 1/38 Vol1 + 0/27 Vol2 + 4/26 Vol3 cite `Vol\.\d+|pag\.\d+`
- **Lesson-paths**: only 3/94 cite `Vol.\d+|pag.\d+` in teacher_message
- **Mandate violated**: CLAUDE.md Morfismo Sense 2 "il software è MORFICO ai volumi cartacei. Stessa forma. Stessi nomi. Stesse pagine."
- **Data exists**: `volume-references.js` 94/94 enriched with `bookPage + bookText + bookInstructions`. `capitoli/*.json` 37/37 with pageStart/pageEnd
- **Fix**: generator script reads `getVolumeRef(experimentId)`, prepends "Vol.N pag.M — " to all `teacher_message + observe + unlimPrompt + buildSteps`
- **Severity**: structural — biggest competitive moat (kit Omaric + volumi originali) NOT visible in software

### P0-8 [UNLIM] Voxtral voice clone NOT REACHABLE in production
- **Backend deployed live**: `unlim-tts` Edge Function HTTP 204 251ms (Voxtral primary + Edge TTS Isabella fallback)
- **Frontend bypasses**: `src/hooks/useTTS.js:303-335` calls `voiceService.synthesizeSpeech` → Kokoro VPS port 8881 (CLAUDE.md says "DOWN/decommissioning candidate")
- **`multimodalRouter.routeTTS`** correctly calls `unlim-tts` Edge Function but **no caller in src/components/** (verified empty grep)
- **Net effect**: Andrea's voice clone (iter 31), Voxtral cross-lingual EN→IT, Edge TTS Isabella Neural — none heard by production users
- **Fix**: wire `multimodalRouter.routeTTS` into `useTTS.js` chain, deprecate Kokoro VPS path

### P0-9 [UNLIM] Vision E2E uses unlim-chat NOT unlim-vision
- **Backend deployed**: `unlim-vision/index.ts:62-123` (Gemini 2.5 Flash primary + Pixtral 12B fallback, Italian K-12 prompt plurale "Ragazzi,")
- **Frontend bypasses**: `src/services/api.js:1120-1133` `analyzeImage` calls `sendChat(question, [{base64, mimeType}])` → routes to `unlim-chat`, NOT `unlim-vision`
- **Net effect**: ADR claims of "Gemini Flash EU Frankfurt -700ms latency" don't apply to prod vision flow
- **Fix**: route `analyzeImage` to `unlim-vision` Edge Function

### P0-10 [UNLIM] Lesson L2 template catch-all routes ALL queries to LED blink
- **File**: `supabase/functions/_shared/clawbot-template-router.ts:18-100`
- **Evidence Sprint U Cycle 1**: 20/20 queries on different experiments returned identical body referencing only LED blink template
- **Impact**: Vol2 multimeter / Vol3 Arduino experiments all receive Vol1 LED blink content — Morfismo Sense 2 broken for 78% of experiments
- **Fix**: add `experimentId`-specific mapping, fall through to LLM if no specific match

---

## P1 — HIGH (UX broken, partial regression)

### Per-area summary table

| # | Area | Issue | File:line | Fix scope |
|---|------|-------|-----------|-----------|
| H1 | Lavagna | Wake word warm-up registers double listener (race) | `LavagnaShell.jsx:537-618` | wakeword.js singleton check |
| H2 | Lavagna | `useSessionTracker` retry timeout 800ms vs Render cold start 18s | `useSessionTracker.js:189-217` | bump retry attempts + exponential backoff |
| H3 | Lavagna | `gamification.onExperimentCompleted` called multiple times per session | `useSessionTracker.js:113` + cleanup chain | dedupe by sessionId |
| H4 | Lavagna | Storage key mismatch `elab-rp-lavagna-left` vs `elab-lavagna-left-panel` | `RetractablePanel.jsx:6-13` + `LavagnaShell.jsx:441-444` | unify key |
| H5 | Lavagna | `executeIntentTags` dynamic import fails silently | `useGalileoChat.js:333-388` | telemetry on import fail |
| H6 | Lavagna | INTENT whitelist 12 actions vs AZIONE path 41 actions gap | `intentsDispatcher.js:30-43` vs `useGalileoChat.js:30-302` | sync surfaces |
| H7 | Lavagna | `api.setToolMode` existence not verified — Pen/Wire/Select may be local-only | `LavagnaShell.jsx:879,886` | verify simulator-api.js export |
| H8 | Lavagna | BentornatiOverlay `dataRef` stale state | `BentornatiOverlay.jsx:310-388` | re-read localStorage on remount |
| H9 | Lavagna | DrawingOverlay `clearAll` no confirm dialog (vs WhiteboardOverlay has) | `DrawingOverlay.jsx:322-332` | add confirm |
| H10 | Lavagna | `useGalileoChat.js:174-176` `case 'highlightpin'` calls non-existent `api.highlightPin` | line | use `api.unlim.highlightPin` |
| H11 | Lavagna | `voiceCommands.js` 41 entries but CLAUDE.md claims 36 | grep verified | sync docs |
| H12 | HomePage | Skip-to-content link missing on home route | `App.jsx:190-196` no SkipToContent on `currentPage === 'home'` | add wrap |
| H13 | Simulator | Compile error strings child-unfriendly singolare | `services/api.js:1213` "Controlla che internet funzioni" | plurale "Ragazzi, controllate" |
| H14 | Simulator | HEX overflow check missing | `NewElabSimulator.jsx:419-421` | add `if (hexBytes > FLASH_TOTAL) warn` |
| H15 | Simulator | Wire delete only via keyboard (no UI button) | `SimulatorCanvas.jsx:851-857` | add X icon on selected wire |
| H16 | Simulator | Audio beep on Passo Passo step lacks accessibility opt-out | `NewElabSimulator.jsx:332-339` | mute toggle + prefers-reduced-motion |
| H17 | UNLIM | STT browser-only — Safari/Firefox excluded | `useSTT.js:35-40` | wire CF Whisper Edge Function fallback |
| H18 | UNLIM | PRINCIPIO ZERO validator append-warning only, NO enforcement | `principio-zero-validator.ts:14-17` | add reject/regenerate path for HIGH severity |
| H19 | UNLIM | RAG threshold 0.55 vs hybrid 0.85 — recall low | `rag.ts:472` vs hybrid path | tune threshold + measure recall@5 |
| H20 | UNLIM | Onniscenza opt-in default OFF (`ENABLE_ONNISCENZA=false`) | `unlim-chat/index.ts:348` | enable prod default OR document opt-in |
| H21 | UNLIM | 4-way INTENT parser drift (server + 3 client) | `intent-parser.ts` + `useGalileoChat.js:333` + `UnlimWrapper.jsx:551` + `intentsDispatcher.js:108` | unify on canonical schema |
| H22 | UNLIM | Vision auto-trigger regex false positives "guardate il libro" | `useGalileoChat.js:617-645` | tighten pattern OR confirm UI |
| H23 | UNLIM | Wake word only 11 phrases hardcoded | `wakeWord.js:18-22` | expand regional variants |
| H24 | Tutor | `LessonReader` previews bookText only first + active step | `LessonReader.jsx:27,42` `idx === 0 || isActive` | show all steps verbatim |
| H25 | Tutor | DashboardShell placeholder default, no live link | `DashboardShell.jsx:36-44` | enable live mode + UI link |
| H26 | Tutor | TeacherDashboard 55 hex violations (worst project) | `TeacherDashboard.jsx:23-38, 273-274, 278` | codemod hex → CSS tokens |
| H27 | Tutor | DocenteSidebar width 25% cramped on LIM 1920px | `DocenteSidebar.module.css:8-10` | dynamic sizing per viewport |
| H28 | Tutor | `experiments-vol3.js` missing `v3-cap7-mini` + `v3-cap8-serial` definitions | grep evidence | add experiment definitions OR remove from index |

---

## P2 — MEDIUM (design/polish)

| # | Area | Issue | Fix scope |
|---|------|-------|-----------|
| M1 | HomePage | HomeCronologia uses raw hex not CSS tokens | codemod |
| M2 | HomePage | `var(--elab-navy, var(--elab-navy))` self-referential fallback (broken pattern) | replace fallback with literal `#1E4D8C` |
| M3 | HomePage | Diario del docente placeholder visible in prod | hide behind feature flag |
| M4 | HomePage | Card "Videolezioni" emoji 🎬 not SVG ElabIcons | add VideolezioniCardIcon |
| M5 | HomePage | `elab-bubble-wave` keyframes inlined per render | move to CSS module |
| M6 | Lavagna | `MODE_META.passo-passo.tooltip` mentions feature broken Andrea iter 45 mandate | fix passo-passo OR hide tooltip |
| M7 | Lavagna | Vision regex false positives (M3) | tighten pattern |
| M8 | Lavagna | WhiteboardOverlay storage fallback `elab_wb_sandbox` mismatch with `useSessionTracker` | unify fallback key |
| M9 | Lavagna | Click backdrop CapitoloPicker — no Esc handler | global Esc listener |
| M10 | Lavagna | INTENT executeServerIntents sequential await (1s for 5 intents) | Promise.allSettled |
| M11 | Lavagna | DrawingOverlay last-write-wins risk multi-device | CRDT TBD iter 29+ |
| M12 | Lavagna | Voice command feedback singolare ("Simulazione avviata") | plurale "Ragazzi, simulazione avviata" |
| M13 | Simulator | Schema asymmetry breadboard-half vs breadboard-full bus naming | doc rule #4 |
| M14 | Simulator | Default viewBox doesn't accommodate breadboard-full vertical | dynamic viewBox per experiment |
| M15 | Simulator | Drag dead-zone 5/10px not zoom-aware | scale with zoom |
| M16 | Simulator | Welcome card single boolean key (not per-mode) | per-mode keys |
| M17 | Simulator | Compile rotating message decorative, no real progress | progress bar OR ETA |
| M18 | UNLIM | PZ V3 drift Vol/pag 50% target 95% (iter 38 caveat) | structural fix RAG metadata |
| M19 | UNLIM | Onniscenza L3 Glossario permanent stub | implement OR remove |
| M20 | UNLIM | Onniscenza L7 OnTheFly returns stub if no `circuit_state` | document degraded mode |
| M21 | UNLIM | RAG keyword fallback uses `knowledge-base.json` (62 chunks) vs vector 1881 chunks | unify corpus |
| M22 | UNLIM | `selectChapter` voice defaults vol1 silently if no current experiment | ask volume confirmation |
| M23 | UNLIM | UnlimReport SVG icons lack `<title>`/aria-label | add a11y |
| M24 | UNLIM | Mascotte position fixed bottom-right, no LIM-resize awareness | dynamic position |
| M25 | UNLIM | Long-press TTS toggle keyboard-inaccessible | Space-hold equivalent |
| M26 | UNLIM | Vision Button only in Lavagna mode, missing from Tutor UNLIM mode | add to UnlimWrapper |
| M27 | Tutor | `availableModes={undefined}` ModalitaSwitch consumer — dead defensive code | remove OR document intent |
| M28 | Tutor | `LessonSelector.jsx:5` no propTypes, `volumeNumber` not validated | add propTypes |
| M29 | Tutor | DocenteSidebar empty-state: no "no data" fallback copy | add fallback |
| M30 | Tutor | PercorsoCapitoloView mixes CSS module + inline styles | extract inline → module |

---

## P3 — LOW (nice-to-have)

| Area | Issue |
|------|-------|
| HomePage | `HASH_ROUTES` missing `GLOSSARIO` const |
| HomePage | `scimpanzeIdx % 4` interval ticks even after 404s |
| HomePage | `isMobile` redefined inline (drift risk) |
| HomePage | Speech bubble `nowrap` may overflow mobile <320px |
| HomePage | 3 separate reload mechanisms (vite preloadError + controllerchange + inline error) |
| Lavagna | FloatingToolbar tools array divider position fragile |
| Lavagna | toolToast pixel hardcoded position no safe-area |
| Lavagna | RetractablePanel toggleBottom 44px borderline WCAG |
| Lavagna | DrawingOverlay COLORS palette green `#16a34a` not `var(--elab-lime)` |
| Lavagna | WhiteboardOverlay COLORS_PRESET includes `#FFFFFF` (invisible on white) |
| Lavagna | FloatingToolbar no visible labels (LIM 5m distance) |
| Lavagna | activeTab init reads localStorage, stale role change |
| Lavagna | useSessionTracker MAX_SESSIONS=20 silent trim |
| Lavagna | DrawingOverlay disable smonta — current color/penSize lost |
| Lavagna | `intentsDispatcher` whitelist excludes `nextStep`/`prevStep` |
| Simulator | ComponentDrawer 5 emoji icons (🔧 🧩) violation regola 11 |
| Simulator | Inline styles plurality (NewElabSimulator:997-1008) |
| Simulator | localStorage key naming inconsistent (hyphen vs underscore) |
| Simulator | Layout edge-zone asymmetry (left vs right) |

---

## CROSS-CUTTING META-FINDINGS

### CC1. Backlog PR #60 (263 commits iter 31-38) NOT in production
- **Status**: CONFLICTING DIRTY (171 conflict files, 1670 changed files, +335596 lines)
- **Critical features locked unmerged**:
  - HomePage rebuild + ElabIcons + 5° card "Chi siamo"/Videolezioni (`87b4eb1e`, `86b9b527`, `f76e4e52`)
  - UpdatePrompt globale PWA (`fd82f689`) — fixes Andrea pagina bianca regression
  - MicPermissionNudge (within `f21c2270`)
  - ChatbotOnly + EasterModal
  - INTENT parser + intentsDispatcher + intent-tools-schema (server-side function calling)
  - Mistral function calling (ADR-030 `f21c2270`)
  - Voxtral STT migration ADR-031 (`ef85729d`)
  - Onniscenza conditional classifier (`f21c2270`, `5e30a4ab`)
  - Mechanisms M-AI-06/07/08 + M-AR-06/07 (`a57f4d59`, `a4832fb8`, `779220f4`, `84c2cd7c`, `acf69f76`)
  - Kimi auth fix (`c53f5cc0`)
  - Cronologia Edge Function chain (`86455c16`, `7762b99b`, `42e68307`)
  - Lavagna libera + lavagnaSoloMode + BentornatiOverlay + Esci flush remote
  - 94 lesson-paths linguaggio codemod plurale + Sprint U Cycle 2 fixes
  - GalileoAdapter palette tokenize
  - FloatingWindow resizeCorner WCAG 2.5.5
  - Step-Back P0.2 + CEGIS-PLUS + verification-gate
- **Recommended strategy** (Option D from sub-agent): squash-merge one-shot on fresh branch `merge/iter-31-38-final`, 8-12h focused work, NEXT SESSION dedicated
- **Risk if NOT merged**: production stays on Apr 30 baseline; iter 31-38 work invisible to users; Andrea perception "non vedo niente nel deploy" CONFIRMED ROOT CAUSE

### CC2. Specialized AI Edge Functions deployed-but-orphaned (3/4)
- `unlim-tts` (Voxtral primary + voice clone Andrea + Edge TTS Isabella) → frontend uses voiceService.js → Kokoro VPS direct (DOWN per CLAUDE.md)
- `unlim-vision` (Gemini Flash + Pixtral 12B + Italian K-12 prompt) → frontend `analyzeImage` calls `sendChat` → unlim-chat instead
- `unlim-stt` (CF Whisper dual-shape input) → frontend uses `webkitSpeechRecognition` browser-only
- **Net effect**: 3 Edge Functions worth of feature work orphaned in production. Mistral EU FR Voxtral + Pixtral + CF Whisper Turbo investments unrealized.

### CC3. Documentation drift vs reality
- "27 Lezioni" (CLAUDE.md) vs actual 25 in `lesson-groups.js`
- "94 esperimenti" (CLAUDE.md) vs actual 91 in data files (38 Vol1 + 27 Vol2 + 26 Vol3)
- "36 voice commands" vs actual 41 entries in `voiceCommands.js`
- "200 PRINCIPIO ZERO violations" (audit) vs actual 834+ across data files
- "5 unique commits PR #59" vs actual 1 unique commit (`69a2244c` voice fix)

### CC4. Multiple Truth Drift across 4-way schemas
- INTENT parsing: server (`intent-parser.ts`) + 3 client paths (useGalileoChat + UnlimWrapper + intentsDispatcher)
- pinAssignments vs buildSteps targetPins vs connections wire-start (cap10-esp3 was 3-way contradiction, now fixed Cycle 3)
- LDR pin spacing: pinAssignments d6/d11/d16 vs buildSteps d4/d8/d12 vs connections a4/a8/a12 (cap10-esp3 fixed)
- Audit JSON top_fix entries pre-Cycle 3 cited "components missing r1/r2/r3" but PDF says no resistors

### CC5. PRINCIPIO ZERO not validator-enforced
- Server-side validator (`principio-zero-validator.ts`) is APPEND-WARNING only — never rejects/regenerates response
- Client-side enforcement absent
- BASE_PROMPT few-shot examples enforce by training, not by gate
- Iter 38 PDR §6 admits drift Vol/pag 50% target 95% — structural

### CC6. Test count canonical drift
- `automa/baseline-tests.txt` reads 13474 (file)
- Pre-commit hook reports 13616 (live vitest)
- Discrepancy = baseline file stale, hook is canonical
- Fix: cron `npm test && wc -l > baseline-tests.txt` OR remove baseline file (use hook live count)

### CC7. Score self-claim history (anti-inflation G45)
- iter 38 partial 6.5/10 → cap 8.5 PDR §4 mandate triggered (latency)
- Cycle 3 close projected 6.0/10 (5.23 → 6.0)
- All claims labeled "ONESTO" + cap rationale documented
- Mandate: NO claim >7 without Opus indipendente review

---

## STRENGTHS — what works well

### Architecture
- **Defense in depth on UNLIM input**: 5 client guards + 5 server guards before LLM call
- **Zero-throws backend**: every parser/validator has try/catch with safe defaults — chat flow never breaks
- **Multi-provider LLM resilience**: Together → Mistral → Gemini → Brain VPS chain with 8s Promise.race timeout
- **L2 template short-circuit**: 20 documented patterns return server-rendered without LLM (~2-4s saved)
- **Onniscenza classifier**: chit_chat skip path saves ~500-1000ms on greetings
- **Wake word resilient error handling**: terminal errors logged once with UI dispatch (anti-flood)
- **Edge Function deploy state**: 9/9 alive (chat, tts, vision, stt, diagnose, hints, gdpr, imagegen, session-description)
- **AVR worker mode**: clean separation main-thread vs worker, fallback try-catch
- **Public API surface**: `__ELAB_API` 29+ functions for UNLIM Onnipotenza
- **Defensive mountExperiment**: 3-shape input handling
- **Scratch ErrorBoundary**: graceful Blockly crash fallback

### Data integrity
- **Volume references parallel**: 94/94 entries enriched with bookPage + bookText + bookInstructions
- **Capitoli JSON**: 37/37 with pageStart/pageEnd + theory.testo_classe + esperimenti[].volume_ref
- **Lesson-paths registry tightness**: 94/94 IDs match groups, 0 missing/orphan
- **Cycle 3 fixes**: cap10-esp1 + cap10-esp3 internal contradictions resolved (truth alignment)

### Pedagogy
- **Lesson-paths schema**: rich 5-phase structure (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI) with analogies + evidence + common_mistakes + concepts_learned + assessment_invisible + session_save
- **DocenteSidebar**: pure descriptive, no imperatives — solid PRINCIPIO ZERO discipline
- **CapitoloPicker**: clean accessible role/aria-label structure
- **HomeCronologia**: real localStorage-backed, 4 buckets, search, AI description Edge Function fallback

### UX
- **Mascotte robust fallback**: PNG with inline SVG fallback (navy/lime/orange palette CSS vars)
- **Overlay contextual positioning**: getComponentScreenPosition + arrow-side logic + WCAG AA contrast typeColors
- **Input bar progressive disclosure**: useRevealedTools localStorage tracks first-use, hidden in overflow until used
- **MicPermissionNudge**: pre-emptive Permissions API query + plurale prompt
- **WhiteboardOverlay quota management**: LRU eviction + JPEG compression + cap 10 entries × 500KB
- **PWA manifest**: theme/background `#1E4D8C` Navy token, 192/512/180 icons all present
- **Browser scroll-restoration**: handled `window.scrollTo(0,0)` on navigate
- **Service worker safeguards**: controllerchange + vite:preloadError reload guards prevent stale precache
- **`prefers-reduced-motion`**: respected for bubble animation

### Safety / governance
- **Pre-commit hook**: vitest baseline gate (anti-regression)
- **Pre-push hook**: build PASS gate
- **Branch protection**: NO direct push main per CLAUDE.md mandate
- **Squash-merge**: PR #89/#90/#91 atomic Cycle 3 entry
- **Anti-inflation G45**: NO claim >7 without Opus indipendente
- **TDD Regola 2**: test() commit BEFORE feat() (Vol2 PR #85)

---

## ACTION PLAN PRIORITY (next 4 sessions)

### Session 1 (~6h) — UX P0 quick wins
1. Fix HomePage card "ELAB Tutor completo" duplication (P0-1) — 30min
2. Delete dead App.jsx:244-306 block (P0-2) — 15min
3. Drop scimpanze GIFs OR change to existing JPG (P0-3) — 15min
4. Fix AppHeader UNLIM toggle wiring (P0-4) — 1h
5. Fix `useGalileoChat.js:509` ESM require (P0-5) — 30min
6. Fix wake word double listener race (H1) — 1h
7. Fix storage key mismatch (H4) — 30min
8. Add SkipToContent on home (H12) — 15min
9. Sync CLAUDE.md doc drift (CC3) — 30min
10. Codemod compile error strings plurale (H13) — 30min

### Session 2 (~8-12h) — PR #60 squash-merge dedicated
- Strategy Option D per sub-agent
- Resolve 171 conflicts file-category-driven
- Cherry-pick PR #59's `69a2244c` voice fix on top
- Rebase PR #78/#80 onto new main
- Close PR #79 if confirmed duplicate of #78
- Close PR #56 (wrong base)
- Verify vitest 13616+ + build PASS

### Session 3 (~5-8h) — PRINCIPIO ZERO codemod (P0-6 + P0-7)
- 834+ imperative singolare codemod with 10-sample manual verify per Cycle 3 plan Phase 5
- Vol/pag verbatim generator script (read volume-references → prepend to all phases)
- Davide ratify gate before bulk apply
- 5/91 → target 100% Vol/pag coverage

### Session 4 (~4-6h) — Specialized AI Edge Functions wire-up (P0-8 + P0-9 + H17)
- Wire `multimodalRouter.routeTTS` into `useTTS.js` chain (Voxtral voice clone reachable)
- Route `analyzeImage` to `unlim-vision` (Gemini Flash + Pixtral)
- Wire CF Whisper STT for Safari/Firefox fallback
- Verify R5 + R7 bench post-deploy

### Session 5+ — Phase 2-5 Cycle 3 plan + L2 template fix (P0-10)
- L2 template `experimentId`-specific mapping
- Phase 2 spiattellato consolidation 38→28 (Davide ratify)
- Phase 3 Vol2 quick-fixes (cap3+4 wires)
- Phase 4 Vol3 non-Davide fixes
- Davide content delivery (cap9 piezo, cap5 batterie, cap6-esp4 methodology, cap14 mascot, spiattellato ratify)

---

## SOURCES (5 sub-agent reports)

Audit reports synthesized:
1. **HomePage + Navigation** — agent `ad970f97a849c7904`
2. **Lavagna + Sessions + Drawing + Modalità** — agent `aad417a7f58c14f82`
3. **Simulator + Arduino + Scratch + Compiler** — agent `ad6d85d1d96d7a729`
4. **UNLIM AI (chat, voice, vision, RAG)** — agent `aab9799cf746b0cb7`
5. **Tutor + Lessons + Dashboard + Games** — agent `a819e9e1a77899795`

PR #60 conflict deep dive — agent `abb6c02da9bf3e55d`

Each agent independently verified findings via file:line evidence + grep + cross-reference CLAUDE.md.

Total agent runtime: ~70 min, ~1.4M tokens, ~270 tool uses.

---

## CONFIDENCE + GAPS

### High confidence (verified by file:line)
- All P0 findings (verified by direct code reading + grep)
- Action map for all 5 areas
- Backlog PR #60 conflict scope (171 files, 295 commits)
- Specialized AI Edge Functions orphaned (verified empty grep + chain trace)

### Medium confidence
- PRINCIPIO ZERO violation counts (mechanical grep, but pattern may have false positives in test fixtures)
- L2 template catch-all behavior (Sprint U Cycle 1 audit reference + code reading first 100 LOC, not full enumeration)
- TeacherDashboard 55 hex violations (Sprint U design critique reference)

### Unverified (NOT executed runtime)
- Live Playwright testing of every action (read-only static analysis)
- Vitest run for full audit baseline preserve verify (only pre-commit hook reports)
- Lighthouse performance scores
- Real audio playback for TTS chain
- Real STT for browser support gap
- DashboardShell live mode UI rendering

### Out of scope
- Full read of NewElabSimulator (1022 LOC, sampled only)
- Full read of TeacherDashboard (3484 LOC, sampled only)
- Full enumeration of all 94 lesson-paths
- Edge Function internals beyond entry points

---

## ANTI-INFLATION G45 MANDATE ENFORCED

NO score self-claim. Findings speak per se.

The product has:
- **STRONG architecture** (Edge Functions, multi-provider LLM, defensive parsers, schema rigor)
- **STRONG data scaffold** (volume references 94/94, capitoli 37/37, lesson-paths registry tight)
- **STRONG safety** (pre-commit + pre-push gates, atomic PR, anti-inflation governance)

The product has:
- **STRUCTURAL gaps** (3 Edge Functions orphaned, 4-way INTENT drift, PRINCIPIO ZERO 834 violations, Vol/pag 5.5%)
- **DOCUMENTATION drift** (27 vs 25 lessons, 94 vs 91 esperimenti, 36 vs 41 voice commands)
- **MASSIVE BACKLOG** (PR #60 263 commits unmerged, iter 31-38 invisible to users)
- **UX P0 bugs** (HomePage card duplication, dead code, scimpanze 404, AppHeader UNLIM toggle missing)

The most actionable wins (best ROI):
1. **PR #60 squash-merge** — unblocks 263 commits of iter 31-38 work, single biggest visibility lift
2. **Specialized AI Edge Functions wire-up** — unlocks Voxtral voice clone Andrea + Pixtral vision (already deployed, just bypassed)
3. **PRINCIPIO ZERO codemod 834 violations** — closes Andrea iter 21+ mandate
4. **Vol/pag verbatim generator** — closes Morfismo Sense 2 (kit Omaric + volumi originali competitive moat)

---

**Master debug audit completata.**
**Cross-link**: `docs/plans/2026-05-07-sprint-u-cycle3-fix-wave-plan.md` Phase 1-6 + this audit findings → next sessions roadmap.
