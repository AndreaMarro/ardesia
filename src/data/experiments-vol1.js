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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "red"
              }
      ],
      pinAssignments: {
              "r1:pin1": "bb1:i7",
              "r1:pin2": "bb1:i9",
              "led1:anode": "bb1:e7",
              "led1:cathode": "bb1:f7"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:i9",
                      "to": "bb1:bus-bot-minus-9",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 166.5,
                      "y": 113.75
              },
              "led1": {
                      "x": 159,
                      "y": 82.5
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori A2, A9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a2",
                              "r1:pin2": "bb1:a9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED red nei fori F9, F10.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:f9",
                              "led1:cathode": "bb1:f10"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:b2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:b2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo GREEN da bb1:e9 a bb1:f9.",
                      "wireFrom": "bb1:e9",
                      "wireTo": "bb1:f9",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:j10 a bb1:bus-bot-minus-10.",
                      "wireFrom": "bb1:j10",
                      "wireTo": "bb1:bus-bot-minus-10",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-1.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "blue"
              }
      ],
      pinAssignments: {
              "led1:anode": "bb1:e7",
              "led1:cathode": "bb1:f7"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:f7",
                      "to": "bb1:bus-bot-minus-7",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-2",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "led1": {
                      "x": 159,
                      "y": 82.5
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona LED blue nei fori F2, F3.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:f2",
                              "led1:cathode": "bb1:f3"
                      }
              },
              {
                      "step": 4,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:e2 a bb1:f2.",
                      "wireFrom": "bb1:e2",
                      "wireTo": "bb1:f2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-1.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 220
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "green"
              }
      ],
      pinAssignments: {
              "r1:pin1": "bb1:i7",
              "r1:pin2": "bb1:i9",
              "led1:anode": "bb1:e7",
              "led1:cathode": "bb1:f7"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:i9",
                      "to": "bb1:bus-bot-minus-9",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 166.5,
                      "y": 113.75
              },
              "led1": {
                      "x": 159,
                      "y": 82.5
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 220 ohm nei fori A2, A9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a2",
                              "r1:pin2": "bb1:a9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED green nei fori F9, F10.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:f9",
                              "led1:cathode": "bb1:f10"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:b2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:b2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo GREEN da bb1:e9 a bb1:f9.",
                      "wireFrom": "bb1:e9",
                      "wireTo": "bb1:f9",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:j10 a bb1:bus-bot-minus-10.",
                      "wireFrom": "bb1:j10",
                      "wireTo": "bb1:bus-bot-minus-10",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-1.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-9",
                      "to": "bb1:b9",
                      "color": "red"
              },
              {
                      "from": "bb1:e2",
                      "to": "bb1:f2",
                      "color": "red"
              },
              {
                      "from": "bb1:j3",
                      "to": "bb1:bus-bot-minus-3",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 43.75
              },
              "rgb1": {
                      "x": 136.5,
                      "y": 68.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori A2, A9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a2",
                              "r1:pin2": "bb1:a9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED RGB nei fori F2, F3, F4, F5.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f2",
                              "rgb1:common": "bb1:f3",
                              "rgb1:green": "bb1:f4",
                              "rgb1:blue": "bb1:f5"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-9 a bb1:b9.",
                      "wireFrom": "bb1:bus-top-plus-9",
                      "wireTo": "bb1:b9",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:e2 a bb1:f2.",
                      "wireFrom": "bb1:e2",
                      "wireTo": "bb1:f2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-11",
                      "to": "bb1:b11",
                      "color": "red"
              },
              {
                      "from": "bb1:e4",
                      "to": "bb1:f4",
                      "color": "green"
              },
              {
                      "from": "bb1:j3",
                      "to": "bb1:bus-bot-minus-3",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 166.5,
                      "y": 43.75
              },
              "rgb1": {
                      "x": 136.5,
                      "y": 68.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori A4, A11.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a4",
                              "r1:pin2": "bb1:a11"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED RGB nei fori F2, F3, F4, F5.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f2",
                              "rgb1:common": "bb1:f3",
                              "rgb1:green": "bb1:f4",
                              "rgb1:blue": "bb1:f5"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-11 a bb1:b11.",
                      "wireFrom": "bb1:bus-top-plus-11",
                      "wireTo": "bb1:b11",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo GREEN da bb1:e4 a bb1:f4.",
                      "wireFrom": "bb1:e4",
                      "wireTo": "bb1:f4",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-12",
                      "to": "bb1:b12",
                      "color": "red"
              },
              {
                      "from": "bb1:e5",
                      "to": "bb1:f5",
                      "color": "blue"
              },
              {
                      "from": "bb1:j3",
                      "to": "bb1:bus-bot-minus-3",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 174,
                      "y": 43.75
              },
              "rgb1": {
                      "x": 136.5,
                      "y": 68.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori A5, A12.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a5",
                              "r1:pin2": "bb1:a12"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED RGB nei fori F2, F3, F4, F5.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f2",
                              "rgb1:common": "bb1:f3",
                              "rgb1:green": "bb1:f4",
                              "rgb1:blue": "bb1:f5"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-12 a bb1:b12.",
                      "wireFrom": "bb1:bus-top-plus-12",
                      "wireTo": "bb1:b12",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo BLUE da bb1:e5 a bb1:f5.",
                      "wireFrom": "bb1:e5",
                      "wireTo": "bb1:f5",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-8",
                      "to": "bb1:a8",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-12",
                      "to": "bb1:a12",
                      "color": "red"
              },
              {
                      "from": "bb1:e2",
                      "to": "bb1:f2",
                      "color": "orange"
              },
              {
                      "from": "bb1:e6",
                      "to": "bb1:f5",
                      "color": "blue"
              },
              {
                      "from": "bb1:j3",
                      "to": "bb1:bus-bot-minus-3",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 73.75
              },
              "r2": {
                      "x": 181.5,
                      "y": 73.75
              },
              "rgb1": {
                      "x": 136.5,
                      "y": 68.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori E8, E2.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e8",
                              "r1:pin2": "bb1:e2"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E12, E6.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:e12",
                              "r2:pin2": "bb1:e6"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED RGB nei fori F2, F3, F4, F5.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f2",
                              "rgb1:common": "bb1:f3",
                              "rgb1:green": "bb1:f4",
                              "rgb1:blue": "bb1:f5"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-8 a bb1:a8.",
                      "wireFrom": "bb1:bus-top-plus-8",
                      "wireTo": "bb1:a8",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-12 a bb1:a12.",
                      "wireFrom": "bb1:bus-top-plus-12",
                      "wireTo": "bb1:a12",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo ORANGE da bb1:e2 a bb1:f2.",
                      "wireFrom": "bb1:e2",
                      "wireTo": "bb1:f2",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLUE da bb1:e6 a bb1:f5.",
                      "wireFrom": "bb1:e6",
                      "wireTo": "bb1:f5",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r3",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-8",
                      "to": "bb1:a8",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-10",
                      "to": "bb1:a10",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-12",
                      "to": "bb1:a12",
                      "color": "red"
              },
              {
                      "from": "bb1:e2",
                      "to": "bb1:f2",
                      "color": "red"
              },
              {
                      "from": "bb1:e4",
                      "to": "bb1:f4",
                      "color": "green"
              },
              {
                      "from": "bb1:e6",
                      "to": "bb1:f5",
                      "color": "blue"
              },
              {
                      "from": "bb1:j3",
                      "to": "bb1:bus-bot-minus-3",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 73.75
              },
              "r2": {
                      "x": 166.5,
                      "y": 73.75
              },
              "r3": {
                      "x": 181.5,
                      "y": 73.75
              },
              "rgb1": {
                      "x": 136.5,
                      "y": 68.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori E8, E2.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e8",
                              "r1:pin2": "bb1:e2"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E10, E4.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:e10",
                              "r2:pin2": "bb1:e4"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona resistore da 470 ohm nei fori E12, E6.",
                      "componentId": "r3",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r3:pin1": "bb1:e12",
                              "r3:pin2": "bb1:e6"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED RGB nei fori F2, F3, F4, F5.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f2",
                              "rgb1:common": "bb1:f3",
                              "rgb1:green": "bb1:f4",
                              "rgb1:blue": "bb1:f5"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-8 a bb1:a8.",
                      "wireFrom": "bb1:bus-top-plus-8",
                      "wireTo": "bb1:a8",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-10 a bb1:a10.",
                      "wireFrom": "bb1:bus-top-plus-10",
                      "wireTo": "bb1:a10",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-top-plus-12 a bb1:a12.",
                      "wireFrom": "bb1:bus-top-plus-12",
                      "wireTo": "bb1:a12",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo RED da bb1:e2 a bb1:f2.",
                      "wireFrom": "bb1:e2",
                      "wireTo": "bb1:f2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo GREEN da bb1:e4 a bb1:f4.",
                      "wireFrom": "bb1:e4",
                      "wireTo": "bb1:f4",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLUE da bb1:e6 a bb1:f5.",
                      "wireFrom": "bb1:e6",
                      "wireTo": "bb1:f5",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 220
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r3",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-8",
                      "to": "bb1:a8",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-10",
                      "to": "bb1:a10",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-12",
                      "to": "bb1:a12",
                      "color": "red"
              },
              {
                      "from": "bb1:e2",
                      "to": "bb1:f2",
                      "color": "red"
              },
              {
                      "from": "bb1:e4",
                      "to": "bb1:f4",
                      "color": "green"
              },
              {
                      "from": "bb1:e6",
                      "to": "bb1:f5",
                      "color": "blue"
              },
              {
                      "from": "bb1:j3",
                      "to": "bb1:bus-bot-minus-3",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 73.75
              },
              "r2": {
                      "x": 166.5,
                      "y": 73.75
              },
              "r3": {
                      "x": 181.5,
                      "y": 73.75
              },
              "rgb1": {
                      "x": 136.5,
                      "y": 68.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 220 ohm nei fori E8, E2.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e8",
                              "r1:pin2": "bb1:e2"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E10, E4.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:e10",
                              "r2:pin2": "bb1:e4"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona resistore da 470 ohm nei fori E12, E6.",
                      "componentId": "r3",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r3:pin1": "bb1:e12",
                              "r3:pin2": "bb1:e6"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED RGB nei fori F2, F3, F4, F5.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f2",
                              "rgb1:common": "bb1:f3",
                              "rgb1:green": "bb1:f4",
                              "rgb1:blue": "bb1:f5"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-8 a bb1:a8.",
                      "wireFrom": "bb1:bus-top-plus-8",
                      "wireTo": "bb1:a8",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-10 a bb1:a10.",
                      "wireFrom": "bb1:bus-top-plus-10",
                      "wireTo": "bb1:a10",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-top-plus-12 a bb1:a12.",
                      "wireFrom": "bb1:bus-top-plus-12",
                      "wireTo": "bb1:a12",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo RED da bb1:e2 a bb1:f2.",
                      "wireFrom": "bb1:e2",
                      "wireTo": "bb1:f2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo GREEN da bb1:e4 a bb1:f4.",
                      "wireFrom": "bb1:e4",
                      "wireTo": "bb1:f4",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLUE da bb1:e6 a bb1:f5.",
                      "wireFrom": "bb1:e6",
                      "wireTo": "bb1:f5",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:j3 a bb1:bus-bot-minus-3.",
                      "wireFrom": "bb1:j3",
                      "wireTo": "bb1:bus-bot-minus-3",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "blue"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:e9",
                      "to": "bb1:f9",
                      "color": "orange"
              },
              {
                      "from": "bb1:f10",
                      "to": "bb1:e10",
                      "color": "yellow"
              },
              {
                      "from": "bb1:e10",
                      "to": "bb1:e11",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j13",
                      "to": "bb1:bus-bot-minus-13",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 43.75
              },
              "led1": {
                      "x": 181.5,
                      "y": 68.75
              },
              "btn1": {
                      "x": 200.25,
                      "y": 82.5
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona pulsante nei fori E11, F13.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e11",
                              "btn1:pin2": "bb1:f13"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori A2, A9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a2",
                              "r1:pin2": "bb1:a9"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED blue nei fori F9, F10.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:f9",
                              "led1:cathode": "bb1:f10"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo ORANGE da bb1:e9 a bb1:f9.",
                      "wireFrom": "bb1:e9",
                      "wireTo": "bb1:f9",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo YELLOW da bb1:f10 a bb1:e10.",
                      "wireFrom": "bb1:f10",
                      "wireTo": "bb1:e10",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo YELLOW da bb1:e10 a bb1:e11.",
                      "wireFrom": "bb1:e10",
                      "wireTo": "bb1:e11",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:j13 a bb1:bus-bot-minus-13.",
                      "wireFrom": "bb1:j13",
                      "wireTo": "bb1:bus-bot-minus-13",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 220
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "green"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:e9",
                      "to": "bb1:f9",
                      "color": "orange"
              },
              {
                      "from": "bb1:f10",
                      "to": "bb1:e10",
                      "color": "yellow"
              },
              {
                      "from": "bb1:e10",
                      "to": "bb1:e11",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j13",
                      "to": "bb1:bus-bot-minus-13",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 43.75
              },
              "led1": {
                      "x": 181.5,
                      "y": 68.75
              },
              "btn1": {
                      "x": 200.25,
                      "y": 82.5
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona pulsante nei fori E11, F13.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e11",
                              "btn1:pin2": "bb1:f13"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 220 ohm nei fori A2, A9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a2",
                              "r1:pin2": "bb1:a9"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED green nei fori F9, F10.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:f9",
                              "led1:cathode": "bb1:f10"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo ORANGE da bb1:e9 a bb1:f9.",
                      "wireFrom": "bb1:e9",
                      "wireTo": "bb1:f9",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo YELLOW da bb1:f10 a bb1:e10.",
                      "wireFrom": "bb1:f10",
                      "wireTo": "bb1:e10",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo YELLOW da bb1:e10 a bb1:e11.",
                      "wireFrom": "bb1:e10",
                      "wireTo": "bb1:e11",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:j13 a bb1:bus-bot-minus-13.",
                      "wireFrom": "bb1:j13",
                      "wireTo": "bb1:bus-bot-minus-13",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-11",
                      "to": "bb1:a11",
                      "color": "red"
              },
              {
                      "from": "bb1:e9",
                      "to": "bb1:f15",
                      "color": "orange"
              },
              {
                      "from": "bb1:e18",
                      "to": "bb1:f18",
                      "color": "blue"
              },
              {
                      "from": "bb1:j16",
                      "to": "bb1:j20",
                      "color": "yellow"
              },
              {
                      "from": "bb1:f20",
                      "to": "bb1:e20",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j22",
                      "to": "bb1:bus-bot-minus-22",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-minus-1",
                      "to": "bb1:bus-top-minus-2",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 151.5,
                      "y": 43.75
              },
              "r2": {
                      "x": 219,
                      "y": 43.75
              },
              "rgb1": {
                      "x": 234,
                      "y": 68.75
              },
              "btn1": {
                      "x": 275.25,
                      "y": 82.5
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori A2, A9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a2",
                              "r1:pin2": "bb1:a9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori A11, A18.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:a11",
                              "r2:pin2": "bb1:a18"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED RGB nei fori F15, F16, F17, F18.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:f15",
                              "rgb1:common": "bb1:f16",
                              "rgb1:green": "bb1:f17",
                              "rgb1:blue": "bb1:f18"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona pulsante nei fori E20, F22.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e20",
                              "btn1:pin2": "bb1:f22"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-11 a bb1:a11.",
                      "wireFrom": "bb1:bus-top-plus-11",
                      "wireTo": "bb1:a11",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo ORANGE da bb1:e9 a bb1:f15.",
                      "wireFrom": "bb1:e9",
                      "wireTo": "bb1:f15",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLUE da bb1:e18 a bb1:f18.",
                      "wireFrom": "bb1:e18",
                      "wireTo": "bb1:f18",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo YELLOW da bb1:j16 a bb1:j20.",
                      "wireFrom": "bb1:j16",
                      "wireTo": "bb1:j20",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo YELLOW da bb1:f20 a bb1:e20.",
                      "wireFrom": "bb1:f20",
                      "wireTo": "bb1:e20",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:j22 a bb1:bus-bot-minus-22.",
                      "wireFrom": "bb1:j22",
                      "wireTo": "bb1:bus-bot-minus-22",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:bus-bot-minus-1 a bb1:bus-top-minus-2.",
                      "wireFrom": "bb1:bus-bot-minus-1",
                      "wireTo": "bb1:bus-top-minus-2",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "push-button",
                      "id": "btn2"
              },
              {
                      "type": "push-button",
                      "id": "btn3"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r3",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-6",
                      "to": "bb1:a6",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-10",
                      "to": "bb1:a10",
                      "color": "red"
              },
              {
                      "from": "bb1:j4",
                      "to": "bb1:a16",
                      "color": "orange"
              },
              {
                      "from": "bb1:j8",
                      "to": "bb1:a18",
                      "color": "green"
              },
              {
                      "from": "bb1:j12",
                      "to": "bb1:a19",
                      "color": "blue"
              },
              {
                      "from": "bb1:a24",
                      "to": "bb1:bus-top-minus-24",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "btn1": {
                      "x": 140.25,
                      "y": 82.5
              },
              "btn2": {
                      "x": 170.25,
                      "y": 82.5
              },
              "btn3": {
                      "x": 200.25,
                      "y": 82.5
              },
              "r1": {
                      "x": 256.5,
                      "y": 43.75
              },
              "r2": {
                      "x": 271.5,
                      "y": 51.25
              },
              "r3": {
                      "x": 279,
                      "y": 58.75
              },
              "rgb1": {
                      "x": 294,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona pulsante nei fori E2, F4.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e2",
                              "btn1:pin2": "bb1:f4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona pulsante nei fori E6, F8.",
                      "componentId": "btn2",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn2:pin1": "bb1:e6",
                              "btn2:pin2": "bb1:f8"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona pulsante nei fori E10, F12.",
                      "componentId": "btn3",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn3:pin1": "bb1:e10",
                              "btn3:pin2": "bb1:f12"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona resistore da 470 ohm nei fori A16, A23.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a16",
                              "r1:pin2": "bb1:a23"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona resistore da 470 ohm nei fori B18, B25.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:b18",
                              "r2:pin2": "bb1:b25"
                      }
              },
              {
                      "step": 8,
                      "text": "Posiziona resistore da 470 ohm nei fori C19, C26.",
                      "componentId": "r3",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r3:pin1": "bb1:c19",
                              "r3:pin2": "bb1:c26"
                      }
              },
              {
                      "step": 9,
                      "text": "Posiziona LED RGB nei fori D23, D24, D25, D26.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d23",
                              "rgb1:common": "bb1:d24",
                              "rgb1:green": "bb1:d25",
                              "rgb1:blue": "bb1:d26"
                      }
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo RED da bb1:bus-top-plus-6 a bb1:a6.",
                      "wireFrom": "bb1:bus-top-plus-6",
                      "wireTo": "bb1:a6",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo RED da bb1:bus-top-plus-10 a bb1:a10.",
                      "wireFrom": "bb1:bus-top-plus-10",
                      "wireTo": "bb1:a10",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo ORANGE da bb1:j4 a bb1:a16.",
                      "wireFrom": "bb1:j4",
                      "wireTo": "bb1:a16",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo GREEN da bb1:j8 a bb1:a18.",
                      "wireFrom": "bb1:j8",
                      "wireTo": "bb1:a18",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLUE da bb1:j12 a bb1:a19.",
                      "wireFrom": "bb1:j12",
                      "wireTo": "bb1:a19",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo BLACK da bb1:a24 a bb1:bus-top-minus-24.",
                      "wireFrom": "bb1:a24",
                      "wireTo": "bb1:bus-top-minus-24",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "push-button",
                      "id": "btn2"
              },
              {
                      "type": "push-button",
                      "id": "btn3"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 220
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r3",
                      "value": 1000
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-6",
                      "to": "bb1:a6",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-10",
                      "to": "bb1:a10",
                      "color": "red"
              },
              {
                      "from": "bb1:j4",
                      "to": "bb1:a16",
                      "color": "orange"
              },
              {
                      "from": "bb1:j8",
                      "to": "bb1:a18",
                      "color": "green"
              },
              {
                      "from": "bb1:j12",
                      "to": "bb1:a19",
                      "color": "blue"
              },
              {
                      "from": "bb1:a24",
                      "to": "bb1:bus-top-minus-24",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 55
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "btn1": {
                      "x": 140.25,
                      "y": 82.5
              },
              "btn2": {
                      "x": 170.25,
                      "y": 82.5
              },
              "btn3": {
                      "x": 200.25,
                      "y": 82.5
              },
              "r1": {
                      "x": 256.5,
                      "y": 43.75
              },
              "r2": {
                      "x": 271.5,
                      "y": 51.25
              },
              "r3": {
                      "x": 279,
                      "y": 58.75
              },
              "rgb1": {
                      "x": 294,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona pulsante nei fori E2, F4.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e2",
                              "btn1:pin2": "bb1:f4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona pulsante nei fori E6, F8.",
                      "componentId": "btn2",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn2:pin1": "bb1:e6",
                              "btn2:pin2": "bb1:f8"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona pulsante nei fori E10, F12.",
                      "componentId": "btn3",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn3:pin1": "bb1:e10",
                              "btn3:pin2": "bb1:f12"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona resistore da 220 ohm nei fori A16, A23.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:a16",
                              "r1:pin2": "bb1:a23"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona resistore da 470 ohm nei fori B18, B25.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:b18",
                              "r2:pin2": "bb1:b25"
                      }
              },
              {
                      "step": 8,
                      "text": "Posiziona resistore da 1000 ohm nei fori C19, C26.",
                      "componentId": "r3",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r3:pin1": "bb1:c19",
                              "r3:pin2": "bb1:c26"
                      }
              },
              {
                      "step": 9,
                      "text": "Posiziona LED RGB nei fori D23, D24, D25, D26.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d23",
                              "rgb1:common": "bb1:d24",
                              "rgb1:green": "bb1:d25",
                              "rgb1:blue": "bb1:d26"
                      }
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo RED da bb1:bus-top-plus-6 a bb1:a6.",
                      "wireFrom": "bb1:bus-top-plus-6",
                      "wireTo": "bb1:a6",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo RED da bb1:bus-top-plus-10 a bb1:a10.",
                      "wireFrom": "bb1:bus-top-plus-10",
                      "wireTo": "bb1:a10",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo ORANGE da bb1:j4 a bb1:a16.",
                      "wireFrom": "bb1:j4",
                      "wireTo": "bb1:a16",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo GREEN da bb1:j8 a bb1:a18.",
                      "wireFrom": "bb1:j8",
                      "wireTo": "bb1:a18",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLUE da bb1:j12 a bb1:a19.",
                      "wireFrom": "bb1:j12",
                      "wireTo": "bb1:a19",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo BLACK da bb1:a24 a bb1:bus-top-minus-24.",
                      "wireFrom": "bb1:a24",
                      "wireTo": "bb1:bus-top-minus-24",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "red"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a6",
                      "to": "bb1:a10",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a7",
                      "to": "bb1:bus-top-minus-7",
                      "color": "black"
              },
              {
                      "from": "bb1:a18",
                      "to": "bb1:bus-top-minus-18",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 155.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 211.5,
                      "y": 73.75
              },
              "led1": {
                      "x": 241.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E5, E6, E7.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e5",
                              "pot1:signal": "bb1:e6",
                              "pot1:gnd": "bb1:e7"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E10, E17.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e10",
                              "r1:pin2": "bb1:e17"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED red nei fori D17, D18.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d17",
                              "led1:cathode": "bb1:d18"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo YELLOW da bb1:a6 a bb1:a10.",
                      "wireFrom": "bb1:a6",
                      "wireTo": "bb1:a10",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:a7 a bb1:bus-top-minus-7.",
                      "wireFrom": "bb1:a7",
                      "wireTo": "bb1:bus-top-minus-7",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:a18 a bb1:bus-top-minus-18.",
                      "wireFrom": "bb1:a18",
                      "wireTo": "bb1:bus-top-minus-18",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "red"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:a6",
                      "to": "bb1:a10",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a5",
                      "to": "bb1:bus-top-minus-5",
                      "color": "black"
              },
              {
                      "from": "bb1:a18",
                      "to": "bb1:bus-top-minus-18",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 155.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 211.5,
                      "y": 73.75
              },
              "led1": {
                      "x": 241.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E5, E6, E7.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e5",
                              "pot1:signal": "bb1:e6",
                              "pot1:gnd": "bb1:e7"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E10, E17.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e10",
                              "r1:pin2": "bb1:e17"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED red nei fori D17, D18.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d17",
                              "led1:cathode": "bb1:d18"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-7 a bb1:a7.",
                      "wireFrom": "bb1:bus-top-plus-7",
                      "wireTo": "bb1:a7",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo YELLOW da bb1:a6 a bb1:a10.",
                      "wireFrom": "bb1:a6",
                      "wireTo": "bb1:a10",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:a5 a bb1:bus-top-minus-5.",
                      "wireFrom": "bb1:a5",
                      "wireTo": "bb1:bus-top-minus-5",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:a18 a bb1:bus-top-minus-18.",
                      "wireFrom": "bb1:a18",
                      "wireTo": "bb1:bus-top-minus-18",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "green"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a6",
                      "to": "bb1:a10",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a7",
                      "to": "bb1:bus-top-minus-7",
                      "color": "black"
              },
              {
                      "from": "bb1:a18",
                      "to": "bb1:bus-top-minus-18",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 155.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 211.5,
                      "y": 73.75
              },
              "led1": {
                      "x": 241.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E5, E6, E7.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e5",
                              "pot1:signal": "bb1:e6",
                              "pot1:gnd": "bb1:e7"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E10, E17.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e10",
                              "r1:pin2": "bb1:e17"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED green nei fori D17, D18.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d17",
                              "led1:cathode": "bb1:d18"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo YELLOW da bb1:a6 a bb1:a10.",
                      "wireFrom": "bb1:a6",
                      "wireTo": "bb1:a10",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:a7 a bb1:bus-top-minus-7.",
                      "wireFrom": "bb1:a7",
                      "wireTo": "bb1:bus-top-minus-7",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:a18 a bb1:bus-top-minus-18.",
                      "wireFrom": "bb1:a18",
                      "wireTo": "bb1:bus-top-minus-18",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-3",
                      "to": "bb1:a3",
                      "color": "red"
              },
              {
                      "from": "bb1:a4",
                      "to": "bb1:a21",
                      "color": "blue"
              },
              {
                      "from": "bb1:a4",
                      "to": "bb1:a20",
                      "color": "green"
              },
              {
                      "from": "bb1:a5",
                      "to": "bb1:bus-top-minus-5",
                      "color": "black"
              },
              {
                      "from": "bb1:a15",
                      "to": "bb1:bus-top-minus-15",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 140.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 196.5,
                      "y": 58.75
              },
              "r2": {
                      "x": 196.5,
                      "y": 98.75
              },
              "rgb1": {
                      "x": 256.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E3, E4, E5.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e3",
                              "pot1:signal": "bb1:e4",
                              "pot1:gnd": "bb1:e5"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori C15, C19.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c15",
                              "r1:pin2": "bb1:c19"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED RGB nei fori D18, D19, D20, D21.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d18",
                              "rgb1:common": "bb1:d19",
                              "rgb1:green": "bb1:d20",
                              "rgb1:blue": "bb1:d21"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-3 a bb1:a3.",
                      "wireFrom": "bb1:bus-top-plus-3",
                      "wireTo": "bb1:a3",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLUE da bb1:a4 a bb1:a21.",
                      "wireFrom": "bb1:a4",
                      "wireTo": "bb1:a21",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo GREEN da bb1:a4 a bb1:a20.",
                      "wireFrom": "bb1:a4",
                      "wireTo": "bb1:a20",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:a5 a bb1:bus-top-minus-5.",
                      "wireFrom": "bb1:a5",
                      "wireTo": "bb1:bus-top-minus-5",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:a15 a bb1:bus-top-minus-15.",
                      "wireFrom": "bb1:a15",
                      "wireTo": "bb1:bus-top-minus-15",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-4",
                      "to": "bb1:a4",
                      "color": "red"
              },
              {
                      "from": "bb1:a3",
                      "to": "bb1:a21",
                      "color": "blue"
              },
              {
                      "from": "bb1:a5",
                      "to": "bb1:a18",
                      "color": "orange"
              },
              {
                      "from": "bb1:a15",
                      "to": "bb1:bus-top-minus-15",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 140.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 196.5,
                      "y": 58.75
              },
              "r2": {
                      "x": 196.5,
                      "y": 98.75
              },
              "rgb1": {
                      "x": 256.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E3, E4, E5.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e3",
                              "pot1:signal": "bb1:e4",
                              "pot1:gnd": "bb1:e5"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori C15, C19.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c15",
                              "r1:pin2": "bb1:c19"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED RGB nei fori D18, D19, D20, D21.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d18",
                              "rgb1:common": "bb1:d19",
                              "rgb1:green": "bb1:d20",
                              "rgb1:blue": "bb1:d21"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-4 a bb1:a4.",
                      "wireFrom": "bb1:bus-top-plus-4",
                      "wireTo": "bb1:a4",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLUE da bb1:a3 a bb1:a21.",
                      "wireFrom": "bb1:a3",
                      "wireTo": "bb1:a21",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo ORANGE da bb1:a5 a bb1:a18.",
                      "wireFrom": "bb1:a5",
                      "wireTo": "bb1:a18",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:a15 a bb1:bus-top-minus-15.",
                      "wireFrom": "bb1:a15",
                      "wireTo": "bb1:bus-top-minus-15",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "potentiometer",
                      "id": "pot2",
                      "value": 10000
              },
              {
                      "type": "potentiometer",
                      "id": "pot3",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r3",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-12",
                      "to": "bb1:a12",
                      "color": "red"
              },
              {
                      "from": "bb1:a3",
                      "to": "bb1:a17",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:c19",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a13",
                      "to": "bb1:f17",
                      "color": "yellow"
              },
              {
                      "from": "bb1:bus-top-plus-1",
                      "to": "bb1:bus-bot-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:a24",
                      "to": "bb1:a27",
                      "color": "orange"
              },
              {
                      "from": "bb1:c26",
                      "to": "bb1:c29",
                      "color": "green"
              },
              {
                      "from": "bb1:f24",
                      "to": "bb1:a30",
                      "color": "blue"
              },
              {
                      "from": "bb1:a4",
                      "to": "bb1:bus-top-minus-4",
                      "color": "black"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:bus-top-minus-9",
                      "color": "black"
              },
              {
                      "from": "bb1:a14",
                      "to": "bb1:bus-top-minus-14",
                      "color": "black"
              },
              {
                      "from": "bb1:a28",
                      "to": "bb1:bus-top-minus-28",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 132.75,
                      "y": 51.25
              },
              "pot2": {
                      "x": 170.25,
                      "y": 51.25
              },
              "pot3": {
                      "x": 207.75,
                      "y": 51.25
              },
              "r1": {
                      "x": 264,
                      "y": 51.25
              },
              "r2": {
                      "x": 279,
                      "y": 73.75
              },
              "r3": {
                      "x": 264,
                      "y": 106.25
              },
              "rgb1": {
                      "x": 324,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E2, E3, E4.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e2",
                              "pot1:signal": "bb1:e3",
                              "pot1:gnd": "bb1:e4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E7, E8, E9.",
                      "componentId": "pot2",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot2:vcc": "bb1:e7",
                              "pot2:signal": "bb1:e8",
                              "pot2:gnd": "bb1:e9"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E12, E13, E14.",
                      "componentId": "pot3",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot3:vcc": "bb1:e12",
                              "pot3:signal": "bb1:e13",
                              "pot3:gnd": "bb1:e14"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona resistore da 470 ohm nei fori B17, B24.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:b17",
                              "r1:pin2": "bb1:b24"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona resistore da 470 ohm nei fori E19, E26.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:e19",
                              "r2:pin2": "bb1:e26"
                      }
              },
              {
                      "step": 8,
                      "text": "Posiziona resistore da 470 ohm nei fori H17, H24.",
                      "componentId": "r3",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r3:pin1": "bb1:h17",
                              "r3:pin2": "bb1:h24"
                      }
              },
              {
                      "step": 9,
                      "text": "Posiziona LED RGB nei fori D27, D28, D29, D30.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d27",
                              "rgb1:common": "bb1:d28",
                              "rgb1:green": "bb1:d29",
                              "rgb1:blue": "bb1:d30"
                      }
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo RED da bb1:bus-top-plus-7 a bb1:a7.",
                      "wireFrom": "bb1:bus-top-plus-7",
                      "wireTo": "bb1:a7",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo RED da bb1:bus-top-plus-12 a bb1:a12.",
                      "wireFrom": "bb1:bus-top-plus-12",
                      "wireTo": "bb1:a12",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo YELLOW da bb1:a3 a bb1:a17.",
                      "wireFrom": "bb1:a3",
                      "wireTo": "bb1:a17",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo YELLOW da bb1:a8 a bb1:c19.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:c19",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo YELLOW da bb1:a13 a bb1:f17.",
                      "wireFrom": "bb1:a13",
                      "wireTo": "bb1:f17",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo RED da bb1:bus-top-plus-1 a bb1:bus-bot-plus-1.",
                      "wireFrom": "bb1:bus-top-plus-1",
                      "wireTo": "bb1:bus-bot-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo ORANGE da bb1:a24 a bb1:a27.",
                      "wireFrom": "bb1:a24",
                      "wireTo": "bb1:a27",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 19,
                      "text": "Collega un filo GREEN da bb1:c26 a bb1:c29.",
                      "wireFrom": "bb1:c26",
                      "wireTo": "bb1:c29",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 20,
                      "text": "Collega un filo BLUE da bb1:f24 a bb1:a30.",
                      "wireFrom": "bb1:f24",
                      "wireTo": "bb1:a30",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 21,
                      "text": "Collega un filo BLACK da bb1:a4 a bb1:bus-top-minus-4.",
                      "wireFrom": "bb1:a4",
                      "wireTo": "bb1:bus-top-minus-4",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 22,
                      "text": "Collega un filo BLACK da bb1:a9 a bb1:bus-top-minus-9.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:bus-top-minus-9",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 23,
                      "text": "Collega un filo BLACK da bb1:a14 a bb1:bus-top-minus-14.",
                      "wireFrom": "bb1:a14",
                      "wireTo": "bb1:bus-top-minus-14",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 24,
                      "text": "Collega un filo BLACK da bb1:a28 a bb1:bus-top-minus-28.",
                      "wireFrom": "bb1:a28",
                      "wireTo": "bb1:bus-top-minus-28",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 25,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:j4",
                      "to": "bb1:j7",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j7",
                      "to": "bb1:a7",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:a12",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a19",
                      "to": "bb1:a22",
                      "color": "orange"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:bus-top-minus-9",
                      "color": "black"
              },
              {
                      "from": "bb1:a23",
                      "to": "bb1:bus-top-minus-23",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "btn1": {
                      "x": 140.25,
                      "y": 82.5
              },
              "pot1": {
                      "x": 170.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 226.5,
                      "y": 73.75
              },
              "rgb1": {
                      "x": 286.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E7, E8, E9.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e7",
                              "pot1:signal": "bb1:e8",
                              "pot1:gnd": "bb1:e9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona pulsante nei fori E2, F4.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e2",
                              "btn1:pin2": "bb1:f4"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona resistore da 470 ohm nei fori E12, E19.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e12",
                              "r1:pin2": "bb1:e19"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED RGB nei fori D22, D23, D24, D25.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d22",
                              "rgb1:common": "bb1:d23",
                              "rgb1:green": "bb1:d24",
                              "rgb1:blue": "bb1:d25"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo YELLOW da bb1:j4 a bb1:j7.",
                      "wireFrom": "bb1:j4",
                      "wireTo": "bb1:j7",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo YELLOW da bb1:j7 a bb1:a7.",
                      "wireFrom": "bb1:j7",
                      "wireTo": "bb1:a7",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo YELLOW da bb1:a8 a bb1:a12.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:a12",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo ORANGE da bb1:a19 a bb1:a22.",
                      "wireFrom": "bb1:a19",
                      "wireTo": "bb1:a22",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLACK da bb1:a9 a bb1:bus-top-minus-9.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:bus-top-minus-9",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:a23 a bb1:bus-top-minus-23.",
                      "wireFrom": "bb1:a23",
                      "wireTo": "bb1:bus-top-minus-23",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "potentiometer",
                      "id": "pot2",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:a3",
                      "to": "bb1:a12",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:f12",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a19",
                      "to": "bb1:a22",
                      "color": "orange"
              },
              {
                      "from": "bb1:f19",
                      "to": "bb1:a25",
                      "color": "blue"
              },
              {
                      "from": "bb1:a4",
                      "to": "bb1:bus-top-minus-4",
                      "color": "black"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:bus-top-minus-9",
                      "color": "black"
              },
              {
                      "from": "bb1:a23",
                      "to": "bb1:bus-top-minus-23",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 132.75,
                      "y": 51.25
              },
              "pot2": {
                      "x": 170.25,
                      "y": 51.25
              },
              "r1": {
                      "x": 226.5,
                      "y": 58.75
              },
              "r2": {
                      "x": 226.5,
                      "y": 98.75
              },
              "rgb1": {
                      "x": 286.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E2, E3, E4.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e2",
                              "pot1:signal": "bb1:e3",
                              "pot1:gnd": "bb1:e4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E7, E8, E9.",
                      "componentId": "pot2",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot2:vcc": "bb1:e7",
                              "pot2:signal": "bb1:e8",
                              "pot2:gnd": "bb1:e9"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona resistore da 470 ohm nei fori C12, C19.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c12",
                              "r1:pin2": "bb1:c19"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona resistore da 470 ohm nei fori G12, G19.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:g12",
                              "r2:pin2": "bb1:g19"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona LED RGB nei fori D22, D23, D24, D25.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d22",
                              "rgb1:common": "bb1:d23",
                              "rgb1:green": "bb1:d24",
                              "rgb1:blue": "bb1:d25"
                      }
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-top-plus-7 a bb1:a7.",
                      "wireFrom": "bb1:bus-top-plus-7",
                      "wireTo": "bb1:a7",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo YELLOW da bb1:a3 a bb1:a12.",
                      "wireFrom": "bb1:a3",
                      "wireTo": "bb1:a12",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo YELLOW da bb1:a8 a bb1:f12.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:f12",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo ORANGE da bb1:a19 a bb1:a22.",
                      "wireFrom": "bb1:a19",
                      "wireTo": "bb1:a22",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLUE da bb1:f19 a bb1:a25.",
                      "wireFrom": "bb1:f19",
                      "wireTo": "bb1:a25",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:a4 a bb1:bus-top-minus-4.",
                      "wireFrom": "bb1:a4",
                      "wireTo": "bb1:bus-top-minus-4",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:a9 a bb1:bus-top-minus-9.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:bus-top-minus-9",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo BLACK da bb1:a23 a bb1:bus-top-minus-23.",
                      "wireFrom": "bb1:a23",
                      "wireTo": "bb1:bus-top-minus-23",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "potentiometer",
                      "id": "pot2",
                      "value": 10000
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
      ],
      pinAssignments: {
              "btn1:pin1": "bb1:e2",
              "btn1:pin2": "bb1:f4",
              "pot1:vcc": "bb1:e7",
              "pot1:signal": "bb1:e8",
              "pot1:gnd": "bb1:e9",
              "pot2:vcc": "bb1:e12",
              "pot2:signal": "bb1:e13",
              "pot2:gnd": "bb1:e14",
              "r1:pin1": "bb1:c17",
              "r1:pin2": "bb1:c24",
              "r2:pin1": "bb1:g17",
              "r2:pin2": "bb1:g24",
              "rgb1:red": "bb1:d27",
              "rgb1:common": "bb1:d28",
              "rgb1:green": "bb1:d29",
              "rgb1:blue": "bb1:d30"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:j4",
                      "to": "bb1:a7",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j4",
                      "to": "bb1:a12",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:a17",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a13",
                      "to": "bb1:f17",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a24",
                      "to": "bb1:a27",
                      "color": "orange"
              },
              {
                      "from": "bb1:f24",
                      "to": "bb1:a30",
                      "color": "blue"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:bus-top-minus-9",
                      "color": "black"
              },
              {
                      "from": "bb1:a14",
                      "to": "bb1:bus-top-minus-14",
                      "color": "black"
              },
              {
                      "from": "bb1:a28",
                      "to": "bb1:bus-top-minus-28",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "btn1": {
                      "x": 140.25,
                      "y": 82.5
              },
              "pot1": {
                      "x": 170.25,
                      "y": 51.25
              },
              "pot2": {
                      "x": 207.75,
                      "y": 51.25
              },
              "r1": {
                      "x": 264,
                      "y": 51.25
              },
              "r2": {
                      "x": 264,
                      "y": 106.25
              },
              "rgb1": {
                      "x": 324,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E7, E8, E9.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e7",
                              "pot1:signal": "bb1:e8",
                              "pot1:gnd": "bb1:e9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E12, E13, E14.",
                      "componentId": "pot2",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot2:vcc": "bb1:e12",
                              "pot2:signal": "bb1:e13",
                              "pot2:gnd": "bb1:e14"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona pulsante nei fori E2, F4.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e2",
                              "btn1:pin2": "bb1:f4"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona resistore da 470 ohm nei fori C17, C24.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c17",
                              "r1:pin2": "bb1:c24"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona resistore da 470 ohm nei fori G17, G24.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:g17",
                              "r2:pin2": "bb1:g24"
                      }
              },
              {
                      "step": 8,
                      "text": "Posiziona LED RGB nei fori D27, D28, D29, D30.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d27",
                              "rgb1:common": "bb1:d28",
                              "rgb1:green": "bb1:d29",
                              "rgb1:blue": "bb1:d30"
                      }
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo YELLOW da bb1:j4 a bb1:a7.",
                      "wireFrom": "bb1:j4",
                      "wireTo": "bb1:a7",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo YELLOW da bb1:j4 a bb1:a12.",
                      "wireFrom": "bb1:j4",
                      "wireTo": "bb1:a12",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo YELLOW da bb1:a8 a bb1:a17.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:a17",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo YELLOW da bb1:a13 a bb1:f17.",
                      "wireFrom": "bb1:a13",
                      "wireTo": "bb1:f17",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo ORANGE da bb1:a24 a bb1:a27.",
                      "wireFrom": "bb1:a24",
                      "wireTo": "bb1:a27",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLUE da bb1:f24 a bb1:a30.",
                      "wireFrom": "bb1:f24",
                      "wireTo": "bb1:a30",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo BLACK da bb1:a9 a bb1:bus-top-minus-9.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:bus-top-minus-9",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo BLACK da bb1:a14 a bb1:bus-top-minus-14.",
                      "wireFrom": "bb1:a14",
                      "wireTo": "bb1:bus-top-minus-14",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 19,
                      "text": "Collega un filo BLACK da bb1:a28 a bb1:bus-top-minus-28.",
                      "wireFrom": "bb1:a28",
                      "wireTo": "bb1:bus-top-minus-28",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 20,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr1"
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "red"
              }
      ],
      pinAssignments: {
              "ldr1:pin1": "bb1:d5",
              "ldr1:pin2": "bb1:d8",
              "led1:anode": "bb1:d9",
              "led1:cathode": "bb1:d10"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:a9",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a10",
                      "to": "bb1:bus-top-minus-10",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "ldr1": {
                      "x": 151.5,
                      "y": 43.75
              },
              "led1": {
                      "x": 189,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona fotoresistore nei fori D5, D8.",
                      "componentId": "ldr1",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr1:pin1": "bb1:d5",
                              "ldr1:pin2": "bb1:d8"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED red nei fori D9, D10.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d9",
                              "led1:cathode": "bb1:d10"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo YELLOW da bb1:a8 a bb1:a9.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:a9",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:a10 a bb1:bus-top-minus-10.",
                      "wireFrom": "bb1:a10",
                      "wireTo": "bb1:bus-top-minus-10",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr1"
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "blue"
              }
      ],
      pinAssignments: {
              "ldr1:pin1": "bb1:d5",
              "ldr1:pin2": "bb1:d8",
              "led1:anode": "bb1:d9",
              "led1:cathode": "bb1:d10"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:a9",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a10",
                      "to": "bb1:bus-top-minus-10",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "ldr1": {
                      "x": 151.5,
                      "y": 43.75
              },
              "r1": {
                      "x": 170,
                      "y": 43.75
              },
              "led1": {
                      "x": 189,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona fotoresistore nei fori D5, D8.",
                      "componentId": "ldr1",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr1:pin1": "bb1:d5",
                              "ldr1:pin2": "bb1:d8"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED blue nei fori D9, D10.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d9",
                              "led1:cathode": "bb1:d10"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo YELLOW da bb1:a8 a bb1:a9.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:a9",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da bb1:a10 a bb1:bus-top-minus-10.",
                      "wireFrom": "bb1:a10",
                      "wireTo": "bb1:bus-top-minus-10",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr1"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr2"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr3"
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-3",
                      "to": "bb1:a3",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-7",
                      "to": "bb1:a7",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-11",
                      "to": "bb1:a11",
                      "color": "red"
              },
              {
                      "from": "bb1:a4",
                      "to": "bb1:a19",
                      "color": "orange"
              },
              {
                      "from": "bb1:a8",
                      "to": "bb1:a21",
                      "color": "green"
              },
              {
                      "from": "bb1:a12",
                      "to": "bb1:a22",
                      "color": "blue"
              },
              {
                      "from": "bb1:a20",
                      "to": "bb1:bus-top-minus-20",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "ldr1": {
                      "x": 136.5,
                      "y": 43.75
              },
              "ldr2": {
                      "x": 166.5,
                      "y": 43.75
              },
              "ldr3": {
                      "x": 196.5,
                      "y": 43.75
              },
              "rgb1": {
                      "x": 234,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona fotoresistore nei fori D3, D4.",
                      "componentId": "ldr1",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr1:pin1": "bb1:d3",
                              "ldr1:pin2": "bb1:d4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona fotoresistore nei fori D7, D8.",
                      "componentId": "ldr2",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr2:pin1": "bb1:d7",
                              "ldr2:pin2": "bb1:d8"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona fotoresistore nei fori D11, D12.",
                      "componentId": "ldr3",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr3:pin1": "bb1:d11",
                              "ldr3:pin2": "bb1:d12"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED RGB nei fori D19, D20, D21, D22.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d19",
                              "rgb1:common": "bb1:d20",
                              "rgb1:green": "bb1:d21",
                              "rgb1:blue": "bb1:d22"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-3 a bb1:a3.",
                      "wireFrom": "bb1:bus-top-plus-3",
                      "wireTo": "bb1:a3",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-7 a bb1:a7.",
                      "wireFrom": "bb1:bus-top-plus-7",
                      "wireTo": "bb1:a7",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-top-plus-11 a bb1:a11.",
                      "wireFrom": "bb1:bus-top-plus-11",
                      "wireTo": "bb1:a11",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo ORANGE da bb1:a4 a bb1:a19.",
                      "wireFrom": "bb1:a4",
                      "wireTo": "bb1:a19",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo GREEN da bb1:a8 a bb1:a21.",
                      "wireFrom": "bb1:a8",
                      "wireTo": "bb1:a21",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLUE da bb1:a12 a bb1:a22.",
                      "wireFrom": "bb1:a12",
                      "wireTo": "bb1:a22",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:a20 a bb1:bus-top-minus-20.",
                      "wireFrom": "bb1:a20",
                      "wireTo": "bb1:bus-top-minus-20",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "white"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr1"
              },
              {
                      "type": "led",
                      "id": "led2",
                      "color": "blue"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-bot-plus-5",
                      "to": "bb1:j5",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-1",
                      "to": "bb1:bus-bot-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:a12",
                      "to": "bb1:a14",
                      "color": "orange"
              },
              {
                      "from": "bb1:a15",
                      "to": "bb1:bus-top-minus-15",
                      "color": "black"
              },
              {
                      "from": "bb1:j6",
                      "to": "bb1:j14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j15",
                      "to": "bb1:bus-bot-minus-15",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bb1:bus-bot-minus-1",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "r1": {
                      "x": 174,
                      "y": 58.75
              },
              "led1": {
                      "x": 219,
                      "y": 28.75
              },
              "ldr1": {
                      "x": 151.5,
                      "y": 83.75
              },
              "led2": {
                      "x": 219,
                      "y": 83.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona resistore da 470 ohm nei fori C5, C12.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c5",
                              "r1:pin2": "bb1:c12"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED white nei fori B14, B15.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:b14",
                              "led1:cathode": "bb1:b15"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona fotoresistore nei fori H5, H6.",
                      "componentId": "ldr1",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr1:pin1": "bb1:h5",
                              "ldr1:pin2": "bb1:h6"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED blue nei fori H14, H15.",
                      "componentId": "led2",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led2:anode": "bb1:h14",
                              "led2:cathode": "bb1:h15"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-bot-plus-5 a bb1:j5.",
                      "wireFrom": "bb1:bus-bot-plus-5",
                      "wireTo": "bb1:j5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-top-plus-1 a bb1:bus-bot-plus-1.",
                      "wireFrom": "bb1:bus-top-plus-1",
                      "wireTo": "bb1:bus-bot-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo ORANGE da bb1:a12 a bb1:a14.",
                      "wireFrom": "bb1:a12",
                      "wireTo": "bb1:a14",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:a15 a bb1:bus-top-minus-15.",
                      "wireFrom": "bb1:a15",
                      "wireTo": "bb1:bus-top-minus-15",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo YELLOW da bb1:j6 a bb1:j14.",
                      "wireFrom": "bb1:j6",
                      "wireTo": "bb1:j14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:j15 a bb1:bus-bot-minus-15.",
                      "wireFrom": "bb1:j15",
                      "wireTo": "bb1:bus-bot-minus-15",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bb1:bus-bot-minus-1.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bb1:bus-bot-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "white"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr1"
              },
              {
                      "type": "led",
                      "id": "led2",
                      "color": "blue"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-bot-plus-5",
                      "to": "bb1:j5",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-1",
                      "to": "bb1:bus-bot-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:a3",
                      "to": "bb1:a7",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a14",
                      "to": "bb1:a16",
                      "color": "orange"
              },
              {
                      "from": "bb1:a17",
                      "to": "bb1:bus-top-minus-17",
                      "color": "black"
              },
              {
                      "from": "bb1:j6",
                      "to": "bb1:j14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j15",
                      "to": "bb1:bus-bot-minus-15",
                      "color": "black"
              },
              {
                      "from": "bb1:a4",
                      "to": "bb1:bus-top-minus-4",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bb1:bus-bot-minus-1",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "pot1": {
                      "x": 132.75,
                      "y": 51.25
              },
              "r1": {
                      "x": 189,
                      "y": 58.75
              },
              "led1": {
                      "x": 234,
                      "y": 28.75
              },
              "ldr1": {
                      "x": 151.5,
                      "y": 83.75
              },
              "led2": {
                      "x": 219,
                      "y": 83.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E2, E3, E4.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e2",
                              "pot1:signal": "bb1:e3",
                              "pot1:gnd": "bb1:e4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori C7, C14.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c7",
                              "r1:pin2": "bb1:c14"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED white nei fori B16, B17.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:b16",
                              "led1:cathode": "bb1:b17"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona fotoresistore nei fori H5, H6.",
                      "componentId": "ldr1",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr1:pin1": "bb1:h5",
                              "ldr1:pin2": "bb1:h6"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona LED blue nei fori H14, H15.",
                      "componentId": "led2",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led2:anode": "bb1:h14",
                              "led2:cathode": "bb1:h15"
                      }
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo RED da bb1:bus-bot-plus-5 a bb1:j5.",
                      "wireFrom": "bb1:bus-bot-plus-5",
                      "wireTo": "bb1:j5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo RED da bb1:bus-top-plus-1 a bb1:bus-bot-plus-1.",
                      "wireFrom": "bb1:bus-top-plus-1",
                      "wireTo": "bb1:bus-bot-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo YELLOW da bb1:a3 a bb1:a7.",
                      "wireFrom": "bb1:a3",
                      "wireTo": "bb1:a7",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo ORANGE da bb1:a14 a bb1:a16.",
                      "wireFrom": "bb1:a14",
                      "wireTo": "bb1:a16",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:a17 a bb1:bus-top-minus-17.",
                      "wireFrom": "bb1:a17",
                      "wireTo": "bb1:bus-top-minus-17",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo YELLOW da bb1:j6 a bb1:j14.",
                      "wireFrom": "bb1:j6",
                      "wireTo": "bb1:j14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:j15 a bb1:bus-bot-minus-15.",
                      "wireFrom": "bb1:j15",
                      "wireTo": "bb1:bus-bot-minus-15",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo BLACK da bb1:a4 a bb1:bus-top-minus-4.",
                      "wireFrom": "bb1:a4",
                      "wireTo": "bb1:bus-top-minus-4",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 19,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bb1:bus-bot-minus-1.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bb1:bus-bot-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "photo-resistor",
                      "id": "ldr1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "white"
              },
              {
                      "type": "led",
                      "id": "led2",
                      "color": "blue"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-2",
                      "to": "bb1:a2",
                      "color": "red"
              },
              {
                      "from": "bb1:j4",
                      "to": "bb1:a14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a17",
                      "to": "bb1:a18",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a19",
                      "to": "bb1:bus-top-minus-19",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-plus-6",
                      "to": "bb1:a6",
                      "color": "red"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:a10",
                      "color": "orange"
              },
              {
                      "from": "bb1:a11",
                      "to": "bb1:bus-top-minus-11",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "btn1": {
                      "x": 140.25,
                      "y": 82.5
              },
              "ldr1": {
                      "x": 166.5,
                      "y": 43.75
              },
              "r1": {
                      "x": 185,
                      "y": 43.75
              },
              "led1": {
                      "x": 204,
                      "y": 43.75
              },
              "led2": {
                      "x": 224,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona pulsante nei fori E2, F4.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e2",
                              "btn1:pin2": "bb1:f4"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona fotoresistore nei fori D14, D17.",
                      "componentId": "ldr1",
                      "componentType": "photo-resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "ldr1:pin1": "bb1:d14",
                              "ldr1:pin2": "bb1:d17"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona resistore da 470 ohm nei fori D6, D9.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:d6",
                              "r1:pin2": "bb1:d9"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED white nei fori D10, D11.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d10",
                              "led1:cathode": "bb1:d11"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona LED blue nei fori D18, D19.",
                      "componentId": "led2",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led2:anode": "bb1:d18",
                              "led2:cathode": "bb1:d19"
                      }
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-top-plus-2 a bb1:a2.",
                      "wireFrom": "bb1:bus-top-plus-2",
                      "wireTo": "bb1:a2",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo YELLOW da bb1:j4 a bb1:a14.",
                      "wireFrom": "bb1:j4",
                      "wireTo": "bb1:a14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo YELLOW da bb1:a17 a bb1:a18.",
                      "wireFrom": "bb1:a17",
                      "wireTo": "bb1:a18",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:a19 a bb1:bus-top-minus-19.",
                      "wireFrom": "bb1:a19",
                      "wireTo": "bb1:bus-top-minus-19",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo RED da bb1:bus-top-plus-6 a bb1:a6.",
                      "wireFrom": "bb1:bus-top-plus-6",
                      "wireTo": "bb1:a6",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo ORANGE da bb1:a9 a bb1:a10.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:a10",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo BLACK da bb1:a11 a bb1:bus-top-minus-11.",
                      "wireFrom": "bb1:a11",
                      "wireTo": "bb1:bus-top-minus-11",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "buzzer-piezo",
                      "id": "buz1"
              }
      ],
      pinAssignments: {
              "buz1:positive": "bb1:bus-bot-plus-27",
              "buz1:negative": "bb1:bus-top-minus-27"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-bot-plus-1",
                      "color": "red"
              },
              {
                      "from": "bat1:negative",
                      "to": "bb1:bus-top-minus-1",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bb1:bus-top-minus-27",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-plus-1",
                      "to": "bb1:bus-bot-plus-27",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-bot-plus-27",
                      "to": "buz1:positive",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-minus-27",
                      "to": "buz1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "buz1": {
                      "x": 350,
                      "y": 88
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona cicalino nei fori BUS-BOT-PLUS-27, BUS-TOP-MINUS-27.",
                      "componentId": "buz1",
                      "componentType": "buzzer-piezo",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "buz1:positive": "bb1:bus-bot-plus-27",
                              "buz1:negative": "bb1:bus-top-minus-27"
                      }
              },
              {
                      "step": 4,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-bot-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-bot-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 5,
                      "text": "Collega un filo BLACK da bat1:negative a bb1:bus-top-minus-1.",
                      "wireFrom": "bat1:negative",
                      "wireTo": "bb1:bus-top-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bb1:bus-top-minus-27.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bb1:bus-top-minus-27",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-bot-plus-1 a bb1:bus-bot-plus-27.",
                      "wireFrom": "bb1:bus-bot-plus-1",
                      "wireTo": "bb1:bus-bot-plus-27",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-bot-plus-27 a buz1:positive.",
                      "wireFrom": "bb1:bus-bot-plus-27",
                      "wireTo": "buz1:positive",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-27 a buz1:negative.",
                      "wireFrom": "bb1:bus-top-minus-27",
                      "wireTo": "buz1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "push-button",
                      "id": "btn1"
              },
              {
                      "type": "buzzer-piezo",
                      "id": "buz1"
              }
      ],
      pinAssignments: {
              "btn1:pin1": "bb1:e14",
              "btn1:pin2": "bb1:f16"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-bot-plus-1",
                      "color": "red"
              },
              {
                      "from": "bat1:negative",
                      "to": "bb1:bus-top-minus-1",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bb1:bus-top-minus-27",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-bot-plus-1",
                      "to": "bb1:bus-bot-plus-27",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-bot-plus-24",
                      "to": "buz1:positive",
                      "color": "red"
              },
              {
                      "from": "buz1:negative",
                      "to": "bb1:j16",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-14",
                      "to": "bb1:e14",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "btn1": {
                      "x": 230.25,
                      "y": 81.25
              },
              "buz1": {
                      "x": 350,
                      "y": 88
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona pulsante nei fori E14, F16.",
                      "componentId": "btn1",
                      "componentType": "push-button",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "btn1:pin1": "bb1:e14",
                              "btn1:pin2": "bb1:f16"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona cicalino.",
                      "componentId": "buz1",
                      "componentType": "buzzer-piezo",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-bot-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-bot-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo BLACK da bat1:negative a bb1:bus-top-minus-1.",
                      "wireFrom": "bat1:negative",
                      "wireTo": "bb1:bus-top-minus-1",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bb1:bus-top-minus-27.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bb1:bus-top-minus-27",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-bot-plus-1 a bb1:bus-bot-plus-27.",
                      "wireFrom": "bb1:bus-bot-plus-1",
                      "wireTo": "bb1:bus-bot-plus-27",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo RED da bb1:bus-bot-plus-24 a buz1:positive.",
                      "wireFrom": "bb1:bus-bot-plus-24",
                      "wireTo": "buz1:positive",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da buz1:negative a bb1:j16.",
                      "wireFrom": "buz1:negative",
                      "wireTo": "bb1:j16",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-14 a bb1:e14.",
                      "wireFrom": "bb1:bus-top-minus-14",
                      "wireTo": "bb1:e14",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "reed-switch",
                      "id": "reed1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "red"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a11",
                      "to": "bb1:a14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a22",
                      "to": "bb1:bus-top-minus-22",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "reed1": {
                      "x": 170.25,
                      "y": 58.75
              },
              "r1": {
                      "x": 241.5,
                      "y": 73.75
              },
              "led1": {
                      "x": 271.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona interruttore magnetico nei fori C5, C11.",
                      "componentId": "reed1",
                      "componentType": "reed-switch",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "reed1:pin1": "bb1:c5",
                              "reed1:pin2": "bb1:c11"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E14, E21.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e14",
                              "r1:pin2": "bb1:e21"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED red nei fori D21, D22.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d21",
                              "led1:cathode": "bb1:d22"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo YELLOW da bb1:a11 a bb1:a14.",
                      "wireFrom": "bb1:a11",
                      "wireTo": "bb1:a14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:a22 a bb1:bus-top-minus-22.",
                      "wireFrom": "bb1:a22",
                      "wireTo": "bb1:bus-top-minus-22",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "reed-switch",
                      "id": "reed1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "red"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a11",
                      "to": "bb1:a14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a22",
                      "to": "bb1:bus-top-minus-22",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "reed1": {
                      "x": 170.25,
                      "y": 58.75
              },
              "r1": {
                      "x": 241.5,
                      "y": 73.75
              },
              "led1": {
                      "x": 271.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona interruttore magnetico nei fori C5, C11.",
                      "componentId": "reed1",
                      "componentType": "reed-switch",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "reed1:pin1": "bb1:c5",
                              "reed1:pin2": "bb1:c11"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E14, E21.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e14",
                              "r1:pin2": "bb1:e21"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED red nei fori D21, D22.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:d21",
                              "led1:cathode": "bb1:d22"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo YELLOW da bb1:a11 a bb1:a14.",
                      "wireFrom": "bb1:a11",
                      "wireTo": "bb1:a14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da bb1:a22 a bb1:bus-top-minus-22.",
                      "wireFrom": "bb1:a22",
                      "wireTo": "bb1:bus-top-minus-22",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "reed-switch",
                      "id": "reed1"
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-5",
                      "to": "bb1:a5",
                      "color": "red"
              },
              {
                      "from": "bb1:a11",
                      "to": "bb1:a14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a21",
                      "to": "bb1:a24",
                      "color": "orange"
              },
              {
                      "from": "bb1:a25",
                      "to": "bb1:bus-top-minus-25",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "reed1": {
                      "x": 170.25,
                      "y": 58.75
              },
              "r1": {
                      "x": 241.5,
                      "y": 73.75
              },
              "rgb1": {
                      "x": 301.5,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona interruttore magnetico nei fori C5, C11.",
                      "componentId": "reed1",
                      "componentType": "reed-switch",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "reed1:pin1": "bb1:c5",
                              "reed1:pin2": "bb1:c11"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona resistore da 470 ohm nei fori E14, E21.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e14",
                              "r1:pin2": "bb1:e21"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona LED RGB nei fori D24, D25, D26, D27.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d24",
                              "rgb1:common": "bb1:d25",
                              "rgb1:green": "bb1:d26",
                              "rgb1:blue": "bb1:d27"
                      }
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bb1:bus-top-plus-5 a bb1:a5.",
                      "wireFrom": "bb1:bus-top-plus-5",
                      "wireTo": "bb1:a5",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo YELLOW da bb1:a11 a bb1:a14.",
                      "wireFrom": "bb1:a11",
                      "wireTo": "bb1:a14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo ORANGE da bb1:a21 a bb1:a24.",
                      "wireFrom": "bb1:a21",
                      "wireTo": "bb1:a24",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da bb1:a25 a bb1:bus-top-minus-25.",
                      "wireFrom": "bb1:a25",
                      "wireTo": "bb1:bus-top-minus-25",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-half",
                      "id": "bb1"
              },
              {
                      "type": "reed-switch",
                      "id": "reed1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 470
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-top-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-top-plus-3",
                      "to": "bb1:a3",
                      "color": "red"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:a12",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a13",
                      "to": "bb1:a17",
                      "color": "green"
              },
              {
                      "from": "bb1:a24",
                      "to": "bb1:a27",
                      "color": "orange"
              },
              {
                      "from": "bb1:a14",
                      "to": "bb1:bus-top-minus-14",
                      "color": "black"
              },
              {
                      "from": "bb1:a28",
                      "to": "bb1:bus-top-minus-28",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-top-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 100,
                      "y": 10
              },
              "reed1": {
                      "x": 155.25,
                      "y": 58.75
              },
              "pot1": {
                      "x": 207.75,
                      "y": 51.25
              },
              "r1": {
                      "x": 264,
                      "y": 73.75
              },
              "rgb1": {
                      "x": 324,
                      "y": 43.75
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard mezza.",
                      "componentId": "bb1",
                      "componentType": "breadboard-half",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona interruttore magnetico nei fori C3, C9.",
                      "componentId": "reed1",
                      "componentType": "reed-switch",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "reed1:pin1": "bb1:c3",
                              "reed1:pin2": "bb1:c9"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E12, E13, E14.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e12",
                              "pot1:signal": "bb1:e13",
                              "pot1:gnd": "bb1:e14"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona resistore da 470 ohm nei fori E17, E24.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:e17",
                              "r1:pin2": "bb1:e24"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona LED RGB nei fori D27, D28, D29, D30.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d27",
                              "rgb1:common": "bb1:d28",
                              "rgb1:green": "bb1:d29",
                              "rgb1:blue": "bb1:d30"
                      }
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-top-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-top-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo RED da bb1:bus-top-plus-3 a bb1:a3.",
                      "wireFrom": "bb1:bus-top-plus-3",
                      "wireTo": "bb1:a3",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo YELLOW da bb1:a9 a bb1:a12.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:a12",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo GREEN da bb1:a13 a bb1:a17.",
                      "wireFrom": "bb1:a13",
                      "wireTo": "bb1:a17",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 11,
                      "text": "Collega un filo ORANGE da bb1:a24 a bb1:a27.",
                      "wireFrom": "bb1:a24",
                      "wireTo": "bb1:a27",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 12,
                      "text": "Collega un filo BLACK da bb1:a14 a bb1:bus-top-minus-14.",
                      "wireFrom": "bb1:a14",
                      "wireTo": "bb1:bus-top-minus-14",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 13,
                      "text": "Collega un filo BLACK da bb1:a28 a bb1:bus-top-minus-28.",
                      "wireFrom": "bb1:a28",
                      "wireTo": "bb1:bus-top-minus-28",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 14,
                      "text": "Collega un filo BLACK da bb1:bus-top-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-top-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "white"
              }
      ],
      pinAssignments: {
              "led1:anode": "bat1:positive",
              "led1:cathode": "bat1:negative"
      },
      connections: [
              {
                      "from": "bat1:positive",
                      "to": "led1:anode",
                      "color": "red"
              },
              {
                      "from": "led1:cathode",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 70
              },
              "led1": {
                      "x": 210,
                      "y": 70
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona LED white nei fori BAT1:POSITIVE, BAT1:NEGATIVE.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bat1:positive",
                              "led1:cathode": "bat1:negative"
                      }
              },
              {
                      "step": 3,
                      "text": "Collega un filo RED da bat1:positive a led1:anode.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "led1:anode",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 4,
                      "text": "Collega un filo BLACK da led1:cathode a bat1:negative.",
                      "wireFrom": "led1:cathode",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "white"
              },
              {
                      "type": "led",
                      "id": "led2",
                      "color": "white"
              },
              {
                      "type": "led",
                      "id": "led3",
                      "color": "white"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "led1:anode",
                      "color": "red"
              },
              {
                      "from": "bat1:positive",
                      "to": "led2:anode",
                      "color": "red"
              },
              {
                      "from": "bat1:positive",
                      "to": "led3:anode",
                      "color": "red"
              },
              {
                      "from": "led1:cathode",
                      "to": "bat1:negative",
                      "color": "black"
              },
              {
                      "from": "led2:cathode",
                      "to": "bat1:negative",
                      "color": "black"
              },
              {
                      "from": "led3:cathode",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 30,
                      "y": 75
              },
              "led1": {
                      "x": 190,
                      "y": 45
              },
              "led2": {
                      "x": 230,
                      "y": 75
              },
              "led3": {
                      "x": 270,
                      "y": 105
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona LED white nei fori BAT1:POSITIVE, BAT1:NEGATIVE.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bat1:positive",
                              "led1:cathode": "bat1:negative"
                      }
              },
              {
                      "step": 3,
                      "text": "Posiziona LED white nei fori BAT1:POSITIVE, BAT1:NEGATIVE.",
                      "componentId": "led2",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led2:anode": "bat1:positive",
                              "led2:cathode": "bat1:negative"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona LED white nei fori BAT1:POSITIVE, BAT1:NEGATIVE.",
                      "componentId": "led3",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led3:anode": "bat1:positive",
                              "led3:cathode": "bat1:negative"
                      }
              },
              {
                      "step": 5,
                      "text": "Collega un filo RED da bat1:positive a led1:anode.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "led1:anode",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 6,
                      "text": "Collega un filo RED da bat1:positive a led2:anode.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "led2:anode",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 7,
                      "text": "Collega un filo RED da bat1:positive a led3:anode.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "led3:anode",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 8,
                      "text": "Collega un filo BLACK da led1:cathode a bat1:negative.",
                      "wireFrom": "led1:cathode",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 9,
                      "text": "Collega un filo BLACK da led2:cathode a bat1:negative.",
                      "wireFrom": "led2:cathode",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 10,
                      "text": "Collega un filo BLACK da led3:cathode a bat1:negative.",
                      "wireFrom": "led3:cathode",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
              {
                      "type": "battery9v",
                      "id": "bat1"
              },
              {
                      "type": "breadboard-full",
                      "id": "bb1"
              },
              {
                      "type": "potentiometer",
                      "id": "pot1",
                      "value": 10000
              },
              {
                      "type": "potentiometer",
                      "id": "pot2",
                      "value": 10000
              },
              {
                      "type": "potentiometer",
                      "id": "pot3",
                      "value": 10000
              },
              {
                      "type": "resistor",
                      "id": "r1",
                      "value": 220
              },
              {
                      "type": "resistor",
                      "id": "r2",
                      "value": 220
              },
              {
                      "type": "resistor",
                      "id": "r3",
                      "value": 220
              },
              {
                      "type": "resistor",
                      "id": "r4",
                      "value": 220
              },
              {
                      "type": "led",
                      "id": "led1",
                      "color": "green"
              },
              {
                      "type": "led",
                      "id": "led2",
                      "color": "green"
              },
              {
                      "type": "rgb-led",
                      "id": "rgb1"
              },
              {
                      "type": "reed-switch",
                      "id": "reed1"
              }
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
              {
                      "from": "bat1:positive",
                      "to": "bb1:bus-plus-1",
                      "color": "red"
              },
              {
                      "from": "bb1:bus-plus-3",
                      "to": "bb1:a3",
                      "color": "red"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:a14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:f14",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:a28",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:a33",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a9",
                      "to": "bb1:a38",
                      "color": "yellow"
              },
              {
                      "from": "bb1:a22",
                      "to": "bb1:bus-minus-22",
                      "color": "black"
              },
              {
                      "from": "bb1:g21",
                      "to": "bb1:g23",
                      "color": "yellow"
              },
              {
                      "from": "bb1:j24",
                      "to": "bb1:bus-minus-24",
                      "color": "black"
              },
              {
                      "from": "bb1:a29",
                      "to": "bb1:a43",
                      "color": "orange"
              },
              {
                      "from": "bb1:a50",
                      "to": "bb1:a53",
                      "color": "orange"
              },
              {
                      "from": "bb1:a34",
                      "to": "bb1:f43",
                      "color": "green"
              },
              {
                      "from": "bb1:f50",
                      "to": "bb1:a55",
                      "color": "green"
              },
              {
                      "from": "bb1:a39",
                      "to": "bb1:f53",
                      "color": "blue"
              },
              {
                      "from": "bb1:f60",
                      "to": "bb1:a56",
                      "color": "blue"
              },
              {
                      "from": "bb1:a30",
                      "to": "bb1:bus-minus-30",
                      "color": "black"
              },
              {
                      "from": "bb1:a35",
                      "to": "bb1:bus-minus-35",
                      "color": "black"
              },
              {
                      "from": "bb1:a40",
                      "to": "bb1:bus-minus-40",
                      "color": "black"
              },
              {
                      "from": "bb1:a54",
                      "to": "bb1:bus-minus-54",
                      "color": "black"
              },
              {
                      "from": "bb1:bus-minus-1",
                      "to": "bat1:negative",
                      "color": "black"
              }
      ],
      layout: {
              "bat1": {
                      "x": 15,
                      "y": 60
              },
              "bb1": {
                      "x": 80,
                      "y": 10
              },
              "reed1": {
                      "x": 130.25,
                      "y": 81.3
              },
              "r1": {
                      "x": 212.47,
                      "y": 81.3
              },
              "r2": {
                      "x": 212.47,
                      "y": 121.65
              },
              "led1": {
                      "x": 241.07,
                      "y": 60.15
              },
              "led2": {
                      "x": 255.38,
                      "y": 114.8
              },
              "pot1": {
                      "x": 294.7,
                      "y": 86.6
              },
              "pot2": {
                      "x": 330.45,
                      "y": 86.6
              },
              "pot3": {
                      "x": 366.2,
                      "y": 86.6
              },
              "r3": {
                      "x": 419.83,
                      "y": 74.15
              },
              "r4": {
                      "x": 419.83,
                      "y": 121.65
              },
              "rgb1": {
                      "x": 477.02,
                      "y": 65.95
              }
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
                      "step": 1,
                      "text": "Posiziona batteria 9V.",
                      "componentId": "bat1",
                      "componentType": "battery9v",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 2,
                      "text": "Posiziona breadboard grande.",
                      "componentId": "bb1",
                      "componentType": "breadboard-full",
                      "hint": "Ragazzi, verificate posizione e polarita'."
              },
              {
                      "step": 3,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E28, E29, E30.",
                      "componentId": "pot1",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot1:vcc": "bb1:e28",
                              "pot1:signal": "bb1:e29",
                              "pot1:gnd": "bb1:e30"
                      }
              },
              {
                      "step": 4,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E33, E34, E35.",
                      "componentId": "pot2",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot2:vcc": "bb1:e33",
                              "pot2:signal": "bb1:e34",
                              "pot2:gnd": "bb1:e35"
                      }
              },
              {
                      "step": 5,
                      "text": "Posiziona potenziometro da 10k ohm nei fori E38, E39, E40.",
                      "componentId": "pot3",
                      "componentType": "potentiometer",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "pot3:vcc": "bb1:e38",
                              "pot3:signal": "bb1:e39",
                              "pot3:gnd": "bb1:e40"
                      }
              },
              {
                      "step": 6,
                      "text": "Posiziona resistore da 220 ohm nei fori C14, C21.",
                      "componentId": "r1",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r1:pin1": "bb1:c14",
                              "r1:pin2": "bb1:c21"
                      }
              },
              {
                      "step": 7,
                      "text": "Posiziona resistore da 220 ohm nei fori G14, G21.",
                      "componentId": "r2",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r2:pin1": "bb1:g14",
                              "r2:pin2": "bb1:g21"
                      }
              },
              {
                      "step": 8,
                      "text": "Posiziona resistore da 220 ohm nei fori B43, B50.",
                      "componentId": "r3",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r3:pin1": "bb1:b43",
                              "r3:pin2": "bb1:b50"
                      }
              },
              {
                      "step": 9,
                      "text": "Posiziona resistore da 220 ohm nei fori G43, G50.",
                      "componentId": "r4",
                      "componentType": "resistor",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "r4:pin1": "bb1:g43",
                              "r4:pin2": "bb1:g50"
                      }
              },
              {
                      "step": 10,
                      "text": "Posiziona LED green nei fori B21, B22.",
                      "componentId": "led1",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led1:anode": "bb1:b21",
                              "led1:cathode": "bb1:b22"
                      }
              },
              {
                      "step": 11,
                      "text": "Posiziona LED green nei fori H23, H24.",
                      "componentId": "led2",
                      "componentType": "led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "led2:anode": "bb1:h23",
                              "led2:cathode": "bb1:h24"
                      }
              },
              {
                      "step": 12,
                      "text": "Posiziona LED RGB nei fori D53, D54, D55, D56.",
                      "componentId": "rgb1",
                      "componentType": "rgb-led",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "rgb1:red": "bb1:d53",
                              "rgb1:common": "bb1:d54",
                              "rgb1:green": "bb1:d55",
                              "rgb1:blue": "bb1:d56"
                      }
              },
              {
                      "step": 13,
                      "text": "Posiziona interruttore magnetico nei fori C3, C9.",
                      "componentId": "reed1",
                      "componentType": "reed-switch",
                      "hint": "Ragazzi, verificate posizione e polarita'.",
                      "targetPins": {
                              "reed1:pin1": "bb1:c3",
                              "reed1:pin2": "bb1:c9"
                      }
              },
              {
                      "step": 14,
                      "text": "Collega un filo RED da bat1:positive a bb1:bus-plus-1.",
                      "wireFrom": "bat1:positive",
                      "wireTo": "bb1:bus-plus-1",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 15,
                      "text": "Collega un filo RED da bb1:bus-plus-3 a bb1:a3.",
                      "wireFrom": "bb1:bus-plus-3",
                      "wireTo": "bb1:a3",
                      "wireColor": "red",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 16,
                      "text": "Collega un filo YELLOW da bb1:a9 a bb1:a14.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:a14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 17,
                      "text": "Collega un filo YELLOW da bb1:a9 a bb1:f14.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:f14",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 18,
                      "text": "Collega un filo YELLOW da bb1:a9 a bb1:a28.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:a28",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 19,
                      "text": "Collega un filo YELLOW da bb1:a9 a bb1:a33.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:a33",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 20,
                      "text": "Collega un filo YELLOW da bb1:a9 a bb1:a38.",
                      "wireFrom": "bb1:a9",
                      "wireTo": "bb1:a38",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 21,
                      "text": "Collega un filo BLACK da bb1:a22 a bb1:bus-minus-22.",
                      "wireFrom": "bb1:a22",
                      "wireTo": "bb1:bus-minus-22",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 22,
                      "text": "Collega un filo YELLOW da bb1:g21 a bb1:g23.",
                      "wireFrom": "bb1:g21",
                      "wireTo": "bb1:g23",
                      "wireColor": "yellow",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 23,
                      "text": "Collega un filo BLACK da bb1:j24 a bb1:bus-minus-24.",
                      "wireFrom": "bb1:j24",
                      "wireTo": "bb1:bus-minus-24",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 24,
                      "text": "Collega un filo ORANGE da bb1:a29 a bb1:a43.",
                      "wireFrom": "bb1:a29",
                      "wireTo": "bb1:a43",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 25,
                      "text": "Collega un filo ORANGE da bb1:a50 a bb1:a53.",
                      "wireFrom": "bb1:a50",
                      "wireTo": "bb1:a53",
                      "wireColor": "orange",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 26,
                      "text": "Collega un filo GREEN da bb1:a34 a bb1:f43.",
                      "wireFrom": "bb1:a34",
                      "wireTo": "bb1:f43",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 27,
                      "text": "Collega un filo GREEN da bb1:f50 a bb1:a55.",
                      "wireFrom": "bb1:f50",
                      "wireTo": "bb1:a55",
                      "wireColor": "green",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 28,
                      "text": "Collega un filo BLUE da bb1:a39 a bb1:f53.",
                      "wireFrom": "bb1:a39",
                      "wireTo": "bb1:f53",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 29,
                      "text": "Collega un filo BLUE da bb1:f60 a bb1:a56.",
                      "wireFrom": "bb1:f60",
                      "wireTo": "bb1:a56",
                      "wireColor": "blue",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 30,
                      "text": "Collega un filo BLACK da bb1:a30 a bb1:bus-minus-30.",
                      "wireFrom": "bb1:a30",
                      "wireTo": "bb1:bus-minus-30",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 31,
                      "text": "Collega un filo BLACK da bb1:a35 a bb1:bus-minus-35.",
                      "wireFrom": "bb1:a35",
                      "wireTo": "bb1:bus-minus-35",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 32,
                      "text": "Collega un filo BLACK da bb1:a40 a bb1:bus-minus-40.",
                      "wireFrom": "bb1:a40",
                      "wireTo": "bb1:bus-minus-40",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 33,
                      "text": "Collega un filo BLACK da bb1:a54 a bb1:bus-minus-54.",
                      "wireFrom": "bb1:a54",
                      "wireTo": "bb1:bus-minus-54",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
              },
              {
                      "step": 34,
                      "text": "Collega un filo BLACK da bb1:bus-minus-1 a bat1:negative.",
                      "wireFrom": "bb1:bus-minus-1",
                      "wireTo": "bat1:negative",
                      "wireColor": "black",
                      "hint": "Ragazzi, controllate colore e due estremi."
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
