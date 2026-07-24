# ARDESIA Convergence — control plane e gate locali

Script standard-library del programma di convergenza (design 2026-07-24, base
`ad8f0f9f`). Nessuna dipendenza nuova. Nessuno di questi script muta il prodotto,
il remoto o i dati: sono in **sola lettura** e producono evidenza o falliscono.

Precedente di stile: `bin/ci/*.py` (nul_scan, secret_scan, elab_boundary_gate).

## Runner unico

```bash
bash bin/convergence/gate.sh            # tutti i gate T1 + controlli negativi
bash bin/convergence/gate.sh --strict   # blocca anche sulla LICENSE assente (D-2)
```

**Non** cablato in `.github/workflows/ci.yml`: aggiungere un required check e' un
gate umano (design §10). Il runner esiste perche' la CI, quando l'umano lo decide,
chiami una sola cosa.

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

## Action 2 — ratchet sticky ed evidenza non auto-referenziale

| File | Ruolo |
|---|---|
| `ratchet.py` | il debito non cresce in silenzio: LOC monoliti (self-computing) + lint (fornito dalla CI) |
| `ratchet_baseline.json` | tetti reali misurati oggi: ToolCanvas 2943, Room 1119, lint 237 |
| `evidence_guard.py` | rifiuta i file di evidenza **SHA-nominati** — il punto fisso Chromatic che non converge |
| `test_gates.py` | controlli negativi di entrambi |

```bash
python3 bin/convergence/ratchet.py --lint-errors 237   # gate; crescita -> exit 1
python3 bin/convergence/evidence_guard.py              # gate; file SHA-nominati -> exit 1
python3 bin/convergence/test_gates.py                  # controlli negativi
```

- **ratchet:** il tetto e' il valore alla baseline; superarlo fallisce, ridurlo e'
  permesso e puo' abbassare il tetto (`--update-baseline`). LOC e' segnale secondario:
  l'obiettivo vero (Action 8) e' ridurre accoppiamento, non lunghezza.
- **evidence_guard:** il 23-07 ho misurato che i PR Chromatic #194-#197 non convergono
  perche' l'evidenza e' nominata con lo SHA del commit che la produce (nome nuovo -> tree
  nuovo -> patch-id diverso a ogni retry). Il guard rifiuta quel naming; rimedio:
  content-addressing per attestazione, o evidenza fuori dall'albero.

## Action 10 (porzione) — inventario componenti/licenze

| File | Ruolo |
|---|---|
| `license_inventory.py` | inventaria licenze proprie e delle dipendenze; **non sceglie** la licenza (D-2 umana) |
| `test_inventory.py` | controlli negativi |

```bash
python3 bin/convergence/license_inventory.py        # bloccante se LICENSE assente
python3 bin/convergence/license_inventory.py --report-only
python3 bin/convergence/test_inventory.py
```

Stato misurato oggi:

- **LICENSE/NOTICE root: assenti** -> nessuna distribuzione a terzi ha base legale.
  E' il blocco a monte di FB-06/FB-07 e resta una decisione umana (D-2);
- `plugins/elab-tutor` dichiara `UNLICENSED`, `apps/studio` e root nessuna licenza;
- 440 dipendenze installate, **1 senza campo license**;
- l'albero e' **quasi tutto permissivo**: MIT 337, ISC 45, Apache-2.0 30, poche
  BSD/MPL, zero GPL. Il blocco e' una scelta da fare, non un campo minato.

## Cosa questi script NON fanno

Non rimuovono worktree, non chiudono PR, non applicano label, non deployano, non
pushano. La rimozione fisica, la chiusura delle PR e l'archiviazione bundle
restano **gate umani** (design §10). Lo stato propone; l'umano dispone.
