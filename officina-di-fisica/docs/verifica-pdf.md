# Verifica dei PDF stampabili

Edizione verificata il 2026-11-23. Le misure confrontano i PDF distribuiti con i record editoriali e le relative figure.

| PDF | Pagine A4 | Piè di pagina e numero | Testatine interne | Pagine dell’indice | Esempi o quesiti rintracciati | Chiavi stampate | Impronta corrente |
|---|---:|---:|---:|---:|---:|---:|---|
| C1-dispensa.pdf | 25/25 | 25/25 | 24/24 | 11/11 | 23/23 | — | sì |
| C1-esercizi.pdf | 54/54 | 54/54 | 53/53 | 6/6 | 100/100 | 100 | sì |
| C2-dispensa.pdf | 22/22 | 22/22 | 21/21 | 11/11 | 21/21 | — | sì |
| C2-esercizi.pdf | 48/48 | 48/48 | 47/47 | 6/6 | 100/100 | 100 | sì |
| C3-dispensa.pdf | 23/23 | 23/23 | 22/22 | 11/11 | 23/23 | — | sì |
| C3-esercizi.pdf | 51/51 | 51/51 | 50/50 | 20/20 | 100/100 | 100 | sì |
| C4-dispensa.pdf | 21/21 | 21/21 | 20/20 | 11/11 | 21/21 | — | sì |
| C4-esercizi.pdf | 61/61 | 61/61 | 60/60 | 20/20 | 100/100 | 100 | sì |
| C5-dispensa.pdf | 24/24 | 24/24 | 23/23 | 11/11 | 22/22 | — | sì |
| C5-esercizi.pdf | 44/44 | 44/44 | 43/43 | 20/20 | 100/100 | 100 | sì |
| C6-dispensa.pdf | 8/8 | 8/8 | 7/7 | 6/6 | 7/7 | — | sì |
| C6-esercizi.pdf | 8/8 | 8/8 | 7/7 | 14/14 | 13/13 | 13 | sì |
| C6-simulazioni.pdf | 41/41 | 41/41 | 40/40 | 6/6 | 93/93 | 93 | sì |

## Riscontri

Tutti i controlli automatici previsti sono superati.

## Metodo

Poppler misura il formato e gli ingombri del testo su ogni pagina. Il controllo confronta testatina, piè di pagina e numero progressivo con i valori attesi. Cerca Work Sans e Baskervville nei file, compreso il corsivo, e verifica l’incorporazione e la mappa Unicode di tutti i caratteri usati. Cerca anche marcatori di errore di composizione e glifi sostitutivi.

Per ciascuna voce dell’indice, pdftohtml estrae separatamente il numero stampato e la pagina di arrivo del collegamento. Il controllo li confronta entrambi con la destinazione della sezione riportata da pdfinfo. Negli eserciziari e nelle simulazioni il confronto si ripete per entrambe le colonne.

Il conteggio dei materiali richiede una copia di ogni identificatore di esempio e due occorrenze di ogni identificatore di quesito, una nella prova e una nelle soluzioni. Sono censiti i titoli delle lezioni e dei laboratori, le chiavi di risposta e l’inizio e la fine delle spiegazioni.

Per 241 quesiti a scelta, il controllo ritrova tutte le alternative sulla pagina dell’enunciato. Per 558 svolgimenti che terminano con un paragrafo di testo, ritrova le ultime parole sulla stessa pagina della chiave.

Le pagine potenzialmente scarne vengono rasterizzate per misurare anche l’inchiostro delle figure. È segnalato un corpo con un’estensione verticale inferiore al 18% dello spazio utile. L’indice iniziale è escluso da questo indicatore. La presenza di quadratini o caratteri di sostituzione nell’estrazione richiede un controllo visivo. Resta distinta la verifica grafica della resa di formule e glifi complessi.

Per ripetere il controllo, installare Poppler ed eseguire il comando seguente dalla cartella del repository. Con `--report` si aggiornano le misure nel verbale. Le osservazioni visive si conservano se i PDF hanno la stessa impronta binaria. Per registrare una nuova ispezione, aggiungere `--note-visive` seguito dal percorso di un file di testo.

    python3 tools/verifica_pdf.py

## Riscontro visivo su pagine rasterizzate

<!-- PDF SHA-256: 9d12d0d9029a8526bc67d04f37c0d907654c9cbbe972040851f328648849447a -->

Nella revisione di C4 sono state aperte le pagine rasterizzate 17, 18 e 20 della dispensa e 51, 52 e 58 dell’eserciziario. A p. 17 il diagramma mostra la velocità tangente e la forza centripeta. Il calcolo di 2,0875 cm e l’arrotondamento a 2,1 cm restano sulla stessa pagina. A p. 20 le cinque righe di calcolo arrivano a 0,20 V per la bobina. A cavallo delle pp. 51 e 52 il reciproco riguarda l’intero microfarad. A p. 58 la normale, la proiezione di B e i passaggi fino a +3,0 mWb risultano leggibili insieme.

Gli altri undici PDF coincidono byte per byte con la base. Le precedenti osservazioni sulle 28 pagine campionate si possono consultare nel verbale datato, incluse copertine, schema dei fluidi in scala di grigi e fascicolo delle tre simulazioni. [Verbale dell’edizione precedente](https://github.com/AndreaMarro/ardesia/blob/250673b6878c33e52ad0e705d8629425ae668fd7/officina-di-fisica/docs/verifica-pdf.md)

Il collaudo è stato eseguito sull’immagine a schermo. La prova su carta resta da svolgere.
