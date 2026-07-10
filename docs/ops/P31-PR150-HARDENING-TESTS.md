# P31 PR #150 — Tests run (evidence)

Commands + results (logs in `/tmp/p31-*`):

- `tsc -b --noEmit` → **0**.
- `vite build` → **0** (chunk-size warnings only).
- `vitest run IndexedDbEventLog.test.ts` → **25/25** (incl. 4 new P31 reliability tests).
- `vitest run simulationSceneDigest.test.ts` → 5/5. `ToolCanvasEmbeddable.test.tsx` green (in full suite).
- `playwright test p30-free-manipulation.spec.ts --repeat-each=3` → **3/3 (23.0s)**.
- `playwright test p30-free-manipulation.spec.ts --repeat-each=5` → **5/5 (39.7s)**.
- `playwright test montaggio-canvas.spec.ts first-led-ipad-touch.spec.ts` → **2/2 (8.9s)**.
- full `vitest run` (`--pool=threads --maxWorkers=1`) → **1574 pass / 5 skip / 0 fail** (174 files).

Reliability tests (`IndexedDbEventLog.test.ts`, "affidabilità emit (P31)"):
1. concurrent appends → distinct monotonic seqs, no reject.
2. solved→error→solved → 3 distinct events persisted.
3. rapid identical benign appends (×8) → all fulfilled, no orphan rejection.
4. non-benign error (empty evidence) → rejects the caller (not swallowed); queue keeps working (next seq=1).
