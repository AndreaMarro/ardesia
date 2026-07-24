---
id: ardesia-convergence-ten-actions-status-2026-07-24
type: implementation-report
status: IMPLEMENTED_PARTIAL
project: ARDESIA
owner: Andrea Marro
created: 2026-07-24
timezone: Europe/Rome
source_of_truth: false
authority: measured-implementation-report
base_sha: ad8f0f9f42733bfb95dedd05b4a09734f91947f8
execution_mode: serial-no-swarms
related:
  - docs/superpowers/specs/2026-07-24-ardesia-convergence-ten-actions-design.md
  - docs/adr/ADR-0004-lessonos-single-mutable-authority.md
  - docs/adr/ADR-0005-plugin-trust-receipt.md
  - docs/adr/ADR-0006-lesson-import-lock-order.md
  - docs/legal/LICENSE-DECISION-D-2.md
---

# ARDESIA — le dieci azioni, eseguite

Base `ad8f0f9f` · linea `ad8f0f9f..HEAD`, 10 commit · esecuzione seriale, nessuno sciame.

## Che cosa è stato fatto, in una frase

Le dieci azioni del programma di convergenza esistevano come **prosa**. Quattro
erano già diventate strumenti locali il 24-07 all'01:37 (linea T1). Le altre sei
lo sono diventate oggi, e la linea T1 è stata **cablata in CI** invece di restare
un runner che qualcuno doveva ricordarsi di lanciare.

## Che cosa NON è stato fatto — detto subito

- **Il prodotto non si è mosso.** Nessuna funzionalità nuova, nessun docente
  vedrà nulla di diverso. L'unica modifica al codice di prodotto è l'export di
  una factory di broker già esistente, additiva, per poter misurare un deadlock.
- **Le sette violazioni di scrittura LessonOS non sono riparate**, sono
  congelate. Congelare non è ripagare.
- **Il macro-import `.lesson` non esiste.** Il rischio R6 resta aperto: c'è
  l'ordine dei lock su carta e il deadlock riprodotto in un test, non la
  transazione.
- **Nessun deploy, nessun push, nessuna PR, nessuna mutazione GitHub.**
- **Nessuna licenza scelta.** È l'unico rosso residuo, ed è voluto.
- **Nessuna prova di prodotto**: niente browser matrix, device matrix, a11y
  audit, pilota. `NOT_RUN` dichiarati, non omessi.

## Le dieci azioni

| # | Azione | Stato | Dove |
|---|---|---|---|
| 1 | Control plane e budget di entropia | strumento, ora **in CI** | `bin/convergence/state.py` |
| 2 | Piramide CI ed evidenza immutabile | **cablata in CI** (D-8) | `.github/workflows/ci.yml` job `convergence` |
| 3 | Confini architetturali esecutivi | esteso: 7 regole | `bin/convergence/boundary_check.py` |
| 4 | Una sola autorità mutabile LessonOS | regole + ADR; 7 violazioni congelate | ADR-0004 |
| 5 | Un runtime plugin con fiducia verificata | modello controllabile a macchina | ADR-0005, `plugin_trust.py` |
| 6 | Strangler ELAB/Simulation | superficie dipendenze misurata e congelata | `guest_deps.py` |
| 7 | Transazione `.lesson`, recovery, concorrenza | deadlock **riprodotto**; ordine dei lock fissato | ADR-0006, `LessonMutationReentrancy.test.ts` |
| 8 | Decomposizione dei monoliti | metriche di accoppiamento, non solo LOC | `ratchet.py` |
| 9 | Quality Lab limitato | 10 task da fallimenti osservati | `quality_lab.py` |
| 10 | Supply chain e identità di release | manifest + inventario licenze | `release_manifest.py`, `license_inventory.py` |

## I numeri misurati oggi (nessuno riciclato)

### Identità del candidato (Action 10)

Build su albero pulito da `4d697f5e`: `npm run build` **exit 0**, manifest
emesso e **valido**, 201 artefatti, portatore di provenance
`assets/indexedDbEventLog-CzRmQpMy.js`, tre lockfile impegnati.

Prova che il gate morde: eseguito su un dist costruito da `ad8f0f9f` mentre HEAD
era `ef955563`, ha respinto il candidato per **due** motivi veri — albero sporco
e dist stale. Un artefatto vecchio non può spacciarsi per il candidato corrente.

### Superficie dell'ospite ELAB (Action 6)

Delle **35** dipendenze runtime dichiarate da `plugins/elab-tutor`, **2** sono
raggiungibili staticamente dalla superficie che lo Studio consuma davvero:
`react` e `react-dom`, che lo Studio già deduplica. Le altre **33** — supabase,
express, cors, AI SDK, blockly, i18next — restano confinate allo standalone.

33 file percorsi: il canvas, gli SVG dei componenti, il registry, i dati degli
esperimenti. `avr8js` e `CircuitSolver` **non** sono raggiungibili, coerente col
solver vendorizzato a parte sotto `apps/studio/sim/solver`.

Lo strangler è molto più avanti di quanto «36 dipendenze dell'ospite»
suggerisse. Ora quel numero è congelato.

### Scrittori LessonOS (Action 4)

Sette violazioni reali: `TeacherDashboardView` (4, di cui **una in scrittura**),
`ElabLab`, `MultiPostitWorkbench`, `RecapView`. Le tre proiezioni **non**
scrivono: l'invariante reggeva, ma niente lo teneva.

### Monoliti (Action 8)

| file | loc | fan_out | exports |
|---|---|---|---|
| `toolhost/ToolCanvasEmbeddable.tsx` | 2943 | 20 | **46** |
| `Room.tsx` | 1119 | **29** | 1 |

Due malattie diverse che sulla sola LOC sembrerebbero la stessa. Da ToolCanvas
si estrae riducendo `exports`; da Room, riducendo `fan_out`.

### Concorrenza (Action 7)

7/7 in 1,22 s sul broker in-process **di produzione**. Il deadlock non è più una
nota di review: è un predicato.

Scoperta scrivendo i test — il primo giro è fallito per il motivo giusto: il
broker di default è un **singleton di modulo**, quindi un import bloccato lascia
il lock di workspace preso *per sempre* e chiunque altro nel realm resta fuori,
anche su una lezione che non c'entra nulla. In produzione un solo import annidato
congelerebbe ogni mutazione della tab. Ora ha un test suo.

### Licenze (Action 10)

440 dipendenze, **0** con licenza ignota (era 1: `khroma@2.1.0` omette il campo
ma spedisce il testo MIT), **zero GPL puro**. Unico blocco residuo: manca
`LICENSE`. → `docs/legal/LICENSE-DECISION-D-2.md`.

### Debito sorvegliato (Action 2)

Lint: **258** con scope dichiarato `apps/studio: npx eslint . --format json`. Il
tetto precedente, 237, era misurato su `eslint src` — albero diverso, non una
regressione. Lo scope più ampio copre **strettamente più** file. Da oggi un
conteggio con scope diverso fallisce il gate **anche se più basso**.

## Il gate, oggi

```
bash bin/convergence/gate.sh
```

15 controlli, tutti PASS, più il rosso dichiarato dell'inventario licenze in
`--strict`.

**114 controlli negativi in Python**, contati eseguendo ciascun file:

| file | test |
|---|---|
| `test_gates.py` | 22 |
| `test_boundary.py` | 15 |
| `test_plugin_trust.py` | 15 |
| `test_release.py` | 15 |
| `test_quality_lab.py` | 18 |
| `test_guest_deps.py` | 12 |
| `test_inventory.py` | 9 |
| `test_state.py` | 8 |

più **7** in vitest (`LessonMutationReentrancy.test.ts`). Ogni gate è stato visto
respingere il proprio controesempio. Un gate mai visto rosso non è un gate.

## Prove che ciascun gate morde

| Gate | Controesempio iniettato | Esito |
|---|---|---|
| confini | `createEventLogStore()` in `SavedLessonsView` | exit 1, regola e port nominati |
| confini | `store.readAll()` in un reader `continuity*` | exit 1 |
| ratchet lint | conteggio **più basso** con scope diverso | exit 1 |
| ratchet monoliti | un import in più, un export in più | exit 1 su `fan_out`/`exports` |
| release | dist costruito da un altro SHA | rifiutato: provenance assente |
| release | file dichiarato portatore che non contiene lo SHA | rifiutato |
| plugin trust | tier promosso a `verified` nel sorgente | exit 1 |
| plugin trust | built-in che rivendica la firma ed25519 | rifiutato |
| guest deps | `express` importata dall'entry | exit 1 |
| guest deps | dipendenza aggiunta e **mai importata** | exit 1 |
| quality lab | task che può modificare il proprio evaluator | rifiutato |
| quality lab | `PASS` con un guardrail regredito | rifiutato |
| concorrenza | `withPathMutation` dentro `withWorkspaceExclusive` | non si stabilizza |
| licenze | testo di licenza non riconoscibile | resta ignoto, bloccante |

## Ricevuta — comandi eseguiti, output fresco

Tutti su questo albero, oggi. Nessun numero riciclato da audit precedenti.

| Comando | Esito |
|---|---|
| `npm run verify` | **exit 0** |
| └ Engine `uv run pytest -q` | **2044 passed, 7 skipped** |
| └ Studio `tsc -b --noEmit` | **exit 0** |
| └ Studio vitest | **1977 passed, 5 skipped** (181 file, 1 skipped) |
| └ `vite build` | **exit 0**, warning noto sui chunk > 500 kB |
| `bash bin/convergence/gate.sh` | **ALL PASS** (15 controlli) |
| `python3 bin/convergence/release_manifest.py --dist apps/studio/dist` | manifest **valido**, 201 artefatti |
| `python3 bin/convergence/license_inventory.py` | **exit 1** — voluto: manca `LICENSE` (D-2) |

Studio passa da **1970** a **1977** test: i 7 aggiunti sono la caratterizzazione
della non reentranza. Nessun test preesistente modificato, nessuno rimosso.

Conteggi Engine e Studio appartengono allo stesso SHA e **non si sommano**.

## Diff del programma

`ad8f0f9f..HEAD`, 33 file. Di questi, **due** toccano il prodotto:

- `apps/studio/src/store/lessonMutationLock.ts` — export additivo di una factory
  di broker gia' esistente, nessun cambio di comportamento;
- `apps/studio/src/__tests__/LessonMutationReentrancy.test.ts` — nuovo test.

Tutto il resto e' `bin/convergence/`, `docs/` e `.github/workflows/ci.yml`.

## Decisioni umane ancora aperte

| # | Decisione | Perché resta umana |
|---|---|---|
| **D-2** | licenza | concessione di Andrea a terzi, difficilmente revocabile → `docs/legal/LICENSE-DECISION-D-2.md` |
| **D-1** | `required_approving_review_count` 0→1 | con `enforce_admins:true` e un solo maintainer, bloccherebbe ogni PR |
| D-8b | rendere `convergence` un **required check** | cablare un job è versionato e reversibile; cambiare il ruleset GitHub no |
| D-3 | disposizione delle 20 PR e delle 64 worktree | il control plane propone, non cancella |
| D-4/5/6 | ratifica ADR-0004, ADR-0005, ADR-0006 | cambiano l'autorità, non il codice |
| D-9 | installazione di strumenti (SBOM, mutation, scanner) | dipendenze nuove |
| D-10 | deploy, rollback, monitoraggio, pilota | azioni esterne |

## Prossimo passo a leva più alta

Non è un'altra azione: è **D-2**. Costa cinque minuti, sblocca l'unico rosso
rimasto e non chiude nessuna porta se si sceglie proprietaria. Tutto il resto del
programma è già eseguito o esplicitamente congelato.

Subito dopo, in ordine di leva: la porta di lettura per `RecapView` e `ElabLab`
(le due violazioni LessonOS più facili), poi il macro-import di ADR-0006, che è
l'unico rischio P1 ancora senza rete.
