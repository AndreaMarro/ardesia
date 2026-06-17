# SESSION 99 — ERROR FEEDBACK + SMART DIAGNOSTICS (FASE 2.3 della roadmap S94-S108)
## Short Circuit Detection · Missing Connections · Component Overload · Custom Modals · CircuitState Sanitization

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 6 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge (colori + font tokenizzati) — 40+ hex → var(), 7 nuovi token
  ✅ S95 — Toolbar + Panels Minimal (spacing + transition + shadow tokenizzati) — 5 nuovi token, 17 edits, 6 file
  ✅ S96 — SVG Components + Canvas Polish — 22 SVG tokenizzati, 20 aria-label, 13 canvas tokens

FASE 2: FISICA + LOGICA (3 sessioni)
  ✅ S97 — Capacitor + Timing Educational — carica/scarica RC, LED fade, 3 fix CircuitSolver
  ✅ S98 — Component Behavior Parity — Motor direction CW/CCW, PhotoR visual, Servo cleanup, 3 file
  → S99 — Error Feedback + Smart Diagnostics  ← SEI QUI

FASE 3: iPAD COMPLETO (2 sessioni)
     S100 — iPad Layout Perfection
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
**Dettaglio questa sessione**: `docs/roadmap/FASE-2-FISICA.md` → sezione "S99 — Error Feedback + Smart Diagnostics"

---

## ═══ CONTESTO S94-S98 (sessioni precedenti) ═══════════════════════════

> **S94 ha fatto**: Tokenizzato 40+ hex colors e 6 font-family in 6 file JSX. Aggiunti 7 nuovi token colore a design-system.css. Build 0 errori. Token totali da 84 → 91.
>
> **S95 ha fatto**: 5 nuovi token (spacing + shadow), 17 edits in 6 file, tokenizzati border-radius, box-shadow, transitions. Token totali da 91 → 96.
>
> **S96 ha fatto**: Classificato 387 hex in 22 SVG componenti come UI (tokenizzabile) vs Physical (intoccabile). Tokenizzato hex UI in 22 SVG files. Aggiunto `role="img"` + `aria-label` in italiano su 20 componenti. Build PASS, 116 CSS var() token references, 20 aria-label confermati. Scratch Gate SG1-SG10 PASS.
>
> **S97 ha fatto**: 3 fix CircuitSolver: `_traceToSupply()` self-supply skip, `_solveCapacitor()` self-reference safety net, `_solveLED()` MNA-to-pathtracer fallback. Carica RC funzionante (0→9V rampa), scarica con LED fade (brightness 0.23→0). Build PASS, CoV 4/4.
>
> **S98 ha fatto**:
> - **Analisi approfondita**: LED PWM, Buzzer visual, PotOverlay, LdrOverlay GIÀ funzionanti dal codebase precedente
> - **Servo.jsx**: Rimosso `void state;` ridondante (angle già letto da state.angle). Aggiunto `isActive` da state.
> - **MotorDC.jsx**: Aggiunto `state.direction` (CW/CCW) all'animazione SVG. `from/to` invertiti per CCW (360→0). Condizione `speed > 0` per fermare motore visivamente. DefaultState aggiornato con `direction: 1`.
> - **PhotoResistor.jsx**: Rimosso `void state;`. Aggiunto `lightLevel` visual: glow giallo proporzionale + frecce luce in stile Phototransistor. Componente ora reagisce visivamente al livello di luce.
> - **Build PASS**: 0 errori, 3 file modificati. CoV 5/5 (Servo, Motor, PhotoR, Capacitor intatta, Scratch intatto).
>
> **File modificati in S98**: Servo.jsx (1 edit), MotorDC.jsx (3 edit), PhotoResistor.jsx (1 edit totale rewrite visual section)

### Score attuali (fine S98)
| Area | Score | Target S99 |
|------|-------|------------|
| Estetica | 8.5/10 | **8.5** (non toccare in S99) |
| Code Quality | 9.8/10 | **9.8+** (custom modals migliorano) |
| Simulatore funzionalità | 9.8/10 | **9.9** (+error feedback educativo) |
| Simulatore (physics) | 8.5/10 | **9.0** (+short circuit detection, warnings) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| Responsive/A11y | 8.0/10 | **8.0** |

---

## ═══ ANALISI PRE-FATTA: Error Feedback ═══════════════════════════

### 1. Short Circuit Detection
**Dove implementare**: `CircuitSolver.js` → `solve()` method o post-solve check.
- Verificare se esiste un percorso diretto (R=0 o R molto basso) tra V+ e GND.
- Se MNA matrix è singolare o corrente > threshold (es. 10A) → corto.
- **Visual**: Flash rosso sui fili coinvolti (SimulatorCanvas wire highlight)
- **Toast**: Usare sistema toast esistente o crearne uno minimalista
- **Auto-pause**: Chiamare `handlePause()` automaticamente

### 2. Missing Connection Warnings
**Dove**: Post-solve analisi in CircuitSolver o in `startAVRPolling` callback.
- Per ogni componente, verificare che tutti i pin siano in un net con almeno un altro pin.
- Pin isolato → `comp.state.disconnectedPins = ['anode']`
- **Visual**: Cerchio arancione lampeggiante sopra il pin nel canvas

### 3. Component Overload
**Dove**: `_solveLED()` già ha `burned` state. Manca:
- Warning prima del burn (corrente 20-30mA = zona gialla)
- LED senza resistore → detection + warning

### 4. Custom Modals (sostituire confirm())
**File**: Cercare `confirm(` in tutto il codebase.
- Creare `<ConfirmModal>` component con design coerente
- Props: `title`, `message`, `onConfirm`, `onCancel`
- Sostituire tutti i `window.confirm()` con il modal custom

### 5. CircuitState Sanitization (P2-NAN-5)
**File**: `ElabTutorV4.jsx` dove circuitState viene inviato a Galileo.
- Limitare la dimensione dei dati
- Rimuovere informazioni non necessarie per il contesto AI

---

## ═══ COSA FARE IN S99 (5 task) ═══════════════════════════════════

### Task 1: Short Circuit Detection
- CircuitSolver: aggiungere `_detectShortCircuit()` post-solve
- Controllare se V+ e GND sono nello stesso net dopo wire merge
- Se cortocircuito: `this._shortCircuit = { nets, components }` + log
- Propagare al React layer via `getState()` → `_shortCircuit` flag
- NewElabSimulator: auto-pause + toast "Cortocircuito rilevato!"
- SimulatorCanvas: flash rosso sui fili coinvolti

### Task 2: Missing Connection Warnings
- CircuitSolver post-solve: per ogni componente, check pin connectivity
- Output: `comp.state.disconnectedPins = [...]` array
- SimulatorCanvas: cerchio arancione lampeggiante su pin disconnessi

### Task 3: Component Overload Warnings
- LED senza resistore: già `burned=true` ma aggiungere warning pre-burn
- LED corrente 20-30mA: zona gialla → `comp.state.warning = 'overcurrent'`
- Visual: bordo giallo attorno al LED in zona warning

### Task 4: Custom Modals
- Cercare tutti i `confirm(` nel codebase
- Creare `<ConfirmModal>` in `src/components/ui/`
- Sostituire ogni `window.confirm()` con hook/state + modal

### Task 5: Build + CoV + Scratch Gate
- `npm run build` → 0 errori
- CoV per ogni modifica
- Scratch Gate SG1-SG10 PASS
- Test: creare cortocircuito → warning? LED senza R → warning? Pin disconnesso → arancione?

---

## ═══ COSA NON TOCCARE ═══════════════════════════════════════════

1. **SVG component colors**: S96 ha tokenizzato tutto, non modificare colori fisici
2. **Pin positions**: INTOCCABILI su tutti i componenti
3. **aria-label**: già aggiunti in S96, non modificare
4. **Capacitor logic**: S97 ha implementato carica/scarica, non toccare
5. **Motor direction / PhotoR visual**: S98 ha implementato, non modificare
6. **Layout/CSS**: non toccare toolbar, panels, spacing
7. **Scratch/Blockly**: non toccare nulla relativo a Blockly workspace
8. **iPad breakpoints**: non toccare media queries

---

## ═══ CONTEXT FILES ═══════════════════════════════════════════════

### Tier 1: LEGGERE SUBITO
```
src/components/simulator/engine/CircuitSolver.js         # Short circuit + disconnect detection
src/components/simulator/NewElabSimulator.jsx             # Toast + auto-pause + state propagation
```

### Tier 2: VISUAL FEEDBACK
```
src/components/simulator/canvas/SimulatorCanvas.jsx      # Wire flash + pin warning circles
src/styles/design-system.css                              # Token per warning colors
```

### Tier 3: CUSTOM MODALS
```
Cercare: `confirm(` in tutto src/                         # Tutti gli usi di window.confirm
src/components/ui/                                        # Dove creare ConfirmModal
```

### Tier 4: SANITIZATION
```
src/components/simulator/ElabTutorV4.jsx                 # circuitState invio a Galileo
```

---

## ═══ REGOLE INVIOLABILI ═══════════════════════════════════════════

1. **ZERO REGRESSIONI**: Se funzionava in S98, DEVE funzionare in S99. Se rotto → REVERT IMMEDIATO.
2. **MAI agenti paralleli**: Tutto sequenziale, verificato passo passo.
3. **Chrome Control per validazione**: Senza `preview_inspect` / `preview_eval` / `preview_screenshot` = non puoi dire PASS.
4. **Pin positions INTOCCABILI**: Su TUTTI i componenti.
5. **Approccio EDUCATIONAL**: Feedback visivo chiaro, comprensibile da bambini delle medie.
6. **Scratch Gate SG1-SG10 obbligatorio**: Anche se non tocchiamo Scratch, verificare che non abbiamo rotto nulla.
7. **Commit solo su richiesta**: NON commit automatici.
8. **CoV obbligatorio**: Chain of Verification su OGNI modifica.
9. **Capacitor + Motor + PhotoR INTOCCABILI**: La logica S97-S98 funziona — non modificare.

---

## ═══ DELIVERABLES S99 ═══════════════════════════════════════════

1. ✅ Short circuit detection con auto-pause e visual feedback
2. ✅ Missing connection warnings (pin arancione lampeggiante)
3. ✅ Component overload pre-burn warning (LED zona gialla)
4. ✅ Custom `<ConfirmModal>` che sostituisce `window.confirm()`
5. ✅ CircuitState sanitization prima dell'invio a Galileo
6. ✅ Build 0 errori
7. ✅ Chrome Control verification per ogni feature
8. ✅ Scratch Gate SG10 PASS

### Score card attesa post-S99
| Area | Score | Delta |
|------|-------|-------|
| Simulatore (physics) | 9.0/10 | +0.5 (error detection) |
| Code Quality | 9.9/10 | +0.1 (custom modals, sanitization) |
| Estetica | 8.5/10 | = |
| Regressioni | **ZERO** | — |

---

## ═══ HANDOFF OBBLIGATORIO ═══════════════════════════════════════════

**A fine sessione DEVI**:

1. **Stringa di handoff** — Riassunto completo di cosa è stato fatto, file modificati, score aggiornati.
2. **Prompt S100** — Scrivi e salva il prompt per la sessione successiva in `.claude/prompts/session-100-ipad-layout.md`. Il prompt deve:
   - Includere la mappa roadmap 15 sessioni con `← SEI QUI` aggiornato su S100
   - Riassumere cosa ha fatto S94-S99 (contesto per S100)
   - Contenere l'analisi pre-fatta per S100 (iPad layout: landscape 1180x820, portrait 768x1024, toolbar fit, canvas resize, panel responsiveness)
   - Seguire lo stesso formato di questo prompt
   - Riferirsi a `docs/roadmap/FASE-3-IPAD.md` per dettaglio S100

### Catena obbligatoria
```
✅ S95 produce → .claude/prompts/session-96-svg-canvas-polish.md
✅ S96 produce → .claude/prompts/session-97-capacitor-transient.md
✅ S97 produce → .claude/prompts/session-98-component-behavior.md
✅ S98 produce → .claude/prompts/session-99-error-feedback.md
S99 produce → .claude/prompts/session-100-ipad-layout.md
S100 produce → .claude/prompts/session-101-ipad-touch.md
S101 produce → .claude/prompts/session-102-scratch-steps.md
S102 produce → .claude/prompts/session-103-scratch-blocks.md
S103 produce → .claude/prompts/session-104-galileo-context.md
S104 produce → .claude/prompts/session-105-galileo-powers.md
S105 produce → .claude/prompts/session-106-galileo-stress.md
S106 produce → .claude/prompts/session-107-ux-a11y.md
S107 produce → .claude/prompts/session-108-grand-final.md
S108 → FINE ROADMAP
```

**Se la sessione finisce senza aver scritto il prompt della successiva, la sessione NON è completa.**
Il prompt successivo DEVE includere la sezione HANDOFF OBBLIGATORIO con la stessa catena aggiornata.
