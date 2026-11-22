const cos = (degrees) => Math.cos((degrees * Math.PI) / 180);
const sin = (degrees) => Math.sin((degrees * Math.PI) / 180);

export const experiments = {
  // Notazione scientifica
  'SIM-C1-L001-01': {
    measure: (x) => 2 * 10 ** (x + 6),
    apparatus: (x, y) => ({ frazione: y / 20000, scala: true }),
  },
  // Grandezze fisiche, dimensioni e SI
  'SIM-C1-L001-02': {
    measure: (x) => x ** 3,
    apparatus: (x, y) => ({ lato: x / 5, celle: x }),
  },
  // Conversioni tra unità
  'SIM-C1-L001-03': {
    measure: (x) => x / 10,
    apparatus: (x, y) => ({ frazione: x / 50 }),
  },
  // Stima di ordine di grandezza
  'SIM-C1-L001-04': {
    measure: (x) => 1000 * x ** 3,
    apparatus: (x, y) => ({ lato: x / 5 }),
  },
  // Grandezze intensive ed estensive
  'SIM-C1-L001-05': {
    measure: (x) => 60 * x,
    apparatus: (x, y) => ({ numero: x }),
  },
  // Scalari e vettori
  'SIM-C1-L001-06': {
    measure: (x) => 4 * cos(x),
    apparatus: (x, y) => ({ ax: 2 * cos(x), ay: 2 * sin(x), proietta: true }),
  },
  // Funzioni trigonometriche elementari
  'SIM-C1-L002-01': {
    measure: (x) => 10 * sin(x),
    apparatus: (x, y) => ({ ax: 2.5 * cos(x), ay: 2.5 * sin(x), proietta: true }),
  },
  // Definizione, componenti e modulo dei vettori
  'SIM-C1-L002-02': {
    measure: (x) => Math.hypot(3, x),
    apparatus: (x, y) => ({ ax: 1, ay: x / 3, proietta: true }),
  },
  // Somma e differenza
  'SIM-C1-L002-03': {
    measure: (x) => 3 + x,
    apparatus: (x, y) => ({ ax: 1.2, ay: 0, bx: 0.4 * x, by: 0, somma: true }),
  },
  // Prodotto scalare e vettoriale
  'SIM-C1-L002-04': {
    measure: (x) => 6 * cos(x),
    apparatus: (x, y) => ({ ax: 1.5, ay: 0, bx: cos(x), by: sin(x), croce: true }),
  },
  // Posizione e spostamento
  'SIM-C1-L003-01': {
    measure: (x) => x - 2,
    apparatus: (x, y) => ({ pos: x, inizio: 2, min: -2, max: 6 }),
  },
  // Traiettoria e legge oraria
  'SIM-C1-L003-02': {
    measure: (x) => 10 * x - 5 * x * x,
    apparatus: (x, y) => ({ t: x, vx: 3, vy: 10, g: 10 }),
  },
  // Velocità media e istantanea
  'SIM-C1-L003-03': {
    measure: (x) => 2 + x,
    apparatus: (x, y) => ({ pos: (1 + x) ** 2, inizio: 1, min: 0, max: 16 }),
  },
  // Accelerazione media e istantanea
  'SIM-C1-L003-04': {
    measure: (x) => 2 + x,
    apparatus: (x, y) => ({
      pos: (1 + x) ** 3 / 3,
      inizio: 1 / 3,
      min: 0,
      max: 22,
      freccia: (1 + x) ** 2 / 12,
    }),
  },
  // Moto rettilineo uniforme
  'SIM-C1-L003-05': {
    measure: (x) => -1 + 2 * x,
    apparatus: (x, y) => ({ pos: y, inizio: -1, min: -1, max: 9, freccia: 0.8 }),
  },
  // Grafici cinematici
  'SIM-C1-L003-06': {
    measure: (x) => (x <= 2 ? 2 * x : 8 - 2 * x),
    apparatus: (x, y) => ({ pos: y, inizio: 0, min: 0, max: 4, freccia: x < 2 ? 0.8 : x > 2 ? -0.8 : 0 }),
  },
  // Moto uniformemente accelerato
  'SIM-C1-L004-01': {
    measure: (x) => x * x,
    apparatus: (x, y) => ({ pos: y, inizio: 0, min: 0, max: 16, freccia: x / 3 }),
  },
  // Caduta libera
  'SIM-C1-L004-02': {
    measure: (x) => 20 - 5 * x * x,
    apparatus: (x, y) => ({ altezza: y / 20 }),
  },
  // Moto parabolico
  'SIM-C1-L004-03': {
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ t: 1, vx: x, vy: 10, g: 10 }),
  },
  // Moto circolare uniforme e accelerazione centripeta
  'SIM-C1-L004-04': {
    measure: (x) => (x * x) / 2,
    apparatus: (x, y) => ({ r: 1.4, tangente: x / 5, radiale: y / 13 }),
  },
  // Sistemi inerziali e primo principio
  'SIM-C1-L005-01': {
    measure: (x) => 1.5 * x,
    apparatus: (x, y) => ({ pos: y, inizio: 0, min: 0, max: 7.5, freccia: 0.9 }),
  },
  // Equilibrio traslazionale e statico
  'SIM-C1-L005-02': {
    measure: (x) => x - 6,
    apparatus: (x, y) => ({ destra: x / 6, sinistra: 1 }),
  },
  // Secondo principio della dinamica
  'SIM-C1-L005-03': {
    measure: (x) => x / 2,
    apparatus: (x, y) => ({ destra: x / 5, acc: y / 3 }),
  },
  // Azione e reazione
  'SIM-C1-L005-04': {
    measure: (x) => -x,
    apparatus: (x, y) => ({ intensita: x / 9 }),
  },
  // Forza peso e normale
  'SIM-C1-L005-05': {
    measure: (x) => 20 * cos(x),
    apparatus: (x, y) => ({ angolo: x, peso: 1, normale: y / 20 }),
  },
  // Tensione in un filo
  'SIM-C1-L005-06': {
    measure: (x) => 2 * (10 + x),
    apparatus: (x, y) => ({ altezza: 0.55, filo: true, tensione: y / 30 }),
  },
  // Attrito statico e dinamico
  'SIM-C1-L006-01': {
    measure: (x) => (x <= 6 ? x : 3),
    apparatus: (x, y) => ({ destra: x / 7, sinistra: y / 7 }),
  },
  // Forza elastica e legge di Hooke
  'SIM-C1-L006-02': {
    measure: (x) => -0.5 * x,
    apparatus: (x, y) => ({ estensione: x / 5, forza: y / 2 }),
  },
  // Forza gravitazionale
  'SIM-C1-L006-03': {
    measure: (x) => 1 / x ** 2,
    apparatus: (x, y) => ({ distanza: x / 4, forza: y }),
  },
  // Lavoro di una forza
  'SIM-C1-L007-01': {
    measure: (x) => 12 * cos(x),
    apparatus: (x, y) => ({ ax: 1.6, ay: 0, bx: 1.5 * cos(x), by: 1.5 * sin(x), prodotto: true }),
  },
  // Potenza media e istantanea
  'SIM-C1-L007-02': {
    measure: (x) => 6 * x,
    apparatus: (x, y) => ({ pos: x * x, inizio: 0, min: 0, max: 16, freccia: x / 3 }),
  },
  // Teorema dell’energia cinetica
  'SIM-C1-L007-03': {
    measure: (x) => Math.sqrt(x),
    apparatus: (x, y) => ({ pos: x, inizio: 0, min: 0, max: 16, freccia: y / 3 }),
  },
  // Forze conservative e non conservative
  'SIM-C1-L008-01': {
    measure: (x) => -2 * x,
    apparatus: (x, y) => ({ lunghezza: x }),
  },
  // Energia potenziale gravitazionale ed elastica
  'SIM-C1-L008-02': {
    measure: (x) => 10 * x + 0.5 * x * x,
    apparatus: (x, y) => ({ estensione: x / 10, verticale: true }),
  },
  // Energia meccanica e conservazione
  'SIM-C1-L008-03': {
    measure: (x) => 10 * (5 - x),
    apparatus: (x, y) => ({ altezza: x / 5 }),
  },
  // Quantità di moto e impulso
  'SIM-C1-L009-01': {
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ a: -1.8 + 0.25 * x * x, va: x / 2 }),
  },
  // Conservazione della quantità di moto nei sistemi isolati
  'SIM-C1-L009-02': {
    measure: (x) => x / 2,
    apparatus: (x, y) => ({ a: -0.3, b: 0.3, va: y / 2, vb: y / 2 }),
  },
  // Centro di massa e suo moto
  'SIM-C1-L010-01': {
    measure: (x) => 1 + x,
    apparatus: (x, y) => ({ a: -2 + x, b: 2 + x, centro: y, unita: 0.65, massaB: 3 }),
  },
  // Corpo rigido
  'SIM-C1-L010-02': {
    measure: (x) => 20 * sin(x),
    apparatus: (x, y) => ({ angolo: x, sx: 1, dx: 1 }),
  },
  // Momento torcente
  'SIM-C1-L010-03': {
    measure: (x) => x / 10,
    apparatus: (x, y) => ({ sx: 0.85, dx: x / 24, fd: 0.8 }),
  },
  // Equilibrio rotazionale
  'SIM-C1-L010-04': {
    measure: (x) => 120 / x,
    apparatus: (x, y) => ({ sx: x / 22, dx: 20 / 22, fs: y / 10, fd: 0.6 }),
  },
  // Leve nel corpo umano
  'SIM-C1-L010-05': {
    measure: (x) => 300 / x,
    apparatus: (x, y) => ({ braccio: true, dx: 1.9, sx: (x / 30) * 1.9, fs: y / 90, fd: 10 / 90 }),
  },
};
