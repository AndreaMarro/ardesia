# P32 — Next

## State
Phase 0 (P31 lockdown) **closed green**: reachability caveat resolved with a real
activation + `elementFromPoint` hit-test; PR #150 green (CI 4/4 + e2e ×5 + regression).
Un-Draft/merge is Andrea's call (D3).

## Next smallest slice (in order)

1. **Phase 1 — Ardesia scientific state audit (read-only, no product code).**
   Produce `docs/ops/P32-STATE-AUDIT.md`: inventory apps/studio + packages/engine +
   plugins/* + services/* ; plugin architecture (ToolHost, manifest, signature,
   `renderEmbeddable`); simulator (ToolCanvasEmbeddable, ElabCoreCanvasMount,
   simulationBreadboard/Scene, solver) ; ElabTutor ; LessonOS (indexedDbEventLog,
   stores) ; storage (IndexedDB, snapshots, `.lesson` export) ; deploy (none found —
   confirm). List every major unknown. Zero-risk, unblocks everything.
   Optionally use Graphify for a code map → `docs/ops/P32-GRAPH-AUDIT.md` (orientation only, not ground truth).

2. **Phase 5 slice 1 — simulator first-class palette (battery9v + wire).**
   Smallest real step toward Tinkercad: model battery9v/wire as first-class in the
   scene model (typed), addable via the existing palette→hole path, solved by the
   existing engine. Unit tests for the component graph. **No** parity claim.

3. **Deferred candidate (needs a small ADR): minimal Playwright smoke in CI** (D2).

## Immediate (human — Andrea)
- Decide un-Draft + merge of #150 now that the reachability caveat is closed.

## Do NOT (until the state audit + a plan)
New plugins, GoodNotes lavagna, graph/LLM-wiki, Supabase/Vercel wiring, any
Tinkercad/GoodNotes/ElabTutor parity claim. Big deps only behind an ADR + tests.
