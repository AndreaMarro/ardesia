# ELABTutor Pack — scaffold (slice 2)

Pack = **dati + metodo**, per [ELAB-AS-PLUGIN-CANON §2](../../docs/ELAB-AS-PLUGIN-CANON.md).
Il codice runtime (simulatore) vive nel Simulation Plugin (`plugins/elab-tutor/src/plugin/`);
shell/auth/dashboard/memoria/report sono concern del Core host e qui sono **vietati**:
`bin/ci/elab_boundary_gate.py` fallisce la CI con zero tolleranza se sotto `packs/`
compare un file standalone-shaped (App/main/auth/dashboard/supabase-functions).

## Contenuto pianificato (mappa salvage S1-S3 del canon)

| Slice | Cosa | Sorgente attuale | Contratto Core |
|---|---|---|---|
| S1 | 88 lesson-path JSON (`modes_supported`, 5 fasi, `intent{}` tipato, `book_reference`) | `plugins/elab-tutor/src/data/lesson-paths/` | `DidacticActivity` + proto-`CircuitScene` |
| S2 | `volume-references.js` (88/88) | `plugins/elab-tutor/src/data/volume-references.js` | `ManualRef` (`apps/studio/src/core/contracts/manual.ts`) |
| S3 | citazioni Vol.N pag.M | `VolumeCitation.jsx` (solo la sostanza dati) | `BoardCitation` (`apps/studio/src/core/contracts/boardCitation.ts`) |

La migrazione dati è una slice successiva: ogni spostamento ripunta gli import del
plugin e passa il gate. Questo scaffold fissa manifest (`kind: "pack"`, enum
`ArdesiaModuleKindSchema`) e confine, senza copiare dati a metà.

## Regole

1. Solo dati (JSON/JS-dato puro) e metodo (markdown, prompt). Zero componenti React,
   zero servizi, zero client di rete.
2. Nessun percorso che matchi le `STANDALONE_RULES` del gate (anche solo nel nome file).
3. Il Pack non importa dal plugin; è il plugin (o il Core) a consumare il Pack.
