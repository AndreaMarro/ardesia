# SESSION 98 — COMPONENT BEHAVIOR PARITY (FASE 2.2 della roadmap S94-S108)
## LED PWM · Buzzer Tone Visual · Motor Rotation · Servo Angle · Potentiometer · PhotoR · ZERO REGRESSIONI

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 5 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge (colori + font tokenizzati) — 40+ hex → var(), 7 nuovi token
  ✅ S95 — Toolbar + Panels Minimal (spacing + transition + shadow tokenizzati) — 5 nuovi token, 17 edits, 6 file
  ✅ S96 — SVG Components + Canvas Polish — 22 SVG tokenizzati, 20 aria-label, 13 canvas tokens

FASE 2: FISICA + LOGICA (3 sessioni)
  ✅ S97 — Capacitor + Timing Educational — carica/scarica RC, LED fade, 3 fix CircuitSolver
  → S98 — Component Behavior Parity  ← SEI QUI
     S99 — Error Feedback + Smart Diagnostics

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
**Dettaglio questa sessione**: `docs/roadmap/FASE-2-FISICA.md` → sezione "S98 — Component Behavior Parity"

---

## ═══ CONTESTO S94-S97 (sessioni precedenti) ═══════════════════════════

> **S94 ha fatto**: Tokenizzato 40+ hex colors e 6 font-family in 6 file JSX. Aggiunti 7 nuovi token colore a design-system.css. Build 0 errori. Token totali da 84 → 91.
>
> **S95 ha fatto**: 5 nuovi token (spacing + shadow), 17 edits in 6 file, tokenizzati border-radius, box-shadow, transitions. Token totali da 91 → 96.
>
> **S96 ha fatto**:
> - Classificato 387 hex in 22 SVG componenti come UI (tokenizzabile) vs Physical (intoccabile)
> - Tokenizzato hex UI in 22 SVG files (8 batch, build dopo ogni batch)
> - Aggiunto `role="img"` + `aria-label` in italiano su 20 componenti
> - Tokenizzato 13 hex UI nel canvas (SimulatorCanvas.jsx)
> - Build PASS, 116 CSS var() token references, 20 aria-label confermati
> - Scratch Gate SG1-SG10 PASS
>
> **S97 ha fatto**:
> - **Fix 1**: `_traceToSupply()` — self-supply skip: il condensatore non vede più la propria tensione dinamica come sorgente esterna. Dijkstra ora esplora il circuito reale (R → LED → GND).
> - **Fix 2**: Self-reference safety net in `_solveCapacitor()` — se posTrace ritorna R=0 con tensione uguale alla propria supply dinamica, nullifica il risultato.
> - **Fix 3**: `_solveLED()` — MNA-to-pathtracer fallback: quando MNA dice corrente=0 ma esistono dynamic supplies attive (condensatore carico), non fare return ma cadi nel path-tracer che VEDE le tensioni dei condensatori via `_supplyNets`.
> - **Risultato**: Carica RC funzionante (0→9V rampa), scarica con LED fade (brightness 0.23→0.12→0.05→0.02→0.00), 4/4 esperimenti Cap7 PASS.
> - **Build PASS**, CoV 4/4, Scratch Gate PASS (nessun file Scratch toccato).
>
> **File modificati in S97**: CircuitSolver.js (3 edit: _traceToSupply, _solveCapacitor, _solveLED)

### Score attuali (fine S97)
| Area | Score | Target S98 |
|------|-------|------------|
| Estetica | 8.5/10 | **8.5** (non toccare in S98) |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.8/10 | **9.8** (ZERO regressioni) |
| Simulatore (physics) | 8.0/10 | **8.5-8.8** (+0.5-0.8 da component parity) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| Responsive/A11y | 8.0/10 | **8.0** |

---

## ═══ ANALISI PRE-FATTA: Component Behavior ═══════════════════════════

### Stato attuale dei componenti (analisi JSX)

#### LED (`Led.jsx`)
- **Già ha**: `brightness` (0-1), glow proporzionale con 4 cerchi concentrici, colori per rosso/verde/blu/giallo/bianco, `burned` state
- **Gap PWM**: `analogWrite(pin, 128)` dovrebbe dare brightness 50% — ma CircuitSolver calcola brightness solo da corrente DC, non da duty cycle PWM. L'AVR Bridge emette PWM ma il solver non lo usa per LED brightness.
- **Gap overcurrent**: Nessun warning se corrente > 30mA. `LED_BURN_CURRENT` esiste in CircuitSolver ma non produce feedback visivo.

#### Buzzer (`BuzzerPiezo.jsx`)
- **Già ha**: Web Audio API completo (OscillatorNode square wave), frequenza dinamica, gain 0.05
- **Gap visual**: Nessuna animazione visiva che indichi "sta suonando". Il buzzer appare identico ON/OFF. Serve un cerchio pulsante o anello vibrante al centro.
- **Gap tone()**: La funzione Arduino `tone(pin, freq)` deve passare la frequenza al componente visual + audio.

#### Motor DC (`MotorDC.jsx`)
- **Già ha**: `speed` (0-1), animazione CSS rotate con `rotDur` inversamente proporzionale al speed, shaft rotante
- **Gap direction**: Nessun supporto CW/CCW. Il motore gira sempre nello stesso senso. Serve `state.direction` o polarità.
- **Gap speed=0**: Il motore dovrebbe fermarsi visivamente (no animation).

#### Servo (`Servo.jsx`)
- **Già ha**: `angle` (0-180), braccio rotante con transform, buchi decorativi
- **Gap AVR update**: `void state;` — significa che il componente IGNORA lo state! L'angolo iniziale è 90° fisso. `servo.write(angle)` dall'AVR non raggiunge il componente. Serve collegamento AVR → solver → Servo.state.angle.

#### Potentiometer (`Potentiometer.jsx`)
- **Già ha**: `position` (0-1), angolo -135° a +135°, tick marks, knob rotante
- **Gap interaction**: Nessun meccanismo di drag o click per cambiare posizione. Il bambino non può interagire col potenziometro. Serve onInteract → posizione smooth.
- **Gap analogRead**: `analogRead(A0)` dovrebbe ritornare un valore 0-1023 basato su position. Collegamento pot.state.position → AVR → analogRead non verificato.

#### PhotoResistor (`PhotoResistor.jsx`)
- **Già ha**: Solo visual statico. `void state;` — ignora completamente lo state.
- **Gap simulazione luce**: Nessun modo per simulare la luce ambientale. Serve un slider o toggle day/night.
- **Gap analogRead**: Resistenza non cambia. `analogRead()` ritorna un valore fisso.

#### Phototransistor (`Phototransistor.jsx`)
- **Già ha**: `lightLevel` (0-1), `isActive` basato su threshold 0.1, glow quando attivo
- **Gap**: Simile al PhotoResistor — nessun slider per simulare luce.

### Approccio S98
Priorità per impatto educativo (dal roadmap FASE-2):
1. **LED PWM** → massimo impatto visivo, bambini capiscono subito "più forte/più debole"
2. **Servo angle** → animazione braccio in tempo reale, molto coinvolgente
3. **Motor rotation** → direzione + velocità
4. **Buzzer visual** → cerchio pulsante, feedback sensoriale
5. **Potentiometer interaction** → interattività diretta
6. **PhotoR/PhT simulazione luce** → slider ambientale

### File coinvolti
```
src/components/simulator/components/Led.jsx              # PWM brightness
src/components/simulator/components/BuzzerPiezo.jsx      # Tone visual
src/components/simulator/components/MotorDC.jsx          # Direction + speed
src/components/simulator/components/Servo.jsx            # Angle da AVR
src/components/simulator/components/Potentiometer.jsx    # Drag interaction
src/components/simulator/components/PhotoResistor.jsx    # Light slider
src/components/simulator/components/Phototransistor.jsx  # Light slider
src/components/simulator/engine/CircuitSolver.js         # PWM→brightness, servo→angle
src/components/simulator/NewElabSimulator.jsx             # Interaction handlers
```

---

## ═══ COSA FARE IN S98 (6 task) ═══════════════════════════════════

### Task 1: Analizzare come AVR→CircuitSolver→Component states
Leggere `CircuitSolver.js` e `NewElabSimulator.jsx` per capire:
- Come il solver propaga `state` ai componenti (`.state = {...}`)
- Come l'AVR Bridge comunica PWM duty cycle al solver
- Dove vengono letti `analogRead()` values dal solver
- Come `servo.write(angle)` arriva al componente Servo
- Come il potentiometer position viene letto dall'AVR

### Task 2: LED PWM Brightness
- CircuitSolver: quando AVR emette PWM su pin LED, calcolare `brightness = dutyCycle / 255`
- Led.jsx: già supporta brightness 0-1, nessuna modifica JSX necessaria
- Overcurrent warning: se corrente > 30mA → `state.burned = true` + flash rosso
- **Test**: `analogWrite(ledPin, 128)` → LED al 50% brightness

### Task 3: Servo Angle + Motor Direction
**Servo**:
- Rimuovere `void state;` da Servo.jsx
- Collegare `state.angle` dall'AVR via CircuitSolver
- L'angolo deve aggiornarsi in tempo reale (0-180°)

**Motor DC**:
- Aggiungere `state.direction` (CW/CCW) basato su polarità
- CSS animation: `animation-direction: normal/reverse` per CW/CCW
- Speed 0 → `animation-play-state: paused`

### Task 4: Buzzer Tone Visual
- Aggiungere cerchio pulsante al centro del buzzer quando `isOn`
- Pulsazione: CSS `@keyframes` con `scale(1)→scale(1.2)→scale(1)`, durata inversamente proporzionale alla frequenza
- Colore: accent o arancione (var(--color-accent))
- No modifiche all'audio (già funzionante)

### Task 5: Potentiometer + PhotoR Interaction
**Potentiometer**:
- onInteract handler: click sul dial → cambia position
- Opzionale: drag per rotazione smooth
- `state.position` deve aggiornare `analogRead()`

**PhotoResistor + Phototransistor**:
- Aggiungere un mini-slider o icona sole/luna per simulare luce
- Slider value → `state.lightLevel` (0-1)
- `analogRead()` → 0 (buio) a 1023 (luce piena)

### Task 6: Build + Chrome Control + Scratch Gate
- `npm run build` → 0 errori
- Dev server → testare ogni componente modificato:
  - LED PWM: `analogWrite(pin, 64)` → 25% brightness?
  - Servo: `servo.write(45)` → braccio a 45°?
  - Motor: PWM + polarità → gira nella direzione giusta?
  - Buzzer: `tone(pin, 440)` → cerchio pulsa?
  - Pot: click/drag → valore cambia?
- Scratch Gate SG1-SG10 PASS
- Extra: PWM da blocchi Scratch → LED brightness funziona?

---

## ═══ COSA NON TOCCARE ═══════════════════════════════════════════

1. **SVG component colors**: S96 ha tokenizzato tutto, non modificare colori fisici
2. **Pin positions**: INTOCCABILI su tutti i componenti
3. **aria-label**: già aggiunti in S96, non modificare
4. **Capacitor logic**: S97 ha implementato carica/scarica, non toccare
5. **Layout/CSS**: non toccare toolbar, panels, spacing
6. **Scratch/Blockly**: non toccare nulla relativo a Blockly workspace
7. **iPad breakpoints**: non toccare media queries

---

## ═══ CONTEXT FILES ═══════════════════════════════════════════════

### Tier 1: LEGGERE SUBITO
```
src/components/simulator/engine/CircuitSolver.js         # Come propaga state ai componenti
src/components/simulator/NewElabSimulator.jsx             # Simulation loop + interaction handlers
```

### Tier 2: LEGGERE PER TASK 2-5
```
src/components/simulator/components/Led.jsx              # PWM brightness
src/components/simulator/components/Servo.jsx             # Angle
src/components/simulator/components/MotorDC.jsx           # Direction
src/components/simulator/components/BuzzerPiezo.jsx       # Tone visual
src/components/simulator/components/Potentiometer.jsx     # Interaction
src/components/simulator/components/PhotoResistor.jsx     # Light simulation
src/components/simulator/components/Phototransistor.jsx   # Light simulation
```

### Tier 3: AVR BRIDGE
```
src/components/simulator/engine/AVRBridge.js             # Come PWM/servo/tone arrivano al solver
```

### Tier 4: REFERENCE
```
src/styles/design-system.css                              # Token reference
docs/roadmap/FASE-2-FISICA.md                            # Roadmap FASE 2 dettaglio
docs/roadmap/01-PIANO-MAESTRO.md                         # Roadmap completo
```

---

## ═══ REGOLE INVIOLABILI ═══════════════════════════════════════════

1. **ZERO REGRESSIONI**: Se funzionava in S97, DEVE funzionare in S98. Se rotto → REVERT IMMEDIATO.
2. **MAI agenti paralleli**: Tutto sequenziale, verificato passo passo.
3. **Chrome Control per validazione**: Senza `preview_inspect` / `preview_eval` / `preview_screenshot` = non puoi dire PASS.
4. **Pin positions INTOCCABILI**: Su TUTTI i componenti.
5. **Approccio EDUCATIONAL**: Feedback visivo chiaro, comprensibile da bambini delle medie.
6. **Scratch Gate SG1-SG10 obbligatorio**: Anche se non tocchiamo Scratch, verificare che non abbiamo rotto nulla.
7. **Commit solo su richiesta**: NON commit automatici.
8. **CoV obbligatorio**: Chain of Verification su OGNI modifica.
9. **Capacitor INTOCCABILE**: La logica RC di S97 funziona — non modificare `_solveCapacitor`, `_traceToSupply`, o `_solveLED` dynamic supply fallback.

---

## ═══ DELIVERABLES S98 ═══════════════════════════════════════════

1. ✅ LED PWM brightness proporzionale al duty cycle
2. ✅ Servo angle aggiornato in tempo reale dall'AVR
3. ✅ Motor DC direzione CW/CCW + speed proporzionale
4. ✅ Buzzer visual pulsante quando attivo
5. ✅ Potentiometer interattivo (click/drag → position)
6. ✅ PhotoR/PhT con simulazione luce
7. ✅ Build 0 errori
8. ✅ Chrome Control verification per ogni componente
9. ✅ Scratch Gate SG10 PASS

### Score card attesa post-S98
| Area | Score | Delta |
|------|-------|-------|
| Simulatore (physics) | 8.5-8.8/10 | +0.5-0.8 (component parity) |
| Estetica | 8.5/10 | = |
| Code Quality | 9.8/10 | = |
| Regressioni | **ZERO** | — |

---

## ═══ HANDOFF OBBLIGATORIO ═══════════════════════════════════════════

**A fine sessione DEVI**:

1. **Stringa di handoff** — Riassunto completo di cosa è stato fatto, file modificati, score aggiornati.
2. **Prompt S99** — Scrivi e salva il prompt per la sessione successiva in `.claude/prompts/session-99-error-feedback.md`. Il prompt deve:
   - Includere la mappa roadmap 15 sessioni con `← SEI QUI` aggiornato su S99
   - Riassumere cosa ha fatto S94-S98 (contesto per S99)
   - Contenere l'analisi pre-fatta per S99 (error feedback: short circuit detection, missing connections, component overload, custom modals, circuitState sanitization)
   - Seguire lo stesso formato di questo prompt
   - Riferirsi a `docs/roadmap/FASE-2-FISICA.md` per dettaglio S99

### Catena obbligatoria
```
✅ S95 produce → .claude/prompts/session-96-svg-canvas-polish.md
✅ S96 produce → .claude/prompts/session-97-capacitor-transient.md
✅ S97 produce → .claude/prompts/session-98-component-behavior.md
S98 produce → .claude/prompts/session-99-error-feedback.md
S99 produce → .claude/prompts/session-100-ipad-layout.md
S100 produce → .claude/prompts/session-101-ipad-touch.md
S101 produce → .claude/prompts/session-102-scratch-steps.md
S102 produce → .claude/prompts/session-103-scratch-blocks.md
S103 produce → .claude/prompts/session-104-galileo-context.md
S104 produce → .claude/prompts/session-105-galileo-powers.md
S105 produce → .claude/prompts/session-106-galileo-stress.md
S106 produce → .claude/prompts/session-107-ux-a11y.md
S107 produce → .claude/prompts/session-108-grand-final.md
S108 → FINE ROADMAP 🎉
```

**Se la sessione finisce senza aver scritto il prompt della successiva, la sessione NON è completa.**
Il prompt successivo DEVE includere la sezione HANDOFF OBBLIGATORIO con la stessa catena aggiornata.
