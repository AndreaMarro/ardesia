# S00 — composizione Kirchhoff e raccolta delle consegne, 26 ottobre 2026

## Perimetro e provenienza

Base integrata `d7dc3917d695c80d027c91df21577e06ec649232`; owner S19 `b64e30bafde218dbdb6d963bff2df14db218154d`, stessa [PR325](https://github.com/AndreaMarro/ardesia/pull/325). Il motore Kirchhoff resta fissato a `b35a8b5da0616f00a7764397bda0e6b95aca3c95`. Il merge locale contiene anche l'addendum terminale #309/#316: il suo originale `2c5885568b8198ca54c58233807a5539316ca667` è ripreso come `dd60fca5c85b0e9660928c64b600028faae3be0e`.

La raccolta chiesta dal proprietario è nell'[indice unico](../README.md) e nel [registro datato](evidence/chat-consolidation/REGISTRY-20261026.md):20 PR,19 fonti di chat,8 artefatti locali identificati. Il registro fotografa il momento prima di questa composizione; non si riscrive per fingere che la325 fosse già integrata. Per l'esito successivo leggere il commento terminale della PR e rigenerare lo stato.

## Comportamento implementato

- CoursePack canonico e installer in create_app, prima dei mount statici. Nessuna seconda sessione o base dati.
- Corsi apre il laboratorio solo quando il frontend è disponibile. Il motore è una dipendenza installata da pin verificato, non un pacchetto PyPI omonimo scaricato implicitamente.
- Lo studente modifica R/V/I, formula una previsione, controlla passaggi, salva una risorsa privata e consegna tramite ricevuta Core. Materiali e correzione presentano il circuito e la previsione in forma leggibile.
- Il collegamento dalla fonte porta resourceId **e revisionId**. Una R1 consegnata rimane leggibile al docente dopo una R2 privata; la R2 non gli viene mostrata. Le revisioni storiche sono in sola lettura. La copia privata acquisisce una nuova identità senza alterare la fonte.
- Il retry della consegna usa la ricevuta canonica originale, anche dopo una revisione successiva e senza ricalcolare un tentativo già ricevuto. Input/revisione differenti conservano conflitto e CAS.
- JSON esporta solo input validati anche con motore indisponibile. Il limite UTF-8 di importazione è64000byte, compatibile con i16000codepoint ammessi dal documento, senza allargare il validatore Core. Solve/SPICE/CircuitikZ indisponibili restituiscono503, non una falsa colpa dello studente.
- 401 elimina lo stato privato della sessione;403/404 cancellano il documento non più accessibile. Una risposta tardiva di A non può cancellare B dopo la navigazione. Un edit della stessa bozza non elude la revoca.

Il pack resta DRAFT e ProductVerified=false. La sincronizzazione o un risultato numerico non attestano comprensione, apprendimento o approvazione scientifica.

## Prove eseguite prima del commit

Le prove locali si riferiscono ai digest dei sorgenti nel [manifest](evidence/kirchhoff-composition/MANIFEST.json), non alla sola HEAD precedente ai cambi non committati.

| Prova | Esito e portata |
| --- | --- |
| Web | 530/530 su76file, worker singolo, runtime del lock; build PASS |
| Python S19 | 45/45,1warning deprecazione Starlette/httpx |
| Browser componente | 16desktop +16touch, con processi/DB separati; input, layout, CAS, revoca, readonly, risposte tardive, round-trip del download reale |
| Browser prodotto | 2/2 desktop1440 e touch390, movimento ridotto e ingresso da tastiera; App compilata e create_app reali senza composer o route simulate |
| Review indipendente | 19 controprove Core/API con sorgenti fingerprintati: ACL, doppio writer, retry, engine assente, Unicode; finding e correzioni conservati |
| CI nuova head / post-merge | Da leggere nei run della PR e su main; i verdi precedenti di b64 non certificano questa composizione |

Journey prodotto: **Corsi → laboratorio → previsione/calcolo → salva → Materiali → fonte tipizzata → consegna → R2 privata → docente/R1 → contesto nuovo → copia privata → revoca**. Zero pageerror osservati. Cookie/sessioni e SQLite sono sintetici e temporanei. I PNG mostrano il prodotto reale; touch è emulato, non un dispositivo fisico.

## Errori, controprove e correzioni

1. Core riapriva latest e controllava la revision prima del replay: RED2FAIL/12PASS, poi14PASS con R1 esatta e retry canonico.
2. Primo fixture Unicode compatto19420byte: fallimento di preparazione, non RED del difetto. Corretto a20060byte: il **file realmente scaricato**, senza riserializzazione, era rifiutato con «File troppo grande». Dopo limite coerente il round-trip passa.
3. Review: pin indisponibile produceva422 ed exportJSON dipendeva dall'engine. RED HTTP422vs200; classi di errore separate ed exportinput indipendente, poi45PASS.
4. Revoca403 dopo un edit lasciava lo stato privato visibile: RED browser e cancellazione anche dopo edit.
5. La prima correzione403 era troppo ampia: A403 tardivo cancellava B autorizzata. Prima fixture aspettava la navigation invece del GET esatto (NON_RED); la barriera sul GET esatto riproduce il difetto. Corretto usando identità del documento e sequenza delle azioni; nuova controprova passa.
6. Estensione della suite dopo il test revoke-all usava ancora l'identità revocata: attore dedicato alla revoca.32 login nella stessa finestra colpivano poi correttamente il rate limit30: trace letta solo per status,31°/32°POSTsession429. Ogni viewport ora ha server e DB nuovi; limite applicativo invariato, nessun timeout/gate ampliato.
7. Primo build Web fallito per contextId mancante nella nuova fixture TypeScript: corretto, build successivo PASS.
8. Web completo eseguito insieme al browser ha avuto timeout; esecuzione interrotta (130), log conservato. Worker singolo e slot esclusivo:530PASS. La contesa è osservata, non una diagnosi causale completa; nessuna etichetta flaky.
9. Warning build relativi a chunk/JSXGraph eval e direttive ReactFlow conservati. Nessuna nuova libreria introdotta da S00.

## Riproduzione

Usare Node26.5.1 e Python3.13. Preparazione e pin upstream: [README del plugin](../../../plugins/s19-circuit-lab/README.md). Comandi dalla root:

```sh
uv sync --project services/study-api --frozen --python 3.13
npm ci --ignore-scripts
npm run build:web
npm --workspace apps/web test -- --maxWorkers=1 --no-file-parallelism
npm --prefix plugins/s19-circuit-lab/web ci --ignore-scripts --workspaces=false
npm --prefix plugins/s19-circuit-lab/web run build -- --mode test
S19_PYTHON="$PWD/work/s19-env/bin/python" plugins/s19-circuit-lab/scripts/run_browser.sh
npm --prefix plugins/s19-circuit-lab/web run build
S19_PRODUCT=1 S19_PYTHON="$PWD/work/s19-env/bin/python" plugins/s19-circuit-lab/scripts/run_browser.sh
```

La build test include un host controllato; la build normale lo esclude. La lane S19 esegue entrambe, poi il consumer dell'app reale, e pubblica solo report/PNG consentiti, mai DB/cookie/token. Il default API senza Kirchhoff rimane avviabile; i calcoli specialistici dichiarano indisponibilità.

## Limiti e seguito

Nessun deploy o cambio della produzione: restano i cinque esempi autorizzati. Preview privata e backend hosted sono distinti; Study remoto ancora503 nel checkpoint precedente, nessuna nuova verifica remota attribuita a questo incremento. I60probe remoti sono preparati,0eseguiti. Font Studio/licenze, hardware audio, Safari, distribuzione ToolHost firmata, AC/Laplace e accettazione scientifica restano fuori dalla prova.

Quattro corsi:0/52,0/57,0/33,0/58 completamente accettati. L'integrazione di un laboratorio non chiude i gap editoriali né gli altri12consumer di PR. L'indice conserva tutti i lavori senza mescolare analisi, implementazione e rilascio.

## Review decorrelata e risorse locali

Claude Code2.1.246 è stato invocato prima del commit con il revisore read-only del repository, ma ha terminato prima della review: OAuth scaduto e refresh non riuscito. Esito NOT_RUN, nessuna approvazione Claude. La review indipendente Codex con controprove reali è conservata; CI e policy GitHub restano obbligatorie. Il disco è sceso a109MiB durante il lavoro; rimossa soltanto node_modules rigenerabile del worktree S00 dopo i test. Sorgenti, lock e prove conservati. Nessuna pulizia di altre chat o configurazioni globali.

## Rettifica editoriale delle prove

Il primo controllo staged ha rilevato spazi finali nei log appena aggiunti; la sequenza di comandi non si è fermata e il commit d3a1d39b è stato pubblicato. Correzione separata e tracciata nella stessa PR: rimossi colori ANSI e whitespace dai soli log di questa consegna, mantenuti gli hash originali e aggiornati quelli pubblicati nel manifest. Nessun risultato o asserzione modificato; controllo diff ripetuto con arresto su errore.


## Correzione del candidato dopo la CI 33a — 26 ottobre 2026

La CI [40392048016](https://github.com/AndreaMarro/ardesia/actions/runs/40392048016) ha rifiutato due aspettative API rimaste sul catalogo a sei pack e la proiezione pubblica con digest del vecchio catalogo. Non si è trattato di rerun: entrambi i fallimenti sono stati riprodotti localmente e corretti nella stessa PR. I test conservano l'uguaglianza esatta del registro, ora con i sette pack previsti, e verificano che S19 non acquisisca attività generiche o question bank implicite. L'inventario resta completo e identico anche quando il riferimento alla banca diventa obsoleto.

Il generatore canonico ha cambiato soltanto il digest di catalog.py: confronto strutturale di tutti gli altri dati PASS, senza nuovi contenuti o autorizzazioni pubbliche. RED API2/5, GREEN5/5; proiezione RED → GREEN. [Ricevuta, digest originali e log curati](evidence/kirchhoff-composition/ci-33a/receipt.json). CI completa sulla nuova head ancora necessaria; nessun gate, timeout, soglia o guardia rimossi.


### Follow-up browser sul catalogo, 26 ottobre 2026

La CI5092 ha confermato API e laneS19, inclusi i32 browser dei componenti e2journey reali; i due report del prodotto sono in [ci-5092](evidence/kirchhoff-composition/ci-5092/receipt.json), byte dei sette sorgenti ricontrollati. Web si è fermato nel percorso docente a un'ulteriore aspettativa a sei programmi (`physics-pathways.spec.ts:47`): il DOM allegato mostra sette, il locator richiede sei. Tre aspettative allineate al registro a sette, aggiunta presenza del titolo Kirchhoff. Riferimento obsoleto rifiutato, due sole edizioni create, refresh/Back/Forward, viewport e timeout restano invariati.

La prima correzione aveva coperto inventario API e proiezione ma non questa spec E2E. Ricerca delle aspettative equivalenti completata. Tentativo locale successivo NOT_RUN: `npm ci` fallisce ENOSPC prima del browser, rimossa soltanto la propria node_modules parziale. La nuova esecuzione completa è affidata alla CI; non si attribuisce un GREEN locale inesistente. Head, log RED e artefatti precedenti restano identificati separatamente.


Review del delta browser: nessun finding bloccante, [rapporto indipendente](evidence/kirchhoff-composition/ci-5092/independent-review.md). Debito P2 preesistente distinto: la vecchia `catalog-course-capabilities.spec.ts` presume due programmi reali e non è invocata dal job pathways; il seed crea due edizioni, non restringe il registro. Individuazione statica, nessun nuovo browser eseguito su quella spec. Va allineata quando si riattiva la sua suite, preservando l'isolamento delle due edizioni. Non è dichiarata verificata dalla CI attuale.
