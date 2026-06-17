#!/usr/bin/env python3
"""
Galileo Brain 20K — Massive Dataset Generator
==============================================
Genera 20,000 esempi diversificati per fine-tuning Galileo Brain v2.
Include single-turn e multi-turn, typo engine, slang, emozioni, negazioni.

Uso:
    python3 scripts/generate-brain-20k.py                     # genera 20000
    python3 scripts/generate-brain-20k.py --count 5000        # genera 5000
    python3 scripts/generate-brain-20k.py --seed 42           # riproducibile
    python3 scripts/generate-brain-20k.py --stats             # mostra statistiche
    python3 scripts/generate-brain-20k.py --validate          # valida output

Output: datasets/galileo-brain-20k.jsonl
"""

import json
import random
import argparse
import re
import hashlib
from pathlib import Path
from datetime import datetime

# ============================================================
# SYSTEM PROMPT (v2 — aggiornato con memoria + tab completi)
# ============================================================

SYSTEM_PROMPT = """Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
Ricevi il messaggio dello studente + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura esatta:
{
  "intent": "action|circuit|code|tutor|vision|navigation",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}

REGOLE:
1. "intent" classifica il tipo di richiesta:
   - "action": comandi simulazione (play/pause/reset/clearall/compile/quiz/undo/redo)
   - "circuit": piazzamento componenti, cablaggio, diagnosi circuiti
   - "code": scrittura/modifica codice Arduino, Scratch
   - "tutor": domande teoriche, spiegazioni, concetti, conversazione
   - "vision": analisi visiva dello screenshot
   - "navigation": caricamento esperimenti, cambio tab/volume
2. "entities": lista di componenti, pin, esperimenti menzionati
3. "actions": array di action tag nel formato esatto [AZIONE:...] o [INTENT:{...}]
   - Comandi: [AZIONE:play] [AZIONE:pause] [AZIONE:reset] [AZIONE:clearall] [AZIONE:compile] [AZIONE:quiz]
   - Navigazione: [AZIONE:loadexp:ID] [AZIONE:opentab:NOME] [AZIONE:openvolume:N]
   - Editor: [AZIONE:switcheditor:scratch] [AZIONE:switcheditor:arduino] [AZIONE:openeditor] [AZIONE:closeeditor]
   - Componenti: [INTENT:place_and_wire]
   - Fili: [AZIONE:addwire:DA:PIN:A:PIN]
   - Interazioni: [AZIONE:interact:NOME] [AZIONE:highlight:NOME] [AZIONE:measure:NOME]
   - Codice: [AZIONE:setcode:CODICE] [AZIONE:compile]
   - Rimozione: [AZIONE:removecomponent:NOME] [AZIONE:removewire:DESC]
   - Movimento: [AZIONE:movecomponent:NOME:DIR] [AZIONE:setvalue:NOME:PROP:VAL]
   - Flusso: [AZIONE:undo] [AZIONE:redo] [AZIONE:nextstep] [AZIONE:prevstep]
   - UI: [AZIONE:showbom] [AZIONE:showserial] [AZIONE:resetcode] [AZIONE:showshortcuts]
   - Contenuti: [AZIONE:youtube:QUERY] [AZIONE:createnotebook:TITOLO] [AZIONE:diagnose]
4. "needs_llm": false se la risposta e' deterministica (azioni dirette), true se serve ragionamento LLM
5. "response": risposta breve per l'utente se needs_llm=false. null se needs_llm=true
6. "llm_hint": contesto/istruzioni per il modello grande se needs_llm=true. null se needs_llm=false

COMPONENTI VALIDI (21): led, resistor, push-button, buzzer-piezo, capacitor, potentiometer,
photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo, reed-switch, phototransistor,
battery9v, multimeter, lcd16x2, nano-r4-board, breadboard-half, breadboard-full, wire

PIN MAP:
LED: anode, cathode | Resistor: pin1, pin2 | PushButton: pin1, pin2
BuzzerPiezo: positive, negative | Potentiometer: vcc, signal, gnd
Capacitor: positive, negative | RGB-LED: red, common, green, blue
Diode: anode, cathode | Mosfet-N: gate, drain, source
PhotoResistor: pin1, pin2 | Phototransistor: collector, emitter
MotorDC: positive, negative | Servo: signal, vcc, gnd | ReedSwitch: pin1, pin2
LCD16x2: VSS, VDD, V0, RS, RW, E, D4, D5, D6, D7, A, K

TAB VALIDI: simulator, manual, video, canvas, editor, taccuini, detective, poe, reverse, review
WING PINS: W_A0, W_A1, W_A2, W_A3, W_D3, W_D5, W_D6, W_D9, W_D10, W_D11, W_D12, W_D13,
W_A4/SDA, W_A5/SCL, W_D0/RX, W_D1/TX

MEMORIA: Se lo studente menziona il suo nome, ricordalo. Se fa riferimento a qualcosa detto prima ("quello", "collegalo", "il primo"), usa il contesto per capire a cosa si riferisce."""

# ============================================================
# DATA: COMPONENTI, PIN, ESPERIMENTI
# ============================================================

COMPONENTS = [
    "led", "resistor", "push-button", "buzzer-piezo", "capacitor",
    "potentiometer", "photo-resistor", "diode", "mosfet-n", "rgb-led",
    "motor-dc", "servo", "reed-switch", "phototransistor", "battery9v",
    "multimeter", "lcd16x2", "nano-r4-board", "breadboard-half",
    "breadboard-full", "wire"
]
PLACEABLE = [
    "led", "resistor", "push-button", "buzzer-piezo", "capacitor",
    "potentiometer", "photo-resistor", "diode", "mosfet-n", "rgb-led",
    "motor-dc", "servo", "reed-switch", "phototransistor", "battery9v",
    "multimeter", "lcd16x2"
]
PIN_MAP = {
    "led": ["anode", "cathode"],
    "resistor": ["pin1", "pin2"],
    "push-button": ["pin1", "pin2"],
    "buzzer-piezo": ["positive", "negative"],
    "capacitor": ["positive", "negative"],
    "potentiometer": ["vcc", "signal", "gnd"],
    "photo-resistor": ["pin1", "pin2"],
    "diode": ["anode", "cathode"],
    "mosfet-n": ["gate", "drain", "source"],
    "rgb-led": ["red", "common", "green", "blue"],
    "motor-dc": ["positive", "negative"],
    "servo": ["signal", "vcc", "gnd"],
    "reed-switch": ["pin1", "pin2"],
    "phototransistor": ["collector", "emitter"],
}
WING_PINS = ["W_A0","W_A1","W_A2","W_A3","W_D3","W_D5","W_D6","W_D9","W_D10","W_D11","W_D12","W_D13"]
DIGITAL_PINS = ["D3","D5","D6","D9","D10","D11","D12","D13"]
ANALOG_PINS = ["A0","A1","A2","A3"]
TABS = ["simulator","manual","video","canvas","editor","taccuini","detective","poe","reverse","review"]
GAME_TABS = ["detective","poe","reverse","review"]

EXPERIMENTS = [
    # Volume 1 (38 esperimenti)
    "v1-cap1-esp1","v1-cap2-esp1","v1-cap2-esp2","v1-cap3-esp1","v1-cap3-esp2",
    "v1-cap4-esp1","v1-cap4-esp2","v1-cap5-esp1","v1-cap5-esp2","v1-cap5-esp3",
    "v1-cap6-esp1","v1-cap6-esp2","v1-cap7-esp1","v1-cap7-esp2","v1-cap7-esp3",
    "v1-cap8-esp1","v1-cap8-esp2","v1-cap8-esp3","v1-cap9-esp1","v1-cap9-esp2",
    "v1-cap9-esp3","v1-cap9-esp4","v1-cap9-esp5","v1-cap9-esp6","v1-cap9-esp7",
    "v1-cap9-esp8","v1-cap10-esp1","v1-cap10-esp2","v1-cap11-esp1","v1-cap11-esp2",
    "v1-cap12-esp1","v1-cap12-esp2","v1-cap12-esp3","v1-cap13-esp1","v1-cap13-esp2",
    "v1-cap14-esp1","v1-cap14-esp2","v1-cap14-esp3",
    # Volume 2 (18 esperimenti)
    "v2-cap1-esp1","v2-cap1-esp2","v2-cap2-esp1","v2-cap2-esp2","v2-cap3-esp1",
    "v2-cap3-esp2","v2-cap4-esp1","v2-cap4-esp2","v2-cap5-esp1","v2-cap5-esp2",
    "v2-cap6-esp1","v2-cap6-esp2","v2-cap7-esp1","v2-cap7-esp2","v2-cap8-esp1",
    "v2-cap8-esp2","v2-cap9-esp1","v2-cap10-esp1",
    # Volume 3 (11 esperimenti AVR)
    "v3-cap1-esp1","v3-cap2-esp1","v3-cap3-esp1","v3-cap4-esp1","v3-cap5-esp1",
    "v3-cap6-esp1","v3-cap7-esp1","v3-cap8-esp1","v3-cap9-esp1","v3-cap10-esp1",
    "v3-cap11-esp1",
]

EXP_NAMES = {
    "v1-cap1-esp1": "Cos'e' l'Elettricita'",
    "v1-cap2-esp1": "Il Primo Circuito",
    "v1-cap3-esp1": "LED e Resistenze",
    "v1-cap4-esp1": "Circuiti in Serie",
    "v1-cap5-esp1": "Circuiti in Parallelo",
    "v1-cap6-esp1": "Il Pulsante",
    "v1-cap7-esp1": "Il Buzzer",
    "v1-cap8-esp1": "Il Potenziometro",
    "v1-cap9-esp1": "Il Condensatore",
    "v1-cap10-esp1": "Il Diodo",
    "v1-cap11-esp1": "Il Transistor",
    "v1-cap12-esp1": "Il Motore DC",
    "v1-cap13-esp1": "Il Sensore di Luce",
    "v1-cap14-esp1": "Il Primo Robot",
    "v2-cap1-esp1": "Circuiti Avanzati",
    "v2-cap5-esp1": "RGB LED",
    "v2-cap8-esp1": "Il Servo",
    "v3-cap1-esp1": "Hello Arduino",
    "v3-cap2-esp1": "Blink LED",
    "v3-cap3-esp1": "Semaforo",
    "v3-cap4-esp1": "Buzzer Melodia",
    "v3-cap5-esp1": "Sensore Luce Arduino",
    "v3-cap6-esp1": "Servo Arduino",
    "v3-cap7-esp1": "LCD Display",
    "v3-cap8-esp1": "Comunicazione Seriale",
    "v3-cap9-esp1": "SOS Morse",
    "v3-cap10-esp1": "Simon Says",
    "v3-cap11-esp1": "Stazione Meteo",
}

# ============================================================
# ALIAS COMPONENTI (come li chiamano i bambini)
# ============================================================

COMPONENT_ALIASES = {
    "led": ["LED","led","lucina","lucetta","lampadina","luce","diodo luminoso","ledino","lucciola","la lucina","il led","lampadina LED","il LED"],
    "resistor": ["resistenza","resistore","res","la resistenza","una resistenza","il resistore","ohm","la res"],
    "push-button": ["pulsante","bottone","tasto","il pulsante","pushbutton","switch","interruttore","tastino","pulsantino","button","il bottone"],
    "buzzer-piezo": ["buzzer","cicalino","il buzzer","altoparlante","speaker","suoneria","beeper","il cicalino","piezo","ronzatore","buzzerino"],
    "capacitor": ["condensatore","capacitore","il condensatore","cap","il cap"],
    "potentiometer": ["potenziometro","pot","il pot","il potenziometro","manopola","la manopola","rotella","trimmer"],
    "photo-resistor": ["fotoresistenza","fotoresistore","sensore di luce","LDR","il fotoresistore","la fotoresistenza","sensore luminoso"],
    "diode": ["diodo","il diodo","la diode","un diodo"],
    "mosfet-n": ["mosfet","il mosfet","transistor","il transistor","MOSFET"],
    "rgb-led": ["LED RGB","led rgb","RGB","il led RGB","led colorato","LED multicolore","led a tre colori"],
    "motor-dc": ["motore","motorino","il motore","motore DC","il motorino","motore elettrico"],
    "servo": ["servo","servomotore","il servo","il servomotore","braccetto"],
    "reed-switch": ["reed switch","il reed","sensore magnetico","interruttore magnetico"],
    "phototransistor": ["fototransistor","il fototransistor","sensore ottico"],
    "battery9v": ["batteria","pila","la batteria","batteria 9V","la pila","9 volt"],
    "multimeter": ["multimetro","tester","il multimetro","il tester","voltmetro"],
    "lcd16x2": ["display","LCD","schermo","il display","display LCD","LCD 16x2","il monitor"],
}

# ============================================================
# FRASI BASE PER AZIONI (T1)
# ============================================================

PLAY_PHRASES = [
    "Avvia","Avvia la simulazione","Play","Start","Vai","Fai partire","Accendi",
    "Fai partire il circuito","Lancia la simulazione","Metti in moto","Premi play",
    "Fallo andare","Daje!","Via!","Parti!","Accendilo","Fai girare","Attiva",
    "Dai che si parte","Andiamo!","Proviamo","Testiamo il circuito","Facciamo andare",
    "OK avvia","Si parte","Go!","Run it","Execute","Let's go","Fire it up",
    "Ho finito di montare, avvia","Pronto, fai partire","Il circuito e' pronto, avvia",
    "Dai vai","Forza avvia","Fammelo vedere in azione","Aziona il circuito",
    "Metti in funzione","Fammi vedere come va","Go go go","Partiamo!","Iniziamo!",
    "Mandalo","Prova!","Vediamo se funziona questa cosa","Dai su, fai andare",
    "Fallo funzionare","voglio vederlo in azione","accendi tutto","manda avanti",
]
PAUSE_PHRASES = [
    "Stop","Ferma","Pausa","Metti in pausa","Ferma tutto","Fermalo","Stoppa",
    "Blocca","Fermati","Basta","Stop la simulazione","Premi stop","Spegni","Alt",
    "Aspetta","Fermo!","Stoppalo!","Basta cosi'","Ok basta","Fermati un attimo",
    "Frena","Stoppami tutto","Blocca tutto","Tieni fermo","Non voglio che vada avanti",
    "Pause","Hold","Halt","Stop it","Fermami tutto","Un attimo","Wait",
    "No no ferma!","Blocca blocca!","Stai fermo","Aspe'","Ferma un secondo",
    "fermala","basta fermati","stop stop","ferma la simulazione","spegni tutto",
]
RESET_PHRASES = [
    "Reset","Resetta","Resetta il circuito","Ripristina","Ricomincia",
    "Ricomincia da capo","Resetta tutto","Rimetti a zero","Reimposta",
    "Da capo","Daccapo","Dall'inizio","Ricominciamo","Azzera","Azzera tutto",
    "Fai reset","Premi reset","Resettiamo","Come prima","Rifai da capo",
    "Riportami alla situazione iniziale","Torna allo stato originale",
    "riparti da zero","rimetti tutto a posto","restart",
]
CLEARALL_PHRASES = [
    "Cancella tutto","Pulisci tutto","Svuota","Svuota tutto","Togli tutto",
    "Rimuovi tutto","Elimina tutto","Pulisci la breadboard","Svuota la breadboard",
    "Via tutto","Butta via tutto","Sgombra","Fai piazza pulita","Tabula rasa",
    "Leva tutto","Spazza via","Sparecchia","Ripulisci","Togli tutta sta roba",
    "Voglio ricominciare da zero","Voglio una breadboard vuota",
    "Toglimi tutto di mezzo","Via via tutto","Basta, togli tutto","Clear all",
    "pulisci","cancella","elimina tutto quanto","togili tutto",
]
COMPILE_PHRASES = [
    "Compila","Compila il codice","Compila lo sketch","Verifica il codice",
    "Controlla il codice","Build","Prova a compilare","Lancia la compilazione",
    "Vedi se il codice e' giusto","Testami il codice","Compilalo","Fai il build",
    "Manda in compilazione","Verifica lo sketch","compile","compilazione",
]
QUIZ_PHRASES = [
    "Quiz","Fammi un quiz","Domanda","Fammi una domanda","Prova a interrogarmi",
    "Verificami","Test","Fammi un test","Mettimi alla prova","Interrogami",
    "Challenge","Sfidami","Sparami un quiz","Facciamo un quiz","Quiz!",
    "Interrogazione!","Testami","Daje col quiz","Voglio mettermi alla prova",
    "Vediamo se ho capito","Prova a farmi qualche domanda",
]
DIAGNOSE_PHRASES = [
    "Diagnosi","Diagnostica","Cosa c'e' che non va?","Trova l'errore",
    "Controlla cosa non funziona","Perche' non funziona?","Debug",
    "Cerca il problema","Cosa non va?","Analizza il circuito",
    "Verifica il mio circuito","C'e' qualcosa di sbagliato?",
    "Perche' il LED non si accende?","Non funziona niente, help",
]
UNDO_PHRASES = ["Annulla","Undo","Torna indietro","Ctrl Z","annulla l'ultima cosa","indietro"]
REDO_PHRASES = ["Rifai","Redo","Ripeti","rimetti quello che ho tolto","Ctrl Y","ripristina"]
NEXTSTEP_PHRASES = ["Avanti","Prossimo passo","Prossimo step","Vai avanti","Next","next step","continua"]
PREVSTEP_PHRASES = ["Indietro","Passo precedente","Step precedente","Torna indietro","Previous","back"]
SHOWBOM_PHRASES = ["Mostra i componenti","BOM","Lista componenti","Cosa mi serve?","Quali pezzi servono?","materiali"]
SHOWSERIAL_PHRASES = ["Monitor seriale","Serial monitor","Apri la seriale","Mostra output","Mostra seriale","serial"]
RESETCODE_PHRASES = ["Resetta il codice","Codice originale","Rimetti il codice di default","codice iniziale","reset code"]

# ============================================================
# FRASI PIAZZAMENTO COMPONENTI (T1 — C2)
# ============================================================

PLACE_TEMPLATES = [
    "Metti {comp}","Aggiungi {comp}","Piazza {comp}","Mettimi {comp}",
    "Voglio {comp}","Dammi {comp}","Mi serve {comp}","Ho bisogno di {comp}",
    "Metti {comp} sulla breadboard","Aggiungi {comp} al circuito",
    "Piazzami {comp}","Posiziona {comp}","Inserisci {comp}",
    "Ci metti {comp}?","Puoi mettere {comp}?","Aggiungimi {comp}",
    "Manca {comp}, aggiungilo","Serve {comp}","Ci vuole {comp}",
    "Mettici {comp}","Daje metti {comp}","Su metti {comp}",
]

PLACE_MULTI_TEMPLATES = [
    "Metti {list}","Aggiungi {list}","Mi servono {list}","Piazza {list}",
    "Costruisci un circuito con {list}","Voglio {list} sulla breadboard",
    "Ho bisogno di {list}","Mettimi {list}","Dammi {list}",
    "Prepara {list}","Piazzami {list} per favore",
]

REMOVE_TEMPLATES = [
    "Togli {comp}","Rimuovi {comp}","Elimina {comp}","Leva {comp}",
    "Cancella {comp}","Via {comp}","Non mi serve {comp}","Toglielo",
    "Rimuovilo","Eliminalo","Togli {comp} dal circuito",
]

REPLACE_TEMPLATES = [
    "Sostituisci {old} con {new}","Rimpiazza {old} con {new}",
    "Cambia {old} con {new}","Metti {new} al posto di {old}",
    "Via {old}, metti {new}","Togli {old} e aggiungi {new}",
]

MOVE_TEMPLATES = [
    "Sposta {comp} a destra","Sposta {comp} a sinistra","Sposta {comp} in alto",
    "Sposta {comp} in basso","Metti {comp} piu' a destra","Metti {comp} piu' in alto",
]

# ============================================================
# WIRING (T1 — C4)
# ============================================================

WIRE_TEMPLATES = [
    "Collega {c1} a {c2}","Metti un filo da {c1} a {c2}",
    "Connetti {c1} con {c2}","Fai un collegamento tra {c1} e {c2}",
    "Cabla {c1} a {c2}","Wire da {c1} a {c2}",
    "Collega il pin {p1} di {c1} al pin {p2} di {c2}",
    "Metti un filo tra {c1} pin {p1} e {c2} pin {p2}",
]

WIRE_BUS_TEMPLATES = [
    "Collega {comp} al bus positivo","Collega {comp} al bus negativo",
    "Metti {comp} a massa","Collega {comp} al GND","Collega {comp} al 5V",
    "Collega {comp} a VCC","Collega {comp} al bus-bot-plus",
]

WIRE_WING_TEMPLATES = [
    "Collega {comp} al pin {wing}","Metti un filo da {comp} a {wing}",
    "Connetti {comp} al pin digitale {pin}","Collega {comp} all'analogico {pin}",
]

# ============================================================
# NAVIGAZIONE (T3)
# ============================================================

LOADEXP_TEMPLATES = [
    "Carica l'esperimento {name}","Apri {name}","Vai a {name}",
    "Voglio fare {name}","Fammi fare {name}","Carica {name}",
    "Portami a {name}","Apri l'esperimento {name}","Mostra {name}",
]

TAB_TEMPLATES = [
    "Apri il {tab}","Vai al {tab}","Mostra il {tab}","Passa al {tab}",
    "Fammi vedere il {tab}","Apri la scheda {tab}","Portami al {tab}",
]

TAB_ALIASES = {
    "simulator": ["simulatore","sim","circuito","breadboard"],
    "manual": ["manuale","libro","guida","istruzioni"],
    "video": ["video","filmato","tutorial video"],
    "canvas": ["lavagna","canvas","disegno","foglio"],
    "editor": ["editor","codice","programma","code"],
    "taccuini": ["taccuino","quaderno","appunti","note","notebook"],
    "detective": ["detective","trova il guasto","gioco detective"],
    "poe": ["prevedi e spiega","previsione","poe"],
    "reverse": ["circuito misterioso","reverse","mistero"],
    "review": ["controlla circuito","review","verifica"],
}

EDITOR_SWITCH_TEMPLATES = [
    "Passa a Scratch","Usa Scratch","Voglio programmare con i blocchi",
    "Apri l'editor Scratch","Modalita' blocchi","Passa ai blocchi",
    "Torna ad Arduino","Usa Arduino C++","Codice testuale",
    "Passa all'editor Arduino","Modalita' codice","Torna al codice",
]

# ============================================================
# TEORIA ELETTRONICA (T2 — C8) needs_llm=true
# ============================================================

THEORY_QUESTIONS = [
    "Cos'e' {topic}?","Spiegami {topic}","Come funziona {topic}?",
    "A cosa serve {topic}?","Cosa fa {topic}?","Perche' si usa {topic}?",
    "Mi spieghi {topic}?","Non capisco {topic}","Che cos'e' {topic}?",
    "Parlami di {topic}","Vorrei sapere di piu' su {topic}",
]

THEORY_TOPICS = [
    "una resistenza","un LED","un condensatore","un diodo","un transistor",
    "un potenziometro","un buzzer","un motore DC","un servo","un LED RGB",
    "la legge di Ohm","la corrente elettrica","la tensione","il voltaggio",
    "la resistenza","i circuiti in serie","i circuiti in parallelo",
    "la breadboard","il GND","il 5V","il bus positivo","il bus negativo",
    "il pin digitale","il pin analogico","il PWM","Arduino",
    "il codice Arduino","la funzione setup","la funzione loop",
    "digitalWrite","analogRead","analogWrite","delay","il Serial Monitor",
    "la corrente continua","gli ampere","i volt","gli ohm","i watt",
    "il cortocircuito","la polarita'","l'anodo","il catodo",
    "la capacita'","i farad","i microfarad","la frequenza","il duty cycle",
    "Scratch","Blockly","i blocchi di programmazione","il compilatore",
    "la fotoresistenza","il sensore di luce","il fototransistor",
    "il reed switch","il sensore magnetico","il display LCD",
    "la comunicazione seriale","il baud rate","il protocollo I2C",
]

# ============================================================
# CODICE ARDUINO (T2 — C9/C13) needs_llm=true
# ============================================================

CODE_QUESTIONS = [
    "Come si fa a {action}?","Scrivi il codice per {action}",
    "Programmami {action}","Codice per {action}","Mi aiuti con il codice per {action}?",
    "Come faccio a {action} con Arduino?","Voglio {action}",
    "Scrivimi lo sketch per {action}","Fammi il programma per {action}",
]

CODE_ACTIONS = [
    "far lampeggiare un LED","accendere un LED con il pulsante",
    "leggere il potenziometro","controllare la luminosita' del LED",
    "suonare una melodia con il buzzer","muovere il servo",
    "leggere il sensore di luce","scrivere sul display LCD",
    "usare il Serial Monitor","fare un semaforo","fare il gioco SOS Morse",
    "far lampeggiare 3 LED in sequenza","leggere un valore analogico",
    "usare il PWM per controllare un motore","usare un if-else",
    "usare un ciclo for","definire una funzione","usare una variabile",
    "fare un conto alla rovescia","creare un allarme con il buzzer",
    "controllare il servo con il potenziometro","usare millis invece di delay",
    "leggere la temperatura","fare un Simon Says","usare map()",
]

# ============================================================
# DEBUGGING (T2 — C12) needs_llm=true
# ============================================================

DEBUG_TEMPLATES = [
    "Il LED non si accende, cosa sbaglio?","Il circuito non funziona",
    "Non succede niente quando premo play","Il buzzer non suona",
    "Il motore non gira","Il codice non compila","Errore di compilazione",
    "Il servo non si muove","Il display e' vuoto","Non leggo valori dal sensore",
    "La resistenza e' troppo alta?","Ho collegato tutto ma non va",
    "Il LED lampeggia strano","Il serial monitor non mostra nulla",
    "Il pulsante non risponde","Qualcosa non funziona, aiutami",
    "Ho un problema con il circuito","C'e' un errore da qualche parte",
    "Il LED e' collegato al contrario?","Non capisco perche' non va",
    "Mi da' errore nel codice","Il sensore da' sempre lo stesso valore",
    "Ho sbagliato qualcosa nei collegamenti","Perche' si scalda la resistenza?",
    "Il condensatore e' al contrario?","Il diodo non fa passare corrente",
]

# ============================================================
# COMPARAZIONI (T2 — C11) needs_llm=true
# ============================================================

COMPARE_TEMPLATES = [
    "Qual e' la differenza tra {a} e {b}?",
    "Cosa cambia tra {a} e {b}?",
    "Meglio usare {a} o {b}?",
    "{a} e {b} sono la stessa cosa?",
    "Quando uso {a} e quando {b}?",
]

COMPARE_PAIRS = [
    ("serie","parallelo"),("LED","buzzer"),("resistenza","potenziometro"),
    ("digitale","analogico"),("input","output"),("5V","3.3V"),
    ("diodo","LED"),("motore DC","servo"),("Scratch","Arduino C++"),
    ("corrente","tensione"),("condensatore","resistenza"),
    ("setup","loop"),("digitalRead","analogRead"),
    ("delay","millis"),("HIGH","LOW"),("fotoresistenza","fototransistor"),
]

# ============================================================
# NOMI DI BAMBINI (per T4 — memoria)
# ============================================================

KID_NAMES = [
    "Marco","Sofia","Luca","Giulia","Alessandro","Emma","Francesco","Alice",
    "Lorenzo","Chiara","Matteo","Sara","Andrea","Giorgia","Leonardo","Anna",
    "Davide","Martina","Tommaso","Elena","Nicolo'","Camilla","Gabriele","Greta",
    "Riccardo","Beatrice","Federico","Valentina","Pietro","Aurora",
]

# ============================================================
# ESPRESSIONI EMOTIVE (T5)
# ============================================================

EMOTION_POSITIVE = [
    "Bellissimo!","Wow!","Fantastico!","Troppo forte!","Che bello!",
    "Funziona!","Evvai!","Si'!!","Grande!","Figata!","Amazin!",
    "Ce l'ho fatta!","Finalmente!","Mitico!","Super!",
]

EMOTION_NEGATIVE = [
    "Non capisco niente!","Aiuto!","Non funziona!","Sono confuso",
    "E' troppo difficile","Non ci riesco","Che palle","Boh",
    "Mi sono perso","Non ho capito","Che schifo","Odio sto circuito",
    "Non ne posso piu'","Ma che cavolo","Help me","SOS",
    "Non ci capisco nulla","Che casino","E' impossibile",
]

EMOTION_CURIOUS = [
    "Come mai?","Davvero?","Ma e' vero che...","E se...?",
    "Pero' mi chiedo...","Ah interessante, e...","Figo! E poi?",
    "Wow, come funziona?","Ma perche'?","E se faccio al contrario?",
]

# ============================================================
# OFF-TOPIC (T5 — C32)
# ============================================================

OFFTOPIC_MESSAGES = [
    "Che ore sono?","Mi piace il calcio","Cosa mangi a pranzo?",
    "Hai visto Minecraft?","Giochi a Fortnite?","Quanti anni hai?",
    "Dove abiti?","Mi racconti una barzelletta?","Chi sei?",
    "Sei un robot?","Sei vero?","Puoi fare i compiti di matematica?",
    "Qual e' il tuo colore preferito?","Ti piace la pizza?",
    "Cosa fai nel tempo libero?","Sai cantare?","Parlami di te",
    "Conosci ChatGPT?","Sei meglio di Siri?","Mi annoio",
    "Non ho voglia di studiare","Posso giocare?","Che giorno e' oggi?",
    "Mi aiuti con la tesina?","Sai giocare a scacchi?",
]

# ============================================================
# NEGAZIONI (T5 — C31)
# ============================================================

NEGATION_TEMPLATES = [
    "Non avviare la simulazione","Non togliere {comp}","Non compilare",
    "Non cancellare niente","Non resettare","Aspetta, non fare nulla",
    "Fermo, non ho ancora finito","No, non quello","Non volevo dire quello",
    "Non toccare {comp}","Lascia tutto cosi'","Non cambiare niente",
    "No stop, non era quello che volevo","Non mettere {comp}",
]

# ============================================================
# TYPO ENGINE
# ============================================================

def apply_typo(text, probability=0.3):
    """Applica errori di battitura realistici con probabilita' data."""
    if random.random() > probability:
        return text

    words = text.split()
    if not words:
        return text

    # Scegli una parola da corrompere
    idx = random.randint(0, len(words) - 1)
    word = words[idx]
    if len(word) < 3:
        return text

    typo_type = random.choice(["swap","drop","double","adjacent","space_drop","accent"])

    if typo_type == "swap" and len(word) > 3:
        # Inverti due lettere adiacenti
        pos = random.randint(1, len(word) - 2)
        word = word[:pos] + word[pos+1] + word[pos] + word[pos+2:]
    elif typo_type == "drop":
        # Rimuovi una lettera
        pos = random.randint(1, len(word) - 1)
        word = word[:pos] + word[pos+1:]
    elif typo_type == "double":
        # Raddoppia una lettera
        pos = random.randint(0, len(word) - 1)
        word = word[:pos] + word[pos] + word[pos:]
    elif typo_type == "adjacent":
        # Sostituisci con tasto adiacente
        adj = {"a":"s","s":"d","d":"f","e":"r","r":"t","i":"o","o":"p","n":"m","l":"k","v":"b","c":"x"}
        pos = random.randint(0, len(word) - 1)
        ch = word[pos].lower()
        if ch in adj:
            rep = adj[ch]
            word = word[:pos] + (rep.upper() if word[pos].isupper() else rep) + word[pos+1:]
    elif typo_type == "space_drop" and len(words) > 2:
        # Unisci due parole
        if idx < len(words) - 1:
            words[idx] = words[idx] + words[idx+1]
            words.pop(idx+1)
            return " ".join(words)
    elif typo_type == "accent":
        # Errori accenti
        accent_map = {"e'":"è","a'":"à","o'":"ò","u'":"ù","perche'":"xke","perche":"xke"}
        for old, new in accent_map.items():
            if old in word.lower() and random.random() < 0.5:
                word = word.replace(old, new)
                break

    words[idx] = word
    return " ".join(words)


def augment_phrase(phrase):
    """Aggiunge variazioni naturali: prefissi, suffissi, filler, case."""
    result = phrase

    # 20% prefisso
    if random.random() < 0.20:
        prefix = random.choice([
            "Galileo, ","Ehi, ","Dai, ","Ok ","Senti, ","Per favore ",
            "Puoi ","Mi ","Allora ","Dunque ","Ehm... ","Scusa, ",
            "Aspetta, ","Oh, ","Ah, ","Hmm ","Ehi Galileo, ","Ciao, ",
        ])
        result = prefix + result[0].lower() + result[1:] if result else result

    # 15% suffisso
    if random.random() < 0.15:
        suffix = random.choice([
            " per favore"," grazie"," dai"," va bene?"," ok?"," si?"," eh",
            " perfavore"," pf"," plz"," thx"," ty","!"," :)"," 😊",
        ])
        result = result.rstrip("!?.") + suffix

    # 8% tutto maiuscolo
    if random.random() < 0.08:
        result = result.upper()
    # 10% tutto minuscolo
    elif random.random() < 0.10:
        result = result.lower()

    return result


# ============================================================
# CONTEXT GENERATION
# ============================================================

def random_context(tab=None, comps=None, vol=None, exp=None, wires=None, step=None):
    tab = tab or random.choice(TABS[:5])  # main tabs by default
    vol = vol or random.randint(1, 3)
    if comps is None:
        n = random.randint(0, 5)
        comps = []
        for _ in range(n):
            c = random.choice(PLACEABLE)
            cid = c.replace("-","") + str(comps.count(c.replace("-","")) + 1)
            comps.append(cid)
    wires = wires if wires is not None else random.randint(0, min(len(comps)*2, 8))
    exp = exp or (random.choice(EXPERIMENTS) if random.random() < 0.3 else None)

    ctx = f"[CONTESTO]\ntab: {tab}\n"
    if exp:
        ctx += f"esperimento: {exp}\n"
    ctx += f"componenti: [{', '.join(comps)}]\nfili: {wires}\nvolume_attivo: {vol}"
    if step:
        ctx += f"\nstep_corrente: {step}"
    return ctx


# ============================================================
# EXAMPLE BUILDERS
# ============================================================

def make_example(user_msg, intent, entities, actions, needs_llm, response, llm_hint, ctx=None):
    """Build a single-turn ChatML example."""
    ctx = ctx or random_context()
    full_user = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"
    assistant_json = json.dumps({
        "intent": intent, "entities": entities, "actions": actions,
        "needs_llm": needs_llm, "response": response, "llm_hint": llm_hint,
    }, ensure_ascii=False)
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": full_user},
            {"role": "assistant", "content": assistant_json},
        ]
    }


def make_multi_turn(turns, base_ctx=None):
    """Build a multi-turn ChatML example.
    turns = [(user_msg, intent, entities, actions, needs_llm, response, llm_hint, ctx_override), ...]
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for t in turns:
        user_msg, intent, entities, actions, needs_llm, response, llm_hint = t[:7]
        ctx = t[7] if len(t) > 7 else (base_ctx or random_context())
        full_user = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"
        assistant_json = json.dumps({
            "intent": intent, "entities": entities, "actions": actions,
            "needs_llm": needs_llm, "response": response, "llm_hint": llm_hint,
        }, ensure_ascii=False)
        messages.append({"role": "user", "content": full_user})
        messages.append({"role": "assistant", "content": assistant_json})
    return {"messages": messages}


# ============================================================
# T1: CONTROLLO ONNIPOTENTE — GENERATORS
# ============================================================

def gen_C1_sim_commands(n):
    """C1: Comandi simulazione (play/pause/reset/clearall/compile/undo/redo/nextstep/prevstep/showbom/showserial/resetcode)."""
    results = []
    commands = [
        (PLAY_PHRASES, "[AZIONE:play]", ["Simulazione avviata! ▶","Avvio!","Play!","Si parte!","Via!","Simulazione in corso."]),
        (PAUSE_PHRASES, "[AZIONE:pause]", ["Simulazione in pausa. ⏸","Stop!","Fermato.","In pausa.","Pausa. ⏸"]),
        (RESET_PHRASES, "[AZIONE:reset]", ["Circuito resettato.","Reset!","Tutto dall'inizio.","Ripristinato."]),
        (CLEARALL_PHRASES, "[AZIONE:clearall]", ["Breadboard svuotata!","Tutto rimosso.","Pulito!","Sgomberato!"]),
        (COMPILE_PHRASES, "[AZIONE:compile]", ["Compilazione avviata.","Compilo...","Build!","Verifico il codice."]),
        (QUIZ_PHRASES, "[AZIONE:quiz]", ["Quiz in arrivo!","Ecco il quiz!","Vediamo cosa sai!","Quiz time!"]),
        (DIAGNOSE_PHRASES, "[AZIONE:diagnose]", ["Analizzo il circuito...","Cerco il problema.","Controllo...","Diagnostica in corso."]),
        (UNDO_PHRASES, "[AZIONE:undo]", ["Annullato!","Undo!","Torno indietro.","Fatto, ho annullato."]),
        (REDO_PHRASES, "[AZIONE:redo]", ["Ripetuto!","Redo!","Rifatto.","Ripristinato."]),
        (NEXTSTEP_PHRASES, "[AZIONE:nextstep]", ["Prossimo passo!","Avanti!","Step successivo.","Ecco il prossimo."]),
        (PREVSTEP_PHRASES, "[AZIONE:prevstep]", ["Passo precedente.","Indietro!","Torno allo step prima."]),
        (SHOWBOM_PHRASES, "[AZIONE:showbom]", ["Ecco la lista componenti!","BOM aperto.","Ecco cosa serve."]),
        (SHOWSERIAL_PHRASES, "[AZIONE:showserial]", ["Monitor seriale aperto!","Ecco la seriale.","Serial Monitor attivo."]),
        (RESETCODE_PHRASES, "[AZIONE:resetcode]", ["Codice resettato!","Codice originale ripristinato.","Rimesso il codice di default."]),
    ]

    per_cmd = max(1, n // len(commands))
    remainder = n - per_cmd * len(commands)

    for phrases, action, responses in commands:
        count = per_cmd + (1 if remainder > 0 else 0)
        if remainder > 0:
            remainder -= 1
        for _ in range(count):
            msg = apply_typo(augment_phrase(random.choice(phrases)))
            results.append(make_example(
                msg, "action", [], [action], False,
                random.choice(responses), None,
                random_context(tab="simulator")
            ))
    random.shuffle(results)
    return results[:n]


def gen_C2_place_single(n):
    """C2: Piazzamento singolo componente (21 tipi)."""
    results = []
    for _ in range(n):
        comp = random.choice(PLACEABLE)
        alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
        template = random.choice(PLACE_TEMPLATES)
        msg = apply_typo(augment_phrase(template.format(comp=alias)))
        intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
        results.append(make_example(
            msg, "circuit", [comp],
            [f"[INTENT:{intent_json}]"], False,
            random.choice([f"Ecco, ho piazzato {alias}! ✅",f"{alias} sulla breadboard! ✅",f"Aggiunto {alias}!",f"Ecco {alias}!"]),
            None
        ))
    return results


def gen_C3_place_multi(n):
    """C3: Piazzamento multi-componente (2-8)."""
    results = []
    for _ in range(n):
        count = random.randint(2, min(5, len(PLACEABLE)))
        comps = random.sample(PLACEABLE, count)
        aliases = [random.choice(COMPONENT_ALIASES.get(c, [c])) for c in comps]

        # Vari formati di lista
        if random.random() < 0.3:
            comp_list = ", ".join(aliases[:-1]) + " e " + aliases[-1]
        elif random.random() < 0.5:
            comp_list = ", ".join(aliases)
        else:
            # Con quantita'
            comp_list = ", ".join([f"{random.randint(1,3)} {a}" if random.random()<0.3 else a for a in aliases])

        template = random.choice(PLACE_MULTI_TEMPLATES)
        msg = apply_typo(augment_phrase(template.format(list=comp_list)))

        intent_json = json.dumps({
            "action":"place_and_wire",
            "components":[{"type":c} for c in comps],
            "wires":"auto"
        }, ensure_ascii=False)

        results.append(make_example(
            msg, "circuit", comps,
            [f"[INTENT:{intent_json}]"], False,
            f"Ecco, ho piazzato {len(comps)} componenti! ✅",
            None
        ))
    return results


def gen_C4_wiring(n):
    """C4: Wiring specifico pin-to-pin, bus, wing."""
    results = []
    for _ in range(n):
        r = random.random()
        if r < 0.4:
            # Pin-to-pin wiring
            c1, c2 = random.sample(list(PIN_MAP.keys()), 2)
            p1 = random.choice(PIN_MAP[c1])
            p2 = random.choice(PIN_MAP[c2])
            a1 = random.choice(COMPONENT_ALIASES.get(c1, [c1]))
            a2 = random.choice(COMPONENT_ALIASES.get(c2, [c2]))
            template = random.choice(WIRE_TEMPLATES)
            msg = template.format(c1=a1, c2=a2, p1=p1, p2=p2)
            action = f"[AZIONE:addwire:{c1}:{p1}:{c2}:{p2}]"
            entities = [c1, c2, p1, p2]
        elif r < 0.7:
            # Bus connection
            comp = random.choice(list(PIN_MAP.keys()))
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(WIRE_BUS_TEMPLATES)
            msg = template.format(comp=alias)
            bus = random.choice(["bus-bot-plus","bus-bot-minus"])
            pin = random.choice(PIN_MAP[comp])
            action = f"[AZIONE:addwire:{comp}:{pin}:{bus}]"
            entities = [comp, bus]
        else:
            # Wing pin
            comp = random.choice(list(PIN_MAP.keys()))
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            wing = random.choice(WING_PINS)
            dpin = random.choice(DIGITAL_PINS + ANALOG_PINS)
            template = random.choice(WIRE_WING_TEMPLATES)
            msg = template.format(comp=alias, wing=wing, pin=dpin)
            pin = random.choice(PIN_MAP[comp])
            action = f"[AZIONE:addwire:{comp}:{pin}:{wing}]"
            entities = [comp, wing]

        msg = apply_typo(augment_phrase(msg))
        results.append(make_example(
            msg, "circuit", entities, [action], False,
            random.choice(["Collegato! ✅","Filo aggiunto!","Connesso!","Fatto il collegamento!"]),
            None, random_context(tab="simulator")
        ))
    return results


def gen_C5_remove_replace(n):
    """C5: Rimozione, sostituzione, spostamento."""
    results = []
    for _ in range(n):
        r = random.random()
        if r < 0.45:
            # Rimozione
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(REMOVE_TEMPLATES)
            msg = apply_typo(augment_phrase(template.format(comp=alias)))
            cid = comp.replace("-","") + "1"
            results.append(make_example(
                msg, "circuit", [comp], [f"[AZIONE:removecomponent:{cid}]"], False,
                random.choice([f"{alias} rimosso!","Tolto!","Eliminato!","Via!"]),
                None, random_context(tab="simulator", comps=[cid])
            ))
        elif r < 0.75:
            # Sostituzione
            old_comp, new_comp = random.sample(PLACEABLE, 2)
            old_alias = random.choice(COMPONENT_ALIASES.get(old_comp, [old_comp]))
            new_alias = random.choice(COMPONENT_ALIASES.get(new_comp, [new_comp]))
            template = random.choice(REPLACE_TEMPLATES)
            msg = apply_typo(augment_phrase(template.format(old=old_alias, new=new_alias)))
            old_id = old_comp.replace("-","") + "1"
            intent_json = json.dumps({"action":"place_and_wire","components":[{"type":new_comp}],"wires":"auto"}, ensure_ascii=False)
            results.append(make_example(
                msg, "circuit", [old_comp, new_comp],
                [f"[AZIONE:removecomponent:{old_id}]", f"[INTENT:{intent_json}]"], False,
                f"Sostituito {old_alias} con {new_alias}! ✅",
                None, random_context(tab="simulator", comps=[old_id])
            ))
        else:
            # Spostamento
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(MOVE_TEMPLATES)
            msg = apply_typo(augment_phrase(template.format(comp=alias)))
            cid = comp.replace("-","") + "1"
            direction = random.choice(["destra","sinistra","alto","basso"])
            results.append(make_example(
                msg, "circuit", [comp], [f"[AZIONE:movecomponent:{cid}:{direction}]"], False,
                f"{alias} spostato! ✅", None,
                random_context(tab="simulator", comps=[cid])
            ))
    return results


def gen_C6_interactions(n):
    """C6: highlight, interact, measure, setvalue."""
    results = []
    for _ in range(n):
        r = random.random()
        comp = random.choice(list(COMPONENT_ALIASES.keys()))
        alias = random.choice(COMPONENT_ALIASES[comp])
        cid = comp.replace("-","") + "1"

        if r < 0.3:
            # Highlight
            templates = [f"Dov'e' {alias}?",f"Mostrami {alias}",f"Evidenzia {alias}",f"Indicami {alias}",f"Fammi vedere {alias}"]
            msg = apply_typo(augment_phrase(random.choice(templates)))
            results.append(make_example(msg, "action", [comp], [f"[AZIONE:highlight:{cid}]"], False,
                f"Ecco {alias}! 🔍", None, random_context(tab="simulator", comps=[cid])))
        elif r < 0.55:
            # Interact
            actions_map = {
                "push-button": ("premi","press"),
                "potentiometer": ("ruota","rotate"),
                "led": ("accendi","toggle"),
            }
            if comp in actions_map:
                verb_it, verb_en = actions_map[comp]
                templates = [f"{verb_it.capitalize()} {alias}",f"Fai {verb_it} {alias}",f"{verb_it} il {alias}"]
            else:
                templates = [f"Interagisci con {alias}",f"Attiva {alias}",f"Usa {alias}"]
            msg = apply_typo(augment_phrase(random.choice(templates)))
            results.append(make_example(msg, "action", [comp], [f"[AZIONE:interact:{cid}]"], False,
                f"Fatto! ✅", None, random_context(tab="simulator", comps=[cid])))
        elif r < 0.75:
            # Measure
            templates = [f"Misura {alias}",f"Quanti volt su {alias}?",f"Che corrente passa in {alias}?",
                         f"Misura la tensione su {alias}",f"Misura la resistenza di {alias}"]
            msg = apply_typo(augment_phrase(random.choice(templates)))
            prop = random.choice(["voltage","current","resistance"])
            results.append(make_example(msg, "action", [comp], [f"[AZIONE:measure:{cid}:{prop}]"], False,
                f"Misuro {alias}... 📏", None, random_context(tab="simulator", comps=[cid, "multimeter1"])))
        else:
            # Setvalue
            if comp == "resistor":
                val = random.choice(["100","220","330","470","1000","4700","10000"])
                msg = apply_typo(augment_phrase(f"Cambia {alias} a {val} ohm"))
                results.append(make_example(msg, "circuit", [comp], [f"[AZIONE:setvalue:{cid}:resistance:{val}]"], False,
                    f"Resistenza impostata a {val}Ω! ✅", None, random_context(tab="simulator", comps=[cid])))
            elif comp == "capacitor":
                val = random.choice(["100uF","10uF","47uF","1000uF"])
                msg = apply_typo(augment_phrase(f"Metti {alias} a {val}"))
                results.append(make_example(msg, "circuit", [comp], [f"[AZIONE:setvalue:{cid}:capacitance:{val}]"], False,
                    f"Capacita' impostata a {val}! ✅", None, random_context(tab="simulator", comps=[cid])))
            else:
                msg = apply_typo(augment_phrase(f"Cambia il valore di {alias}"))
                results.append(make_example(msg, "circuit", [comp], [f"[AZIONE:setvalue:{cid}:value:auto]"], False,
                    f"Valore aggiornato! ✅", None, random_context(tab="simulator", comps=[cid])))
    return results


def gen_C7_multi_action(n):
    """C7: Multi-action chains (build+play, remove+replace, etc.)."""
    results = []
    chain_templates = [
        # Build + play
        lambda: _chain_build_play(),
        # Remove + replace
        lambda: _chain_remove_replace(),
        # Build + wire + play
        lambda: _chain_build_wire_play(),
        # Clearall + build
        lambda: _chain_clear_build(),
        # Compile + play
        lambda: _chain_compile_play(),
    ]
    for _ in range(n):
        gen = random.choice(chain_templates)
        results.append(gen())
    return results

def _chain_build_play():
    comp = random.choice(PLACEABLE[:8])
    alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
    phrases = [f"Metti {alias} e avvia",f"Aggiungi {alias} e fai partire",
               f"Piazza {alias} poi premi play",f"Dammi {alias} e avvia la simulazione"]
    msg = apply_typo(augment_phrase(random.choice(phrases)))
    intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
    return make_example(msg, "circuit", [comp], [f"[INTENT:{intent_json}]","[AZIONE:play]"], False,
        f"{alias} piazzato e simulazione avviata! ▶✅", None)

def _chain_remove_replace():
    old, new = random.sample(PLACEABLE[:8], 2)
    oa = random.choice(COMPONENT_ALIASES.get(old, [old]))
    na = random.choice(COMPONENT_ALIASES.get(new, [new]))
    msg = apply_typo(augment_phrase(f"Togli {oa} e metti {na}"))
    oid = old.replace("-","") + "1"
    intent_json = json.dumps({"action":"place_and_wire","components":[{"type":new}],"wires":"auto"}, ensure_ascii=False)
    return make_example(msg, "circuit", [old, new], [f"[AZIONE:removecomponent:{oid}]",f"[INTENT:{intent_json}]"], False,
        f"Via {oa}, ecco {na}! ✅", None, random_context(tab="simulator", comps=[oid]))

def _chain_build_wire_play():
    comp = random.choice(list(PIN_MAP.keys()))
    alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
    msg = apply_typo(augment_phrase(f"Metti {alias}, collegalo e avvia"))
    intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
    return make_example(msg, "circuit", [comp], [f"[INTENT:{intent_json}]","[AZIONE:play]"], False,
        f"{alias} piazzato, collegato e avviato! ▶✅", None)

def _chain_clear_build():
    comp = random.choice(PLACEABLE[:8])
    alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
    msg = apply_typo(augment_phrase(f"Pulisci tutto e metti {alias}"))
    intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
    return make_example(msg, "circuit", [comp], ["[AZIONE:clearall]",f"[INTENT:{intent_json}]"], False,
        f"Breadboard svuotata, ecco {alias}! ✅", None)

def _chain_compile_play():
    msg = apply_typo(augment_phrase(random.choice(["Compila e avvia","Build e play","Compila poi fai partire","Verifica e avvia"])))
    return make_example(msg, "action", [], ["[AZIONE:compile]","[AZIONE:play]"], False,
        "Compilo e avvio! ⚙▶", None, random_context(tab="editor"))


# ============================================================
# T2: ONNISCIENZA — GENERATORS
# ============================================================

def gen_C8_theory(n):
    """C8: Domande teoriche elettronica (needs_llm=true)."""
    results = []
    for _ in range(n):
        topic = random.choice(THEORY_TOPICS)
        template = random.choice(THEORY_QUESTIONS)
        msg = apply_typo(augment_phrase(template.format(topic=topic)))
        results.append(make_example(
            msg, "tutor", [topic.split()[-1]], [], True, None,
            f"Lo studente chiede di spiegare {topic}. Usa analogie semplici per bambini 8-12 anni."
        ))
    return results


def gen_C9_code_questions(n):
    """C9: Domande codice Arduino (needs_llm=true)."""
    results = []
    for _ in range(n):
        action = random.choice(CODE_ACTIONS)
        template = random.choice(CODE_QUESTIONS)
        msg = apply_typo(augment_phrase(template.format(action=action)))
        results.append(make_example(
            msg, "code", [], [], True, None,
            f"Lo studente vuole: {action}. Scrivi codice Arduino semplice, commenta ogni riga."
        ))
    return results


def gen_C10_experiment_info(n):
    """C10: Domande su esperimenti (needs_llm=true)."""
    results = []
    templates = [
        "Cosa imparo nell'esperimento {name}?","Cosa fa l'esperimento {name}?",
        "A cosa serve {name}?","Di cosa parla {name}?",
        "Che componenti servono per {name}?","E' difficile {name}?",
        "Quanto ci vuole per fare {name}?","Mi descrivi {name}?",
    ]
    for _ in range(n):
        exp_id = random.choice(list(EXP_NAMES.keys()))
        exp_name = EXP_NAMES[exp_id]
        template = random.choice(templates)
        msg = apply_typo(augment_phrase(template.format(name=exp_name)))
        results.append(make_example(
            msg, "tutor", [exp_id], [], True, None,
            f"Lo studente chiede informazioni sull'esperimento {exp_id} ({exp_name}). Descrivi brevemente cosa si impara."
        ))
    return results


def gen_C11_compare(n):
    """C11: Domande comparative (needs_llm=true)."""
    results = []
    for _ in range(n):
        a, b = random.choice(COMPARE_PAIRS)
        template = random.choice(COMPARE_TEMPLATES)
        msg = apply_typo(augment_phrase(template.format(a=a, b=b)))
        results.append(make_example(
            msg, "tutor", [a, b], [], True, None,
            f"Lo studente chiede la differenza tra {a} e {b}. Spiega in modo semplice per bambini."
        ))
    return results


def gen_C12_debug(n):
    """C12: Debug/diagnosi circuiti (needs_llm=true)."""
    results = []
    for _ in range(n):
        msg = apply_typo(augment_phrase(random.choice(DEBUG_TEMPLATES)))
        comps = [f"{random.choice(PLACEABLE).replace('-','')}{i+1}" for i in range(random.randint(1, 4))]
        results.append(make_example(
            msg, "tutor", [], ["[AZIONE:diagnose]"], True, None,
            "Lo studente ha un problema con il circuito. Analizza i componenti e collegamenti, suggerisci cosa controllare.",
            random_context(tab="simulator", comps=comps)
        ))
    return results


def gen_C13_code_gen(n):
    """C13: Code generation (needs_llm=true, con setcode)."""
    results = []
    for _ in range(n):
        action = random.choice(CODE_ACTIONS)
        template = random.choice(["Scrivimi il codice per {a}","Programmami {a}","Fai il codice per {a}","Codice per {a}"])
        msg = apply_typo(augment_phrase(template.format(a=action)))
        results.append(make_example(
            msg, "code", [], [], True, None,
            f"Lo studente vuole codice per: {action}. Genera codice Arduino C++ semplice con commenti. Usa [AZIONE:setcode:...] per iniettare il codice.",
            random_context(tab="editor", vol=3)
        ))
    return results


def gen_C14_quiz_games(n):
    """C14: Quiz e giochi didattici."""
    results = []
    game_phrases = [
        "Giochiamo a Trova il Guasto","Facciamo Prevedi e Spiega","Circuito Misterioso",
        "Giochiamo!","Facciamo un gioco","Fammi giocare","Apri il gioco detective",
        "Voglio giocare a Prevedi e Spiega","Apri il gioco reverse",
        "Facciamo Controlla Circuito","Gioco!","Sfida!",
    ]
    for _ in range(n):
        r = random.random()
        if r < 0.5:
            # Quiz
            msg = apply_typo(augment_phrase(random.choice(QUIZ_PHRASES)))
            results.append(make_example(msg, "action", [], ["[AZIONE:quiz]"], False,
                random.choice(["Quiz in arrivo!","Ecco il quiz!","Vediamo cosa sai!"]), None))
        else:
            # Giochi
            msg = apply_typo(augment_phrase(random.choice(game_phrases)))
            tab = random.choice(GAME_TABS)
            results.append(make_example(msg, "navigation", [tab], [f"[AZIONE:opentab:{tab}]"], False,
                f"Apro il gioco! 🎮", None))
    return results


# ============================================================
# T3: NAVIGAZIONE — GENERATORS
# ============================================================

def gen_C15_loadexp(n):
    """C15: Caricamento esperimenti con nomi fuzzy."""
    results = []
    for _ in range(n):
        exp_id = random.choice(list(EXP_NAMES.keys()))
        exp_name = EXP_NAMES[exp_id]

        # Vari modi di riferirsi all'esperimento
        refs = [
            exp_name, exp_name.lower(), exp_id,
            f"capitolo {exp_id.split('-')[0][1:]}", # "capitolo 1"
            f"esperimento {exp_id.split('-')[-1][-1]}",
            exp_name.split()[0] if len(exp_name.split()) > 1 else exp_name,  # prima parola
        ]
        ref = random.choice(refs)
        template = random.choice(LOADEXP_TEMPLATES)
        msg = apply_typo(augment_phrase(template.format(name=ref)))
        results.append(make_example(
            msg, "navigation", [exp_id], [f"[AZIONE:loadexp:{exp_id}]"], False,
            f"Carico: {exp_name} 📚", None
        ))
    return results


def gen_C16_tab_switch(n):
    """C16: Tab switching."""
    results = []
    for _ in range(n):
        tab = random.choice(TABS)
        aliases = TAB_ALIASES.get(tab, [tab])
        alias = random.choice(aliases)
        template = random.choice(TAB_TEMPLATES)
        msg = apply_typo(augment_phrase(template.format(tab=alias)))
        results.append(make_example(
            msg, "navigation", [tab], [f"[AZIONE:opentab:{tab}]"], False,
            random.choice([f"Apro {alias}!","Eccolo!",f"Passo a {alias}."]), None
        ))
    return results


def gen_C17_volume_nav(n):
    """C17: Volume navigation."""
    results = []
    templates = ["Vai al volume {v}","Apri volume {v}","Volume {v}","Portami al volume {v}",
                 "Fammi vedere il volume {v}","Passa al volume {v}"]
    for _ in range(n):
        vol = random.randint(1, 3)
        template = random.choice(templates)
        msg = apply_typo(augment_phrase(template.format(v=vol)))
        results.append(make_example(
            msg, "navigation", [f"volume{vol}"], [f"[AZIONE:openvolume:{vol}]"], False,
            f"Apro Volume {vol}! 📖", None
        ))
    return results


def gen_C18_editor_switch(n):
    """C18: Editor switching scratch/arduino."""
    results = []
    scratch_phrases = ["Passa a Scratch","Usa Scratch","Voglio i blocchi","Modalita' blocchi",
                       "Apri Scratch","Editor Scratch","Programma con blocchi","Blockly"]
    arduino_phrases = ["Passa ad Arduino","Usa Arduino C++","Codice testuale","Modalita' codice",
                       "Torna al codice","Editor Arduino","Arduino IDE","Scrivi in C++"]
    for _ in range(n):
        if random.random() < 0.5:
            msg = apply_typo(augment_phrase(random.choice(scratch_phrases)))
            results.append(make_example(msg, "navigation", ["scratch"], ["[AZIONE:switcheditor:scratch]"], False,
                "Passo a Scratch! 🧩", None, random_context(tab="editor", vol=3)))
        else:
            msg = apply_typo(augment_phrase(random.choice(arduino_phrases)))
            results.append(make_example(msg, "navigation", ["arduino"], ["[AZIONE:switcheditor:arduino]"], False,
                "Passo ad Arduino C++! 💻", None, random_context(tab="editor", vol=3)))
    return results


def gen_C19_resources(n):
    """C19: YouTube, notebook, risorse."""
    results = []
    yt_queries = ["come funziona un LED","tutorial breadboard","Arduino per principianti",
                  "circuiti in serie","legge di Ohm","elettronica per bambini","PWM Arduino",
                  "sensore di luce tutorial","servo motore Arduino","LCD Arduino"]
    nb_titles = ["Appunti circuiti","Note LED","Lezione resistenze","Esperimento servo",
                 "I miei esperimenti","Appunti volume 1","Note Arduino"]
    for _ in range(n):
        if random.random() < 0.6:
            query = random.choice(yt_queries)
            phrases = [f"Cerca un video su {query}",f"Video su {query}",f"Tutorial {query}",
                       f"Mostrami un video su {query}",f"Voglio vedere un video su {query}"]
            msg = apply_typo(augment_phrase(random.choice(phrases)))
            results.append(make_example(msg, "action", [], [f"[AZIONE:youtube:{query}]"], False,
                "Cerco un video per te! 🎬", None))
        else:
            title = random.choice(nb_titles)
            phrases = [f"Crea un taccuino '{title}'",f"Nuovo taccuino: {title}",f"Fai un taccuino su {title}"]
            msg = apply_typo(augment_phrase(random.choice(phrases)))
            results.append(make_example(msg, "action", [], [f"[AZIONE:createnotebook:{title}]"], False,
                f"Taccuino '{title}' creato! 📓", None))
    return results


# ============================================================
# T4: MEMORIA & PERSISTENZA — MULTI-TURN GENERATORS
# ============================================================

def gen_C20_remember_name(n):
    """C20: Multi-turn — ricordare il nome dello studente."""
    results = []
    for _ in range(n):
        name = random.choice(KID_NAMES)
        age = random.randint(8, 14)
        ctx = random_context()

        # Turn 1: studente dice il nome
        intro_phrases = [f"Ciao, mi chiamo {name}",f"Sono {name}",f"Il mio nome e' {name}",
                         f"Mi presento: {name}, {age} anni",f"Hey sono {name}!",f"{name}, piacere"]
        # Turn 2: studente chiede qualcosa
        action_phrases = [f"Metti un LED","Cos'e' una resistenza?","Avvia la simulazione"]
        # Turn 3: studente chiede se ricordi il nome
        recall_phrases = [f"Come mi chiamo?","Ti ricordi il mio nome?","Chi sono?",
                          f"Sai come mi chiamo?","Ricordi chi sono?"]

        turn1_msg = apply_typo(augment_phrase(random.choice(intro_phrases)))
        turn2_msg = apply_typo(augment_phrase(random.choice(action_phrases)))
        turn3_msg = apply_typo(augment_phrase(random.choice(recall_phrases)))

        turns = [
            (turn1_msg, "tutor", [name], [], False, f"Ciao {name}! Benvenuto in ELAB Tutor! 👋 Cosa vuoi fare oggi?", None, ctx),
            (turn2_msg, "action" if "Avvia" in turn2_msg else ("circuit" if "LED" in turn2_msg else "tutor"),
             [], ["[AZIONE:play]"] if "Avvia" in turn2_msg else [], "Avvia" not in turn2_msg and "LED" not in turn2_msg,
             "Simulazione avviata! ▶" if "Avvia" in turn2_msg else None,
             None if "Avvia" in turn2_msg else f"{name} chiede una spiegazione.", ctx),
            (turn3_msg, "tutor", [name], [], False, f"Certo! Ti chiami {name}! 😊", None, ctx),
        ]
        results.append(make_multi_turn(turns, ctx))
    return results


def gen_C21_context_memory(n):
    """C21: Multi-turn — ricordare componenti piazzati."""
    results = []
    for _ in range(n):
        comp1 = random.choice(PLACEABLE[:8])
        comp2 = random.choice([c for c in PLACEABLE[:8] if c != comp1])
        a1 = random.choice(COMPONENT_ALIASES.get(comp1, [comp1]))
        a2 = random.choice(COMPONENT_ALIASES.get(comp2, [comp2]))

        ctx1 = random_context(tab="simulator", comps=[])
        cid1 = comp1.replace("-","") + "1"
        ctx2 = random_context(tab="simulator", comps=[cid1])

        intent1 = json.dumps({"action":"place_and_wire","components":[{"type":comp1}],"wires":"auto"}, ensure_ascii=False)
        intent2 = json.dumps({"action":"place_and_wire","components":[{"type":comp2}],"wires":"auto"}, ensure_ascii=False)

        turns = [
            (apply_typo(augment_phrase(f"Metti {a1}")), "circuit", [comp1], [f"[INTENT:{intent1}]"], False, f"Ecco {a1}! ✅", None, ctx1),
            (apply_typo(augment_phrase(f"Adesso aggiungi anche {a2}")), "circuit", [comp2], [f"[INTENT:{intent2}]"], False, f"Aggiunto {a2}! ✅", None, ctx2),
            (apply_typo(augment_phrase("Cosa c'e' sulla breadboard?")), "tutor", [comp1, comp2], [], False,
             f"Sulla breadboard hai {a1} e {a2}.", None, ctx2),
        ]
        results.append(make_multi_turn(turns))
    return results


def gen_C22_action_chains(n):
    """C22: Multi-turn — catene di azioni sequenziali."""
    results = []
    for _ in range(n):
        comp = random.choice(PLACEABLE[:8])
        alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
        ctx = random_context(tab="simulator")
        cid = comp.replace("-","") + "1"

        intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)

        n_turns = random.randint(2, 4)
        steps = [
            (apply_typo(augment_phrase(f"Metti {alias}")), "circuit", [comp], [f"[INTENT:{intent_json}]"], False, f"Ecco {alias}! ✅", None, ctx),
        ]
        if n_turns >= 2:
            steps.append((apply_typo(augment_phrase("Collegalo")), "circuit", [comp], [f"[AZIONE:addwire:{cid}:auto:bus-bot-plus]"], False, "Collegato! ✅", None, ctx))
        if n_turns >= 3:
            steps.append((apply_typo(augment_phrase("Avvia")), "action", [], ["[AZIONE:play]"], False, "Play! ▶", None, ctx))
        if n_turns >= 4:
            steps.append((apply_typo(augment_phrase("Ferma")), "action", [], ["[AZIONE:pause]"], False, "Pausa. ⏸", None, ctx))

        results.append(make_multi_turn(steps))
    return results


def gen_C23_corrections(n):
    """C23: Correzioni post-errore ('no, intendevo...')."""
    results = []
    correction_phrases = [
        "No, intendevo {correct}","Non quello, volevo {correct}","Scusa, volevo dire {correct}",
        "No no, {correct}","Sbagliato, metti {correct}","Anzi, {correct}",
        "Cambia, metti {correct}","Ho sbagliato, {correct}","Aspetta, {correct}",
    ]
    for _ in range(n):
        wrong, correct = random.sample(PLACEABLE[:10], 2)
        wa = random.choice(COMPONENT_ALIASES.get(wrong, [wrong]))
        ca = random.choice(COMPONENT_ALIASES.get(correct, [correct]))
        ctx = random_context(tab="simulator")
        wid = wrong.replace("-","") + "1"

        intent_wrong = json.dumps({"action":"place_and_wire","components":[{"type":wrong}],"wires":"auto"}, ensure_ascii=False)
        intent_correct = json.dumps({"action":"place_and_wire","components":[{"type":correct}],"wires":"auto"}, ensure_ascii=False)

        correction = random.choice(correction_phrases).format(correct=ca)

        turns = [
            (apply_typo(augment_phrase(f"Metti {wa}")), "circuit", [wrong], [f"[INTENT:{intent_wrong}]"], False, f"Ecco {wa}! ✅", None, ctx),
            (apply_typo(augment_phrase(correction)), "circuit", [wrong, correct],
             [f"[AZIONE:removecomponent:{wid}]", f"[INTENT:{intent_correct}]"], False,
             f"Corretto! Via {wa}, ecco {ca}! ✅", None, ctx),
        ]
        results.append(make_multi_turn(turns))
    return results


def gen_C24_anaphoric(n):
    """C24: Riferimenti anaforici ('quello', 'collegalo', 'il primo')."""
    results = []
    for _ in range(n):
        comp = random.choice(PLACEABLE[:8])
        alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
        cid = comp.replace("-","") + "1"
        ctx = random_context(tab="simulator", comps=[cid])

        intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)

        anaphoric_phrases = [
            "Collegalo","Rimuovilo","Spostalo a destra","Evidenzialo",
            "Quello la'","Il primo","L'ultimo che ho messo","Quello rosso",
            "Quello che hai appena messo","Accendilo","Provalo",
        ]

        turns = [
            (apply_typo(augment_phrase(f"Metti {alias}")), "circuit", [comp], [f"[INTENT:{intent_json}]"], False, f"Ecco {alias}! ✅", None, ctx),
            (apply_typo(augment_phrase(random.choice(anaphoric_phrases))), "circuit", [comp],
             [f"[AZIONE:highlight:{cid}]"], False, f"Fatto con {alias}! ✅", None, ctx),
        ]
        results.append(make_multi_turn(turns))
    return results


def gen_C25_resume(n):
    """C25: Ripresa conversazione."""
    results = []
    resume_phrases = [
        "Dove eravamo rimasti?","Cosa stavamo facendo?","Continuiamo",
        "Riprendi da dove eravamo","Cosa stavo facendo?","Avanti",
        "Ok sono tornato","Eccomi, riprendiamo","Sono pronto, continua",
    ]
    for _ in range(n):
        exp_id = random.choice(list(EXP_NAMES.keys()))
        exp_name = EXP_NAMES[exp_id]
        ctx = random_context(tab="simulator", exp=exp_id, step=f"{random.randint(2,4)}/5")
        msg = apply_typo(augment_phrase(random.choice(resume_phrases)))
        results.append(make_example(
            msg, "tutor", [exp_id], [], True, None,
            f"Lo studente vuole riprendere l'esperimento {exp_name}. Ricorda lo step corrente dal contesto.",
            ctx
        ))
    return results


def gen_C26_preferences(n):
    """C26: Preferenze apprese (multi-turn)."""
    results = []
    for _ in range(n):
        name = random.choice(KID_NAMES)
        pref_type = random.choice(["nickname","tool","color","style"])
        ctx = random_context(tab="simulator")

        if pref_type == "nickname":
            comp = random.choice(["led","buzzer-piezo","resistor"])
            nickname = random.choice(["lucina","ronzatore","la cosina","il cosetto"])
            turns = [
                (f"Io chiamo il LED '{nickname}'", "tutor", [comp], [], False,
                 f"Va bene! D'ora in poi {nickname} sara' il tuo nome per il LED! 😊", None, ctx),
                (f"Metti una {nickname}", "circuit", [comp],
                 [f'[INTENT:{json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)}]'],
                 False, f"Ecco la tua {nickname}! ✅", None, ctx),
            ]
        elif pref_type == "tool":
            turns = [
                ("Preferisco usare Scratch", "tutor", ["scratch"], [], False,
                 "Perfetto! Scratch e' ottimo per iniziare! 🧩", None, ctx),
                ("Apri il mio editor preferito", "navigation", ["scratch"], ["[AZIONE:switcheditor:scratch]"], False,
                 "Apro Scratch come piace a te! 🧩", None, ctx),
            ]
        else:
            turns = [
                (f"Mi chiamo {name} e ho {random.randint(8,12)} anni", "tutor", [name], [], False,
                 f"Ciao {name}! Benvenuto! 👋", None, ctx),
                ("Ricordati che mi piacciono i LED colorati", "tutor", ["rgb-led"], [], False,
                 f"Certo {name}, me lo ricordo! I LED RGB sono fantastici! 🌈", None, ctx),
            ]

        results.append(make_multi_turn(turns))
    return results


# ============================================================
# T5: ROBUSTEZZA — GENERATORS
# ============================================================

def gen_C27_heavy_typos(n):
    """C27: Errori battitura gravi."""
    results = []
    # Messaggi con typo intenzionali pesanti
    typo_pairs = [
        ("avvia la simulazione", "aviva la simulazzione", "action", [], ["[AZIONE:play]"], False, "Simulazione avviata! ▶"),
        ("metti una resistenza", "meti una rezistenza", "circuit", ["resistor"], None, False, None),
        ("compila il codice", "conpila il codise", "action", [], ["[AZIONE:compile]"], False, "Compilazione avviata."),
        ("ferma la simulazione", "frema la simulasione", "action", [], ["[AZIONE:pause]"], False, "In pausa. ⏸"),
        ("cancella tutto", "canncella tuto", "action", [], ["[AZIONE:clearall]"], False, "Tutto rimosso."),
        ("metti un LED", "meti un led", "circuit", ["led"], None, False, None),
        ("aggiungi un buzzer", "agiunci un buser", "circuit", ["buzzer-piezo"], None, False, None),
        ("collega al pin D3", "colega al pin d3", "circuit", ["D3"], None, False, None),
        ("cos'e' una resistenza", "cose una resistensa", "tutor", ["resistor"], [], True, None),
        ("apri il simulatore", "apri il simulaotore", "navigation", ["simulator"], ["[AZIONE:opentab:simulator]"], False, "Apro il simulatore!"),
        ("resetta il circuito", "resseta il circuitto", "action", [], ["[AZIONE:reset]"], False, "Reset!"),
        ("fammi un quiz", "fami un quis", "action", [], ["[AZIONE:quiz]"], False, "Quiz in arrivo!"),
        ("il LED non si accende", "il led non si acende", "tutor", ["led"], ["[AZIONE:diagnose]"], True, None),
        ("metti un condensatore", "meti un condenzatore", "circuit", ["capacitor"], None, False, None),
        ("passa a Scratch", "pasa a scrtach", "navigation", ["scratch"], ["[AZIONE:switcheditor:scratch]"], False, "Passo a Scratch! 🧩"),
    ]

    for _ in range(n):
        base = random.choice(typo_pairs)
        clean, typo_msg, intent, entities, actions, needs_llm, response = base

        # Ulteriore corruzione casuale
        msg = apply_typo(typo_msg, probability=0.5)

        if actions is None:
            comp = entities[0] if entities else "led"
            intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
            actions = [f"[INTENT:{intent_json}]"]
            if response is None:
                alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
                response = f"Ecco {alias}! ✅"

        llm_hint = f"Messaggio con typo. L'utente intende: {clean}" if needs_llm else None
        if needs_llm:
            response = None

        results.append(make_example(msg, intent, entities, actions, needs_llm, response, llm_hint))
    return results


def gen_C28_kid_slang(n):
    """C28: Linguaggio bambino/slang."""
    results = []
    slang_examples = [
        ("Mettici la lucina rossa", "circuit", ["led"], True),
        ("Fai andare sto coso", "action", [], False),
        ("Togili la roba da li'", "action", [], False),
        ("Damme quel cosetto che fa bip", "circuit", ["buzzer-piezo"], True),
        ("Fammi vedere come gira il motorino", "action", ["motor-dc"], False),
        ("Ma che e' sta robba qui?", "tutor", [], True),
        ("Metti la cosa che misura", "circuit", ["multimeter"], True),
        ("Attacca la batteria al coso", "circuit", ["battery9v"], True),
        ("Schiaccia il bottone", "action", ["push-button"], False),
        ("Gira la manopola", "action", ["potentiometer"], False),
        ("La luce non va", "tutor", ["led"], True),
        ("Il coso non suona", "tutor", ["buzzer-piezo"], True),
        ("Famo un giochino", "action", [], False),
        ("Voglio giocare col semaforo", "navigation", ["v3-cap3-esp1"], False),
    ]
    for _ in range(n):
        ex = random.choice(slang_examples)
        msg_text, intent, entities, needs_llm = ex

        msg = augment_phrase(msg_text)

        if intent == "action" and not needs_llm:
            if "andare" in msg_text or "gira" in msg_text:
                results.append(make_example(msg, "action", entities, ["[AZIONE:play]"], False, "Play! ▶", None))
            elif "togili" in msg_text.lower() or "roba" in msg_text.lower():
                results.append(make_example(msg, "action", [], ["[AZIONE:clearall]"], False, "Tutto via!", None))
            elif "bottone" in msg_text or "schiaccia" in msg_text:
                results.append(make_example(msg, "action", entities, ["[AZIONE:interact:pushbutton1]"], False, "Premuto! ✅", None,
                    random_context(tab="simulator", comps=["pushbutton1"])))
            elif "manopola" in msg_text:
                results.append(make_example(msg, "action", entities, ["[AZIONE:interact:potentiometer1]"], False, "Ruotato! ✅", None,
                    random_context(tab="simulator", comps=["potentiometer1"])))
            elif "giochino" in msg_text:
                results.append(make_example(msg, "action", [], ["[AZIONE:quiz]"], False, "Giochiamo! 🎮", None))
            else:
                results.append(make_example(msg, "action", entities, ["[AZIONE:play]"], False, "Fatto!", None))
        elif intent == "navigation":
            exp = entities[0] if entities else "v3-cap3-esp1"
            results.append(make_example(msg, "navigation", entities, [f"[AZIONE:loadexp:{exp}]"], False,
                "Carico l'esperimento! 📚", None))
        elif needs_llm:
            if entities and entities[0] in PLACEABLE:
                comp = entities[0]
                intent_json = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
                results.append(make_example(msg, "circuit", entities, [f"[INTENT:{intent_json}]"], False,
                    f"Ecco! ✅", None))
            else:
                results.append(make_example(msg, "tutor", entities, [], True, None,
                    "Messaggio in linguaggio informale/bambino. Rispondi in modo amichevole e comprensibile."))
        else:
            results.append(make_example(msg, intent, entities, [], needs_llm, "Fatto!", None))
    return results


def gen_C29_vague(n):
    """C29: Messaggi vaghi/ambigui."""
    results = []
    vague_messages = [
        ("Fai qualcosa","tutor",[],True,"Lo studente e' vago. Chiedi cosa vuole fare: costruire, programmare, quiz?"),
        ("Aiutami","tutor",[],True,"Lo studente chiede aiuto generico. Chiedi in cosa: circuito, codice, concetto?"),
        ("Non va","tutor",[],True,"Lo studente ha un problema ma non specifica. Chiedi: cosa non funziona?"),
        ("Boh","tutor",[],True,"Lo studente sembra confuso. Suggerisci opzioni: quiz, esperimento, costruire?"),
        ("E adesso?","tutor",[],True,"Lo studente non sa cosa fare. Suggerisci il prossimo passo basandoti sul contesto."),
        ("Cosa faccio?","tutor",[],True,"Lo studente chiede guida. Suggerisci basandoti sull'esperimento attivo."),
        ("Non so","tutor",[],True,"Lo studente e' incerto. Incoraggialo e suggerisci un'attivita'."),
        ("Mmh","tutor",[],True,"Lo studente sta pensando. Chiedi se ha bisogno di aiuto."),
        ("Ok","tutor",[],True,"Lo studente conferma. Chiedi se vuole procedere al prossimo passo."),
        ("Tipo...","tutor",[],True,"Lo studente esita. Aiutalo a formulare la richiesta."),
    ]
    for _ in range(n):
        msg_text, intent, entities, needs_llm, hint = random.choice(vague_messages)
        msg = apply_typo(augment_phrase(msg_text))
        results.append(make_example(msg, intent, entities, [], needs_llm, None, hint))
    return results


def gen_C30_emotional(n):
    """C30: Messaggi emotivi."""
    results = []
    for _ in range(n):
        r = random.random()
        if r < 0.35:
            msg = apply_typo(random.choice(EMOTION_POSITIVE))
            results.append(make_example(msg, "tutor", [], [], True, None,
                "Lo studente e' entusiasta/felice. Rispondi con entusiasmo, incoraggia, suggerisci il prossimo passo."))
        elif r < 0.7:
            msg = apply_typo(random.choice(EMOTION_NEGATIVE))
            results.append(make_example(msg, "tutor", [], [], True, None,
                "Lo studente e' frustrato/confuso. Rispondi con calma, empatia, offri aiuto concreto step-by-step."))
        else:
            msg = apply_typo(random.choice(EMOTION_CURIOUS))
            results.append(make_example(msg, "tutor", [], [], True, None,
                "Lo studente e' curioso. Rispondi alla curiosita' con entusiasmo e approfondimento adatto a 8-12 anni."))
    return results


def gen_C31_negations(n):
    """C31: Negazioni esplicite."""
    results = []
    for _ in range(n):
        comp = random.choice(PLACEABLE[:6])
        alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
        template = random.choice(NEGATION_TEMPLATES)
        msg = apply_typo(augment_phrase(template.format(comp=alias)))
        results.append(make_example(
            msg, "tutor", [], [], False,
            random.choice(["Ok, non faccio nulla! 👍","Va bene, fermo tutto.","Ok, lascio tutto cosi'.","Capito, non tocco niente!"]),
            None
        ))
    return results


def gen_C32_offtopic(n):
    """C32: Off-topic con redirect."""
    results = []
    for _ in range(n):
        msg = apply_typo(augment_phrase(random.choice(OFFTOPIC_MESSAGES)))
        results.append(make_example(
            msg, "tutor", [], [], True, None,
            "Messaggio off-topic. Rispondi brevemente in modo simpatico, poi ridireziona verso elettronica/Arduino/ELAB."
        ))
    return results


def gen_C33_extremes(n):
    """C33: Messaggi estremi (troppo corti/lunghi)."""
    results = []
    for _ in range(n):
        if random.random() < 0.5:
            # Ultra corto
            shorts = ["play","stop","led","reset","quiz","go","si","no","?","!","help","sos","boh","ok","via",
                      "dai","su","giu","fai","metti","togli","compila","scratch","arduino"]
            msg = random.choice(shorts)
            if msg in ["play","go","dai","su","via"]:
                results.append(make_example(msg, "action", [], ["[AZIONE:play]"], False, "Play! ▶", None))
            elif msg in ["stop","no","basta"]:
                results.append(make_example(msg, "action", [], ["[AZIONE:pause]"], False, "Stop. ⏸", None))
            elif msg == "led":
                ij = json.dumps({"action":"place_and_wire","components":[{"type":"led"}],"wires":"auto"}, ensure_ascii=False)
                results.append(make_example(msg, "circuit", ["led"], [f"[INTENT:{ij}]"], False, "LED piazzato! ✅", None))
            elif msg == "reset":
                results.append(make_example(msg, "action", [], ["[AZIONE:reset]"], False, "Reset!", None))
            elif msg in ["quiz","?"]:
                results.append(make_example(msg, "action", [], ["[AZIONE:quiz]"], False, "Quiz! 🎯", None))
            elif msg == "compila":
                results.append(make_example(msg, "action", [], ["[AZIONE:compile]"], False, "Compilo...", None))
            elif msg == "scratch":
                results.append(make_example(msg, "navigation", ["scratch"], ["[AZIONE:switcheditor:scratch]"], False, "Scratch! 🧩", None))
            else:
                results.append(make_example(msg, "tutor", [], [], True, None, "Messaggio molto breve. Chiedi chiarimenti."))
        else:
            # Ultra lungo (ma valido)
            comp = random.choice(PLACEABLE[:5])
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            long_msg = (f"Ciao Galileo, senti volevo chiederti una cosa, praticamente io sto cercando di fare "
                       f"questo esperimento e volevo mettere {alias} sulla breadboard perche' ho letto sul libro "
                       f"che serve per questo circuito, pero' non so bene dove metterlo e come collegarlo, "
                       f"mi puoi aiutare per favore? Grazie mille!")
            ij = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"}, ensure_ascii=False)
            results.append(make_example(long_msg, "circuit", [comp], [f"[INTENT:{ij}]"], False,
                f"Ecco {alias}! L'ho posizionato sulla breadboard. ✅", None))
    return results


# ============================================================
# C34: VISION — analisi visiva screenshot (INTENT: vision)
# ============================================================

def gen_C34_vision(n):
    """C34: Richieste visione — guardare/analizzare il circuito."""
    results = []
    VISION_PHRASES = [
        "Guarda il mio circuito", "Cosa vedi?", "Analizza il circuito",
        "Controlla se e' giusto", "Dimmi se ho montato bene",
        "Guarda lo screenshot", "Puoi vedere il mio circuito?",
        "Controlla il mio lavoro", "Cosa c'e' che non va?",
        "Verifica il mio circuito", "Hai occhi? Guardalo!",
        "Guarda e dimmi se funziona", "Controlla la breadboard",
        "Analizza quello che ho fatto", "Guarda lo schema",
        "E' fatto bene?", "Fammi un check visivo",
        "Guarda cosa ho costruito", "Com'e' il mio circuito?",
        "Dimmi se manca qualcosa guardando", "Verifica visivamente",
        "Guardalo e correggi", "Dai un occhio al circuito",
        "Controlla visivamente", "Vedi qualche errore?",
        "Guarda il mio disegno", "Analizza l'immagine",
        "Cosa noti nel mio circuito?", "Come ti sembra?",
        "Puoi analizzare il mio lavoro?", "Osserva il circuito",
    ]
    VISION_COMBINED = [
        "Guarda il circuito e dimmi cosa correggere",
        "Controlla se e' giusto e se no aggiusta",
        "Guarda e poi avvia la simulazione",
        "Analizza il mio circuito e suggerisci miglioramenti",
        "Verifica il circuito e dimmi se posso avviare",
        "Guarda cosa ho fatto, va bene per l'esperimento?",
    ]
    for _ in range(n):
        r = random.random()
        if r < 0.55:
            # Pure vision — needs LLM for visual analysis
            msg = augment_phrase(random.choice(VISION_PHRASES))
            results.append(make_example(msg, "vision", [], [],
                True, None, "Lo studente chiede di analizzare visivamente il circuito. Usa la funzione vision per descrivere e diagnosticare."))
        elif r < 0.8:
            # Vision + action (combined)
            msg = augment_phrase(random.choice(VISION_COMBINED))
            results.append(make_example(msg, "vision", [], [],
                True, None, "Lo studente chiede analisi visiva + suggerimenti o azioni. Prima analizza, poi suggerisci correzioni."))
        elif r < 0.9:
            # Vision with typos
            msg = apply_typo(random.choice(VISION_PHRASES), probability=1.0)
            results.append(make_example(msg, "vision", [], [],
                True, None, "Richiesta vision con errori ortografici. Analizza visivamente il circuito."))
        else:
            # Vision with slang
            slang = random.choice([
                "Ehi guarda sto coso", "Guarda che ho fatto mannaggia",
                "Dai fammi vedere se va bene stoo", "Controlla sta roba",
                "Occhio al circuito dai", "Guarda un po' come sto messo",
                "Ce l'ho fatta? Guarda!", "Dimmi se fa schifo",
                "Riesci a vedere il mio capolavoro?", "Guarda qua che casino",
            ])
            results.append(make_example(slang, "vision", [], [],
                True, None, "Richiesta vision informale/slang. Analizza il circuito visivamente."))
    return results


# ============================================================
# MASTER GENERATOR
# ============================================================

def generate_dataset(target_count=20000, seed=None):
    """Genera l'intero dataset 20K."""
    if seed is not None:
        random.seed(seed)

    # Calcola proporzioni
    scale = target_count / 20000.0

    print(f"🧠 Galileo Brain 20K — Generating {target_count} examples...")
    print(f"   Scale factor: {scale:.2f}")

    dataset = []

    # T1: Controllo Onnipotente (40%)
    print("  T1: Controllo Onnipotente...")
    dataset.extend(gen_C1_sim_commands(int(1500 * scale)))
    dataset.extend(gen_C2_place_single(int(1500 * scale)))
    dataset.extend(gen_C3_place_multi(int(1500 * scale)))
    dataset.extend(gen_C4_wiring(int(1000 * scale)))
    dataset.extend(gen_C5_remove_replace(int(800 * scale)))
    dataset.extend(gen_C6_interactions(int(800 * scale)))
    dataset.extend(gen_C7_multi_action(int(900 * scale)))
    print(f"    → {len(dataset)} examples")

    t1_count = len(dataset)

    # T2: Onniscienza (25%)
    print("  T2: Onniscienza...")
    dataset.extend(gen_C8_theory(int(1200 * scale)))
    dataset.extend(gen_C9_code_questions(int(800 * scale)))
    dataset.extend(gen_C10_experiment_info(int(600 * scale)))
    dataset.extend(gen_C11_compare(int(400 * scale)))
    dataset.extend(gen_C12_debug(int(800 * scale)))
    dataset.extend(gen_C13_code_gen(int(700 * scale)))
    dataset.extend(gen_C14_quiz_games(int(500 * scale)))
    print(f"    → {len(dataset) - t1_count} examples")

    t2_count = len(dataset)

    # T3: Navigazione (10%)
    print("  T3: Navigazione...")
    dataset.extend(gen_C15_loadexp(int(800 * scale)))
    dataset.extend(gen_C16_tab_switch(int(400 * scale)))
    dataset.extend(gen_C17_volume_nav(int(300 * scale)))
    dataset.extend(gen_C18_editor_switch(int(300 * scale)))
    dataset.extend(gen_C19_resources(int(200 * scale)))
    print(f"    → {len(dataset) - t2_count} examples")

    t3_count = len(dataset)

    # T4: Memoria & Persistenza (15%) — MULTI-TURN
    print("  T4: Memoria & Persistenza (multi-turn)...")
    dataset.extend(gen_C20_remember_name(int(300 * scale)))
    dataset.extend(gen_C21_context_memory(int(500 * scale)))
    dataset.extend(gen_C22_action_chains(int(600 * scale)))
    dataset.extend(gen_C23_corrections(int(500 * scale)))
    dataset.extend(gen_C24_anaphoric(int(500 * scale)))
    dataset.extend(gen_C25_resume(int(300 * scale)))
    dataset.extend(gen_C26_preferences(int(300 * scale)))
    print(f"    → {len(dataset) - t3_count} examples")

    t4_count = len(dataset)

    # T5: Robustezza (10%)
    print("  T5: Robustezza...")
    dataset.extend(gen_C27_heavy_typos(int(500 * scale)))
    dataset.extend(gen_C28_kid_slang(int(350 * scale)))
    dataset.extend(gen_C29_vague(int(250 * scale)))
    dataset.extend(gen_C30_emotional(int(200 * scale)))
    dataset.extend(gen_C31_negations(int(200 * scale)))
    dataset.extend(gen_C32_offtopic(int(200 * scale)))
    dataset.extend(gen_C33_extremes(int(100 * scale)))
    print(f"    → {len(dataset) - t4_count} examples")

    t5_count = len(dataset)

    # T6: Vision (extra — per coprire l'intent vision mancante)
    print("  T6: Vision...")
    dataset.extend(gen_C34_vision(int(500 * scale)))
    print(f"    → {len(dataset) - t5_count} examples")

    # Post-processing: fix empty responses for needs_llm=false
    print("  Post-processing: fixing empty responses...")
    fixed_empty = 0
    for entry in dataset:
        for m in entry['messages']:
            if m['role'] == 'assistant':
                try:
                    p = json.loads(m['content'])
                    if not p.get('needs_llm') and not p.get('response'):
                        p['response'] = random.choice(["Fatto! ✅", "Ok! 👍", "Ecco! ✅", "Pronto! ✅"])
                        m['content'] = json.dumps(p, ensure_ascii=False)
                        fixed_empty += 1
                except:
                    pass
    if fixed_empty:
        print(f"    → Fixed {fixed_empty} empty responses")

    # Dedup
    print("  Deduplicating...")
    seen = set()
    unique_dataset = []
    for entry in dataset:
        h = hashlib.md5(json.dumps(entry, sort_keys=True).encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            unique_dataset.append(entry)
    removed = len(dataset) - len(unique_dataset)
    dataset = unique_dataset
    if removed:
        print(f"    → Removed {removed} duplicates")

    # Shuffle
    random.shuffle(dataset)

    # Trim to exact count
    dataset = dataset[:target_count]

    print(f"\n✅ Generated {len(dataset)} examples total")
    return dataset


# ============================================================
# VALIDATION
# ============================================================

def validate_dataset(dataset):
    """Valida il dataset: JSON, action tag, copertura."""
    stats = {
        "total": len(dataset),
        "json_valid": 0,
        "multi_turn": 0,
        "single_turn": 0,
        "needs_llm_true": 0,
        "needs_llm_false": 0,
        "intents": {},
        "action_tags": set(),
        "components_seen": set(),
        "experiments_seen": set(),
        "tabs_seen": set(),
        "duplicates": 0,
    }

    seen_hashes = set()
    errors = []

    for i, entry in enumerate(dataset):
        msgs = entry.get("messages", [])
        n_assistant = sum(1 for m in msgs if m["role"] == "assistant")

        if n_assistant > 1:
            stats["multi_turn"] += 1
        else:
            stats["single_turn"] += 1

        for m in msgs:
            if m["role"] == "assistant":
                try:
                    data = json.loads(m["content"])
                    stats["json_valid"] += 1

                    intent = data.get("intent", "unknown")
                    stats["intents"][intent] = stats["intents"].get(intent, 0) + 1

                    if data.get("needs_llm"):
                        stats["needs_llm_true"] += 1
                    else:
                        stats["needs_llm_false"] += 1

                    for action in data.get("actions", []):
                        tag = action.split(":")[0] + ":" + action.split(":")[1].rstrip("]") if ":" in action else action
                        stats["action_tags"].add(tag)

                    for ent in data.get("entities", []):
                        if ent in COMPONENTS or ent in PLACEABLE:
                            stats["components_seen"].add(ent)
                        if ent.startswith("v") and "-cap" in ent:
                            stats["experiments_seen"].add(ent)

                except json.JSONDecodeError as e:
                    errors.append(f"  Line {i}: Invalid JSON — {e}")

        # Duplicate check (hash of user messages)
        user_msgs = " | ".join(m["content"][:100] for m in msgs if m["role"] == "user")
        h = hashlib.md5(user_msgs.encode()).hexdigest()
        if h in seen_hashes:
            stats["duplicates"] += 1
        seen_hashes.add(h)

    # Report
    total_assistant = stats["needs_llm_true"] + stats["needs_llm_false"]
    print("\n" + "="*60)
    print("📊 VALIDATION REPORT")
    print("="*60)
    print(f"  Total examples: {stats['total']}")
    print(f"  Single-turn: {stats['single_turn']}")
    print(f"  Multi-turn: {stats['multi_turn']}")
    print(f"  JSON valid: {stats['json_valid']}/{total_assistant} ({100*stats['json_valid']/max(1,total_assistant):.1f}%)")
    print(f"  needs_llm=false: {stats['needs_llm_false']} ({100*stats['needs_llm_false']/max(1,total_assistant):.1f}%)")
    print(f"  needs_llm=true: {stats['needs_llm_true']} ({100*stats['needs_llm_true']/max(1,total_assistant):.1f}%)")
    print(f"  Duplicates: {stats['duplicates']}")
    print(f"\n  Intents:")
    for intent, count in sorted(stats["intents"].items(), key=lambda x: -x[1]):
        print(f"    {intent}: {count}")
    print(f"\n  Action tags covered: {len(stats['action_tags'])}")
    for tag in sorted(stats["action_tags"]):
        print(f"    {tag}")
    print(f"\n  Components seen: {len(stats['components_seen'])}/{len(PLACEABLE)}")
    print(f"  Experiments seen: {len(stats['experiments_seen'])}/{len(EXPERIMENTS)}")

    if errors:
        print(f"\n  ❌ ERRORS ({len(errors)}):")
        for e in errors[:20]:
            print(f"    {e}")
    else:
        print(f"\n  ✅ ALL VALID!")

    return stats, errors


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Galileo Brain 20K Dataset Generator")
    parser.add_argument("--count", type=int, default=20000, help="Number of examples to generate")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    parser.add_argument("--output", type=str, default=None, help="Output file path")
    parser.add_argument("--stats", action="store_true", help="Show stats of existing dataset")
    parser.add_argument("--validate", action="store_true", help="Validate existing dataset")
    args = parser.parse_args()

    output_path = args.output or str(Path(__file__).parent.parent / "datasets" / "galileo-brain-20k.jsonl")

    if args.stats or args.validate:
        print(f"📂 Loading {output_path}...")
        dataset = []
        with open(output_path) as f:
            for line in f:
                if line.strip():
                    dataset.append(json.loads(line))
        validate_dataset(dataset)
        return

    # Generate
    dataset = generate_dataset(target_count=args.count, seed=args.seed)

    # Validate
    stats, errors = validate_dataset(dataset)

    if errors:
        print(f"\n⚠️  {len(errors)} errors found. Fix before training.")
        return

    # Write
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for entry in dataset:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    file_size = Path(output_path).stat().st_size / (1024 * 1024)
    print(f"\n💾 Saved to {output_path} ({file_size:.1f} MB)")
    print(f"   {len(dataset)} examples, {stats['multi_turn']} multi-turn, {stats['single_turn']} single-turn")
    print(f"   {stats['needs_llm_true']} needs_llm=true ({100*stats['needs_llm_true']/max(1,len(dataset)):.1f}%)")
    print(f"   Ready for fine-tuning! 🚀")


if __name__ == "__main__":
    main()
