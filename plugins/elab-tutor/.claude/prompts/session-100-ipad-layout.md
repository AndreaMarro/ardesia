# SESSION 100 — iPAD LAYOUT PERFECTION (FASE 3.1 della roadmap S94-S108)
## Responsive Layout · iPad Landscape · iPad Portrait · Slide-Over Panel · Toolbar Reflow

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 7 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge (colori + font tokenizzati) — 40+ hex → var(), 7 nuovi token
  ✅ S95 — Toolbar + Panels Minimal (spacing + transition + shadow tokenizzati) — 5 nuovi token, 17 edits, 6 file
  ✅ S96 — SVG Components + Canvas Polish — 22 SVG tokenizzati, 20 aria-label, 13 canvas tokens

FASE 2: FISICA + LOGICA (3 sessioni)
  ✅ S97 — Capacitor + Timing Educational — carica/scarica RC, LED fade, 3 fix CircuitSolver
  ✅ S98 — Component Behavior Parity — Motor direction CW/CCW, PhotoR visual, Servo cleanup, 3 file
  ✅ S99 — Error Feedback + Smart Diagnostics — short circuit auto-pause, disconnected pins, overload, ConfirmModal, sanitization

FASE 3: iPAD COMPLETO (2 sessioni)
  → S100 — iPad Layout Perfection  ← SEI QUI
     S101 — iPad Touch + Gestures

FASE 4: SCRATCH COMPLETAMENTO (2 sessioni)
     S102 — Scratch Steps per Tutti gli Esperimenti
     S103 — Scratch Blocks + Generator Expansion

FASE 5: GALILEO ONNISCIENTE (3 sessioni)
     S104 — Galileo Context Engine
     S105 — Galileo New Powers
     S106 — Galileo Stress Test + Personality

FASE 6: RIFINITURA + ACCESSIBILITÀ (1 sessione)
     S107 — UX Polish + Accessibility

FASE 7: AUDIT FINALE (1 sessione)
     S108 — Grand Final Audit + Deploy
```

**Documenti roadmap**: `docs/roadmap/` (8 file MD: README, 00-STATO-ATTUALE, 01-PIANO-MAESTRO, FASE-1 a FASE-7)
**Dettaglio questa sessione**: `docs/roadmap/FASE-3-IPAD.md` → sezione "S100 — iPad Layout Perfection"

---

## ═══ CONTESTO S94-S99 (sessioni precedenti) ═══════════════════════════

> **S94 ha fatto**: Tokenizzato 40+ hex colors e 6 font-family in 6 file JSX. Aggiunti 7 nuovi token colore a design-system.css. Build 0 errori. Token totali da 84 → 91.
>
> **S95 ha fatto**: 5 nuovi token (spacing + shadow), 17 edits in 6 file, tokenizzati border-radius, box-shadow, transitions. Token totali da 91 → 96.
>
> **S96 ha fatto**: Classificato 387 hex in 22 SVG componenti come UI (tokenizzabile) vs Physical (intoccabile). Tokenizzato hex UI in 22 SVG files. Aggiunto `role="img"` + `aria-label` in italiano su 20 componenti. Build PASS, 116 CSS var() token references, 20 aria-label confermati. Scratch Gate SG1-SG10 PASS.
>
> **S97 ha fatto**: 3 fix CircuitSolver: `_traceToSupply()` self-supply skip, `_solveCapacitor()` self-reference safety net, `_solveLED()` MNA-to-pathtracer fallback. Carica RC funzionante (0→9V rampa), scarica con LED fade (brightness 0.23→0). Build PASS, CoV 4/4.
>
> **S98 ha fatto**: Servo.jsx cleanup, MotorDC.jsx direction CW/CCW, PhotoResistor.jsx visual glow. 3 file, CoV 5/5.
>
> **S99 ha fatto**:
> - **Short Circuit Detection**: `getDiagnostics()` API su CircuitSolver, auto-pause via `handlePauseRef.current()` su onWarning short-circuit, warning persistente (no auto-dismiss)
> - **Disconnected Pins**: `_detectDisconnectedPins()` con Union-Find, orange pulsing `<circle>` su SimulatorCanvas per pin floating
> - **Overload Warnings**: `_detectOverload()` per LED 20-30mA yellow zone, yellow pulsing `<rect>` su SimulatorCanvas
> - **Custom ConfirmModal**: Nuovo file `src/components/common/ConfirmModal.jsx` con hook `useConfirmModal()` (async Promise pattern). Sostituito `confirm()` in ElabTutorV4.jsx e TeacherDashboard.jsx
> - **CircuitState Sanitization**: healthSummary potenziato con diagnostics (shortCircuit, overload, disconnectedPins), MAX_CONTEXT_CHARS=3000 troncamento
> - **Build PASS**: 0 errori, 6 file modificati. CoV 5/5. Scratch Gate PASS.
>
> **File modificati in S99**: CircuitSolver.js (3 nuovi metodi), NewElabSimulator.jsx (onWarning + diagnostics + sanitization), SimulatorCanvas.jsx (2 visual overlays), ConfirmModal.jsx (NEW), ElabTutorV4.jsx (confirmModal hook), TeacherDashboard.jsx (confirmModal hook)

### Score attuali (fine S99)
| Area | Score | Target S100 |
|------|-------|-------------|
| Estetica | 8.5/10 | **8.5** (non toccare in S100) |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.9/10 | **9.9** (non toccare) |
| Simulatore (physics) | 9.0/10 | **9.0** (non toccare) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| Responsive/A11y | 8.0/10 | **9.0** (+iPad layout fixes) |
| **iPad (landscape 1180×820)** | **7.0/10** | **8.5+** |
| **iPad (portrait 768×1024)** | **7.0/10** | **8.0+** |

---

## ═══ STATO ATTUALE iPAD (cosa è già stato fatto in S86) ═══════════════

### S86 Fixes già applicati:
1. **Toolbar landscape**: overflow 0px (era 397px), spacer collapse, Galileo/info hidden at ≤1365px
2. **Portrait slide-over**: Scratch vertical stack (Blockly 60% + code 40%), toolbar fits 768px
3. **Touch targets ≥44px**: 6 fix in 4 file (SerialMonitor iconBtn, ▼ toggle, hamburger, editor tabs, font btns, compile btn)
4. **z-index audit**: Canvas 20-80 < Editor 200 < Chat 400 < Hints 1000 — no conflicts

### Problemi noti ANCORA APERTI:
- **Canvas non scala su iPad landscape**: breadboard/componenti troppo piccoli, molto spazio sprecato
- **Panel laterali (editor, chat) troppo stretti** su 768px portrait
- **Component palette overflow** su schermi ≤1024px
- **Drawer ComponentDrawer**: non ottimizzato per touch (target piccoli per i pezzi)
- **Breakpoints CSS inconsistenti**: mix di 768px, 900px, 1024px, 1200px, 1365px, 1400px

---

## ═══ ANALISI PRE-FATTA: iPad Layout ═══════════════════════════════

### File principali da analizzare/modificare:
1. **`ElabSimulator.css`** — breakpoints responsive, panel widths, canvas sizing
2. **`NewElabSimulator.jsx`** — layout logic, panel show/hide, responsive state
3. **`layout.module.css`** — grid/flex layout del simulatore
4. **`App.jsx`** — top bar responsive, mobile detection
5. **`SimulatorCanvas.jsx`** — canvas SVG viewBox per scaling
6. **`ComponentPalette.jsx`** — palette layout per touch

### Breakpoints target:
```
Mobile:        < 768px   (telefono — fuori scope S100)
iPad Portrait:   768px - 1023px
iPad Landscape:  1024px - 1365px
Desktop:       ≥ 1366px
```

---

## ═══ COSA FARE IN S100 (5 task) ═══════════════════════════════════

### Task 1: Audit CSS Breakpoints
- Mappare TUTTI i breakpoints in tutti i file CSS/JSX
- Definire 3 breakpoints canonici: `--bp-tablet: 768px`, `--bp-landscape: 1024px`, `--bp-desktop: 1366px`
- Consolidare breakpoints spaziati e incoerenti

### Task 2: iPad Landscape Layout (1180×820)
- Canvas SVG viewBox: auto-scale per riempire lo spazio disponibile
- Panel laterali: width proporzionale (editor 40%, canvas 60% circa)
- Toolbar: verificare che TUTTO ci stia senza overflow
- ComponentDrawer: larghezza sufficiente per 3 colonne di componenti

### Task 3: iPad Portrait Layout (768×1024)
- Layout verticale: canvas sopra, panels sotto (a tab o accordion)
- Toolbar compatta: icone-only senza label
- Editor/Chat in bottom sheet o tab panel
- ComponentDrawer: full-width con scroll orizzontale

### Task 4: Panel Resize/Toggle System
- Bottone per espandere/collassare panel laterale
- Double-tap o swipe per toggle panel
- Animazione smooth (CSS transition, non JS animation)
- Stato persistente (ricordare se l'utente preferisce panel aperto/chiuso)

### Task 5: Build + CoV + Scratch Gate
- `npm run build` → 0 errori
- CoV per ogni modifica:
  - [ ] Breakpoints consolidati, nessun conflitto
  - [ ] iPad landscape: canvas full-size, toolbar no overflow, panels usabili
  - [ ] iPad portrait: layout verticale, toolbar compatta, panels accessibili
  - [ ] Panel toggle funzionante
  - [ ] Desktop: ZERO regressioni
- Scratch Gate SG1-SG10

---

## ═══ VINCOLI E REGOLE ═══════════════════════════════════════════════

1. **ZERO regressioni desktop**: Il layout desktop (≥1366px) NON deve cambiare
2. **ZERO regressioni Scratch**: Non toccare ScratchEditor, scratchBlocks, scratchGenerator
3. **ZERO regressioni physics**: Non toccare CircuitSolver, _solveCapacitor, _solveLED, ecc.
4. **Mobile (<768px) fuori scope**: Non ottimizzare per telefono in S100
5. **CSS-first**: Preferire soluzioni CSS (media queries, container queries) su JavaScript responsive
6. **Token compliance**: Usare SOLO i token CSS definiti in design-system.css (var(--xxx))
7. **Touch targets**: Minimo 44×44px su tutti gli elementi interattivi iPad
8. **Build MUST pass**: `npm run build` con 0 errori prima di chiudere

---

## ═══ DELIVERABLES S100 ═══════════════════════════════════════════════

Alla fine della sessione devono esistere:
1. Breakpoints consolidati in design-system.css (3 canonical + CSS custom properties)
2. iPad landscape layout funzionante (canvas auto-scale, panels proporzionali, toolbar ok)
3. iPad portrait layout funzionante (vertical stack, compact toolbar)
4. Panel toggle system
5. Build PASS + CoV completa
6. `.claude/prompts/session-101-ipad-touch.md` — prompt per sessione successiva

---

## ═══ SCORING S100 ═══════════════════════════════════════════════════

| Metrica | Peso | Criterio |
|---------|------|----------|
| iPad Landscape | 30% | Canvas auto-scale, no overflow, panels usabili |
| iPad Portrait | 25% | Layout verticale, toolbar compatta, panels accessibili |
| Breakpoints | 15% | 3 canonici, consolidati, no conflitti |
| Panel toggle | 15% | Smooth, persistente, accessibile |
| Zero regressions | 15% | Desktop, Scratch, Physics tutti invariati |

**Target**: iPad score da 7.0 → **8.5+** landscape, **8.0+** portrait
