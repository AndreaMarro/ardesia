/**
 * ELAB Experiments — Volume 1: Le Basi
 * 38 esperimenti — SOLO batteria 9V, ZERO Arduino
 * Verificato CoVe dai PDF reali del Volume 1
 * Layout ricalcolato con spaziatura minima 55px H / 45px V
 * unlimPrompt aggiunto per ogni esperimento
 * © Andrea Marro — 10/02/2026
 */

const EXPERIMENTS_VOL1 = {
  title: "Volume 1 - Le Basi",
  subtitle: "Circuiti fondamentali con LED, pulsanti e sensori",
  icon: "\u{1F4D7}",
  color: "#4A7A25",
  experiments: [
    // ═══════════════════════════════════════════════════
    // CAPITOLO 6 — Cos'è il diodo LED? (3 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap6-esp1",
      title: "Cap. 6 Esp. 1 - Accendi il tuo primo LED",
      desc: "Il tuo primo circuito! Collega batteria 9V, resistore e LED sulla breadboard.",
      chapter: "Capitolo 6 - Cos'è il diodo LED?",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:f10"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:b2", color: "red" },
        { from: "bb1:e9", to: "bb1:f9", color: "green" },
        { from: "bb1:j10", to: "bb1:bus-bot-minus-10", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-1", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "led1": { x: 181.5, y: 68.75 }
      },
      steps: [
        "Inserisci il resistore da 470\u03A9 nella fila A, colonne 2-9",
        "Inserisci il LED rosso con l'anodo in F9 e il catodo in F10 (sotto il gap centrale)",
        "Collega un filo ROSSO dal bus + (colonna 2) al foro B2",
        "Collega un filo VERDE dal foro E9 al foro F9 (attraversa il gap centrale)",
        "Collega un filo NERO dal foro J10 al bus \u2212 inferiore (colonna 10)",
        "Collega la batteria 9V: filo rosso al bus +, filo nero al bus \u2212"
      ],
      observe: "Il LED rosso si accende! Il resistore da 470\u03A9 limita la corrente a circa 15mA, proteggendo il LED.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Accendi il tuo primo LED'. Questo è il primissimo circuito: batteria 9V, resistore da 470 ohm e LED rosso. Spiega cos'è un circuito chiuso, perché serve il resistore (protezione LED), e cosa significano anodo e catodo. Usa l'analogia dell'acqua che scorre in un tubo. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Circuito base, polarità LED, resistore di protezione",
      layer: "terra",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Inserisci il resistore da 470Ω nei fori A2 e A9 (fila A, sezione superiore)",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore protegge il LED dalla troppa corrente. Mettilo nella fila A, colonne 2 e 9."
        },
        {
          step: 2,
          text: "Inserisci il LED rosso nei fori F9 (anodo) e F10 (catodo), sotto il gap centrale!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:f9", "led1:cathode": "bb1:f10" },
          hint: "Il LED va nella sezione inferiore (f-j). L'anodo (+, più lungo) in F9, il catodo (−) in F10."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal bus + (colonna 2) al foro B2",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:b2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al resistore tramite la colonna 2."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal foro E9 al foro F9 (attraversa il gap centrale!)",
          wireFrom: "bb1:e9",
          wireTo: "bb1:f9",
          wireColor: "green",
          hint: "Questo filo collega il resistore (sezione a-e) all'anodo del LED (sezione f-j)."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro J10 al bus − inferiore (colonna 10)",
          wireFrom: "bb1:j10",
          wireTo: "bb1:bus-bot-minus-10",
          wireColor: "black",
          hint: "Questo filo porta la corrente dal catodo del LED al bus negativo inferiore."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal bus − inferiore al bus − superiore (ponte tra le due strisce)",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-1",
          wireColor: "black",
          hint: "Questo ponte collega il bus negativo inferiore a quello superiore."
        },
        {
          step: 7,
          text: "Collega la batteria 9V: filo rosso al bus + e filo nero al bus −",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "La batteria alimenta il circuito: rosso al +, nero al −."
        },
        {
          step: 8,
          text: "Collega il filo NERO dalla batteria al bus − superiore",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Il polo negativo della batteria chiude il circuito. Il LED si accende!"
        }
      ],
      quiz: [
        {
          question: "Perché serve il resistore nel circuito con il LED?",
          options: ["Protegge il LED dalla troppa corrente", "Fa più luce", "Non serve, è decorativo"],
          correct: 0,
          explanation: "Il resistore limita la corrente che passa nel LED, proteggendolo dal bruciarsi!"
        },
        {
          question: "Qual è la gamba più lunga del LED?",
          options: ["L'anodo (positivo)", "Il catodo (negativo)", "Sono uguali"],
          correct: 0,
          explanation: "La gamba più lunga del LED è l'anodo (+). Va collegata verso il positivo della batteria."
        }
      ]
    },
    {
      id: "v1-cap6-esp2",
      title: "Cap. 6 Esp. 2 - LED senza resistore (cosa NON fare!)",
      desc: "Attenzione! Collegare un LED senza resistore lo brucia. Impara perché il resistore è essenziale.",
      chapter: "Capitolo 6 - Cos'è il diodo LED?",
      difficulty: 1,
      icon: "\u26A0\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "led", id: "led1", color: "blue" }
      ],
      pinAssignments: {
        "led1:anode": "bb1:f2",
        "led1:cathode": "bb1:f3"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:e2", to: "bb1:f2", color: "red" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-1", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "led1": { x: 129, y: 68.75 }
      },
      steps: [
        "Inserisci il LED blu nei fori F2 (anodo) e F3 (catodo), sotto il gap centrale",
        "Collega un filo ROSSO dal bus + (colonna 2) al foro A2",
        "Collega un filo ROSSO dal foro E2 al foro F2 (attraversa il gap centrale)",
        "Collega un filo NERO dal foro J3 al bus − inferiore (colonna 3)",
        "ATTENZIONE: il LED si brucerà! Questo esperimento mostra cosa NON fare"
      ],
      observe: "Il LED lampeggia brevemente e si brucia! Senza resistore, la corrente \u00e8 troppo alta (9V diretti su un LED da 2V).",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED senza resistore'. Il LED è collegato direttamente alla batteria 9V SENZA resistore. Spiega perché è pericoloso: troppa corrente brucia il LED. Usa l'analogia di un rubinetto aperto al massimo che rompe il tubo. Spiega la differenza tra 9V della batteria e i 2V che il LED sopporta. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Troppa corrente, LED brucia, importanza del resistore",
      layer: "terra",
      note: "Il simulatore mostrerà il LED che si brucia! Troppa corrente senza resistore.",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il LED blu e posizionalo nei fori F2 (anodo) e F3 (catodo), sotto il gap centrale. SENZA resistore!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:f2", "led1:cathode": "bb1:f3" },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          hint: "L'anodo (+) va in F2, il catodo (−) va in F3. Nella sezione inferiore della breadboard!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal polo positivo della batteria al bus + (colonna 1)",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta i 9V della batteria al bus positivo."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal bus + (colonna 2) al foro A2",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "La corrente arriva alla colonna 2, sezione superiore."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal foro E2 al foro F2 (attraversa il gap centrale!)",
          wireFrom: "bb1:e2",
          wireTo: "bb1:f2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla sezione superiore all'anodo del LED nella sezione inferiore."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro J3 al bus − inferiore (colonna 3)",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Il catodo del LED si collega al bus negativo inferiore."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal bus − inferiore al bus − superiore (ponte)",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-1",
          wireColor: "black",
          hint: "Il ponte collega i due bus negativi."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal bus − superiore al polo negativo della batteria. ATTENZIONE: il LED si brucerà!",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Premi Play e osserva: 9V diretti su un LED da 2V = troppa corrente!"
        }
      ],
      quiz: [
        {
          question: "Cosa succede se colleghi un LED direttamente alla batteria senza resistore?",
          options: ["Il LED si brucia per troppa corrente", "Il LED brilla normalmente", "Non succede nulla"],
          correct: 0,
          explanation: "Senza resistore, troppa corrente passa nel LED e lo danneggia! Serve sempre un resistore di protezione."
        },
        {
          question: "A cosa serve il resistore in un circuito con il LED?",
          options: ["A limitare la corrente per proteggere il LED", "A far cambiare colore al LED", "A far lampeggiare il LED"],
          correct: 0,
          explanation: "Il resistore limita la corrente che passa, proteggendo il LED dalla troppa energia."
        }
      ]
    },
    {
      // NOTA: Immagine di riferimento corretta: pag. 33 / img-051.jpg.
      id: "v1-cap6-esp3",
      title: "Cap. 6 Esp. 3 - Cambia luminosità con resistenze diverse",
      desc: "Parti da 470Ω, poi cambia a 220Ω (più luminoso) e 1kΩ (meno luminoso). Osserva la differenza!",
      chapter: "Capitolo 6 - Cos'è il diodo LED?",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "green" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:f10"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:b2", color: "red" },
        { from: "bb1:e9", to: "bb1:f9", color: "green" },
        { from: "bb1:j10", to: "bb1:bus-bot-minus-10", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-1", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "led1": { x: 181.5, y: 68.75 }
      },
      steps: [
        "Inserisci il resistore da 220\u03A9 nella fila A, colonne 2-9",
        "Inserisci il LED verde in F9 (anodo) e F10 (catodo), sotto il gap centrale",
        "Collega un filo ROSSO dal bus + (colonna 2) al foro B2",
        "Collega un filo VERDE dal foro E9 al foro F9 (attraversa il gap centrale)",
        "Prova a cambiare il resistore: 220\u03A9, 470\u03A9, 1k\u03A9"
      ],
      observe: "Con 220\u03A9 il LED \u00e8 pi\u00f9 luminoso, con 1k\u03A9 \u00e8 pi\u00f9 fioco. Pi\u00f9 resistenza = meno corrente = meno luce!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Cambia luminosita con resistenze diverse'. Qui si cambia il valore del resistore (220, 470, 1000 ohm) e si osserva come cambia la luminosita del LED. Spiega la Legge di Ohm in modo semplice: più resistenza = meno corrente = meno luce. Usa l'analogia di un tubo più stretto che fa passare meno acqua. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Legge di Ohm, corrente variabile, luminosità proporzionale",
      layer: "terra",
      note: "Cambia il valore del resistore nel simulatore: 220Ω, 470Ω, 1kΩ. Osserva la differenza!",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Inserisci il resistore da 220Ω nei fori A2 e A9 (fila A, sezione superiore)",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore da 220Ω farà passare più corrente rispetto a uno da 470Ω."
        },
        {
          step: 2,
          text: "Inserisci il LED verde nei fori F9 (anodo) e F10 (catodo), sotto il gap centrale!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:f9", "led1:cathode": "bb1:f10" },
          hint: "L'anodo (+, più lungo) in F9, il catodo (−) in F10. Nella sezione inferiore della breadboard!"
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo positivo della batteria al bus + (colonna 1)",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta i 9V della batteria al bus positivo."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal bus + (colonna 2) al foro B2",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:b2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al resistore tramite la colonna 2."
        },
        {
          step: 5,
          text: "Collega un filo VERDE dal foro E9 al foro F9 (attraversa il gap centrale!)",
          wireFrom: "bb1:e9",
          wireTo: "bb1:f9",
          wireColor: "green",
          hint: "Questo filo collega il resistore (sezione a-e) all'anodo del LED (sezione f-j)."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal foro J10 al bus − inferiore (colonna 10)",
          wireFrom: "bb1:j10",
          wireTo: "bb1:bus-bot-minus-10",
          wireColor: "black",
          hint: "Il catodo del LED si collega al bus negativo inferiore."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal bus − inferiore al bus − superiore (ponte)",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-1",
          wireColor: "black",
          hint: "Il ponte collega i due bus negativi."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal bus − superiore al polo negativo della batteria. Prova poi a cambiare il resistore!",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito completo! Prova a cambiare il valore del resistore: 220Ω, 470Ω, 1kΩ."
        }
      ],
      quiz: [
        {
          question: "Se aumenti il valore del resistore (da 220 a 1000 ohm), cosa succede al LED?",
          options: ["Il LED diventa meno luminoso", "Il LED diventa più luminoso", "Il LED cambia colore"],
          correct: 0,
          explanation: "Più resistenza = meno corrente = meno luce. È la Legge di Ohm!"
        },
        {
          question: "Come si chiama la legge che lega tensione, corrente e resistenza?",
          options: ["Legge di Ohm", "Legge di Newton", "Legge di Gravità"],
          correct: 0,
          explanation: "La Legge di Ohm dice che V = I x R. Più resistenza (R) = meno corrente (I)."
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 7 — Cos'è il LED RGB? (6 esperimenti)
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap7-esp1",
      title: "Cap. 7 Esp. 1 - Accendi il rosso del RGB",
      desc: "Collega solo il pin rosso del LED RGB alla batteria tramite un resistore.",
      chapter: "Capitolo 7 - Cos'è il LED RGB?",
      difficulty: 1,
      icon: "\u{1F534}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "rgb1:red": "bb1:f2",
        "rgb1:common": "bb1:f3",
        "rgb1:green": "bb1:f4",
        "rgb1:blue": "bb1:f5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-9", to: "bb1:b9", color: "red" },
        { from: "bb1:e2", to: "bb1:f2", color: "red" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "rgb1": { x: 136.5, y: 68.75 }
      },
      steps: [
        "Inserisci il LED RGB nella sezione inferiore della breadboard, fila f colonne 2-5 (Rosso=F2, Catodo=F3, Verde=F4, Blu=F5)",
        "Inserisci il resistore da 470\u03A9 nella fila a, colonne 2-9",
        "Collega il bus + alla colonna 9 con un filo rosso (foro B9)",
        "Collega un filo rosso dal foro E2 al foro F2 per collegare il resistore al pin rosso del LED attraverso il canale",
        "Collega la colonna 3 inferiore (catodo comune, foro J3) al bus \u2212 con un filo nero"
      ],
      observe: "Il LED RGB si accende di rosso! Solo il canale rosso \u00e8 alimentato.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Accendi il rosso del RGB'. Il LED RGB ha 3 LED dentro (rosso, verde, blu) con un catodo comune. Qui accendiamo solo il rosso. Spiega cos'è un LED RGB e il concetto di catodo comune. Usa l'analogia di un semaforo con 3 lampadine dentro. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "LED RGB catodo comune, singolo canale colore",
      layer: "terra",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il LED RGB e posizionalo nei fori F2, F3, F4 ed F5 (sezione inferiore)",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f2", "rgb1:common": "bb1:f3", "rgb1:green": "bb1:f4", "rgb1:blue": "bb1:f5" },
          hint: "LED RGB: 4 piedini Rosso/Catodo/Verde/Blu (F2-F5). Va nella sezione inferiore."
        },
        {
          step: 2,
          text: "Prendi il resistore da 470\u03A9 e posizionalo nei fori A2 e A9",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore protegge il canale rosso del LED RGB. Copre 7 fori nella fila a."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (colonna 1)",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il filo rosso porta i 9V dalla batteria."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal bus + (colonna 9) al foro B9",
          wireFrom: "bb1:bus-top-plus-9",
          wireTo: "bb1:b9",
          wireColor: "red",
          hint: "Questo porta la corrente al resistore tramite la strip della colonna 9."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal foro E2 al foro F2 (attraverso il canale)",
          wireFrom: "bb1:e2",
          wireTo: "bb1:f2",
          wireColor: "red",
          hint: "Questo collega il lato del resistore (colonna 2) al pin rosso del LED RGB nella sezione inferiore."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal foro J3 (catodo comune) al bus \u2212",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Il catodo comune va collegato al negativo."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal bus \u2212 in basso al bus \u2212 in alto (colonna 1-2)",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Questo filo ponte collega i due bus negativi della breadboard per chiudere il circuito."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal bus \u2212 (colonna 1) al polo negativo della batteria",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito completo! Solo il canale rosso sar\u00e0 acceso."
        }
      ],
      quiz: [
        {
          question: "Quanti LED ci sono dentro un LED RGB?",
          options: ["3 (rosso, verde, blu)", "1 solo che cambia colore", "7 (uno per ogni colore dell'arcobaleno)"],
          correct: 0,
          explanation: "Il LED RGB contiene 3 piccoli LED dentro: uno rosso, uno verde e uno blu!"
        },
        {
          question: "Cosa significa 'catodo comune' nel LED RGB?",
          options: ["I 3 LED condividono lo stesso pin negativo", "Il LED ha un solo colore", "Tutti i pin sono uguali"],
          correct: 0,
          explanation: "Catodo comune significa che i 3 LED interni condividono lo stesso pin negativo (il più lungo)."
        }
      ]
    },
    {
      id: "v1-cap7-esp2",
      title: "Cap. 7 Esp. 2 - Accendi il verde del RGB",
      desc: "Ora collega solo il pin verde del LED RGB.",
      chapter: "Capitolo 7 - Cos'è il LED RGB?",
      difficulty: 1,
      icon: "\u{1F7E2}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a4",
        "r1:pin2": "bb1:a11",
        "rgb1:red": "bb1:f2",
        "rgb1:common": "bb1:f3",
        "rgb1:green": "bb1:f4",
        "rgb1:blue": "bb1:f5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-11", to: "bb1:b11", color: "red" },
        { from: "bb1:e4", to: "bb1:f4", color: "green" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 166.5, y: 43.75 },
        "rgb1": { x: 136.5, y: 68.75 }
      },
      steps: [
        "Inserisci il LED RGB nella sezione inferiore, fila f colonne 2-5 (Rosso=F2, Catodo=F3, Verde=F4, Blu=F5)",
        "Inserisci il resistore da 470\u03A9 nella fila a, colonne 4-11",
        "Collega il bus + alla colonna 11 con un filo rosso (foro B11)",
        "Collega un filo verde dal foro E4 al foro F4 per collegare il resistore al pin verde del LED attraverso il canale",
        "Collega la colonna 3 inferiore (catodo comune, foro J3) al bus \u2212 con un filo nero"
      ],
      observe: "Il LED RGB si accende di verde! Ogni canale colore funziona indipendentemente.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Accendi il verde del RGB'. Ora accendiamo solo il canale verde del LED RGB. Spiega che ogni canale del LED RGB funziona in modo indipendente. È lo stesso circuito del rosso, ma collegato a un pin diverso. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "LED RGB, canale verde",
      layer: "terra",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il LED RGB e posizionalo nei fori F2, F3, F4 ed F5 (sezione inferiore)",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f2", "rgb1:common": "bb1:f3", "rgb1:green": "bb1:f4", "rgb1:blue": "bb1:f5" },
          hint: "Il LED RGB ha 4 piedini: Rosso (F2), Catodo comune (F3), Verde (F4), Blu (F5)."
        },
        {
          step: 2,
          text: "Prendi il resistore da 470\u03A9 e posizionalo nei fori A4 e A11",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a4", "r1:pin2": "bb1:a11" },
          hint: "Il resistore protegge il canale verde del LED RGB. Copre 7 fori nella fila a."
        },
        {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (colonna 1)",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il filo rosso porta i 9V dalla batteria."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal bus + (colonna 11) al foro B11",
          wireFrom: "bb1:bus-top-plus-11",
          wireTo: "bb1:b11",
          wireColor: "red",
          hint: "Questo porta la corrente al resistore tramite la strip della colonna 11."
        },
        {
          step: 5,
          text: "Collega un filo VERDE dal foro E4 al foro F4 (attraverso il canale)",
          wireFrom: "bb1:e4",
          wireTo: "bb1:f4",
          wireColor: "green",
          hint: "Questo collega il lato del resistore (colonna 4) al pin verde del LED RGB."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal foro J3 (catodo comune) al bus \u2212",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Il catodo comune va sempre al negativo, indipendentemente dal colore acceso."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal bus \u2212 in basso al bus \u2212 in alto (colonna 1-2)",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Questo filo ponte collega i due bus negativi della breadboard per chiudere il circuito."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal bus \u2212 (colonna 1) al polo negativo della batteria",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito completo! Questa volta si accenderà il VERDE."
        }
      ],
      quiz: [
        {
          question: "Quale pin del LED RGB accende il verde?",
          options: ["Il terzo pin (dopo il catodo comune)", "Il primo pin", "L'ultimo pin"],
          correct: 0,
          explanation: "Nel LED RGB con catodo comune, i pin sono: Rosso, Catodo comune, Verde, Blu. Il verde è il terzo!"
        },
        {
          question: "Cosa cambia tra questo circuito e quello del rosso?",
          options: ["Solo il filo va a un pin diverso del LED RGB", "Serve un resistore diverso", "Serve più batteria"],
          correct: 0,
          explanation: "Il circuito è identico! Cambia solo quale pin del LED RGB colleghiamo al resistore."
        }
      ]
    },
    {
      id: "v1-cap7-esp3",
      title: "Cap. 7 Esp. 3 - Accendi il blu del RGB",
      desc: "Collega il pin blu del LED RGB. Nota: il blu ha una tensione di forward più alta!",
      chapter: "Capitolo 7 - Cos'è il LED RGB?",
      difficulty: 1,
      icon: "\u{1F535}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a5",
        "r1:pin2": "bb1:a12",
        "rgb1:red": "bb1:f2",
        "rgb1:common": "bb1:f3",
        "rgb1:green": "bb1:f4",
        "rgb1:blue": "bb1:f5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-12", to: "bb1:b12", color: "red" },
        { from: "bb1:e5", to: "bb1:f5", color: "blue" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174.0, y: 43.75 },
        "rgb1": { x: 136.5, y: 68.75 }
      },
      steps: [
        "Inserisci il LED RGB nella sezione inferiore, fila f colonne 2-5 (Rosso=F2, Catodo=F3, Verde=F4, Blu=F5)",
        "Inserisci il resistore da 470\u03A9 nella fila a, colonne 5-12",
        "Collega il bus + alla colonna 12 con un filo rosso (foro B12)",
        "Collega un filo blu dal foro E5 al foro F5 per collegare il resistore al pin blu del LED attraverso il canale",
        "Collega la colonna 3 inferiore (catodo comune, foro J3) al bus \u2212 con un filo nero"
      ],
      observe: "Il LED RGB si accende di blu! Nota: il blu ha bisogno di pi\u00f9 tensione (~3V vs ~2V del rosso).",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Accendi il blu del RGB'. Il LED blu ha bisogno di più tensione per accendersi (circa 3V contro i 2V del rosso). Spiega il concetto di tensione di forward e perché colori diversi hanno soglie diverse. Usa l'analogia di porte di altezze diverse: il blu ha una porta più alta da superare. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "LED RGB, canale blu, tensione forward diversa",
      layer: "terra",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il LED RGB e posizionalo nei fori F2, F3, F4 ed F5 (sezione inferiore)",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f2", "rgb1:common": "bb1:f3", "rgb1:green": "bb1:f4", "rgb1:blue": "bb1:f5" },
          hint: "Il LED RGB ha 4 piedini: Rosso (F2), Catodo comune (F3), Verde (F4), Blu (F5)."
        },
        {
          step: 2,
          text: "Prendi il resistore da 470\u03A9 e posizionalo nei fori A5 e A12",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a5", "r1:pin2": "bb1:a12" },
          hint: "Il resistore protegge il canale blu del LED RGB. Copre 7 fori nella fila a."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (colonna 1)",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il filo rosso porta i 9V dalla batteria."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal bus + (colonna 12) al foro B12",
          wireFrom: "bb1:bus-top-plus-12",
          wireTo: "bb1:b12",
          wireColor: "red",
          hint: "Questo porta la corrente al resistore tramite la strip della colonna 12."
        },
        {
          step: 5,
          text: "Collega un filo BLU dal foro E5 al foro F5 (attraverso il canale)",
          wireFrom: "bb1:e5",
          wireTo: "bb1:f5",
          wireColor: "blue",
          hint: "Questo collega il lato del resistore (colonna 5) al pin blu del LED RGB."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal foro J3 (catodo comune) al bus \u2212",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Il catodo comune va collegato al negativo."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal bus \u2212 in basso al bus \u2212 in alto (colonna 1-2)",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Questo filo ponte collega i due bus negativi della breadboard per chiudere il circuito."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal bus \u2212 (colonna 1) al polo negativo della batteria",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito completo! Questa volta si accenderà il BLU."
        }
      ],
      quiz: [
        {
          question: "Perché il LED blu ha bisogno di più tensione del rosso?",
          options: ["Ogni colore ha una soglia di tensione diversa", "Il blu consuma più batteria", "Il blu è più grande"],
          correct: 0,
          explanation: "Ogni colore di LED ha una tensione di forward diversa: il blu circa 3V, il rosso circa 2V."
        },
        {
          question: "Qual è il pin più lungo del LED RGB (catodo comune)?",
          options: ["Quello che va collegato al negativo (GND)", "Quello che va al positivo", "Quello del rosso"],
          correct: 0,
          explanation: "Il pin più lungo del LED RGB con catodo comune va collegato al negativo della batteria."
        }
      ]
    },
    {
      id: "v1-cap7-esp4",
      title: "Cap. 7 Esp. 4 - Mescola 2 colori: il viola!",
      desc: "Accendi insieme il rosso e il blu del LED RGB usando due resistori da 470Ω.",
      chapter: "Capitolo 7 - Cos'è il LED RGB?",
      difficulty: 2,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      icon: "\u26A0\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e8",
        "r1:pin2": "bb1:e2",
        "r2:pin1": "bb1:e12",
        "r2:pin2": "bb1:e6",
        "rgb1:red": "bb1:f2",
        "rgb1:common": "bb1:f3",
        "rgb1:green": "bb1:f4",
        "rgb1:blue": "bb1:f5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-8", to: "bb1:a8", color: "red" },
        { from: "bb1:bus-top-plus-12", to: "bb1:a12", color: "red" },
        { from: "bb1:e2", to: "bb1:f2", color: "orange" },
        { from: "bb1:e6", to: "bb1:f5", color: "blue" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 73.75 },
        "r2": { x: 181.5, y: 73.75 },
        "rgb1": { x: 136.5, y: 68.75 }
      },
      steps: [
        "Inserisci il LED RGB nei fori F2-F5 (R, catodo comune, G, B)",
        "Inserisci due resistori da 470Ω: R1 tra E8-E2 e R2 tra E12-E6",
        "Collega il bus + alle colonne 8 e 12 con due fili rossi",
        "Collega E2→F2 (rosso) e E6→F5 (blu)",
        "Collega il catodo comune (J3) al bus − e la batteria ai bus +/−"
      ],
      observe: "Rosso + Blu = Viola! Hai creato un colore secondario con la sintesi additiva della luce.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Mescola 2 colori: il viola!'. Qui sono accesi insieme il canale rosso e il canale blu del LED RGB, ciascuno con il suo resistore da 470 ohm. Spiega in modo semplice la sintesi additiva: luce rossa + luce blu = viola. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sintesi additiva con due canali RGB",
      layer: "schema",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Inserisci il LED RGB nei fori F2, F3, F4 e F5",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f2", "rgb1:common": "bb1:f3", "rgb1:green": "bb1:f4", "rgb1:blue": "bb1:f5" },
          hint: "Il catodo comune è il secondo pin (F3)."
        },
        {
          step: 2,
          text: "Posiziona R1 (470Ω) tra E8 ed E2",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e8", "r1:pin2": "bb1:e2" },
          hint: "R1 limita la corrente del canale rosso."
        },
        {
          step: 3,
          text: "Posiziona R2 (470Ω) tra E12 ed E6",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e12", "r2:pin2": "bb1:e6" },
          hint: "R2 limita la corrente del canale blu."
        },
        {
          step: 4,
          text: "Collega il positivo della batteria al bus +",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il bus + distribuisce il positivo."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal bus + (col. 8) ad A8, per alimentare R1",
          wireFrom: "bb1:bus-top-plus-8",
          wireTo: "bb1:a8",
          wireColor: "red",
          hint: "Alimenta il resistore del canale rosso."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal bus + (col. 12) ad A12, per alimentare R2",
          wireFrom: "bb1:bus-top-plus-12",
          wireTo: "bb1:a12",
          wireColor: "red",
          hint: "Alimenta il resistore del canale blu."
        },
        {
          step: 7,
          text: "Collega E2→F2 (canale rosso)",
          wireFrom: "bb1:e2",
          wireTo: "bb1:f2",
          wireColor: "orange",
          hint: "Dal resistore al pin rosso del LED RGB."
        },
        {
          step: 8,
          text: "Collega E6→F5 (canale blu)",
          wireFrom: "bb1:e6",
          wireTo: "bb1:f5",
          wireColor: "blue",
          hint: "Dal resistore al pin blu del LED RGB."
        },
        {
          step: 9,
          text: "Collega J3 al bus −",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Il catodo comune torna al negativo."
        },
        {
          step: 10,
          text: "Collega i due bus − tra loro",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Ponte tra i due bus negativi."
        },
        {
          step: 11,
          text: "Collega il bus − alla batteria",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito completo: il LED appare viola."
        }
      ],
      quiz: [
        {
          question: "Che colore ottieni mescolando luce rossa e blu?",
          options: ["Viola", "Verde", "Giallo"],
          correct: 0,
          explanation: "Nella luce, rosso + blu produce viola."
        },
        {
          question: "Perché usiamo due resistori?",
          options: ["Uno per ogni canale acceso", "Per fare più luce", "Sono decorativi"],
          correct: 0,
          explanation: "Ogni canale del LED RGB deve avere il suo resistore di protezione."
        }
      ]
    },

    {
      id: "v1-cap7-esp5",
      title: "Cap. 7 Esp. 5 - Tutti e 3: bianco!",
      desc: "Accendi insieme rosso, verde e blu con tre resistori da 470Ω.",
      chapter: "Capitolo 7 - Cos'è il LED RGB?",
      difficulty: 2,
      icon: "\u26A0\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e8",
        "r1:pin2": "bb1:e2",
        "r2:pin1": "bb1:e10",
        "r2:pin2": "bb1:e4",
        "r3:pin1": "bb1:e12",
        "r3:pin2": "bb1:e6",
        "rgb1:red": "bb1:f2",
        "rgb1:common": "bb1:f3",
        "rgb1:green": "bb1:f4",
        "rgb1:blue": "bb1:f5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-8", to: "bb1:a8", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:bus-top-plus-12", to: "bb1:a12", color: "red" },
        { from: "bb1:e2", to: "bb1:f2", color: "red" },
        { from: "bb1:e4", to: "bb1:f4", color: "green" },
        { from: "bb1:e6", to: "bb1:f5", color: "blue" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 73.75 },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "r2": { x: 166.5, y: 73.75 },
        "r3": { x: 181.5, y: 73.75 },
        "rgb1": { x: 136.5, y: 68.75 }
      },
      steps: [
        "Inserisci il LED RGB nei fori F2-F5",
        "Inserisci tre resistori da 470Ω: E8-E2, E10-E4, E12-E6",
        "Collega il bus + alle colonne 8, 10 e 12",
        "Collega E2→F2 (rosso), E4→F4 (verde), E6→F5 (blu)",
        "Collega il catodo comune (J3) al bus − e chiudi con la batteria"
      ],
      observe: "R+G+B accesi insieme: il LED appare bianco (spesso con una leggera dominante).",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Tutti e 3: bianco!'. In questo circuito sono attivi tutti e tre i canali del LED RGB, ciascuno con resistore da 470 ohm. Spiega che nella sintesi additiva rosso+verde+blu produce luce bianca. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sintesi additiva completa RGB",
      layer: "schema",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Inserisci il LED RGB nei fori F2, F3, F4 e F5",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f2", "rgb1:common": "bb1:f3", "rgb1:green": "bb1:f4", "rgb1:blue": "bb1:f5" },
          hint: "Tre colori + catodo comune."
        },
        {
          step: 2,
          text: "Posiziona R1 (470Ω) tra E8 ed E2",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e8", "r1:pin2": "bb1:e2" },
          hint: "Canale rosso."
        },
        {
          step: 3,
          text: "Posiziona R2 (470Ω) tra E10 ed E4",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e10", "r2:pin2": "bb1:e4" },
          hint: "Canale verde."
        },
        {
          step: 4,
          text: "Posiziona R3 (470Ω) tra E12 ed E6",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:e12", "r3:pin2": "bb1:e6" },
          hint: "Canale blu."
        },
        {
          step: 5,
          text: "Collega il positivo della batteria al bus +",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Alimentazione principale."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal bus + (col. 8) ad A8, per alimentare R1",
          wireFrom: "bb1:bus-top-plus-8",
          wireTo: "bb1:a8",
          wireColor: "red",
          hint: "Alimenta il resistore del canale rosso."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal bus + (col. 10) ad A10, per alimentare R2",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Alimenta il resistore del canale verde."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal bus + (col. 12) ad A12, per alimentare R3",
          wireFrom: "bb1:bus-top-plus-12",
          wireTo: "bb1:a12",
          wireColor: "red",
          hint: "Alimenta il resistore del canale blu."
        },
        {
          step: 9,
          text: "Collega E2→F2 (canale rosso)",
          wireFrom: "bb1:e2",
          wireTo: "bb1:f2",
          wireColor: "red",
          hint: "Dal resistore al pin rosso del LED RGB."
        },
        {
          step: 10,
          text: "Collega E4→F4 (canale verde)",
          wireFrom: "bb1:e4",
          wireTo: "bb1:f4",
          wireColor: "green",
          hint: "Dal resistore al pin verde del LED RGB."
        },
        {
          step: 11,
          text: "Collega E6→F5 (canale blu)",
          wireFrom: "bb1:e6",
          wireTo: "bb1:f5",
          wireColor: "blue",
          hint: "Dal resistore al pin blu del LED RGB."
        },
        {
          step: 12,
          text: "Collega J3 al bus −",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Catodo comune a massa."
        },
        {
          step: 13,
          text: "Collega i bus − tra loro",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Ponte tra i due bus negativi."
        },
        {
          step: 14,
          text: "Collega il bus − al polo negativo della batteria",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito completo: il LED appare bianco!"
        }
      ],
      quiz: [
        {
          question: "Che colore ottieni con Rosso + Verde + Blu?",
          options: ["Bianco", "Nero", "Viola"],
          correct: 0,
          explanation: "Nella sintesi additiva, i tre colori RGB insieme fanno bianco."
        },
        {
          question: "Quanti resistori servono in questo esperimento?",
          options: ["Tre", "Uno", "Due"],
          correct: 0,
          explanation: "Uno per ogni canale del LED RGB."
        }
      ]
    },

    {
      id: "v1-cap7-esp6",
      title: "Cap. 7 Esp. 6 - Crea il tuo colore!",
      desc: "Parti dal circuito RGB e cambia i valori dei resistori per ottenere nuove tonalità.",
      chapter: "Capitolo 7 - Cos'è il LED RGB?",
      difficulty: 2,
      icon: "\u26A0\uFE0F",
      simulationMode: "circuit",
      code: null,
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 220 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e8",
        "r1:pin2": "bb1:e2",
        "r2:pin1": "bb1:e10",
        "r2:pin2": "bb1:e4",
        "r3:pin1": "bb1:e12",
        "r3:pin2": "bb1:e6",
        "rgb1:red": "bb1:f2",
        "rgb1:common": "bb1:f3",
        "rgb1:green": "bb1:f4",
        "rgb1:blue": "bb1:f5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-8", to: "bb1:a8", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:bus-top-plus-12", to: "bb1:a12", color: "red" },
        { from: "bb1:e2", to: "bb1:f2", color: "red" },
        { from: "bb1:e4", to: "bb1:f4", color: "green" },
        { from: "bb1:e6", to: "bb1:f5", color: "blue" },
        { from: "bb1:j3", to: "bb1:bus-bot-minus-3", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 73.75 },
        "r2": { x: 166.5, y: 73.75 },
        "r3": { x: 181.5, y: 73.75 },
        "rgb1": { x: 136.5, y: 68.75 }
      },
      steps: [
        "Ripeti il circuito RGB dell'esperimento 5",
        "Imposta un resistore più basso sul canale rosso (220Ω)",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "Lascia verde e blu a 470Ω",
        "Osserva come cambia la tonalità finale del colore"
      ],
      observe: "Variando i resistori cambi l'intensità dei singoli canali RGB e quindi il colore finale.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Crea il tuo colore!'. In questo circuito il canale rosso ha una resistenza più bassa rispetto a verde e blu, quindi risulta più intenso. Spiega come cambiare i valori dei resistori modifica il colore finale nel LED RGB. Rispondi in italiano.",
      concept: "Bilanciamento RGB tramite valori di resistenza",
      layer: "schema",
      note: "Prova varianti di resistori (mai sotto 100Ω).",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Inserisci il LED RGB nei fori F2, F3, F4 e F5",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f2", "rgb1:common": "bb1:f3", "rgb1:green": "bb1:f4", "rgb1:blue": "bb1:f5" },
          hint: "Posizione identica agli esperimenti precedenti."
        },
        {
          step: 2,
          text: "Posiziona R1 da 220Ω tra E8 ed E2 (rosso)",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e8", "r1:pin2": "bb1:e2" },
          hint: "Resistenza più bassa = rosso più intenso."
        },
        {
          step: 3,
          text: "Posiziona R2 da 470Ω tra E10 ed E4 (verde)",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e10", "r2:pin2": "bb1:e4" },
          hint: "Canale verde standard."
        },
        {
          step: 4,
          text: "Posiziona R3 da 470Ω tra E12 ed E6 (blu)",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:e12", "r3:pin2": "bb1:e6" },
          hint: "Canale blu standard."
        },
        {
          step: 5,
          text: "Collega il positivo della batteria al bus +",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Alimentazione del circuito."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal bus + (col. 8) ad A8, per alimentare R1",
          wireFrom: "bb1:bus-top-plus-8",
          wireTo: "bb1:a8",
          wireColor: "red",
          hint: "Alimenta il resistore del canale rosso (220Ω)."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal bus + (col. 10) ad A10, per alimentare R2",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Alimenta il resistore del canale verde (470Ω)."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal bus + (col. 12) ad A12, per alimentare R3",
          wireFrom: "bb1:bus-top-plus-12",
          wireTo: "bb1:a12",
          wireColor: "red",
          hint: "Alimenta il resistore del canale blu (470Ω)."
        },
        {
          step: 9,
          text: "Collega E2→F2 (canale rosso)",
          wireFrom: "bb1:e2",
          wireTo: "bb1:f2",
          wireColor: "red",
          hint: "Dal resistore al pin rosso del LED RGB."
        },
        {
          step: 10,
          text: "Collega E4→F4 (canale verde)",
          wireFrom: "bb1:e4",
          wireTo: "bb1:f4",
          wireColor: "green",
          hint: "Dal resistore al pin verde del LED RGB."
        },
        {
          step: 11,
          text: "Collega E6→F5 (canale blu)",
          wireFrom: "bb1:e6",
          wireTo: "bb1:f5",
          wireColor: "blue",
          hint: "Dal resistore al pin blu del LED RGB."
        },
        {
          step: 12,
          text: "Collega il catodo comune J3 al bus −",
          wireFrom: "bb1:j3",
          wireTo: "bb1:bus-bot-minus-3",
          wireColor: "black",
          hint: "Ritorno al negativo."
        },
        {
          step: 13,
          text: "Collega i due bus −",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Ponte negativo."
        },
        {
          step: 14,
          text: "Collega il bus − alla batteria",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito chiuso: osserva il colore!"
        }
      ],
      quiz: [
        {
          question: "Cosa succede abbassando la resistenza del canale rosso?",
          options: ["Il rosso diventa più intenso", "Il rosso si spegne", "Non cambia nulla"],
          correct: 0,
          explanation: "Con resistenza più bassa passa più corrente in quel canale."
        },
        {
          question: "Perché conviene restare sopra 100Ω?",
          options: ["Per proteggere il LED", "Per avere meno fili", "Per rendere il circuito più lento"],
          correct: 0,
          explanation: "Sotto 100Ω la corrente può diventare eccessiva e danneggiare il LED."
        }
      ]
    },

    {
      id: "v1-cap8-esp1",
      title: "Cap. 8 Esp. 1 - LED con pulsante",
      desc: "Premi il pulsante e il LED si accende! Rilascialo e si spegne.",
      chapter: "Capitolo 8 - Cos'è un pulsante?",
      difficulty: 1,
      icon: "\u{1F518}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "blue" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:f10",
        "btn1:pin1": "bb1:e11",
        "btn1:pin2": "bb1:f13"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:e9", to: "bb1:f9", color: "orange" },
        { from: "bb1:f10", to: "bb1:e10", color: "yellow" },
        { from: "bb1:e10", to: "bb1:e11", color: "yellow" },
        { from: "bb1:j13", to: "bb1:bus-bot-minus-13", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "led1": { x: 181.5, y: 68.75 },
        "btn1": { x: 200.25, y: 82.5 }
      },
      steps: [
        "Collega il positivo della batteria alla striscia rossa (bus +)",
        "Inserisci il resistore da 470\u03A9 a cavallo della breadboard (a2 \u2192 a9) e collegalo con un filo rosso al bus +",
        "Inserisci il LED con la gambetta lunga (anodo) in f9 verso il resistore e la gambetta corta (catodo) in f10",
        "Inserisci il pulsante a cavallo della scanalatura centrale, accanto al LED (e11/f13)",
        "Collega un filo dal catodo del LED al pulsante (e10 \u2192 e11)",
        "Collega il pulsante al negativo: filo nero da j13 al bus \u2212, e il bus \u2212 alla batteria"
      ],
      observe: "Premi il pulsante: il LED si accende! Rilascialo: si spegne. Circuito aperto/chiuso.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED con pulsante'. Quando premi il pulsante il circuito si chiude e il LED si accende. Quando rilasci, il circuito si apre e il LED si spegne. Spiega il concetto di circuito aperto e chiuso. Usa l'analogia di un ponte levatoio: quando è abbassato le auto passano, quando è alzato si fermano. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Circuito aperto/chiuso, pulsante come interruttore",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (striscia rossa).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω e posizionalo nei fori A2 e A9.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore limita la corrente per proteggere il LED."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal bus + (col. 2) al foro A2, per alimentare il resistore.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta il positivo dalla striscia rossa al resistore."
        },
        {
          step: 6,
          text: "Prendi il LED e inserisci la gambetta lunga (anodo) in F9, verso il resistore, e la gambetta corta (catodo) in F10.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:f9", "led1:cathode": "bb1:f10" },
          hint: "La gambetta lunga (+) va in F9 e quella corta (−) in F10."
        },
        {
          step: 7,
          text: "Collega un filo ARANCIONE dal foro E9 al foro F9 per collegare il resistore al LED attraverso il canale.",
          wireFrom: "bb1:e9",
          wireTo: "bb1:f9",
          wireColor: "orange",
          hint: "Questo filo porta la corrente dal resistore (sezione superiore) al LED (sezione inferiore)."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro F10 al foro E10 per portare il catodo del LED al lato superiore.",
          wireFrom: "bb1:f10",
          wireTo: "bb1:e10",
          wireColor: "yellow",
          hint: "Il catodo è in F10 (sezione inferiore). Questo filo lo porta a E10 per collegarlo al pulsante."
        },
        {
          step: 9,
          text: "Inserisci il pulsante a cavallo della scanalatura centrale, accanto al LED (E11/F13).",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e11", "btn1:pin2": "bb1:f13" },
          hint: "Il pulsante va a cavallo del canale, a destra del LED."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro E10 al foro E11 per collegare il catodo del LED al pulsante.",
          wireFrom: "bb1:e10",
          wireTo: "bb1:e11",
          wireColor: "yellow",
          hint: "Questo filo collega il catodo del LED al pin del pulsante."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro J13 al bus − in basso per collegare il pulsante al negativo.",
          wireFrom: "bb1:j13",
          wireTo: "bb1:bus-bot-minus-13",
          wireColor: "black",
          hint: "Questo filo chiude il circuito verso il negativo quando premi il pulsante."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal bus − in basso al bus − in alto (col. 1-2).",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Questo ponte collega i due bus negativi della breadboard."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal bus − in alto (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cosa succede quando premi il pulsante?",
          options: ["Il circuito si chiude e il LED si accende", "Il LED si spegne", "Non succede nulla"],
          correct: 0,
          explanation: "Il pulsante chiude il circuito, permettendo alla corrente di passare e accendere il LED!"
        },
        {
          question: "Cosa significa 'circuito aperto'?",
          options: ["La corrente non può passare", "La corrente passa al massimo", "Il circuito è rotto per sempre"],
          correct: 0,
          explanation: "Un circuito aperto ha un'interruzione: la corrente non può scorrere, come un ponte levatoio alzato."
        }
      ]
    },
    {
      id: "v1-cap8-esp2",
      title: "Cap. 8 Esp. 2 - Cambia colore e luminosità",
      desc: "Usa LED di colori diversi e resistori diversi con il pulsante.",
      chapter: "Capitolo 8 - Cos'è un pulsante?",
      difficulty: 1,
      icon: "\u{1F308}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 220 },
        { type: "led", id: "led1", color: "green" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:f10",
        "btn1:pin1": "bb1:e11",
        "btn1:pin2": "bb1:f13"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:e9", to: "bb1:f9", color: "orange" },
        { from: "bb1:f10", to: "bb1:e10", color: "yellow" },
        { from: "bb1:e10", to: "bb1:e11", color: "yellow" },
        { from: "bb1:j13", to: "bb1:bus-bot-minus-13", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "led1": { x: 181.5, y: 68.75 },
        "btn1": { x: 200.25, y: 82.5 }
      },
      steps: [
        "Stessa disposizione dell'esperimento 1, ma con LED verde e resistore da 220\u03A9",
        "Inserisci il resistore da 220\u03A9 in A2\u2192A9 e collegalo al bus + con un filo rosso",
        "Inserisci il LED verde in F9 (anodo) e F10 (catodo), e collega E9\u2192F9 con un filo arancione",
        "Inserisci il pulsante a cavallo del canale (E11/F13) e collega E10\u2192E11",
        "Collega il pulsante al bus \u2212 e premi: il LED verde è più luminoso perché 220\u03A9 < 470\u03A9!"
      ],
      observe: "LED verde con 220\u03A9: pi\u00f9 luminoso del rosso con 470\u03A9. Ogni colore ha una soglia diversa!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Cambia colore e luminosità. Stesso circuito con pulsante, ma ora con un LED verde e un resistore da 220 ohm (più piccolo). Spiega che cambiare il LED e il resistore modifica il comportamento del circuito. Il LED verde ha una tensione forward diversa dal rosso. Incoraggia a sperimentare combinazioni diverse. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Variazione circuito, LED colori diversi",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (striscia rossa).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo."
        },
        {
          step: 4,
          text: "Prendi il resistore da 220Ω e posizionalo nei fori A2 e A9.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore da 220Ω limita la corrente (più corrente = LED più luminoso!)."
        },
        {
          step: 5,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Collega un filo ROSSO dal bus + (col. 2) al foro A2, per alimentare il resistore.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta il positivo dalla striscia rossa al resistore."
        },
        {
          step: 6,
          text: "Prendi il LED verde e inserisci la gambetta lunga (anodo) in F9 e la gambetta corta (catodo) in F10.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:f9", "led1:cathode": "bb1:f10" },
          hint: "La gambetta lunga (+) va in F9 e quella corta (−) in F10."
        },
        {
          step: 7,
          text: "Collega un filo ARANCIONE dal foro E9 al foro F9 per collegare il resistore al LED attraverso il canale.",
          wireFrom: "bb1:e9",
          wireTo: "bb1:f9",
          wireColor: "orange",
          hint: "Questo filo porta la corrente dal resistore (sezione superiore) al LED (sezione inferiore)."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro F10 al foro E10 per portare il catodo del LED al lato superiore.",
          wireFrom: "bb1:f10",
          wireTo: "bb1:e10",
          wireColor: "yellow",
          hint: "Il catodo è in F10 (sezione inferiore). Questo filo lo porta a E10 per collegarlo al pulsante."
        },
        {
          step: 9,
          text: "Inserisci il pulsante a cavallo della scanalatura centrale, accanto al LED (E11/F13).",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e11", "btn1:pin2": "bb1:f13" },
          hint: "Il pulsante va a cavallo del canale, a destra del LED."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro E10 al foro E11 per collegare il catodo del LED al pulsante.",
          wireFrom: "bb1:e10",
          wireTo: "bb1:e11",
          wireColor: "yellow",
          hint: "Questo filo collega il catodo del LED al pin del pulsante."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro J13 al bus − in basso per collegare il pulsante al negativo.",
          wireFrom: "bb1:j13",
          wireTo: "bb1:bus-bot-minus-13",
          wireColor: "black",
          hint: "Questo filo chiude il circuito verso il negativo quando premi il pulsante."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal bus − in basso al bus − in alto (col. 1-2).",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Questo ponte collega i due bus negativi della breadboard."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal bus − in alto (col. 1) al polo − della batteria. Premi il pulsante: il LED verde è più luminoso!",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "220Ω < 470Ω = più corrente = LED più luminoso!"
        }
      ],
      quiz: [
        {
          question: "Se cambi il resistore da 470\u03A9 a 220\u03A9, cosa succede al LED?",
          options: ["Si spegne", "Diventa più luminoso", "Cambia colore"],
          correct: 1,
          explanation: "Un resistore più piccolo lascia passare più corrente, quindi il LED diventa più luminoso!"
        },
        {
          question: "Perché un LED verde e un LED rosso hanno luminosità diverse con lo stesso resistore?",
          options: ["Il verde è rotto", "Ogni colore ha bisogno di una tensione diversa per accendersi", "Il filo è troppo lungo"],
          correct: 1,
          explanation: "Ogni colore di LED ha una tensione forward diversa: il verde ha bisogno di circa 2.2V, il rosso solo 1.8V."
        }
      ]
    },
    {
      id: "v1-cap8-esp3",
      title: "Cap. 8 Esp. 3 - RGB + pulsante = viola",
      desc: "Premi il pulsante per accendere il viola (rosso + blu) sul LED RGB.",
      chapter: "Capitolo 8 - Cos'è un pulsante?",
      difficulty: 2,
      icon: "\u{1F7E3}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "rgb-led", id: "rgb1" },
        { type: "push-button", id: "btn1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "r2:pin1": "bb1:a11",
        "r2:pin2": "bb1:a18",
        "rgb1:red": "bb1:f15",
        "rgb1:common": "bb1:f16",
        "rgb1:green": "bb1:f17",
        "rgb1:blue": "bb1:f18",
        "btn1:pin1": "bb1:e20",
        "btn1:pin2": "bb1:f22"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:bus-top-plus-11", to: "bb1:a11", color: "red" },
        { from: "bb1:e9", to: "bb1:f15", color: "orange" },
        { from: "bb1:e18", to: "bb1:f18", color: "blue" },
        { from: "bb1:j16", to: "bb1:j20", color: "yellow" },
        { from: "bb1:f20", to: "bb1:e20", color: "yellow" },
        { from: "bb1:j22", to: "bb1:bus-bot-minus-22", color: "black" },
        { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-2", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "r2": { x: 219, y: 43.75 },
        "rgb1": { x: 234, y: 68.75 },
        "btn1": { x: 275.25, y: 82.5 }
      },
      steps: [
        "Collega il positivo della batteria al bus + (striscia rossa)",
        "Inserisci R1 (470\u03A9) nei fori A2\u2192A9 e collegalo al bus + con un filo rosso",
        "Inserisci R2 (470\u03A9) nei fori A11\u2192A18 e collegalo al bus + con un filo rosso",
        "Inserisci il LED RGB nella sezione inferiore: Rosso in F15, Catodo in F16, Verde in F17, Blu in F18",
        "Collega R1 al pin rosso: filo arancione da E9 a F15 (attraverso il canale)",
        "Collega R2 al pin blu: filo blu da E18 a F18 (attraverso il canale)",
        "Inserisci il pulsante a cavallo del canale (E20/F22), accanto al LED RGB",
        "Collega il catodo (F16) al pulsante: filo giallo da J16 a J20",
        "Collega il pulsante al bus \u2212: filo nero da J22 al bus \u2212, e bus \u2212 alla batteria"
      ],
      observe: "Premi il pulsante: il LED diventa viola! Rosso + Blu = Viola (sintesi additiva).",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'RGB + pulsante = viola'. Il pulsante accende contemporaneamente i canali rosso e blu del LED RGB, creando il viola. Spiega come il pulsante controlla entrambi i rami del circuito e come la sintesi additiva crea il viola. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Pulsante + RGB, sintesi colore con interruttore",
      layer: "schema",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (striscia rossa).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo."
        },
        {
          step: 4,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori A2 e A9. Serve per il canale ROSSO.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore protegge il LED limitando la corrente del canale rosso."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal bus + (col. 2) al foro A2, per alimentare R1.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta il positivo dalla striscia rossa al resistore R1."
        },
        {
          step: 6,
          text: "Prendi il resistore R2 (470\u03A9) e posizionalo nei fori A11 e A18. Serve per il canale BLU.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:a11", "r2:pin2": "bb1:a18" },
          hint: "Il resistore protegge il LED limitando la corrente del canale blu."
        },
        {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 7,
          text: "Collega un filo ROSSO dal bus + (col. 11) al foro A11, per alimentare R2.",
          wireFrom: "bb1:bus-top-plus-11",
          wireTo: "bb1:a11",
          wireColor: "red",
          hint: "Questo filo porta il positivo dalla striscia rossa al resistore R2."
        },
        {
          step: 8,
          text: "Inserisci il LED RGB nella sezione inferiore: Rosso in F15, Catodo in F16, Verde in F17, Blu in F18.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:f15", "rgb1:common": "bb1:f16", "rgb1:green": "bb1:f17", "rgb1:blue": "bb1:f18" },
          hint: "I 4 piedini: Rosso in F15, Catodo (gambetta lunga) in F16, Verde in F17, Blu in F18."
        },
        {
          step: 9,
          text: "Collega un filo ARANCIONE da E9 a F15 per collegare R1 al pin rosso del LED RGB.",
          wireFrom: "bb1:e9",
          wireTo: "bb1:f15",
          wireColor: "orange",
          hint: "Questo filo porta la corrente dal resistore R1 al canale rosso dell'RGB."
        },
        {
          step: 10,
          text: "Collega un filo BLU da E18 a F18 per collegare R2 al pin blu del LED RGB.",
          wireFrom: "bb1:e18",
          wireTo: "bb1:f18",
          wireColor: "blue",
          hint: "Questo filo porta la corrente dal resistore R2 al canale blu dell'RGB."
        },
        {
          step: 11,
          text: "Inserisci il pulsante a cavallo del canale (E20/F22), a destra del LED RGB.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:f22" },
          hint: "Il pulsante controlla il catodo: quando lo premi, il circuito si chiude!"
        },
        {
          step: 12,
          text: "Collega un filo GIALLO da J16 a J20 per collegare il catodo RGB al pulsante.",
          wireFrom: "bb1:j16",
          wireTo: "bb1:j20",
          wireColor: "yellow",
          hint: "Questo filo porta il catodo (comune) del LED RGB al pulsante."
        },
        {
          step: 13,
          text: "Collega un filo GIALLO dal foro F20 al foro E20 per collegare il catodo al pin del pulsante.",
          wireFrom: "bb1:f20",
          wireTo: "bb1:e20",
          wireColor: "yellow",
          hint: "Questo filo attraversa il canale per portare il catodo RGB al pin del pulsante (E20)."
        },
        {
          step: 14,
          text: "Collega un filo NERO da J22 al bus − (striscia blu) per collegare il pulsante al negativo.",
          wireFrom: "bb1:j22",
          wireTo: "bb1:bus-bot-minus-22",
          wireColor: "black",
          hint: "Questo filo chiude il circuito verso il negativo quando premi il pulsante."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal bus − in basso al bus − in alto (col. 1-2).",
          wireFrom: "bb1:bus-bot-minus-1",
          wireTo: "bb1:bus-top-minus-2",
          wireColor: "black",
          hint: "Questo ponte collega i due bus negativi della breadboard."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal bus − in alto (col. 1) al polo − della batteria. Premi il pulsante: VIOLA!",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Rosso + Blu = Viola! La sintesi additiva della luce è diversa dai colori a tempera."
        }
      ],
      quiz: [
        {
          question: "Quali colori di luce devi mescolare per ottenere il viola?",
          options: ["Rosso e verde", "Rosso e blu", "Blu e verde"],
          correct: 1,
          explanation: "Nella sintesi additiva della luce, rosso + blu = viola! È diverso dai colori a tempera."
        },
        {
          question: "Come fa un solo pulsante a controllare due colori contemporaneamente?",
          options: ["Il pulsante ha due interruttori dentro", "La corrente dal pulsante si divide in due rami paralleli", "Il LED cambia colore da solo"],
          correct: 1,
          explanation: "Dopo il pulsante, il circuito si divide in due rami: uno va al resistore del rosso e l'altro al resistore del blu."
        }
      ]
    },
    {
      id: "v1-cap8-esp4",
      title: "Cap. 8 Esp. 4 - 3 pulsanti → 3 colori RGB",
      desc: "Un pulsante per ogni colore! Premi combinazioni per creare nuovi colori.",
      chapter: "Capitolo 8 - Cos'è un pulsante?",
      difficulty: 2,
      icon: "\u{1F3AE}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "push-button", id: "btn2" },
        { type: "push-button", id: "btn3" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e2",
        "btn1:pin2": "bb1:f4",
        "btn2:pin1": "bb1:e6",
        "btn2:pin2": "bb1:f8",
        "btn3:pin1": "bb1:e10",
        "btn3:pin2": "bb1:f12",
        "r1:pin1": "bb1:a16",
        "r1:pin2": "bb1:a23",
        "r2:pin1": "bb1:b18",
        "r2:pin2": "bb1:b25",
        "r3:pin1": "bb1:c19",
        "r3:pin2": "bb1:c26",
        "rgb1:red": "bb1:d23",
        "rgb1:common": "bb1:d24",
        "rgb1:green": "bb1:d25",
        "rgb1:blue": "bb1:d26"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:bus-top-plus-6", to: "bb1:a6", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:j4", to: "bb1:a16", color: "orange" },
        { from: "bb1:j8", to: "bb1:a18", color: "green" },
        { from: "bb1:j12", to: "bb1:a19", color: "blue" },
        { from: "bb1:a24", to: "bb1:bus-top-minus-24", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 140.25, y: 82.5 },
        "btn2": { x: 170.25, y: 82.5 },
        "btn3": { x: 200.25, y: 82.5 },
        "r1": { x: 256.5, y: 43.75 },
        "r2": { x: 271.5, y: 51.25 },
        "r3": { x: 279, y: 58.75 },
        "rgb1": { x: 294, y: 43.75 }
      },
      steps: [
        "Collega il positivo della batteria al bus + e il negativo al bus \u2212",
        "Inserisci i 3 pulsanti a cavallo del canale: BTN1 (e2/f4), BTN2 (e6/f8), BTN3 (e10/f12)",
        "Collega ciascun pulsante al bus + con un filo rosso (bus+col2\u2192a2, bus+col6\u2192a6, bus+col10\u2192a10)",
        "Inserisci il LED RGB nella sezione superiore: Rosso d23, Catodo d24, Verde d25, Blu d26",
        "Collega il catodo (d24) al bus \u2212 con un filo nero",
        "Inserisci R1 (a16\u2192a23), R2 (b18\u2192b25), R3 (c19\u2192c26) — ogni resistore termina nella colonna del colore",
        "Collega BTN1\u2192R1\u2192Rosso (j4\u2192a16), BTN2\u2192R2\u2192Verde (j8\u2192a18), BTN3\u2192R3\u2192Blu (j12\u2192a19)"
      ],
      observe: "Ogni pulsante accende un colore! Premi combinazioni: R+G=giallo, R+B=viola, G+B=ciano, tutti=bianco!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento '3 pulsanti, 3 colori RGB'. Ogni pulsante controlla un colore: btn1=rosso, btn2=verde, btn3=blu. Premendo combinazioni si creano 7 colori possibili! Spiega il concetto di controllo indipendente e le combinazioni possibili (R, G, B, RG=giallo, RB=viola, GB=ciano, RGB=bianco). Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Controllo indipendente canali RGB, combinazioni colore",
      layer: "schema",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (striscia rossa).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo."
        },
        {
          step: 4,
          text: "Inserisci il pulsante BTN1 (rosso) a cavallo del canale nei fori E2/F4.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e2", "btn1:pin2": "bb1:f4" },
          hint: "BTN1 controllerà il canale ROSSO del LED RGB."
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 5,
          text: "Inserisci il pulsante BTN2 (verde) a cavallo del canale nei fori E6/F8.",
          componentId: "btn2",
          componentType: "push-button",
          targetPins: { "btn2:pin1": "bb1:e6", "btn2:pin2": "bb1:f8" },
          hint: "BTN2 controllerà il canale VERDE del LED RGB."
        },
        {
          step: 6,
          text: "Inserisci il pulsante BTN3 (blu) a cavallo del canale nei fori E10/F12.",
          componentId: "btn3",
          componentType: "push-button",
          targetPins: { "btn3:pin1": "bb1:e10", "btn3:pin2": "bb1:f12" },
          hint: "BTN3 controllerà il canale BLU del LED RGB."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal bus + (col. 2) ad A2, per alimentare BTN1.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Il bus + porta la corrente al primo pulsante."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal bus + (col. 6) ad A6, per alimentare BTN2.",
          wireFrom: "bb1:bus-top-plus-6",
          wireTo: "bb1:a6",
          wireColor: "red",
          hint: "Il bus + porta la corrente al secondo pulsante."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal bus + (col. 10) ad A10, per alimentare BTN3.",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Il bus + porta la corrente al terzo pulsante."
        },
        {
          step: 10,
          text: "Inserisci il LED RGB nella sezione superiore: Rosso D23, Catodo D24, Verde D25, Blu D26.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d23", "rgb1:common": "bb1:d24", "rgb1:green": "bb1:d25", "rgb1:blue": "bb1:d26" },
          hint: "I 4 piedini: Rosso in D23, Catodo (gambetta lunga) in D24, Verde in D25, Blu in D26."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal catodo (A24) al bus \u2212 per collegare il LED RGB al negativo.",
          wireFrom: "bb1:a24",
          wireTo: "bb1:bus-top-minus-24",
          wireColor: "black",
          hint: "Il catodo comune va direttamente al bus negativo."
        },
        {
          step: 12,
          text: "Inserisci R1 (470\u03A9) nei fori A16\u2192A23: collega BTN1 al pin rosso dell'RGB.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a16", "r1:pin2": "bb1:a23" },
          hint: "R1 limita la corrente del canale rosso."
        },
        {
          step: 13,
          text: "Inserisci R2 (470\u03A9) nei fori B18\u2192B25: collega BTN2 al pin verde dell'RGB.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:b18", "r2:pin2": "bb1:b25" },
          hint: "R2 limita la corrente del canale verde."
        },
        {
          step: 14,
          text: "Inserisci R3 (470\u03A9) nei fori C19\u2192C26: collega BTN3 al pin blu dell'RGB.",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:c19", "r3:pin2": "bb1:c26" },
          hint: "R3 limita la corrente del canale blu."
        },
        {
          step: 15,
          text: "Collega un filo ARANCIONE da J4 ad A16: porta l'uscita di BTN1 a R1 (rosso).",
          wireFrom: "bb1:j4",
          wireTo: "bb1:a16",
          wireColor: "orange",
          hint: "Questo filo collega il pulsante rosso al suo resistore."
        },
        {
          step: 16,
          text: "Collega un filo VERDE da J8 ad A18: porta l'uscita di BTN2 a R2 (verde).",
          wireFrom: "bb1:j8",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "Questo filo collega il pulsante verde al suo resistore."
        },
        {
          step: 17,
          text: "Collega un filo BLU da J12 ad A19: porta l'uscita di BTN3 a R3 (blu).",
          wireFrom: "bb1:j12",
          wireTo: "bb1:a19",
          wireColor: "blue",
          hint: "Questo filo collega il pulsante blu al suo resistore."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal bus \u2212 (col. 1) al polo \u2212 della batteria. Prova a premere i pulsanti!",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Ogni pulsante accende un colore: R+G=giallo, R+B=viola, G+B=ciano, tutti=bianco!"
        }
      ],
      quiz: [
        {
          question: "Con 3 pulsanti che controllano R, G e B, quanti colori diversi puoi creare?",
          options: ["3 colori", "7 colori", "Infiniti colori"],
          correct: 1,
          explanation: "Con 3 pulsanti ON/OFF puoi fare 7 combinazioni: R, G, B, R+G, R+B, G+B, R+G+B. Più lo spento!"
        },
        {
          question: "Cosa succede se premi tutti e 3 i pulsanti insieme?",
          options: ["Il LED si brucia", "Si crea luce bianca", "Si spegne tutto"],
          correct: 1,
          explanation: "Rosso + Verde + Blu = Bianco! Nella luce, mescolando tutti e tre i colori primari si ottiene il bianco."
        }
      ]
    },
    {
      id: "v1-cap8-esp5",
      title: "Cap. 8 Esp. 5 - Mix avanzato con resistori diversi",
      desc: "Sfida! Usa resistori di valori diversi sui 3 canali per creare sfumature uniche.",
      chapter: "Capitolo 8 - Cos'è un pulsante?",
      difficulty: 2,
      icon: "\u{1F3A8}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "push-button", id: "btn2" },
        { type: "push-button", id: "btn3" },
        { type: "resistor", id: "r1", value: 220 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 1000 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e2",
        "btn1:pin2": "bb1:f4",
        "btn2:pin1": "bb1:e6",
        "btn2:pin2": "bb1:f8",
        "btn3:pin1": "bb1:e10",
        "btn3:pin2": "bb1:f12",
        "r1:pin1": "bb1:a16",
        "r1:pin2": "bb1:a23",
        "r2:pin1": "bb1:b18",
        "r2:pin2": "bb1:b25",
        "r3:pin1": "bb1:c19",
        "r3:pin2": "bb1:c26",
        "rgb1:red": "bb1:d23",
        "rgb1:common": "bb1:d24",
        "rgb1:green": "bb1:d25",
        "rgb1:blue": "bb1:d26"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:bus-top-plus-6", to: "bb1:a6", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:j4", to: "bb1:a16", color: "orange" },
        { from: "bb1:j8", to: "bb1:a18", color: "green" },
        { from: "bb1:j12", to: "bb1:a19", color: "blue" },
        { from: "bb1:a24", to: "bb1:bus-top-minus-24", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 140.25, y: 82.5 },
        "btn2": { x: 170.25, y: 82.5 },
        "btn3": { x: 200.25, y: 82.5 },
        "r1": { x: 256.5, y: 43.75 },
        "r2": { x: 271.5, y: 51.25 },
        "r3": { x: 279, y: 58.75 },
        "rgb1": { x: 294, y: 43.75 }
      },
      steps: [
        "Stessa disposizione dell'esperimento 4, ma con resistori di valori diversi!",
        "R1 = 220\u03A9 (rosso \u2192 pi\u00f9 luminoso), R2 = 470\u03A9 (verde \u2192 medio), R3 = 1k\u03A9 (blu \u2192 pi\u00f9 fioco)",
        "Inserisci i 3 pulsanti, i 3 resistori e il LED RGB come nell'esperimento 4",
        "Premi ogni pulsante singolarmente: noti la differenza di luminosit\u00e0?",
        "Premi combinazioni e osserva le sfumature: i colori non si mescolano alla pari!"
      ],
      observe: "Il rosso (220\u03A9) \u00e8 il pi\u00f9 luminoso, il blu (1k\u03A9) il pi\u00f9 fioco. Resistori diversi = sfumature uniche!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Mix avanzato con resistori diversi'. I 3 canali hanno resistori diversi (220, 470, 1000 ohm), quindi ogni colore ha una luminosità diversa. Spiega come resistori diversi cambiano la proporzione dei colori nella miscela. Il rosso (220 ohm) sarà più intenso, il blu (1000 ohm) più debole. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Resistori diversi = luminosità diverse per canale",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      layer: "schema",
      note: "R diversi cambiano l'intensità di ogni colore. Sperimenta!",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E2 e F4. Controlla il ROSSO!",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e2", "btn1:pin2": "bb1:f4" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 4,
          text: "Prendi il secondo pulsante e posizionalo nei fori E6 e F8. Controlla il VERDE!",
          componentId: "btn2",
          componentType: "push-button",
          targetPins: { "btn2:pin1": "bb1:e6", "btn2:pin2": "bb1:f8" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 5,
          text: "Prendi il terzo pulsante e posizionalo nei fori E10 e F12. Controlla il BLU!",
          componentId: "btn3",
          componentType: "push-button",
          targetPins: { "btn3:pin1": "bb1:e10", "btn3:pin2": "bb1:f12" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 6,
          text: "Prendi il resistore da 220Ω dalla palette e posizionalo nei fori A16 e A23. Questo darà il ROSSO più luminoso!",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a16", "r1:pin2": "bb1:a23" },
          hint: "220Ω = resistenza piccola = più corrente = colore più luminoso!"
        },
        {
          step: 7,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori B18 e B25. Il VERDE sarà medio!",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:b18", "r2:pin2": "bb1:b25" },
          hint: "470Ω = resistenza media = corrente media = luminosità media."
        },
        {
          step: 8,
          text: "Prendi il resistore da 1kΩ dalla palette e posizionalo nei fori C19 e C26. Il BLU sarà il più fioco!",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:c19", "r3:pin2": "bb1:c26" },
          hint: "1000Ω = resistenza grande = meno corrente = colore più fioco."
        },
        {
          step: 9,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D23, D24, D25 e D26.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d23", "rgb1:common": "bb1:d24", "rgb1:green": "bb1:d25", "rgb1:blue": "bb1:d26" },
          hint: "I 4 piedini: Rosso in D23, Catodo comune in D24, Verde in D25, Blu in D26."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal bus + (col. 2) al foro A2. Alimenta il primo pulsante!",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al pulsante del rosso."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal bus + (col. 6) al foro A6. Alimenta il secondo pulsante!",
          wireFrom: "bb1:bus-top-plus-6",
          wireTo: "bb1:a6",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al pulsante del verde."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal bus + (col. 10) al foro A10. Alimenta il terzo pulsante!",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al pulsante del blu."
        },
        {
          step: 14,
          text: "Collega un filo ARANCIONE dal foro J4 al foro A16. Collega pulsante rosso → resistore 220Ω!",
          wireFrom: "bb1:j4",
          wireTo: "bb1:a16",
          wireColor: "orange",
          hint: "Questo filo porta il segnale dal pulsante al resistore del canale rosso."
        },
        {
          step: 15,
          text: "Collega un filo VERDE dal foro J8 al foro A18. Collega pulsante verde → resistore 470Ω!",
          wireFrom: "bb1:j8",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "Questo filo porta il segnale dal pulsante al resistore del canale verde."
        },
        {
          step: 16,
          text: "Collega un filo BLU dal foro J12 al foro A19. Collega pulsante blu → resistore 1kΩ!",
          wireFrom: "bb1:j12",
          wireTo: "bb1:a19",
          wireColor: "blue",
          hint: "Questo filo porta il segnale dal pulsante al resistore del canale blu."
        },
        {
          step: 17,
          text: "Collega un filo NERO dal foro A24 al bus − superiore (col. 24). Il catodo va a massa!",
          wireFrom: "bb1:a24",
          wireTo: "bb1:bus-top-minus-24",
          wireColor: "black",
          hint: "Il catodo comune del LED RGB va al bus negativo."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal bus − superiore (col. 1) al polo − della batteria. Circuito chiuso!",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Quale valore di resistore dà il colore più luminoso al LED RGB?",
          options: ["1000\u03A9 (il più grande)", "470\u03A9 (il medio)", "220\u03A9 (il più piccolo)"],
          correct: 2,
          explanation: "Il resistore da 220\u03A9 lascia passare più corrente, quindi il LED collegato è il più luminoso!"
        },
        {
          question: "Se metti resistori diversi sui canali R, G e B, cosa ottieni?",
          options: ["Tutti i colori alla stessa luminosità", "Ogni colore ha un'intensità diversa, creando sfumature uniche", "Il LED non funziona"],
          correct: 1,
          explanation: "Resistori diversi creano correnti diverse per ogni canale. Così puoi ottenere sfumature di colore uniche!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 9 — Cos'è un potenziometro? (9 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap9-esp1",
      title: "Cap. 9 Esp. 1 - Dimmer LED con potenziometro",
      desc: "Gira la manopola del potenziometro per cambiare la luminosità del LED!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 1,
      icon: "\u{1F39B}\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e5",
        "pot1:signal": "bb1:e6",
        "pot1:gnd": "bb1:e7",
        "r1:pin1": "bb1:e10",
        "r1:pin2": "bb1:e17",
        "led1:anode": "bb1:d17",
        "led1:cathode": "bb1:d18"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a6", to: "bb1:a10", color: "yellow" },
        { from: "bb1:a7", to: "bb1:bus-top-minus-7", color: "black" },
        { from: "bb1:a18", to: "bb1:bus-top-minus-18", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 155.25, y: 51.25 },
        "r1": { x: 211.5, y: 73.75 },
        "led1": { x: 241.5, y: 43.75 }
      },
      steps: [
        "Inserisci il potenziometro con i 3 pin nella fila e, colonne 5-6-7",
        "Inserisci il resistore da 470\u03A9 nella fila e, colonne 10-17",
        "Inserisci il LED rosso nella fila d, colonne 17-18",
        "Collega il bus + alla colonna 5 (VCC del pot)",
        "Collega la colonna 6 (signal) alla colonna 10 (resistore), e la colonna 7 (GND) al bus \u2212",
        "Gira la manopola del potenziometro e osserva!"
      ],
      observe: "Girando la manopola il LED cambia luminosit\u00e0! Il pot agisce come un dimmer regolabile.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Dimmer LED con potenziometro'. Il potenziometro è come un rubinetto girevole che controlla quanta corrente passa. Girando la manopola si cambia la resistenza da 0 a 10000 ohm. Spiega il concetto di partitore di tensione e come il pot funziona come un dimmer (regolatore di luminosità). Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Resistenza variabile, partitore di tensione, dimmer",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E5, E6 e E7.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e5", "pot1:signal": "bb1:e6", "pot1:gnd": "bb1:e7" },
          hint: "I 3 pin: VCC in E5, Signal in E6, GND in E7."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E10 e E17.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e10", "r1:pin2": "bb1:e17" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D17 e D18.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d17", "led1:cathode": "bb1:d18" },
          hint: "L'anodo (+, gamba lunga) va in D17 e il catodo (−, gamba corta) in D18."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A6 al foro A10.",
          wireFrom: "bb1:a6",
          wireTo: "bb1:a10",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A7 al foro bus − superiore (col. 7).",
          wireFrom: "bb1:a7",
          wireTo: "bb1:bus-top-minus-7",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A18 al foro bus − superiore (col. 18).",
          wireFrom: "bb1:a18",
          wireTo: "bb1:bus-top-minus-18",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cos'è un potenziometro?",
          options: ["Un tipo di batteria", "Una resistenza che puoi regolare girando una manopola", "Un LED speciale"],
          correct: 1,
          explanation: "Il potenziometro è una resistenza variabile: girando la manopola cambi quanta corrente passa nel circuito."
        },
        {
          question: "Cosa succede al LED quando giri la manopola del potenziometro?",
          options: ["Cambia colore", "Cambia luminosità, da spento a molto luminoso", "Lampeggia"],
          correct: 1,
          explanation: "Il potenziometro funziona come un dimmer: più resistenza = meno corrente = LED più fioco."
        }
      ]
    },
    {
      id: "v1-cap9-esp2",
      title: "Cap. 9 Esp. 2 - Inverti la rotazione",
      desc: "Scambia i pin 1 e 3 del potenziometro: la rotazione si inverte!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 1,
      icon: "\u{1F504}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e5",
        "pot1:signal": "bb1:e6",
        "pot1:gnd": "bb1:e7",
        "r1:pin1": "bb1:e10",
        "r1:pin2": "bb1:e17",
        "led1:anode": "bb1:d17",
        "led1:cathode": "bb1:d18"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-7", to: "bb1:a7", color: "red" },
        { from: "bb1:a6", to: "bb1:a10", color: "yellow" },
        { from: "bb1:a5", to: "bb1:bus-top-minus-5", color: "black" },
        { from: "bb1:a18", to: "bb1:bus-top-minus-18", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 155.25, y: 51.25 },
        "r1": { x: 211.5, y: 73.75 },
        "led1": { x: 241.5, y: 43.75 }
      },
      steps: [
        "Inserisci il potenziometro con i 3 pin nella fila e, colonne 5-6-7",
        "Inserisci il resistore da 470\u03A9 nella fila e, colonne 10-17",
        "Inserisci il LED rosso nella fila d, colonne 17-18",
        "INVERTI: collega il bus + alla colonna 7 (GND del pot) e la colonna 5 (VCC) al bus \u2212",
        "Gira la manopola e osserva la differenza!"
      ],
      observe: "La rotazione \u00e8 invertita! Girando a destra la luce diminuisce. I pin VCC e GND del pot sono simmetrici.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Inverti la rotazione'. Scambiando i pin VCC e GND del potenziometro, la rotazione si inverte: girando a destra la luce diminuisce invece di aumentare. Spiega la simmetria del potenziometro e come invertire i pin è come guardare il rubinetto dall'altro lato. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Inversione potenziometro, simmetria pin",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E5, E6 e E7.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e5", "pot1:signal": "bb1:e6", "pot1:gnd": "bb1:e7" },
          hint: "I 3 pin: VCC in E5, Signal in E6, GND in E7."
        },
        {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E10 e E17.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e10", "r1:pin2": "bb1:e17" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D17 e D18.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d17", "led1:cathode": "bb1:d18" },
          hint: "L'anodo (+, gamba lunga) va in D17 e il catodo (−, gamba corta) in D18."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 7) al foro A7.",
          wireFrom: "bb1:bus-top-plus-7",
          wireTo: "bb1:a7",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A6 al foro A10.",
          wireFrom: "bb1:a6",
          wireTo: "bb1:a10",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A5 al foro bus − superiore (col. 5).",
          wireFrom: "bb1:a5",
          wireTo: "bb1:bus-top-minus-5",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A18 al foro bus − superiore (col. 18).",
          wireFrom: "bb1:a18",
          wireTo: "bb1:bus-top-minus-18",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cosa cambia se scambi i pin VCC e GND del potenziometro?",
          options: ["Il circuito si rompe", "La rotazione si inverte: girando a destra la luce diminuisce", "Non cambia nulla"],
          correct: 1,
          explanation: "Scambiando i pin laterali del potenziometro, la direzione di regolazione si inverte!"
        },
        {
          question: "Perché funziona invertire i pin del potenziometro?",
          options: ["Perché il potenziometro è simmetrico: i pin laterali si possono scambiare", "Perché la batteria si inverte", "Non funziona, il LED si brucia"],
          correct: 0,
          explanation: "Il potenziometro è simmetrico: il pin centrale (signal) legge la posizione, e scambiare i laterali inverte la direzione."
        }
      ]
    },
    {
      id: "v1-cap9-esp3",
      title: "Cap. 9 Esp. 3 - LED di colore diverso con pot",
      desc: "Prova con un LED verde o blu: la tensione di forward è diversa!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 1,
      icon: "\u{1F7E2}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "green" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e5",
        "pot1:signal": "bb1:e6",
        "pot1:gnd": "bb1:e7",
        "r1:pin1": "bb1:e10",
        "r1:pin2": "bb1:e17",
        "led1:anode": "bb1:d17",
        "led1:cathode": "bb1:d18"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a6", to: "bb1:a10", color: "yellow" },
        { from: "bb1:a7", to: "bb1:bus-top-minus-7", color: "black" },
        { from: "bb1:a18", to: "bb1:bus-top-minus-18", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 155.25, y: 51.25 },
        "r1": { x: 211.5, y: 73.75 },
        "led1": { x: 241.5, y: 43.75 }
      },
      steps: [
        "Inserisci il potenziometro con i 3 pin nella fila e, colonne 5-6-7",
        "Inserisci il resistore da 470\u03A9 nella fila e, colonne 10-17",
        "Inserisci il LED verde nella fila d, colonne 17-18",
        "Collega come nell'esperimento 1 del Cap. 9",
        "Gira la manopola lentamente e nota a che punto il LED verde si accende"
      ],
      observe: "Il LED verde si accende a un punto diverso della rotazione! Serve pi\u00f9 tensione per accenderlo (~2.2V vs ~1.8V del rosso).",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED di colore diverso con pot'. Qui si usa un LED verde che ha una tensione forward di circa 2.2V (vs 1.8V del rosso). Spiega che il pot deve fornire più tensione per accendere il verde, quindi il punto di accensione è diverso girando la manopola. Ogni colore LED ha una 'soglia' diversa. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Tensione forward diversa per colore LED",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E5, E6 e E7.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e5", "pot1:signal": "bb1:e6", "pot1:gnd": "bb1:e7" },
          hint: "I 3 pin: VCC in E5, Signal in E6, GND in E7."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E10 e E17.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e10", "r1:pin2": "bb1:e17" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED verde dalla palette e posizionalo nei fori D17 e D18.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d17", "led1:cathode": "bb1:d18" },
          hint: "L'anodo (+, gamba lunga) va in D17 e il catodo (−, gamba corta) in D18."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A6 al foro A10.",
          wireFrom: "bb1:a6",
          wireTo: "bb1:a10",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A7 al foro bus − superiore (col. 7).",
          wireFrom: "bb1:a7",
          wireTo: "bb1:bus-top-minus-7",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A18 al foro bus − superiore (col. 18).",
          wireFrom: "bb1:a18",
          wireTo: "bb1:bus-top-minus-18",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché il LED verde si accende a un punto diverso della manopola rispetto al rosso?",
          options: ["Perché il verde ha bisogno di più tensione per accendersi", "Perché il potenziometro è rotto", "Perché il verde consuma più batteria"],
          correct: 0,
          explanation: "Il LED verde ha una tensione forward di circa 2.2V, mentre il rosso solo 1.8V. Serve girare di più la manopola!"
        },
        {
          question: "Cos'è la 'tensione forward' di un LED?",
          options: ["La tensione massima prima che si bruci", "La tensione minima necessaria per farlo accendere", "La velocità della corrente nel LED"],
          correct: 1,
          explanation: "La tensione forward è la soglia minima di tensione per accendere il LED. Ogni colore ha una soglia diversa."
        }
      ]
    },
    {
      id: "v1-cap9-esp4",
      title: "Cap. 9 Esp. 4 - Dimmer RGB azzurrino",
      desc: "Collega il pot al canale blu + verde del RGB con un resistore sul catodo: crea un azzurrino dimmerabile!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 2,
      icon: "\u{1F4A7}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e3",
        "pot1:signal": "bb1:e4",
        "pot1:gnd": "bb1:e5",
        "r1:pin1": "bb1:c15",
        "r1:pin2": "bb1:c19",
        "rgb1:red": "bb1:d18",
        "rgb1:common": "bb1:d19",
        "rgb1:green": "bb1:d20",
        "rgb1:blue": "bb1:d21"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-3", to: "bb1:a3", color: "red" },
        { from: "bb1:a4", to: "bb1:a21", color: "blue" },
        { from: "bb1:a4", to: "bb1:a20", color: "green" },
        { from: "bb1:a5", to: "bb1:bus-top-minus-5", color: "black" },
        { from: "bb1:a15", to: "bb1:bus-top-minus-15", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 140.25, y: 51.25 },
        "r1": { x: 196.5, y: 58.75 },
        "r2": { x: 196.5, y: 98.75 },
        "rgb1": { x: 256.5, y: 43.75 }
      },
      steps: [
        "Inserisci il potenziometro nella fila e, colonne 3-4-5",
        "Inserisci r1 (470\u03A9) nella fila c, col 8-15 (per il blu)",
        "Inserisci r2 (470\u03A9) nella fila g, col 8-15 (per il verde)",
        "Inserisci il LED RGB nella fila d, colonne 18-21",
        "Collega il signal del pot a entrambi i resistori",
        "Gira la manopola: il colore ciano (azzurrino) cambia intensit\u00e0!"
      ],
      observe: "Verde + Blu = Ciano (azzurrino)! Il pot controlla entrambi i canali contemporaneamente.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Dimmer RGB azzurrino'. Un singolo potenziometro controlla contemporaneamente il blu e il verde del LED RGB, creando il colore ciano (azzurrino). Girando la manopola si cambia l'intensità del ciano. Spiega la sintesi additiva: verde + blu = ciano. E come il pot controlla entrambi i canali insieme. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Pot controlla 2 canali LED RGB, colore cyan",
      layer: "schema",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E3, E4 e E5.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e3", "pot1:signal": "bb1:e4", "pot1:gnd": "bb1:e5" },
          hint: "I 3 pin: VCC in E3, Signal in E4, GND in E5."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori C8 e C15.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c8", "r1:pin2": "bb1:c15" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori G8 e G15.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:g8", "r2:pin2": "bb1:g15" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D18, D19, D20 e D21.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d18", "rgb1:common": "bb1:d19", "rgb1:green": "bb1:d20", "rgb1:blue": "bb1:d21" },
          hint: "I 4 piedini: Rosso in D18, Catodo comune in D19, Verde in D20, Blu in D21."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 3) al foro A3.",
          wireFrom: "bb1:bus-top-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A4 al foro A8.",
          wireFrom: "bb1:a4",
          wireTo: "bb1:a8",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro A4 al foro F8.",
          wireFrom: "bb1:a4",
          wireTo: "bb1:f8",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo BLU dal foro A15 al foro A21.",
          wireFrom: "bb1:a15",
          wireTo: "bb1:a21",
          wireColor: "blue",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo VERDE dal foro F15 al foro A20.",
          wireFrom: "bb1:f15",
          wireTo: "bb1:a20",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro A5 al foro bus − superiore (col. 5).",
          wireFrom: "bb1:a5",
          wireTo: "bb1:bus-top-minus-5",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A19 al foro bus − superiore (col. 19).",
          wireFrom: "bb1:a19",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireTo: "bb1:bus-top-minus-19",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Che colore ottieni mescolando luce blu e verde?",
          options: ["Viola", "Ciano (azzurrino)", "Giallo"],
          correct: 1,
          explanation: "Nella sintesi additiva della luce, blu + verde = ciano! È il colore dell'acqua del mare tropicale."
        },
        {
          question: "Come fa un solo potenziometro a controllare due canali del LED RGB?",
          options: ["Il pot ha un segnale che si divide in due rami, uno per il blu e uno per il verde", "Il pot ha due manopole nascoste", "Non è possibile, servono due pot"],
          correct: 0,
          explanation: "Il segnale del potenziometro si collega a due resistori in parallelo, ognuno va a un canale diverso del LED RGB."
        }
      ]
    },
    {
      id: "v1-cap9-esp5",
      title: "Cap. 9 Esp. 5 - Pot miscelatore blu  rosso",
      desc: "Il pot mescola tra blu e rosso: pin 1 al blu, pin 3 al rosso!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 2,
      icon: "\u{1F3A8}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e3",
        "pot1:signal": "bb1:e4",
        "pot1:gnd": "bb1:e5",
        "r1:pin1": "bb1:c15",
        "r1:pin2": "bb1:c19",
        "rgb1:red": "bb1:d18",
        "rgb1:common": "bb1:d19",
        "rgb1:green": "bb1:d20",
        "rgb1:blue": "bb1:d21"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-4", to: "bb1:a4", color: "red" },
        { from: "bb1:a3", to: "bb1:a21", color: "blue" },
        { from: "bb1:a5", to: "bb1:a18", color: "orange" },
        { from: "bb1:a15", to: "bb1:bus-top-minus-15", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 140.25, y: 51.25 },
        "r1": { x: 196.5, y: 58.75 },
        "r2": { x: 196.5, y: 98.75 },
        "rgb1": { x: 256.5, y: 43.75 }
      },
      steps: [
        "Inserisci il potenziometro nella fila e, colonne 3-4-5",
        "ATTENZIONE: collega il bus + alla colonna 4 (pin SIGNAL centrale del pot)!",
        "Collega VCC del pot a r1 (per il blu), GND del pot a r2 (per il rosso)",
        "Inserisci il LED RGB nella fila e, col 20",
        "Gira la manopola: il colore sfuma da blu a rosso passando per il viola!"
      ],
      observe: "Miscelatore di colori! Da un lato tutto blu, dall'altro tutto rosso, nel mezzo il viola!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Pot miscelatore blu/rosso'. Collegamento speciale: la corrente della batteria entra dal pin centrale (signal) del pot, e si divide tra VCC (verso il blu) e GND (verso il rosso). Girando la manopola si mescola tra i due colori: tutto blu, tutto rosso, o un mix viola nel mezzo. È un miscelatore! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Miscelatore colore, partitore bidirezionale",
      layer: "schema",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E3, E4 e E5.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e3", "pot1:signal": "bb1:e4", "pot1:gnd": "bb1:e5" },
          hint: "I 3 pin: VCC in E3, Signal in E4, GND in E5."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori C8 e C15.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c8", "r1:pin2": "bb1:c15" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori G8 e G15.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:g8", "r2:pin2": "bb1:g15" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D18, D19, D20 e D21.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d18", "rgb1:common": "bb1:d19", "rgb1:green": "bb1:d20", "rgb1:blue": "bb1:d21" },
          hint: "I 4 piedini: Rosso in D18, Catodo comune in D19, Verde in D20, Blu in D21."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 4) al foro A4.",
          wireFrom: "bb1:bus-top-plus-4",
          wireTo: "bb1:a4",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A3 al foro A8.",
          wireFrom: "bb1:a3",
          wireTo: "bb1:a8",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro A5 al foro F8.",
          wireFrom: "bb1:a5",
          wireTo: "bb1:f8",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo BLU dal foro A15 al foro A21.",
          wireFrom: "bb1:a15",
          wireTo: "bb1:a21",
          wireColor: "blue",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo ARANCIONE dal foro F15 al foro A18.",
          wireFrom: "bb1:f15",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro A19 al foro bus − superiore (col. 19).",
          wireFrom: "bb1:a19",
          wireTo: "bb1:bus-top-minus-19",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Come funziona il miscelatore blu/rosso con il potenziometro?",
          options: ["Girando la manopola, la corrente si sposta gradualmente dal blu al rosso", "Il pot accende un colore alla volta", "Il pot cambia la batteria"],
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          correct: 0,
          explanation: "Il potenziometro divide la corrente tra i due canali: da un lato tutto blu, dall'altro tutto rosso, nel mezzo il viola!"
        },
        {
          question: "Cosa vedi quando la manopola è esattamente a metà?",
          options: ["Solo rosso", "Solo blu", "Un mix di rosso e blu, cioè viola"],
          correct: 2,
          explanation: "A metà la corrente si divide equamente tra rosso e blu, creando il viola!"
        }
      ]
    },
    {
      id: "v1-cap9-esp6",
      title: "Cap. 9 Esp. 6 - Lampada RGB con 3 potenziometri",
      desc: "3 pot controllano R, G, B indipendentemente. Crea qualsiasi colore!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 2,
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "potentiometer", id: "pot2", value: 10000 },
        { type: "potentiometer", id: "pot3", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e2",
        "pot1:signal": "bb1:e3",
        "pot1:gnd": "bb1:e4",
        "pot2:vcc": "bb1:e7",
        "pot2:signal": "bb1:e8",
        "pot2:gnd": "bb1:e9",
        "pot3:vcc": "bb1:e12",
        "pot3:signal": "bb1:e13",
        "pot3:gnd": "bb1:e14",
        "r1:pin1": "bb1:b17",
        "r1:pin2": "bb1:b24",
        "r2:pin1": "bb1:e19",
        "r2:pin2": "bb1:e26",
        "r3:pin1": "bb1:h17",
        "r3:pin2": "bb1:h24",
        "rgb1:red": "bb1:d27",
        "rgb1:common": "bb1:d28",
        "rgb1:green": "bb1:d29",
        "rgb1:blue": "bb1:d30"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:bus-top-plus-7", to: "bb1:a7", color: "red" },
        { from: "bb1:bus-top-plus-12", to: "bb1:a12", color: "red" },
        { from: "bb1:a3", to: "bb1:a17", color: "yellow" },
        { from: "bb1:a8", to: "bb1:c19", color: "yellow" },
        { from: "bb1:a13", to: "bb1:f17", color: "yellow" },
        { from: "bb1:bus-top-plus-1", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "bb1:a24", to: "bb1:a27", color: "orange" },
        { from: "bb1:c26", to: "bb1:c29", color: "green" },
        { from: "bb1:f24", to: "bb1:a30", color: "blue" },
        { from: "bb1:a4", to: "bb1:bus-top-minus-4", color: "black" },
        { from: "bb1:a9", to: "bb1:bus-top-minus-9", color: "black" },
        { from: "bb1:a14", to: "bb1:bus-top-minus-14", color: "black" },
        { from: "bb1:a28", to: "bb1:bus-top-minus-28", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 132.75, y: 51.25 },
        "pot2": { x: 170.25, y: 51.25 },
        "pot3": { x: 207.75, y: 51.25 },
        "r1": { x: 264, y: 51.25 },
        "r2": { x: 279, y: 73.75 },
        "r3": { x: 264, y: 106.25 },
        "rgb1": { x: 324, y: 43.75 }
      },
      steps: [
        "Inserisci i 3 potenziometri nella fila e: pot1 col 2-4, pot2 col 7-9, pot3 col 12-14",
        "Inserisci r1 (470\u03A9) nella fila b col 17-24, r2 nella fila e col 19-26, r3 nella fila h col 17-24",
        "Inserisci il LED RGB nella fila f, col 28",
        "Collega il + della batteria al VCC di ogni pot, i GND al \u2212",
        "Collega pot1\u2192r1\u2192rosso, pot2\u2192r2\u2192verde, pot3\u2192r3\u2192blu",
        "Gira le 3 manopole per creare qualsiasi colore!"
      ],
      observe: "3 manopole = controllo totale del colore! Come i pixel del telefono: ogni colore ha il suo regolatore.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Lampada RGB con 3 potenziometri'. Tre manopole controllano indipendentemente rosso, verde e blu. È come avere 3 rubinetti per i 3 colori: girandoli si può creare QUALSIASI colore! Spiega che questo è esattamente come funzionano gli schermi dei telefoni e delle TV. Ogni pixel ha 3 sub-pixel R, G, B. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Controllo indipendente R/G/B, lampada personalizzabile",
      layer: "schema",
      advancedProject: true,
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E2, E3 e E4.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e2", "pot1:signal": "bb1:e3", "pot1:gnd": "bb1:e4" },
          hint: "I 3 pin: VCC in E2, Signal in E3, GND in E4."
        },
        {
          step: 4,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E7, E8 e E9.",
          componentId: "pot2",
          componentType: "potentiometer",
          targetPins: { "pot2:vcc": "bb1:e7", "pot2:signal": "bb1:e8", "pot2:gnd": "bb1:e9" },
          hint: "I 3 pin: VCC in E7, Signal in E8, GND in E9."
        },
        {
          step: 5,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E12, E13 e E14.",
          componentId: "pot3",
          componentType: "potentiometer",
          targetPins: { "pot3:vcc": "bb1:e12", "pot3:signal": "bb1:e13", "pot3:gnd": "bb1:e14" },
          hint: "I 3 pin: VCC in E12, Signal in E13, GND in E14."
        },
        {
          step: 6,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori B17 e B24.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b17", "r1:pin2": "bb1:b24" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 7,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E19 e E26.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e19", "r2:pin2": "bb1:e26" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 8,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori H17 e H24.",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:h17", "r3:pin2": "bb1:h24" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 9,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D27, D28, D29 e D30.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d27", "rgb1:common": "bb1:d28", "rgb1:green": "bb1:d29", "rgb1:blue": "bb1:d30" },
          hint: "I 4 piedini: Rosso in D27, Catodo comune in D28, Verde in D29, Blu in D30."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 7) al foro A7.",
          wireFrom: "bb1:bus-top-plus-7",
          wireTo: "bb1:a7",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 12) al foro A12.",
          wireFrom: "bb1:bus-top-plus-12",
          wireTo: "bb1:a12",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 14,
          text: "Collega un filo GIALLO dal foro A3 al foro A17.",
          wireFrom: "bb1:a3",
          wireTo: "bb1:a17",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 15,
          text: "Collega un filo GIALLO dal foro A8 al foro C19.",
          wireFrom: "bb1:a8",
          wireTo: "bb1:c19",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 16,
          text: "Collega un filo GIALLO dal foro A13 al foro F17.",
          wireFrom: "bb1:a13",
          wireTo: "bb1:f17",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 17,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 1) al foro bus + inferiore (col. 1).",
          wireFrom: "bb1:bus-top-plus-1",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Questo filo collega i due bus della breadboard."
        },
        {
          step: 18,
          text: "Collega un filo ARANCIONE dal foro A24 al foro A27.",
          wireFrom: "bb1:a24",
          wireTo: "bb1:a27",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 19,
          text: "Collega un filo VERDE dal foro C26 al foro C29.",
          wireFrom: "bb1:c26",
          wireTo: "bb1:c29",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 20,
          text: "Collega un filo BLU dal foro F24 al foro A30.",
          wireFrom: "bb1:f24",
          wireTo: "bb1:a30",
          wireColor: "blue",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 21,
          text: "Collega un filo NERO dal foro A4 al foro bus − superiore (col. 4).",
          wireFrom: "bb1:a4",
          wireTo: "bb1:bus-top-minus-4",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 22,
          text: "Collega un filo NERO dal foro A9 al foro bus − superiore (col. 9).",
          wireFrom: "bb1:a9",
          wireTo: "bb1:bus-top-minus-9",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 23,
          text: "Collega un filo NERO dal foro A14 al foro bus − superiore (col. 14).",
          wireFrom: "bb1:a14",
          wireTo: "bb1:bus-top-minus-14",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 24,
          text: "Collega un filo NERO dal foro A28 al foro bus − superiore (col. 28).",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-top-minus-28",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 25,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché servono 3 potenziometri per la lampada RGB?",
          options: ["Perché ogni canale (R, G, B) ha bisogno del suo regolatore indipendente", "Perché un solo pot non ha abbastanza energia", "Per decorazione"],
          correct: 0,
          explanation: "Con 3 pot indipendenti puoi regolare ogni colore separatamente, come 3 rubinetti per 3 colori diversi!"
        },
        {
          question: "Quanti colori diversi puoi teoricamente creare con 3 potenziometri?",
          options: ["Solo 7, come con i pulsanti", "Solo 3: rosso, verde e blu", "Tantissimi! Ogni posizione delle manopole crea una sfumatura diversa"],
          correct: 2,
          explanation: "A differenza dei pulsanti (ON/OFF), i potenziometri sono graduali: puoi creare migliaia di sfumature diverse!"
        }
      ]
    },
    {
      id: "v1-cap9-esp7",
      title: "Cap. 9 Esp. 7 - Sfida: aggiungi pulsanti alla lampada",
      desc: "Sfida aperta! Combina la lampada RGB con 3 pulsanti per ON/OFF per canale.",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 3,
      icon: "\u{1F3C6}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e2",
        "btn1:pin2": "bb1:f4",
        "pot1:vcc": "bb1:e7",
        "pot1:signal": "bb1:e8",
        "pot1:gnd": "bb1:e9",
        "r1:pin1": "bb1:e12",
        "r1:pin2": "bb1:e19",
        "rgb1:red": "bb1:d22",
        "rgb1:common": "bb1:d23",
        "rgb1:green": "bb1:d24",
        "rgb1:blue": "bb1:d25"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:j4", to: "bb1:j7", color: "yellow" },
        { from: "bb1:j7", to: "bb1:a7", color: "yellow" },
        { from: "bb1:a8", to: "bb1:a12", color: "yellow" },
        { from: "bb1:a19", to: "bb1:a22", color: "orange" },
        { from: "bb1:a9", to: "bb1:bus-top-minus-9", color: "black" },
        { from: "bb1:a23", to: "bb1:bus-top-minus-23", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 140.25, y: 82.5 },
        "pot1": { x: 170.25, y: 51.25 },
        "r1": { x: 226.5, y: 73.75 },
        "rgb1": { x: 286.5, y: 43.75 }
      },
      steps: [
        "Inserisci il pulsante a cavallo della scanalatura (pin1 in e2, pin2 in f4)",
        "Inserisci il potenziometro nella fila e, colonne 7-8-9",
        "Inserisci il resistore da 470\u03A9 nella fila e, col 12-19",
        "Inserisci il LED RGB nella fila d, colonne 22-25",
        "Collega: bus + \u2192 pulsante \u2192 pot \u2192 resistore \u2192 RGB rosso",
        "Sfida: riesci ad aggiungere 2 pulsanti e 2 pot per tutti e 3 i canali?"
      ],
      observe: "Il pulsante \u00e8 l'ON/OFF, il pot regola la luminosit\u00e0. Due livelli di controllo!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Sfida: aggiungi pulsanti alla lampada'. Questa è una sfida aperta! Il circuito mostra un esempio con un pulsante e un pot per un canale del RGB. La sfida è progettare il circuito completo con 3 pulsanti e 3 pot. Aiuta il docente a far ragionare i ragazzi su come pensare come combinare i componenti e a disegnare il circuito prima di costruirlo. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sfida: integrazione pulsante + pot + RGB",
      layer: "cielo",
      note: "Sfida aperta: progetta tu il circuito completo!",
      solutionHint: "Schema finale: 3 pulsanti (uno per canale R/G/B) collegati ciascuno a un potenziometro da 10k\u03A9, poi a un resistore da 470\u03A9, e infine al pin corrispondente del LED RGB. Tutti i GND vanno alla riga - della breadboard. Prova prima a disegnarlo su carta!",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E7, E8 e E9.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e7", "pot1:signal": "bb1:e8", "pot1:gnd": "bb1:e9" },
          hint: "I 3 pin: VCC in E7, Signal in E8, GND in E9."
        },
        {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 4,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E2 e F4.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e2", "btn1:pin2": "bb1:f4" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E12 e E19.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e12", "r1:pin2": "bb1:e19" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D22, D23, D24 e D25.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d22", "rgb1:common": "bb1:d23", "rgb1:green": "bb1:d24", "rgb1:blue": "bb1:d25" },
          hint: "I 4 piedini: Rosso in D22, Catodo comune in D23, Verde in D24, Blu in D25."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro J4 al foro J7.",
          wireFrom: "bb1:j4",
          wireTo: "bb1:j7",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro J7 al foro A7.",
          wireFrom: "bb1:j7",
          wireTo: "bb1:a7",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo GIALLO dal foro A8 al foro A12.",
          wireFrom: "bb1:a8",
          wireTo: "bb1:a12",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo ARANCIONE dal foro A19 al foro A22.",
          wireFrom: "bb1:a19",
          wireTo: "bb1:a22",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro A9 al foro bus − superiore (col. 9).",
          wireFrom: "bb1:a9",
          wireTo: "bb1:bus-top-minus-9",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A23 al foro bus − superiore (col. 23).",
          wireFrom: "bb1:a23",
          wireTo: "bb1:bus-top-minus-23",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Qual è il vantaggio di aggiungere un pulsante a un canale con potenziometro?",
          options: ["Il pulsante fa da ON/OFF, così puoi spegnere un colore senza perdere la regolazione del pot", "Il pulsante rende il pot più preciso", "Non c'è nessun vantaggio"],
          correct: 0,
          explanation: "Il pulsante aggiunge un controllo ON/OFF: puoi spegnere un colore e riaccenderlo alla stessa luminosità di prima!"
        },
        {
          question: "Se hai un pulsante e un potenziometro sullo stesso canale, che tipo di controllo hai?",
          options: ["Solo acceso/spento", "Solo luminosità variabile", "Due livelli: acceso/spento E luminosità regolabile"],
          correct: 2,
          explanation: "Hai un controllo a due livelli: il pulsante decide SE accendere, il potenziometro decide QUANTO luminoso!"
        }
      ]
    },
    {
      id: "v1-cap9-esp8",
      title: "Cap. 9 Esp. 8 - Sfida: combina esperimenti 5+6",
      desc: "Sfida aperta! Unisci il miscelatore blu/rosso con la lampada 3 pot.",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 3,
      icon: "\u{1F3C6}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "potentiometer", id: "pot2", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e2",
        "pot1:signal": "bb1:e3",
        "pot1:gnd": "bb1:e4",
        "pot2:vcc": "bb1:e7",
        "pot2:signal": "bb1:e8",
        "pot2:gnd": "bb1:e9",
        "r1:pin1": "bb1:c12",
        "r1:pin2": "bb1:c19",
        "r2:pin1": "bb1:g12",
        "r2:pin2": "bb1:g19",
        "rgb1:red": "bb1:d22",
        "rgb1:common": "bb1:d23",
        "rgb1:green": "bb1:d24",
        "rgb1:blue": "bb1:d25"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:bus-top-plus-7", to: "bb1:a7", color: "red" },
        { from: "bb1:a3", to: "bb1:a12", color: "yellow" },
        { from: "bb1:a8", to: "bb1:f12", color: "yellow" },
        { from: "bb1:a19", to: "bb1:a22", color: "orange" },
        { from: "bb1:f19", to: "bb1:a25", color: "blue" },
        { from: "bb1:a4", to: "bb1:bus-top-minus-4", color: "black" },
        { from: "bb1:a9", to: "bb1:bus-top-minus-9", color: "black" },
        { from: "bb1:a23", to: "bb1:bus-top-minus-23", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 132.75, y: 51.25 },
        "pot2": { x: 170.25, y: 51.25 },
        "r1": { x: 226.5, y: 58.75 },
        "r2": { x: 226.5, y: 98.75 },
        "rgb1": { x: 286.5, y: 43.75 }
      },
      steps: [
        "Inserisci pot1 nella fila e col 2-4 e pot2 nella fila e col 7-9",
        "Inserisci r1 (470\u03A9) nella fila c, col 12-19 (per il rosso)",
        "Inserisci r2 (470\u03A9) nella fila g, col 12-19 (per il blu)",
        "Inserisci il LED RGB nella fila e, col 22",
        "Collega pot1\u2192r1\u2192rosso e pot2\u2192r2\u2192blu del RGB",
        "Sfida: aggiungi un terzo pot per il canale verde!"
      ],
      observe: "Due manopole controllano rosso e blu indipendentemente. Riesci a creare il viola perfetto?",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Sfida: combina esperimenti 5+6'. Due potenziometri controllano indipendentemente il rosso e il blu del LED RGB. Questa sfida richiede di combinare il concetto di miscelatore (esp 5) con quello della lampada multi-pot (esp 6). Aiuta il docente a far ragionare i ragazzi su come ragionare su come aggiungere il terzo canale verde. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sfida: integrazione circuiti precedenti",
      layer: "cielo",
      note: "Sfida aperta: progetta tu!",
      solutionHint: "Schema finale: 3 potenziometri (uno per R, uno per G, uno per B), ciascuno collegato attraverso un resistore da 470\u03A9 al pin corrispondente del LED RGB. Il catodo comune va a GND. Prova a farlo prima con 2 colori, poi aggiungi il terzo!",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E2, E3 e E4.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e2", "pot1:signal": "bb1:e3", "pot1:gnd": "bb1:e4" },
          hint: "I 3 pin: VCC in E2, Signal in E3, GND in E4."
        },
        {
          step: 4,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E7, E8 e E9.",
          componentId: "pot2",
          componentType: "potentiometer",
          targetPins: { "pot2:vcc": "bb1:e7", "pot2:signal": "bb1:e8", "pot2:gnd": "bb1:e9" },
          hint: "I 3 pin: VCC in E7, Signal in E8, GND in E9."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori C12 e C19.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c12", "r1:pin2": "bb1:c19" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori G12 e G19.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:g12", "r2:pin2": "bb1:g19" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 7,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D22, D23, D24 e D25.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d22", "rgb1:common": "bb1:d23", "rgb1:green": "bb1:d24", "rgb1:blue": "bb1:d25" },
          hint: "I 4 piedini: Rosso in D22, Catodo comune in D23, Verde in D24, Blu in D25."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 7) al foro A7.",
          wireFrom: "bb1:bus-top-plus-7",
          wireTo: "bb1:a7",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 11,
          text: "Collega un filo GIALLO dal foro A3 al foro A12.",
          wireFrom: "bb1:a3",
          wireTo: "bb1:a12",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo GIALLO dal foro A8 al foro F12.",
          wireFrom: "bb1:a8",
          wireTo: "bb1:f12",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 13,
          text: "Collega un filo ARANCIONE dal foro A19 al foro A22.",
          wireFrom: "bb1:a19",
          wireTo: "bb1:a22",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 14,
          text: "Collega un filo BLU dal foro F19 al foro A25.",
          wireFrom: "bb1:f19",
          wireTo: "bb1:a25",
          wireColor: "blue",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro A4 al foro bus − superiore (col. 4).",
          wireFrom: "bb1:a4",
          wireTo: "bb1:bus-top-minus-4",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro A9 al foro bus − superiore (col. 9).",
          wireFrom: "bb1:a9",
          wireTo: "bb1:bus-top-minus-9",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 17,
          text: "Collega un filo NERO dal foro A23 al foro bus − superiore (col. 23).",
          wireFrom: "bb1:a23",
          wireTo: "bb1:bus-top-minus-23",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cosa impari combinando il circuito miscelatore con la lampada multi-pot?",
          options: ["Che i circuiti non si possono combinare", "Che puoi unire idee diverse per creare circuiti più complessi e potenti", "Che servono più batterie"],
          correct: 1,
          explanation: "Combinare circuiti è il cuore dell'elettronica: prendi pezzi che funzionano e li unisci per creare qualcosa di nuovo!"
        },
        {
          question: "Nella lampada con 2 pot per rosso e blu, cosa succede al canale verde?",
          options: ["Il verde si accende automaticamente", "Il verde resta spento perché non ha un suo potenziometro", "Il verde si rompe"],
          correct: 1,
          explanation: "Senza un potenziometro collegato, il canale verde non riceve corrente e resta spento. La sfida è aggiungerne uno!"
        }
      ]
    },
    {
      id: "v1-cap9-esp9",
      title: "Cap. 9 Esp. 9 - Sfida: aggiungi pulsante all'esp 8",
      desc: "Aggiungi un pulsante per accendere e spegnere il LED RGB all'esperimento 8 (2 pot + RGB)!",
      chapter: "Capitolo 9 - Cos'è un potenziometro?",
      difficulty: 3,
      icon: "\u{1F3C6}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "potentiometer", id: "pot2", value: 10000 },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e2",
        "btn1:pin2": "bb1:f4",
        "pot1:vcc": "bb1:e7",
        "pot1:signal": "bb1:e8",
        "pot1:gnd": "bb1:e9",
        "r1:pin1": "bb1:e12",
        "r1:pin2": "bb1:e19",
        "led1:anode": "bb1:d20",
        "led1:cathode": "bb1:d21"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:j4", to: "bb1:j7", color: "yellow" },
        { from: "bb1:j7", to: "bb1:a7", color: "yellow" },
        { from: "bb1:a8", to: "bb1:a12", color: "yellow" },
        { from: "bb1:a9", to: "bb1:bus-top-minus-9", color: "black" },
        { from: "bb1:a19", to: "bb1:a20", color: "orange" },
        { from: "bb1:a21", to: "bb1:bus-top-minus-21", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 140.25, y: 82.5 },
        "pot1": { x: 170.25, y: 51.25 },
        "r1": { x: 226.5, y: 73.75 },
        "led1": { x: 264, y: 43.75 },
        "pot2": { x: 211.5, y: 51.25 },
        "r2": { x: 245, y: 73.75 },
        "rgb1": { x: 283.5, y: 43.75 }
      },
      steps: [
        "Inserisci il pulsante a cavallo della scanalatura (pin1 in e2, pin2 in f4)",
        "Inserisci il potenziometro nella fila e, colonne 7-8-9",
        "Inserisci il resistore da 470\u03A9 nella fila e, col 12-19",
        "Inserisci il LED rosso nella fila d, colonne 20-21",
        "Collega: bus + \u2192 pulsante \u2192 pot \u2192 resistore \u2192 LED",
        "Sfida: cosa succede se metti il pulsante DOPO il pot?"
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      ],
      observe: "Pulsante = ON/OFF, potenziometro = regola luminosit\u00e0. Una catena di controllo a 2 livelli!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Sfida: aggiungi pulsante all'esp 8'. Il pulsante funge da ON/OFF generale, il potenziometro regola la luminosità, e il LED mostra il risultato. È una catena di controllo: pulsante -> pot -> resistore -> LED. Aiuta il docente a stimolare i ragazzi a pensare: cosa succede se il pulsante viene messo DOPO il pot invece che prima? Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sfida: integrazione completa pulsante + pot + LED",
      layer: "cielo",
      note: "Sfida aperta!",
      solutionHint: "Schema finale: Batteria 9V \u2192 Pulsante (ON/OFF) \u2192 Potenziometro (regola luminosit\u00E0) \u2192 Resistore 470\u03A9 \u2192 LED. Prova anche l'alternativa: metti il pulsante DOPO il potenziometro. Funziona uguale? Perch\u00E9?",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E7, E8 e E9.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e7", "pot1:signal": "bb1:e8", "pot1:gnd": "bb1:e9" },
          hint: "I 3 pin: VCC in E7, Signal in E8, GND in E9."
        },
        {
          step: 4,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E2 e F4.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e2", "btn1:pin2": "bb1:f4" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E12 e E19.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e12", "r1:pin2": "bb1:e19" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D20 e D21.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d20", "led1:cathode": "bb1:d21" },
          hint: "L'anodo (+, gamba lunga) va in D20 e il catodo (−, gamba corta) in D21."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro J4 al foro J7.",
          wireFrom: "bb1:j4",
          wireTo: "bb1:j7",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro J7 al foro A7.",
          wireFrom: "bb1:j7",
          wireTo: "bb1:a7",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo GIALLO dal foro A8 al foro A12.",
          wireFrom: "bb1:a8",
          wireTo: "bb1:a12",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro A9 al foro bus − superiore (col. 9).",
          wireFrom: "bb1:a9",
          wireTo: "bb1:bus-top-minus-9",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 13,
          text: "Collega un filo ARANCIONE dal foro A19 al foro A20 (ponte).",
          wireFrom: "bb1:a19",
          wireTo: "bb1:a20",
          wireColor: "orange",
          hint: "Questo filo ponte collega il resistore al LED."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A21 al foro bus − superiore (col. 21).",
          wireFrom: "bb1:a21",
          wireTo: "bb1:bus-top-minus-21",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "A cosa serve il pulsante 'master' prima del potenziometro?",
          options: ["A regolare la luminosità", "A fare da interruttore ON/OFF generale per tutto il circuito", "A cambiare il colore del LED"],
          correct: 1,
          explanation: "Il pulsante master accende o spegne tutto il circuito: se non lo premi, il potenziometro non fa nulla!"
        },
        {
          question: "In una catena pulsante \u2192 potenziometro \u2192 resistore \u2192 LED, cosa controlla ogni pezzo?",
          options: ["Tutti controllano la stessa cosa", "Pulsante = ON/OFF, potenziometro = luminosità, resistore = protezione", "Solo il resistore è importante"],
          correct: 1,
          explanation: "Ogni componente ha un ruolo preciso nella catena di controllo: è come una squadra dove ognuno fa il suo lavoro!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 10 — Cos'è un fotoresistore? (6 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap10-esp1",
      title: "Cap. 10 Esp. 1 - LED controllato dalla luce",
      desc: "Il fotoresistore cambia resistenza con la luce: non serve un resistore in serie, l'LDR protegge il LED (Vol.1 cap.10 verbatim)!",
      chapter: "Capitolo 10 - Cos'è un fotoresistore?",
      difficulty: 2,
      icon: "\u2600\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "photo-resistor", id: "ldr1" },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "ldr1:pin1": "bb1:d5",
        "ldr1:pin2": "bb1:d8",
        "led1:anode": "bb1:d9",
        "led1:cathode": "bb1:d10"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a8", to: "bb1:a9", color: "yellow" },
        { from: "bb1:a10", to: "bb1:bus-top-minus-10", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "ldr1": { x: 151.5, y: 43.75 },
        "led1": { x: 189, y: 43.75 }
      },
      steps: [
        "Inserisci il fotoresistore (LDR) nella fila d, colonne 5-8",
        "Inserisci il LED rosso nella fila d, colonne 9-10 (anodo in 9, catodo in 10)",
        "Collega il bus + alla colonna 5 (pin1 dell'LDR)",
        "Collega la colonna 8 alla colonna 9 (LDR all'anodo del LED)",
        "Collega la colonna 10 al bus \u2212 (catodo del LED a massa)",
        "Muovi il cursore luminosit\u00e0 sull'LDR e osserva il LED!"
      ],
      observe: "Con luce l'LDR ha poca resistenza e il LED si accende! Al buio l'LDR blocca la corrente. Non serve un resistore: l'LDR stesso protegge il LED limitando la corrente quando illuminato (Vol.1 cap.10 verbatim).",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED controllato dalla luce'. Il fotoresistore (LDR) cambia resistenza con la luce: al buio ha molta resistenza (poca corrente), con la luce ha poca resistenza (molta corrente). In questo circuito non serve un resistore in serie: l'LDR stesso, anche quando illuminato, ha una resistenza abbastanza alta da non bruciare il LED (Vol.1 cap.10 verbatim). Il LED si accende quando c'è luce e si spegne al buio. Usa l'analogia di una porta che si apre quando c'è il sole, con l'LDR come portinaio che decide quanta corrente lasciar passare. Ragazzi, osservate insieme cosa succede coprendo l'LDR con la mano. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Fotoresistore, resistenza varia con la luce, sensore",
      layer: "terra",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori D5 e D8.",
          componentId: "ldr1",
          componentType: "photo-resistor",
          targetPins: { "ldr1:pin1": "bb1:d5", "ldr1:pin2": "bb1:d8" },
          hint: "La fotoresistenza cambia valore con la luce."
        },
        {
          step: 4,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D9 e D10.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d9", "led1:cathode": "bb1:d10" },
          hint: "L'anodo (+, gamba lunga) va in D9 e il catodo (−, gamba corta) in D10."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al fotoresistore."
        },
        {
          step: 7,
          text: "Collega un filo GIALLO dal foro A8 al foro A9 (dal fotoresistore all'anodo del LED).",
          wireFrom: "bb1:a8",
          wireTo: "bb1:a9",
          wireColor: "yellow",
          hint: "Niente resistore: l'LDR stesso limita la corrente e protegge il LED quando illuminato."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro A10 al foro bus − superiore (col. 10).",
          wireFrom: "bb1:a10",
          wireTo: "bb1:bus-top-minus-10",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cosa fa un fotoresistore (LDR)?",
          options: ["Cambia la sua resistenza in base alla luce", "Produce luce quando riceve corrente", "Accumula energia come una batteria"],
          correct: 0,
          explanation: "Il fotoresistore cambia resistenza: con tanta luce ha poca resistenza, al buio ha molta resistenza. È come una porta che si apre con il sole!"
        },
        {
          question: "Cosa succede quando copri il fotoresistore con la mano?",
          options: ["Il LED diventa più luminoso", "Il LED si spegne perché la resistenza aumenta", "Non cambia nulla"],
          correct: 1,
          explanation: "Al buio il fotoresistore ha molta resistenza e blocca la corrente, quindi il LED si spegne. È come chiudere un rubinetto!"
        }
      ]
    },
    {
      id: "v1-cap10-esp2",
      title: "Cap. 10 Esp. 2 - LED diverso colore con LDR",
      desc: "Cambia il LED con uno di colore diverso e osserva come cambia il comportamento!",
      chapter: "Capitolo 10 - Cos'è un fotoresistore?",
      difficulty: 2,
      icon: "\u{1F7E2}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "photo-resistor", id: "ldr1" },
        { type: "led", id: "led1", color: "blue" }
      ],
      pinAssignments: {
        "ldr1:pin1": "bb1:d5",
        "ldr1:pin2": "bb1:d8",
        "led1:anode": "bb1:d9",
        "led1:cathode": "bb1:d10"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a6", to: "bb1:a7", color: "yellow" },
        { from: "bb1:a9", to: "bb1:a10", color: "yellow" },
        { from: "bb1:a11", to: "bb1:bus-top-minus-11", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "ldr1": { x: 151.5, y: 43.75 },
        "r1": { x: 170, y: 43.75 },
        "led1": { x: 189, y: 43.75 }
      },
      steps: [
        "Inserisci il fotoresistore (LDR) nella fila d, colonne 5-6",
        "Inserisci il resistore da 220\u03A9 nella fila d, colonne 7-9 (protegge il LED!)",
        "Inserisci il LED blu nella fila d, colonne 10-11",
        "Collega come nell'esperimento 1 del Cap. 10",
        "Muovi il cursore luminosit\u00e0 e confronta con il LED rosso"
      ],
      observe: "Il LED blu si accende con pi\u00f9 luce del rosso! La soglia del blu (~3V) \u00e8 pi\u00f9 alta.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED diverso colore con LDR'. Con un LED blu, serve più luce per accenderlo perché la tensione forward del blu è più alta. Spiega come il colore del LED cambia la soglia di luce necessaria per l'accensione. Il rosso si accende con poca luce, il blu ha bisogno di più luce. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Soglia diversa per LED di colori diversi",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori D5 e D6.",
          componentId: "ldr1",
          componentType: "photo-resistor",
          targetPins: { "ldr1:pin1": "bb1:d5", "ldr1:pin2": "bb1:d6" },
          hint: "La fotoresistenza cambia valore con la luce."
        },
        {
          step: 4,
          text: "Inserisci il resistore da 220Ω nei fori D7 e D9. Protegge il LED dalla troppa corrente!",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:d7", "r1:pin2": "bb1:d9" },
          hint: "Il resistore limita la corrente: anche con tanta luce sull'LDR, il LED non si brucia."
        },
        {
          step: 5,
          text: "Prendi il LED blu dalla palette e posizionalo nei fori D10 e D11.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d10", "led1:cathode": "bb1:d11" },
          hint: "L'anodo (+, gamba lunga) va in D10 e il catodo (−, gamba corta) in D11."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al fotoresistore."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A6 al foro A7 (dal fotoresistore al resistore).",
          wireFrom: "bb1:a6",
          wireTo: "bb1:a7",
          wireColor: "yellow",
          hint: "Questo filo collega l'uscita dell'LDR all'ingresso del resistore di protezione."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A9 al foro A10 (dal resistore al LED).",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a10",
          wireColor: "yellow",
          hint: "Questo filo collega l'uscita del resistore all'anodo del LED."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A11 al foro bus − superiore (col. 11).",
          wireFrom: "bb1:a11",
          wireTo: "bb1:bus-top-minus-11",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché il LED blu ha bisogno di più luce per accendersi rispetto al rosso?",
          options: ["Perché il blu è un colore più freddo", "Perché il LED blu è più grande", "Perché il LED blu richiede una tensione più alta per funzionare"],
          correct: 2,
          explanation: "Ogni colore di LED ha una tensione di soglia diversa. Il blu ha bisogno di circa 3V, il rosso solo di circa 1.8V. Serve quindi più corrente (meno resistenza dall'LDR) per accenderlo!"
        },
        {
          question: "Cosa determina quando il LED si accende in questo circuito?",
          options: ["La temperatura della stanza", "La quantità di luce che colpisce il fotoresistore", "Il colore dei fili collegati"],
          correct: 1,
          explanation: "La luce che colpisce l'LDR ne riduce la resistenza, facendo passare più corrente. Quando la corrente è sufficiente, il LED si accende!"
        }
      ]
    },
    {
      id: "v1-cap10-esp3",
      title: "Cap. 10 Esp. 3 - 3 LDR controllano RGB",
      desc: "Tre fotoresistori controllano i 3 colori del LED RGB: copri con la mano per cambiare colore!",
      chapter: "Capitolo 10 - Cos'è un fotoresistore?",
      difficulty: 3,
      icon: "\u{1F308}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "photo-resistor", id: "ldr1" },
        { type: "photo-resistor", id: "ldr2" },
        { type: "photo-resistor", id: "ldr3" },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "ldr1:pin1": "bb1:d3",
        "ldr1:pin2": "bb1:d4",
        "ldr2:pin1": "bb1:d7",
        "ldr2:pin2": "bb1:d8",
        "ldr3:pin1": "bb1:d11",
        "ldr3:pin2": "bb1:d12",
        "rgb1:red": "bb1:d19",
        "rgb1:common": "bb1:d20",
        "rgb1:green": "bb1:d21",
        "rgb1:blue": "bb1:d22"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-3", to: "bb1:a3", color: "red" },
        { from: "bb1:bus-top-plus-7", to: "bb1:a7", color: "red" },
        { from: "bb1:bus-top-plus-11", to: "bb1:a11", color: "red" },
        { from: "bb1:a4", to: "bb1:a19", color: "orange" },
        { from: "bb1:a8", to: "bb1:a21", color: "green" },
        { from: "bb1:a12", to: "bb1:a22", color: "blue" },
        { from: "bb1:a20", to: "bb1:bus-top-minus-20", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "ldr1": { x: 136.5, y: 43.75 },
        "ldr2": { x: 166.5, y: 43.75 },
        "ldr3": { x: 196.5, y: 43.75 },
        "rgb1": { x: 234, y: 43.75 }
      },
      steps: [
        "Inserisci 3 fotoresistori nella fila d alle colonne 3-4, 7-8 e 11-12",
        "Inserisci il LED RGB nella fila d, colonne 19-22",
        "Collega il + della batteria al pin1 di ogni LDR (d3, d7, d11)",
        "Collega ogni pin2 LDR direttamente al canale RGB: d4\u2192d19 (rosso), d8\u2192d21 (verde), d12\u2192d22 (blu)",
        "Collega il catodo comune del RGB (d20) al \u2212 della batteria",
        "Copri o illumina ogni LDR separatamente per creare colori!"
      ],
      observe: "Ogni LDR controlla un colore! Coprili per spegnere un canale, illuminali per accenderlo. PDF Vol.1 cap.10 ESP.3 specifica solo 3 fotoresistori e 3 fili colorati: niente resistori, l'LDR limita la corrente da solo.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento '3 LDR controllano RGB'. Tre fotoresistori controllano indipendentemente i 3 canali del LED RGB. Per il PDF Vol.1 cap.10 ESPERIMENTO 3 servono SOLO 3 fotoresistori e 3 fili colorati (verbatim 'Tre fotoresistori, Tre fili colorati'): niente resistori, l'LDR stesso limita la corrente. Coprendo o illuminando ogni LDR separatamente si possono creare colori diversi. È come avere 3 finestre: ogni finestra lascia entrare luce per un colore diverso. Ragazzi, provate insieme a creare il giallo, il viola, il bianco. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "3 sensori di luce → 3 canali RGB indipendenti",
      layer: "cielo",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori D3 e D4.",
          componentId: "ldr1",
          componentType: "photo-resistor",
          targetPins: { "ldr1:pin1": "bb1:d3", "ldr1:pin2": "bb1:d4" },
          hint: "Questo LDR controllerà il canale rosso del LED RGB."
        },
        {
          step: 4,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori D7 e D8.",
          componentId: "ldr2",
          componentType: "photo-resistor",
          targetPins: { "ldr2:pin1": "bb1:d7", "ldr2:pin2": "bb1:d8" },
          hint: "Questo LDR controllerà il canale verde del LED RGB."
        },
        {
          step: 5,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori D11 e D12.",
          componentId: "ldr3",
          componentType: "photo-resistor",
          targetPins: { "ldr3:pin1": "bb1:d11", "ldr3:pin2": "bb1:d12" },
          hint: "Questo LDR controllerà il canale blu del LED RGB."
        },
        {
          step: 6,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D19, D20, D21 e D22.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d19", "rgb1:common": "bb1:d20", "rgb1:green": "bb1:d21", "rgb1:blue": "bb1:d22" },
          hint: "I 4 piedini: Rosso in D19, Catodo comune in D20, Verde in D21, Blu in D22."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + (col. 3) al foro A3.",
          wireFrom: "bb1:bus-top-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Alimenta LDR1 (canale rosso)."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + (col. 7) al foro A7.",
          wireFrom: "bb1:bus-top-plus-7",
          wireTo: "bb1:a7",
          wireColor: "red",
          hint: "Alimenta LDR2 (canale verde)."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal foro bus + (col. 11) al foro A11.",
          wireFrom: "bb1:bus-top-plus-11",
          wireTo: "bb1:a11",
          wireColor: "red",
          hint: "Alimenta LDR3 (canale blu)."
        },
        {
          step: 11,
          text: "Collega un filo ARANCIONE dal foro A4 al foro A19 (LDR1 → rosso RGB direct).",
          wireFrom: "bb1:a4",
          wireTo: "bb1:a19",
          wireColor: "orange",
          hint: "Niente resistore: LDR1 alimenta direttamente il canale rosso."
        },
        {
          step: 12,
          text: "Collega un filo VERDE dal foro A8 al foro A21 (LDR2 → verde RGB direct).",
          wireFrom: "bb1:a8",
          wireTo: "bb1:a21",
          wireColor: "green",
          hint: "Niente resistore: LDR2 alimenta direttamente il canale verde."
        },
        {
          step: 13,
          text: "Collega un filo BLU dal foro A12 al foro A22 (LDR3 → blu RGB direct).",
          wireFrom: "bb1:a12",
          wireTo: "bb1:a22",
          wireColor: "blue",
          hint: "Niente resistore: LDR3 alimenta direttamente il canale blu."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A20 al foro bus − superiore (col. 20).",
          wireFrom: "bb1:a20",
          wireTo: "bb1:bus-top-minus-20",
          wireColor: "black",
          hint: "Il catodo comune del LED RGB torna al negativo."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cosa succede quando copri uno solo dei tre fotoresistori?",
          options: ["Si spegne solo il colore controllato da quel fotoresistore", "Si spengono tutti e tre i colori del LED RGB", "Il LED RGB diventa bianco"],
          correct: 0,
          explanation: "Ogni LDR controlla un solo canale del LED RGB in modo indipendente. Coprendo un LDR si spegne solo il suo colore, gli altri restano accesi!"
        },
        {
          question: "Quanti fotoresistori servono per controllare tutti i colori di un LED RGB?",
          options: ["Uno solo, basta ruotarlo", "Due, uno per i colori caldi e uno per i freddi", "Tre, uno per rosso, uno per verde e uno per blu"],
          correct: 2,
          explanation: "Il LED RGB ha 3 canali indipendenti (rosso, verde, blu), quindi servono 3 fotoresistori, uno per ogni colore. Combinandoli si creano tutti i colori!"
        }
      ]
    },
    {
      id: "v1-cap10-esp4",
      title: "Cap. 10 Esp. 4 - LED bianco illumina LDR → LED blu",
      desc: "Accoppiamento ottico: un LED bianco illumina un LDR che accende un LED blu.",
      chapter: "Capitolo 10 - Cos'è un fotoresistore?",
      difficulty: 3,
      icon: "\u{1F526}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "white" },
        { type: "photo-resistor", id: "ldr1" },
        { type: "led", id: "led2", color: "blue" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c5",
        "r1:pin2": "bb1:c12",
        "led1:anode": "bb1:b14",
        "led1:cathode": "bb1:b15",
        "ldr1:pin1": "bb1:h5",
        "ldr1:pin2": "bb1:h6",
        "led2:anode": "bb1:h14",
        "led2:cathode": "bb1:h15"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:bus-bot-plus-5", to: "bb1:j5", color: "red" },
        { from: "bb1:bus-top-plus-1", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "bb1:a12", to: "bb1:a14", color: "orange" },
        { from: "bb1:a15", to: "bb1:bus-top-minus-15", color: "black" },
        { from: "bb1:j6", to: "bb1:j14", color: "yellow" },
        { from: "bb1:j15", to: "bb1:bus-bot-minus-15", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bb1:bus-bot-minus-1", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174, y: 58.75 },
        "led1": { x: 219, y: 28.75 },
        "ldr1": { x: 151.5, y: 83.75 },
        "led2": { x: 219, y: 83.75 }
      },
      steps: [
        "Circuito 1 (sopra): inserisci r1 (470\u03A9) nella fila c, col 5-12",
        "Inserisci il LED bianco nella fila b, col 14-15",
        "Circuito 2 (sotto): inserisci l'LDR nella fila h, col 5-6",
        "Inserisci il LED blu nella fila h, col 14-15",
        "Collega il + della batteria a r1 e al pin1 dell'LDR",
        "Posiziona il LED bianco vicino all'LDR per l'accoppiamento ottico!"
      ],
      observe: "Il LED bianco illumina l'LDR che accende il LED blu! Luce \u2192 sensore \u2192 luce: una catena luminosa!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED bianco illumina LDR, che accende LED blu'. Questo è un accoppiamento ottico: il LED bianco produce luce che colpisce il fotoresistore, che a sua volta accende il LED blu. È come una catena: luce -> sensore -> luce! Spiega che questo principio è usato negli optoisolatori, componenti che separano due circuiti usando la luce. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Accoppiamento ottico, trasmissione luce",
      layer: "cielo",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori C5 e C12.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c5", "r1:pin2": "bb1:c12" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 4,
          text: "Prendi il LED bianco dalla palette e posizionalo nei fori B14 e B15.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:b14", "led1:cathode": "bb1:b15" },
          hint: "L'anodo (+, gamba lunga) va in B14 e il catodo (−, gamba corta) in B15."
        },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        {
          step: 5,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori H5 e H6.",
          componentId: "ldr1",
          componentType: "photo-resistor",
          targetPins: { "ldr1:pin1": "bb1:h5", "ldr1:pin2": "bb1:h6" },
          hint: "La fotoresistenza cambia valore con la luce."
        },
        {
          step: 6,
          text: "Prendi il LED blu dalla palette e posizionalo nei fori H14 e H15.",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:h14", "led2:cathode": "bb1:h15" },
          hint: "L'anodo (+, gamba lunga) va in H14 e il catodo (−, gamba corta) in H15."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + inferiore (col. 5) al foro J5.",
          wireFrom: "bb1:bus-bot-plus-5",
          wireTo: "bb1:j5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 1) al foro bus + inferiore (col. 1).",
          wireFrom: "bb1:bus-top-plus-1",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Questo filo collega i due bus della breadboard."
        },
        {
          step: 11,
          text: "Collega un filo ARANCIONE dal foro A12 al foro A14.",
          wireFrom: "bb1:a12",
          wireTo: "bb1:a14",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro A15 al foro bus − superiore (col. 15).",
          wireFrom: "bb1:a15",
          wireTo: "bb1:bus-top-minus-15",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 13,
          text: "Collega un filo GIALLO dal foro J6 al foro J14.",
          wireFrom: "bb1:j6",
          wireTo: "bb1:j14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro J15 al foro bus − inferiore (col. 15).",
          wireFrom: "bb1:j15",
          wireTo: "bb1:bus-bot-minus-15",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al foro bus − inferiore (col. 1).",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Questo filo collega i due bus della breadboard."
        }
      ],
      quiz: [
        {
          question: "Cos'è l'accoppiamento ottico?",
          options: ["Usare la luce di un componente per controllarne un altro senza fili", "Collegare due LED con un filo", "Mettere due batterie in parallelo"],
          correct: 0,
          explanation: "L'accoppiamento ottico usa la luce come 'ponte' tra due circuiti. Il LED bianco illumina l'LDR che poi controlla il LED blu, senza nessun collegamento elettrico diretto!"
        },
        {
          question: "Qual è il ruolo del fotoresistore in questo circuito?",
          options: ["Produce la luce per il LED blu", "Protegge il LED blu dalla troppa corrente", "Riceve la luce dal LED bianco e la trasforma in un segnale elettrico"],
          correct: 2,
          explanation: "L'LDR è il sensore che riceve la luce dal LED bianco. Quando è illuminato, la sua resistenza diminuisce e lascia passare corrente al LED blu!"
        }
      ]
    },
    {
      id: "v1-cap10-esp5",
      title: "Cap. 10 Esp. 5 - Aggiungi pot per controllare LED bianco",
      desc: "Aggiungi un potenziometro per controllare la luminosità del LED bianco.",
      chapter: "Capitolo 10 - Cos'è un fotoresistore?",
      difficulty: 3,
      icon: "\u{1F39B}\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "white" },
        { type: "photo-resistor", id: "ldr1" },
        { type: "led", id: "led2", color: "blue" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:e2",
        "pot1:signal": "bb1:e3",
        "pot1:gnd": "bb1:e4",
        "r1:pin1": "bb1:c7",
        "r1:pin2": "bb1:c14",
        "led1:anode": "bb1:b16",
        "led1:cathode": "bb1:b17",
        "ldr1:pin1": "bb1:h5",
        "ldr1:pin2": "bb1:h6",
        "led2:anode": "bb1:h14",
        "led2:cathode": "bb1:h15"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:bus-bot-plus-5", to: "bb1:j5", color: "red" },
        { from: "bb1:bus-top-plus-1", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "bb1:a3", to: "bb1:a7", color: "yellow" },
        { from: "bb1:a14", to: "bb1:a16", color: "orange" },
        { from: "bb1:a17", to: "bb1:bus-top-minus-17", color: "black" },
        { from: "bb1:j6", to: "bb1:j14", color: "yellow" },
        { from: "bb1:j15", to: "bb1:bus-bot-minus-15", color: "black" },
        { from: "bb1:a4", to: "bb1:bus-top-minus-4", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bb1:bus-bot-minus-1", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "pot1": { x: 132.75, y: 51.25 },
        "r1": { x: 189, y: 58.75 },
        "led1": { x: 234, y: 28.75 },
        "ldr1": { x: 151.5, y: 83.75 },
        "led2": { x: 219, y: 83.75 }
      },
      steps: [
        "Inserisci il potenziometro nella fila e, colonne 2-3-4",
        "Inserisci r1 (470\u03A9) nella fila c, col 7-14",
        "Inserisci il LED bianco nella fila b, col 16-17",
        "Inserisci l'LDR nella fila h, col 5-6",
        "Inserisci il LED blu nella fila h, col 14-15",
        "Gira il pot per regolare il LED bianco e osserva l'effetto sull'LDR e il LED blu!"
      ],
      observe: "Girando il pot cambi la luce del LED bianco, che cambia l'LDR, che cambia il LED blu. Controllo a catena!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Aggiungi pot per controllare LED bianco'. Il potenziometro controlla la luminosità del LED bianco, che a sua volta illumina l'LDR che controlla il LED blu. È un controllo indiretto a catena: manopola -> LED bianco -> luce -> LDR -> LED blu. Spiega questo concetto di controllo a cascata. È come dire qualcosa a un amico che lo ripete a un altro amico. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Controllo indiretto: pot → LED bianco → LDR → LED blu",
      layer: "cielo",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E2, E3 e E4.",
          componentId: "pot1",
          componentType: "potentiometer",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          targetPins: { "pot1:vcc": "bb1:e2", "pot1:signal": "bb1:e3", "pot1:gnd": "bb1:e4" },
          hint: "I 3 pin: VCC in E2, Signal in E3, GND in E4."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori C7 e C14.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c7", "r1:pin2": "bb1:c14" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED bianco dalla palette e posizionalo nei fori B16 e B17.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:b16", "led1:cathode": "bb1:b17" },
          hint: "L'anodo (+, gamba lunga) va in B16 e il catodo (−, gamba corta) in B17."
        },
        {
          step: 6,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori H5 e H6.",
          componentId: "ldr1",
          componentType: "photo-resistor",
          targetPins: { "ldr1:pin1": "bb1:h5", "ldr1:pin2": "bb1:h6" },
          hint: "La fotoresistenza cambia valore con la luce."
        },
        {
          step: 7,
          text: "Prendi il LED blu dalla palette e posizionalo nei fori H14 e H15.",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:h14", "led2:cathode": "bb1:h15" },
          hint: "L'anodo (+, gamba lunga) va in H14 e il catodo (−, gamba corta) in H15."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal foro bus + inferiore (col. 5) al foro J5.",
          wireFrom: "bb1:bus-bot-plus-5",
          wireTo: "bb1:j5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 1) al foro bus + inferiore (col. 1).",
          wireFrom: "bb1:bus-top-plus-1",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Questo filo collega i due bus della breadboard."
        },
        {
          step: 12,
          text: "Collega un filo GIALLO dal foro A3 al foro A7.",
          wireFrom: "bb1:a3",
          wireTo: "bb1:a7",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 13,
          text: "Collega un filo ARANCIONE dal foro A14 al foro A16.",
          wireFrom: "bb1:a14",
          wireTo: "bb1:a16",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A17 al foro bus − superiore (col. 17).",
          wireFrom: "bb1:a17",
          wireTo: "bb1:bus-top-minus-17",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 15,
          text: "Collega un filo GIALLO dal foro J6 al foro J14.",
          wireFrom: "bb1:j6",
          wireTo: "bb1:j14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro J15 al foro bus − inferiore (col. 15).",
          wireFrom: "bb1:j15",
          wireTo: "bb1:bus-bot-minus-15",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 17,
          text: "Collega un filo NERO dal foro A4 al foro bus − superiore (col. 4).",
          wireFrom: "bb1:a4",
          wireTo: "bb1:bus-top-minus-4",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 19,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al foro bus − inferiore (col. 1).",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Questo filo collega i due bus della breadboard."
        }
      ],
      quiz: [
        {
          question: "Quanti livelli di controllo ci sono in questa catena?",
          options: ["Uno: il potenziometro controlla tutto", "Due: il potenziometro controlla il LED bianco, che controlla l'LDR, che controlla il LED blu", "Tre: batteria, potenziometro e LED"],
          correct: 1,
          explanation: "È una catena a due livelli! Il pot regola la luminosità del LED bianco, e il LED bianco illumina l'LDR che controlla il LED blu. Un controllo indiretto!"
        },
        {
          question: "Cosa succede quando giri il potenziometro al massimo?",
          options: ["Il LED bianco si accende al massimo, illumina l'LDR e il LED blu si accende", "Il LED blu si spegne", "La batteria si scarica subito"],
          correct: 0,
          explanation: "Girando il pot al massimo, il LED bianco brilla forte, l'LDR riceve tanta luce e abbassa la sua resistenza, accendendo il LED blu. È una reazione a catena!"
        }
      ]
    },
    {
      id: "v1-cap10-esp6",
      title: "Cap. 10 Esp. 6 - Aggiungi pulsante al circuito LDR",
      desc: "Aggiungi un pulsante all'esperimento 4: il LED blu si accende con la luce solo quando premi!",
      chapter: "Capitolo 10 - Cos'è un fotoresistore?",
      difficulty: 2,
      icon: "\u{1F518}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "photo-resistor", id: "ldr1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "white" },
        { type: "led", id: "led2", color: "blue" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e2",
        "btn1:pin2": "bb1:f4",
        "r1:pin1": "bb1:d6",
        "r1:pin2": "bb1:d9",
        "led1:anode": "bb1:d10",
        "led1:cathode": "bb1:d11",
        "ldr1:pin1": "bb1:d14",
        "ldr1:pin2": "bb1:d17",
        "led2:anode": "bb1:d18",
        "led2:cathode": "bb1:d19"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:j4", to: "bb1:a7", color: "yellow" },
        { from: "bb1:a8", to: "bb1:a9", color: "orange" },
        { from: "bb1:a11", to: "bb1:a12", color: "orange" },
        { from: "bb1:a13", to: "bb1:bus-top-minus-13", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 140.25, y: 82.5 },
        "ldr1": { x: 166.5, y: 43.75 },
        "r1": { x: 185, y: 43.75 },
        "led1": { x: 204, y: 43.75 },
        "led2": { x: 224, y: 43.75 }
      },
      steps: [
        "Inserisci il pulsante a cavallo della scanalatura (pin1 in e2, pin2 in f4)",
        "Inserisci il fotoresistore (LDR) nella fila d, col 7-8",
        "Inserisci il resistore da 220\u03A9 nella fila d, col 9-11 (protegge il LED!)",
        "Inserisci il LED rosso nella fila d, col 12-13",
        "Collega: batteria \u2192 pulsante \u2192 LDR \u2192 resistore \u2192 LED \u2192 batteria",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "Premi il pulsante E illumina l'LDR: servono entrambe le condizioni!"
      ],
      observe: "Servono DUE condizioni: pulsante premuto E luce sull'LDR. \u00c8 come una porta con 2 serrature! Il resistore da 220\u03A9 protegge il LED.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Aggiungi pulsante al circuito LDR'. Il pulsante e l'LDR sono in serie: entrambi devono 'dire si' per accendere il LED. Il pulsante deve essere premuto E ci deve essere luce sull'LDR. Spiega il concetto di AND logico: servono due condizioni vere contemporaneamente. È come una porta con due serrature: servono entrambe le chiavi. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Pulsante + LDR in serie, doppio controllo",
      layer: "schema",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E2 e F4.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e2", "btn1:pin2": "bb1:f4" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 4,
          text: "Prendi il fotoresistore (LDR) dalla palette e posizionalo nei fori D7 e D8.",
          componentId: "ldr1",
          componentType: "photo-resistor",
          targetPins: { "ldr1:pin1": "bb1:d7", "ldr1:pin2": "bb1:d8" },
          hint: "La fotoresistenza cambia valore con la luce."
        },
        {
          step: 5,
          text: "Inserisci il resistore da 220Ω nei fori D9 e D11. Protegge il LED dalla troppa corrente!",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:d9", "r1:pin2": "bb1:d11" },
          hint: "Il resistore limita la corrente: anche con tanta luce sull'LDR, il LED non si brucia."
        },
        {
          step: 6,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D12 e D13.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d12", "led1:cathode": "bb1:d13" },
          hint: "L'anodo (+, gamba lunga) va in D12 e il catodo (−, gamba corta) in D13."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al pulsante."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro J4 al foro A7 (dal pulsante al fotoresistore).",
          wireFrom: "bb1:j4",
          wireTo: "bb1:a7",
          wireColor: "yellow",
          hint: "Questo filo collega il pulsante al fotoresistore."
        },
        {
          step: 10,
          text: "Collega un filo ARANCIONE dal foro A8 al foro A9 (dal fotoresistore al resistore).",
          wireFrom: "bb1:a8",
          wireTo: "bb1:a9",
          wireColor: "orange",
          hint: "Questo filo collega l'uscita dell'LDR all'ingresso del resistore di protezione."
        },
        {
          step: 11,
          text: "Collega un filo ARANCIONE dal foro A11 al foro A12 (dal resistore al LED).",
          wireFrom: "bb1:a11",
          wireTo: "bb1:a12",
          wireColor: "orange",
          hint: "Questo filo collega l'uscita del resistore all'anodo del LED."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro A13 al foro bus − superiore (col. 13).",
          wireFrom: "bb1:a13",
          wireTo: "bb1:bus-top-minus-13",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Quando si accende il LED in questo circuito?",
          options: ["Solo quando c'è luce sull'LDR", "Solo quando il pulsante è premuto", "Solo quando ENTRAMBI il pulsante è premuto E c'è luce sull'LDR"],
          correct: 2,
          explanation: "Il pulsante e l'LDR sono in serie: servono entrambi per far passare la corrente. Se manca una delle due condizioni, il circuito è aperto e il LED resta spento!"
        },
        {
          question: "Che tipo di logica crea il pulsante in serie con il fotoresistore?",
          options: ["Logica OR: basta una condizione", "Logica AND: servono entrambe le condizioni", "Logica NOT: inverte il segnale"],
          correct: 1,
          explanation: "In serie i componenti creano una logica AND: il pulsante DEVE essere premuto E l'LDR DEVE ricevere luce. Entrambe le condizioni devono essere vere!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 11 — Cos'è un cicalino? (2 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap11-esp1",
      title: "Cap. 11 Esp. 1 - Buzzer suona continuo",
      desc: "Collega il buzzer polarizzato direttamente alla batteria: suona!",
      chapter: "Capitolo 11 - Cos'è un cicalino?",
      difficulty: 1,
      icon: "\u{1F50A}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "buzzer-piezo", id: "buz1" }
      ],
      pinAssignments: {
        "buz1:positive": "bb1:bus-bot-plus-27",
        "buz1:negative": "bb1:bus-top-minus-27"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "bat1:negative", to: "bb1:bus-top-minus-1", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bb1:bus-top-minus-27", color: "black" },
        { from: "bb1:bus-bot-plus-1", to: "bb1:bus-bot-plus-27", color: "red" },
        { from: "bb1:bus-bot-plus-27", to: "buz1:positive", color: "red" },
        { from: "bb1:bus-top-minus-27", to: "buz1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "buz1": { x: 350, y: 88 }
      },
      steps: [
        "Collega il positivo e il negativo della batteria ai bus + e − della breadboard",
        "Collega il bus + inferiore da sinistra a destra con un filo rosso",
        "Collega il bus − superiore da sinistra a destra con un filo nero",
        "Collega il buzzer ai bus di destra: rosso su + e nero su −"
      ],
      observe: "Il buzzer emette un suono continuo appena colleghi i due poli correttamente.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Buzzer suona continuo'. Il buzzer piezoelettrico trasforma l'elettricità in suono! Ha una polarità come il LED: il filo lungo va al positivo. Spiega come funziona un buzzer: dentro c'è un cristallo che vibra quando riceve corrente, producendo suono. È come un mini altoparlante. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Buzzer polarizzato, polarità, suono continuo",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Posiziona il buzzer a destra della breadboard (fuori dalla zona fori).",
          componentId: "buz1",
          componentType: "buzzer-piezo",
          targetPins: { "buz1:positive": "bb1:bus-bot-plus-27", "buz1:negative": "bb1:bus-top-minus-27" },
          hint: "Nel libro il cicalino è rappresentato esterno alla breadboard."
        },
        {
          step: 4,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + inferiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Alimentazione positiva della breadboard."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal polo − della batteria al foro bus − superiore (col. 1).",
          wireFrom: "bat1:negative",
          wireTo: "bb1:bus-top-minus-1",
          wireColor: "black",
          hint: "Alimentazione negativa della breadboard."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO lungo tra bus + inferiore sinistro e bus + inferiore destro.",
          wireFrom: "bb1:bus-bot-plus-1",
          wireTo: "bb1:bus-bot-plus-27",
          wireColor: "red",
          hint: "Ponte del bus positivo come da figura."
        },
        {
          step: 7,
          text: "Collega un filo NERO lungo tra bus − superiore sinistro e bus − superiore destro.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bb1:bus-top-minus-27",
          wireColor: "black",
          hint: "Ponte del bus negativo come da figura."
        },
        {
          step: 8,
          text: "Collega il buzzer: bus + destro al pin positivo e bus − destro al pin negativo.",
          wireFrom: "bb1:bus-bot-plus-27",
          wireTo: "buz1:positive",
          wireColor: "red",
          hint: "Se inverti polarità il cicalino non suona correttamente."
        },
        {
          step: 9,
          text: "Completa il secondo filo del buzzer verso il bus − destro.",
          wireFrom: "bb1:bus-top-minus-27",
          wireTo: "buz1:negative",
          wireColor: "black",
          hint: "Circuito continuo: il buzzer suona."
        }
      ],
      quiz: [
        {
          question: "Come produce il suono un buzzer piezoelettrico?",
          options: ["Con un piccolo altoparlante interno", "Riscaldando l'aria intorno", "Con un cristallo che vibra quando riceve corrente elettrica"],
          correct: 2,
          explanation: "Dentro il buzzer c'è un cristallo piezoelettrico che vibra quando la corrente lo attraversa. Queste vibrazioni creano onde sonore che noi sentiamo come un suono!"
        },
        {
          question: "Il buzzer ha una polarità da rispettare?",
          options: ["No, si può collegare in qualsiasi verso", "Sì, ha un polo positivo e uno negativo", "Solo se si usa con Arduino"],
          correct: 1,
          explanation: "Sì, il buzzer è polarizzato! Ha un piedino + (positivo) e uno − (negativo). Se lo colleghi al contrario, non funziona. Cerca il segno + sul buzzer!"
        }
      ]
    },
    {
      id: "v1-cap11-esp2",
      title: "Cap. 11 Esp. 2 - Campanello con pulsante",
      desc: "Aggiungi un pulsante: suona solo quando premi! Come un campanello.",
      chapter: "Capitolo 11 - Cos'è un cicalino?",
      difficulty: 1,
      icon: "\u{1F514}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "buzzer-piezo", id: "buz1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e14",
        "btn1:pin2": "bb1:f16"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "bat1:negative", to: "bb1:bus-top-minus-1", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bb1:bus-top-minus-27", color: "black" },
        { from: "bb1:bus-bot-plus-1", to: "bb1:bus-bot-plus-27", color: "red" },
        { from: "bb1:bus-bot-plus-24", to: "buz1:positive", color: "red" },
        { from: "buz1:negative", to: "bb1:j16", color: "black" },
        { from: "bb1:bus-top-minus-14", to: "bb1:e14", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 230.25, y: 81.25 },
        "buz1": { x: 350, y: 88 }
      },
      steps: [
        "Parti dalla base dell'esperimento 1 (bus + e bus − ponticellati)",
        "Inserisci il pulsante a cavallo della scanalatura (E14/F16)",
        "Collega il buzzer a destra: + al bus rosso destro e − alla colonna 16",
        "Collega la colonna 14 al bus − destro",
        "Premi il pulsante: suona come un campanello!"
      ],
      observe: "Premi e suona, rilascia e smette! \u00c8 esattamente come funziona un campanello di casa.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Campanello con pulsante'. Il pulsante controlla il buzzer: premi e suona, rilascia e smette. È esattamente come funziona un campanello di casa! Spiega che è lo stesso principio del LED con pulsante, ma ora invece della luce abbiamo il suono. Il circuito è aperto/chiuso come prima. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Pulsante + buzzer = campanello",
      layer: "terra",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E14 e F16.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e14", "btn1:pin2": "bb1:f16" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 4,
          text: "Posiziona il buzzer a destra della breadboard (fuori dalla zona fori).",
          componentId: "buz1",
          componentType: "buzzer-piezo",
          hint: "Nel libro il cicalino è rappresentato esterno alla breadboard."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + inferiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal polo − della batteria al foro bus − superiore (col. 1).",
          wireFrom: "bat1:negative",
          wireTo: "bb1:bus-top-minus-1",
          wireColor: "black",
          hint: "Alimentazione negativa della breadboard."
        },
        {
          step: 7,
          text: "Collega il ponte rosso del bus + inferiore da col.1 a col.27.",
          wireFrom: "bb1:bus-bot-plus-1",
          wireTo: "bb1:bus-bot-plus-27",
          wireColor: "red",
          hint: "Replica il collegamento lungo mostrato nel libro."
        },
        {
          step: 8,
          text: "Collega il ponte nero del bus − superiore da col.1 a col.27.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bb1:bus-top-minus-27",
          wireColor: "black",
          hint: "Porta il negativo verso il lato destro della breadboard."
        },
        {
          step: 9,
          text: "Collega il bus + destro al pin positivo del buzzer.",
          wireFrom: "bb1:bus-bot-plus-24",
          wireTo: "buz1:positive",
          wireColor: "red",
          hint: "Ingresso positivo del cicalino."
        },
        {
          step: 10,
          text: "Collega il pin negativo del buzzer alla colonna 16.",
          wireFrom: "buz1:negative",
          wireTo: "bb1:j16",
          wireColor: "black",
          hint: "Il ritorno passa dal pulsante."
        },
        {
          step: 11,
          text: "Collega la colonna 14 al bus −: il buzzer suona solo premendo il pulsante.",
          wireFrom: "bb1:bus-top-minus-14",
          wireTo: "bb1:e14",
          wireColor: "black",
          hint: "Con pulsante rilasciato il circuito resta aperto."
        }
      ],
      quiz: [
        {
          question: "Cosa simula questo circuito nella vita reale?",
          options: ["Un campanello: suona solo quando premi il pulsante", "Un allarme antifurto", "Una radio che trasmette suoni"],
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          correct: 0,
          explanation: "È proprio un campanello! Quando premi il pulsante, il circuito si chiude e il buzzer suona. Quando rilasci, il circuito si apre e il suono si ferma!"
        },
        {
          question: "Qual è la somiglianza tra questo circuito e quello con LED + pulsante?",
          options: ["Non hanno nulla in comune", "Usano entrambi un fotoresistore", "In entrambi, il pulsante controlla l'accensione di un componente"],
          correct: 2,
          explanation: "La struttura è identica! Il pulsante è l'interruttore in entrambi i circuiti. Cambia solo il componente controllato: nel primo il LED (luce), qui il buzzer (suono)!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 12 — L'interruttore magnetico (4 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap12-esp1",
      title: "Cap. 12 Esp. 1 - LED con reed switch",
      desc: "Avvicina il magnete al reed switch e il LED si accende! Come un sensore segreto.",
      chapter: "Capitolo 12 - L'interruttore magnetico",
      difficulty: 2,
      icon: "\u{1F9F2}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "reed-switch", id: "reed1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "reed1:pin1": "bb1:c5",
        "reed1:pin2": "bb1:c11",
        "r1:pin1": "bb1:e14",
        "r1:pin2": "bb1:e21",
        "led1:anode": "bb1:d21",
        "led1:cathode": "bb1:d22"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a11", to: "bb1:a14", color: "yellow" },
        { from: "bb1:a22", to: "bb1:bus-top-minus-22", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "reed1": { x: 170.25, y: 58.75 },
        "r1": { x: 241.5, y: 73.75 },
        "led1": { x: 271.5, y: 43.75 }
      },
      steps: [
        "Inserisci il reed switch nella fila c, col 5-11 (attraversa molte colonne!)",
        "Inserisci il resistore da 470\u03A9 nella fila e, col 14-21",
        "Inserisci il LED rosso nella fila d, col 21-22",
        "Collega il bus + alla colonna 5 (pin1 del reed)",
        "Collega la colonna 11 alla colonna 14 (reed al resistore)",
        "Avvicina il magnete al reed switch per accendere il LED!"
      ],
      observe: "Avvicina il magnete: il LED si accende! Il reed switch \u00e8 un interruttore magnetico invisibile.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED con reed switch'. Il reed switch è un interruttore magico che si chiude quando un magnete si avvicina! Dentro ci sono due lamelle metalliche che si toccano con il campo magnetico. Spiega come funziona: è come un ponte levatoio che si abbassa quando passa un cavaliere con un'armatura magnetica. Usato nei sensori di porte e finestre. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Reed switch, campo magnetico, interruttore",
      layer: "schema",
      note: "Nel simulatore: clicca il magnete per avvicinarlo/allontanarlo",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il reed switch dalla palette e posizionalo nei fori C5 e C11.",
          componentId: "reed1",
          componentType: "reed-switch",
          targetPins: { "reed1:pin1": "bb1:c5", "reed1:pin2": "bb1:c11" },
          hint: "Il reed switch si chiude con il magnete. Come un interruttore invisibile!"
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E14 e E21.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e14", "r1:pin2": "bb1:e21" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D21 e D22.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d21", "led1:cathode": "bb1:d22" },
          hint: "L'anodo (+, gamba lunga) va in D21 e il catodo (−, gamba corta) in D22."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A11 al foro A14.",
          wireFrom: "bb1:a11",
          wireTo: "bb1:a14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A22 al foro bus − superiore (col. 22).",
          wireFrom: "bb1:a22",
          wireTo: "bb1:bus-top-minus-22",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cos'è un reed switch?",
          options: ["Un interruttore che si chiude quando un magnete si avvicina", "Un sensore di temperatura", "Un tipo di resistore variabile"],
          correct: 0,
          explanation: "Il reed switch contiene due lamelle metalliche in un tubicino di vetro. Quando avvicini un magnete, le lamelle si attraggono e chiudono il circuito. È un interruttore invisibile!"
        },
        {
          question: "Cosa attiva un reed switch?",
          options: ["La luce intensa", "La pressione delle dita", "Un campo magnetico (magnete)"],
          correct: 2,
          explanation: "Il reed switch risponde solo ai campi magnetici! Avvicinando un magnete, le lamelle interne si toccano e chiudono il circuito. Niente magnete, niente contatto!"
        }
      ]
    },
    {
      id: "v1-cap12-esp2",
      title: "Cap. 12 Esp. 2 - Cambia luminosità con magnete",
      desc: "Usa resistori diversi per cambiare la luminosità quando il magnete è vicino.",
      chapter: "Capitolo 12 - L'interruttore magnetico",
      difficulty: 2,
      icon: "\u{1F9F2}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "reed-switch", id: "reed1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "reed1:pin1": "bb1:c5",
        "reed1:pin2": "bb1:c11",
        "r1:pin1": "bb1:e14",
        "r1:pin2": "bb1:e21",
        "led1:anode": "bb1:d21",
        "led1:cathode": "bb1:d22"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a11", to: "bb1:a14", color: "yellow" },
        { from: "bb1:a22", to: "bb1:bus-top-minus-22", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "reed1": { x: 170.25, y: 58.75 },
        "r1": { x: 241.5, y: 73.75 },
        "led1": { x: 271.5, y: 43.75 }
      },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      steps: [
        "Ripeti il circuito dell'esperimento 1 con reed switch, resistore e LED",
        "Avvicina il magnete per chiudere il contatto del reed switch",
        "Sperimenta diversi valori di resistore per aumentare o ridurre la luminosità",
        "Confronta l'intensità del LED tra un valore e l'altro"
      ],
      observe: "Il magnete accende il LED e il valore del resistore ne modifica la luminosità.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Cambia luminosita con magnete'. Il circuito è uguale al precedente con reed switch: il magnete apre/chiude il passaggio di corrente. La novità è sperimentare il valore del resistore per regolare la luce del LED. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Reed switch + resistori diversi",
      layer: "schema",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il reed switch dalla palette e posizionalo nei fori C5 e C11.",
          componentId: "reed1",
          componentType: "reed-switch",
          targetPins: { "reed1:pin1": "bb1:c5", "reed1:pin2": "bb1:c11" },
          hint: "Il reed switch si chiude con il magnete. Come un interruttore invisibile!"
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E14 e E21.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e14", "r1:pin2": "bb1:e21" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D21 e D22.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d21", "led1:cathode": "bb1:d22" },
          hint: "L'anodo (+, gamba lunga) va in D21 e il catodo (−, gamba corta) in D22."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A11 al foro A14.",
          wireFrom: "bb1:a11",
          wireTo: "bb1:a14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A22 al foro bus − superiore (col. 22).",
          wireFrom: "bb1:a22",
          wireTo: "bb1:bus-top-minus-22",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Come influisce il valore del resistore sulla luminosità quando il reed switch è attivato?",
          options: ["Un resistore più grande rende il LED più luminoso", "Il resistore non influisce sulla luminosità", "Un resistore più piccolo lascia passare più corrente e il LED è più luminoso"],
          correct: 2,
          explanation: "Resistenza bassa = più corrente = LED più luminoso. Resistenza alta = meno corrente = LED meno luminoso. Il resistore controlla quanta corrente arriva al LED!"
        },
        {
          question: "Cosa hanno in comune il reed switch e il pulsante?",
          options: ["Nulla, funzionano in modo completamente diverso", "Entrambi sono interruttori che aprono e chiudono il circuito", "Entrambi usano un magnete"],
          correct: 1,
          explanation: "Sia il reed switch che il pulsante sono interruttori! La differenza è come si attivano: il pulsante con il dito, il reed switch con un magnete. Ma il risultato è lo stesso: aprire o chiudere il circuito."
        }
      ]
    },
    {
      id: "v1-cap12-esp3",
      title: "Cap. 12 Esp. 3 - Sfida: RGB + reed switch",
      desc: "Sfida aperta: combina il reed switch con il LED RGB!",
      chapter: "Capitolo 12 - L'interruttore magnetico",
      difficulty: 3,
      icon: "\u{1F3C6}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "reed-switch", id: "reed1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "reed1:pin1": "bb1:c5",
        "reed1:pin2": "bb1:c11",
        "r1:pin1": "bb1:e14",
        "r1:pin2": "bb1:e21",
        "rgb1:red": "bb1:d24",
        "rgb1:common": "bb1:d25",
        "rgb1:green": "bb1:d26",
        "rgb1:blue": "bb1:d27"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a11", to: "bb1:a14", color: "yellow" },
        { from: "bb1:a21", to: "bb1:a24", color: "orange" },
        { from: "bb1:a25", to: "bb1:bus-top-minus-25", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "reed1": { x: 170.25, y: 58.75 },
        "r1": { x: 241.5, y: 73.75 },
        "rgb1": { x: 301.5, y: 43.75 }
      },
      steps: [
        "Inserisci il reed switch nella fila c, col 5-11",
        "Inserisci il resistore da 470\u03A9 nella fila e, col 14-21",
        "Inserisci il LED RGB nella fila d, col 24-27",
        "Collega il reed \u2192 resistore \u2192 pin rosso del RGB",
        "Collega il catodo comune al \u2212 della batteria",
        "Sfida: aggiungi altri resistori per accendere pi\u00f9 canali!"
      ],
      observe: "Il magnete accende il canale rosso del RGB! Riesci a farlo diventare bianco aggiungendo circuiti per verde e blu?",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Sfida: RGB + reed switch'. Il reed switch accende il canale rosso del LED RGB quando il magnete è vicino. La sfida è espandere il circuito per accendere più canali o creare colori diversi con il magnete. Aiuta il docente a far ragionare i ragazzi su come pensare: come si possono aggiungere resistori per accendere anche verde e blu? Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sfida: reed switch + RGB LED",
      layer: "cielo",
      note: "Sfida aperta: progetta il circuito completo!",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il reed switch dalla palette e posizionalo nei fori C5 e C11.",
          componentId: "reed1",
          componentType: "reed-switch",
          targetPins: { "reed1:pin1": "bb1:c5", "reed1:pin2": "bb1:c11" },
          hint: "Il reed switch si chiude con il magnete. Come un interruttore invisibile!"
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E14 e E21.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e14", "r1:pin2": "bb1:e21" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D24, D25, D26 e D27.",
          componentId: "rgb1",
          componentType: "rgb-led",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          targetPins: { "rgb1:red": "bb1:d24", "rgb1:common": "bb1:d25", "rgb1:green": "bb1:d26", "rgb1:blue": "bb1:d27" },
          hint: "I 4 piedini: Rosso in D24, Catodo comune in D25, Verde in D26, Blu in D27."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A11 al foro A14.",
          wireFrom: "bb1:a11",
          wireTo: "bb1:a14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo ARANCIONE dal foro A21 al foro A24.",
          wireFrom: "bb1:a21",
          wireTo: "bb1:a24",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A25 al foro bus − superiore (col. 25).",
          wireFrom: "bb1:a25",
          wireTo: "bb1:bus-top-minus-25",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Che vantaggio ha un reed switch rispetto a un pulsante?",
          options: ["Può essere attivato a distanza senza toccarlo, attraverso il magnete", "Costa meno", "Funziona solo con LED RGB"],
          correct: 0,
          explanation: "Il reed switch si attiva avvicinando un magnete, senza contatto fisico! Perfetto per sensori nascosti: basta passare un magnete vicino, anche attraverso una parete sottile!"
        },
        {
          question: "Si possono attivare più canali RGB con un solo reed switch?",
          options: ["No, serve un reed switch per ogni colore", "Sì, se il reed switch è collegato prima della divisione ai tre canali", "Solo con Arduino"],
          correct: 1,
          explanation: "Se il reed switch è collegato nel punto giusto del circuito (prima della divisione ai 3 canali RGB), un solo interruttore magnetico può controllare tutti i colori insieme!"
        }
      ]
    },
    {
      id: "v1-cap12-esp4",
      title: "Cap. 12 Esp. 4 - Sfida: pot + RGB + reed switch",
      desc: "Sfida aperta: integra potenziometro, RGB e reed switch in un unico circuito!",
      chapter: "Capitolo 12 - L'interruttore magnetico",
      difficulty: 3,
      icon: "\u{1F3C6}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "reed-switch", id: "reed1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "rgb-led", id: "rgb1" }
      ],
      pinAssignments: {
        "reed1:pin1": "bb1:c3",
        "reed1:pin2": "bb1:c9",
        "pot1:vcc": "bb1:e12",
        "pot1:signal": "bb1:e13",
        "pot1:gnd": "bb1:e14",
        "r1:pin1": "bb1:e17",
        "r1:pin2": "bb1:e24",
        "rgb1:red": "bb1:d27",
        "rgb1:common": "bb1:d28",
        "rgb1:green": "bb1:d29",
        "rgb1:blue": "bb1:d30"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-3", to: "bb1:a3", color: "red" },
        { from: "bb1:a9", to: "bb1:a12", color: "yellow" },
        { from: "bb1:a13", to: "bb1:a17", color: "green" },
        { from: "bb1:a24", to: "bb1:a27", color: "orange" },
        { from: "bb1:a14", to: "bb1:bus-top-minus-14", color: "black" },
        { from: "bb1:a28", to: "bb1:bus-top-minus-28", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "reed1": { x: 155.25, y: 58.75 },
        "pot1": { x: 207.75, y: 51.25 },
        "r1": { x: 264, y: 73.75 },
        "rgb1": { x: 324, y: 43.75 }
      },
      steps: [
        "Inserisci il reed switch nella fila c, col 3-9",
        "Inserisci il potenziometro nella fila e, col 12-13-14",
        "Inserisci il resistore da 470\u03A9 nella fila e, col 17-24",
        "Inserisci il LED RGB nella fila d, col 27-30",
        "Collega: batteria \u2192 reed \u2192 pot \u2192 resistore \u2192 RGB",
        "Il magnete accende il circuito, il pot regola la luminosit\u00e0!"
      ],
      observe: "Tre livelli di controllo: magnete (ON/OFF) + manopola (luminosit\u00e0) + colore RGB. Il circuito pi\u00f9 complesso finora!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Sfida: pot + RGB + reed switch'. Questo è il circuito più complesso finora: il magnete accende il circuito (reed switch), il potenziometro regola la luminosità, e il LED RGB mostra il colore. È una catena di controllo con 3 livelli! La sfida è pensare a come aggiungere più canali. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Sfida: integrazione completa tutti i componenti",
      layer: "cielo",
      note: "Sfida finale del capitolo!",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il reed switch dalla palette e posizionalo nei fori C3 e C9.",
          componentId: "reed1",
          componentType: "reed-switch",
          targetPins: { "reed1:pin1": "bb1:c3", "reed1:pin2": "bb1:c9" },
          hint: "Il reed switch si chiude con il magnete. Come un interruttore invisibile!"
        },
        {
          step: 4,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E12, E13 e E14.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e12", "pot1:signal": "bb1:e13", "pot1:gnd": "bb1:e14" },
          hint: "I 3 pin: VCC in E12, Signal in E13, GND in E14."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E17 e E24.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e17", "r1:pin2": "bb1:e24" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D27, D28, D29 e D30.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d27", "rgb1:common": "bb1:d28", "rgb1:green": "bb1:d29", "rgb1:blue": "bb1:d30" },
          hint: "I 4 piedini: Rosso in D27, Catodo comune in D28, Verde in D29, Blu in D30."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 3) al foro A3.",
          wireFrom: "bb1:bus-top-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A9 al foro A12.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a12",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 10,
          text: "Collega un filo VERDE dal foro A13 al foro A17.",
          wireFrom: "bb1:a13",
          wireTo: "bb1:a17",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo ARANCIONE dal foro A24 al foro A27.",
          wireFrom: "bb1:a24",
          wireTo: "bb1:a27",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro A14 al foro bus − superiore (col. 14).",
          wireFrom: "bb1:a14",
          wireTo: "bb1:bus-top-minus-14",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro A28 al foro bus − superiore (col. 28).",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-top-minus-28",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Quanti livelli di controllo ha questo circuito?",
          options: ["Uno: solo il magnete", "Due: magnete e potenziometro", "Tre: magnete per accendere, potenziometro per regolare e LED RGB per il colore"],
          correct: 2,
          explanation: "Questo circuito ha tre livelli! Il magnete (reed switch) accende o spegne tutto, il potenziometro regola l'intensità, e il LED RGB produce il colore. È il circuito più complesso del capitolo!"
        },
        {
          question: "Cosa succede se il magnete è lontano dal reed switch?",
          options: ["Il LED RGB si accende lo stesso", "Il circuito è aperto e nulla funziona, anche se giri il potenziometro", "Il potenziometro smette di funzionare"],
          correct: 1,
          explanation: "Senza magnete, il reed switch resta aperto e blocca tutta la corrente. Il potenziometro non può fare nulla perché il circuito è interrotto. Il magnete è la 'chiave' del circuito!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 13 — Cos'è l'elettropongo? (2 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v1-cap13-esp1",
      title: "Cap. 13 Esp. 1 - LED nell'elettropongo",
      desc: "Primo circuito con plastilina conduttiva: batteria e LED senza breadboard.",
      chapter: "Capitolo 13 - Cos'è l'elettropongo?",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede pasta conduttiva (elettropongo) - solo kit fisico",
      icon: "\u26A0\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "led", id: "led1", color: "white" }
      ],
      pinAssignments: {
        "led1:anode": "bat1:positive",
        "led1:cathode": "bat1:negative"
      },
      connections: [
        { from: "bat1:positive", to: "led1:anode", color: "red" },
        { from: "led1:cathode", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 70, y: 80 },
        "led1": { x: 280, y: 95 }
      },
      steps: [
        "Forma due strisce di elettropongo separate",
        "Inserisci il LED con ogni piedino in una striscia diversa",
        "Collega il positivo della batteria alla striscia dell'anodo",
        "Collega il negativo alla striscia del catodo"
      ],
      observe: "Il LED si accende: l'elettropongo conduce corrente e chiude il circuito.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'LED nell'elettropongo'. In questo circuito non c'è breadboard: l'elettropongo sostituisce i fili e collega direttamente batteria e LED. Spiega che la plastilina conduttiva contiene materiali che lasciano passare la corrente. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Conducibilità dell'elettropongo",
      layer: "terra",
      note: "Esperimento senza breadboard.",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V a sinistra della breadboard",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria alimenta il circuito."
        },
        {
          step: 2,
          text: "Posiziona il LED (anodo e catodo) separando bene i due piedini",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bat1:positive", "led1:cathode": "bat1:negative" },
          hint: "Anodo = piedino lungo, catodo = piedino corto."
        },
        {
          step: 3,
          text: "Collega il polo positivo della batteria all'anodo del LED",
          wireFrom: "bat1:positive",
          wireTo: "led1:anode",
          wireColor: "red",
          hint: "Questa connessione rappresenta una striscia di elettropongo."
        },
        {
          step: 4,
          text: "Collega il catodo del LED al polo negativo della batteria",
          wireFrom: "led1:cathode",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Seconda striscia di elettropongo: circuito chiuso."
        }
      ],
      quiz: [
        {
          question: "In questo esperimento la breadboard è necessaria?",
          options: ["No, l'elettropongo fa da collegamento", "Sì, sempre", "Solo con LED blu"],
          correct: 0,
          explanation: "Le strisce di elettropongo possono collegare direttamente i componenti."
        },
        {
          question: "Perché il LED si accende?",
          options: ["Perché il circuito è chiuso", "Perché il LED è bianco", "Perché la batteria è nuova"],
          correct: 0,
          explanation: "La corrente parte dal +, passa nel LED e torna al −: circuito chiuso."
        }
      ]
    },

    {
      id: "v1-cap13-esp2",
      title: "Cap. 13 Esp. 2 - Circuiti artistici con plastilina",
      desc: "Usa l'elettropongo per creare forme e accendere più LED dello stesso colore.",
      chapter: "Capitolo 13 - Cos'è l'elettropongo?",
      difficulty: 2,
      simulable: false,
      simulableReason: "Richiede pasta conduttiva (elettropongo) - solo kit fisico",
      icon: "\u26A0\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "led", id: "led1", color: "white" },
        { type: "led", id: "led2", color: "white" },
        { type: "led", id: "led3", color: "white" }
      ],
      pinAssignments: {
        "led1:anode": "bat1:positive",
        "led1:cathode": "bat1:negative",
        "led2:anode": "bat1:positive",
        "led2:cathode": "bat1:negative",
        "led3:anode": "bat1:positive",
        "led3:cathode": "bat1:negative"
      },
      connections: [
        { from: "bat1:positive", to: "led1:anode", color: "red" },
        { from: "bat1:positive", to: "led2:anode", color: "red" },
        { from: "bat1:positive", to: "led3:anode", color: "red" },
        { from: "led1:cathode", to: "bat1:negative", color: "black" },
        { from: "led2:cathode", to: "bat1:negative", color: "black" },
        { from: "led3:cathode", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 60, y: 95 },
        "led1": { x: 255, y: 70 },
        "led2": { x: 300, y: 100 },
        "led3": { x: 345, y: 130 }
      },
      steps: [
        "Crea una zona positiva e una zona negativa con l'elettropongo",
        "Inserisci più LED (meglio dello stesso colore) nelle due zone",
        "Collega la batteria alla zona positiva e alla zona negativa",
        "Sperimenta forme artistiche mantenendo separate le due polarità"
      ],
      observe: "Più LED si accendono insieme: il circuito artistico in elettropongo distribuisce la corrente in parallelo.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Circuiti artistici con plastilina'. Qui i LED sono inseriti in una composizione creativa con elettropongo, mantenendo una zona positiva e una negativa. Spiega in modo semplice l'idea del collegamento in parallelo e l'importanza di non unire direttamente + e −. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Creatività con circuiti in parallelo",
      layer: "terra",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      note: "Circuito creativo senza breadboard.",
      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V a sinistra della breadboard",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "Definisce la polarità del circuito artistico."
        },
        {
          step: 2,
          text: "Posiziona il primo LED bianco nella composizione",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bat1:positive", "led1:cathode": "bat1:negative" },
          hint: "Mantieni separati anodo e catodo."
        },
        {
          step: 3,
          text: "Posiziona il secondo LED bianco nella composizione",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bat1:positive", "led2:cathode": "bat1:negative" },
          hint: "Mantieni separati anodo e catodo."
        },
        {
          step: 4,
          text: "Posiziona il terzo LED bianco nella composizione",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bat1:positive", "led3:cathode": "bat1:negative" },
          hint: "Mantieni separati anodo e catodo."
        },
        {
          step: 5,
          text: "Collega il polo positivo all'anodo del primo LED",
          wireFrom: "bat1:positive",
          wireTo: "led1:anode",
          wireColor: "red",
          hint: "Tutti gli anodi vanno nella stessa zona positiva."
        },
        {
          step: 6,
          text: "Collega il polo positivo all'anodo del secondo LED",
          wireFrom: "bat1:positive",
          wireTo: "led2:anode",
          wireColor: "red",
          hint: "Secondo ramo in parallelo."
        },
        {
          step: 7,
          text: "Collega il polo positivo all'anodo del terzo LED",
          wireFrom: "bat1:positive",
          wireTo: "led3:anode",
          wireColor: "red",
          hint: "Terzo ramo in parallelo."
        },
        {
          step: 8,
          text: "Collega il catodo del primo LED al polo negativo",
          wireFrom: "led1:cathode",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Ritorno al negativo."
        },
        {
          step: 9,
          text: "Collega il catodo del secondo LED al polo negativo",
          wireFrom: "led2:cathode",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Secondo ritorno al negativo."
        },
        {
          step: 10,
          text: "Collega il catodo del terzo LED al polo negativo",
          wireFrom: "led3:cathode",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Circuito artistico completo in parallelo."
        }
      ],
      quiz: [
        {
          question: "Nell'elettropongo creativo, cosa devi tenere separato?",
          options: ["Zona positiva e zona negativa", "I LED per colore", "La batteria dal LED"],
          correct: 0,
          explanation: "Se + e − si toccano direttamente crei un cortocircuito."
        },
        {
          question: "Come sono collegati i LED in questo esperimento?",
          options: ["In parallelo", "In serie", "Non sono collegati"],
          correct: 0,
          explanation: "Ogni LED ha il suo percorso tra la stessa zona + e la stessa zona −."
        }
      ]
    },

    {
      id: "v1-cap14-esp1",
      title: "Cap. 14 - Il Primo Robot ELAB",
      desc: "Il progetto finale! Un robot con occhi verdi LED, mano RGB colorata e sensore magnetico.",
      chapter: "Capitolo 14 - Costruiamo il nostro primo robot",
      difficulty: 3,
      simulable: false,
      simulableReason: "Richiede kit robot fisico",
      icon: "\u{1F916}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-full", id: "bb1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "potentiometer", id: "pot2", value: 10000 },
        { type: "potentiometer", id: "pot3", value: 10000 },
        { type: "resistor", id: "r1", value: 220 },
        { type: "resistor", id: "r2", value: 220 },
        { type: "resistor", id: "r3", value: 220 },
        { type: "resistor", id: "r4", value: 220 },
        { type: "led", id: "led1", color: "green" },
        { type: "led", id: "led2", color: "green" },
        { type: "rgb-led", id: "rgb1" },
        { type: "reed-switch", id: "reed1" }
      ],
      pinAssignments: {
        "reed1:pin1": "bb1:c3",
        "reed1:pin2": "bb1:c9",
        "r1:pin1": "bb1:c14",
        "r1:pin2": "bb1:c21",
        "r2:pin1": "bb1:g14",
        "r2:pin2": "bb1:g21",
        "led1:anode": "bb1:b21",
        "led1:cathode": "bb1:b22",
        "led2:anode": "bb1:h23",
        "led2:cathode": "bb1:h24",
        "pot1:vcc": "bb1:e28",
        "pot1:signal": "bb1:e29",
        "pot1:gnd": "bb1:e30",
        "pot2:vcc": "bb1:e33",
        "pot2:signal": "bb1:e34",
        "pot2:gnd": "bb1:e35",
        "pot3:vcc": "bb1:e38",
        "pot3:signal": "bb1:e39",
        "pot3:gnd": "bb1:e40",
        "r3:pin1": "bb1:b43",
        "r3:pin2": "bb1:b50",
        "r4:pin1": "bb1:g43",
        "r4:pin2": "bb1:g50",
        "rgb1:red": "bb1:d53",
        "rgb1:common": "bb1:d54",
        "rgb1:green": "bb1:d55",
        "rgb1:blue": "bb1:d56"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-plus-1", color: "red" },
        { from: "bb1:bus-plus-3", to: "bb1:a3", color: "red" },
        { from: "bb1:a9", to: "bb1:a14", color: "yellow" },
        { from: "bb1:a9", to: "bb1:f14", color: "yellow" },
        { from: "bb1:a9", to: "bb1:a28", color: "yellow" },
        { from: "bb1:a9", to: "bb1:a33", color: "yellow" },
        { from: "bb1:a9", to: "bb1:a38", color: "yellow" },
        { from: "bb1:a22", to: "bb1:bus-minus-22", color: "black" },
        { from: "bb1:g21", to: "bb1:g23", color: "yellow" },
        { from: "bb1:j24", to: "bb1:bus-minus-24", color: "black" },
        { from: "bb1:a29", to: "bb1:a43", color: "orange" },
        { from: "bb1:a50", to: "bb1:a53", color: "orange" },
        { from: "bb1:a34", to: "bb1:f43", color: "green" },
        { from: "bb1:f50", to: "bb1:a55", color: "green" },
        { from: "bb1:a39", to: "bb1:f53", color: "blue" },
        { from: "bb1:f60", to: "bb1:a56", color: "blue" },
        { from: "bb1:a30", to: "bb1:bus-minus-30", color: "black" },
        { from: "bb1:a35", to: "bb1:bus-minus-35", color: "black" },
        { from: "bb1:a40", to: "bb1:bus-minus-40", color: "black" },
        { from: "bb1:a54", to: "bb1:bus-minus-54", color: "black" },
        { from: "bb1:bus-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 80, y: 10 },
        "reed1": { x: 130.25, y: 81.3 },
        "r1": { x: 212.47, y: 81.3 },
        "r2": { x: 212.47, y: 121.65 },
        "led1": { x: 241.07, y: 60.15 },
        "led2": { x: 255.38, y: 114.8 },
        "pot1": { x: 294.7, y: 86.6 },
        "pot2": { x: 330.45, y: 86.6 },
        "pot3": { x: 366.2, y: 86.6 },
        "r3": { x: 419.83, y: 74.15 },
        "r4": { x: 419.83, y: 121.65 },
        "rgb1": { x: 477.02, y: 65.95 }
      },
      steps: [
        "Questo \u00e8 il progetto finale! Usa la breadboard grande (full-size)",
        "Inserisci il reed switch nella fila c, col 3-9 (ON/OFF magnetico)",
        "Inserisci r1 (220\u03A9) fila c col 14-21 e r2 (220\u03A9) fila g col 14-21 per gli occhi",
        "Inserisci i 2 LED verdi: led1 fila b col 21-22, led2 fila h col 23-24",
        "Inserisci i 3 potenziometri: pot1 col 28-30, pot2 col 33-35, pot3 col 38-40",
        "Inserisci r3 (220\u03A9) fila b col 43-50 (rosso), r4 (220\u03A9) fila g col 43-50 (verde e blu)",
        "Inserisci il LED RGB fila d col 53-56",
        "Avvicina il magnete: il robot si accende! Gira le manopole per cambiare il colore della mano!"
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      ],
      observe: "Il magnete accende il robot! Gli occhi verdi si illuminano e la mano RGB cambia colore con le 3 manopole. Complimenti, hai costruito il tuo primo robot!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Il Primo Robot ELAB'. Questo è il progetto finale del Volume 1! Il robot ha: occhi verdi (2 LED), mano colorata (LED RGB con 3 potenziometri per controllare il colore), e un sensore magnetico (reed switch) come interruttore generale. Il magnete accende tutto il robot! Spiega come tutti i concetti imparati nel volume si uniscono qui. Complimentati con i ragazzi per essere arrivati fin qui. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Progetto finale: integrazione tutti i componenti del volume",
      layer: "cielo",
      note: "Robot con occhi verdi (2 LED), mano colorata (RGB + 3 pot), ON/OFF con magnete (reed switch)",
      advancedProject: true,
      estimatedMinutes: 60,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (full-size) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-full",
          hint: "La breadboard full-size ha più spazio per i componenti."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E28, E29 e E30.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:e28", "pot1:signal": "bb1:e29", "pot1:gnd": "bb1:e30" },
          hint: "I 3 pin: VCC in E28, Signal in E29, GND in E30."
        },
        {
          step: 4,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E33, E34 e E35.",
          componentId: "pot2",
          componentType: "potentiometer",
          targetPins: { "pot2:vcc": "bb1:e33", "pot2:signal": "bb1:e34", "pot2:gnd": "bb1:e35" },
          hint: "I 3 pin: VCC in E33, Signal in E34, GND in E35."
        },
        {
          step: 5,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori E38, E39 e E40.",
          componentId: "pot3",
          componentType: "potentiometer",
          targetPins: { "pot3:vcc": "bb1:e38", "pot3:signal": "bb1:e39", "pot3:gnd": "bb1:e40" },
          hint: "I 3 pin: VCC in E38, Signal in E39, GND in E40."
        },
        {
          step: 6,
          text: "Prendi il resistore da 220Ω dalla palette e posizionalo nei fori C14 e C21.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c14", "r1:pin2": "bb1:c21" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 7,
          text: "Prendi il resistore da 220Ω dalla palette e posizionalo nei fori G14 e G21.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:g14", "r2:pin2": "bb1:g21" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 8,
          text: "Prendi il resistore da 220Ω dalla palette e posizionalo nei fori B43 e B50.",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:b43", "r3:pin2": "bb1:b50" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 9,
          text: "Prendi il resistore da 220Ω dalla palette e posizionalo nei fori G43 e G50.",
          componentId: "r4",
          componentType: "resistor",
          targetPins: { "r4:pin1": "bb1:g43", "r4:pin2": "bb1:g50" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 10,
          text: "Prendi il LED verde dalla palette e posizionalo nei fori B21 e B22.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:b21", "led1:cathode": "bb1:b22" },
          hint: "L'anodo (+, gamba lunga) va in B21 e il catodo (−, gamba corta) in B22."
        },
        {
          step: 12,
          text: "Prendi il LED verde dalla palette e posizionalo nei fori H23 e H24.",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:h23", "led2:cathode": "bb1:h24" },
          hint: "L'anodo (+, gamba lunga) va in H23 e il catodo (−, gamba corta) in H24."
        },
        {
          step: 13,
          text: "Prendi il LED RGB dalla palette e posizionalo nei fori D53, D54, D55 e D56.",
          componentId: "rgb1",
          componentType: "rgb-led",
          targetPins: { "rgb1:red": "bb1:d53", "rgb1:common": "bb1:d54", "rgb1:green": "bb1:d55", "rgb1:blue": "bb1:d56" },
          hint: "I 4 piedini: Rosso in D53, Catodo comune in D54, Verde in D55, Blu in D56."
        },
        {
          step: 14,
          text: "Prendi il reed switch dalla palette e posizionalo nei fori C3 e C9.",
          componentId: "reed1",
          componentType: "reed-switch",
          targetPins: { "reed1:pin1": "bb1:c3", "reed1:pin2": "bb1:c9" },
          hint: "Il reed switch si chiude con il magnete. Come un interruttore invisibile!"
        },
        {
          step: 15,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 16,
          text: "Collega un filo ROSSO dal foro bus + (riga 3) al foro A3.",
          wireFrom: "bb1:bus-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 17,
          text: "Collega un filo GIALLO dal foro A9 al foro A14.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 18,
          text: "Collega un filo GIALLO dal foro A9 al foro F14.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:f14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 19,
          text: "Collega un filo GIALLO dal foro A9 al foro A28.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a28",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 20,
          text: "Collega un filo GIALLO dal foro A9 al foro A33.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a33",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 21,
          text: "Collega un filo GIALLO dal foro A9 al foro A38.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a38",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 22,
          text: "Collega un filo NERO dal foro A22 al foro bus − (riga 22).",
          wireFrom: "bb1:a22",
          wireTo: "bb1:bus-minus-22",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 23,
          text: "Collega un filo GIALLO dal foro G21 al foro G23 (ponte verso il LED).",
          wireFrom: "bb1:g21",
          wireTo: "bb1:g23",
          wireColor: "yellow",
          hint: "Questo filo collega il resistore al LED."
        },
        {
          step: 24,
          text: "Collega un filo NERO dal foro J24 al foro bus − (riga 24).",
          wireFrom: "bb1:j24",
          wireTo: "bb1:bus-minus-24",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 25,
          text: "Collega un filo ARANCIONE dal foro A29 al foro A43.",
          wireFrom: "bb1:a29",
          wireTo: "bb1:a43",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 26,
          text: "Collega un filo ARANCIONE dal foro A50 al foro A53.",
          wireFrom: "bb1:a50",
          wireTo: "bb1:a53",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 27,
          text: "Collega un filo VERDE dal foro A34 al foro F43.",
          wireFrom: "bb1:a34",
          wireTo: "bb1:f43",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 28,
          text: "Collega un filo VERDE dal foro F50 al foro A55.",
          wireFrom: "bb1:f50",
          wireTo: "bb1:a55",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 29,
          text: "Collega un filo BLU dal foro A39 al foro F53.",
          wireFrom: "bb1:a39",
          wireTo: "bb1:f53",
          wireColor: "blue",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 30,
          text: "Collega un filo BLU dal foro F60 al foro A56.",
          wireFrom: "bb1:f60",
          wireTo: "bb1:a56",
          wireColor: "blue",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 31,
          text: "Collega un filo NERO dal foro A30 al foro bus − (riga 30).",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-minus-30",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 32,
          text: "Collega un filo NERO dal foro A35 al foro bus − (riga 35).",
          wireFrom: "bb1:a35",
          wireTo: "bb1:bus-minus-35",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 33,
          text: "Collega un filo NERO dal foro A40 al foro bus − (riga 40).",
          wireFrom: "bb1:a40",
          wireTo: "bb1:bus-minus-40",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 34,
          text: "Collega un filo NERO dal foro A54 al foro bus − (riga 54).",
          wireFrom: "bb1:a54",
          wireTo: "bb1:bus-minus-54",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 35,
          text: "Collega un filo NERO dal foro bus − (riga 1) al polo − della batteria.",
          wireFrom: "bb1:bus-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Quali componenti dei capitoli precedenti vengono usati nel robot?",
          options: ["Solo LED e batteria", "Solo il buzzer e un pulsante", "LED, LED RGB, reed switch, potenziometro e resistori"],
          correct: 2,
          explanation: "Il robot ELAB integra quasi tutto quello che hai imparato: LED verdi per gli occhi, LED RGB per la mano colorata, reed switch come sensore magnetico, potenziometri e resistori. È il progetto finale!"
        },
        {
          question: "Cosa dimostra il progetto del robot?",
          options: ["Che i circuiti servono solo per accendere LED", "Che combinando componenti semplici si possono creare progetti complessi e divertenti", "Che serve sempre un computer per fare un robot"],
          correct: 1,
          explanation: "Il robot dimostra che mettendo insieme tutti i componenti imparati nei capitoli precedenti si può costruire qualcosa di incredibile! Ogni pezzo ha il suo ruolo, proprio come in un robot vero!"
        }
      ]
    }
  ]
};

export default EXPERIMENTS_VOL1;
