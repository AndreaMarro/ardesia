# NEXT-SESSION-PROMPT - ELABTutor Plugin + Factory Parallel Sprint

## ACTIVE — Stato al 2026-07-03 (leggere PRIMA di tutto)

Questa sezione supera i FATTI operativi delle sezioni sottostanti; la direzione
prodotto (ELABTutor/Simulation Plugin, Scratch compiler, fedeltà al libro) resta valida.

### PR aperte in attesa di merge Andrea (riverificato firsthand 03jul: main sempre `270d1e95`, nessun merge nuovo)

| PR | Cosa | Nota |
|---|---|---|
| #16 (draft) | board payload contract esp1 | va REBASATA sui pin nuovi dopo merge di #19 |
| #17 | root command surface (`bin/monorepo.sh` + root `package.json`) | sostituisce il TODO "commit command-surface" del checkout Codex: NON ricommittarla da lì; EMENDATA STOP-safe 03jul (`3eeb00fa`): `factory-readonly` = probe process-only (launchctl+ps), mai gate |
| #18 | CLAUDE-FULL-PROJECT-CONTEXT (mappa completa) | orientamento sessioni AI |
| #19 | topologia esp1 fedele al libro (Vol.1 pp.29-31) | fa fede il TESTO, non le figure; pin mai su bus-* |
| #20 / #21 | import P1 product / P0 ops (mappe, entrypoints, GITHUB-REPO-MAP-LIVE) | docs-only |
| #22 | TEACHER-DASHBOARD-SPEC | cruscotto = projection read-only, MAI secondo store |
| #23 | fix flaky `Room.integration` handleFile | root cause: race change-event vs consegna API del mock Excalidraw (`setTimeout(0)`) → early-return su `!apiRef.current`; fix = attributo `data-mock-excalidraw-api` + drain timer; 12/12 dichiarato in #23 (sessione 02jul notte) |
| #24 | LessonOS event-log micro-slice | riferimento canonico: event log append-only + materialized graph + evidence refs; NIENTE grafo parallelo |
| #25 | COLLABORATOR-ONBOARDING | regole operative per chiunque lavori sul repo |
| #26 | import ricerche UserAIOS + LessonOS memory/graph | citate da #22/#24; NUL=0, secret-scan 0 hit |
| #27 | ELABTutor plugin specification | lato Codex/Andrea; cross-check vs canon COMMENTATO (Claude, 02jul sera): §3 descrive lo stato pre-#19 (pin canonici = fixture #19), Stage 4 deve usare l'event-log #24, mount Stage 2 solo via ToolHost/originServer |
| #29 | import P1 ops — FASTAPI-CHATGPT-MCP-GATEWAY | chiude il filone import TSV: ogni riga DOCS/OPS ≤P1 ora coperta (#17/#20/#21/#26/#29); restano solo BLOCKED e P2 human-ok |
| #30 | teacher dashboard projection (LessonOS) | base = branch #24 (`feat/lessonos-eventlog-microslice-20260702`): merge DOPO #24, poi retarget su main. Chiusa da Codex sul worktree Claude, verificata avversarialmente e FIXATA (`61940847`); non-draft |
| #31 | breadboard topology validator (sim) | base = branch #19 (`feat/elab-v1-cap6-esp1-book-topology`): merge DOPO #19, poi retarget su main. Chiusa da Codex sul worktree Claude, verificata avversarialmente e FIXATA (`f90d8896`); non-draft |
| #32 (draft) | import ricerca deep-research LessonOS/sim/ELABTutor | draft Codex: solo lettura/commenti; probabile atterraggio del report deep-research (LiveStore/local-first/WebKit-eviction) |
| #33 | SDK contract range nei manifest reference + compat test | slice prodotto dal worktree handoff Codex 02jul, verificata e pushata da Claude 03jul: 27/27 test ×3, typecheck ok; handoff-doc in commit separato (split = gate Andrea) |
| #34 | JOURNAL-LESSONOS-BRIDGE-SPEC (contratto JournalEvent→LessonOsEvent) | docs-only, base main; implementazione (`journalBridge.ts`) sbloccata SOLO post-merge #24+#30 |
| #28 | QUESTA PR (refresh NEXT-SESSION-PROMPT) | da mergiare ULTIMA (o rigenerare post-merge): descrive lo stato della coda stessa |

PR #6 resta VIETATA (body≠files). Draft storiche #1/#2/#4/#5 invariate.

### Ordine di merge consigliato (proposta Claude 03jul — ratifica = gate Andrea)

`#23 → #17 → #33 → #18 → #20 → #26 → #21 → #29 → #25 → #34 → #22 → #24 → #30 → #19 → #31 → #16 → #32/#27 → #28`

Motivazioni (solo i vincoli veri; il resto è ordine di comodo docs-first):

1. **#23 per primo (flaky-first)**: finché il fix `Room.integration>handleFile` non è su main, OGNI full-suite delle PR successive può dare false-red — misurato firsthand 02jul: main 3/3 run fail, branch #23 38/38×3.
2. **#17 subito dopo**: command surface emendata STOP-safe (`3eeb00fa`) = superficie operativa sicura per chiunque lavori dopo; nessuna dipendenza.
3. **#33 presto e senza vincoli**: additiva (campo `contract` opzionale + test), zero overlap con le altre (unico file test toccato: `SdkContract.compat.test.ts`, non toccato altrove).
4. **Blocco docs #18/#20/#26/#21/#29/#25/#34/#22 in qualunque ordine interno**: docs-only, zero conflitti tra loro; #34 e #22 verso la fine del blocco perché citano #24 (meglio leggerle a ridosso).
5. **#24 PRIMA di #30 (vincolo stacked)**: #30 ha base = branch #24; dopo il merge di #24, #30 va **retargetata su main** (GitHub lo fa da solo al merge della base, ma verificare) + full test 3×.
6. **#19 PRIMA di #31 (vincolo stacked)**: #31 ha base = branch #19; stesso retarget post-merge. Decisione-#19 (slice 6-file ok o split) è gate Andrea e viene PRIMA.
7. **#19 PRIMA di #16 (vincolo pin)**: #16 va rebasata sui pin canonici di #19 (r1 i9/i3, led1 f3/e3, 3 fili; pin mai su bus-*). Overlap `fixtureAdapter.ts` con #31 → mergiare #31 prima del rebase di #16 evita un secondo giro.
8. **#32/#27 in coda**: draft altrui, richiedono review Andrea; nessuno dipende da loro.
9. **#28 ULTIMA o rigenerata**: descrive la coda; mergiarla prima la renderebbe subito stantia.

### Lane

- **Loop Codex (checkout principale `/Users/andreamarro/VOLUME 3/ardesia`)**: la slice
  MOUNT-CANVAS (`apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`,
  `simulationBreadboard.ts`) è ancora untracked → resta la tua priorità: test, poi
  commit su branch dedicato. Non toccare i branch delle PR aperte #16-#34.
- **Sessioni Claude**: SOLO worktree usa-e-getta da `origin/main`
  (`git worktree add /tmp/ardesia-<task> -b <branch> origin/main`); orientamento da
  `docs/ops/CLAUDE-FULL-PROJECT-CONTEXT.md` (#18) + `COLLABORATOR-ONBOARDING.md` (#25).

### Vincoli invariati

Mai `eval/gate.sh` · mai merge/push diretto a main · mai deploy senza OK · mai
`git add -A` · secret-scan prima di ogni push · check byte NUL sui file scritti da
tool (`LC_ALL=C tr -cd '\000' | wc -c`) · AgentMemory = cache degradata finché
`livez` timeouta · niente graph DB esterno.

---

## PROMPT PRECEDENTE (02jul mattina — fatti in parte superati dalla sezione ACTIVE sopra)

Sei Codex sul Mac di Andrea. Non fare analisi infinita: chiudi prima il gate LessonOS, poi solo output tangibile.

### Prima lettura obbligatoria

1. `/Users/andreamarro/VOLUME 3/AGENTS.md`
2. `/Users/andreamarro/VOLUME 3/ardesia/AGENTS.md`
3. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/FACTORY-LIVE-STATUS.md`
4. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/SCHEDULED-PROCESSES-INVENTORY.md`
5. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/CONTEXT-PACKETS.md`, Packet 6 first
6. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/VERCEL-MAP.md`

### Hard rules

- Do not touch any `eval/gate.sh`.
- Do not deploy, push, merge, reset, clean, force-push, delete jobs, restart services, or re-enable automation without Andrea's explicit OK.
- Do not patch product code while LessonOS `--lf` is red or still running, except docs/context-packet/blocker work.
- Treat AgentMemory as degraded cache until a tiny health/read/write check proves otherwise.
- Use Headroom style: maps first, file ranges, no repo dumps, COV for every claim.

### First task: confirm LessonOS stays clear

The prior session closed the LessonOS last-failed gate green:

```text
uv run pytest -q --lf -x --no-header
4587 passed, 4 skipped, 20 warnings in 1023.49s (0:17:03)
```

First check only that no leftover manual pytest is still alive:

```bash
ssh macmini 'ps aux | grep -iE "uv run pytest -q --lf|pytest -q --lf" | grep -v grep || true'
```

If no process is alive and no newer factory log contradicts it, do not rerun the full gate.

If a newer factory log contradicts it, classify:

- green: update `FACTORY-LIVE-STATUS.md` with exact pass result;
- red: update with failing test/traceback and produce a small blocker or patch plan;
- unknown: rerun only the smallest failing/last-failed scope, not a blind fanout.

Known current facts from the previous session:

- `tests/test_adversarial_kimi.py` passed: `2 passed`.
- `tests/test_api_unlocked_path_package_review_spaced_due_anki.py` passed: `10 passed, 1 warning`.
- `--lf` passed: `4587 passed, 4 skipped`.
- AgentMemory `/agentmemory/livez` timed out locally and on Mini.
- Headroom `/health` was healthy, version `0.27.0`.
- Codex app automation is paused.

### Second task: scheduler/memory status

Update only if facts changed:

- `docs/ops/SCHEDULED-PROCESSES-INVENTORY.md`
- `docs/ops/FACTORY-LIVE-STATUS.md`

Do not re-enable `com.elab.lessonos-hourly`. Do not restart AgentMemory. If AgentMemory is still hot/high-memory, leave a maintenance blocker with backup/rollback steps, not action.

### Third task: choose one concrete output

Pick exactly one:

- UserAIOS micro-slice packet: projection over `raw/events.jsonl` into `derived/useraios/snapshot.json`, no LLM, no second graph.
- Simulation Plugin packet: adapter/crop-coordinate plan for ELAB Vol.1 cap.6 esp.1, keeping `bookLayout.status=draft` until reviewed.
- Vercel/demo blocker: read-only browser check for `ardesia-lavagna`; no deploy unless Andrea explicitly says "ok preview deploy".

### Required closeout

Produce at least 3 tangible outputs among:

- LessonOS gate result or blocker;
- scheduler inventory update;
- factory live status update;
- AgentMemory/Headroom/Hermes status;
- UserAIOS or Simulation Plugin context packet;
- Vercel/demo status or blocker;
- updated `NEXT-SESSION-PROMPT.md`.

Run and report:

```bash
git diff --check
git status --short
```

Run product tests only if product code changed. For docs-only, do not burn the full monorepo verify unless needed.

### Memory fallback

Try one tiny AgentMemory remember only after `/agentmemory/livez` responds. If it times out, append the intended memory payload to `FACTORY-LIVE-STATUS.md` or `SCHEDULED-ACTIVITY-LOG.md` instead.

---

Data handoff: 2026-07-01, sera CEST.
Repo locale: `/Users/andreamarro/VOLUME 3/ardesia`.
Obiettivo: monorepo/fabbrica stabili + primo slice reale del prodotto ELABTutor/Simulatore dentro ARDESIA Studio, senza collage brutti, senza demo finta, con CoV finale.

## Contesto emotivo e commerciale

Andrea ha ricevuto un segnale reale da cliente/partner: i kit sono arrivati, il manuale viene percepito come "il vero valore aggiunto", chiaro, ben strutturato e didatticamente utile, e viene chiesto accesso alla piattaforma didattica collegata al kit. Questo rende urgente trasformare ARDESIA + ELABTutor da promessa a piattaforma attivabile.

Il manuale, ELABTutor e il plugin non sono tre prodotti: sono lo stesso prodotto espresso su carta, lavagna e simulatore.

## Prima cosa da fare

Leggi, in questo ordine, senza saltare:

1. `/Users/andreamarro/VOLUME 3/AGENTS.md`
2. `/Users/andreamarro/VOLUME 3/ardesia/AGENTS.md`
3. `/Users/andreamarro/VOLUME 3/ardesia/docs/vault/ARDESIA-MAP.md`
4. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS.md`
5. `/Users/andreamarro/VOLUME 3/ardesia/docs/product/UI-UX-DESIGN-DIRECTION.md`
6. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/FACTORY-LIVE-STATUS.md`
7. `/Users/andreamarro/VOLUME 3/ardesia/docs/ops/FACTORY-ROUTING-CLEAN-SPEC.md`
8. `/Users/andreamarro/VOLUME 3/ardesia/packages/engine/COORDINATION.md`
9. `/Users/andreamarro/VOLUME 3/ardesia/plugins/elab-tutor/AGENTS.md`
10. Scratch/compiler ELAB gia' lavorato:
    - `/Users/andreamarro/VOLUME 3/elab-builder/docs/architectures/blockly-arduino-cross-compiler.md`
    - `/Users/andreamarro/VOLUME 3/elab-builder/docs/specs/elab-scratch-blockly-nanor4-roundtrip.md`
    - `/Users/andreamarro/VOLUME 3/elab-builder/docs/adrs/ADR-048-blockly-nano-r4-cross-compile-board-param.md`
11. Se esistono nel plugin o nel materiale ELAB: `CLAUDE.md`, `AUTOPILOT.md`, `docs/GOVERNANCE.md`, ordini in `automa/ORDERS/`.

Regole non negoziabili:

- Non fare push, merge, deploy, cancellazioni, reset, clean, force push o modifiche esterne senza OK esplicito di Andrea.
- Non toccare `apps/studio/eval/gate.sh`.
- Non committare segreti o `.env*`.
- Non usare dati finti, demo mode o mock come prodotto.
- Se gli asset/manuali esatti per rappresentare un esperimento non sono disponibili, segnala il blocco e non inventare un circuito "simile".
- ELAB/UNLIM puo' stare nel plugin; ARDESIA core deve restare whiteboard/piattaforma generalista.

## Verifica modello e routing

Prima di lavorare sul prodotto, verifica e scrivi nel report:

- Opus builder su Mac Mini:
  - `ssh macmini 'grep -R "claude-opus-4-8" -n ~/lessonos/bin ~/.claude 2>/dev/null | head -40'`
  - `ssh macmini 'grep -R "subscriptionType.*max" -n ~/lessonos ~/.claude 2>/dev/null | head -20'`
  - Atteso attuale: `claude-opus-4-8 ultracode` presente nei binari di orchestrazione e marker `subscriptionType":"max"` presente nel wrapper account.
- Codex/Headroom:
  - `ssh macmini 'grep -n "model_provider\\|model =\\|model_reasoning_effort" ~/.codex/config.toml 2>/dev/null | head -80'`
  - Atteso attuale: provider `headroom`, modello `gpt-5.5`, effort da normalizzare/verificare.
- MiniMax/Hermes:
  - verifica se Hermes/M3 e' solo review/adversarial o anche finder attivo.
- AgentMemory:
  - `curl -sf http://127.0.0.1:3111/health` locale e, se serve, su Mac Mini.

Non dichiarare "tutto max" se non e' verificato. Se Opus 4.8 Max e' attivo, usalo per architettura, simulator fidelity e scelte difficili. Usa Codex Headroom per patching/review e MiniMax-M3/Hermes per audit ampio, se disponibile.

## Lavoro parallelo obbligatorio

Esegui due corsie in parallelo, con subagent/connettori quando utile.

### Corsia A - Fabbrica e manutenzione generale

Obiettivo: tenere la fabbrica stabile mentre il prodotto avanza.

- Controlla stato `~/lessonos`, tick, gate, digest, Hermes, Headroom, AgentMemory.
- Non riavviare loop o launchd alla cieca.
- Se il gate LessonOS e' gia' passato, non disturbare la fabbrica; documenta solo stato e rischi.
- Mantieni il monorepo ARDESIA verificabile da root:
  - `npm run verify`
  - se serve ELAB: `npm run verify:elab`
  - gate Studio: `bash apps/studio/eval/gate.sh`
  - replay: `bash apps/studio/eval/replay-check.sh`
- Aggiorna `docs/ops/FACTORY-LIVE-STATUS.md` solo con fatti verificati.

### Corsia B - Prodotto: ELABTutor Plugin + Simulation Plugin

Obiettivo: primo slice reale, bello e usabile, del plugin ELABTutor collegato a un simulatore riusabile dentro ARDESIA Studio.

Direzione prodotto:

- ARDESIA e' una lavagna viva. I plugin sono oggetti sulla carta/lavagna, non pagine separate.
- Il plugin deve adattarsi alla lavagna, stare sulla carta, essere spostabile/ridimensionabile, e l'utente deve poter scrivere sopra e attorno con appunti liberi.
- Il Simulatore deve essere un plugin generalista riusabile anche fuori da ELABTutor.
- ELABTutor deve essere un plugin/pack sopra il Simulatore, sbloccabile in futuro se acquistato tramite codice/licenza. Per ora disegna il contratto/licensing senza integrare pagamenti reali.
- Lo Scratch/Blockly compiler gia' lavorato da Andrea deve rientrare nel plugin come flow didattico reale: blocchi -> Arduino C++ -> compilazione -> simulazione/HEX -> upload fisico quando disponibile.
- UNLIM deve restare trascinabile come ora.
- Modalita' richieste:
  - passo-passo con manuale visibile come ora;
  - circuito gia' montato;
  - interazione diretta con simulatore.
- Per ora implementa o prepara solo gli esperimenti lasciati da Andrea. Non allargare scope.

Requisiti simulatore:

- Esperimenti rappresentati in modo identico al libro: stesse posizioni reciproche, stessa logica visiva, manuale e simulatore coerenti.
- AI circuit builder deve poter costruire circuiti spatially identical to book layout, non solo topologicamente equivalenti.
- Componenti facili da drag-and-drop.
- Cavi facili da usare, leggibili e realistici.
- Fisica/circuit solving realmente difendibile: niente animazioni finte spacciate per simulazione.
- Estetica massima: oggetto integrato nella lavagna, non collage di iframe, card e pannelli.

Asse Scratch compiler/upload/cross-compilazione:

- Recupera il lavoro esistente in `/Users/andreamarro/VOLUME 3/elab-builder`, non riscrivere da zero:
  - `src/services/compiler.js`
  - `src/services/uploadAgent.js`
  - `src/services/elab-agent/`
  - `src/components/simulator/panels/ScratchEditor.jsx`
  - `src/components/simulator/panels/ScratchCompileBar.jsx`
  - `src/components/simulator/panels/scratchGenerator.js`
  - `src/components/simulator/panels/scratchBlocks.js`
  - `src/data/scratch-xml-templates.js`
  - test: `tests/unit/services/compiler.test.js`, `tests/unit/services/uploadAgent.test.js`, `tests/unit/components/simulator/panels/scratchGenerator.pinMode.test.js`, `e2e/10-scratch-blockly.spec.js`.
- Mantieni l'invariante architetturale gia' emerso: il codegen Scratch/Blockly deve produrre Arduino C++ generico; il target board si sceglie via parametro di compilazione, non via fork del generatore.
- Supporta due destinazioni distinte e oneste:
  - simulazione/browser: HEX o modello compatibile con simulatore, senza fingere Nano R4 CPU se l'emulazione non e' Nano R4;
  - kit fisico: cross-compilazione Nano R4/Renesas tramite `arduino-cli`/agent locale quando disponibile.
- Upload fisico: prima ELAB Agent locale/loopback, poi Web Serial/WebUSB solo se supportato dal browser e con gesto utente. Niente upload nascosto, niente token client-side.
- Nel nuovo ARDESIA plugin, il compilatore Scratch deve essere una capability del Simulation Plugin/ELABTutor Pack, non una pagina separata. L'utente deve poter aprire blocchi, vedere C++, compilare e tornare al circuito sulla stessa lavagna.

## Inventory scientifico prima del codice

Prima di modificare, mappa cio' che esiste:

- `apps/studio/src`
- `plugins/elab-tutor`
- `packages/engine`
- `docs/product`
- `docs/vault`
- eventuale `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
- `/Users/andreamarro/VOLUME 3/elab-builder` come fonte primaria per Scratch/Blockly, compile, upload e Nano R4 cross-compile
- GitHub: usa connettore/plugin GitHub o `gh` read-only per repository e PR collegate ad ARDESIA, ELABTutor, simulatori, lavagna.
- Vercel: usa connettore/plugin o CLI read-only per capire progetto e root deploy candidate. Non deployare senza OK.

Produci una tabella breve:

- sorgente;
- cosa contiene;
- riusabile subito;
- rischi;
- file da toccare per il primo slice.

## Primo slice consigliato

Non provare a finire tutto in una volta. Fai una verticale completa:

1. Canvas/plugin substrate:
   - se manca, porta avanti il mount canvas per oggetti plugin/embeddable in Studio;
   - riferimento interno: `renderEmbeddable`, `ToolFrame`, MOUNT-CANVAS citati in `packages/engine/COORDINATION.md`.
2. Simulation Plugin shell:
   - oggetto sulla lavagna;
   - toolbar minima;
   - stato serializzabile/importabile/esportabile;
   - area annotabile senza mangiare input della lavagna.
3. ELABTutor Pack slice:
   - un esperimento reale dai materiali disponibili;
   - manuale visibile in step-by-step;
   - circuito gia' montato;
   - UNLIM trascinabile;
   - layout con coordinate/ancoraggi che dimostrano identita' spaziale rispetto al libro.
4. AI layout contract:
   - definisci schema dati per `bookLayout` o equivalente: componenti, posizioni, rotazioni, cavi, riferimenti pagina/volume, tolleranze;
   - aggiungi test che verifica che il circuito generato rispetti posizioni reciproche, non solo netlist.
5. Scratch compiler contract:
   - porta dentro il contratto blocchi -> C++ -> compile result -> sim/upload;
   - conserva board target esplicito (`avr`, `nano-r4`/Renesas o altro FQBN approvato);
   - UI minima: Blocchi, C++, Compila, Stato agent/upload, Torna al circuito;
   - se hardware non e' collegato, mostra capability reale e blocker, non simulare upload riuscito.

Se gli asset/manuali esatti non sono presenti, fermati al contratto + UI substrate + blocker documentato. Non sostituire con mock.

## Uso connettori e plugin

Usa strumenti disponibili, non lavorare cieco:

- GitHub connector/plugin: inventario repo, issue, PR, materiale riusabile.
- Vercel connector/plugin: mapping deploy read-only.
- Multi-agent/subagent: uno su fabbrica, uno su inventory prodotto, uno su UX/simulatore se disponibile.
- Browser/Playwright: verifica visiva reale quando il canvas/plugin e' toccato.
- OpenAI docs/plugin solo se serve per API key o integrazione ChatGPT/OpenAI.

## CoV finale obbligatoria

Alla fine della sessione, esegui e riporta:

- `git status --short`
- `git diff --check`
- `npm run verify`
- se ELAB toccato: `npm run verify:elab`
- `bash apps/studio/eval/gate.sh`
- `bash apps/studio/eval/replay-check.sh`
- screenshot Playwright desktop e tablet del plugin sulla lavagna se hai toccato UI/plugin;
- se tocchi o importi Scratch/compiler: test equivalenti a compiler, uploadAgent, scratchGenerator e uno smoke Blockly->C++->compile/sim;
- eventuale build Vite;
- rischi residui e prossima patch chirurgica.

Se un test fallisce, non nasconderlo: diagnostica, riduci patch o lascia blocker preciso.

## Deliverable atteso

La sessione deve chiudere con uno di questi risultati:

- preferito: patch piccola ma reale che rende visibile/usabile il primo oggetto ELABTutor/Simulation Plugin sulla lavagna, con primo contratto Scratch compiler/upload/cross-compile e test/CoV;
- accettabile se mancano asset: inventory completo + contratto tecnico `bookLayout` + UI/plugin substrate verificato + blocker preciso sugli asset manuale;
- non accettabile: documento generico, mock estetico, circuito simile ma non identico, feature scollegata dalla lavagna, deploy senza gate.

Scrivi il report finale in italiano, con:

- cosa e' stato fatto;
- file toccati;
- CoV;
- stato Opus 4.8/Headroom/MiniMax/AgentMemory;
- cosa puo' fare Andrea o il collega subito dopo.


---

# AGGIORNAMENTO 2026-07-02 (continuazione post-crash) — RIPARTI DA QUI

Sei Codex/Claude sul Mac di Andrea. Prima leggi questo file. Non fare analisi
generica: riprendi dal COV qui sotto e produci lavoro verificabile.

## Stato locale
- Repo `/Users/andreamarro/VOLUME 3/ardesia`, branch `codex/ardesia-ops-headroom-20260701`, HEAD `8d340de1`.
- `git diff --check`: PULITO. 7 file tracciati modificati (+263/-18). ~46 untracked.
- **`package.json` root + `bin/monorepo.sh` = untracked** → command surface non committata (P0).

## Cosa è stato modificato in questa sessione
- Creati 9 doc mancanti (6 in `docs/ops/`, 3 in `docs/product/`). Vedi `LOCAL-VOLUME3-STATUS.md` sezione "continuazione".
- Nessun file di codice toccato in questa sessione (solo docs/packet).

## Cosa NON è verificabile senza GitHub/Mini/Vercel
PR #6 (non-merge) / PR #8 (planning), Vercel live, AgentMemory live, headroom reale,
stato storico del gate LessonOS rosso, superato dal COV corrente sopra (`NameError: re is not defined` in `tests/test_adversarial_kimi.py`),
scheduler/launchd. → tutto in `NEXT-CODEX-PACKET.md`.

## Prossima micro-task (in ordine)
1. Eseguire `docs/ops/NEXT-CODEX-PACKET.md`: commit command-surface → commit docs → (se test verdi) commit toolhost MOUNT-CANVAS.
2. Confermare/fixare gate LessonOS **prima** di riattivare automazioni.
3. Se gate verde: partire da `SIMULATION-PLUGIN-ELAB-NEXT-CONTEXT-PACKET.md` (Vol.1 cap.6 esp.1) **oppure** `ELECTROTECHNICS-MVP-CONTEXT-PACKET.md` (DC, circuito confermato).

## Cosa NON fare
- Non mergeare PR #6. Non usare `git add -A`. Non montare plugin bypassando la firma host.
- Non introdurre graph DB esterno (decisione: event log + materialized graph + evidence refs).
- Non implementare engine con gate rosso non accettato come blocker.

## COV richiesta alla prossima sessione
Path, branch, commit creati (hash), `npm run verify` pass/fail, stato PR #6/#8, Vercel
build+URL, gate LessonOS rosso/verde+causa, cosa non fatto e perché.

---

## Volume 3 GitHub inventory status

Created from a clean worktree based on `origin/main` after PR #9 merge (`c48500cb`). Do not use the dirty local `ardesia` worktree as the PR base.

Files created/updated:
- `docs/ops/VOLUME3-GITHUB-INVENTORY.md`
- `docs/ops/VOLUME3-GITHUB-CANDIDATES.tsv`
- `docs/ops/VOLUME3-DO-NOT-COMMIT.md`
- `docs/ops/VOLUME3-LARGE-FILES-AND-ASSETS.md`
- `docs/ops/VOLUME3-LOCAL-HANDOFF-FOR-GITHUB.md`
- `docs/ops/NEXT-SESSION-PROMPT.md`

P0/P1 candidates:
- P0 docs/ops: local status, repo map, entrypoints, headroom docs, AgentMemory semantic protocol.
- P1 docs/product: Electrotechnics, ExamForge, FastAPI gateway, ChatGPT Apps/MCP integration, LessonOS graph/memory research.

Do-not-commit:
- 1090 sensitive filename matches.
- 13045 redacted content path matches.
- 109 files >20MB.

Next PR:
- Draft docs-only PR: `docs(ops): inventory Volume 3 GitHub candidates`.

Blockers:
- No bulk import. No assets/manuali/PDF/video/zip/env/dump/corpus.
- Product docs require human/licence/sanitization review before becoming canonical.
- AgentMemory remains degraded; only read-only canary was performed.

Prompt for next session:
1. Open `/tmp/ardesia-volume3-inventory-20260702-031847` or fetch the draft PR branch.
2. Run `git status -sb`, `git diff --check`, and inspect the six docs-only files.
3. If still docs-only and no secrets appear, finish/push the draft PR.
4. Do not add unrelated local work from `/Users/andreamarro/VOLUME 3/ardesia`.
