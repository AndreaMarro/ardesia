const cos = (degrees) => Math.cos((degrees * Math.PI) / 180);
const sin = (degrees) => Math.sin((degrees * Math.PI) / 180);

export const experiments = {
  // Carica elettrica, segno, unità e conservazione
  'SIM-C4-L01-01': {
    observe: "Segui il trasferimento fra i due corpi. Conta separatamente eccesso e difetto di elettroni e verifica la carica totale.",
    measure: (x) => x,
    apparatus: (x, y) => ({ qa: x, qb: -x, trasferimento: true }),
  },
  // Interazione fra cariche puntiformi e legge di Coulomb
  'SIM-C4-L01-02': {
    observe: "Raddoppia la distanza fra i centri. Guarda quanto si accorciano le frecce delle forze e confronta i loro versi.",
    measure: (x) => 90 / x ** 2,
    apparatus: (x, y) => ({ qa: 1, qb: 1, distanza: x / 6, forza: y / 60, frecceSeparate: true }),
  },
  // Campo elettrico e linee di forza
  'SIM-C4-L02-01': {
    observe: "Allontana la sonda dalla carica lungo una direzione radiale. Confronta il verso del campo e il suo modulo a due distanze.",
    measure: (x) => 90 / x ** 2,
    apparatus: (x, y) => ({ qa: 1, sonda: x / 8, campo: y / 65 }),
  },
  // Campo di una o più cariche puntiformi
  'SIM-C4-L02-02': {
    observe: "Mantieni la sonda a metà fra le sorgenti e cambia la seconda carica. Trova quando i due contributi si annullano.",
    measure: (x) => 22.5 * (1 - x),
    apparatus: (x, y) => ({ qa: 1, qb: x, mezzo: true, campo: y / 65 }),
  },
  // Moto in un campo elettrico uniforme
  'SIM-C4-L02-03': {
    observe: "Segui la particella fra le piastre a intervalli uguali in millisecondi. Partendo da ferma percorre spazi progressivamente maggiori.",
    measure: (x) => 0.5 * x * x,
    apparatus: (x, y) => ({ moto: y / 8, campo: 0.8 }),
  },
  // Energia potenziale di una distribuzione di cariche
  'SIM-C4-L03-01': {
    observe: "Individua le tre coppie che formano il triangolo di cariche. Cambiare la terza carica modifica due contributi all’energia.",
    measure: (x) => 0.9 * (1 + 2 * x),
    apparatus: (x, y) => ({ qa: 1, qb: 1, qc: x }),
  },
  // Potenziale e differenza di potenziale
  'SIM-C4-L03-02': {
    observe: "Sposta la sonda nel verso delle linee del campo uniforme. Registra la diminuzione di potenziale per ogni centimetro percorso.",
    measure: (x) => -2 * x,
    apparatus: (x, y) => ({ posizione: x / 4, campo: 0.9 }),
  },
  // Conservazione dell’energia in un campo elettrico
  'SIM-C4-L03-03': {
    observe: "Segui una carica positiva verso un potenziale minore. Confronta il guadagno di energia cinetica con la perdita di energia potenziale.",
    measure: (x) => 3 * x,
    apparatus: (x, y) => ({ posizione: x / 8, campo: 1 }),
  },
  // Conduttori e induzione elettrostatica
  'SIM-C4-L04-01': {
    observe: "Osserva la ridistribuzione delle cariche sulla superficie del conduttore. Controlla il campo all’interno dopo aver variato quello esterno.",
    measure: (x) => 0,
    apparatus: (x, y) => ({ campo: x / 10, metallo: true }),
  },
  // Dielettrici e polarizzazione
  'SIM-C4-L04-02': {
    observe: "Segui i due poli di ciascun dipolo nel dielettrico. Confronta il campo interno con il campo applicato.",
    measure: (x) => x / 3,
    apparatus: (x, y) => ({ campo: x / 12 }),
  },
  // Corrente continua e intensità
  'SIM-C4-L05-01': {
    observe: "Osserva la sezione segnata del filo. La freccia dà il verso della corrente convenzionale, i portatori negativi attraversano il filo nel verso opposto.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ corrente: 1, passaggio: x / 5 }),
  },
  // Generatore ideale
  'SIM-C4-L05-02': {
    observe: "Tieni fissa la tensione del generatore e cambia il resistore. Verifica che il prodotto fra corrente e resistenza restituisca la stessa tensione.",
    measure: (x) => 12 / x,
    apparatus: (x, y) => ({ r: x / 12, i: y / 6 }),
  },
  // Conduzione ohmica
  'SIM-C4-L05-03': {
    observe: "Aumenta la tensione ai capi dello stesso resistore. Leggi la corrente e confronta il rapporto tensione su corrente nelle due misure.",
    measure: (x) => x / 4,
    apparatus: (x, y) => ({ r: 0.45, i: y / 2 }),
  },
  // Prima e seconda legge di Ohm
  'SIM-C4-L05-04': {
    observe: "Allunga il filo senza cambiare materiale o sezione. Confronta l’aumento di resistenza con la diminuzione di corrente a tensione fissata.",
    measure: (x) => 2 / x,
    apparatus: (x, y) => ({ lunghezza: x / 4, corrente: y / 3 }),
  },
  // Resistività
  'SIM-C4-L05-05': {
    observe: "Cambia il materiale a lunghezza e sezione uguali. La resistività appartiene al materiale, la resistenza si riferisce all’intero filo.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ materiale: x, corrente: 0.3 / x }),
  },
  // Resistenze in serie e in parallelo
  'SIM-C4-L06-01': {
    observe: "Segui i nodi del circuito in serie e di quello in parallelo. Confronta le due resistenze equivalenti con i valori dei singoli resistori.",
    measure: (x) => (4 * x) / (4 + x),
    apparatus: (x, y) => ({ parallelo: true, r: x / 12, i: 1, ramo: 4 / x }),
  },
  // Potenza elettrica ed effetto Joule
  'SIM-C4-L06-02': {
    observe: "Raddoppia la corrente attraverso lo stesso resistore. Controlla il fattore di aumento della potenza dissipata.",
    measure: (x) => 3 * x * x,
    apparatus: (x, y) => ({ r: 0.5, i: x / 3, calore: y / 48 }),
  },
  // Capacità elettrica e condensatore piano
  'SIM-C4-L07-01': {
    observe: "Avvicina le armature senza cambiare l’area sovrapposta. Leggi come cambia la capacità dimezzando la distanza.",
    measure: (x) => 88.54 / x,
    apparatus: (x, y) => ({ distanza: x / 8 }),
  },
  // Effetto del dielettrico
  'SIM-C4-L07-02': {
    observe: "Inserisci il dielettrico a tensione fissata. Confronta l’aumento della capacità con la carica che arriva sulle armature.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ dielettrico: x / 7, carica: x }),
  },
  // Energia immagazzinata
  'SIM-C4-L07-03': {
    observe: "Raddoppia la tensione. Confronta il fattore di crescita della carica con quello dell’energia immagazzinata.",
    measure: (x) => x * x,
    apparatus: (x, y) => ({ campo: x / 8, carica: x }),
  },
  // Condensatori in serie e in parallelo
  'SIM-C4-L08-01': {
    observe: "Segui le coppie di piastre nelle due connessioni. Verifica quale configurazione dà una capacità maggiore di quella di ciascun componente.",
    measure: (x) => (2 * x) / (2 + x),
    apparatus: (x, y) => ({ secondo: x / 8, serie: true }),
  },
  // Conservazione di carica nei collegamenti
  'SIM-C4-L08-02': {
    observe: "Distribuisci la carica totale sui due condensatori collegati. Controlla che la tensione finale sia comune e che la carica si conservi.",
    measure: (x) => x / 3,
    apparatus: (x, y) => ({ secondo: 0.65, carica: x / 12 }),
  },
  // Origine magnetica delle correnti ed esperimento di Oersted
  'SIM-C4-L09-01': {
    observe: "Individua il filo e la sonda. Inverti il verso della corrente e confronta le direzioni tangenti al campo magnetico.",
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ corrente: x / 6 }),
  },
  // Forza di Lorentz su una carica in moto e su un filo
  'SIM-C4-L09-02': {
    observe: "Ruota la velocità rispetto al campo. Individua la direzione della forza perpendicolare al loro piano e il caso in cui si annulla.",
    measure: (x) => 6 * sin(x),
    apparatus: (x, y) => ({ angolo: x, forza: y / 6 }),
  },
  // Moto circolare in campo magnetico uniforme
  'SIM-C4-L09-03': {
    observe: "Cambia il campo mantenendo uguale la quantità di moto della carica. Confronta i raggi delle traiettorie e la direzione della tangente.",
    measure: (x) => 12 / x,
    apparatus: (x, y) => ({ r: (1.8 * y) / 24, tangente: 0.8, radiale: x / 3 }),
  },
  // Flusso magnetico
  'SIM-C4-L10-01': {
    observe: "Guarda la normale alla spira e il campo. Quando diventano perpendicolari il flusso si annulla anche se il campo è presente.",
    measure: (x) => 6 * cos(x),
    apparatus: (x, y) => ({ angolo: x, campo: 0.85 }),
  },
  // Forza elettromotrice indotta
  'SIM-C4-L10-02': {
    observe: "Ferma il campo quando attraversa lo zero. Confronta il valore del flusso in quell’istante con la pendenza che determina la fem.",
    measure: (x) => -0.5 * x,
    apparatus: (x, y) => ({ angolo: 0, campo: 0.65, variazione: x / 4 }),
  },
  // Legge di Faraday–Neumann–Lenz
  'SIM-C4-L10-03': {
    observe: "Distribuisci lo stesso aumento di flusso su due durate diverse. Confronta la pendenza media e la fem orientata.",
    measure: (x) => -2 / x,
    apparatus: (x, y) => ({ angolo: 0, campo: 0.8, variazione: 1 / x }),
  },
  // Correnti indotte e loro verso
  'SIM-C4-L10-04': {
    observe: "Inverti il segno della variazione di flusso. Segui sulla spira come cambia il verso della corrente indotta.",
    measure: (x) => -x / 2,
    apparatus: (x, y) => ({ angolo: 0, campo: 0.65, variazione: x / 6, corrente: y / 3 }),
  },
};
