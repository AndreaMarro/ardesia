# Materie e quaderno di Cric

## Installazione

Il catalogo Materie si apre dalla copertina. Fisica usa gli stessi percorsi, edizioni, esami e quaderni dell’installazione esistente. Un operatore installa ogni nuova disciplina da una directory privata. Questi comandi si eseguono nella cartella del prodotto.

```sh
python3 app.py install-discipline examples/discipline/catalog.json
python3 app.py serve --port 0 --open
```

Il pacchetto di esempio contiene un microcorso di geometria utile al collaudo di un clone pubblico. Per Analisi 1 usare il catalogo incluso nella consegna privata. La nuova disciplina compare nella navigazione dopo l’importazione. Su un server associato al loopback in modalità verifica, un quaderno di prova apre le anteprime. Nell’installazione hosted o in modalità reale, l’autore mantiene l’accesso alle anteprime.

Ogni importazione valida il grafo dei prerequisiti, i riferimenti, le opzioni, le correzioni, gli orali e le simulazioni prima di rendere attiva un’edizione. La coppia disciplina/versione identifica un contenuto immutabile. Un secondo import identico è idempotente. Una modifica al contenuto richiede una nuova versione. Per riattivare un’edizione già archiviata si usa `--activate`. L’operatore può attestare l’approvazione editoriale con `--publish-reviewed`. Questa è una decisione editoriale esplicita e abilita l’offerta commerciale. L’impostazione predefinita è l’anteprima.

La matrice descrive le unità e i programmi nazionali collegati alla consegna. [Copertura di Analisi Matematica 1](analisi-programmi.md)

I prezzi dei microcorsi pubblicati sono configurabili nel banco autore. Ordini, conferma dell’accredito e concessioni di accesso attraversano l’autorità commerciale già usata da Fisica. La banca di Analisi e i registri privati viaggiano separatamente dal repository e dalla distribuzione pubblica.

## Architettura e contratti

Il prodotto è un monolite Python con router HTTP condiviso fra il server locale e l’entry point Vercel. I moduli ES della SPA consumano lo stesso HTTP. Il server riusa l’identità di sessione, il controllo di origine, il registro ordini e la transazione SQLite. In configurazione hosted il repository usa il primary libSQL e letture da replica sincronizzata. L’estensione aggiunge le proprie tabelle nello stesso database con una transazione esplicita all’import. Il numero delle migrazioni storiche di Fisica rimane leggibile dalle edizioni precedenti.

Il pacchetto Python `multidiscipline/` estende l’handler HTTP di Fisica. Il dispatcher delega le rotte storiche al runtime esistente e monta le nuove API con gli stessi controlli di accesso. I dati editoriali privati si installano da una directory esterna all’applicazione. I file firmati dal revisore scientifico conservano la loro impronta. Il client originario rimane raggiungibile a `/index.html`. La copertina a `/` carica i moduli multidisciplinari e riusa i moduli storici dai loro URL. La costruzione verifica ogni punto di innesto sul client della specifica edizione e produce gli stessi asset per la pubblicazione statica e per il server locale.

I record editoriali di Fisica continuano ad avere `heads` e `versions` come autorità. Il catalogo Materie proietta da lì i microcorsi di Fisica. Un nuovo pack contiene le definizioni delle competenze e le edizioni dei microcorsi con ID stabili. Il caricatore compone l’indice leggero e salva un documento per unità. Gli svolgimenti restano nell’unità privata. L’API dell’allievo consegna il testo delle attività accessibili e apre la correzione dopo una risposta valida.

| Capacità | Contratto |
| --- | --- |
| Scoperta e programmi | `GET /api/v1/disciplines` e `GET /api/v1/disciplines/{id}` |
| Studio e ripresa | `GET /api/v1/disciplines/{id}/units/{unit}` e `GET /api/v1/disciplines/{id}/me` |
| Esecuzione | `POST /api/v1/disciplines/{id}/events`, con versione e chiave di idempotenza |
| Scambio consensuale | `POST /api/v1/disciplines/{id}/context`, con selezione esplicita degli ambiti |
| Biblioteca per strumenti editoriali | `GET /api/v1/disciplines/{id}/courses/{course}/editorial-library`, con sessione autore ed edizione pubblicata |
| Calcolo esatto | `POST /api/v1/mathematics/compare` |
| Scoperta macchina | `GET /api/v1/openapi.json` e `GET /api/v1/schemas/disciplines-v1.schema.json` |

Le scritture HTTP usano JSON e l’header `X-Astra-Request: 1`. Il contratto HTTP è provato anche da un consumatore Node con validazione JSON Schema. Il test apre un vero processo MCP stdio con l’SDK ufficiale: la biblioteca autorizzata restituisce passaggi testuali della lezione. L’operatore sceglie il corso e i tool abilitati. I trasporti per suggerimenti editoriali già presenti supportano Ollama e Chat Completions. La selezione del passaggio è soggetta a validazione deterministica. Il flusso studente funziona offline e il download del contesto termina sul dispositivo.

L’operatore può produrre un item bank QTI 3 o un fascicolo A4 dai medesimi sorgenti. Gli export includono le soluzioni e sono destinati al docente. L’XML conserva le alternative, la chiave, la valutazione, lo svolgimento e il trasferimento. Le prove del pacchetto riguardano questa forma di item a scelta singola. [Guida QTI 3 di 1EdTech](https://www.imsglobal.org/spec/qti/v3p0/guide)

```sh
python3 -m tools.export_discipline examples/discipline/catalog.json /tmp/cric-misure.zip
python3 -m tools.fascicolo_disciplina examples/discipline/catalog.json /tmp/cric-misure.pdf
```

## Come leggere il quaderno

Un evento registra la versione in uso, l’obiettivo e il tipo di azione. Aperture e completamenti sono separati dalle prestazioni. La prima risposta corretta su un quesito mai assistito dà evidenza autonoma. Un indizio precedente o una correzione già letta rendono assistita la prova sul medesimo quesito. La lettura accessibile e gli strumenti di presentazione accompagnano il lavoro senza cambiare la classificazione della risposta.

Il trasferimento richiede un quesito dichiarato dall’autore di trasferimento, una competenza già dimostrata e una prima risposta corretta autonoma. La ritenzione richiede un nuovo quesito dopo l’intervallo impostato. Questi contatori descrivono prestazioni osservate. Eventuali cause di errore indicate nei feedback sono ipotesi didattiche. Le priorità di recupero, ripasso e studio progressivo sono consultabili nel codice e motivate nella UI. Il diario degli eventi resta la fonte della proiezione per competenza. Un indice sulle attività viste e una proiezione aggregata aggiornata nella stessa transazione rendono economica la riapertura dei quaderni lunghi.

Il comparatore di passaggi usa polinomi a coefficienti razionali e conserva le esclusioni introdotte dalle divisioni. L’algoritmo di Euclide e le variazioni di Sturm permettono di confrontare esattamente i domini reali, anche in presenza di radici irrazionali. Supporta equivalenza, derivata e primitiva entro il linguaggio dichiarato. Un input fuori dal linguaggio o dai limiti di dimensione restituisce un esito indeterminato.

## Evidenza e scelte di progetto

- La meta-analisi specifica sulla matematica trova un beneficio della distribuzione della pratica e maggiore incertezza per il confronto fra recupero e ristudio. La regola iniziale propone due giorni fino al primo ripasso e sette dopo una prova differita riuscita. Sono valori progettuali da calibrare. [Murray, Goebel e Horner](https://scispace.com/papers/a-meta-analytic-review-of-the-effectiveness-of-spacing-and-3muq7qzh9uf3)
- Gli esperimenti sui passaggi svolti progressivamente ritirati motivano la sequenza lezione, indizio, tentativo, soluzione e problema nuovo. Gli effetti osservati dagli autori riguardano in particolare il trasferimento vicino. [Renkl e collaboratori](https://www.tandfonline.com/doi/abs/10.1080/00220970209599510)
- L’intercalazione di problemi diversi è stata studiata anche con compiti matematici. Cric cerca una domanda nuova per recupero o ripasso e conserva l’identità dell’item già visto. Una prova con studenti deve stabilire l’effetto di questa scelta nel contesto universitario italiano. [Rohrer e Taylor](https://doi.org/10.1007/s11251-007-9015-8)
- STACK motiva il feedback in funzione della risposta matematica effettiva. Anki distingue le impostazioni di pianificazione delle ripetizioni. In Cric il collegamento al distrattore e il criterio per proporre un nuovo esercizio sono separatamente ispezionabili. [STACK](https://docs.stack-assessment.org/en/Authoring/Potential_response_trees/) · [Anki](https://docs.ankiweb.net/deck-options.html)
- La navigazione da tastiera, la lettura dei simboli, il testo alternativo ai grafici e la ripresa del compito rispondono ai problemi di orientamento e percezione descritti da W3C e CAST. Le prove con software assistivo e utenti vanno registrate per tecnologia e percorso effettivo. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [CAST UDL Guidelines](https://udlguidelines.cast.org/)

## Integrazione con la revisione di Fisica

L’ownership scientifica comprende il corpus e i batch editoriali, i checkpoint, gli asset, i registri di assegnazione, revisione e ritiro, i codici di verifica e gli esami protetti. Durante questa consegna sono attive la PR scientifica 364, il suo ramo successore e la proposta di design 340. Le loro head possono divergere dai worktree scientifici locali. I gate scientifici e la pubblicazione appartengono ai rispettivi responsabili. [PR 364](https://github.com/AndreaMarro/ardesia/pull/364) · [PR 340](https://github.com/AndreaMarro/ardesia/pull/340)

1. Rilevare dalla fonte Git e da GitHub la base canonica, la head effettiva della PR e il successore scientifico designato. Annotare separatamente modifiche locali e commit osservabili.
2. Eseguire il confronto dei percorsi e il collaudo su una directory temporanea con `tools/verifica_convergenza.py`. Lo script legge gli oggetti Git delle tre revisioni, respinge sovrapposizioni incompatibili e prova il passaggio dal runtime scientifico a quello composto. Confronta gli hash delle tabelle preesistenti nello stesso quaderno, riesegue l’import, registra un nuovo tentativo, riapre con il vecchio lettore e verifica il replay. Non muove riferimenti Git.
3. Sulla candidata concordata ripetere schema, contratti HTTP/MCP, permessi, ordini, suite di regressione, E2E da tastiera e packaging. Se cambiano le head, riferire le nuove prove alle nuove SHA.
4. Prima dell’integrazione canonica la sessione scientifica deve chiudere i propri ritiri e verificare checkpoint, esami e firme delle edizioni. La composizione temporanea dimostra la compatibilità tecnica dei due rami alla SHA provata. L’approvazione disciplinare resta nel ledger scientifico.

```sh
python3 tools/verifica_convergenza.py --base <sha-canonica-comune> --platform HEAD --scientific <sha-scientifica>
python3 -m unittest discover -s tests -p 'test_*.py'
npm ci && npm test && npm run test:contracts
node tests/browser-discipline.mjs
python3 -m tools.benchmark_discipline examples/discipline/catalog.json
```

## Protocollo di valutazione con studenti

Per la prima sperimentazione usare compiti nuovi sugli stessi obiettivi e versionare l’assegnazione. Raccogliere consenso e conservare solo dati pseudonimi del pilot. Bilanciare competenza iniziale e ordine dei compiti. Registrare il primo accesso utile, il ritrovamento dell’ultima attività dopo un’interruzione, il successo nel tornare alla correzione e la prestazione su una forma parallela a distanza. Distinguere uso degli indizi e degli strumenti di accessibilità. Registrare i tempi con e senza tecnologie assistive e chiedere il carico percepito dopo ciascun percorso. Predefinire criteri di esclusione, esito primario e intervalli di incertezza. Finora le misure di interazione provengono da test automatici.


## Budget per il quaderno

L’obiettivo per una lettura del quaderno già aperto con 10.000 eventi è un p95 entro 250 ms sul database SQLite locale, misurato su 25 ripetizioni dopo il riscaldamento. Per l’import atomico del catalogo dimostrato il budget è di 5 secondi sullo stesso host. Registrare le distribuzioni a 0, 1.000 e 10.000 eventi, versione del pacchetto e condizioni del dispositivo. Per il servizio remoto occorrono anche prove end-to-end dalla rete dello studente.
