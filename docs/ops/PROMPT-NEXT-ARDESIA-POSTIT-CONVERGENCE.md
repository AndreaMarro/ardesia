# Prompt - ARDESIA Post-it Convergence

Esegui lavoro reale nel repository `AndreaMarro/ardesia` con autonomia sulle
azioni normali e reversibili. Non chiedere consenso, non ripartire dall'audit e
non riassumere il mandato: leggilo e applicalo.

## Fonti vincolanti

1. `docs/ops/ARDESIA-V1-FAST-CONVERGENCE-GOAL.md`
2. `docs/ops/ARDESIA-MANDATE-ADDENDUM-20260711.md`
3. `docs/ops/ARDESIA-REUSE-AND-INSPIRATION-REGISTER.md`

Ogni requisito resta aperto fino a evidenza GREEN. La prossima slice non riduce
il full goal.

## Stato verificato

- branch goal: `origin/codex/v1-fast-convergence-goal-20260711`;
- PR #173: goal/research, non auto-mergiare;
- PR #174: CI verde ma `PARTIAL/RED` per M0, perche' migliora ancora una vista
  separata; riusa il valore UI, non il modello di pagina;
- worktree canonico e Claude WIP sono dirty: crea/usa worktree isolato;
- ELABTutor source: private first-party
  `AndreaMarro/elab-tutor@732ff07754e15a2859e4823f16490505221725ce`;
- niente claim Tinkercad parity, marketplace ready o backend/RLS verde senza
  matrice della stessa ampiezza.

## Principio non negoziabile

**Ogni plugin e' sempre un post-it, mai una pagina.**

**Il Simulation Plugin post-it deve raggiungere davvero il 100% della matrice
Tinkercad congelata.** La verticale LED e le slice A/B sono fondamenta, non
parity: nessun claim finche' catalogo, breadboard, wire, strumenti, Arduino,
editor/compile/run, seriale, plot, persistence, touch e accessibilita' non sono
tutti GREEN nel post-it canonico.

La shell ha poche pagine: Lezioni, Knowledge Explorer, Library,
Teacher/Creator Network + Marketplace, Impostazioni. Dentro una lezione ci sono
taccuino a pagine e lavagna infinita. Simulation, ElabTutor, Graph tools, Plot,
Export e Creator sono `PluginInstance` ospitate da post-it.

## Obiettivo immediato

Consegna tre slice verticali, una PR per slice.

### Slice A - Simulation nel vero post-it

Percorso browser reale:

```text
apri lezione -> taccuino o lavagna -> nuovo post-it
-> aggiungi Simulation Plugin -> piazza componente/interagisci
-> evento LessonOS -> save -> close/reopen -> stesso stato
```

Acceptance:

- usa la stessa `PluginInstance` tra taccuino, lavagna ed expand overlay;
- nessuna route/pagina Simulatore nel percorso prodotto;
- porta nel post-it solo il valore riusabile di #174;
- UI docente bella e immediata: Matisse per ritmo/campiture, Calder per
  relazioni/motion esplicativo, Haring per energia/leggibilita'; sintesi
  originale ARDESIA, nessuna imitazione;
- comandi/lifecycle durevoli emettono eventi LessonOS tipati con instance ID,
  ordering, causation e provenance;
- pointer/touch, undo/redo e persistence non regrediscono;
- anteprima live desktop, iPad portrait/landscape e LIM, zero overlap/errori.

### Slice B - Arduino Toolchain nel vero post-it

Harvest controllato da ELABTutor: Blockly/CodeMirror, `elabArduinoAst`, board
FQBN, compile agent/uploader e serial. Non importare shell o stub come feature.

Percorso minimo reale:

```text
nuovo Toolchain post-it -> scegli board/FQBN -> Blockly o C++
-> compile provider reale -> diagnostics + artifact
-> LessonOS/Library -> save/reopen
```

Definisci capability `arduino.project/board.catalog/compile/upload/serial`.
Web Serial/WebUSB/agent sono provider negoziati; upload richiede conferma umana
e resta RED senza hardware evidence. Supporto universale deriva da package/core
dinamici e matrice board, non da claim.

Core/librerie sono supply chain eseguibile: registry allowlist, hash/licenza,
sandbox effimera senza secret/rete/filesystem illimitati e resource quota.
Prima di inviare source a compiler remoto mostra consent, region e retention.

### Slice C - ElabTutor montato su Simulation e Toolchain

Non importare shell/auth/config/corpus da ELABTutor. Esegui harvesting mirato
dal repo GitHub e dalla copia locale dopo security/IP check.

Contratto minimo:

```text
SimulationPlugin provides:
  simulation.scene.read
  simulation.command
  simulation.diagnostics
  simulation.events

ElabTutorPlugin requires:
  le capability sopra
  arduino.project
  arduino.compile
  arduino.serial
  lesson.event.append
```

Percorso browser reale:

```text
Simulation + Toolchain post-it -> aggiungi ElabTutor post-it -> collega/dock
-> tutor legge scena, codice, compile diagnostics e seriale esatti
-> spiegazione/fix grounded -> comando tipato -> LessonOS audit
-> save/reopen -> link integro -> detach senza perdita
```

Le tre istanze restano post-it con ID, stato, permessi e lifecycle distinti.
Provider assente degrada ElabTutor senza corrompere il circuito.

Per il workflow Tinkercad, Toolchain si docka via `PluginLink` in uno slot del
Simulation post-it mantenendo identita' e detach; due card solo affiancate non
valgono come parity.

## Metodo rapido da progettista

1. G0 massimo 15 minuti: SHA, worktree/processi, overlap, secret scan mirato.
2. Cerca prima in repo, history, #174, ELABTutor e registro fonti.
3. Decisione `ADOPT/ADAPT/BUILD` entro 20 minuti; massimo tre candidati.
4. Characterization test prima di sostituire comportamento valido.
5. Un writer, massimo cinque file per slice salvo motivazione esplicita.
6. Implementa la verticale piu' corta; niente framework o astrazione futura.
7. Targeted test -> typecheck -> build -> Playwright reale -> secret scan.
8. Reviewer avversariale sul diff; correggi blocker, poi commit/PR.

## Architettura da preservare

- `SimulationScene` e' l'unica verita' circuito.
- ToolHost e' registry/runtime; creator e' factory.
- Plugin comunicano solo via capability/eventi pubblici.
- LessonOS e' event backbone; projection graph/library sono ricostruibili.
- Storage e' local-first, Drive e' adapter opzionale.
- Una nuova dipendenza richiede decisione `ADOPT` verificata, licenza/security/
  bundle/manutenzione favorevoli e il gate di approvazione repo; puo' vincere
  sul codice locale quando riduce costo totale e debito in modo misurabile.
- Nessun dato finto, segreto, corpus protetto, push diretto main o auto-merge.

## Dopo le tre slice

Continua dal full goal, scegliendo la prossima verticale per valore e leverage:
Knowledge Explorer/Library, Tinkercad parity nel post-it, creator/marketplace,
student knowledge, connector ChatGPT Apps/GPT/Claude/LTI/Drive. Non dichiarare
queste aree verdi finche' i relativi golden journey non passano.

## Output obbligatorio

- URL anteprima live;
- commit e PR;
- file toccati;
- comando/test con risultato;
- screenshot/probe desktop+iPad+LIM;
- claim `VERIFIED`, `PARTIAL`, `RED` o `UNKNOWN`;
- prossima slice unica, senza nuova fase di pianificazione.
