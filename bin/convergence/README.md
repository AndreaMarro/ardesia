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

## Cosa questi script NON fanno

Non rimuovono worktree, non chiudono PR, non applicano label, non deployano, non
pushano. La rimozione fisica, la chiusura delle PR e l'archiviazione bundle
restano **gate umani** (design §10). Lo stato propone; l'umano dispone.
