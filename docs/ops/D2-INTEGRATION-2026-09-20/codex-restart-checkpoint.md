# Checkpoint ripartenza — 21 settembre 2026

STATO: unità locale verificata e pronta per review indipendente; nessuna integrazione autorizzata.

## Esito e identità

Una sola unità implementata: R-01, identità e ciclo di vita del digest di studio.
L'anteprima e l'HTML scaricato contengono i fatti della lezione selezionata,
anche con tempi sovrapposti o senza avvio esplicito. Dati non attribuiti non
vengono assegnati per supposizione. Cambi lezione e letture fallite non riusano
il digest precedente; le letture obsolete sono ignorate, la connessione viene
chiusa anche quando la lettura fallisce.

Remote `AndreaMarro/ardesia`; workspace isolato
`/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`, branch
`codex/restart-review-postlesson-20260921`. Modello: Codex, famiglia GPT-6;
modello/effort esatti `inherited/unknown`, nessuna selezione Astra inventata.
Base `b124eee04acc8062c27284f23c5d9108e3767c27`; candidate prodotto revisionata
`b7f75e9d40ab063d0851f1cc6882e68e993edf47`; head/evidence revisionato
`705284acc4322db4d241032de071437ab0473cc1`. Nuovo SHA patch: `d8e360389addb8a4339290a38763cd6dea58358b`.
L'HEAD successivo di questo documento aggiunge soltanto evidenza, non codice.
I test/build sono stati eseguiti prima del commit sui byte poi committati; il build
locale non è un artefatto distribuito né una nuova esecuzione CI sullo SHA patch.

La [review congelata](codex-restart-review-frozen.md) approva soltanto D2
`.lesson → Engine → materiale ispezionabile → PDF`, non il workflow completo.
Hash immutato: `baf2e41dedcf42238b89f1a4e194631b50190d37438ffd1a9bc4da532e2e41df`.
`PATCH_INDEPENDENT_REVIEW=PENDING`: questa sessione non approva la propria patch.
CI precedente: run `35549971310`, checkout merge sintetico
`29c3067e59c2f96338e427a8f9a7bde9c54e623d`; non è CI del nuovo SHA.
Produzione osservata resta `b124eee04acc8062c27284f23c5d9108e3767c27`.

File prodotto: `apps/studio/src/RecapView.tsx`, `apps/studio/src/lessonos/studyDigest.ts`.
Test: `apps/studio/src/__tests__/PostLessonDigest.test.tsx` (6 casi), `apps/studio/src/__tests__/studyDigest.test.ts`.
Si riusano query canonica, projector e materializer; rimossa la derivazione
temporale. Nessuna dipendenza, formato, gate o configurazione modificata.

## Prove e limiti

| Verifica | Comando essenziale | Esito |
|---|---|---|
| RED unità | Vitest `apps/studio/src/__tests__/PostLessonDigest.test.tsx` prima della patch | exit 1; 6 fallimenti semantici |
| GREEN mirato | Vitest `PostLessonDigest`, `studyDigest`, `RecapView` | exit 0; 25 pass |
| Mutazione query globale | Vitest `PostLessonDigest` | exit 1; 5 fail/1 pass, poi ripristino byte-identico |
| Typecheck | `npm run typecheck` | exit 0 |
| Suite Studio profilo CI Node 22 | comando sotto | exit 0; 2165 pass/5 skip/0 fail |
| Gate congelato, ambiente ordinario Node 26 | `bash eval/gate.sh` | exit 1; 2142 pass/23 fail |
| Controllo causale Node 26 | `NODE_OPTIONS=--no-experimental-webstorage npx vitest run` sui 5 file coinvolti | exit 0; 113 pass |
| Gate congelato con ambiente esplicito | `NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh` | exit 0; 2166 pass (2165 Vitest + replay), 0 fail |
| Build | `npm run build` | exit 0; soli warning dimensione chunk |
| Golden path browser | `ARDESIA_STUDIO_E2E_BASE_URL=http://127.0.0.1:5291 npx playwright test e2e/golden-path.spec.ts` | exit 0; 1 pass |
| Engine, candidate invariato | `uv run --locked pytest -q -rs` | exit 0; 2219 pass/7 skip |
| D2 producer/consumer | comando completo nel receipt congelato | exit 0; export reale sintetico → PDF sandboxed di 1 pagina |
| Hygiene locale | NUL, secrets/test, boundary, workflow/test, doc claims/test, state self-test/test/verify | 11 comandi, tutti exit 0 |

Profilo CI completo (Node 22.14.0):
`node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000 --reporter=json`.

Il gate congelato antepone `/opt/homebrew/bin` e seleziona Node **26.5.1**.
Il confronto è stato eseguito su main pulito `b124eee0` in un secondo worktree
proprio (`ardesia-codex-main-runtime-20260921`), stessi lockfile e stesso comando
Vitest del gate: 2127 pass/22 fail/5 skip. I 22 nomi e messaggi di errore coincidono;
il ventitreesimo sul candidate è il nuovo caso F-01 di `SavedLessonsView`, assente
su main, e fallisce anch'esso nel `beforeEach` su `localStorage.clear`, non nel
prodotto. Nessun test R-01 fallisce. Il controllo negativo sui cinque file mostra
che disattivare il Web Storage sperimentale del processo Node lascia a jsdom la
sua implementazione e risolve 113/113 test. Nessun test, skip, timeout, soglia o
file gate cambiato; opzione solo nel processo, nessuna configurazione globale.
L'esito rosso del gate nell'ambiente ordinario resta registrato, non ribattezzato
verde. Il profilo CI Node 22 è verificato separatamente. La dichiarazione della
review congelata “no historical localStorage reds” era limitata al suo run Node 22;
non descrive il successivo run Node 26.

Comandi, exit code e durate integrali: `artifacts/restart/commands.jsonl` locale.
RED della review e istruzioni per riprodurlo: `codex-restart-review-probe.tsx.txt`.
La nuova prova a browser è conservata in `codex-restart-browser-probe.mjs.txt`:
copiarla nel percorso indicato, usare un server isolato su 5291 e una directory
esterna per screenshot. Non avviare un server sopra quello di un'altra sessione.

Correzione esplicita all'evidenza browser della review congelata: il primo script
non forzava un nuovo documento quando cambiava soltanto l'hash; poteva quindi
attribuire entrambi i concetti alla prima lezione. Quel primo RED browser e il
primo tentativo GREEN sono esclusi dalle prove di isolamento. Il nuovo harness
verifica `journal.identity.lessonId` per A e B prima di scrivere, e riproduce
RED sui due file prodotto originali del candidate e GREEN sulla patch ripristinata
byte per byte. I RED Vitest precedenti usavano già identità distinte e restano validi.
Un salvataggio iniziale del download aveva codificato lo spazio nel path; i soli
artifact del probe sono stati trasferiti nel percorso corretto, le directory
vuote create dal probe rimosse, e l'HTML del nuovo download verificato.

Browser: Chromium 148.0.7778.96, desktop 1280×900, pagina non vuota, nessun overlay
Vite e nessun errore di pagina. Anteprima e file scaricato: RED A+B, GREEN solo A.
Screenshot ispezionati in directory Codex visualizzazioni, fuori repository.
Resta il messaggio console preesistente sullo script di stampa bloccato nel frame
sandboxed; l'HTML scaricato è distinto. Nessuna modifica visuale o prova mobile.
Il journal legacy sintetico serve esclusivamente a rendere osservabile il digest:
il percorso recorder→recap resta vuoto per R-02. Non è prova dell'intero workflow.

Ambiente iniziale: Node 22.14.0, npm 10.9.2, Vitest 4.1.8, Vite 8.0.16;
Engine Python 3.13.14/uv 0.11.8, Pandoc 3.9.0.2. Dipendenze dai lockfile,
nessun lock modificato. Le credenziali dei provider sono rimosse dai processi
di test. Engine: 7 skip (4 live non autorizzati, 2 repository canonico esterno
assente, 1 corpus privato assente); Studio: 5 skip preesistenti, non aumentati.
Il gate Engine storico usa un checkout esterno hardcoded e non viene eseguito;
la suite completa locale è stata eseguita sul candidate, Engine poi immutato.

## Debiti, pilot e prossimo incarico

R-01 chiuso dalla patch, in attesa di review indipendente. R-02 (journal per-room
e parser v2), R-03 (log live omesso dall'export RecapView), R-04 (claim documentali
e protezione branch) restano aperti nelle destinazioni della review congelata.
Non sono stati nascosti o ampliati dentro questa unità. Il [pilot preparato](codex-restart-pilot.md)
contiene 3 casi più 2 opzionali e misure vuote, senza risultati inventati.
La configurazione Kimi osservata resta incompatibile col percorso richiesto
dall'adapter; nessuna chiamata live, cambio endpoint, fallback o spesa autorizzati.

Kirchhoff: nessun checkout locale autorizzato trovato nell'inventario disponibile;
letture mirate GitHub, nessun holdout letto. PR #15 OPEN/DRAFT, base/main
`42861a7d5e25f9151e1c7193345635c3b4922441`, RC
`a98d37a6ef33a1bbb1f2b9bd1d01d0b78b171889`; CI test `34230347489` e web
`34230347624` success, zero review sottomesse/thread. Non è una review RC eseguita.
PR #16 OPEN/DRAFT: `0adc22503e235e55e7323d00c51e3acd62614485`, base post-RC
`bfa5e25c387ca8c36cebf0a64c4f708e3cbdfa6c`, non main.

Letti costituzione, governance review, stato, radice `proof_run`, `presentation`,
sessione/truthfulness, generatore workbench, guardie/stato frontend e test correlati.
La radice condivisa orchestra una volta; `StudentSessionView` proietta; la
certificazione confronta valori esatti nel dominio. Preservare `Refusal != Failure`
e `Claim VERIFIED != Session CLOSED != Product Verified`; metadati di provenance
non dimostrano autenticità persistita. Il playbook su post-RC è stato letto,
non eseguito: contiene merge, deploy, cancellazione branch e un push diretto main
nel rollback, quest'ultimo incompatibile con i guardrail globali senza decisione
esplicita. La futura review dedicata richiede due reviewer di famiglie/tool diversi,
almeno un Codex e un non Codex, stessa candidate, una falsificazione concreta,
zero P0/P1 aperti e receipt completi. Sequenza successiva, solo se autorizzata:
RC → verifica main/deploy → riallineamento productization → catalogo. PR #7 separata.

**Unica prossima azione:** review indipendente della patch R-01 al nuovo SHA,
con il candidate D2 come base e le controprove qui conservate. Prerequisito:
reviewer distinto dal builder, accesso al branch locale o trasferimento autorizzato;
nessuna approvazione o pubblicazione implicita. Le dipendenze del pilot restano
elencate nella scheda, non richieste come azioni parallele.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `restart-review-postlesson-20260921`; preregistrazione e oracoli conservati.
Usati `persistent-capability-evolution` e `build-web-apps:frontend-testing-debugging`
(plugin 0.1.2), runner e browser già disponibili; nessun agente aggiunto, installazione
globale, nuovo plugin, canary o auto-promozione. Ruolo osservato: reviewer del
candidate, poi builder della singola patch; modello `inherited/unknown`, quote
50/30/20 non dichiarate raggiunte. Correttezza prima di efficienza: i tentativi
di setup falliti e il confronto ambientale sono registrati, non conteggiati come
prove positive. Registro/canon esterno non toccato per il mandato senza vault;
questo append locale conserva last-use e next-gate. `INDEX_SYNC_DEFERRED`.
AgentMemory `RETIRED_NO_READ_NO_WRITE`, nessun probe. Nessun gate riscritto.
