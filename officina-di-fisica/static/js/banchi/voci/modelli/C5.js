const sin = (degrees) => Math.sin((degrees * Math.PI) / 180);

export const experiments = {
  // Oscillatore armonico come sorgente
  'SIM-C5-L01-01': {
    observe: "Segui il blocco dal massimo positivo a quello negativo. Passa per l’equilibrio due volte in un periodo completo.",
    measure: (x) => 4 * Math.cos(Math.PI * x),
    apparatus: (x, y) => ({ pos: y / 4 }),
  },
  // Ampiezza, periodo, frequenza e pulsazione
  'SIM-C5-L01-02': {
    observe: "Mantieni l’ampiezza e raddoppia il periodo. Conta le oscillazioni nello stesso intervallo e confrontale con la frequenza indicata.",
    measure: (x) => 1 / x,
    apparatus: (x, y) => ({ pos: Math.cos((2 * Math.PI * 0.5) / x), periodo: x }),
  },
  // Perturbazione, energia e mezzo materiale
  'SIM-C5-L02-01': {
    observe: "Guarda separatamente la cresta e il punto colorato della corda. La cresta avanza lungo la corda e il punto oscilla trasversalmente.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ impulso: y / 6 }),
  },
  // Velocità, frequenza e lunghezza d’onda
  'SIM-C5-L02-02': {
    observe: "Segui due creste consecutive lungo i 6 m di corda. Cambia la frequenza e verifica che il prodotto frequenza per lunghezza d’onda resti 6 m/s.",
    measure: (x) => 6 / x,
    apparatus: (x, y) => ({ cicli: x, ampiezza: 0.55 }),
  },
  // Equazione armonica di propagazione
  'SIM-C5-L02-03': {
    observe: "Ferma l’onda quando la sonda all’origine è a un massimo e poi a un minimo. Leggi sul grafico i corrispondenti spostamenti con segno.",
    measure: (x) => 3 * Math.sin(2 * Math.PI * x),
    apparatus: (x, y) => ({ cicli: 2, fase: 2 * Math.PI * x, ampiezza: 0.7, sonda: true }),
  },
  // Onde trasversali su corda e longitudinali nei fluidi
  'SIM-C5-L02-04': {
    observe: "Confronta il punto della corda con i punti negli strati di fluido. Distingui la direzione dello spostamento da quella di propagazione.",
    measure: (x) => 2 * sin(x),
    apparatus: (x, y) => ({ confronto: true, fase: (x * Math.PI) / 180, cicli: 2 }),
  },
  // Principio di sovrapposizione
  'SIM-C5-L03-01': {
    observe: "Osserva i due contributi alla stessa sonda. Prima di sommarli assegna a ciascuno il segno rispetto all’equilibrio.",
    measure: (x) => 2 + x,
    apparatus: (x, y) => ({ somma: x / 3 }),
  },
  // Interferenza costruttiva e distruttiva
  'SIM-C5-L03-02': {
    observe: "Confronta cammini che differiscono di mezza onda e di un’onda intera. Segui come cambia l’ampiezza della somma in P.",
    measure: (x) => 4 * Math.abs(Math.cos(Math.PI * x)),
    apparatus: (x, y) => ({ differenza: x }),
  },
  // Energia e potenza di un’onda meccanica in un mezzo elastico
  'SIM-C5-L04-01': {
    observe: "Raddoppia l’ampiezza di oscillazione sulla stessa corda. Confronta la potenza media trasportata mantenendo velocità e frequenza fissate.",
    measure: (x) => x * x,
    apparatus: (x, y) => ({ ampiezza: 0.28 * x, cicli: 2 }),
  },
  // Intensità come energia per area e tempo
  'SIM-C5-L04-02': {
    observe: "Allarga il ricevitore esposto alla stessa intensità. Confronta l’energia che intercetta nello stesso intervallo di due secondi.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ area: x / 5, distanza: 0.7 }),
  },
  // Legge dell’inverso del quadrato della distanza
  'SIM-C5-L04-03': {
    observe: "Allontana la sonda dalla sorgente isotropa. A raggio doppio l’energia si distribuisce su una superficie quattro volte maggiore.",
    measure: (x) => 1 / x ** 2,
    apparatus: (x, y) => ({ distanza: x / 5 }),
  },
  // Velocità del suono nei mezzi
  'SIM-C5-L05-01': {
    observe: "Percorri gli stessi 150 m nei tre mezzi. Confronta i tempi di arrivo con le rispettive velocità di propagazione.",
    measure: (x) => 150000 / [340, 1500, 5000][x - 1],
    apparatus: (x, y) => ({ velocita: [0.068, 0.3, 1][x - 1], mezzo: x }),
  },
  // Intensità, percezione e livello sonoro in decibel
  'SIM-C5-L05-02': {
    observe: "Aumenta di uno l’esponente del rapporto d’intensità. Confronta il fattore moltiplicativo dell’intensità con l’aumento in decibel.",
    measure: (x) => 10 * x,
    apparatus: (x, y) => ({ distanza: 0.7, livello: x / 8 }),
  },
  // Effetto Doppler qualitativo
  'SIM-C5-L05-03': {
    observe: "Segui le creste oltre il ricevitore. Confronta il tempo fra due arrivi quando la sorgente si avvicina e quando si allontana.",
    measure: (x) => 90000 / (300 - x),
    apparatus: (x, y) => ({ moto: x / 300 }),
  },
  // Onde elettromagnetiche e campi ortogonali
  'SIM-C5-L06-01': {
    observe: "Confronta i campi elettrico e magnetico nella stessa sezione. Sono ortogonali e passano insieme per lo zero.",
    measure: (x) => 10 * sin(x),
    apparatus: (x, y) => ({ fase: (x * Math.PI) / 180, ampiezza: 0.7 }),
  },
  // Velocità, frequenza, lunghezza d’onda, ampiezza e intensità
  'SIM-C5-L06-02': {
    observe: "Aumenta l’ampiezza del campo elettrico a frequenza fissata. Osserva l’ampiezza dei campi e il rapporto delle intensità.",
    measure: (x) => (x / 2) ** 2,
    apparatus: (x, y) => ({ ampiezza: x / 7, fase: 0.8 }),
  },
  // Spettro: radio, microonde, infrarosso, visibile, UV, X e gamma
  'SIM-C5-L06-03': {
    observe: "Confronta due bande. Leggi la lunghezza d’onda in metri oltre all’esponente, perché la scala copre molti ordini di grandezza.",
    measure: (x) => [2, -2, -5, -6.3, -7.3, -10, -12][x - 1],
    apparatus: (x, y) => ({ banda: x, ampiezza: 0.55 }),
  },
  // Quantizzazione dell’energia e relazione di Planck
  'SIM-C5-L07-01': {
    observe: "Confronta il numero di cicli nello stesso tratto di vuoto. L’energia calcolata si riferisce a un solo fotone della frequenza scelta.",
    measure: (x) => 0.004136 * x,
    apparatus: (x, y) => ({ cicli: x / 250, ampiezza: 0.55 }),
  },
  // Assorbimento e legge di Lambert–Beer
  'SIM-C5-L07-02': {
    observe: "Aggiungi uno strato emivalente alla volta. Guarda il fascio dopo la lastra e verifica quale frazione dell’intensità precedente rimane.",
    measure: (x) => 100 * 0.5 ** x,
    apparatus: (x, y) => ({ spessore: x / 5, trasmessa: y / 100 }),
  },
  // Distinzione fra radiazioni ionizzanti e non ionizzanti
  'SIM-C5-L07-03': {
    observe: "Porta l’energia del fotone sotto e sopra 14 eV. Distingui l’energia necessaria a liberare l’elettrone da quella che gli rimane.",
    measure: (x) => Math.max(0, x - 14),
    apparatus: (x, y) => ({ energia: x / 25, uscita: y / 11, ionizzato: x >= 14 }),
  },
  // Nucleo instabile, nuclidi e isotopi radioattivi
  'SIM-C5-L08-01': {
    observe: "Conta i sei protoni e varia i neutroni. Individua la grandezza che resta uguale tra isotopi e quella che cambia.",
    measure: (x) => 6 + x,
    apparatus: (x, y) => ({ protoni: 6, neutroni: x }),
  },
  // Attività, legge di decadimento e tempo di dimezzamento
  'SIM-C5-L08-02': {
    observe: "Avanza di un’emivita alla volta. Confronta il conteggio medio rimasto con il precedente, distinguendo una previsione statistica dal destino di un singolo nucleo.",
    measure: (x) => 64 * 0.5 ** x,
    apparatus: (x, y) => ({ rimasti: y }),
  },
  // Decadimenti α, β e transizioni γ
  'SIM-C5-L08-03': {
    observe: "Confronta ciò che lascia il nucleo nelle tre transizioni. Conta separatamente la variazione della carica nucleare e quella del numero di massa.",
    measure: (x) => [-2, 1, 0][x - 1],
    apparatus: (x, y) => ({ transizione: x }),
  },
  // Legge della riflessione
  'SIM-C5-L09-01': {
    observe: "Misura i due angoli rispetto alla normale. L’apertura fra la direzione verso la sorgente e quella riflessa è la loro somma.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ angolo: x, riflesso: true }),
  },
  // Indice di rifrazione e legge di Snell
  'SIM-C5-L09-02': {
    observe: "Segui il raggio dall’aria al vetro. Confronta gli angoli rispetto alla normale e osserva da che parte devia il raggio.",
    measure: (x) => (Math.asin(sin(x) / 1.5) * 180) / Math.PI,
    apparatus: (x, y) => ({ angolo: x, rifratto: y }),
  },
  // Lenti sottili convergenti
  'SIM-C5-L10-01': {
    observe: "Individua dove i raggi inizialmente paralleli si incontrano. Confronta la distanza del fuoco con il potere della lente in diottrie.",
    measure: (x) => 100 / x,
    apparatus: (x, y) => ({ lente: true, fuoco: x / 20 }),
  },
  // Legge dei punti coniugati e formazione di immagini
  'SIM-C5-L10-02': {
    observe: "Muovi l’oggetto attraverso il fuoco. Controlla se si incontrano i raggi emergenti o i loro prolungamenti e osserva il caso dei raggi paralleli.",
    measure: (x) => 10 - 100 / x,
    apparatus: (x, y) => ({ lente: true, oggetto: x, vergenza: y }),
  },
};
