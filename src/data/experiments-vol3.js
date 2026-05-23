// © Andrea Marro — 21/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * ELAB Experiments — Volume 3: Programmazione Arduino
 * Canonical printed sequence: Cap.5 (2) + Cap.6 (8) + Cap.7 (7) + Cap.8 (6) = 23 ESERCIZI.
 * Source of truth: docs/volumi-originali/VOLUME-3-TESTO.txt.
 */

const EXPERIMENTS_VOL3 = {
  "title": "Volume 3 - Programmazione Arduino",
  "subtitle": "Dal Blink al Monitor Seriale",
  "volume": 3,
  "experiments": [
    {
      "id": "v3-cap5-esp1",
      "title": "Blink: il primo programma",
      "bookRef": "Vol. 3 pag. 30 - ESERCIZIO 5.1",
      "desc": "I ragazzi scrivono Blink e osservano il LED integrato che lampeggia.",
      "description": "I ragazzi scrivono Blink e osservano il LED integrato che lampeggia.",
      "chapter": "Capitolo 5 - Il nostro primo programma (Blink)",
      "difficulty": 1,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
        }
      ],
      "connections": [],
      "pinAssignments": {},
      "code": "const int LED_PIN = 13;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_PIN, LOW);\n  delay(1000);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field><next><block type=\"arduino_pin_mode\"><field name=\"PIN\">13</field><field name=\"MODE\">OUTPUT</field></block></next></block></statement><statement name=\"LOOP\"><block type=\"arduino_digital_write\"><field name=\"PIN\">13</field><field name=\"STATE\">HIGH</field><next><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value><next><block type=\"arduino_digital_write\"><field name=\"PIN\">13</field><field name=\"STATE\">LOW</field></block></next></block></next></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        }
      },
      "concept": "Blink: il primo programma",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 30.",
          "hint": "Ragazzi, il docente verifica questo collegamento.",
          "componentId": "nano1"
        }
      ],
      "steps": [
        "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 30.",
        "Osserva: Ragazzi, il docente carica il codice di Blink: il primo programma e confronta il risultato con il Volume 3."
      ],
      "observe": "Ragazzi, osservate i ragazzi scrivono blink e osservano il led integrato che lampeggia.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 30 - ESERCIZIO 5.1: Blink: il primo programma. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 5.1?",
          "options": [
            "Blink: il primo programma",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 30: Blink: il primo programma."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap5-esp2",
      "title": "Modificare il delay del Blink",
      "bookRef": "Vol. 3 pag. 41 - ESERCIZIO 5.2",
      "desc": "I ragazzi cambiano i millisecondi del delay per rendere il lampeggio piu veloce o piu lento.",
      "description": "I ragazzi cambiano i millisecondi del delay per rendere il lampeggio piu veloce o piu lento.",
      "chapter": "Capitolo 5 - Il nostro primo programma (Blink)",
      "difficulty": 1,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
        }
      ],
      "connections": [],
      "pinAssignments": {},
      "code": "const int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(500);\n  digitalWrite(LED_PIN, LOW);\n  delay(200);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        }
      },
      "concept": "Modificare il delay del Blink",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 41.",
          "hint": "Ragazzi, il docente verifica questo collegamento.",
          "componentId": "nano1"
        }
      ],
      "steps": [
        "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 41.",
        "Osserva: Ragazzi, il docente carica il codice di Modificare il delay del Blink e confronta il risultato con il Volume 3."
      ],
      "observe": "Ragazzi, osservate i ragazzi cambiano i millisecondi del delay per rendere il lampeggio piu veloce o piu lento.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 41 - ESERCIZIO 5.2: Modificare il delay del Blink. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 5.2?",
          "options": [
            "Modificare il delay del Blink",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 41: Modificare il delay del Blink."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp1",
      "title": "Circuiti logici AND e OR",
      "bookRef": "Vol. 3 pag. 45 - ESERCIZIO 6.1",
      "desc": "Due coppie di pulsanti mostrano la logica OR e AND: uno basta, oppure servono entrambi.",
      "description": "Due coppie di pulsanti mostrano la logica OR e AND: uno basta, oppure servono entrambi.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
          "type": "push-button",
          "id": "btn4"
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
        },
        {
          "type": "resistor",
          "id": "r2",
          "value": 470
        },
        {
          "type": "led",
          "id": "led2",
          "color": "red"
        }
      ],
      "connections": [
        {
          "from": "nano1:W_D3",
          "to": "bb1:e10",
          "color": "blue"
        },
        {
          "from": "bb1:j12",
          "to": "bb1:bus-bot-minus-12",
          "color": "black"
        },
        {
          "from": "nano1:W_D9",
          "to": "bb1:e14",
          "color": "blue"
        },
        {
          "from": "bb1:j16",
          "to": "bb1:bus-bot-minus-16",
          "color": "black"
        },
        {
          "from": "nano1:W_D10",
          "to": "bb1:e18",
          "color": "blue"
        },
        {
          "from": "bb1:j20",
          "to": "bb1:bus-bot-minus-20",
          "color": "black"
        },
        {
          "from": "nano1:W_D11",
          "to": "bb1:e22",
          "color": "blue"
        },
        {
          "from": "bb1:j24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a16",
          "color": "orange"
        },
        {
          "from": "bb1:d23",
          "to": "bb1:d25",
          "color": "green"
        },
        {
          "from": "bb1:a26",
          "to": "bb1:bus-bot-minus-26",
          "color": "black"
        },
        {
          "from": "nano1:W_D6",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "btn1:pin1": "bb1:e10",
        "btn1:pin2": "bb1:f12",
        "btn2:pin1": "bb1:e14",
        "btn2:pin2": "bb1:f16",
        "btn3:pin1": "bb1:e18",
        "btn3:pin2": "bb1:f20",
        "btn4:pin1": "bb1:e22",
        "btn4:pin2": "bb1:f24",
        "r1:pin1": "bb1:c16",
        "r1:pin2": "bb1:c23",
        "led1:anode": "bb1:d25",
        "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:c24",
        "r2:pin2": "bb1:c21",
        "led2:anode": "bb1:d23",
        "led2:cathode": "bb1:d24"
      },
      "code": "const int PULSANTE_A = 3;\nconst int PULSANTE_B = 9;\nconst int PULSANTE_C = 10;\nconst int PULSANTE_D = 11;\nconst int LED_OR = 5;\nconst int LED_AND = 6;\n\nvoid setup() {\n  pinMode(PULSANTE_A, INPUT_PULLUP);\n  pinMode(PULSANTE_B, INPUT_PULLUP);\n  pinMode(PULSANTE_C, INPUT_PULLUP);\n  pinMode(PULSANTE_D, INPUT_PULLUP);\n  pinMode(LED_OR, OUTPUT);\n  pinMode(LED_AND, OUTPUT);\n}\n\nvoid loop() {\n  bool a = digitalRead(PULSANTE_A) == LOW;\n  bool b = digitalRead(PULSANTE_B) == LOW;\n  bool c = digitalRead(PULSANTE_C) == LOW;\n  bool d = digitalRead(PULSANTE_D) == LOW;\n  digitalWrite(LED_OR, (a || b) ? HIGH : LOW);\n  digitalWrite(LED_AND, (c && d) ? HIGH : LOW);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "btn1": {
          "x": 380.25,
          "y": 82.5
        },
        "btn2": {
          "x": 410.25,
          "y": 82.5
        },
        "btn3": {
          "x": 440.25,
          "y": 82.5
        },
        "btn4": {
          "x": 470.25,
          "y": 82.5
        },
        "r1": {
          "x": 436.5,
          "y": 58.75
        },
        "led1": {
          "x": 481.5,
          "y": 43.75
        },
        "r2": {
          "x": 496.5,
          "y": 58.75
        },
        "led2": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Circuiti logici AND e OR",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "btn1",
          "componentType": "push-button",
          "targetPins": {
            "btn1:pin1": "bb1:e10",
            "btn1:pin2": "bb1:f12"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn2 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "btn2",
          "componentType": "push-button",
          "targetPins": {
            "btn2:pin1": "bb1:e14",
            "btn2:pin2": "bb1:f16"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn3 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "btn3",
          "componentType": "push-button",
          "targetPins": {
            "btn3:pin1": "bb1:e18",
            "btn3:pin2": "bb1:f20"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn4 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "btn4",
          "componentType": "push-button",
          "targetPins": {
            "btn4:pin1": "bb1:e22",
            "btn4:pin2": "bb1:f24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c16",
            "r1:pin2": "bb1:c23"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d25",
            "led1:cathode": "bb1:d26"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "r2",
          "componentType": "resistor",
          "targetPins": {
            "r2:pin1": "bb1:c24",
            "r2:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 45.",
          "componentId": "led2",
          "componentType": "led",
          "targetPins": {
            "led2:anode": "bb1:d23",
            "led2:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D3 a bb1:e10, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:W_D3",
          "wireTo": "bb1:e10",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j12 a bb1:bus-bot-minus-12, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:j12",
          "wireTo": "bb1:bus-bot-minus-12",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D9 a bb1:e14, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:W_D9",
          "wireTo": "bb1:e14",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 12,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j16 a bb1:bus-bot-minus-16, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:j16",
          "wireTo": "bb1:bus-bot-minus-16",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 13,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e18, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:W_D10",
          "wireTo": "bb1:e18",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 14,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:j20",
          "wireTo": "bb1:bus-bot-minus-20",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 15,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D11 a bb1:e22, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:W_D11",
          "wireTo": "bb1:e22",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 16,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:j24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 17,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a16, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a16",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 18,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d23 a bb1:d25, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:d23",
          "wireTo": "bb1:d25",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 19,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a26 a bb1:bus-bot-minus-26, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:a26",
          "wireTo": "bb1:bus-bot-minus-26",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 20,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:W_D6",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 21,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 22,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 23,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 24,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 45.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn2 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn3 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn4 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D3 a bb1:e10, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j12 a bb1:bus-bot-minus-12, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D9 a bb1:e14, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j16 a bb1:bus-bot-minus-16, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e18, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D11 a bb1:e22, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a16, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d23 a bb1:d25, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a26 a bb1:bus-bot-minus-26, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 45.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 45."
      ],
      "observe": "Ragazzi, osservate due coppie di pulsanti mostrano la logica or e and: uno basta, oppure servono entrambi.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 45 - ESERCIZIO 6.1: Circuiti logici AND e OR. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.1?",
          "options": [
            "Circuiti logici AND e OR",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 45: Circuiti logici AND e OR."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp2",
      "title": "Accendere un LED esterno sul pin 13",
      "bookRef": "Vol. 3 pag. 51 - ESERCIZIO 6.2",
      "desc": "Il Blink esce dalla scheda e controlla un LED verde montato sulla breadboard.",
      "description": "Il Blink esce dalla scheda e controlla un LED verde montato sulla breadboard.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "nano1:W_D13",
          "to": "bb1:a18",
          "color": "orange"
        },
        {
          "from": "bb1:d25",
          "to": "bb1:d27",
          "color": "green"
        },
        {
          "from": "bb1:a28",
          "to": "bb1:bus-bot-minus-28",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      "code": "void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "r1": {
          "x": 451.5,
          "y": 58.75
        },
        "led1": {
          "x": 496.5,
          "y": 43.75
        }
      },
      "concept": "Accendere un LED esterno sul pin 13",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 51.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c18",
            "r1:pin2": "bb1:c25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 51.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d27",
            "led1:cathode": "bb1:d28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D13 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 51.",
          "wireFrom": "nano1:W_D13",
          "wireTo": "bb1:a18",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 51.",
          "wireFrom": "bb1:d25",
          "wireTo": "bb1:d27",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 51.",
          "wireFrom": "bb1:a28",
          "wireTo": "bb1:bus-bot-minus-28",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 51.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 51.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 51.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 51.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D13 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 51.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 51.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 51.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 51.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 51."
      ],
      "observe": "Ragazzi, osservate il blink esce dalla scheda e controlla un led verde montato sulla breadboard.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 51 - ESERCIZIO 6.2: Accendere un LED esterno sul pin 13. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.2?",
          "options": [
            "Accendere un LED esterno sul pin 13",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 51: Accendere un LED esterno sul pin 13."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp3",
      "title": "Cambiare il pin del LED esterno",
      "bookRef": "Vol. 3 pag. 53 - ESERCIZIO 6.3",
      "desc": "Lo stesso LED viene spostato su un altro pin: codice e filo devono raccontare la stessa scelta.",
      "description": "Lo stesso LED viene spostato su un altro pin: codice e filo devono raccontare la stessa scelta.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "nano1:W_D8",
          "to": "bb1:a18",
          "color": "orange"
        },
        {
          "from": "bb1:d25",
          "to": "bb1:d27",
          "color": "green"
        },
        {
          "from": "bb1:a28",
          "to": "bb1:bus-bot-minus-28",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      "code": "const int LED_PIN = 8;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(700);\n  digitalWrite(LED_PIN, LOW);\n  delay(700);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "r1": {
          "x": 451.5,
          "y": 58.75
        },
        "led1": {
          "x": 496.5,
          "y": 43.75
        }
      },
      "concept": "Cambiare il pin del LED esterno",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 53.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c18",
            "r1:pin2": "bb1:c25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 53.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d27",
            "led1:cathode": "bb1:d28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D8 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 53.",
          "wireFrom": "nano1:W_D8",
          "wireTo": "bb1:a18",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 53.",
          "wireFrom": "bb1:d25",
          "wireTo": "bb1:d27",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 53.",
          "wireFrom": "bb1:a28",
          "wireTo": "bb1:bus-bot-minus-28",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 53.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 53.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 53.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 53.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D8 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 53.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 53.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 53.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 53.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 53."
      ],
      "observe": "Ragazzi, osservate lo stesso led viene spostato su un altro pin: codice e filo devono raccontare la stessa scelta.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 53 - ESERCIZIO 6.3: Cambiare il pin del LED esterno. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.3?",
          "options": [
            "Cambiare il pin del LED esterno",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 53: Cambiare il pin del LED esterno."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp4",
      "title": "Due LED che si alternano",
      "bookRef": "Vol. 3 pag. 54 - ESERCIZIO 6.4",
      "desc": "Due LED sui pin 6 e 9 si accendono uno dopo l altro, creando un effetto alternato.",
      "description": "Due LED sui pin 6 e 9 si accendono uno dopo l altro, creando un effetto alternato.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
        },
        {
          "type": "resistor",
          "id": "r2",
          "value": 470
        },
        {
          "type": "led",
          "id": "led2",
          "color": "red"
        }
      ],
      "connections": [
        {
          "from": "nano1:W_D6",
          "to": "bb1:a16",
          "color": "orange"
        },
        {
          "from": "bb1:d23",
          "to": "bb1:d25",
          "color": "green"
        },
        {
          "from": "bb1:a26",
          "to": "bb1:bus-bot-minus-26",
          "color": "black"
        },
        {
          "from": "nano1:W_D9",
          "to": "bb1:a20",
          "color": "orange"
        },
        {
          "from": "bb1:d27",
          "to": "bb1:d29",
          "color": "green"
        },
        {
          "from": "bb1:a30",
          "to": "bb1:bus-bot-minus-30",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "r1:pin1": "bb1:c16",
        "r1:pin2": "bb1:c23",
        "led1:anode": "bb1:d25",
        "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:c20",
        "r2:pin2": "bb1:c27",
        "led2:anode": "bb1:d29",
        "led2:cathode": "bb1:d30"
      },
      "code": "const int LED_BLU = 6;\nconst int LED_ROSSO = 9;\n\nvoid setup() {\n  pinMode(LED_BLU, OUTPUT);\n  pinMode(LED_ROSSO, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BLU, HIGH);\n  digitalWrite(LED_ROSSO, LOW);\n  delay(200);\n  digitalWrite(LED_BLU, LOW);\n  digitalWrite(LED_ROSSO, HIGH);\n  delay(200);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "r1": {
          "x": 436.5,
          "y": 58.75
        },
        "led1": {
          "x": 481.5,
          "y": 43.75
        },
        "r2": {
          "x": 466.5,
          "y": 58.75
        },
        "led2": {
          "x": 511.5,
          "y": 43.75
        }
      },
      "concept": "Due LED che si alternano",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 54.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c16",
            "r1:pin2": "bb1:c23"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 54.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d25",
            "led1:cathode": "bb1:d26"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 54.",
          "componentId": "r2",
          "componentType": "resistor",
          "targetPins": {
            "r2:pin1": "bb1:c20",
            "r2:pin2": "bb1:c27"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 54.",
          "componentId": "led2",
          "componentType": "led",
          "targetPins": {
            "led2:anode": "bb1:d29",
            "led2:cathode": "bb1:d30"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a16, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "nano1:W_D6",
          "wireTo": "bb1:a16",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d23 a bb1:d25, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "bb1:d23",
          "wireTo": "bb1:d25",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a26 a bb1:bus-bot-minus-26, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "bb1:a26",
          "wireTo": "bb1:bus-bot-minus-26",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D9 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "nano1:W_D9",
          "wireTo": "bb1:a20",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "bb1:d27",
          "wireTo": "bb1:d29",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "bb1:a30",
          "wireTo": "bb1:bus-bot-minus-30",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 12,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 54.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 54.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 54.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 54.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a16, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d23 a bb1:d25, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a26 a bb1:bus-bot-minus-26, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D9 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 54.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 54."
      ],
      "observe": "Ragazzi, osservate due led sui pin 6 e 9 si accendono uno dopo l altro, creando un effetto alternato.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 54 - ESERCIZIO 6.4: Due LED che si alternano. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.4?",
          "options": [
            "Due LED che si alternano",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 54: Due LED che si alternano."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp5",
      "title": "Costruiamo un semaforo",
      "bookRef": "Vol. 3 pag. 57 - ESERCIZIO 6.5",
      "desc": "Tre LED rosso, giallo e verde riproducono una sequenza da semaforo sui pin 5, 6 e 9.",
      "description": "Tre LED rosso, giallo e verde riproducono una sequenza da semaforo sui pin 5, 6 e 9.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
        },
        {
          "type": "resistor",
          "id": "r2",
          "value": 470
        },
        {
          "type": "led",
          "id": "led2",
          "color": "yellow"
        },
        {
          "type": "resistor",
          "id": "r3",
          "value": 470
        },
        {
          "type": "led",
          "id": "led3",
          "color": "red"
        }
      ],
      "connections": [
        {
          "from": "nano1:W_D5",
          "to": "bb1:a11",
          "color": "orange"
        },
        {
          "from": "bb1:f14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D6",
          "to": "bb1:a15",
          "color": "orange"
        },
        {
          "from": "bb1:f18",
          "to": "bb1:bus-bot-minus-18",
          "color": "black"
        },
        {
          "from": "nano1:W_D9",
          "to": "bb1:a19",
          "color": "orange"
        },
        {
          "from": "bb1:f22",
          "to": "bb1:bus-bot-minus-22",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "r1:pin1": "bb1:a11",
        "r1:pin2": "bb1:a14",
        "led1:anode": "bb1:e14",
        "led1:cathode": "bb1:f14",
        "r2:pin1": "bb1:a15",
        "r2:pin2": "bb1:a18",
        "led2:anode": "bb1:e18",
        "led2:cathode": "bb1:f18",
        "r3:pin1": "bb1:a19",
        "r3:pin2": "bb1:a22",
        "led3:anode": "bb1:e22",
        "led3:cathode": "bb1:f22"
      },
      "code": "const int LED_VERDE = 5;\nconst int LED_GIALLO = 6;\nconst int LED_ROSSO = 9;\n\nvoid setup() {\n  pinMode(LED_VERDE, OUTPUT);\n  pinMode(LED_GIALLO, OUTPUT);\n  pinMode(LED_ROSSO, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_VERDE, HIGH);\n  delay(3000);\n  digitalWrite(LED_VERDE, LOW);\n  digitalWrite(LED_GIALLO, HIGH);\n  delay(1000);\n  digitalWrite(LED_GIALLO, LOW);\n  digitalWrite(LED_ROSSO, HIGH);\n  delay(3000);\n  digitalWrite(LED_ROSSO, LOW);\n}",
      "hexFile": "/hex/v3-cap6-esp5.hex",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "r1": {
          "x": 380.25,
          "y": 43.75
        },
        "led1": {
          "x": 391.5,
          "y": 82.5
        },
        "r2": {
          "x": 410.25,
          "y": 43.75
        },
        "led2": {
          "x": 421.5,
          "y": 82.5
        },
        "r3": {
          "x": 440.25,
          "y": 43.75
        },
        "led3": {
          "x": 451.5,
          "y": 82.5
        }
      },
      "concept": "Costruiamo un semaforo",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 57.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c14",
            "r1:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 57.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d23",
            "led1:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 57.",
          "componentId": "r2",
          "componentType": "resistor",
          "targetPins": {
            "r2:pin1": "bb1:c18",
            "r2:pin2": "bb1:c25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 57.",
          "componentId": "led2",
          "componentType": "led",
          "targetPins": {
            "led2:anode": "bb1:d27",
            "led2:cathode": "bb1:d28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 57.",
          "componentId": "r3",
          "componentType": "resistor",
          "targetPins": {
            "r3:pin1": "bb1:c22",
            "r3:pin2": "bb1:c29"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 57.",
          "componentId": "led3",
          "componentType": "led",
          "targetPins": {
            "led3:anode": "bb1:d21",
            "led3:cathode": "bb1:d22"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a14, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a14",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "nano1:W_D6",
          "wireTo": "bb1:a18",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "bb1:d25",
          "wireTo": "bb1:d27",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 12,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "bb1:a28",
          "wireTo": "bb1:bus-bot-minus-28",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 13,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D9 a bb1:a22, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "nano1:W_D9",
          "wireTo": "bb1:a22",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 14,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d29 a bb1:d21, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "bb1:d29",
          "wireTo": "bb1:d21",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 15,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a22 a bb1:bus-bot-minus-22, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "bb1:a22",
          "wireTo": "bb1:bus-bot-minus-22",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 16,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 17,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 57.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 57.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 57.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 57.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 57.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 57.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a14, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D9 a bb1:a22, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d29 a bb1:d21, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a22 a bb1:bus-bot-minus-22, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 57.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 57."
      ],
      "observe": "Ragazzi, osservate tre led rosso, giallo e verde riproducono una sequenza da semaforo sui pin 5, 6 e 9.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 57 - ESERCIZIO 6.5: Costruiamo un semaforo. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.5?",
          "options": [
            "Costruiamo un semaforo",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 57: Costruiamo un semaforo."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp6",
      "title": "Leggere un pulsante con digitalRead",
      "bookRef": "Vol. 3 pag. 64 - ESERCIZIO 6.6",
      "desc": "Arduino legge un pulsante in INPUT_PULLUP e decide con if/else se accendere il LED.",
      "description": "Arduino legge un pulsante in INPUT_PULLUP e decide con if/else se accendere il LED.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
          "color": "green"
        }
      ],
      "connections": [
        {
          "from": "nano1:W_D10",
          "to": "bb1:e12",
          "color": "blue"
        },
        {
          "from": "bb1:j14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a20",
          "color": "orange"
        },
        {
          "from": "bb1:d27",
          "to": "bb1:d29",
          "color": "green"
        },
        {
          "from": "bb1:a30",
          "to": "bb1:bus-bot-minus-30",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "btn1:pin1": "bb1:e12",
        "btn1:pin2": "bb1:f14",
        "r1:pin1": "bb1:c20",
        "r1:pin2": "bb1:c27",
        "led1:anode": "bb1:d29",
        "led1:cathode": "bb1:d30"
      },
      "code": "const int PULSANTE = 10;\nconst int LED_PIN = 5;\n\nvoid setup() {\n  pinMode(PULSANTE, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(PULSANTE) == LOW) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "btn1": {
          "x": 395.25,
          "y": 82.5
        },
        "r1": {
          "x": 466.5,
          "y": 58.75
        },
        "led1": {
          "x": 511.5,
          "y": 43.75
        }
      },
      "concept": "Leggere un pulsante con digitalRead",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 64.",
          "componentId": "btn1",
          "componentType": "push-button",
          "targetPins": {
            "btn1:pin1": "bb1:e12",
            "btn1:pin2": "bb1:f14"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 64.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c20",
            "r1:pin2": "bb1:c27"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 64.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d29",
            "led1:cathode": "bb1:d30"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e12, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "nano1:W_D10",
          "wireTo": "bb1:e12",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "bb1:j14",
          "wireTo": "bb1:bus-bot-minus-14",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a20",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "bb1:d27",
          "wireTo": "bb1:d29",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "bb1:a30",
          "wireTo": "bb1:bus-bot-minus-30",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 64.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 64.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 64.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e12, come passaggio del circuito di Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 64.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 64."
      ],
      "observe": "Ragazzi, osservate arduino legge un pulsante in input_pullup e decide con if/else se accendere il led.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 64 - ESERCIZIO 6.6: Leggere un pulsante con digitalRead. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.6?",
          "options": [
            "Leggere un pulsante con digitalRead",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 64: Leggere un pulsante con digitalRead."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp7",
      "title": "Una variabile ricorda lo stato del LED",
      "bookRef": "Vol. 3 pag. 69 - ESERCIZIO 6.7",
      "desc": "Con una variabile bool il pulsante diventa un interruttore: una pressione accende, la successiva spegne.",
      "description": "Con una variabile bool il pulsante diventa un interruttore: una pressione accende, la successiva spegne.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
          "color": "green"
        }
      ],
      "connections": [
        {
          "from": "nano1:W_D10",
          "to": "bb1:e12",
          "color": "blue"
        },
        {
          "from": "bb1:j14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a20",
          "color": "orange"
        },
        {
          "from": "bb1:d27",
          "to": "bb1:d29",
          "color": "green"
        },
        {
          "from": "bb1:a30",
          "to": "bb1:bus-bot-minus-30",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "btn1:pin1": "bb1:e12",
        "btn1:pin2": "bb1:f14",
        "r1:pin1": "bb1:c20",
        "r1:pin2": "bb1:c27",
        "led1:anode": "bb1:d29",
        "led1:cathode": "bb1:d30"
      },
      "code": "const int PULSANTE = 10;\nconst int LED_PIN = 5;\nbool statoLED = false;\n\nvoid setup() {\n  pinMode(PULSANTE, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(PULSANTE) == LOW) {\n    statoLED = !statoLED;\n    digitalWrite(LED_PIN, statoLED ? HIGH : LOW);\n    delay(300);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "btn1": {
          "x": 395.25,
          "y": 82.5
        },
        "r1": {
          "x": 466.5,
          "y": 58.75
        },
        "led1": {
          "x": 511.5,
          "y": 43.75
        }
      },
      "concept": "Una variabile ricorda lo stato del LED",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 69.",
          "componentId": "btn1",
          "componentType": "push-button",
          "targetPins": {
            "btn1:pin1": "bb1:e12",
            "btn1:pin2": "bb1:f14"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 69.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c20",
            "r1:pin2": "bb1:c27"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 69.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d29",
            "led1:cathode": "bb1:d30"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e12, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "nano1:W_D10",
          "wireTo": "bb1:e12",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "bb1:j14",
          "wireTo": "bb1:bus-bot-minus-14",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a20",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "bb1:d27",
          "wireTo": "bb1:d29",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "bb1:a30",
          "wireTo": "bb1:bus-bot-minus-30",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 69.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 69.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 69.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e12, come passaggio del circuito di Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 69.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 69."
      ],
      "observe": "Ragazzi, osservate con una variabile bool il pulsante diventa un interruttore: una pressione accende, la successiva spegne.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 69 - ESERCIZIO 6.7: Una variabile ricorda lo stato del LED. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.7?",
          "options": [
            "Una variabile ricorda lo stato del LED",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 69: Una variabile ricorda lo stato del LED."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap6-esp8",
      "title": "Evitare il lampeggio con while",
      "bookRef": "Vol. 3 pag. 74 - ESERCIZIO 6.8",
      "desc": "Il programma aspetta il rilascio del pulsante con while, cosi una pressione lunga vale una sola volta.",
      "description": "Il programma aspetta il rilascio del pulsante con while, cosi una pressione lunga vale una sola volta.",
      "chapter": "Capitolo 6 - Il mondo discreto: i pin digitali",
      "difficulty": 2,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
          "color": "green"
        }
      ],
      "connections": [
        {
          "from": "nano1:W_D10",
          "to": "bb1:e12",
          "color": "blue"
        },
        {
          "from": "bb1:j14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a20",
          "color": "orange"
        },
        {
          "from": "bb1:d27",
          "to": "bb1:d29",
          "color": "green"
        },
        {
          "from": "bb1:a30",
          "to": "bb1:bus-bot-minus-30",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "btn1:pin1": "bb1:e12",
        "btn1:pin2": "bb1:f14",
        "r1:pin1": "bb1:c20",
        "r1:pin2": "bb1:c27",
        "led1:anode": "bb1:d29",
        "led1:cathode": "bb1:d30"
      },
      "code": "const int PULSANTE = 10;\nconst int LED_PIN = 5;\nbool statoLED = false;\n\nvoid setup() {\n  pinMode(PULSANTE, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(PULSANTE) == LOW) {\n    statoLED = !statoLED;\n    digitalWrite(LED_PIN, statoLED ? HIGH : LOW);\n    delay(300);\n    while (digitalRead(PULSANTE) == LOW) {\n    }\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "btn1": {
          "x": 395.25,
          "y": 82.5
        },
        "r1": {
          "x": 466.5,
          "y": 58.75
        },
        "led1": {
          "x": 511.5,
          "y": 43.75
        }
      },
      "concept": "Evitare il lampeggio con while",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 74.",
          "componentId": "btn1",
          "componentType": "push-button",
          "targetPins": {
            "btn1:pin1": "bb1:e12",
            "btn1:pin2": "bb1:f14"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 74.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c20",
            "r1:pin2": "bb1:c27"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 74.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d29",
            "led1:cathode": "bb1:d30"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e12, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "nano1:W_D10",
          "wireTo": "bb1:e12",
          "wireColor": "blue",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:j14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "bb1:j14",
          "wireTo": "bb1:bus-bot-minus-14",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a20",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "bb1:d27",
          "wireTo": "bb1:d29",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "bb1:a30",
          "wireTo": "bb1:bus-bot-minus-30",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 74.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Pulsante btn1 sul kit, seguendo Vol. 3 pag. 74.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 74.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo blue da nano1:W_D10 a bb1:e12, come passaggio del circuito di Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:j14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 74.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 74."
      ],
      "observe": "Ragazzi, osservate il programma aspetta il rilascio del pulsante con while, cosi una pressione lunga vale una sola volta.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 74 - ESERCIZIO 6.8: Evitare il lampeggio con while. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 6.8?",
          "options": [
            "Evitare il lampeggio con while",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 74: Evitare il lampeggio con while."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp1",
      "title": "Trimmer: accendere il LED sopra 2,5 V",
      "bookRef": "Vol. 3 pag. 84 - ESERCIZIO 7.1",
      "desc": "Arduino legge A0 e accende il LED quando il trimmer supera circa meta corsa.",
      "description": "Arduino legge A0 e accende il LED quando il trimmer supera circa meta corsa.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "bb1:f18",
          "to": "bb1:bus-bot-plus-18",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f19",
          "color": "yellow"
        },
        {
          "from": "bb1:f20",
          "to": "bb1:bus-bot-minus-20",
          "color": "black"
        },
        {
          "from": "nano1:W_D13",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h18",
        "pot1:signal": "bb1:h19",
        "pot1:gnd": "bb1:h20",
        "r1:pin1": "bb1:c24",
        "r1:pin2": "bb1:c21",
        "led1:anode": "bb1:d23",
        "led1:cathode": "bb1:d24"
      },
      "code": "const int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(A0, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int valoreLetto = analogRead(A0);\n  if (valoreLetto > 512) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 432.75,
          "y": 83.75
        },
        "r1": {
          "x": 496.5,
          "y": 58.75
        },
        "led1": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Trimmer: accendere il LED sopra 2,5 V",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 84.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h18",
            "pot1:signal": "bb1:h19",
            "pot1:gnd": "bb1:h20"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 84.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c24",
            "r1:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 84.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d23",
            "led1:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f18 a bb1:bus-bot-plus-18, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "bb1:f18",
          "wireTo": "bb1:bus-bot-plus-18",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f19, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f19",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "bb1:f20",
          "wireTo": "bb1:bus-bot-minus-20",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D13 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "nano1:W_D13",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 84.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 84.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 84.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f18 a bb1:bus-bot-plus-18, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f19, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D13 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 84.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 84."
      ],
      "observe": "Ragazzi, osservate arduino legge a0 e accende il led quando il trimmer supera circa meta corsa.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 84 - ESERCIZIO 7.1: Trimmer: accendere il LED sopra 2,5 V. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.1?",
          "options": [
            "Trimmer: accendere il LED sopra 2,5 V",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 84: Trimmer: accendere il LED sopra 2,5 V."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp2",
      "title": "Convertire la lettura analogica in Volt",
      "bookRef": "Vol. 3 pag. 87 - ESERCIZIO 7.2",
      "desc": "Il valore 0-1023 viene trasformato in tensione e confrontato direttamente con 2.5 V.",
      "description": "Il valore 0-1023 viene trasformato in tensione e confrontato direttamente con 2.5 V.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "bb1:f18",
          "to": "bb1:bus-bot-plus-18",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f19",
          "color": "yellow"
        },
        {
          "from": "bb1:f20",
          "to": "bb1:bus-bot-minus-20",
          "color": "black"
        },
        {
          "from": "nano1:W_D13",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h18",
        "pot1:signal": "bb1:h19",
        "pot1:gnd": "bb1:h20",
        "r1:pin1": "bb1:c24",
        "r1:pin2": "bb1:c21",
        "led1:anode": "bb1:d23",
        "led1:cathode": "bb1:d24"
      },
      "code": "const int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(A0, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int valoreLetto = analogRead(A0);\n  float tensione = valoreLetto * 5.0 / 1023.0;\n  if (tensione > 2.5) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 432.75,
          "y": 83.75
        },
        "r1": {
          "x": 496.5,
          "y": 58.75
        },
        "led1": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Convertire la lettura analogica in Volt",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 87.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h18",
            "pot1:signal": "bb1:h19",
            "pot1:gnd": "bb1:h20"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 87.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c24",
            "r1:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 87.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d23",
            "led1:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f18 a bb1:bus-bot-plus-18, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "bb1:f18",
          "wireTo": "bb1:bus-bot-plus-18",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f19, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f19",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "bb1:f20",
          "wireTo": "bb1:bus-bot-minus-20",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D13 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "nano1:W_D13",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 87.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 87.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 87.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f18 a bb1:bus-bot-plus-18, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f19, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D13 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 87.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 87."
      ],
      "observe": "Ragazzi, osservate il valore 0-1023 viene trasformato in tensione e confrontato direttamente con 2.5 v.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 87 - ESERCIZIO 7.2: Convertire la lettura analogica in Volt. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.2?",
          "options": [
            "Convertire la lettura analogica in Volt",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 87: Convertire la lettura analogica in Volt."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp3",
      "title": "Tre LED indicano la posizione del trimmer",
      "bookRef": "Vol. 3 pag. 90 - ESERCIZIO 7.3",
      "desc": "Il trimmer divide la scala analogica in tre zone: rosso, giallo e verde.",
      "description": "Il trimmer divide la scala analogica in tre zone: rosso, giallo e verde.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
        },
        {
          "type": "resistor",
          "id": "r2",
          "value": 470
        },
        {
          "type": "led",
          "id": "led2",
          "color": "yellow"
        },
        {
          "type": "resistor",
          "id": "r3",
          "value": 470
        },
        {
          "type": "led",
          "id": "led3",
          "color": "green"
        }
      ],
      "connections": [
        {
          "from": "bb1:f12",
          "to": "bb1:bus-bot-plus-12",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f13",
          "color": "yellow"
        },
        {
          "from": "bb1:f14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D3",
          "to": "bb1:a18",
          "color": "orange"
        },
        {
          "from": "bb1:d25",
          "to": "bb1:d27",
          "color": "green"
        },
        {
          "from": "bb1:a28",
          "to": "bb1:bus-bot-minus-28",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a21",
          "color": "orange"
        },
        {
          "from": "bb1:d28",
          "to": "bb1:d30",
          "color": "green"
        },
        {
          "from": "bb1:a21",
          "to": "bb1:bus-bot-minus-21",
          "color": "black"
        },
        {
          "from": "nano1:W_D6",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h12",
        "pot1:signal": "bb1:h13",
        "pot1:gnd": "bb1:h14",
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28",
        "r2:pin1": "bb1:c21",
        "r2:pin2": "bb1:c28",
        "led2:anode": "bb1:d30",
        "led2:cathode": "bb1:d21",
        "r3:pin1": "bb1:c24",
        "r3:pin2": "bb1:c21",
        "led3:anode": "bb1:d23",
        "led3:cathode": "bb1:d24"
      },
      "code": "const int LED_ROSSO = 3;\nconst int LED_GIALLO = 5;\nconst int LED_VERDE = 6;\n\nvoid setup() {\n  pinMode(A0, INPUT);\n  pinMode(LED_ROSSO, OUTPUT);\n  pinMode(LED_GIALLO, OUTPUT);\n  pinMode(LED_VERDE, OUTPUT);\n}\n\nvoid loop() {\n  int valoreLetto = analogRead(A0);\n  if (valoreLetto < 341) {\n    digitalWrite(LED_ROSSO, HIGH);\n    digitalWrite(LED_GIALLO, LOW);\n    digitalWrite(LED_VERDE, LOW);\n  } else if (valoreLetto < 682) {\n    digitalWrite(LED_ROSSO, LOW);\n    digitalWrite(LED_GIALLO, HIGH);\n    digitalWrite(LED_VERDE, LOW);\n  } else {\n    digitalWrite(LED_ROSSO, LOW);\n    digitalWrite(LED_GIALLO, LOW);\n    digitalWrite(LED_VERDE, HIGH);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 387.75,
          "y": 83.75
        },
        "r1": {
          "x": 451.5,
          "y": 58.75
        },
        "led1": {
          "x": 496.5,
          "y": 43.75
        },
        "r2": {
          "x": 474,
          "y": 58.75
        },
        "led2": {
          "x": 519,
          "y": 43.75
        },
        "r3": {
          "x": 496.5,
          "y": 58.75
        },
        "led3": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Tre LED indicano la posizione del trimmer",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h12",
            "pot1:signal": "bb1:h13",
            "pot1:gnd": "bb1:h14"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c18",
            "r1:pin2": "bb1:c25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d27",
            "led1:cathode": "bb1:d28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "r2",
          "componentType": "resistor",
          "targetPins": {
            "r2:pin1": "bb1:c21",
            "r2:pin2": "bb1:c28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "led2",
          "componentType": "led",
          "targetPins": {
            "led2:anode": "bb1:d30",
            "led2:cathode": "bb1:d21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "r3",
          "componentType": "resistor",
          "targetPins": {
            "r3:pin1": "bb1:c24",
            "r3:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 90.",
          "componentId": "led3",
          "componentType": "led",
          "targetPins": {
            "led3:anode": "bb1:d23",
            "led3:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f12 a bb1:bus-bot-plus-12, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:f12",
          "wireTo": "bb1:bus-bot-plus-12",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f13, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f13",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:f14",
          "wireTo": "bb1:bus-bot-minus-14",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D3 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "nano1:W_D3",
          "wireTo": "bb1:a18",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 12,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:d25",
          "wireTo": "bb1:d27",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 13,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:a28",
          "wireTo": "bb1:bus-bot-minus-28",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 14,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a21, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a21",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 15,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d28 a bb1:d30, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:d28",
          "wireTo": "bb1:d30",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 16,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a21 a bb1:bus-bot-minus-21, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:a21",
          "wireTo": "bb1:bus-bot-minus-21",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 17,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "nano1:W_D6",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 18,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 19,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 20,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 21,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 90.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f12 a bb1:bus-bot-plus-12, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f13, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D3 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a21, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d28 a bb1:d30, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a21 a bb1:bus-bot-minus-21, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 90.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 90."
      ],
      "observe": "Ragazzi, osservate il trimmer divide la scala analogica in tre zone: rosso, giallo e verde.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 90 - ESERCIZIO 7.3: Tre LED indicano la posizione del trimmer. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.3?",
          "options": [
            "Tre LED indicano la posizione del trimmer",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 90: Tre LED indicano la posizione del trimmer."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp4",
      "title": "Aumentare la luminosita con analogWrite",
      "bookRef": "Vol. 3 pag. 97 - ESERCIZIO 7.4",
      "desc": "Un ciclo for aumenta gradualmente il valore PWM scritto sul pin 5.",
      "description": "Un ciclo for aumenta gradualmente il valore PWM scritto sul pin 5.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "nano1:W_D5",
          "to": "bb1:a20",
          "color": "orange"
        },
        {
          "from": "bb1:d27",
          "to": "bb1:d29",
          "color": "green"
        },
        {
          "from": "bb1:a30",
          "to": "bb1:bus-bot-minus-30",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "r1:pin1": "bb1:c20",
        "r1:pin2": "bb1:c27",
        "led1:anode": "bb1:d29",
        "led1:cathode": "bb1:d30"
      },
      "code": "const int LED_PWM = 5;\n\nvoid setup() {\n  pinMode(LED_PWM, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i <= 255; i = i + 5) {\n    analogWrite(LED_PWM, i);\n    delay(10);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "r1": {
          "x": 466.5,
          "y": 58.75
        },
        "led1": {
          "x": 511.5,
          "y": 43.75
        }
      },
      "concept": "Aumentare la luminosita con analogWrite",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 97.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c20",
            "r1:pin2": "bb1:c27"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 97.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d29",
            "led1:cathode": "bb1:d30"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 97.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a20",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 97.",
          "wireFrom": "bb1:d27",
          "wireTo": "bb1:d29",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 97.",
          "wireFrom": "bb1:a30",
          "wireTo": "bb1:bus-bot-minus-30",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 97.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 97.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 97.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 97.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 97.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 97.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 97.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 97.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 97."
      ],
      "observe": "Ragazzi, osservate un ciclo for aumenta gradualmente il valore pwm scritto sul pin 5.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 97 - ESERCIZIO 7.4: Aumentare la luminosita con analogWrite. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.4?",
          "options": [
            "Aumentare la luminosita con analogWrite",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 97: Aumentare la luminosita con analogWrite."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp5",
      "title": "Effetto respiro con due cicli for",
      "bookRef": "Vol. 3 pag. 102 - ESERCIZIO 7.5",
      "desc": "Il LED aumenta e diminuisce la luminosita in modo continuo, come un respiro.",
      "description": "Il LED aumenta e diminuisce la luminosita in modo continuo, come un respiro.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "nano1:W_D5",
          "to": "bb1:a20",
          "color": "orange"
        },
        {
          "from": "bb1:d27",
          "to": "bb1:d29",
          "color": "green"
        },
        {
          "from": "bb1:a30",
          "to": "bb1:bus-bot-minus-30",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "r1:pin1": "bb1:c20",
        "r1:pin2": "bb1:c27",
        "led1:anode": "bb1:d29",
        "led1:cathode": "bb1:d30"
      },
      "code": "const int LED_PWM = 5;\n\nvoid setup() {\n  pinMode(LED_PWM, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i <= 255; i += 5) {\n    analogWrite(LED_PWM, i);\n    delay(10);\n  }\n  for (int i = 255; i >= 0; i -= 5) {\n    analogWrite(LED_PWM, i);\n    delay(10);\n  }\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "r1": {
          "x": 466.5,
          "y": 58.75
        },
        "led1": {
          "x": 511.5,
          "y": 43.75
        }
      },
      "concept": "Effetto respiro con due cicli for",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 102.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c20",
            "r1:pin2": "bb1:c27"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 102.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d29",
            "led1:cathode": "bb1:d30"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 102.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a20",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 102.",
          "wireFrom": "bb1:d27",
          "wireTo": "bb1:d29",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 102.",
          "wireFrom": "bb1:a30",
          "wireTo": "bb1:bus-bot-minus-30",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 102.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 102.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 102.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 102.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a20, come passaggio del circuito di Vol. 3 pag. 102.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d27 a bb1:d29, come passaggio del circuito di Vol. 3 pag. 102.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a30 a bb1:bus-bot-minus-30, come passaggio del circuito di Vol. 3 pag. 102.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 102.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 102."
      ],
      "observe": "Ragazzi, osservate il led aumenta e diminuisce la luminosita in modo continuo, come un respiro.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 102 - ESERCIZIO 7.5: Effetto respiro con due cicli for. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.5?",
          "options": [
            "Effetto respiro con due cicli for",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 102: Effetto respiro con due cicli for."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp6",
      "title": "Il trimmer controlla la luminosita del LED",
      "bookRef": "Vol. 3 pag. 105 - ESERCIZIO 7.6",
      "desc": "map() trasforma la lettura 0-1023 in un valore PWM 0-255.",
      "description": "map() trasforma la lettura 0-1023 in un valore PWM 0-255.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
      "connections": [
        {
          "from": "bb1:f18",
          "to": "bb1:bus-bot-plus-18",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f19",
          "color": "yellow"
        },
        {
          "from": "bb1:f20",
          "to": "bb1:bus-bot-minus-20",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h18",
        "pot1:signal": "bb1:h19",
        "pot1:gnd": "bb1:h20",
        "r1:pin1": "bb1:c24",
        "r1:pin2": "bb1:c21",
        "led1:anode": "bb1:d23",
        "led1:cathode": "bb1:d24"
      },
      "code": "const int LED_PWM = 5;\n\nvoid setup() {\n  pinMode(A0, INPUT);\n  pinMode(LED_PWM, OUTPUT);\n}\n\nvoid loop() {\n  int valoreLetto = analogRead(A0);\n  int valorePWM = map(valoreLetto, 0, 1023, 0, 255);\n  analogWrite(LED_PWM, valorePWM);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 432.75,
          "y": 83.75
        },
        "r1": {
          "x": 496.5,
          "y": 58.75
        },
        "led1": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Il trimmer controlla la luminosita del LED",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 105.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h18",
            "pot1:signal": "bb1:h19",
            "pot1:gnd": "bb1:h20"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 105.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c24",
            "r1:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 105.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d23",
            "led1:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f18 a bb1:bus-bot-plus-18, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "bb1:f18",
          "wireTo": "bb1:bus-bot-plus-18",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f19, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f19",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "bb1:f20",
          "wireTo": "bb1:bus-bot-minus-20",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 105.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 105.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 105.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f18 a bb1:bus-bot-plus-18, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f19, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f20 a bb1:bus-bot-minus-20, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 105.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 105."
      ],
      "observe": "Ragazzi, osservate map() trasforma la lettura 0-1023 in un valore pwm 0-255.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 105 - ESERCIZIO 7.6: Il trimmer controlla la luminosita del LED. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.6?",
          "options": [
            "Il trimmer controlla la luminosita del LED",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 105: Il trimmer controlla la luminosita del LED."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap7-esp7",
      "title": "Generare una tensione analogica sul pin A0",
      "bookRef": "Vol. 3 pag. 109 - ESERCIZIO 7.7",
      "desc": "Il trimmer su A1 controlla una vera uscita analogica su A0, misurata con il multimetro.",
      "description": "Il trimmer su A1 controlla una vera uscita analogica su A0, misurata con il multimetro.",
      "chapter": "Capitolo 7 - Il mondo continuo: i pin analogici",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
        },
        {
          "type": "potentiometer",
          "id": "pot1",
          "value": 10000
        },
        {
          "type": "multimeter",
          "id": "mm1"
        }
      ],
      "connections": [
        {
          "from": "bb1:f16",
          "to": "bb1:bus-bot-plus-16",
          "color": "red"
        },
        {
          "from": "nano1:W_A1",
          "to": "bb1:f17",
          "color": "yellow"
        },
        {
          "from": "bb1:f18",
          "to": "bb1:bus-bot-minus-18",
          "color": "black"
        },
        {
          "from": "nano1:W_A0",
          "to": "mm1:probe-positive",
          "color": "yellow"
        },
        {
          "from": "nano1:GND_R",
          "to": "mm1:probe-negative",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h16",
        "pot1:signal": "bb1:h17",
        "pot1:gnd": "bb1:h18"
      },
      "code": "void setup() {\n  analogWriteResolution(10);\n  pinMode(A1, INPUT);\n}\n\nvoid loop() {\n  int valoreLetto = analogRead(A1);\n  analogWrite(A0, valoreLetto);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 417.75,
          "y": 83.75
        },
        "mm1": {
          "x": 555,
          "y": 42
        }
      },
      "concept": "Generare una tensione analogica sul pin A0",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 109.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h16",
            "pot1:signal": "bb1:h17",
            "pot1:gnd": "bb1:h18"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Multimetro mm1 sul kit, seguendo Vol. 3 pag. 109.",
          "componentId": "mm1",
          "componentType": "multimeter",
          "targetPins": {},
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f16 a bb1:bus-bot-plus-16, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "bb1:f16",
          "wireTo": "bb1:bus-bot-plus-16",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A1 a bb1:f17, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "nano1:W_A1",
          "wireTo": "bb1:f17",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f18 a bb1:bus-bot-minus-18, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "bb1:f18",
          "wireTo": "bb1:bus-bot-minus-18",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a mm1:probe-positive, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "mm1:probe-positive",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a mm1:probe-negative, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "mm1:probe-negative",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 109.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 109.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Multimetro mm1 sul kit, seguendo Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f16 a bb1:bus-bot-plus-16, come passaggio del circuito di Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A1 a bb1:f17, come passaggio del circuito di Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f18 a bb1:bus-bot-minus-18, come passaggio del circuito di Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a mm1:probe-positive, come passaggio del circuito di Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a mm1:probe-negative, come passaggio del circuito di Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 109.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 109."
      ],
      "observe": "Ragazzi, osservate il trimmer su a1 controlla una vera uscita analogica su a0, misurata con il multimetro.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 109 - ESERCIZIO 7.7: Generare una tensione analogica sul pin A0. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 7.7?",
          "options": [
            "Generare una tensione analogica sul pin A0",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 109: Generare una tensione analogica sul pin A0."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap8-esp1",
      "title": "Arduino saluta il computer",
      "bookRef": "Vol. 3 pag. 119 - ESERCIZIO 8.1",
      "desc": "Il Monitor Seriale riceve un messaggio inviato una sola volta dal setup().",
      "description": "Il Monitor Seriale riceve un messaggio inviato una sola volta dal setup().",
      "chapter": "Capitolo 8 - Visualizzare dati: il Monitor Seriale",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
        }
      ],
      "connections": [],
      "pinAssignments": {},
      "code": "void setup() {\n  Serial.begin(9600);\n  while (!Serial) {\n  }\n  Serial.println(\"Ciao dal Team di ELAB!\");\n}\n\nvoid loop() {\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_serial_print\"><field name=\"NEWLINE\">TRUE</field><value name=\"CONTENT\"><shadow type=\"text\"><field name=\"TEXT\">Ciao dal Monitor Seriale</field></shadow></value><next><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></next></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        }
      },
      "concept": "Arduino saluta il computer",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 119.",
          "hint": "Ragazzi, il docente verifica questo collegamento.",
          "componentId": "nano1"
        }
      ],
      "steps": [
        "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 119.",
        "Osserva: Ragazzi, il docente carica il codice di Arduino saluta il computer e confronta il risultato con il Volume 3."
      ],
      "observe": "Ragazzi, osservate il monitor seriale riceve un messaggio inviato una sola volta dal setup().",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 119 - ESERCIZIO 8.1: Arduino saluta il computer. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 8.1?",
          "options": [
            "Arduino saluta il computer",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 119: Arduino saluta il computer."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap8-esp2",
      "title": "Messaggio ripetuto nel loop",
      "bookRef": "Vol. 3 pag. 122 - ESERCIZIO 8.2",
      "desc": "Lo stesso messaggio viene spostato nel loop e compare continuamente.",
      "description": "Lo stesso messaggio viene spostato nel loop e compare continuamente.",
      "chapter": "Capitolo 8 - Visualizzare dati: il Monitor Seriale",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
        }
      ],
      "connections": [],
      "pinAssignments": {},
      "code": "void setup() {\n  Serial.begin(9600);\n  while (!Serial) {\n  }\n}\n\nvoid loop() {\n  Serial.println(\"Ciao dal Team di ELAB!\");\n  delay(1000);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        }
      },
      "concept": "Messaggio ripetuto nel loop",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 122.",
          "hint": "Ragazzi, il docente verifica questo collegamento.",
          "componentId": "nano1"
        }
      ],
      "steps": [
        "Osserva: Ragazzi, il docente collega Arduino Nano R4 via USB e apre lo sketch dell'esercizio sul computer, Vol. 3 pag. 122.",
        "Osserva: Ragazzi, il docente carica il codice di Messaggio ripetuto nel loop e confronta il risultato con il Volume 3."
      ],
      "observe": "Ragazzi, osservate lo stesso messaggio viene spostato nel loop e compare continuamente.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 122 - ESERCIZIO 8.2: Messaggio ripetuto nel loop. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 8.2?",
          "options": [
            "Messaggio ripetuto nel loop",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 122: Messaggio ripetuto nel loop."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap8-esp3",
      "title": "Stampare analogRead sul Monitor Seriale",
      "bookRef": "Vol. 3 pag. 124 - ESERCIZIO 8.3",
      "desc": "Il trimmer viene letto su A0 e stampato come numero da 0 a 1023.",
      "description": "Il trimmer viene letto su A0 e stampato come numero da 0 a 1023.",
      "chapter": "Capitolo 8 - Visualizzare dati: il Monitor Seriale",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
        },
        {
          "type": "potentiometer",
          "id": "pot1",
          "value": 10000
        }
      ],
      "connections": [
        {
          "from": "bb1:f22",
          "to": "bb1:bus-bot-plus-22",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f23",
          "color": "yellow"
        },
        {
          "from": "bb1:f24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h22",
        "pot1:signal": "bb1:h23",
        "pot1:gnd": "bb1:h24"
      },
      "code": "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int valoreLetto = analogRead(A0);\n  Serial.println(valoreLetto);\n  delay(200);\n}",
      "hexFile": "/hex/v3-cap8-esp3.hex",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 462.75,
          "y": 83.75
        }
      },
      "concept": "Stampare analogRead sul Monitor Seriale",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 124.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h22",
            "pot1:signal": "bb1:h23",
            "pot1:gnd": "bb1:h24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f22 a bb1:bus-bot-plus-22, come passaggio del circuito di Vol. 3 pag. 124.",
          "wireFrom": "bb1:f22",
          "wireTo": "bb1:bus-bot-plus-22",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f23, come passaggio del circuito di Vol. 3 pag. 124.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f23",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 124.",
          "wireFrom": "bb1:f24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 124.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 124.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 124.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f22 a bb1:bus-bot-plus-22, come passaggio del circuito di Vol. 3 pag. 124.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f23, come passaggio del circuito di Vol. 3 pag. 124.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 124.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 124.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 124."
      ],
      "observe": "Ragazzi, osservate il trimmer viene letto su a0 e stampato come numero da 0 a 1023.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 124 - ESERCIZIO 8.3: Stampare analogRead sul Monitor Seriale. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 8.3?",
          "options": [
            "Stampare analogRead sul Monitor Seriale",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 124: Stampare analogRead sul Monitor Seriale."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap8-esp4",
      "title": "Due trimmer sul Serial Plotter",
      "bookRef": "Vol. 3 pag. 128 - ESERCIZIO 8.4",
      "desc": "Due letture analogiche vengono stampate con etichette separate per il Serial Plotter.",
      "description": "Due letture analogiche vengono stampate con etichette separate per il Serial Plotter.",
      "chapter": "Capitolo 8 - Visualizzare dati: il Monitor Seriale",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
        }
      ],
      "connections": [
        {
          "from": "bb1:f16",
          "to": "bb1:bus-bot-plus-16",
          "color": "red"
        },
        {
          "from": "nano1:W_A2",
          "to": "bb1:f17",
          "color": "yellow"
        },
        {
          "from": "bb1:f18",
          "to": "bb1:bus-bot-minus-18",
          "color": "black"
        },
        {
          "from": "bb1:f23",
          "to": "bb1:bus-bot-plus-23",
          "color": "red"
        },
        {
          "from": "nano1:W_A3",
          "to": "bb1:f24",
          "color": "yellow"
        },
        {
          "from": "bb1:f25",
          "to": "bb1:bus-bot-minus-25",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h16",
        "pot1:signal": "bb1:h17",
        "pot1:gnd": "bb1:h18",
        "pot2:vcc": "bb1:h23",
        "pot2:signal": "bb1:h24",
        "pot2:gnd": "bb1:h25"
      },
      "code": "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  Serial.print(\"A2:\");\n  Serial.print(analogRead(A2));\n  Serial.print(\" \");\n  Serial.print(\"A3:\");\n  Serial.println(analogRead(A3));\n  delay(100);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 417.75,
          "y": 83.75
        },
        "pot2": {
          "x": 470.25,
          "y": 83.75
        }
      },
      "concept": "Due trimmer sul Serial Plotter",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 128.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h16",
            "pot1:signal": "bb1:h17",
            "pot1:gnd": "bb1:h18"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot2 sul kit, seguendo Vol. 3 pag. 128.",
          "componentId": "pot2",
          "componentType": "potentiometer",
          "targetPins": {
            "pot2:vcc": "bb1:h23",
            "pot2:signal": "bb1:h24",
            "pot2:gnd": "bb1:h25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f16 a bb1:bus-bot-plus-16, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "bb1:f16",
          "wireTo": "bb1:bus-bot-plus-16",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A2 a bb1:f17, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "nano1:W_A2",
          "wireTo": "bb1:f17",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f18 a bb1:bus-bot-minus-18, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "bb1:f18",
          "wireTo": "bb1:bus-bot-minus-18",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f23 a bb1:bus-bot-plus-23, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "bb1:f23",
          "wireTo": "bb1:bus-bot-plus-23",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A3 a bb1:f24, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "nano1:W_A3",
          "wireTo": "bb1:f24",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f25 a bb1:bus-bot-minus-25, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "bb1:f25",
          "wireTo": "bb1:bus-bot-minus-25",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 128.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 128.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot2 sul kit, seguendo Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f16 a bb1:bus-bot-plus-16, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A2 a bb1:f17, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f18 a bb1:bus-bot-minus-18, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f23 a bb1:bus-bot-plus-23, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A3 a bb1:f24, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f25 a bb1:bus-bot-minus-25, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 128.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 128."
      ],
      "observe": "Ragazzi, osservate due letture analogiche vengono stampate con etichette separate per il serial plotter.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 128 - ESERCIZIO 8.4: Due trimmer sul Serial Plotter. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 8.4?",
          "options": [
            "Due trimmer sul Serial Plotter",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 128: Due trimmer sul Serial Plotter."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap8-esp5",
      "title": "Trimmer, tre LED e valori seriali",
      "bookRef": "Vol. 3 pag. 130 - ESERCIZIO 8.5",
      "desc": "Il valore del potenziometro controlla tre LED e viene visto nel Monitor Seriale e nel Plotter.",
      "description": "Il valore del potenziometro controlla tre LED e viene visto nel Monitor Seriale e nel Plotter.",
      "chapter": "Capitolo 8 - Visualizzare dati: il Monitor Seriale",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
        },
        {
          "type": "resistor",
          "id": "r2",
          "value": 470
        },
        {
          "type": "led",
          "id": "led2",
          "color": "yellow"
        },
        {
          "type": "resistor",
          "id": "r3",
          "value": 470
        },
        {
          "type": "led",
          "id": "led3",
          "color": "green"
        }
      ],
      "connections": [
        {
          "from": "bb1:f12",
          "to": "bb1:bus-bot-plus-12",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f13",
          "color": "yellow"
        },
        {
          "from": "bb1:f14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D3",
          "to": "bb1:a18",
          "color": "orange"
        },
        {
          "from": "bb1:d25",
          "to": "bb1:d27",
          "color": "green"
        },
        {
          "from": "bb1:a28",
          "to": "bb1:bus-bot-minus-28",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a21",
          "color": "orange"
        },
        {
          "from": "bb1:d28",
          "to": "bb1:d30",
          "color": "green"
        },
        {
          "from": "bb1:a21",
          "to": "bb1:bus-bot-minus-21",
          "color": "black"
        },
        {
          "from": "nano1:W_D6",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h12",
        "pot1:signal": "bb1:h13",
        "pot1:gnd": "bb1:h14",
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28",
        "r2:pin1": "bb1:c21",
        "r2:pin2": "bb1:c28",
        "led2:anode": "bb1:d30",
        "led2:cathode": "bb1:d21",
        "r3:pin1": "bb1:c24",
        "r3:pin2": "bb1:c21",
        "led3:anode": "bb1:d23",
        "led3:cathode": "bb1:d24"
      },
      "code": "const int LED_ROSSO = 3;\nconst int LED_GIALLO = 5;\nconst int LED_VERDE = 6;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(LED_ROSSO, OUTPUT);\n  pinMode(LED_GIALLO, OUTPUT);\n  pinMode(LED_VERDE, OUTPUT);\n}\n\nvoid loop() {\n  int valore = analogRead(A0);\n  Serial.println(valore);\n  digitalWrite(LED_ROSSO, valore > 200 ? HIGH : LOW);\n  digitalWrite(LED_GIALLO, valore > 500 ? HIGH : LOW);\n  digitalWrite(LED_VERDE, valore > 800 ? HIGH : LOW);\n  delay(100);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 387.75,
          "y": 83.75
        },
        "r1": {
          "x": 451.5,
          "y": 58.75
        },
        "led1": {
          "x": 496.5,
          "y": 43.75
        },
        "r2": {
          "x": 474,
          "y": 58.75
        },
        "led2": {
          "x": 519,
          "y": 43.75
        },
        "r3": {
          "x": 496.5,
          "y": 58.75
        },
        "led3": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Trimmer, tre LED e valori seriali",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h12",
            "pot1:signal": "bb1:h13",
            "pot1:gnd": "bb1:h14"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c18",
            "r1:pin2": "bb1:c25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d27",
            "led1:cathode": "bb1:d28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "r2",
          "componentType": "resistor",
          "targetPins": {
            "r2:pin1": "bb1:c21",
            "r2:pin2": "bb1:c28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "led2",
          "componentType": "led",
          "targetPins": {
            "led2:anode": "bb1:d30",
            "led2:cathode": "bb1:d21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "r3",
          "componentType": "resistor",
          "targetPins": {
            "r3:pin1": "bb1:c24",
            "r3:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 130.",
          "componentId": "led3",
          "componentType": "led",
          "targetPins": {
            "led3:anode": "bb1:d23",
            "led3:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f12 a bb1:bus-bot-plus-12, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:f12",
          "wireTo": "bb1:bus-bot-plus-12",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f13, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f13",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:f14",
          "wireTo": "bb1:bus-bot-minus-14",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D3 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "nano1:W_D3",
          "wireTo": "bb1:a18",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 12,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:d25",
          "wireTo": "bb1:d27",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 13,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:a28",
          "wireTo": "bb1:bus-bot-minus-28",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 14,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a21, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a21",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 15,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d28 a bb1:d30, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:d28",
          "wireTo": "bb1:d30",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 16,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a21 a bb1:bus-bot-minus-21, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:a21",
          "wireTo": "bb1:bus-bot-minus-21",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 17,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "nano1:W_D6",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 18,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 19,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 20,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 21,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 130.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f12 a bb1:bus-bot-plus-12, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f13, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D3 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a21, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d28 a bb1:d30, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a21 a bb1:bus-bot-minus-21, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 130.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 130."
      ],
      "observe": "Ragazzi, osservate il valore del potenziometro controlla tre led e viene visto nel monitor seriale e nel plotter.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 130 - ESERCIZIO 8.5: Trimmer, tre LED e valori seriali. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 8.5?",
          "options": [
            "Trimmer, tre LED e valori seriali",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 130: Trimmer, tre LED e valori seriali."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    },
    {
      "id": "v3-cap8-esp6",
      "title": "Barra progressiva LED",
      "bookRef": "Vol. 3 pag. 132 - ESERCIZIO 8.6",
      "desc": "Tre LED costruiscono una barra progressiva: valore basso, medio, alto.",
      "description": "Tre LED costruiscono una barra progressiva: valore basso, medio, alto.",
      "chapter": "Capitolo 8 - Visualizzare dati: il Monitor Seriale",
      "difficulty": 3,
      "icon": "arduino",
      "simulationMode": "avr",
      "components": [
        {
          "type": "breadboard-half",
          "id": "bb1"
        },
        {
          "type": "nano-r4",
          "id": "nano1"
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
        },
        {
          "type": "resistor",
          "id": "r2",
          "value": 470
        },
        {
          "type": "led",
          "id": "led2",
          "color": "yellow"
        },
        {
          "type": "resistor",
          "id": "r3",
          "value": 470
        },
        {
          "type": "led",
          "id": "led3",
          "color": "green"
        }
      ],
      "connections": [
        {
          "from": "bb1:f12",
          "to": "bb1:bus-bot-plus-12",
          "color": "red"
        },
        {
          "from": "nano1:W_A0",
          "to": "bb1:f13",
          "color": "yellow"
        },
        {
          "from": "bb1:f14",
          "to": "bb1:bus-bot-minus-14",
          "color": "black"
        },
        {
          "from": "nano1:W_D3",
          "to": "bb1:a18",
          "color": "orange"
        },
        {
          "from": "bb1:d25",
          "to": "bb1:d27",
          "color": "green"
        },
        {
          "from": "bb1:a28",
          "to": "bb1:bus-bot-minus-28",
          "color": "black"
        },
        {
          "from": "nano1:W_D5",
          "to": "bb1:a21",
          "color": "orange"
        },
        {
          "from": "bb1:d28",
          "to": "bb1:d30",
          "color": "green"
        },
        {
          "from": "bb1:a21",
          "to": "bb1:bus-bot-minus-21",
          "color": "black"
        },
        {
          "from": "nano1:W_D6",
          "to": "bb1:a24",
          "color": "orange"
        },
        {
          "from": "bb1:d21",
          "to": "bb1:d23",
          "color": "green"
        },
        {
          "from": "bb1:a24",
          "to": "bb1:bus-bot-minus-24",
          "color": "black"
        },
        {
          "from": "nano1:GND_R",
          "to": "bb1:bus-bot-minus-1",
          "color": "black"
        },
        {
          "from": "nano1:5V",
          "to": "bb1:bus-bot-plus-1",
          "color": "red"
        }
      ],
      "pinAssignments": {
        "pot1:vcc": "bb1:h12",
        "pot1:signal": "bb1:h13",
        "pot1:gnd": "bb1:h14",
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28",
        "r2:pin1": "bb1:c21",
        "r2:pin2": "bb1:c28",
        "led2:anode": "bb1:d30",
        "led2:cathode": "bb1:d21",
        "r3:pin1": "bb1:c24",
        "r3:pin2": "bb1:c21",
        "led3:anode": "bb1:d23",
        "led3:cathode": "bb1:d24"
      },
      "code": "const int LED_1 = 3;\nconst int LED_2 = 5;\nconst int LED_3 = 6;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(LED_1, OUTPUT);\n  pinMode(LED_2, OUTPUT);\n  pinMode(LED_3, OUTPUT);\n}\n\nvoid loop() {\n  int valore = analogRead(A0);\n  Serial.println(valore);\n  digitalWrite(LED_1, valore > 50 ? HIGH : LOW);\n  digitalWrite(LED_2, valore > 341 ? HIGH : LOW);\n  digitalWrite(LED_3, valore > 682 ? HIGH : LOW);\n  delay(100);\n}",
      "scratchXml": "<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"arduino_base\" x=\"40\" y=\"30\" deletable=\"false\"><statement name=\"SETUP\"><block type=\"arduino_serial_begin\"><field name=\"BAUD\">9600</field></block></statement><statement name=\"LOOP\"><block type=\"arduino_delay\"><value name=\"DELAY_TIME\"><shadow type=\"math_number\"><field name=\"NUM\">1000</field></shadow></value></block></statement></block></xml>",
      "layout": {
        "nano1": {
          "x": 230,
          "y": 10,
          "parentId": "bb1"
        },
        "bb1": {
          "x": 280,
          "y": 10
        },
        "pot1": {
          "x": 387.75,
          "y": 83.75
        },
        "r1": {
          "x": 451.5,
          "y": 58.75
        },
        "led1": {
          "x": 496.5,
          "y": 43.75
        },
        "r2": {
          "x": 474,
          "y": 58.75
        },
        "led2": {
          "x": 519,
          "y": 43.75
        },
        "r3": {
          "x": 496.5,
          "y": 58.75
        },
        "led3": {
          "x": 541.5,
          "y": 43.75
        }
      },
      "concept": "Barra progressiva LED",
      "layer": "arduino",
      "estimatedMinutes": 30,
      "buildSteps": [
        {
          "step": 1,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "pot1",
          "componentType": "potentiometer",
          "targetPins": {
            "pot1:vcc": "bb1:h12",
            "pot1:signal": "bb1:h13",
            "pot1:gnd": "bb1:h14"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 2,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "r1",
          "componentType": "resistor",
          "targetPins": {
            "r1:pin1": "bb1:c18",
            "r1:pin2": "bb1:c25"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 3,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "led1",
          "componentType": "led",
          "targetPins": {
            "led1:anode": "bb1:d27",
            "led1:cathode": "bb1:d28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 4,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "r2",
          "componentType": "resistor",
          "targetPins": {
            "r2:pin1": "bb1:c21",
            "r2:pin2": "bb1:c28"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 5,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "led2",
          "componentType": "led",
          "targetPins": {
            "led2:anode": "bb1:d30",
            "led2:cathode": "bb1:d21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 6,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "r3",
          "componentType": "resistor",
          "targetPins": {
            "r3:pin1": "bb1:c24",
            "r3:pin2": "bb1:c21"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 7,
          "text": "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 132.",
          "componentId": "led3",
          "componentType": "led",
          "targetPins": {
            "led3:anode": "bb1:d23",
            "led3:cathode": "bb1:d24"
          },
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 8,
          "text": "Osserva: Ragazzi, il docente collega il filo red da bb1:f12 a bb1:bus-bot-plus-12, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:f12",
          "wireTo": "bb1:bus-bot-plus-12",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 9,
          "text": "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f13, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "nano1:W_A0",
          "wireTo": "bb1:f13",
          "wireColor": "yellow",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 10,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:f14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:f14",
          "wireTo": "bb1:bus-bot-minus-14",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 11,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D3 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "nano1:W_D3",
          "wireTo": "bb1:a18",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 12,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:d25",
          "wireTo": "bb1:d27",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 13,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:a28",
          "wireTo": "bb1:bus-bot-minus-28",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 14,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a21, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "nano1:W_D5",
          "wireTo": "bb1:a21",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 15,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d28 a bb1:d30, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:d28",
          "wireTo": "bb1:d30",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 16,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a21 a bb1:bus-bot-minus-21, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:a21",
          "wireTo": "bb1:bus-bot-minus-21",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 17,
          "text": "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "nano1:W_D6",
          "wireTo": "bb1:a24",
          "wireColor": "orange",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 18,
          "text": "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:d21",
          "wireTo": "bb1:d23",
          "wireColor": "green",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 19,
          "text": "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "bb1:a24",
          "wireTo": "bb1:bus-bot-minus-24",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 20,
          "text": "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "nano1:GND_R",
          "wireTo": "bb1:bus-bot-minus-1",
          "wireColor": "black",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        },
        {
          "step": 21,
          "text": "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 132.",
          "wireFrom": "nano1:5V",
          "wireTo": "bb1:bus-bot-plus-1",
          "wireColor": "red",
          "hint": "Ragazzi, il docente verifica questo collegamento."
        }
      ],
      "steps": [
        "Osserva: Ragazzi, osservate dove il docente posiziona Trimmer 10 kOhm pot1 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r1 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led1 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r2 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led2 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, osservate dove il docente posiziona Resistore 470 Ohm r3 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, osservate dove il docente posiziona LED led3 sul kit, seguendo Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo red da bb1:f12 a bb1:bus-bot-plus-12, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo yellow da nano1:W_A0 a bb1:f13, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:f14 a bb1:bus-bot-minus-14, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D3 a bb1:a18, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d25 a bb1:d27, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a28 a bb1:bus-bot-minus-28, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D5 a bb1:a21, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d28 a bb1:d30, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a21 a bb1:bus-bot-minus-21, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo orange da nano1:W_D6 a bb1:a24, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo green da bb1:d21 a bb1:d23, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo black da bb1:a24 a bb1:bus-bot-minus-24, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo black da nano1:GND_R a bb1:bus-bot-minus-1, come passaggio del circuito di Vol. 3 pag. 132.",
        "Osserva: Ragazzi, il docente collega il filo red da nano1:5V a bb1:bus-bot-plus-1, come passaggio del circuito di Vol. 3 pag. 132."
      ],
      "observe": "Ragazzi, osservate tre led costruiscono una barra progressiva: valore basso, medio, alto.",
      "unlimPrompt": "Sei UNLIM, tutor ELAB. Ragazzi, il docente guida la classe nell'esperimento Vol. 3 pag. 132 - ESERCIZIO 8.6: Barra progressiva LED. Spiega in italiano semplice per studenti 8-14 anni, con analogie brevi, collegando codice Arduino, circuito e osservazione.",
      "quiz": [
        {
          "question": "Che cosa verifica ESERCIZIO 8.6?",
          "options": [
            "Barra progressiva LED",
            "Un capitolo fuori libro",
            "Un componente non usato"
          ],
          "correct": 0,
          "explanation": "La risposta segue Vol. 3 pag. 132: Barra progressiva LED."
        },
        {
          "question": "Perche codice e circuito devono restare coerenti nell'esercizio?",
          "options": [
            "Per far corrispondere i pin del programma ai collegamenti reali",
            "Per cambiare capitolo senza avvisare la classe",
            "Per usare componenti scelti a caso"
          ],
          "correct": 0,
          "explanation": "Ragazzi, il docente collega sempre istruzioni Arduino, pin e circuito fisico."
        }
      ]
    }
  ],
  "icon": "arduino",
  "color": "#D94841"
};

export default EXPERIMENTS_VOL3;
