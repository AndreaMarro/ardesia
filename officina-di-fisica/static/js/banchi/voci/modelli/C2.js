const cos = (degrees) => Math.cos((degrees * Math.PI) / 180);

export const experiments = {
  // Stati di aggregazione
  'SIM-C2-L001-01': {
    measure: (x) => [6, 7.5, 60][x - 1],
    apparatus: (x, y) => ({ stato: x }),
  },
  // Fluidi e solidi
  'SIM-C2-L001-02': {
    measure: (x) => x / 2,
    apparatus: (x, y) => ({ velocita: x / 6 }),
  },
  // Densità
  'SIM-C2-L001-03': {
    measure: (x) => 2.5 * x,
    apparatus: (x, y) => ({ lato: Math.cbrt(x / 8) }),
  },
  // Pressione e forza normale
  'SIM-C2-L001-04': {
    measure: (x) => 100 / x,
    apparatus: (x, y) => ({ area: x / 10, forza: 0.7, singola: true }),
  },
  // Pressione assoluta e relativa
  'SIM-C2-L001-05': {
    measure: (x) => x + 10,
    apparatus: (x, y) => ({ profondita: 0.5, superficie: x / 100 }),
  },
  // Legge di Stevino
  'SIM-C2-L002-01': {
    measure: (x) => 9.81 * x,
    apparatus: (x, y) => ({ profondita: x / 3 }),
  },
  // Pressione con la profondità
  'SIM-C2-L002-02': {
    measure: (x) => 10 * (3 - x),
    apparatus: (x, y) => ({ profondita: (3 - x) / 3 }),
  },
  // Esperimento di Torricelli
  'SIM-C2-L002-03': {
    measure: (x) => x / 1.36,
    apparatus: (x, y) => ({ livello: y / 80, barometro: true }),
  },
  // Manometro a U
  'SIM-C2-L002-04': {
    measure: (x) => 10 * x,
    apparatus: (x, y) => ({ livello: y / 20 }),
  },
  // Principio di Pascal
  'SIM-C2-L003-01': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ area: 1, forza: x / 8 }),
  },
  // Pressa idraulica
  'SIM-C2-L003-02': {
    measure: (x) => x / 4,
    apparatus: (x, y) => ({ area: 1, corsa: x / 8 }),
  },
  // Trasmissione dell’incremento di pressione in un liquido confinato
  'SIM-C2-L003-03': {
    measure: (x) => 20 + x,
    apparatus: (x, y) => ({ profondita: 1, superficie: x / 10 }),
  },
  // Principio di Archimede
  'SIM-C2-L004-01': {
    measure: (x) => 10 * x,
    apparatus: (x, y) => ({ immerso: x / 4, spinta: y / 40 }),
  },
  // Spinta idrostatica
  'SIM-C2-L004-02': {
    measure: (x) => 0.02 * x,
    apparatus: (x, y) => ({ immerso: 1, spinta: y / 24 }),
  },
  // Condizioni di galleggiamento e immersione
  'SIM-C2-L004-03': {
    measure: (x) => x / 10,
    apparatus: (x, y) => ({ immerso: x / 1000, spinta: x / 1000 }),
  },
  // Flusso e portata volumetrica
  'SIM-C2-L005-01': {
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ r1: 0.5, r2: 0.5, v1: x / 8, v2: x / 8 }),
  },
  // Conservazione della massa
  'SIM-C2-L005-02': {
    measure: (x) => 0.8 * x,
    apparatus: (x, y) => ({ r1: 0.65, r2: 0.45, v1: x / 5, v2: x / 2.4 }),
  },
  // Equazione di continuità
  'SIM-C2-L005-03': {
    measure: (x) => 24 / x,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55 * Math.sqrt(x / 4), v1: 0.5, v2: y / 12 }),
  },
  // Velocità media di sezione
  'SIM-C2-L005-04': {
    measure: (x) => x / 2,
    apparatus: (x, y) => ({ picco: x / 8 }),
  },
  // Biforcazioni
  'SIM-C2-L005-05': {
    measure: (x) => 12 - x,
    apparatus: (x, y) => ({ alto: x / 12, basso: y / 12 }),
  },
  // Teorema di Bernoulli
  'SIM-C2-L006-01': {
    measure: (x) => 20.5 - 0.5 * x * x,
    apparatus: (x, y) => ({ r1: 0.65, r2: 0.65 / Math.sqrt(x), v1: 0.4, v2: 0.4 * x, pressione: true }),
  },
  // Pressione statica e dinamica
  'SIM-C2-L006-02': {
    measure: (x) => 0.5 * x * x,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55, v1: x / 4, v2: x / 4, pitot: true }),
  },
  // Stenosi e aneurisma in modello ideale
  'SIM-C2-L006-03': {
    measure: (x) => 2 / x,
    apparatus: (x, y) => ({ r1: 0.57, r2: 0.57 * Math.sqrt(x), v1: 0.65, v2: y / 3, pressione: true }),
  },
  // Condizioni di validità
  'SIM-C2-L006-04': {
    measure: (x) => 15 - x,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55, v1: 0.7, v2: 0.7, perdita: x / 8 }),
  },
  // Flussi laminari e turbolenti
  'SIM-C2-L007-01': {
    measure: (x) => 10000 * x,
    apparatus: (x, y) => ({ picco: x * 3, regime: y }),
  },
  // Regime stazionario
  'SIM-C2-L007-02': {
    measure: (x) => 6,
    apparatus: (x, y) => ({ picco: 1, sonda: 0.5, traccia: x }),
  },
  // Viscosità dinamica
  'SIM-C2-L007-03': {
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ velocita: 0.8, sforzo: y / 6 }),
  },
  // Gradiente di velocità
  'SIM-C2-L007-04': {
    measure: (x) => 40 / x,
    apparatus: (x, y) => ({ velocita: 1, spessore: x / 8 }),
  },
  // Profilo parabolico laminare
  'SIM-C2-L007-05': {
    measure: (x) => 12 * (1 - x * x),
    apparatus: (x, y) => ({ picco: 1.2, sonda: x }),
  },
  // Legge di Hagen–Poiseuille
  'SIM-C2-L008-01': {
    measure: (x) => x ** 4,
    apparatus: (x, y) => ({ r1: 0.38 * x, r2: 0.38 * x, v1: (x * x) / 3, v2: (x * x) / 3 }),
  },
  // Ruolo di raggio, lunghezza, viscosità e salto di pressione
  'SIM-C2-L008-02': {
    measure: (x) => [16, 0.5, 0.5, 2][x - 1],
    apparatus: (x, y) => ({
      r1: x === 1 ? 0.7 : 0.35,
      r2: x === 1 ? 0.7 : 0.35,
      v1: x === 1 ? 1.5 : y / 2,
      v2: x === 1 ? 1.5 : y / 2,
      lungo: x === 2,
    }),
  },
  // Resistenza idraulica
  'SIM-C2-L008-03': {
    measure: (x) => 3 * x,
    apparatus: (x, y) => ({ serie: true, alto: x / 6, basso: x / 6, pressione: y / 24 }),
  },
  // Limiti dei modelli fisiologici
  'SIM-C2-L008-04': {
    measure: (x) => (1 + x / 100) ** 4,
    apparatus: (x, y) => ({
      r1: 0.56 * (1 + x / 100),
      r2: 0.56 * (1 + x / 100),
      v1: (1 + x / 100) ** 2 / 2,
      v2: (1 + x / 100) ** 2 / 2,
    }),
  },
  // Resistenze idrauliche in serie e in parallelo
  'SIM-C2-L009-01': {
    measure: (x) => (2 * x) / (2 + x),
    apparatus: (x, y) => ({ alto: 0.8, basso: 1.6 / x, confronto: true }),
  },
  // Portata nei rami
  'SIM-C2-L009-02': {
    measure: (x) => 12 / x,
    apparatus: (x, y) => ({ alto: y / 8, basso: 0.5 }),
  },
  // Resistenze e pressioni nei sistemi biologici
  'SIM-C2-L009-03': {
    measure: (x) => (10 * x) / (2 + x),
    apparatus: (x, y) => ({
      serie: true,
      alto: (1 / (2 + x)) * 3,
      basso: (1 / (2 + x)) * 3,
      pressione: y / 10,
    }),
  },
  // Tensione superficiale
  'SIM-C2-L010-01': {
    measure: (x) => x,
    apparatus: (x, y) => ({ bordo: x / 5 }),
  },
  // Piccole quantità di liquido
  'SIM-C2-L010-02': {
    measure: (x) => 3 / x,
    apparatus: (x, y) => ({ raggio: x / 4 }),
  },
  // Bagnabilità e capillarità
  'SIM-C2-L010-03': {
    measure: (x) => 10 * cos(x),
    apparatus: (x, y) => ({ livello: y / 10, angolo: x }),
  },
  // Interfacce piane e curve
  'SIM-C2-L010-04': {
    measure: (x) => 100 * x,
    apparatus: (x, y) => ({ curvatura: x }),
  },
  // Legge di Laplace e pressione di curvatura
  'SIM-C2-L010-05': {
    measure: (x) => 200 / x,
    apparatus: (x, y) => ({ raggio: x / 8, bolla: true }),
  },
};
