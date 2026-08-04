# ARDESIA-MAP — Mappa di navigazione del monorepo

> **Che rango ha questo file.**
>
> - **Struttura del codice** — questa mappa. Dice dove sta cosa.
> - **Requisiti** — `docs/PRODUCT-CONTRACT.md` e il PRD. Dicono cosa è dovuto.
> - **Stato** — l'output di `bin/state/project_state.py`. Dice com'è adesso.
> - **Governance** — `docs/vault/ARDESIA-MAP.md` come snapshot storico, e il vault
>   canonico come archivio delle decisioni.
>
> In conflitto vale la gerarchia di `PC-AUTH-001`: il PRD prevale su mappe, README,
> canon storici e stato generato, e lo stato osservato non diventa requisito.

Questo file **non dichiara lo stato corrente**. Come ogni documento scritto a mano,
fotografa l'istante in cui è stato scritto. Per SHA, PR, check richiesti e oracoli
l'unica fonte è generata:

```bash
python3 bin/state/project_state.py --print
```

`--print` stampa il JSON e non scrive nulla; lo stesso comando senza quel flag
scrive i due file di stato. Sono gitignorati di proposito: un file di stato
committato invecchia e ridiventa la fonte stale che il generatore esiste per
rimuovere.

## Entry point per area

- **Motore didattico → `packages/engine/`**
  - Grafo del metodo e bridge-concept: `packages/engine/lessonos/graph/grounding.py`,
    `packages/engine/lessonos/graph/suggest.py` (funzione `serve_method_graph`).
  - Retrieval: `packages/engine/lessonos/retrieval/teacher.py`, con
    `packages/engine/lessonos/retrieval/expansion.py` (funzione
    `retrieve_teacher_context_with_bridges`),
    `packages/engine/lessonos/retrieval/dense.py`,
    `packages/engine/lessonos/retrieval/fts.py` e
    `packages/engine/lessonos/retrieval/hybrid.py`.
  - MCP grounded-memory: `packages/engine/lessonos/mcp/grounded_memory.py`.
  - Persistenza e CRM: `packages/engine/lessonos/store/sqlite.py`.
  - Recap: `packages/engine/lessonos/recap_export.py`.
  - Coordinamento: `packages/engine/COORDINATION.md`.
- **Lavagna e plugin-host → `apps/studio/`**
  - ToolHost: `apps/studio/src/toolhost/host.ts`,
    `apps/studio/src/toolhost/ToolFrame.tsx`,
    `apps/studio/src/toolhost/pluginManager.ts`.
  - Montaggio nel canvas: `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx` e
    `apps/studio/src/Room.tsx`.
- **Plugin ELAB → `plugins/elab-tutor/`**
  - Simulatore: `plugins/elab-tutor/src/components/simulator/`.
  - Punto di innesto come plugin: `plugins/elab-tutor/src/plugin/`.
- **Fabbrica → `ops/tools/`**
  - `ops/tools/factory-metrics.py`, `ops/tools/deadman.sh` e gli altri strumenti del
    loop. La fabbrica non viene consegnata agli utenti.
- **Documenti → `docs/`**
  - Invarianti: `docs/PRODUCT-CONTRACT.md`. Archivio: `docs/CANON-INDEX.md` e i
    cinque canon. Governance storica: `docs/vault/ARDESIA-MAP.md`.

## Comandi

```bash
bash packages/engine/eval/gate.sh
bash apps/studio/eval/gate.sh
python3 ops/tools/factory-metrics.py --digest
python3 bin/state/project_state.py --print
```

Quanto valga un gate, questa mappa non lo dice: lo dice il gate quando gira.
