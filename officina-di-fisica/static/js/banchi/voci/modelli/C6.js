export const experiments = {
  // Collegamento U1, U2, U3, U4, U5, U6 e U7 · sistemi, grandezze, unità e scale
  'SIM-C6-L01-01': {
    measure: (x) => 0.17 * x,
    apparatus: (x, y) => ({ eco: x / 20 }),
  },
  // Collegamento U3, U4 e U6 · trasporti, densità di flusso e bilanci in regime stazionario
  'SIM-C6-L02-01': {
    measure: (x) => x / 8,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55, v1: y / 4, v2: y / 4, raccolta: x / 40 }),
  },
  // Collegamento U2, U3, U5, U6 e U7 · potenza meccanica, termica, elettrica e ottica
  'SIM-C6-L03-01': {
    measure: (x) => 0.02 * x,
    apparatus: (x, y) => ({ caldo: y / 2, elettrico: true }),
  },
  // Collegamento U2, U3, U4 e U7 · proporzioni, leggi di potenza, esponenziali
  'SIM-C6-L04-01': {
    measure: (x) => 120 * 0.5 ** x,
    apparatus: (x, y) => ({ spessore: x / 5, trasmessa: y / 120 }),
  },
  // Collegamento U1, U2, U3, U5 e U6 · lettura di grafici, segni, pendenze e aree
  'SIM-C6-L05-01': {
    measure: (x) => (x <= 2 ? 2 * x : 6 - x),
    apparatus: (x, y) => ({
      pos: y,
      inizio: 0,
      min: 0,
      max: 4,
      freccia: x < 2 ? 1 : x > 2 ? -0.5 : 0,
      area: true,
    }),
  },
  // Collegamento cumulativo U1–U7 · scelta del modello, controllo dei limiti, ripresa distribuita
  'SIM-C6-L06-01': {
    measure: (x) => 1 - 1 / x,
    apparatus: (x, y) => ({ lente: true, oggetto: 10 * x, vergenza: 10 * y }),
  },
};
