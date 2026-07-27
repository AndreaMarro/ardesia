# ARDESIA-MAP — Mappa di navigazione del monorepo

Aggiornata al 2026-07-27. Questa è la mappa del codice; l'autorità di
governance, decisioni e receipt è il vault esterno
`/Users/andreamarro/ARDESIA-KNOWLEDGE`, a partire da `00-INDEX.md`.

## Da dove partire

- Stato misurato della verticale Simulation/ELABTutor:
  `artifacts/session-2/current-flow.md`.
- Architettura del plugin:
  `docs/architecture/simulation-plugin-v2.md`.
- Specifica prodotto:
  `docs/product/ELABTUTOR-PLUGIN-SPEC.md`.
- Motore metodologico e LessonOS: `packages/engine/`.
- Lavagna, Room, SDK e ToolHost: `apps/studio/`.
- Plugin simulazione riusabile: `apps/studio/plugins/simulation/` e
  `apps/studio/sim/`.
- Pack didattico ELABTutor: `packs/elab-tutor/` e
  `plugins/elab-tutor/`.
- Tooling della fabbrica: `ops/tools/`.

## Confini di prodotto

```text
ARDESIA Core
  └─ io.ardesia.simulation     plugin tecnico riusabile
       └─ io.elab.tutor        pack didattico/manuali/metodo
```

- Core possiede board, identità, lifecycle, capability, persistenza, LessonOS e
  import/export.
- Simulation possiede scena, operazioni elettriche, provider, solve,
  diagnostica e receipt.
- ELABTutor possiede contenuti didattici, riferimenti al manuale, lesson path e
  intent della scena; non possiede il solver o il lifecycle host.

## Stato misurato Sessione 2

- SDK `1.4.0`, runtime reale e marker/workbench v2.
- Un solo gesto live, `connect-wire`, attraversa
  `Room → SDK → ToolHost → runtime/provider → board.write`.
- Cold reopen, `.lesson` export/import e isolamento room/instance sono provati
  nella slice.
- Le altre mutazioni canvas non sono ancora host-mediated.
- La fixture `v3-cap6-esp4` è `candidate`, con
  `visualMatch: unknown` ed evidence resolution `missing`.
- Verdetto: `PARTIAL_BLOCKED` / **partial simulation harness**. Nessun claim di
  plugin completo, beta, fedeltà visiva verificata o Tinkercad parity.

## Comandi di verifica

```bash
npm run bootstrap
npm run verify
python3 bin/ci/elab_boundary_gate.py
```
