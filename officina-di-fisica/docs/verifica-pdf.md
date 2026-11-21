# Verifica dei PDF stampabili

Edizione verificata il 21 novembre 2026. Le misure confrontano i PDF distribuiti con i record editoriali e le relative figure.

| PDF | Pagine A4 | Piè di pagina e numero | Testatine interne | Pagine dell’indice | Esempi o quesiti rintracciati | Chiavi stampate | Impronta corrente |
|---|---:|---:|---:|---:|---:|---:|---|
| C1-dispensa.pdf | 25/25 | 25/25 | 24/24 | 11/11 | 23/23 | — | sì |
| C1-esercizi.pdf | 42/42 | 42/42 | 41/41 | 6/6 | 100/100 | 100 | sì |
| C2-dispensa.pdf | 22/22 | 22/22 | 21/21 | 11/11 | 21/21 | — | sì |
| C2-esercizi.pdf | 47/47 | 47/47 | 46/46 | 6/6 | 100/100 | 100 | sì |
| C3-dispensa.pdf | 23/23 | 23/23 | 22/22 | 11/11 | 23/23 | — | sì |
| C3-esercizi.pdf | 50/50 | 50/50 | 49/49 | 20/20 | 100/100 | 100 | sì |
| C4-dispensa.pdf | 21/21 | 21/21 | 20/20 | 11/11 | 21/21 | — | sì |
| C4-esercizi.pdf | 57/57 | 57/57 | 56/56 | 20/20 | 100/100 | 100 | sì |
| C5-dispensa.pdf | 24/24 | 24/24 | 23/23 | 11/11 | 22/22 | — | sì |
| C5-esercizi.pdf | 43/43 | 43/43 | 42/42 | 20/20 | 100/100 | 100 | sì |
| C6-dispensa.pdf | 8/8 | 8/8 | 7/7 | 6/6 | 7/7 | — | sì |
| C6-esercizi.pdf | 8/8 | 8/8 | 7/7 | 14/14 | 13/13 | 13 | sì |
| C6-simulazioni.pdf | 41/41 | 41/41 | 40/40 | 6/6 | 93/93 | 93 | sì |

## Riscontri

Tutti i controlli automatici previsti sono superati.

## Metodo

Poppler misura il formato e gli ingombri del testo su ogni pagina. Il controllo confronta testatina, piè di pagina e numero progressivo con i valori attesi. Cerca Work Sans e Baskervville nei file, compreso il corsivo, e verifica l’incorporazione e la mappa Unicode di tutti i caratteri usati. Cerca anche marcatori di errore di composizione e glifi sostitutivi.

Per ciascuna voce dell’indice, pdftohtml estrae separatamente il numero stampato e la pagina di arrivo del collegamento. Il controllo li confronta entrambi con la destinazione della sezione riportata da pdfinfo. Negli eserciziari e nelle simulazioni il confronto si ripete per entrambe le colonne.

Il conteggio dei materiali richiede una copia di ogni identificatore di esempio e due occorrenze di ogni identificatore di quesito, una nella prova e una nelle soluzioni. Sono censiti i titoli delle lezioni e dei laboratori, le chiavi di risposta e l’inizio e la fine delle spiegazioni.

Per 241 quesiti a scelta, il controllo ritrova tutte le alternative sulla pagina dell’enunciato. Per 565 svolgimenti che terminano con un paragrafo di testo, ritrova le ultime parole sulla stessa pagina della chiave.

Le pagine potenzialmente scarne vengono rasterizzate per misurare anche l’inchiostro delle figure. È segnalato un corpo con un’estensione verticale inferiore al 18% dello spazio utile. L’indice iniziale è escluso da questo indicatore. La presenza di quadratini o caratteri di sostituzione nell’estrazione richiede un controllo visivo. Resta distinta la verifica grafica della resa di formule e glifi complessi.

Per ripetere il controllo, installare Poppler ed eseguire il comando seguente dalla cartella del repository. Con `--report` si aggiornano le misure nel verbale. Le osservazioni visive si conservano se i PDF hanno la stessa impronta binaria. Per registrare una nuova ispezione, aggiungere `--note-visive` seguito dal percorso di un file di testo.

    python3 tools/verifica_pdf.py

## Riscontro visivo su pagine rasterizzate

<!-- PDF SHA-256: a3794d0c82cad22e7850798e9514604f7a144e34690fa3309284b0c9b976e4a6 -->

L’ispezione a schermo ha riguardato 28 pagine distinte, rasterizzate a 90 o 96 dpi. Sulla prima pagina di tutti i 13 fascicoli sono stati controllati il pittogramma dell’Officina, il titolo, il codice del corso, l’allineamento dei rimandi e l’inizio del contenuto. Negli eserciziari si distinguono le colonne che portano ai quesiti e agli svolgimenti.

| Corso | Dispensa | Esercizi e soluzioni |
|---|---|---|
| C1 | p. 12, diagramma delle forze sul blocco e sulla bilancia | p. 37, segno dell’impulso nel rimbalzo |
| C2 | p. 16, confronto fra i raggi e rapporto fra le portate | p. 40, errore di fattore 16 e calcolo della caduta di pressione |
| C3 | p. 18, ciclo rettangolare e bilancio del lavoro | p. 45, area del ciclo e intervallo di volume |
| C4 | p. 12, nodi dei resistori e sezione di un condensatore | p. 55, flusso magnetico e circuito interrotto |
| C5 | p. 22, immagine virtuale e costruzione dell’immagine reale | p. 43, identificazione della lente dai raggi |
| C6 | p. 2, ritardo del segnale e galleggiante spostato dall’equilibrio | p. 8, trasferimento fra potenza, energia e portata |

Nel fascicolo delle simulazioni sono state osservate anche le pp. 13, 15 e 36. I dieci completamenti della seconda prova hanno spazio per scrivere nel punto della frase in cui entra la risposta. Nella terza prova il percorso fra due specchi, la didascalia e le cinque alternative sono sulla stessa pagina. Nelle soluzioni restano riconoscibili numero, identificatore, ragionamento e chiave.

La p. 16 della dispensa di Fluidi è stata osservata anche in scala di grigi. Le due sezioni, le frecce di raggio, le etichette e l’esponente quattro restano distinguibili. La verifica della resa su carta fisica richiede una stampa.
