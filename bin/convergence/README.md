# ARDESIA Convergence — control plane e gate locali

Script standard-library del programma di convergenza (design 2026-07-24, base
`ad8f0f9f`). Nessuna dipendenza nuova. Nessuno di questi script muta il prodotto,
il remoto o i dati: sono in **sola lettura** e producono evidenza o falliscono.

Precedente di stile: `bin/ci/*.py` (nul_scan, secret_scan, elab_boundary_gate).

## Action 1 — control plane

| File | Ruolo |
|---|---|
| `state.py` | deriva lo stato da Git in sola lettura; propone disposizioni delle worktree; **non cancella nulla** |
| `state_schema.py` | schema versionato + gate: single-program, freshness, completeness, auto-removal safety |
| `test_state.py` | controlli negativi: ogni gate deve respingere il proprio controesempio |

```bash
python3 bin/convergence/state.py                 # stato JSON sul repo corrente
python3 bin/convergence/state.py --out state.json
python3 bin/convergence/state.py --check state.json
python3 bin/convergence/test_state.py            # controlli negativi
```

Invarianti garantiti:

- una worktree **dirty**, con **untracked** o con commit non raggiungibili non e'
  mai `auto_removable`;
- uno stato piu' vecchio di 24h non si valida;
- una PR/branch aperto senza disposizione blocca la completezza;
- due programmi di convergenza attivi falliscono.

Il generatore non interroga GitHub in questa slice: resta offline e
deterministico rispetto al solo Git locale. `open_work` si popola solo con un
input read-only esplicito.

## Action 3 — confini architetturali esecutivi

| File | Ruolo |
|---|---|
| `boundary_check.py` | ratchet: fallisce solo su violazioni **nuove**; ogni regola nomina il port permesso |
| `boundary_baseline.json` | violazioni legacy congelate (oggi **vuota**: main e' pulito su queste regole) |
| `test_boundary.py` | controlli negativi: ognuna delle 5 regole coglie il proprio controesempio |

```bash
python3 bin/convergence/boundary_check.py            # gate; nuove violazioni -> exit 1
python3 bin/convergence/boundary_check.py --json
python3 bin/convergence/boundary_check.py --update-baseline   # gate umano
python3 bin/convergence/test_boundary.py             # controlli negativi
```

Regole (path -> divieto -> port):

- `lessonos/continuity*`, `design/Continuity*` -> niente `readAll`/`readAllEnvelopes`
  -> porta `readEnvelopesBySession` iniettata;
- stessi path -> niente `PATHS.JOURNAL`/`PATHS.SESSION`/flat `raw/*`
  -> `roomPaths(room)`/`sessionPaths(identity)`;
- `packs/**` -> niente supabase/auth/analytics/express/blockly/AI SDK
  -> il runtime vive nel plugin;
- `design/**` -> niente driver concreti -> `WorkspaceStore`;
- `plugins/**` -> niente `createEventLogStore`/`IndexedDbEventLog` -> porta eventi host.

**Prova che morde:** iniettando `store.readAll()` in un `continuity*` reader reale il
gate esce **1** e nomina regola e port; rimosso, esce 0. E' esattamente la classe dei
due blocker di isolamento del 23-07 (export `.lesson` flat, Continuita' su journal
flat), intercettata a check-time invece che in review.

## Cosa questi script NON fanno

Non rimuovono worktree, non chiudono PR, non applicano label, non deployano, non
pushano. La rimozione fisica, la chiusura delle PR e l'archiviazione bundle
restano **gate umani** (design §10). Lo stato propone; l'umano dispone.
