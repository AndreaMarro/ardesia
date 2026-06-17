# ELAB Simulator — Sprint Agile Context File
# QUESTO FILE E' IL SINGLE SOURCE OF TRUTH PER TUTTI GLI AGENTI
# Aggiornato da ogni ondata di agenti. Non cancellare, solo appendere.

## Progetto
- **Nome**: ELAB Tutor + Simulatore Arduino
- **Target**: Bambini 8-14 anni (Gen Alpha + Gen Z)
- **Stack**: React + Vite, avr8js, CodeMirror 6, n8n backend
- **Deploy**: https://elab-builder.vercel.app (Vercel)
- **Repo locale**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`

## Architettura Simulatore
```
NewElabSimulator.jsx (2,160 LOC) — orchestratore principale
  ├── SimulatorCanvas.jsx (2,023 LOC) — SVG canvas, drag/drop, wire mode
  │   ├── 21 SVG components (Led, Resistor, NanoR4Board, Breadboard, etc.)
  │   └── WireRenderer.jsx — bezier wires + current flow animation
  ├── CircuitSolver.js (1,768 LOC) — KCL/MNA Gaussian solver
  ├── AVRBridge.js (1,049 LOC) — avr8js CPU + Web Worker
  ├── CodeEditorCM6.jsx — CodeMirror 6 Arduino editor
  ├── ControlBar.jsx — Play/Stop/Reset toolbar
  ├── ExperimentGuide.jsx — step-by-step instructions
  ├── PotOverlay.jsx / LdrOverlay.jsx — interactive overlays
  └── SerialMonitor.jsx / SerialPlotter.jsx
```

## Palette ELAB
- Navy: #1E4D8C / Lime: #7CB342
- Vol1: #7CB342 / Vol2: #E8941C / Vol3: #E54B3D
- Background: #FAFAF7 / Border: #E8E4DB
- Fonts: Oswald (headers) + Open Sans (body) + Fira Code (mono)

## Esperimenti
- Vol1: 38 esperimenti (circuiti semplici, NO Arduino, batteria 9V)
- Vol2: 18 esperimenti (condensatori, transistor, fototransistori)
- Vol3: 11 esperimenti (Arduino Nano R4, codice C++)
- Totale: 69 esperimenti (67 originali + 2 extra LCD/Servo)

## Compilatore Arduino
- Endpoint: POST https://n8n.srv1022317.hstgr.cloud/compile
- 9 hex pre-compilati in /public/hex/
- arduino-cli su VPS Hostinger

## NanoBreakout V1.1 GP (DWG reale)
- Board: 77.5 x 55.0 mm, semicerchio sinistro (R=27.5mm)
- Wing: 16 pin @ 2.54mm pitch, estende a DESTRA dal corpo
- File DWG: /Users/andreamarro/VOLUME 3/HARDWARE/NanoBreakoutV1.1 GP.dwg

## Bug Noti (pre-sprint)
- [ ] Potentiometer/PhotoResistor/RgbLed/Phototransistor: onInteract prop non chiamato
- [ ] RC transient non implementato in CircuitSolver
- [ ] Wire color picker mancante
- [ ] Component labels mancanti
- [ ] Servo.h/LiquidCrystal.h: compilazione dipende da arduino-cli server

## Sprint History
- Sprint 1 (12/02): Refactor NES 3507→1831 LOC, 9 file estratti
- Sprint 2 (13/02): MNA solver, Servo, LCD, Wire animation, Multi-select
- Sprint 3 (13/02): BOM, Annotations, Export PNG, Shortcuts, Bundle -26%
- Sprint 4 (13/02): Breakout pads, wing geometry, overlay fix, responsive

---
## ONDATA 1 — AUDIT FUNZIONALE (in corso)
Agenti lanciati: 8
Stato: IN PROGRESS
Bug trovati: (compilare dopo completamento agenti)

