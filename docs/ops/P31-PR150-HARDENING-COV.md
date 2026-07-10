# P31 PR #150 — Hardening COV

| Feature | Evidence file:line | Runtime proof | Test | Status |
|---|---|---|---|---|
| mount plugin | ToolCanvasEmbeddable.tsx:970 `data-elab-core-canvas-mounted="true"` | e2e mount | p30-free repeat-each=5 | ✅ |
| free-mode strip | ToolCanvasEmbeddable.tsx `[data-simulation-free-mode]` | visible | p30-free | ✅ |
| solve badge / current mA | `data-sim-solve-kind="solved"`, `data-sim-current-ma=15.3` | real solver | p30-free | ✅ |
| palette add | legacy `palette Resistenza` → `data-montaggio-canvas-count=1` | dispatch onClick | p30-free | ✅ (logic) |
| scene digest | `simulationSceneDigest(boardScene)` | `data-sim-scene-digest` 8-hex | digest 5/5 + p30-free | ✅ |
| break → open-circuit | `handleBreakConnections` battery-disconnect → `solveSeriesLoop.closed=false` | `data-sim-solve-kind="error"` | p30-free | ✅ |
| simulation.error.observed | simulationSolveEvent → `data-sim-last-event-kind` + `data-sim-error-id~open-circuit` | real event | p30-free | ✅ |
| diagnostic visible | `[data-sim-diagnostic]` | visible | p30-free | ✅ |
| reopen digest identical | reload `?room=` → same boardScene | `data-sim-scene-digest` == broken | p30-free | ✅ |
| placement persists reopen | `data-montaggio-canvas-count=1` after reload | persisted | p30-free | ✅ |
| no console errors | event-log serialization fix | `expect(consoleErrors).toEqual([])` | p30-free | ✅ |
| event-log emit reliability | indexedDbEventLog.ts writeQueue + Promise.all | serialized seqs | IndexedDbEventLog 25/25 | ✅ |

## Coverage boundary (honest)
- REAL-POINTER reachability of the embed controls: covered by `montaggio-canvas.spec.ts` (palette+holes, raw mouse). Free-mode strip (`data-sim-break`) real-pointer reachability = **not yet** (follow-up).

## NOT Tinkercad parity
Wide palette / free wire drag / undo-redo / instruments / Arduino / full export absent. No parity claim.
