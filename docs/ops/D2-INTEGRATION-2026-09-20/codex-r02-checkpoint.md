# R-02 — checkpoint locale, 21 settembre 2026

Il riepilogo legge gli eventi prodotti dal recorder della lezione selezionata:
formule, elementi aggiunti, pagine PDF osservate e durata raggiungono l'anteprima
e lo stesso HTML scaricato. Non serve più il journal globale legacy usato come
supporto nei precedenti probe del digest. Due lezioni con tempi sovrapposti
rimangono separate. Un journal v2 corrotto o attribuito a un'altra lezione produce
un errore visibile, senza offrire un download parziale.

## Identità e perimetro

- Workspace: `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`;
  remote `AndreaMarro/ardesia`; branch `codex/restart-review-postlesson-20260921`.
- Base locale: `92a3bf6e5d8f2831a7e7b8d6a70df8f168682cf7`, albero iniziale pulito;
  patch prodotto: `866ee396e0554b9b7d77b3337461b7c25edd225f`. Il successivo commit documentale non
  modifica il prodotto. Test eseguiti sui byte poi committati, prima del commit;
  nessuna nuova CI o build distribuita sul nuovo SHA.
- GitHub riletto durante questa unità: PR #256 OPEN/DRAFT, head
  `705284acc4322db4d241032de071437ab0473cc1`, base e main remoto
  `b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse. Il branch
  locale parteva 43 commit avanti a quel main, zero indietro. Lo stato generato
  in modalità offline non pretende di misurare la produzione corrente.
- Modello: Codex, famiglia GPT-6; modello/effort esatti `inherited/unknown`.
  Nessuna selezione Astra o quorum di reviewer inventati.
- Un solo file prodotto: `apps/studio/src/store/lessonRecap.ts`.
  Test: `apps/studio/src/__tests__/lessonRecapRecorder.test.ts`,
  `apps/studio/src/__tests__/lessonRecap.test.ts`,
  `apps/studio/src/__tests__/PostLessonDigest.test.tsx`.

Il reader usa il percorso per-room e il decoder/proiettore canonico esistente
per i record fisici v2: identità, payload, duplicati e JSON v2 troncato sono
validati. Le righe legacy della cartella della lezione mantengono le aggregazioni
tolleranti preesistenti, anche senza timestamp; un tempo invalido non entra
nella durata. Le righe con indizi v2 non possono essere recuperate come legacy.
Le righe vuote mantengono i numeri fisici di riga negli errori del decoder.
L'ordine delle righe non influenza min/max, insiemi e conteggi del recap.
Le pagine soltanto importate non sono trasformate in pagine osservate: vale
la proiezione già adottata dal replay. Nessun decoder, recorder, schema,
dipendenza, gate, store o modello documentale nuovo o modificato.

Le 12 fixture legacy sono spostate sul percorso della stanza senza cambiare
alcuna asserzione. Nei test R-01 viene eliminato il supporto globale e viene
preparato esplicitamente anche il journal B nel caso di navigazione ritardata.

## Prove eseguite

Comandi, exit code, durate e log locali: `artifacts/restart/commands.jsonl`,
nomi con prefisso `r02-`. Ambiente: Node 22.14.0, npm 10.9.2, Vitest 4.1.8,
Vite 8.0.16; browser Chromium 148.0.7778.96. Processi di verifica senza chiavi
dei provider; nessuna chiamata LLM.

| Prova | Esito |
|---|---|
| RED prima della modifica, recorder reale → recap | exit 1; 8 fallimenti semantici |
| GREEN mirato, 7 suite reader/recorder/replay/digest/view/HTML | exit 0; 131 pass |
| Mutazione: lettura ripristinata sul journal globale | exit 1; 8 fail |
| Mutazione: chiamata al decoder v2 rimossa | exit 1; 7 fail, 1 pass |
| Suite Studio completa, profilo deterministico Node 22 | exit 0; 2173 pass, 5 skip, 0 fail |
| Typecheck: `npm run typecheck` | exit 0 |
| Build: `npm run build` | exit 0; soli warning dimensione chunk |
| Gate Studio congelato, ambiente esplicito | exit 0; 2174 pass (2173 Vitest + replay), 0 fail |
| Browser recorder A/B → recap → download, più identità errata | exit 0 |
| Golden path salvataggio/export/import/riapertura | exit 0; 1 pass |
| Hygiene: NUL, secrets, boundary, workflow, claim scheda, verifica stato | 6 comandi, exit 0 |

Profilo Vitest, dalla cartella Studio:

```sh
node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Per il RED e i due controlli negativi selezionare il solo test
`apps/studio/src/__tests__/lessonRecapRecorder.test.ts` (usando nel comando il
percorso relativo a Studio). Le mutazioni cambiano
rispettivamente il percorso in stringa globale e sostituiscono lo spread del
decoder con un array vuoto. Ripristino byte-identico verificato prima della
suite completa: SHA-256 del reader finale
`1ca2bd32c776a47b775e7c99565328646fa73cfe9e42cd5221df43cbf7ea53d1`.

Il primo tentativo di GREEN aveva 11 fallimenti: la preparazione delle fixture
si era fermata su un conteggio errato e un caso R-01 non preparava il journal B.
Non è contato come prova positiva; dopo le sole correzioni delle fixture sono
passati tutti i 131 casi, senza rimuovere o indebolire asserzioni.

Il gate immutato antepone Node 26.5.1. Comando di questa unità:
`NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh` dalla cartella Studio.
È lo stesso controllo ambientale documentato nel checkpoint R-01: nessuna
configurazione globale, esclusione di test o modifica al gate. Il precedente
rosso nell'ambiente Node 26 ordinario e il confronto con main restano conservati;
non si dichiara verde quell'ambiente e non se ne ripete qui la diagnosi.
I cinque skip Studio preesistenti sono la suite screenshot che richiede un run
locale esterno non disponibile; gli screenshot di questa prova non la sostituiscono.
Engine è immutato: suite e PDF del precedente checkpoint sono prove storiche,
non nuove esecuzioni di questa unità.

Il [probe browser riproducibile](codex-r02-browser-probe.mjs.txt) verifica le due
identità del recorder, l'assenza del file globale, contenuti A/B distinti,
elementi e pagine osservate, uguaglianza esatta fra anteprima e file scaricato.
Infine colloca il journal B nella cartella A: errore visibile e download recap
disabilitato. Nessun errore di pagina o overlay Vite; resta il messaggio console
preesistente sullo script di stampa bloccato nel frame sandboxed. Screenshot
1280×900 ispezionati fuori repository; nessuna modifica visuale né prova mobile.
Server di prova dedicato e dati interamente sintetici; non è una lezione reale,
né verifica audio, riconoscimento della scrittura o qualità di un provider live.

## Stato dei finding e prossimo passo

R-02: corretto e verificato localmente, `PATCH_INDEPENDENT_REVIEW=PENDING`.
L'approvazione indipendente di R-01 resta limitata a R-01. La review D2 congelata
è invariata (SHA-256 `baf2e41dedcf42238b89f1a4e194631b50190d37438ffd1a9bc4da532e2e41df`).
R-03, omissione del log live nell'export RecapView, resta aperto e separato;
R-04, claim e protezioni del rilascio, resta nella destinazione originaria.
Il [pilot preparato](codex-restart-pilot.md) non è stato eseguito: mancano input
reali autorizzati e un provider live verificato. Nessuna modifica a Kirchhoff.

**Unica prossima azione:** review indipendente della patch R-02 rispetto alla
base locale indicata, con una controprova nuova sui byte del recorder e sulla
compatibilità legacy. Prerequisito: reviewer distinto dal builder sullo stesso
SHA; accesso locale isolato, nessuna lettura di vault, provider pagati o scrittura
remota. Solo dopo il verdict si decide la successiva unità; nessuna integrazione
è implicita nella review.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r02-recorder-recap-20260921`, builder `inherited/unknown`; riusate le
capability già applicate `persistent-capability-evolution` e
`build-web-apps:frontend-testing-debugging` (plugin 0.1.2), recorder/decoder
canonici e browser installato. Nessun agente aggiunto, installazione, promozione,
riscrittura di gate o dipendenza aggiornata. Oracolo preregistrato nella
[scheda](codex-r02-unit.md), RED e mutazioni mantenuti nei log. Quote di modelli
non dichiarate raggiunte; unità non ancora accettata da review indipendente.
Registro/receipt aggiunti qui senza riscrivere quelli precedenti. Vault esterno
escluso dal mandato: `INDEX_SYNC_DEFERRED`. AgentMemory
`RETIRED_NO_READ_NO_WRITE`; nessun accesso a vault o AgentMemory in questa unità.
