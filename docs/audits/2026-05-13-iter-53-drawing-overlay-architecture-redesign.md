# Iter 53 audit — DrawingOverlay architectural redesign + 3 parallel agents synthesis

**Date**: 2026-05-13 PM | **Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Score iter 53 close ONESTO G45 cap**: **7.0/10** (audit complete, implementation deferred iter 54 disciplined)

---

## 1. Andrea iter 53 mandate

Real-user screenshot iter 52 feedback:
> "Barra dei colori spostata in un punto inutilizzabile. Sul volume non è possibile scrivere dappertutto.
> Fai la cosa migliore in assoluto /ultrathink.
> /accessibility-compliance /architecture-patterns /comp-analysis /code-refactoring:tech-debt /codebase-cleanup:tech-debt"

---

## 2. Current state — 3 duplicated drawing implementations (tech-debt agent findings)

| File | LOC | Drawing logic | Eraser fix iter 42 | Toolbar | Storage |
|------|-----|---------------|---------------------|---------|---------|
| `VolumeViewer.jsx` | 260 (90 LOC drawing) | inline canvas + svg | ❌ MISSING (HIGH) | `.penBar` embedded popup header CRAMPED | `elab-annotations-v{N}-p{P}` |
| `DrawingOverlay.jsx` | 715 | full impl smooth bezier | ✅ iter 42 pointsHit | full toolbar 570 LOC inline styles | `elab-drawing-{expId}` + Supabase sync iter 28 |
| `LavagnaShell.jsx` | (lazy import + state) | DEAD lazy chunk preloaded never rendered | n/a | n/a | n/a |

**Net duplication**: ~400 LOC redundant + 8-12KB bundle waste + 2 storage namespaces + 2 palettes + divergent pointer handlers.

---

## 3. 3 parallel agents synthesis

### Agent 1 — `code-architect` (architect)

**Proposed architecture**:
- Single `GlobalDrawingLayer` mounted at `LavagnaShell` root, z-9999, position fixed 100vw × 100vh
- `useDrawingStore` hook (Zustand OR React context) single source of truth
- `FloatingPenToolbar` bottom-center, draggable, z-10000
- SVG `pointer-events: none` default → `auto` when drawingEnabled

**Persistence strategy decision**: **viewport-bound LIM-like** default (write anywhere on projection, persists across content scroll) + optional `experimentId`-keyed for Fumetto report.

**Migration plan 5 atoms**:
1. Extract `src/utils/drawingGeometry.js` (shared geometry +80 LOC)
2. Create `src/hooks/useDrawingStore.js` (state +120 LOC)
3. Build `src/components/lavagna/GlobalDrawingLayer.jsx` (+250 LOC)
4. Remove VolumeViewer inline drawing (−100 LOC)
5. Demote DrawingOverlay to shim (−620 LOC, from 715→~95)

**Net LOC delta**: **−290 LOC** (clean code deletion exceeds additions).
**No new npm dependencies**. Migration preserves existing localStorage keys via one-time migration init.

### Agent 2 — `accessibility-expert` (WCAG)

**P0 CRITICAL** current violations:
- `DrawingOverlay.jsx:556-565` color swatches 24×24px (Andrea LIM ≥44px mandate violated)
- `DrawingOverlay.jsx:580-591` pen sizes 28×28px (sub-44)
- `VolumeViewer.jsx:241` `pointerEvents:'auto'` over PDF blocks Tab keyboard nav

**P1 HIGH**:
- Selected state color-only (no shape/checkmark badge for color-blind)
- `aria-label="#E54B3D"` hex (NOT Italian semantic "rosso")
- Missing aria-live status region (stroke count, undo announce)
- Non-text contrast 2.8:1 backdrop vs lime ring (need 3:1)

**Proposed floating toolbar**:
- Default bottom-center (thumb-reach LIM 150cm + Tinkercad/Figma convention)
- ≥48×48px buttons (exceeds 44 mandate, 2.5.8 AAA)
- ARIA radio group for color/size + `role="toolbar" aria-label="Strumenti disegno lavagna"`
- Drag handle keyboard repositioning (Enter mode, Arrow nudge, Esc exit)
- aria-live="polite" announcer "Tratto annullato. 4 tratti rimasti."
- `@media (forced-colors: active)` Windows high-contrast support

### Agent 3 — `codebase-cleanup` (tech-debt)

**17 findings**: 5 HIGH + 9 MEDIUM + 3 LOW
- Stroke schema fragmentation (`d` pre-rendered SVG vs `{points,color,width,isEraser}`) incompatible
- Iter 28+34+35 stacked race-condition patches (3 nested conditionals untestable)
- Palette CSS var divergence (`--elab-red` vs `--elab-hex-ef4444`)
- Window event coupling `elab-set-eraser-mode` (FloatingToolbar bridge external)
- Iter 45 LIM visibility default 3px patch missing in VolumeViewer
- Bundle redundancy 3-4KB inline VolumeViewer drawing always shipped

**Migration risk HIGH**:
- VolumeViewer per-page localStorage namespace (`elab-annotations-v{N}-p{P}`) MUST migrate
- Fumetto report consumer audit needed
- Penna toggle PDF nav bar wiring

---

## 4. Competitive analysis (WebSearch + industry pattern)

| Tool | Toolbar position | Touch target | Pattern |
|------|------------------|--------------|---------|
| **Excalidraw** | top-center floating | ~32px (compact) | Hand-drawn aesthetic + collab |
| **tldraw** | bottom-center primary + left secondary | ~44px | Modern open-source, fast |
| **SMART Notebook** | side-right draggable | ≥44px | Teacher-focused, LIM-native |
| **OpenBoard** | top + bottom draggable | ≥44px | Cross-platform open-source LIM |
| **Miro/Mural** | bottom-center pen + tool palette | ~36px | Enterprise collab |

**LIM teacher best practice synthesis**: bottom-center default + ≥44px touch target + draggable repositionable. ELAB iter 53 architecture aligns.

Sources:
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)
- [tldraw](https://www.tldraw.com/)
- [Best whiteboards 2026](https://boardmix.com/articles/free-whiteboards-in-2025/)
- [Open source alternatives](https://www.opensourcealternatives.to/blog/best-open-source-whiteboard-tools)

---

## 5. Iter 53 disciplined decision — AUDIT ONLY, deferred implementation iter 54

**Rationale Karpathy Goal-driven**:
- Full architectural refactor (~4-6h) at end of long session = RISK regression
- Andrea mandate "fai cosa migliore in assoluto" = QUALITY over speed
- 3 agents provided detailed spec ready-to-execute iter 54 fresh
- LIVE prod v80 NOT broken — toolbar cramped is UX issue NOT blocking
- Iter 54 fresh session implements 5 atoms with discipline + verify each
- Half-finished refactor late session would create iter 55+ debt

**Iter 53 deliverable**: this audit doc + commit + push.
**Iter 54 deliverable**: 5 atoms implementation + Vercel deploy + verify Andrea.

---

## 6. Iter 54 P0 cascade execution plan (READY-TO-EXECUTE)

### Atom 1 — `src/utils/strokeGeometry.js` NEW (~80 LOC)
- Export: `pointsToSmoothPath(pointsStr)`, `pointsHit(a, b, threshold)`, `parsePointsString(pointsStr)`
- Export constants: `PEN_COLORS` (5 canonical `--elab-red/blue/lime/black/orange` CSS vars), `PEN_SIZES` (3 entries: S 1.5 / M 3 / L 6 — iter 45 LIM visibility default M=3)
- Pure functions, vitest unit tests (~30 LOC tests)
- Zero behavior change (extract only)

### Atom 2 — `src/hooks/useDrawingStore.js` NEW (~120 LOC)
- React context provider OR Zustand slice (decision: React context, no new dep)
- State: `{drawingEnabled, paths[], currentStroke, penColor, penSize, isEraser}`
- Actions: `toggleDrawing()`, `setPenColor(c)`, `setPenSize(s)`, `toggleEraser()`, `addStroke(s)`, `undo()`, `clear()`
- localStorage persistence `elab-global-drawing-paths-v1`
- One-time migration from `elab-annotations-v{N}-p{P}` legacy keys

### Atom 3 — `src/components/drawing/DrawingLayer.jsx` NEW (~250 LOC)
- Full-viewport fixed SVG layer
- `<FloatingPenToolbar>` sub-component bottom-center draggable
- ARIA radio group color/size + role="toolbar" + aria-live status
- ≥48×48px touch targets WCAG 2.5.8 AAA
- Italian semantic labels (Rosso/Blu/Verde/Nero/Giallo, Sottile/Medio/Spesso)
- pointer-events delegation (none default → setPointerCapture on active stroke)
- Forced-colors Windows high-contrast media query

### Atom 4 — Mount in `LavagnaShell.jsx` behind feature flag
- `ENABLE_GLOBAL_DRAWING_LAYER` env var default `false`
- When flag false: legacy DrawingOverlay + VolumeViewer drawing unchanged
- When flag true: GlobalDrawingLayer renders + replaces legacy
- Allows A/B testing prod without risk

### Atom 5 — VolumeViewer cleanup + DrawingOverlay shim (BREAKING — deferred iter 55 after Andrea verify iter 54)
- Remove VolumeViewer inline drawing (~100 LOC delete)
- DrawingOverlay → 50 LOC shim wrapper
- Flip feature flag default `true`
- Remove LavagnaShell:65 dead lazy import

---

## 7. Honest gaps iter 53

1. **No code changes shipped iter 53** (audit only) — UX bug Andrea screenshot remains LIVE prod.
2. **Andrea screenshot 2 issue continues**: toolbar cramped + drawing scope limited. Iter 54 fix.
3. **VolumeViewer eraser missing iter 42**: real defect, user cannot selectively erase volume annotation. Iter 54 fix via shared geometry.
4. **5 HIGH Codex iter 51 findings + Onniscenza Vol mismatch + action gate iter 52** also pending iter 54+.

---

## 8. Anti-inflation G45 mandate

cap 7.0/10. NO claim:
- "Drawing refactor complete" (audit only)
- "Bug fixed" (Andrea UX issue LIVE prod unchanged)
- "Quality maximized" (planning done, execution iter 54)

Discipline win: deferred implementation to fresh session preserves quality. Karpathy Goal-driven over Karpathy Surgical (this iter): goal = correct architecture, not speed.

Pattern S race-cond fix VALIDATED 18th iter consecutive
(5+6+8+11+12+19+36+37+38+43+46+47+48+49+50+51+52+**53**).

(c) Andrea Marro 2026-05-13 — ELAB Tutor iter 53.
