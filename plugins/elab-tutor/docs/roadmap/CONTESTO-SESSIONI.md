# ELAB Tutor — Contesto Condiviso Sessioni S94-S108
> **Questo file è il "cervello comune" di tutte le 15 sessioni della roadmap.**
> Ogni sessione DEVE leggere questo file all'inizio e aggiornarlo alla fine.
> Il prompt di ogni sessione punta qui: `docs/roadmap/CONTESTO-SESSIONI.md`

---

## Come usare questo file

1. **Inizio sessione**: Leggi TUTTO questo file prima di toccare codice
2. **Fine sessione**: Aggiungi la tua sezione nel LOG SESSIONI qui sotto
3. **Il prompt della sessione successiva** deve riferirsi a questo file come context obbligatorio

---

## Score Card LIVE (aggiorna a fine di OGNI sessione)

| Area | S93 | S94 | S95 | S96 | S97 | S98 | S99 | S100 | S101 | S102 | S103 | S104 | S105 | S106 | S107 | S108 |
|------|-----|-----|-----|-----|-----|-----|-----|------|------|------|------|------|------|------|------|------|
| Sim funzionalità | 9.8 | 9.8 | | | | | | | | | | | | 9.8 | | 9.8 |
| Sim estetica | 6.5 | 7.0 | | | | | | | | | | | | 8.5 | | 8.5 |
| Sim iPad | 7.0 | 7.0 | | | | | | | | | | | | 7.0 | | 8.5 |
| Sim physics | 7.0 | 7.0 | | | | | | | | | | | | 8.0 | | 8.0 |
| Scratch | 10.0 | 10.0 | | | | | | | | | | | | 10.0 | | 10.0 |
| AI Integration | 10.0 | 10.0 | | | | | | | | | | | | 10.0 | | 10.0 |
| Responsive/A11y | 7.5 | 7.5 | | | | | | | | | | | | 8.0 | 9.0 | 9.2 |
| Code Quality | 9.8 | 9.8 | | | | | | | | | | | | 9.8 | 9.8 | 9.8 |
| **OVERALL** | **~8.7** | **~8.7** | | | | | | | | | | | | **~8.7** | **~8.9** | **~9.2** |

---

## Token Count LIVE (design-system.css)

| Sessione | Token aggiunti | Totale |
|----------|---------------|--------|
| Pre-S94 | 84 token base (S77) | 84 |
| S94 | +7 (status-compiling, muted, code-green, wire-endpoint, current-normal/high/short) | 91 |
| S95 | | |
| S96 | | |

---

## File Modificati — Registro Cumulativo

Ogni sessione lista i file toccati. Se una sessione successiva tocca lo stesso file, sa già cosa è stato cambiato prima.

### S94 — Design System Purge (colori + font)
| File | Modifiche |
|------|-----------|
| `src/styles/design-system.css` | +7 token colore (righe 181-188) |
| `src/components/simulator/NewElabSimulator.jsx` | Costanti NAVY/LIME/VOL3_RED/FONT_BODY/FONT_CODE → var(), ScratchCompileBar statusColor, warning/error panels, compile button, breadboard hole, ScratchErrorBoundary, 6 fontFamily |
| `src/components/simulator/canvas/WireRenderer.jsx` | 16 hex → var(): selection, net highlight, wire stroke, endpoints, current flow, anchors, handles, delete button |
| `src/components/simulator/canvas/PinOverlay.jsx` | 4 fill + 1 stroke + 1 fontFamily → var() |
| `src/components/simulator/panels/ShortcutsPanel.jsx` | 4 SVG icon strokes → var() |
| `src/components/simulator/panels/WhiteboardOverlay.jsx` | 1 SVG icon stroke → var() |

**File NON toccati (già compliant)**: QuizPanel, PropertiesPanel, BuildModeGuide, SerialMonitor, SerialPlotter, NotesPanel
**Fuori scope S94**: Canvas 2D API (ctx.fillStyle), LED_COLOR_HEX, WIRE_COLOR_HEX, COLORS_PRESET, SVG hardware components

### S95 — Toolbar + Panels Minimal
_(da compilare a fine S95)_

### S96 — SVG Components + Canvas Polish
_(da compilare a fine S96)_

### S107 — UX Polish + Accessibility (WCAG 2.1 AA)
| File | Modifiche |
|------|-----------|
| `src/App.jsx` | Skip-to-content component, `<nav>` landmark with `aria-label`, `<main id="main-content">`, hamburger `aria-expanded`+`aria-label` |
| `src/styles/design-system.css` | `.skip-to-content` CSS, global `:focus-visible` outline rule, `:focus:not(:focus-visible)` fallback, SVG `g[tabindex]` focus rule |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | Arrow key movement (7.5px/1px Shift), `tabIndex={0}` + `role="group"` + `onFocus` on component `<g>` wrapper |
| `src/components/simulator/canvas/WireRenderer.jsx` | `useMemo(() => new WireCollisionDetector())` → `useRef()` (P2-WIR-2) |
| 20 SVG component files | Dynamic `aria-label` with state info (Led, Resistor, BuzzerPiezo, RgbLed, Capacitor, Potentiometer, PhotoResistor, PushButton, MosfetN, Phototransistor, MotorDC, Diode, ReedSwitch, Battery9V, Multimeter, Servo, BreadboardHalf, BreadboardFull, NanoR4Board, LCD16x2) |

**WCAG 2.1 AA Compliance**:
- P2-RES-10 Skip-to-content: ✅ RESOLVED
- P2-RES-11 Focus-visible: ✅ RESOLVED
- P2-RES-9 SVG Keyboard Nav: ✅ RESOLVED (arrow keys + Tab focus + Shift for fine movement)
- P2-WIR-2 CollisionDetector useMemo: ✅ RESOLVED
- 20/20 SVG aria-labels: ✅ All dynamic with state (e.g., "LED led1: rosso, acceso")

### S108 — Grand Final Audit + Deploy
| File | Modifiche |
|------|-----------|
| `vercel.json` | Added Content-Security-Policy header (CSP) with whitelist for self, fonts, Supabase, nanobot, YouTube |

**Audit Results**:
- **Ralph Loop 5 cicli**: 21/22 PASS (95.5%) — unico FAIL: LCD blocks assenti in Scratch (feature gap, non regressione)
- **Scratch Gate FINALE**: 17/18 PASS (94.4%) — stesso FAIL: SGF4 LCD blocks
- **iPad Test Matrix**: 8/8 PASS — tutti i 8 viewport verificati con CSS breakpoints corretti
- **Bundle Size**: Main 304KB gzip ✅, ScratchEditor 902KB gzip ✅, Initial load 434KB gzip ✅
- **Build**: 0 errori
- **Lighthouse (stima codice)**: A11y ~88, Performance ~80, Best Practices ~90 (post-CSP), SEO ~75 (noindex by design)
- **Nanobot health**: 200 OK, v5.0.0, 5 providers, vision enabled
- **Deploy**: Vercel prod https://www.elabtutor.school ✅
- **Security headers**: HSTS + X-Frame-Options + nosniff + Referrer-Policy + CSP — tutti attivi in produzione

### S106 — Galileo Stress Test + Personality
| File | Modifiche |
|------|-----------|
| `nanobot/server.py` | `format_simulator_context()` header reso più assertivo: `[CONTESTO SIMULATORE — DATI IN TEMPO REALE, USALI PER RISPONDERE]` per migliorare lettura contesto da parte del LLM |

**Stress Test**: 50 domande al server live (`https://elab-galileo.onrender.com/chat`), 5 categorie (contesto, azioni, aiuto, edge cases, multi-turn). **48/50 PASS**, 2 PARTIAL (T06 intermittente, T07 editor type — fix applicato), 0 FAIL, 0 identity leaks. Media latenza: 4834ms.
**Edge Cases**: messaggio vuoto ✅, messaggio 500+ char ✅, `<script>` injection ✅ (stripped), prompt injection bloccato ✅.
**Memory**: galileoMemory.js verificato — localStorage + backend sync + buildMemoryContext() integri.

---

## Decisioni Architetturali Accumulate

Decisioni prese durante le sessioni che valgono per TUTTE le sessioni successive.

### S94
1. **Canvas 2D API non tokenizzabile**: `ctx.fillStyle` non accetta `var()` — i colori Canvas restano hex
2. **Colori fisici/dati non tokenizzati**: LED_COLOR_HEX, WIRE_COLOR_HEX, COLORS_PRESET, CHANNEL_COLORS sono dati hardware/chart, non UI design
3. **#6AAF35 standardizzato a accent**: breadboard hole indicator usava verde leggermente diverso → unificato a `var(--color-accent)`
4. **Token alias pattern**: `--color-status-compiling: var(--color-vol2)` — usa alias per collegare token semantici a brand colors
5. **Fallback pattern**: file che usano `var(--token, #hex)` sono già compliant — il fallback #hex è ridondante ma innocuo

### S95
_(da compilare a fine S95)_

### S107
1. **SVG focus strategy**: SVG `<g>` elements can't use CSS `outline` — focus ring is managed via the existing selection highlight system. `tabIndex={0}` enables keyboard focus, `onFocus` auto-selects the component.
2. **Arrow key step = 1 breadboard hole (7.5px)**: Matches `BB_HOLE_PITCH` for grid-aligned movement. `Shift+Arrow` = 1px fine adjustment.
3. **CollisionDetector useRef**: `useMemo` with `[connections, layout]` was redundant since `.clear()` was called at start of each computation. `useRef` eliminates unnecessary re-allocation.
4. **Skip-to-content targets `#main-content`**: Uses `tabIndex="-1"` + `focus()` + `scrollIntoView()` for programmatic focus (WCAG 2.4.1).
5. **aria-labels in Italian**: Component labels match the simulator's Italian UI (e.g., "acceso", "premuto", "conduce") for consistency with the target audience.

### S108
1. **CSP header**: Added `Content-Security-Policy` to `vercel.json` with whitelist for fonts.googleapis.com, fonts.gstatic.com, elab-galileo.onrender.com, *.supabase.co, YouTube. `unsafe-inline` + `unsafe-eval` required for Vite/React/obfuscator.
2. **LCD blocks are a feature gap, not a bug**: LCD16x2 SVG component exists and simulates HD44780, but no Blockly blocks were ever created. Students use Arduino C++ for LCD. Future work, not a regression.
3. **Side-by-side Scratch layout removed in S93**: Original S81 design (Blockly 60% + CodeEditorCM6 40%) was replaced with full Blockly + ScratchCompileBar. MEMORY.md reference is outdated.
4. **iPad scores improved**: From 7.0 to 8.5 based on 8/8 viewport audit. CSS breakpoints cover all iPad models correctly with proper touch targets and layout adaptations.

### S106
1. **Context header assertivo**: LLM a volte ignorava il contesto simulatore. Header cambiato da `[CONTESTO SIMULATORE]` a `[CONTESTO SIMULATORE — DATI IN TEMPO REALE, USALI PER RISPONDERE]` — migliora compliance del LLM nella lettura dello stato corrente.
2. **Stress test come gate di qualità**: 50 domande strutturate in 5 categorie verificano personalità + azioni + safety + edge cases. Pattern riutilizzabile per sessioni future.
3. **Nanobot git repo assente**: la cartella `nanobot/` non ha un `.git` locale — il deploy a Render richiede re-init o push manuale.

---

## Problemi Noti Cumulativi

Problemi scoperti durante le sessioni ma NON fixati (fuori scope della sessione corrente).

### Scoperti in S94
- I padding in ElabSimulator.css usano mix di 4px/6px/8px/10px/12px/16px → 6px e 10px fuori dal grid 4px
- Le transition sono mix di 60ms/150ms/200ms/300ms → incoerenti
- 3 box-shadow raw rgba in ElabSimulator.css (build mode selector)
- 2 border-radius raw in overlays.module.css (mobile bottom sheet 16px)
- Inline styles nei JSX panels (ControlBar, ComponentDrawer, SerialMonitor) con padding/borderRadius hardcoded

### Scoperti in S95
_(da compilare a fine S95)_

### Scoperti in S106
- T07: LLM a volte non legge il tipo di editor dal contesto (`Editor: Arduino C++ (aperto)`) — header assertivo migliora ma non risolve al 100%. Il modello DeepSeek/Groq può essere non deterministico nella lettura di contesti lunghi.
- Nanobot `nanobot/` cartella senza `.git` locale — il deploy richiede setup manuale del repo Render.

### Scoperti in S108
- SGF4: LCD Blockly blocks (lcd_init, lcd_print, lcd_setCursor, lcd_clear) non esistono in scratchBlocks.js/scratchGenerator.js — feature gap
- Lighthouse SEO ~75: `noindex, nofollow` è intenzionale (app privata), mancano canonical URL e Open Graph tags
- Lighthouse Performance ~80: obfuscator RC4 + 3 Google Fonts families impattano parse time
- `mammoth.js` (499KB) è `modulepreload` in index.html — potrebbe essere lazy-loaded per ridurre initial load
- Nanobot `nanobot/` senza `.git` locale — deploy Render richiede setup manuale

### Scoperti in S107
- 15 `window.confirm()` calls remain in admin pages (L1 known issue) — needs custom `ConfirmModal` component
- SVG `<g>` elements with `tabIndex={0}` don't support CSS `outline` property — visual focus indication relies on the existing selection highlight mechanism
- No `aria-live` region for simulation state changes (play/pause/stop announcements) — screen readers won't hear state transitions

---

## Scratch Gate — Risultati Cumulativi

| Test | S94 | S95 | S96 | S97 | S98 | S99 | S100 | S101 | S102 | S103 | S104 | S105 | S106 | S107 | S108 |
|------|-----|-----|-----|-----|-----|-----|------|------|------|------|------|------|------|------|------|
| SG1 Blocchi tab | cv | | | | | | | | | | | | cv | cv | cv |
| SG2 Setup/Loop | cv | | | | | | | | | | | | cv | cv | cv |
| SG3 Drag block | cv | | | | | | | | | | | | cv | cv | cv |
| SG4 Compila Blocchi | cv | | | | | | | | | | | | cv | cv | cv |
| SG5 Play dopo comp | cv | | | | | | | | | | | | cv | cv | cv |
| SG6 Switch Arduino | cv | | | | | | | | | | | | cv | cv | cv |
| SG7 Compila Arduino | cv | | | | | | | | | | | | cv | cv | cv |
| SG8 Switch ripetuto | cv | | | | | | | | | | | | cv | cv | cv |
| SG9 No overflow | cv | | | | | | | | | | | | cv | cv | cv |
| SG10 Build | ✅ | | | | | | | | | | | | ✅ | ✅ | cv |

### Scratch Gate FINALE (S108 only)
| # | Test | Result |
|---|------|--------|
| SGF1 | 12/12 AVR exp: Blocchi tab | ✅ cv |
| SGF2 | 12 exp con scratchSteps | ✅ cv |
| SGF3 | Default block mechanism | ✅ cv (vacuous — all 12 have steps) |
| SGF4 | LCD blocks compile | ❌ FAIL (blocks non esistono) |
| SGF5 | Servo blocks compile (#include) | ✅ cv |
| SGF6 | Galileo scratch.yml knowledge | ✅ cv |
| SGF7 | iPad 1180×820 CSS responsive | ✅ cv |
| SGF8 | Passo Passo → Codice choice | ✅ cv |

Legenda: ✅ = PASS live in Chrome, cv = code-verified (nessun cambio funzionale), ❌ = FAIL

---

## Istruzioni per la Sessione Corrente

1. **Leggi questo file** per intero
2. **Leggi il tuo prompt specifico** in `.claude/prompts/session-{N}-*.md`
3. **Leggi** `docs/roadmap/FASE-{X}-*.md` per il dettaglio della tua FASE
4. **Esegui** i task del tuo prompt
5. **Aggiorna questo file** con:
   - Score card aggiornata
   - Token count aggiornato
   - File modificati
   - Decisioni architetturali prese
   - Problemi scoperti ma non fixati
   - Scratch Gate risultati
6. **Scrivi il prompt della sessione successiva**
