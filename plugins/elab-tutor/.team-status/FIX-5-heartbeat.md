# FIX-5 Heartbeat — ViewBox & Canvas Background
- **Status**: COMPLETED
- **Time**: 2026-02-13
- **Changes**:
  1. DEFAULT_VIEWBOX updated: `{x:-400, y:-50, width:1100, height:600}` (was `{x:-20, y:-20, width:500, height:350}`)
  2. Canvas grid replaced: old line-grid → new dot-grid pattern (elab-grid-dots + elab-grid-major)
  3. Background: solid `#FAFAFA` base + subtle dot grid overlay
- **Files edited**: `src/components/simulator/canvas/SimulatorCanvas.jsx` (line 37, lines 1702-1714)
- **Build**: PASSES (565 modules, 5.70s)
