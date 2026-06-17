#!/usr/bin/env python3
"""
Galileo Brain Dataset Factory v7 — ONNIPOTENZA Edition
Generates JSONL training data for the Galileo Brain routing model.

Coverage:
- 46 simulator actions × 200+ linguistic variants each
- 21 component types × all combinations
- 62 experiments across 3 volumes
- 8 stratification layers
- Teacher/professor scenarios (inexperienced)
- Kid language (10-14 years old)
- Typos, dialect, slang, spoken Italian
- Multi-action sequences
- Implicit intent detection
- Long confused requests
- Context-aware routing
"""

import json
import random
import argparse
import hashlib
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from itertools import combinations

# Import mega augmentation engine
sys.path.insert(0, str(Path(__file__).parent))
from augmentation_engine import (
    mega_augment, apply_dialect, synonym_replace, reformulate,
    add_realistic_typo, generate_long_confused,
    DIALECT_TRANSFORMS, LONG_CONFUSED_TEMPLATES,
    PROF_NAMES, MATERIE, SCUOLE, CLASSI, NOMI_STUDENTI,
)

# ============================================================
# SYSTEM PROMPT (identical to production Brain)
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
1. Rispondi SEMPRE in JSON valido, nessun testo fuori dal JSON
2. "intent" deve essere uno dei 6 valori esatti
3. "actions" contiene tag [AZIONE:...] o [INTENT:{...}] per costruire circuiti
4. "needs_llm"=false per azioni deterministiche, true per spiegazioni/educativi
5. Se needs_llm=false, "response" contiene la risposta breve
6. Se needs_llm=true, "llm_hint" contiene il contesto per il modello grande"""

# ============================================================
# COMPLETE COMPONENT REGISTRY
# ============================================================
COMPONENTS = {
    "led": {"it": ["LED", "lucina", "lucetta", "lampadina", "luce", "diodo luminoso", "lucettina"],
            "pins": ["anode", "cathode"], "vol": 1},
    "resistor": {"it": ["resistore", "resistenza", "res", "resistore elettrico"],
                 "pins": ["pin1", "pin2"], "vol": 1},
    "capacitor": {"it": ["condensatore", "capacitore", "condenser"],
                  "pins": ["positive", "negative"], "vol": 2},
    "diode": {"it": ["diodo", "diodo raddrizzatore"],
              "pins": ["anode", "cathode"], "vol": 2},
    "buzzer-piezo": {"it": ["buzzer", "cicalino", "speaker", "suoneria", "coso che suona", "campanello", "altoparlante", "quello che fa rumore"],
                     "pins": ["positive", "negative"], "vol": 1},
    "push-button": {"it": ["pulsante", "bottone", "tasto", "interruttore", "switch", "pulsantino", "bottoncino"],
                    "pins": ["pin1", "pin2", "pin3", "pin4"], "vol": 1},
    "potentiometer": {"it": ["potenziometro", "pot", "manopola", "rotella", "quello che gira", "knob", "regolatore"],
                      "pins": ["vcc", "signal", "gnd"], "vol": 1},
    "photo-resistor": {"it": ["fotoresistore", "LDR", "sensore di luce", "fotoresistenza", "resistore alla luce", "sensore luminoso"],
                       "pins": ["pin1", "pin2"], "vol": 1},
    "phototransistor": {"it": ["fototransistor", "sensore ottico", "fotodiodo", "transistor ottico"],
                        "pins": ["collector", "emitter"], "vol": 2},
    "rgb-led": {"it": ["LED RGB", "RGB", "LED multicolore", "LED a colori", "luce colorata", "lucina RGB"],
                "pins": ["common", "red", "green", "blue"], "vol": 1},
    "motor-dc": {"it": ["motore", "motore DC", "motorino", "motore elettrico", "motoretto"],
                 "pins": ["positive", "negative"], "vol": 2},
    "mosfet-n": {"it": ["MOSFET", "transistor", "MOSFET N", "transistor MOSFET", "interruttore elettronico"],
                 "pins": ["gate", "drain", "source"], "vol": 2},
    "reed-switch": {"it": ["reed switch", "interruttore magnetico", "sensore magnetico", "reed", "interruttore a lamella"],
                    "pins": ["pin1", "pin2"], "vol": 1},
    "servo": {"it": ["servo", "servomotore", "servo motore", "braccetto", "motorino servo"],
              "pins": ["vcc", "signal", "gnd"], "vol": 3},
    "battery9v": {"it": ["batteria", "batteria 9V", "pila", "alimentazione"],
                  "pins": ["positive", "negative"], "vol": 1},
    "multimeter": {"it": ["multimetro", "tester", "voltmetro", "misuratore"],
                   "pins": ["probe-positive", "probe-negative"], "vol": 2},
    "nano-r4": {"it": ["Arduino", "Arduino Nano", "ELAB NanoBreakout", "scheda", "microcontrollore", "la scheda Arduino", "il Nano"],
                "pins": ["D0","D1","D2","D3","D4","D5","D6","D7","D8","D9","D10","D11","D12","D13","A0","A1","A2","A3","A4","A5","3V3","GND","AREF","Vin"],
                "vol": 3},
    "breadboard-full": {"it": ["breadboard", "basetta", "piastra", "tavoletta sperimentale"],
                        "pins": ["bus-plus", "bus-minus"], "vol": 1},
    "lcd16x2": {"it": ["LCD", "display", "schermo", "schermino", "display LCD", "monitor piccolo"],
                "pins": ["rs", "e", "d4", "d5", "d6", "d7", "vcc", "gnd", "vee"], "vol": 3},
    "wire": {"it": ["filo", "cavo", "collegamento", "connessione", "filo elettrico", "cavetto"],
             "pins": ["start", "end"], "vol": 1},
}

# ============================================================
# COMPLETE EXPERIMENTS LIST
# ============================================================
EXPERIMENTS_VOL1 = [
    ("v1-cap6-esp1", "Accendi il tuo primo LED"),
    ("v1-cap6-esp2", "LED senza resistore"),
    ("v1-cap6-esp3", "Cambia luminosita con resistenze diverse"),
    ("v1-cap7-esp1", "Accendi il rosso del RGB"),
    ("v1-cap7-esp2", "Accendi il verde del RGB"),
    ("v1-cap7-esp3", "Accendi il blu del RGB"),
    ("v1-cap7-esp4", "Mescola 2 colori: il viola"),
    ("v1-cap7-esp5", "Tutti e 3: bianco"),
    ("v1-cap7-esp6", "Crea il tuo colore"),
    ("v1-cap8-esp1", "LED con pulsante"),
    ("v1-cap8-esp2", "Cambia colore e luminosita"),
    ("v1-cap8-esp3", "RGB con pulsante viola"),
    ("v1-cap8-esp4", "3 pulsanti 3 colori RGB"),
    ("v1-cap8-esp5", "Mix avanzato con resistori diversi"),
    ("v1-cap9-esp1", "Dimmer LED con potenziometro"),
    ("v1-cap9-esp2", "Inverti la rotazione"),
    ("v1-cap9-esp3", "LED colore diverso con pot"),
    ("v1-cap9-esp4", "Dimmer RGB azzurrino"),
    ("v1-cap9-esp5", "Pot miscelatore blu rosso"),
    ("v1-cap9-esp6", "Lampada RGB con 3 potenziometri"),
    ("v1-cap9-esp7", "Aggiungi pulsanti alla lampada"),
    ("v1-cap9-esp8", "Combina esperimenti 5 e 6"),
    ("v1-cap9-esp9", "Aggiungi pulsante all esperimento 8"),
    ("v1-cap10-esp1", "LED controllato dalla luce"),
    ("v1-cap10-esp2", "LED diverso colore con LDR"),
    ("v1-cap10-esp3", "3 LDR controllano RGB"),
    ("v1-cap10-esp4", "LED bianco illumina LDR e LED blu"),
    ("v1-cap10-esp5", "Aggiungi pot per controllare LED bianco"),
    ("v1-cap10-esp6", "Aggiungi pulsante al circuito LDR"),
    ("v1-cap11-esp1", "Buzzer suona continuo"),
    ("v1-cap11-esp2", "Campanello con pulsante"),
    ("v1-cap12-esp1", "LED con reed switch"),
    ("v1-cap12-esp2", "Cambia luminosita con magnete"),
    ("v1-cap12-esp3", "RGB con reed switch"),
    ("v1-cap12-esp4", "Pot RGB reed switch"),
    ("v1-cap13-esp1", "LED nell elettropongo"),
    ("v1-cap13-esp2", "Circuiti artistici con plastilina"),
    ("v1-cap14-esp1", "Il Primo Robot ELAB"),
]

EXPERIMENTS_VOL2 = [
    ("v2-cap6-esp1", "LED in serie con 1 resistore"),
    ("v2-cap6-esp2", "LED in serie colori diversi"),
    ("v2-cap6-esp3", "Tre LED in serie"),
    ("v2-cap6-esp4", "Misurare Vf con multimetro"),
    ("v2-cap7-esp1", "Scarica condensatore con multimetro"),
    ("v2-cap7-esp2", "Scarica con LED rosso"),
    ("v2-cap7-esp3", "Condensatori in parallelo"),
    ("v2-cap7-esp4", "Variare R nella scarica RC"),
    ("v2-cap8-esp1", "MOSFET come interruttore"),
    ("v2-cap8-esp2", "MOSFET e carica del corpo"),
    ("v2-cap8-esp3", "MOSFET pot tensione soglia"),
    ("v2-cap9-esp1", "Fototransistor come sensore"),
    ("v2-cap9-esp2", "Luce notturna automatica"),
    ("v2-cap10-esp1", "Far girare il motore"),
    ("v2-cap10-esp2", "Invertire la rotazione"),
    ("v2-cap10-esp3", "Motore con pulsante"),
    ("v2-cap10-esp4", "Motore pulsante LED indicatore"),
    ("v2-cap12-esp1", "Robot Segui Luce"),
]

EXPERIMENTS_VOL3 = [
    ("v3-cap6-semaforo", "Semaforo 3 LED"),
    ("v3-cap7-mini", "2 LED con Pulsante toggle"),
    ("v3-cap8-serial", "analogRead con Serial Monitor"),
    ("v3-extra-lcd-hello", "LCD Hello World"),
    ("v3-extra-servo-sweep", "Servo Sweep"),
    ("v3-extra-simon", "Simon Says Gioco di Memoria"),
]

ALL_EXPERIMENTS = EXPERIMENTS_VOL1 + EXPERIMENTS_VOL2 + EXPERIMENTS_VOL3

# ============================================================
# ALL 46 ACTIONS WITH LINGUISTIC VARIANTS
# ============================================================
ACTIONS = {
    # --- SIMULATION CONTROL ---
    "play": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Simulazione avviata! Guarda cosa succede.",
            "Ecco, ho avviato la simulazione!",
            "Simulazione in corso! Osserva il circuito.",
            "Fatto! La simulazione e' partita.",
        ],
        "variants": [
            # Diretto
            "avvia", "avvia la simulazione", "play", "start", "parti", "fai partire",
            "avvia il circuito", "fai andare", "metti play", "premi play",
            # Parlato
            "fammi vedere come funziona", "fallo andare", "accendi tutto",
            "metti in moto", "fai partire il tutto", "voglio vedere se funziona",
            "proviamo", "prova il circuito", "dai avvia", "ok avvia",
            # Bambino
            "fai andare le luci", "accendi le cose", "fai funzionare",
            "come faccio a farlo andare?", "voglio che si accende",
            "fai vedere che succede", "provalo dai", "su avanti",
            # Prof inesperto
            "come si fa partire la simulazione?", "dove devo premere per avviare?",
            "vorrei far partire l'esperimento", "posso vedere il risultato?",
            "come faccio a testare il circuito?", "si puo far andare?",
            "vorrei provare a far funzionare il circuito che ho costruito",
            "adesso che ho messo tutti i componenti come faccio a provare?",
            # Lungo e confuso
            "senti ho finito di mettere tutti i pezzi e i fili e adesso vorrei capire se funziona tutto posso avviare?",
            "allora praticamente ho collegato tutto come dice il libro e vorrei vedere se il LED si accende davvero",
            "ma se io premo quel bottone verde in alto il circuito parte?",
            "non so bene come si fa ma vorrei far andare il circuito per vedere se ho sbagliato qualcosa",
            # Typo
            "avvia la siulazione", "fai partier", "avbia", "paly", "satrt",
            "avvia la simulazone", "fai paritre il circuito",
            # Implicito
            "funziona?", "va?", "proviamo?", "vediamo?", "e adesso?",
            "ho finito, e ora?", "tutto pronto", "sono pronto",
            # Contesto scuola
            "ragazzi adesso proviamo il circuito", "prof posso avviare?",
            "faccio partire?", "lo faccio andare?",
            # Slang
            "daje fallo partire", "vai metti su", "sparalo", "goooo",
        ],
    },

    "pause": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Simulazione in pausa.",
            "Messo in pausa! Puoi riprendere quando vuoi.",
            "Pausa! Il circuito e' fermo.",
        ],
        "variants": [
            "pausa", "metti in pausa", "pause", "ferma", "stop", "fermati",
            "blocca", "congela", "fermalo", "pausa la simulazione",
            "aspetta un attimo", "ferma tutto", "stoppa", "bloccalo",
            "metti pausa", "puoi fermare?", "fermami la simulazione",
            "aspetta ferma che devo guardare una cosa",
            "fermalo un secondo che non ho capito",
            "metti pausa che devo chiedere una cosa al prof",
            "ma come fermo questa cosa?", "si ferma come?",
            "stoppalo", "freezalo", "hold on",
            "fermaa", "pausaa", "stoppp",
        ],
    },

    "reset": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Simulazione resettata!",
            "Tutto ripristinato allo stato iniziale.",
            "Reset completato! Puoi ricominciare.",
        ],
        "variants": [
            "reset", "resetta", "ripristina", "ricomincia", "ricomincia da capo",
            "reimposta", "azzera", "riporta all'inizio", "torna all'inizio",
            "rimetti come prima", "fai reset", "resettalo", "riavvia",
            "ma come faccio a ricominciare da zero?",
            "vorrei riportare tutto come era all'inizio",
            "posso azzerare tutto e riprovare?",
            "non funziona, ricominciamo daccapo",
            "rifacciamo tutto da capo", "cancella e ricomincia",
            "rset", "resset", "resettta",
        ],
    },

    "clearall": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Tutto pulito! Breadboard vuota.",
            "Ho rimosso tutti i componenti.",
            "Circuito cancellato! Puoi ricominciare da zero.",
        ],
        "variants": [
            "pulisci tutto", "cancella tutto", "svuota", "togli tutto",
            "rimuovi tutto", "clear all", "clear", "pulisci la breadboard",
            "svuota la breadboard", "togli tutti i componenti",
            "leva tutto", "butta via tutto", "cancella il circuito",
            "ricomincia da zero con breadboard vuota",
            "voglio una breadboard pulita", "rimuovi tutto quello che c'e",
            "togli tutti i pezzi", "levami tutto di mezzo",
            "puoi togliere tutto dal tavolo?",
            "vorrei ricominciare con una breadboard nuova completamente vuota",
            "ma come faccio a togliere tutti i componenti dalla basetta?",
            "pulisci", "pulisc tutto", "cancela tutto", "svota",
            "fammi una breadboard pulita pulita",
            "togili tutti i componenti che ho messo",
        ],
    },

    "compile": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Compilazione in corso...",
            "Sto compilando il codice!",
            "Compilo e verifico il codice Arduino.",
        ],
        "variants": [
            "compila", "compila il codice", "compile", "verifica il codice",
            "controlla il codice", "build", "fai il build",
            "compila e carica", "carica il programma",
            "prova a compilare", "vedi se il codice e' giusto",
            "ma questo codice funziona?", "verifica se ci sono errori",
            "puoi controllare se il programma e' scritto bene?",
            "come faccio a sapere se il codice e' corretto?",
            "manda il programma all'Arduino",
            "carica il codice sulla scheda",
            "compilazione", "fai compilare", "complila", "commpila",
            "prova il codice", "testa il programma",
            "il codice che ho scritto e' giusto?",
            "mi dai errori nel codice?",
        ],
    },

    "undo": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Annullato!", "Ho annullato l'ultima azione.", "Undo fatto!"],
        "variants": [
            "annulla", "undo", "torna indietro", "ctrl z",
            "annulla l'ultima cosa", "annulla l'ultima azione",
            "ho sbagliato torna indietro", "indietro",
            "rimetti come prima", "ho fatto un casino annulla",
            "ops annulla", "no aspetta annulla", "nooo annulla",
            "sbagliato! indietro!", "annula", "anulla",
        ],
    },

    "redo": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Rifatto!", "Ho ripristinato l'azione.", "Redo fatto!"],
        "variants": [
            "rifai", "redo", "ripristina", "rimetti",
            "rifai quello che ho annullato", "ctrl y",
            "no aspetta rimettilo", "ridai", "rifallo",
        ],
    },

    # --- BUILD NAVIGATION ---
    "nextstep": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Ecco il prossimo passo!",
            "Passo successivo caricato.",
            "Avanti! Ecco cosa fare adesso.",
        ],
        "variants": [
            "avanti", "prossimo passo", "next", "step successivo",
            "vai avanti", "prossimo", "continua", "avanza",
            "cosa devo fare adesso?", "qual e' il prossimo step?",
            "e adesso cosa metto?", "che pezzo metto ora?",
            "dimmi il prossimo componente da aggiungere",
            "ok fatto questo, e poi?", "prossimo pezzo",
            "andiamo avanti col montaggio", "next step",
            "ho messo il resistore, e ora?", "avnati", "avanit",
            "vai al passo dopo", "fammi vedere il prossimo",
            "e dopo?", "poi?", "che si fa?",
        ],
    },

    "prevstep": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Torno al passo precedente.", "Ecco il passo precedente."],
        "variants": [
            "indietro", "passo precedente", "torna indietro di uno step",
            "previous", "step precedente", "torna al passo prima",
            "aspetta torna indietro", "non ho capito torna al passo prima",
            "rifammi vedere il passo di prima", "back",
            "mi sono perso torna indietro",
        ],
    },

    "setbuildmode": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Modalita cambiata!",
            "Ho cambiato la modalita di costruzione.",
        ],
        "variants": [
            # Gia Montato
            "mostrami il circuito gia montato", "voglio vederlo gia fatto",
            "fammi vedere il risultato finale", "montaggio completo",
            "mostra tutto montato", "circuito finito",
            "voglio vedere come viene alla fine",
            # Passo Passo
            "voglio costruirlo passo passo", "guidami nel montaggio",
            "fammi vedere step by step", "montaggio guidato",
            "aiutami a costruirlo", "dimmi passo per passo cosa fare",
            "vorrei seguire la guida passo passo",
            "non so da dove iniziare guidami tu",
            # Sandbox
            "voglio costruire liberamente", "modalita libera",
            "fammi costruire da solo", "sandbox", "esplora libero",
            "voglio provare a fare un circuito da zero senza guida",
            "lascimi costruire come voglio io",
        ],
    },

    # --- COMPONENT OPERATIONS ---
    "highlight": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": [
            "Ecco, te lo evidenzio!",
            "Componente evidenziato!",
        ],
        "variants": [
            "evidenzia il LED", "mostrami dove e' il resistore",
            "highlight", "fammi vedere il buzzer",
            "qual e' il potenziometro?", "dov'e' il condensatore?",
            "non trovo il resistore", "mi fai vedere dove sta il LED?",
            "ma il pulsante dove l'ho messo?",
            "non vedo il componente che ho aggiunto",
            "puoi illuminare il LED rosso?",
            "quale di questi e' la resistenza?",
            "indicami il servo", "cercami il buzzer",
        ],
    },

    "addcomponent": {
        "intent": "circuit",
        "needs_llm": False,
        "response_templates": [
            "Componente aggiunto alla breadboard!",
            "Ecco, l'ho messo!",
            "Aggiunto! Posizionato sulla breadboard.",
        ],
        "variants": [
            # Generico
            "aggiungi un LED", "metti un resistore", "inserisci un buzzer",
            "piazza un potenziometro", "metti un pulsante",
            # Parlato
            "mi serve un LED", "voglio aggiungere una resistenza",
            "puoi mettere un condensatore?", "mettici un LED",
            "aggiungi anche un buzzer", "ci vuole un pulsante",
            # Bambino
            "metti la lucina", "voglio la lampadina",
            "metti quel coso che suona", "aggiungi la rotella",
            "metti il bottoncino", "voglio il motorino",
            # Prof inesperto
            "come faccio ad aggiungere un componente?",
            "vorrei inserire un LED sulla breadboard ma non so come",
            "dove trovo i componenti da aggiungere?",
            "posso mettere un resistore da qualche parte?",
            # Multi-componente
            "metti un LED e un resistore", "aggiungi 3 LED",
            "mettimi due resistori e un buzzer",
            "voglio un LED rosso e uno verde e anche un pulsante",
            "mi servono: un LED, un resistore da 220 ohm e un pulsante",
            # Con posizione
            "metti un LED in alto a sinistra", "aggiungi il resistore vicino al LED",
            # Typo
            "aggiunig un LED", "meti un resistore", "aggiunig un buzer",
        ],
    },

    "removecomponent": {
        "intent": "circuit",
        "needs_llm": False,
        "response_templates": [
            "Componente rimosso!",
            "Tolto! Non c'e' piu.",
        ],
        "variants": [
            "togli il LED", "rimuovi il resistore", "elimina il buzzer",
            "leva il potenziometro", "cancella il pulsante",
            "non mi serve piu il LED toglilo",
            "quel resistore non ci va, toglilo",
            "rimuovimi il componente che ho aggiunto per sbaglio",
            "ho messo un pezzo sbagliato, puoi toglierlo?",
            "elimina quel coso li", "togli l'ultimo che ho messo",
            "togili il LED", "rimovi il resistore",
        ],
    },

    "movecomponent": {
        "intent": "circuit",
        "needs_llm": False,
        "response_templates": ["Componente spostato!", "Fatto, l'ho mosso."],
        "variants": [
            "sposta il LED", "muovi il resistore piu in la",
            "metti il buzzer piu a destra", "sposta tutto a sinistra",
            "il LED e' troppo vicino al resistore, spostalo",
            "puoi mettere il potenziometro dall'altra parte?",
            "il componente e' nel posto sbagliato, spostalo",
        ],
    },

    "interact": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Fatto!", "Interazione completata!"],
        "variants": [
            "premi il pulsante", "schiaccia il bottone", "gira la manopola",
            "ruota il potenziometro", "premi il tasto",
            "spingi il pulsante", "clicca il bottone",
            "fai click sul pulsante", "prova a premere",
            "gira la rotella al massimo", "metti il pot a meta",
        ],
    },

    "setvalue": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Valore impostato!", "Fatto, ho cambiato il valore."],
        "variants": [
            "metti la resistenza a 220 ohm", "imposta il potenziometro al 50%",
            "cambia il valore del resistore", "metti 1000 ohm",
            "voglio una resistenza piu alta", "abbassa la resistenza",
            "alza il valore del pot", "imposta la luminosita al massimo",
            "puoi cambiare la resistenza a 470 ohm?",
            "voglio che il resistore sia da 10k",
            "metti il condensatore a 100 microfarad",
        ],
    },

    "highlightpin": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Pin evidenziato!", "Ecco il pin che cerchi."],
        "variants": [
            "mostrami il pin D5", "dov'e' il pin A0?",
            "evidenzia il pin 13", "fammi vedere dove si collega",
            "qual e' l'anodo del LED?", "dov'e' il catodo?",
            "mostrami i pin del potenziometro",
            "non so dove collegare il filo, mostrami il pin",
            "qual'e il pin positivo?", "dov'e' il GND?",
        ],
    },

    # --- WIRING ---
    "addwire": {
        "intent": "circuit",
        "needs_llm": False,
        "response_templates": [
            "Filo collegato!",
            "Connessione creata!",
            "Collegamento fatto!",
        ],
        "variants": [
            "collega il LED al resistore", "metti un filo",
            "collega", "fai il collegamento", "unisci",
            "collega l'anodo del LED al pin D5",
            "metti un filo dal resistore al LED",
            "collega il pin positivo alla riga di alimentazione",
            "fai un filo dal pulsante al LED",
            "come collego il potenziometro?",
            "devo collegare il buzzer ma non so dove",
            "unisci il catodo del LED al GND",
            "metti un cavetto dal pin A0 al fotoresistore",
            "colega", "collga", "collegga",
            "fai i collegamenti per me",
            "non so come collegare i fili puoi farlo tu?",
        ],
    },

    "removewire": {
        "intent": "circuit",
        "needs_llm": False,
        "response_templates": ["Filo rimosso!", "Collegamento eliminato."],
        "variants": [
            "togli il filo", "rimuovi il collegamento",
            "scollega", "stacca il filo",
            "quel filo e' sbagliato toglilo",
            "il collegamento non e' giusto, rimuovilo",
            "ho sbagliato un filo, puoi toglierlo?",
        ],
    },

    # --- EDITOR & CODE ---
    "openeditor": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Editor aperto!", "Ecco l'editor di codice."],
        "variants": [
            "apri l'editor", "mostra il codice", "apri il codice",
            "voglio scrivere codice", "fammi vedere il programma",
            "apri l'editor di codice", "dove scrivo il codice?",
            "voglio programmare", "apri la parte del codice",
            "come faccio a scrivere il programma Arduino?",
            "vorrei vedere dove si scrive il codice",
            "apri l'editore", "mostrami il codice sorgente",
        ],
    },

    "closeeditor": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Editor chiuso.", "Ho chiuso l'editor."],
        "variants": [
            "chiudi l'editor", "nascondi il codice", "chiudi il codice",
            "non mi serve piu l'editor", "togli l'editor",
            "chiudi la parte del codice", "rimuovi il pannello codice",
        ],
    },

    "switcheditor": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Editor cambiato!", "Ho cambiato modalita editor."],
        "variants": [
            # Switch a Scratch
            "passa ai blocchi", "voglio usare Scratch", "blocchi",
            "usa i blocchi", "cambia a Scratch", "editor visuale",
            "non so programmare, posso usare i blocchi?",
            "c'e' un modo piu facile per programmare?",
            "preferisco i blocchetti", "metti i blocchi colorati",
            # Switch a Arduino C++
            "passa ad Arduino", "voglio scrivere codice C++",
            "torna al codice", "editor testuale", "C++",
            "voglio programmare in Arduino", "codice vero",
            "basta con i blocchi voglio scrivere il codice",
        ],
    },

    "setcode": {
        "intent": "code",
        "needs_llm": False,
        "response_templates": ["Codice inserito!", "Ho messo il codice nell'editor."],
        "variants": [
            "scrivi questo codice", "metti questo programma",
            "inserisci il codice per far lampeggiare il LED",
            "scrivi un programma che accende il LED",
            "metti il codice del semaforo",
            "puoi scrivermi il codice per leggere il sensore?",
            "vorrei un programma che fa suonare il buzzer",
            "mi scrivi il codice per il servo?",
        ],
    },

    "appendcode": {
        "intent": "code",
        "needs_llm": False,
        "response_templates": ["Codice aggiunto!", "Ho aggiunto il codice."],
        "variants": [
            "aggiungi questa parte di codice", "appendi al codice",
            "metti anche questa funzione", "aggiungi un delay",
            "inserisci una riga che fa digitalWrite",
        ],
    },

    "getcode": {
        "intent": "code",
        "needs_llm": False,
        "response_templates": ["Ecco il codice attuale:", "Questo e' il codice corrente:"],
        "variants": [
            "fammi vedere il codice", "mostra il codice attuale",
            "che codice c'e?", "leggi il codice",
            "cosa c'e scritto nell'editor?",
            "qual e' il programma attuale?",
        ],
    },

    "resetcode": {
        "intent": "code",
        "needs_llm": False,
        "response_templates": ["Codice ripristinato!", "Ho rimesso il codice originale."],
        "variants": [
            "ripristina il codice", "torna al codice originale",
            "rimetti il codice di default", "reset del codice",
            "ho fatto un casino col codice, rimetti quello originale",
            "cancella tutto il codice e rimetti quello di prima",
        ],
    },

    "loadblocks": {
        "intent": "code",
        "needs_llm": False,
        "response_templates": ["Blocchi caricati!", "Workspace Scratch aggiornato!"],
        "variants": [
            "carica i blocchi", "metti i blocchi dell'esperimento",
            "carica il workspace Scratch", "rimetti i blocchi iniziali",
        ],
    },

    "fullscreenscratch": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Scratch a schermo intero!", "Editor allargato!"],
        "variants": [
            "allarga l'editor Scratch", "schermo intero Scratch",
            "fullscreen i blocchi", "ingrandisci l'editor",
            "voglio piu spazio per i blocchi",
        ],
    },

    "exitscratchfullscreen": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Uscito dal fullscreen.", "Editor ridotto."],
        "variants": [
            "esci dal fullscreen", "rimpicciolisci l'editor",
            "torna alla vista normale", "chiudi il fullscreen",
        ],
    },

    # --- NAVIGATION & TABS ---
    "opentab": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Tab aperto!", "Ecco la sezione che cercavi."],
        "variants": [
            # Simulator
            "vai al simulatore", "apri il simulatore", "torna al circuito",
            "voglio vedere il circuito", "mostra la breadboard",
            # Manual
            "apri il manuale", "fammi vedere il libro", "mostra la teoria",
            "dove trovo le spiegazioni?", "apri il PDF",
            "vorrei leggere la parte teorica",
            # Canvas
            "apri la lavagna", "voglio disegnare", "apri il canvas",
            "fammi disegnare", "apri la lavagna bianca",
            # Notebooks
            "apri i taccuini", "voglio prendere appunti",
            "dove scrivo le mie note?", "apri il quaderno",
            # Videos
            "mostrami i video", "apri la sezione video",
            "ci sono video?", "voglio guardare un video",
            # Detective
            "trova il guasto", "detective", "cerca l'errore nel circuito",
            "gioco del detective", "trova l'errore",
            # POE
            "prevedi", "predict observe explain", "gioco delle previsioni",
            # Reverse
            "circuito misterioso", "reverse engineering",
            "gioco del mistero", "indovina il circuito",
            # Review
            "controlla il circuito", "review", "verifica",
        ],
    },

    "loadexp": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": [
            "Esperimento caricato!",
            "Ecco l'esperimento pronto!",
        ],
        "variants": [
            # Diretto
            "carica l'esperimento del LED", "apri il primo esperimento",
            "metti l'esperimento del semaforo", "carica il capitolo 6",
            # Parlato
            "voglio fare l'esperimento del buzzer",
            "andiamo a quello del potenziometro",
            "facciamo quello dei LED in serie",
            # Per nome
            "carica 'Accendi il tuo primo LED'",
            "apri il semaforo", "voglio fare il Simon Says",
            "caricami l'esperimento del motore",
            # Prof inesperto
            "come faccio a cambiare esperimento?",
            "vorrei passare all'esperimento successivo",
            "posso fare un altro esperimento?",
            "dove trovo l'elenco degli esperimenti?",
            # Per volume
            "carica un esperimento del volume 1",
            "voglio un esperimento del volume 3 con Arduino",
            "facciamo qualcosa del volume 2",
        ],
    },

    "openvolume": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Volume aperto!", "Ecco il manuale al punto giusto."],
        "variants": [
            "apri il volume 1", "vai al volume 2 pagina 30",
            "mostra il capitolo 8", "apri la pagina del condensatore",
            "fammi vedere la teoria sul MOSFET",
            "dove trovo la spiegazione dei LED in serie?",
        ],
    },

    "createnotebook": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Taccuino creato!", "Ecco il tuo nuovo taccuino."],
        "variants": [
            "crea un taccuino", "nuovo quaderno", "crea un appunto",
            "voglio prendere nota di questo", "fammi un taccuino nuovo",
        ],
    },

    # --- INFORMATION DISPLAY ---
    "showbom": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Ecco la lista dei componenti!", "Bill of Materials visualizzato."],
        "variants": [
            "mostra la lista dei componenti", "che pezzi mi servono?",
            "bill of materials", "lista materiali",
            "quali componenti servono per questo esperimento?",
            "che componenti devo usare?", "cosa mi serve?",
            "fammi vedere che pezzi ci vogliono",
            "quanti componenti servono?",
            "dammi la lista della spesa dei componenti",
        ],
    },

    "showserial": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Monitor seriale aperto!", "Ecco il Serial Monitor."],
        "variants": [
            "apri il monitor seriale", "serial monitor",
            "mostra l'output seriale", "fammi vedere cosa stampa",
            "apri la console", "dove vedo i valori del sensore?",
            "voglio leggere i dati dal sensore",
            "come faccio a vedere cosa scrive l'Arduino?",
        ],
    },

    "listcomponents": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Ecco i componenti presenti:", "Questi sono i componenti sul circuito:"],
        "variants": [
            "cosa c'e' sul circuito?", "elenca i componenti",
            "che pezzi ho messo?", "quali componenti ci sono?",
            "fammi la lista di quello che c'e'",
            "quanti componenti ho sulla breadboard?",
        ],
    },

    "getstate": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Ecco lo stato del circuito:", "Stato attuale:"],
        "variants": [
            "qual e' lo stato del circuito?", "stato",
            "a che punto sono?", "dammi un riassunto",
            "che situazione c'e?", "com'e messo il circuito?",
            "quanti fili ho? quanti componenti?",
        ],
    },

    "measure": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Ecco la misura:", "Misurazione effettuata:"],
        "variants": [
            "misura la tensione sul LED", "quanta corrente passa?",
            "qual e' la tensione?", "misura", "voltaggio?",
            "quanti volt ci sono sul resistore?",
            "quanta corrente assorbe il LED?",
            "fammi vedere i valori di tensione e corrente",
            "misurami la caduta di tensione",
        ],
    },

    "diagnose": {
        "intent": "action",
        "needs_llm": True,
        "response_templates": [],
        "variants": [
            "diagnostica il circuito", "trova gli errori",
            "c'e' qualcosa che non va?", "perche non funziona?",
            "controlla se il circuito e' giusto",
            "il LED non si accende perche?",
            "non va niente, che succede?",
            "il circuito non funziona aiutami",
            "perche il buzzer non suona?",
            "ho fatto un errore da qualche parte",
            "cosa ho sbagliato?", "debug", "troubleshoot",
            "prof il circuito non va che faccio?",
            "aiuto non funziona niente",
            "ho collegato tutto ma non succede nulla",
        ],
    },

    # --- EDUCATIONAL & GAMIFICATION ---
    "quiz": {
        "intent": "teacher",
        "needs_llm": False,
        "response_templates": ["Quiz in arrivo!", "Pronto per il quiz?"],
        "variants": [
            "fammi un quiz", "quiz", "voglio fare un quiz",
            "interrogami", "fammi delle domande",
            "verifica le mie conoscenze", "test",
            "mettimi alla prova", "sono pronto per il quiz",
            "crea un quiz su questo argomento",
            "prof mi interroga?", "facciamo un quiz veloce?",
            "voglio vedere se ho capito", "esaminami",
            "quiiiz", "qiz", "fami un quiz",
        ],
    },

    "youtube": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Ecco un video utile!", "Ho trovato un video per te."],
        "variants": [
            "cerca un video", "mostrami un video su YouTube",
            "voglio guardare un tutorial", "c'e un video su questo?",
            "youtube LED resistore", "cerca su YouTube come funziona",
            "fammi vedere un video che spiega i condensatori",
            "non capisco, c'e un video?",
        ],
    },

    "serialwrite": {
        "intent": "action",
        "needs_llm": False,
        "response_templates": ["Messaggio inviato al seriale!", "Scritto sulla porta seriale."],
        "variants": [
            "scrivi sul seriale", "manda un messaggio seriale",
            "serial write", "invia hello al seriale",
            "scrivi qualcosa sulla porta seriale",
        ],
    },

    # --- CHAT & PANEL CONTROL ---
    "openchat": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Chat aperta!", "Eccomi qui."],
        "variants": [
            "apri la chat", "apri Galileo", "voglio parlare con Galileo",
            "fammi parlare con l'assistente", "apri il tutor",
            "ho bisogno di aiuto, apri la chat",
        ],
    },

    "closechat": {
        "intent": "navigation",
        "needs_llm": False,
        "response_templates": ["Chat chiusa.", "Ok, ci vediamo!"],
        "variants": [
            "chiudi la chat", "chiudi Galileo", "basta per ora",
            "non mi serve piu", "chiudi il tutor",
        ],
    },
}

# ============================================================
# TUTOR / TEACHER / VISION INTENTS (needs_llm = True)
# ============================================================
TUTOR_VARIANTS = [
    # Domande base elettronica
    "cos'e' un resistore?", "a cosa serve un condensatore?",
    "come funziona un LED?", "che differenza c'e' tra serie e parallelo?",
    "perche serve un resistore con il LED?", "cos'e' la legge di Ohm?",
    "come si calcola la resistenza?", "cosa vuol dire tensione?",
    "cos'e' la corrente elettrica?", "che cos'e' un circuito?",
    "spiegami i semiconduttori", "come funziona un diodo?",
    "cos'e' un transistor?", "a cosa serve il MOSFET?",
    "che differenza c'e tra AC e DC?", "cos'e' la frequenza?",
    # Bambino curioso
    "ma perche la lucina si accende?", "come fa l'elettricita a muoversi?",
    "se tocco il filo prendo la scossa?", "perche il buzzer fa rumore?",
    "come fa il motore a girare?", "ma gli elettroni sono veri?",
    "quanto e' veloce l'elettricita?", "il LED si puo bruciare?",
    "se metto 2 batterie va piu forte?", "posso alimentare un LED col limone?",
    # Prof inesperto
    "non ho mai usato un simulatore come questo, da dove parto?",
    "sono un insegnante e vorrei usare questa piattaforma per la mia classe",
    "come posso spiegare la legge di Ohm ai miei studenti usando il simulatore?",
    "c'e un modo per far fare un esercizio a tutta la classe contemporaneamente?",
    "i miei studenti hanno 12 anni, qual e' il miglior esperimento per iniziare?",
    "vorrei preparare una lezione sui circuiti, mi puoi aiutare?",
    "non capisco bene la differenza tra tensione e corrente, me la spieghi in modo semplice?",
    "come faccio a verificare se i miei studenti hanno capito la lezione?",
    "quale volume mi consigli per una terza media?",
    "posso usare questo strumento anche per studenti con difficolta di apprendimento?",
    "ho paura di far bruciare qualcosa, e' sicuro il simulatore?",
    "non so niente di elettronica ma devo insegnarla, aiuto!",
    "la preside mi ha chiesto di fare un laboratorio STEM e non so da dove cominciare",
    "i ragazzi si annoiano con la teoria, come rendo la lezione piu interattiva?",
    "come faccio una valutazione formativa usando ELAB?",
    "posso assegnare compiti per casa con il simulatore?",
    "c'e' un percorso didattico gia pronto che posso seguire?",
    # Domande Arduino
    "cos'e' Arduino?", "come si programma Arduino?",
    "che linguaggio usa Arduino?", "cos'e' il void setup?",
    "a che serve il void loop?", "cos'e' un pin digitale?",
    "che differenza c'e tra pin digitale e analogico?",
    "cos'e' il PWM?", "come funziona analogRead?",
    "cos'e' il Serial Monitor?", "come faccio il debug?",
    "cos'e' una variabile?", "cos'e' un if?", "cos'e' un ciclo for?",
    # Richieste lunghe e confuse
    "allora prof praticamente noi stiamo facendo sto circuito con il LED e il resistore e io non ho capito bene perche devo mettere il resistore cioe se lo tolgo il LED si accende lo stesso no?",
    "senta io ho collegato tutto come dice il libro ma il mio compagno dice che i fili sono sbagliati e io dico di no chi ha ragione?",
    "prof ma nella realta se compro i componenti veri e faccio questo circuito a casa funziona uguale come nel simulatore?",
    "scusi ma io il volume 2 lo devo per forza fare o posso saltare al volume 3 con Arduino che mi interessa di piu?",
]

VISION_VARIANTS = [
    "guarda il mio circuito", "cosa vedi?", "controlla la foto",
    "dimmi se il circuito e' giusto guardando", "analizza questa immagine",
    "guarda e dimmi che errori ci sono", "cosa c'e' che non va in questa foto?",
    "guarda il mio disegno", "controlla il mio schema",
    "prof guardi il mio circuito e' giusto?",
    "ho fatto una foto del circuito vero puoi controllarla?",
    "ecco il mio circuito dal vero", "guarda come ho collegato i fili",
    "non sono sicuro dei collegamenti, puoi guardare?",
    "riesci a vedere se manca qualcosa?",
    "il prof mi ha detto che c'e' un errore ma non lo trovo, guarda tu",
]

TEACHER_VARIANTS = [
    "spiegami come un bambino di 10 anni",
    "fammi un esempio pratico", "raccontami una storia sull'elettricita'",
    "come spiego ai miei studenti che cos'e la tensione?",
    "hai un analogia per spiegare la corrente?",
    "dimmi curiosita sull'elettronica",
    "fai un gioco per imparare la legge di Ohm",
    "come motivo gli studenti che non vogliono studiare elettronica?",
    "suggeriscimi un progetto finale per la classe",
    "come collego l'elettronica alle altre materie?",
    "mi dai un'attivita di gruppo da far fare in classe?",
]

# ============================================================
# CONTEXT TEMPLATES
# ============================================================
TABS = ["simulator", "editor", "canvas", "manual", "video", "notebooks"]
VOLUMES = [1, 2, 3]
SIM_STATES = ["running", "paused", "stopped"]
BUILD_MODES = ["completo", "passopasso", "guided", "sandbox"]
EDITOR_MODES = ["arduino", "scratch"]

def random_context(rng: random.Random) -> str:
    """Generate a random simulator context block."""
    tab = rng.choice(TABS)
    vol = rng.choice(VOLUMES)

    # Random components on board
    comp_types = list(COMPONENTS.keys())
    active_comps = [t for t in comp_types if t not in ("wire", "breadboard-full", "breadboard-half", "battery9v", "nano-r4")]
    n_comps = rng.randint(0, 6)
    comps = []
    for _ in range(n_comps):
        c = rng.choice(active_comps)
        idx = sum(1 for x in comps if x.startswith(c.replace("-", ""))) + 1
        comps.append(f"{c.replace('-','')}{idx}")

    n_wires = rng.randint(0, min(n_comps * 2, 12))
    sim_state = rng.choice(SIM_STATES)
    build_mode = rng.choice(BUILD_MODES)
    editor_mode = rng.choice(EDITOR_MODES)
    has_code = rng.choice([True, False])

    # Maybe include experiment
    exp_line = ""
    if rng.random() > 0.4:
        if vol == 1:
            exp = rng.choice(EXPERIMENTS_VOL1)
        elif vol == 2:
            exp = rng.choice(EXPERIMENTS_VOL2)
        else:
            exp = rng.choice(EXPERIMENTS_VOL3)
        exp_line = f"\nesperimento: {exp[0]}"

    ctx = f"""[CONTESTO]
tab: {tab}{exp_line}
componenti: [{', '.join(comps)}]
fili: {n_wires}
volume_attivo: {vol}
simulazione: {sim_state}
build_mode: {build_mode}
editor_mode: {editor_mode}
codice_presente: {'true' if has_code else 'false'}"""
    return ctx


# ============================================================
# LINGUISTIC AUGMENTATION ENGINE
# ============================================================

# Common Italian typos
TYPO_MAP = {
    "a": "à", "e": "è", "i": "ì", "o": "ò", "u": "ù",
    "ss": "s", "tt": "t", "ll": "l", "nn": "n", "zz": "z",
    "ci": "c", "gi": "g", "ch": "k", "qu": "cu",
}

def add_typo(text: str, rng: random.Random) -> str:
    """Add realistic typos to Italian text."""
    if len(text) < 10 or rng.random() > 0.5:
        return text
    words = text.split()
    if len(words) < 2:
        return text
    idx = rng.randint(0, len(words) - 1)
    word = words[idx]
    if len(word) < 3:
        return text

    typo_type = rng.choice(["swap", "double", "drop", "wrong"])
    if typo_type == "swap" and len(word) > 3:
        i = rng.randint(1, len(word) - 2)
        word = word[:i] + word[i+1] + word[i] + word[i+2:]
    elif typo_type == "double":
        i = rng.randint(0, len(word) - 1)
        word = word[:i] + word[i] + word[i:]
    elif typo_type == "drop" and len(word) > 3:
        i = rng.randint(1, len(word) - 1)
        word = word[:i] + word[i+1:]
    elif typo_type == "wrong":
        i = rng.randint(0, len(word) - 1)
        nearby = "qwertyuiopasdfghjklzxcvbnm"
        ci = nearby.find(word[i].lower())
        if ci >= 0 and ci < len(nearby) - 1:
            replacement = nearby[ci + 1]
            word = word[:i] + replacement + word[i+1:]

    words[idx] = word
    return " ".join(words)


# Sentence wrappers — realistic ways people prefix/suffix requests
PREFIXES = [
    "", "", "", "",  # Many without prefix (weighted)
    "senti ", "ehi ", "scusa ", "ok ", "allora ", "dai ",
    "per favore ", "perfavore ", "puoi ", "potresti ",
    "mi sai dire ", "dimmi ", "fammi ", "vorrei ",
    "ho bisogno che tu ", "mi serve che ", "prova a ",
    "come faccio a ", "dove trovo ", "si puo' ",
    "e' possibile ", "riesci a ", "ma ", "e se ",
    "prof ", "galileo ", "aiutami a ", "prova ",
    "volevo chiederti ", "una domanda: ",
    "scusami ma ", "non so come si fa a ",
    "ho un problema: ", "ti chiedo una cosa: ",
]

SUFFIXES = [
    "", "", "", "",  # Many without suffix (weighted)
    "?", " per favore", " grazie", " dai", " pls",
    " perfavore", " se puoi", " quando puoi",
    "? non ho capito bene", " aiutami", " help",
    " e' urgente", " veloce", "!!!", " subito",
    "? grazie mille", " ti prego", " pleeease",
]

FILLER_PHRASES = [
    "praticamente", "in pratica", "cioe'", "tipo",
    "come dire", "ecco", "insomma", "diciamo",
    "fondamentalmente", "sostanzialmente",
    "a dire il vero", "sinceramente",
    "non so se mi spiego", "capisci?",
    "sai", "vedi", "guarda",
]

def augment_variant(base: str, rng: random.Random, add_fillers: bool = True) -> str:
    """Augment a base variant with MEGA linguistic variety."""
    return mega_augment(base, rng, force_long=add_fillers and rng.random() < 0.2)


# ============================================================
# MULTI-ACTION TEMPLATES
# ============================================================
MULTI_ACTION_TEMPLATES = [
    # 2 actions
    ("aggiungi un {comp1} e poi avvia la simulazione", ["addcomponent", "play"]),
    ("metti un {comp1} e collegalo al {comp2}", ["addcomponent", "addwire"]),
    ("togli tutto e ricomincia da zero", ["clearall", "reset"]),
    ("compila il codice e avvia", ["compile", "play"]),
    ("ferma la simulazione e resetta", ["pause", "reset"]),
    ("apri l'editor e scrivi il codice del LED", ["openeditor", "setcode"]),
    ("carica l'esperimento del semaforo e avvialo", ["loadexp", "play"]),
    ("passa ai blocchi e compila", ["switcheditor", "compile"]),
    ("metti un {comp1} e fammi un quiz", ["addcomponent", "quiz"]),
    ("evidenzia il {comp1} e dimmi a cosa serve", ["highlight", "tutor"]),
    # 3 actions
    ("aggiungi un LED e un resistore e collegali", ["addcomponent", "addcomponent", "addwire"]),
    ("pulisci tutto, carica il primo esperimento e avvia", ["clearall", "loadexp", "play"]),
    ("apri l'editor, scrivi il codice e compila", ["openeditor", "setcode", "compile"]),
    ("togli il LED sbagliato, mettine uno nuovo e ricollega", ["removecomponent", "addcomponent", "addwire"]),
    # 4+ actions
    ("aggiungi un LED, un resistore, collegali, metti il codice e compila", ["addcomponent", "addcomponent", "addwire", "setcode", "compile"]),
    ("pulisci tutto, metti 3 LED con i resistori, collegali alla batteria e avvia", ["clearall", "addcomponent", "addwire", "play"]),
]

# ============================================================
# IMPLICIT INTENT SCENARIOS
# ============================================================
IMPLICIT_INTENTS = [
    # Implicit play
    ("funziona?", "action", ["[AZIONE:play]"], False),
    ("proviamo?", "action", ["[AZIONE:play]"], False),
    ("vediamo", "action", ["[AZIONE:play]"], False),
    ("e adesso?", "action", ["[AZIONE:play]"], False),
    ("sono pronto", "action", ["[AZIONE:play]"], False),
    ("ho finito di montare", "action", ["[AZIONE:play]"], False),

    # Implicit diagnose
    ("non funziona", "action", ["[AZIONE:diagnose]"], True),
    ("non si accende", "action", ["[AZIONE:diagnose]"], True),
    ("il LED e' spento", "action", ["[AZIONE:diagnose]"], True),
    ("perche' non va?", "action", ["[AZIONE:diagnose]"], True),
    ("aiuto c'e un problema", "action", ["[AZIONE:diagnose]"], True),
    ("qualcosa non torna", "action", ["[AZIONE:diagnose]"], True),
    ("ho sbagliato qualcosa", "action", ["[AZIONE:diagnose]"], True),
    ("e' tutto nero", "action", ["[AZIONE:diagnose]"], True),
    ("nulla si muove", "action", ["[AZIONE:diagnose]"], True),
    ("il buzzer non suona", "action", ["[AZIONE:diagnose]"], True),
    ("il motore non gira", "action", ["[AZIONE:diagnose]"], True),

    # Implicit clearall
    ("ricominciamo", "action", ["[AZIONE:clearall]"], False),
    ("da capo", "action", ["[AZIONE:clearall]"], False),
    ("via tutto", "action", ["[AZIONE:clearall]"], False),

    # Implicit compile
    ("il codice e' giusto?", "action", ["[AZIONE:compile]"], False),
    ("ci sono errori nel programma?", "action", ["[AZIONE:compile]"], False),
    ("ho scritto bene?", "action", ["[AZIONE:compile]"], False),

    # Implicit nextstep
    ("e dopo?", "action", ["[AZIONE:nextstep]"], False),
    ("poi?", "action", ["[AZIONE:nextstep]"], False),
    ("avanti", "action", ["[AZIONE:nextstep]"], False),
    ("ok fatto", "action", ["[AZIONE:nextstep]"], False),
    ("che pezzo metto ora?", "action", ["[AZIONE:nextstep]"], False),

    # Implicit quiz
    ("sono pronto per l'interrogazione", "teacher", ["[AZIONE:quiz]"], False),
    ("mettimi alla prova", "teacher", ["[AZIONE:quiz]"], False),
    ("ho studiato tutto", "teacher", ["[AZIONE:quiz]"], False),
]

# ============================================================
# TEACHER SCENARIOS (prof inesperto)
# ============================================================
TEACHER_SCENARIOS = [
    # Primo utilizzo
    "e' la prima volta che uso un simulatore di circuiti, da dove inizio?",
    "non ho mai insegnato elettronica, mi puoi guidare?",
    "la scuola mi ha dato questo strumento ma non so come usarlo",
    "sono un prof di matematica ma devo fare STEM, aiutami",
    "i miei colleghi usano questo per le loro classi, come funziona?",

    # Preparazione lezione
    "devo preparare una lezione di 2 ore sui circuiti, cosa mi consigli?",
    "come organizzo un laboratorio con 25 studenti?",
    "posso proiettare il simulatore sulla LIM?",
    "come faccio a far lavorare gli studenti in autonomia?",
    "servono prerequisiti per i ragazzi?",
    "che ordine di esperimenti seguo per una seconda media?",
    "quante lezioni servono per completare il volume 1?",

    # Problemi in classe
    "gli studenti dicono che non funziona niente",
    "un ragazzo ha cancellato tutto per sbaglio come recupero?",
    "i ragazzi si copiano i circuiti, come evito?",
    "uno studente e' molto avanti rispetto agli altri, cosa gli faccio fare?",
    "ho uno studente DSA, il simulatore e' accessibile?",

    # Valutazione
    "come faccio una verifica pratica sui circuiti?",
    "posso dare voti in base a quello che fanno sul simulatore?",
    "c'e un modo per monitorare cosa fanno gli studenti?",
    "come valuto le competenze pratiche di elettronica?",

    # Confusione terminologica
    "quello che voi chiamate breadboard cos'e' esattamente?",
    "resistore e resistenza sono la stessa cosa?",
    "il LED e' una lampadina?",
    "MOSFET e transistor sono la stessa cosa?",
    "cos'e' un pin? i miei studenti non capiscono",
    "GND vuol dire ground? e' la terra?",
    "anodo e catodo li confondo sempre, c'e un trucco?",

    # Collegamento curriculum
    "come collego gli esperimenti al programma ministeriale di tecnologia?",
    "posso usarlo per le competenze STEM del PNRR?",
    "ci sono schede didattiche che posso stampare?",
    "come documento le attivita per il registro elettronico?",
    "il dirigente vuole vedere i risultati degli studenti, come faccio?",
]

# ============================================================
# ADVERSARIAL EXAMPLES
# ============================================================
ADVERSARIAL_EXAMPLES = [
    # Ambiguous (could be multiple intents)
    ("costruisci un circuito con un LED e un resistore", "circuit", True),
    ("fai il circuito del volume 1 capitolo 6", "navigation", False),
    ("aiutami con il circuito", "tutor", True),
    ("il circuito", "tutor", True),
    ("LED", "tutor", True),
    ("spiega e poi fai partire", "tutor", True),
    ("si", "tutor", True),
    ("no", "tutor", True),
    ("ok", "action", False),
    ("grazie", "tutor", False),
    ("ciao", "tutor", True),
    ("boh", "tutor", True),
    ("?", "tutor", True),
    ("...", "tutor", True),

    # Very long confused messages
    ("allora io stavo facendo questo esperimento che era quello del LED con il resistore e praticamente ho messo il LED sulla breadboard e poi ho messo il resistore e poi ho collegato i fili ma quando premo avvia non si accende niente e non capisco perche cioe ho fatto tutto come dice il libro ma forse ho sbagliato qualcosa nei collegamenti non so se puoi aiutarmi a capire dov'e' l'errore perche il mio compagno ha fatto uguale e a lui funziona", "action", True),
    ("senta scusi io sono un professore di tecnologia alla scuola media e mi hanno detto di usare questo simulatore per le lezioni di STEM ma io sinceramente non ci capisco molto di elettronica cioe ho fatto il liceo classico e poi la SSIS per tecnologia ma l'elettronica non l'ho mai studiata bene mi potrebbe aiutare a capire come si usa questo strumento e magari quale esperimento posso far fare ai ragazzi di prima che non hanno mai visto un circuito in vita loro?", "tutor", True),

    # Edge cases
    ("          ", "tutor", True),  # Only spaces
    ("asdfjkl", "tutor", True),  # Gibberish
    ("12345", "tutor", True),  # Numbers only
    ("LED LED LED LED", "circuit", True),  # Repetition
    ("metti togli metti togli", "tutor", True),  # Contradictory

    # Mixed language
    ("can you help me with this circuit?", "tutor", True),
    ("please start the simulation", "action", False),
    ("help me debug", "action", True),

    # Emoji heavy
    ("avvia!! 🚀🚀🚀", "action", False),
    ("non funziona 😭😭", "action", True),
    ("bravo! 👏 ora facciamo il prossimo", "action", False),
]


# ============================================================
# DATASET GENERATION ENGINE
# ============================================================

def make_example(system: str, context: str, user_msg: str,
                 intent: str, entities: list, actions: list,
                 needs_llm: bool, response: str,
                 llm_hint: str = "") -> dict:
    """Create a single ChatML training example matching test-brain-complete.py format."""
    # Map 'teacher' intent to 'tutor' (test suite only has 6 intents)
    if intent == "teacher":
        intent = "tutor"
        needs_llm = True  # teacher always needs LLM

    # Generate llm_hint for needs_llm=True cases
    if needs_llm and not llm_hint:
        llm_hint = _generate_llm_hint(intent, user_msg, entities)

    assistant_json = json.dumps({
        "intent": intent,
        "entities": entities,
        "actions": actions,
        "needs_llm": needs_llm,
        "response": response if not needs_llm else None,
        "llm_hint": llm_hint if needs_llm else None,
    }, ensure_ascii=False)

    return {
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": f"{context}\n\n[MESSAGGIO]\n{user_msg}"},
            {"role": "assistant", "content": assistant_json}
        ]
    }


def _generate_llm_hint(intent: str, user_msg: str, entities: list) -> str:
    """Generate contextual llm_hint for needs_llm=True cases."""
    hints = {
        "tutor": [
            f"Lo studente chiede informazioni su: {', '.join(entities) if entities else 'elettronica'}. Rispondi in modo educativo e adatto a bambini 10-14 anni.",
            f"Domanda educativa. Spiega in modo semplice con analogie quotidiane.",
            f"Richiesta di spiegazione. Usa il metodo socratico per guidare lo studente.",
            f"Lo studente ha bisogno di supporto. Rispondi con pazienza e incoraggiamento.",
        ],
        "vision": [
            f"Lo studente vuole analizzare visivamente il circuito. Descrivi cosa vedi e suggerisci correzioni.",
            f"Richiesta di analisi visiva. Controlla componenti, fili e connessioni.",
            f"Verifica visiva del circuito richiesta. Confronta con l'esperimento attuale.",
        ],
        "code": [
            f"Lo studente ha una domanda sul codice Arduino. Spiega in modo didattico.",
            f"Richiesta relativa al codice. Aiuta con la programmazione Arduino.",
            f"Domanda di programmazione. Spiega la sintassi C++ per Arduino.",
        ],
        "circuit": [
            f"Lo studente vuole costruire un circuito con: {', '.join(entities) if entities else 'componenti'}. Guida la costruzione passo passo.",
            f"Richiesta di costruzione circuito. Verifica che i componenti siano compatibili.",
        ],
        "action": [
            f"Lo studente ha bisogno di aiuto con un'azione del simulatore.",
        ],
        "navigation": [
            f"Lo studente vuole navigare. Aiutalo a trovare la sezione giusta.",
        ],
    }
    import random as _rng
    options = hints.get(intent, hints["tutor"])
    return _rng.choice(options)


def extract_entities(text: str, rng: random.Random) -> list:
    """Extract component entities mentioned in text."""
    entities = []
    text_lower = text.lower()
    for comp_type, comp_data in COMPONENTS.items():
        for name in comp_data["it"]:
            if name.lower() in text_lower:
                entities.append(comp_type)
                break
    return list(set(entities))


def generate_action_stratum(rng: random.Random, variants_per_action: int) -> list:
    """Strato 2: Direct actions with linguistic variants."""
    examples = []

    for action_name, action_data in ACTIONS.items():
        base_variants = action_data["variants"]
        intent = action_data["intent"]
        needs_llm = action_data["needs_llm"]
        responses = action_data.get("response_templates", [])

        generated = set()
        attempts = 0
        target = variants_per_action

        while len(generated) < target and attempts < target * 5:
            attempts += 1

            # Pick a base variant
            base = rng.choice(base_variants)

            # Augment it
            augmented = augment_variant(base, rng)

            # Skip duplicates
            if augmented.lower() in generated:
                continue
            generated.add(augmented.lower())

            # Build context
            ctx = random_context(rng)

            # Extract entities
            entities = extract_entities(augmented, rng)

            # Build action tags
            action_tags = [f"[AZIONE:{action_name}]"]

            # Response
            response = rng.choice(responses) if responses else ""

            example = make_example(
                SYSTEM_PROMPT, ctx, augmented,
                intent, entities, action_tags,
                needs_llm, response
            )
            examples.append(example)

    return examples


def generate_circuit_building_stratum(rng: random.Random, count: int) -> list:
    """Strato 3: Circuit building with component combinations."""
    examples = []

    active_comps = {k: v for k, v in COMPONENTS.items()
                    if k not in ("wire", "breadboard-full", "breadboard-half", "battery9v", "nano-r4")}
    comp_keys = list(active_comps.keys())

    # Templates for building requests
    build_templates = [
        "costruisci un circuito con {comps}",
        "voglio un circuito con {comps}",
        "metti {comps} sulla breadboard",
        "fammi un circuito con {comps}",
        "aggiungi {comps}",
        "ho bisogno di {comps}",
        "puoi mettere {comps}?",
        "inserisci {comps} nel circuito",
        "piazza {comps}",
        "ci vogliono {comps}",
        "mi servono {comps}",
        "costruiscimi un circuito che usa {comps}",
        "vorrei provare un circuito con {comps}",
        "fai un circuito semplice con {comps}",
        "prepara un circuito con {comps}",
        "monta un circuito con {comps}",
        "assemblami {comps}",
        "prof come si fa un circuito con {comps}?",
        "ragazzi oggi montiamo {comps}",
        "per l'esperimento mi servono {comps}",
        "posso mettere {comps} sulla breadboard?",
        "dove posiziono {comps}?",
        "come collego {comps}?",
        "prendi {comps} e mettili sulla basetta",
        "dammi {comps}",
        "avrei bisogno di {comps} per questo progetto",
        "il libro dice di usare {comps}",
        "lo studente deve mettere {comps}",
    ]

    for _ in range(count):
        # Pick 1-5 random components
        n = rng.randint(1, 5)
        chosen = rng.sample(comp_keys, min(n, len(comp_keys)))

        # Build component names in natural Italian
        comp_names = []
        for c in chosen:
            name = rng.choice(active_comps[c]["it"])
            # Maybe add quantity
            if rng.random() < 0.2:
                qty = rng.randint(2, 4)
                comp_names.append(f"{qty} {name}")
            else:
                comp_names.append(f"un {name}" if rng.random() > 0.3 else name)

        # Join naturally
        if len(comp_names) == 1:
            comps_str = comp_names[0]
        elif len(comp_names) == 2:
            comps_str = f"{comp_names[0]} e {comp_names[1]}"
        else:
            comps_str = ", ".join(comp_names[:-1]) + f" e {comp_names[-1]}"

        template = rng.choice(build_templates)
        msg = template.format(comps=comps_str)
        msg = augment_variant(msg, rng, add_fillers=True)

        ctx = random_context(rng)
        entities = chosen

        # Build action tags
        actions = []
        for c in chosen:
            actions.append(f"[AZIONE:addcomponent:{c}]")

        example = make_example(
            SYSTEM_PROMPT, ctx, msg,
            "circuit", entities, actions,
            False, f"Aggiungo {comps_str} alla breadboard!"
        )
        examples.append(example)

    return examples


def generate_tutor_stratum(rng: random.Random, count: int) -> list:
    """Strato for tutor/teacher/vision intents."""
    examples = []

    all_tutor = TUTOR_VARIANTS + TEACHER_VARIANTS + TEACHER_SCENARIOS

    for _ in range(count):
        roll = rng.random()

        if roll < 0.15:
            # Vision
            base = rng.choice(VISION_VARIANTS)
            intent = "vision"
        elif roll < 0.35:
            # Teacher
            base = rng.choice(TEACHER_VARIANTS + TEACHER_SCENARIOS)
            intent = "teacher"
        else:
            # Tutor
            base = rng.choice(TUTOR_VARIANTS)
            intent = "tutor"

        msg = augment_variant(base, rng)
        ctx = random_context(rng)
        entities = extract_entities(msg, rng)

        example = make_example(
            SYSTEM_PROMPT, ctx, msg,
            intent, entities, [],
            True, ""
        )
        examples.append(example)

    return examples


def generate_context_aware_stratum(rng: random.Random, count: int) -> list:
    """Strato 4: Same message, different routing based on context."""
    examples = []

    # Messages that should route differently based on context
    context_sensitive = [
        {
            "msg": "avanti",
            "rules": [
                {"condition": "build_mode: passopasso", "intent": "action", "actions": ["[AZIONE:nextstep]"], "needs_llm": False},
                {"condition": "build_mode: completo", "intent": "action", "actions": ["[AZIONE:play]"], "needs_llm": False},
            ]
        },
        {
            "msg": "compila",
            "rules": [
                {"condition": "tab: editor", "intent": "action", "actions": ["[AZIONE:compile]"], "needs_llm": False},
                {"condition": "tab: simulator", "intent": "action", "actions": ["[AZIONE:openeditor]", "[AZIONE:compile]"], "needs_llm": False},
            ]
        },
        {
            "msg": "mostra il codice",
            "rules": [
                {"condition": "editor_mode: arduino", "intent": "code", "actions": ["[AZIONE:getcode]"], "needs_llm": False},
                {"condition": "editor_mode: scratch", "intent": "code", "actions": ["[AZIONE:openeditor]"], "needs_llm": False},
            ]
        },
        {
            "msg": "non funziona",
            "rules": [
                {"condition": "simulazione: running", "intent": "action", "actions": ["[AZIONE:diagnose]"], "needs_llm": True},
                {"condition": "simulazione: stopped", "intent": "action", "actions": ["[AZIONE:play]"], "needs_llm": False},
            ]
        },
        {
            "msg": "aiutami",
            "rules": [
                {"condition": "componenti: []", "intent": "tutor", "actions": [], "needs_llm": True},
                {"condition": "simulazione: running", "intent": "action", "actions": ["[AZIONE:diagnose]"], "needs_llm": True},
            ]
        },
    ]

    per_scenario = count // len(context_sensitive)

    for scenario in context_sensitive:
        for _ in range(per_scenario):
            rule = rng.choice(scenario["rules"])
            msg = augment_variant(scenario["msg"], rng)

            # Build context matching the rule's condition
            ctx = random_context(rng)
            # Override the relevant condition
            condition_key, condition_val = rule["condition"].split(": ", 1)
            ctx = re.sub(
                f"{condition_key}: \\S+",
                f"{condition_key}: {condition_val}",
                ctx
            )

            entities = extract_entities(msg, rng)
            example = make_example(
                SYSTEM_PROMPT, ctx, msg,
                rule["intent"], entities, rule["actions"],
                rule["needs_llm"],
                "" if rule["needs_llm"] else "Fatto!"
            )
            examples.append(example)

    return examples


def generate_multi_action_stratum(rng: random.Random, count: int) -> list:
    """Strato 7: Multi-action requests."""
    examples = []

    for _ in range(count):
        template_msg, template_actions = rng.choice(MULTI_ACTION_TEMPLATES)

        # Fill in component placeholders
        active_comps = [k for k in COMPONENTS.keys()
                       if k not in ("wire", "breadboard-full", "breadboard-half", "battery9v", "nano-r4")]

        msg = template_msg
        entities = []
        for i in range(1, 5):
            placeholder = f"{{comp{i}}}"
            if placeholder in msg:
                comp = rng.choice(active_comps)
                name = rng.choice(COMPONENTS[comp]["it"])
                msg = msg.replace(placeholder, name)
                entities.append(comp)

        msg = augment_variant(msg, rng)
        ctx = random_context(rng)

        action_tags = [f"[AZIONE:{a}]" for a in template_actions]

        example = make_example(
            SYSTEM_PROMPT, ctx, msg,
            "action" if "play" in template_actions or "compile" in template_actions else "circuit",
            entities, action_tags,
            False, "Fatto tutto!"
        )
        examples.append(example)

    return examples


def generate_implicit_stratum(rng: random.Random, count: int) -> list:
    """Strato 8: Implicit intent detection."""
    examples = []

    per_implicit = count // len(IMPLICIT_INTENTS)

    for msg, intent, actions, needs_llm in IMPLICIT_INTENTS:
        for _ in range(max(1, per_implicit)):
            augmented = augment_variant(msg, rng)
            ctx = random_context(rng)
            entities = extract_entities(augmented, rng)

            example = make_example(
                SYSTEM_PROMPT, ctx, augmented,
                intent, entities, actions,
                needs_llm,
                "" if needs_llm else "Ci penso io!"
            )
            examples.append(example)

    return examples


def generate_adversarial_stratum(rng: random.Random, count: int) -> list:
    """Strato 6: Adversarial examples."""
    examples = []

    per_example = count // len(ADVERSARIAL_EXAMPLES)

    for msg, intent, needs_llm in ADVERSARIAL_EXAMPLES:
        for _ in range(max(1, per_example)):
            augmented = msg  # Don't augment adversarial — they're already edge cases
            if rng.random() < 0.3:
                augmented = augment_variant(msg, rng)

            ctx = random_context(rng)
            entities = extract_entities(augmented, rng)

            example = make_example(
                SYSTEM_PROMPT, ctx, augmented,
                intent, entities, [],
                needs_llm,
                "" if needs_llm else "Ok!"
            )
            examples.append(example)

    return examples


def generate_experiment_loading_stratum(rng: random.Random, count: int) -> list:
    """Generate experiment loading examples covering all 62 experiments."""
    examples = []

    load_templates = [
        "carica {exp_name}", "apri {exp_name}", "voglio fare {exp_name}",
        "facciamo {exp_name}", "metti {exp_name}", "vai a {exp_name}",
        "caricami l'esperimento {exp_name}",
        "posso fare {exp_name}?", "andiamo a {exp_name}",
        "prof facciamo {exp_name}?", "oggi proviamo {exp_name}",
        "il prossimo esperimento e' {exp_name}?",
        "carica l'esperimento del capitolo {cap} esperimento {esp}",
        "voglio provare il capitolo {cap}",
    ]

    for _ in range(count):
        exp_id, exp_name = rng.choice(ALL_EXPERIMENTS)

        # Parse cap/esp from id
        parts = exp_id.split("-")
        cap = parts[1].replace("cap", "") if len(parts) > 1 else "6"
        esp = parts[2].replace("esp", "") if len(parts) > 2 else "1"

        template = rng.choice(load_templates)
        msg = template.format(exp_name=exp_name, cap=cap, esp=esp)
        msg = augment_variant(msg, rng)

        ctx = random_context(rng)

        example = make_example(
            SYSTEM_PROMPT, ctx, msg,
            "navigation", [exp_id], [f"[AZIONE:loadexp:{exp_id}]"],
            False, f"Carico {exp_name}!"
        )
        examples.append(example)

    return examples


def generate_eval_set(rng: random.Random, count: int = 200) -> list:
    """Generate a balanced evaluation set."""
    examples = []

    # Balanced across intents
    intents_pool = {
        "action": [
            ("avvia la simulazione", ["[AZIONE:play]"], False),
            ("fermalo", ["[AZIONE:pause]"], False),
            ("pulisci la breadboard", ["[AZIONE:clearall]"], False),
            ("compila il codice", ["[AZIONE:compile]"], False),
            ("annulla", ["[AZIONE:undo]"], False),
            ("fammi un quiz", ["[AZIONE:quiz]"], False),
            ("evidenzia il LED", ["[AZIONE:highlight]"], False),
            ("misura la tensione", ["[AZIONE:measure]"], False),
            ("non funziona aiutami", ["[AZIONE:diagnose]"], True),
            ("apri il serial monitor", ["[AZIONE:showserial]"], False),
            ("prossimo passo", ["[AZIONE:nextstep]"], False),
            ("resetta tutto", ["[AZIONE:reset]"], False),
            ("mostra la lista componenti", ["[AZIONE:showbom]"], False),
            ("premi il pulsante", ["[AZIONE:interact]"], False),
            ("gira il pot al massimo", ["[AZIONE:setvalue]"], False),
        ],
        "circuit": [
            ("metti un LED", ["[AZIONE:addcomponent:led]"], False),
            ("aggiungi un resistore e un buzzer", ["[AZIONE:addcomponent:resistor]", "[AZIONE:addcomponent:buzzer-piezo]"], False),
            ("collega il LED al resistore", ["[AZIONE:addwire]"], False),
            ("togli il resistore", ["[AZIONE:removecomponent]"], False),
            ("costruisci un circuito con LED e pulsante", ["[AZIONE:addcomponent:led]", "[AZIONE:addcomponent:push-button]"], False),
        ],
        "code": [
            ("scrivi il codice per far lampeggiare il LED", ["[AZIONE:setcode]"], False),
            ("fammi vedere il codice", ["[AZIONE:getcode]"], False),
            ("ripristina il codice originale", ["[AZIONE:resetcode]"], False),
        ],
        "navigation": [
            ("apri l'editor", ["[AZIONE:openeditor]"], False),
            ("vai al simulatore", ["[AZIONE:opentab:simulator]"], False),
            ("apri il manuale", ["[AZIONE:opentab:manual]"], False),
            ("carica l'esperimento del semaforo", ["[AZIONE:loadexp:v3-cap6-semaforo]"], False),
            ("passa ai blocchi", ["[AZIONE:switcheditor:scratch]"], False),
            ("chiudi l'editor", ["[AZIONE:closeeditor]"], False),
        ],
        "tutor": [
            ("cos'e' un resistore?", [], True),
            ("spiegami la legge di Ohm", [], True),
            ("perche' serve il resistore col LED?", [], True),
            ("cos'e' la corrente elettrica?", [], True),
            ("come funziona un condensatore?", [], True),
        ],
        "vision": [
            ("guarda il mio circuito", [], True),
            ("controlla la foto", [], True),
            ("dimmi se il circuito e' giusto guardando", [], True),
        ],
        "teacher": [
            ("sono un prof inesperto da dove parto?", [], True),
            ("come preparo una lezione sui circuiti?", [], True),
            ("fai un gioco per imparare la legge di Ohm", [], True),
        ],
    }

    per_intent = count // len(intents_pool)

    for intent, items in intents_pool.items():
        for _ in range(per_intent):
            msg, actions, needs_llm = rng.choice(items)
            msg = augment_variant(msg, rng)
            ctx = random_context(rng)
            entities = extract_entities(msg, rng)

            example = make_example(
                SYSTEM_PROMPT, ctx, msg,
                intent, entities, actions,
                needs_llm,
                "" if needs_llm else "Fatto!"
            )
            examples.append(example)

    return examples


def generate_long_confused_stratum(rng: random.Random, count: int) -> list:
    """Strato 10: Long confused messages from teachers, parents, kids."""
    examples = []
    for _ in range(count):
        msg = generate_long_confused(rng, COMPONENTS)

        # Determine intent from content
        action_words = ["avvia", "ferma", "compila", "reset", "pulisci", "play", "start"]
        circuit_words = ["metti", "aggiungi", "collega", "costrui", "monta"]
        nav_words = ["carica", "apri", "esperimento", "volume", "capitolo"]

        msg_lower = msg.lower()
        if any(w in msg_lower for w in action_words):
            intent = "action"
            needs_llm = True
        elif any(w in msg_lower for w in circuit_words):
            intent = "circuit"
            needs_llm = True
        elif any(w in msg_lower for w in nav_words):
            intent = "navigation"
            needs_llm = True
        elif "prof" in msg_lower or "insegn" in msg_lower or "classe" in msg_lower or "lezione" in msg_lower:
            intent = "teacher"
            needs_llm = True
        else:
            intent = "tutor"
            needs_llm = True

        ctx = random_context(rng)
        entities = extract_entities(msg, rng)

        example = make_example(
            SYSTEM_PROMPT, ctx, msg,
            intent, entities, [],
            needs_llm, ""
        )
        examples.append(example)
    return examples


def generate_dialect_stratum(rng: random.Random, count: int) -> list:
    """Strato 11: Regional dialect variants of common actions."""
    examples = []
    dialects = list(DIALECT_TRANSFORMS.keys())

    # Base phrases to dialectize
    base_phrases = [
        ("avvia la simulazione", "action", ["[AZIONE:play]"], False, "Simulazione avviata!"),
        ("ferma tutto", "action", ["[AZIONE:pause]"], False, "In pausa!"),
        ("pulisci la breadboard", "action", ["[AZIONE:clearall]"], False, "Tutto pulito!"),
        ("metti un LED", "circuit", ["[AZIONE:addcomponent:led]"], False, "LED aggiunto!"),
        ("collega i fili", "circuit", ["[AZIONE:addwire]"], False, "Collegato!"),
        ("compila il codice", "action", ["[AZIONE:compile]"], False, "Compilazione in corso!"),
        ("fammi un quiz", "teacher", ["[AZIONE:quiz]"], False, "Quiz in arrivo!"),
        ("cos'e' un resistore?", "tutor", [], True, ""),
        ("non funziona niente", "action", ["[AZIONE:diagnose]"], True, ""),
        ("carica il primo esperimento", "navigation", ["[AZIONE:loadexp:v1-cap6-esp1]"], False, "Caricato!"),
        ("apri il manuale", "navigation", ["[AZIONE:opentab:manual]"], False, "Manuale aperto!"),
        ("aggiungi un buzzer e un pulsante", "circuit", ["[AZIONE:addcomponent:buzzer-piezo]", "[AZIONE:addcomponent:push-button]"], False, "Aggiunti!"),
        ("voglio costruire un circuito con LED e resistore", "circuit", ["[AZIONE:addcomponent:led]", "[AZIONE:addcomponent:resistor]"], False, "Costruisco!"),
        ("guarda il mio circuito", "vision", [], True, ""),
        ("dimmi come funziona questo esperimento", "tutor", [], True, ""),
        ("spiega la legge di Ohm", "tutor", [], True, ""),
        ("mostrami il prossimo passo", "action", ["[AZIONE:nextstep]"], False, "Ecco il prossimo passo!"),
        ("annulla l'ultima cosa che ho fatto", "action", ["[AZIONE:undo]"], False, "Annullato!"),
        ("misura la tensione sul LED", "action", ["[AZIONE:measure]"], False, "Misurato!"),
        ("dove trovo il potenziometro?", "action", ["[AZIONE:highlight]"], False, "Eccolo!"),
    ]

    per_phrase = count // (len(base_phrases) * len(dialects))

    for base, intent, actions, needs_llm, response in base_phrases:
        for dialect in dialects:
            for _ in range(max(1, per_phrase)):
                # Apply dialect
                dialectized = apply_dialect(base, dialect, rng)
                # Then augment
                augmented = augment_variant(dialectized, rng)

                ctx = random_context(rng)
                entities = extract_entities(augmented, rng)

                example = make_example(
                    SYSTEM_PROMPT, ctx, augmented,
                    intent, entities, actions,
                    needs_llm, response if not needs_llm else ""
                )
                examples.append(example)

    return examples


# ============================================================
# MAIN GENERATION PIPELINE
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Galileo Brain Dataset Factory v7")
    parser.add_argument("--output", default="datasets/galileo-brain-v7.jsonl")
    parser.add_argument("--eval-output", default="datasets/galileo-brain-v7-eval.jsonl")
    parser.add_argument("--variants", type=int, default=200,
                        help="Linguistic variants per action")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--include-typos", action="store_true", default=True)
    parser.add_argument("--include-dialect", action="store_true", default=True)
    parser.add_argument("--teacher-scenarios", action="store_true", default=True)
    parser.add_argument("--replay-file", default=None,
                        help="Path to v5 dataset for replay stratum")
    args = parser.parse_args()

    rng = random.Random(args.seed)
    all_examples = []

    # ---- Strato 1: Replay (anti-forgetting) ----
    if args.replay_file and Path(args.replay_file).exists():
        print(f"[Strato 1] Loading replay from {args.replay_file}...")
        with open(args.replay_file) as f:
            replay = [json.loads(l) for l in f]
        # Sample 20% for replay
        sample_size = min(len(replay) // 5, 5000)
        replay_sample = rng.sample(replay, sample_size)
        all_examples.extend(replay_sample)
        print(f"  → {len(replay_sample)} replay examples")
    else:
        print("[Strato 1] No replay file, skipping")

    # ---- Strato 2: Direct Actions ----
    print(f"[Strato 2] Generating {len(ACTIONS)} actions × {args.variants} variants...")
    action_examples = generate_action_stratum(rng, args.variants)
    all_examples.extend(action_examples)
    print(f"  → {len(action_examples)} action examples")

    # ---- Strato 3: Circuit Building ----
    circuit_count = args.variants * 25  # ~5000-12500
    print(f"[Strato 3] Generating {circuit_count} circuit building examples...")
    circuit_examples = generate_circuit_building_stratum(rng, circuit_count)
    all_examples.extend(circuit_examples)
    print(f"  → {len(circuit_examples)} circuit examples")

    # ---- Strato 4: Context-Aware ----
    context_count = args.variants * 10  # ~2000-5000
    print(f"[Strato 4] Generating {context_count} context-aware examples...")
    context_examples = generate_context_aware_stratum(rng, context_count)
    all_examples.extend(context_examples)
    print(f"  → {len(context_examples)} context-aware examples")

    # ---- Strato 5: Tutor/Teacher/Vision ----
    tutor_count = args.variants * 30  # ~6000-15000
    print(f"[Strato 5] Generating {tutor_count} tutor/teacher/vision examples...")
    tutor_examples = generate_tutor_stratum(rng, tutor_count)
    all_examples.extend(tutor_examples)
    print(f"  → {len(tutor_examples)} tutor examples")

    # ---- Strato 6: Adversarial ----
    adversarial_count = args.variants * 10  # ~2000-5000
    print(f"[Strato 6] Generating {adversarial_count} adversarial examples...")
    adversarial_examples = generate_adversarial_stratum(rng, adversarial_count)
    all_examples.extend(adversarial_examples)
    print(f"  → {len(adversarial_examples)} adversarial examples")

    # ---- Strato 7: Multi-Action ----
    multi_count = args.variants * 15  # ~3000-7500
    print(f"[Strato 7] Generating {multi_count} multi-action examples...")
    multi_examples = generate_multi_action_stratum(rng, multi_count)
    all_examples.extend(multi_examples)
    print(f"  → {len(multi_examples)} multi-action examples")

    # ---- Strato 8: Implicit Intent ----
    implicit_count = args.variants * 15  # ~3000-7500
    print(f"[Strato 8] Generating {implicit_count} implicit intent examples...")
    implicit_examples = generate_implicit_stratum(rng, implicit_count)
    all_examples.extend(implicit_examples)
    print(f"  → {len(implicit_examples)} implicit examples")

    # ---- Strato 9: Experiment Loading ----
    exp_count = args.variants * 5  # ~1000
    print(f"[Strato 9] Generating {exp_count} experiment loading examples...")
    exp_examples = generate_experiment_loading_stratum(rng, exp_count)
    all_examples.extend(exp_examples)
    print(f"  → {len(exp_examples)} experiment examples")

    # ---- Strato 10: Long Confused Messages (Prof/Genitori/Bambini) ----
    long_count = args.variants * 10  # ~2000-5000
    print(f"[Strato 10] Generating {long_count} long confused messages...")
    long_examples = generate_long_confused_stratum(rng, long_count)
    all_examples.extend(long_examples)
    print(f"  → {len(long_examples)} long confused examples")

    # ---- Strato 11: Dialect Variants ----
    dialect_count = args.variants * 8  # ~1600-4000
    print(f"[Strato 11] Generating {dialect_count} dialect variants...")
    dialect_examples = generate_dialect_stratum(rng, dialect_count)
    all_examples.extend(dialect_examples)
    print(f"  → {len(dialect_examples)} dialect examples")

    # ---- Shuffle and Write ----
    rng.shuffle(all_examples)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        for ex in all_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')

    print(f"\n{'='*60}")
    print(f"TRAINING SET: {len(all_examples):,} examples → {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")

    # ---- Generate Eval Set ----
    print(f"\n[Eval] Generating evaluation set...")
    eval_examples = generate_eval_set(rng, 200)

    eval_path = Path(args.eval_output)
    eval_path.parent.mkdir(parents=True, exist_ok=True)

    with open(eval_path, 'w', encoding='utf-8') as f:
        for ex in eval_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')

    print(f"EVAL SET: {len(eval_examples)} examples → {eval_path}")

    # ---- Stats ----
    print(f"\n{'='*60}")
    print("DISTRIBUTION:")
    from collections import Counter
    intent_counts = Counter()
    for ex in all_examples:
        asst = json.loads(ex["messages"][2]["content"])
        intent_counts[asst["intent"]] += 1

    for intent, count in intent_counts.most_common():
        pct = count / len(all_examples) * 100
        print(f"  {intent:15s}: {count:6,} ({pct:5.1f}%)")

    # User message length stats
    lengths = [len(ex["messages"][1]["content"]) for ex in all_examples]
    print(f"\nMessage lengths:")
    print(f"  Min: {min(lengths)} chars")
    print(f"  Avg: {sum(lengths)/len(lengths):.0f} chars")
    print(f"  Max: {max(lengths)} chars")
    print(f"  >200 chars: {sum(1 for l in lengths if l > 200):,} ({sum(1 for l in lengths if l > 200)/len(all_examples)*100:.1f}%)")
    print(f"  >500 chars: {sum(1 for l in lengths if l > 500):,} ({sum(1 for l in lengths if l > 500)/len(all_examples)*100:.1f}%)")


if __name__ == "__main__":
    main()
