# ARDESIA-MAP — Mappa di navigazione del monorepo

Dove sta cosa e da dove partire. (Mappa del CODICE; la mappa di governance/visione e in `ardesia-vault/ARDESIA-MAP.md`.)

## Entry point per area
- **Motore (AI-metodologica) -> `packages/engine/`**
  - Grafo del metodo / bridge-concept: cerca `expansion.py`, `grounding.py`, `serve_method_graph`.
  - Retrieval (MOAT, oggi debole recall@10 0.23): `teacher.py` (default LexiconEmbedder = lexical), `recall_eval.py` (harness). Leva aperta: wirare `retrieve_teacher_context_with_bridges` nel path.
  - MCP grounded-memory: `mcp/grounded_memory.py`. CRM: `crm`/`sqlite.py`. Recap: `recap_export`.
  - Coordinamento loop: `COORDINATION.md` (PROSSIMA TASK / ROADMAP-AUTO / CLAUDE-SAYS / NEEDS-CLAUDE).
- **Lavagna + plugin-host -> `apps/studio/`**
  - ToolHost / mount: `ToolFrame`, `host.mount`. Plugin manager, kill-switch, firma ed25519.
  - P0 in corso (PRD18): NO-MODIFY TOCTOU (bundleHash nel manifest firmato + re-hash al mount); poi MOUNT-CANVAS (`renderEmbeddable` -> `<Excalidraw>` in `Room.tsx`).
  - Reference plugins: `plugins/` interni (es. outline, sim-reference).
- **Plugin ELAB (nuovo) -> `plugins/elab-tutor/`**
  - Simulatore: `src/components/simulator/` (CircuitSolver union-find, WireRenderer, BreadboardHalf). I 5 tipi di collegamento sono GIA modellati.
  - CircuitScene v1 = spec/work-order in PR#195 (branch `claude/elab-simulator-codebase-graph-mhT32`): provenance + validatori (electrical/geometry/bookMatch). Fix dati noto: `c21 -> e21` su 3 esperimenti vol3.
- **Fabbrica -> `ops/tools/`**
  - `factory-metrics.py --digest`, gate, `deadman.sh`, bridge Telegram, replenish/strategos. Gira sul Mini.
- **Docs/visione -> `docs/`** + vault esterno `ardesia-vault` (governance, PDF v2).

## Stato (18/06/2026)
- Gate: engine ~2041/0, studio ~585/0 (verifica live: `factory-metrics.py --digest`).
- Pin attivi: studio = TOCTOU (PRD18 P0-2), engine = moat graph-aware. Coda: MOUNT-CANVAS.
- Cutover monorepo: APPENA FATTO (questo repo). Le sorgenti separate (lessonos/maestro-studio/maestro-tools) restano i repo di lavoro del loop finche non si sposta il loop qui.

## Comandi rapidi
```
bash packages/engine/eval/gate.sh      # gate motore
bash apps/studio/eval/gate.sh          # gate lavagna
python3 ops/tools/factory-metrics.py --digest
```
