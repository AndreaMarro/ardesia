# CoV Tracking — Overnight Sprint

## Metodo
Dopo OGNI fase, compila questa checklist. Se anche UN punto fallisce, STOP e correggi prima di procedere.

---

## FASE 0 — Build Health
| # | Check | Status | Note |
|---|-------|--------|------|
| 0.1 | `npm run build` 0 errori | ✅ | 22s, 0 errors |
| 0.2 | Main chunk < 350KB gzip | ✅ | 304KB gzip |
| 0.3 | ScratchEditor < 250KB gzip | ✅ | 190KB gzip |
| 0.4 | 0 warning critici | ✅ | Only expected warnings |

## FASE 1 — Scratch/Blockly Crash Fix
| # | Check | Status | Note |
|---|-------|--------|------|
| 1.1 | Build 0 errori | ✅ | patch-blockly.js v3 |
| 1.2 | Blockly inject+clear+dispose no crash | ✅ | Tested in browser |
| 1.3 | XML parsing no crash | ✅ | domToBlockHeadless OK |
| 1.4 | 0 console errors | ✅ | |
| 1.5 | ScratchEditor chunk invariato | ✅ | ~190KB gzip |

## FASE 2 — Drag & Drop NaN Fix
| # | Check | Status | Note |
|---|-------|--------|------|
| 2.1 | 17/17 component types via API | ✅ | All instantiate |
| 2.2 | HTML5 drag & drop works | ✅ | LED + Resistor tested |
| 2.3 | Auto-pin assignment works | ✅ | Snaps to breadboard |
| 2.4 | moveComponent API works | ✅ | Visual confirmed |
| 2.5 | NaN fix eliminates warnings | ✅ | 0 errors after bulk add |
| 2.6 | SVG DOM correct | ✅ | All components rendered |

## FASE 3 — NanoR4Board Visual
| # | Check | Status | Note |
|---|-------|--------|------|
| 3.1 | 47 pin positions immutate | ✅ | TOP 15 + BOTTOM 15 + WING 17 |
| 3.2 | SVG 10/10 visual elements | ✅ | Semicircle, PCB, MCU, labels... |
| 3.3 | RST button labels | ✅ | 2× present |
| 3.4 | Status LED labels (PWR, L) | ✅ | Present |
| 3.5 | Simulation play/pause no errors | ✅ | 0 app errors |
| 3.6 | LED glow elements | ✅ | 6 elements |

## FASE 4 — Simon Game
| # | Check | Status | Note |
|---|-------|--------|------|
| 4.1 | Simon carica senza errori | ✅ | 15 comp, 20 conn |
| 4.2 | 4 LED visibili e posizionati | ✅ | LED1-LED4 colored |
| 4.3 | 4 pulsanti visibili e posizionati | ✅ | BTN1-BTN4 |
| 4.4 | Buzzer presente | ✅ | buz1 visible |
| 4.5 | Scratch XML → C++ valido | ✅ | 10313→1619-1735 chars |
| 4.6 | Editor mode switching | ✅ | arduino↔scratch |
| 4.7 | Simulation play/pause no errors | ✅ | 0 app errors |

## FASE 5 — All Experiments
| # | Check | Status | Note |
|---|-------|--------|------|
| 5.1 | Vol1: 38/38 pass | ✅ | Source + browser sample |
| 5.2 | Vol2: 18/18 pass | ✅ | Source + browser sample |
| 5.3 | Vol3: 14/14 pass | ✅ | Source + browser sample |
| 5.4 | 70/70 with buildSteps/layout/galileoPrompt | ✅ | Deep validation |
| 5.5 | 394 components, 548 connections | ✅ | 0 integrity issues |
| 5.6 | 12/12 AVR, 11/12 with scratchXml | ✅ | 1 LCD expected |
| 5.7 | 15/15 browser samples 0 errors | ✅ | Rapid-cycle test |

## FASE 6 — Responsive
| # | Check | Status | Note |
|---|-------|--------|------|
| 6.1 | Visibile a 375px | ✅ | Board+toolbar+nav |
| 6.2 | Visibile a 768px | ✅ | Full layout |
| 6.3 | Visibile a 1024px | ✅ | Sidebar+main |
| 6.4 | Visibile a 1280px | ✅ | All panels |
| 6.5 | Visibile a 1440px | ✅ | Proxy for 1920 |
| 6.6 | Pin coerenti dopo resize | ✅ | v3-cap6-blink tested |
| 6.7 | Pulsanti >= 44px | ✅ | ALL measured ≥44px |
| 6.8 | 0 console errors | ✅ | Only Chrome ext noise |

## FASE 7 — Galileo Integration
| # | Check | Status | Note |
|---|-------|--------|------|
| 7.1 | Chat funziona | ✅ | Messages sent/received |
| 7.2 | play action tag | ✅ | Toolbar "Pausa" |
| 7.3 | pause action tag | ✅ | Toolbar "Avvia" |
| 7.4 | clearall action tag | ✅ | Wires removed, code reset |
| 7.5 | loadexperiment/compile | ✅ | "✅ Compilazione riuscita!" |
| 7.6 | compile action tag | ✅ | "✅ Compilazione riuscita!" |
| 7.7 | Experiment context visible | ✅ | Components/pins mentioned |
| 7.8 | 0 console errors | ✅ | Only Chrome ext noise |

## FASE 8 — Documentation
| # | Check | Status | Note |
|---|-------|--------|------|
| 8.1 | CoV tracking updated | ✅ | This file |
| 8.2 | Session final report | ✅ | SESSION-FINAL-REPORT.md |
| 8.3 | All checkpoints written | ✅ | FASE 0-7 |

## FASE 9 — Deploy & Push
| # | Check | Status | Note |
|---|-------|--------|------|
| 9.1 | Build 0 errori finale | | |
| 9.2 | Git commit | | |
| 9.3 | Git push | | |
| 9.4 | Nessuna regressione | | |
