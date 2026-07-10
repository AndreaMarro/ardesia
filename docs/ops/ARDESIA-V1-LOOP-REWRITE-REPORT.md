# ARDESIA V1 — rapporto di riscrittura del loop

Data: 2026-07-10 · baseline SHA: `204ffefc7f375ecd717fcbf4ba3aaa35a6e5c2fa`.

## Verdetto

Il testo sorgente (6.938 righe) non è direttamente eseguibile: contiene almeno
tre versioni quasi complete del mandato, duplicazioni, limiti discordanti e
assunzioni già superate. La riscrittura conserva i requisiti di prodotto ma
sposta dettagli e stato in artefatti falsificabili. **Verdetto review 1:
RESPINTA** finché una slice harness non rende reali almeno skill, agent e hook
e una seconda review non chiude i rilievi.

## Diff concettuale

| Prima | Dopo | Rischio ridotto |
|---|---|---|
| 10–12 ore, 12 o 14 iterazioni | massimo 10 ore e 12 iterazioni; stop su evidenza | loop infinito/ambiguità |
| fino a 8 agenti | 4 slot reali incluso captain | piano non applicabile |
| oltre venti documenti creati subito | cinque artefatti baseline, altri on-demand | documentazione senza segnale |
| tutte le aree come backlog simultaneo | una frontiera verticale alla volta | ottimizzazione locale e dispersione |
| P33 candidata a priori | security precedence + scoring | feature sopra blocker |
| claim storici mescolati a fatti | registro con SHA/data/stato/confidenza | `REPORTED` trasformato in `VERIFIED` |
| Claude-specific e Codex-specific mescolati | capability separate e dichiarate | automazione immaginaria |
| Principio Zero parafrasato nel prompt | formula autentica recuperata e runtime divergente marcato RED | invenzione pedagogica |

## Capability verificate

| Capability | Evidenza | Stato/applicazione |
|---|---|---|
| Claude Code | binario embedded `2.1.205`; `--help` | agenti, background, worktree, tool allow/deny, permission mode supportati |
| `/loop` | plugin `ralph-loop@claude-plugins-official` elencato | disponibile in Claude, non è un comando shell Codex |
| agent teams | plugin installato | disponibile in Claude; non assunto come runtime di questa sessione |
| Codex subagents | tre worker avviati; limite thread = 4 incluso root | massimo operativo qui = 4 |
| isolamento | `git worktree add` riuscito | manuale e verificabile |
| skill/plugin/MCP | cataloghi disponibili | usare solo skill lette/auditate e necessarie |
| Codex CLI npm | `codex --version` fallisce `ENOENT` | `ENVIRONMENT_RED` per CLI; Desktop Codex resta operativo |
| Claude CLI su PATH | assente; binario embedded funziona | non usare `claude` non qualificato negli script |
| maxTurns/model/tool policy per worker Codex | non esposto da `spawn_agent` | non dichiarare enforcement inesistente |
| hook Git locali | nessun hook non-sample nella gitdir osservata | regole solo documentali finché installate/CI-gated |

## Ordini legacy in conflitto

`plugins/elab-tutor/automa/ORDERS/` contiene ordini del 7 aprile 2026 che si
dichiarano a vicenda prioritari/sostitutivi. Alcuni richiedono push diretto su
`main`, `git add -A`, merge massivi o task schedulati contro un repository
standalone precedente. Queste istruzioni confliggono con i guardrail macchina,
con il monorepo corrente e con la policy no-auto-merge. Sono quindi
`REPORTED/STALE`, non eseguibili finché Andrea non li ritira o riconcilia in un
unico ordine corrente.

## Destinazione delle regole

- `AGENTS.md`: guardrail stabili già presenti (GDPR, ZERO-LLM, no auto-merge,
  gate non indebolibili). Non duplicati in un nuovo `CLAUDE.md` in questa slice.
- Prompt operativo: missione, invarianti, limiti, algoritmo di iterazione,
  terminal state e baseline.
- Claim/security/state: fatti volatili legati a SHA e data.
- Skill da creare dopo la baseline: `ardesia-regate`,
  `ardesia-security-audit`, `ardesia-book-fidelity`, `ardesia-lesson-e2e`.
  Non si creano quattordici skill non ancora esercitate.
- Agenti: ruoli A1/A4/A5/A7 usati come ownership nei dispatch; file
  `.claude/agents` verranno creati solo dopo verifica forward della procedura.
- Hook/CI prioritari: blocco `.env`, credenziali/segreti client-side, push a
  main/force push, `git add -A`, chiavi private. Il repository attuale non ne
  dimostra l'installazione locale.
- Test: book fidelity, ToolHost, LessonOS e deploy restano acceptance test
  specifici della slice, non prose nel prompt.

## Requisiti fondamentali e enforcement

| Requisito | Presente | Enforcement attuale | Evidenza | Rischio residuo |
|---|---:|---|---|---|
| Principio Zero autentico | sì | canon + claim | `plugins/elab-tutor/CLAUDE.md:5-16` | runtime in conflitto |
| volume→target→mounted→steps | sì | prompt; test futuro | `simulation-plugin-v2.md:169-183` | step sintetico fake-green |
| fori/orientamenti/fili/curve/colori/polarità | sì | prompt; matrice futura | loop operativo §Invarianti | non certificato |
| correttezza elettrica e didattica | sì | solver/test + human review richiesti | DoD operativo | percorso non eseguito |
| SimulationScene unica | sì | canon + test richiesto | loop operativo §Invarianti | adapter bypass |
| AI typed commands | sì | schema/test futuro | loop operativo §Invarianti | integrazione non provata |
| docente centrale/kit fisico | sì | canon + tutor rubric | `CLAUDE.md:7-15` | prompt runtime RED |
| plugin composition/ToolHost | sì | release gate | primo confine P33 | bypass diretto RED |
| LessonOS | sì | integration gate | loop operativo §Invarianti | backend/reopen assenti |
| graph/memory/citazioni | sì | integration gate | DoD operativo | solo ramo locale provato |
| Content Factory/export | sì | artifact gate | DoD operativo | end-to-end UNKNOWN |
| Knowledge Card/whiteboard/notebook | sì | UX matrix futura | obiettivi conservati | audit non chiuso |
| UI originale/accessibile | sì | UX/a11y test futuro | obiettivi conservati | iPad/LIM non provati |
| backend/RLS | sì | tenant-negative staging gate | DoD operativo | UNKNOWN/RED di evidenza |
| deploy legato a SHA | sì | deploy proof gate | DoD operativo | nessun deploy 204ffefc |
| security/GDPR/minori | sì | security matrix + CI | `V1-SECURITY-MATRIX.md` | SECURITY_RED |
| honest RED/stop | sì | claim/state/terminali | loop operativo §Iterazione | skill/hook ancora mancanti |
| validazione Andrea | sì | human release gate | DoD operativo | non eseguita |

La tabella prova la presenza, non l'implementazione. Dove l'enforcement è
“futuro” la riscrittura resta respinta.

## Obiettivi conservati integralmente

Integrazione reale; simulatore strutturato; book fidelity multilivello;
passo-passo/già-montato; Principio Zero; docente centrale; AI tipata; plugin
componibili/ToolHost; LessonOS; graph/memory; content factory; Knowledge Card;
whiteboard/notebook; UI originale e gioiosa; touch/iPad/LIM; backend/deploy;
security/GDPR; e2e; validazione docente; honest RED e stop autentico. La
presenza è verificata nella tabella sopra; non è un claim di completamento.

## Cose intenzionalmente non eseguite

- Nessun merge, auto-merge, deploy, rotazione/revoca o modifica a production.
- Nessun test full installando dipendenze in questa fase docs-only.
- Nessun claim di copertura security esaustiva: il primo pass è mirato e
  indipendente, non una scansione completa di tutti i 7.000+ file.
- Nessun nuovo package o dipendenza.
- Nessuna esecuzione degli ordini legacy incompatibili sopra descritti.

## Criterio per approvare la riscrittura

La review deve confermare che nessun requisito fondamentale è scomparso, che
i limiti corrispondono al runtime e che il primo passo può terminare con un
verdetto falsificabile. Ogni rilievo materiale aggiorna prima questi documenti;
il loop implementativo non parte su una riscrittura respinta.
