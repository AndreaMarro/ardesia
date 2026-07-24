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

- **Gate di convergenza -> `bin/convergence/`**
  - `bash bin/convergence/gate.sh` — confini architetturali, ratchet del debito
    (loc/fan_out/exports + lint con scope dichiarato), superficie delle
    dipendenze dell'ospite ELAB, modello di fiducia dei plugin, identita' di
    release, inventario licenze. Sola lettura, standard library, in CI come job
    `convergence`.
  - Stato e numeri misurati: `docs/ops/ARDESIA-CONVERGENCE-TEN-ACTIONS-2026-07-24.md`.
    Autorita' proposta: ADR-0004 (scrittore unico LessonOS), ADR-0005 (fiducia
    plugin), ADR-0006 (ordine dei lock dell'import).

## Stato (18/06/2026) — **numeri superati, vedi sotto**
- Gate: engine ~2041/0, studio ~585/0 (verifica live: `factory-metrics.py --digest`).
- Pin attivi: studio = TOCTOU (PRD18 P0-2), engine = moat graph-aware. Coda: MOUNT-CANVAS.
- Cutover monorepo: APPENA FATTO (questo repo). Le sorgenti separate (lessonos/maestro-studio/maestro-tools) restano i repo di lavoro del loop finche non si sposta il loop qui.

## Stato misurato (24/07/2026)
Rimisurato su questo albero; sostituisce i conteggi di giugno qui sopra, che
restano come traccia storica.
- Engine: **2044 passed, 7 skipped**. Studio typecheck: **exit 0**. Build: **exit 0**
  (warning noto: chunk oltre 500 kB).
- Lint: **258 errori**, scope dichiarato `apps/studio: npx eslint . --format json`.
  Il vecchio 237 era misurato su `eslint src` — albero diverso, non una regressione.
- `bash bin/convergence/gate.sh`: **ALL PASS**. In `--strict` resta rosso solo
  l'inventario licenze, perche' manca `LICENSE` (D-2, decisione di Andrea).
- Superficie ospite ELAB nel bundle: **2 dipendenze su 35** (`react`, `react-dom`).

## Comandi rapidi
```
bash packages/engine/eval/gate.sh      # gate motore
bash apps/studio/eval/gate.sh          # gate lavagna
python3 ops/tools/factory-metrics.py --digest
```
