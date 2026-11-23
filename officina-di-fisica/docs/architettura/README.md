# Revisione di Cric / Officina di Fisica 1.1

Dal pulsante **Laboratori 3D per capitolo** si raggiungono le 181 voci dei 56 capitoli. Nel testo di ciascuna lezione il collegamento è accanto al paragrafo interessato. Il nuovo pannello **Prerequisiti e prossima attività** ordina lo studio in base alle competenze e ai tentativi del lettore. C6 include i cinque corsi e i suoi sei raccordi, con un solo storico per ciascun materiale. [Indice e gallerie di tutte le voci](../laboratori-3d/capitoli/README.md) · [Inventario per ID](../inventario-record.csv)

| Nel catalogo canonico | Numero |
| --- | ---: |
| Corsi, lezioni, voci con laboratorio dedicato | 6, 56, 181 |
| Laboratori di voce con timeline fisica | 44 |
| Laboratori di voce a confronto di configurazioni | 137 |
| Quesiti unici | 606 |
| Di cui nei tre fascicoli d’esame | 93 |
| Altri quesiti | 513 |
| Esempi svolti | 117 |
| Attività di metodo, banchi di approfondimento, laboratori guidati | 10, 10, 5 |

Il totale è di 991 record. Le previsioni, i confronti e le due verifiche interne a ogni laboratorio fanno parte della sua attività. Il corso di geometria dimostrativo usa un archivio temporaneo ed è escluso dai conteggi del catalogo.

## Com’è organizzato il sistema

Il monolite gestisce insegnamento, editor, ordini e persistenza in una singola installazione. Un client indipendente può leggere OpenAPI e gli schemi JSON. Un nuovo corso entra come lotto editoriale e un nuovo motore come modulo installabile. Lo strumento AI è destinato al lavoro dell’autore. [Decisione sul monolite e sui confini](ADR-001-monolite.md) · [Decisione sui contratti e sul versionamento](ADR-002-estensioni.md) · [Installazione delle estensioni](estensioni.md)

La prova di estensione percorre importazione di un lotto, bozza, pubblicazione, lettura come studente, previsione, variazione della base, confronto e verifica. Il nuovo banco impiega una scacchiera di unità quadrate. Le tre file permettono di contare le celle e verificare `2 × 3 = 6` e `5 × 3 = 15`. Le due viste utilizzano la stessa geometria. [Banco desktop](prove/tassellazione-desktop.png) · [Banco mobile emulato](prove/tassellazione-mobile-webgl.png) · [Misure A e B](prove/confronto-desktop.png)

## Revisione didattica

L’obiettivo di ogni voce identifica un comportamento osservabile. La previsione richiede di scegliere il verso della variazione. Il banco rende visibile che cosa cambia, espone valori e unità, collega misura e formula e propone un dato diverso per il trasferimento. Il docente può confrontare la consegna, il feedback e l’obiettivo esaminando lo stesso ID. Per l’area con segno di C1-Q027, le figure successive distinguono area geometrica, segno e spostamento complessivo. Lo studente può mostrare un passaggio alla volta. [Criterio di allineamento di Biggs](https://doi.org/10.1007/BF00138871) · [Carico cognitivo negli esercizi](https://doi.org/10.1207/s15516709cog1202_4)

Il motore conserva gli ultimi cinque risultati per famiglie distinte di problemi tentati senza aiuto. Con almeno due errori segnala la competenza da consolidare. Con almeno tre famiglie corrette e almeno il 75% di esiti corretti nella finestra indica risultati stabili. La prossima azione può rinviare a un prerequisito, un esempio svolto, una misura sperimentale o un’altra famiglia di problemi. La lezione espone il numero di famiglie effettivamente osservate. È un indicatore formativo, la cui capacità di predire apprendimento e ritenzione richiede una prova con studenti. [Regole di evidenza](../../server/domain/assessment.py) · [Mastery learning](https://eric.ed.gov/?id=ED053419) · [Percorso mostrato al lettore](prove/percorso-desktop.png)

## Revisione UX e accessibilità

Sul MacBook Air M1, Chrome con finestra visibile ha renderizzato la scena mediante ANGLE Metal su Apple M1. WebKit ha eseguito la stessa attività con touch emulato a 390 × 844, sia con Apple GPU sia con WebGL disattivato. Il controllo di riflusso è sceso a 320 px. La prova ha esercitato il collegamento di salto, il pannello nativo dei prerequisiti da tastiera, la finestra di concentrazione, Escape e il ritorno del focus. Il sistema grafico conserva Work Sans, Baskervville, la carta chiara e i colori di Cric. Le misure e i calcoli restano leggibili come testo. [Regole WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [Test nel browser](../../tests/browser-architecture.mjs)

Sul campione di 22 stati axe ha rilevato **zero violazioni automatiche** con le regole WCAG A/AA fino alla versione 2.2. I risultati conservano anche i casi in cui axe richiede giudizio visivo, soprattutto etichette SVG su diagrammi e frecce decorative. Il verbale associa regola ed elemento DOM a ogni segnalazione. Le immagini consentono di riesaminare le didascalie e il confronto dei colori. Restano da collaudare touch e lettore di schermo su telefono fisico, prova rinviata dal committente. La conformità dell’intera applicazione richiede una valutazione completa del campione e dei processi secondo WCAG-EM. [Esiti per pagina](prove/revisione.json) · [Metodo W3C](https://www.w3.org/TR/WCAG-EM/)

Nella navigazione locale misurata sul Mac la libreria Web Vitals ha rilevato **LCP 184 ms, INP 56 ms e CLS 0,0452**. Il test usa interazioni effettive del browser e applica le soglie di laboratorio di 2.500 ms, 200 ms e 0,1. Il 75º percentile degli utenti in campo richiede dati di utilizzo reali. La pagina studente non raccoglie telemetria personale. [Misure grezze](prove/revisione.json) · [Definizioni Core Web Vitals](https://web.dev/articles/vitals)

## Esercizio e riproducibilità

Dalla cartella del prodotto si possono ripetere le verifiche in archivi temporanei. La matrice GitHub Actions esegue tutti i laboratori su Chromium e WebKit su desktop, tablet emulato, smartphone emulato e smartphone con tavola SVG. Il collaudo comprende i flussi storici di ordine, ripresa, fascicoli C6, versioni delle soluzioni e PDF. La regressione visiva confronta il raster dello stesso diagramma con un campione approvato e una tolleranza del 2,5% per l’antialiasing. [Workflow canonico](../../../.github/workflows/officina-di-fisica.yml) · [Campione visivo](../../tests/fixtures/area-tavola.png)

```sh
npm ci
npm test
npm run test:contracts
python3 -m unittest discover -s tests -v
npx playwright install webkit
node tests/browser.mjs
node tests/editor.mjs
npm run test:accessibility
ASTRA_BROWSER=webkit ASTRA_COURSE=C2 node tests/browser-esperienze.mjs
python3 tools/package_release.py var/release/officina-di-fisica.zip --verify
```

Il confezionamento usa esclusivamente i blob tracciati nell’albero Git del prodotto. Ordine, permessi e timestamp sono fissati. Il gate produce due copie byte-identiche, verifica l’archivio, estrae e avvia la copia con un database nuovo. Sorgenti, schermate, specifiche, migrazioni e suite restano associati alla stessa revisione. Gli ZIP 1.0 conservano la storia di quell’edizione. [Confezionamento](../../tools/package_release.py)

Per un aggiornamento, arresta l’istanza, conserva una copia privata di tutta `ASTRA_DATA` con permessi ristretti e riavvia il nuovo codice con lo stesso percorso. L’installazione applica in ordine le migrazioni SQL con `BEGIN IMMEDIATE`. L’errore di un passaggio annulla l’intera transazione. Un binario che incontra una versione schema futura interrompe l’avvio. Per il ripristino usa insieme il precedente binario e la relativa copia dei dati. Gli ID e le revisioni pubblicate rimangono invariati. [Script delle migrazioni](../../migrations) · [Guida all’archivio autore](../guida-autore.md)

Con `ASTRA_LOG=1` ogni risposta fornisce un ID di correlazione ed emette una riga JSON con famiglia della route, durata, metodo, stato HTTP e byte. Le righe sono serializzate anche durante richieste concorrenti. I test controllano le sole chiavi ammesse. Token, URL con identificatori, soluzioni e account restano fuori dai log operativi. La cronologia delle modifiche editoriali è distinta ed è accessibile all’autore. [Implementazione HTTP](../../server/web.py)

I test eseguono realmente stdio con il client SDK MCP e i due protocolli provider su HTTP locale con risposte controllate. La qualità delle proposte di un modello Ollama o commerciale richiede ancora una prova con un modello reale. La revisione scientifica automatica e il collaudo dei percorsi sono ripetibili. Una valutazione nominativa da parte di un docente e uno studio di comprensione con studenti richiedono partecipanti reali.
