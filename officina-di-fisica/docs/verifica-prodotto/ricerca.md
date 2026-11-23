# Trovare un materiale da tutti i microcorsi

## Contratto di accettazione prima dell'implementazione

Base ufficiale `f7f4bde8e09ed49b1db12b66017331aefbfa112b`. La release 1.1.0 e il merge della PR 339 puntano a `14fd6504`. La PR 340 è il confronto progettuale. La PR 341 è integrata e il job di collaudo più i dodici job browser sono passati sulla base di questo incremento. [Verifica della base](https://github.com/AndreaMarro/ardesia/pull/341#issuecomment-7102301606)

**Compito.** Uno studente conosce un argomento o un codice e vuole aprire la lezione, l’esempio, il quesito o il laboratorio giusto. Oggi l’indice dei percorsi richiede di conoscere il corso e il tipo. La ricerca dei banchi copre le 181 simulazioni delle voci. Questa modifica aggiunge la ricerca trasversale alla pagina **Percorsi**, raggiungibile dal comando **Cerca** nella testata. L’elenco dei sei corsi rimane l’ingresso per chi preferisce sfogliare.

| ID | Comportamento e casi limite | Controprova richiesta |
| --- | --- | --- |
| R1 | Titolo, argomento e codice, lettere accentate e maiuscole. Un ID esatto è il primo risultato. Filtri per corso e tipo. | Enumerare gli ID pubblicati con un oracolo indipendente, verificare la corrispondenza di ogni pagina e l’unicità dei riusi in C6. |
| R2 | Fino a 12 risultati per pagina con ordinamento stabile. Ricerca vuota senza filtri mostra i percorsi. Zero corrispondenze, pagina successiva, query troppo lunga e parametri ambigui hanno un esito definito. | Prove HTTP anche su input malformati, caratteri HTML, richieste ripetute e ultima pagina. |
| R3 | Si vedono solo metadati pubblici per l’orientamento. La destinazione riapplica l’accesso attuale. Escludere tutti i 93 quesiti d’esame, i ritirati e le bozze editoriali, anche cercando il codice esatto. | Ospite e quaderno abilitato, accesso diretto, modifica editoriale, controllo dei nomi dei campi e confronto dei record ufficiali prima e dopo la ricerca. |
| R4 | Ogni tipo apre la sua attività canonica. La cronologia ripristina termine, filtri, pagina e risultato da cui si era usciti. | Tastiera, ricarica, Indietro e ritorno da un banco. Il risultato riceve di nuovo il focus. |
| R5 | Unità visiva con l’Officina, comandi a ritmo manuale, etichette esplicite, focus visibile, risultati leggibili a 320 px e al 200%. | Chromium e WebKit, screenshot desktop/mobile, preferenza di movimento ridotto, axe e lettura delle schermate Taste Skill. |
| R6 | Nuovo contratto API additivo. Nessuna copia della banca o tabella SQLite. Ricerca caricata all’apertura del catalogo. | Confrontare catalogo, PDF e schema con la base. Budget di 12 KiB JSON per la pagina della banca distribuita. Nel confronto locale p95 del caso «lente» entro 3 × p95 di `/api/course/C6` + 30 ms, su 20 letture a processo caldo. |

Le misure tecniche saranno associate alle SHA effettivamente eseguite. Efficienza della ricerca con studenti, lettura con tecnologie assistive personali e prova touch su telefono fisico richiedono osservazioni separate.

## Riscontro sul codice

Le prove in questa sezione sono state eseguite sul commit `9b79eb29c7fbb78f63d1bad75935834d1eace52a`, dopo il contratto `039e91ac` e prima del commit che registra queste immagini. La verifica della successiva head e del merge si trova nella PR tecnica. [Codice collaudato](https://github.com/AndreaMarro/ardesia/commit/9b79eb29c7fbb78f63d1bad75935834d1eace52a)

| ID | Base `f7f4bde8` → modifica | Rischio | Test indipendente e prova | SHA provata | Esito |
| --- | --- | --- | --- | --- | --- |
| R1 | Elenchi per corso → ricerca comune per codice, parola o argomento della lezione | Doppioni da riuso o omissioni | Lettura dei JSON distribuiti, confronto degli insiemi attraverso tutte le pagine per ogni corso e tipo. 898 ID pubblici nel complesso, 893 in C6 compreso il corso C6. [Oracolo](../../tests/test_catalog_search.py) | `9b79eb29` | PASS |
| R2 | Nessuna pagina di risultati → 12 per pagina in ordine ripetibile | Pagine instabili o input ambiguo | Ordine invariato invertendo l’input, 18 risultati per «lente», due pagine disgiunte. Query duplicate, codifiche invalide, pagina fuori intervallo, campi sconosciuti e simboli. [Prova HTTP](../../tests/test_workflows.py) | `9b79eb29` | PASS |
| R3 | Edizioni e accesso gestiti dal server → proiezione di cinque soli campi pubblici | Esame rivelato, bozza ricercabile, registrazione indebita | Controllati tutti i 93 ID d’esame, campi sensibili iniettati solo nella fixture, ospite, autore, lettore e modifica pubblicata/ritirata. Confronto integrale di 7 tabelle del quaderno durante la lettura. [Prove](../../tests/test_workflows.py) | `9b79eb29` | PASS |
| R4 | Indici separati → apertura degli otto tipi nell’attività canonica | Perdita di pagina, filtri o focus | Navigazione effettiva fino al materiale, Indietro, ricarica, ritorno esplicito dal banco e attività di metodo aperta sul passaggio giusto. [Esiti browser](prove/ricerca-browser.json) | `9b79eb29` | PASS |
| R5 | Titolo desktop di 81 px, indice da sfogliare → campo di ricerca, filtri e risultati in sequenza di lettura | Controlli stretti o focus invisibile | Chromium/WebKit, 5 configurazioni, 15 scansioni axe, movimento ridotto, larghezza 320, 640 CSS px a densità 2× come equivalente di riflusso al 200% su 1280 px. Misurate anche le aree dei quattro controlli, alte almeno 44 px. [Desktop](prove/ricerca-desktop.png) · [Mobile](prove/ricerca-mobile.png) | `9b79eb29` | PASS tecnico |
| R6 | Nessuna API comune → `GET /api/v1/catalog/search`, schema v1, modulo UI caricato su Percorsi | Carico e incompatibilità | 1.318 byte per «lente», p95 isolato 40,74 ms su 20 letture, budget 111,90 ms. C6 da 26,57 a 27,30 ms. Carico concorrente documentato a parte. Stessi alberi di contenuti, PDF, migrazioni e lockfile. [Misure](prove/ricerca-prestazioni.json) · [OpenAPI](../../contracts/openapi.json) | `9b79eb29` | PASS |
| U1 | Compito nuovo → trovare un materiale dopo una pausa | Individuazione lenta, termine diverso da quello editoriale | Pilot con studenti, descrizione del compito e del materiale trovato, tempo, necessità di aiuto. Prova touch e lettore di schermo abituale su telefono reale rinviata dal committente | — | NOT TESTED |

Il test desktop apre **Cerca**, inserisce «lente», limita la ricerca a C6 e passa alla seconda pagina. Cercando un codice, lo studente raggiunge anche l’attività esatta di metodo. Nel ritorno da un laboratorio il catalogo rilegge le edizioni correnti. Il risultato precedente riacquista il focus se è ancora disponibile. Su WebKit macOS è stata provata la combinazione nativa Opzione–Tab per i link. [Sequenza eseguibile](../../tests/browser-catalogo.mjs)

Taste Skill ha guidato la lettura di due difetti visibili. A 390 px il comando Cerca occupava una riga quasi vuota. A 320 px due select affiancate troncavano il filtro attivo. La firma va ora sotto il nome in testata e i filtri più stretti dispongono ciascuno di una riga. L’ispezione dello screenshot WebKit ha rivelato un altro dettaglio: il select nativo misurava 24 px anche con `min-height` dichiarata. L’altezza ora è esplicita e verificata nel browser. Il rapporto Taste grezzo continua a segnalare il viola e due osservazioni sulla carta crema e la firma in corsivo. La seconda esecuzione dichiara il viola preesistente come scelta di identità. DSA, ADHD e tecnologie assistive personali richiedono osservazione con i rispettivi utenti. [Rapporti grezzi e scelta cromatica esplicita](prove/ricerca-taste.json)

**Regressione tecnica.** 235 test Node, compilazione TypeScript e due test di contratto, 37 test Python, percorso generale C1/C6, editor e quattro configurazioni Campo. Rieseguiti gli oracoli C1–C2, C3–C4 e C5–C6 su chiavi, unità, curve e ottica. Una sessione creata sulla 1.1.0 ha riaperto lo stesso quesito già risposto, conservando l’intera riga del tentativo. Il nuovo endpoint usa una transazione di lettura. La latenza HTTP su loopback e le scansioni automatiche di accessibilità misurano condizioni di laboratorio. [Workflow](../../../.github/workflows/officina-di-fisica.yml)

## Ripetere i controlli

Dalla cartella `officina-di-fisica`, dopo `npm ci` e l’installazione dei browser Playwright:

```sh
python3 -m unittest discover -s tests -v
npm test
npm run test:contracts
node tests/browser-catalogo.mjs
python3 tools/misura_catalogo.py
```

Ogni esecuzione browser scrive un nuovo `esiti.json` con la SHA effettiva e le schermate nelle cartelle della CI. I riscontri d’integrazione devono citare la SHA del merge e la relativa esecuzione di GitHub Actions.
