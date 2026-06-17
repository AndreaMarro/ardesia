// ============================================
// ELAB Reverse Engineering Lab — Circuiti Misteriosi
// Zhong 2021: Reverse engineering > traditional group
// Collegati ai capitoli dei volumi ELAB
// © Andrea Marro — 2026
// ============================================

export const MYSTERY_CIRCUITS = [
  // ===  TERRA — Livello 1 (Semplice) ===
  {
    id: 'mystery-ldr',
    title: 'La Scatola della Luce',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    volume: 1,
    chapter: 10,
    relatedExperiment: 'v1-cap10-foto',
    description: 'Questo circuito reagisce alla luce. C\'è un componente misterioso — cosa sarà?',
    visibleParts: ['Arduino Nano', 'Breadboard', 'LED Verde', 'Resistore 220Ω'],
    hiddenPart: { name: 'Fotoresistenza (LDR)', icon: '' },
    behavior: 'Quando copri il componente misterioso con la mano, il LED verde si accende. Quando lo illumini, il LED si spegne.',
    testPoints: [
      { id: 'tp1', x: 30, y: 40, label: 'Punto A (vicino al mistero)', value: '2.8V al buio, 0.9V alla luce', hint: 'La tensione cambia con la luce!' },
      { id: 'tp2', x: 70, y: 40, label: 'Punto B (pin Arduino)', value: 'Pin A0: 580 al buio, 180 alla luce', hint: 'Arduino legge un valore analogico che cambia...' },
      { id: 'tp3', x: 50, y: 80, label: 'Punto C (LED)', value: 'Pin 3: HIGH al buio, LOW alla luce', hint: 'Il codice accende il LED quando il valore è alto' }
    ],
    guessOptions: ['Termometro', 'Fotoresistenza (LDR)', 'Potenziometro', 'Condensatore'],
    correctGuess: 1,
    solution: 'È una **Fotoresistenza (LDR)**! La sua resistenza cambia con la luce: alta al buio, bassa alla luce. Arduino legge questo cambiamento e decide se accendere il LED. Hai costruito una lampada automatica!',
    connectionToVolume: 'Questo è l\'esperimento del Capitolo 10 del Volume 1: "La Fotoresistenza"'
  },
  {
    id: 'mystery-buzzer',
    title: 'La Scatola del Rumore',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    volume: 1,
    chapter: 11,
    relatedExperiment: 'v1-cap11-cicalino',
    description: 'Questo circuito produce un suono quando premi un pulsante. Ma cosa produce il suono?',
    visibleParts: ['Arduino Nano', 'Breadboard', 'Pulsante', 'Resistore 10KΩ'],
    hiddenPart: { name: 'Buzzer Piezoelettrico', icon: '' },
    behavior: 'Premi il pulsante: senti un suono acuto (LA, 440Hz). Il componente misterioso vibra fisicamente.',
    testPoints: [
      { id: 'tp1', x: 30, y: 30, label: 'Punto A (pulsante)', value: 'HIGH quando premuto, LOW quando rilasciato', hint: 'Il pulsante manda un segnale digitale' },
      { id: 'tp2', x: 60, y: 50, label: 'Punto B (mistero)', value: 'Oscillazione a 440Hz quando attivo', hint: 'Il pin oscilla rapidamente tra HIGH e LOW... come un\'onda sonora!' },
      { id: 'tp3', x: 50, y: 70, label: 'Pin 8 Arduino', value: 'tone(8, 440) nel codice', hint: 'La funzione tone() genera un\'onda quadra alla frequenza specificata' }
    ],
    guessOptions: ['Altoparlante', 'Buzzer Piezoelettrico', 'LED infrarosso', 'Relay'],
    correctGuess: 1,
    solution: 'È un **Buzzer Piezoelettrico**! Contiene un cristallo che vibra quando riceve corrente alternata. Arduino usa la funzione tone() per farlo vibrare a 440Hz, che è la nota LA!',
    connectionToVolume: 'Questo è l\'esperimento del Capitolo 11 del Volume 1: "Il Cicalino"'
  },
  {
    id: 'mystery-potentiometer',
    title: 'La Manopola Magica',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    volume: 1,
    chapter: 9,
    relatedExperiment: 'v1-cap9-pot',
    description: 'C\'è un componente con una manopola che gira. Girando la manopola, il LED cambia luminosità. Cos\'è?',
    visibleParts: ['Arduino Nano', 'Breadboard', 'LED Rosso', 'Resistore 220Ω'],
    hiddenPart: { name: 'Potenziometro 10KΩ', icon: '' },
    behavior: 'Girando la manopola a sinistra, il LED si spegne. Girandola a destra, il LED si accende al massimo. Posizioni intermedie = luminosità intermedia.',
    testPoints: [
      { id: 'tp1', x: 40, y: 30, label: 'Punto A (uscita manopola)', value: '0V a sinistra, 2.5V al centro, 5V a destra', hint: 'La tensione cambia linearmente con la posizione!' },
      { id: 'tp2', x: 60, y: 50, label: 'Pin A0 Arduino', value: '0 a sinistra, 512 al centro, 1023 a destra', hint: 'Arduino traduce la tensione in un numero da 0 a 1023' },
      { id: 'tp3', x: 50, y: 75, label: 'Pin LED (PWM)', value: 'analogWrite: 0-255 proporzionale alla manopola', hint: 'Il LED riceve un segnale PWM che ne controlla la luminosità' }
    ],
    guessOptions: ['Potenziometro', 'Encoder rotativo', 'Joystick', 'Sensore di rotazione'],
    correctGuess: 0,
    solution: 'È un **Potenziometro**! È un resistore con una manopola che cambia la resistenza. Collegato ad Arduino, permette di controllare qualsiasi cosa in modo continuo: luminosità, velocità, tono...',
    connectionToVolume: 'Questo è l\'esperimento del Capitolo 9 del Volume 1: "Il Potenziometro"'
  },

  // ===  SCHEMA — Livello 2 (Medio) ===
  {
    id: 'mystery-transistor',
    title: 'L\'Interruttore Invisibile',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    volume: 2,
    chapter: 8,
    relatedExperiment: 'v2-cap8-transistor',
    description: 'Un motore si accende con un piccolo segnale da Arduino. Ma Arduino non può alimentare un motore! C\'è un componente segreto che fa da tramite.',
    visibleParts: ['Arduino Nano', 'Motore DC', 'Batteria esterna', 'Diodo (protezione)'],
    hiddenPart: { name: 'Transistor NPN (BC547)', icon: '' },
    behavior: 'Arduino manda un segnale digitale (HIGH) e il motore si accende a piena potenza dalla batteria esterna. LOW = motore spento.',
    testPoints: [
      { id: 'tp1', x: 25, y: 40, label: 'Base (pin Arduino)', value: '5V quando HIGH, corrente: 0.5mA', hint: 'Un segnale piccolissimo dalla base...' },
      { id: 'tp2', x: 50, y: 40, label: 'Collettore (motore)', value: '9V dalla batteria, corrente: 200mA', hint: '...controlla una corrente 400 volte più grande!' },
      { id: 'tp3', x: 50, y: 80, label: 'Emettitore (GND)', value: '0V — collegato a massa', hint: 'Il terzo terminale va a massa' }
    ],
    guessOptions: ['Transistor NPN', 'Relay', 'MOSFET', 'Amplificatore operazionale'],
    correctGuess: 0,
    solution: 'È un **Transistor NPN**! Con una corrente minuscola alla base (0.5mA da Arduino), controlla una corrente grande al collettore (200mA per il motore). È come un interruttore controllato elettricamente!',
    connectionToVolume: 'Questo è l\'esperimento del Capitolo 8 del Volume 2: "Il Transistor come Interruttore"'
  },
  {
    id: 'mystery-capacitor',
    title: 'La Memoria Elettrica',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    volume: 2,
    chapter: 7,
    relatedExperiment: 'v2-cap7-condensatore',
    description: 'Scollega la batteria e il LED non si spegne subito — si spegne lentamente in qualche secondo. C\'è un componente misterioso che "ricorda" l\'energia.',
    visibleParts: ['LED Rosso', 'Resistore 1KΩ', 'Interruttore'],
    hiddenPart: { name: 'Condensatore 1000µF', icon: '' },
    behavior: 'Con l\'interruttore chiuso: il LED brilla. Apri l\'interruttore: il LED si spegne LENTAMENTE in circa 3 secondi (fade out).',
    testPoints: [
      { id: 'tp1', x: 30, y: 40, label: 'Ai capi del mistero (carica)', value: '5V dopo 2 secondi di carica', hint: 'Si carica lentamente fino alla tensione della batteria' },
      { id: 'tp2', x: 70, y: 40, label: 'Ai capi del mistero (scarica)', value: 'Da 5V a 0V in ~3 secondi', hint: 'Si scarica esponenzialmente' },
      { id: 'tp3', x: 50, y: 75, label: 'Corrente nel LED (scarica)', value: 'Da 5mA a 0mA in ~3 secondi', hint: 'Il LED si affievolisce man mano che la carica diminuisce' }
    ],
    guessOptions: ['Batteria ricaricabile', 'Condensatore', 'Induttore', 'Diodo Zener'],
    correctGuess: 1,
    solution: 'È un **Condensatore**! Immagazzina energia elettrica e la rilascia quando serve. La costante di tempo RC (Resistenza × Capacità) determina quanto tempo ci mette a caricarsi/scaricarsi.',
    connectionToVolume: 'Questo è l\'esperimento del Capitolo 7 del Volume 2: "Il Condensatore e il LED"'
  },

  // ===  CIELO — Livello 3 (Avanzato) ===
  {
    id: 'mystery-hbridge',
    title: 'Il Circuito Bidirezionale',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    volume: 2,
    chapter: 12,
    relatedExperiment: 'v2-cap12-robot-marciante',
    description: 'Un motore può girare in ENTRAMBE le direzioni, controllato da 2 pin di Arduino. Come è possibile? C\'è un circuito segreto complesso.',
    visibleParts: ['Arduino Nano', 'Motore DC', 'Batteria esterna'],
    hiddenPart: { name: 'Ponte H (H-Bridge L293D)', icon: '' },
    behavior: 'Pin 5 HIGH + Pin 6 LOW = motore gira a destra. Pin 5 LOW + Pin 6 HIGH = motore gira a sinistra. Entrambi LOW = motore fermo.',
    testPoints: [
      { id: 'tp1', x: 20, y: 30, label: 'Input 1', value: 'Segue Pin 5 di Arduino', hint: 'Due ingressi controllano la direzione' },
      { id: 'tp2', x: 80, y: 30, label: 'Input 2', value: 'Segue Pin 6 di Arduino', hint: 'La combinazione dei due decide il verso' },
      { id: 'tp3', x: 50, y: 50, label: 'Output motore', value: '+9V/-9V a seconda degli input', hint: 'La polarità al motore si INVERTE!' },
      { id: 'tp4', x: 50, y: 80, label: 'Enable', value: 'PWM per velocità variabile', hint: 'Il pin enable controlla la velocità con PWM' }
    ],
    guessOptions: ['Ponte H (H-Bridge)', '4 Relay', '4 Transistor separati', 'Motore stepper'],
    correctGuess: 0,
    solution: 'È un **Ponte H (H-Bridge)**! Contiene 4 transistor disposti a forma di H. Attivando diverse coppie, inverte la polarità al motore. L\'L293D è un chip che integra tutto in un unico componente. È il cuore di ogni robot!',
    connectionToVolume: 'Questo è il principio dietro al Capitolo 12 del Volume 2: "Il Robot Marciante"'
  },

  // === NUOVI CIRCUITI (Terra, Schema, Cielo) ===
  {
    id: 'mystery-reed',
    title: 'Il Sensore Segreto',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    volume: 1,
    chapter: 12,
    relatedExperiment: 'v1-cap12-magnetico',
    description: 'Quando avvicini un oggetto metallico al circuito, un LED si accende. Non c\'è nessun pulsante visibile!',
    visibleParts: ['Arduino Nano', 'Breadboard', 'LED Blu', 'Resistore 220Ω'],
    hiddenPart: { name: 'Interruttore Reed (magnetico)', icon: '' },
    behavior: 'Avvicinando un magnete al componente misterioso, il LED si accende. Allontanandolo, il LED si spegne. Funziona anche attraverso un foglio di carta!',
    testPoints: [
      { id: 'tp1', x: 30, y: 35, label: 'Punto A (componente)', value: 'HIGH con magnete vicino, LOW senza', hint: 'Si attiva senza toccarlo... qualcosa di invisibile lo attiva!' },
      { id: 'tp2', x: 60, y: 50, label: 'Pin 2 Arduino', value: 'digitalRead: 1 con magnete, 0 senza', hint: 'Arduino legge un segnale digitale ON/OFF' },
      { id: 'tp3', x: 50, y: 75, label: 'Punto C (LED)', value: 'Acceso quando magnete vicino', hint: 'Il codice: if(digitalRead(2)==HIGH) → LED ON' }
    ],
    guessOptions: ['Sensore a infrarossi', 'Interruttore Reed (magnetico)', 'Sensore di prossimità', 'Pulsante nascosto'],
    correctGuess: 1,
    solution: 'È un **Interruttore Reed**! Contiene due lamelle metalliche in un tubetto di vetro. Quando un magnete si avvicina, le lamelle si toccano e chiudono il circuito. Funziona come un pulsante invisibile!',
    connectionToVolume: 'Questo è l\'esperimento del Capitolo 12 del Volume 1: "L\'Interruttore Magnetico"'
  },
  {
    id: 'mystery-thermistor',
    title: 'Il Termometro Nascosto',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    volume: 1,
    chapter: 10,
    relatedExperiment: 'v1-cap10-foto',
    description: 'Toccando un componente con le dita, i valori sul Monitor Seriale cambiano. Il calore del tuo corpo sta modificando qualcosa!',
    visibleParts: ['Arduino Nano', 'Breadboard', 'Resistore 10KΩ', 'Fili'],
    hiddenPart: { name: 'Termistore NTC', icon: '' },
    behavior: 'A temperatura ambiente il valore è ~500. Toccando il componente con le dita calde, il valore sale a ~650. Soffiandoci aria fredda scende a ~400.',
    testPoints: [
      { id: 'tp1', x: 35, y: 35, label: 'Punto A (componente)', value: '2.5V a 25°C, 3.2V a 37°C', hint: 'La tensione cambia con la temperatura!' },
      { id: 'tp2', x: 65, y: 45, label: 'Pin A0 Arduino', value: '500 a 25°C, 650 a 37°C', hint: 'Arduino legge un valore analogico che sale col calore' },
      { id: 'tp3', x: 50, y: 75, label: 'Resistenza misurata', value: '10KΩ a 25°C, 6.5KΩ a 37°C', hint: 'NTC = la resistenza DIMINUISCE quando la temperatura AUMENTA' }
    ],
    guessOptions: ['Fotoresistenza', 'Termistore NTC', 'Condensatore', 'Diodo Zener'],
    correctGuess: 1,
    solution: 'È un **Termistore NTC** (Negative Temperature Coefficient)! La sua resistenza diminuisce quando la temperatura sale. Con un partitore di tensione, Arduino può leggere la temperatura ambiente!',
    connectionToVolume: 'Il termistore funziona come la fotoresistenza del Capitolo 10 del Volume 1, ma reagisce alla temperatura invece che alla luce'
  },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  {
    id: 'mystery-diode',
    title: 'Il Guardiano del Circuito',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    volume: 2,
    chapter: 11,
    relatedExperiment: 'v2-cap11-diodi',
    description: 'Un componente misterioso è collegato in parallelo al motore, ma "al contrario". Non sembra fare nulla... fino a quando spegni il motore!',
    visibleParts: ['Arduino Nano', 'Motore DC', 'Transistor NPN', 'Resistore 1KΩ'],
    hiddenPart: { name: 'Diodo di protezione (1N4007)', icon: '' },
    behavior: 'Con il motore acceso, il componente non fa nulla. Ma senza di esso, quando il motore si spegne, si vedono scintille e Arduino a volte si resetta!',
    testPoints: [
      { id: 'tp1', x: 30, y: 40, label: 'Ai capi del motore (spento)', value: 'Picco -40V per 1ms senza diodo!', hint: 'Quando un motore si spegne, genera una tensione inversa pericolosa' },
      { id: 'tp2', x: 60, y: 40, label: 'Con il componente', value: 'Picco limitato a -0.7V', hint: 'Il componente "assorbe" la tensione inversa' },
      { id: 'tp3', x: 50, y: 70, label: 'Corrente nel componente', value: '0mA a motore acceso, picco 200mA allo spegnimento', hint: 'Conduce solo in una direzione... e solo quando serve!' }
    ],
    guessOptions: ['Condensatore', 'Diodo di protezione', 'Resistore', 'Fusibile'],
    correctGuess: 1,
    solution: 'È un **Diodo di protezione (flyback diode)**! Quando spegni un motore (o relè), l\'induttanza genera un picco di tensione inversa che può danneggiare il transistor e Arduino. Il diodo assorbe questo picco!',
    connectionToVolume: 'Questo è collegato al Capitolo 11 del Volume 2: "I Diodi" — protezione dei circuiti con componenti induttivi'
  },
  {
    id: 'mystery-piezo',
    title: 'Il Sensore di Vibrazione',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    volume: 3,
    chapter: 10,
    relatedExperiment: 'v3-cap10-buzzer-melodia',
    description: 'Un dischetto metallico è collegato ad Arduino. Quando bussi sul tavolo, il Monitor Seriale mostra dei valori!',
    visibleParts: ['Arduino Nano', 'Breadboard', 'Resistore 1MΩ'],
    hiddenPart: { name: 'Sensore Piezoelettrico', icon: '' },
    behavior: 'Bussi piano sul tavolo: valore ~100. Bussi forte: valore ~800. Se tocchi delicatamente il dischetto: valore ~50. Se lo pieghi: valore ~1023!',
    testPoints: [
      { id: 'tp1', x: 35, y: 35, label: 'Pin A0 Arduino', value: '0 a riposo, 100-1023 con vibrazione', hint: 'Produce una tensione proporzionale alla pressione/vibrazione' },
      { id: 'tp2', x: 65, y: 45, label: 'Ai capi del componente', value: '0-3V a seconda della forza', hint: 'Deformazione meccanica → tensione elettrica!' },
      { id: 'tp3', x: 50, y: 75, label: 'Forma d\'onda', value: 'Impulsi brevi e decrescenti', hint: 'La tensione sale rapidamente e poi decresce — come un rimbalzo' }
    ],
    guessOptions: ['Microfono', 'Sensore Piezoelettrico', 'Accelerometro', 'Sensore capacitivo'],
    correctGuess: 1,
    solution: 'È un **Sensore Piezoelettrico**! Lo stesso cristallo del buzzer, ma usato al contrario: invece di vibrare quando riceve corrente, genera corrente quando vibra! Questo si chiama "effetto piezoelettrico inverso".',
    connectionToVolume: 'Il buzzer del Capitolo 10 del Volume 3 usa lo stesso principio, ma al contrario: corrente → suono. Qui: vibrazione → corrente!'
  },
  {
    id: 'mystery-relay',
    title: 'Lo Scatto nel Buio',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    volume: 2,
    chapter: 8,
    relatedExperiment: 'v2-cap8-transistor',
    description: 'Arduino manda un segnale e senti un "CLICK" meccanico. Una lampadina da 220V si accende! Come può Arduino controllare la corrente domestica?',
    visibleParts: ['Arduino Nano', 'Transistor NPN', 'Diodo', 'Lampadina 220V'],
    hiddenPart: { name: 'Relè 5V', icon: '' },
    behavior: 'Arduino Pin 7 → HIGH: senti un "click" e la lampadina si accende. LOW: altro "click" e si spegne. Il componente vibra leggermente quando è attivo.',
    testPoints: [
      { id: 'tp1', x: 25, y: 35, label: 'Bobina (lato Arduino)', value: '5V, ~70mA quando attivo', hint: 'Una bobina elettromagnetica che consuma corrente...' },
      { id: 'tp2', x: 75, y: 35, label: 'Contatti (lato lampada)', value: '220V AC quando chiuso', hint: 'I contatti sono COMPLETAMENTE separati dalla bobina!' },
      { id: 'tp3', x: 50, y: 65, label: 'Click meccanico', value: 'Udibile a ogni commutazione', hint: 'Un magnete muove fisicamente un contatto metallico' },
      { id: 'tp4', x: 50, y: 85, label: 'Isolamento', value: 'Resistenza >100MΩ tra bobina e contatti', hint: 'Due circuiti completamente isolati elettricamente!' }
    ],
    guessOptions: ['Relè elettromeccanico', 'Transistor di potenza', 'TRIAC', 'Contattore'],
    correctGuess: 0,
    solution: 'È un **Relè elettromeccanico**! Una bobina crea un campo magnetico che muove un contatto metallico. Arduino controlla la bobina (5V), e il contatto commuta carichi ad alta tensione (220V) in totale sicurezza. Due circuiti completamente separati!',
    connectionToVolume: 'Estende il Capitolo 8 del Volume 2: il transistor controlla il relè, che a sua volta controlla carichi ad alta tensione — una catena di amplificazione!'
  },
  {
    id: 'mystery-voltage-divider',
    title: 'Il Circuito Dimezzatore',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    volume: 2,
    chapter: 6,
    relatedExperiment: 'v2-cap6-led-serie',
    description: 'Due resistori identici sono collegati in serie. Nel punto centrale c\'è una tensione misteriosa. Quanto vale?',
    visibleParts: ['Batteria 9V', 'Fili', 'Multimetro'],
    hiddenPart: { name: 'Partitore di tensione (2x 10KΩ)', icon: '' },
    behavior: 'La batteria è 9V. Tra un capo e il punto centrale: 4.5V. Tra il punto centrale e l\'altro capo: 4.5V. Cambiando un resistore con uno da 20KΩ, le tensioni diventano 3V e 6V!',
    testPoints: [
      { id: 'tp1', x: 30, y: 30, label: 'Batteria', value: '9V totali', hint: 'La tensione totale si divide tra i due resistori' },
      { id: 'tp2', x: 50, y: 50, label: 'Punto medio', value: '4.5V (metà esatta)', hint: 'Con resistori uguali, la tensione si divide a metà!' },
      { id: 'tp3', x: 70, y: 70, label: 'Formule', value: 'Vout = Vin × R2/(R1+R2)', hint: 'La formula del partitore di tensione — fondamentale in elettronica!' }
    ],
    guessOptions: ['Trasformatore', 'Partitore di tensione', 'Regolatore di tensione', 'Filtro RC'],
    correctGuess: 1,
    solution: 'È un **Partitore di tensione**! Due resistori in serie dividono la tensione in parti proporzionali. Con R1=R2, la tensione si dimezza. La formula Vout = Vin × R2/(R1+R2) è una delle più usate in elettronica!',
    connectionToVolume: 'Il partitore di tensione è il principio dietro a molti sensori del Volume 1 e 2: la fotoresistenza e il termistore funzionano come partitori variabili!'
  },

  // === NUOVE SFIDE — © Andrea Marro — 20/02/2026 ===

  //  TERRA — Facile
  {
    id: 'mystery-tilt',
    title: 'La Sfera Rotolante',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    volume: 1,
    chapter: 8,
    relatedExperiment: 'v1-cap8-pulsante',
    description: 'Inclinando la breadboard, un LED si accende e si spegne. Non c\'è nessun pulsante, eppure il circuito si "apre" e "chiude" da solo!',
    visibleParts: ['Arduino Nano', 'Breadboard', 'LED Rosso', 'Resistore 220Ω', 'Resistore 10KΩ'],
    hiddenPart: { name: 'Sensore di inclinazione (tilt switch)', icon: '' },
    behavior: 'Con la breadboard in piano, il LED è acceso. Inclinandola di 45°, il LED si spegne. Scuotendola, il LED lampeggia rapidamente.',
    testPoints: [
      { id: 'tp1', x: 35, y: 35, label: 'Pin 2 Arduino', value: 'HIGH quando in piano, LOW quando inclinato', hint: 'Un segnale ON/OFF che dipende dall\'orientamento...' },
      { id: 'tp2', x: 65, y: 45, label: 'Ai capi del componente', value: '0Ω in piano, infinito inclinato', hint: 'La resistenza cambia con l\'inclinazione — qualcosa si apre e chiude meccanicamente' },
      { id: 'tp3', x: 50, y: 75, label: 'Rumore durante scuotimento', value: 'Leggero tintinnio metallico', hint: 'Qualcosa rotola dentro il componente!' }
    ],
    guessOptions: ['Accelerometro', 'Sensore di inclinazione (tilt switch)', 'Giroscopio', 'Interruttore a mercurio'],
    correctGuess: 1,
    solution: 'È un **Sensore di inclinazione (tilt switch)**! Contiene una piccola sfera metallica che rotola su due contatti. Quando la sfera tocca i contatti, il circuito è chiuso. Quando si inclina, la sfera rotola via e il circuito si apre!',
    connectionToVolume: 'Funziona come il pulsante del Capitolo 8 del Volume 1, ma si attiva con l\'inclinazione invece che con la pressione'
  },

  //  SCHEMA — Medio
  {
    id: 'mystery-optocoupler',
    title: 'Il Ponte di Luce',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    volume: 2,
    chapter: 11,
    relatedExperiment: 'v2-cap11-diodi',
    description: 'Due circuiti sono completamente separati — nessun filo li collega! Eppure quando premi un pulsante sul circuito A, un LED si accende sul circuito B. Magia?',
    visibleParts: ['Arduino Nano', 'Pulsante', 'LED', 'Resistori', 'Batteria 9V separata'],
    hiddenPart: { name: 'Optocoupler (4N35)', icon: '' },
    behavior: 'Pulsante premuto: il LED sul secondo circuito si accende. Rilasciato: si spegne. I due circuiti non hanno fili in comune — nemmeno il GND!',
    testPoints: [
      { id: 'tp1', x: 20, y: 40, label: 'Lato ingresso (pin 1-2)', value: 'LED IR interno: 1.2V, 10mA', hint: 'Un LED che non puoi vedere ad occhio nudo emette luce...' },
      { id: 'tp2', x: 80, y: 40, label: 'Lato uscita (pin 4-5)', value: 'Fototransistor: ON quando il LED IR è acceso', hint: 'Un componente sensibile alla luce riceve il segnale' },
      { id: 'tp3', x: 50, y: 70, label: 'Isolamento tra i lati', value: '>5000V di isolamento', hint: 'I due lati sono separati da un gap fisico — solo la luce li collega!' },
      { id: 'tp4', x: 50, y: 85, label: 'Tempo di risposta', value: '~5µs', hint: 'Veloce ma non istantaneo — la luce deve viaggiare e il fototransistor deve attivarsi' }
    ],
    guessOptions: ['Trasformatore', 'Optocoupler (fotoaccoppiatore)', 'Condensatore', 'Antenna radio'],
    correctGuess: 1,
    solution: 'È un **Optocoupler (fotoaccoppiatore)**! Contiene un LED infrarosso e un fototransistor in un unico chip. Il LED emette luce IR → il fototransistor la riceve → i due circuiti comunicano SENZA connessione elettrica. Isolamento totale!',
    connectionToVolume: 'Estende il Capitolo 11 del Volume 2: usa un LED (invisibile) e un fototransistor per creare un ponte ottico. Protegge Arduino da tensioni pericolose!'
  },

  //  CIELO — Difficile
  {
    id: 'mystery-555-timer',
    title: 'L\'Orologio Elettronico',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    volume: 2,
    chapter: 7,
    relatedExperiment: 'v2-cap7-condensatore',
    description: 'Un LED lampeggia perfettamente a 1Hz SENZA Arduino! Solo una batteria, un condensatore, un resistore e un chip misterioso a 8 pin. Come è possibile?',
    visibleParts: ['Batteria 9V', 'LED', 'Condensatore 10µF', 'Resistori 10KΩ e 100KΩ'],
    hiddenPart: { name: 'Timer NE555', icon: '' },
    behavior: 'Il LED lampeggia regolarmente: 0.5s acceso, 0.5s spento. Non c\'è nessun microcontrollore! Cambiando il condensatore o i resistori, la velocità di lampeggio cambia.',
    testPoints: [
      { id: 'tp1', x: 25, y: 35, label: 'Pin 3 (Output)', value: 'Onda quadra: 0V / 9V a 1Hz', hint: 'L\'uscita oscilla tra 0 e la tensione di alimentazione' },
      { id: 'tp2', x: 50, y: 50, label: 'Pin 2/6 (Threshold)', value: 'Onda a dente di sega: 3V-6V', hint: 'Il condensatore si carica e scarica tra due soglie...' },
      { id: 'tp3', x: 75, y: 35, label: 'Pin 7 (Discharge)', value: 'Scarica il condensatore a intervalli', hint: 'Questo pin controlla la scarica del condensatore' },
      { id: 'tp4', x: 50, y: 80, label: 'Formula frequenza', value: 'f = 1.44 / ((R1 + 2×R2) × C)', hint: 'La frequenza dipende SOLO dai valori di R e C — pura matematica!' },
      { id: 'tp5', x: 25, y: 65, label: 'Pin 4 (Reset)', value: 'Collegato a +Vcc (attivo)', hint: 'Il pin reset deve essere HIGH per far funzionare il chip' }
    ],
    guessOptions: ['Microcontrollore ATtiny', 'Timer NE555', 'Oscillatore al quarzo', 'Astabile con transistor'],
    correctGuess: 1,
    solution: 'È il leggendario **Timer NE555**! Inventato nel 1972, è il chip integrato più venduto della storia (oltre 1 MILIARDO di pezzi all\'anno!). In modalità astabile, usa un condensatore che si carica e scarica tra due soglie per creare un\'onda quadra perfetta.',
    connectionToVolume: 'Usa lo stesso principio di carica/scarica del condensatore del Capitolo 7 del Volume 2, ma il NE555 lo fa automaticamente e con precisione. È come avere un Arduino che fa UNA sola cosa, ma alla perfezione!'
  }
];

export default MYSTERY_CIRCUITS;
