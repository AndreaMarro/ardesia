export const experiments = {
  // Sistema e ambiente
  'SIM-C3-L01-01': {
    observe: "Segui la faccia interna del pistone. Il volume aggiunto è l’area della sezione moltiplicata per lo spostamento.",
    measure: (x) => 20 + 10 * x,
    apparatus: (x, y) => ({ volume: y / 100 }),
  },
  // Stato termodinamico e variabili p, V, T
  'SIM-C3-L01-02': {
    observe: "Scalda il gas a volume fisso. Osserva che il pistone resta fermo e confronta pressione e temperatura assoluta.",
    measure: (x) => 0.4 * x,
    apparatus: (x, y) => ({ volume: 0.62, pressione: y / 160, temperatura: x / 500 }),
  },
  // Funzioni di stato
  'SIM-C3-L01-03': {
    observe: "Scegli due volumi finali dello stesso gas alla stessa temperatura. Controlla quale pressione appartiene a ciascuno stato.",
    measure: (x) => 120 / x,
    apparatus: (x, y) => ({ volume: x / 5, pressione: y / 90 }),
  },
  // Temperatura e scale
  'SIM-C3-L01-04': {
    observe: "Leggi la medesima colonna sulle due scale. Un aumento di 10 °C corrisponde a 10 K anche se gli zeri sono diversi.",
    measure: (x) => x + 273.15,
    apparatus: (x, y) => ({ livello: (x + 50) / 150 }),
  },
  // Gas perfetti
  'SIM-C3-L02-01': {
    observe: "Dimezza lo spazio sotto il pistone durante un’isoterma. Confronta pressione e prodotto pV nelle due configurazioni.",
    measure: (x) => 240 / x,
    apparatus: (x, y) => ({ volume: x / 8, pressione: y / 160 }),
  },
  // Equazione di stato e variabili assolute
  'SIM-C3-L02-02': {
    observe: "A volume fisso aumenta la pressione. Risali alla temperatura in kelvin e verifica se il rapporto fra le due grandezze resta costante.",
    measure: (x) => 2.5 * x,
    apparatus: (x, y) => ({ volume: 0.62, pressione: x / 150, temperatura: y / 500 }),
  },
  // Calore e scambio di energia
  'SIM-C3-L03-01': {
    observe: "Leggi la variazione di temperatura del campione. Conta quanti joule servono per ogni kelvin di aumento.",
    measure: (x) => 50 * x,
    apparatus: (x, y) => ({ caldo: x / 12 }),
  },
  // Capacità termica e calore specifico
  'SIM-C3-L03-02': {
    observe: "Confronta due masse dello stesso materiale. Per ciascuna determina il calore necessario a un identico aumento di temperatura.",
    measure: (x) => 0.4 * x,
    apparatus: (x, y) => ({ massa: x / 300, caldo: 0.5 }),
  },
  // Capacità termiche dei gas ideali
  'SIM-C3-L03-03': {
    observe: "Per una stessa variazione di temperatura confronta riscaldamento a pressione e a volume costanti. Nel primo il gas compie lavoro di espansione.",
    measure: (x) => 8.314 * x,
    apparatus: (x, y) => ({ volume: 0.5 + x / 50, pressione: 0.7, temperatura: 0.4 + x / 40 }),
  },
  // Calorimetria
  'SIM-C3-L03-04': {
    observe: "Unisci il campione caldo all’acqua fredda. Controlla che la temperatura finale sia compresa fra le iniziali e si avvicini a quella della massa maggiore.",
    measure: (x) => (80 * x + 4000) / (x + 200),
    apparatus: (x, y) => ({ massa: x / 300, caldo: (y - 20) / 60, miscela: true }),
  },
  // Fusione
  'SIM-C3-L04-01': {
    observe: "Fornisci energia durante la fusione. Osserva la quantità di ghiaccio e di acqua liquida mentre il termometro resta a zero gradi.",
    measure: (x) => (1000 * x) / 334,
    apparatus: (x, y) => ({ liquido: y / 100 }),
  },
  // Evaporazione e condensazione
  'SIM-C3-L04-02': {
    observe: "Assegna il segno alla massa che passa da liquido a vapore o viceversa. Leggi se il campione assorbe o cede calore.",
    measure: (x) => 2.26 * x,
    apparatus: (x, y) => ({ liquido: (5 - x) / 10, vapore: true }),
  },
  // Calore latente e bilanci a tratti
  'SIM-C3-L04-03': {
    observe: "Segui prima il riscaldamento del ghiaccio, poi la fusione. Individua il tratto in cui aumenta la massa fusa a temperatura costante.",
    measure: (x) => Math.min(100, Math.max(0, ((x - 2) * 1000) / 340)),
    apparatus: (x, y) => ({ liquido: y / 100, energia: x }),
  },
  // Conduzione
  'SIM-C3-L05-01': {
    observe: "Mantieni le due estremità alle stesse temperature e allunga la barra. Confronta il gradiente e la potenza che la attraversa.",
    measure: (x) => 20 / x,
    apparatus: (x, y) => ({ lunghezza: x / 8, flusso: y / 20 }),
  },
  // Convezione
  'SIM-C3-L05-02': {
    observe: "Segui il liquido caldo e il ritorno freddo. A differenza di temperatura costante, più massa trasportata al secondo trasferisce più energia.",
    measure: (x) => 42 * x,
    apparatus: (x, y) => ({ portata: x / 5 }),
  },
  // Irraggiamento
  'SIM-C3-L05-03': {
    observe: "Pareggia la temperatura della superficie con quella dell’ambiente. Verifica dove si annulla il flusso netto e in quale verso riprende.",
    measure: (x) => 5.67e-8 * (x ** 4 - 300 ** 4),
    apparatus: (x, y) => ({ flusso: y / 2200, temperatura: x / 500 }),
  },
  // Primo principio
  'SIM-C3-L06-01': {
    observe: "Per ogni prova annota calore entrante e lavoro compiuto dal gas. La loro differenza cambia l’energia interna.",
    measure: (x) => x - 10,
    apparatus: (x, y) => ({ volume: 0.7, temperatura: (y + 40) / 100, lavoro: 0.6 }),
  },
  // Energia interna
  'SIM-C3-L06-02': {
    observe: "Mantieni fermo il pistone. Leggi di quanto varia l’energia interna quando cambia la temperatura del gas.",
    measure: (x) => 12 * x,
    apparatus: (x, y) => ({ volume: 0.6, temperatura: (x + 25) / 60 }),
  },
  // Calore e lavoro
  'SIM-C3-L06-03': {
    observe: "Scegli un lavoro di espansione e uno di compressione. Verifica quanto calore serve per ottenere lo stesso aumento di energia interna.",
    measure: (x) => 10 + x,
    apparatus: (x, y) => ({ volume: 0.55 + x / 90, lavoro: x / 30 }),
  },
  // Interpretazione del lavoro su un diagramma p–V
  'SIM-C3-L06-04': {
    observe: "Segui sul piano p–V la larghezza con segno di un tratto isobaro. L’area conta il lavoro compiuto dal gas.",
    measure: (x) => 100 * x,
    apparatus: (x, y) => ({ rettangolo: false, ampiezza: x, pressione: 1 }),
  },
  // Trasformazioni reversibili e irreversibili
  'SIM-C3-L07-01': {
    observe: "Dividi la stessa espansione in più intervalli. Somma i rettangoli e confronta la somma con l’area sotto l’isoterma limite.",
    measure: (x) =>
      Array.from({ length: x }, (_, i) => 100 / (1 + (i + 1) / x) / x).reduce((a, b) => a + b, 0),
    apparatus: (x, y) => ({ gradini: x }),
  },
  // Isoterma
  'SIM-C3-L07-02': {
    observe: "Segui due posizioni del pistone alla stessa temperatura. Calcola pressione per volume in ciascuna configurazione.",
    measure: (x) => 100 / x,
    apparatus: (x, y) => ({ volume: x / 4, pressione: y / 100 }),
  },
  // Isocora
  'SIM-C3-L07-03': {
    observe: "Confronta la posizione del pistone prima e dopo il riscaldamento. Il volume è fissato mentre la pressione segue la temperatura assoluta.",
    measure: (x) => 0.5 * x,
    apparatus: (x, y) => ({ volume: 0.6, pressione: y / 200, temperatura: x / 500 }),
  },
  // Isobara
  'SIM-C3-L07-04': {
    observe: "Mantieni la pressione uguale e scalda il gas. Confronta i rapporti fra i volumi e fra le temperature in kelvin.",
    measure: (x) => x / 100,
    apparatus: (x, y) => ({ volume: y / 5, pressione: 0.7, temperatura: x / 500 }),
  },
  // Adiabatica e confronto qualitativo
  'SIM-C3-L07-05': {
    observe: "Confronta due espansioni fino allo stesso volume. Nella trasformazione adiabatica il gas si raffredda e la pressione scende più che nell’isoterma.",
    measure: (x) => 100 / x ** 1.5,
    apparatus: (x, y) => ({ volume: x / 4, pressione: y / 100, temperatura: 1 / Math.sqrt(x) }),
  },
  // Ciclo termodinamico
  'SIM-C3-L08-01': {
    observe: "Segui il contorno chiuso nel piano p–V. Allarga il ciclo e misura come cambia l’area racchiusa a parità di altezza.",
    measure: (x) => 60 * x,
    apparatus: (x, y) => ({ ampiezza: x, pressione: 0.6 }),
  },
  // Bilancio energetico di un ciclo
  'SIM-C3-L08-02': {
    observe: "Dopo un giro il sistema torna allo stato iniziale. Confronta il lavoro prodotto con il calore assorbito meno quello ceduto.",
    measure: (x) => 100 - x,
    apparatus: (x, y) => ({ caldo: 1, freddo: x / 100, lavoro: y / 100 }),
  },
  // Funzionamento ciclico
  'SIM-C3-L08-03': {
    observe: "Ripeti lo stesso giro e conta i cicli. Ogni ritorno allo stato iniziale aggiunge la stessa quantità al lavoro totale.",
    measure: (x) => 20 * x,
    apparatus: (x, y) => ({ ampiezza: 1, pressione: 0.6, giri: x }),
  },
  // Secondo principio, enunciati di Kelvin–Planck e Clausius
  'SIM-C3-L09-01': {
    observe: "Segui il calore sottratto alla sorgente fredda e quello ceduto alla calda. La differenza viene fornita come lavoro al frigorifero.",
    measure: (x) => 1.5 * x,
    apparatus: (x, y) => ({ caldo: (1.5 * x) / 100, freddo: x / 100, lavoro: (0.5 * x) / 100, frigo: true }),
  },
  // Macchine termiche
  'SIM-C3-L09-02': {
    observe: "Suddividi il calore ricevuto tra lavoro utile e calore ceduto. Controlla la somma con l’energia in ingresso.",
    measure: (x) => 0.3 * x,
    apparatus: (x, y) => ({ caldo: x / 200, freddo: (0.7 * x) / 200, lavoro: y / 200 }),
  },
  // Rendimento
  'SIM-C3-L09-03': {
    observe: "Tieni fissi i 100 J forniti. Per ogni valore di lavoro utile leggi quale parte esce come calore.",
    measure: (x) => x,
    apparatus: (x, y) => ({ caldo: 1, freddo: 1 - x / 100, lavoro: x / 100 }),
  },
  // Ciclo di Carnot
  'SIM-C3-L09-04': {
    observe: "Avvicina la temperatura fredda a quella calda. Segui la chiusura del ciclo e il rendimento limite quando le temperature coincidono.",
    measure: (x) => 100 * (1 - x / 500),
    apparatus: (x, y) => ({ caldo: 1, freddo: x / 500, lavoro: y / 100 }),
  },
  // Entropia funzione di stato
  'SIM-C3-L10-01': {
    observe: "Inverti il segno del calore reversibile a temperatura fissata. Controlla il segno dell’entropia per il sistema che riceve o cede calore.",
    measure: (x) => x / 300,
    apparatus: (x, y) => ({ caldo: Math.abs(x) / 60, freddo: Math.abs(x) / 60, lavoro: 0, scambio: x }),
  },
  // Implicazioni macroscopiche
  'SIM-C3-L10-02': {
    observe: "Segui la stessa energia dal serbatoio a 600 K a quello a 300 K. Confronta la perdita di entropia del primo con il guadagno del secondo.",
    measure: (x) => x / 600,
    apparatus: (x, y) => ({ flusso: x / 120, temperatura: 1 }),
  },
  // Interpretazione statistica
  'SIM-C3-L10-03': {
    observe: "Identifica le quattro particelle dai colori. Conta in quanti modi due possono trovarsi a sinistra, poi ripeti con tutte e quattro a sinistra.",
    measure: (x) => [1, 4, 6, 4, 1][x],
    apparatus: (x, y) => ({ sinistra: x }),
  },
  // Direzione naturale dei processi
  'SIM-C3-L10-04': {
    observe: "Inverti il verso ipotizzato dello scambio. Verifica dal segno dell’entropia totale quale verso è spontaneo per i due serbatoi isolati.",
    measure: (x) => x / 600,
    apparatus: (x, y) => ({ flusso: x / 60, temperatura: 1 }),
  },
};
