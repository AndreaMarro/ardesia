#!/usr/bin/env python3
"""
Galileo Brain — Dataset Generator v3
=====================================
Genera un dataset MASSICCIO per fine-tuning del Galileo Brain.
Malleabile (modifica le categorie), Scalabile (rilancia per generare di più).

Uso:
    python3 scripts/generate-brain-dataset.py                    # genera v3 (default 5000)
    python3 scripts/generate-brain-dataset.py --count 10000      # genera 10000 esempi
    python3 scripts/generate-brain-dataset.py --append            # appende al file esistente
    python3 scripts/generate-brain-dataset.py --seed 42           # seed riproducibile
    python3 scripts/generate-brain-dataset.py --stats             # mostra solo statistiche
    python3 scripts/generate-brain-dataset.py --validate          # valida formato

Output: datasets/galileo-brain-v3.jsonl
"""

import json
import random
import argparse
import os
import sys
import re
from pathlib import Path
from datetime import datetime

# ============================================================
# CONFIGURAZIONE GLOBALE
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
   - "action": comandi simulazione (play/pause/reset/clearall/compile/quiz)
   - "circuit": piazzamento componenti, cablaggio, diagnosi circuiti
   - "code": scrittura/modifica codice Arduino
   - "tutor": domande teoriche, spiegazioni, concetti
   - "vision": analisi visiva dello screenshot
   - "navigation": caricamento esperimenti, cambio tab/volume
2. "entities": lista di componenti, pin, esperimenti menzionati
3. "actions": array di action tag nel formato esatto [AZIONE:...] o [INTENT:...]
   - Comandi: [AZIONE:play] [AZIONE:pause] [AZIONE:reset] [AZIONE:clearall] [AZIONE:compile] [AZIONE:quiz]
   - Navigazione: [AZIONE:loadexp:ID] [AZIONE:opentab:NOME] [AZIONE:openvolume:N]
   - Componenti: [INTENT:place_and_wire]
   - Fili: [AZIONE:addwire:DA:A]
   - Interazioni: [AZIONE:interact:NOME] [AZIONE:highlight:NOME] [AZIONE:measure:NOME]
   - Codice: [AZIONE:setcode:CODICE] [AZIONE:compile]
   - Rimozione: [AZIONE:removecomponent:NOME] [AZIONE:removewire:DESC]
   - Movimento: [AZIONE:movecomponent:NOME:DIREZIONE] [AZIONE:setvalue:NOME:VALORE]
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

TAB VALIDI: simulator, manual, video, canvas, editor
WING PINS: W_A0, W_A1, W_A2, W_A3, W_D3, W_D5, W_D6, W_D9, W_D10, W_D11, W_D12, W_D13"""

# ============================================================
# COMPONENTI E PIN (per generazione dinamica)
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

WING_PINS = ["W_A0", "W_A1", "W_A2", "W_A3", "W_D3", "W_D5", "W_D6",
             "W_D9", "W_D10", "W_D11", "W_D12", "W_D13"]

DIGITAL_PINS = ["D3", "D5", "D6", "D9", "D10", "D11", "D12", "D13"]
ANALOG_PINS = ["A0", "A1", "A2", "A3"]

TABS = ["simulator", "manual", "video", "canvas", "editor"]

EXPERIMENTS = [
    "v1-cap1-esp1", "v1-cap2-esp1", "v1-cap3-esp1", "v1-cap4-esp1",
    "v1-cap5-esp1", "v1-cap5-esp2", "v1-cap6-esp1", "v1-cap7-esp1",
    "v1-cap8-esp1", "v1-cap8-esp2", "v1-cap8-esp3", "v1-cap9-esp1",
    "v1-cap10-esp1", "v1-cap11-esp1", "v1-cap11-esp2", "v1-cap12-esp1",
    "v1-cap12-esp2", "v1-cap12-esp3",
    "v2-cap1-esp1", "v2-cap2-esp1", "v2-cap3-esp1", "v2-cap4-esp1",
    "v2-cap5-esp1", "v2-cap6-esp1", "v2-cap7-esp1", "v2-cap8-esp1",
    "v2-cap9-esp1", "v2-cap10-esp1", "v2-cap11-esp1",
    "v3-cap1-esp1", "v3-cap2-esp1", "v3-cap3-esp1", "v3-cap4-esp1",
    "v3-cap5-esp1", "v3-cap6-esp1", "v3-cap7-esp1",
]

# ============================================================
# NOMI COMUNI DEI COMPONENTI (come li chiamano gli studenti)
# ============================================================

COMPONENT_ALIASES = {
    "led": ["LED", "led", "lucina", "lucetta", "lampadina", "luce", "diodo luminoso",
            "il led", "il LED", "la lucina", "lampadina LED", "ledino", "lucciola"],
    "resistor": ["resistenza", "resistore", "res", "la resistenza", "una resistenza",
                 "il resistore", "ohm", "la res"],
    "push-button": ["pulsante", "bottone", "tasto", "il pulsante", "il bottone",
                    "pushbutton", "push button", "switch", "interruttore",
                    "il tasto", "tastino", "pulsantino", "button"],
    "buzzer-piezo": ["buzzer", "cicalino", "il buzzer", "altoparlante", "speaker",
                     "suoneria", "beeper", "il cicalino", "piezo", "buzzerino"],
    "capacitor": ["condensatore", "capacitore", "il condensatore", "cap",
                  "il cap", "capacitor"],
    "potentiometer": ["potenziometro", "pot", "il pot", "il potenziometro",
                      "manopola", "la manopola", "rotella", "trimmer"],
    "photo-resistor": ["fotoresistenza", "fotoresistore", "sensore di luce",
                       "LDR", "il fotoresistore", "la fotoresistenza",
                       "sensore luminoso", "il sensore di luce"],
    "diode": ["diodo", "il diodo", "la diode", "un diodo"],
    "mosfet-n": ["mosfet", "il mosfet", "transistor", "il transistor",
                 "MOSFET", "mosfet N", "il MOSFET"],
    "rgb-led": ["LED RGB", "led rgb", "RGB", "il led RGB", "led colorato",
                "LED multicolore", "led a tre colori", "rgb"],
    "motor-dc": ["motore", "motorino", "il motore", "motore DC", "il motorino",
                 "motore elettrico", "motor", "il motor"],
    "servo": ["servo", "servomotore", "il servo", "il servomotore",
              "servo motore", "braccetto"],
    "reed-switch": ["reed switch", "il reed", "sensore magnetico",
                    "interruttore magnetico", "reed", "il sensore magnetico"],
    "phototransistor": ["fototransistor", "il fototransistor", "sensore ottico",
                        "il sensore ottico", "phototransistor"],
    "battery9v": ["batteria", "pila", "la batteria", "batteria 9V", "la pila",
                  "9 volt", "pila 9V"],
    "multimeter": ["multimetro", "tester", "il multimetro", "il tester",
                   "voltmetro", "strumento di misura"],
    "lcd16x2": ["display", "LCD", "schermo", "il display", "lo schermo",
                "display LCD", "LCD 16x2", "il monitor"],
}

# ============================================================
# FRASI PER OGNI INTENT/AZIONE
# ============================================================

PLAY_PHRASES = [
    "Avvia", "Avvia la simulazione", "Play", "Start", "Vai", "Go",
    "Fai partire", "Fai partire il circuito", "Accendi", "Accendi tutto",
    "Avvia il circuito", "Lancia la simulazione", "Metti in moto",
    "Premi play", "Fai play", "Clicca play",
    "Fallo andare", "Daje!", "Via!", "Parti!", "Su!", "Accendilo",
    "Fai girare", "Metti su", "Fallo funzionare", "Attiva",
    "Dai che si parte", "Andiamo!", "Fai girare il tutto",
    "Manda avanti", "Prova ad avviare", "Accendiamo",
    "Voglio vedere se funziona", "Proviamo", "Testiamo il circuito",
    "Voglio provare", "Facciamo andare", "Siamo pronti, avvia",
    "OK avvia", "Ok parti", "Si parte",
    "avvia", "AVVIA", "paly", "plya", "strat", "strt",
    "vai!", "go!", "PLAY", "AVVIA!", "avvvia",
    "Run it", "Run the simulation", "Execute", "Let's go",
    "Start it up", "Fire it up", "Launch",
    "Ho finito di montare, avvia", "È tutto collegato, parti",
    "Pronto, fai partire", "Il circuito è pronto, avvia",
    "Ho messo tutto, prova a farlo andare",
    "Dai vai", "Forza avvia", "Allora? Avvialo!",
    "Fammelo vedere in azione", "Aziona il circuito",
    "Metti in funzione", "Fammi vedere come va",
    "Ma si avvia o no?", "Prova a farlo partire dai",
    "Go go go", "Partiamo!", "Iniziamo!", "Avanti!",
    "Mandalo", "Fallo girare", "Prova!",
    "Vediamo se funziona questa cosa",
    "Dai su, fai andare", "Tenta di avviare",
]

PAUSE_PHRASES = [
    "Stop", "Ferma", "Pausa", "Metti in pausa", "Ferma tutto",
    "Fermalo", "Stoppa", "Blocca", "Fermati", "Basta",
    "Stop la simulazione", "Metti pausa", "Premi stop",
    "Spegni", "Alt", "Aspetta", "Freezalo", "Freeze",
    "Fermo!", "Stoppalo!", "Basta così", "Ok basta",
    "Fermati un attimo", "Mettila in pausa", "Frena",
    "Stoppami tutto", "Blocca tutto", "Tieni fermo",
    "Ah fermalo", "No stop", "Stoooop",
    "Non voglio che vada avanti", "Aspetta un momento",
    "stop", "STOP", "stoooop", "frema", "pasua", "puasa",
    "ferma!", "FERMA", "basta!", "BASTA",
    "Pause", "Hold", "Halt", "Pause it", "Stop it",
    "Fermami tutto", "Un attimo", "Wait",
    "No no ferma!", "Blocca blocca!", "Stai fermo",
    "Eh no fermalo", "Aspé", "Ferma un secondo",
]

RESET_PHRASES = [
    "Reset", "Resetta", "Resetta il circuito", "Ripristina",
    "Ricomincia", "Ricomincia da capo", "Resetta tutto",
    "Rimetti a zero", "Riporta all'inizio", "Reimposta",
    "Da capo", "Daccapo", "Dall'inizio", "Ricominciamo",
    "Rifacciamo tutto", "Torna indietro", "Metti come prima",
    "Riporta a come era", "Azzera", "Azzera tutto",
    "Fai reset", "Premi reset", "Resettiamo",
    "Rimettiamo a posto", "Come prima", "Rifai da capo",
    "reset", "RESET", "resetta", "resettta", "risetta",
    "riset", "reeset",
    "Riportami alla situazione iniziale",
    "Come se non avessi toccato niente",
    "Torna allo stato originale",
]

CLEARALL_PHRASES = [
    "Cancella tutto", "Pulisci tutto", "Svuota", "Svuota tutto",
    "Togli tutto", "Rimuovi tutto", "Elimina tutto",
    "Pulisci la breadboard", "Svuota la breadboard",
    "Cancella il circuito", "Via tutto", "Butta via tutto",
    "Togli tutti i componenti", "Sgombra", "Sgombra tutto",
    "Fai piazza pulita", "Tabula rasa", "Tutto via",
    "Leva tutto", "Spazza via", "Sparecchia", "Ripulisci",
    "Levami tutto da qui", "Togli tutta sta roba",
    "Cancella tutto quello che c'è", "Butta tutto",
    "Fai pulizia", "Liberami la breadboard",
    "cancella tuto", "pulisci tuto", "svuotaa", "toglli tutto",
    "CANCELLA TUTTO", "elimna tutto",
    "Voglio ricominciare da zero", "Voglio una breadboard vuota",
    "Ripartire da zero", "Non mi serve più niente",
    "Toglimi tutto di mezzo", "Via via tutto",
    "Basta, togli tutto", "Ripulisci tutto quanto",
]

COMPILE_PHRASES = [
    "Compila", "Compila il codice", "Compila lo sketch",
    "Fai la compilazione", "Verifica il codice", "Controlla il codice",
    "Build", "Compila e carica", "Compila e verifica",
    "Prova a compilare", "Lancia la compilazione",
    "Vedi se il codice è giusto", "Controlla se compila",
    "Testami il codice", "Compilami sto codice",
    "Compilalo", "Fai il build",
    "compila", "COMPILA", "conpila", "copmila",
    "compile", "Compilazione!",
    "Manda in compilazione", "Verifica lo sketch",
]

QUIZ_PHRASES = [
    "Quiz", "Fammi un quiz", "Domanda", "Fammi una domanda",
    "Quiz time", "Prova a interrogarmi", "Verificami",
    "Test", "Fammi un test", "Mettimi alla prova",
    "Interrogami", "Vuoi farmi qualche domanda?",
    "Challenge", "Sfidami", "Fammi un po' di domande",
    "Sparami un quiz", "Dai un quiz", "Proviamo un quiz",
    "Mi fai un quiz?", "Facciamo un quiz", "Quiz!",
    "Interrogazione!", "Testami", "Daje col quiz",
    "Facciamo un gioco a domande", "Domandina",
    "Voglio mettermi alla prova", "Vediamo se ho capito",
    "Mi fai qualche domanda su questo argomento?",
    "Prova a farmi qualche domanda", "Sono pronto per il quiz",
]

DIAGNOSE_PHRASES = [
    "Diagnosi", "Diagnostica", "Cosa c'è che non va?",
    "Analizza il problema", "Trova l'errore",
    "Controlla cosa non funziona", "Perché non funziona?",
    "Debug", "Cerca il problema", "Cosa non va?",
    "Diagnostica il circuito", "Controlla il circuito",
    "Che cos'ha?", "Dove sbaglio?", "Ma che cavolo non va?",
    "Help, non funziona!", "Non va niente!",
    "Aiuto, c'è un problema", "Cosa ho sbagliato?",
    "Non capisco l'errore", "Perché non si accende?",
    "Ma perché non va?", "Trovami il bug",
    "Il circuito non va, che succede?",
    "Qualcosa non torna", "Non funziona un cavolo",
    "È tutto sbagliato?", "Dov'è il problema?",
    "Analizzami il circuito", "Scansiona gli errori",
]

def gen_highlight_phrases(comp_name, comp_alias):
    return [
        f"Dov'è {comp_alias}?", f"Dove si trova {comp_alias}?",
        f"Mostrami {comp_alias}", f"Evidenzia {comp_alias}",
        f"Fammi vedere {comp_alias}", f"Trova {comp_alias}",
        f"Indicami {comp_alias}", f"Dove sta {comp_alias}?",
        f"Non trovo {comp_alias}", f"Non vedo {comp_alias}",
        f"Cerco {comp_alias}", f"Illuminami {comp_alias}",
        f"Highlight {comp_alias}", f"Seleziona {comp_alias}",
        f"Dove l'ho messo {comp_alias}?",
        f"Ma {comp_alias} dov'è?",
    ]

def gen_interact_phrases(comp_name, comp_alias):
    base = [
        f"Premi {comp_alias}", f"Clicca {comp_alias}",
        f"Attiva {comp_alias}", f"Schiaccia {comp_alias}",
        f"Prova a premere {comp_alias}", f"Interagisci con {comp_alias}",
        f"Tocca {comp_alias}", f"Spingi {comp_alias}",
    ]
    if comp_name == "push-button":
        base.extend([
            "Premi il bottone", "Clicca il pulsante", "Schiaccia il tasto",
            "Prova a premere", "Dai un click al pulsante",
            "Push the button", "Pigia il bottone",
            "Premi il pulsante per me", "Clickami il bottone",
        ])
    elif comp_name == "potentiometer":
        base.extend([
            "Gira la manopola", "Ruota il potenziometro", "Muovi il pot",
            "Alza il valore", "Abbassa il valore", "Regola il potenziometro",
            "Girami la manopola", "Ruota un po' il pot",
        ])
    return base

def gen_measure_phrases(comp_name, comp_alias):
    return [
        f"Misura {comp_alias}", f"Quanti volt su {comp_alias}?",
        f"Che tensione c'è su {comp_alias}?", f"Misura la tensione di {comp_alias}",
        f"Controlla i valori di {comp_alias}", f"Leggi {comp_alias}",
        f"Quanto segna {comp_alias}?", f"Che corrente passa in {comp_alias}?",
        f"Misurami {comp_alias}", f"Vedi quanto c'è su {comp_alias}",
        f"Fai una misura su {comp_alias}", f"Voltaggio di {comp_alias}?",
    ]

def gen_remove_phrases(comp_name, comp_alias):
    return [
        f"Rimuovi {comp_alias}", f"Togli {comp_alias}",
        f"Elimina {comp_alias}", f"Leva {comp_alias}",
        f"Cancella {comp_alias}", f"Butta via {comp_alias}",
        f"Non mi serve {comp_alias}", f"Via {comp_alias}",
        f"Toglimi {comp_alias}", f"Levami {comp_alias}",
        f"Rimuovimi {comp_alias}", f"Portami via {comp_alias}",
    ]

def gen_move_phrases(comp_name, comp_alias):
    directions = ["su", "giù", "destra", "sinistra", "a destra", "a sinistra",
                   "in alto", "in basso", "più su", "più giù"]
    phrases = []
    for d in directions:
        phrases.extend([
            f"Sposta {comp_alias} {d}",
            f"Muovi {comp_alias} {d}",
        ])
    return phrases

def gen_setvalue_phrases(comp_name, comp_alias):
    phrases = []
    if comp_name == "resistor":
        for v in ["100", "220", "330", "470", "1k", "1000", "4.7k", "10k"]:
            phrases.extend([
                f"Metti {comp_alias} a {v} ohm",
                f"Imposta {comp_alias} a {v}",
                f"Cambia {comp_alias} a {v} Ω",
                f"Resistenza da {v} ohm",
            ])
    elif comp_name == "capacitor":
        for v in ["100uF", "10uF", "1uF", "470uF", "47uF"]:
            phrases.extend([
                f"Metti {comp_alias} a {v}",
                f"Imposta {comp_alias} a {v}",
            ])
    elif comp_name == "potentiometer":
        for v in ["50%", "0%", "100%", "25%", "75%"]:
            phrases.extend([
                f"Metti {comp_alias} al {v}",
                f"Imposta {comp_alias} a {v}",
                f"Regola {comp_alias} a {v}",
            ])
    return phrases

YOUTUBE_PHRASES = [
    ("led", ["Cerca un video sui LED", "Fammi vedere un video sul LED",
             "Tutorial LED", "Video LED", "YouTube LED",
             "Voglio vedere un video su come funziona un LED"]),
    ("resistor", ["Video sulla resistenza", "Tutorial resistenze",
                  "Cerca un video sulle resistenze", "YouTube resistenze"]),
    ("servo", ["Video sul servo", "Tutorial servomotore",
               "Cerca un video sul servomotore"]),
    ("motor-dc", ["Video sul motore DC", "Tutorial motore elettrico",
                  "Cerca un video sui motori"]),
    ("arduino", ["Tutorial Arduino", "Video Arduino per principianti",
                 "Cerca un video su Arduino", "YouTube Arduino"]),
    ("breadboard", ["Video sulla breadboard", "Come si usa la breadboard?",
                    "Tutorial breadboard per principianti"]),
    ("circuiti", ["Video sui circuiti elettrici", "Tutorial circuiti",
                  "Cerca un video sui circuiti"]),
]

YOUTUBE_GENERIC = [
    "Cercami un video", "Mostrami un tutorial",
    "Apri YouTube", "Voglio guardare un video",
    "Cerca un video su questo argomento",
    "C'è un video che spiega questo?",
]

NOTEBOOK_PHRASES = [
    ("LED", ["Crea un taccuino sul LED", "Nuovo taccuino: LED",
             "Taccuino LED", "Salvami gli appunti sul LED"]),
    ("Resistenze", ["Crea un taccuino sulle resistenze",
                    "Taccuino resistenze", "Appunti resistenze"]),
    ("Circuiti", ["Crea un taccuino sui circuiti",
                  "Note circuiti", "Appunti circuiti"]),
    ("Esperimento", ["Taccuino per l'esperimento",
                     "Crea note sull'esperimento",
                     "Salvami gli appunti"]),
    ("Arduino", ["Taccuino Arduino", "Note Arduino",
                 "Crea un taccuino sul codice"]),
]

REMOVEWIRE_PHRASES = [
    "Togli il filo", "Rimuovi il cavo", "Elimina il collegamento",
    "Leva il filo rosso", "Togli quel filo", "Rimuovi il filo sbagliato",
    "Scollega", "Stacca il filo", "Disconnetti",
    "Togli il cavo tra LED e Arduino", "Rimuovi il collegamento sbagliato",
    "Elimina l'ultimo filo", "Leva l'ultimo cavo che ho messo",
]

def gen_place_phrases(comp_name, comp_alias):
    return [
        f"Metti {comp_alias}", f"Piazza {comp_alias}",
        f"Aggiungi {comp_alias}", f"Inserisci {comp_alias}",
        f"Mettimi {comp_alias}", f"Posiziona {comp_alias}",
        f"Voglio {comp_alias}", f"Mi serve {comp_alias}",
        f"Dammi {comp_alias}", f"Ho bisogno di {comp_alias}",
        f"Metti {comp_alias} sulla breadboard",
        f"Aggiungi {comp_alias} al circuito",
        f"Posizionami {comp_alias} qui",
        f"Costruisci con {comp_alias}",
        f"Manca {comp_alias}",
    ]

def gen_addwire_phrases(comp_name, comp_alias, pin, target):
    return [
        f"Collega {comp_alias} al pin {target}",
        f"Connetti {comp_alias} a {target}",
        f"Metti un filo da {comp_alias} a {target}",
        f"Cabla {comp_alias} su {target}",
        f"Wire {comp_alias} to {target}",
        f"Collega il {pin} di {comp_alias} al pin {target}",
        f"Filo da {comp_alias}.{pin} a {target}",
        f"Aggiungi un filo: {comp_alias} a {target}",
    ]

MULTI_COMPONENT_PHRASES = [
    ("Metti un LED e una resistenza", ["led", "resistor"]),
    ("Aggiungi LED, resistenza e pulsante", ["led", "resistor", "push-button"]),
    ("Costruisci un circuito con LED e buzzer", ["led", "buzzer-piezo"]),
    ("Metti 2 LED e un pulsante", ["led", "led", "push-button"]),
    ("Piazza un motore con un potenziometro", ["motor-dc", "potentiometer"]),
    ("Aggiungi un LED RGB con tre resistenze", ["rgb-led", "resistor", "resistor", "resistor"]),
    ("Metti un sensore di luce e un LED", ["photo-resistor", "led"]),
    ("Costruisci con diodo e condensatore", ["diode", "capacitor"]),
    ("Mettimi un buzzer e un pulsante", ["buzzer-piezo", "push-button"]),
    ("Aggiungi servo e potenziometro", ["servo", "potentiometer"]),
    ("Piazza un motore e un mosfet", ["motor-dc", "mosfet-n"]),
    ("Dammi un LED, una resistenza e un pulsante", ["led", "resistor", "push-button"]),
    ("Voglio costruire un semaforo con 3 LED", ["led", "led", "led"]),
    ("Metti sensore magnetico e buzzer", ["reed-switch", "buzzer-piezo"]),
    ("Aggiungi un LCD e un potenziometro", ["lcd16x2", "potentiometer"]),
    ("Fai un circuito con la lucina e la resistenza", ["led", "resistor"]),
    ("Mi servono un paio di LED e una resistenza per ciascuno", ["led", "led", "resistor", "resistor"]),
    ("Costruiscimi un circuito base", ["led", "resistor"]),
    ("Metti su il circuito del buzzer col pulsante", ["buzzer-piezo", "push-button"]),
    ("Circuito col motorino e il bottone", ["motor-dc", "push-button"]),
    ("Aggiungi tutto per il semaforo", ["led", "led", "led", "resistor", "resistor", "resistor"]),
    ("Fammi il circuito con la fotoresistenza e il LED", ["photo-resistor", "led"]),
    ("Metti batteria e multimetro", ["battery9v", "multimeter"]),
    ("Costruisci il circuito del servo con potenziometro", ["servo", "potentiometer"]),
]

OPENTAB_PHRASES = {
    "simulator": [
        "Apri il simulatore", "Torna al simulatore", "Vai al simulatore",
        "Mostrami il simulatore", "Portami al simulatore", "Simulatore!",
        "Torna alla breadboard", "Apri la breadboard",
    ],
    "manual": [
        "Apri il manuale", "Vai al manuale", "Mostrami il manuale",
        "Libro", "Apri il libro", "Leggi il manuale",
        "Fammi vedere le istruzioni", "Portami al manuale",
        "Voglio leggere il manuale", "Apri la guida",
    ],
    "video": [
        "Apri i video", "Vai ai video", "Video",
        "Mostrami i video", "Sezione video", "Tab video",
        "Voglio vedere i video",
    ],
    "canvas": [
        "Apri il canvas", "Vai al canvas", "Canvas",
        "Apri il foglio da disegno", "Disegno", "Apri il disegno",
        "Voglio disegnare", "Mostrami il canvas", "Lavagna",
    ],
    "editor": [
        "Apri l'editor", "Vai all'editor", "Editor",
        "Apri l'editor di codice", "Codice", "Mostrami il codice",
        "Apri Arduino IDE", "Editor Arduino", "Vai al codice",
        "Fammi scrivere il codice",
    ],
}

LOADEXP_PHRASES = [
    "Carica l'esperimento {exp}", "Apri {exp}", "Vai a {exp}",
    "Caricami {exp}", "Seleziona {exp}", "Mostra {exp}",
    "Voglio fare {exp}", "Fammi vedere {exp}",
    "Passiamo a {exp}", "Carichiamo {exp}",
    "Iniziamo {exp}", "Prossimo: {exp}",
]

OPENVOLUME_PHRASES = [
    "Vai al volume {n}", "Apri volume {n}", "Volume {n}",
    "Passa al volume {n}", "Cambia al volume {n}",
    "Mostrami il volume {n}", "Voglio il volume {n}",
    "Andiamo al volume {n}", "Carica il volume {n}",
    "Portami al vol {n}", "Vol {n}", "Libro {n}",
]

CODE_PHRASES = [
    "Scrivi il codice per blink", "Codice per far lampeggiare il LED",
    "Scrivi uno sketch per il buzzer", "Genera il codice per il servo",
    "Programma per leggere il sensore", "Codice per il motore",
    "Scrivi il codice per il display LCD", "Sketch per il potenziometro",
    "Scrivi il codice per accendere il LED sul pin 13",
    "Genera uno sketch che legge il valore analogico da A0",
    "Codice per far suonare il buzzer quando premo il pulsante",
    "Scrivi il codice per controllare il servo con il potenziometro",
    "Programma per il semaforo con 3 LED",
    "Sketch per leggere la fotoresistenza e accendere il LED",
    "Codice per il LED RGB che cambia colore",
    "Scrivi il codice per il motore DC con il MOSFET",
    "Fammi il codice", "Scrivimi il programma",
    "Mi fai il codice per questa cosa?", "Programmami questo",
    "Codice!", "Scrivi tu il codice che io non so",
    "Come si programma?", "Mi aiuti col codice?",
    "Mi serve il codice Arduino per far funzionare il circuito",
    "Genera il programma per far lampeggiare la lucina",
    "Modifica il codice", "Cambia il delay a 500",
    "Aggiungi un if nel codice", "Metti un loop nel programma",
    "Correggi il codice", "Il codice ha un errore, fixalo",
    "Write the code for blink", "Generate Arduino sketch",
    "Code for LED blink", "Sketch for servo control",
    "Fai un programma che accende 3 LED in sequenza",
    "Codice per il sensore di temperatura",
    "Sketch per il serial monitor", "Programma con delay e loop",
]

TUTOR_THEORY_PHRASES = [
    "Cos'è la corrente elettrica?", "Che differenza c'è tra tensione e corrente?",
    "Cosa sono i volt?", "Spiega gli ampere", "Cos'è la resistenza?",
    "Legge di Ohm", "Spiegami la legge di Ohm", "Come funziona un circuito?",
    "Cos'è un circuito chiuso?", "Cos'è un circuito aperto?",
    "Differenza tra serie e parallelo", "Cos'è il cortocircuito?",
    "Perché serve la resistenza col LED?", "Cos'è la potenza elettrica?",
    "Cosa misura il multimetro?", "Cos'è la corrente continua?",
    "Differenza tra AC e DC", "Cos'è la frequenza?",
    "Come funziona un LED?", "Cos'è un diodo?", "A cosa serve il condensatore?",
    "Come funziona il potenziometro?", "Cos'è un transistor?",
    "A cosa serve il MOSFET?", "Come funziona un buzzer?",
    "Cos'è una fotoresistenza?", "Come funziona il servo?",
    "A cosa serve il reed switch?", "Cos'è un fototransistor?",
    "Come si usa il display LCD?", "A cosa serve la breadboard?",
    "Cos'è Arduino?", "Come funziona Arduino?", "Cos'è un pin digitale?",
    "Differenza tra pin digitale e analogico", "Cos'è il PWM?",
    "A cosa serve analogRead?", "Come funziona digitalWrite?",
    "Cos'è il Serial Monitor?", "Cos'è uno sketch?",
    "Come funziona il setup e il loop?", "Cos'è una libreria Arduino?",
    "Cos'è un pull-up?", "Cos'è un pull-down?",
    "Cos'è il debouncing?", "Cos'è la legge di Kirchhoff?",
    "Come funziona un ponte H?", "Cos'è il duty cycle?",
    "Cos'è il divisore di tensione?", "Cos'è un filtro passa-basso?",
    "Cosa succede se metto il LED al contrario?",
    "Perché il buzzer non suona?", "Come calcolo la resistenza giusta?",
    "Che cos'è la corrente alternata?", "Come si misura la tensione?",
    "Perché i fili hanno colori diversi?", "Cos'è un semiconduttore?",
    "Come funziona un sensore?", "Cos'è la ground?",
    "Perché servono 5 volt?", "Cos'è il Vin?",
]

TUTOR_GREETINGS = [
    "Ciao!", "Ciao Galileo!", "Buongiorno!", "Hey!", "Ehi!",
    "Salve!", "Buonasera!", "Hola!", "Hello!", "Hi!",
    "Come stai?", "Tutto bene?", "Che si fa?",
    "Eccomi!", "Sono pronto!", "Ci sei?",
    "Galileo!", "Maestro!", "Prof!",
    "Yo!", "Bella!", "Weeee!", "Sup?",
    "Buondì!", "Ehilà!", "Eccomi qua!",
]

TUTOR_OFFTOPIC = [
    "Che tempo fa?", "Raccontami una barzelletta",
    "Chi ti ha creato?", "Sei un robot?",
    "Quanto fa 2+2?", "Di che colore è il cielo?",
    "Mi racconti una storia?", "Che ore sono?",
    "Ti piace la pizza?", "Qual è il tuo colore preferito?",
    "Come ti chiami?", "Quanti anni hai?",
    "Sai giocare a scacchi?", "Cos'è l'intelligenza artificiale?",
    "Parlami di te", "Che cosa sei?",
    "Mi aiuti con i compiti di matematica?",
    "Sai parlare inglese?", "Dimmi qualcosa di interessante",
    "Chi è il presidente?", "Conosci Minecraft?",
    "Ti piace la musica?", "Puoi cantare?",
]

TUTOR_EXPLAIN_EXPERIMENT = [
    "Spiegami questo esperimento", "Cosa devo fare qui?",
    "Non capisco l'obiettivo", "Come funziona questo esperimento?",
    "Qual è lo scopo di questo circuito?",
    "Mi spieghi cosa succede?",
    "Perché abbiamo messo questi componenti?",
    "Cosa imparo da questo esperimento?",
    "Non ho capito, me lo rispieghi?",
    "Puoi ripetere la spiegazione?",
]

TUTOR_HELP_GENERIC = [
    "Aiuto!", "Help!", "Non capisco", "Sono confuso",
    "Mi sono perso", "Non so cosa fare", "Aiutami",
    "Come si fa?", "Cosa devo fare adesso?",
    "Sono bloccato", "Non riesco ad andare avanti",
    "Mi puoi aiutare?", "Ho bisogno di aiuto",
]

VISION_PHRASES = [
    "Guarda il mio circuito", "Controlla quello che ho fatto",
    "Guarda la breadboard", "Analizza il mio lavoro",
    "Vedi se è giusto", "Controlla se ho montato bene",
    "Guarda se il circuito è corretto", "Dai un'occhiata",
    "Controlla il mio circuito", "Verifica il montaggio",
    "È giusto così?", "Ho fatto bene?",
    "Dimmi se va bene", "Guarda lo screenshot",
    "Analizza questa foto", "Che vedi?", "Cosa c'è qui?",
    "Com'è venuto?", "Che ne pensi?", "Ti piace?",
    "Va bene così?", "Ho sbagliato qualcosa?",
    "Controlla se è tutto a posto", "Check!",
    "Fai un controllo visivo", "Occhiata rapida",
    "Vedi tu se è giusto", "Giudica il mio lavoro",
    "Guarda il mio disegno", "Analizza il canvas",
    "Controlla cosa ho disegnato", "Vedi il mio schema",
    "Ti mando una foto", "Ecco il mio circuito",
    "Guarda qui", "Vedi questo",
    "Fammi un check", "Dai un occhio",
]

# === EDGE CASES ===
EDGE_CASES = [
    {"input": "Il LED non si accende", "intent": "tutor", "entities": ["led"],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Problema tecnico: il LED non si accende. Aiuta a diagnosticare."},
    {"input": "La resistenza è troppo alta?", "intent": "tutor", "entities": ["resistor"],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Domanda sul valore della resistenza."},
    {"input": "Come si collega il LED?", "intent": "tutor", "entities": ["led"],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Domanda su come collegare un LED. Spiegazione educativa."},
    {"input": "Come funziona il codice?", "intent": "tutor", "entities": [],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Domanda generica sul codice Arduino."},
    {"input": "Cosa fa analogRead?", "intent": "tutor", "entities": [],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Domanda su funzione Arduino analogRead."},
    {"input": "Non avviare", "intent": "action", "entities": [],
     "actions": ["[AZIONE:pause]"], "needs_llm": False,
     "response": "OK, non avvio.", "llm_hint": None},
    {"input": "Se è tutto collegato, avvia", "intent": "action", "entities": [],
     "actions": ["[AZIONE:play]"], "needs_llm": False,
     "response": "Avvio la simulazione!", "llm_hint": None},
    {"input": "Toglilo", "intent": "action", "entities": [],
     "actions": ["[AZIONE:removecomponent:led]"], "needs_llm": False,
     "response": "Rimuovo il componente.", "llm_hint": None},
    {"input": "Spostalo a destra", "intent": "action", "entities": [],
     "actions": ["[AZIONE:movecomponent:led:destra]"], "needs_llm": False,
     "response": "Sposto a destra.", "llm_hint": None},
    {"input": "Metti un LED e poi avvia", "intent": "circuit", "entities": ["led"],
     "actions": ["[INTENT:place_and_wire]", "[AZIONE:play]"], "needs_llm": False,
     "response": "Piazzo il LED e avvio.", "llm_hint": None},
    {"input": "Resetta e poi carica v1-cap5-esp1", "intent": "action", "entities": ["v1-cap5-esp1"],
     "actions": ["[AZIONE:reset]", "[AZIONE:loadexp:v1-cap5-esp1]"], "needs_llm": False,
     "response": "Resetto e carico.", "llm_hint": None},
    {"input": "Cancella tutto e metti un buzzer", "intent": "action", "entities": ["buzzer-piezo"],
     "actions": ["[AZIONE:clearall]", "[INTENT:place_and_wire]"], "needs_llm": False,
     "response": "Cancello e piazzo il buzzer.", "llm_hint": None},
    {"input": "daje", "intent": "action", "entities": [],
     "actions": ["[AZIONE:play]"], "needs_llm": False,
     "response": "Simulazione avviata! ▶", "llm_hint": None},
    {"input": "boh", "intent": "tutor", "entities": [],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Lo studente è confuso. Chiedi cosa non ha capito."},
    {"input": "nn capisco", "intent": "tutor", "entities": [],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Lo studente non capisce. Chiedi cosa vuole approfondire."},
    {"input": "LED", "intent": "tutor", "entities": ["led"],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Lo studente ha detto solo 'LED'. Chiedi cosa vuole sapere."},
    {"input": "▶️", "intent": "action", "entities": [],
     "actions": ["[AZIONE:play]"], "needs_llm": False,
     "response": "Simulazione avviata! ▶", "llm_hint": None},
    {"input": "⏸️", "intent": "action", "entities": [],
     "actions": ["[AZIONE:pause]"], "needs_llm": False,
     "response": "In pausa. ⏸", "llm_hint": None},
    {"input": "AVVIA IL CIRCUITO", "intent": "action", "entities": [],
     "actions": ["[AZIONE:play]"], "needs_llm": False,
     "response": "Simulazione avviata! ▶", "llm_hint": None},
    {"input": "METTI UN LED", "intent": "circuit", "entities": ["led"],
     "actions": ["[INTENT:place_and_wire]"], "needs_llm": False,
     "response": "Piazzo il LED.", "llm_hint": None},
    {"input": "Ferma e spiegami cosa è successo", "intent": "action", "entities": [],
     "actions": ["[AZIONE:pause]"], "needs_llm": True,
     "response": None, "llm_hint": "Lo studente vuole fermare e capire. Pausa + spiegazione."},
    {"input": "Ho premuto il pulsante ma non succede niente", "intent": "tutor", "entities": ["push-button"],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Problema: pulsante premuto senza effetto. Diagnostica."},
    {"input": "Perché il motore gira piano?", "intent": "tutor", "entities": ["motor-dc"],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Domanda sulla velocità del motore. Spiega PWM e tensione."},
    {"input": "ok", "intent": "tutor", "entities": [],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Risposta generica 'ok'. Chiedi se vuole continuare."},
    {"input": "grazie", "intent": "tutor", "entities": [],
     "actions": [], "needs_llm": True, "response": None,
     "llm_hint": "Ringraziamento. Rispondi cordialmente."},
    {"input": "non va", "intent": "action", "entities": [],
     "actions": ["[AZIONE:diagnose]"], "needs_llm": False,
     "response": "Controllo il circuito...", "llm_hint": None},
    {"input": "è sbagliato", "intent": "action", "entities": [],
     "actions": ["[AZIONE:diagnose]"], "needs_llm": False,
     "response": "Analizzo gli errori...", "llm_hint": None},
]

# ============================================================
# AUGMENTATION SYSTEM (per ridurre duplicati)
# ============================================================

PREFIXES = [
    "", "", "", "", "",  # 50% nessun prefisso
    "Galileo, ", "Ehi, ", "Per favore ", "Senti, ",
    "Scusa, ", "Ok ", "Allora, ", "Dai, ",
    "Ragazzi, ", "Prof, ", "Maestro, ", "Senti un po', ",
    "Mi puoi ", "Potresti ", "Fammi un favore: ",
    "Hey ", "Yo ", "Listen, ", "Aspetta, ",
    "Ecco, ", "Dunque, ", "Bene, ", "Va bene, ",
]

SUFFIXES = [
    "", "", "", "", "",  # 50% nessun suffisso
    " per favore", " dai", " grazie",
    " perfavore", " pls", " please",
    " va bene?", " ok?", "?", "!",
    " subito", " ora", " adesso",
    " quando puoi", " in fretta",
    " ti prego", " sii gentile",
    " che aspetti?", "...", " 🙏",
]

FILLER_WORDS = [
    "", "", "", "",  # 40% nessun filler
    "tipo ", "praticamente ", "diciamo ", "insomma ",
    "sai ", "cioè ", "ecco ", "in pratica ",
    "fondamentalmente ", "un po' ", "magari ",
]

def augment_phrase(phrase):
    """Aggiunge variazione casuale a una frase per ridurre duplicati."""
    result = phrase

    # 30% probabilità di aggiungere prefisso
    if random.random() < 0.3:
        prefix = random.choice(PREFIXES)
        if prefix:
            # Se la frase inizia con maiuscola e il prefisso finisce con ", "
            if prefix.endswith(", ") or prefix.endswith(": "):
                result = prefix + result[0].lower() + result[1:]
            else:
                result = prefix + result[0].lower() + result[1:] if random.random() < 0.5 else prefix + result

    # 15% probabilità di aggiungere filler - solo dopo verbo (posizione 2+)
    if random.random() < 0.15 and len(result.split()) > 3:
        filler = random.choice(FILLER_WORDS)
        if filler:
            words = result.split()
            pos = random.randint(2, min(3, len(words) - 1))
            words.insert(pos, filler.strip())
            result = " ".join(words)

    # 25% probabilità di aggiungere suffisso
    if random.random() < 0.25:
        suffix = random.choice(SUFFIXES)
        if suffix:
            # Rimuovi punteggiatura finale prima di aggiungere suffisso
            result = result.rstrip("!?.…") + suffix

    # 10% probabilità di variazione case
    r = random.random()
    if r < 0.03:
        result = result.upper()
    elif r < 0.06:
        result = result.lower()
    elif r < 0.10:
        # Random typo: duplica una lettera
        if len(result) > 3:
            pos = random.randint(1, len(result) - 2)
            result = result[:pos] + result[pos] + result[pos:]

    return result

# ============================================================
# EVAL SET EXCLUSION (previeni data leakage)
# ============================================================

def load_eval_inputs():
    """Carica gli input dell'evaluation suite per escluderli dal training."""
    eval_path = Path(__file__).parent.parent / "datasets" / "evaluation-suite.jsonl"
    inputs = set()
    if eval_path.exists():
        with open(eval_path) as f:
            for line in f:
                if line.strip():
                    d = json.loads(line)
                    inputs.add(d.get("input", "").strip().lower())
    return inputs

EVAL_INPUTS = load_eval_inputs()

def is_eval_duplicate(msg):
    """Controlla se il messaggio è troppo simile a un input dell'eval suite."""
    clean = msg.strip().lower()
    # Exact match
    if clean in EVAL_INPUTS:
        return True
    # Fuzzy: remove punctuation and check
    clean_no_punct = re.sub(r'[^\w\s]', '', clean).strip()
    for ev in EVAL_INPUTS:
        ev_no_punct = re.sub(r'[^\w\s]', '', ev).strip()
        if clean_no_punct == ev_no_punct:
            return True
    return False

# ============================================================
# GENERAZIONE CONTESTO
# ============================================================

def random_context():
    tab = random.choice(TABS)
    vol = random.randint(1, 3)
    n_comps = random.randint(0, 5)
    comps = []
    for i in range(n_comps):
        c = random.choice(PLACEABLE)
        idx = comps.count(c) + 1
        comp_id = f"{c.replace('-', '')}{idx}" if '-' in c else f"{c}{idx}"
        comps.append(comp_id)
    n_wires = random.randint(0, min(n_comps * 2, 8))
    exp = random.choice(EXPERIMENTS) if random.random() < 0.3 else None
    ctx = f"[CONTESTO]\ntab: {tab}\n"
    if exp:
        ctx += f"esperimento: {exp}\n"
    ctx += f"componenti: [{', '.join(comps)}]\nfili: {n_wires}\nvolume_attivo: {vol}"
    return ctx

def context_with(tab=None, comps=None, vol=None, exp=None, wires=None):
    tab = tab or random.choice(TABS)
    vol = vol or random.randint(1, 3)
    comps = comps or []
    wires = wires if wires is not None else random.randint(0, 4)
    ctx = f"[CONTESTO]\ntab: {tab}\n"
    if exp:
        ctx += f"esperimento: {exp}\n"
    ctx += f"componenti: [{', '.join(comps)}]\nfili: {wires}\nvolume_attivo: {vol}"
    return ctx

# ============================================================
# GENERAZIONE ESEMPIO
# ============================================================

def make_example(user_msg, intent, entities, actions, needs_llm, response, llm_hint, ctx=None):
    if ctx is None:
        ctx = random_context()
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

# ============================================================
# GENERATORI PER CATEGORIA
# ============================================================

def gen_action_play(n):
    return [make_example(
        augment_phrase(random.choice(PLAY_PHRASES)), "action", [], ["[AZIONE:play]"], False,
        random.choice(["Simulazione avviata! ▶", "Avvio!", "Play! ▶", "Si parte!", "Via! ▶", "Partito!", "Simulazione in corso."]),
        None, context_with(tab="simulator")
    ) for _ in range(n)]

def gen_action_pause(n):
    return [make_example(
        augment_phrase(random.choice(PAUSE_PHRASES)), "action", [], ["[AZIONE:pause]"], False,
        random.choice(["Simulazione in pausa. ⏸", "Stop!", "Fermato.", "In pausa.", "Pausa. ⏸", "Simulazione fermata."]),
        None, context_with(tab="simulator")
    ) for _ in range(n)]

def gen_action_reset(n):
    return [make_example(
        augment_phrase(random.choice(RESET_PHRASES)), "action", [], ["[AZIONE:reset]"], False,
        random.choice(["Circuito resettato.", "Reset!", "Tutto dall'inizio.", "Ripristinato.", "Reset completato."]),
        None, context_with(tab="simulator")
    ) for _ in range(n)]

def gen_action_clearall(n):
    return [make_example(
        augment_phrase(random.choice(CLEARALL_PHRASES)), "action", [], ["[AZIONE:clearall]"], False,
        random.choice(["Breadboard svuotata!", "Tutto rimosso.", "Pulito!", "Sgomberato!", "Tutto via!"]),
        None, context_with(tab="simulator", comps=["led1", "resistor1"] if random.random() > 0.3 else [])
    ) for _ in range(n)]

def gen_action_compile(n):
    return [make_example(
        augment_phrase(random.choice(COMPILE_PHRASES)), "action", [], ["[AZIONE:compile]"], False,
        random.choice(["Compilazione avviata.", "Compilo...", "Build!", "Verifico il codice.", "Compilazione in corso..."]),
        None, context_with(tab=random.choice(["simulator", "editor"]))
    ) for _ in range(n)]

def gen_action_quiz(n):
    return [make_example(
        augment_phrase(random.choice(QUIZ_PHRASES)), "action", [], ["[AZIONE:quiz]"], False,
        random.choice(["Quiz in arrivo!", "Ecco il quiz!", "Vediamo cosa sai!", "Prepara le risposte!", "Quiz time!"]),
        None
    ) for _ in range(n)]

def gen_action_diagnose(n):
    return [make_example(
        augment_phrase(random.choice(DIAGNOSE_PHRASES)), "action", [], ["[AZIONE:diagnose]"], False,
        random.choice(["Analizzo il circuito...", "Cerco il problema.", "Controllo...", "Diagnostica in corso.", "Verifico..."]),
        None, context_with(tab="simulator", comps=["led1", "resistor1"])
    ) for _ in range(n)]

def gen_action_highlight(n):
    results = []
    for _ in range(n):
        comp = random.choice(list(COMPONENT_ALIASES.keys()))
        alias = random.choice(COMPONENT_ALIASES[comp])
        phrases = gen_highlight_phrases(comp, alias)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "action", [comp], [f"[AZIONE:highlight:{comp}]"], False,
            random.choice([f"Evidenzio {alias}.", f"Ecco {alias}!", f"{alias} evidenziato."]),
            None, context_with(tab="simulator", comps=[f"{comp.replace('-','')}{1}"])
        ))
    return results

def gen_action_interact(n):
    results = []
    for _ in range(n):
        comp = random.choice(["push-button", "potentiometer"])
        alias = random.choice(COMPONENT_ALIASES[comp])
        phrases = gen_interact_phrases(comp, alias)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "action", [comp], [f"[AZIONE:interact:{comp}]"], False,
            random.choice([f"Interagisco con {alias}.", f"Premo {alias}.", f"Fatto!"]),
            None, context_with(tab="simulator", comps=[f"{comp.replace('-','')}{1}"])
        ))
    return results

def gen_action_measure(n):
    results = []
    measurable = ["led", "resistor", "buzzer-piezo", "capacitor", "potentiometer", "motor-dc"]
    for _ in range(n):
        comp = random.choice(measurable)
        alias = random.choice(COMPONENT_ALIASES[comp])
        phrases = gen_measure_phrases(comp, alias)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "action", [comp], [f"[AZIONE:measure:{comp}]"], False,
            random.choice([f"Misuro {alias}.", f"Ecco i valori di {alias}.", f"Lettura di {alias}."]),
            None, context_with(tab="simulator", comps=[f"{comp.replace('-','')}{1}", "multimeter1"])
        ))
    return results

def gen_action_remove(n):
    results = []
    for _ in range(n):
        comp = random.choice(PLACEABLE[:10])
        alias = random.choice(COMPONENT_ALIASES[comp])
        phrases = gen_remove_phrases(comp, alias)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "action", [comp], [f"[AZIONE:removecomponent:{comp}]"], False,
            random.choice([f"Rimuovo {alias}.", f"{alias} rimosso.", f"Via {alias}!"]),
            None, context_with(tab="simulator", comps=[f"{comp.replace('-','')}{1}"])
        ))
    return results

def gen_action_move(n):
    results = []
    dir_map = {"su": "su", "giù": "giu", "destra": "destra", "sinistra": "sinistra",
               "a destra": "destra", "a sinistra": "sinistra", "in alto": "su",
               "in basso": "giu", "più su": "su", "più giù": "giu"}
    for _ in range(n):
        comp = random.choice(PLACEABLE[:10])
        alias = random.choice(COMPONENT_ALIASES[comp])
        phrases = gen_move_phrases(comp, alias)
        phrase = random.choice(phrases)
        direction = "destra"
        for d_text, d_val in dir_map.items():
            if d_text in phrase.lower():
                direction = d_val
                break
        results.append(make_example(
            augment_phrase(phrase), "action", [comp], [f"[AZIONE:movecomponent:{comp}:{direction}]"], False,
            random.choice([f"Sposto {alias}.", f"{alias} spostato.", f"Fatto, {alias} mosso."]),
            None, context_with(tab="simulator", comps=[f"{comp.replace('-','')}{1}"])
        ))
    return results

def gen_action_setvalue(n):
    results = []
    for _ in range(n):
        comp = random.choice(["resistor", "capacitor", "potentiometer"])
        alias = random.choice(COMPONENT_ALIASES[comp])
        # Pick value FIRST, then generate phrase WITH that value
        if comp == "resistor":
            value = random.choice(["100", "220", "330", "470", "1k", "1000", "4.7k", "10k"])
            phrases = [
                f"Metti {alias} a {value} ohm", f"Imposta {alias} a {value}",
                f"Cambia {alias} a {value} Ω", f"Resistenza da {value} ohm",
                f"Voglio {alias} da {value}", f"Setta {alias} a {value} ohm",
            ]
        elif comp == "capacitor":
            value = random.choice(["100uF", "10uF", "1uF", "470uF", "47uF"])
            phrases = [
                f"Metti {alias} a {value}", f"Imposta {alias} a {value}",
                f"Cambia {alias} a {value}", f"Condensatore da {value}",
            ]
        elif comp == "potentiometer":
            value = random.choice(["50%", "0%", "100%", "25%", "75%"])
            phrases = [
                f"Metti {alias} al {value}", f"Imposta {alias} a {value}",
                f"Regola {alias} a {value}", f"Porta {alias} al {value}",
            ]
        else:
            continue
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "action", [comp], [f"[AZIONE:setvalue:{comp}:{value}]"], False,
            random.choice([f"Imposto a {value}.", f"Valore: {value}.", f"Impostato {value}."]),
            None, context_with(tab="simulator", comps=[f"{comp}{1}"])
        ))
    return results

def gen_action_youtube(n):
    results = []
    for _ in range(n):
        if random.random() < 0.3:
            phrase = random.choice(YOUTUBE_GENERIC)
            query = "tutorial elettronica"
        else:
            topic, phrases = random.choice(YOUTUBE_PHRASES)
            phrase = random.choice(phrases)
            query = f"{topic} tutorial"
        results.append(make_example(
            augment_phrase(phrase), "action", [], [f"[AZIONE:youtube:{query}]"], False,
            random.choice(["Cerco un video...", "Ecco un video!", "Video in arrivo."]),
            None
        ))
    return results

def gen_action_notebook(n):
    results = []
    for _ in range(n):
        title, phrases = random.choice(NOTEBOOK_PHRASES)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "action", [], [f"[AZIONE:createnotebook:{title}]"], False,
            random.choice([f"Creo il taccuino '{title}'.", f"Taccuino '{title}' creato.", f"Ecco il taccuino!"]),
            None
        ))
    return results

def gen_action_removewire(n):
    return [make_example(
        augment_phrase(random.choice(REMOVEWIRE_PHRASES)), "action", [], ["[AZIONE:removewire:ultimo]"], False,
        random.choice(["Filo rimosso.", "Cavo tolto.", "Collegamento eliminato."]),
        None, context_with(tab="simulator", comps=["led1", "resistor1"], wires=3)
    ) for _ in range(n)]

def gen_circuit_place(n):
    results = []
    for _ in range(n):
        comp = random.choice(PLACEABLE)
        alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
        phrases = gen_place_phrases(comp, alias)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "circuit", [comp], ["[INTENT:place_and_wire]"], False,
            random.choice([f"Piazzo {alias}.", f"Aggiungo {alias}.", f"Ecco {alias}!", f"{alias} aggiunto."]),
            None, context_with(tab="simulator")
        ))
    return results

def gen_circuit_addwire(n):
    results = []
    for _ in range(n):
        comp = random.choice(list(PIN_MAP.keys()))
        alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
        pin = random.choice(PIN_MAP[comp])
        target = random.choice(WING_PINS + DIGITAL_PINS + ANALOG_PINS)
        phrases = gen_addwire_phrases(comp, alias, pin, target)
        results.append(make_example(
            augment_phrase(random.choice(phrases)), "circuit", [comp, target],
            [f"[AZIONE:addwire:{comp}.{pin}:{target}]"], False,
            random.choice([f"Collego {alias} a {target}.", f"Filo collegato.", f"Collegamento fatto."]),
            None, context_with(tab="simulator", comps=[f"{comp.replace('-','')}{1}"])
        ))
    return results

def gen_circuit_multi(n):
    results = []
    for _ in range(n):
        phrase, comps = random.choice(MULTI_COMPONENT_PHRASES)
        unique_comps = list(set(comps))
        results.append(make_example(
            augment_phrase(phrase), "circuit", unique_comps, ["[INTENT:place_and_wire]"], False,
            random.choice(["Piazzo i componenti.", "Costruisco il circuito.", "Aggiungo tutto."]),
            None, context_with(tab="simulator")
        ))
    return results

def gen_nav_opentab(n):
    results = []
    for _ in range(n):
        tab = random.choice(list(OPENTAB_PHRASES.keys()))
        results.append(make_example(
            augment_phrase(random.choice(OPENTAB_PHRASES[tab])), "navigation", [],
            [f"[AZIONE:opentab:{tab}]"], False,
            random.choice([f"Apro {tab}.", f"Ecco {tab}.", f"Tab {tab} aperto."]),
            None
        ))
    return results

def gen_nav_loadexp(n):
    results = []
    for _ in range(n):
        exp = random.choice(EXPERIMENTS)
        template = random.choice(LOADEXP_PHRASES)
        results.append(make_example(
            augment_phrase(template.format(exp=exp)), "navigation", [exp],
            [f"[AZIONE:loadexp:{exp}]"], False,
            random.choice([f"Carico {exp}.", f"Esperimento {exp} caricato.", f"Ecco {exp}."]),
            None
        ))
    return results

def gen_nav_openvolume(n):
    results = []
    for _ in range(n):
        vol = random.randint(1, 3)
        template = random.choice(OPENVOLUME_PHRASES)
        results.append(make_example(
            augment_phrase(template.format(n=vol)), "navigation", [str(vol)],
            [f"[AZIONE:openvolume:{vol}]"], False,
            random.choice([f"Apro Volume {vol}.", f"Volume {vol} selezionato.", f"Ecco il Volume {vol}."]),
            None
        ))
    return results

def gen_code(n):
    return [make_example(
        augment_phrase(random.choice(CODE_PHRASES)), "code", [], [], True, None,
        random.choice(["Richiesta di codice Arduino. Genera sketch con setup(), loop(), commenti.",
                       "Lo studente vuole codice. Genera sketch Arduino.",
                       "Genera codice Arduino adatto all'esperimento."]),
        context_with(tab=random.choice(["simulator", "editor"]))
    ) for _ in range(n)]

def gen_tutor_theory(n):
    results = []
    for _ in range(n):
        phrase = augment_phrase(random.choice(TUTOR_THEORY_PHRASES))
        entities = []
        for comp in COMPONENT_ALIASES:
            if any(alias.lower() in phrase.lower() for alias in COMPONENT_ALIASES[comp]):
                entities.append(comp)
                break
        results.append(make_example(
            phrase, "tutor", entities, [], True, None,
            f"Domanda teorica. Rispondi semplice per ragazzi 8-14 anni."
        ))
    return results

def gen_tutor_greetings(n):
    return [make_example(
        augment_phrase(random.choice(TUTOR_GREETINGS)), "tutor", [], [], True, None,
        random.choice(["Saluto. Rispondi e chiedi come aiutare.",
                       "Lo studente saluta. Saluta e proponi attività.",
                       "Saluto generico. Rispondi con entusiasmo."])
    ) for _ in range(n)]

def gen_tutor_offtopic(n):
    results = []
    for _ in range(n):
        phrase = augment_phrase(random.choice(TUTOR_OFFTOPIC))
        results.append(make_example(
            phrase, "tutor", [], [], True, None,
            "Off-topic. Rispondi brevemente, riporta sui circuiti."
        ))
    return results

def gen_tutor_explain(n):
    results = []
    for _ in range(n):
        exp = random.choice(EXPERIMENTS)
        results.append(make_example(
            augment_phrase(random.choice(TUTOR_EXPLAIN_EXPERIMENT)), "tutor", [], [], True, None,
            f"Spiegazione esperimento {exp}. Descrivi obiettivo e concetti.",
            context_with(tab="simulator", exp=exp)
        ))
    return results

def gen_tutor_help(n):
    return [make_example(
        augment_phrase(random.choice(TUTOR_HELP_GENERIC)), "tutor", [], [], True, None,
        random.choice(["Lo studente è in difficoltà. Chiedi cosa non ha capito.",
                       "Richiesta di aiuto generico. Guida lo studente.",
                       "Lo studente è bloccato. Offri assistenza."])
    ) for _ in range(n)]

def gen_vision(n):
    return [make_example(
        augment_phrase(random.choice(VISION_PHRASES)), "vision", [], [], True, None,
        random.choice(["Analisi visiva richiesta. Cattura screenshot.",
                       "Lo studente chiede di guardare il lavoro.",
                       "Richiesta vision. Controlla montaggio.",
                       "Analizza visivamente il circuito dello studente."]),
        context_with(tab=random.choice(["simulator", "canvas"]),
                     comps=["led1", "resistor1"] if random.random() > 0.3 else [])
    ) for _ in range(n)]

def gen_edge_cases(n):
    results = []
    for _ in range(n):
        ec = random.choice(EDGE_CASES)
        results.append(make_example(
            augment_phrase(ec["input"]), ec["intent"], ec["entities"], ec["actions"],
            ec["needs_llm"], ec["response"], ec["llm_hint"],
            context_with(tab="simulator", comps=["led1", "resistor1"] if random.random() > 0.4 else [])
        ))
    return results

# ============================================================
# DISTRIBUZIONE (bilanciata per debolezze modello base)
# ============================================================

GENERATORS = {
    "action_play":       (gen_action_play,       0.08),
    "action_pause":      (gen_action_pause,      0.06),
    "action_reset":      (gen_action_reset,      0.04),
    "action_clearall":   (gen_action_clearall,   0.04),
    "action_compile":    (gen_action_compile,    0.03),
    "action_quiz":       (gen_action_quiz,       0.03),
    "action_diagnose":   (gen_action_diagnose,   0.03),
    "action_highlight":  (gen_action_highlight,  0.04),
    "action_interact":   (gen_action_interact,   0.03),
    "action_measure":    (gen_action_measure,    0.03),
    "action_remove":     (gen_action_remove,     0.03),
    "action_move":       (gen_action_move,       0.02),
    "action_setvalue":   (gen_action_setvalue,   0.02),
    "action_youtube":    (gen_action_youtube,     0.02),
    "action_notebook":   (gen_action_notebook,   0.01),
    "action_removewire": (gen_action_removewire, 0.01),
    "circuit_place":     (gen_circuit_place,     0.10),
    "circuit_addwire":   (gen_circuit_addwire,   0.06),
    "circuit_multi":     (gen_circuit_multi,     0.04),
    "nav_opentab":       (gen_nav_opentab,       0.04),
    "nav_loadexp":       (gen_nav_loadexp,       0.04),
    "nav_openvolume":    (gen_nav_openvolume,    0.02),
    "code":              (gen_code,              0.04),
    "tutor_theory":      (gen_tutor_theory,      0.04),
    "tutor_greetings":   (gen_tutor_greetings,   0.02),
    "tutor_offtopic":    (gen_tutor_offtopic,    0.02),
    "tutor_explain":     (gen_tutor_explain,     0.02),
    "tutor_help":        (gen_tutor_help,        0.01),
    "vision":            (gen_vision,            0.04),
    "edge_cases":        (gen_edge_cases,        0.04),
}

# ============================================================
# MAIN
# ============================================================

def extract_message(ex):
    """Estrae il messaggio [MESSAGGIO] dall'esempio."""
    user = ex["messages"][1]["content"]
    return user.split("[MESSAGGIO]\n")[-1].strip()

def generate_dataset(total, seed=None):
    if seed is not None:
        random.seed(seed)

    # Generate with 30% overflow to account for dedup
    target = int(total * 1.3)
    all_ex = []
    for name, (fn, ratio) in GENERATORS.items():
        count = max(1, int(target * ratio))
        exs = fn(count)
        all_ex.extend(exs)
        print(f"  {name}: {len(exs)}")

    # Dedup by message content + eval exclusion
    seen_msgs = set()
    deduped = []
    eval_excluded = 0
    dupes_removed = 0
    for ex in all_ex:
        msg = extract_message(ex).lower().strip()
        if is_eval_duplicate(msg):
            eval_excluded += 1
            continue
        if msg in seen_msgs:
            dupes_removed += 1
            continue
        seen_msgs.add(msg)
        deduped.append(ex)

    print(f"\n  Dedup: {dupes_removed} duplicates removed")
    print(f"  Eval exclusion: {eval_excluded} eval-overlapping removed")
    print(f"  After dedup: {len(deduped)}")

    # If we're short after dedup, generate more with higher augmentation
    attempts = 0
    while len(deduped) < total and attempts < 20:
        attempts += 1
        fill_fns = [gen_action_play, gen_action_pause, gen_action_clearall,
                    gen_circuit_place, gen_circuit_addwire, gen_action_highlight,
                    gen_action_measure, gen_action_remove, gen_vision, gen_code,
                    gen_tutor_theory, gen_nav_loadexp, gen_action_interact]
        batch = random.choice(fill_fns)(total - len(deduped))
        for ex in batch:
            msg = extract_message(ex).lower().strip()
            if msg not in seen_msgs and not is_eval_duplicate(msg):
                seen_msgs.add(msg)
                deduped.append(ex)
            if len(deduped) >= total:
                break

    deduped = deduped[:total]
    random.shuffle(deduped)
    print(f"  Final: {len(deduped)}")
    return deduped

def validate_example(ex, idx):
    errors = []
    msgs = ex.get("messages", [])
    if len(msgs) != 3:
        errors.append(f"#{idx}: expected 3 messages, got {len(msgs)}")
        return errors
    try:
        resp = json.loads(msgs[2]["content"])
        if resp["intent"] not in ["action", "circuit", "code", "tutor", "vision", "navigation"]:
            errors.append(f"#{idx}: invalid intent '{resp['intent']}'")
    except json.JSONDecodeError as e:
        errors.append(f"#{idx}: invalid JSON: {e}")
    return errors

def show_stats(filepath):
    intents = {}
    action_tags = {}
    needs_llm_t = needs_llm_f = 0
    total = 0
    with open(filepath) as f:
        for line in f:
            d = json.loads(line)
            resp = json.loads(d["messages"][2]["content"])
            i = resp["intent"]
            intents[i] = intents.get(i, 0) + 1
            total += 1
            if resp["needs_llm"]:
                needs_llm_t += 1
            else:
                needs_llm_f += 1
            for a in resp["actions"]:
                tag = a.split(":")[0] + ":" + a.split(":")[1].rstrip("]") if ":" in a else a
                action_tags[tag] = action_tags.get(tag, 0) + 1

    print(f"\n{'='*55}")
    print(f"DATASET STATS: {filepath}")
    print(f"{'='*55}")
    print(f"Total: {total}")
    print(f"\nIntent distribution:")
    for k, v in sorted(intents.items(), key=lambda x: -x[1]):
        bar = "█" * int(v / total * 50)
        print(f"  {k:12s}: {v:5d} ({v/total*100:5.1f}%) {bar}")
    print(f"\nneeds_llm: True={needs_llm_t} ({needs_llm_t/total*100:.1f}%), False={needs_llm_f} ({needs_llm_f/total*100:.1f}%)")
    print(f"\nTop 20 action tags:")
    for k, v in sorted(action_tags.items(), key=lambda x: -x[1])[:20]:
        print(f"  {k:40s}: {v:5d}")

def main():
    parser = argparse.ArgumentParser(description="Galileo Brain Dataset Generator v3")
    parser.add_argument("--count", type=int, default=5000)
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument("--append", action="store_true")
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("--stats", action="store_true")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()

    script_dir = Path(__file__).parent.parent
    output_path = args.output or str(script_dir / "datasets" / "galileo-brain-v3.jsonl")

    if args.stats:
        show_stats(output_path) if os.path.exists(output_path) else print(f"Not found: {output_path}")
        return

    if args.validate:
        if not os.path.exists(output_path):
            print(f"Not found: {output_path}")
            return
        errors = []
        with open(output_path) as f:
            for idx, line in enumerate(f):
                errors.extend(validate_example(json.loads(line), idx))
        print(f"{'FAIL: ' + str(len(errors)) + ' errors' if errors else f'PASS: {idx+1} examples ✅'}")
        for e in errors[:20]:
            print(f"  {e}")
        return

    print(f"\n{'='*55}")
    print(f"GALILEO BRAIN — Dataset Generator v3")
    print(f"{'='*55}")
    print(f"Target: {args.count} | Seed: {args.seed or 'random'} | Mode: {'append' if args.append else 'overwrite'}")
    print(f"Output: {output_path}")
    print(f"{'='*55}\n")

    examples = generate_dataset(args.count, args.seed)
    print(f"\nGenerated: {len(examples)}")

    # Validate
    all_errors = []
    for idx, ex in enumerate(examples):
        all_errors.extend(validate_example(ex, idx))
    print(f"Validation: {'FAIL ' + str(len(all_errors)) if all_errors else '✅ All valid'}")

    # Write
    mode = "a" if args.append else "w"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, mode) as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\n✅ Written: {output_path} ({size_mb:.1f} MB)")
    show_stats(output_path)

    print(f"\n{'='*55}")
    print("NEXT STEPS:")
    print(f"{'='*55}")
    print("1. Upload to Colab per fine-tuning")
    print("2. python3 scripts/generate-brain-dataset.py --count 10000  # per espandere")
    print("3. python3 scripts/generate-brain-dataset.py --append --count 5000  # aggiungi")
    print("4. python3 scripts/generate-brain-dataset.py --stats  # statistiche")
    print("5. python3 scripts/generate-brain-dataset.py --validate  # valida formato")

if __name__ == "__main__":
    main()
