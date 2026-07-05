# ELABTutor Pack — dati S1-S3 (slice 3)

Pack = **dati + metodo**, per [ELAB-AS-PLUGIN-CANON §2](../../docs/ELAB-AS-PLUGIN-CANON.md).
Il codice runtime (simulatore) vive nel Simulation Plugin (`plugins/elab-tutor/src/plugin/`);
shell/auth/dashboard/memoria/report sono concern del Core host e qui sono **vietati**:
`bin/ci/elab_boundary_gate.py` fallisce la CI con zero tolleranza se sotto `packs/`
compare un file standalone-shaped (App/main/auth/dashboard/supabase-functions).

## Contenuto migrato (mappa salvage S1-S3 del canon)

| Slice | Cosa | Sede canonica (qui) | Contratto Core |
|---|---|---|---|
| S1 | 88 lesson-path JSON (`modes_supported`, 5 fasi, `intent{}` tipato, `book_reference`) | `data/lesson-paths/` | `DidacticActivity` + proto-`CircuitScene` |
| S2 | `volume-references.js` (copre 88/88 lesson-path) | `data/volume-references.js` | `ManualRef` (`apps/studio/src/core/contracts/manual.ts`) |
| S3 | citazioni Vol.N pag.M (sostanza dati estratta da `VolumeCitation.jsx`) | `data/volume-citation.js` | `BoardCitation` (`apps/studio/src/core/contracts/boardCitation.ts`) |

Gli import di plugin, test e script puntano qui; la sede vecchia
`plugins/elab-tutor/src/data/{lesson-paths,volume-references.js}` non esiste più.
Drift guard: `apps/studio/src/__tests__/PackElabTutorData.test.ts` (88 percorsi,
copertura volume-references, grammatica label unica "Vol.N pag.M").

## Regole

1. Solo dati (JSON/JS-dato puro) e metodo (markdown, prompt). Zero componenti React,
   zero servizi, zero client di rete.
2. Nessun percorso che matchi le `STANDALONE_RULES` del gate (anche solo nel nome file).
3. Il Pack non importa dal plugin; è il plugin (o il Core) a consumare il Pack.
