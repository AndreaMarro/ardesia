# Architecture Reference — ELAB Simulator

## File Map (Critical Files)

### Core Simulator
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/simulator/NewElabSimulator.jsx` | ~3000+ | Main simulator orchestrator |
| `src/components/simulator/components/NanoR4Board.jsx` | 708 | Arduino Nano R4 breakout SVG |
| `src/components/simulator/components/BreadboardHalf.jsx` | ~500 | Breadboard SVG with hole grid |
| `src/components/simulator/engine/CircuitSolver.js` | 2485 | KVL/KCL circuit solver |
| `src/components/simulator/utils/parentChild.js` | ~200 | Parent-child drag system |
| `src/components/simulator/utils/breadboardSnap.js` | ~300 | Pin-to-hole snapping |
| `src/components/simulator/WireRenderer.jsx` | ~400 | Wire rendering + resolvePinPosition |

### Experiments Data
| File | Experiments | Lines |
|------|-------------|-------|
| `src/data/experiments-vol1.js` | 38 (v1-*) | 6913 |
| `src/data/experiments-vol2.js` | 18 (v2-*) | 3487 |
| `src/data/experiments-vol3.js` | 14 (v3-*) | 3434 |

### Scratch/Blockly
| File | Purpose |
|------|---------|
| `src/components/simulator/scratch/ScratchEditor.jsx` | Blockly workspace with ELAB theme |
| `src/components/simulator/scratch/scratchBlocks.js` | 22 custom Arduino blocks |
| `src/components/simulator/scratch/scratchGenerator.js` | C++ code generation |

### AVR Simulation
| File | Purpose |
|------|---------|
| `src/components/simulator/engine/AVRBridge.js` | AVR emulation bridge |
| `public/avr/avrWorker.js` | Web Worker for AVR CPU |

### AI Integration
| File | Purpose |
|------|---------|
| `src/components/simulator/ElabTutorV4.jsx` | Galileo AI chat component |
| `src/components/simulator/PlacementEngine.js` | AI-driven component placement |

## Layout Constants (IMMUTABLE)

```javascript
// NanoR4Board.jsx
const BOARD_W = 168;
const BOARD_H = 99;
const PIN_START_X = 20;
const PIN_PITCH = 7.5;
const TOP_PIN_Y = 35;
const BOTTOM_PIN_Y = 64;
const WING_PIN_START_X = 62;
const WING_PIN_PITCH = 5.0;
const WING_PIN_Y = 78;

// BreadboardHalf.jsx
const BB_PITCH = 7.5;  // matches PIN_PITCH
const SNAP_RADIUS = 30; // pixels for snapping
```

## Pin Layout (47 pins total)

### Top Header (15 pins): D13, D12, D11, D10, D9, D8, D7, D6, D5, D4, D3, D2, TX, RX, RST
### Bottom Header (15 pins): GND, 5V, A0, A1, A2, A3, A4, A5, A6, A7, 3V3, AREF, VIN, GND2, RST2
### Wing Connector (17 pins): A0w, A1w, A2w, A3w, D3w, D5w, D6w, D9w, D10w, D11w, D12w, D13w, GNDw, 5Vw, VINw, 3V3w, ARw

## Deploy Commands

```bash
# Build
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build

# Deploy Vercel
npx vercel --prod --yes

# Git
git add <files>
git commit -m "message"
git push origin main
```

## Palette Ufficiale

```
Navy:     #1E4D8C
Lime:     #7CB342
Vol1:     #7CB342 (green)
Vol2:     #E8941C (orange)
Vol3:     #E54B3D (red)
Board Blue: #1B9FBF
PCB Yellow: #F5D742
```
