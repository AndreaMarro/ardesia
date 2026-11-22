export const experiments = {
  // Sistema e ambiente
  'SIM-C3-L01-01': {
    measure: (x) => 20 + 10 * x,
    apparatus: (x, y) => ({ volume: y / 100 }),
  },
  // Stato termodinamico e variabili p, V, T
  'SIM-C3-L01-02': {
    measure: (x) => 0.4 * x,
    apparatus: (x, y) => ({ volume: 0.62, pressione: y / 160, temperatura: x / 500 }),
  },
  // Funzioni di stato
  'SIM-C3-L01-03': {
    measure: (x) => 120 / x,
    apparatus: (x, y) => ({ volume: x / 5, pressione: y / 90 }),
  },
  // Temperatura e scale
  'SIM-C3-L01-04': {
    measure: (x) => x + 273.15,
    apparatus: (x, y) => ({ livello: (x + 50) / 150 }),
  },
  // Gas perfetti
  'SIM-C3-L02-01': {
    measure: (x) => 240 / x,
    apparatus: (x, y) => ({ volume: x / 8, pressione: y / 160 }),
  },
  // Equazione di stato e variabili assolute
  'SIM-C3-L02-02': {
    measure: (x) => 2.5 * x,
    apparatus: (x, y) => ({ volume: 0.62, pressione: x / 150, temperatura: y / 500 }),
  },
  // Calore e scambio di energia
  'SIM-C3-L03-01': {
    measure: (x) => 50 * x,
    apparatus: (x, y) => ({ caldo: x / 12 }),
  },
  // Capacità termica e calore specifico
  'SIM-C3-L03-02': {
    measure: (x) => 0.4 * x,
    apparatus: (x, y) => ({ massa: x / 300, caldo: 0.5 }),
  },
  // Capacità termiche dei gas ideali
  'SIM-C3-L03-03': {
    measure: (x) => 8.314 * x,
    apparatus: (x, y) => ({ volume: 0.5 + x / 50, pressione: 0.7, temperatura: 0.4 + x / 40 }),
  },
  // Calorimetria
  'SIM-C3-L03-04': {
    measure: (x) => (80 * x + 4000) / (x + 200),
    apparatus: (x, y) => ({ massa: x / 300, caldo: (y - 20) / 60, miscela: true }),
  },
  // Fusione
  'SIM-C3-L04-01': {
    measure: (x) => (1000 * x) / 334,
    apparatus: (x, y) => ({ liquido: y / 100 }),
  },
  // Evaporazione e condensazione
  'SIM-C3-L04-02': {
    measure: (x) => 2.26 * x,
    apparatus: (x, y) => ({ liquido: (5 - x) / 10, vapore: true }),
  },
  // Calore latente e bilanci a tratti
  'SIM-C3-L04-03': {
    measure: (x) => Math.min(100, Math.max(0, ((x - 2) * 1000) / 340)),
    apparatus: (x, y) => ({ liquido: y / 100, energia: x }),
  },
  // Conduzione
  'SIM-C3-L05-01': {
    measure: (x) => 20 / x,
    apparatus: (x, y) => ({ lunghezza: x / 8, flusso: y / 20 }),
  },
  // Convezione
  'SIM-C3-L05-02': {
    measure: (x) => 42 * x,
    apparatus: (x, y) => ({ portata: x / 5 }),
  },
  // Irraggiamento
  'SIM-C3-L05-03': {
    measure: (x) => 5.67e-8 * (x ** 4 - 300 ** 4),
    apparatus: (x, y) => ({ flusso: y / 2200, temperatura: x / 500 }),
  },
  // Primo principio
  'SIM-C3-L06-01': {
    measure: (x) => x - 10,
    apparatus: (x, y) => ({ volume: 0.7, temperatura: (y + 40) / 100, lavoro: 0.6 }),
  },
  // Energia interna
  'SIM-C3-L06-02': {
    measure: (x) => 12 * x,
    apparatus: (x, y) => ({ volume: 0.6, temperatura: (x + 25) / 60 }),
  },
  // Calore e lavoro
  'SIM-C3-L06-03': {
    measure: (x) => 10 + x,
    apparatus: (x, y) => ({ volume: 0.55 + x / 90, lavoro: x / 30 }),
  },
  // Interpretazione del lavoro su un diagramma p–V
  'SIM-C3-L06-04': {
    measure: (x) => 100 * x,
    apparatus: (x, y) => ({ rettangolo: false, ampiezza: x, pressione: 1 }),
  },
  // Trasformazioni reversibili e irreversibili
  'SIM-C3-L07-01': {
    measure: (x) =>
      Array.from({ length: x }, (_, i) => 100 / (1 + (i + 1) / x) / x).reduce((a, b) => a + b, 0),
    apparatus: (x, y) => ({ gradini: x }),
  },
  // Isoterma
  'SIM-C3-L07-02': {
    measure: (x) => 100 / x,
    apparatus: (x, y) => ({ volume: x / 4, pressione: y / 100 }),
  },
  // Isocora
  'SIM-C3-L07-03': {
    measure: (x) => 0.5 * x,
    apparatus: (x, y) => ({ volume: 0.6, pressione: y / 200, temperatura: x / 500 }),
  },
  // Isobara
  'SIM-C3-L07-04': {
    measure: (x) => x / 100,
    apparatus: (x, y) => ({ volume: y / 5, pressione: 0.7, temperatura: x / 500 }),
  },
  // Adiabatica e confronto qualitativo
  'SIM-C3-L07-05': {
    measure: (x) => 100 / x ** 1.5,
    apparatus: (x, y) => ({ volume: x / 4, pressione: y / 100, temperatura: 1 / Math.sqrt(x) }),
  },
  // Ciclo termodinamico
  'SIM-C3-L08-01': {
    measure: (x) => 60 * x,
    apparatus: (x, y) => ({ ampiezza: x, pressione: 0.6 }),
  },
  // Bilancio energetico di un ciclo
  'SIM-C3-L08-02': {
    measure: (x) => 100 - x,
    apparatus: (x, y) => ({ caldo: 1, freddo: x / 100, lavoro: y / 100 }),
  },
  // Funzionamento ciclico
  'SIM-C3-L08-03': {
    measure: (x) => 20 * x,
    apparatus: (x, y) => ({ ampiezza: 1, pressione: 0.6, giri: x }),
  },
  // Secondo principio, enunciati di Kelvin–Planck e Clausius
  'SIM-C3-L09-01': {
    measure: (x) => 1.5 * x,
    apparatus: (x, y) => ({ caldo: (1.5 * x) / 100, freddo: x / 100, lavoro: (0.5 * x) / 100, frigo: true }),
  },
  // Macchine termiche
  'SIM-C3-L09-02': {
    measure: (x) => 0.3 * x,
    apparatus: (x, y) => ({ caldo: x / 200, freddo: (0.7 * x) / 200, lavoro: y / 200 }),
  },
  // Rendimento
  'SIM-C3-L09-03': {
    measure: (x) => x,
    apparatus: (x, y) => ({ caldo: 1, freddo: 1 - x / 100, lavoro: x / 100 }),
  },
  // Ciclo di Carnot
  'SIM-C3-L09-04': {
    measure: (x) => 100 * (1 - x / 500),
    apparatus: (x, y) => ({ caldo: 1, freddo: x / 500, lavoro: y / 100 }),
  },
  // Entropia funzione di stato
  'SIM-C3-L10-01': {
    measure: (x) => x / 300,
    apparatus: (x, y) => ({ caldo: Math.abs(x) / 60, freddo: Math.abs(x) / 60, lavoro: 0, scambio: x }),
  },
  // Implicazioni macroscopiche
  'SIM-C3-L10-02': {
    measure: (x) => x / 600,
    apparatus: (x, y) => ({ flusso: x / 120, temperatura: 1 }),
  },
  // Interpretazione statistica
  'SIM-C3-L10-03': {
    measure: (x) => [1, 4, 6, 4, 1][x],
    apparatus: (x, y) => ({ sinistra: x }),
  },
  // Direzione naturale dei processi
  'SIM-C3-L10-04': {
    measure: (x) => x / 600,
    apparatus: (x, y) => ({ flusso: x / 60, temperatura: 1 }),
  },
};
