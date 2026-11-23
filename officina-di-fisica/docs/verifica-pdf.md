# Verifica dei PDF stampabili

Edizione verificata il 2026-11-23. Le misure confrontano i PDF distribuiti con i record editoriali e le relative figure.

| PDF | Pagine A4 | Piè di pagina e numero | Testatine interne | Pagine dell’indice | Esempi o quesiti rintracciati | Chiavi stampate | Impronta corrente |
|---|---:|---:|---:|---:|---:|---:|---|
| C1-dispensa.pdf | 26/26 | 26/26 | 25/25 | 11/11 | 23/23 | — | sì |
| C1-esercizi.pdf | 56/56 | 56/56 | 55/55 | 6/6 | 100/100 | 100 | sì |
| C2-dispensa.pdf | 22/22 | 22/22 | 21/21 | 11/11 | 21/21 | — | sì |
| C2-esercizi.pdf | 48/48 | 48/48 | 47/47 | 6/6 | 100/100 | 100 | sì |
| C3-dispensa.pdf | 23/23 | 23/23 | 22/22 | 11/11 | 23/23 | — | sì |
| C3-esercizi.pdf | 51/51 | 51/51 | 50/50 | 20/20 | 100/100 | 100 | sì |
| C4-dispensa.pdf | 21/21 | 21/21 | 20/20 | 11/11 | 21/21 | — | sì |
| C4-esercizi.pdf | 61/61 | 61/61 | 60/60 | 20/20 | 100/100 | 100 | sì |
| C5-dispensa.pdf | 24/24 | 24/24 | 23/23 | 11/11 | 22/22 | — | sì |
| C5-esercizi.pdf | 46/46 | 46/46 | 45/45 | 20/20 | 100/100 | 100 | sì |
| C6-dispensa.pdf | 8/8 | 8/8 | 7/7 | 6/6 | 7/7 | — | sì |
| C6-esercizi.pdf | 8/8 | 8/8 | 7/7 | 14/14 | 13/13 | 13 | sì |
| C6-simulazioni.pdf | 41/41 | 41/41 | 40/40 | 6/6 | 93/93 | 93 | sì |

## Riscontri

Tutti i controlli automatici previsti sono superati.

## Metodo

Poppler misura il formato e gli ingombri del testo su ogni pagina. Il controllo confronta testatina, piè di pagina e numero progressivo con i valori attesi. Cerca Work Sans e Baskervville nei file, compreso il corsivo, e verifica l’incorporazione e la mappa Unicode di tutti i caratteri usati. Cerca anche marcatori di errore di composizione e glifi sostitutivi.

Per ciascuna voce dell’indice, pdftohtml estrae separatamente il numero stampato e la pagina di arrivo del collegamento. Il controllo li confronta entrambi con la destinazione della sezione riportata da pdfinfo. Negli eserciziari e nelle simulazioni il confronto si ripete per entrambe le colonne.

Il conteggio dei materiali richiede una copia di ogni identificatore di esempio e due occorrenze di ogni identificatore di quesito, una nella prova e una nelle soluzioni. Sono censiti i titoli delle lezioni e dei laboratori, le chiavi di risposta e l’inizio e la fine delle spiegazioni.

Per 241 quesiti a scelta, il controllo ritrova tutte le alternative sulla pagina dell’enunciato. Per 561 svolgimenti che terminano con un paragrafo di testo, ritrova le ultime parole sulla stessa pagina della chiave.

Le pagine potenzialmente scarne vengono rasterizzate per misurare anche l’inchiostro delle figure. È segnalato un corpo con un’estensione verticale inferiore al 18% dello spazio utile. L’indice iniziale è escluso da questo indicatore. La presenza di quadratini o caratteri di sostituzione nell’estrazione richiede un controllo visivo. Resta distinta la verifica grafica della resa di formule e glifi complessi.

Per ripetere il controllo, installare Poppler ed eseguire il comando seguente dalla cartella del repository. Con `--report` si aggiornano le misure nel verbale. Le osservazioni visive si conservano se i PDF hanno la stessa impronta binaria. Per registrare una nuova ispezione, aggiungere `--note-visive` seguito dal percorso di un file di testo.

    python3 tools/verifica_pdf.py

## Riscontro visivo su pagine rasterizzate

<!-- PDF SHA-256: 8737c735c2b37fe09aa1653c10e906302eaeb5b09246eac7d72fd327703c3ccc -->

Sulla nuova dispensa C1, pagina 16, la figura della molla e la sua didascalia precedono la legge di gravitazione. Le due frazioni per forza e accelerazione si leggono interamente. Il paragrafo sui gusci sferici esterni è sulla stessa pagina. Sull’eserciziario C1, pagina 48, i lavori di andata e di ritorno, la tavola dei due supporti e la didascalia sono leggibili insieme. Le frecce dell’attrito puntano a sinistra sul piano e a destra sul nastro più veloce. Ispezione delle due pagine rasterizzate con Poppler. I controlli su tutti i 13 fascicoli sono riportati nella tabella. [Riscontri dell’edizione C5 precedente](verifica-prodotto/edizione-c5.md)
