const cos = (degrees) => Math.cos((degrees * Math.PI) / 180);

export const experiments = {
  // Stati di aggregazione
  'SIM-C2-L001-01': {
    observe: "Confronta l’ingombro delle tre disposizioni di particelle. La quantità di materia è la stessa e cambia il volume del campione.",
    measure: (x) => [6, 7.5, 60][x - 1],
    apparatus: (x, y) => ({ stato: x }),
  },
  // Fluidi e solidi
  'SIM-C2-L001-02': {
    observe: "Osserva gli strati tra la lastra ferma e quella mobile. Aumenta la velocità superiore e confronta lo sforzo di taglio.",
    measure: (x) => x / 2,
    apparatus: (x, y) => ({ velocita: x / 6 }),
  },
  // Densità
  'SIM-C2-L001-03': {
    observe: "Aumenta il volume di uno stesso materiale. Prova a dividere ogni massa per il suo volume per ritrovare la densità.",
    measure: (x) => 2.5 * x,
    apparatus: (x, y) => ({ lato: Math.cbrt(x / 8) }),
  },
  // Pressione e forza normale
  'SIM-C2-L001-04': {
    observe: "Allarga la superficie che riceve la stessa forza. Confronta la forza distribuita su ciascun centimetro quadrato.",
    measure: (x) => 100 / x,
    apparatus: (x, y) => ({ area: x / 10, forza: 0.7, singola: true }),
  },
  // Pressione assoluta e relativa
  'SIM-C2-L001-05': {
    observe: "Mantieni la sonda alla stessa profondità e cambia la pressione atmosferica. Distingui la lettura assoluta dalla sovrapressione dovuta all’acqua.",
    measure: (x) => x + 10,
    apparatus: (x, y) => ({ profondita: 0.5, superficie: x / 100 }),
  },
  // Legge di Stevino
  'SIM-C2-L002-01': {
    observe: "Abbassa la sonda di un metro, poi di un altro metro. Confronta i due incrementi di pressione nella stessa acqua.",
    measure: (x) => 9.81 * x,
    apparatus: (x, y) => ({ profondita: x / 3 }),
  },
  // Pressione con la profondità
  'SIM-C2-L002-02': {
    observe: "Misura la quota dal fondo e la profondità dalla superficie. Quando una aumenta, l’altra diminuisce.",
    measure: (x) => 10 * (3 - x),
    apparatus: (x, y) => ({ profondita: (3 - x) / 3 }),
  },
  // Esperimento di Torricelli
  'SIM-C2-L002-03': {
    observe: "Aumenta la pressione dell’aria sulla vaschetta e segui il livello del mercurio. Misura l’altezza verticale sopra la superficie esterna.",
    measure: (x) => x / 1.36,
    apparatus: (x, y) => ({ livello: y / 80, barometro: true }),
  },
  // Manometro a U
  'SIM-C2-L002-04': {
    observe: "Segui entrambe le superfici del manometro. La lettura è il dislivello fra i due rami, maggiore dello spostamento di un solo livello.",
    measure: (x) => 10 * x,
    apparatus: (x, y) => ({ livello: y / 20 }),
  },
  // Principio di Pascal
  'SIM-C2-L003-01': {
    observe: "Confronta le due facce dei pistoni. Lo stesso incremento di pressione produce una forza maggiore sulla faccia di area maggiore.",
    measure: (x) => 2 * x,
    apparatus: (x, y) => ({ area: 1, forza: x / 8 }),
  },
  // Pressa idraulica
  'SIM-C2-L003-02': {
    observe: "Abbassa il pistone piccolo. Confronta le corse tenendo conto che il volume ceduto da un lato deve comparire dall’altro.",
    measure: (x) => x / 4,
    apparatus: (x, y) => ({ area: 1, corsa: x / 8 }),
  },
  // Trasmissione dell’incremento di pressione in un liquido confinato
  'SIM-C2-L003-03': {
    observe: "Lascia la sonda in profondità e premi sulla superficie. Separa l’incremento trasmesso dalla pressione già dovuta alla colonna d’acqua.",
    measure: (x) => 20 + x,
    apparatus: (x, y) => ({ profondita: 1, superficie: x / 10 }),
  },
  // Principio di Archimede
  'SIM-C2-L004-01': {
    observe: "Segui la parte del blocco sotto il pelo libero. Ogni litro d’acqua in più spostato aggiunge circa 10 N alla spinta.",
    measure: (x) => 10 * x,
    apparatus: (x, y) => ({ immerso: x / 4, spinta: y / 40 }),
  },
  // Spinta idrostatica
  'SIM-C2-L004-02': {
    observe: "Mantieni immersi due litri di volume e cambia liquido. Confronta il peso del liquido spostato con la spinta misurata.",
    measure: (x) => 0.02 * x,
    apparatus: (x, y) => ({ immerso: 1, spinta: y / 24 }),
  },
  // Condizioni di galleggiamento e immersione
  'SIM-C2-L004-03': {
    observe: "Osserva la frazione del blocco sotto il pelo libero. Un blocco più denso deve spostare più acqua per equilibrare il proprio peso.",
    measure: (x) => x / 10,
    apparatus: (x, y) => ({ immerso: x / 1000, spinta: x / 1000 }),
  },
  // Flusso e portata volumetrica
  'SIM-C2-L005-01': {
    observe: "Raddoppia la velocità alla stessa sezione. Immagina il cilindro di liquido che la attraversa in un secondo e leggi il suo volume.",
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ r1: 0.5, r2: 0.5, v1: x / 8, v2: x / 8 }),
  },
  // Conservazione della massa
  'SIM-C2-L005-02': {
    observe: "Segui la stessa corrente attraverso due sezioni. Moltiplica i litri al secondo per la massa di ciascun litro.",
    measure: (x) => 0.8 * x,
    apparatus: (x, y) => ({ r1: 0.65, r2: 0.45, v1: x / 5, v2: x / 2.4 }),
  },
  // Equazione di continuità
  'SIM-C2-L005-03': {
    observe: "Riduci l’area di uscita e osserva le frecce di velocità. Controlla il prodotto area per velocità prima e dopo il restringimento.",
    measure: (x) => 24 / x,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55 * Math.sqrt(x / 4), v1: 0.5, v2: y / 12 }),
  },
  // Velocità media di sezione
  'SIM-C2-L005-04': {
    observe: "Confronta l’asse con la parete. La media sull’intera sezione circolare del profilo parabolico è metà del valore sull’asse.",
    measure: (x) => x / 2,
    apparatus: (x, y) => ({ picco: x / 8 }),
  },
  // Biforcazioni
  'SIM-C2-L005-05': {
    observe: "Parti dal nodo e segui le due uscite. Aggiungi le portate dei due rami e confronta la somma con l’ingresso.",
    measure: (x) => 12 - x,
    apparatus: (x, y) => ({ alto: x / 12, basso: y / 12 }),
  },
  // Teorema di Bernoulli
  'SIM-C2-L006-01': {
    observe: "Confronta la gola e il tratto largo alla stessa altezza. Dove aumenta la velocità, segui la diminuzione della pressione statica.",
    measure: (x) => 20.5 - 0.5 * x * x,
    apparatus: (x, y) => ({ r1: 0.65, r2: 0.65 / Math.sqrt(x), v1: 0.4, v2: 0.4 * x, pressione: true }),
  },
  // Pressione statica e dinamica
  'SIM-C2-L006-02': {
    observe: "Confronta la presa laterale con quella frontale. La differenza delle letture cresce con il quadrato della velocità.",
    measure: (x) => 0.5 * x * x,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55, v1: x / 4, v2: x / 4, pitot: true }),
  },
  // Stenosi e aneurisma in modello ideale
  'SIM-C2-L006-03': {
    observe: "Allarga e poi restringi la sezione locale. Confronta velocità e pressione nel modello di tubo orizzontale ideale.",
    measure: (x) => 2 / x,
    apparatus: (x, y) => ({ r1: 0.57, r2: 0.57 * Math.sqrt(x), v1: 2 / 3, v2: y / 3, pressione: true }),
  },
  // Condizioni di validità
  'SIM-C2-L006-04': {
    observe: "Tieni uguali le sezioni e le velocità. La differenza fra le prese misura la perdita di energia per unità di volume.",
    measure: (x) => 15 - x,
    apparatus: (x, y) => ({ r1: 0.55, r2: 0.55, v1: 0.7, v2: 0.7, perdita: x / 8 }),
  },
  // Flussi laminari e turbolenti
  'SIM-C2-L007-01': {
    observe: "Aumenta la velocità e leggi Reynolds. Quando il banco esce dal dominio laminare, verifica che il profilo parabolico scompaia.",
    measure: (x) => 10000 * x,
    apparatus: (x, y) => ({ picco: x * 3, regime: y }),
  },
  // Regime stazionario
  'SIM-C2-L007-02': {
    observe: "Tieni la sonda a metà raggio e segui i traccianti per più istanti. Le particelle avanzano mentre la lettura locale resta costante.",
    measure: (x) => 6,
    apparatus: (x, y) => ({ picco: 1, sonda: 0.5, tracciaCm: 8 * x }),
  },
  // Viscosità dinamica
  'SIM-C2-L007-03': {
    observe: "A parità di gradiente, cambia la viscosità. Distingui la differenza di velocità fra gli strati dallo sforzo necessario a mantenerla.",
    measure: (x) => 4 * x,
    apparatus: (x, y) => ({ velocita: 0.8, sforzo: y / 6 }),
  },
  // Gradiente di velocità
  'SIM-C2-L007-04': {
    observe: "Mantieni la stessa differenza di velocità e avvicina le lastre. Una variazione uguale distribuita su meno millimetri dà un gradiente maggiore.",
    measure: (x) => 40 / x,
    apparatus: (x, y) => ({ velocita: 1, spessore: x / 8 }),
  },
  // Profilo parabolico laminare
  'SIM-C2-L007-05': {
    observe: "Sposta la sonda dall’asse alla parete. Controlla al centro, a metà raggio e sulla parete le lunghezze delle frecce.",
    measure: (x) => 12 * (1 - x * x),
    apparatus: (x, y) => ({ picco: 1.2, sonda: x }),
  },
  // Legge di Hagen–Poiseuille
  'SIM-C2-L008-01': {
    observe: "Raddoppia il raggio con la stessa differenza di pressione. Leggi la portata e confrontala con la quarta potenza del rapporto fra i raggi.",
    measure: (x) => x ** 4,
    apparatus: (x, y) => ({ r1: 0.38 * x, r2: 0.38 * x, v1: (x * x) / 3, v2: (x * x) / 3 }),
  },
  // Ruolo di raggio, lunghezza, viscosità e salto di pressione
  'SIM-C2-L008-02': {
    observe: "Cambia una sola condizione per prova. Il raddoppio del raggio e il raddoppio della lunghezza producono effetti diversi sulla portata.",
    measure: (x) => [16, 0.5, 0.5, 2][x - 1],
    apparatus: (x, y) => ({
      r1: x === 1 ? 0.7 : 0.35,
      r2: x === 1 ? 0.7 : 0.35,
      // v = Q/A: doubling radius multiplies area by four.
      v1: y / (2 * (x === 1 ? 4 : 1)),
      v2: y / (2 * (x === 1 ? 4 : 1)),
      lungo: x === 2,
    }),
  },
  // Resistenza idraulica
  'SIM-C2-L008-03': {
    observe: "Aumenta la portata nella stessa resistenza. Leggi quanta differenza di pressione serve per ciascun millilitro al secondo.",
    measure: (x) => 3 * x,
    apparatus: (x, y) => ({ serie: true, alto: x / 6, basso: x / 6, pressione: y / 24 }),
  },
  // Limiti dei modelli fisiologici
  'SIM-C2-L008-04': {
    observe: "Allarga il tubo della percentuale indicata. Confronta l’aumento relativo di portata con l’aumento relativo di raggio nel modello rigido.",
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
    observe: "Segui i collegamenti in serie e in parallelo. Controlla se l’equivalente in parallelo è minore di ciascuna resistenza.",
    measure: (x) => (2 * x) / (2 + x),
    apparatus: (x, y) => ({ alto: 0.8, basso: 1.6 / x, confronto: true }),
  },
  // Portata nei rami
  'SIM-C2-L009-02': {
    observe: "Mantieni la differenza di pressione fra i nodi. Cambia una resistenza e confronta le portate nei due rami.",
    measure: (x) => 12 / x,
    apparatus: (x, y) => ({ alto: y / 8, basso: 0.5 }),
  },
  // Resistenze e pressioni nei sistemi biologici
  'SIM-C2-L009-03': {
    observe: "Leggi la pressione alla presa intermedia variando la resistenza a valle. Controlla la previsione con le pressioni ai due estremi.",
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
    observe: "Individua entrambe le facce del film sul bordo mobile. La forza totale somma le trazioni delle due superfici.",
    measure: (x) => x,
    apparatus: (x, y) => ({ bordo: x / 5 }),
  },
  // Piccole quantità di liquido
  'SIM-C2-L010-02': {
    observe: "Confronta due gocce sferiche. Una goccia più piccola espone più superficie per unità di volume.",
    measure: (x) => 3 / x,
    apparatus: (x, y) => ({ raggio: x / 4 }),
  },
  // Bagnabilità e capillarità
  'SIM-C2-L010-03': {
    observe: "Porta l’angolo di contatto attraverso i 90°. Osserva il livello interno rispetto al pelo libero esterno e il segno della risalita.",
    measure: (x) => 10 * cos(x),
    apparatus: (x, y) => ({ livello: y / 10, angolo: x }),
  },
  // Interfacce piane e curve
  'SIM-C2-L010-04': {
    observe: "Parti dall’interfaccia piana e aumenta la curvatura. Confronta il salto di pressione con il reciproco del raggio.",
    measure: (x) => 100 * x,
    apparatus: (x, y) => ({ curvatura: x }),
  },
  // Legge di Laplace e pressione di curvatura
  'SIM-C2-L010-05': {
    observe: "Riduci il raggio della bolla. Confronta il salto di pressione delle sue due interfacce con quello di una singola interfaccia.",
    measure: (x) => 200 / x,
    apparatus: (x, y) => ({ raggio: x / 8, bolla: true }),
  },
};
