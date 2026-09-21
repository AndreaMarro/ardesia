# R-03 — checkpoint locale, 21 settembre 2026

Il pulsante di export del riepilogo acquisisce il log canonico corrente e lo
passa all'exporter già usato da Materiali. Il file .lesson include anche un fatto
aggiunto dopo l'apertura dell'anteprima, mantenendo separata la lezione selezionata.
Non usa il digest dell'anteprima né uno snapshot archiviato ormai obsoleto.

## Identità e modifica

- Workspace: `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`;
  remote `AndreaMarro/ardesia`; branch `codex/restart-review-postlesson-20260921`.
- Base locale pulita: `c54fa42c1bb34ac37374a5bb228d838b2b4409ec`.
  Patch prodotto: `ba9c3bdfe1b3218273dcf286e3c56723d204b707`.
  Le verifiche sono sui byte poi committati;
  il successivo commit documentale non cambia il prodotto. Nessuna nuova CI
  o build distribuita sul nuovo SHA.
- GitHub riletto all'inizio dell'unità: PR #256 OPEN/DRAFT, head
  `705284acc4322db4d241032de071437ab0473cc1`, base e main remoto
  `b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse.
  Il branch locale partiva 46 commit avanti a quel main, zero indietro.
- Modello: Codex, famiglia GPT-6; modello/effort esatti `inherited/unknown`.
- Un solo file prodotto: `apps/studio/src/RecapView.tsx`.
  Cinque nuove prove in `apps/studio/src/__tests__/RecapLiveExport.test.tsx`.
  Completano l'unità la [scheda preregistrata](codex-r03-unit.md), questo
  checkpoint e il [probe browser](codex-r03-browser-probe.mjs.txt).

Ogni click acquisisce una nuova handle del log, distinta da quella già chiusa
dall'anteprima, e la chiude anche se l'export fallisce. Il download parte soltanto
dopo il completamento. Un errore effettivamente rifiutato dall'acquisizione,
dalla lettura o dall'export rimane visibile nella vista; si può riprovare.
Con un log corrente vuoto l'exporter omette la vecchia memoria e lo dichiara nel
manifest. Nessuna modifica a exporter, factory, schema, dipendenze, testi UI o gate.

**Limite ereditato:** createEventLogStore restituisce un log in-memory se IndexedDB
non è disponibile o se l'apertura fallisce. È lo stesso comportamento già usato
da Materiali. R-03 non distingue questo fallback da un vero log persistente vuoto:
le prove sui rifiuti non dimostrano che ogni indisponibilità del database produca
un errore visibile. Il limite resta destinato a un'eventuale unità separata sulla
persistenza, senza estendere qui il requisito. Non viene garantito il flush
globale di operazioni pendenti. La compatibilità dell'export storico richiesto
esplicitamente senza log rimane invariata.

## Verifiche

Comandi effettivi, exit code, durate e log locali: `artifacts/restart/commands.jsonl`,
prefisso `r03-`. Runtime: Node 22.14.0, npm 10.9.2, Vitest 4.1.8, Vite 8.0.16;
Chromium 148.0.7778.96. I processi di prova rimuovono dall'ambiente le chiavi
dei provider; nessuna chiamata LLM e nessuna installazione in questa unità.

| Prova | Esito |
|---|---|
| RED prima della patch, cinque casi del nuovo test | exit 1; 5 fail semantici |
| GREEN mirato, 7 suite export/digest/view/bundle | exit 0; 92 pass |
| Mutazione: omesso solo l'argomento live nell'export | exit 1; 3 fail, 2 pass |
| Suite Studio completa, profilo deterministico Node 22 | exit 0; 2178 pass, 5 skip, 0 fail |
| Typecheck: `npm run typecheck` | exit 0 |
| Build: `npm run build` | exit 0; warning preesistente sulla dimensione dei chunk |
| Gate Studio congelato, opzione ambientale esplicita | exit 0; 2179 pass (2178 Vitest + replay), 0 fail |
| Browser: due lezioni, entrambi gli export e fatto successivo all'anteprima | exit 0 |
| Golden path salvataggio/export/import/riapertura | exit 0; 1 pass |
| Hygiene: NUL, secrets, boundary, workflow, claim scheda, verifica stato | 6 comandi, exit 0 |

Profilo Vitest, dalla cartella Studio:

```sh
node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Per RED e mutazione selezionare il solo nuovo test, con percorso relativo a Studio.
Il test usa JournalRecorder, WorkspaceStore, IndexedDbEventLog su backend
fake-indexeddb già installato e ZIP effettivi. La chiamata di export positiva
non è sostituita con un mock. Copre A/B con timestamp sovrapposti, snapshot
obsoleto, fatto successivo all'anteprima, log vuoto, tre rifiuti, chiusura delle
handle e retry. Confronta i byte della memoria prodotta dai due pulsanti reali.
Il primo tentativo RED accedeva a una handle assente prima di verificarne il
numero: corretto il test, il RED finale fallisce su asserzioni semantiche.
La mutazione mantiene acquisizione e chiusura, rimuovendo soltanto il passaggio
del log. Ripristino byte-identico verificato prima della suite completa:
SHA-256 finale di RecapView
`adc186e382f7e2ebf2650c07524c3695a484589870d9e63536446a3b8084a194`.

Il gate immutato antepone Node 26.5.1. Comando usato dalla cartella Studio:
`NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh`.
È il controllo ambientale già documentato in R-01/R-02, senza configurazione
globale, esclusioni aggiuntive o modifica al gate. Il precedente rosso ordinario
Node 26 e il confronto su main restano conservati: quell'ambiente non è dichiarato
verde. I cinque skip preesistenti richiedono screenshot di un run locale esterno
non disponibile; gli screenshot R-03 non li sostituiscono. Engine è immutato:
le precedenti prove Engine/PDF restano storiche, non nuove esecuzioni R-03.

Il probe browser usa IndexedDB reale nel contesto isolato di Chromium. Registra
formule e fatti dal recorder/runtime della lavagna, prepara una scena minima
sintetica e uno snapshot vecchio. Dopo aver aperto il riepilogo, aggiunge un fatto
da una seconda lavagna e tiene aperte le viste durante entrambi gli export:
la navigazione potrebbe a sua volta registrare la fine della sessione.
Risultato per ciascuna identità: 4 eventi, memoria identica byte per byte nei
due ZIP, fatto nuovo presente, nessun evento dell'altra lezione, manifest corretto.
JSON, quattro archivi .lesson e log restano in artifacts/restart; il probe è
versionato e coincide con la copia eseguita. Il primo tentativo browser assumeva
erroneamente un runtime di registrazione nel riepilogo, che è read-only: fallimento
di preparazione conservato, non conteggiato come difetto del prodotto.
Nessun errore di pagina o overlay; tre messaggi console ereditati sullo script
di stampa bloccato nel frame sandboxed. Screenshot 1280×900 fuori repository;
ispezionati riepilogo e Materiali della lezione A. Nessuna modifica visuale,
prova mobile, audio, riconoscimento della scrittura o uso di dati studenti.

## Disposizione e prossimo passo

R-03 è corretto e verificato localmente: `PATCH_INDEPENDENT_REVIEW=PENDING`.
Le approvazioni R-01/R-02 restano limitate alle rispettive patch. La review D2
congelata è invariata, SHA-256
`baf2e41dedcf42238b89f1a4e194631b50190d37438ffd1a9bc4da532e2e41df`.
R-04, claim e protezioni del rilascio, resta separato nella destinazione originaria.
Il [pilot preparato](codex-restart-pilot.md) non è eseguito: mancano input reali
autorizzati e un provider live verificato. Kirchhoff non è modificato.

**Unica prossima azione:** review indipendente di R-03 sul commit prodotto
indicato, con una controprova nuova sul ciclo di export e il rilascio della handle.
Prerequisiti: reviewer distinto dal builder, stesso SHA, isolamento locale,
nessun accesso a vault, provider pagati o scrittura remota. Il verdict non
autorizza integrazione o pubblicazione.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r03-recap-live-export-20260921`, builder `inherited/unknown`. Riusate
persistent-capability-evolution e build-web-apps:frontend-testing-debugging
(plugin 0.1.2), adapter ed exporter canonici e browser installato. Nessun agente,
installazione, nuova dipendenza, promozione o riscrittura dei gate. Oracolo nella
scheda precedente alla patch; RED e mutazione conservati nei log, rollback
verificato. Quote dei modelli non dichiarate raggiunte; unità non ancora accettata
da review indipendente. Questo receipt aggiunge il risultato al registro locale,
senza riscrivere receipt precedenti. Vault esterno escluso dal mandato,
`INDEX_SYNC_DEFERRED`; Basic Memory non usata, AgentMemory
`RETIRED_NO_READ_NO_WRITE`. Nessun accesso a vault o AgentMemory in R-03.
