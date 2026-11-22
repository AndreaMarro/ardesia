const sin = (degrees) => Math.sin((degrees * Math.PI) / 180);

export const experiments = {
  // Oscillatore armonico come sorgente
  'SIM-C5-L01-01': {
    measure: (x) => 4 * Math.cos(Math.PI * x),
    apparatus: (x, y) => ({ pos: y / 4 }),
  },
  // Ampiezza, periodo, frequenza e pulsazione
  'SIM-C5-L01-02': {
    measure: (x) => 1 / x,
    apparatus: (x, y) => ({ pos: Math.cos((2 * Math.PI * 0.5) / x), periodo: x }),
  },
  // Perturbazione, energia e mezzo materiale
  'SIM-C5-L02-01': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ impulso: y / 6 }),
  },
  // Velocità, frequenza e lunghezza d’onda
  'SIM-C5-L02-02': {
    measure: (x) => 6 / x,
    apparatus: (x, y) => ({ cicli: x, ampiezza: 0.55 }),
  },
  // Equazione armonica di propagazione
  'SIM-C5-L02-03': {
    measure: (x) => 3 * Math.sin(2 * Math.PI * x),
    apparatus: (x, y) => ({ cicli: 2, fase: 2 * Math.PI * x, ampiezza: 0.7, sonda: true }),
  },
  // Onde trasversali su corda e longitudinali nei fluidi
  'SIM-C5-L02-04': {
    measure: (x) => 2 * sin(x),
    apparatus: (x, y) => ({ confronto: true, fase: (x * Math.PI) / 180, cicli: 2 }),
  },
  // Principio di sovrapposizione
  'SIM-C5-L03-01': {
    measure: (x) => 2 + x,
    apparatus: (x, y) => ({ somma: x / 3 }),
  },
  // Interferenza costruttiva e distruttiva
  'SIM-C5-L03-02': {
    measure: (x) => 4 * Math.abs(Math.cos(Math.PI * x)),
    apparatus: (x, y) => ({ differenza: x }),
  },
  // Energia e potenza di un’onda meccanica in un mezzo elastico
  'SIM-C5-L04-01': {
    measure: (x) => x * x,
    apparatus: (x, y) => ({ ampiezza: 0.28 * x, cicli: 2 }),
  },
  // Intensità come energia per area e tempo
  'SIM-C5-L04-02': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ area: x / 5, distanza: 0.7 }),
  },
  // Legge dell’inverso del quadrato della distanza
  'SIM-C5-L04-03': {
    measure: (x) => 1 / x ** 2,
    apparatus: (x, y) => ({ distanza: x / 5 }),
  },
  // Velocità del suono nei mezzi
  'SIM-C5-L05-01': {
    measure: (x) => 150000 / [340, 1500, 5000][x - 1],
    apparatus: (x, y) => ({ velocita: [0.068, 0.3, 1][x - 1], mezzo: x }),
  },
  // Intensità, percezione e livello sonoro in decibel
  'SIM-C5-L05-02': {
    measure: (x) => 10 * x,
    apparatus: (x, y) => ({ distanza: 0.7, livello: x / 8 }),
  },
  // Effetto Doppler qualitativo
  'SIM-C5-L05-03': {
    measure: (x) => 90000 / (300 - x),
    apparatus: (x, y) => ({ moto: x / 300 }),
  },
  // Onde elettromagnetiche e campi ortogonali
  'SIM-C5-L06-01': {
    measure: (x) => 10 * sin(x),
    apparatus: (x, y) => ({ fase: (x * Math.PI) / 180, ampiezza: 0.7 }),
  },
  // Velocità, frequenza, lunghezza d’onda, ampiezza e intensità
  'SIM-C5-L06-02': {
    measure: (x) => (x / 2) ** 2,
    apparatus: (x, y) => ({ ampiezza: x / 7, fase: 0.8 }),
  },
  // Spettro: radio, microonde, infrarosso, visibile, UV, X e gamma
  'SIM-C5-L06-03': {
    measure: (x) => [2, -2, -5, -6.3, -7.3, -10, -12][x - 1],
    apparatus: (x, y) => ({ banda: x, ampiezza: 0.55 }),
  },
  // Quantizzazione dell’energia e relazione di Planck
  'SIM-C5-L07-01': {
    measure: (x) => 0.004136 * x,
    apparatus: (x, y) => ({ cicli: x / 250, ampiezza: 0.55 }),
  },
  // Assorbimento e legge di Lambert–Beer
  'SIM-C5-L07-02': {
    measure: (x) => 100 * 0.5 ** x,
    apparatus: (x, y) => ({ spessore: x / 5, trasmessa: y / 100 }),
  },
  // Distinzione fra radiazioni ionizzanti e non ionizzanti
  'SIM-C5-L07-03': {
    measure: (x) => Math.max(0, x - 14),
    apparatus: (x, y) => ({ energia: x / 25, uscita: y / 11, ionizzato: x >= 14 }),
  },
  // Nucleo instabile, nuclidi e isotopi radioattivi
  'SIM-C5-L08-01': {
    measure: (x) => 6 + x,
    apparatus: (x, y) => ({ protoni: 6, neutroni: x }),
  },
  // Attività, legge di decadimento e tempo di dimezzamento
  'SIM-C5-L08-02': {
    measure: (x) => 64 * 0.5 ** x,
    apparatus: (x, y) => ({ rimasti: y }),
  },
  // Decadimenti α, β e transizioni γ
  'SIM-C5-L08-03': {
    measure: (x) => [-2, 1, 0][x - 1],
    apparatus: (x, y) => ({ transizione: x }),
  },
  // Legge della riflessione
  'SIM-C5-L09-01': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ angolo: x, riflesso: true }),
  },
  // Indice di rifrazione e legge di Snell
  'SIM-C5-L09-02': {
    measure: (x) => (Math.asin(sin(x) / 1.5) * 180) / Math.PI,
    apparatus: (x, y) => ({ angolo: x, rifratto: y }),
  },
  // Lenti sottili convergenti
  'SIM-C5-L10-01': {
    measure: (x) => 100 / x,
    apparatus: (x, y) => ({ lente: true, fuoco: x / 20 }),
  },
  // Legge dei punti coniugati e formazione di immagini
  'SIM-C5-L10-02': {
    measure: (x) => 10 - 100 / x,
    apparatus: (x, y) => ({ lente: true, oggetto: x, vergenza: y }),
  },
};
