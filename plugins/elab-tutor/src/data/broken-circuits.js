// ============================================
// ELAB Circuit Detective — Circuiti Rotti
// Productive Failure (Kafai SIGCSE 2019)
//  Andrea Marro — 2026
// ============================================

export const BROKEN_CIRCUITS = [
  // === TERRA — Livello 1 (Facile) ===
  {
    id: 'led-reversed',
    title: 'Il LED misterioso',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'Un LED è collegato alla breadboard ma non si accende. Il circuito sembra completo... cosa non va?',
    experimentId: 'v1-cap6-esp1',
    wokwiId: '383122226642641921',
    schematicText: `[+5V] ──── [R 220Ω] ──── [LED] ──── [GND]
                                    ↑ INVERTITO!
  Il LED è collegato al contrario:
  Catodo verso +5V, Anodo verso GND`,
    fault: { type: 'component-polarity', component: 'LED1' },
    hints: [
      'Il LED è un componente con polarità. Ha un terminale positivo (anodo) e uno negativo (catodo).',
      'Il terminale lungo del LED è l\'anodo (+). Deve essere collegato al lato positivo.',
      'Prova a invertire il LED: gira i due terminali.'
    ],
    solution: 'Il LED era collegato al contrario! I LED funzionano solo in una direzione: l\'anodo (+, gamba lunga) va verso il positivo della batteria.',
    concept: 'Polarità dei componenti',
    whatYouLearn: 'I diodi (e i LED) conducono corrente solo in una direzione. Questo si chiama "polarità".'
  },
  {
    id: 'missing-resistor',
    title: 'Il LED che esplode',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'Il LED si accende ma dopo un momento... puff! Si brucia. Cosa manca nel circuito?',
    experimentId: 'v1-cap6-esp1',
    wokwiId: '383122226642641921',
    schematicText: `[+5V] ──── [LED] ──── [GND]
                   ↑
  MANCA IL RESISTORE!
  Tutta la corrente passa nel LED`,
    fault: { type: 'missing-component', component: 'Resistore' },
    hints: [
      'Un LED ha bisogno di un compagno per non bruciarsi. Quale componente limita la corrente?',
      'Senza un resistore, troppa corrente passa attraverso il LED.',
      'Prova ad aggiungere un resistore da 220Ω o 330Ω in serie con il LED.'
    ],
    solution: 'Mancava il resistore di protezione! Senza resistore, tutta la corrente passa nel LED e lo brucia. Un resistore da 220-330Ω lo protegge.',
    concept: 'Resistori di protezione',
    whatYouLearn: 'I resistori limitano la corrente nel circuito. Ogni LED ha bisogno di un resistore per non bruciarsi.'
  },
  {
    id: 'open-circuit',
    title: 'Il circuito fantasma',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'Tutti i componenti sono sulla breadboard, ma non succede niente. Nessuna luce, nessun suono. È come se non ci fosse circuito!',
    experimentId: 'v1-cap6-esp1',
    wokwiId: '383122226642641921',
    schematicText: `[+5V] ──── [R 220Ω] ──── [LED] ──╳── [GND]
                                              ↑
                                    CIRCUITO APERTO!
  Il filo non fa contatto → la corrente non scorre`,
    fault: { type: 'open-circuit', component: 'Filo' },
    hints: [
      'Un circuito deve essere un percorso CHIUSO. La corrente deve poter tornare alla batteria.',
      'Controlla ogni connessione: i fili sono tutti collegati correttamente?',
      'Sulla breadboard, le righe sono collegate orizzontalmente. Sei sicuro che i componenti siano nella stessa riga?'
    ],
    solution: 'Il circuito era aperto: un filo non faceva contatto. La corrente ha bisogno di un percorso completo (chiuso) per scorrere!',
    concept: 'Circuito chiuso vs aperto',
    whatYouLearn: 'L\'elettricità scorre solo in un circuito chiuso. Se c\'è un\'interruzione, il circuito è "aperto" e non funziona.'
  },
  {
    id: 'battery-wrong',
    title: 'La batteria muta',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'Il circuito è collegato perfettamente, il LED è nel verso giusto, c\'è il resistore... ma nulla si accende!',
    experimentId: 'v1-cap6-esp1',
    wokwiId: '383122226642641921',
    schematicText: `[GND] ──── [R 220Ω] ──── [LED] ──── [+5V]
  ↑ INVERTITO!                              ↑ INVERTITO!
  I fili di alimentazione sono scambiati:
  Rosso al - e Nero al + della batteria`,
    fault: { type: 'power-issue', component: 'Batteria' },
    hints: [
      'Se il circuito è giusto ma non funziona, il problema potrebbe essere l\'alimentazione.',
      'La batteria ha anche lei un polo positivo (+) e uno negativo (-).',
      'Controlla che i fili dell\'alimentazione siano collegati: rosso al + e nero al -.'
    ],
    solution: 'I fili dell\'alimentazione erano invertiti! Il polo + della batteria deve andare alla riga + della breadboard (rosso), e il - alla riga - (blu/nero).',
    concept: 'Alimentazione e polarità',
    whatYouLearn: 'Anche la batteria ha una polarità. Se la colleghi al contrario, il circuito non funziona (e puoi danneggiare i componenti!).'
  },
  {
    id: 'short-circuit-led',
    title: 'Il cortocircuito silenzioso',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'C\'è un LED con il suo resistore, ma il LED non si accende. Eppure la batteria si scalda!',
    experimentId: 'v1-cap6-esp1',
    wokwiId: '383122226642641921',
    schematicText: `[+5V] ──┬── [R 220Ω] ──── [LED] ──── [GND]
         │                              │
         └──────────────────────────────┘
         ↑ CORTOCIRCUITO! La corrente bypassa il LED`,
    fault: { type: 'short-circuit', component: 'Filo' },
    hints: [
      'Se la batteria si scalda, la corrente scorre... ma non nel LED. Dove va?',
      'Un cortocircuito è quando la corrente trova una strada più facile e "salta" il componente.',
      'Cerca un filo che collega direttamente + e - senza passare per il LED.'
    ],
    solution: 'C\'era un cortocircuito! Un filo collegava direttamente il + e il - della batteria, bypassando il LED. La corrente sceglie sempre la strada più facile.',
    concept: 'Cortocircuito',
    whatYouLearn: 'Un cortocircuito è pericoloso: la corrente bypassa i componenti e può surriscaldare la batteria o i fili.'
  },

  // ===  SCHEMA — Livello 2 (Medio) ===
  {
    id: 'wrong-resistor-value',
    title: 'Il LED timido',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Il LED si accende... ma è debolissimo. Quasi non si vede. Il circuito sembra giusto, eppure qualcosa non va.',
    experimentId: 'v1-cap6-esp1',
    wokwiId: '383122226642641921',
    schematicText: `[+5V] ──── [R 10KΩ] ──── [LED] ──── [GND]
                    ↑ TROPPO GRANDE!
  I = V/R = 5V/10000Ω = 0.5mA (troppo poco!)
  Serve 220Ω → I = 5V/220Ω = ~23mA`,
    fault: { type: 'wrong-value', component: 'Resistore', wrongValue: '10KΩ', correctValue: '220Ω' },
    hints: [
      'Il LED si accende, quindi il circuito è chiuso. Ma la luminosità dipende dalla corrente...',
      'La legge di Ohm dice: I = V/R. Se R è molto grande, I è molto piccola.',
      'Quale valore ha il resistore? 220Ω o 10KΩ fanno una differenza enorme!'
    ],
    solution: 'Il resistore era da 10KΩ invece di 220Ω! Con 10KΩ passa pochissima corrente (0.3mA), troppo poco per far brillare il LED. Con 220Ω passa circa 14mA: perfetto!',
    concept: 'Legge di Ohm - V=IR',
    whatYouLearn: 'Il valore del resistore determina quanta corrente scorre. Troppo alto → LED debole. Troppo basso → LED bruciatissimo.'
  },
  {
    id: 'series-parallel-mix',
    title: 'I LED diseguali',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Due LED sono collegati, ma uno è luminoso e l\'altro quasi spento. Perché non sono uguali?',
    experimentId: 'v1-cap7-esp1',
    wokwiId: '375155589773654017',
    schematicText: `[+5V] ─── [R 220Ω] ─── [LED R] ─── [LED B] ─── [GND]
                              1.8V ↑       3.3V ↑
  IN SERIE: 5V - 1.8V - 3.3V = -0.1V
  Non resta tensione per il LED blu!`,
    fault: { type: 'circuit-topology', component: 'LED', issue: 'serie-vs-parallelo' },
    hints: [
      'Quando due LED sono in serie, la stessa corrente passa per entrambi, ma la tensione si divide.',
      'LED diversi (colori diversi) hanno tensioni di soglia diverse: rosso ~1.8V, blu ~3.3V.',
      'Se la tensione totale non basta, il LED con soglia più alta riceve meno tensione.'
    ],
    solution: 'I due LED avevano colori diversi (rosso e blu) collegati in serie. Il LED blu ha bisogno di più tensione (3.3V vs 1.8V del rosso). Con 5V totali e un resistore, non resta abbastanza tensione per il blu!',
    concept: 'Tensione di soglia dei LED e circuiti serie',
    whatYouLearn: 'Ogni colore di LED ha una tensione di soglia diversa. In serie, bisogna assicurarsi che la tensione totale sia sufficiente per tutti.'
  },
  {
    id: 'pullup-missing',
    title: 'Il pulsante instabile',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Hai un pulsante collegato ad Arduino, ma il LED collegato al pin digitale lampeggia a caso anche senza premere il pulsante!',
    experimentId: 'v1-cap8-esp1',
    wokwiId: '384649621886435329',
    schematicText: `Arduino Pin 2 ──── [Pulsante] ──── [GND]
       ↑ FLOATING!
  Senza pull-up, il pin "galleggia"
  Serve: Pin 2 ──── [R 10KΩ] ──── [+5V]`,
    fault: { type: 'floating-pin', component: 'Pin digitale', fix: 'pull-up resistor' },
    hints: [
      'Quando un pin digitale di Arduino non è collegato a niente, è in stato "floating" — né HIGH né LOW.',
      'Un pin floating cattura interferenze elettromagnetiche e dà valori casuali.',
      'Serve un resistore che "tiri" il pin verso un valore definito quando il pulsante non è premuto.'
    ],
    solution: 'Mancava un resistore di pull-up (o pull-down)! Senza di esso, il pin di Arduino "galleggia" tra HIGH e LOW. Un resistore da 10KΩ tra il pin e +5V (pull-up) o GND (pull-down) risolve tutto.',
    concept: 'Pin floating e resistenze di pull-up/pull-down',
    whatYouLearn: 'I pin digitali devono essere sempre collegati a un livello definito. Il resistore di pull-up/pull-down evita comportamenti instabili.'
  },
  {
    id: 'servo-jitter',
    title: 'Il servo che trema',
    difficulty: 2,
    layer: 'schema',
    icon: '',
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    description: 'Un servo motore è collegato ad Arduino, ma invece di muoversi fluidamente, trema e scatta in posizioni casuali.',
    experimentId: 'v2-cap8-esp1',
    wokwiId: '377009321625078785',
    schematicText: `Arduino 5V ──── [Servo VCC] (rosso)
Arduino GND ──── [Servo GND] (marrone)
Arduino Pin 9 ── [Servo SIG] (arancio)
  ↑ ALIMENTAZIONE INSUFFICIENTE!
  Il servo chiede ~500mA, Arduino USB dà max ~500mA totali`,
    fault: { type: 'power-issue', component: 'Servo', issue: 'alimentazione insufficiente' },
    hints: [
      'I servo motori consumano molta corrente, soprattutto quando si muovono sotto carico.',
      'Arduino può fornire solo ~40mA per pin e ~500mA in totale tramite USB.',
      'Se il servo chiede troppa corrente, la tensione crolla e Arduino si resetta o il servo trema.'
    ],
    solution: 'Il servo era alimentato direttamente da Arduino USB, che non può fornire abbastanza corrente! Serve un\'alimentazione esterna (batterie) per il servo, con il GND in comune con Arduino.',
    concept: 'Alimentazione esterna per motori',
    whatYouLearn: 'I motori e i servo hanno bisogno di più corrente di quella che Arduino può dare. Usa sempre un\'alimentazione esterna per i motori!'
  },
  {
    id: 'buzzer-no-tone',
    title: 'Il buzzer silenzioso',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Il buzzer è collegato e il codice sembra giusto, ma non emette nessun suono. Nemmeno un bip.',
    experimentId: 'v1-cap10-esp2',
    wokwiId: '358918009552952321',
    schematicText: `Arduino Pin 9 ──── [Buzzer +] ──── [GND]
  Codice: tone(8, 440, 500);
              ↑ PIN 8 nel codice!
  Il buzzer è sul pin 9 ma il codice usa il pin 8`,
    fault: { type: 'code-bug', component: 'Codice', issue: 'pin sbagliato' },
    hints: [
      'Controlla il codice: il pin usato nel codice corrisponde al pin fisico dove è collegato il buzzer?',
      'La funzione tone() ha bisogno di: pin, frequenza, durata. Manca qualcosa?',
      'Prova a collegare il buzzer al pin 8 e a usare tone(8, 440, 500) — se suona, il problema era il pin!'
    ],
    solution: 'Il buzzer era collegato al pin 9, ma il codice usava tone(8, 440, 500) — pin 8! Il pin nel codice deve corrispondere esattamente al pin fisico.',
    concept: 'Corrispondenza pin software/hardware',
    whatYouLearn: 'Il numero del pin nel codice deve corrispondere al pin fisico sulla scheda. Un errore di un numero e il componente non funziona!'
  },
  {
    id: 'analog-digital-confusion',
    title: 'Il sensore che mente',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Un sensore di luce (LDR) è collegato ad Arduino, ma il valore letto è sempre 0 o 1023, mai nel mezzo.',
    experimentId: 'v1-cap9-esp2',
    wokwiId: '390313893645901825',
    schematicText: `[+5V] ──── [LDR] ───┬──── [R 10KΩ] ──── [GND]
                        │
                  Arduino A0
  Codice: digitalRead(A0)  ← ERRORE!
  Serve:  analogRead(A0)   ← CORRETTO`,
    fault: { type: 'pin-type-error', component: 'Pin', issue: 'digitalRead su pin analogico' },
    hints: [
      'Arduino ha due tipi di pin: digitali (0 o 1) e analogici (0-1023). Quale stai usando?',
      'Se usi digitalRead() su un sensore analogico, vedrai solo 0 o 1.',
      'Un sensore come l\'LDR produce valori variabili. Usa analogRead() per leggerli!'
    ],
    solution: 'Il codice usava digitalRead() invece di analogRead()! digitalRead restituisce solo HIGH (1) o LOW (0). Per leggere il valore variabile dell\'LDR serve analogRead() su un pin analogico (A0-A5).',
    concept: 'Input digitale vs analogico',
    whatYouLearn: 'digitalRead = sì/no. analogRead = un valore da 0 a 1023. Per sensori variabili (luce, temperatura, potenziometro) usa sempre analogRead!'
  },
  {
    id: 'lcd-no-text',
    title: 'Lo schermo vuoto',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Il display LCD si accende (la retroilluminazione funziona), ma non mostra nessun testo. Solo rettangoli neri o niente.',
    experimentId: 'v2-cap6-esp1',
    wokwiId: '375155589773654017',
    schematicText: `Arduino ──── [LCD 16x2]
  Pin 12 → RS    Pin 11 → EN
  Pin 5  → D4    Pin 4  → D5
  Pin 3  → D6    Pin 2  → D7
  V0 → GND (contrasto al MAX)
  ↑ Manca lcd.begin(16, 2) nel setup()!`,
    fault: { type: 'initialization', component: 'LCD', issue: 'contrasto o init mancante' },
    hints: [
      'Se la retroilluminazione funziona, il display riceve corrente. Il problema è nel segnale dati.',
      'Controlla se nel codice c\'è lcd.begin(16, 2) — senza questa riga il display non sa quanto è grande!',
      'Se vedi rettangoli neri, il contrasto potrebbe essere troppo alto. Serve un potenziometro sul pin V0.'
    ],
    solution: 'Mancava lcd.begin(16, 2) nel setup()! Senza questa inizializzazione, il display non sa come interpretare i dati. I rettangoli neri indicano contrasto al massimo senza dati.',
    concept: 'Inizializzazione dei componenti',
    whatYouLearn: 'Molti componenti digitali hanno bisogno di essere "inizializzati" nel codice prima di poterli usare. Senza begin(), il display non sa cosa fare!'
  },

  // ===  CIELO — Livello 3 (Difficile) ===
  {
    id: 'robot-circle',
    title: 'Il robot che gira in tondo',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    description: 'Hai costruito un robot con due motori, ma invece di andare dritto, gira sempre a destra. Eppure il codice dice "avanti"!',
    experimentId: 'v2-cap8-esp1',
    wokwiId: '377009321625078785',
    schematicText: `    [Motore SX]  ←──  Arduino Pin 5 (PWM 200)
    [Motore DX]  ←──  Arduino Pin 6 (PWM 200)
              ↑ POLARITÀ INVERTITA!
  + Il motore DX è collegato al contrario → gira indietro
  + Anche con stessa PWM, i motori non sono uguali`,
    fault: { type: 'multiple-faults', faults: ['motor-wiring', 'speed-mismatch'] },
    hints: [
      'Se il robot gira, un motore va più veloce dell\'altro. Perché?',
      'Controlla che entrambi i motori abbiano la stessa polarità e la stessa velocità nel codice.',
      'Anche con lo stesso codice, i motori fisici possono avere velocità diverse. Serve una calibrazione!'
    ],
    solution: 'Due problemi: 1) Un motore era collegato con polarità invertita (girava al contrario). 2) I motori fisici non sono mai identici — serve analogWrite con valori leggermente diversi per farli girare alla stessa velocità.',
    concept: 'Calibrazione motori e debugging multi-componente',
    whatYouLearn: 'I robot reali non sono perfetti! Serve sempre calibrare i motori e fare test incrementali. Il debugging di sistemi complessi richiede isolare ogni componente.'
  },
  {
    id: 'sensor-feedback-loop',
    title: 'Il sistema impazzito',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    description: 'Un sensore di luce controlla un LED: più luce → LED acceso. Ma il sistema oscilla: LED acceso/spento/acceso/spento all\'infinito!',
    experimentId: 'v1-cap9-esp2',
    wokwiId: '390313893645901825',
    schematicText: `[LDR] ──── Arduino A0 ──── codice ──── Pin 3 ──── [LED]
  ↑                                                    │
  └────────── la luce del LED colpisce l'LDR! ─────────┘
              ↑ FEEDBACK LOOP!
  LED acceso → LDR vede luce → LED spento → LDR buio → LED acceso...`,
    fault: { type: 'feedback-loop', component: 'Sistema', issue: 'il LED illumina il sensore' },
    hints: [
      'Quando il LED si accende, cosa vede il sensore di luce?',
      'Se il sensore "vede" la luce del LED, pensa che ci sia luce e spegne il LED. Poi è buio e lo riaccende...',
      'Questo si chiama "feedback loop" — un ciclo che si auto-alimenta!'
    ],
    solution: 'Il LED illuminava il sensore LDR, creando un feedback loop! Soluzione: separa fisicamente LED e sensore, oppure aggiungi un ritardo (delay) o una soglia con isteresi nel codice.',
    concept: 'Feedback loop e isteresi',
    whatYouLearn: 'Nei sistemi automatici, l\'uscita può influenzare l\'ingresso creando oscillazioni. L\'isteresi (una "zona morta" tra accensione e spegnimento) è la soluzione classica.'
  },
  {
    id: 'timing-race',
    title: 'Il semaforo impazzito',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    description: 'Un semaforo con 3 LED e un pulsante pedonale. Quando premi il pulsante, a volte funziona... a volte no. Sembra casuale!',
    experimentId: 'v1-cap7-esp1',
    wokwiId: '375155589773654017',
    schematicText: `Pin 5 → [LED Verde]     Pin 2 ← [Pulsante]
Pin 6 → [LED Giallo]
Pin 7 → [LED Rosso]
  Codice:
  delay(5000);  ← BLOCCA TUTTO!
  if(digitalRead(2)) { ... }  ← mai letto durante delay!`,
    fault: { type: 'timing-issue', component: 'Codice', issue: 'delay blocca lettura pulsante' },
    hints: [
      'Il codice usa delay() per temporizzare i LED del semaforo. Cosa succede durante un delay()?',
      'Durante delay(), Arduino è completamente bloccato — non legge nessun input!',
      'Se premi il pulsante mentre Arduino è nel mezzo di un delay(5000), il pulsante viene ignorato.'
    ],
    solution: 'I delay() bloccano Arduino e impediscono la lettura del pulsante! Soluzione: usare millis() invece di delay() per un timing non-bloccante, così Arduino può leggere il pulsante continuamente.',
    concept: 'Timing non-bloccante con millis()',
    whatYouLearn: 'delay() blocca TUTTO il programma. millis() permette di fare più cose contemporaneamente. Questa è la differenza tra un programma "bloccante" e uno "non-bloccante".'
  },

  // === NUOVE SFIDE —  Andrea Marro — 20/02/2026 ===

  //  TERRA — Nuove sfide facili
  {
    id: 'capacitor-polarity',
    title: 'Il condensatore fumante',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'Hai collegato un condensatore elettrolitico al circuito, ma dopo pochi secondi inizia a scaldarsi e a gonfiarsi. Cosa sta succedendo?',
    experimentId: 'v2-cap7-condensatore',
    wokwiId: '378675449062418433',
    schematicText: `[+5V] ──── [C 100µF] ──── [GND]
                    ↑ POLARITÀ INVERTITA!
  I condensatori elettrolitici hanno + e −
  Se li inverti → si danneggiano!`,
    fault: { type: 'component-polarity', component: 'Condensatore' },
    hints: [
      'I condensatori elettrolitici (quelli cilindrici) hanno una polarità, come i LED.',
      'La striscia con il segno "−" indica il terminale negativo. Deve andare verso il GND.',
      'Se li colleghi al contrario, si danneggiano e possono gonfiarsi o scoppiare!'
    ],
    solution: 'Il condensatore elettrolitico era collegato al contrario! La gamba lunga (o il lato senza striscia) è il positivo (+) e deve andare verso la tensione più alta. Invertendolo si evita il danno.',
    concept: 'Polarità dei condensatori elettrolitici',
    whatYouLearn: 'I condensatori elettrolitici hanno una polarità. Collegarli al contrario può farli esplodere! Controlla sempre la striscia "−" sul corpo del condensatore.'
  },
  {
    id: 'missing-ground',
    title: 'Il circuito senza ritorno',
    difficulty: 1,
    layer: 'terra',
    icon: '',
    description: 'Un sensore collegato ad Arduino legge sempre 1023. Non cambia mai, qualsiasi cosa tu faccia. Perché?',
    experimentId: 'v1-cap9-pot',
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    wokwiId: '376421051626471425',
    schematicText: `[+5V] ──── [Potenziometro] ──── Pin A0
                                          ↑
  MANCA IL COLLEGAMENTO A GND!
  Senza GND il sensore "galleggia" a 5V`,
    fault: { type: 'missing-connection', component: 'GND' },
    hints: [
      'Se il valore è sempre 1023 (il massimo), il pin vede sempre 5V. Manca qualcosa nel circuito.',
      'Un partitore di tensione ha bisogno di DUE percorsi: verso +5V e verso GND.',
      'Senza il collegamento a GND, non c\'è un percorso per la corrente e il pin "vede" sempre 5V.'
    ],
    solution: 'Mancava il collegamento a GND (massa)! Ogni circuito ha bisogno di un percorso di ritorno. Senza GND, il pin analogico di Arduino vede sempre la tensione massima.',
    concept: 'Importanza del collegamento a massa (GND)',
    whatYouLearn: 'GND è fondamentale quanto il +5V. Senza massa, i sensori non funzionano e i pin leggono valori fissi o casuali.'
  },

  //  SCHEMA — Nuove sfide medie
  {
    id: 'wrong-pin-pwm',
    title: 'Il LED che non dimmerizza',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Il codice usa analogWrite per far dimmerizzare un LED, ma il LED è o completamente acceso o completamente spento. Nessuna sfumatura!',
    experimentId: 'v3-cap8-pot',
    wokwiId: '376421051626471425',
    schematicText: `Arduino Pin 4 ──── [R 220Ω] ──── [LED] ──── [GND]
  Codice: analogWrite(4, 128);
              ↑ PIN 4 NON HA PWM!
  Solo pin 3, 5, 6, 9, 10, 11 supportano PWM
  Il pin 4 fa solo digitalWrite → ON/OFF`,
    fault: { type: 'wrong-pin', component: 'Pin', issue: 'pin senza PWM' },
    hints: [
      'analogWrite() funziona solo su pin specifici. Non tutti i pin di Arduino supportano il PWM.',
      'I pin PWM di Arduino Uno sono: 3, 5, 6, 9, 10, 11. Hanno il simbolo ~ accanto al numero.',
      'Se usi analogWrite su un pin non-PWM, il LED si accende solo se il valore è > 127.'
    ],
    solution: 'Il LED era collegato al pin 4, che NON supporta il PWM! Arduino Uno ha PWM solo sui pin 3, 5, 6, 9, 10, 11 (quelli con ~). Sposta il LED su un pin PWM e il dimmeraggio funzionerà!',
    concept: 'Pin PWM vs pin digitali normali',
    whatYouLearn: 'Non tutti i pin di Arduino sono uguali. Solo i pin con la ~ supportano analogWrite (PWM). Gli altri fanno solo ON o OFF.'
  },
  {
    id: 'ground-loop',
    title: 'Il sensore pazzo',
    difficulty: 2,
    layer: 'schema',
    icon: '',
    description: 'Un sensore analogico legge valori instabili anche se nulla cambia. Il Serial Monitor mostra numeri che saltano tra 300 e 700 senza motivo!',
    experimentId: 'v1-cap10-foto',
    wokwiId: '390313893645901825',
    schematicText: `Arduino (USB) ──── [Sensore] ──── Alimentazione esterna
                GND1 ≠ GND2
  ↑ GROUND LOOP!
  Due masse diverse creano una differenza
  di tensione che disturba il segnale`,
    fault: { type: 'ground-loop', component: 'Alimentazione', issue: 'masse non collegate' },
    hints: [
      'Se i valori sono instabili senza motivo, potrebbe essere un problema di alimentazione o di massa.',
      'Quando usi un\'alimentazione esterna, il GND deve essere collegato al GND di Arduino.',
      'Senza un GND comune, c\'è una differenza di potenziale tra le due masse che crea rumore.'
    ],
    solution: 'Ground loop! Il sensore era alimentato da una batteria esterna il cui GND non era collegato al GND di Arduino. Senza un riferimento di massa comune, il segnale "galleggia" e oscilla.',
    concept: 'Ground loop e massa comune',
    whatYouLearn: 'Tutti i componenti del circuito devono condividere lo STESSO GND. Se ci sono più alimentazioni, i GND devono essere collegati insieme.'
  },

  //  CIELO — Nuova sfida difficile
  {
    id: 'interrupt-conflict',
    title: 'I due pulsanti rivali',
    difficulty: 3,
    layer: 'cielo',
    icon: '',
    description: 'Due pulsanti controllano due LED diversi. Premendo un pulsante funziona, ma premendo l\'altro... a volte fa la cosa sbagliata o non risponde!',
    experimentId: 'v1-cap8-pulsante',
    wokwiId: '384649621886435329',
    schematicText: `Pin 2 ← [Pulsante A] → LED A (Pin 5)
Pin 3 ← [Pulsante B] → LED B (Pin 6)
  Codice:
  attachInterrupt(0, toggleA, FALLING);
  attachInterrupt(1, toggleB, FALLING);
  ↑ I due interrupt condividono variabili
    senza volatile e senza protezione!`,
    fault: { type: 'concurrency', component: 'Codice', issue: 'variabili condivise senza volatile' },
    hints: [
      'Gli interrupt possono interrompere il programma IN QUALSIASI momento, anche nel mezzo di un\'istruzione.',
      'Se due interrupt modificano la stessa variabile, possono "sovrascriversi" a vicenda.',
      'Le variabili usate negli interrupt devono essere dichiarate "volatile" e le sezioni critiche protette.'
    ],
    solution: 'Race condition! I due interrupt potevano scattare nello stesso momento e modificare variabili condivise. Senza "volatile" e protezione (noInterrupts/interrupts), il comportamento è imprevedibile.',
    concept: 'Race condition e interrupt safety',
    whatYouLearn: 'Quando più parti del codice possono modificare gli stessi dati contemporaneamente, servono precauzioni: "volatile" per le variabili e sezioni critiche protette.'
  }
];

export default BROKEN_CIRCUITS;
