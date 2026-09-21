# R-03b — checkpoint locale, 21 settembre 2026

Il riepilogo ora interrompe l'export quando il log persistente non può essere
aperto, mostra l'errore locale e permette di riprovare. Il guasto non viene
trasformato in una memoria temporanea vuota e in un download apparentemente
riuscito. I dati archiviati e il riepilogo restano disponibili; ripristinato
l'accesso, il successivo click esporta i fatti correnti.

## Identità e perimetro

- Workspace: `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`;
  branch `codex/restart-review-postlesson-20260921`, remote `AndreaMarro/ardesia`.
- Base iniziale pulita: `b76611be7bcfd738d31c9b845a6be1acd95ded74`.
  Commit prodotto: `a90d3563014c5cd995630a37ea164f42f4c40b9c`;
  il successivo commit documentale aggiunge
  questo checkpoint e il probe browser, senza cambiare i byte prodotto verificati.
- GitHub riletto: PR #256 OPEN/DRAFT, head
  `705284acc4322db4d241032de071437ab0473cc1`, base/main remoto
  `b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse.
  Il branch locale partiva 49 commit avanti, zero indietro. Nessuna nuova CI
  remota o build distribuita sul nuovo SHA; lo stato generato è locale/offline.
- Modello/effort esatti `inherited/unknown`, famiglia Codex GPT-6; nessun agente
  implementativo, quota di routing o modello Astra dichiarato senza evidenza.
- Prodotto: solo `apps/studio/src/RecapView.tsx`.
  Test: `apps/studio/src/__tests__/RecapLiveExport.test.tsx` e
  `apps/studio/src/__tests__/RecapView.test.tsx`.

La vista apre direttamente l'IndexedDbEventLog già esistente. open() e l'export
sono nello stesso try/finally, così close() viene eseguita anche se l'apertura
è solo parziale. Gli errori raggiungono il banner e il reset del pulsante già
presenti. Non ci sono nuove API, factory, dipendenze, schema, stringhe UI o gate.
Il percorso felice continua a passare il log corrente all'exporter canonico,
che mantiene identità, semantica di vuoto e compatibilità storica senza log.

I test usano ora il backend IndexedDB di test attraverso il confine reale della
vista, osservando open/close, senza sostituire la factory nel percorso positivo.
Restano i cinque invarianti R-03; il test dell'acquisizione rifiutata segue ora
open() anziché la factory permissiva e verifica anche close(). Sono aggiunti
quattro casi: backend assente, eccezione sincrona, richiesta asincrona rifiutata,
guasto dopo l'apertura fisica. Tutti verificano errore, mancato download e retry.
Le fixture dei test UI/slug predispongono IndexedDB; nessuna asserzione rimossa.

## Prove

Log diretti e record di comandi/exit/durate: `artifacts/restart/commands.jsonl`,
prefisso `r03b-`. Ambiente Node 22.14.0, npm 10.9.2, Vitest 4.1.8, Vite 8.0.16,
Chromium 148.0.7778.96. Chiavi dei provider rimosse dai processi di prova;
nessuna chiamata LLM, installazione o accesso esterno alla memoria.

| Controllo | Risultato |
|---|---|
| RED prima della patch | exit 1; 3 nuove prove fallite, 5 precedenti passate |
| GREEN finale, 8 suite pertinenti | exit 0; 145 pass |
| Mutazione: ripristino del chiamante R-03 con fallback | exit 1; 5 fail, 4 pass |
| Suite Studio completa, deterministica | exit 0; 2182 pass, 5 skip preesistenti |
| Typecheck e build | entrambi exit 0; warning chunk preesistente |
| Gate congelato | exit 0; 2183 pass (2182 Vitest + replay), 0 fail |
| Browser guasto/ripristino | exit 0; zero download nei due guasti, uno valido dopo retry |
| Browser parità Recap/Materiali A/B | exit 0; memoria identica, nessuna contaminazione |
| Golden path salvataggio/export/import/riapertura | exit 0; 1 pass |
| NUL, secrets, boundary, workflow, claim scheda, verifica stato | 6 esecuzioni, exit 0 |

Profilo dei test dalla cartella Studio:

```sh
node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Per RED e mutazione selezionare RecapLiveExport con il percorso relativo a Studio.
La mutazione usa i byte del chiamante in HEAD/base e non altera il test: le
condizioni non più protette tornano a fallire. Prima di tutte le verifiche finali
sono ripristinati i byte del prodotto, SHA-256
`d1fd905b477510beb0059a771e3945a9f8ec52e92ee3dd996c44fe9f378f98df`.
Il primo GREEN aveva 144 pass; il GREEN finale aggiunge la prova della connessione
aperta parzialmente. Non sono sommati come casi distinti.

Il gate immutato antepone Node 26.5.1: eseguito con
`NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh` dalla cartella Studio,
come già motivato in R-01. Il rosso nell'ambiente Node 26 ordinario resta una
prova storica conservata; quell'ambiente non è dichiarato verde. I cinque skip
richiedono screenshot esterni già indisponibili, non sostituiti da fixture nuove.
Engine/PDF sono immutati e non rieseguiti in questa unità.

## Verifica della vista

Percorso: `?vista=recap` della lezione sintetica → indisponibilità IndexedDB →
click export → alert locale e nessun download → ripristino → click → ZIP valido.
Browser plugin non disponibile; usato Playwright già installato su
`http://127.0.0.1:5291`, viewport 1280×900. Il [probe](codex-r03b-browser-probe.mjs.txt)
usa recorder/runtime e IndexedDB reali, una scena minima sintetica e i pulsanti
effettivi. La fonte versionata coincide con la copia eseguita.

| Verifica UI | Esito |
|---|---|
| Identità pagina | URL della lezione e titolo Ardesia · studio corretti |
| Contenuto | riepilogo, formula e anteprima visibili anche durante l'errore |
| Overlay/runtime | nessun overlay Vite o errore di pagina |
| Console | solo messaggio noto sullo script di stampa nel frame sandboxed |
| Stato errore | alert visibile, pulsante riattivato, snapshot archiviato invariato |
| Ripristino | alert rimosso, un download con memoria corrente e identità corretta |
| Screenshot | stati errore e ripristino ispezionati, salvati fuori repository |

È rieseguito anche il [probe A/B R-03](codex-r03-browser-probe.mjs.txt), cambiando
solo i nomi degli artifact con prefisso r03b-parity, per conservare gli originali.
Entrambe le lezioni esportano quattro eventi propri; i due pulsanti producono
memoria identica e includono un fatto successivo all'anteprima. Gli esiti e i ZIP
restano in artifacts/restart. Nessuna verifica mobile, audio, grafia o provider
reale; i dati sono sintetici. Nessuna modifica di layout.

## Stato e prossimo gate

Il finding della [review R-03](codex-r03-review-20260921/closeout.md) è corretto
localmente; `PATCH_INDEPENDENT_REVIEW=PENDING`. Il precedente REQUEST_CHANGES e
le prove originali restano immutati. Nessuna auto-approvazione o estensione delle
approvazioni R-01/R-02. Il prodotto non è dichiarato pronto per il workflow intero.

Limiti invariati: factory generale, anteprima e Materiali mantengono le proprie
politiche di fallback; R-03b modifica soltanto l'acquisizione nell'export Recap.
Non aggiunge una politica di integrità globale o recovery, timeout di richieste
indefinitamente pendenti o global flush. La semantica di lettura/validazione
dell'adapter e dell'exporter non viene ridefinita. R-04, provider e pilot restano
nelle destinazioni originarie; nessuna modifica o review dedicata di Kirchhoff.

**Unica prossima azione:** nuova review indipendente di R-03b sul commit prodotto
indicato, con verifica del rifiuto visibile, del rilascio delle handle e dei casi
validi, da un reviewer distinto dal builder. Nessun accesso a vault, provider
pagati o scrittura remota; un verdict positivo non autorizza integrazione.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r03b-persistent-export-acquisition-20260921`, modello `inherited/unknown`.
Riusate persistent-capability-evolution, frontend-testing-debugging 0.1.2,
adapter IndexedDbEventLog, exporter e runner canonici. Oracolo nella
[scheda precedente alla patch](codex-r03b-unit.md); RED, GREEN e mutazione
conservati. Nessuna promozione, quota modelli rivendicata, riscrittura di gate o
nuova dipendenza. Receipt e next-gate aggiunti al registro locale senza
riscrivere i precedenti. `INDEX_SYNC_DEFERRED`; vault escluso dal mandato,
Basic Memory non usata e AgentMemory `RETIRED_NO_READ_NO_WRITE`.
