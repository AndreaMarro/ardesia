# P32 — Next

## State
Phase 0 CLOSED GREEN (PR #150 caveat closed, CI 4/4 on `69f928c8`). Phase 1 CLOSED:
[P32-STATE-AUDIT.md](P32-STATE-AUDIT.md) written from 5 parallel read-only audits —
specific, file:line-backed, 9 consolidated unknowns. Un-Draft/merge #150 = Andrea.

## Next smallest slice — candidates in order (post-audit refinement)

1. ~~**R10 quick win — wire `.lesson` import → event-log restore.**~~ **DONE Iter 3**
   (mechanism + status union D5; tests 1581 green). Follow-up spawned: **R10b —
   recovery-mode UX**: quando `runtime.dataLoss/corrupted` (Room già mostra
   "ripristina dall'export .lesson"), offrire il flusso destroy-con-conferma →
   log vuoto → import `.lesson` → `restored`. Solo lì il restore diventa
   user-facing; oggi il default live è `skipped-non-empty` (onesto, documentato).

2. **Phase 5 slice 1 — battery9v/wire toward first-class palette.**
   Pre-work now explicit: reconcile V1 vs V2 scene model (R9) and read the
   out-of-repo `@elab-tutor-plugin/plugin/renderEmbeddable` drag semantics (U1)
   BEFORE modeling. Wire exists in solver catalog (`catalog.ts:95`) but not in the
   V1 component union nor palette (inert glyph `ToolCanvasEmbeddable.tsx:1616-1618`).

3. **Phase 2 — plugin-grammar enforcement gap (R8).**
   Either route board-embed mounts through the capability layer or ADR the
   "first-party trusted embeds" boundary explicitly. Needs design; not a quick slice.

4. **Deferred: minimal Playwright smoke in CI** (D2, small ADR).

## Immediate (human — Andrea)
- Un-Draft + merge #150 (all green, caveat closed).
- U3: is the external `ardesia-api-vercel` FastAPI repo accessible to the loop?
  Determines Phase 3 shape (extend vs greenfield).

## Do NOT (unchanged)
New plugins, GoodNotes lavagna work, graph/LLM-wiki, Supabase/Vercel wiring, parity
claims. Big deps only behind ADR + tests. ZERO-LLM in product host stands.
