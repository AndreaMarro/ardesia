# TASK TRACKER — iPad + Apple Pencil + Libero Guidato

> Aggiornare questo file LIVE durante ogni sessione.
> Stato: Aggiornato 2026-03-05 — 7/11 task completati + Audit S69 + 12 bugfix S70 + 10 bugfix S71 + Test iPad Chiara S71 + 11 bugfix S72 + S73 Galileo context+action reliability (7 fix backend/AI).

---

## SPRINT 1: iPad + Apple Pencil (15h)

| # | Task | Ore | File principali | Stato | Sessione | Note |
|---|------|-----|-----------------|-------|----------|------|
| 1 | SimulatorCanvas -> Pointer Events (7->3 handler) | 4h | SimulatorCanvas.jsx | DONE | S66 | 7 handler -> 3 pointer + pinch + palm rejection. ~380 righe vecchie rimosse |
| 2 | Tap-to-place dalla ComponentPalette per iPad | 2h | ComponentPalette.jsx, ComponentDrawer.jsx, SimulatorCanvas.jsx | DONE | S66 | CustomEvent tap-to-place + banner "Tocca il canvas" |
| 3 | Pulsante Elimina + Context Menu Long-Press | 3h | ControlBar.jsx, SimulatorCanvas.jsx, NewElabSimulator.jsx | DONE | S67 | Long-press 500ms touch/pen, right-click mouse. Context menu SVG (Elimina/Ruota/Proprieta). ControlBar Delete/Rotate/Properties buttons visible on selection. CoV 6/6 PASS |
| 4 | Apple Pencil pressione nel CanvasTab | 2h | CanvasTab.jsx | DONE | S68 | Pointer Events: 7 legacy handlers -> 4 pointer. getPressure() pen=real/mouse+touch=0.5. Per-segment lineWidth brushSize*(0.3+1.4*p). setPointerCapture + touch-action:none. CoV 5/5 PASS |
| 5 | CSS :active states + Pin Tooltips | 2h | ElabSimulator.css, SimulatorCanvas.jsx | DONE | S69 | 15 :active rules all button variants. 13 @media(hover:hover) wrappers prevent sticky hover. Pin tooltip HTML overlay: tap=2s auto-dismiss, mouse=hover. getPinInfo() helper. CoV 6/6 PASS |
| 6 | Deploy + Test iPad reale | 2h | vercel deploy | DONE | S69-S71 | Deployed to https://www.elabtutor.school. Test eseguito da Chiara su iPad con Pencil USB-C. Risultati: 13/23 PASS, 7 FAIL, 3 NOTE. Bug identificati: P0-LAYOUT (3), P0-SNAP (1), P0-DRAG (1), P1-TOOLTIP (1), P1-CTXMENU (1), P1-CONTROLBAR (1), P1-PENCIL (1), P2 (2). Prompt S72 generato. |
| 6d | iPad real-device bugfix (11 bug da test Chiara) | 3h | SimulatorCanvas.jsx, breadboardSnap.js, ElabSimulator.css, ExperimentPicker.jsx, ComponentPalette.jsx, ControlBar.jsx, NewElabSimulator.jsx, CanvasTab.jsx | DONE | S72 | 11 bug fix from Chiara iPad test. P0-LAYOUT-1: rAF delay for auto-fit viewbox. P0-LAYOUT-2: zoom btns right->left. P0-LAYOUT-3: maxHeight calc(100dvh-120px) on panels. P0-SNAP-1: BB_SNAP_RADIUS 3x->4x (22.5->30). P0-DRAG-1: isPrimary fallback for single touch. P1-TOOLTIP-1: pin tooltip inside compPointerDown for touch/pen, tolerance 8->12/14->20. P1-CTXMENU-1: pot rotation deferred on touch/pen for long-press. P1-CONTROLBAR-1: toolbar-group--actions CSS pulse animation. P1-PENCIL-1: USB-C pressure heuristic (non-0.5 pressure = pen). P2-FLICKER-1: setCircuitWarning functional update dedup. P2-DESELECT-1: panDistRef > 5px suppresses deselect. Build 0 errors. |
| 6b | Bugfix Sprint 1 (12 bug audit) | 1h | SimulatorCanvas.jsx, ElabSimulator.css, ControlBar.jsx, CanvasTab.jsx | DONE | S70 | 12 bug fix: B1 hoveredPin perf, B2+B3 context menu SVG->HTML (zoom-safe, 44px targets), B4 banner cancel 44px, B5 tooltip 14/13px, B6 tooltip flip, B7 CSS conflict :not(.toolbar-btn), B8 7 backup files->docs/backups/, B9 pendingPlacement reset, B10 pressure clamp, B11 shortcut iPad text, B12 aria attrs. Build 0 errors. |
| 6c | Touch target + font audit fix (10 bug) | 0.5h | ComponentPalette.jsx, ShortcutsPanel.jsx, ExperimentPicker.jsx, GalileoResponsePanel.jsx, SerialMonitor.jsx, NewElabSimulator.jsx | DONE | S71 | T1: ComponentPalette header 36->44px. T2: ShortcutsPanel row 36->44px. T3: ExperimentPicker segmentBtn 40->44px. T4: GalileoResponsePanel btn 40->44px. T5: SerialMonitor terminal 40->44px. T6: NewElabSimulator build tab 32->44px. F1: catLabel 10->12px. F2: headerCount 11->12px. F3: card fontSize 11->12px. F4: cardLabel 11->12px. Build 0 errors. |

## SPRINT 2: Libero Guidato (14h)

| # | Task | Ore | File principali | Stato | Sessione | Note |
|---|------|-----|-----------------|-------|----------|------|
| 7 | CircuitComparator (utility frontend) | 3h | NUOVO: circuitComparator.js | -- | -- | Confronto circuito vs buildSteps |
| 8 | ExperimentGuide progress tracking | 3h | ExperimentGuide.jsx, NewElabSimulator.jsx | -- | -- | Barra progresso + celebrazione |
| 9 | Galileo Coach proattivo (hook 30s) | 4h | NUOVO: useGalileoCoach.js, ElabTutorV4.jsx | -- | -- | Suggerimenti AI proattivi |
| 10 | Canvas target highlighting (cerchi SVG) | 3h | SimulatorCanvas.jsx | -- | -- | Buchi target pulsanti |
| 11 | Deploy finale + validazione | 1h | vercel deploy | -- | -- | Test completo tutte le modalita' |

---

## LEGENDA STATO

```
--     = Non iniziato
WIP    = In corso
DONE   = Completato e verificato
BLOCK  = Bloccato (specificare motivo nelle note)
SKIP   = Saltato (specificare motivo nelle note)
```

## DIPENDENZE

```
Task 1 ──> Task 2 (Pointer Events necessari per tap-to-place)
Task 1 ──> Task 3 (handler unificati per context menu)
Task 1 ──> Task 4 (pointerType per distinguere pen)
Task 1 ──> Task 5 (pointer events per :active states)
Task 7 ──> Task 8 (CircuitComparator necessario per progress)
Task 7 ──> Task 9 (CircuitComparator per coach AI)
Task 7 ──> Task 10 (confronto necessario per highlighting)
Task 8 ──> Task 9 (progress data per coach)
```

## SCORE ATTESO

| Area | Prima | Dopo Sprint 1 | Dopo Sprint 2 |
|------|-------|---------------|---------------|
| iPad | 6.5/10 | 9.0/10 | 9.0/10 |
| Apple Pencil | 6.0/10 | 9.0/10 | 9.0/10 |
| Libero mode | 5.0/10 | 5.0/10 | 9.0/10 |

---

## CHECKLIST TEST iPAD REALE (Task 6 — S69)

Apri https://www.elabtutor.school su iPad Safari, login, vai al simulatore.

### A. Touch base (Task 1 — Pointer Events)
- [x] A1. Pan con 1 dito — PASS
- [x] A2. Pinch zoom con 2 dita — PASS (senza comp su breadboard)
- [x] A3. Palm rejection — PASS
- [x] A4. Tocca un componente — PASS
- [ ] A5. Trascina un componente — FAIL (impreciso col dito, penna meglio. Alcuni fori non accettano il comp) → P0-SNAP-1

### B. Tap-to-place (Task 2)
- [x] B1. Tocca un componente nella palette — PASS
- [x] B2. Tocca il canvas — PASS
- [x] B3. In modo Passo Passo — PASS

### C. Context Menu (Task 3)
- [x] C1. Long-press (500ms) su componente — PASS
- [ ] C2. Long-press su potenziometri — FAIL (non funziona) → P1-CTXMENU-1
- [x] C3. Tocca "Elimina" — PASS
- [x] C4. Tocca "Ruota" — PASS
- [x] C5. Tocca fuori dal menu — PASS
- [ ] C6. ControlBar — FAIL (non chiaramente trovabile) → P1-CONTROLBAR-1

### D. Apple Pencil (Task 4) — Pencil USB-C
- [ ] D1. Pressione Pencil — FAIL (USB-C non supporta pressure?) → P1-PENCIL-1
- [ ] D2. Tratto variabile — FAIL (spessore costante) → P1-PENCIL-1
- [x] D3. Dito spessore uniforme — PASS
- [x] D4. No scroll/bounce — PASS

### E. :active + Pin Tooltips (Task 5)
- [x] E1. :active feedback — PASS
- [x] E2. No sticky hover — PASS
- [ ] E3. Pin tooltips — FAIL (non funzionano) → P1-TOOLTIP-1
- [ ] E4. Auto-dismiss tooltip — FAIL (non testabile) → P1-TOOLTIP-1
- [x] E5. Deselect fuori breadboard — PASS (ma confuso) → P2-DESELECT-1

### F. Generale
- [x] F1-F3. Esperimenti — PASS (ma comp a volte non fz in certi fori → P0-SNAP-1)
- [x] F4. No crash — PASS (ma comp a volte non seguono breadboard → P0-DRAG-1)

### Layout (non nella checklist originale)
- [ ] LAYOUT-1: Pagina non fitta, serve fitView → P0-LAYOUT-1
- [ ] LAYOUT-2: Zoom +/- coperti in Passo Passo → P0-LAYOUT-2
- [ ] LAYOUT-3: Elenco menu esce fuori campo → P0-LAYOUT-3
- [ ] FLICKER: Avvisi resistenza sfarfallano → P2-FLICKER-1

**Risultato: 13/23 PASS, 7 FAIL, 3 NOTE. Score iPad reale: ~7.5/10**
