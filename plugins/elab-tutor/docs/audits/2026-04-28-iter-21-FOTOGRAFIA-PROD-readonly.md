# ITER 21 — FOTOGRAFIA PROD READONLY

**Data**: 2026-04-28 21:09 CEST
**Target**: https://www.elabtutor.school
**Mode**: readonly Playwright MCP audit (no file modification)
**Mandate**: Andrea iter 18 PM "MOLTI ESPERIMENTI NON FUNZIONANO" + "MAX ONESTÀ NO COMPIACENZA G45"

---

## 1. Stack live

| Componente | URL | HTTP | Note |
|---|---|---|---|
| Frontend Vercel | https://www.elabtutor.school | 200 | Title: "ELAB Tutor — Simulatore di Elettronica e Arduino per la Scuola" |
| Supabase Edge `unlim-chat` | https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat | 401 (no auth) / **503 first call** | Fallback funziona via askUNLIM (nanobot) |
| Compilatore n8n | https://n8n.srv1022317.hstgr.cloud/compile | **CORS BLOCKED** | `Access-Control-Allow-Origin` HEADER ASSENTE → frontend non può chiamare |
| Nanobot Render | (via askUNLIM `source:"nanobot"`) | OK | Risposta plurale "Ragazzi," + analogia + AZIONE tag |

Vercel deploy ID: NON visibile in console (no `x-vercel-id` esposto in fetch DOM-side).

---

## 2. UI elements presence/absence vs mandate

| Mandate elemento | Presente | Ref | Note |
|---|---|---|---|
| Mascotte UNLIM (FloatingWindow toggle) | SI | `e99` | bottom-left, drag+click, `aria-label="Parla con UNLIM"` |
| Toolbar 4 tools (Pen/Wire/Select/Delete) | SI (6 attivi) | `e61` | Select/Filo/Elimina/Annulla/Ripeti/Penna — manca AI command bar inline |
| ChatOverlay UNLIM auto-expand | SI | `e2129` | Si apre cliccando mascotte; ATTENTION: mostra "Analizzando il circuito..." poi "UNLIM non ha risposto" (errore UI nonostante backend risponda) |
| RetractablePanel left (8 quick-add) | SI | `e118-e191` | LED, Resistore, Pulsante, Batteria 9V, Potenziometro, Buzzer, LDR, Interruttore Reed |
| Modalità switch | **3** (SI) | `e196-e217` | Già Montato / Passo Passo / Libero (NO Percorso, NO Guida-da-errore) |
| Compila & Carica | NO ("Compila" nascosto) | — | Bottone "Guarda il mio circuito" presente; compile via API ritorna `success:false` errors:"Errore di compilazione" + CORS error |
| Manuale / Video / Fumetto buttons | SI | `e39, e44, e49` | Header destro |

---

## 3. Console errors/warnings cumulati

```
[ERROR] Refused to execute script — MIME type ('text/html') not executable @ /<random-string>:0
[ERROR] Failed to load resource 503 @ unlim-chat:0  (PRIMA call cold-start)
[ERROR] Failed to load resource 401 @ unlim-chat:0  (call senza auth)
[ERROR] CORS preflight blocked @ n8n.srv1022317.hstgr.cloud/compile  (CRITICAL)
[ERROR] net::ERR_FAILED @ n8n compile
```

Totale: 4 distinct errors (1 P0 CORS, 1 P0 503 cold-start, 1 P1 401 senza key, 1 P2 MIME script).

---

## 4. ChatOverlay UNLIM response sample + Principio Zero V3 score

**Test**: `window.__ELAB_API.askUNLIM('Spiega cosa è un LED')`
**Risposta** (source: nanobot):

> "Ragazzi, il LED è come una piccola lampadina speciale che si illumina quando l'elettricità passa al suo interno, ma solo in una direzione! È un componente super efficiente che troviamo ovunque, dai semafori ai display dei nostri telefoni. Immaginate sia una porta girevole: lascia passare le persone (l'elettricità) solo in un senso! [AZIONE:highlight:led1]"

**Parole**: ~58 (≤60 OK).

### Principio Zero V3 score (12 rules)

| # | Rule | PASS/FAIL | Note |
|---|---|---|---|
| 1 | Plurale "Ragazzi," presente | PASS | Apertura "Ragazzi," |
| 2 | Vol/pag VERBATIM | **FAIL** | Nessuna citazione "Vol.X pag.Y 'testo'" |
| 3 | ≤60 parole | PASS | 58 parole |
| 4 | Italian Flesch-Kincaid ≤ 8th grade | PASS (qual.) | Lessico semplice 8-12yo |
| 5 | Analogia esplicita | PASS | "porta girevole" |
| 6 | Imperative plurale ("fate") NON ("fai") | PASS | "Immaginate" plurale |
| 7 | NO volgari | PASS | — |
| 8 | NO off-topic | PASS | On-topic LED |
| 9 | Cita kit fisico (NON solo simulatore) | **FAIL** | Nessun riferimento a kit/breadboard fisica |
| 10 | Mascotte tone (giocoso ma serio) | PASS | "lampadina speciale", "porta girevole" |
| 11 | Privacy minori (NO nomi) | PASS | — |
| 12 | Coerente Morfismo Sense 2 (kit+volumi+software) | **FAIL** | Cita semafori/telefoni invece kit Omaric |

**Score: 9/12 (75%)** — gap critici: VOL/PAG 0, kit fisico 0, Morfismo Sense 2 0.

Coincide con baseline R5 measure 91.80% Edge Function (CLAUDE.md sprint history) per questa singola query? NO — r5 score 91.80% misura prompt fixture diverso ed è auto-misurato. Risposta live nanobot in produzione VIOLA 3/12 regole Principio Zero V3.

---

## 5. Modalità switch behavior verified

| Mode | Risultato | Screenshot |
|---|---|---|
| Già Montato (default after Inizia) | Circuito montato batteria 9V + breadboard + R + LED rosso acceso | `audit-iter21-03-after-inizia.png` |
| Passo Passo | Banco con 9V + breadboard vuota + pannello dx "PRONTI A MONTARE" + bottone Avanti | `audit-iter21-05-passo-passo.png` |
| Libero | **9V + breadboard non rimossi** (residuo da Passo Passo); NO auto-Percorso, NO empty sandbox | `audit-iter21-06-libero.png` |

**Bug Libero**: mandate iter 18 dice Libero deve essere o (a) auto-Percorso o (b) empty sandbox. Stato attuale: hibrido, lascia componenti residui. **P1 BUG**.

**No "Percorso" mode**: mandate dichiara 4 modes (Percorso/Passo-Passo/Già-Montato/Libero) — UI mostra solo 3 (Passo Passo/Già Montato/Libero). **P2 mismatch mandate vs reality**.

---

## 6. Esperimenti test risultati

`v1-cap6-esp1` LED:
- Mount: PASS
- `getCurrentExperiment()` ritorna full schema: id, title, components(4), pinAssignments(4), connections(6), layout, steps(6), buildSteps(8), quiz(2), unlimPrompt, concept
- Simulazione: `simStatus="running"`, `buildMode="complete"`
- LED rosso acceso visibile in canvas (verified screenshot)

**Totale esperimenti getExperimentList**: vol1=38, vol2=27, vol3=27 = **92** (matches CLAUDE.md claim).

NON testato uno-per-uno: 91 esperimenti restanti **NON verificati** in questa sessione readonly. Mandate Andrea "MOLTI ESPERIMENTI NON FUNZIONANO" iter 18 PM rimane unverified live (richiede sweep playwright systematic in iter 22+).

---

## 7. window.__ELAB_API surface analysis

**Top-level keys** (62 totali):
- Lifecycle: version, name, getExperimentList, getExperiment, loadExperiment, getCurrentExperiment, mountExperiment
- Sim control: play, pause, reset, isSimulating, getSimulationStatus
- Component CRUD: addComponent, removeComponent, addWire, removeWire, moveComponent, clearAll, clearCircuit, setComponentValue, connectWire, getComponentStates, getComponentPositions, getSelectedComponent, getLayout
- Build flow: setBuildMode, getBuildMode, setToolMode, getToolMode, nextStep, prevStep, getBuildStepIndex
- Editor: getEditorCode, setEditorCode, showEditor, hideEditor, setEditorMode, getEditorMode, isEditorVisible, appendEditorCode, resetEditorCode, getExperimentOriginalCode, loadScratchWorkspace
- AI: askUNLIM, analyzeImage, captureScreenshot, compile
- Misc: undo, redo, canUndo, canRedo, highlightPin, serialWrite, showBom, hideBom, showSerialMonitor, getCircuitDescription, getSimulatorContext, toggleDrawing, isDrawingEnabled, on, off, interact

**`unlim` sub-namespace** (17 keys): highlightComponent, highlightPin, clearHighlights, serialWrite, getCircuitState, speakTTS, listenSTT, saveSessionMemory, recallPastSession, showNudge, alertDocente, generateQuiz, exportFumetto, videoLoad, sendMessage, version, info

**Onnipotenza ClawBot**: API surface AMPIO (62+17=79 funcs) ma **NON verificato live** se composite handler L1 morphic (CLAUDE.md iter 6 P1 0.6 box) opera in prod. Mandate iter 18 ClawBot 80-tool target — current ~79 surface esposta MA richiede live integration test.

---

## 8. Broken/incompiuto count REALE

Verificato live questa sessione (NON memoria):

| Item | Stato live | Severity |
|---|---|---|
| Compilatore Arduino n8n | **CORS BLOCKED** in prod | P0 |
| UNLIM ChatOverlay error UI | "UNLIM non ha risposto" anche se backend risponde correttamente | P0 |
| Modalità "Percorso" | NON esiste in UI (mandate dichiara 4 modes) | P1 |
| Libero mode | Hibrido con residui (NON auto-Percorso, NON empty) | P1 |
| Vol/pag VERBATIM | **0/12** rule Principio Zero, atteso 100% | P0 |
| Kit fisico citato | **0/12** rule Sense 2, atteso 100% | P0 |
| Edge Function cold-start | 503 prima call (Render cold start NOT mitigated) | P1 |
| Esperimenti 91/92 untested | NON verificati live (mandate Andrea explicit) | P0 |
| Toolbar AI command bar inline | NO (solo mascotte separato) | P2 |
| Class key validation | hardcoded "ELAB2026" client-side `WelcomePage.jsx:107` | P0 SECURITY |

**Onesto**: 10 broken/incompleti DI CUI 5 P0. Mandate Andrea "MOLTI ESPERIMENTI NON FUNZIONANO" rimane unverified (audit sweep richiesto iter 22+).

---

## 9. Top 10 P0/P1 issues

| # | Severity | Issue | Evidence |
|---|---|---|---|
| 1 | P0 | Compilatore n8n CORS blocked → simulatore non può compilare | console.log riga 4 + `audit-iter21-04-unlim-response.png` |
| 2 | P0 | UNLIM ChatOverlay UI mostra errore mentre backend risponde | `audit-iter21-04-unlim-response.png` |
| 3 | P0 | License key hardcoded client-side `ELAB2026` (`src/components/WelcomePage.jsx:107`) → bypass triviale | code grep |
| 4 | P0 | Vol/pag VERBATIM 0/12 violazione Principio Zero (regola 2) | UNLIM response sample §4 |
| 5 | P0 | Kit fisico mai citato (regola 9 + 12 Morfismo Sense 2) | UNLIM response sample §4 |
| 6 | P0 | 91/92 esperimenti untested live — mandate Andrea iter 18 | mandate Andrea esplicito |
| 7 | P1 | Modalità mismatch: 3 in UI vs 4 in mandate (manca Percorso) | snapshot UI ref e196-e217 |
| 8 | P1 | Libero mode hibrido con residui invece auto-Percorso/empty | `audit-iter21-06-libero.png` |
| 9 | P1 | Edge Function cold-start 503 (~18s warmup non mitigato) | console.log first call |
| 10 | P2 | Script MIME error (`text/html` invece `application/javascript`) → asset broken | console.log riga 1 |

---

## 10. Score finale onesto vs claim iter 18-20

| Iter | Claim | Score onesto live |
|---|---|---|
| iter 18 (CLAUDE.md) | 8.5/10 | **5.8/10** |
| iter 19 PHASE 1 (sprint history) | 8.7-8.8/10 (G45 anti-inflation cap) | **5.8/10** |
| iter 20 (proiezione) | 8.8-9.0/10 | non re-verificato live |

**Score iter 21 readonly ONESTO: 5.8/10**.

Breakdown:
- Stack live up: 1.5/2 (frontend OK, backend Edge FN OK ma cold-start, compilatore CORS down)
- Lavagna UI core: 1.5/2 (3 modes funziona ma mancanze toolbar/Percorso/Libero hibrido)
- UNLIM AI quality: 1.0/2 (PZ V3 9/12 = 75%; gap Vol/pag + kit fisico)
- Esperimenti 92: 1.0/2 (1/92 verificato live; mandate "many broken" unverified)
- Onestà CLAUDE.md vs reality: 0.8/2 (claim 8.5-8.8 inflato vs prod 5.8 = inflation ~3 punti, viola G45 mandate iter 18)

**Gap reale 3+ punti vs claim**. Cause primarie:
1. Self-score Phase 1 conta "deliverables shipped" non "features live verified end-to-end".
2. R5 91.80% misura singola fixture, non riflette esperienza prod (compile broken, ChatOverlay buggy).
3. "Box subtotal + bonus cumulative" pattern inflates ogni iter (+0.1-0.4 per "scaffold" mai eseguito live).

Mandate G45 anti-inflazione: iter 22+ deve usare Opus indipendente per re-score, non self-claim.

---

## Files refs

- Screenshots: `/Users/andreamarro/VOLUME 3/audit-iter21-{01-homepage,02-lavagna,03-after-inizia,04-unlim-response,05-passo-passo,06-libero}.png`
- Source code WelcomePage hardcoded key: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/components/WelcomePage.jsx:107`
- API surface: `window.__ELAB_API` 62 + 17 unlim funcs (live prod 2026-04-28 21:11 CEST)
- Edge Function endpoint: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
- Compile endpoint broken CORS: `https://n8n.srv1022317.hstgr.cloud/compile`

**EOF**
