# P32 — Next

## State
Phase 0 CLOSED GREEN (PR #150 caveat closed, CI 4/4 on `69f928c8`). Phase 1 CLOSED:
[P32-STATE-AUDIT.md](P32-STATE-AUDIT.md) written from 5 parallel read-only audits —
specific, file:line-backed, 9 consolidated unknowns. Un-Draft/merge #150 = Andrea.

## Next smallest slice — candidates in order (post-audit refinement)

1. ~~**R10 quick win — wire `.lesson` import → event-log restore.**~~ **DONE Iter 3**
   (mechanism + status union D5; tests 1581 green). Follow-up: ~~**R10b —
   recovery-mode UX**~~ **DONE (branch claude/p32-r10b-recovery-20260710)**:
   quando l'import risponde `skipped-non-empty` E `runtime.dataLoss/corrupted`,
   la Room offre il flusso completo — conferma esplicita (`window.confirm`) →
   backup `.jsonl` scaricato (best-effort, contratto destroyEventLogStorage) →
   close → destroy → store ricreato vuoto → restore dal bundle → `restored`,
   con swap di `lessonOsRef` e `lesson.started` ri-appeso (sessione tracciata).
   Orchestratore testabile `lessonos/recovery.ts` (deps iniettate, esiti
   espliciti declined/recovered/destroy-failed/restore-failed) + helper
   `restoreLessonOsSnapshotFromBundle` (solo memoria, niente riscrittura file).
   Fuori dalla condizione recovery il default resta `skipped-non-empty`
   (onesto, invariato).

2. ~~**Phase 5 slice 1 — wire palette.**~~ **DONE Iter 4** (D6: cavo = connection su V1;
   fisica reale via buildNets invariato; tap-tap; connect-wire envelope). U1 RISOLTO:
   `@elab-tutor-plugin` è IN-REPO (`plugins/elab-tutor/src`, alias vite.config.ts:16);
   gesti reali: wire pin-pin `SimulatorCanvas.jsx:1155`, waypoint-drag `:1387` (NO
   endpoint-retarget), palette `pendingPlacement`+`onComponentAdd` `:1065-1123` che
   l'host NON cabla (`ToolCanvasEmbeddable.tsx:1217-1282` = solo 4 callback).
   **Follow-up espliciti Phase 5 (in ordine, aggiornato iter 5):**
   a. ~~jumper verso foro occupato~~ **RIGETTATO con evidenza (D6-bis)**: fisica
      un-foro-un-reoforo; le affordance equivalenti (pin via tie, jumper via rail)
      esistono già e ora sono LOCKED da 3 test invarianti;
   b. ~~cablare `onComponentAdd` host→plugin canvas~~ **DONE (slice 2b,
      branch claude/p32b-palette-live-20260710)**: host cabla `onComponentAdd`
      in `ElabCoreCanvasMount` → `place-component` nella scena (componente
      FLOTTANTE: zero pinAssignments, inerte finché non cablato — test prova
      che il circuito del libro NON degrada, 15.3 mA invariata). Attiva
      tap-to-place, drag-drop, Ctrl+V paste, Ctrl+D duplica già scritti nel
      plugin. Deny fail-soft (`null`): `battery9v` (design d ancora aperto),
      `wire` (D6: cavo=connection → onConnectionAdd), `breadboard-half`
      (anchor non deciso), tipi non catalogati. Verificato in browser reale:
      place → 4→5 componenti, `lastOp …:place:led-libero-1`, reload → stato
      ripristinato. Follow-up spawned: **b-bis — palette UI nel canvas
      embeddable**: il trigger oggi è l'evento `elab-component-selected`
      (palette esterna/AI/tutor) o paste/duplica/drop; le chips
      ComponentPalette/ComponentDrawer del plugin NON sono montate nell'embed;
   c. wire endpoint-retarget (manca anche nel plugin canvas);
   d. battery9v in palette — richiede decisione solver multi-sorgente (D6) = design;
   e. undo/redo PIENO sulle operazioni (envelope già strutturati) — l'ANNULLA
      one-step (toggle, volatile) è DONE Iter 7 (D8); qui resta lo stack
      event-sourced multi-step con redo;
   f. netlist export (import Wokwi già esiste);
   g. ~~cancellare un singolo placement~~ **DONE Iter 6** (strumento Gomma, D7).

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
