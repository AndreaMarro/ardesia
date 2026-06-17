#!/usr/bin/env python3
"""
Galileo Brain v6 — "Onnipotenza" Dataset Generator
====================================================
Genera dataset JSONL per fine-tuning Qwen3-4B come router di messaggi
per ELAB Tutor, un simulatore educativo di elettronica per ragazzi 10-14 anni.

5 layer di generazione:
  1. REPLAY    — riformulazioni fedeli dal dataset v3/20k esistente
  2. ACTION    — tutte le 42 azioni dirette con varianti
  3. CONTEXT   — esempi context-aware (tab, esperimento, stato simulazione)
  4. ADVERSARIAL — negazioni, off-topic, ambiguita', edge case
  5. EVAL      — set di valutazione bilanciato

Uso:
    python3 scripts/generate-brain-v6.py --layer all                  # genera tutto
    python3 scripts/generate-brain-v6.py --layer action --count 5000  # solo azioni
    python3 scripts/generate-brain-v6.py --stats                      # mostra statistiche
    python3 scripts/generate-brain-v6.py --validate                   # valida formato
    python3 scripts/generate-brain-v6.py --eval                       # genera eval set

Output: datasets/galileo-brain-v6.jsonl (o --output PATH)
"""

import json
import random
import argparse
import os
import sys
import re
import hashlib
from pathlib import Path
from datetime import datetime
from collections import Counter

# ============================================================
# SYSTEM PROMPT V6 — Completo con tutti i 7 intent, 42 azioni,
# 21 componenti, 10 tab, pin map, wing pins, context fields
# ============================================================

SYSTEM_PROMPT_V6 = """Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
Ricevi il messaggio dello studente + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura esatta:
{
  "intent": "action|circuit|code|tutor|vision|navigation|teacher",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}

REGOLE:
1. "intent" classifica il tipo di richiesta:
   - "action": comandi simulazione (play/pause/reset/clearall/compile/undo/redo/quiz)
   - "circuit": piazzamento componenti, cablaggio, diagnosi circuiti
   - "code": scrittura/modifica codice Arduino, Scratch, editor
   - "tutor": domande teoriche, spiegazioni, concetti di elettronica
   - "vision": analisi visiva dello screenshot (parole chiave: guarda, vedi, foto, screenshot, immagine)
   - "navigation": caricamento esperimenti, cambio tab/volume, navigazione step
   - "teacher": richieste pedagogiche avanzate (quiz, notebook, youtube, valutazione)
2. "entities": lista di componenti, pin, esperimenti menzionati (ID tecnici, non alias)
3. "actions": array di action tag nel formato esatto [AZIONE:...] o [INTENT:{...}]
   AZIONI DISPONIBILI (42 totali):
   --- Simulation Control (6) ---
   [AZIONE:play] [AZIONE:pause] [AZIONE:reset] [AZIONE:clearall] [AZIONE:undo] [AZIONE:redo]
   --- Compilation & Code (7) ---
   [AZIONE:compile] [AZIONE:openeditor] [AZIONE:closeeditor]
   [AZIONE:switcheditor:scratch] [AZIONE:switcheditor:arduino]
   [AZIONE:resetcode] [AZIONE:getcode]
   --- Navigation (5) ---
   [AZIONE:loadexp:ID] [AZIONE:opentab:NOME] [AZIONE:openvolume:N]
   [AZIONE:nextstep] [AZIONE:prevstep]
   --- Component Manipulation (6) ---
   [INTENT:place_and_wire] [AZIONE:removecomponent:ID]
   [AZIONE:movecomponent:ID:DIR] [AZIONE:setvalue:ID:PARAM:VAL]
   [AZIONE:highlight:ID] [AZIONE:highlightpin:COMP:PIN]
   --- Wiring (2) ---
   [AZIONE:addwire:FROM:TO] [AZIONE:removewire:DESC]
   --- Interaction & Diagnosis (4) ---
   [AZIONE:interact:ID:ACTION:VAL] [AZIONE:measure:ID]
   [AZIONE:diagnose] [AZIONE:getstate]
   --- UI Panels (5) ---
   [AZIONE:showbom] [AZIONE:showserial] [AZIONE:showshortcuts]
   [AZIONE:fullscreenscratch] [AZIONE:exitscratchfullscreen]
   --- Educational (3) ---
   [AZIONE:quiz] [AZIONE:youtube:QUERY] [AZIONE:createnotebook:TITOLO]
   --- Serial & Code (3) ---
   [AZIONE:serialwrite:TEXT] [AZIONE:setcode:CODE] [AZIONE:appendcode:CODE]
   --- Build Mode (1) ---
   [AZIONE:setbuildmode:MODE]  (MODE = passopasso|completo|sandbox|guided)
4. "needs_llm": false se la risposta e' deterministica (azioni dirette), true se serve ragionamento LLM
5. "response": risposta breve per l'utente se needs_llm=false. null se needs_llm=true
6. "llm_hint": contesto/istruzioni per il modello grande se needs_llm=true. null se needs_llm=false

FILOSOFIA: needs_llm=false per OGNI azione deterministica. Il Brain deve risolvere
il piu' possibile senza chiamare il modello grande. needs_llm=true SOLO quando serve
ragionamento, spiegazioni, analisi, creativita'.

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
Battery9V: positive, negative

TAB VALIDI (10): simulator, manual, video, canvas, editor, taccuini, detective, poe, reverse, review
WING PINS: W_A0, W_A1, W_A2, W_A3, W_D3, W_D5, W_D6, W_D9, W_D10, W_D11, W_D12, W_D13,
W_A4/SDA, W_A5/SCL, W_D0/RX, W_D1/TX

CONTESTO: Il messaggio utente arriva con campi contesto:
tab, esperimento, componenti, fili, volume_attivo, simulazione (running/paused/stopped),
build_mode (passopasso/completo/sandbox/guided), step_corrente, editor_mode (arduino/scratch),
codice_presente (true/false)"""


# ============================================================
# ACTIONS — Tutte le 42 azioni come dati strutturati
# ============================================================

ACTIONS = {
    # --- Simulation Control (6) ---
    "play": {
        "tag": "[AZIONE:play]",
        "intent": "action",
        "category": "simulation",
        "responses": [
            "Simulazione avviata! ▶", "Play! ▶", "Si parte!", "Via!",
            "Avvio!", "Simulazione in corso.", "Eccoci, si parte! ▶",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "pause": {
        "tag": "[AZIONE:pause]",
        "intent": "action",
        "category": "simulation",
        "responses": [
            "Simulazione in pausa. ⏸", "Fermato. ⏸", "Pausa! ⏸",
            "In pausa.", "Stop! ⏸", "Simulazione fermata.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "reset": {
        "tag": "[AZIONE:reset]",
        "intent": "action",
        "category": "simulation",
        "responses": [
            "Circuito resettato.", "Reset!", "Tutto dall'inizio.",
            "Ripristinato.", "Torno allo stato iniziale.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "clearall": {
        "tag": "[AZIONE:clearall]",
        "intent": "action",
        "category": "simulation",
        "responses": [
            "Breadboard svuotata!", "Tutto rimosso.", "Pulito!",
            "Sgomberato!", "Via tutto, breadboard vuota!",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "undo": {
        "tag": "[AZIONE:undo]",
        "intent": "action",
        "category": "simulation",
        "responses": [
            "Annullato!", "Undo!", "Torno indietro.",
            "Fatto, ho annullato.", "Ultima azione annullata.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "redo": {
        "tag": "[AZIONE:redo]",
        "intent": "action",
        "category": "simulation",
        "responses": [
            "Ripetuto!", "Redo!", "Rifatto.",
            "Ripristinato.", "Azione ripetuta.",
        ],
        "entities": [],
        "needs_llm": False,
    },

    # --- Compilation & Code (7) ---
    "compile": {
        "tag": "[AZIONE:compile]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Compilazione avviata.", "Compilo...", "Build!",
            "Verifico il codice.", "Compilazione in corso...",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "openeditor": {
        "tag": "[AZIONE:openeditor]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Editor aperto!", "Ecco l'editor.", "Apro l'editor codice.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "closeeditor": {
        "tag": "[AZIONE:closeeditor]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Editor chiuso.", "Chiudo l'editor.", "Editor nascosto.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "switcheditor_scratch": {
        "tag": "[AZIONE:switcheditor:scratch]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Passa a Scratch! 🧩", "Modalita' blocchi attiva!",
            "Ecco Scratch!", "Editor Scratch aperto!",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "switcheditor_arduino": {
        "tag": "[AZIONE:switcheditor:arduino]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Passa ad Arduino C++!", "Modalita' codice attiva!",
            "Ecco l'editor Arduino!", "Editor testuale aperto!",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "resetcode": {
        "tag": "[AZIONE:resetcode]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Codice resettato!", "Codice originale ripristinato.",
            "Rimesso il codice di default.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "getcode": {
        "tag": "[AZIONE:getcode]",
        "intent": "action",
        "category": "code",
        "responses": [
            "Ecco il codice attuale.", "Recupero il codice...",
            "Codice corrente recuperato.",
        ],
        "entities": [],
        "needs_llm": False,
    },

    # --- Navigation (5) ---
    "loadexp": {
        "tag": "[AZIONE:loadexp:{id}]",
        "intent": "navigation",
        "category": "navigation",
        "responses": [
            "Carico l'esperimento!", "Ecco l'esperimento!",
            "Esperimento caricato!", "Apro l'esperimento!",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "opentab": {
        "tag": "[AZIONE:opentab:{name}]",
        "intent": "navigation",
        "category": "navigation",
        "responses": [
            "Apro la scheda!", "Ecco!", "Tab aperto!",
        ],
        "entities": ["{name}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "name",
    },
    "openvolume": {
        "tag": "[AZIONE:openvolume:{n}]",
        "intent": "navigation",
        "category": "navigation",
        "responses": [
            "Apro il Volume {n}!", "Volume {n} caricato!",
            "Ecco il Volume {n}!",
        ],
        "entities": [],
        "needs_llm": False,
        "parametric": True,
        "param_name": "n",
    },
    "nextstep": {
        "tag": "[AZIONE:nextstep]",
        "intent": "navigation",
        "category": "navigation",
        "responses": [
            "Prossimo passo!", "Avanti!", "Step successivo.",
            "Ecco il prossimo passo.", "Avanzamento!",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "prevstep": {
        "tag": "[AZIONE:prevstep]",
        "intent": "navigation",
        "category": "navigation",
        "responses": [
            "Passo precedente.", "Indietro!", "Torno allo step prima.",
            "Step precedente.", "Ecco lo step di prima.",
        ],
        "entities": [],
        "needs_llm": False,
    },

    # --- Component Manipulation (6) ---
    "place_and_wire": {
        "tag": "[INTENT:place_and_wire]",
        "intent": "circuit",
        "category": "component",
        "responses": [
            "Componente piazzato! ✅", "Ecco, piazzato sulla breadboard!",
            "Aggiunto al circuito! ✅", "Posizionato!",
        ],
        "entities": ["{components}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "components",
    },
    "removecomponent": {
        "tag": "[AZIONE:removecomponent:{id}]",
        "intent": "circuit",
        "category": "component",
        "responses": [
            "Componente rimosso!", "Tolto!", "Eliminato dal circuito.",
            "Via!", "Rimosso! ✅",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "movecomponent": {
        "tag": "[AZIONE:movecomponent:{id}:{dir}]",
        "intent": "circuit",
        "category": "component",
        "responses": [
            "Spostato!", "Componente spostato.", "Ecco, spostato!",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "setvalue": {
        "tag": "[AZIONE:setvalue:{id}:{param}:{val}]",
        "intent": "circuit",
        "category": "component",
        "responses": [
            "Valore impostato!", "Modificato!", "Parametro aggiornato.",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "highlight": {
        "tag": "[AZIONE:highlight:{id}]",
        "intent": "circuit",
        "category": "component",
        "responses": [
            "Evidenziato!", "Ecco, lo vedi?", "Componente evidenziato.",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "highlightpin": {
        "tag": "[AZIONE:highlightpin:{comp}:{pin}]",
        "intent": "circuit",
        "category": "component",
        "responses": [
            "Pin evidenziato!", "Ecco il pin!", "Lo vedi il pin?",
        ],
        "entities": ["{comp}", "{pin}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "comp",
    },

    # --- Wiring (2) ---
    "addwire": {
        "tag": "[AZIONE:addwire:{from_pin}:{to_pin}]",
        "intent": "circuit",
        "category": "wiring",
        "responses": [
            "Filo collegato! ✅", "Collegamento fatto!",
            "Connesso!", "Ecco il filo! ✅",
        ],
        "entities": ["{from_pin}", "{to_pin}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "from_pin",
    },
    "removewire": {
        "tag": "[AZIONE:removewire:{desc}]",
        "intent": "circuit",
        "category": "wiring",
        "responses": [
            "Filo rimosso!", "Collegamento tolto.", "Scollegato!",
        ],
        "entities": ["{desc}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "desc",
    },

    # --- Interaction & Diagnosis (4) ---
    "interact": {
        "tag": "[AZIONE:interact:{id}:{action}:{val}]",
        "intent": "circuit",
        "category": "interaction",
        "responses": [
            "Interazione eseguita!", "Fatto!", "Ecco!",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "measure": {
        "tag": "[AZIONE:measure:{id}]",
        "intent": "circuit",
        "category": "interaction",
        "responses": [
            "Misura in corso...", "Ecco la misura!", "Misurazione avviata.",
        ],
        "entities": ["{id}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "id",
    },
    "diagnose": {
        "tag": "[AZIONE:diagnose]",
        "intent": "circuit",
        "category": "interaction",
        "responses": [
            "Analizzo il circuito...", "Cerco il problema.",
            "Controllo...", "Diagnostica in corso.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "getstate": {
        "tag": "[AZIONE:getstate]",
        "intent": "circuit",
        "category": "interaction",
        "responses": [
            "Stato del circuito recuperato.", "Ecco lo stato attuale.",
            "Analizzo lo stato...",
        ],
        "entities": [],
        "needs_llm": False,
    },

    # --- UI Panels (5) ---
    "showbom": {
        "tag": "[AZIONE:showbom]",
        "intent": "action",
        "category": "ui",
        "responses": [
            "Ecco la lista componenti!", "BOM aperto.",
            "Ecco cosa serve.", "Lista materiali!",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "showserial": {
        "tag": "[AZIONE:showserial]",
        "intent": "action",
        "category": "ui",
        "responses": [
            "Monitor seriale aperto!", "Ecco la seriale.",
            "Serial Monitor attivo.", "Apro il monitor seriale.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "showshortcuts": {
        "tag": "[AZIONE:showshortcuts]",
        "intent": "action",
        "category": "ui",
        "responses": [
            "Ecco le scorciatoie!", "Shortcuts aperti.",
            "Lista tasti rapidi.", "Ecco i comandi da tastiera.",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "fullscreenscratch": {
        "tag": "[AZIONE:fullscreenscratch]",
        "intent": "action",
        "category": "ui",
        "responses": [
            "Scratch a schermo intero!", "Fullscreen Scratch attivo!",
            "Editor Scratch ingrandito!",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "exitscratchfullscreen": {
        "tag": "[AZIONE:exitscratchfullscreen]",
        "intent": "action",
        "category": "ui",
        "responses": [
            "Uscita da fullscreen.", "Scratch rimpicciolito.",
            "Torno alla vista normale.",
        ],
        "entities": [],
        "needs_llm": False,
    },

    # --- Educational (3) ---
    "quiz": {
        "tag": "[AZIONE:quiz]",
        "intent": "teacher",
        "category": "educational",
        "responses": [
            "Quiz in arrivo!", "Ecco il quiz!",
            "Vediamo cosa sai!", "Quiz time! 🧠",
        ],
        "entities": [],
        "needs_llm": False,
    },
    "youtube": {
        "tag": "[AZIONE:youtube:{query}]",
        "intent": "teacher",
        "category": "educational",
        "responses": [
            "Cerco un video!", "Ecco un video utile!",
            "Video trovato!", "Guarda questo video!",
        ],
        "entities": ["{query}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "query",
    },
    "createnotebook": {
        "tag": "[AZIONE:createnotebook:{titolo}]",
        "intent": "teacher",
        "category": "educational",
        "responses": [
            "Taccuino creato!", "Ecco il tuo taccuino!",
            "Notebook pronto!", "Apro il taccuino!",
        ],
        "entities": ["{titolo}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "titolo",
    },

    # --- Serial & Code (3) ---
    "serialwrite": {
        "tag": "[AZIONE:serialwrite:{text}]",
        "intent": "code",
        "category": "serial",
        "responses": [
            "Scritto sulla seriale!", "Testo inviato alla seriale.",
            "Messaggio seriale inviato.",
        ],
        "entities": ["{text}"],
        "needs_llm": False,
        "parametric": True,
        "param_name": "text",
    },
    "setcode": {
        "tag": "[AZIONE:setcode:{code}]",
        "intent": "code",
        "category": "serial",
        "responses": [
            "Codice impostato!", "Ecco il codice!",
            "Codice caricato nell'editor.",
        ],
        "entities": [],
        "needs_llm": False,
        "parametric": True,
        "param_name": "code",
    },
    "appendcode": {
        "tag": "[AZIONE:appendcode:{code}]",
        "intent": "code",
        "category": "serial",
        "responses": [
            "Codice aggiunto!", "Righe aggiunte al codice.",
            "Codice appendato.",
        ],
        "entities": [],
        "needs_llm": False,
        "parametric": True,
        "param_name": "code",
    },

    # --- Build Mode (1) ---
    "setbuildmode": {
        "tag": "[AZIONE:setbuildmode:{mode}]",
        "intent": "action",
        "category": "buildmode",
        "responses": [
            "Modalita' di costruzione cambiata!", "Build mode aggiornato!",
            "Cambio modalita'!", "Ecco la nuova modalita'!",
        ],
        "entities": [],
        "needs_llm": False,
        "parametric": True,
        "param_name": "mode",
    },
}


# ============================================================
# COMPONENTI, PIN, BREADBOARD DATA
# ============================================================

COMPONENTS = [
    "led", "resistor", "push-button", "buzzer-piezo", "capacitor",
    "potentiometer", "photo-resistor", "diode", "mosfet-n", "rgb-led",
    "motor-dc", "servo", "reed-switch", "phototransistor", "battery9v",
    "multimeter", "lcd16x2", "nano-r4-board", "breadboard-half",
    "breadboard-full", "wire",
]

PLACEABLE = [
    "led", "resistor", "push-button", "buzzer-piezo", "capacitor",
    "potentiometer", "photo-resistor", "diode", "mosfet-n", "rgb-led",
    "motor-dc", "servo", "reed-switch", "phototransistor", "lcd16x2",
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
    "battery9v": ["positive", "negative"],
    "lcd16x2": ["VSS", "VDD", "V0", "RS", "RW", "E", "D4", "D5", "D6", "D7", "A", "K"],
}

WING_PINS = [
    "W_A0", "W_A1", "W_A2", "W_A3",
    "W_D3", "W_D5", "W_D6", "W_D9", "W_D10", "W_D11", "W_D12", "W_D13",
]
WING_PINS_EXTENDED = WING_PINS + ["W_A4/SDA", "W_A5/SCL", "W_D0/RX", "W_D1/TX"]

DIGITAL_PINS = ["D3", "D5", "D6", "D9", "D10", "D11", "D12", "D13"]
ANALOG_PINS = ["A0", "A1", "A2", "A3"]


# ============================================================
# TAB, ALIAS, GIOCHI
# ============================================================

TABS = ["simulator", "manual", "video", "canvas", "editor",
        "taccuini", "detective", "poe", "reverse", "review"]

TAB_ALIASES = {
    "simulator": ["simulatore", "sim", "circuito", "breadboard", "la breadboard"],
    "manual": ["manuale", "libro", "guida", "istruzioni", "il manuale", "il libro"],
    "video": ["video", "filmato", "tutorial video", "il video"],
    "canvas": ["lavagna", "canvas", "disegno", "foglio", "la lavagna"],
    "editor": ["editor", "codice", "programma", "code", "l'editor", "il codice"],
    "taccuini": ["taccuino", "quaderno", "appunti", "note", "notebook", "il taccuino"],
    "detective": ["detective", "trova il guasto", "gioco detective", "il detective"],
    "poe": ["prevedi e spiega", "previsione", "poe", "il gioco poe"],
    "reverse": ["circuito misterioso", "reverse", "mistero", "il mistero"],
    "review": ["controlla circuito", "review", "verifica", "il review"],
}

GAME_TABS = ["detective", "poe", "reverse", "review"]


# ============================================================
# ESPERIMENTI (69 totali: 38 vol1 + 18 vol2 + 13 vol3)
# ============================================================

EXPERIMENTS = [
    # Volume 1 (38 esperimenti)
    "v1-cap1-esp1", "v1-cap2-esp1", "v1-cap2-esp2", "v1-cap3-esp1", "v1-cap3-esp2",
    "v1-cap4-esp1", "v1-cap4-esp2", "v1-cap5-esp1", "v1-cap5-esp2", "v1-cap5-esp3",
    "v1-cap6-esp1", "v1-cap6-esp2", "v1-cap7-esp1", "v1-cap7-esp2", "v1-cap7-esp3",
    "v1-cap8-esp1", "v1-cap8-esp2", "v1-cap8-esp3", "v1-cap9-esp1", "v1-cap9-esp2",
    "v1-cap9-esp3", "v1-cap9-esp4", "v1-cap9-esp5", "v1-cap9-esp6", "v1-cap9-esp7",
    "v1-cap9-esp8", "v1-cap10-esp1", "v1-cap10-esp2", "v1-cap11-esp1", "v1-cap11-esp2",
    "v1-cap12-esp1", "v1-cap12-esp2", "v1-cap12-esp3", "v1-cap13-esp1", "v1-cap13-esp2",
    "v1-cap14-esp1", "v1-cap14-esp2", "v1-cap14-esp3",
    # Volume 2 (18 esperimenti)
    "v2-cap1-esp1", "v2-cap1-esp2", "v2-cap2-esp1", "v2-cap2-esp2", "v2-cap3-esp1",
    "v2-cap3-esp2", "v2-cap4-esp1", "v2-cap4-esp2", "v2-cap5-esp1", "v2-cap5-esp2",
    "v2-cap6-esp1", "v2-cap6-esp2", "v2-cap7-esp1", "v2-cap7-esp2", "v2-cap8-esp1",
    "v2-cap8-esp2", "v2-cap9-esp1", "v2-cap10-esp1",
    # Volume 3 (13 esperimenti AVR)
    "v3-cap1-esp1", "v3-cap2-esp1", "v3-cap3-esp1", "v3-cap4-esp1", "v3-cap5-esp1",
    "v3-cap6-esp1", "v3-cap7-esp1", "v3-cap8-esp1", "v3-cap9-esp1", "v3-cap10-esp1",
    "v3-cap11-esp1", "v3-cap12-esp1", "v3-cap13-esp1",
]

EXP_NAMES = {
    "v1-cap1-esp1": "Cos'e' l'Elettricita'",
    "v1-cap2-esp1": "Il Primo Circuito",
    "v1-cap2-esp2": "Il Primo Circuito - Variante",
    "v1-cap3-esp1": "LED e Resistenze",
    "v1-cap3-esp2": "LED e Resistenze - Variante",
    "v1-cap4-esp1": "Circuiti in Serie",
    "v1-cap4-esp2": "Circuiti in Serie - Variante",
    "v1-cap5-esp1": "Circuiti in Parallelo",
    "v1-cap5-esp2": "Circuiti in Parallelo - Variante",
    "v1-cap5-esp3": "Circuiti in Parallelo - Challenge",
    "v1-cap6-esp1": "Il Pulsante",
    "v1-cap6-esp2": "Il Pulsante - Variante",
    "v1-cap7-esp1": "Il Buzzer",
    "v1-cap7-esp2": "Il Buzzer - Variante",
    "v1-cap7-esp3": "Il Buzzer - Challenge",
    "v1-cap8-esp1": "Il Potenziometro",
    "v1-cap8-esp2": "Il Potenziometro - Variante",
    "v1-cap8-esp3": "Il Potenziometro - Challenge",
    "v1-cap9-esp1": "Il Condensatore",
    "v1-cap9-esp2": "Il Condensatore - Variante",
    "v1-cap10-esp1": "Il Diodo",
    "v1-cap10-esp2": "Il Diodo - Variante",
    "v1-cap11-esp1": "Il Transistor",
    "v1-cap11-esp2": "Il Transistor - Variante",
    "v1-cap12-esp1": "Il Motore DC",
    "v1-cap12-esp2": "Il Motore DC - Variante",
    "v1-cap12-esp3": "Il Motore DC - Challenge",
    "v1-cap13-esp1": "Il Sensore di Luce",
    "v1-cap13-esp2": "Il Sensore di Luce - Variante",
    "v1-cap14-esp1": "Il Primo Robot",
    "v1-cap14-esp2": "Il Primo Robot - Variante",
    "v1-cap14-esp3": "Il Primo Robot - Challenge",
    "v2-cap1-esp1": "Circuiti Avanzati",
    "v2-cap1-esp2": "Circuiti Avanzati - Variante",
    "v2-cap2-esp1": "Sensori Multipli",
    "v2-cap2-esp2": "Sensori Multipli - Variante",
    "v2-cap3-esp1": "Logica Digitale",
    "v2-cap3-esp2": "Logica Digitale - Variante",
    "v2-cap4-esp1": "Il Condensatore Avanzato",
    "v2-cap4-esp2": "Il Condensatore Avanzato - Variante",
    "v2-cap5-esp1": "RGB LED",
    "v2-cap5-esp2": "RGB LED - Variante",
    "v2-cap6-esp1": "Il Reed Switch",
    "v2-cap6-esp2": "Il Reed Switch - Variante",
    "v2-cap7-esp1": "Il Fototransistor",
    "v2-cap7-esp2": "Il Fototransistor - Variante",
    "v2-cap8-esp1": "Il Servo",
    "v2-cap8-esp2": "Il Servo - Variante",
    "v2-cap9-esp1": "Il MOSFET",
    "v2-cap10-esp1": "Progetto Libero",
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
    "v3-cap12-esp1": "Piano Elettronico",
    "v3-cap13-esp1": "Domotica Base",
}


# ============================================================
# COMPONENT ALIASES (come li chiamano i ragazzi 10-14)
# ============================================================

COMPONENT_ALIASES = {
    "led": [
        "LED", "led", "lucina", "lucetta", "lampadina", "luce",
        "diodo luminoso", "ledino", "lucciola", "la lucina", "il led",
        "lampadina LED", "il LED", "un LED", "una lucina",
    ],
    "resistor": [
        "resistenza", "resistore", "res", "la resistenza", "una resistenza",
        "il resistore", "ohm", "la res", "quella cosa a strisce",
    ],
    "push-button": [
        "pulsante", "bottone", "tasto", "il pulsante", "pushbutton",
        "switch", "interruttore", "tastino", "pulsantino", "button",
        "il bottone", "il tasto", "push button",
    ],
    "buzzer-piezo": [
        "buzzer", "cicalino", "il buzzer", "altoparlante", "speaker",
        "suoneria", "beeper", "il cicalino", "piezo", "ronzatore",
        "buzzerino", "la cosa che suona",
    ],
    "capacitor": [
        "condensatore", "capacitore", "il condensatore", "cap",
        "il cap", "capacitor", "il barilotto",
    ],
    "potentiometer": [
        "potenziometro", "pot", "il pot", "il potenziometro",
        "manopola", "la manopola", "rotella", "trimmer",
    ],
    "photo-resistor": [
        "fotoresistenza", "fotoresistore", "sensore di luce",
        "LDR", "il fotoresistore", "la fotoresistenza",
        "sensore luminoso", "il sensore di luce",
    ],
    "diode": [
        "diodo", "il diodo", "la diode", "un diodo",
    ],
    "mosfet-n": [
        "mosfet", "il mosfet", "transistor", "il transistor",
        "MOSFET", "mosfet N", "il MOSFET",
    ],
    "rgb-led": [
        "LED RGB", "led rgb", "RGB", "il led RGB", "led colorato",
        "LED multicolore", "led a tre colori", "rgb", "il RGB",
    ],
    "motor-dc": [
        "motore", "motorino", "il motore", "motore DC", "il motorino",
        "motore elettrico", "motor", "il motor",
    ],
    "servo": [
        "servo", "servomotore", "il servo", "il servomotore",
        "servo motore", "braccetto", "il braccetto",
    ],
    "reed-switch": [
        "reed switch", "il reed", "sensore magnetico",
        "interruttore magnetico", "reed", "il sensore magnetico",
    ],
    "phototransistor": [
        "fototransistor", "il fototransistor", "sensore ottico",
        "il sensore ottico", "phototransistor",
    ],
    "battery9v": [
        "batteria", "pila", "la batteria", "batteria 9V", "la pila",
        "9 volt", "pila 9V",
    ],
    "multimeter": [
        "multimetro", "tester", "il multimetro", "il tester",
        "voltmetro", "strumento di misura",
    ],
    "lcd16x2": [
        "display", "LCD", "schermo", "il display", "lo schermo",
        "display LCD", "LCD 16x2", "il monitor",
    ],
}


# ============================================================
# KID NAMES, EMOTIONS, OFF-TOPIC, NEGATIONS
# ============================================================

KID_NAMES = [
    "Marco", "Sofia", "Luca", "Giulia", "Alessandro", "Emma", "Francesco",
    "Alice", "Lorenzo", "Chiara", "Matteo", "Sara", "Andrea", "Giorgia",
    "Leonardo", "Anna", "Davide", "Martina", "Tommaso", "Elena", "Nicolo'",
    "Camilla", "Gabriele", "Greta", "Riccardo", "Beatrice", "Federico",
    "Valentina", "Pietro", "Aurora", "Filippo", "Vittoria", "Diego",
    "Elisa", "Christian", "Noemi",
]

EMOTION_POSITIVE = [
    "Bellissimo!", "Wow!", "Fantastico!", "Troppo forte!", "Che bello!",
    "Funziona!", "Evvai!", "Si'!!", "Grande!", "Figata!", "Amazing!",
    "Ce l'ho fatta!", "Finalmente!", "Mitico!", "Super!",
    "Spacca!", "Top!", "Perfetto!", "Che spettacolo!",
]

EMOTION_NEGATIVE = [
    "Non capisco niente!", "Aiuto!", "Non funziona!", "Sono confuso",
    "E' troppo difficile", "Non ci riesco", "Che palle", "Boh",
    "Mi sono perso", "Non ho capito", "Che schifo", "Odio sto circuito",
    "Non ne posso piu'", "Ma che cavolo", "Help me", "SOS",
    "Non ci capisco nulla", "Che casino", "E' impossibile",
    "Uffa", "Ma come si fa?!", "Non va niente!",
]

EMOTION_CURIOUS = [
    "Come mai?", "Davvero?", "Ma e' vero che...?", "E se...?",
    "Pero' mi chiedo...", "Ah interessante, e...?", "Figo! E poi?",
    "Wow, come funziona?", "Ma perche'?", "E se faccio al contrario?",
    "Che succede se...?", "Ma tipo...?",
]

OFFTOPIC_MESSAGES = [
    "Che ore sono?", "Mi piace il calcio", "Cosa mangi a pranzo?",
    "Hai visto Minecraft?", "Giochi a Fortnite?", "Quanti anni hai?",
    "Dove abiti?", "Mi racconti una barzelletta?", "Chi sei?",
    "Sei un robot?", "Sei vero?", "Puoi fare i compiti di matematica?",
    "Qual e' il tuo colore preferito?", "Ti piace la pizza?",
    "Cosa fai nel tempo libero?", "Sai cantare?", "Parlami di te",
    "Conosci ChatGPT?", "Sei meglio di Siri?", "Mi annoio",
    "Non ho voglia di studiare", "Posso giocare?", "Che giorno e' oggi?",
    "Mi aiuti con la tesina?", "Sai giocare a scacchi?",
    "Quanto fa 2+2?", "Chi ha inventato il telefono?",
    "Come si chiama il presidente?", "Che tempo fa domani?",
]

NEGATION_TEMPLATES = [
    "Non avviare la simulazione", "Non togliere {comp}",
    "Non compilare", "Non cancellare niente", "Non resettare",
    "Aspetta, non fare nulla", "Fermo, non ho ancora finito",
    "No, non quello", "Non volevo dire quello",
    "Non toccare {comp}", "Lascia tutto cosi'", "Non cambiare niente",
    "No stop, non era quello che volevo", "Non mettere {comp}",
    "Non avviare ancora", "Fermati, non ho chiesto io",
    "Non spostare niente", "Non eliminare {comp}",
]


# ============================================================
# BUILD MODES
# ============================================================

BUILD_MODES = ["passopasso", "completo", "sandbox", "guided"]

BUILD_MODE_PHRASES = {
    "passopasso": [
        "Voglio il passo passo", "Modalita' passo passo", "Step by step",
        "Fammi costruire passo passo", "Guida passo passo",
        "Costruzione guidata", "Voglio fare uno step alla volta",
    ],
    "completo": [
        "Montaggio completo", "Metti tutto gia' montato",
        "Gia' montato", "Tutto subito", "Completo",
        "Fammi vedere il circuito completo", "Montami tutto",
    ],
    "sandbox": [
        "Modalita' libera", "Sandbox", "Voglio costruire da solo",
        "Fammi fare a me", "Modalita' sandbox", "Libero",
        "Lasciatemi costruire", "Voglio sperimentare",
    ],
    "guided": [
        "Modalita' guidata", "Guided", "Guidami nella costruzione",
        "Aiutami a costruire", "Mi guidi tu?",
    ],
}


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

    idx = random.randint(0, len(words) - 1)
    word = words[idx]
    if len(word) < 3:
        return text

    typo_type = random.choice([
        "swap", "drop", "double", "adjacent", "space_drop", "accent",
    ])

    if typo_type == "swap" and len(word) > 3:
        pos = random.randint(1, len(word) - 2)
        word = word[:pos] + word[pos + 1] + word[pos] + word[pos + 2:]
    elif typo_type == "drop":
        pos = random.randint(1, len(word) - 1)
        word = word[:pos] + word[pos + 1:]
    elif typo_type == "double":
        pos = random.randint(0, len(word) - 1)
        word = word[:pos] + word[pos] + word[pos:]
    elif typo_type == "adjacent":
        adj = {
            "a": "s", "s": "d", "d": "f", "e": "r", "r": "t",
            "i": "o", "o": "p", "n": "m", "l": "k", "v": "b", "c": "x",
        }
        pos = random.randint(0, len(word) - 1)
        ch = word[pos].lower()
        if ch in adj:
            rep = adj[ch]
            word = word[:pos] + (rep.upper() if word[pos].isupper() else rep) + word[pos + 1:]
    elif typo_type == "space_drop" and len(words) > 2:
        if idx < len(words) - 1:
            words[idx] = words[idx] + words[idx + 1]
            words.pop(idx + 1)
            return " ".join(words)
    elif typo_type == "accent":
        accent_map = {
            "e'": "è", "a'": "à", "o'": "ò", "u'": "ù",
            "perche'": "xke", "perche": "xke",
        }
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
            "Galileo, ", "Ehi, ", "Dai, ", "Ok ", "Senti, ", "Per favore ",
            "Puoi ", "Mi ", "Allora ", "Dunque ", "Ehm... ", "Scusa, ",
            "Aspetta, ", "Oh, ", "Ah, ", "Hmm ", "Ehi Galileo, ", "Ciao, ",
            "Gali, ", "Gali ", "Galileo ",
        ])
        result = prefix + result[0].lower() + result[1:] if result else result

    # 15% suffisso
    if random.random() < 0.15:
        suffix = random.choice([
            " per favore", " grazie", " dai", " va bene?", " ok?",
            " si?", " eh", " perfavore", " pf", " plz", " thx",
            "!", " :)", " :D",
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
# CONTEXT GENERATION (v6 — esteso)
# ============================================================

def random_context_v6(
    tab=None, comps=None, vol=None, exp=None, wires=None,
    step=None, sim_state=None, build_mode=None,
    editor_mode=None, code_present=None,
):
    """Genera un blocco [CONTESTO] realistico con tutti i campi v6."""
    tab = tab or random.choice(TABS[:5])  # main tabs by default
    vol = vol or random.randint(1, 3)

    if comps is None:
        n = random.randint(0, 6)
        comps = []
        for _ in range(n):
            c = random.choice(PLACEABLE)
            cid = c.replace("-", "") + str(len([x for x in comps if x.startswith(c.replace("-", ""))]) + 1)
            comps.append(cid)

    wires = wires if wires is not None else random.randint(0, min(len(comps) * 2, 10))
    exp = exp if exp is not None else (random.choice(EXPERIMENTS) if random.random() < 0.35 else None)
    sim_state = sim_state or random.choice(["stopped", "running", "paused"])
    build_mode = build_mode or random.choice(BUILD_MODES)
    editor_mode = editor_mode or random.choice(["arduino", "scratch"])
    code_present = code_present if code_present is not None else random.choice([True, False])

    ctx = f"[CONTESTO]\ntab: {tab}\n"
    if exp:
        ctx += f"esperimento: {exp}\n"
    ctx += f"componenti: [{', '.join(comps)}]\n"
    ctx += f"fili: {wires}\n"
    ctx += f"volume_attivo: {vol}\n"
    ctx += f"simulazione: {sim_state}\n"
    ctx += f"build_mode: {build_mode}"

    if step is not None:
        ctx += f"\nstep_corrente: {step}"
    if vol == 3 or editor_mode:
        ctx += f"\neditor_mode: {editor_mode}"
    ctx += f"\ncodice_presente: {'true' if code_present else 'false'}"

    return ctx


# ============================================================
# EXAMPLE BUILDERS
# ============================================================

def make_example(user_msg, intent, entities, actions, needs_llm,
                 response, llm_hint, ctx=None):
    """Build a single-turn ChatML example."""
    ctx = ctx or random_context_v6()
    full_user = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"
    assistant_json = json.dumps({
        "intent": intent,
        "entities": entities,
        "actions": actions,
        "needs_llm": needs_llm,
        "response": response,
        "llm_hint": llm_hint,
    }, ensure_ascii=False)
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT_V6},
            {"role": "user", "content": full_user},
            {"role": "assistant", "content": assistant_json},
        ]
    }


def make_multi_turn(turns, base_ctx=None):
    """Build a multi-turn ChatML example.

    turns = list of tuples:
        (user_msg, intent, entities, actions, needs_llm, response, llm_hint[, ctx_override])
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT_V6}]
    for t in turns:
        user_msg, intent, entities, actions, needs_llm, response, llm_hint = t[:7]
        ctx = t[7] if len(t) > 7 else (base_ctx or random_context_v6())
        full_user = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"
        assistant_json = json.dumps({
            "intent": intent,
            "entities": entities,
            "actions": actions,
            "needs_llm": needs_llm,
            "response": response,
            "llm_hint": llm_hint,
        }, ensure_ascii=False)
        messages.append({"role": "user", "content": full_user})
        messages.append({"role": "assistant", "content": assistant_json})
    return {"messages": messages}


# ============================================================
# LAYER GENERATORS (placeholder — Tasks 2-5 will implement)
# ============================================================

def gen_layer_replay(n):
    """Layer 1: Riformulazioni fedeli dal dataset esistente.
    Prende esempi v3/20k e li rigenera con SYSTEM_PROMPT_V6 e contesto esteso.
    ~3000 examples covering ALL intents to prevent catastrophic forgetting.
    """

    # ================================================================
    # PHRASE TEMPLATES (rich Italian variants: formal, informal, slang)
    # ================================================================

    # --- Action phrases per type ---
    REPLAY_PLAY_PHRASES = [
        "Avvia", "Avvia la simulazione", "Play", "Start", "Vai", "Fai partire",
        "Accendi", "Fai partire il circuito", "Lancia la simulazione", "Metti in moto",
        "Premi play", "Fallo andare", "Daje!", "Via!", "Parti!", "Accendilo",
        "Fai girare", "Attiva", "Dai che si parte", "Andiamo!", "Proviamo",
        "Testiamo il circuito", "Facciamo andare", "OK avvia", "Si parte", "Go!",
        "Run it", "Let's go", "Fire it up", "Ho finito di montare, avvia",
        "Pronto, fai partire", "Il circuito e' pronto, avvia", "Dai vai",
        "Forza avvia", "Fammelo vedere in azione", "Aziona il circuito",
        "Metti in funzione", "Fammi vedere come va", "Partiamo!", "Iniziamo!",
        "Mandalo", "Prova!", "Vediamo se funziona", "Fallo funzionare",
        "voglio vederlo in azione", "accendi tutto", "manda avanti",
    ]
    REPLAY_PAUSE_PHRASES = [
        "Stop", "Ferma", "Pausa", "Metti in pausa", "Ferma tutto", "Fermalo",
        "Stoppa", "Blocca", "Fermati", "Basta", "Stop la simulazione", "Premi stop",
        "Spegni", "Alt", "Aspetta", "Fermo!", "Stoppalo!", "Basta cosi'",
        "Ok basta", "Fermati un attimo", "Frena", "Stoppami tutto", "Blocca tutto",
        "Tieni fermo", "Pause", "Hold", "Halt", "Stop it", "Fermami tutto",
        "Un attimo", "Wait", "No no ferma!", "Blocca blocca!", "Stai fermo",
        "Aspe'", "Ferma un secondo", "fermala", "basta fermati", "stop stop",
        "ferma la simulazione", "spegni tutto",
    ]
    REPLAY_RESET_PHRASES = [
        "Reset", "Resetta", "Resetta il circuito", "Ripristina", "Ricomincia",
        "Ricomincia da capo", "Resetta tutto", "Rimetti a zero", "Reimposta",
        "Da capo", "Daccapo", "Dall'inizio", "Ricominciamo", "Azzera",
        "Azzera tutto", "Fai reset", "Premi reset", "Resettiamo", "Come prima",
        "Rifai da capo", "Riportami alla situazione iniziale",
        "Torna allo stato originale", "riparti da zero",
        "rimetti tutto a posto", "restart",
    ]
    REPLAY_CLEARALL_PHRASES = [
        "Cancella tutto", "Pulisci tutto", "Svuota", "Svuota tutto", "Togli tutto",
        "Rimuovi tutto", "Elimina tutto", "Pulisci la breadboard",
        "Svuota la breadboard", "Via tutto", "Butta via tutto", "Sgombra",
        "Fai piazza pulita", "Tabula rasa", "Leva tutto", "Spazza via",
        "Sparecchia", "Ripulisci", "Togli tutta sta roba",
        "Voglio ricominciare da zero", "Voglio una breadboard vuota",
        "Toglimi tutto di mezzo", "Via via tutto", "Clear all",
        "pulisci", "cancella", "elimina tutto quanto",
    ]
    REPLAY_COMPILE_PHRASES = [
        "Compila", "Compila il codice", "Compila lo sketch", "Verifica il codice",
        "Controlla il codice", "Build", "Prova a compilare", "Lancia la compilazione",
        "Vedi se il codice e' giusto", "Testami il codice", "Compilalo",
        "Fai il build", "Manda in compilazione", "Verifica lo sketch",
        "compile", "compilazione",
    ]
    REPLAY_QUIZ_PHRASES = [
        "Quiz", "Fammi un quiz", "Domanda", "Fammi una domanda",
        "Prova a interrogarmi", "Verificami", "Test", "Fammi un test",
        "Mettimi alla prova", "Interrogami", "Challenge", "Sfidami",
        "Sparami un quiz", "Facciamo un quiz", "Quiz!", "Interrogazione!",
        "Testami", "Daje col quiz", "Voglio mettermi alla prova",
        "Vediamo se ho capito", "Prova a farmi qualche domanda",
    ]
    REPLAY_DIAGNOSE_PHRASES = [
        "Diagnosi", "Diagnostica", "Cosa c'e' che non va?", "Trova l'errore",
        "Controlla cosa non funziona", "Perche' non funziona?", "Debug",
        "Cerca il problema", "Cosa non va?", "Analizza il circuito",
        "Verifica il mio circuito", "C'e' qualcosa di sbagliato?",
    ]
    REPLAY_UNDO_PHRASES = [
        "Annulla", "Undo", "Torna indietro", "Ctrl Z",
        "annulla l'ultima cosa", "indietro", "torna come prima",
    ]
    REPLAY_REDO_PHRASES = [
        "Rifai", "Redo", "Ripeti", "rimetti quello che ho tolto",
        "Ctrl Y", "ripristina", "rimetti",
    ]
    REPLAY_NEXTSTEP_PHRASES = [
        "Avanti", "Prossimo passo", "Prossimo step", "Vai avanti",
        "Next", "next step", "continua", "andiamo avanti",
        "passo successivo", "step dopo",
    ]
    REPLAY_PREVSTEP_PHRASES = [
        "Indietro", "Passo precedente", "Step precedente",
        "Torna indietro", "Previous", "back", "passo prima",
        "step prima", "vai indietro",
    ]
    REPLAY_SHOWBOM_PHRASES = [
        "Mostra i componenti", "BOM", "Lista componenti", "Cosa mi serve?",
        "Quali pezzi servono?", "materiali", "mostra la lista",
        "che componenti ci sono?", "bill of materials",
    ]
    REPLAY_SHOWSERIAL_PHRASES = [
        "Monitor seriale", "Serial monitor", "Apri la seriale",
        "Mostra output", "Mostra seriale", "serial",
        "fammi vedere la seriale", "output seriale",
    ]
    REPLAY_RESETCODE_PHRASES = [
        "Resetta il codice", "Codice originale",
        "Rimetti il codice di default", "codice iniziale", "reset code",
        "rimetti il codice originale", "codice di partenza",
    ]

    REPLAY_ACTION_PHRASES = {
        "play": REPLAY_PLAY_PHRASES,
        "pause": REPLAY_PAUSE_PHRASES,
        "reset": REPLAY_RESET_PHRASES,
        "clearall": REPLAY_CLEARALL_PHRASES,
        "undo": REPLAY_UNDO_PHRASES,
        "redo": REPLAY_REDO_PHRASES,
        "compile": REPLAY_COMPILE_PHRASES,
        "quiz": REPLAY_QUIZ_PHRASES,
        "diagnose": REPLAY_DIAGNOSE_PHRASES,
        "nextstep": REPLAY_NEXTSTEP_PHRASES,
        "prevstep": REPLAY_PREVSTEP_PHRASES,
        "showbom": REPLAY_SHOWBOM_PHRASES,
        "showserial": REPLAY_SHOWSERIAL_PHRASES,
        "resetcode": REPLAY_RESETCODE_PHRASES,
    }

    # --- Placement templates ---
    REPLAY_PLACE_TEMPLATES = [
        "Metti {comp}", "Aggiungi {comp}", "Piazza {comp}", "Mettimi {comp}",
        "Voglio {comp}", "Dammi {comp}", "Mi serve {comp}", "Ho bisogno di {comp}",
        "Metti {comp} sulla breadboard", "Aggiungi {comp} al circuito",
        "Piazzami {comp}", "Posiziona {comp}", "Inserisci {comp}",
        "Ci metti {comp}?", "Puoi mettere {comp}?", "Aggiungimi {comp}",
        "Manca {comp}, aggiungilo", "Serve {comp}", "Ci vuole {comp}",
        "Mettici {comp}", "Daje metti {comp}", "Su metti {comp}",
    ]

    REPLAY_PLACE_MULTI_TEMPLATES = [
        "Metti {list}", "Aggiungi {list}", "Mi servono {list}",
        "Piazza {list}", "Costruisci un circuito con {list}",
        "Voglio {list} sulla breadboard", "Ho bisogno di {list}",
        "Mettimi {list}", "Dammi {list}", "Prepara {list}",
        "Piazzami {list} per favore", "Costruiscimi {list}",
    ]

    # --- Wiring templates ---
    REPLAY_WIRE_P2P = [
        "Collega {c1} a {c2}", "Metti un filo da {c1} a {c2}",
        "Connetti {c1} con {c2}", "Fai un collegamento tra {c1} e {c2}",
        "Cabla {c1} a {c2}", "Wire da {c1} a {c2}",
        "Collega il pin {p1} di {c1} al pin {p2} di {c2}",
        "Metti un filo tra {c1} pin {p1} e {c2} pin {p2}",
        "Unisci {c1} e {c2}", "Fai un filo tra {c1} e {c2}",
    ]
    REPLAY_WIRE_BUS = [
        "Collega {comp} al bus positivo", "Collega {comp} al bus negativo",
        "Metti {comp} a massa", "Collega {comp} al GND",
        "Collega {comp} al 5V", "Collega {comp} a VCC",
        "Collega {comp} al bus-bot-plus", "Connetti {comp} al bus-bot-minus",
        "Porta {comp} al positivo", "Metti {comp} sul bus GND",
        "{comp} al positivo", "{comp} al negativo", "{comp} a GND",
    ]
    REPLAY_WIRE_WING = [
        "Collega {comp} al pin {wing}", "Metti un filo da {comp} a {wing}",
        "Connetti {comp} al pin digitale {pin}", "Collega {comp} all'analogico {pin}",
        "Fai un filo tra {comp} e il pin {wing}",
        "Porta {comp} al pin {wing} della board",
        "Collega {comp} a {wing}",
    ]

    # --- Navigation templates ---
    REPLAY_LOADEXP_TEMPLATES = [
        "Carica l'esperimento {name}", "Apri {name}", "Vai a {name}",
        "Voglio fare {name}", "Fammi fare {name}", "Carica {name}",
        "Portami a {name}", "Apri l'esperimento {name}", "Mostra {name}",
        "Seleziona {name}", "Facciamo {name}", "Andiamo a {name}",
    ]
    REPLAY_TAB_TEMPLATES = [
        "Apri il {tab}", "Vai al {tab}", "Mostra il {tab}", "Passa al {tab}",
        "Fammi vedere il {tab}", "Apri la scheda {tab}", "Portami al {tab}",
        "Voglio il {tab}", "Vai sulla scheda {tab}",
    ]
    REPLAY_VOLUME_TEMPLATES = [
        "Apri il Volume {n}", "Vai al Volume {n}", "Volume {n}",
        "Mostra il Volume {n}", "Passa al Volume {n}",
        "Voglio il Volume {n}", "Carica il Volume {n}",
    ]
    REPLAY_EDITOR_SWITCH = {
        "scratch": [
            "Passa a Scratch", "Usa Scratch", "Voglio programmare con i blocchi",
            "Apri l'editor Scratch", "Modalita' blocchi", "Passa ai blocchi",
            "Blocchi", "Voglio i blocchi", "Fammi usare Scratch",
            "Metti Scratch", "Apri Scratch", "Blocchetti",
        ],
        "arduino": [
            "Torna ad Arduino", "Usa Arduino C++", "Codice testuale",
            "Passa all'editor Arduino", "Modalita' codice", "Torna al codice",
            "Arduino", "Voglio scrivere il codice", "Fammi usare Arduino",
            "Metti Arduino", "Apri l'editor codice", "C++",
        ],
    }

    # --- Code question templates ---
    REPLAY_CODE_QUESTIONS = [
        "Come si fa a {action}?", "Scrivi il codice per {action}",
        "Programmami {action}", "Codice per {action}",
        "Mi aiuti con il codice per {action}?",
        "Come faccio a {action} con Arduino?", "Voglio {action}",
        "Scrivimi lo sketch per {action}", "Fammi il programma per {action}",
        "Mi scrivi il codice per {action}?", "Come posso {action}?",
    ]
    REPLAY_CODE_ACTIONS = [
        "far lampeggiare un LED", "accendere un LED con il pulsante",
        "leggere il potenziometro", "controllare la luminosita' del LED",
        "suonare una melodia con il buzzer", "muovere il servo",
        "leggere il sensore di luce", "scrivere sul display LCD",
        "usare il Serial Monitor", "fare un semaforo",
        "fare il gioco SOS Morse", "far lampeggiare 3 LED in sequenza",
        "leggere un valore analogico", "usare il PWM per controllare un motore",
        "usare un if-else", "usare un ciclo for", "definire una funzione",
        "usare una variabile", "fare un conto alla rovescia",
        "creare un allarme con il buzzer",
        "controllare il servo con il potenziometro",
        "usare millis invece di delay", "leggere la temperatura",
        "fare un Simon Says", "usare map()",
    ]
    REPLAY_SCRATCH_QUESTIONS = [
        "Come faccio con i blocchi a {action}?",
        "Quale blocco uso per {action}?",
        "In Scratch come si fa {action}?",
        "Con i blocchi posso {action}?",
        "Programmami {action} con Scratch",
        "Blocchi per {action}",
        "Fammi il codice a blocchi per {action}",
    ]
    REPLAY_SCRATCH_ACTIONS = [
        "far lampeggiare un LED", "leggere un sensore",
        "muovere il servo", "accendere un LED",
        "suonare il buzzer", "leggere il potenziometro",
        "controllare un motore", "fare un ciclo",
        "usare una variabile", "aspettare un secondo",
        "scrivere sulla seriale", "usare un if",
    ]

    # --- Tutor: theory topics ---
    REPLAY_THEORY_TEMPLATES = [
        "Cos'e' {topic}?", "Spiegami {topic}", "Come funziona {topic}?",
        "A cosa serve {topic}?", "Cosa fa {topic}?", "Perche' si usa {topic}?",
        "Mi spieghi {topic}?", "Non capisco {topic}", "Che cos'e' {topic}?",
        "Parlami di {topic}", "Vorrei sapere di piu' su {topic}",
    ]
    REPLAY_THEORY_TOPICS = [
        "una resistenza", "un LED", "un condensatore", "un diodo",
        "un transistor", "un potenziometro", "un buzzer", "un motore DC",
        "un servo", "un LED RGB", "la legge di Ohm", "la corrente elettrica",
        "la tensione", "il voltaggio", "la resistenza",
        "i circuiti in serie", "i circuiti in parallelo",
        "la breadboard", "il GND", "il 5V", "il bus positivo", "il bus negativo",
        "il pin digitale", "il pin analogico", "il PWM", "Arduino",
        "il codice Arduino", "la funzione setup", "la funzione loop",
        "digitalWrite", "analogRead", "analogWrite", "delay",
        "il Serial Monitor", "la corrente continua", "gli ampere",
        "i volt", "gli ohm", "i watt", "il cortocircuito", "la polarita'",
        "l'anodo", "il catodo", "la capacita'", "i farad", "la frequenza",
        "il duty cycle", "Scratch", "Blockly", "i blocchi di programmazione",
        "il compilatore", "la fotoresistenza", "il fototransistor",
        "il reed switch", "il display LCD", "la comunicazione seriale",
        "il baud rate",
    ]

    # --- Tutor: comparison pairs ---
    REPLAY_COMPARE_TEMPLATES = [
        "Qual e' la differenza tra {a} e {b}?",
        "Cosa cambia tra {a} e {b}?",
        "Meglio usare {a} o {b}?",
        "{a} e {b} sono la stessa cosa?",
        "Quando uso {a} e quando {b}?",
        "In cosa differiscono {a} e {b}?",
    ]
    REPLAY_COMPARE_PAIRS = [
        ("serie", "parallelo"), ("LED", "buzzer"),
        ("resistenza", "potenziometro"), ("digitale", "analogico"),
        ("input", "output"), ("5V", "3.3V"), ("diodo", "LED"),
        ("motore DC", "servo"), ("Scratch", "Arduino C++"),
        ("corrente", "tensione"), ("condensatore", "resistenza"),
        ("setup", "loop"), ("digitalRead", "analogRead"),
        ("delay", "millis"), ("HIGH", "LOW"),
        ("fotoresistenza", "fototransistor"), ("volt", "ampere"),
        ("PWM", "digitale"), ("anodo", "catodo"),
    ]

    # --- Tutor: debug templates ---
    REPLAY_DEBUG_TEMPLATES = [
        "Il LED non si accende, cosa sbaglio?", "Il circuito non funziona",
        "Non succede niente quando premo play", "Il buzzer non suona",
        "Il motore non gira", "Il codice non compila", "Errore di compilazione",
        "Il servo non si muove", "Il display e' vuoto",
        "Non leggo valori dal sensore", "La resistenza e' troppo alta?",
        "Ho collegato tutto ma non va", "Il LED lampeggia strano",
        "Il serial monitor non mostra nulla", "Il pulsante non risponde",
        "Qualcosa non funziona, aiutami", "Ho un problema con il circuito",
        "C'e' un errore da qualche parte", "Il LED e' collegato al contrario?",
        "Non capisco perche' non va", "Mi da' errore nel codice",
        "Il sensore da' sempre lo stesso valore",
        "Ho sbagliato qualcosa nei collegamenti",
        "Perche' si scalda la resistenza?",
        "Il condensatore e' al contrario?",
        "Il diodo non fa passare corrente",
        "Il LED si accende ma non lampeggia",
        "Il potenziometro non cambia niente",
        "Il motore gira al contrario", "Il circuito fa cortocircuito",
    ]

    # --- Vision templates ---
    REPLAY_VISION_TEMPLATES = [
        "Guarda il mio circuito", "Cosa c'e' di sbagliato?",
        "Controlla se e' collegato bene", "Analizza lo screenshot",
        "Guarda cosa ho fatto", "Vedi se va bene",
        "Dai un'occhiata al circuito", "Dimmi cosa vedi",
        "Controlla il mio lavoro", "Guarda se e' giusto",
        "Foto del circuito, controllala", "Cosa ne pensi del circuito?",
        "Verifica i collegamenti dalla foto", "Guarda questa immagine",
        "Analizza il mio circuito", "Vedi il mio progetto",
        "E' corretto il circuito?", "Controlla dalla foto",
        "Guarda e dimmi se va bene", "Osserva il circuito",
        "Guarda la breadboard", "Cos'e' che non va? Guarda",
        "Verifica dalla foto se manca qualcosa", "Guarda se ho collegato bene",
        "Riesci a vedere il circuito?", "Analizzi la foto?",
        "Controlla i fili dalla foto", "Guarda l'immagine e dimmi",
        "Fammi un check visivo", "Guarda se e' tutto a posto",
        "Osserva bene e dimmi se manca qualcosa",
        "Controllo visivo del circuito", "Vedi qualcosa che non va?",
        "Analizza questa foto del mio circuito",
    ]

    # --- Teacher templates ---
    REPLAY_TEACHER_TEMPLATES = [
        "Mostra i risultati della classe", "Come stanno andando i miei studenti?",
        "Report del quiz", "Statistiche della classe",
        "Quanti hanno fatto il quiz?", "Chi ha preso il voto migliore?",
        "Mostra i progressi degli studenti", "Andamento della classe",
        "Risultati degli esperimenti", "Quanto tempo hanno impiegato?",
        "Mostra le statistiche", "Fammi vedere i risultati",
        "Report di {name}", "Come va {name}?", "Progressi di {name}",
        "Quanto ha fatto {name}?", "Voti del quiz", "Classifica della classe",
        "Media dei voti", "Chi e' rimasto indietro?",
        "Quali studenti hanno finito?", "Mostra il report completo",
        "Andamento quiz per capitolo", "Statistiche per esperimento",
        "Fammi un riassunto dei risultati", "Dashboard della classe",
        "Risultati del test di oggi", "Mostrami gli errori comuni",
        "Chi ha bisogno di aiuto?", "Evidenzia i punti deboli della classe",
    ]

    # --- Off-topic/negation ---
    REPLAY_OFFTOPIC = [
        "Che ore sono?", "Mi piace il calcio", "Cosa mangi a pranzo?",
        "Hai visto Minecraft?", "Giochi a Fortnite?", "Quanti anni hai?",
        "Dove abiti?", "Mi racconti una barzelletta?", "Chi sei?",
        "Sei un robot?", "Sei vero?", "Puoi fare i compiti di matematica?",
        "Qual e' il tuo colore preferito?", "Ti piace la pizza?",
        "Cosa fai nel tempo libero?", "Sai cantare?", "Parlami di te",
        "Conosci ChatGPT?", "Sei meglio di Siri?", "Mi annoio",
        "Non ho voglia di studiare", "Posso giocare?", "Che giorno e' oggi?",
        "Mi aiuti con la tesina?", "Sai giocare a scacchi?",
        "Quanto fa 2+2?", "Chi ha inventato il telefono?",
        "Come si chiama il presidente?", "Che tempo fa domani?",
        "Raccontami una storia", "Dimmi una battuta", "Ciao come stai?",
    ]
    REPLAY_NEGATION_TEMPLATES = [
        "Non avviare la simulazione", "Non compilare", "Non cancellare niente",
        "Non resettare", "Aspetta, non fare nulla", "Fermo, non ho ancora finito",
        "No, non quello", "Non volevo dire quello", "Lascia tutto cosi'",
        "Non cambiare niente", "No stop, non era quello che volevo",
        "Non avviare ancora", "Fermati, non ho chiesto io",
        "Non spostare niente", "Non toccare nulla", "Aspetta, fermo",
        "Stop, non intendevo quello", "Annulla, non era quello",
        "Fermo, aspetta un momento", "No, lascia stare",
    ]

    # ================================================================
    # SUB-GENERATORS
    # ================================================================

    def _replay_actions(count):
        """Generate action command examples for all 14 basic action types."""
        examples = []
        action_types = list(REPLAY_ACTION_PHRASES.keys())
        per_type = max(1, count // len(action_types))
        remainder = count - per_type * len(action_types)

        for act_key in action_types:
            phrases = REPLAY_ACTION_PHRASES[act_key]
            act_data = ACTIONS[act_key]
            num = per_type + (1 if remainder > 0 else 0)
            if remainder > 0:
                remainder -= 1

            for i in range(num):
                phrase = random.choice(phrases)
                phrase = augment_phrase(phrase)
                phrase = apply_typo(phrase, 0.3)

                response = random.choice(act_data["responses"])
                tag = act_data["tag"]
                intent = act_data["intent"]
                entities = list(act_data["entities"])

                examples.append(make_example(
                    user_msg=phrase,
                    intent=intent,
                    entities=entities,
                    actions=[tag],
                    needs_llm=False,
                    response=response,
                    llm_hint=None,
                    ctx=random_context_v6(),
                ))
        random.shuffle(examples)
        return examples[:count]

    def _replay_circuit(count):
        """Generate circuit placement examples: single + multi-component."""
        examples = []
        n_single = count // 2
        n_multi = count - n_single

        # --- Single component placement ---
        for _ in range(n_single):
            comp = random.choice(PLACEABLE)
            aliases = COMPONENT_ALIASES.get(comp, [comp])
            alias = random.choice(aliases)
            tpl = random.choice(REPLAY_PLACE_TEMPLATES)
            phrase = tpl.replace("{comp}", alias)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            intent_obj = json.dumps(
                {"action": "place_and_wire", "components": [{"type": comp}], "wires": "auto"},
                ensure_ascii=False,
            )
            action_tag = f"[INTENT:{intent_obj}]"
            response = random.choice(ACTIONS["place_and_wire"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[comp],
                actions=[action_tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        # --- Multi-component placement (2-5 components) ---
        for _ in range(n_multi):
            num_comps = random.randint(2, 5)
            comps = random.sample(PLACEABLE, min(num_comps, len(PLACEABLE)))
            comp_aliases = []
            comp_types = []
            for c in comps:
                aliases = COMPONENT_ALIASES.get(c, [c])
                comp_aliases.append(random.choice(aliases))
                comp_types.append({"type": c})

            # Build human-readable list
            if len(comp_aliases) == 2:
                list_str = f"{comp_aliases[0]} e {comp_aliases[1]}"
            else:
                list_str = ", ".join(comp_aliases[:-1]) + f" e {comp_aliases[-1]}"

            tpl = random.choice(REPLAY_PLACE_MULTI_TEMPLATES)
            phrase = tpl.replace("{list}", list_str)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            intent_obj = json.dumps(
                {"action": "place_and_wire", "components": comp_types, "wires": "auto"},
                ensure_ascii=False,
            )
            action_tag = f"[INTENT:{intent_obj}]"
            response = random.choice(ACTIONS["place_and_wire"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[c["type"] for c in comp_types],
                actions=[action_tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        random.shuffle(examples)
        return examples[:count]

    def _replay_wiring(count):
        """Generate wiring examples: pin-to-pin, bus, wing."""
        examples = []
        n_p2p = count // 3
        n_bus = count // 3
        n_wing = count - n_p2p - n_bus

        bus_targets = {
            "bus positivo": "bus-bot-plus",
            "bus negativo": "bus-bot-minus",
            "massa": "bus-bot-minus",
            "GND": "bus-bot-minus",
            "5V": "bus-bot-plus",
            "VCC": "bus-bot-plus",
            "bus-bot-plus": "bus-bot-plus",
            "bus-bot-minus": "bus-bot-minus",
        }

        # --- Pin-to-pin ---
        for _ in range(n_p2p):
            c1, c2 = random.sample(PLACEABLE, 2)
            p1 = random.choice(PIN_MAP.get(c1, ["pin1"]))
            p2 = random.choice(PIN_MAP.get(c2, ["pin1"]))
            a1 = random.choice(COMPONENT_ALIASES.get(c1, [c1]))
            a2 = random.choice(COMPONENT_ALIASES.get(c2, [c2]))

            tpl = random.choice(REPLAY_WIRE_P2P)
            phrase = tpl.replace("{c1}", a1).replace("{c2}", a2)
            phrase = phrase.replace("{p1}", p1).replace("{p2}", p2)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            from_pin = f"{c1}:{p1}"
            to_pin = f"{c2}:{p2}"
            wire_tag = f"[AZIONE:addwire:{from_pin}:{to_pin}]"
            response = random.choice(ACTIONS["addwire"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[c1, c2],
                actions=[wire_tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        # --- Bus connections ---
        for _ in range(n_bus):
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            pin = random.choice(PIN_MAP.get(comp, ["pin1"]))

            tpl = random.choice(REPLAY_WIRE_BUS)
            # Extract bus target from template
            phrase = tpl.replace("{comp}", alias)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            # Determine bus target
            bus_key = random.choice(["bus-bot-plus", "bus-bot-minus"])
            from_pin = f"{comp}:{pin}"
            wire_tag = f"[AZIONE:addwire:{from_pin}:{bus_key}]"
            response = random.choice(ACTIONS["addwire"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[comp],
                actions=[wire_tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        # --- Wing pin connections ---
        for _ in range(n_wing):
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            pin = random.choice(PIN_MAP.get(comp, ["pin1"]))
            wing = random.choice(WING_PINS)
            dig_pin = wing.replace("W_", "")

            tpl = random.choice(REPLAY_WIRE_WING)
            phrase = tpl.replace("{comp}", alias).replace("{wing}", wing).replace("{pin}", dig_pin)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            from_pin = f"{comp}:{pin}"
            wire_tag = f"[AZIONE:addwire:{from_pin}:{wing}]"
            response = random.choice(ACTIONS["addwire"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[comp],
                actions=[wire_tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        random.shuffle(examples)
        return examples[:count]

    def _replay_navigation(count):
        """Generate navigation examples: loadexp, opentab, openvolume, editor switch."""
        examples = []
        n_loadexp = int(count * 100 / 300)
        n_opentab = int(count * 100 / 300)
        n_volume = int(count * 50 / 300)
        n_editor = count - n_loadexp - n_opentab - n_volume

        # --- Load experiment ---
        for _ in range(n_loadexp):
            exp_id = random.choice(EXPERIMENTS)
            exp_name = EXP_NAMES.get(exp_id, exp_id)
            tpl = random.choice(REPLAY_LOADEXP_TEMPLATES)
            phrase = tpl.replace("{name}", exp_name)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            tag = f"[AZIONE:loadexp:{exp_id}]"
            response = random.choice(ACTIONS["loadexp"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[exp_id],
                actions=[tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        # --- Open tab ---
        for _ in range(n_opentab):
            tab = random.choice(TABS)
            aliases = TAB_ALIASES.get(tab, [tab])
            alias = random.choice(aliases)
            tpl = random.choice(REPLAY_TAB_TEMPLATES)
            phrase = tpl.replace("{tab}", alias)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            tag = f"[AZIONE:opentab:{tab}]"
            response = random.choice(ACTIONS["opentab"]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[tab],
                actions=[tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        # --- Open volume ---
        for _ in range(n_volume):
            vol = random.randint(1, 3)
            tpl = random.choice(REPLAY_VOLUME_TEMPLATES)
            phrase = tpl.replace("{n}", str(vol))
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            tag = f"[AZIONE:openvolume:{vol}]"
            response = random.choice(ACTIONS["openvolume"]["responses"]).replace("{n}", str(vol))

            examples.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        # --- Editor switching ---
        for _ in range(n_editor):
            mode = random.choice(["scratch", "arduino"])
            phrase = random.choice(REPLAY_EDITOR_SWITCH[mode])
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            act_key = f"switcheditor_{mode}"
            tag = f"[AZIONE:switcheditor:{mode}]"
            response = random.choice(ACTIONS[act_key]["responses"])

            examples.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=random_context_v6(editor_mode="scratch" if mode == "arduino" else "arduino"),
            ))

        random.shuffle(examples)
        return examples[:count]

    def _replay_code(count):
        """Generate code question examples (Arduino + Scratch). All needs_llm=true."""
        examples = []
        n_arduino = int(count * 0.65)
        n_scratch = count - n_arduino

        # --- Arduino code questions ---
        for _ in range(n_arduino):
            action = random.choice(REPLAY_CODE_ACTIONS)
            tpl = random.choice(REPLAY_CODE_QUESTIONS)
            phrase = tpl.replace("{action}", action)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="code",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Lo studente chiede codice Arduino per: {action}",
                ctx=random_context_v6(editor_mode="arduino"),
            ))

        # --- Scratch code questions ---
        for _ in range(n_scratch):
            action = random.choice(REPLAY_SCRATCH_ACTIONS)
            tpl = random.choice(REPLAY_SCRATCH_QUESTIONS)
            phrase = tpl.replace("{action}", action)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="code",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Lo studente chiede codice Scratch/Blockly per: {action}",
                ctx=random_context_v6(editor_mode="scratch"),
            ))

        random.shuffle(examples)
        return examples[:count]

    def _replay_tutor(count):
        """Generate tutor question examples: theory, comparison, debug. All needs_llm=true."""
        examples = []
        n_theory = int(count * 250 / 600)
        n_compare = int(count * 150 / 600)
        n_debug = count - n_theory - n_compare

        # --- Theory questions ---
        for _ in range(n_theory):
            topic = random.choice(REPLAY_THEORY_TOPICS)
            tpl = random.choice(REPLAY_THEORY_TEMPLATES)
            phrase = tpl.replace("{topic}", topic)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="tutor",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Lo studente chiede una spiegazione su: {topic}",
                ctx=random_context_v6(),
            ))

        # --- Comparison questions ---
        for _ in range(n_compare):
            a, b = random.choice(REPLAY_COMPARE_PAIRS)
            tpl = random.choice(REPLAY_COMPARE_TEMPLATES)
            phrase = tpl.replace("{a}", a).replace("{b}", b)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="tutor",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Lo studente chiede un confronto tra {a} e {b}",
                ctx=random_context_v6(),
            ))

        # --- Debug questions ---
        for _ in range(n_debug):
            phrase = random.choice(REPLAY_DEBUG_TEMPLATES)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="tutor",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Lo studente ha un problema col circuito e chiede aiuto per il debug",
                ctx=random_context_v6(),
            ))

        random.shuffle(examples)
        return examples[:count]

    def _replay_vision(count):
        """Generate vision request examples. All needs_llm=true, intent=vision."""
        examples = []
        for _ in range(count):
            phrase = random.choice(REPLAY_VISION_TEMPLATES)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="vision",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Lo studente chiede analisi visiva del circuito/screenshot",
                ctx=random_context_v6(),
            ))
        return examples

    def _replay_teacher(count):
        """Generate teacher request examples. All needs_llm=true, intent=teacher."""
        examples = []
        for _ in range(count):
            tpl = random.choice(REPLAY_TEACHER_TEMPLATES)
            # Fill {name} if present
            if "{name}" in tpl:
                name = random.choice(KID_NAMES)
                phrase = tpl.replace("{name}", name)
            else:
                phrase = tpl
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="teacher",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Richiesta pedagogica: statistiche, report, progressi studenti",
                ctx=random_context_v6(),
            ))
        return examples

    def _replay_offtopic(count):
        """Generate off-topic and negation examples."""
        examples = []
        n_offtopic = count // 2
        n_negation = count - n_offtopic

        # --- Off-topic (needs_llm=true, intent=tutor) ---
        for _ in range(n_offtopic):
            phrase = random.choice(REPLAY_OFFTOPIC)
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="tutor",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Messaggio off-topic. Rispondi brevemente e riporta lo studente all'elettronica.",
                ctx=random_context_v6(),
            ))

        # --- Negations (needs_llm=false, intent=action) ---
        for _ in range(n_negation):
            tpl = random.choice(REPLAY_NEGATION_TEMPLATES)
            if "{comp}" in tpl:
                comp = random.choice(PLACEABLE)
                alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
                phrase = tpl.replace("{comp}", alias)
            else:
                phrase = tpl
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, 0.3)

            examples.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response="Ok, non faccio nulla.",
                llm_hint=None,
                ctx=random_context_v6(),
            ))

        random.shuffle(examples)
        return examples[:count]

    # ================================================================
    # MAIN REPLAY ORCHESTRATION
    # ================================================================

    # Target distribution (proportional to n, base is 3000)
    scale = n / 3000.0
    targets = {
        "actions":    int(420 * scale),
        "circuit":    int(400 * scale),
        "wiring":     int(300 * scale),
        "navigation": int(300 * scale),
        "code":       int(400 * scale),
        "tutor":      int(600 * scale),
        "vision":     int(200 * scale),
        "teacher":    int(200 * scale),
        "offtopic":   int(180 * scale),
    }

    # Adjust to hit exact n
    total_targeted = sum(targets.values())
    diff = n - total_targeted
    if diff != 0:
        # Add/subtract from the largest category (tutor)
        targets["tutor"] += diff

    # Generate all sub-layers
    all_examples = []
    all_examples.extend(_replay_actions(targets["actions"]))
    all_examples.extend(_replay_circuit(targets["circuit"]))
    all_examples.extend(_replay_wiring(targets["wiring"]))
    all_examples.extend(_replay_navigation(targets["navigation"]))
    all_examples.extend(_replay_code(targets["code"]))
    all_examples.extend(_replay_tutor(targets["tutor"]))
    all_examples.extend(_replay_vision(targets["vision"]))
    all_examples.extend(_replay_teacher(targets["teacher"]))
    all_examples.extend(_replay_offtopic(targets["offtopic"]))

    # Shuffle and trim to exact n
    random.shuffle(all_examples)
    return all_examples[:n]


def gen_layer_direct_action(n):
    """Layer 2: Tutte le 42 azioni dirette con varianti massive.
    Per ogni azione: frasi base, typo, augmentation, kid slang.
    ~4200 examples across 42 actions x ~100 variants each.
    """

    # ==============================================================
    # Helper: generate N unique examples for a given action key
    # ==============================================================
    def _gen_variants(action_key, templates, count, param_fn=None):
        """Generate `count` unique examples for a single action.

        action_key: key into ACTIONS dict
        templates: list of base phrase strings (or callables returning str)
        count: how many examples to generate
        param_fn: optional callable() -> (phrase_str, tag_str, entities_list)
                  if provided, templates is ignored and param_fn is called each time
        """
        info = ACTIONS[action_key]
        results = []
        seen = set()
        attempts = 0
        max_attempts = count * 6  # safety valve

        while len(results) < count and attempts < max_attempts:
            attempts += 1

            if param_fn:
                phrase, tag, entities = param_fn()
            else:
                phrase = random.choice(templates)
                tag = info["tag"]
                entities = info.get("entities", [])
                # Clean placeholder entities
                entities = [e for e in entities if not e.startswith("{")]

            # Augment and typo
            phrase = augment_phrase(phrase)
            phrase = apply_typo(phrase, probability=0.3)

            # Dedup on lowercase stripped
            key = phrase.strip().lower()
            if key in seen:
                continue
            seen.add(key)

            response = random.choice(info["responses"])
            ctx = random_context_v6()

            actions_list = [tag] if not tag.startswith("[INTENT:") else [tag]

            ex = make_example(
                user_msg=phrase,
                intent=info["intent"],
                entities=entities,
                actions=actions_list,
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=ctx,
            )
            results.append(ex)

        return results

    # ==============================================================
    # 1. Simulation Control — 6 actions x 120 = 720
    # ==============================================================
    def _direct_sim_control(n_target=720):
        per_action = n_target // 6

        PLAY_PHRASES = [
            "Avvia", "Avvia la simulazione", "Play", "Start", "Vai", "Fai partire",
            "Accendi", "Fai partire il circuito", "Lancia la simulazione", "Metti in moto",
            "Premi play", "Fallo andare", "Daje!", "Via!", "Parti!", "Accendilo",
            "Fai girare", "Attiva", "Dai che si parte", "Andiamo!", "Proviamo",
            "Testiamo il circuito", "Facciamo andare", "OK avvia", "Si parte", "Go!",
            "Run it", "Let's go", "Fire it up", "Ho finito di montare, avvia",
            "Fammelo vedere in azione", "Aziona il circuito", "Metti in funzione",
            "Fammi vedere come va", "Partiamo!", "Iniziamo!", "Mandalo", "Prova!",
            "Vediamo se funziona", "Fallo funzionare", "Si puo' far partire?",
            "Accendi tutto", "Manda avanti", "Fai il start", "Press play",
            "Dai fallo andare", "Fai andare quella cosa del circuito",
            "Avviami la simulazione", "Fai partire per favore", "Accendimi il circuito",
        ]
        PAUSE_PHRASES = [
            "Stop", "Ferma", "Pausa", "Metti in pausa", "Ferma tutto", "Fermalo",
            "Stoppa", "Blocca", "Fermati", "Basta", "Premi stop", "Spegni", "Alt",
            "Aspetta", "Fermo!", "Stoppalo!", "Basta cosi'", "Ok basta",
            "Fermati un attimo", "Frena", "Stoppami tutto", "Blocca tutto",
            "Pause", "Hold", "Halt", "Stop it", "Fermami tutto", "Un attimo",
            "Wait", "No no ferma!", "Blocca blocca!", "Stai fermo", "Aspe'",
            "Ferma un secondo", "Fermala", "Basta fermati", "Stop stop",
            "Ferma la simulazione", "Spegni tutto", "Premi pausa", "Metti pausa",
            "Sospendi", "Fai pausa", "Interrompi", "Freezalo", "Congela",
            "Spegni la simulazione", "Ferma il circuito", "Blocca la simulazione",
        ]
        RESET_PHRASES = [
            "Reset", "Resetta", "Resetta il circuito", "Ripristina", "Ricomincia",
            "Ricomincia da capo", "Resetta tutto", "Rimetti a zero", "Reimposta",
            "Da capo", "Daccapo", "Dall'inizio", "Ricominciamo", "Azzera",
            "Azzera tutto", "Fai reset", "Premi reset", "Resettiamo", "Come prima",
            "Rifai da capo", "Riportami alla situazione iniziale", "Restart",
            "Torna allo stato originale", "Riparti da zero", "Rimetti tutto a posto",
            "Resettami", "Fai un reset", "Rimetti com'era", "Riavvia",
            "Riavvia il circuito", "Riporta tutto all'inizio", "Stato iniziale",
            "Torna all'inizio", "Fai ripartire", "Ricomincio", "Ricominciamo tutto",
        ]
        CLEARALL_PHRASES = [
            "Cancella tutto", "Pulisci tutto", "Svuota", "Svuota tutto", "Togli tutto",
            "Rimuovi tutto", "Elimina tutto", "Pulisci la breadboard",
            "Svuota la breadboard", "Via tutto", "Butta via tutto", "Sgombra",
            "Fai piazza pulita", "Tabula rasa", "Leva tutto", "Spazza via",
            "Sparecchia", "Ripulisci", "Togli tutta sta roba",
            "Voglio ricominciare da zero", "Voglio una breadboard vuota",
            "Toglimi tutto di mezzo", "Via via tutto", "Clear all", "Pulisci",
            "Cancella", "Elimina tutto quanto", "Fai piazza pulita sulla breadboard",
            "Spazza via tutto", "Leva tutto dalla breadboard", "Nuke",
            "Distruggi tutto", "Cancella tutti i componenti", "Rimuovi tutto dal circuito",
        ]
        UNDO_PHRASES = [
            "Annulla", "Undo", "Torna indietro", "Ctrl Z", "Annulla l'ultima cosa",
            "Indietro", "Torna come prima", "Annullami", "Fai ctrl z",
            "Annulla l'ultima azione", "Rimetti come prima", "Non volevo",
            "Ho sbagliato, annulla", "Back", "Annulla quello che ho fatto",
            "Torna un passo indietro", "Annulla l'ultimo step",
            "Disfa", "Disfa quello", "Annulla tutto", "Cancella l'ultima mossa",
            "Passo indietro", "Vai indietro", "Undo undo", "Annulla annulla",
            "Rimettilo com'era", "Ops annulla", "No no annulla", "Undo please",
            "Annullami l'ultimo cambiamento", "Ctrl+Z",
        ]
        REDO_PHRASES = [
            "Rifai", "Redo", "Ripeti", "Rimetti quello che ho tolto", "Ctrl Y",
            "Ripristina", "Rimetti", "Ripeti l'azione", "Rifallo",
            "Rifai quello che ho annullato", "Mettilo di nuovo", "Redo redo",
            "Ripristina l'azione", "Avanti", "Fai redo", "Ripeti l'ultima",
            "Riesegui", "Riapplica", "Rimetti come avevo fatto", "Ripeti dai",
            "Ridai", "Ctrl+Y", "Rifai l'ultima cosa", "Ripristina l'ultimo annullamento",
            "Rimetti quello", "Ripetimi l'azione", "Annulla l'annulla",
            "Disfa l'annulla", "Ripeti quello che avevo fatto",
        ]

        results = []
        for key, phrases in [("play", PLAY_PHRASES), ("pause", PAUSE_PHRASES),
                              ("reset", RESET_PHRASES), ("clearall", CLEARALL_PHRASES),
                              ("undo", UNDO_PHRASES), ("redo", REDO_PHRASES)]:
            results.extend(_gen_variants(key, phrases, per_action))
        return results

    # ==============================================================
    # 2. Compile & Editor — 7 actions x 100 = 700
    # ==============================================================
    def _direct_compile_editor(n_target=700):
        per_action = n_target // 7

        COMPILE_PHRASES = [
            "Compila", "Compila il codice", "Compila lo sketch", "Verifica il codice",
            "Controlla il codice", "Build", "Prova a compilare", "Lancia la compilazione",
            "Vedi se il codice e' giusto", "Testami il codice", "Compilalo",
            "Fai il build", "Manda in compilazione", "Verifica lo sketch",
            "Compile", "Compilazione", "Fai verify", "Controlla lo sketch",
            "Verifica", "Fai la verifica", "Testa il codice", "Prova il codice",
            "Compila e vedi se funziona", "Manda a compilare", "Buildiamo",
            "Fai un build", "Fai compilare il programma",
        ]
        OPENEDITOR_PHRASES = [
            "Apri l'editor", "Editor", "Mostrami l'editor", "Apri il codice",
            "Fammi vedere il codice", "Voglio scrivere codice", "Apri editor",
            "Editor codice", "Mostra l'editor", "Apri l'editor del codice",
            "Voglio l'editor", "Apri il pannello codice", "Fai vedere l'editor",
            "Apri il programma", "Mostrami dove scrivo il codice", "Open editor",
            "Dov'e' l'editor?", "Fammi l'editor", "Aprimi l'editor",
            "Voglio programmare", "Apri la finestra del codice", "Editor please",
            "Code editor", "Mostra codice", "Aprimi il codice",
        ]
        CLOSEEDITOR_PHRASES = [
            "Chiudi l'editor", "Nascondi l'editor", "Chiudi il codice",
            "Via l'editor", "Togli l'editor", "Chiudi editor", "Chiudi il pannello",
            "Nascondi il codice", "Togli il pannello codice", "Close editor",
            "Non serve piu' l'editor", "Chiudimi l'editor", "Basta codice",
            "Nascondi il pannello", "Chiudi la finestra del codice", "Via il codice",
            "Sparisci editor", "Togli il codice", "Editor via", "Metti via l'editor",
            "Rimuovi l'editor", "Non mi serve l'editor",
        ]
        SWITCH_SCRATCH_PHRASES = [
            "Passa a Scratch", "Usa Scratch", "Voglio programmare con i blocchi",
            "Apri l'editor Scratch", "Modalita' blocchi", "Passa ai blocchi",
            "Blocchi", "Voglio i blocchi", "Fammi usare Scratch", "Metti Scratch",
            "Apri Scratch", "Blocchetti", "Voglio programmare con i blocchetti",
            "Switch a Scratch", "Scratch mode", "Metti i blocchetti",
            "Programma a blocchi", "Fammi i blocchi", "Editor a blocchi",
            "Visual editor", "Drag and drop", "Programmazione visuale",
            "Passa alla modalita' blocchi", "Voglio il drag and drop",
            "Metti la programmazione a blocchi", "Scratch!", "Blocchini",
        ]
        SWITCH_ARDUINO_PHRASES = [
            "Torna ad Arduino", "Usa Arduino C++", "Codice testuale",
            "Passa all'editor Arduino", "Modalita' codice", "Torna al codice",
            "Arduino", "Voglio scrivere il codice", "Fammi usare Arduino",
            "Metti Arduino", "Apri l'editor codice", "C++", "Torna al testo",
            "Switch ad Arduino", "Arduino mode", "Scrivi in Arduino",
            "Modalita' C++", "Programmazione testuale", "Codice C++",
            "Voglio scrivere in C++", "Editor testuale", "Testo", "Passa al C++",
            "Text editor", "Codice Arduino", "Fammi scrivere il codice a mano",
        ]
        RESETCODE_PHRASES = [
            "Resetta il codice", "Codice originale", "Rimetti il codice di default",
            "Codice iniziale", "Reset code", "Rimetti il codice originale",
            "Codice di partenza", "Ripristina il codice", "Rimetti il codice base",
            "Fai reset del codice", "Togli le modifiche al codice",
            "Cancella le modifiche", "Rimetti lo sketch originale",
            "Ripristina lo sketch", "Default code", "Codice default",
            "Torna al codice originale", "Resettami il codice", "Codice di fabbrica",
            "Codice stock", "Rimetti com'era il codice", "Ricomincia il codice",
        ]
        GETCODE_PHRASES = [
            "Mostrami il codice", "Fammi vedere il codice", "Che codice c'e'?",
            "Qual e' il codice attuale?", "Dammi il codice", "Codice corrente",
            "Get code", "Leggi il codice", "Cosa c'e' nell'editor?",
            "Che programma c'e'?", "Mostra il programma", "Fammi leggere il codice",
            "Recupera il codice", "Dammi lo sketch", "Che sketch c'e'?",
            "Mostrami lo sketch attuale", "Leggi lo sketch", "Dimmi il codice",
            "Che codice ho scritto?", "Fammi vedere lo sketch", "Show me the code",
        ]

        results = []
        for key, phrases in [
            ("compile", COMPILE_PHRASES),
            ("openeditor", OPENEDITOR_PHRASES),
            ("closeeditor", CLOSEEDITOR_PHRASES),
            ("switcheditor_scratch", SWITCH_SCRATCH_PHRASES),
            ("switcheditor_arduino", SWITCH_ARDUINO_PHRASES),
            ("resetcode", RESETCODE_PHRASES),
            ("getcode", GETCODE_PHRASES),
        ]:
            results.extend(_gen_variants(key, phrases, per_action))
        return results

    # ==============================================================
    # 3. Navigation — 5 actions x 100 = 500
    # ==============================================================
    def _direct_navigation(n_target=500):
        per_action = n_target // 5

        # --- loadexp: parametric ---
        LOADEXP_TEMPLATES = [
            "Carica {name}", "Apri {name}", "Vai a {name}", "Voglio fare {name}",
            "Fammi fare {name}", "Portami a {name}", "Apri l'esperimento {name}",
            "Mostra {name}", "Seleziona {name}", "Facciamo {name}",
            "Andiamo a {name}", "Carica l'esperimento {name}",
            "Vorrei fare {name}", "Carichiamo {name}", "Metti {name}",
            "Fammi {name}", "Iniziamo con {name}", "Apri il progetto {name}",
            "Caricami {name}", "Vai all'esperimento {name}",
            "Prova a caricare {name}", "Apri per favore {name}",
            "Facciamo l'esperimento {name}", "Lavoriamo su {name}",
        ]

        def _loadexp_param():
            exp_id = random.choice(EXPERIMENTS)
            name = EXP_NAMES.get(exp_id, exp_id)
            template = random.choice(LOADEXP_TEMPLATES)
            phrase = template.format(name=name)
            tag = f"[AZIONE:loadexp:{exp_id}]"
            return phrase, tag, [exp_id]

        # --- opentab: parametric ---
        OPENTAB_TEMPLATES = [
            "Apri il {tab}", "Vai al {tab}", "Mostra il {tab}", "Passa al {tab}",
            "Fammi vedere il {tab}", "Apri la scheda {tab}", "Portami al {tab}",
            "Voglio il {tab}", "Vai sulla scheda {tab}", "Aprimi il {tab}",
            "Apri {tab}", "Mostrami {tab}", "Voglio andare al {tab}",
            "Fai vedere {tab}", "Portami su {tab}", "Switch al {tab}",
            "Cambia al {tab}", "Metti il {tab}", "Vai su {tab}",
        ]
        OPENTAB_SPECIFIC = {
            "simulator": ["Fammi vedere il simulatore", "Torna alla breadboard",
                          "Mostra il circuito", "Voglio il simulatore",
                          "Apri il sim", "Portami al simulatore"],
            "canvas": ["Voglio disegnare", "Apri la lavagna", "Fammi disegnare",
                       "Apri il canvas", "Disegniamo", "Dove disegno?"],
            "detective": ["Gioca a detective", "Trova il guasto", "Gioco detective",
                          "Facciamo il detective", "Apri trova il guasto"],
            "poe": ["Prevedi e spiega", "Gioco previsione", "Facciamo prevedi e spiega",
                    "Apri il gioco POE", "Proviamo a prevedere"],
            "reverse": ["Circuito misterioso", "Apri il mistero", "Facciamo il mistero",
                        "Apri reverse engineering", "Circuito segreto"],
            "taccuini": ["Apri il quaderno", "Voglio gli appunti", "Fammi vedere le note",
                         "Apri il taccuino", "Notebook", "I miei appunti"],
            "editor": ["Apri l'editor", "Mostrami il codice", "Voglio il codice",
                       "Fammi programmare", "Dove scrivo il codice?"],
            "video": ["Mostrami il video", "Apri il video", "Voglio vedere il video",
                      "Fammi vedere il filmato", "C'e' un video?"],
            "manual": ["Apri il manuale", "Mostrami il libro", "Dove sono le istruzioni?",
                       "Fammi vedere la guida", "Apri la guida"],
            "review": ["Controlla il circuito", "Facciamo la review", "Verifica il mio lavoro",
                       "Apri la verifica", "Review del circuito"],
        }

        def _opentab_param():
            tab_key = random.choice(TABS)
            # 50% use template + alias, 50% use specific phrases
            if random.random() < 0.5 and tab_key in OPENTAB_SPECIFIC:
                phrase = random.choice(OPENTAB_SPECIFIC[tab_key])
            else:
                alias = random.choice(TAB_ALIASES.get(tab_key, [tab_key]))
                template = random.choice(OPENTAB_TEMPLATES)
                phrase = template.format(tab=alias)
            tag = f"[AZIONE:opentab:{tab_key}]"
            return phrase, tag, [tab_key]

        # --- openvolume: parametric ---
        OPENVOLUME_TEMPLATES = [
            "Apri il Volume {n}", "Vai al Volume {n}", "Volume {n}",
            "Mostra il Volume {n}", "Passa al Volume {n}", "Voglio il Volume {n}",
            "Carica il Volume {n}", "Metti il Volume {n}", "Cambia al Volume {n}",
            "Aprimi il Volume {n}", "Portami al Volume {n}", "Switch al Volume {n}",
            "Andiamo al Volume {n}", "Fammi il Volume {n}",
            "Voglio lavorare col Volume {n}", "Seleziona Volume {n}",
            "Libro {n}", "Vol {n}", "Vol. {n}", "Volume numero {n}",
        ]

        def _openvolume_param():
            vol_n = random.randint(1, 3)
            template = random.choice(OPENVOLUME_TEMPLATES)
            phrase = template.format(n=vol_n)
            tag = f"[AZIONE:openvolume:{vol_n}]"
            return phrase, tag, []

        # --- nextstep ---
        NEXTSTEP_PHRASES = [
            "Avanti", "Prossimo passo", "Prossimo step", "Vai avanti",
            "Next", "Next step", "Continua", "Andiamo avanti",
            "Passo successivo", "Step dopo", "Prossimo", "Vai al prossimo",
            "Step avanti", "Fammi andare avanti", "Andiamo al prossimo",
            "Prosegui", "Procedi", "Fai avanti", "Un altro passo",
            "Successivo", "Il passo dopo", "Avanza", "Forward",
            "Prossimo passaggio", "Step successivo", "Dammi il prossimo passo",
        ]

        # --- prevstep ---
        PREVSTEP_PHRASES = [
            "Indietro", "Passo precedente", "Step precedente",
            "Torna indietro", "Previous", "Back", "Passo prima",
            "Step prima", "Vai indietro", "Torna al passo prima",
            "Precedente", "Vai al precedente", "Step indietro",
            "Fammi tornare indietro", "Torniamo indietro", "Un passo indietro",
            "Backward", "Ritorna", "Lo step di prima", "Ridammi il passo prima",
            "Torna allo step precedente", "Fai indietro",
        ]

        results = []
        results.extend(_gen_variants("loadexp", [], per_action, param_fn=_loadexp_param))
        results.extend(_gen_variants("opentab", [], per_action, param_fn=_opentab_param))
        results.extend(_gen_variants("openvolume", [], per_action, param_fn=_openvolume_param))
        results.extend(_gen_variants("nextstep", NEXTSTEP_PHRASES, per_action))
        results.extend(_gen_variants("prevstep", PREVSTEP_PHRASES, per_action))
        return results

    # ==============================================================
    # 4. Component Operations — 6 actions x 110 = 660
    # ==============================================================
    def _direct_component_ops(n_target=660):
        per_action = n_target // 6

        # --- place_and_wire: parametric ---
        PLACE_TEMPLATES = [
            "Metti {comp}", "Aggiungi {comp}", "Piazza {comp}", "Mettimi {comp}",
            "Voglio {comp}", "Dammi {comp}", "Mi serve {comp}", "Ho bisogno di {comp}",
            "Metti {comp} sulla breadboard", "Aggiungi {comp} al circuito",
            "Piazzami {comp}", "Posiziona {comp}", "Inserisci {comp}",
            "Ci metti {comp}?", "Puoi mettere {comp}?", "Aggiungimi {comp}",
            "Manca {comp}, aggiungilo", "Serve {comp}", "Ci vuole {comp}",
            "Daje metti {comp}", "Mettici {comp}", "Su metti {comp}",
            "Pianta {comp} sulla breadboard", "Ficca {comp} sulla breadboard",
        ]
        PLACE_MULTI_TEMPLATES = [
            "Metti {list}", "Aggiungi {list}", "Mi servono {list}",
            "Piazza {list}", "Costruisci un circuito con {list}",
            "Voglio {list} sulla breadboard", "Ho bisogno di {list}",
            "Mettimi {list}", "Dammi {list}", "Prepara {list}",
        ]

        def _place_param():
            # 70% single component, 30% multi
            if random.random() < 0.7:
                comp = random.choice(PLACEABLE)
                alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
                template = random.choice(PLACE_TEMPLATES)
                phrase = template.format(comp=alias)
                entities = [comp]
            else:
                n_comps = random.randint(2, 4)
                comps = random.sample(PLACEABLE, min(n_comps, len(PLACEABLE)))
                aliases = [random.choice(COMPONENT_ALIASES.get(c, [c])) for c in comps]
                if len(aliases) == 2:
                    comp_list = f"{aliases[0]} e {aliases[1]}"
                else:
                    comp_list = ", ".join(aliases[:-1]) + f" e {aliases[-1]}"
                template = random.choice(PLACE_MULTI_TEMPLATES)
                phrase = template.format(list=comp_list)
                entities = comps

            intent_json = json.dumps({"tipo": entities[0] if len(entities) == 1 else entities}, ensure_ascii=False)
            tag = f"[INTENT:place_and_wire]"
            return phrase, tag, entities

        # --- removecomponent: parametric ---
        REMOVE_TEMPLATES = [
            "Togli {comp}", "Rimuovi {comp}", "Elimina {comp}", "Via {comp}",
            "Leva {comp}", "Cancella {comp}", "Butta via {comp}",
            "Non mi serve {comp}, toglilo", "Rimuovimi {comp}",
            "Togli {comp} dal circuito", "Elimina {comp} dalla breadboard",
            "Via {comp} dalla breadboard", "Toglimi {comp}",
            "Rimuovi {comp} per favore", "Leva via {comp}", "Sparisci {comp}",
            "Non voglio piu' {comp}", "Porta via {comp}", "Caccia {comp}",
        ]

        def _remove_param():
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(REMOVE_TEMPLATES)
            phrase = template.format(comp=alias)
            tag = f"[AZIONE:removecomponent:{comp}]"
            return phrase, tag, [comp]

        # --- movecomponent: parametric ---
        MOVE_TEMPLATES = [
            "Sposta {comp} a {dir}", "Muovi {comp} {dir}", "Metti {comp} piu' {dir}",
            "Sposta {comp} verso {dir}", "Porta {comp} {dir}",
            "Trascina {comp} {dir}", "Fai scorrere {comp} {dir}",
            "Muovi {comp} un po' {dir}", "{comp} spostalo {dir}",
            "Posiziona {comp} piu' {dir}", "Cambia posizione a {comp}, {dir}",
        ]
        DIRECTIONS = ["su", "giu'", "a sinistra", "a destra", "in alto", "in basso",
                       "up", "down", "left", "right"]

        def _move_param():
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            direction = random.choice(DIRECTIONS)
            template = random.choice(MOVE_TEMPLATES)
            phrase = template.format(comp=alias, dir=direction)
            tag = f"[AZIONE:movecomponent:{comp}:{direction}]"
            return phrase, tag, [comp]

        # --- setvalue: parametric ---
        SETVALUE_TEMPLATES = [
            "Metti {comp} a {val}", "Imposta {comp} a {val}",
            "Cambia {comp} a {val}", "Setta {comp} a {val}",
            "Il valore di {comp} deve essere {val}", "Modifica {comp}: {val}",
            "Metti la {comp} a {val}", "Imposta il valore di {comp} a {val}",
            "Cambia il valore: {comp} = {val}", "Fai {comp} = {val}",
        ]
        VALUE_EXAMPLES = [
            ("resistor", "resistance", "220 ohm"), ("resistor", "resistance", "1k ohm"),
            ("resistor", "resistance", "10k ohm"), ("resistor", "resistance", "4.7k"),
            ("resistor", "resistance", "330 ohm"), ("resistor", "resistance", "100 ohm"),
            ("capacitor", "capacitance", "100uF"), ("capacitor", "capacitance", "10uF"),
            ("capacitor", "capacitance", "47uF"), ("led", "color", "rosso"),
            ("led", "color", "verde"), ("led", "color", "blu"),
            ("led", "color", "giallo"), ("servo", "angle", "90 gradi"),
            ("servo", "angle", "0 gradi"), ("servo", "angle", "180 gradi"),
            ("servo", "angle", "45 gradi"), ("potentiometer", "value", "50%"),
            ("potentiometer", "value", "0"), ("potentiometer", "value", "100%"),
        ]

        def _setvalue_param():
            comp, param, val = random.choice(VALUE_EXAMPLES)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(SETVALUE_TEMPLATES)
            phrase = template.format(comp=alias, val=val)
            tag = f"[AZIONE:setvalue:{comp}:{param}:{val}]"
            return phrase, tag, [comp]

        # --- highlight: parametric ---
        HIGHLIGHT_TEMPLATES = [
            "Mostrami dove e' {comp}", "Evidenzia {comp}", "Dov'e' {comp}?",
            "Fammi vedere {comp}", "Indica {comp}", "Dove si trova {comp}?",
            "Illumina {comp}", "Segnami {comp}", "Trova {comp}",
            "Cerchia {comp}", "Metti in evidenza {comp}", "Spotlight su {comp}",
            "Indicami {comp}", "Dove sta {comp}?", "Highlight {comp}",
            "Fai brillare {comp}", "Segnalami {comp}", "Marca {comp}",
        ]

        def _highlight_param():
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(HIGHLIGHT_TEMPLATES)
            phrase = template.format(comp=alias)
            tag = f"[AZIONE:highlight:{comp}]"
            return phrase, tag, [comp]

        # --- highlightpin: parametric ---
        HIGHLIGHTPIN_TEMPLATES = [
            "Mostrami il pin {pin} di {comp}", "Dov'e' il pin {pin} di {comp}?",
            "Evidenzia il {pin} di {comp}", "Fammi vedere il {pin} di {comp}",
            "Indica il pin {pin} su {comp}", "Quale e' il {pin} di {comp}?",
            "Segnami il {pin} di {comp}", "Dove sta il pin {pin} di {comp}?",
            "Mostra {pin} su {comp}", "Illumina il pin {pin} del {comp}",
        ]

        def _highlightpin_param():
            comp = random.choice([c for c in PLACEABLE if c in PIN_MAP])
            pins = PIN_MAP[comp]
            pin = random.choice(pins)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(HIGHLIGHTPIN_TEMPLATES)
            phrase = template.format(pin=pin, comp=alias)
            tag = f"[AZIONE:highlightpin:{comp}:{pin}]"
            return phrase, tag, [comp, pin]

        results = []
        results.extend(_gen_variants("place_and_wire", [], per_action, param_fn=_place_param))
        results.extend(_gen_variants("removecomponent", [], per_action, param_fn=_remove_param))
        results.extend(_gen_variants("movecomponent", [], per_action, param_fn=_move_param))
        results.extend(_gen_variants("setvalue", [], per_action, param_fn=_setvalue_param))
        results.extend(_gen_variants("highlight", [], per_action, param_fn=_highlight_param))
        results.extend(_gen_variants("highlightpin", [], per_action, param_fn=_highlightpin_param))
        return results

    # ==============================================================
    # 5. Wiring — 2 actions x 100 = 200
    # ==============================================================
    def _direct_wiring(n_target=200):
        per_action = n_target // 2

        # --- addwire: parametric ---
        ADDWIRE_P2P = [
            "Collega {c1} a {c2}", "Metti un filo da {c1} a {c2}",
            "Connetti {c1} con {c2}", "Fai un collegamento tra {c1} e {c2}",
            "Cabla {c1} a {c2}", "Wire da {c1} a {c2}",
            "Unisci {c1} e {c2}", "Fai un filo tra {c1} e {c2}",
            "Collega il {c1} al {c2}", "Metti un cavo da {c1} a {c2}",
        ]
        ADDWIRE_BUS = [
            "Collega {comp} al bus positivo", "Collega {comp} al bus negativo",
            "Metti {comp} a massa", "Collega {comp} al GND",
            "Collega {comp} al 5V", "Collega {comp} a VCC",
            "Porta {comp} al positivo", "Metti {comp} sul bus GND",
            "{comp} al positivo", "{comp} al negativo", "{comp} a GND",
            "Connetti {comp} al bus-bot-plus", "Connetti {comp} al bus-bot-minus",
        ]
        ADDWIRE_WING = [
            "Collega {comp} al pin {wing}", "Metti un filo da {comp} a {wing}",
            "Connetti {comp} al pin digitale {pin}", "Collega {comp} all'analogico {pin}",
            "Fai un filo tra {comp} e il pin {wing}",
            "Porta {comp} al pin {wing} della board", "Collega {comp} a {wing}",
            "Wire da {comp} a {wing}", "{comp} va al pin {wing}",
        ]

        def _addwire_param():
            variant = random.choice(["p2p", "bus", "wing"])
            if variant == "p2p":
                c1, c2 = random.sample(PLACEABLE, 2)
                a1 = random.choice(COMPONENT_ALIASES.get(c1, [c1]))
                a2 = random.choice(COMPONENT_ALIASES.get(c2, [c2]))
                template = random.choice(ADDWIRE_P2P)
                phrase = template.format(c1=a1, c2=a2)
                p1 = random.choice(PIN_MAP.get(c1, ["pin1"]))
                p2 = random.choice(PIN_MAP.get(c2, ["pin1"]))
                tag = f"[AZIONE:addwire:{c1}.{p1}:{c2}.{p2}]"
                return phrase, tag, [c1, c2]
            elif variant == "bus":
                comp = random.choice(PLACEABLE)
                alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
                template = random.choice(ADDWIRE_BUS)
                phrase = template.format(comp=alias)
                pin = random.choice(PIN_MAP.get(comp, ["pin1"]))
                bus = random.choice(["bus-bot-plus", "bus-bot-minus"])
                tag = f"[AZIONE:addwire:{comp}.{pin}:{bus}]"
                return phrase, tag, [comp]
            else:  # wing
                comp = random.choice(PLACEABLE)
                alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
                wing = random.choice(WING_PINS)
                pin_label = wing.replace("W_", "")
                template = random.choice(ADDWIRE_WING)
                phrase = template.format(comp=alias, wing=wing, pin=pin_label)
                c_pin = random.choice(PIN_MAP.get(comp, ["pin1"]))
                tag = f"[AZIONE:addwire:{comp}.{c_pin}:{wing}]"
                return phrase, tag, [comp]

        # --- removewire: parametric ---
        REMOVEWIRE_TEMPLATES = [
            "Togli il filo da {c1} a {c2}", "Rimuovi il collegamento tra {c1} e {c2}",
            "Scollega {c1} da {c2}", "Via il filo tra {c1} e {c2}",
            "Elimina il filo {c1}-{c2}", "Disconnetti {c1} da {c2}",
            "Togli il cavo da {c1} a {c2}", "Stacca {c1} da {c2}",
            "Leva il filo che va da {c1} a {c2}", "Cancella il collegamento {c1}-{c2}",
        ]
        REMOVEWIRE_GENERIC = [
            "Togli il filo rosso", "Rimuovi l'ultimo filo", "Togli quel filo",
            "Via il filo", "Elimina il collegamento", "Scollega",
            "Togli il filo nero", "Rimuovi il filo verde", "Via quel cavo",
            "Togli il filo giallo", "Elimina il filo blu",
            "Scollega tutto", "Rimuovi i fili", "Togli i collegamenti",
        ]

        def _removewire_param():
            if random.random() < 0.6:
                c1, c2 = random.sample(PLACEABLE, 2)
                a1 = random.choice(COMPONENT_ALIASES.get(c1, [c1]))
                a2 = random.choice(COMPONENT_ALIASES.get(c2, [c2]))
                template = random.choice(REMOVEWIRE_TEMPLATES)
                phrase = template.format(c1=a1, c2=a2)
                desc = f"{c1}-{c2}"
            else:
                phrase = random.choice(REMOVEWIRE_GENERIC)
                desc = "ultimo"
            tag = f"[AZIONE:removewire:{desc}]"
            return phrase, tag, [desc]

        results = []
        results.extend(_gen_variants("addwire", [], per_action, param_fn=_addwire_param))
        results.extend(_gen_variants("removewire", [], per_action, param_fn=_removewire_param))
        return results

    # ==============================================================
    # 6. Interaction — 4 actions x 100 = 400
    # ==============================================================
    def _direct_interaction(n_target=400):
        per_action = n_target // 4

        # --- interact: parametric ---
        INTERACT_TEMPLATES = [
            "Premi {comp}", "Clicca {comp}", "Spingi {comp}", "Attiva {comp}",
            "Premi il {comp}", "Schiaccia {comp}", "Aziona {comp}",
            "Gira {comp}", "Ruota {comp}", "Muovi {comp}",
            "Interagisci con {comp}", "Tappa su {comp}", "Tocca {comp}",
            "Fai click su {comp}", "Premi su {comp}",
        ]
        INTERACT_SPECIFIC = [
            ("push-button", "press", "1", "Premi il pulsante"),
            ("push-button", "press", "1", "Schiaccia il bottone"),
            ("push-button", "press", "1", "Premi il tasto"),
            ("push-button", "release", "0", "Rilascia il pulsante"),
            ("potentiometer", "rotate", "50", "Gira il potenziometro a meta'"),
            ("potentiometer", "rotate", "100", "Gira la manopola al massimo"),
            ("potentiometer", "rotate", "0", "Metti il pot a zero"),
            ("potentiometer", "rotate", "75", "Ruota la manopola a tre quarti"),
            ("servo", "set", "90", "Metti il servo a 90 gradi"),
            ("servo", "set", "0", "Servo a zero"),
            ("servo", "set", "180", "Servo al massimo"),
            ("reed-switch", "activate", "1", "Avvicina il magnete al reed"),
            ("reed-switch", "deactivate", "0", "Allontana il magnete"),
        ]

        def _interact_param():
            if random.random() < 0.5:
                comp, action, val, phrase = random.choice(INTERACT_SPECIFIC)
                tag = f"[AZIONE:interact:{comp}:{action}:{val}]"
                return phrase, tag, [comp]
            else:
                comp = random.choice(["push-button", "potentiometer", "servo", "reed-switch"])
                alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
                template = random.choice(INTERACT_TEMPLATES)
                phrase = template.format(comp=alias)
                tag = f"[AZIONE:interact:{comp}:press:1]"
                return phrase, tag, [comp]

        # --- measure: parametric ---
        MEASURE_TEMPLATES = [
            "Misura la tensione su {comp}", "Misura {comp}", "Testa {comp}",
            "Quanto corrente passa in {comp}?", "Usa il tester su {comp}",
            "Misura la resistenza di {comp}", "Quanto voltaggio c'e' su {comp}?",
            "Misurami {comp}", "Fai una misura su {comp}", "Verifica {comp} col tester",
            "Quanti volt su {comp}?", "Quanti ohm ha {comp}?",
            "Controlla la tensione di {comp}", "Misura il valore di {comp}",
            "Quanto vale {comp}?", "Analizza {comp} col multimetro",
        ]

        def _measure_param():
            comp = random.choice(PLACEABLE)
            alias = random.choice(COMPONENT_ALIASES.get(comp, [comp]))
            template = random.choice(MEASURE_TEMPLATES)
            phrase = template.format(comp=alias)
            tag = f"[AZIONE:measure:{comp}]"
            return phrase, tag, [comp]

        # --- diagnose ---
        DIAGNOSE_PHRASES = [
            "Controlla il circuito", "Trova l'errore", "Debug",
            "Cosa c'e' che non va?", "Diagnostica", "Diagnosi",
            "Cerca il problema", "Analizza il circuito", "Perche' non funziona?",
            "Verifica il mio circuito", "C'e' qualcosa di sbagliato?",
            "Trova il bug", "Check del circuito", "Dove ho sbagliato?",
            "Controlla se c'e' un errore", "Debugga il circuito",
            "Fai un check", "Cerca l'errore", "Analisi del circuito",
            "Qualcosa non va, controlla", "Controlla tutto",
            "Verifica i collegamenti", "Trova cosa manca", "E' corretto?",
            "Il circuito e' giusto?", "Controllami il circuito",
        ]

        # --- getstate ---
        GETSTATE_PHRASES = [
            "Cosa c'e' sul circuito?", "Elenca i componenti", "Dimmi lo stato",
            "Che componenti ci sono?", "Stato del circuito", "Descrivi il circuito",
            "Cosa ho sulla breadboard?", "Quali pezzi ho messo?",
            "Quanti componenti ci sono?", "Lista di quello che c'e'",
            "Fammi un riepilogo", "Inventario componenti", "Cosa c'e'?",
            "Stato attuale", "Descrivimi il circuito", "Che c'e' montato?",
            "Riepilogo del circuito", "Dimmi cosa c'e' sulla breadboard",
            "Quanti fili ci sono?", "Elencami tutto", "Che situazione c'e'?",
            "Circuito report", "Get state", "Status del circuito",
        ]

        results = []
        results.extend(_gen_variants("interact", [], per_action, param_fn=_interact_param))
        results.extend(_gen_variants("measure", [], per_action, param_fn=_measure_param))
        results.extend(_gen_variants("diagnose", DIAGNOSE_PHRASES, per_action))
        results.extend(_gen_variants("getstate", GETSTATE_PHRASES, per_action))
        return results

    # ==============================================================
    # 7. UI Panels — 5 actions x 80 = 400
    # ==============================================================
    def _direct_ui_panels(n_target=400):
        per_action = n_target // 5

        SHOWBOM_PHRASES = [
            "Lista componenti", "Cosa mi serve?", "BOM", "Materiali necessari",
            "Mostra la lista componenti", "Quali pezzi servono?",
            "Elenco materiali", "Che componenti ci vogliono?", "Bill of materials",
            "Fammi vedere cosa serve", "Mostrami i materiali", "Cosa devo preparare?",
            "Apri la BOM", "Lista pezzi", "Mostra BOM", "Dammi la lista",
            "Che serve?", "Occorrente", "Mostra l'occorrente",
            "Quanti pezzi servono?", "Elenco componenti", "Shopping list",
        ]
        SHOWSERIAL_PHRASES = [
            "Apri il monitor seriale", "Mostra l'output", "Serial monitor",
            "Apri la seriale", "Mostra seriale", "Serial", "Fammi vedere la seriale",
            "Output seriale", "Monitor seriale", "Apri serial",
            "Mostra il serial monitor", "Voglio vedere l'output",
            "Apri il terminale", "Mostra i messaggi", "Console seriale",
            "Apri il monitor", "Fammi vedere i messaggi", "Apri l'output",
            "Terminale", "Mostrami l'output del programma",
        ]
        SHOWSHORTCUTS_PHRASES = [
            "Scorciatoie", "Shortcuts", "Mostra le scorciatoie", "Tasti rapidi",
            "Comandi da tastiera", "Quali sono le scorciatoie?", "Help scorciatoie",
            "Hotkeys", "Keyboard shortcuts", "Mostrami i tasti rapidi",
            "Quali tasti posso usare?", "Lista scorciatoie", "Comandi rapidi",
            "Apri le shortcuts", "Fammi vedere i comandi", "Tasti funzione",
            "Come uso la tastiera?", "Quali comandi ci sono?",
        ]
        FULLSCREEN_SCRATCH_PHRASES = [
            "Scratch grande", "Blocchi a tutto schermo", "Ingrandisci Scratch",
            "Fullscreen Scratch", "Scratch a schermo intero", "Scratch full",
            "Allarga Scratch", "Massimizza Scratch", "Scratch piu' grande",
            "Espandi Scratch", "Zoom Scratch", "Scratch tutto lo schermo",
            "Metti Scratch grande", "Ingrandisci i blocchi", "Blocchi fullscreen",
            "Scratch schermo intero", "Apri Scratch in grande",
        ]
        EXIT_SCRATCH_FULLSCREEN_PHRASES = [
            "Esci da fullscreen", "Rimpicciolisci Scratch", "Scratch normale",
            "Esci da schermo intero", "Torna alla vista normale", "Exit fullscreen",
            "Rimpicciolisci", "Scratch piccolo", "Ridimensiona Scratch",
            "Chiudi fullscreen", "Torna alla vista piccola", "Minimizza Scratch",
            "Scratch non piu' grande", "Riduci Scratch", "Vista normale",
            "Esci dalla vista grande", "Scratch standard",
        ]

        results = []
        results.extend(_gen_variants("showbom", SHOWBOM_PHRASES, per_action))
        results.extend(_gen_variants("showserial", SHOWSERIAL_PHRASES, per_action))
        results.extend(_gen_variants("showshortcuts", SHOWSHORTCUTS_PHRASES, per_action))
        results.extend(_gen_variants("fullscreenscratch", FULLSCREEN_SCRATCH_PHRASES, per_action))
        results.extend(_gen_variants("exitscratchfullscreen", EXIT_SCRATCH_FULLSCREEN_PHRASES, per_action))
        return results

    # ==============================================================
    # 8. Educational — 3 actions x 100 = 300
    # ==============================================================
    def _direct_educational(n_target=300):
        per_action = n_target // 3

        QUIZ_PHRASES = [
            "Fammi un quiz", "Interrogami", "Test!", "Vediamo se ho capito",
            "Quiz!", "Domanda!", "Fammi una domanda", "Mettimi alla prova",
            "Sfidami", "Prova a interrogarmi", "Verificami", "Challenge",
            "Sparami un quiz", "Facciamo un quiz", "Interrogazione!",
            "Testami", "Daje col quiz", "Voglio mettermi alla prova",
            "Quiz time", "Prova le mie conoscenze", "Esaminami",
            "Fammi un test veloce", "Un quiz!", "Facciamo la verifica",
            "Controlla se ho studiato", "Ho studiato, testami",
        ]

        # --- youtube: parametric ---
        YOUTUBE_TOPICS = [
            "LED", "resistenza", "Arduino", "circuiti", "breadboard",
            "corrente elettrica", "legge di Ohm", "condensatore",
            "servo motore", "buzzer", "potenziometro", "diodo",
            "Scratch Arduino", "programmazione Arduino", "LCD display",
            "sensore di luce", "elettronica per bambini", "circuiti in serie",
            "circuiti in parallelo", "PWM", "comunicazione seriale",
        ]
        YOUTUBE_TEMPLATES = [
            "Cerca un video su {topic}", "Mostrami un tutorial su {topic}",
            "Video su {topic}", "Trova un video che spiega {topic}",
            "C'e' un video su {topic}?", "Voglio vedere un video su {topic}",
            "Tutorial {topic}", "Fammi vedere un video di {topic}",
            "YouTube {topic}", "Cerca su YouTube {topic}",
            "Un video per capire {topic}", "Mostrami come funziona {topic} in video",
        ]

        def _youtube_param():
            topic = random.choice(YOUTUBE_TOPICS)
            template = random.choice(YOUTUBE_TEMPLATES)
            phrase = template.format(topic=topic)
            tag = f"[AZIONE:youtube:{topic}]"
            return phrase, tag, [topic]

        # --- createnotebook: parametric ---
        NOTEBOOK_TITLES = [
            "Legge di Ohm", "Come funziona un LED", "Circuiti in serie",
            "Circuiti in parallelo", "Il condensatore", "Il diodo",
            "Arduino basi", "Il PWM", "I sensori", "Il servo motore",
            "La breadboard", "Pin digitali e analogici", "Il buzzer",
            "Il potenziometro", "La fotoresistenza", "Il motore DC",
            "Il mio primo circuito", "Appunti di oggi", "Cose da ricordare",
        ]
        NOTEBOOK_TEMPLATES = [
            "Crea un appunto su {title}", "Segna che {title}",
            "Prendi nota: {title}", "Crea un taccuino su {title}",
            "Nuovo appunto: {title}", "Scrivi una nota su {title}",
            "Salva un appunto: {title}", "Notebook su {title}",
            "Annotazione: {title}", "Crea nota su {title}",
            "Fammi un appunto su {title}", "Taccuino nuovo: {title}",
        ]

        def _notebook_param():
            title = random.choice(NOTEBOOK_TITLES)
            template = random.choice(NOTEBOOK_TEMPLATES)
            phrase = template.format(title=title)
            tag = f"[AZIONE:createnotebook:{title}]"
            return phrase, tag, [title]

        results = []
        results.extend(_gen_variants("quiz", QUIZ_PHRASES, per_action))
        results.extend(_gen_variants("youtube", [], per_action, param_fn=_youtube_param))
        results.extend(_gen_variants("createnotebook", [], per_action, param_fn=_notebook_param))
        return results

    # ==============================================================
    # 9. Serial & Code — 3 actions x 80 = 240
    # ==============================================================
    def _direct_serial_code(n_target=240):
        per_action = n_target // 3

        # --- serialwrite: parametric ---
        SERIAL_TEXTS = [
            "Hello", "Ciao", "Test", "1234", "LED ON", "LED OFF",
            "Temperatura: 25", "OK", "Start", "Stop", "Blink",
            "Pronto", "Arduino", "Sensore attivo", "Valore: 512",
            "Errore", "Debug", "Messaggio di prova", "ping", "pong",
        ]
        SERIALWRITE_TEMPLATES = [
            "Scrivi '{text}' sulla seriale", "Manda '{text}' al serial",
            "Invia '{text}' alla seriale", "Serial write: {text}",
            "Scrivi {text} sul monitor seriale", "Manda messaggio: {text}",
            "Invia alla seriale: {text}", "Spedisci '{text}' sulla seriale",
            "Scrivi sulla seriale '{text}'", "Trasmetti '{text}'",
        ]

        def _serialwrite_param():
            text = random.choice(SERIAL_TEXTS)
            template = random.choice(SERIALWRITE_TEMPLATES)
            phrase = template.format(text=text)
            tag = f"[AZIONE:serialwrite:{text}]"
            return phrase, tag, [text]

        # --- setcode: parametric ---
        CODE_SNIPPETS = [
            "void setup() { pinMode(13, OUTPUT); }\\nvoid loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }",
            "void setup() { Serial.begin(9600); }\\nvoid loop() { Serial.println(\"Hello\"); delay(1000); }",
            "int led = 13;\\nvoid setup() { pinMode(led, OUTPUT); }\\nvoid loop() { digitalWrite(led, HIGH); delay(500); }",
        ]
        SETCODE_TEMPLATES = [
            "Imposta questo codice: {code}", "Metti questo programma: {code}",
            "Carica questo codice: {code}", "Scrivi questo nell'editor: {code}",
            "Sostituisci il codice con: {code}", "Codice nuovo: {code}",
            "Set code: {code}", "Metti questo sketch: {code}",
        ]

        def _setcode_param():
            code = random.choice(CODE_SNIPPETS)
            template = random.choice(SETCODE_TEMPLATES)
            phrase = template.format(code=code[:60] + "...")
            tag = f"[AZIONE:setcode:{code[:40]}]"
            return phrase, tag, []

        # --- appendcode: parametric ---
        APPEND_SNIPPETS = [
            "digitalWrite(13, HIGH);", "delay(1000);", "Serial.println(\"test\");",
            "int x = analogRead(A0);", "tone(8, 440, 500);", "servo.write(90);",
            "lcd.print(\"Ciao\");", "if (digitalRead(2) == HIGH) {}", "for (int i=0; i<10; i++) {}",
        ]
        APPENDCODE_TEMPLATES = [
            "Aggiungi questa riga: {code}", "Appendi al codice: {code}",
            "Metti in fondo: {code}", "Aggiungi dopo il loop: {code}",
            "Inserisci questa riga: {code}", "Append: {code}",
            "Aggiungi al programma: {code}", "Metti anche: {code}",
        ]

        def _appendcode_param():
            code = random.choice(APPEND_SNIPPETS)
            template = random.choice(APPENDCODE_TEMPLATES)
            phrase = template.format(code=code)
            tag = f"[AZIONE:appendcode:{code}]"
            return phrase, tag, []

        results = []
        results.extend(_gen_variants("serialwrite", [], per_action, param_fn=_serialwrite_param))
        results.extend(_gen_variants("setcode", [], per_action, param_fn=_setcode_param))
        results.extend(_gen_variants("appendcode", [], per_action, param_fn=_appendcode_param))
        return results

    # ==============================================================
    # 10. Build Mode — 1 action x 80 = 80
    # ==============================================================
    def _direct_buildmode(n_target=80):
        def _buildmode_param():
            mode = random.choice(BUILD_MODES)
            phrase = random.choice(BUILD_MODE_PHRASES[mode])
            tag = f"[AZIONE:setbuildmode:{mode}]"
            return phrase, tag, []

        return _gen_variants("setbuildmode", [], n_target, param_fn=_buildmode_param)

    # ==============================================================
    # MAIN ORCHESTRATOR: proportional scaling to fit n
    # ==============================================================
    BASE_COUNTS = {
        "sim_control": 720,
        "compile_editor": 700,
        "navigation": 500,
        "component_ops": 660,
        "wiring": 200,
        "interaction": 400,
        "ui_panels": 400,
        "educational": 300,
        "serial_code": 240,
        "buildmode": 80,
    }
    total_base = sum(BASE_COUNTS.values())  # 4200
    scale = n / total_base if total_base > 0 else 1.0

    scaled = {k: max(1, int(v * scale)) for k, v in BASE_COUNTS.items()}

    # Adjust rounding to hit exactly n
    diff = n - sum(scaled.values())
    keys = list(scaled.keys())
    for i in range(abs(diff)):
        k = keys[i % len(keys)]
        scaled[k] += 1 if diff > 0 else -1

    results = []
    results.extend(_direct_sim_control(scaled["sim_control"]))
    results.extend(_direct_compile_editor(scaled["compile_editor"]))
    results.extend(_direct_navigation(scaled["navigation"]))
    results.extend(_direct_component_ops(scaled["component_ops"]))
    results.extend(_direct_wiring(scaled["wiring"]))
    results.extend(_direct_interaction(scaled["interaction"]))
    results.extend(_direct_ui_panels(scaled["ui_panels"]))
    results.extend(_direct_educational(scaled["educational"]))
    results.extend(_direct_serial_code(scaled["serial_code"]))
    results.extend(_direct_buildmode(scaled["buildmode"]))

    random.shuffle(results)

    # Trim or pad to exactly n
    if len(results) > n:
        results = results[:n]

    return results


def gen_layer_context_aware(n):
    """Layer 3: Esempi context-aware (~3000).
    Il contesto (tab, esperimento, stato sim, editor mode) influenza il routing.
    Stessa frase -> output diverso in base al contesto del simulatore.
    7 sub-generators:
      1. disambiguation (600)   — same phrase, different result based on context
      2. multi_action (500)     — multiple actions in one sentence
      3. conditional (400)      — response changes based on circuit state
      4. experiment_aware (500) — navigation based on current experiment
      5. step_aware (300)       — passo passo context
      6. editor_aware (300)     — editor mode affects response
      7. component_state (400)  — referring to components by description
    """

    # ================================================================
    # Helper: component ID generator
    # ================================================================
    def _comp_id(comp_type, index=1):
        """Generate component ID like 'led1', 'resistor2', etc."""
        return comp_type.replace("-", "") + str(index)

    def _comp_alias(comp_type):
        """Get a random alias for a component type."""
        if comp_type in COMPONENT_ALIASES:
            return random.choice(COMPONENT_ALIASES[comp_type])
        return comp_type

    # ================================================================
    # 1. CONTEXT DISAMBIGUATION (600)
    # ================================================================
    def _context_disambiguation(n_target=600):
        """Same phrase, different result based on context."""
        results = []

        # --- "compilalo" / "compila" variants ---
        COMPILE_PHRASES = [
            "compilalo", "compila", "compila il codice", "build",
            "verifica il codice", "fai il build", "lancia la compilazione",
            "prova a compilare", "controlla il codice", "compila tutto",
        ]

        # compile + arduino editor + code present
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(COMPILE_PHRASES)))
            ctx = random_context_v6(tab="editor", editor_mode="arduino", code_present=True)
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:compile]"],
                needs_llm=False,
                response=random.choice(["Compilazione Arduino avviata.", "Compilo il codice Arduino...", "Build Arduino in corso!", "Verifico il codice Arduino."]),
                llm_hint=None,
                ctx=ctx,
            ))

        # compile + scratch editor + code present
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(COMPILE_PHRASES)))
            ctx = random_context_v6(tab="editor", editor_mode="scratch", code_present=True)
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:compile]"],
                needs_llm=False,
                response=random.choice(["Compilazione Scratch avviata!", "Compilo i blocchi Scratch...", "Build dei blocchi in corso!", "Verifico il programma Scratch."]),
                llm_hint=None,
                ctx=ctx,
            ))

        # compile + no code present
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(COMPILE_PHRASES)))
            ctx = random_context_v6(tab="editor", code_present=False)
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice(["Non c'e' codice da compilare. Apri l'editor e scrivi qualcosa prima!", "L'editor e' vuoto! Scrivi del codice prima di compilare.", "Prima devi scrivere il codice, poi posso compilarlo!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "avvia" / "play" variants ---
        PLAY_PHRASES = [
            "avvia", "avvialo", "play", "vai", "fai partire", "start",
            "metti in moto", "accendi", "lancia", "fallo andare",
            "avvia la simulazione", "premi play",
        ]

        # avvia + already running
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(PLAY_PHRASES)))
            ctx = random_context_v6(sim_state="running")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice(["La simulazione e' gia' in corso!", "Sta gia' andando!", "E' gia' avviata! Guarda la breadboard.", "Play gia' attivo!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # avvia + stopped
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(PLAY_PHRASES)))
            ctx = random_context_v6(sim_state="stopped")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:play]"],
                needs_llm=False,
                response=random.choice(ACTIONS["play"]["responses"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # avvia + paused (resume)
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(PLAY_PHRASES)))
            ctx = random_context_v6(sim_state="paused")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:play]"],
                needs_llm=False,
                response=random.choice(["Riprendo la simulazione! ▶", "Si riparte! ▶", "Tolgo la pausa, via! ▶"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "pausa" / "ferma" variants ---
        PAUSE_PHRASES = [
            "pausa", "metti in pausa", "ferma", "stop", "fermalo",
            "blocca", "fermati", "stoppa", "basta",
        ]

        # pausa + already paused
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(PAUSE_PHRASES)))
            ctx = random_context_v6(sim_state="paused")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice(["La simulazione e' gia' in pausa.", "E' gia' ferma!", "Siamo gia' in pausa.", "E' tutto fermo gia'."]),
                llm_hint=None,
                ctx=ctx,
            ))

        # pausa + running
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(PAUSE_PHRASES)))
            ctx = random_context_v6(sim_state="running")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:pause]"],
                needs_llm=False,
                response=random.choice(ACTIONS["pause"]["responses"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # pausa + stopped (nothing to pause)
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(PAUSE_PHRASES)))
            ctx = random_context_v6(sim_state="stopped")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice(["La simulazione non e' attiva, niente da fermare.", "Non c'e' nulla in esecuzione.", "La simulazione non e' avviata!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "mostrami il codice" / "vedi il codice" ---
        CODE_VIEW_PHRASES = [
            "mostrami il codice", "fammi vedere il codice", "apri l'editor",
            "voglio vedere il codice", "dove il codice?", "il codice?",
            "apri il codice", "editor", "mostra il programma",
        ]

        # mostra codice + already on editor tab
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(CODE_VIEW_PHRASES)))
            ctx = random_context_v6(tab="editor")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice(["Il codice e' gia' visibile!", "Sei gia' sul tab editor!", "L'editor e' gia' aperto!", "Guarda, il codice e' gia' qui!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # mostra codice + on simulator tab
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(CODE_VIEW_PHRASES)))
            other_tab = random.choice(["simulator", "canvas", "manual", "video"])
            ctx = random_context_v6(tab=other_tab)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=["[AZIONE:opentab:editor]"],
                needs_llm=False,
                response=random.choice(["Apro il tab editor!", "Ecco il codice!", "Ti porto all'editor."]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "mostra la breadboard" / "voglio il simulatore" ---
        SIM_VIEW_PHRASES = [
            "mostra la breadboard", "torna al simulatore", "voglio il simulatore",
            "fammi vedere il circuito", "apri il simulatore", "torna al circuito",
            "mostrami la breadboard", "vai al simulatore",
        ]

        # mostra breadboard + already on simulator
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(SIM_VIEW_PHRASES)))
            ctx = random_context_v6(tab="simulator")
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice(["Sei gia' sul simulatore!", "La breadboard e' gia' davanti a te!", "Ci sei gia'!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # mostra breadboard + on other tab
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(SIM_VIEW_PHRASES)))
            other_tab = random.choice(["editor", "canvas", "manual", "video"])
            ctx = random_context_v6(tab=other_tab)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=["[AZIONE:opentab:simulator]"],
                needs_llm=False,
                response=random.choice(["Ecco il simulatore!", "Ti porto alla breadboard!", "Apro il simulatore!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "reset" variants ---
        RESET_PHRASES = [
            "resetta", "reset", "ricomincia", "ripristina", "torna all'inizio",
            "pulisci tutto", "cancella tutto", "svuota",
        ]

        # reset + simulation running
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(RESET_PHRASES)))
            ctx = random_context_v6(sim_state="running")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:pause]", "[AZIONE:clearall]"],
                needs_llm=False,
                response=random.choice(["Fermo la simulazione e pulisco tutto!", "Stop e reset! Breadboard svuotata.", "Prima fermo, poi pulisco tutto!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # reset + stopped
        for _ in range(n_target // 18):
            phrase = augment_phrase(apply_typo(random.choice(RESET_PHRASES)))
            ctx = random_context_v6(sim_state="stopped")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:clearall]"],
                needs_llm=False,
                response=random.choice(ACTIONS["clearall"]["responses"]),
                llm_hint=None,
                ctx=ctx,
            ))

        return results

    # ================================================================
    # 2. CONTEXT MULTI-ACTION (500)
    # ================================================================
    def _context_multi_action(n_target=500):
        """Multiple actions in one sentence."""
        results = []

        # Template groups: (phrases, actions, intent, entities_fn, response, needs_llm)
        MULTI_ACTION_TEMPLATES = [
            # place + wire + play
            {
                "phrases": [
                    "metti un {c1}, collegalo e avvia",
                    "aggiungi un {c1}, collega i fili e fai partire",
                    "piazza un {c1} poi avvia la simulazione",
                    "metti {c1} e avvia tutto",
                ],
                "actions_fn": lambda c1: ["[INTENT:place_and_wire]", "[AZIONE:play]"],
                "intent": "circuit",
                "entities_fn": lambda c1: [c1],
                "responses": [
                    "Piazzo {c1_alias}, collego e avvio! ▶",
                    "Ecco {c1_alias} sulla breadboard, collegato e simulazione avviata! ▶",
                ],
                "needs_llm": False,
            },
            # loadexp + compile
            {
                "phrases": [
                    "carica l'esperimento {exp_name} e compila il codice",
                    "apri {exp_name} e fai il build",
                    "metti {exp_name} e compila",
                    "carica {exp_name} poi compila",
                ],
                "actions_fn": lambda exp_id: [f"[AZIONE:loadexp:{exp_id}]", "[AZIONE:compile]"],
                "intent": "navigation",
                "entities_fn": lambda exp_id: [exp_id],
                "responses": [
                    "Carico l'esperimento e compilo!",
                    "Esperimento caricato e compilazione avviata!",
                    "Ecco l'esperimento! Ora compilo...",
                ],
                "needs_llm": False,
            },
            # clearall + place
            {
                "phrases": [
                    "resetta tutto e aggiungi un {c1}",
                    "cancella tutto, poi metti un {c1}",
                    "pulisci e piazza un {c1}",
                    "svuota la breadboard e metti {c1}",
                    "via tutto e aggiungi {c1}",
                ],
                "actions_fn": lambda c1: ["[AZIONE:clearall]", "[INTENT:place_and_wire]"],
                "intent": "circuit",
                "entities_fn": lambda c1: [c1],
                "responses": [
                    "Pulisco tutto e piazzo {c1_alias}!",
                    "Breadboard svuotata, ecco {c1_alias}!",
                    "Via tutto! Ecco {c1_alias} nuovo di zecca!",
                ],
                "needs_llm": False,
            },
            # switch editor + open editor + compile
            {
                "phrases": [
                    "apri Scratch, fai il programma e compila",
                    "passa a Scratch e compila",
                    "vai su Scratch e fai il build",
                    "apri l'editor Scratch e compila il codice",
                    "passa ai blocchi e compila",
                ],
                "actions_fn": lambda: ["[AZIONE:switcheditor:scratch]", "[AZIONE:openeditor]", "[AZIONE:compile]"],
                "intent": "action",
                "entities_fn": lambda: [],
                "responses": [
                    "Passo a Scratch, apro l'editor e compilo!",
                    "Editor Scratch aperto e compilazione avviata!",
                    "Blocchi Scratch attivi, compilo!",
                ],
                "needs_llm": False,
            },
            # clearall + loadexp
            {
                "phrases": [
                    "cancella tutto e ricomincia dall'esperimento {exp_name}",
                    "resetta e carica {exp_name}",
                    "pulisci tutto e apri {exp_name}",
                    "via tutto, voglio ricominciare con {exp_name}",
                ],
                "actions_fn": lambda exp_id: ["[AZIONE:clearall]", f"[AZIONE:loadexp:{exp_id}]"],
                "intent": "navigation",
                "entities_fn": lambda exp_id: [exp_id],
                "responses": [
                    "Pulisco e carico l'esperimento!",
                    "Tutto resettato, ecco l'esperimento!",
                    "Reset e via con l'esperimento nuovo!",
                ],
                "needs_llm": False,
            },
            # place two components
            {
                "phrases": [
                    "metti un {c1} e un {c2}",
                    "aggiungi {c1} e {c2} al circuito",
                    "piazza un {c1} e un {c2}",
                    "mi servono un {c1} e un {c2}",
                    "metti {c1} con {c2}",
                ],
                "actions_fn": lambda c1, c2: ["[INTENT:place_and_wire]"],
                "intent": "circuit",
                "entities_fn": lambda c1, c2: [c1, c2],
                "responses": [
                    "Piazzo {c1_alias} e {c2_alias}!",
                    "Ecco {c1_alias} e {c2_alias} sulla breadboard!",
                    "Aggiunti {c1_alias} e {c2_alias}! ✅",
                ],
                "needs_llm": False,
            },
            # play + compile (avvia e compila)
            {
                "phrases": [
                    "compila e avvia",
                    "fai il build e poi play",
                    "compila il codice e avvia la simulazione",
                    "build e start",
                    "verifica e avvia",
                ],
                "actions_fn": lambda: ["[AZIONE:compile]", "[AZIONE:play]"],
                "intent": "action",
                "entities_fn": lambda: [],
                "responses": [
                    "Compilo e avvio! ▶",
                    "Build e play! ▶",
                    "Compilazione avviata, poi si parte!",
                ],
                "needs_llm": False,
            },
            # pause + reset
            {
                "phrases": [
                    "ferma e resetta",
                    "stop e ricomincia",
                    "pausa e poi resetta tutto",
                    "fermati e riparti dall'inizio",
                    "blocca tutto e resetta",
                ],
                "actions_fn": lambda: ["[AZIONE:pause]", "[AZIONE:reset]"],
                "intent": "action",
                "entities_fn": lambda: [],
                "responses": [
                    "Fermo e resetto!",
                    "Stop e reset!",
                    "Simulazione fermata e ripristinata.",
                ],
                "needs_llm": False,
            },
            # open tab + do something
            {
                "phrases": [
                    "vai al manuale e poi torna al simulatore",
                    "apri il video e poi torna",
                    "mostrami il manuale e poi il simulatore",
                ],
                "actions_fn": lambda tab1, tab2: [f"[AZIONE:opentab:{tab1}]", f"[AZIONE:opentab:{tab2}]"],
                "intent": "navigation",
                "entities_fn": lambda tab1, tab2: [],
                "responses": [
                    "Apro e poi torno!",
                    "Ecco, ti porto la'!",
                ],
                "needs_llm": False,
                "param_type": "tabs",
            },
            # undo multiple times
            {
                "phrases": [
                    "annulla le ultime due azioni",
                    "fai due undo",
                    "annulla due volte",
                    "torna indietro di due passi",
                ],
                "actions_fn": lambda: ["[AZIONE:undo]", "[AZIONE:undo]"],
                "intent": "action",
                "entities_fn": lambda: [],
                "responses": [
                    "Due azioni annullate!",
                    "Undo doppio! Torno indietro di due passi.",
                    "Annullate le ultime due azioni!",
                ],
                "needs_llm": False,
            },
        ]

        per_template = n_target // len(MULTI_ACTION_TEMPLATES)
        seen = set()

        for tmpl in MULTI_ACTION_TEMPLATES:
            for _ in range(per_template):
                phrases = tmpl["phrases"]
                phrase_tmpl = random.choice(phrases)

                # Determine what parameters this template needs
                param_type = tmpl.get("param_type", None)
                if param_type == "tabs":
                    tab1 = random.choice(["manual", "video", "canvas"])
                    tab2 = "simulator"
                    phrase = phrase_tmpl
                    actions = tmpl["actions_fn"](tab1, tab2)
                    entities = tmpl["entities_fn"](tab1, tab2)
                    response = random.choice(tmpl["responses"])
                elif "{c1}" in phrase_tmpl and "{c2}" in phrase_tmpl:
                    c1 = random.choice(PLACEABLE)
                    c2 = random.choice([p for p in PLACEABLE if p != c1])
                    c1_alias = _comp_alias(c1)
                    c2_alias = _comp_alias(c2)
                    phrase = phrase_tmpl.format(c1=c1_alias, c2=c2_alias)
                    actions = tmpl["actions_fn"](c1, c2)
                    entities = tmpl["entities_fn"](c1, c2)
                    resp_tmpl = random.choice(tmpl["responses"])
                    response = resp_tmpl.format(c1_alias=c1_alias, c2_alias=c2_alias) if "{c1_alias}" in resp_tmpl else resp_tmpl
                elif "{c1}" in phrase_tmpl:
                    c1 = random.choice(PLACEABLE)
                    c1_alias = _comp_alias(c1)
                    phrase = phrase_tmpl.format(c1=c1_alias)
                    actions = tmpl["actions_fn"](c1)
                    entities = tmpl["entities_fn"](c1)
                    resp_tmpl = random.choice(tmpl["responses"])
                    response = resp_tmpl.format(c1_alias=c1_alias) if "{c1_alias}" in resp_tmpl else resp_tmpl
                elif "{exp_name}" in phrase_tmpl:
                    exp_id = random.choice(EXPERIMENTS)
                    exp_name = EXP_NAMES.get(exp_id, exp_id)
                    phrase = phrase_tmpl.format(exp_name=exp_name)
                    actions = tmpl["actions_fn"](exp_id)
                    entities = tmpl["entities_fn"](exp_id)
                    response = random.choice(tmpl["responses"])
                else:
                    phrase = phrase_tmpl
                    actions = tmpl["actions_fn"]()
                    entities = tmpl["entities_fn"]()
                    response = random.choice(tmpl["responses"])

                phrase = augment_phrase(apply_typo(phrase))
                key = phrase.strip().lower()
                if key in seen:
                    continue
                seen.add(key)

                ctx = random_context_v6()
                results.append(make_example(
                    user_msg=phrase,
                    intent=tmpl["intent"],
                    entities=entities,
                    actions=actions,
                    needs_llm=tmpl["needs_llm"],
                    response=response,
                    llm_hint=None,
                    ctx=ctx,
                ))

        return results

    # ================================================================
    # 3. CONTEXT CONDITIONAL (400)
    # ================================================================
    def _context_conditional(n_target=400):
        """Response changes based on circuit state (componenti field)."""
        results = []
        per_case = n_target // 10

        # --- "il LED non si accende" ---
        LED_PROBLEM_PHRASES = [
            "il LED non si accende", "la lucina non funziona", "il led e' spento",
            "perche' il LED non si accende?", "il LED non va", "la luce non si accende",
            "non si illumina il LED", "il mio LED non fa luce",
        ]

        # LED present + resistor = needs LLM to diagnose
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(LED_PROBLEM_PHRASES)))
            comps = ["led1", "resistor1"]
            if random.random() < 0.4:
                comps.append(random.choice(["pushbutton1", "buzzerPiezo1", "resistor2"]))
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="tutor",
                entities=["led1"],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="L'utente ha un LED e un resistore sul circuito ma il LED non si accende. Controlla: polarita' LED (anodo/catodo), valore resistenza, connessioni, alimentazione.",
                ctx=ctx,
            ))

        # LED NOT present = tell them to add one
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(LED_PROBLEM_PHRASES)))
            comps = []
            if random.random() < 0.3:
                comps = ["resistor1"]
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=["led"],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Non c'e' nessun LED sul circuito! Vuoi che ne aggiunga uno?",
                    "Non vedo nessun LED sulla breadboard. Devo aggiungerne uno?",
                    "Il LED non c'e'! Prima devi piazzarlo. Lo aggiungo io?",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "togli il resistore" ---
        REMOVE_PHRASES = [
            "togli il resistore", "rimuovi la resistenza", "elimina il resistore",
            "via il resistore", "togli la resistenza", "leva il resistore",
        ]

        # single resistor = deterministic remove
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(REMOVE_PHRASES)))
            comps = ["led1", "resistor1"]
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=["resistor1"],
                actions=["[AZIONE:removecomponent:resistor1]"],
                needs_llm=False,
                response=random.choice(["Resistore rimosso!", "Tolto il resistore!", "Via il resistore! ✅"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # multiple resistors = ambiguous, needs LLM
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(REMOVE_PHRASES)))
            comps = ["led1", "resistor1", "resistor2"]
            if random.random() < 0.3:
                comps.append("resistor3")
            ctx = random_context_v6(comps=comps)
            n_res = len([c for c in comps if c.startswith("resistor")])
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=["resistor"],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Ci sono {n_res} resistori sul circuito ({', '.join(c for c in comps if c.startswith('resistor'))}). Chiedi quale vuole rimuovere.",
                ctx=ctx,
            ))

        # --- "collega il buzzer" ---
        CONNECT_PHRASES = [
            "collega il buzzer", "collegami il cicalino", "connetti il buzzer",
            "fai i fili del buzzer", "cabla il buzzer", "collega il cicalino",
        ]

        # buzzer present
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(CONNECT_PHRASES)))
            comps = ["buzzerPiezo1", "led1"]
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=["buzzerPiezo1"],
                actions=["[INTENT:place_and_wire]"],
                needs_llm=False,
                response=random.choice(["Collego il buzzer!", "Fili del buzzer collegati! ✅", "Buzzer connesso!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # buzzer NOT present
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(CONNECT_PHRASES)))
            comps = ["led1", "resistor1"]
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=["buzzer-piezo"],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Prima devi aggiungere un buzzer! Vuoi che lo piazzi io?",
                    "Non c'e' nessun buzzer sul circuito. Lo aggiungo?",
                    "Il buzzer non c'e'! Devo metterlo prima di collegarlo.",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "diagnosi" with/without components ---
        DIAG_PHRASES = [
            "controlla il circuito", "c'e' qualche errore?", "diagnosi",
            "analizza il circuito", "trova il problema", "cosa c'e' che non va?",
        ]

        # circuit has components
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(DIAG_PHRASES)))
            n = random.randint(2, 5)
            comps = []
            for i in range(n):
                c = random.choice(PLACEABLE)
                comps.append(_comp_id(c, i + 1))
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[],
                actions=["[AZIONE:diagnose]"],
                needs_llm=True,
                response=None,
                llm_hint=f"Diagnostica circuito con {len(comps)} componenti: {', '.join(comps)}. Controlla connessioni, polarita', alimentazione.",
                ctx=ctx,
            ))

        # circuit is empty
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(DIAG_PHRASES)))
            ctx = random_context_v6(comps=[])
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "La breadboard e' vuota! Aggiungi dei componenti prima di fare una diagnosi.",
                    "Non c'e' niente da controllare, il circuito e' vuoto!",
                    "Devi prima costruire un circuito! Inizia aggiungendo qualche componente.",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        return results

    # ================================================================
    # 4. CONTEXT EXPERIMENT-AWARE (500)
    # ================================================================
    def _context_experiment_aware(n_target=500):
        """Navigation based on current experiment."""
        results = []
        per_case = n_target // 8

        # --- "carica il prossimo esperimento" ---
        NEXT_EXP_PHRASES = [
            "carica il prossimo esperimento", "prossimo esperimento", "avanti",
            "voglio il prossimo", "vai avanti", "esperimento successivo",
            "carica il successivo", "andiamo al prossimo", "next",
        ]

        for _ in range(per_case):
            idx = random.randint(0, len(EXPERIMENTS) - 2)  # not last
            current = EXPERIMENTS[idx]
            next_exp = EXPERIMENTS[idx + 1]
            phrase = augment_phrase(apply_typo(random.choice(NEXT_EXP_PHRASES)))
            ctx = random_context_v6(exp=current)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[next_exp],
                actions=[f"[AZIONE:loadexp:{next_exp}]"],
                needs_llm=False,
                response=random.choice([
                    f"Carico '{EXP_NAMES.get(next_exp, next_exp)}'!",
                    f"Ecco il prossimo: {EXP_NAMES.get(next_exp, next_exp)}!",
                    f"Avanti con {EXP_NAMES.get(next_exp, next_exp)}!",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- next experiment when on LAST experiment ---
        LAST_PHRASES = [
            "carica il prossimo esperimento", "prossimo", "avanti",
            "ce ne sono altri?", "cosa c'e' dopo?",
        ]

        for _ in range(per_case):
            # Pick last experiment of a volume
            last_v1 = "v1-cap14-esp3"
            last_v2 = "v2-cap10-esp1"
            last_v3 = "v3-cap13-esp1"
            current = random.choice([last_v1, last_v2, last_v3])
            vol = int(current[1])
            phrase = augment_phrase(apply_typo(random.choice(LAST_PHRASES)))
            ctx = random_context_v6(exp=current, vol=vol)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    f"Hai completato tutti gli esperimenti del Volume {vol}! Complimenti! 🎉",
                    f"Questo e' l'ultimo esperimento del Volume {vol}! Bravo/a!",
                    f"Non ci sono altri esperimenti nel Volume {vol}. Vuoi provare un altro volume?",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "torna a quello di prima" ---
        PREV_EXP_PHRASES = [
            "torna a quello di prima", "esperimento precedente", "indietro",
            "voglio il precedente", "torna indietro", "ricarica quello prima",
            "quello di prima", "l'esperimento prima",
        ]

        for _ in range(per_case):
            idx = random.randint(1, len(EXPERIMENTS) - 1)  # not first
            current = EXPERIMENTS[idx]
            prev_exp = EXPERIMENTS[idx - 1]
            phrase = augment_phrase(apply_typo(random.choice(PREV_EXP_PHRASES)))
            ctx = random_context_v6(exp=current)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[prev_exp],
                actions=[f"[AZIONE:loadexp:{prev_exp}]"],
                needs_llm=False,
                response=random.choice([
                    f"Torno a '{EXP_NAMES.get(prev_exp, prev_exp)}'!",
                    f"Ecco l'esperimento precedente: {EXP_NAMES.get(prev_exp, prev_exp)}!",
                    f"Ricarico {EXP_NAMES.get(prev_exp, prev_exp)}!",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- previous when on FIRST experiment ---
        for _ in range(per_case):
            first_exps = ["v1-cap1-esp1", "v2-cap1-esp1", "v3-cap1-esp1"]
            current = random.choice(first_exps)
            vol = int(current[1])
            phrase = augment_phrase(apply_typo(random.choice(PREV_EXP_PHRASES)))
            ctx = random_context_v6(exp=current, vol=vol)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Sei gia' al primo esperimento! Non c'e' niente prima.",
                    f"Questo e' il primo esperimento del Volume {vol}!",
                    "Non si puo' andare piu' indietro, sei all'inizio!",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "ricomincia questo esperimento" ---
        RESTART_PHRASES = [
            "ricomincia questo esperimento", "ricominciamo", "riparti dall'inizio",
            "ricarica questo esperimento", "voglio ricominciare", "restart",
            "ripristina l'esperimento", "torna all'inizio di questo",
        ]

        for _ in range(per_case):
            exp = random.choice(EXPERIMENTS)
            phrase = augment_phrase(apply_typo(random.choice(RESTART_PHRASES)))
            ctx = random_context_v6(exp=exp)
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[exp],
                actions=["[AZIONE:reset]"],
                needs_llm=False,
                response=random.choice(["Esperimento ripristinato!", "Ricomincio da capo!", "Reset! Ricominciamo!", "Tutto dall'inizio!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "che esperimento e' questo?" ---
        WHAT_EXP_PHRASES = [
            "che esperimento e' questo?", "che esperimento sto facendo?",
            "come si chiama questo esperimento?", "quale esperimento e'?",
            "dimmi il nome dell'esperimento", "che cosa stiamo facendo?",
        ]

        for _ in range(per_case):
            exp = random.choice(EXPERIMENTS)
            name = EXP_NAMES.get(exp, exp)
            vol = int(exp[1])
            phrase = augment_phrase(apply_typo(random.choice(WHAT_EXP_PHRASES)))
            ctx = random_context_v6(exp=exp, vol=vol)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[exp],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    f"Stai facendo '{name}' del Volume {vol}!",
                    f"L'esperimento corrente e' '{name}' (Volume {vol}).",
                    f"Questo e' '{name}', Volume {vol}!",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "voglio qualcosa di piu' difficile" ---
        HARDER_PHRASES = [
            "voglio qualcosa di piu' difficile", "troppo facile!",
            "c'e' qualcosa di piu' avanzato?", "voglio una sfida",
            "questo e' troppo semplice", "qualcosa di piu' impegnativo",
        ]

        for _ in range(per_case):
            exp = random.choice(EXPERIMENTS)
            vol = int(exp[1])
            phrase = augment_phrase(apply_typo(random.choice(HARDER_PHRASES)))
            ctx = random_context_v6(exp=exp, vol=vol)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Lo studente vuole un esperimento piu' difficile. Attualmente su {EXP_NAMES.get(exp, exp)} (Volume {vol}). Suggerisci esperimenti avanzati o il volume successivo.",
                ctx=ctx,
            ))

        # --- no experiment loaded ---
        NO_EXP_PHRASES = [
            "che esperimento e' questo?", "quale esperimento ho caricato?",
            "ricomincia l'esperimento",
        ]

        for _ in range(per_case // 2):
            phrase = augment_phrase(apply_typo(random.choice(NO_EXP_PHRASES)))
            ctx = random_context_v6(exp=None)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Non c'e' nessun esperimento caricato! Vuoi sceglierne uno?",
                    "Non hai caricato nessun esperimento. Quale vuoi fare?",
                    "Nessun esperimento attivo. Dimmi quale vuoi caricare!",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        return results

    # ================================================================
    # 5. CONTEXT STEP-AWARE (300)
    # ================================================================
    def _context_step_aware(n_target=300):
        """Passo passo context."""
        results = []
        per_case = n_target // 8

        # --- "cosa devo fare?" mid-build ---
        WHAT_DO_PHRASES = [
            "cosa devo fare?", "e adesso?", "che devo fare?",
            "qual e' il prossimo passo?", "aiutami", "cosa faccio ora?",
            "non so cosa fare", "sono bloccato",
        ]

        for _ in range(per_case):
            total = random.randint(4, 10)
            current = random.randint(2, total - 1)
            step_str = f"{current}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(WHAT_DO_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=["[AZIONE:nextstep]"],
                needs_llm=False,
                response=f"Sei al passo {current} di {total}. Premi 'Avanti' per continuare!",
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "ho finito" at last step ---
        DONE_PHRASES = [
            "ho finito", "fatto!", "finito!", "completato", "ce l'ho fatta",
            "tutto fatto", "ecco finito", "ho completato tutto",
        ]

        for _ in range(per_case):
            total = random.randint(4, 10)
            step_str = f"{total}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(DONE_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Complimenti! Hai completato il montaggio! 🎉",
                    "Bravissimo/a! Tutti i passi completati! 🎉",
                    f"Fantastico! {total} passi completati, il circuito e' pronto! 🎉",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "avanti" mid-build ---
        FWD_PHRASES = [
            "avanti", "prossimo passo", "vai avanti", "next", "continua",
            "passo successivo", "step successivo",
        ]

        for _ in range(per_case):
            total = random.randint(4, 10)
            current = random.randint(1, total - 1)
            step_str = f"{current}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(FWD_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=["[AZIONE:nextstep]"],
                needs_llm=False,
                response=random.choice(ACTIONS["nextstep"]["responses"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "indietro" at first step ---
        BACK_PHRASES = [
            "indietro", "torna indietro", "passo precedente", "back",
            "il passo prima", "step precedente",
        ]

        for _ in range(per_case):
            total = random.randint(4, 10)
            step_str = f"1/{total}"
            phrase = augment_phrase(apply_typo(random.choice(BACK_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Sei gia' al primo passo!",
                    "Non si puo' andare piu' indietro, sei all'inizio!",
                    "Questo e' il passo 1, non c'e' niente prima!",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "indietro" mid-build ---
        for _ in range(per_case):
            total = random.randint(4, 10)
            current = random.randint(2, total)
            step_str = f"{current}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(BACK_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=["[AZIONE:prevstep]"],
                needs_llm=False,
                response=random.choice(ACTIONS["prevstep"]["responses"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "quanti passi mancano?" ---
        HOW_MANY_PHRASES = [
            "quanti passi mancano?", "quanto manca?", "a che punto siamo?",
            "manca molto?", "quanti step ci sono ancora?", "quanto manca alla fine?",
        ]

        for _ in range(per_case):
            total = random.randint(4, 10)
            current = random.randint(1, total)
            remaining = total - current
            step_str = f"{current}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(HOW_MANY_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            if remaining == 0:
                response = "Hai finito! Tutti i passi completati! 🎉"
            elif remaining == 1:
                response = "Manca solo 1 passo! Quasi finito!"
            else:
                response = random.choice([
                    f"Mancano ancora {remaining} passi. Sei al passo {current} di {total}.",
                    f"Sei al passo {current} di {total}, mancano {remaining} passi!",
                    f"Ancora {remaining} passi! Ce la puoi fare!",
                ])
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "avanti" at last step ---
        for _ in range(per_case):
            total = random.randint(4, 10)
            step_str = f"{total}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(FWD_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Sei gia' all'ultimo passo! Il circuito e' completo.",
                    "Hai gia' finito tutti i passi! Il montaggio e' completo.",
                    "Non ci sono altri passi, hai completato il circuito! 🎉",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "ho finito" NOT at last step ---
        for _ in range(per_case // 2):
            total = random.randint(5, 10)
            current = random.randint(1, total - 2)
            remaining = total - current
            step_str = f"{current}/{total}"
            phrase = augment_phrase(apply_typo(random.choice(DONE_PHRASES)))
            ctx = random_context_v6(build_mode="passopasso", step=step_str)
            results.append(make_example(
                user_msg=phrase,
                intent="navigation",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    f"Non ancora! Sei al passo {current} di {total}, mancano {remaining} passi.",
                    f"Calma! Ci sono ancora {remaining} passi da fare.",
                    f"Mancano {remaining} passi! Premi 'Avanti' per continuare.",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        return results

    # ================================================================
    # 6. CONTEXT EDITOR-AWARE (300)
    # ================================================================
    def _context_editor_aware(n_target=300):
        """Editor mode affects response."""
        results = []
        per_case = n_target // 8

        # --- "passa all'altro editor" ---
        SWITCH_PHRASES = [
            "passa all'altro editor", "cambia editor", "l'altro editor",
            "switch editor", "voglio l'altro", "cambia modalita'",
            "prova l'altro", "passami all'altro",
        ]

        # currently scratch -> switch to arduino
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(SWITCH_PHRASES)))
            ctx = random_context_v6(editor_mode="scratch", tab="editor")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:switcheditor:arduino]"],
                needs_llm=False,
                response=random.choice(["Passo ad Arduino C++!", "Ecco l'editor testuale!", "Modalita' codice Arduino attiva!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # currently arduino -> switch to scratch
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(SWITCH_PHRASES)))
            ctx = random_context_v6(editor_mode="arduino", tab="editor")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=["[AZIONE:switcheditor:scratch]"],
                needs_llm=False,
                response=random.choice(["Passo a Scratch! 🧩", "Ecco i blocchi!", "Modalita' Scratch attiva!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "quale editor sto usando?" ---
        WHICH_EDITOR_PHRASES = [
            "quale editor sto usando?", "che editor e'?", "che modalita' ho?",
            "sono su Scratch o Arduino?", "che editor ho aperto?",
            "in che modalita' sono?",
        ]

        # scratch
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(WHICH_EDITOR_PHRASES)))
            ctx = random_context_v6(editor_mode="scratch")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Stai usando Scratch (blocchi). Vuoi passare ad Arduino C++?",
                    "Sei in modalita' Scratch con i blocchi!",
                    "Editor attuale: Scratch (programmazione a blocchi).",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # arduino
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(WHICH_EDITOR_PHRASES)))
            ctx = random_context_v6(editor_mode="arduino")
            results.append(make_example(
                user_msg=phrase,
                intent="action",
                entities=[],
                actions=[],
                needs_llm=False,
                response=random.choice([
                    "Stai usando Arduino C++ (codice testuale). Vuoi passare a Scratch?",
                    "Sei in modalita' Arduino, scrivi codice C++!",
                    "Editor attuale: Arduino C++ (programmazione testuale).",
                ]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "il codice non compila" ---
        NO_COMPILE_PHRASES = [
            "il codice non compila", "errore di compilazione", "non compila",
            "c'e' un errore nel codice", "il build fallisce", "mi da errore",
            "il programma non funziona", "errore!",
        ]

        # scratch mode
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(NO_COMPILE_PHRASES)))
            ctx = random_context_v6(editor_mode="scratch", tab="editor", code_present=True)
            results.append(make_example(
                user_msg=phrase,
                intent="code",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Errore in modalita' Scratch. Controlla: blocchi collegati correttamente, setup/loop presenti, tipi di pin corretti, nessun blocco isolato.",
                ctx=ctx,
            ))

        # arduino mode
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(NO_COMPILE_PHRASES)))
            ctx = random_context_v6(editor_mode="arduino", tab="editor", code_present=True)
            results.append(make_example(
                user_msg=phrase,
                intent="code",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Errore di compilazione C++. Controlla: punto e virgola, parentesi, #include, setup()/loop() presenti, variabili dichiarate, tipi corretti.",
                ctx=ctx,
            ))

        # --- "scrivi il codice per..." ---
        WRITE_CODE_PHRASES = [
            "scrivi il codice per il LED", "fammi il codice del blink",
            "programma il buzzer", "scrivi il programma", "fai tu il codice",
        ]

        # scratch mode -> hint about blocks
        for _ in range(per_case):
            phrase = augment_phrase(apply_typo(random.choice(WRITE_CODE_PHRASES)))
            ctx = random_context_v6(editor_mode="scratch", tab="editor")
            results.append(make_example(
                user_msg=phrase,
                intent="code",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint="Lo studente e' in modalita' Scratch. Guida con i blocchi: 'Imposta Pin', 'Attendi', 'Ripeti'. Non scrivere codice C++, ma descrivi i blocchi da trascinare.",
                ctx=ctx,
            ))

        return results

    # ================================================================
    # 7. CONTEXT COMPONENT-STATE (400)
    # ================================================================
    def _context_component_state(n_target=400):
        """Referring to components by description, color, position, order."""
        results = []
        per_case = n_target // 8

        # Color mapping for LEDs
        LED_COLORS = ["rosso", "verde", "blu", "giallo", "bianco"]

        # --- "togli quello rosso" (LED by color) ---
        REMOVE_COLOR_PHRASES = [
            "togli quello {color}", "rimuovi il {color}", "elimina quello {color}",
            "via il LED {color}", "togli la lucina {color}a",
        ]

        for _ in range(per_case):
            color1, color2 = random.sample(LED_COLORS, 2)
            phrase_tmpl = random.choice(REMOVE_COLOR_PHRASES)
            target_color = random.choice([color1, color2])
            target_id = "led1" if target_color == color1 else "led2"
            phrase = augment_phrase(apply_typo(phrase_tmpl.format(color=target_color)))
            comps = ["led1", "led2", "resistor1"]
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[target_id],
                actions=[f"[AZIONE:removecomponent:{target_id}]"],
                needs_llm=False,
                response=random.choice([f"LED {target_color} rimosso!", f"Tolto il LED {target_color}!", f"Via il {target_color}! ✅"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "sposta il secondo resistore" (by ordinal) ---
        ORDINAL_PHRASES = [
            "sposta il secondo {comp}", "muovi il primo {comp}", "togli il terzo {comp}",
            "evidenzia il secondo {comp}", "seleziona il primo {comp}",
        ]
        ORDINALS = {"primo": 1, "secondo": 2, "terzo": 3}

        for _ in range(per_case):
            comp_type = random.choice(["resistor", "led", "capacitor", "push-button"])
            n_comps = random.randint(2, 3)
            comp_ids = [_comp_id(comp_type, i + 1) for i in range(n_comps)]
            ordinal_word = random.choice(list(ORDINALS.keys()))
            ordinal_idx = ORDINALS[ordinal_word]
            if ordinal_idx > n_comps:
                ordinal_word = "primo" if n_comps == 1 else "secondo"
                ordinal_idx = min(ordinal_idx, n_comps)

            target_id = comp_ids[ordinal_idx - 1]
            comp_alias = _comp_alias(comp_type)
            action_type = random.choice(["removecomponent", "highlight", "movecomponent"])

            if action_type == "movecomponent":
                direction = random.choice(["up", "down", "left", "right"])
                action_tag = f"[AZIONE:movecomponent:{target_id}:{direction}]"
                response = f"Spostato il {ordinal_word} {comp_alias}!"
            elif action_type == "highlight":
                action_tag = f"[AZIONE:highlight:{target_id}]"
                response = f"Ecco il {ordinal_word} {comp_alias} evidenziato!"
            else:
                action_tag = f"[AZIONE:removecomponent:{target_id}]"
                response = f"Rimosso il {ordinal_word} {comp_alias}!"

            phrase = f"{random.choice(['sposta', 'evidenzia', 'togli'])} il {ordinal_word} {comp_alias}"
            phrase = augment_phrase(apply_typo(phrase))

            # Add some other random components
            all_comps = comp_ids.copy()
            if random.random() < 0.5:
                extra = random.choice([c for c in PLACEABLE if c != comp_type])
                all_comps.append(_comp_id(extra, 1))

            ctx = random_context_v6(comps=all_comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[target_id],
                actions=[action_tag],
                needs_llm=False,
                response=response,
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "evidenzia il sensore" (unique component type) ---
        HIGHLIGHT_UNIQUE_PHRASES = [
            "evidenzia il sensore", "seleziona il sensore", "mostrami il sensore",
            "dov'e' il sensore?", "trova il sensore", "indicami il sensore",
        ]

        for _ in range(per_case):
            sensor_type = random.choice(["photo-resistor", "phototransistor", "reed-switch"])
            sensor_id = _comp_id(sensor_type, 1)
            comps = [sensor_id, "led1", "resistor1"]
            phrase = augment_phrase(apply_typo(random.choice(HIGHLIGHT_UNIQUE_PHRASES)))
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[sensor_id],
                actions=[f"[AZIONE:highlight:{sensor_id}]"],
                needs_llm=False,
                response=random.choice(["Ecco il sensore evidenziato!", "Sensore evidenziato! Lo vedi?", "Eccolo! ✅"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "collega quello piu' grande" (ambiguous) ---
        AMBIGUOUS_PHRASES = [
            "collega quello piu' grande", "quello grosso", "il componente grande",
            "quello in alto", "quello a sinistra", "quello piccolo",
            "collega la cosa la'", "quello coso",
        ]

        for _ in range(per_case):
            comps = [_comp_id(c, 1) for c in random.sample(PLACEABLE, random.randint(3, 5))]
            phrase = augment_phrase(apply_typo(random.choice(AMBIGUOUS_PHRASES)))
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[],
                actions=[],
                needs_llm=True,
                response=None,
                llm_hint=f"Riferimento ambiguo a componente. Componenti sul circuito: {', '.join(comps)}. Chiedere chiarimento su quale componente intende.",
                ctx=ctx,
            ))

        # --- "l'ultimo che ho messo" (last placed) ---
        LAST_PLACED_PHRASES = [
            "l'ultimo che ho messo", "togli l'ultimo", "rimuovi l'ultimo componente",
            "elimina quello che ho appena messo", "via l'ultimo", "annulla l'ultimo piazzamento",
        ]

        for _ in range(per_case):
            n = random.randint(2, 5)
            comp_types = random.sample(PLACEABLE, min(n, len(PLACEABLE)))
            comps = [_comp_id(c, 1) for c in comp_types]
            last = comps[-1]
            phrase = augment_phrase(apply_typo(random.choice(LAST_PLACED_PHRASES)))
            ctx = random_context_v6(comps=comps)
            results.append(make_example(
                user_msg=phrase,
                intent="circuit",
                entities=[last],
                actions=[f"[AZIONE:removecomponent:{last}]"],
                needs_llm=False,
                response=random.choice(["Ultimo componente rimosso!", "Tolto l'ultimo! ✅", "Via l'ultimo componente aggiunto!"]),
                llm_hint=None,
                ctx=ctx,
            ))

        # --- "quanti LED ci sono?" (count) ---
        COUNT_PHRASES = [
            "quanti LED ci sono?", "quanti resistori ho?", "quanti componenti ho?",
            "cosa c'e' sul circuito?", "elenca i componenti", "che componenti ho?",
            "fammi vedere cosa c'e' sulla breadboard", "lista componenti",
        ]

        for _ in range(per_case):
            n = random.randint(1, 6)
            comps = []
            for _ in range(n):
                c = random.choice(PLACEABLE)
                idx = len([x for x in comps if x.startswith(c.replace("-", ""))]) + 1
                comps.append(_comp_id(c, idx))
            phrase = augment_phrase(apply_typo(random.choice(COUNT_PHRASES)))
            ctx = random_context_v6(comps=comps)
            if comps:
                results.append(make_example(
                    user_msg=phrase,
                    intent="circuit",
                    entities=[],
                    actions=["[AZIONE:getstate]"],
                    needs_llm=False,
                    response=f"Hai {len(comps)} componenti sulla breadboard: {', '.join(comps)}.",
                    llm_hint=None,
                    ctx=ctx,
                ))
            else:
                results.append(make_example(
                    user_msg=phrase,
                    intent="circuit",
                    entities=[],
                    actions=[],
                    needs_llm=False,
                    response="La breadboard e' vuota! Non c'e' nessun componente.",
                    llm_hint=None,
                    ctx=ctx,
                ))

        # --- "cambia il valore del primo resistore" ---
        SETVAL_PHRASES = [
            "cambia il valore del resistore", "metti la resistenza a 1k",
            "imposta il resistore a 220 ohm", "cambia il valore a 10k",
        ]

        for _ in range(per_case):
            n_res = random.choice([1, 2])
            comps = [_comp_id("resistor", i + 1) for i in range(n_res)]
            comps.append("led1")
            val = random.choice(["220", "330", "470", "1000", "4700", "10000"])
            phrase = augment_phrase(apply_typo(random.choice(SETVAL_PHRASES)))
            ctx = random_context_v6(comps=comps)

            if n_res == 1:
                results.append(make_example(
                    user_msg=phrase,
                    intent="circuit",
                    entities=["resistor1"],
                    actions=[f"[AZIONE:setvalue:resistor1:resistance:{val}]"],
                    needs_llm=False,
                    response=f"Resistenza impostata a {val} ohm!",
                    llm_hint=None,
                    ctx=ctx,
                ))
            else:
                results.append(make_example(
                    user_msg=phrase,
                    intent="circuit",
                    entities=["resistor"],
                    actions=[],
                    needs_llm=True,
                    response=None,
                    llm_hint=f"Ci sono {n_res} resistori ({', '.join(c for c in comps if c.startswith('resistor'))}). Chiedi a quale vuole cambiare il valore.",
                    ctx=ctx,
                ))

        return results

    # ================================================================
    # ORCHESTRATOR — distribute n across 7 sub-generators
    # ================================================================
    # Target distribution (inflated ~20% to compensate dedup losses):
    # 720 + 600 + 480 + 600 + 360 + 360 + 480 = 3600 -> dedup -> ~3000
    INFLATE = 1.20
    ratio_sum = 600 + 500 + 400 + 500 + 300 + 300 + 400  # = 3000
    n1 = int(n * INFLATE * 600 / ratio_sum)
    n2 = int(n * INFLATE * 500 / ratio_sum)
    n3 = int(n * INFLATE * 400 / ratio_sum)
    n4 = int(n * INFLATE * 500 / ratio_sum)
    n5 = int(n * INFLATE * 300 / ratio_sum)
    n6 = int(n * INFLATE * 300 / ratio_sum)
    n7 = int(n * INFLATE * 400 / ratio_sum)

    examples = []
    examples.extend(_context_disambiguation(n1))
    examples.extend(_context_multi_action(n2))
    examples.extend(_context_conditional(n3))
    examples.extend(_context_experiment_aware(n4))
    examples.extend(_context_step_aware(n5))
    examples.extend(_context_editor_aware(n6))
    examples.extend(_context_component_state(n7))

    print(f"    Context-aware sub-totals: disambiguation={len(examples) - sum(1 for _ in [])}")
    print(f"      disambiguation:  {n1} target")
    print(f"      multi_action:    {n2} target")
    print(f"      conditional:     {n3} target")
    print(f"      experiment_aware:{n4} target")
    print(f"      step_aware:      {n5} target")
    print(f"      editor_aware:    {n6} target")
    print(f"      component_state: {n7} target")

    return examples


def gen_layer_adversarial(n):
    """Layer 4: Adversarial — input garbled, ambigui, dialettali, trap (~2000).
    9 sub-generators:
      1. heavy_typos (300)     — 50%+ error rate, heavily garbled
      2. mixed_lang (200)      — Italian/English hybrid
      3. vague (300)           — extremely vague references
      4. multi_intent (300)    — multiple intents in one sentence
      5. negation (200)        — corrections and negations
      6. conversational (200)  — intent buried in conversation
      7. emoji (100)           — emoji-only or minimal text
      8. dialect (200)         — regional Italian dialect/slang
      9. traps (200)           — looks like action but is tutor question
    """

    # ================================================================
    # Helpers
    # ================================================================
    def _comp_alias(comp_type):
        if comp_type in COMPONENT_ALIASES:
            return random.choice(COMPONENT_ALIASES[comp_type])
        return comp_type

    def apply_heavy_typo(text, passes=None):
        """Apply typo 2-3 times with high probability for heavy garbling."""
        passes = passes or random.randint(2, 3)
        result = text
        for _ in range(passes):
            result = apply_typo(result, probability=0.75)
        return result

    # ================================================================
    # 1. HEAVY TYPOS (300) — 50%+ error rate
    # ================================================================
    def _adv_heavy_typos(n_target=300):
        results = []

        ACTION_PHRASES_TYPO = [
            ("avvia la simulazione", "action", [], ["[AZIONE:play]"], False,
             ["Simulazione avviata! ▶", "Play! ▶", "Si parte!"], None),
            ("metti un LED", "circuit", ["led"], ["[INTENT:place_and_wire]"], False,
             ["LED posizionato!", "Ecco il LED!"], None),
            ("compila il codice", "action", [], ["[AZIONE:compile]"], False,
             ["Compilazione avviata!", "Compilo!"], None),
            ("togli il resistore", "circuit", ["resistor"], ["[AZIONE:removecomponent:resistor1]"], False,
             ["Resistore rimosso!", "Via il resistore."], None),
            ("fammi un quiz", "teacher", [], ["[AZIONE:quiz]"], False,
             ["Quiz in arrivo!", "Ecco il quiz!"], None),
            ("metti in pausa", "action", [], ["[AZIONE:pause]"], False,
             ["Pausa! ⏸", "Fermato. ⏸"], None),
            ("cancella tutto", "action", [], ["[AZIONE:clearall]"], False,
             ["Tutto rimosso!", "Breadboard svuotata!"], None),
            ("resetta il circuito", "action", [], ["[AZIONE:reset]"], False,
             ["Reset!", "Circuito resettato."], None),
            ("apri l'editor", "action", [], ["[AZIONE:openeditor]"], False,
             ["Editor aperto!", "Ecco l'editor!"], None),
            ("vai al passo successivo", "navigation", [], ["[AZIONE:nextstep]"], False,
             ["Prossimo passo!", "Avanti!"], None),
            ("torna indietro", "action", [], ["[AZIONE:undo]"], False,
             ["Annullato!", "Torno indietro."], None),
            ("carica l'esperimento del semaforo", "navigation", ["v3-cap2-esp1"], ["[AZIONE:loadexp:v3-cap2-esp1]"], False,
             ["Esperimento caricato!", "Ecco il Semaforo!"], None),
            ("metti un buzzer", "circuit", ["buzzer-piezo"], ["[INTENT:place_and_wire]"], False,
             ["Buzzer posizionato!", "Ecco il buzzer!"], None),
            ("mostrami il BOM", "action", [], ["[AZIONE:showbom]"], False,
             ["Ecco la lista componenti!", "BOM aperto!"], None),
            ("aggiungi un potenziometro", "circuit", ["potentiometer"], ["[INTENT:place_and_wire]"], False,
             ["Potenziometro aggiunto!", "Ecco il pot!"], None),
            ("apri il monitor seriale", "action", [], ["[AZIONE:showserial]"], False,
             ["Monitor seriale aperto!", "Ecco il serial monitor!"], None),
            ("passa a scratch", "action", [], ["[AZIONE:switcheditor:scratch]"], False,
             ["Modalita' Scratch!", "Passo a Scratch!"], None),
            ("annulla l'ultima azione", "action", [], ["[AZIONE:undo]"], False,
             ["Annullato!", "Ultima azione annullata."], None),
            ("rifai quello che hai annullato", "action", [], ["[AZIONE:redo]"], False,
             ["Rifatto!", "Azione ripetuta."], None),
            ("metti un condensatore", "circuit", ["capacitor"], ["[INTENT:place_and_wire]"], False,
             ["Condensatore posizionato!", "Ecco il condensatore!"], None),
        ]

        for _ in range(n_target):
            phrase, intent, entities, actions, needs_llm, responses, hint = random.choice(ACTION_PHRASES_TYPO)
            garbled = apply_heavy_typo(phrase)
            garbled = augment_phrase(garbled)
            results.append(make_example(
                user_msg=garbled,
                intent=intent,
                entities=entities,
                actions=actions,
                needs_llm=needs_llm,
                response=random.choice(responses),
                llm_hint=hint,
            ))

        return results

    # ================================================================
    # 2. MIXED LANGUAGE (200) — Italian/English hybrid
    # ================================================================
    def _adv_mixed_lang(n_target=200):
        results = []

        MIXED_TEMPLATES = [
            ("fai il start del circuit", "action", [], ["[AZIONE:play]"], False,
             ["Simulazione avviata! ▶", "Play! ▶"], None),
            ("puoi fare il compile please?", "action", [], ["[AZIONE:compile]"], False,
             ["Compilazione avviata!", "Compilo!"], None),
            ("add un LED red", "circuit", ["led"], ["[INTENT:place_and_wire]"], False,
             ["LED posizionato!", "Ecco il LED rosso!"], None),
            ("open the editor per favore", "action", [], ["[AZIONE:openeditor]"], False,
             ["Editor aperto!", "Ecco l'editor!"], None),
            ("metti un component sulla board", "circuit", [], [], True,
             None, "L'utente vuole aggiungere un componente ma non ha specificato quale"),
            ("delete all the cosi", "action", [], ["[AZIONE:clearall]"], False,
             ["Tutto rimosso!", "Breadboard svuotata!"], None),
            ("give me un quiz di electronics", "teacher", [], ["[AZIONE:quiz]"], False,
             ["Quiz in arrivo!", "Ecco il quiz!"], None),
            ("switch to scratch mode", "action", [], ["[AZIONE:switcheditor:scratch]"], False,
             ["Passo a Scratch!", "Modalita' Scratch attivata!"], None),
            ("show me the serial port", "action", [], ["[AZIONE:showserial]"], False,
             ["Monitor seriale aperto!", "Ecco il serial monitor!"], None),
            ("load next experiment", "navigation", [], ["[AZIONE:nextstep]"], False,
             ["Prossimo passo!", "Avanti!"], None),
            ("fai il pause please", "action", [], ["[AZIONE:pause]"], False,
             ["Pausa! ⏸", "Fermato. ⏸"], None),
            ("reset everything dai", "action", [], ["[AZIONE:reset]"], False,
             ["Reset!", "Circuito resettato."], None),
            ("put un buzzer on the breadboard", "circuit", ["buzzer-piezo"], ["[INTENT:place_and_wire]"], False,
             ["Buzzer posizionato!", "Ecco il buzzer!"], None),
            ("close the editor grazie", "action", [], ["[AZIONE:closeeditor]"], False,
             ["Editor chiuso!", "Chiudo l'editor."], None),
            ("fai l'undo per favore", "action", [], ["[AZIONE:undo]"], False,
             ["Annullato!", "Torno indietro."], None),
            ("can you compile il codice?", "action", [], ["[AZIONE:compile]"], False,
             ["Compilazione avviata!", "Compilo il codice!"], None),
            ("please add una resistenza", "circuit", ["resistor"], ["[INTENT:place_and_wire]"], False,
             ["Resistenza posizionata!", "Ecco la resistenza!"], None),
            ("help me con il circuito", "tutor", [], [], True,
             None, "L'utente chiede aiuto generico sul circuito in lingua mista"),
            ("run the simulation adesso", "action", [], ["[AZIONE:play]"], False,
             ["Simulazione avviata! ▶", "Si parte!"], None),
            ("stop il tutto now", "action", [], ["[AZIONE:pause]"], False,
             ["Pausa! ⏸", "Fermato. ⏸"], None),
            ("next step per piacere", "navigation", [], ["[AZIONE:nextstep]"], False,
             ["Prossimo passo!", "Avanti!"], None),
            ("clear the breadboard tutta", "action", [], ["[AZIONE:clearall]"], False,
             ["Tutto rimosso!", "Breadboard svuotata!"], None),
            ("show il BOM component list", "action", [], ["[AZIONE:showbom]"], False,
             ["Ecco la lista componenti!", "BOM aperto!"], None),
            ("go to arduino mode", "action", [], ["[AZIONE:switcheditor:arduino]"], False,
             ["Passo ad Arduino!", "Modalita' Arduino attivata!"], None),
            ("play il circuit che ho fatto", "action", [], ["[AZIONE:play]"], False,
             ["Simulazione avviata! ▶", "Si parte!"], None),
            ("remove il LED please", "circuit", ["led"], ["[AZIONE:removecomponent:led1]"], False,
             ["LED rimosso!", "Via il LED."], None),
            ("dammi un hint please", "tutor", [], [], True,
             None, "L'utente chiede un suggerimento in lingua mista"),
            ("what does il resistore do?", "tutor", ["resistor"], [], True,
             None, "L'utente chiede informazioni sul resistore in lingua mista"),
        ]

        for _ in range(n_target):
            tmpl = random.choice(MIXED_TEMPLATES)
            phrase, intent, entities, actions, needs_llm, resp_or_none, hint = tmpl
            phrase = augment_phrase(apply_typo(phrase, probability=0.2))
            response = random.choice(resp_or_none) if isinstance(resp_or_none, list) else resp_or_none
            results.append(make_example(
                user_msg=phrase,
                intent=intent,
                entities=entities,
                actions=actions,
                needs_llm=needs_llm,
                response=response,
                llm_hint=hint,
            ))

        return results

    # ================================================================
    # 3. VAGUE REFERENCES (300) — extremely vague
    # ================================================================
    def _adv_vague(n_target=300):
        results = []

        # Vague with context clues → deterministic action
        VAGUE_DETERMINISTIC = [
            # sim stopped → most likely wants play
            {"phrases": ["fai quella cosa", "fai andare", "dai vai", "fallo partire", "fai la magia"],
             "ctx_kwargs": {"sim_state": "stopped"},
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False, "responses": ["Simulazione avviata! ▶", "Si parte!"], "hint": None},
            # sim running → most likely wants pause
            {"phrases": ["fermalo", "stop", "basta cosi'", "ok fermati"],
             "ctx_kwargs": {"sim_state": "running"},
             "intent": "action", "entities": [], "actions": ["[AZIONE:pause]"],
             "needs_llm": False, "responses": ["Pausa! ⏸", "Fermato."], "hint": None},
            # "quello che fa luce" → LED
            {"phrases": ["metti quello che fa luce", "aggiungi la cosa che si illumina",
                         "metti la lucina", "aggiungi quel coso luminoso"],
             "ctx_kwargs": {},
             "intent": "circuit", "entities": ["led"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False, "responses": ["LED posizionato!", "Ecco il LED!"], "hint": None},
            # "il coso che gira" → motor-dc
            {"phrases": ["metti il coso che gira", "aggiungi quello che ruota",
                         "metti la cosa che si muove", "il motorino quel coso"],
             "ctx_kwargs": {},
             "intent": "circuit", "entities": ["motor-dc"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False, "responses": ["Motore DC posizionato!", "Ecco il motorino!"], "hint": None},
            # "la cosa rotonda" → potentiometer
            {"phrases": ["metti la cosa rotonda", "aggiungi il coso tondo",
                         "quello con la manopola", "il rotondo quel coso"],
             "ctx_kwargs": {},
             "intent": "circuit", "entities": ["potentiometer"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False, "responses": ["Potenziometro posizionato!", "Ecco la manopola!"], "hint": None},
            # "il bottoncino" → push-button
            {"phrases": ["metti il bottoncino", "aggiungi il pulsantino",
                         "il cosino che si preme", "metti quel tasto piccolo"],
             "ctx_kwargs": {},
             "intent": "circuit", "entities": ["push-button"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False, "responses": ["Pulsante posizionato!", "Ecco il bottone!"], "hint": None},
            # "la cosa che suona" → buzzer
            {"phrases": ["metti la cosa che suona", "aggiungi il coso sonoro",
                         "quello che fa rumore", "il coso che beepa"],
             "ctx_kwargs": {},
             "intent": "circuit", "entities": ["buzzer-piezo"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False, "responses": ["Buzzer posizionato!", "Ecco il buzzer!"], "hint": None},
        ]

        # Vague without enough context → needs_llm
        VAGUE_AMBIGUOUS = [
            {"phrases": ["metti il coso", "aggiungi quella cosa", "metti un coso",
                         "aggiungi il pezzo", "metti il componente"],
             "intent": "circuit", "entities": [], "actions": [],
             "hint": "L'utente vuole aggiungere un componente ma non ha specificato quale"},
            {"phrases": ["vai la'", "vai dove devo andare", "portami dove serve"],
             "intent": "navigation", "entities": [], "actions": [],
             "hint": "L'utente vuole navigare da qualche parte ma non ha specificato dove"},
            {"phrases": ["fai come prima", "rifai quella cosa", "ripeti l'ultima operazione"],
             "intent": "action", "entities": [], "actions": [],
             "hint": "L'utente vuole ripetere qualcosa ma serve contesto conversazionale"},
            {"phrases": ["apri quel gioco", "fammi giocare", "il giochino quello"],
             "intent": "navigation", "entities": [], "actions": [],
             "hint": "L'utente vuole aprire un gioco ma non ha specificato quale"},
            {"phrases": ["la roba elettronica", "fammi vedere le cose", "mostrami tutto"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente ha fatto una richiesta troppo generica, serve chiarimento"},
            {"phrases": ["quel filo", "il cavetto", "collegami quel coso"],
             "intent": "circuit", "entities": ["wire"], "actions": [],
             "hint": "L'utente si riferisce a un collegamento ma senza specificare quale"},
            {"phrases": ["cambia quella roba", "modifica il coso", "sistema quella cosa"],
             "intent": "circuit", "entities": [], "actions": [],
             "hint": "L'utente vuole modificare qualcosa ma non ha specificato cosa"},
            {"phrases": ["fammi vedere", "mostrami", "fai apparire"],
             "intent": "action", "entities": [], "actions": [],
             "hint": "Richiesta troppo vaga, serve chiarimento su cosa mostrare"},
        ]

        # Generate deterministic vague examples
        det_count = n_target * 2 // 3
        for _ in range(det_count):
            entry = random.choice(VAGUE_DETERMINISTIC)
            phrase = augment_phrase(apply_typo(random.choice(entry["phrases"])))
            ctx = random_context_v6(**entry["ctx_kwargs"])
            results.append(make_example(
                user_msg=phrase,
                intent=entry["intent"],
                entities=entry["entities"],
                actions=entry["actions"],
                needs_llm=entry["needs_llm"],
                response=random.choice(entry["responses"]),
                llm_hint=entry["hint"],
                ctx=ctx,
            ))

        # Generate ambiguous vague examples
        amb_count = n_target - det_count
        for _ in range(amb_count):
            entry = random.choice(VAGUE_AMBIGUOUS)
            phrase = augment_phrase(apply_typo(random.choice(entry["phrases"])))
            results.append(make_example(
                user_msg=phrase,
                intent=entry["intent"],
                entities=entry["entities"],
                actions=entry["actions"],
                needs_llm=True,
                response=None,
                llm_hint=entry["hint"],
            ))

        return results

    # ================================================================
    # 4. MULTI-INTENT (300) — multiple intents in one sentence
    # ================================================================
    def _adv_multi_intent(n_target=300):
        results = []

        MULTI_TEMPLATES = [
            # Pure action sequences (no LLM needed)
            {"phrases": [
                "prima cancella tutto poi carica il semaforo e compilami il codice",
                "cancella, carica il semaforo, compila",
                "clearall, loadexp semaforo, compile",
             ],
             "intent": "action", "entities": ["v3-cap2-esp1"],
             "actions": ["[AZIONE:clearall]", "[AZIONE:loadexp:v3-cap2-esp1]", "[AZIONE:compile]"],
             "needs_llm": False,
             "responses": ["Fatto! Ho cancellato tutto, caricato il Semaforo e avviato la compilazione.", "Cancellato, caricato e compilato!"],
             "hint": None},
            {"phrases": [
                "aggiungi un buzzer collegalo e fammi sentire il suono",
                "metti un buzzer poi collegalo e avvia",
                "buzzer, collega, play",
             ],
             "intent": "circuit", "entities": ["buzzer-piezo"],
             "actions": ["[INTENT:place_and_wire]", "[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Buzzer posizionato, collegato e simulazione avviata!", "Ecco il buzzer, collegato e in azione!"],
             "hint": None},
            {"phrases": [
                "metti un LED e avvia la simulazione",
                "aggiungi un LED poi fai play",
                "LED e poi start",
             ],
             "intent": "circuit", "entities": ["led"],
             "actions": ["[INTENT:place_and_wire]", "[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["LED posizionato e simulazione avviata!", "Ecco il LED, si parte!"],
             "hint": None},
            {"phrases": [
                "annulla e poi rifai",
                "undo e redo",
                "prima undo poi redo",
             ],
             "intent": "action", "entities": [],
             "actions": ["[AZIONE:undo]", "[AZIONE:redo]"],
             "needs_llm": False,
             "responses": ["Annullato e rifatto!", "Undo + Redo eseguiti!"],
             "hint": None},
            {"phrases": [
                "resetta tutto e poi metti un LED rosso",
                "reset e poi aggiungi LED",
                "pulisci e metti un led",
             ],
             "intent": "action", "entities": ["led"],
             "actions": ["[AZIONE:clearall]", "[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Tutto pulito e LED posizionato!", "Reset e LED aggiunto!"],
             "hint": None},
            {"phrases": [
                "apri l'editor e compila",
                "editor e compile",
                "apri editor poi compila il codice",
             ],
             "intent": "action", "entities": [],
             "actions": ["[AZIONE:openeditor]", "[AZIONE:compile]"],
             "needs_llm": False,
             "responses": ["Editor aperto e compilazione avviata!", "Ecco l'editor, compilo!"],
             "hint": None},
            {"phrases": [
                "pausa e mostrami il BOM",
                "fermati e fammi vedere il BOM",
                "stop e BOM",
             ],
             "intent": "action", "entities": [],
             "actions": ["[AZIONE:pause]", "[AZIONE:showbom]"],
             "needs_llm": False,
             "responses": ["In pausa, ecco il BOM!", "Fermato e BOM aperto!"],
             "hint": None},

            # Mixed: some actions + LLM reasoning needed
            {"phrases": [
                "metti un LED poi avvia e se non funziona dimmi perche'",
                "aggiungi LED, play, e spiegami se non va",
                "LED, avvia e poi dimmi cosa c'e' che non va",
             ],
             "intent": "circuit", "entities": ["led"],
             "actions": ["[INTENT:place_and_wire]", "[AZIONE:play]"],
             "needs_llm": True,
             "responses": None,
             "hint": "L'utente vuole piazzare un LED, avviare e poi una spiegazione se non funziona"},
            {"phrases": [
                "resetta togli il LED vecchio metti uno nuovo rosso e avvia",
                "reset, rimuovi LED, aggiungi nuovo LED, play",
                "pulisci, via il LED, nuovo LED, start",
             ],
             "intent": "action", "entities": ["led"],
             "actions": ["[AZIONE:reset]", "[AZIONE:removecomponent:led1]", "[INTENT:place_and_wire]", "[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Reset, LED rimosso, nuovo LED aggiunto e simulazione avviata!", "Fatto tutto: reset, cambio LED e play!"],
             "hint": None},
            {"phrases": [
                "carica il primo esperimento del volume 1 e spiegamelo",
                "loadexp primo vol1 e dimmi come funziona",
                "apri esp1 vol1 e fai il tutor",
             ],
             "intent": "navigation", "entities": ["v1-cap1-esp1"],
             "actions": ["[AZIONE:loadexp:v1-cap1-esp1]"],
             "needs_llm": True,
             "responses": None,
             "hint": "L'utente vuole caricare l'esperimento v1-cap1-esp1 e una spiegazione del contenuto"},
            {"phrases": [
                "compila il codice e se ci sono errori correggili tu",
                "compile e fixami gli errori",
                "compila e sistema i bug",
             ],
             "intent": "code", "entities": [],
             "actions": ["[AZIONE:compile]"],
             "needs_llm": True,
             "responses": None,
             "hint": "L'utente vuole compilare e poi assistenza per correggere eventuali errori"},
            {"phrases": [
                "metti un motore un LED e un buzzer tutti insieme",
                "aggiungi motore LED buzzer",
                "tre componenti: motore, led, buzzer",
             ],
             "intent": "circuit", "entities": ["motor-dc", "led", "buzzer-piezo"],
             "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Motore, LED e buzzer posizionati!", "Ecco i tre componenti!"],
             "hint": None},
        ]

        for _ in range(n_target):
            tmpl = random.choice(MULTI_TEMPLATES)
            phrase = augment_phrase(apply_typo(random.choice(tmpl["phrases"])))
            response = random.choice(tmpl["responses"]) if tmpl["responses"] else None
            results.append(make_example(
                user_msg=phrase,
                intent=tmpl["intent"],
                entities=tmpl["entities"],
                actions=tmpl["actions"],
                needs_llm=tmpl["needs_llm"],
                response=response,
                llm_hint=tmpl["hint"],
            ))

        return results

    # ================================================================
    # 5. NEGATION (200) — corrections and negations
    # ================================================================
    def _adv_negation(n_target=200):
        results = []

        NEGATION_EXAMPLES = [
            # Explicit negations → no action, just acknowledge
            {"phrases": ["non avviare!", "NON premere play!", "non fare play!", "non avviare la simulazione!"],
             "intent": "action", "entities": [], "actions": [],
             "needs_llm": False,
             "responses": ["Ok, non avvio.", "Va bene, non avvio la simulazione.", "Capito, resto fermo."],
             "hint": None},
            {"phrases": ["non toccare niente", "non fare niente", "non muovere nulla",
                         "lascia tutto com'e'", "non cambiare niente"],
             "intent": "action", "entities": [], "actions": [],
             "needs_llm": False,
             "responses": ["Ok, non faccio nulla!", "Perfetto, lascio tutto com'e'.", "D'accordo, non tocco niente."],
             "hint": None},
            {"phrases": ["lascia tutto cosi'", "va bene cosi'", "non serve altro",
                         "perfetto cosi'", "basta cosi'"],
             "intent": "action", "entities": [], "actions": [],
             "needs_llm": False,
             "responses": ["Perfetto, lascio tutto com'e'.", "Ok, tutto a posto!", "Benissimo!"],
             "hint": None},

            # Corrections → correct to the RIGHT action
            {"phrases": ["ho detto pausa non play!", "volevo pausa, non play!",
                         "pausa ho detto, non avviare!"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:pause]"],
             "needs_llm": False,
             "responses": ["Scusa! Metto in pausa. ⏸", "Pausa! ⏸", "Ecco la pausa, scusa!"],
             "hint": None},
            {"phrases": ["scusa, volevo dire compila non cancella",
                         "no aspetta, compile non clearall",
                         "non cancellare, compila!"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:compile]"],
             "needs_llm": False,
             "responses": ["Compilazione avviata!", "Compilo, scusa per l'errore!"],
             "hint": None},
            {"phrases": ["no no no, undo!", "undo! torna indietro!",
                         "no aspetta, annulla!", "annulla tutto!"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:undo]"],
             "needs_llm": False,
             "responses": ["Annullato!", "Torno indietro, scusa!"],
             "hint": None},

            # Correction with component swap
            {"phrases": ["non voglio il LED, voglio il buzzer",
                         "no il LED no, metti un buzzer",
                         "togli il LED e metti un buzzer al suo posto"],
             "intent": "circuit", "entities": ["led", "buzzer-piezo"],
             "actions": ["[AZIONE:removecomponent:led1]", "[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["LED rimosso e buzzer aggiunto!", "Cambio fatto: via LED, ecco il buzzer!"],
             "hint": None},
            {"phrases": ["anzi no, togli la resistenza e metti un condensatore",
                         "scusa, volevo il condensatore non la resistenza",
                         "no la resistenza no, il condensatore"],
             "intent": "circuit", "entities": ["resistor", "capacitor"],
             "actions": ["[AZIONE:removecomponent:resistor1]", "[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Resistenza rimossa e condensatore aggiunto!", "Cambio fatto!"],
             "hint": None},

            # Last instruction wins
            {"phrases": ["fermati! no aspetta vai avanti",
                         "no stop... anzi si, vai avanti",
                         "pausa... no dai, continua"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Si parte! ▶", "Ok, vado avanti!"],
             "hint": None},

            # Needs conversation context
            {"phrases": ["no aspetta non quello, l'altro",
                         "non questo, quello di prima",
                         "no l'altro componente, non questo"],
             "intent": "action", "entities": [], "actions": [],
             "needs_llm": True,
             "responses": None,
             "hint": "L'utente sta correggendo una scelta precedente, serve contesto conversazionale"},
        ]

        for _ in range(n_target):
            entry = random.choice(NEGATION_EXAMPLES)
            phrase = augment_phrase(apply_typo(random.choice(entry["phrases"])))
            response = random.choice(entry["responses"]) if entry["responses"] else None
            results.append(make_example(
                user_msg=phrase,
                intent=entry["intent"],
                entities=entry["entities"],
                actions=entry["actions"],
                needs_llm=entry["needs_llm"],
                response=response,
                llm_hint=entry["hint"],
            ))

        return results

    # ================================================================
    # 6. CONVERSATIONAL (200) — intent buried in conversation
    # ================================================================
    def _adv_conversational(n_target=200):
        results = []

        CONVERSATIONAL_TEMPLATES = [
            {"phrases": [
                "sai che ieri ho fatto un circuito bellissimo? comunque puoi avviare?",
                "ciao! come stai? senti, puoi fare play?",
                "oh oggi e' una bella giornata, vai fai partire il circuito",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Simulazione avviata! ▶", "Si parte!"],
             "hint": None},
            {"phrases": [
                "prof mi ha detto di fare l'esperimento 3 del volume 2, lo puoi caricare?",
                "la maestra vuole che faccia esp3 vol2, me lo carichi?",
                "il professore ha detto esperimento 3 volume 2",
             ],
             "intent": "navigation", "entities": ["v2-cap3-esp1"],
             "actions": ["[AZIONE:loadexp:v2-cap3-esp1]"],
             "needs_llm": False,
             "responses": ["Esperimento caricato!", "Ecco l'esperimento del Volume 2!"],
             "hint": None},
            {"phrases": [
                "stavo pensando... si puo' mettere un buzzer?",
                "ehm scusa ma... posso aggiungere un buzzer?",
                "aspetta un attimo... metti un buzzer dai",
             ],
             "intent": "circuit", "entities": ["buzzer-piezo"],
             "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Buzzer posizionato!", "Ecco il buzzer!"],
             "hint": None},
            {"phrases": [
                "oh bello il simulatore! senti, mi compili il codice?",
                "wow che figata questa roba, compila per favore",
                "bello tutto, comunque compilami il codice va",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:compile]"],
             "needs_llm": False,
             "responses": ["Compilazione avviata!", "Compilo!"],
             "hint": None},
            {"phrases": [
                "sono stanco ma devo finire, vai avanti col passo",
                "uffa che fatica, prossimo step per favore",
                "dai che quasi finisco, avanti con il passo",
             ],
             "intent": "navigation", "entities": [], "actions": ["[AZIONE:nextstep]"],
             "needs_llm": False,
             "responses": ["Prossimo passo!", "Avanti!"],
             "hint": None},
            {"phrases": [
                "mamma mia che casino, cancella tutto per favore",
                "aiuto ho fatto un disastro, togli tutto",
                "che pasticcio, via tutto dalla breadboard",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:clearall]"],
             "needs_llm": False,
             "responses": ["Tutto rimosso!", "Breadboard svuotata!"],
             "hint": None},
            {"phrases": [
                "ah dimenticavo, mi serve anche un resistore da 220",
                "quasi quasi... aggiungi una resistenza",
                "aspetta, manca il resistore!",
             ],
             "intent": "circuit", "entities": ["resistor"],
             "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Resistore aggiunto!", "Ecco la resistenza!"],
             "hint": None},
            {"phrases": [
                "senti mi annoio un po', facciamo un quiz?",
                "basta circuiti per oggi, quiz!",
                "ho finito il circuito, posso fare un quiz?",
             ],
             "intent": "teacher", "entities": [], "actions": ["[AZIONE:quiz]"],
             "needs_llm": False,
             "responses": ["Quiz in arrivo!", "Ecco il quiz!"],
             "hint": None},
            {"phrases": [
                "ma sai che non ho capito niente della lezione? vabe' metti in pausa",
                "il prof ha spiegato malissimo, pausa per favore",
                "non so cosa sto facendo, fermati un attimo",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:pause]"],
             "needs_llm": False,
             "responses": ["Pausa! ⏸", "Fermato. ⏸"],
             "hint": None},
            {"phrases": [
                "sai cosa ti dico? resetta tutto e ricominciamo",
                "ho fatto troppi errori, reset!",
                "va tutto storto, ricominciamo da capo",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:reset]"],
             "needs_llm": False,
             "responses": ["Reset!", "Ricominciamo da capo."],
             "hint": None},
            {"phrases": [
                "una cosa... puoi aprirmi il monitor seriale?",
                "ah si, serve il serial monitor",
                "dimenticavo, apri la seriale",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:showserial]"],
             "needs_llm": False,
             "responses": ["Monitor seriale aperto!", "Ecco il serial monitor!"],
             "hint": None},
            {"phrases": [
                "l'altro giorno la maestra ci ha fatto vedere Arduino, posso passare a Scratch?",
                "preferisco i blocchi, metti scratch",
                "non mi piace scrivere codice, voglio i blocchetti",
             ],
             "intent": "action", "entities": [], "actions": ["[AZIONE:switcheditor:scratch]"],
             "needs_llm": False,
             "responses": ["Passo a Scratch!", "Modalita' Scratch attivata!"],
             "hint": None},
        ]

        for _ in range(n_target):
            tmpl = random.choice(CONVERSATIONAL_TEMPLATES)
            phrase = augment_phrase(apply_typo(random.choice(tmpl["phrases"])))
            results.append(make_example(
                user_msg=phrase,
                intent=tmpl["intent"],
                entities=tmpl["entities"],
                actions=tmpl["actions"],
                needs_llm=tmpl["needs_llm"],
                response=random.choice(tmpl["responses"]),
                llm_hint=tmpl["hint"],
            ))

        return results

    # ================================================================
    # 7. EMOJI (100) — emoji-only or minimal text
    # ================================================================
    def _adv_emoji(n_target=100):
        results = []

        EMOJI_DETERMINISTIC = [
            {"phrases": ["▶️", "▶", "▶️ vai!", "▶️ go!", "▶️▶️▶️"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Simulazione avviata! ▶", "Play! ▶", "Si parte!"],
             "hint": None},
            {"phrases": ["⏸", "⏸️", "⏸ stop", "⏸️ fermati"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:pause]"],
             "needs_llm": False,
             "responses": ["Pausa! ⏸", "Fermato. ⏸"],
             "hint": None},
            {"phrases": ["🎯 quiz!", "🎯 quiz", "🎯 fammi un quiz", "🎯"],
             "intent": "teacher", "entities": [], "actions": ["[AZIONE:quiz]"],
             "needs_llm": False,
             "responses": ["Quiz in arrivo!", "Ecco il quiz!"],
             "hint": None},
            {"phrases": ["📋", "📋 BOM", "📋 lista componenti"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:showbom]"],
             "needs_llm": False,
             "responses": ["Ecco la lista componenti!", "BOM aperto!"],
             "hint": None},
            {"phrases": ["❌ cancella", "❌ via tutto", "❌❌❌"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:clearall]"],
             "needs_llm": False,
             "responses": ["Tutto rimosso!", "Breadboard svuotata!"],
             "hint": None},
            {"phrases": ["⏮ indietro", "⬅️ torna indietro", "↩️ undo"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:undo]"],
             "needs_llm": False,
             "responses": ["Annullato!", "Torno indietro."],
             "hint": None},
        ]

        EMOJI_AMBIGUOUS = [
            {"phrases": ["🔴", "🔴🔴🔴", "rosso"],
             "intent": "circuit", "entities": [], "actions": [],
             "hint": "L'utente ha mandato un emoji rosso, potrebbe voler dire LED rosso, errore, o stop"},
            {"phrases": ["💡", "💡💡", "lampadina"],
             "intent": "circuit", "entities": ["led"], "actions": [],
             "hint": "L'utente probabilmente vuole un LED ma serve conferma"},
            {"phrases": ["🔧", "🔧 aggiusta", "🛠️"],
             "intent": "circuit", "entities": [], "actions": [],
             "hint": "L'utente vuole diagnosticare o riparare qualcosa"},
            {"phrases": ["👍", "👍👍", "ok 👍"],
             "intent": "action", "entities": [], "actions": [],
             "hint": "L'utente conferma qualcosa ma non e' chiaro cosa"},
            {"phrases": ["🔌", "🔌🔌", "collega 🔌"],
             "intent": "circuit", "entities": ["wire"], "actions": [],
             "hint": "L'utente vuole collegare qualcosa ma non ha specificato cosa"},
            {"phrases": ["?", "??", "???"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente ha una domanda ma non l'ha formulata"},
            {"phrases": ["help", "help!", "HELP", "aiuto"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede aiuto generico"},
            {"phrases": ["!!!", "!!!!!", "!!!!!!!!!"],
             "intent": "action", "entities": [], "actions": [],
             "hint": "L'utente esprime sorpresa o frustrazione, serve chiarimento"},
        ]

        # Deterministic emoji
        det_count = n_target * 2 // 3
        for _ in range(det_count):
            entry = random.choice(EMOJI_DETERMINISTIC)
            phrase = random.choice(entry["phrases"])
            results.append(make_example(
                user_msg=phrase,
                intent=entry["intent"],
                entities=entry["entities"],
                actions=entry["actions"],
                needs_llm=entry["needs_llm"],
                response=random.choice(entry["responses"]),
                llm_hint=entry["hint"],
            ))

        # Ambiguous emoji
        amb_count = n_target - det_count
        for _ in range(amb_count):
            entry = random.choice(EMOJI_AMBIGUOUS)
            phrase = random.choice(entry["phrases"])
            results.append(make_example(
                user_msg=phrase,
                intent=entry["intent"],
                entities=entry["entities"],
                actions=entry["actions"],
                needs_llm=True,
                response=None,
                llm_hint=entry["hint"],
            ))

        return results

    # ================================================================
    # 8. DIALECT (200) — Regional Italian dialect/slang
    # ================================================================
    def _adv_dialect(n_target=200):
        results = []

        DIALECT_TEMPLATES = [
            # Roman dialect
            {"phrases": ["daje fallo anda'", "daje fallo parti'", "daje avvia",
                         "ammazza che bel circuito, fallo parti'",
                         "da' fallo anda'", "aho fallo parti'"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Simulazione avviata! ▶", "Si parte!", "Daje! ▶"],
             "hint": None},
            {"phrases": ["levame sto coso", "toglime sto LED", "levame sta roba",
                         "aho toglielo sto coso"],
             "intent": "circuit", "entities": ["led"], "actions": ["[AZIONE:removecomponent:led1]"],
             "needs_llm": False,
             "responses": ["LED rimosso!", "Tolto!"],
             "hint": None},
            {"phrases": ["mettece un LED de'", "mettece 'na lucina",
                         "aho metti un LED", "piazza un LED aho"],
             "intent": "circuit", "entities": ["led"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["LED posizionato!", "Ecco il LED!"],
             "hint": None},

            # Milanese/Northern
            {"phrases": ["dai molla via tutto", "molla via tutta sta roba",
                         "via tutto dai", "butta via tutto"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:clearall]"],
             "needs_llm": False,
             "responses": ["Tutto rimosso!", "Breadboard svuotata!"],
             "hint": None},
            {"phrases": ["piantala e fa pausa", "basta dai fermati",
                         "smettila, pausa", "dai piantala, stop"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:pause]"],
             "needs_llm": False,
             "responses": ["Pausa! ⏸", "Fermato. ⏸"],
             "hint": None},

            # Southern
            {"phrases": ["ue' metti nu LED", "ue' metti un LED",
                         "uaglio' metti un LED", "jamma' metti un LED"],
             "intent": "circuit", "entities": ["led"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["LED posizionato!", "Ecco il LED!"],
             "hint": None},
            {"phrases": ["fallo ji'", "fallo anda'", "fallo camina'", "fallo parti' uaglio'"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Simulazione avviata! ▶", "Si parte!"],
             "hint": None},

            # General slang
            {"phrases": ["spacca!", "spaccalo!", "spacca tutto!"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Si parte! ▶", "Simulazione avviata!"],
             "hint": None},
            {"phrases": ["sgancia il quiz", "sgancia un quiz", "butta fuori un quiz"],
             "intent": "teacher", "entities": [], "actions": ["[AZIONE:quiz]"],
             "needs_llm": False,
             "responses": ["Quiz in arrivo!", "Ecco il quiz!"],
             "hint": None},
            {"phrases": ["butta dentro un buzzer", "ficca un buzzer", "schiaffa un buzzer"],
             "intent": "circuit", "entities": ["buzzer-piezo"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Buzzer posizionato!", "Ecco il buzzer!"],
             "hint": None},
            {"phrases": ["fai girare sta roba", "fai girare sto circuito",
                         "metti in moto sta roba"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Simulazione avviata! ▶", "Si parte!"],
             "hint": None},
            {"phrases": ["toglimi sta schifezza", "via sta roba", "cancella sta porcheria"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:clearall]"],
             "needs_llm": False,
             "responses": ["Tutto rimosso!", "Breadboard svuotata!"],
             "hint": None},
            {"phrases": ["bella zio, avvia", "bella fra' avvia", "bella zi, play",
                         "grande capo, fai partire"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:play]"],
             "needs_llm": False,
             "responses": ["Simulazione avviata! ▶", "Si parte!"],
             "hint": None},
            {"phrases": ["damme un resistore", "passame un resistore", "famme un resistore"],
             "intent": "circuit", "entities": ["resistor"], "actions": ["[INTENT:place_and_wire]"],
             "needs_llm": False,
             "responses": ["Resistore aggiunto!", "Ecco la resistenza!"],
             "hint": None},
            {"phrases": ["compila sto coso", "compila sta roba", "fai il compile sto codice"],
             "intent": "action", "entities": [], "actions": ["[AZIONE:compile]"],
             "needs_llm": False,
             "responses": ["Compilazione avviata!", "Compilo!"],
             "hint": None},
            {"phrases": ["fai vede' il prossimo", "fai vede' avanti", "vai co' lo step dopo"],
             "intent": "navigation", "entities": [], "actions": ["[AZIONE:nextstep]"],
             "needs_llm": False,
             "responses": ["Prossimo passo!", "Avanti!"],
             "hint": None},
        ]

        for _ in range(n_target):
            tmpl = random.choice(DIALECT_TEMPLATES)
            phrase = augment_phrase(apply_typo(random.choice(tmpl["phrases"]), probability=0.15))
            results.append(make_example(
                user_msg=phrase,
                intent=tmpl["intent"],
                entities=tmpl["entities"],
                actions=tmpl["actions"],
                needs_llm=tmpl["needs_llm"],
                response=random.choice(tmpl["responses"]),
                llm_hint=tmpl["hint"],
            ))

        return results

    # ================================================================
    # 9. TRAPS (200) — Looks like action but is actually tutor question
    # ================================================================
    def _adv_traps(n_target=200):
        results = []

        TRAP_TEMPLATES = [
            # Questions ABOUT actions (NOT action requests!)
            {"phrases": ["cosa succede se avvio?", "cosa succede quando premo play?",
                         "che succede se faccio play?", "cosa capita se avvio la simulazione?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede cosa succedera' se avvia, NON vuole avviare"},
            {"phrases": ["a cosa serve il compilatore?", "che fa il compilatore?",
                         "perche' devo compilare?", "cosa significa compilare?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede spiegazione sulla compilazione, NON vuole compilare"},
            {"phrases": ["quando devo premere play?", "quando si usa play?",
                         "in che momento devo avviare?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede consigli su quando avviare, NON vuole avviare adesso"},
            {"phrases": ["perche' si usa il reset?", "a cosa serve resettare?",
                         "quando serve il reset?", "che differenza c'e' tra reset e clearall?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede spiegazione sul reset, NON vuole resettare"},
            {"phrases": ["come funziona il pulsante?", "a cosa serve il pulsante?",
                         "che fa il pulsante nel circuito?", "perche' si usa il pulsante?"],
             "intent": "tutor", "entities": ["push-button"], "actions": [],
             "hint": "L'utente chiede spiegazione sul pulsante, NON vuole interagire"},
            {"phrases": ["cosa fa il serial monitor?", "a cosa serve la seriale?",
                         "che cos'e' il monitor seriale?", "come si usa il serial?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede spiegazione sul serial monitor, NON vuole aprirlo"},
            {"phrases": ["a che serve il BOM?", "cosa mostra il BOM?",
                         "che cos'e' il BOM?", "cosa significa BOM?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede spiegazione sul BOM, NON vuole visualizzarlo"},
            {"phrases": ["si puo' usare il potenziometro senza Arduino?",
                         "serve l'Arduino per il potenziometro?",
                         "il potenziometro funziona da solo?"],
             "intent": "tutor", "entities": ["potentiometer"], "actions": [],
             "hint": "L'utente chiede una domanda teorica sul potenziometro"},
            {"phrases": ["qual e' la differenza tra Scratch e Arduino?",
                         "meglio Scratch o Arduino?",
                         "quando usare Scratch e quando Arduino?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede confronto tra modalita' editor"},
            {"phrases": ["mi conviene usare il passo passo o il sandbox?",
                         "qual e' la differenza tra passo passo e sandbox?",
                         "quando usare sandbox?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede consigli sulle modalita' di costruzione"},
            {"phrases": ["e' meglio cancellare tutto o solo il resistore?",
                         "conviene togliere tutto o solo un pezzo?",
                         "devo cancellare tutto o solo il LED?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede consiglio, NON vuole cancellare"},
            {"phrases": ["dovrei avviare adesso?", "e' il momento giusto per fare play?",
                         "posso avviare o devo prima fare altro?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede conferma prima di avviare, NON vuole avviare"},
            {"phrases": ["come si collega il LED?", "dove va collegato il resistore?",
                         "come si cabla un buzzer?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede spiegazione su come collegare, NON vuole che venga fatto"},
            {"phrases": ["perche' il LED non si accende?", "come mai non funziona?",
                         "perche' il buzzer non suona?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede diagnosi/spiegazione di un problema"},
            {"phrases": ["cosa sono i pin?", "che vuol dire pin digitale?",
                         "cos'e' un pin analogico?", "come funzionano i pin dell'Arduino?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede spiegazione tecnica sui pin"},
            {"phrases": ["come funziona l'undo?", "quante volte posso annullare?",
                         "l'undo torna indietro di quanti passi?"],
             "intent": "tutor", "entities": [], "actions": [],
             "hint": "L'utente chiede come funziona l'undo, NON vuole annullare"},
            {"phrases": ["cos'e' una resistenza?", "a cosa serve la resistenza in un circuito?",
                         "perche' serve il resistore?", "che lavoro fa la resistenza?"],
             "intent": "tutor", "entities": ["resistor"], "actions": [],
             "hint": "L'utente chiede spiegazione teorica sulla resistenza"},
            {"phrases": ["cosa significa LED?", "LED e' un acronimo?",
                         "di che materiale e' fatto un LED?"],
             "intent": "tutor", "entities": ["led"], "actions": [],
             "hint": "L'utente chiede informazioni teoriche sul LED"},
        ]

        for _ in range(n_target):
            tmpl = random.choice(TRAP_TEMPLATES)
            phrase = augment_phrase(apply_typo(random.choice(tmpl["phrases"])))
            results.append(make_example(
                user_msg=phrase,
                intent=tmpl["intent"],
                entities=tmpl["entities"],
                actions=tmpl["actions"],
                needs_llm=True,
                response=None,
                llm_hint=tmpl["hint"],
            ))

        return results

    # ================================================================
    # ORCHESTRATOR
    # ================================================================
    INFLATE = 1.15  # slight inflation for dedup/shuffle trimming

    # Target proportions (sum = 2000)
    ratio_sum = 300 + 200 + 300 + 300 + 200 + 200 + 100 + 200 + 200  # = 2000
    n1 = int(n * INFLATE * 300 / ratio_sum)
    n2 = int(n * INFLATE * 200 / ratio_sum)
    n3 = int(n * INFLATE * 300 / ratio_sum)
    n4 = int(n * INFLATE * 300 / ratio_sum)
    n5 = int(n * INFLATE * 200 / ratio_sum)
    n6 = int(n * INFLATE * 200 / ratio_sum)
    n7 = int(n * INFLATE * 100 / ratio_sum)
    n8 = int(n * INFLATE * 200 / ratio_sum)
    n9 = int(n * INFLATE * 200 / ratio_sum)

    examples = []
    examples.extend(_adv_heavy_typos(n1))
    examples.extend(_adv_mixed_lang(n2))
    examples.extend(_adv_vague(n3))
    examples.extend(_adv_multi_intent(n4))
    examples.extend(_adv_negation(n5))
    examples.extend(_adv_conversational(n6))
    examples.extend(_adv_emoji(n7))
    examples.extend(_adv_dialect(n8))
    examples.extend(_adv_traps(n9))

    print(f"    Adversarial sub-totals:")
    print(f"      heavy_typos:     {n1} target")
    print(f"      mixed_lang:      {n2} target")
    print(f"      vague:           {n3} target")
    print(f"      multi_intent:    {n4} target")
    print(f"      negation:        {n5} target")
    print(f"      conversational:  {n6} target")
    print(f"      emoji:           {n7} target")
    print(f"      dialect:         {n8} target")
    print(f"      traps:           {n9} target")

    return examples


def gen_eval_set(n):
    """Evaluation set bilanciato.
    ~N/7 per intent, mix di facile/medio/difficile.
    Non deve sovrapporsi al training set (uses different seed offset).
    """
    results = []
    per_intent = max(5, n // 7)

    # --- ACTION (direct, needs_llm=false) ---
    action_keys = ["play", "pause", "reset", "clearall", "compile", "undo", "redo",
                   "quiz", "diagnose", "nextstep", "prevstep", "showbom", "showserial",
                   "resetcode", "openeditor", "closeeditor", "switcheditor_scratch",
                   "switcheditor_arduino", "getcode", "fullscreenscratch",
                   "exitscratchfullscreen", "showshortcuts"]
    eval_action_phrases = {
        "play": ["Manda avanti il circuito", "Fai funzionare tutto", "Prova il mio lavoro"],
        "pause": ["Blocca un attimo", "Tieni fermo tutto", "Sospendi"],
        "reset": ["Riparti da zero", "Rimetti com'era prima", "Stato iniziale"],
        "clearall": ["Sgombra la breadboard", "Fai piazza pulita", "Via tutto dal tavolo"],
        "compile": ["Verifica se il programma è giusto", "Controlla il mio sketch", "Buildami il codice"],
        "undo": ["Torna indietro di un passo", "Cancella l'ultima modifica", "Ctrl Z"],
        "redo": ["Rimetti quello che ho tolto", "Ripristina l'azione", "Rifai"],
        "quiz": ["Testami le conoscenze", "Vediamo quanto ho imparato", "Sparami delle domande"],
        "diagnose": ["Cerca problemi nel circuito", "Fai un check-up", "Analisi completa"],
        "nextstep": ["Prosegui col montaggio", "Step successivo", "Vai al prossimo"],
        "prevstep": ["Torna allo step prima", "Passo indietro", "Rifammi vedere il precedente"],
        "showbom": ["Quali pezzi mi servono?", "Lista della spesa componenti", "Materiale necessario"],
        "showserial": ["Fammi vedere l'output seriale", "Apri il terminale", "Monitor dati"],
        "resetcode": ["Rimetti il codice originale", "Cancella le mie modifiche al codice", "Default code"],
        "openeditor": ["Apri dove si scrive il codice", "Mostra l'area di programmazione", "Editor su"],
        "closeeditor": ["Nascondi l'editor", "Chiudi il pannello codice", "Togli il codice"],
        "switcheditor_scratch": ["Programma coi blocchetti", "Modalità visuale", "Usa i puzzle"],
        "switcheditor_arduino": ["Scrivi in C++", "Modalità testo", "Codice Arduino classico"],
        "getcode": ["Mostrami cosa c'è scritto", "Fammi leggere il programma", "Che codice ho?"],
        "fullscreenscratch": ["Blocchi a tutto schermo", "Ingrandisci l'area Scratch", "Scratch full"],
        "exitscratchfullscreen": ["Torna alla vista normale", "Riduci Scratch", "Esci dal fullscreen"],
        "showshortcuts": ["Quali tasti posso usare?", "Scorciatoie tastiera", "Comandi rapidi"],
    }
    action_count = 0
    for key in action_keys:
        if key not in ACTIONS:
            continue
        a = ACTIONS[key]
        phrases = eval_action_phrases.get(key, [f"Esegui {key}"])
        for phrase in phrases[:3]:
            msg = augment_phrase(phrase)
            results.append(make_example(
                msg, a["intent"], a.get("entities", []),
                [a["tag"]], False,
                random.choice(a["responses"]), None,
                random_context_v6(tab="simulator")
            ))
            action_count += 1
            if action_count >= per_intent:
                break
        if action_count >= per_intent:
            break

    # --- CIRCUIT (placement + wiring) ---
    eval_circuit_phrases = [
        ("Piazzami un condensatore sulla breadboard", "capacitor"),
        ("Aggiungi un servomotore", "servo"),
        ("Metti un display LCD", "lcd16x2"),
        ("Inserisci un diodo nel circuito", "diode"),
        ("Voglio un mosfet per controllare il motore", "mosfet-n"),
        ("Dammi un sensore magnetico", "reed-switch"),
        ("Mettimi un fototransistor", "phototransistor"),
        ("Ho bisogno di una fotoresistenza", "photo-resistor"),
        ("Piazza un LED RGB tricolore", "rgb-led"),
        ("Aggiungi un motorino elettrico", "motor-dc"),
    ]
    for phrase, comp in eval_circuit_phrases[:per_intent]:
        intent_json = json.dumps({"action": "place_and_wire", "components": [{"type": comp}], "wires": "auto"}, ensure_ascii=False)
        results.append(make_example(
            augment_phrase(phrase), "circuit", [comp],
            [f"[INTENT:{intent_json}]"], False,
            f"Ecco, {comp} piazzato! ✅", None
        ))

    # --- CODE (needs_llm=true) ---
    eval_code_phrases = [
        "Come controllo un servo con il potenziometro?",
        "Programmami un allarme sonoro con il buzzer",
        "Codice per contare quante volte premo il pulsante",
        "Sketch per alternare due LED",
        "Come uso analogWrite per la luminosità?",
        "Fammi il programma per il gioco Simon Says",
        "Blocchi Scratch per far lampeggiare un LED",
        "Come leggo il valore della fotoresistenza?",
        "Scrivi il codice per una stazione meteo",
        "Programma per far girare il motore a velocità variabile",
    ]
    for phrase in eval_code_phrases[:per_intent]:
        results.append(make_example(
            augment_phrase(phrase), "code", [], [], True,
            None, f"L'utente chiede: {phrase}",
            random_context_v6(tab="editor")
        ))

    # --- TUTOR (needs_llm=true) ---
    eval_tutor_phrases = [
        "Qual è la differenza tra corrente e tensione?",
        "A cosa servono i condensatori?",
        "Come si calcola la resistenza con la legge di Ohm?",
        "Perché il LED ha bisogno di una resistenza?",
        "Cosa significa PWM?",
        "Come funziona un circuito in parallelo?",
        "Che cos'è un transistor MOSFET?",
        "Perché si usa il GND?",
        "Cosa sono i pin analogici?",
        "Spiegami la comunicazione seriale",
        "A cosa serve il duty cycle?",
        "Meglio usare delay o millis?",
    ]
    for phrase in eval_tutor_phrases[:per_intent]:
        results.append(make_example(
            augment_phrase(phrase), "tutor", [], [], True,
            None, f"Domanda teorica: {phrase}"
        ))

    # --- VISION (needs_llm=true) ---
    eval_vision_phrases = [
        "Dai un'occhiata al mio circuito",
        "È collegato giusto?",
        "Vedi qualche errore?",
        "Analizza quello che ho costruito",
        "Controlla i fili",
        "Il circuito ti sembra corretto?",
        "Guarda e dimmi cosa manca",
        "Verifica le connessioni",
    ]
    for phrase in eval_vision_phrases[:per_intent]:
        results.append(make_example(
            augment_phrase(phrase), "vision", [], [], True,
            None, "L'utente chiede analisi visiva del circuito"
        ))

    # --- NAVIGATION ---
    eval_nav_phrases = [
        ("Portami all'esperimento del condensatore", "loadexp", ["v1-cap9-esp1"]),
        ("Apri la lavagna per disegnare", "opentab", ["canvas"]),
        ("Vai al gioco Prevedi e Spiega", "opentab", ["poe"]),
        ("Carica il Volume 2", "openvolume", ["2"]),
        ("Mostrami il manuale", "opentab", ["manual"]),
        ("Apri i miei appunti", "opentab", ["taccuini"]),
        ("Portami al circuito misterioso", "opentab", ["reverse"]),
        ("Carica l'esperimento Hello Arduino", "loadexp", ["v3-cap1-esp1"]),
    ]
    for phrase, sub_action, params in eval_nav_phrases[:per_intent]:
        if sub_action == "loadexp":
            tag = f"[AZIONE:loadexp:{params[0]}]"
            resp = "Esperimento caricato! 📖"
        elif sub_action == "opentab":
            tag = f"[AZIONE:opentab:{params[0]}]"
            resp = f"Ecco il {params[0]}!"
        else:
            tag = f"[AZIONE:openvolume:{params[0]}]"
            resp = f"Volume {params[0]} aperto!"
        results.append(make_example(
            augment_phrase(phrase), "navigation", params,
            [tag], False, resp, None
        ))

    # --- TEACHER (needs_llm=true) ---
    eval_teacher_phrases = [
        "Come sta andando Marco con gli esperimenti?",
        "Report settimanale della classe",
        "Quali studenti hanno completato il Volume 1?",
        "Statistiche dei quiz della 3B",
        "Chi ha avuto più difficoltà?",
        "Progressi degli studenti questa settimana",
        "Riepilogo attività classe",
        "Risultati dell'ultimo test",
    ]
    for phrase in eval_teacher_phrases[:per_intent]:
        results.append(make_example(
            augment_phrase(phrase), "teacher", [], [], True,
            None, f"Richiesta docente: {phrase}"
        ))

    # --- ADVERSARIAL (mixed) ---
    eval_adv = [
        # Heavy typo → action
        ("avía la simulazzione", "action", "[AZIONE:play]", False, "Simulazione avviata! ▶"),
        # Mixed lang → action
        ("fai il compile del code please", "action", "[AZIONE:compile]", False, "Compilazione avviata."),
        # Vague → needs LLM
        ("fai quella cosa di prima", "action", "", True, None),
        # Trap → tutor (NOT action!)
        ("cosa succede se premo play?", "tutor", "", True, None),
        # Emoji → action
        ("▶️ vai!", "action", "[AZIONE:play]", False, "Simulazione avviata! ▶"),
        # Negation
        ("non toccare niente!", "action", "", False, "Ok, non faccio nulla! 👌"),
        # Dialect
        ("daje fallo andà sto circuito", "action", "[AZIONE:play]", False, "Simulazione avviata! ▶"),
        # Multi-intent
        ("cancella tutto e metti un LED", "circuit", "[AZIONE:clearall]", False, "Breadboard svuotata e LED piazzato! ✅"),
        # Conversational buried
        ("sai che bello... comunque compilami il codice", "action", "[AZIONE:compile]", False, "Compilazione avviata."),
        # Trap 2
        ("è meglio usare Scratch o Arduino?", "tutor", "", True, None),
    ]
    for msg, intent, tag, needs_llm, resp in eval_adv:
        actions = [tag] if tag else []
        hint = f"Adversarial: {msg}" if needs_llm else None
        results.append(make_example(
            msg, intent, [], actions, needs_llm, resp, hint
        ))

    random.shuffle(results)
    return results[:n]


# ============================================================
# STATISTICS
# ============================================================

def compute_stats(examples):
    """Calcola e stampa statistiche del dataset."""
    if not examples:
        print("Dataset vuoto — nessuna statistica da mostrare.")
        print(f"\nACTIONS definite: {len(ACTIONS)}")
        print(f"COMPONENTS: {len(COMPONENTS)}")
        print(f"PLACEABLE: {len(PLACEABLE)}")
        print(f"EXPERIMENTS: {len(EXPERIMENTS)}")
        print(f"TABS: {len(TABS)}")
        print(f"EXP_NAMES: {len(EXP_NAMES)}")
        print(f"COMPONENT_ALIASES: {len(COMPONENT_ALIASES)} componenti, "
              f"{sum(len(v) for v in COMPONENT_ALIASES.values())} alias totali")
        print(f"KID_NAMES: {len(KID_NAMES)}")
        print(f"BUILD_MODES: {len(BUILD_MODES)}")
        print(f"\nCategorie azioni:")
        cats = Counter()
        for a in ACTIONS.values():
            cats[a["category"]] += 1
        for cat, cnt in cats.most_common():
            print(f"  {cat}: {cnt}")
        return

    intent_dist = Counter()
    action_dist = Counter()
    needs_llm_dist = Counter()
    total_turns = 0

    for ex in examples:
        msgs = ex["messages"]
        for msg in msgs:
            if msg["role"] == "assistant":
                total_turns += 1
                try:
                    data = json.loads(msg["content"])
                    intent_dist[data.get("intent", "unknown")] += 1
                    needs_llm_dist[data.get("needs_llm", "unknown")] += 1
                    for act in data.get("actions", []):
                        # Normalize parametric actions
                        base = re.sub(r":.*?\]", "]", act) if ":" in act else act
                        action_dist[base] += 1
                except json.JSONDecodeError:
                    intent_dist["INVALID_JSON"] += 1

    print(f"\n{'='*60}")
    print(f"GALILEO BRAIN V6 — DATASET STATISTICS")
    print(f"{'='*60}")
    print(f"Total examples: {len(examples)}")
    print(f"Total assistant turns: {total_turns}")
    print(f"\nIntent distribution:")
    for intent, cnt in intent_dist.most_common():
        pct = 100.0 * cnt / total_turns if total_turns else 0
        print(f"  {intent:20s}: {cnt:5d} ({pct:5.1f}%)")
    print(f"\nneeds_llm distribution:")
    for k, cnt in needs_llm_dist.most_common():
        pct = 100.0 * cnt / total_turns if total_turns else 0
        print(f"  {str(k):20s}: {cnt:5d} ({pct:5.1f}%)")
    print(f"\nTop 20 actions:")
    for act, cnt in action_dist.most_common(20):
        print(f"  {act:40s}: {cnt:5d}")
    print(f"{'='*60}")


# ============================================================
# VALIDATION
# ============================================================

def validate_dataset(filepath):
    """Valida formato JSONL del dataset."""
    if not filepath.exists():
        print(f"File non trovato: {filepath}")
        return False

    errors = 0
    warnings = 0
    total = 0
    valid_intents = {"action", "circuit", "code", "tutor", "vision", "navigation", "teacher"}

    with open(filepath, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            total += 1
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"  ERRORE riga {i}: JSON invalido — {e}")
                errors += 1
                continue

            if "messages" not in obj:
                print(f"  ERRORE riga {i}: manca 'messages'")
                errors += 1
                continue

            msgs = obj["messages"]
            if not msgs or msgs[0]["role"] != "system":
                print(f"  ERRORE riga {i}: primo messaggio non e' system")
                errors += 1
                continue

            for msg in msgs:
                if msg["role"] == "assistant":
                    try:
                        data = json.loads(msg["content"])
                        if data.get("intent") not in valid_intents:
                            print(f"  WARNING riga {i}: intent sconosciuto '{data.get('intent')}'")
                            warnings += 1
                    except json.JSONDecodeError:
                        print(f"  ERRORE riga {i}: assistant content non e' JSON valido")
                        errors += 1

    print(f"\nValidazione completata: {total} righe")
    print(f"  Errori: {errors}")
    print(f"  Warning: {warnings}")
    print(f"  Valide: {total - errors}")
    return errors == 0


# ============================================================
# MAIN
# ============================================================

DEFAULT_COUNTS = {
    "replay": 5000,
    "action": 8000,
    "context": 5000,
    "adversarial": 2000,
    "all": 20000,
}

LAYER_GENERATORS = {
    "replay": gen_layer_replay,
    "action": gen_layer_direct_action,
    "context": gen_layer_context_aware,
    "adversarial": gen_layer_adversarial,
}


def main():
    parser = argparse.ArgumentParser(
        description="Galileo Brain v6 — Onnipotenza Dataset Generator"
    )
    parser.add_argument(
        "--layer",
        choices=["replay", "action", "context", "adversarial", "all"],
        default="all",
        help="Quale layer generare (default: all)",
    )
    parser.add_argument(
        "--count", "-n",
        type=int,
        default=None,
        help="Numero di esempi da generare (default varia per layer)",
    )
    parser.add_argument(
        "--seed", "-s",
        type=int,
        default=42,
        help="Seed per riproducibilita' (default: 42)",
    )
    parser.add_argument(
        "--eval",
        action="store_true",
        help="Genera eval dataset invece del training",
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Mostra solo statistiche (non genera)",
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Valida formato del file output",
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=None,
        help="Path output personalizzato",
    )

    args = parser.parse_args()

    # Seed
    random.seed(args.seed)

    # Determine output path
    script_dir = Path(__file__).resolve().parent
    project_dir = script_dir.parent
    datasets_dir = project_dir / "datasets"
    datasets_dir.mkdir(exist_ok=True)

    if args.output:
        output_path = Path(args.output)
    elif args.eval:
        output_path = datasets_dir / "galileo-brain-v6-eval.jsonl"
    else:
        output_path = datasets_dir / "galileo-brain-v6.jsonl"

    # Stats-only mode
    if args.stats:
        if output_path.exists():
            print(f"Statistiche di: {output_path}")
            examples = []
            with open(output_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        examples.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
            compute_stats(examples)
        else:
            print(f"File non trovato: {output_path}")
            print("Mostro statistiche delle costanti definite:\n")
            compute_stats([])
        return

    # Validate mode
    if args.validate:
        ok = validate_dataset(output_path)
        sys.exit(0 if ok else 1)

    # Determine count
    count = args.count or DEFAULT_COUNTS.get(args.layer, 20000)

    # Generate
    if args.eval:
        print(f"Generazione eval set: {count} esempi...")
        examples = gen_eval_set(count)
    elif args.layer == "all":
        print(f"Generazione completa v6: ~{count} esempi...")
        # Distribuzione tra layer: 25% replay, 40% action, 25% context, 10% adversarial
        n_replay = int(count * 0.25)
        n_action = int(count * 0.40)
        n_context = int(count * 0.25)
        n_adversarial = count - n_replay - n_action - n_context

        examples = []
        for layer_name, layer_count in [
            ("replay", n_replay),
            ("action", n_action),
            ("context", n_context),
            ("adversarial", n_adversarial),
        ]:
            print(f"  Layer {layer_name}: {layer_count}...")
            layer_examples = LAYER_GENERATORS[layer_name](layer_count)
            examples.extend(layer_examples)
            print(f"    -> {len(layer_examples)} generati")
    else:
        print(f"Generazione layer '{args.layer}': {count} esempi...")
        examples = LAYER_GENERATORS[args.layer](count)

    # Shuffle
    random.shuffle(examples)

    # Write
    if examples:
        with open(output_path, "w", encoding="utf-8") as f:
            for ex in examples:
                f.write(json.dumps(ex, ensure_ascii=False) + "\n")
        print(f"\nScritti {len(examples)} esempi in: {output_path}")
        compute_stats(examples)
    else:
        print(f"\nNessun esempio generato (layer generators sono placeholder).")
        print("I generatori verranno implementati nei Task 2-5.")
        print(f"\nVerifica costanti:")
        compute_stats([])

    # File hash for reproducibility
    if examples and output_path.exists():
        h = hashlib.md5(output_path.read_bytes()).hexdigest()
        print(f"\nMD5: {h}")
        print(f"Seed: {args.seed}")
        print(f"Timestamp: {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
