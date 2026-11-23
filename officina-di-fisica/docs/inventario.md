# Inventario editoriale e copertura MUR

Questa fotografia riguarda il manoscritto iniziale distribuito nei file content/*.json. Comprende 991 record con identificatori stabili. C6 riutilizza i cinque microcorsi mediante gli stessi identificatori e aggiunge materiali propri. I conteggi seguono il modulo di origine. Ogni record è contato una sola volta.

Fonti ministeriali consultate il 21 novembre 2026 per l’anno accademico 2026/27. I collegamenti ai documenti archiviati sono sotto la matrice.

## Banca pubblicata

| Origine | Lezioni | Esempi guidati | Famiglie di esempi | Quesiti di studio | Quesiti di simulazione | Famiglie di quesiti | Scelta / numerica / completamento | Tavole SVG distinte usate | Quesiti con figura nella consegna | Laboratori guidati | Banchi 3D | Simulazioni di lezione | Attività di metodo |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|
| C1 · Strumenti e Meccanica | 10 | 23 | 23 | 100 | 0 | 100 | 37 / 51 / 12 | 50 | 6 | 1 | 2 | 42 | 2 |
| C2 · Fluidi | 10 | 21 | 21 | 100 | 0 | 100 | 38 / 52 / 10 | 23 | 12 | 1 | 2 | 41 | 2 |
| C3 · Termodinamica | 10 | 23 | 23 | 100 | 0 | 100 | 33 / 46 / 21 | 28 | 14 | 1 | 2 | 36 | 2 |
| C4 · Elettricità e Magnetismo | 10 | 21 | 21 | 100 | 0 | 100 | 31 / 48 / 21 | 36 | 21 | 1 | 2 | 29 | 2 |
| C5 · Onde, Ottica e Radiazioni | 10 | 22 | 22 | 100 | 0 | 100 | 38 / 49 / 13 | 18 | 3 | 1 | 2 | 27 | 2 |
| C6 · Fisica completa | 6 | 7 | 7 | 13 | 93 | 106 | 64 / 12 / 30 | 10 | 6 | 0 | 0 | 6 | 0 |

## Verifiche dei microcorsi

| Modulo | Prima intermedia | Seconda intermedia | Finale | Quesiti con suggerimento e recupero |
|---|---:|---:|---:|---:|
| C1 | 10 | 10 | 20 | 100 |
| C2 | 10 | 10 | 20 | 100 |
| C3 | 10 | 10 | 20 | 100 |
| C4 | 10 | 10 | 20 | 100 |
| C5 | 10 | 10 | 20 | 100 |

Le famiglie sono quelle registrate con un identificatore editoriale. I valori numerici appartengono alla consegna salvata. Ripetere lo stesso quesito mantiene la medesima famiglia. Il conteggio delle figure usa il percorso dell’asset e include le tavole nella consegna e nello svolgimento. Una figura citata in più moduli compare in ciascuna riga interessata. Le ultime colonne distinguono i laboratori guidati, i banchi 3D di approfondimento, le simulazioni delle singole voci e le attività di metodo. [Mappa delle simulazioni di lezione](laboratori-3d/voci.md)

## Matrice del programma

I 38 punti elenco del syllabus MUR sono scomposti in 105 obiettivi osservabili. La numerazione dopo il punto indica la posizione dell’elenco nell’unità ufficiale. Le pagine si riferiscono al PDF ministeriale di cinque pagine. Le sigle C1–C6 identificano i percorsi editoriali di Andrea Marro.

| Unità | Titolo del syllabus | Punti elenco | Obiettivi mappati | Moduli di studio |
|---|---|---:|---:|---|
| UD1 | Introduzione ai metodi della fisica | 4 | 9 | C1 + C6 |
| UD2 | Meccanica | 5 | 24 | C1 + C6 |
| UD3 | Meccanica dei fluidi | 5 | 16 | C2 + C6 |
| UD4 | Onde meccaniche | 5 | 9 | C5 + C6 |
| UD5 | Termodinamica | 5 | 16 | C3 + C6 |
| UD6 | Elettricità e magnetismo | 7 | 21 | C4 + C6 |
| UD7 | Fisica delle radiazioni | 7 | 10 | C5 + C6 |

La matrice indica esempi guidati, soluzioni utilizzabili come esempi supplementari e verifiche mirate per ogni obiettivo. Per verificare un singolo punto si possono aprire nel banco i quesiti indicati. Le colonne delle due intermedie e della finale contengono l’intersezione fra i quesiti pertinenti selezionati e quelli effettivamente usati dal motore. Una cella vuota indica che quella prova non campiona direttamente i quesiti elencati per il punto. Le simulazioni C6 hanno fascicoli fissi. I riferimenti alle simulazioni indicano la prova e la traccia che affronta il punto. Per ritrovare le tracce complete usa gli identificatori nell’inventario dei record.

- [Matrice di copertura](inventario-copertura.csv)
- [Inventario dei singoli record](inventario-record.csv)
- [Syllabus MUR, Fisica 2026/27](sources/MUR-syllabus-fisica-2026.pdf)
- [Regole ministeriali delle prove, allegato 2 al DM 941/2026](sources/MUR-DM941-allegato2.pdf)

## Stato e manutenzione

I contenuti iniziali sono stati redatti con assistenza di modelli. La revisione scientifica ed editoriale assistita ha controllato testi, ipotesi e soluzioni. La verifica automatica controlla struttura e riferimenti. I controlli numerici rieseguono i calcoli previsti dai rispettivi script. Lo stato pubblicato indica la visibilità nel catalogo. La revisione umana e la misurazione di efficacia con studenti reali restano distinte da queste verifiche.

Per riprodurre gli elenchi dell’edizione distribuita eseguire dalla cartella del repository

    python3 tools/inventario.py

Per fotografare l’edizione aggiornata dopo pubblicazioni nell’area autore si può leggere il catalogo SQLite in sola lettura e scegliere dove salvare i tre file.

    python3 tools/inventario.py --database /percorso/officina.sqlite3 --out /cartella/inventario

L’impronta SHA-256 di ogni record consente il confronto tra esportazioni. La tabella MAP dello script contiene le corrispondenze curate. Dopo una modifica sostanziale o l’aggiunta di materiali, rivedere le associazioni con i punti MUR prima di distribuire la nuova matrice. I nuovi record compaiono subito nell’inventario.

## Riferimenti da ricontrollare

- Versione successiva al manoscritto mappato · C1-E005, C1-E014, C1-E017, C1-L001, C1-L004, C1-L006, C1-Q002, C1-Q006, C1-Q007, C1-Q008, C1-Q013, C1-Q023, C1-Q027, C1-Q034, C1-Q039, C1-Q044, C1-Q051, C1-Q056, C1-Q064, C1-Q067, C1-Q077, C1-Q078, C1-Q080, C1-Q083, C1-Q085, C1-Q094, C1-Q095, C4-E017, C4-E019, C4-Q001, C4-Q003, C4-Q004, C4-Q010, C4-Q011, C4-Q014, C4-Q016, C4-Q024, C4-Q026, C4-Q028, C4-Q029, C4-Q031, C4-Q035, C4-Q039, C4-Q044, C4-Q049, C4-Q052, C4-Q061, C4-Q064, C4-Q065, C4-Q074, C4-Q081, C4-Q091, C4-Q099, C5-E007, C5-L04, C5-Q003, C5-Q038, C5-Q039, C5-Q041, C5-Q052, C5-Q084, C5-Q096
