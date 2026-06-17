# ELAB Bug Backlog — Agile Sprint
# Formato: BUG-{AREA}-{NUM}: [P0/P1/P2] File — Descrizione
# Aree: C=Canvas/Components, E=Engine, W=Wire, D=Design, P=Pedagogy, U=UX, T=Tutor, I=Integration, EXP=Experiments, HW=Hardware
# P0=Crash/Blocco, P1=Funzionalita' rotta, P2=Miglioramento

## PRE-EXISTING (da sessioni precedenti)
BUG-C-01: [P1] Potentiometer.jsx — onInteract prop mai chiamato (FIXED 13/02)
BUG-C-02: [P1] PhotoResistor.jsx — onInteract prop mai chiamato
BUG-C-03: [P1] RgbLed.jsx — state mismatch r/g/b vs red/green/blue (FIXED 13/02)
BUG-C-04: [P1] Phototransistor.jsx — onInteract prop mai chiamato
BUG-E-01: [P2] CircuitSolver.js — RC transient non implementato
BUG-E-02: [P1] AVRBridge.js — Servo.h non compilabile senza libreria su server
BUG-E-03: [P1] AVRBridge.js — LiquidCrystal.h non compilabile senza libreria
BUG-W-01: [P2] WireRenderer.jsx — Wire color picker mancante
BUG-D-01: [P2] Components — Labels (R1, LED1) non mostrati nel canvas
BUG-C-05: [P1] SimulatorCanvas.jsx — PotOverlay non si apriva su click (FIXED 13/02)

---
## ONDATA 1 — AUDIT FUNZIONALE (13/02/2026)
## Totale: 80+ bug trovati da 8 agenti

### Agent 1: Canvas + Components (16 bug)
BUG-C-06: [P1] Annotation.jsx — No drag handlers, annotazioni non trascinabili
BUG-C-07: [P1] SimulatorCanvas.jsx — onAnnotationLayoutChange callback mai usato
BUG-C-08: [P1] SimulatorCanvas.jsx — wireMode state race condition
BUG-C-09: [P1] Multimeter.jsx — probe solder coordinates non allineate con wire endpoints
BUG-C-10: [P2] SimulatorCanvas.jsx — hoveredPin tooltip width fragile (monospace assumption)
BUG-C-11: [P2] 15 componenti — onInteract prop dichiarato ma mai chiamato
BUG-C-12: [P2] SimulatorCanvas.jsx — selection box threshold 4px troppo alto per touch
BUG-C-13: [P2] Led/Diode — flat spot polarity confusa (sinistra vs destra)
BUG-C-14: [P2] Capacitor.jsx — chargeLevel normalizzato su 9V hardcoded
BUG-C-15: [P2] SimulatorCanvas.jsx — dragPreview non resettato su drag abort
BUG-C-16: [P2] registry.js — nessuna validazione pin IDs
BUG-C-17: [P2] BreadboardHalf/Full — pin definitions mancanti in registry

### Agent 2: Circuit Solver + AVR (14 bug)
BUG-E-04: [P0] CircuitSolver.js:1492 — Potentiometer polarity reversal non gestita
BUG-E-05: [P0] AVRBridge.js:854 — Servo angle clamping errato ai boundary PWM
BUG-E-06: [P0] CircuitSolver.js:1192 — LED burn detection path-tracer incoerente con MNA
BUG-E-07: [P0] AVRBridge.js:876 — LCD pins race condition (configureLCDPins dopo Worker start)
BUG-E-08: [P1] CircuitSolver.js:575 — MAX_PATHS=8 puo' perdere percorsi paralleli
BUG-E-09: [P1] pinComponentMap.js:12 — RGB LED common pin non mappato
BUG-E-10: [P1] avrWorker.js:46 — Pin batch 16ms puo' perdere pulse rapidi
BUG-E-11: [P2] CircuitSolver.js:1708 — convergenceSnapshot non include pot position
BUG-E-12: [P2] AVRBridge.js:391 — Intel HEX checksum non validato
BUG-E-13: [P2] CircuitSolver.js:1384 — Diodo reverse-bias no stress check
BUG-E-14: [P2] pinComponentMap.js:27 — Union-Find no caching tra chiamate
BUG-E-15: [P2] CircuitSolver.js:21 — LED VF green hardcoded 2.0V (reale 2.5-3.2V)
BUG-E-16: [P2] AVRBridge.js:856 — Servo angle offset vs Arduino Servo.h reale
BUG-E-17: [P2] CircuitSolver.js:1448 — Capacitor leakage tau=1000s impreciso

### Agent 3: Experiments Data (3 bug critici)
BUG-EXP-01: [P0] experiments-vol3.js:279 — v3-cap6-sirena bus-bot-minus-15 dovrebbe essere -13
BUG-EXP-02: [P0] experiments-vol3.js:364 — v3-cap6-semaforo bus-bot-minus-14 dovrebbe essere -11
BUG-EXP-03: [P0] experiments-vol3.js:591 — v3-cap7-mini bus-bot-minus-22 dovrebbe essere -20

### Agent 4: Wires + Connections (20 bug)
BUG-W-02: [P0] SimulatorCanvas.jsx — Wire creation da touch events impossibile
BUG-W-03: [P0] SimulatorCanvas.jsx — Wire preview NON aggiornato su touch
BUG-W-04: [P0] WireRenderer.jsx:177 — Collinear detection threshold 0.01 troppo stretto
BUG-W-05: [P0] WireRenderer.jsx:185 — Bezier corner radius non adattivo quando > segment length
BUG-W-06: [P1] WireRenderer.jsx:107 — resolvePinPosition() non gestisce wing pins ruotati
BUG-W-07: [P1] SimulatorCanvas.jsx:295 — resolvePinPositionLocal() duplicata vs WireRenderer
BUG-W-08: [P1] SimulatorCanvas.jsx — hitTestPin tolerance inconsistente (3 valori diversi)
BUG-W-09: [P1] breadboardSnap.js:100 — analyzePinLayout() BB_PITCH in coordinate locali non globali
BUG-W-10: [P1] WireRenderer.jsx:57 — Bus pin regex non accetta "bus-bottom-plus" legacy
BUG-W-11: [P1] SimulatorCanvas.jsx:1774 — Wire preview come <line> non usa routing
BUG-W-12: [P2] WireRenderer.jsx:335 — routeFromArduino() non gestisce wire verticali
BUG-W-13: [P2] PinOverlay.jsx — non partecipa a wire mode
BUG-W-14: [P2] WireRenderer.jsx:763 — Current flow animation direction invertita per reverse
BUG-W-15: [P2] breadboardSnap.js:141 — no validazione bounds breadboard
BUG-W-16: [P2] WireRenderer.jsx:70 — nearestBBRow() non clamp risultati
BUG-W-17: [P2] SimulatorCanvas.jsx — Wire mode + panning conflitto stato
BUG-W-18: [P2] WireRenderer.jsx:50 — isBusPin() troppo generico (startsWith 'bus-')
BUG-W-19: [P2] WireRenderer.jsx:472 — Dedup threshold 1.5px hardcoded
BUG-W-20: [P2] SimulatorCanvas.jsx — Wire preview non clippato a SVG bounds
BUG-W-21: [P2] WireRenderer.jsx — Current flow colors hardcoded non in WIRE_COLORS

### Agent 5: Toolbar + Panels + UI (17 bug)
BUG-UI-01: [P1] CodeEditorCM6.jsx:351 — Label "Code Editor" non tradotto in italiano
BUG-UI-02: [P2] GalileoResponsePanel.jsx:202 — Loading dots non animate
BUG-UI-03: [P1] ControlBar.jsx:239 — Overflow menu non accessibile da keyboard
BUG-UI-04: [P1] CodeEditorCM6.jsx:398 — Close button errori troppo piccolo (16px)
BUG-UI-05: [P1] SerialMonitor.jsx — No visual feedback quando disabled
BUG-UI-06: [P2] ComponentPalette.jsx:135 — Search input manca aria-label
BUG-UI-07: [P2] ControlBar.jsx:396 — Timer display no live region
BUG-UI-08: [P2] ExperimentGuide.jsx:47 — Collapse button icon ambiguo
BUG-UI-09: [P2] BuildModeGuide.jsx:96 — Navigation no progress indicator
BUG-UI-10: [P2] PropertiesPanel.jsx:126 — Color swatch no hover/focus feedback
BUG-UI-11: [P1] CodeEditorCM6.jsx:330 — Compilation status testo troppo piccolo (10px)
BUG-UI-12: [P1] SerialMonitor.jsx:58 — Baud rate mismatch warning solo tooltip
BUG-UI-13: [P2] ShortcutsPanel.jsx:93 — Keyboard shortcut rendering inconsistente
BUG-UI-14: [P1] ExperimentPicker.jsx:168 — Build/Unbuild toggle non ovvio
BUG-UI-15: [P2] BomPanel.jsx:150 — No scrollbar visibile su Windows
BUG-UI-16: [P2] ControlBar.jsx:108 — Hamburger CSS class su div invece di button
BUG-UI-17: [P2] Multiple panels — Close buttons inconsistenti (Unicode vs SVG)

### Agent 6: NanoR4Board + AutoCAD (3 bug)
BUG-HW-01: [P2] NanoR4Board.jsx:48 — Wing HORIZ 40mm vs DWG 38.1mm (5% oversize)
BUG-HW-02: [P2] NanoR4Board.jsx:50 — Wing VERT 15mm vs DWG 14.756mm (1.6% oversize)
BUG-HW-03: [P2] SimulatorCanvas.jsx — COMP_SIZES comment inconsistente (139.5 vs 140)

### Agent 7: Tutor + Galileo AI (5 bug)
BUG-T-01: [P1] ChatOverlay.jsx — Image attachment non mostrato nel messaggio
BUG-T-02: [P1] ElabTutorV4.jsx:731 — analyzeImage() promise race condition
BUG-T-03: [P2] contentFilter.js — Regex /g patterns non reset tra chiamate
BUG-T-04: [P2] ChatOverlay.jsx:234 — Default suggestions solo con 1 messaggio (by design)
BUG-T-05: [P2] ElabTutorV4.jsx:625 — detectIntent() 47 regex lento

### Agent 8: Build + Deploy + Integration (7 bug)
BUG-I-01: [P0] userService.js — SESSION_SECRET per-tab, bypassabile da DevTools
BUG-I-02: [P0] userService.js:91 — Admin password hash SHA-256 hardcoded in source
BUG-I-03: [P0] PasswordGate.jsx — Rate limiting in sessionStorage, bypassabile
BUG-I-04: [P0] licenseService.js — Device fingerprint spoofabile
BUG-I-05: [P0] api.js/notionService.js — Admin webhook URL esposto in client bundle
BUG-I-06: [P1] userService.js — Social data plaintext in localStorage
BUG-I-07: [P1] notionService.js — No API request signing (replay attack possibile)

---
## PRIORITA' CONSOLIDATA

### P0 CRITICI (14 bug) — MUST FIX
- 3 EXP bus wiring (sirena, semaforo, mini)
- 4 Engine (pot polarity, servo clamping, LED burn, LCD race)
- 4 Wire (touch creation, touch preview, collinear, corner radius)
- 3 Integration/Security (admin hash, admin webhook, session)

### P1 IMPORTANTI (22 bug) — SHOULD FIX
- Canvas: annotation drag, wireMode race, multimeter coords, annotation layout
- Engine: MAX_PATHS, RGB common pin, pin batch interval
- Wire: wing pins, duplicate code, hit tolerance, BB pitch, bus regex, wire preview
- UI: translate labels, close button size, compilation status, serial disabled state, overflow menu, baud mismatch, build toggle
- Tutor: image display, analyzeImage race
- Integration: social data, API signing

### P2 MIGLIORAMENTI (35+ bug) — NICE TO HAVE
- Vari miglioramenti a11y, UX, performance, code cleanup

---
## ONDATA 3 — AUDIT DESIGN
(da compilare con risultati agenti)

## ONDATA 5 — AUDIT PEDAGOGIA
(da compilare con risultati agenti)
