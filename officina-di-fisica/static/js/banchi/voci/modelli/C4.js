const cos = (degrees) => Math.cos((degrees * Math.PI) / 180);
const sin = (degrees) => Math.sin((degrees * Math.PI) / 180);

export const experiments = {
  // Carica elettrica, segno, unità e conservazione
  'SIM-C4-L01-01': {
    measure: (x) => x,
    apparatus: (x, y) => ({ qa: x, qb: -x, trasferimento: true }),
  },
  // Interazione fra cariche puntiformi e legge di Coulomb
  'SIM-C4-L01-02': {
    measure: (x) => 90 / x ** 2,
    apparatus: (x, y) => ({ qa: 1, qb: 1, distanza: x / 6, forza: y / 60 }),
  },
  // Campo elettrico e linee di forza
  'SIM-C4-L02-01': {
    measure: (x) => 90 / x ** 2,
    apparatus: (x, y) => ({ qa: 1, sonda: x / 8, campo: y / 65 }),
  },
  // Campo di una o più cariche puntiformi
  'SIM-C4-L02-02': {
    measure: (x) => 22.5 * (1 - x),
    apparatus: (x, y) => ({ qa: 1, qb: x, mezzo: true, campo: y / 65 }),
  },
  // Moto in un campo elettrico uniforme
  'SIM-C4-L02-03': {
    measure: (x) => 0.5 * x * x,
    apparatus: (x, y) => ({ moto: y / 8, campo: 0.8 }),
  },
  // Energia potenziale di una distribuzione di cariche
  'SIM-C4-L03-01': {
    measure: (x) => 0.9 * (1 + 2 * x),
    apparatus: (x, y) => ({ qa: 1, qb: 1, qc: x }),
  },
  // Potenziale e differenza di potenziale
  'SIM-C4-L03-02': {
    measure: (x) => -2 * x,
    apparatus: (x, y) => ({ posizione: x / 4, campo: 0.9 }),
  },
  // Conservazione dell’energia in un campo elettrico
  'SIM-C4-L03-03': {
    measure: (x) => 3 * x,
    apparatus: (x, y) => ({ posizione: x / 8, campo: 1 }),
  },
  // Conduttori e induzione elettrostatica
  'SIM-C4-L04-01': {
    measure: (x) => 0,
    apparatus: (x, y) => ({ campo: x / 10, metallo: true }),
  },
  // Dielettrici e polarizzazione
  'SIM-C4-L04-02': {
    measure: (x) => x / 3,
    apparatus: (x, y) => ({ campo: x / 12 }),
  },
  // Corrente continua e intensità
  'SIM-C4-L05-01': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ corrente: 1, passaggio: x / 5 }),
  },
  // Generatore ideale
  'SIM-C4-L05-02': {
    measure: (x) => 12 / x,
    apparatus: (x, y) => ({ r: x / 12, i: y / 6 }),
  },
  // Conduzione ohmica
  'SIM-C4-L05-03': {
    measure: (x) => x / 4,
    apparatus: (x, y) => ({ r: 0.45, i: y / 2 }),
  },
  // Prima e seconda legge di Ohm
  'SIM-C4-L05-04': {
    measure: (x) => 2 / x,
    apparatus: (x, y) => ({ lunghezza: x / 4, corrente: y / 3 }),
  },
  // Resistività
  'SIM-C4-L05-05': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ materiale: x, corrente: 0.3 / x }),
  },
  // Resistenze in serie e in parallelo
  'SIM-C4-L06-01': {
    measure: (x) => (4 * x) / (4 + x),
    apparatus: (x, y) => ({ parallelo: true, r: x / 12, i: 1, ramo: 4 / x }),
  },
  // Potenza elettrica ed effetto Joule
  'SIM-C4-L06-02': {
    measure: (x) => 3 * x * x,
    apparatus: (x, y) => ({ r: 0.5, i: x / 3, calore: y / 48 }),
  },
  // Capacità elettrica e condensatore piano
  'SIM-C4-L07-01': {
    measure: (x) => 88.54 / x,
    apparatus: (x, y) => ({ distanza: x / 8 }),
  },
  // Effetto del dielettrico
  'SIM-C4-L07-02': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ dielettrico: x / 7, carica: x }),
  },
  // Energia immagazzinata
  'SIM-C4-L07-03': {
    measure: (x) => x * x,
    apparatus: (x, y) => ({ campo: x / 8, carica: x }),
  },
  // Condensatori in serie e in parallelo
  'SIM-C4-L08-01': {
    measure: (x) => (2 * x) / (2 + x),
    apparatus: (x, y) => ({ secondo: x / 8, serie: true }),
  },
  // Conservazione di carica nei collegamenti
  'SIM-C4-L08-02': {
    measure: (x) => x / 3,
    apparatus: (x, y) => ({ secondo: 0.65, carica: x / 12 }),
  },
  // Origine magnetica delle correnti ed esperimento di Oersted
  'SIM-C4-L09-01': {
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ corrente: x / 6 }),
  },
  // Forza di Lorentz su una carica in moto e su un filo
  'SIM-C4-L09-02': {
    measure: (x) => 6 * sin(x),
    apparatus: (x, y) => ({ angolo: x, forza: y / 6 }),
  },
  // Moto circolare in campo magnetico uniforme
  'SIM-C4-L09-03': {
    measure: (x) => 12 / x,
    apparatus: (x, y) => ({ r: 0.35 + (1.4 * y) / 24, tangente: 0.8, radiale: x / 3 }),
  },
  // Flusso magnetico
  'SIM-C4-L10-01': {
    measure: (x) => 6 * cos(x),
    apparatus: (x, y) => ({ angolo: x, campo: 0.85 }),
  },
  // Forza elettromotrice indotta
  'SIM-C4-L10-02': {
    measure: (x) => -0.5 * x,
    apparatus: (x, y) => ({ angolo: 0, campo: 0.65, variazione: x / 4 }),
  },
  // Legge di Faraday–Neumann–Lenz
  'SIM-C4-L10-03': {
    measure: (x) => -2 / x,
    apparatus: (x, y) => ({ angolo: 0, campo: 0.8, variazione: 1 / x }),
  },
  // Correnti indotte e loro verso
  'SIM-C4-L10-04': {
    measure: (x) => -x / 2,
    apparatus: (x, y) => ({ angolo: 0, campo: 0.65, variazione: x / 6, corrente: y / 3 }),
  },
};
