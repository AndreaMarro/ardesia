# ARDESIA V1 — loop operativo eseguibile

Versione: 2026-07-10 · stato: review 1 respinta; non avviare implementazione
finché repository truth, harness e security gate indicati nello state non sono
chiusi e una nuova review approva il prompt.

## Missione

Portare ARDESIA a un teaching prototype realmente usabile da Andrea durante
una lezione. Il loop deve ridurre il primo confine rotto del percorso docente,
non massimizzare codice, test o documenti.

## Fonti e linguaggio delle prove

Ordine di autorità:

1. comportamento riprodotto sullo SHA corrente;
2. test/CI legati allo stesso SHA;
3. deploy e database verificati;
4. canon ratificati correnti;
5. ADR, PR/issue, report e memoria.

Ogni claim usa uno stato: `VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`,
`RED`, `DEFERRED`. Deve indicare evidenza, SHA, data, confidenza, limite e
ultima verifica. CI verde, un HTTP 200, un test unitario o una demo non provano
da soli un percorso docente.

## Invarianti non negoziabili

- Docente centrale; l'AI propone/spiega, non sostituisce o corregge in
  silenzio.
- Principio Zero canonico: **«Il docente è il tramite. UNLIM è lo strumento
  del docente. Gli studenti lavorano sui kit fisici ELAB.»** Il testo dei
  volumi va citato/usato con le stesse parole, voce plurale (`Ragazzi,`) e
  riferimento Vol./pag.; fonte `plugins/elab-tutor/CLAUDE.md:5-16`. Ogni
  implementazione divergente è `RED`, non una reinterpretazione ammessa.
- Manuale, specifica target del libro, `SimulationScene`, modalità già montato,
  sequenza passo-passo, netlist, solver, export e contesto tutor devono essere
  confrontabili con provenance e revisioni. `BookCircuitSpec` è un nome del
  mandato, non un tipo canonico esistente: non introdurlo senza ADR rispetto a
  `SimulationScene`/`ElabScene`.
- `reduce(stepOperations) == mountedScene`; equivalenza elettrica non implica
  fedeltà editoriale o visuale.
- `SimulationScene` è dominio; DOM/SVG sono rendering.
- L'AI controlla il simulatore solo tramite operazioni tipate, validate,
  reversibili, permission-checked ed event-producing.
- Plugin tramite interfacce/capability e ToolHost. Un collegamento diretto
  first-party resta `RED` e non è pilot-ready; un ADR può documentare il
  debito, non trasformarlo in enforcement.
- LessonOS è la spina: azione → operazione → evento → log locale → sync →
  grafo → memoria → tutor → artefatto.
- Knowledge Card semplice a riposo, potente su richiesta; UI teacher-first,
  touch-first, accessibile, originale, verificata su iPad e LIM.
- Local-first, GDPR/minori: nessun corpus/PII in repository, CI o nodi-agente;
  il client tratta solo dati necessari con consenso, scope, export/delete e
  persistenza dichiarata. Nessun segreto o chiave privilegiata `VITE_*`.
- Nessun claim generale di Tinkercad/Miro/GoodNotes parity. Solo matrici e
  certificazioni delimitate per scenario/revisione.
- Nessun deploy production, merge, rotazione o revoca esterna senza Andrea.

## Limiti reali di questa lane

- massimo 10 ore wall time, 12 iterazioni operative, 2 repair cycle per slice;
- massimo 4 agenti contemporanei incluso il captain (limite runtime Codex);
- massimo 2 writer subordinati, ognuno in worktree isolato;
- un owner per file, massimo 5 file per ciclo;
- massimo 3 commit non integrati e 3 slice coerenti per PR;
- Integration Iteration dopo massimo 3 slice locali;
- niente push a `main`, auto-merge, force push, reset/clean distruttivo,
  `git add -A`, `--no-verify`, nuove dipendenze non approvate o gate indeboliti.

## Stato persistente minimo

Leggere e aggiornare soltanto i file pertinenti:

- `V1-LOOP-STATE.md`: stato operativo e prima frontiera rotta;
- `V1-CLAIM-REGISTER.md`: claim e prove;
- `V1-FAILURE-LEDGER.md`: fallimenti riproducibili (crearlo nella prima slice
  che produce un failure operativo oltre la baseline);
- `V1-SECURITY-MATRIX.md`: sicurezza e remediation;
- `V1-INTEGRATION-MAP.md`: confini del percorso verticale (crearlo nella slice
  P33, non come documento vuoto);
- `V1-NEXT.md`: una sola slice successiva (crearlo dopo il primo regate).

Creare altre matrici solo quando la relativa area entra nella frontiera; non
precompilare documenti vuoti.

## Forma di un'iterazione

### 1. Observe

Regate branch/SHA/status, ownership, processi, canon e test. Riprodurre il
problema e salvare il primo confine rotto.

### 2. Select

Confrontare al massimo tre slice con:

`(valore utente × unblock × verificabilità × leva integrazione) /
(rischio regressione × dipendenze × merge risk × scope)`

Se esiste `SECURITY_RED`, una feature non può vincere.

### 3. Spec/TDD

Definire criterio binario, invarianti, test/checklist falsificabile, rollback,
file ownership e comandi prima di modificare il codice. Mostrare RED quando è
riproducibile.

### 4. Implement

Una sola slice, modifica minima e completa; nessun refactor opportunistico,
fallback silenzioso, error swallowing o seconda fonte di verità.

### 5. Verify

Focused test → typecheck/lint → build → suite → integration → e2e/pointer →
repeat-each → persistence/reopen → a11y/performance → secret/dependency scan →
deploy smoke pertinente. Registrare exit code reali e limiti ambientali.

### 6. Adversarial review

Un agente diverso verifica significato del test, bypass, race, fisica, book
fidelity, Principio Zero, touch, deploy-SHA, segreti e overclaim. Massimo due
repair cycle.

### 7. Integrate/stop

Solo `GREEN_SLICE`: gate integrato, commit atomico, push branch, CI e PR; mai
merge automatico. Altrimenti persistere `HONEST_RED`, `SECURITY_RED`,
`ARCHITECTURE_RED`, `ENVIRONMENT_RED`, `BLOCKED_EXTERNAL` o `STOP` motivato.
`PILOT_READY` richiede il percorso completo ma attende validazione esterna;
`V1_GREEN` richiede anche la prova Andrea prevista dalla Definition of Done.

## Baseline da cui ripartire

- Canonical structure candidate: `AndreaMarro/ardesia`.
- Source of Truth comportamentale non risolta: il canon del 23 giugno indica
  repo esterni `lessonos`/`maestro-studio`, mentre `origin/main` del 9 luglio
  integra lavoro più recente. Stato `ARCHITECTURE_RED` fino a una repository
  truth verificata; nessuna feature va implementata sul subtree per assunzione.
- Baseline code: `origin/main@204ffefc` (2026-07-09).
- Anchor P32: `p30/free-manipulation-trace-v0-20260709-185100@f6321975`.
- PR #150: open draft; core CI verde sul suo SHA, titolo e caveat dichiarano
  e2e blocker. Non è prova di V1.
- Worktree storico `VOLUME 3/ardesia`: dirty; non usarlo come write lane.
- Worktree di questa baseline: `ardesia-wt-v1-baseline`, branch
  `codex/v1-baseline-20260710`.
- Stato terminale corrente: `SECURITY_RED` + `ARCHITECTURE_RED` finché le
  esposizioni client-side, le credenziali hardcoded e la Source of Truth
  comportamentale non sono validate/remediate; le rotazioni esterne richiedono
  Andrea.
- Primo confine P33 riprodotto: il simulatore applica patch tramite callback
  host dirette, non tramite ToolHost reale con grant/capability/RPC/audit.

## Prima macrofase

1. chiudere baseline repository/PR/worktree e mappare le violazioni correnti
   del Principio Zero;
2. validare e delimitare il `SECURITY_RED` senza mostrare segreti;
3. audit ToolHost, P33 spine, backend/RLS/deploy e book fidelity;
4. compilare claim/security e registrare qui la prima frontiera; creare
   l'integration map soltanto nella slice P33;
5. scegliere una sola remediation o il primo confine P33;
6. review indipendente della riscrittura e delle prove;
7. fermarsi se serve rotazione, deploy, merge o decisione esterna.

## Definition of Done

`V1_GREEN` richiede almeno: repository/PR governati; product shell; infinite
canvas e notebook; penna/touch/Pencil; Knowledge Card create/move/transform;
import PDF/immagine/audio; Principio Zero; scenario libro certificato con
mounted/steps equivalenti; pointer/touch; connect/disconnect/retarget/delete e
undo/redo; ToolHost e plugin composition; solver/diagnostica; save/reopen
inclusa reidratazione LessonOS; backend staging e RLS tenant-negative;
graph/memory/tutor grounded con citazioni; appunti/esercizi/quiz; export
PDF/Markdown/JSON-Lesson-Package; UI/accessibilità/performance iPad+LIM;
Playwright CI; preview legata allo SHA; rollback/backup; prova reale di Andrea
con durata, errori, esitazioni, recovery e GO/NO-GO; limiti documentati. Prima
di allora sono consentiti solo claim delimitati.
