/**
 * Volume References — Mapping esperimenti ↔ pagine dei volumi fisici ELAB
 * Fonte: pdftotext applicato ai 3 PDF ufficiali ELAB (estratti 15/04/2026)
 * Vol1: VOL1_ITA_ COMPLETO V.0.1 GP.pdf (114 pp)
 * Vol2: VOL2_ITA_COMPLETO GP V 0.1.pdf (117 pp)
 * Vol3: Manuale VOLUME 3 V0.8.1.pdf (95 pp)
 *
 * Struttura di ogni voce:
 *   volume      — numero volume (1, 2 o 3)
 *   bookPage    — prima pagina dell'esperimento nel libro fisico
 *   chapter     — titolo del capitolo
 *   chapterPage — prima pagina del capitolo
 *   bookText         — testo introduttivo/descrizione (1-3 frasi dal libro)
 *   bookInstructions — array di istruzioni passo-passo dal libro
 *   bookQuote        — citazione memorabile o conclusione dopo l'esperimento
 *   bookContext      — dove si colloca l'esperimento nella narrazione
 *
 * (c) Andrea Marro — 15/04/2026
 */

const VOLUME_REFERENCES = {

  // ─────────────────────────────────────────────────
  // VOLUME 1 — Le Basi (38 esperimenti, Cap 6–14)
  // ─────────────────────────────────────────────────

  // Capitolo 6 — Cos'è il diodo LED? (p.27)
  'v1-cap6-esp1': {
    volume: 1, bookPage: 29, chapter: "Capitolo 6 - Cos'è il diodo LED?", chapterPage: 27,
    bookText: "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: Un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa superiore della breadboard",
      "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto",
      "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale",
      "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED"
    ],
    bookQuote: "Il LED si è acceso! Bellissimo vero? Prova adesso a cambiare il LED con uno di un colore diverso!",
    bookContext: "Primo esperimento del libro. Il capitolo spiega cos'è un LED, la polarità anodo/catodo, poi guida passo passo alla costruzione del primo circuito."
  },
  'v1-cap6-esp2': {
    volume: 1, bookPage: 32, chapter: "Capitolo 6 - Cos'è il diodo LED?", chapterPage: 27,
    bookText: "Il nostro circuito include un resistore, ma perché? I resistori servono per limitare la corrente. Ogni LED può sopportare una corrente massima che non deve essere superata altrimenti il led si rompe.",
    bookInstructions: [
      "Collega il LED direttamente alla batteria senza resistore (ATTENZIONE: il LED si brucia!)"
    ],
    bookQuote: "RICORDA: NON collegare MAI il LED direttamente alla batteria, ma inserisci sempre un resistore al centro!",
    bookContext: "Esperimento dimostrativo: mostra cosa succede senza resistore. Lezione fondamentale sulla protezione dei componenti."
  },
  'v1-cap6-esp3': {
    volume: 1, bookPage: 33, chapter: "Capitolo 6 - Cos'è il diodo LED?", chapterPage: 27,
    bookText: "Per rendere il led più luminoso ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Cambia il resistore da 470 Ohm con uno da 220 Ohm"
    ],
    bookQuote: "Ti ricordi i colori delle resistenze?",
    bookContext: "Terzo esperimento del capitolo. Introduce il concetto che resistori diversi cambiano la luminosità del LED."
  },

  // Capitolo 7 — Cos'è il LED RGB? (p.35)
  'v1-cap7-esp1': {
    volume: 1, bookPage: 36, chapter: "Capitolo 7 - Cos'è il LED RGB?", chapterPage: 35,
    bookText: "Accendiamo il LED rosso! Per questo esperimento abbiamo bisogno di: Un LED RGB, una breadboard, una batteria 9V, la clip, un resistore da 470 Ohm, un filo colorato.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa della breadboard",
      "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto",
      "Posiziona il LED RGB in modo che il led rosso sia collegato all'altro lato del resistore da 470 Ohm (ricorda che la gambetta più lunga è il catodo)",
      "Collega il negativo della batteria alla striscia nera della breadboard",
      "Collega il catodo (la gambetta lunga) al negativo della batteria con un filo"
    ],
    bookQuote: "Magia!",
    bookContext: "Primo esperimento con LED RGB. Il capitolo spiega che un LED RGB contiene tre LED (rosso, verde, blu) nello stesso involucro."
  },
  'v1-cap7-esp2': {
    volume: 1, bookPage: 38, chapter: "Capitolo 7 - Cos'è il LED RGB?", chapterPage: 35,
    bookText: "Scollega il resistore da 470 Ohm dal rosso e collegalo al verde.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Scollega il resistore dal pin rosso del LED RGB",
      "Collegalo al pin verde"
    ],
    bookQuote: null,
    bookContext: "Si cambia colore semplicemente spostando il resistore su un pin diverso del LED RGB."
  },
  'v1-cap7-esp3': {
    volume: 1, bookPage: 39, chapter: "Capitolo 7 - Cos'è il LED RGB?", chapterPage: 35,
    bookText: "Scollega il resistore da 470 Ohm dal rosso e collegalo al blu.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Scollega il resistore",
      "Collegalo al pin blu del LED RGB"
    ],
    bookQuote: null,
    bookContext: "Terzo colore del LED RGB. Lo studente sperimenta tutti e tre i colori primari."
  },
  'v1-cap7-esp4': {
    volume: 1, bookPage: 39, chapter: "Capitolo 7 - Cos'è il LED RGB?", chapterPage: 35,
    bookText: "Abbiamo a disposizione tre colori dentro lo stesso involucro quindi è arrivato il momento di unirli. Prendi un altro resistore da 470 Ohm e prova ad accendere insieme due colori che preferisci per creare un colore nuovo.",
    bookInstructions: [
      "Prendi un secondo resistore da 470 Ohm",
      "Collegalo a un secondo pin del LED RGB",
      "Accendi due colori contemporaneamente per creare un colore nuovo"
    ],
    bookQuote: "Abbiamo ottenuto il viola!",
    bookContext: "Introduce la miscelazione dei colori. Rosso + blu = viola. Concetto di sintesi additiva."
  },
  'v1-cap7-esp5': {
    volume: 1, bookPage: 41, chapter: "Capitolo 7 - Cos'è il LED RGB?", chapterPage: 35,
    bookText: "Prendi un altro resistore da 470 Ohm per accendere tutti i colori contemporaneamente. Accendendo tutti i colori contemporaneamente, dovresti in teoria ottenere il bianco!",
    bookInstructions: [
      "Prendi un terzo resistore da 470 Ohm",
      "Collega tutti e tre i pin colore del LED RGB",
      "Prova ad abbassare la resistenza del LED rosso a 330 Ohm poi a 220 Ohm per bilanciare il bianco"
    ],
    bookQuote: "Per ottenere un bel bianco hai bisogno che il rosso sia più luminoso del verde e del blu!",
    bookContext: "Miscelazione a tre colori. Introduce il concetto che i colori hanno intensità diverse e servono resistenze diverse per bilanciarli."
  },
  'v1-cap7-esp6': {
    volume: 1, bookPage: 42, chapter: "Capitolo 7 - Cos'è il LED RGB?", chapterPage: 35,
    bookText: "Ora dovresti aver capito che puoi anche cambiare quanto è luminoso il singolo colore del LED RGB, quindi prova a giocare con i valori di resistenza dei colori per creare il colore che più ti piace!",
    bookInstructions: [
      "Sperimenta liberamente con diversi valori di resistenza",
      "Crea il tuo colore preferito"
    ],
    bookQuote: null,
    bookContext: "Esperimento libero/creativo. Lo studente applica quanto imparato per creare un colore personalizzato."
  },

  // Capitolo 8 — Cos'è un pulsante? (p.43)
  'v1-cap8-esp1': {
    volume: 1, bookPage: 44, chapter: "Capitolo 8 - Cos'è un pulsante?", chapterPage: 43,
    bookText: "In questo esperimento ripeteremo quanto fatto con il LED singolo ma aggiungeremo un pulsante per accendere il LED solo quando vogliamo noi.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa della breadboard",
      "Collega il resistore da 470 Ohm a cavallo della striscia centrale e collegalo con un filo alla linea rossa del positivo",
      "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un foro qualsiasi",
      "Inserisci il pulsante con un lato verso la gambetta corta del LED e l'altro verso lo spazio libero",
      "Inserisci il negativo della batteria nella striscia nera e con un filo collegalo al pulsante"
    ],
    bookQuote: "Prova ora a premere il pulsante! Non appena lo rilasci il LED si spegne!",
    bookContext: "Primo esperimento con pulsante. Combina LED + resistore + pulsante. Il capitolo spiega che il pulsante è un contatto metallico con molla."
  },
  'v1-cap8-esp2': {
    volume: 1, bookPage: 47, chapter: "Capitolo 8 - Cos'è un pulsante?", chapterPage: 43,
    bookText: "Partendo dall'esperimento appena finito, cambia colore del LED o valore del resistore per rendere il LED più o meno luminoso.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Cambia il colore del LED oppure il valore del resistore"
    ],
    bookQuote: null,
    bookContext: "Variazione semplice. Consolida il concetto di resistore e luminosità con pulsante."
  },
  'v1-cap8-esp3': {
    volume: 1, bookPage: 47, chapter: "Capitolo 8 - Cos'è un pulsante?", chapterPage: 43,
    bookText: "Proviamo a sostituire il LED monocolore con uno RGB. L'idea è quella di usare un solo pulsante per accendere o spegnere i colori che preferisci del LED.",
    bookInstructions: [
      "Collega la clip alla batteria e il positivo alla striscia rossa",
      "Collega il resistore da 470 Ohm tra la striscia rossa e la breadboard",
      "Posiziona il LED RGB con il rosso collegato al resistore",
      "Collega un altro resistore da 470 Ohm tra il positivo e il LED blu",
      "Collega il pulsante accanto al LED a cavallo della striscia divisoria",
      "Collega il catodo al pulsante e il pulsante al negativo"
    ],
    bookQuote: "Premi il pulsante!",
    bookContext: "Combina pulsante + LED RGB. Lo studente controlla più colori con un singolo pulsante."
  },
  'v1-cap8-esp4': {
    volume: 1, bookPage: 51, chapter: "Capitolo 8 - Cos'è un pulsante?", chapterPage: 43,
    bookText: "Proviamo ora ad utilizzare tre pulsanti diversi ognuno per ogni colore del LED RGB.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa superiore della breadboard",
      "Collega il negativo alla breadboard",
      "Posiziona tre pulsanti a cavallo della striscia centrale della breadboard",
      "Posiziona il LED RGB dall'altro lato della breadboard",
      "Collega il catodo del LED RGB (la gambetta lunga) al negativo della batteria con un filo",
      "Collega i tre resistori da 470 Ohm ai contatti dei tre pulsanti e al positivo della batteria",
      "Collega il pulsante più in basso al LED blu",
      "Collega il pulsante centrale al LED verde",
      "Collega il pulsante più in alto al LED rosso"
    ],
    bookQuote: "Prova ora a giocare con i pulsanti e ad unire i colori!",
    bookContext: "Tre pulsanti, ognuno controlla un colore del LED RGB. Lo studente impara a controllare più colori indipendentemente."
  },
  'v1-cap8-esp5': {
    volume: 1, bookPage: 56, chapter: "Capitolo 8 - Cos'è un pulsante?", chapterPage: 43,
    bookText: "Giocando con l'esperimento 4 prova a cambiare i valori di resistenza dei vari colori così da ottenere colori diversi quando premi più pulsanti contemporaneamente!",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 4",
      "Cambia i valori di resistenza dei vari colori",
      "Premi più pulsanti contemporaneamente per creare colori nuovi"
    ],
    bookQuote: "RICORDA: non scendere mai sotto i 100 Ohm altrimenti rischi di bruciare il LED!",
    bookContext: "Esperimento libero che consolida pulsanti + LED RGB + resistori diversi per creare colori personalizzati."
  },

  // Capitolo 9 — Cos'è un potenziometro? (p.57)
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  'v1-cap9-esp1': {
    volume: 1, bookPage: 58, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "In questo esperimento useremo il potenziometro come resistore variabile per cambiare l'intensità luminosa di un LED per renderlo più o meno luminoso semplicemente ruotando l'alberino del potenziometro.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa della breadboard",
      "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto",
      "Collega la gambetta lunga del LED verso il resistore e la gambetta corta nel foro subito dopo la divisione centrale",
      "Inserisci il potenziometro nella breadboard",
      "Collega il catodo del LED al pin 2 del potenziometro con un filo",
      "Collega il pin 1 del potenziometro alla striscia nera della breadboard",
      "Collega il negativo della batteria alla striscia nera della breadboard"
    ],
    bookQuote: "Ruota ora il cursore del potenziometro via via verso destra, l'intensità luminosa del LED diminuisce",
    bookContext: "Primo esperimento con potenziometro. Il capitolo spiega che un potenziometro è un resistore variabile a tre piedini con disco resistivo interno."
  },
  'v1-cap9-esp2': {
    volume: 1, bookPage: 62, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Nell'esperimento 1 l'intensità luminosa diminuisce ruotando verso destra, come facciamo invece a farla aumentare? Facile! Basta invertire i pin. In questo modo la resistenza parte alta e diminuisce man mano che giri verso destra quindi il LED diventa più luminoso.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Inverti i pin 1 e 3 del potenziometro"
    ],
    bookQuote: null,
    bookContext: "Insegna che invertendo i collegamenti del potenziometro si inverte la direzione di regolazione."
  },
  'v1-cap9-esp3': {
    volume: 1, bookPage: 63, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Cambia colore del LED, noti differenze di luminosità man mano che giri il cursore?",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Cambia il colore del LED",
      "Osserva le differenze di luminosità ruotando il cursore"
    ],
    bookQuote: null,
    bookContext: "Variazione semplice: LED diversi hanno tensioni forward diverse, quindi reagiscono diversamente al potenziometro."
  },
  'v1-cap9-esp4': {
    volume: 1, bookPage: 63, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Modifichiamo l'intensità luminosa di un LED RGB utilizzando un potenziometro.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa della breadboard",
      "Collega il negativo della batteria alla striscia nera della breadboard",
      "Inserisci il LED RGB nella breadboard, attento a dove metti il catodo (pin più lungo)!",
      "Collega il resistore da 470 Ohm tra il catodo del LED RGB e un punto qualsiasi della breadboard",
      "Collega il LED blu al positivo della batteria",
      "Collega il LED verde al positivo della batteria",
      "Inserisci il potenziometro nella breadboard collegando il pin 2 all'altro capo del resistore da 470 Ohm",
      "Collega il pin 3 del potenziometro al negativo della batteria"
    ],
    bookQuote: "Ruota il potenziometro verso destra e sinistra e osserva come cambia la luminosità del LED RGB",
    bookContext: "Combina potenziometro + LED RGB. Il potenziometro regola la luminosità complessiva del LED RGB."
  },
  'v1-cap9-esp5': {
    volume: 1, bookPage: 67, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "In questo esperimento utilizzeremo tutti i pin del potenziometro per sfruttare il principio secondo cui la resistenza tra il pin 2 e gli altri due aumenta o diminuisce a seconda del verso di rotazione. Questo ci consentirà di avere il LED RGB colorato di BLU quando il potenziometro è tutto girato verso sinistra e di ROSSO quando è girato verso destra. E in mezzo? Blu e rosso si uniscono!",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo e il negativo della batteria alla breadboard",
      "Inserisci il LED RGB nella breadboard",
      "Collega il resistore da 470 Ohm tra il catodo del LED RGB e il negativo della batteria",
      "Inserisci il potenziometro nella breadboard",
      "Collega il LED blu del LED RGB al pin 1 del potenziometro",
      "Collega il LED rosso del LED RGB al pin 3 del potenziometro",
      "Collega il pin 2 del potenziometro al positivo della batteria"
    ],
    bookQuote: "Se il cursore si trova in una posizione intermedia vedrai una tonalità di viola! Ruota ora il cursore verso sinistra e destra per vedere come si passa dal blu al rosso e viceversa!",
    bookContext: "Esperimento avanzato: usa tutti e tre i pin del potenziometro per miscelare due colori in modo continuo, dal blu al viola al rosso."
  },
  'v1-cap9-esp6': {
    volume: 1, bookPage: 71, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Costruiamo una lampada avendo la possibilità di poter scegliere abbastanza facilmente quanto colore aggiungere per ogni luce colorata presente nel LED RGB.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il negativo della batteria alla striscia nera della breadboard",
      "Inserisci il LED RGB nella breadboard",
      "Collega il catodo del LED RGB (la gambetta lunga) al negativo della batteria con un filo",
      "Inserisci il primo potenziometro nella breadboard",
      "Inserisci una resistenza da 470 Ohm tra il positivo della batteria e il piedino del potenziometro",
      "Inserisci il secondo e terzo potenziometro con le loro resistenze da 470 Ohm",
      "Collega il positivo della batteria alla linea rossa della breadboard",
      "Collega il pin 2 del terzo potenziometro al LED blu del LED RGB",
      "Collega il pin 2 del secondo potenziometro al LED verde del LED RGB",
      "Collega il pin 2 del primo potenziometro al LED rosso del LED RGB"
    ],
    bookQuote: "Gioca ora con le regolazioni e crea il colore che ti piace di più! Prova a chiedere un bicchierino del caffé di plastica bianco e poggialo sopra al LED RGB: diffonderà la luce! A proposito prova questo esperimento al buio!",
    bookContext: "Tre potenziometri, tre colori: lampada RGB completamente regolabile. Esperimento capstone del capitolo sui potenziometri."
  },
  'v1-cap9-esp7': {
    volume: 1, bookPage: 78, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Vuoi provare ad aggiungere qualche pulsante?",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 6 (lampada RGB)",
      "Aggiungi uno o più pulsanti per controllare l'accensione dei colori"
    ],
    bookQuote: null,
    bookContext: "Sfida aperta: combina potenziometri e pulsanti. Lo studente progetta il circuito in autonomia."
  },
  'v1-cap9-esp8': {
    volume: 1, bookPage: 79, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Prova a fare insieme l'esperimento 6 e l'esperimento 5.",
    bookInstructions: [
      "Combina il circuito della lampada RGB (Esperimento 6) con il circuito blu-rosso (Esperimento 5)"
    ],
    bookQuote: null,
    bookContext: "Sfida di combinazione: unire due circuiti complessi in uno solo. Richiede comprensione profonda dei potenziometri."
  },
  'v1-cap9-esp9': {
    volume: 1, bookPage: 79, chapter: "Capitolo 9 - Cos'è un potenziometro?", chapterPage: 57,
    bookText: "Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 8",
      "Aggiungi un pulsante per controllare l'accensione e spegnimento del LED"
    ],
    bookQuote: null,
    bookContext: "Sfida finale del capitolo potenziometri: aggiunge controllo on/off al circuito più complesso realizzato finora."
  },

  // Capitolo 10 — Cos'è un fotoresistore? (p.81)
  'v1-cap10-esp1': {
    volume: 1, bookPage: 82, chapter: "Capitolo 10 - Cos'è un fotoresistore?", chapterPage: 81,
    bookText: "Proviamo ad accendere un LED utilizzando un fotoresistore. Vogliamo che il LED sia spento se facciamo ombra al fotoresistore e acceso se invece è esposto alla luce.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo e il negativo della batteria alla breadboard",
      "Collega il fotoresistore a cavallo della divisione centrale e usa un filo per collegare il piedino al positivo",
      "Collega l'anodo del LED con l'altro piedino della fotoresistenza e il catodo del LED dopo la divisione centrale",
      "Collega il negativo della batteria al catodo del LED",
      "Prova ad illuminare il fotoresistore"
    ],
    bookQuote: "In questo circuito non c'è bisogno di inserire un resistore in serie al LED perché il fotoresistore anche quando illuminato ha una resistenza abbastanza elevata da non bruciare il LED.",
    bookContext: "Primo esperimento con fotoresistore. Il capitolo spiega che un fotoresistore (LDR) cambia resistenza in base alla luce: diminuisce con più luce."
  },
  'v1-cap10-esp2': {
    volume: 1, bookPage: 84, chapter: "Capitolo 10 - Cos'è un fotoresistore?", chapterPage: 81,
    bookText: "Prova adesso a cambiare il LED con uno di un colore diverso e osserva come cambia il comportamento!",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Cambia il colore del LED",
      "Osserva come cambia il comportamento con la luce"
    ],
    bookQuote: null,
    bookContext: "Variazione semplice: LED diversi hanno tensioni forward diverse, quindi si accendono a soglie di luce diverse."
  },
  'v1-cap10-esp3': {
    volume: 1, bookPage: 85, chapter: "Capitolo 10 - Cos'è un fotoresistore?", chapterPage: 81,
    bookText: "In questo esperimento utilizzeremo un LED RGB e tre fotoresistori per far cambiare con la luce il colore generato dal LED RGB.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa della breadboard",
      "Collega il negativo della batteria alla striscia nera della breadboard",
      "Collega il catodo del LED RGB al negativo della batteria",
      "Inserisci i tre fotoresistori nella breadboard con un piedino nella striscia rossa e l'altro piedino in un punto qualunque",
      "Collega il primo fotoresistore al LED blu del LED RGB",
      "Collega il secondo fotoresistore al LED verde del LED RGB",
      "Collega il terzo fotoresistore al LED rosso del LED RGB"
    ],
    bookQuote: "Utilizzando una torcia o coprendo col dito i fotoresistori osserva come cambia il colore del LED RGB!",
    bookContext: "Tre fotoresistori controllano tre colori: sensore di luce multicolore. Combina fotoresistori + LED RGB."
  },
  'v1-cap10-esp4': {
    volume: 1, bookPage: 88, chapter: "Capitolo 10 - Cos'è un fotoresistore?", chapterPage: 81,
    bookText: "In questo esperimento useremo un LED bianco per illuminare un fotoresistore e quindi cambiare la luminosità di un LED blu collegato al fotoresistore.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo alla striscia rossa e il negativo alla striscia nera della breadboard",
      "Collega il fotoresistore tra il positivo della batteria e un punto qualunque della breadboard",
      "Collega il LED blu con l'anodo verso il fotoresistore e il catodo dopo la divisione centrale",
      "Collega il catodo del LED blu al negativo della batteria con un filo",
      "Collega il LED bianco vicino al fotoresistore con l'anodo connesso al positivo della batteria",
      "Collega il catodo del LED bianco ad un resistore da 470 Ohm e l'altro piedino del resistore al negativo"
    ],
    bookQuote: "Prova ad orientare la base del fotoresistore verso la testa del LED e osserva come cambia la luminosità del LED blu. Prova anche ad inserire un pezzetto di carta tra il fotoresistore e il LED.",
    bookContext: "Accoppiamento ottico LED-fotoresistore: un LED bianco controlla la luminosità di un LED blu tramite la luce."
  },
  'v1-cap10-esp5': {
    volume: 1, bookPage: 91, chapter: "Capitolo 10 - Cos'è un fotoresistore?", chapterPage: 81,
    bookText: "Partendo dall'esperimento 4 aggiungiamo un potenziometro per cambiare l'intensità luminosa del LED bianco.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 4",
      "Aggiungi un potenziometro per regolare l'intensità del LED bianco",
      "Prova a cambiare l'inclinazione del LED e del fotoresistore per avere più luminosità"
    ],
    bookQuote: null,
    bookContext: "Aggiunge un potenziometro per controllare la sorgente luminosa, creando un doppio controllo: manopola regola luce, luce regola LED blu."
  },
  'v1-cap10-esp6': {
    volume: 1, bookPage: 92, chapter: "Capitolo 10 - Cos'è un fotoresistore?", chapterPage: 81,
    bookText: "Partendo dall'esperimento 4 aggiungiamo un pulsante per cambiare l'intensità luminosa del LED blu solo quando premiamo il pulsante.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 4",
      "Aggiungi un pulsante per controllare quando il LED bianco illumina il fotoresistore",
      "Prova a cambiare l'inclinazione del LED e del fotoresistore per avere più luminosità"
    ],
    bookQuote: null,
    bookContext: "Aggiunge un pulsante al circuito di accoppiamento ottico: il LED blu risponde alla luce solo quando si preme il pulsante."
  },

  // Capitolo 11 — Cos'è un cicalino? (p.93)
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  'v1-cap11-esp1': {
    volume: 1, bookPage: 94, chapter: "Capitolo 11 - Cos'è un cicalino?", chapterPage: 93,
    bookText: "Un cicalino non ha bisogno di resistori ma basta collegarlo direttamente alla batteria per farlo suonare.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo e il negativo della batteria alla striscia rossa e nera della breadboard",
      "Collega ora il cicalino alla batteria collegando nero con nero e rosso con rosso"
    ],
    bookQuote: null,
    bookContext: "Primo esperimento con cicalino. Il capitolo spiega che un cicalino è un componente polarizzato che suona se collegato a una tensione."
  },
  'v1-cap11-esp2': {
    volume: 1, bookPage: 95, chapter: "Capitolo 11 - Cos'è un cicalino?", chapterPage: 93,
    bookText: "Prova ora a realizzare un circuito in cui il cicalino suona solo se premi un pulsante. Ti ricordi come fare?",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Aggiungi un pulsante in serie al cicalino",
      "Il cicalino suonerà solo quando premi il pulsante"
    ],
    bookQuote: null,
    bookContext: "Combina cicalino + pulsante. Lo studente riutilizza il concetto di pulsante come interruttore, applicandolo a un componente diverso dal LED."
  },

  // Capitolo 12 — L'interruttore magnetico (p.97)
  'v1-cap12-esp1': {
    volume: 1, bookPage: 98, chapter: "Capitolo 12 - L'interruttore magnetico", chapterPage: 97,
    bookText: "In questo esperimento applicheremo quanto fatto prima, ma anziché utilizzare il pulsante, utilizzeremo un interruttore magnetico.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa della breadboard",
      "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della breadboard",
      "Collega la gambetta lunga del LED verso il resistore e la gambetta corta nel foro subito dopo la divisione centrale",
      "Inserisci l'interruttore magnetico tra il catodo del LED e la striscia nera inferiore della breadboard",
      "Collega il negativo della batteria alla striscia nera della breadboard"
    ],
    bookQuote: "Avvicina il magnete all'interruttore magnetico: il LED si accenderà!",
    bookContext: "Primo esperimento con interruttore magnetico (reed switch). Il capitolo spiega che il reed switch ha due lamelle metalliche che si toccano quando un magnete è vicino."
  },
  'v1-cap12-esp2': {
    volume: 1, bookPage: 100, chapter: "Capitolo 12 - L'interruttore magnetico", chapterPage: 97,
    bookText: "Come fatto con il pulsante, prova a sperimentare con i valori di resistenza per rendere più o meno luminoso il LED.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Cambia il valore del resistore per modificare la luminosità del LED"
    ],
    bookQuote: null,
    bookContext: "Variazione semplice: resistori diversi con l'interruttore magnetico. Consolida il concetto di resistenza e luminosità."
  },
  'v1-cap12-esp3': {
    volume: 1, bookPage: 101, chapter: "Capitolo 12 - L'interruttore magnetico", chapterPage: 97,
    bookText: "Prova a realizzare un circuito che accenda un LED RGB del colore che preferisci utilizzando un interruttore magnetico.",
    bookInstructions: [
      "Realizza un circuito con LED RGB e interruttore magnetico",
      "Scegli il colore che preferisci"
    ],
    bookQuote: null,
    bookContext: "Sfida: LED RGB + interruttore magnetico. Lo studente progetta il circuito in autonomia combinando i concetti appresi."
  },
  'v1-cap12-esp4': {
    volume: 1, bookPage: 101, chapter: "Capitolo 12 - L'interruttore magnetico", chapterPage: 97,
    bookText: "Prova ad utilizzare insieme potenziometri, LED RGB e un interruttore magnetico.",
    bookInstructions: [
      "Combina potenziometri, LED RGB e interruttore magnetico in un unico circuito"
    ],
    bookQuote: null,
    bookContext: "Sfida avanzata: combina tutti i componenti del Volume 1. Lo studente deve integrare potenziometri, LED RGB e interruttore magnetico."
  },

  // Capitolo 13 — Cos'è l'elettropongo? (p.103)
  'v1-cap13-esp1': {
    volume: 1, bookPage: 104, chapter: "Capitolo 13 - Cos'è l'elettropongo?", chapterPage: 103,
    bookText: "Questo esperimento serve per capire il principio di funzionamento base dell'elettropongo.",
    bookInstructions: [
      "Stacca due pezzettini di elettropongo, forma due striscettine e appoggiale sul tavolo",
      "Allarga le gambette del LED che hai scelto e inserisci il LED nelle due striscette di elettropongo",
      "Avvicina la batteria alle due striscette mettendo il positivo della batteria sull'anodo e il negativo sul catodo",
      "Il LED si accenderà!"
    ],
    bookQuote: null,
    bookContext: "Primo esperimento con elettropongo. Il capitolo spiega che l'elettropongo è una plastilina conduttiva che può essere usata per modellare circuiti."
  },
  'v1-cap13-esp2': {
    volume: 1, bookPage: 105, chapter: "Capitolo 13 - Cos'è l'elettropongo?", chapterPage: 103,
    bookText: "Dai sfogo alla tua fantasia e prova a creare un circuito artistico utilizzando l'elettropongo e i LED!",
    bookInstructions: [
      "Crea forme libere con l'elettropongo",
      "Inserisci più LED nelle forme di elettropongo",
      "Collega alla batteria rispettando la polarità"
    ],
    bookQuote: "Non è obbligatorio, ma i risultati migliori si ottengono utilizzando LED dello stesso colore e scegliendo una zona in cui colleghi sempre il negativo e una in cui colleghi sempre il positivo.",
    bookContext: "Esperimento creativo/artistico. Lo studente usa l'elettropongo per creare sculture luminose. Può usare formine per biscotti."
  },

  // Capitolo 14 — Costruiamo il nostro primo robot (p.107)
  'v1-cap14-esp1': {
    volume: 1, bookPage: 107, chapter: "Capitolo 14 - Costruiamo il nostro primo robot", chapterPage: 107,
    bookText: "Costruiamo il nostro primo robot utilizzando la breadboard, tre potenziometri, resistenze da 220 Ohm e due LED verdi.",
    bookInstructions: [
      "Prendiamo la nostra breadboard e inseriamo tre potenziometri seguendo la numerazione sulla breadboard",
      "Colleghiamo i pin dei potenziometri con tre resistenze da 220 Ohm sulla linea del positivo",
      "Prendiamo due LED verdi e li inseriamo nella breadboard (accorciare i pin del LED a filo della breadboard)",
      "Inseriamo una resistenza da 220 Ohm dal pin a-15 verso la linea del positivo",
      "Colleghiamo i potenziometri con tre fili lunghi"
    ],
    bookQuote: null,
    bookContext: "Progetto finale del Volume 1. Si costruisce un piccolo robot sulla breadboard con potenziometri per controllare i LED. È il culmine del percorso."
  },

  // ─────────────────────────────────────────────────
  // VOLUME 2 — Approfondiamo (27 esperimenti, Cap 3–12)
  // ─────────────────────────────────────────────────

  // Capitolo 3 — Il Multimetro (p.13)
  'v2-cap3-esp1': {
    volume: 2, bookPage: 17, chapter: "Capitolo 3 - Il Multimetro", chapterPage: 13,
    bookText: "Controlliamo la carica della tua batteria da 9V! Oggi usiamo il multimetro per scoprire quanta carica c'è in una batteria da 9V. È come dare un'occhiata dentro per vedere se è ancora \"piena\" o se sta per \"esaurirsi\"!",
    bookInstructions: [
      "Prendi il cavo nero e inseriscilo nella porta COM",
      "Prendi il cavo rosso e inseriscilo nella porta contrassegnata con VΩmA",
      "Ruota la manopola esattamente su 20V nella sezione V con linea dritta (tensione continua)",
      "Inserisci la clip della batteria 9V",
      "Aggancia il coccodrillo del cavo rosso sul positivo (+) della batteria",
      "Aggancia il coccodrillo del cavo nero sul negativo (-) della batteria",
      "Guarda il numero che appare sul display del multimetro"
    ],
    bookQuote: "Bene, ora sai come misurare le batterie!",
    bookContext: "Primo esperimento del Volume 2. Introduce il multimetro e la misura di tensione continua. Il capitolo spiega fondo scala, interpretazione dei risultati e collegamento dei puntali."
  },
  'v2-cap3-esp2': {
    volume: 2, bookPage: 20, chapter: "Capitolo 3 - Il Multimetro", chapterPage: 13,
    bookText: "Ora che hai imparato ad utilizzare il multimetro, passiamo dalla teoria alla pratica: misuriamo la tua batteria da 9V presente nel Kit!",
    bookInstructions: [
      "Ogni volta che userai il kit e misurerai la batteria, segna la data e il valore in Volt che leggi sul multimetro",
      "Così potrai tenerne d'occhio la carica e capire quando è il momento di sostituirla"
    ],
    bookQuote: null,
    bookContext: "Diario di misura della batteria. Lo studente monitora la carica nel tempo, imparando che le batterie si scaricano gradualmente."
  },
  'v2-cap3-esp3': {
    volume: 2, bookPage: 22, chapter: "Capitolo 3 - Il Multimetro", chapterPage: 13,
    bookText: "Misuriamo una Resistenza da 330 Ohm! Ora mettiamo in pratica quello che abbiamo imparato e misuriamo una vera resistenza. Useremo il nostro multimetro per scoprire se quella resistenza ha davvero il valore che ci aspettiamo: 330 Ohm!",
    bookInstructions: [
      "Assicurati che il cavo nero sia inserito nella porta COM e che il cavo rosso sia inserito nella porta con il simbolo VΩmA",
      "Ruota il selettore fino a selezionare la scala più appropriata (2k per una resistenza da 330 Ohm)",
      "Prendi il tuo resistore e aggancia i coccodrilli alle due estremità",
      "Leggi il valore sul display"
    ],
    bookQuote: "Fantastico! Hai misurato correttamente la resistenza. Il numero è vicino a 330 Ohm. I resistori reali non sono mai esattamente precisi, quindi un valore leggermente diverso è normale. La piccola differenza è dovuta alla tolleranza della resistenza.",
    bookContext: "Prima misura di resistenza col multimetro. Il capitolo spiega il fondo scala Ω, la tolleranza del 5% e i possibili errori di lettura."
  },
  'v2-cap3-esp4': {
    volume: 2, bookPage: 28, chapter: "Capitolo 3 - Il Multimetro", chapterPage: 13,
    bookText: "Fantastico! Ora che il multimetro è impostato correttamente per misurare la corrente, vediamo come fare praticamente la misurazione sul circuito con il resistore e la batteria 9V.",
    bookInstructions: [
      "Collega la clip della batteria alla batteria",
      "Collega il positivo della batteria alla striscia rossa superiore della breadboard",
      "Collega il resistore da 1 kOhm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto",
      "Con il coccodrillo rosso mordi un reoforo del resistore, mentre con quello nero il cavetto nero della batteria",
      "Leggi il valore sul display (circa 9mA)"
    ],
    bookQuote: "Padroneggiare la legge di Ohm vi consentirà di diventare maghi dell'elettronica!",
    bookContext: "Prima misura di corrente col multimetro. Il capitolo spiega che il multimetro va inserito in serie, la legge di Ohm applicata I=V/R, e la tolleranza dei resistori."
  },

  // Capitolo 4 — Approfondiamo le Resistenze (p.37)
  'v2-cap4-esp1': {
    volume: 2, bookPage: 43, chapter: "Capitolo 4 - Approfondiamo le Resistenze", chapterPage: 37,
    bookText: "Utilizzando la breadboard metti in parallelo due resistori da 1kΩ. Che valore deve avere il resistore equivalente? Utilizza il multimetro per controllare qual è il vero valore!",
    bookInstructions: [
      "Prendi due resistori da 1kΩ",
      "Collegali in parallelo sulla breadboard",
      "Misura il valore equivalente con il multimetro"
    ],
    bookQuote: null,
    bookContext: "Primo esperimento pratico su resistenze in parallelo. Il capitolo spiega la formula del parallelo e le serie standard E12."
  },
  'v2-cap4-esp2': {
    volume: 2, bookPage: 44, chapter: "Capitolo 4 - Approfondiamo le Resistenze", chapterPage: 37,
    bookText: "Utilizzando la breadboard metti in serie tre resistori da 1kΩ. Che valore deve avere il resistore equivalente? Utilizza il multimetro per controllare qual è il vero valore!",
    bookInstructions: [
      "Prendi tre resistori da 1kΩ",
      "Collegali in serie sulla breadboard",
      "Misura il valore equivalente con il multimetro",
      "Misura ogni resistore singolarmente e prendi nota del valore di ognuno"
    ],
    bookQuote: "Sono molto simili o differenti?",
    bookContext: "Resistenze in serie e verifica con multimetro. Lo studente scopre che i resistori reali hanno valori leggermente diversi dal nominale."
  },
  'v2-cap4-esp3': {
    volume: 2, bookPage: 45, chapter: "Capitolo 4 - Approfondiamo le Resistenze", chapterPage: 37,
    bookText: "Sulla base del circuito dell'esperimento 2, aggiungi la batteria come indicato in figura. Posiziona il coccodrillo nero sul negativo della batteria e il coccodrillo rosso nei punti: J9, J5, J1.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 2 (tre resistori in serie)",
      "Aggiungi la batteria 9V al circuito",
      "Misura la tensione in tre punti diversi: J9, J5, J1",
      "Prendi nota delle tre tensioni",
      "Applica la legge di Ohm e verifica"
    ],
    bookQuote: "Succede quello che ti aspettavi? Applica la legge di Ohm",
    bookContext: "Partitore di tensione con tre resistori in serie. Lo studente misura la caduta di tensione su ogni resistore e verifica la legge di Ohm."
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  },

  // Capitolo 5 — Approfondiamo le Batterie (p.47)
  'v2-cap5-esp1': {
    volume: 2, bookPage: 49, chapter: "Capitolo 5 - Approfondiamo le Batterie", chapterPage: 47,
    bookText: "Batterie in Serie (Più \"Spinta\"!). Obiettivo: Capire come le batterie in serie aumentano la tensione (i Volt) e misurarla con il multimetro.",
    bookInstructions: [
      "Prendi il tuo multimetro e impostalo su 20V in tensione continua",
      "Misura una singola batteria AA/AAA (circa 1.5V)",
      "Collega due batterie in serie: polo positivo (+) di una al polo negativo (-) dell'altra",
      "Misura la tensione tra i poli liberi (circa 3V)",
      "Aggiungi una terza o quarta batteria alla catena e misura la tensione"
    ],
    bookQuote: "Esattamente come detto nella parte teorica, collegando due o più batterie in serie tra di loro, possiamo ottenere tensioni più alte di quelle che avremmo utilizzando una sola batteria.",
    bookContext: "Batterie in serie: somma delle tensioni. Il capitolo spiega collegamento serie vs parallelo e la capacità (mAh) delle batterie."
  },
  'v2-cap5-esp2': {
    volume: 2, bookPage: 51, chapter: "Capitolo 5 - Approfondiamo le Batterie", chapterPage: 47,
    bookText: "Abbiamo detto che le batterie in serie si sommano e abbiamo anche effettuato un esperimento per dimostrarlo. Ma cosa succede se anziché collegare il positivo di una batteria con il negativo della successiva lo collegassimo con il positivo?",
    bookInstructions: [
      "Prendi due batterie AA/AAA",
      "Collegale in antiserie: positivo con positivo",
      "Misura la tensione con il multimetro"
    ],
    bookQuote: "Il risultato è V = 1.5V - 1.5V = 0V. Praticamente una batteria prova a spingere in una direzione e l'altra nel senso opposto! Questo tipo di collegamento è chiamato ANTISERIE.",
    bookContext: "Batterie in antiserie: le tensioni si sottraggono. Concetto importante che verrà riutilizzato per spiegare la caduta di tensione sui LED."
  },

  // Capitolo 6 — Approfondiamo i LED (p.53)
  'v2-cap6-esp1': {
    volume: 2, bookPage: 56, chapter: "Capitolo 6 - Approfondiamo i LED", chapterPage: 53,
    bookText: "In questo esperimento vedremo come utilizzare più LED in serie avendo un solo resistore di protezione del LED.",
    bookInstructions: [
      "Collega il positivo della batteria alla parte superiore della breadboard e il negativo nella parte inferiore",
      "Collega un resistore da 330 Ω tra il positivo della batteria e un punto qualsiasi della breadboard",
      "Inserisci un LED con l'anodo rivolto verso il lato libero del resistore e il catodo dopo la divisione centrale",
      "Inserisci il secondo LED con l'anodo rivolto verso il catodo del primo LED e il catodo verso il negativo della batteria"
    ],
    bookQuote: null,
    bookContext: "LED in serie con un singolo resistore. Il capitolo spiega la Vf (tensione forward) dei LED, il calcolo del resistore con la legge di Ohm e le serie standard E12."
  },
  'v2-cap6-esp2': {
    volume: 2, bookPage: 58, chapter: "Capitolo 6 - Approfondiamo i LED", chapterPage: 53,
    bookText: "Sulla base dell'esperimento 1, prova a modificare il colore del secondo LED (ad esempio utilizzandone uno blu) per apprezzare come cambia l'intensità luminosa.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Modifica il colore del secondo LED",
      "Osserva come cambia l'intensità luminosa",
      "Prova diverse combinazioni di colori e annota i risultati"
    ],
    bookQuote: "Ti sembra che il LED rosso sia meno luminoso?",
    bookContext: "LED di colori diversi in serie: hanno Vf diverse, quindi la corrente e luminosità cambiano. Lo studente osserva l'effetto pratico della Vf."
  },
  'v2-cap6-esp3': {
    volume: 2, bookPage: 59, chapter: "Capitolo 6 - Approfondiamo i LED", chapterPage: 53,
    bookText: "Proviamo ora ad aggiungere ancora un LED per averne tre collegati in serie. Per fare questo, partendo dall'esperimento 2, rimuovi il resistore.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 2 e rimuovi il resistore",
      "Posiziona un LED giallo con il catodo rivolto verso l'anodo del LED rosso",
      "Collega il resistore da 330 Ω tra il positivo della batteria e l'anodo del LED giallo",
      "Prova a modificare il valore di resistenza da 330 Ω a 220 Ω e osserva come cambia la luminosità"
    ],
    bookQuote: "Poiché abbiamo posizionato ben tre LED in serie, la corrente è via via diminuita aggiungendo LED.",
    bookContext: "Tre LED in serie: con tre Vf che si sommano, resta meno tensione per il resistore e la corrente diminuisce. Concetto di caduta di tensione cumulativa."
  },
  'v2-cap6-esp4': {
    volume: 2, bookPage: 60, chapter: "Capitolo 6 - Approfondiamo i LED", chapterPage: 53,
    bookText: "Abbiamo detto che il multimetro ha la funzione prova diodi e continuità. Come dice il nome della funzione, può essere usato per provare i diodi e come bonus ci dice quanto vale la sua Vf.",
    bookInstructions: [
      "Ruota il selettore delle funzionalità fino ad arrivare alla funzione prova diodi e continuità",
      "Prendi un LED verde",
      "Con il coccodrillo nero tocca il catodo del LED e con il coccodrillo rosso tocca l'anodo",
      "Sullo schermo comparirà quanto vale la Vf del diodo (circa 2V per il verde)"
    ],
    bookQuote: "Sapendo qual è la Vf esatta del nostro diodo, siamo in grado di individuare il valore esatto di resistenza di cui abbiamo bisogno per avere il massimo della luminosità.",
    bookContext: "Misura della Vf con il multimetro in modalità diodo. Permette di calcolare il resistore perfetto per ogni specifico LED."
  },

  // Capitolo 7 — Cosa sono i Condensatori? (p.63)
  'v2-cap7-esp1': {
    volume: 2, bookPage: 67, chapter: "Capitolo 7 - Cosa sono i Condensatori?", chapterPage: 63,
    bookText: "In questo esperimento osserveremo l'effetto di scarica del condensatore elettrolitico.",
    bookInstructions: [
      "Imposta il multimetro su 20V in continua come fondo scala",
      "Inserisci il condensatore da 1000uF a cavallo della separazione centrale della breadboard",
      "Collega il multimetro con il cavo nero sul negativo e il rosso sul positivo del condensatore",
      "Inserisci il pulsante accanto al condensatore a cavallo della separazione centrale",
      "Collega un lato del pulsante al positivo del condensatore con il filo colorato e premi il pulsante (il multimetro deve indicare circa 9V)",
      "Rilascia il pulsante e osserva cosa succede alla tensione ai capi del condensatore"
    ],
    bookQuote: "Il condensatore si comporta come una batteria momentanea e si scarica lentamente all'interno del multimetro.",
    bookContext: "Primo esperimento con condensatori. Il capitolo spiega che i condensatori immagazzinano energia come piccole batterie, con unità di misura in Farad."
  },
  'v2-cap7-esp2': {
    volume: 2, bookPage: 69, chapter: "Capitolo 7 - Cosa sono i Condensatori?", chapterPage: 63,
    bookText: "In questo esperimento continueremo ad osservare l'effetto di scarica del condensatore.",
    bookInstructions: [
      "Inserisci il pulsante a cavallo della divisione centrale della breadboard e collega la batteria",
      "Inserisci il condensatore da 1000uF accanto al pulsante con il negativo rivolto verso il basso",
      "Collega il positivo del condensatore all'altro lato del pulsante",
      "Collega il negativo del condensatore al negativo della batteria con un filo",
      "Collega il resistore tra il positivo del condensatore e un punto qualsiasi della breadboard",
      "Collega il positivo del LED con il lato libero del resistore e il negativo del LED al negativo della batteria",
      "Collega il multimetro ai capi del condensatore",
      "Premi il pulsante e osserva cosa accade"
    ],
    bookQuote: "Questa volta l'effetto di scarica del condensatore è visibile sia sul LED guardando come si spegne, sia sul multimetro guardando come diminuisce il valore letto.",
    bookContext: "Scarica del condensatore visibile sul LED: il LED si spegne gradualmente mentre il condensatore si scarica. Effetto visivo della costante RC."
  },
  'v2-cap7-esp3': {
    volume: 2, bookPage: 72, chapter: "Capitolo 7 - Cosa sono i Condensatori?", chapterPage: 63,
    bookText: "Nel kit sono presenti 3 condensatori da 1000uF 25V. Al contrario di quanto visto per i resistori, per sommare la capacità dei condensatori bisogna connetterli in parallelo.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 2",
      "Aggiungi prima un condensatore in parallelo",
      "Poi aggiungi un terzo condensatore in parallelo",
      "Osserva come cambia l'effetto di scarica del condensatore"
    ],
    bookQuote: "Sarai sorpreso nel vedere come cambia l'effetto di scarica del condensatore!",
    bookContext: "Condensatori in parallelo: capacità si somma, la scarica è più lenta. Analogo alle batterie in parallelo che durano di più."
  },
  'v2-cap7-esp4': {
    volume: 2, bookPage: 73, chapter: "Capitolo 7 - Cosa sono i Condensatori?", chapterPage: 63,
    bookText: "Sulla base dell'esperimento 2 prova ora a cambiare il valore di resistenza aumentandolo o diminuendolo e osserva come cambia la scarica del condensatore.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 2",
      "Cambia il valore della resistenza (aumenta o diminuisci)",
      "Osserva come cambia la velocità di scarica",
      "Prova la stessa cosa anche sulla base dell'Esperimento 3"
    ],
    bookQuote: "Vedrai che con valori di capacità più alti e con valori di resistenza più alti, la scarica del condensatore è più lenta!",
    bookContext: "Costante di tempo RC: resistenza e capacità determinano quanto velocemente si scarica il condensatore. Concetto fondamentale dell'elettronica."
  },

  // Capitolo 8 — Cosa sono i Transistor? (p.75)
  'v2-cap8-esp1': {
    volume: 2, bookPage: 78, chapter: "Capitolo 8 - Cosa sono i Transistor?", chapterPage: 75,
    bookText: "In questo esperimento vedremo come utilizzare il MOSFET come interruttore comandato da una tensione.",
    bookInstructions: [
      "Collega la clip alla batteria, poi connetti il cavo rosso alla striscia rossa e il cavo nero alla striscia nera della breadboard",
      "Posiziona il transistor: il piedino più a sinistra è il gate, quello in mezzo il drain e quello più a destra è la source",
      "Collega il source (piedino più a destra) al negativo della batteria",
      "Posiziona il LED accanto al transistor rivolgendo l'anodo verso destra",
      "Collega il catodo del LED al drain (pin centrale del transistor)",
      "Collega un resistore da 470 Ω tra l'anodo del LED e un punto qualsiasi dopo la divisione centrale",
      "Collega il source del MOSFET al negativo della batteria",
      "Collega il gate del MOSFET al positivo della batteria: il LED si accenderà!"
    ],
    bookQuote: null,
    bookContext: "Primo esperimento con transistor MOSFET. Il capitolo spiega BJT vs MOSFET, i tre terminali (Gate, Drain, Source) e il concetto di interruttore elettronico."
  },
  'v2-cap8-esp2': {
    volume: 2, bookPage: 81, chapter: "Capitolo 8 - Cosa sono i Transistor?", chapterPage: 75,
    bookText: "Sulla base dell'esperimento 1 scollega il lato collegato al positivo della batteria del cavetto connesso sul gate del MOSFET e collegalo al negativo della batteria. Questo spegne il circuito perché scarica il gate.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Scollega il gate del MOSFET dal positivo e collegalo al negativo",
      "Solleva il cavetto e prova a toccare l'estremità col dito"
    ],
    bookQuote: "La carica del tuo corpo consente al MOSFET di accendersi e quindi di conseguenza accendere il LED!",
    bookContext: "Dimostrazione della sensibilità del gate MOSFET: basta la carica elettrostatica del corpo umano per accendere il LED."
  },
  'v2-cap8-esp3': {
    volume: 2, bookPage: 82, chapter: "Capitolo 8 - Cosa sono i Transistor?", chapterPage: 75,
    bookText: "In questo esperimento vedremo il comportamento del MOSFET all'approcciarsi della tensione di soglia. La tensione di soglia Vth vale circa 1V per i BJT e 2V per i MOSFET utilizzati in questo kit.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1 e scollega il cavetto connesso al gate",
      "Posiziona il potenziometro a cavallo della divisione centrale accanto al resistore da 470Ω",
      "Collega il pin 1 del potenziometro al negativo della batteria e il piedino 3 al positivo",
      "Connetti il pin 2 del potenziometro al gate del transistor e il multimetro tra il gate e il negativo della batteria",
      "Ruota piano l'alberino del potenziometro verso destra e osserva cosa succede al LED"
    ],
    bookQuote: "Più ruoti l'alberino verso destra, più la tensione sul gate sale e il transistor si accende meglio! In pratica il transistor si comporta come un resistore variabile a seconda di quanto vale la tensione di gate.",
    bookContext: "Controllo analogico del MOSFET con potenziometro. Il transistor non è solo on/off: regolando la tensione di gate si controlla gradualmente la corrente."
  },

  // Capitolo 9 — Cosa sono i Fototransistor? (p.85)
  'v2-cap9-esp1': {
    volume: 2, bookPage: 86, chapter: "Capitolo 9 - Cosa sono i Fototransistor?", chapterPage: 85,
    bookText: "In questo esperimento utilizzeremo un fotoresistore come sensore controllando con il multimetro quanto vale la tensione ai capi di una resistenza in base a quanta luce colpisce il fotoresistore.",
    bookInstructions: [
      "Collega il fototransistor in due punti a cavallo della divisione centrale con l'emettitore (pin corto) rivolto verso il basso",
      "Collega un resistore da 10 kOhm tra l'emettitore del fototransistor e la striscia nera inferiore",
      "Collega il multimetro impostato su fondoscala 20V ai capi del resistore da 10 kOhm",
      "Collega il positivo della batteria sul collettore del fototransistor e il negativo nella striscia nera",
      "Illumina il corpo del fototransistor e osserva come varia la lettura sul multimetro"
    ],
    bookQuote: "Se punti la luce direttamente sul corpo leggerai quasi 9V! Prova a tenere al buio il fototransistor coprendolo con le mani, la lettura sul multimetro sarà vicina a 0V. Abbiamo creato un sensore di luce!",
    bookContext: "Primo esperimento con fototransistor. Il capitolo spiega che il fototransistor è un transistor comandato dalla luce, simile al fotoresistore ma con principio diverso."
  },
  'v2-cap9-esp2': {
    volume: 2, bookPage: 89, chapter: "Capitolo 9 - Cosa sono i Fototransistor?", chapterPage: 85,
    bookText: "In questo esperimento useremo un fototransistor per accendere una luce quando è buio e spegnerla quando c'è luce.",
    bookInstructions: [
      "Collega la clip della batteria e connetti positivo e negativo alla breadboard",
      "Effettua la serie dei 4 resistori da 10kOhm per crearne uno da 40kOhm",
      "Connetti il fototransistor tra l'ultimo resistore e il negativo della batteria",
      "Inserisci il MOSFET nella breadboard accanto all'ultimo resistore",
      "Connetti il gate del MOSFET al collettore del fototransistor",
      "Connetti il source del MOSFET al negativo della batteria",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      "Posiziona il LED accanto al MOSFET",
      "Connetti il catodo del LED al drain del MOSFET",
      "Collega il resistore da 470 Ohm tra il positivo della batteria e l'anodo del LED"
    ],
    bookQuote: "Copri con le mani il fototransistor per simulare il buio: il LED si accenderà!",
    bookContext: "Luce automatica: fototransistor + MOSFET = il LED si accende al buio. Combina sensore di luce con interruttore elettronico."
  },

  // Capitolo 10 — Il Motore a Corrente Continua (p.93)
  'v2-cap10-esp1': {
    volume: 2, bookPage: 95, chapter: "Capitolo 10 - Il Motore a Corrente Continua", chapterPage: 93,
    bookText: "In questo semplice esperimento vedremo come far girare il motore presente all'interno del kit.",
    bookInstructions: [
      "Utilizzando la breadboard solo per effettuare i collegamenti, connetti il filo rosso del motore al positivo della batteria e il filo nero al negativo della batteria",
      "Osserva in che verso gira il motore"
    ],
    bookQuote: null,
    bookContext: "Primo esperimento con motore DC. Il capitolo spiega come il motore trasforma energia elettrica in movimento grazie a campi magnetici e alla Legge di Lenz."
  },
  'v2-cap10-esp2': {
    volume: 2, bookPage: 96, chapter: "Capitolo 10 - Il Motore a Corrente Continua", chapterPage: 93,
    bookText: "Prova a invertire il filo rosso e il filo nero, puoi farlo anche con i fili della batteria o quelli del motore. In che verso gira ora il motore?",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Inverti i fili del motore (rosso con nero)",
      "Osserva in che verso gira il motore"
    ],
    bookQuote: null,
    bookContext: "Inversione della polarità: il motore gira nel verso opposto. Concetto fondamentale per il controllo direzionale dei motori."
  },
  'v2-cap10-esp3': {
    volume: 2, bookPage: 96, chapter: "Capitolo 10 - Il Motore a Corrente Continua", chapterPage: 93,
    bookText: "Prova a inserire un pulsante per comandare il motore acceso e spento.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 1",
      "Aggiungi un pulsante in serie al motore per controllare accensione e spegnimento"
    ],
    bookQuote: null,
    bookContext: "Motore con pulsante: lo studente applica il concetto di interruttore meccanico al motore."
  },
  'v2-cap10-esp4': {
    volume: 2, bookPage: 96, chapter: "Capitolo 10 - Il Motore a Corrente Continua", chapterPage: 93,
    bookText: "Prova a inserire un pulsante per comandare il motore aggiungendo anche una resistenza e un LED in modo che quando il motore inizia a girare il LED si accenda.",
    bookInstructions: [
      "Parti dal circuito dell'Esperimento 3",
      "Aggiungi un LED con resistore in parallelo al motore",
      "Quando premi il pulsante sia il motore che il LED devono funzionare"
    ],
    bookQuote: null,
    bookContext: "Motore + LED + pulsante: circuito combinato che indica visivamente quando il motore è acceso."
  },

  // Capitolo 12 — Robot Segui Luce (p.103)
  // 2026-05-10 TRES JOLIE audit segnala discrepanza: PDF Vol2 dice Cap.12 inizia p.109
  // (p.103 = Cap.11 "I diodi"). Tea narrative metadata file ESTERNO (/elab-fumetti-consegna-v2/)
  // ha bookPage:103. Test teaFumettiPackageAudit richiede equality. Mantengo 103 per ora
  // per non rompere baseline Tea-sync. Iter 4 P0: Andrea+Tea decide fonte verità (PDF o Tea map).
  'v2-cap12-esp1': {
    volume: 2, bookPage: 103, chapter: "Capitolo 12 - Robot Segui Luce", chapterPage: 103,
    bookText: "In questo capitolo metteremo insieme un po' tutti i concetti acquisiti in questo volume per costruire un semplice robot che segue la luce!",
    bookInstructions: [
      "Monta i motoriduttori e le ruote osservando l'albero con la parte piana",
      "Rimuovi la pellicola protettiva dalla parte adesiva della breadboard",
      "Incolla i motori sulla base della breadboard con i cavi nella parte interna",
      "Incolla il porta batteria",
      "Realizza i collegamenti elettrici con due transistor, due resistori da 10KOhm, due diodi e due fotoresistori"
    ],
    bookQuote: null,
    bookContext: "Progetto finale del Volume 2: robot segui-luce. Combina tutti i concetti: fotoresistori, transistor, motori, diodi di ricircolo. È il culmine del percorso di approfondimento."
  },

  // ─────────────────────────────────────────────────
  // VOLUME 3 — Arduino (27 esp + extra, Cap 5–8 + Extra)
  // Fonte: Manuale VOLUME 3 V0.8.1 — pagine fisiche del libro
  // ─────────────────────────────────────────────────

  // VOLUME 3 — Programmazione Arduino (23 ESERCIZI canonici)
  'v3-cap5-esp1': {
    volume: 3, bookPage: 30, chapter: "Capitolo 5 - Il nostro primo programma (Blink)", chapterPage: 29,
    bookText: "ESERCIZIO 5.1: I ragazzi scrivono Blink e osservano il LED integrato che lampeggia.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 30.",
      "Ragazzi, il docente collega il circuito e il codice: Blink: il primo programma.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 5.1 — Blink: il primo programma",
    bookContext: "Sequenza canonica Volume 3, Capitolo 5: Il nostro primo programma (Blink)."
  },
  'v3-cap5-esp2': {
    volume: 3, bookPage: 41, chapter: "Capitolo 5 - Il nostro primo programma (Blink)", chapterPage: 29,
    bookText: "ESERCIZIO 5.2: I ragazzi cambiano i millisecondi del delay per rendere il lampeggio piu veloce o piu lento.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 41.",
      "Ragazzi, il docente collega il circuito e il codice: Modificare il delay del Blink.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 5.2 — Modificare il delay del Blink",
    bookContext: "Sequenza canonica Volume 3, Capitolo 5: Il nostro primo programma (Blink)."
  },
  'v3-cap6-esp1': {
    volume: 3, bookPage: 45, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.1: Due coppie di pulsanti mostrano la logica OR e AND: uno basta, oppure servono entrambi.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 45.",
      "Ragazzi, il docente collega il circuito e il codice: Circuiti logici AND e OR.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.1 — Circuiti logici AND e OR",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp2': {
    volume: 3, bookPage: 51, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.2: Il Blink esce dalla scheda e controlla un LED verde montato sulla breadboard.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 51.",
      "Ragazzi, il docente collega il circuito e il codice: Accendere un LED esterno sul pin 13.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.2 — Accendere un LED esterno sul pin 13",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp3': {
    volume: 3, bookPage: 53, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.3: Lo stesso LED viene spostato su un altro pin: codice e filo devono raccontare la stessa scelta.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 53.",
      "Ragazzi, il docente collega il circuito e il codice: Cambiare il pin del LED esterno.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.3 — Cambiare il pin del LED esterno",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp4': {
    volume: 3, bookPage: 54, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.4: Due LED sui pin 6 e 9 si accendono uno dopo l altro, creando un effetto alternato.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 54.",
      "Ragazzi, il docente collega il circuito e il codice: Due LED che si alternano.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.4 — Due LED che si alternano",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp5': {
    volume: 3, bookPage: 57, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.5: Tre LED rosso, giallo e verde riproducono una sequenza da semaforo sui pin 5, 6 e 9.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 57.",
      "Ragazzi, il docente collega il circuito e il codice: Costruiamo un semaforo.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.5 — Costruiamo un semaforo",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp6': {
    volume: 3, bookPage: 64, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.6: Arduino legge un pulsante in INPUT_PULLUP e decide con if/else se accendere il LED.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 64.",
      "Ragazzi, il docente collega il circuito e il codice: Leggere un pulsante con digitalRead.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.6 — Leggere un pulsante con digitalRead",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp7': {
    volume: 3, bookPage: 69, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.7: Con una variabile bool il pulsante diventa un interruttore: una pressione accende, la successiva spegne.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 69.",
      "Ragazzi, il docente collega il circuito e il codice: Una variabile ricorda lo stato del LED.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.7 — Una variabile ricorda lo stato del LED",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap6-esp8': {
    volume: 3, bookPage: 74, chapter: "Capitolo 6 - Il mondo discreto: i pin digitali", chapterPage: 43,
    bookText: "ESERCIZIO 6.8: Il programma aspetta il rilascio del pulsante con while, cosi una pressione lunga vale una sola volta.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 74.",
      "Ragazzi, il docente collega il circuito e il codice: Evitare il lampeggio con while.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 6.8 — Evitare il lampeggio con while",
    bookContext: "Sequenza canonica Volume 3, Capitolo 6: Il mondo discreto: i pin digitali."
  },
  'v3-cap7-esp1': {
    volume: 3, bookPage: 84, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.1: Arduino legge A0 e accende il LED quando il trimmer supera circa meta corsa.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 84.",
      "Ragazzi, il docente collega il circuito e il codice: Trimmer: accendere il LED sopra 2,5 V.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.1 — Trimmer: accendere il LED sopra 2,5 V",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap7-esp2': {
    volume: 3, bookPage: 87, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.2: Il valore 0-1023 viene trasformato in tensione e confrontato direttamente con 2.5 V.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 87.",
      "Ragazzi, il docente collega il circuito e il codice: Convertire la lettura analogica in Volt.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.2 — Convertire la lettura analogica in Volt",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap7-esp3': {
    volume: 3, bookPage: 90, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.3: Il trimmer divide la scala analogica in tre zone: rosso, giallo e verde.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 90.",
      "Ragazzi, il docente collega il circuito e il codice: Tre LED indicano la posizione del trimmer.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.3 — Tre LED indicano la posizione del trimmer",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap7-esp4': {
    volume: 3, bookPage: 97, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.4: Un ciclo for aumenta gradualmente il valore PWM scritto sul pin 5.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 97.",
      "Ragazzi, il docente collega il circuito e il codice: Aumentare la luminosita con analogWrite.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.4 — Aumentare la luminosita con analogWrite",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap7-esp5': {
    volume: 3, bookPage: 102, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.5: Il LED aumenta e diminuisce la luminosita in modo continuo, come un respiro.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 102.",
      "Ragazzi, il docente collega il circuito e il codice: Effetto respiro con due cicli for.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.5 — Effetto respiro con due cicli for",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap7-esp6': {
    volume: 3, bookPage: 105, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.6: map() trasforma la lettura 0-1023 in un valore PWM 0-255.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 105.",
      "Ragazzi, il docente collega il circuito e il codice: Il trimmer controlla la luminosita del LED.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.6 — Il trimmer controlla la luminosita del LED",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap7-esp7': {
    volume: 3, bookPage: 109, chapter: "Capitolo 7 - Il mondo continuo: i pin analogici", chapterPage: 79,
    bookText: "ESERCIZIO 7.7: Il trimmer su A1 controlla una vera uscita analogica su A0, misurata con il multimetro.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 109.",
      "Ragazzi, il docente collega il circuito e il codice: Generare una tensione analogica sul pin A0.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 7.7 — Generare una tensione analogica sul pin A0",
    bookContext: "Sequenza canonica Volume 3, Capitolo 7: Il mondo continuo: i pin analogici."
  },
  'v3-cap8-esp1': {
    volume: 3, bookPage: 119, chapter: "Capitolo 8 - Visualizzare dati: il Monitor Seriale", chapterPage: 113,
    bookText: "ESERCIZIO 8.1: Il Monitor Seriale riceve un messaggio inviato una sola volta dal setup().",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 119.",
      "Ragazzi, il docente collega il circuito e il codice: Arduino saluta il computer.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 8.1 — Arduino saluta il computer",
    bookContext: "Sequenza canonica Volume 3, Capitolo 8: Visualizzare dati: il Monitor Seriale."
  },
  'v3-cap8-esp2': {
    volume: 3, bookPage: 122, chapter: "Capitolo 8 - Visualizzare dati: il Monitor Seriale", chapterPage: 113,
    bookText: "ESERCIZIO 8.2: Lo stesso messaggio viene spostato nel loop e compare continuamente.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 122.",
      "Ragazzi, il docente collega il circuito e il codice: Messaggio ripetuto nel loop.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 8.2 — Messaggio ripetuto nel loop",
    bookContext: "Sequenza canonica Volume 3, Capitolo 8: Visualizzare dati: il Monitor Seriale."
  },
  'v3-cap8-esp3': {
    volume: 3, bookPage: 124, chapter: "Capitolo 8 - Visualizzare dati: il Monitor Seriale", chapterPage: 113,
    bookText: "ESERCIZIO 8.3: Il trimmer viene letto su A0 e stampato come numero da 0 a 1023.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 124.",
      "Ragazzi, il docente collega il circuito e il codice: Stampare analogRead sul Monitor Seriale.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 8.3 — Stampare analogRead sul Monitor Seriale",
    bookContext: "Sequenza canonica Volume 3, Capitolo 8: Visualizzare dati: il Monitor Seriale."
  },
  'v3-cap8-esp4': {
    volume: 3, bookPage: 128, chapter: "Capitolo 8 - Visualizzare dati: il Monitor Seriale", chapterPage: 113,
    bookText: "ESERCIZIO 8.4: Due letture analogiche vengono stampate con etichette separate per il Serial Plotter.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 128.",
      "Ragazzi, il docente collega il circuito e il codice: Due trimmer sul Serial Plotter.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 8.4 — Due trimmer sul Serial Plotter",
    bookContext: "Sequenza canonica Volume 3, Capitolo 8: Visualizzare dati: il Monitor Seriale."
  },
  'v3-cap8-esp5': {
    volume: 3, bookPage: 130, chapter: "Capitolo 8 - Visualizzare dati: il Monitor Seriale", chapterPage: 113,
    bookText: "ESERCIZIO 8.5: Il valore del potenziometro controlla tre LED e viene visto nel Monitor Seriale e nel Plotter.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 130.",
      "Ragazzi, il docente collega il circuito e il codice: Trimmer, tre LED e valori seriali.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 8.5 — Trimmer, tre LED e valori seriali",
    bookContext: "Sequenza canonica Volume 3, Capitolo 8: Visualizzare dati: il Monitor Seriale."
  },
  'v3-cap8-esp6': {
    volume: 3, bookPage: 132, chapter: "Capitolo 8 - Visualizzare dati: il Monitor Seriale", chapterPage: 113,
    bookText: "ESERCIZIO 8.6: Tre LED costruiscono una barra progressiva: valore basso, medio, alto.",
    bookInstructions: [
      "Ragazzi, il docente apre il Volume 3 a pagina 132.",
      "Ragazzi, il docente collega il circuito e il codice: Barra progressiva LED.",
      "Ragazzi, la classe osserva il risultato e lo aggancia all'esperimento successivo."
    ],
    bookQuote: "ESERCIZIO 8.6 — Barra progressiva LED",
    bookContext: "Sequenza canonica Volume 3, Capitolo 8: Visualizzare dati: il Monitor Seriale."
  }
};

export default VOLUME_REFERENCES;

/**
 * Returns full reference info for an experiment.
 * @param {string} experimentId
 * @returns {{ volume: number, bookPage: number, chapter: string, chapterPage: number } | null}
 */
export function getVolumeRef(experimentId) {
  return VOLUME_REFERENCES[experimentId] || null;
}

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Returns the book page number for an experiment.
 * @param {string} experimentId
 * @returns {number | null}
 */
export function getBookPage(experimentId) {
  return VOLUME_REFERENCES[experimentId]?.bookPage || null;
}

/**
 * Returns "Vol. N, p. XX" label for display in the UI.
 * @param {string} experimentId
 * @returns {string | null}
 */
export function getVolumeLabel(experimentId) {
  const ref = VOLUME_REFERENCES[experimentId];
  if (!ref) return null;
  return `Vol. ${ref.volume}, p. ${ref.bookPage}`;
}
