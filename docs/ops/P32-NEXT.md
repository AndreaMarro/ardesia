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

2. ~~**Phase 5 slice 1 — wire palette.**~~ **DONE Iter 4** (D6: cavo = connection su V1;
   fisica reale via buildNets invariato; tap-tap; connect-wire envelope). U1 RISOLTO:
   `@elab-tutor-plugin` è IN-REPO (`plugins/elab-tutor/src`, alias vite.config.ts:16);
   gesti reali: wire pin-pin `SimulatorCanvas.jsx:1155`, waypoint-drag `:1387` (NO
   endpoint-retarget), palette `pendingPlacement`+`onComponentAdd` `:1065-1123` che
   l'host NON cabla (`ToolCanvasEmbeddable.tsx:1217-1282` = solo 4 callback).
   **Follow-up espliciti Phase 5 (in ordine):**
   a. jumper verso foro OCCUPATO (uso canonico Tinkercad; oggi regola v1 uniforme rifiuta);
   b. cablare `onComponentAdd` host→plugin canvas (palette del canvas plugin viva);
   c. wire endpoint-retarget (manca anche nel plugin canvas);
   d. battery9v in palette — richiede decisione solver multi-sorgente (D6) = design;
   e. undo/redo sulle operazioni (envelope già strutturati);
   f. netlist export (import Wokwi già esiste).

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
