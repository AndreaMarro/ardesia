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

**Cablato** in `.github/workflows/ci.yml` come job `convergence` (D-8, 24-07). Gira
su ogni PR e su push a `main`, e richiede `fetch-depth: 0` perche' `state.py`
risolve la base su `origin/main`.

Renderlo **required** resta un gate umano separato (design §10): cablare un job e'
una modifica versionata e reversibile dentro la PR; cambiare il ruleset GitHub no.

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
python3 bin/convergence/ratchet.py --lint-json eslint.json \
    --lint-scope "apps/studio: npx eslint . --format json"   # come in CI
python3 bin/convergence/evidence_guard.py              # gate; file SHA-nominati -> exit 1
python3 bin/convergence/test_gates.py                  # controlli negativi
```

- **ratchet:** il tetto e' il valore alla baseline; superarlo fallisce, ridurlo e'
  permesso e puo' abbassare il tetto (`--update-baseline`). LOC e' segnale secondario:
  l'obiettivo vero (Action 8) e' ridurre accoppiamento, non lunghezza.
- **scope del lint dichiarato (24-07):** il conteggio arriva dal report eslint, non
  da un intero scritto a mano, e la baseline registra **quale comando** l'ha
  prodotto. Misurato oggi: `eslint .` = **258**, `eslint src` = **237**. Sono alberi
  diversi: il tetto e' `258` sullo scope piu' ampio (`eslint .`, quello di
  `npm run lint`), che copre *strettamente piu'* file del precedente `237`. Un
  conteggio con scope diverso — anche se **piu' basso** — fallisce il gate invece
  di passare come miglioramento.
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

## Action 10 (porzione) — identita' del candidato di release

| File | Ruolo |
|---|---|
| `release_manifest.py` | lega SHA sorgente, digest degli artefatti, digest dei lockfile e provenance nei byte |
| `test_release.py` | controlli negativi: 15, ognuno manomette un invariante alla volta |

```bash
python3 bin/convergence/release_manifest.py --dist apps/studio/dist --out rel.json
python3 bin/convergence/release_manifest.py --check rel.json --dist apps/studio/dist
python3 bin/convergence/test_release.py
```

Il build **gia'** incide lo SHA sorgente nel bundle (`__ARDESIA_GIT_SHA__` in
`apps/studio/vite.config.ts`); verificato firsthand nel dist del 24-07:
`ad8f0f9f42733bfb95dedd05b4a09734f91947f8` compare nei chunk. Cio' che mancava
(rischio **R2**) e' il documento che rende quel legame *controllabile*: davanti a
un artefatto servito si poteva solo indovinare quale sorgente lo avesse prodotto.

Il manifest e' invalido se: lo SHA non e' raggiungibile in Git, l'albero era
sporco, un digest diverge dal disco, compare un artefatto non dichiarato, il
digest d'albero non si ricalcola, la provenance e' falsa, o un file **dichiarato**
portatore non contiene davvero lo SHA.

Prova che morde (24-07): eseguito sul dist reale costruito da `ad8f0f9f` mentre
`HEAD` era `ef955563`, il gate ha respinto il candidato per **due** motivi veri —
albero sporco e dist stale rispetto a HEAD. Un artefatto vecchio non puo'
spacciarsi per il candidato corrente.

Il manifest **non** va nominato con lo SHA che attesta (cfr. `evidence_guard.py`).

## Cosa questi script NON fanno

Non rimuovono worktree, non chiudono PR, non applicano label, non deployano, non
pushano. La rimozione fisica, la chiusura delle PR e l'archiviazione bundle
restano **gate umani** (design §10). Lo stato propone; l'umano dispone.
