#!/usr/bin/env python3
"""
Galileo Brain v10 Dataset Expansion Generator

Generates ~30K complex training examples to supplement the v9 dataset (126K).
Focus areas:
1. Multi-step circuit builds with precise breadboard/pin control
2. Multi-action sequences (3-5 actions per request)
3. Multi-language (EN, ES, FR, DE + mixed)
4. Complex vision requests (messy photos, annotations, diagnostics)
5. Memory/persistence requests
6. Audio/sound simulation
7. Complete circuit assembly sequences
8. Arduino Nano R4 specifics (pin mapping, PWM, analog)
9. Distorted/slang/typo-heavy inputs
10. Teacher/didactic complex scenarios
"""

import json
import random
import os

random.seed(42)

# ─── System prompt ───
SP = """Sei il Galileo Brain, il cervello di routing di UNLIM — l'assistente AI di ELAB Tutor.
ELAB Tutor e' una piattaforma educativa di elettronica per ragazzi 10-14 anni
e per i loro docenti.

Ricevi il messaggio dell'utente (studente O docente) + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura:
{
  "intent": "action|circuit|code|tutor|vision|navigation|teacher",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}

REGOLE:
1. "intent" classifica: action (play/pause/reset), circuit (componenti/fili), code (Arduino/Scratch), tutor (teoria/spiegazioni), vision (analisi immagini), navigation (carica esperimenti/tab), teacher (richieste didattiche docente)
2. "entities": componenti, pin, esperimenti menzionati
3. "actions": array di [AZIONE:...] o [INTENT:{...}]
4. "needs_llm": false se puoi rispondere da solo, true se serve ragionamento
5. "response": frase breve se needs_llm=false. Azioni meccaniche: telegrafiche. Componenti/diagnosi: una frase calda con personalita'.
6. "llm_hint": se needs_llm=true, descrivi contesto per LLM grande. Indica se l'utente sembra docente o studente, livello competenza percepito. Linguaggio semplice, analogie quotidiane ("la corrente e' come l'acqua!"), tono divertente e coinvolgente. Target: 10-14 anni.

COMPONENTI VALIDI: led, resistor, push-button, buzzer-piezo, capacitor, potentiometer, photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo, reed-switch, phototransistor, battery9v, multimeter, lcd16x2, nano-r4-board, breadboard-half, breadboard-full, wire"""

# ─── Context templates ───
TABS = ['simulator', 'editor', 'canvas', 'manual', 'notebooks', 'video']
EXPERIMENTS_V1 = [
    'v1-cap1-primo-circuito', 'v1-cap2-batteria', 'v1-cap3-primo-led',
    'v1-cap4-led-resistenza', 'v1-cap5-led-serie', 'v1-cap6-led-senza-resistenza',
    'v1-cap7-led-parallelo', 'v1-cap8-pulsante', 'v1-cap9-buzzer',
    'v1-cap10-potenziometro', 'v1-cap11-fotoresistenza',
]
EXPERIMENTS_V2 = [
    'v2-cap1-multimetro', 'v2-cap2-capacitor', 'v2-cap3-diodo',
    'v2-cap4-transistor-npn', 'v2-cap5-mosfet', 'v2-cap6-motore-dc',
    'v2-cap7-servo', 'v2-cap8-reed-switch', 'v2-cap9-rgb-led',
    'v2-cap10-fototransistor', 'v2-cap11-divisore-tensione',
    'v2-cap12-lcd-base',
]
EXPERIMENTS_V3 = [
    'v3-cap1-blink', 'v3-cap2-semaforo', 'v3-cap3-fade',
    'v3-cap4-pulsante-digitale', 'v3-cap5-analog-read',
    'v3-cap6-servo-sweep', 'v3-cap7-buzzer-melody',
    'v3-cap8-analog-read', 'v3-cap9-serial-monitor',
    'v3-cap10-lcd-hello', 'v3-cap11-simon-game',
    'v3-cap12-sos-morse', 'v3-cap13-termometro',
]
ALL_EXPERIMENTS = EXPERIMENTS_V1 + EXPERIMENTS_V2 + EXPERIMENTS_V3

COMPONENTS = [
    'led', 'resistor', 'push-button', 'buzzer-piezo', 'capacitor',
    'potentiometer', 'photo-resistor', 'diode', 'mosfet-n', 'rgb-led',
    'motor-dc', 'servo', 'reed-switch', 'phototransistor', 'battery9v',
    'multimeter', 'lcd16x2', 'nano-r4-board', 'breadboard-half', 'wire'
]

NANO_PINS = {
    'digital': ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'],
    'analog': ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
    'pwm': ['D3', 'D5', 'D6', 'D9', 'D10', 'D11'],
    'power': ['5V', '3.3V', 'GND', 'VIN'],
}

BREADBOARD_ROWS = list(range(1, 31))
BREADBOARD_COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
BUILD_MODES = ['sandbox', 'passopasso', 'giamontato']
EDITOR_MODES = ['arduino', 'scratch']
SIM_STATES = ['stopped', 'running', 'paused']

# ─── Colors ───
LED_COLORS = ['rosso', 'verde', 'blu', 'giallo', 'bianco', 'arancione']
RESISTOR_VALUES = ['100', '220', '330', '470', '1k', '2.2k', '4.7k', '10k', '47k', '100k']

# ─── Responses ───
ACTION_RESPONSES = [
    "Fatto!", "Eccolo!", "Subito!", "Pronto!", "Via!", "Tac!",
    "Ci penso io!", "Detto fatto!", "Eseguito!", "Come vuoi!",
    "A bomba!", "Si parte!", "Bam!", "Zac!", "Boom!",
]
CIRCUIT_RESPONSES = [
    "Piazzato!", "Sul circuito!", "Componente aggiunto!",
    "Eccolo sulla breadboard!", "Montato!", "In posizione!",
]


def make_context(tab=None, exp=None, components=None, fili=None, volume=None,
                 sim=None, build_mode=None, editor_mode=None, code=None):
    tab = tab or random.choice(TABS)
    exp = exp or random.choice(ALL_EXPERIMENTS)
    vol = volume or (1 if 'v1' in exp else 2 if 'v2' in exp else 3)
    n_comp = random.randint(0, 6)
    if components is None:
        comp_list = random.sample(COMPONENTS[:15], min(n_comp, 5))
        components = [f"{c}{i+1}" for i, c in enumerate(comp_list)]
    fili = fili if fili is not None else random.randint(0, 12)
    sim = sim or random.choice(SIM_STATES)
    build_mode = build_mode or random.choice(BUILD_MODES)
    editor_mode = editor_mode or random.choice(EDITOR_MODES)
    code = code if code is not None else random.choice([True, False])

    ctx = f"""[CONTESTO]
tab: {tab}
esperimento: {exp}
componenti: [{', '.join(components)}]
fili: {fili}
volume_attivo: {vol}
simulazione: {sim}
build_mode: {build_mode}
editor_mode: {editor_mode}
codice_presente: {'true' if code else 'false'}"""
    return ctx


def make_example(user_msg, intent, entities, actions, needs_llm,
                 response=None, llm_hint=None, context=None):
    ctx = context or make_context()
    full_msg = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"

    output = {
        "intent": intent,
        "entities": entities,
        "actions": actions,
        "needs_llm": needs_llm,
        "response": response,
        "llm_hint": llm_hint,
    }

    return {
        "messages": [
            {"role": "system", "content": SP},
            {"role": "user", "content": full_msg},
            {"role": "assistant", "content": json.dumps(output, ensure_ascii=False)},
        ]
    }


# ═══════════════════════════════════════════════════════════════
# CATEGORY 1: Multi-step precise circuit builds (~5000)
# ═══════════════════════════════════════════════════════════════
def gen_precise_circuit():
    examples = []

    # Precise breadboard placement
    placement_templates = [
        ("metti un LED {color} nella riga {row} colonna {col}",
         "circuit", ["led"], ["[AZIONE:addcomponent:led]"]),
        ("posiziona la resistenza da {val} ohm tra riga {r1} colonna {c1} e riga {r2} colonna {c2}",
         "circuit", ["resistor"], ["[AZIONE:addcomponent:resistor]"]),
        ("collega un filo dal pin {pin} del nano alla riga {row} colonna {col}",
         "circuit", ["wire"], ["[AZIONE:addwire]"]),
        ("inserisci il buzzer tra riga {row} colonna {c1} e riga {row} colonna {c2}",
         "circuit", ["buzzer-piezo"], ["[AZIONE:addcomponent:buzzer-piezo]"]),
        ("sposta il LED dalla riga {r1} alla riga {r2}",
         "circuit", ["led"], ["[AZIONE:move]"]),
        ("collega GND del nano alla riga {row} della breadboard",
         "circuit", ["wire"], ["[AZIONE:addwire]"]),
        ("collega 5V alla riga {row} colonna {col} con un filo {color_wire}",
         "circuit", ["wire"], ["[AZIONE:addwire]"]),
        ("piazza il potenziometro a cavallo tra riga {r1} e riga {r2}, colonne d-e-f",
         "circuit", ["potentiometer"], ["[AZIONE:addcomponent:potentiometer]"]),
        ("connetti il pin centrale del potenziometro al pin analogico {apin} del nano",
         "circuit", ["wire", "potentiometer"], ["[AZIONE:addwire]"]),
        ("metti la fotoresistenza in riga {row}, collegala ad A0 con una resistenza da 10k come partitore",
         "circuit", ["photo-resistor", "resistor"], ["[AZIONE:addcomponent:photo-resistor]", "[AZIONE:addcomponent:resistor]", "[AZIONE:addwire]"]),
    ]

    wire_colors = ['rosso', 'nero', 'giallo', 'verde', 'blu', 'arancione', 'bianco']

    for _ in range(2000):
        tmpl, intent, entities, actions = random.choice(placement_templates)
        msg = tmpl.format(
            color=random.choice(LED_COLORS),
            row=random.choice(BREADBOARD_ROWS),
            col=random.choice(BREADBOARD_COLS),
            r1=random.choice(BREADBOARD_ROWS[:15]),
            r2=random.choice(BREADBOARD_ROWS[15:]),
            c1=random.choice(BREADBOARD_COLS[:5]),
            c2=random.choice(BREADBOARD_COLS[5:]),
            val=random.choice(RESISTOR_VALUES),
            pin=random.choice(NANO_PINS['digital'] + NANO_PINS['analog']),
            apin=random.choice(NANO_PINS['analog']),
            color_wire=random.choice(wire_colors),
        )
        examples.append(make_example(
            msg, intent, entities, actions, False,
            response=random.choice(CIRCUIT_RESPONSES),
            context=make_context(tab='simulator')
        ))

    # Multi-component builds (3-5 components in one request)
    multi_templates = [
        "costruisci un circuito con {n} LED ({colors}) in {config}, ciascuno con una resistenza da {val} ohm, collegati ai pin {pins}",
        "monta un circuito completo: {comp1} collegato a {pin1}, {comp2} collegato a {pin2}, {comp3} a {pin3}, tutti con GND comune",
        "prepara il circuito del semaforo: LED rosso su {pin1}, LED giallo su {pin2}, LED verde su {pin3}, tutte le resistenze da 220 ohm",
        "assembla: servo su {pin1}, buzzer su {pin2}, LED di stato su {pin3}, pulsante su {pin4} con pull-up",
        "crea il circuito per il simon game: 4 LED (rosso {pin1}, verde {pin2}, blu {pin3}, giallo {pin4}), 4 pulsanti, buzzer su {pin5}",
    ]

    configs = ['serie', 'parallelo', 'serie-parallelo']
    comp_types = ['led', 'buzzer-piezo', 'push-button', 'servo', 'potentiometer', 'motor-dc']

    for _ in range(1500):
        tmpl = random.choice(multi_templates)
        pins = random.sample(NANO_PINS['digital'], 5)
        colors = random.sample(LED_COLORS, min(3, len(LED_COLORS)))
        msg = tmpl.format(
            n=random.randint(2, 5),
            colors=', '.join(colors),
            config=random.choice(configs),
            val=random.choice(RESISTOR_VALUES[:3]),
            pins=', '.join(pins[:3]),
            comp1=random.choice(comp_types), pin1=pins[0],
            comp2=random.choice(comp_types), pin2=pins[1],
            comp3=random.choice(comp_types), pin3=pins[2],
            pin4=pins[3], pin5=pins[4],
        )
        entities = list(set(random.sample(comp_types, 3) + ['resistor', 'wire']))
        actions = [f"[AZIONE:addcomponent:{c}]" for c in entities[:3]] + ["[AZIONE:addwire]"]
        examples.append(make_example(
            msg, "circuit", entities, actions, False,
            response="Costruisco tutto il circuito!",
            context=make_context(tab='simulator', sim='stopped')
        ))

    # Pin-specific wiring
    for _ in range(1500):
        pin = random.choice(NANO_PINS['digital'] + NANO_PINS['analog'])
        comp = random.choice(['led', 'buzzer-piezo', 'servo', 'push-button', 'motor-dc'])
        row = random.choice(BREADBOARD_ROWS)

        msgs = [
            f"collega il {comp} al pin {pin} del nano, con la resistenza sulla riga {row}",
            f"filo dal pin {pin} alla riga {row}, poi {comp} fino a GND",
            f"il {comp} va sul pin {pin}, resistenza in serie, GND sulla rail negativa",
            f"wire: {pin} -> riga {row} col e, {comp} tra riga {row} col f e riga {row+2 if row < 28 else row-2} col f",
        ]
        msg = random.choice(msgs)
        examples.append(make_example(
            msg, "circuit", [comp, "wire", "resistor"],
            [f"[AZIONE:addcomponent:{comp}]", "[AZIONE:addwire]"], False,
            response=random.choice(CIRCUIT_RESPONSES),
            context=make_context(tab='simulator')
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 2: Multi-action sequences (~3000)
# ═══════════════════════════════════════════════════════════════
def gen_multi_action():
    examples = []

    sequences = [
        # 3-action
        ("pulisci tutto, metti un LED rosso e avvia",
         "action", ["led"], ["[AZIONE:clearall]", "[AZIONE:addcomponent:led]", "[AZIONE:play]"],
         False, "Reset, LED piazzato, si parte!"),
        ("ferma, rimuovi il buzzer e ricomincia",
         "action", ["buzzer-piezo"], ["[AZIONE:pause]", "[AZIONE:removecomponent:buzzer-piezo]", "[AZIONE:play]"],
         False, "Fermo, tolto, ripartito!"),
        ("resetta il circuito, carica l'esperimento del semaforo e mostrami il manuale",
         "action", [], ["[AZIONE:clearall]", "[AZIONE:loadexp:v3-cap2-semaforo]", "[AZIONE:opentab:manual]"],
         False, "Pulito, caricato semaforo, ecco il manuale!"),
        ("apri l'editor, passa a Scratch e compila",
         "action", [], ["[AZIONE:opentab:editor]", "[AZIONE:switcheditor:scratch]", "[AZIONE:compile]"],
         False, "Editor aperto, Scratch attivo, compilo!"),
        # 4-action
        ("carica il blink, apri il codice, compila e avvia",
         "action", [], ["[AZIONE:loadexp:v3-cap1-blink]", "[AZIONE:opentab:editor]", "[AZIONE:compile]", "[AZIONE:play]"],
         False, "Blink caricato, compilato, si parte!"),
        ("ferma tutto, pulisci, metti LED e resistenza, e avvia",
         "action", ["led", "resistor"], ["[AZIONE:pause]", "[AZIONE:clearall]", "[AZIONE:addcomponent:led]", "[AZIONE:addcomponent:resistor]", "[AZIONE:play]"],
         False, "Stop, pulito, montato, via!"),
        # 5-action chain
        ("reset completo: ferma la sim, pulisci la breadboard, carica l'esperimento del fade, apri il codice e compilalo",
         "action", [], ["[AZIONE:pause]", "[AZIONE:clearall]", "[AZIONE:loadexp:v3-cap3-fade]", "[AZIONE:opentab:editor]", "[AZIONE:compile]"],
         False, "Reset totale fatto, fade pronto!"),
    ]

    # Generate variations
    for _ in range(3000):
        base = random.choice(sequences)
        msg, intent, entities, actions, needs_llm, response = base

        # Add noise/variations
        noise_ops = [
            lambda m: m.replace('metti', random.choice(['piazza', 'aggiungi', 'inserisci', 'butta'])),
            lambda m: m.replace('avvia', random.choice(['fai partire', 'accendi', 'dai il via', 'lancia', 'starta'])),
            lambda m: m.replace('ferma', random.choice(['stoppa', 'blocca', 'freezxa', 'metti in pausa'])),
            lambda m: m.replace('pulisci', random.choice(['ripulisci', 'svuota', 'cancella', 'togli tutto'])),
            lambda m: m + random.choice(['', ' dai!', ' forza!', ' veloce!', ' subito!', ' please']),
            lambda m: m.lower(),
            lambda m: m.replace('e ', random.choice(['e poi ', 'dopo ', 'quindi ', ', ', ' + '])),
        ]
        modified_msg = msg
        for _ in range(random.randint(1, 3)):
            op = random.choice(noise_ops)
            modified_msg = op(modified_msg)

        examples.append(make_example(
            modified_msg, intent, entities, actions, needs_llm,
            response=response,
            context=make_context()
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 3: Multi-language (~5000)
# ═══════════════════════════════════════════════════════════════
def gen_multilang():
    examples = []

    translations = {
        'en': [
            ("start the simulation", "action", [], ["[AZIONE:play]"], False, "Started!"),
            ("stop everything", "action", [], ["[AZIONE:pause]"], False, "Stopped!"),
            ("add a red LED", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], False, "LED added!"),
            ("what is Ohm's law?", "tutor", [], [], True, None),
            ("look at my circuit", "vision", [], ["[AZIONE:screenshot]"], True, None),
            ("write code for the LED", "code", [], ["[AZIONE:openeditor]"], True, None),
            ("load the blink experiment", "navigation", [], ["[AZIONE:loadexp:v3-cap1-blink]"], False, "Loaded!"),
            ("switch to Scratch", "action", [], ["[AZIONE:switcheditor:scratch]"], False, "Switched to Scratch!"),
            ("I don't understand anything, help me", "tutor", [], [], True, None),
            ("turn the potentiometer", "action", ["potentiometer"], ["[AZIONE:interact]"], False, "Done!"),
            ("connect the LED to pin D3", "circuit", ["led", "wire"], ["[AZIONE:addwire]"], False, "Connected!"),
            ("what does a resistor do?", "tutor", ["resistor"], [], True, None),
            ("show me the manual", "navigation", [], ["[AZIONE:opentab:manual]"], False, "Here's the manual!"),
            ("reset the circuit", "action", [], ["[AZIONE:clearall]"], False, "Reset!"),
            ("compile and run", "action", [], ["[AZIONE:compile]", "[AZIONE:play]"], False, "Compiled and running!"),
            ("take a photo of the circuit and analyze it", "vision", [], ["[AZIONE:screenshot]"], True, None),
            ("how do I make an LED blink with Arduino?", "code", ["led"], [], True, None),
            ("place a 220 ohm resistor on row 15", "circuit", ["resistor"], ["[AZIONE:addcomponent:resistor]"], False, "Placed!"),
            ("I want to build a traffic light", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], True, None),
            ("what's wrong with my circuit?", "vision", [], ["[AZIONE:screenshot]"], True, None),
        ],
        'es': [
            ("inicia la simulacion", "action", [], ["[AZIONE:play]"], False, "Iniciado!"),
            ("para todo", "action", [], ["[AZIONE:pause]"], False, "Parado!"),
            ("pon un LED rojo", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], False, "LED colocado!"),
            ("que es la ley de Ohm?", "tutor", [], [], True, None),
            ("mira mi circuito", "vision", [], ["[AZIONE:screenshot]"], True, None),
            ("escribe el codigo para el LED", "code", [], ["[AZIONE:openeditor]"], True, None),
            ("carga el experimento del blink", "navigation", [], ["[AZIONE:loadexp:v3-cap1-blink]"], False, "Cargado!"),
            ("cambia a Scratch", "action", [], ["[AZIONE:switcheditor:scratch]"], False, "Cambiado a Scratch!"),
            ("no entiendo nada, ayuda", "tutor", [], [], True, None),
            ("gira el potenciometro", "action", ["potentiometer"], ["[AZIONE:interact]"], False, "Listo!"),
            ("conecta el LED al pin D5", "circuit", ["led", "wire"], ["[AZIONE:addwire]"], False, "Conectado!"),
            ("como funciona una resistencia?", "tutor", ["resistor"], [], True, None),
            ("quiero construir un semaforo", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], True, None),
        ],
        'fr': [
            ("demarre la simulation", "action", [], ["[AZIONE:play]"], False, "Demarre!"),
            ("arrete tout", "action", [], ["[AZIONE:pause]"], False, "Arrete!"),
            ("ajoute une LED rouge", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], False, "LED ajoutee!"),
            ("qu'est-ce que la loi d'Ohm?", "tutor", [], [], True, None),
            ("regarde mon circuit", "vision", [], ["[AZIONE:screenshot]"], True, None),
            ("ecris le code pour la LED", "code", [], ["[AZIONE:openeditor]"], True, None),
            ("charge l'experience du blink", "navigation", [], ["[AZIONE:loadexp:v3-cap1-blink]"], False, "Charge!"),
            ("je comprends rien aide-moi", "tutor", [], [], True, None),
            ("tourne le potentiometre", "action", ["potentiometer"], ["[AZIONE:interact]"], False, "Fait!"),
            ("connecte la LED au pin D3", "circuit", ["led", "wire"], ["[AZIONE:addwire]"], False, "Connecte!"),
        ],
        'de': [
            ("starte die Simulation", "action", [], ["[AZIONE:play]"], False, "Gestartet!"),
            ("stopp alles", "action", [], ["[AZIONE:pause]"], False, "Gestoppt!"),
            ("setze eine rote LED", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], False, "LED gesetzt!"),
            ("was ist das Ohmsche Gesetz?", "tutor", [], [], True, None),
            ("schau dir meine Schaltung an", "vision", [], ["[AZIONE:screenshot]"], True, None),
            ("schreib den Code fuer die LED", "code", [], ["[AZIONE:openeditor]"], True, None),
            ("lade das Blink-Experiment", "navigation", [], ["[AZIONE:loadexp:v3-cap1-blink]"], False, "Geladen!"),
            ("ich verstehe nichts hilf mir", "tutor", [], [], True, None),
            ("dreh den Potentiometer", "action", ["potentiometer"], ["[AZIONE:interact]"], False, "Gemacht!"),
            ("verbinde die LED mit Pin D5", "circuit", ["led", "wire"], ["[AZIONE:addwire]"], False, "Verbunden!"),
        ],
        'mixed': [
            ("please avvia the simulazione", "action", [], ["[AZIONE:play]"], False, "Via!"),
            ("yo quiero un LED rojo en la riga 10", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], False, "Piazzato!"),
            ("c'est quoi un resistor? Non capisco", "tutor", ["resistor"], [], True, None),
            ("start la sim e poi metti un buzzer", "action", ["buzzer-piezo"], ["[AZIONE:play]", "[AZIONE:addcomponent:buzzer-piezo]"], False, "Partito e buzzer aggiunto!"),
            ("help me with il circuito del semaforo", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], True, None),
            ("donde esta il manuale? Open it", "navigation", [], ["[AZIONE:opentab:manual]"], False, "Ecco il manuale!"),
            ("ich brauche eine resistenza da 220", "circuit", ["resistor"], ["[AZIONE:addcomponent:resistor]"], False, "Resistenza aggiunta!"),
        ],
    }

    for lang, items in translations.items():
        for _ in range(1000 // len(items) + 1):
            for msg, intent, entities, actions, needs_llm, response in items:
                hint = f"Richiesta in {'inglese' if lang == 'en' else 'spagnolo' if lang == 'es' else 'francese' if lang == 'fr' else 'tedesco' if lang == 'de' else 'multilingua'}. Rispondi in italiano." if needs_llm else None
                examples.append(make_example(
                    msg, intent, entities, actions, needs_llm,
                    response=response, llm_hint=hint,
                    context=make_context()
                ))

    return examples[:5000]


# ═══════════════════════════════════════════════════════════════
# CATEGORY 4: Complex vision requests (~3000)
# ═══════════════════════════════════════════════════════════════
def gen_vision():
    examples = []

    vision_msgs = [
        # Basic photo analysis
        "guarda questa foto del mio circuito, ci sono fili dappertutto e non capisco se e' giusto",
        "analizza la mia breadboard, ho fatto un casino con i fili",
        "la foto mostra il mio primo circuito, e' collegato bene?",
        "ho fatto una foto al progetto, dimmi se manca qualcosa",
        # Messy/distorted
        "la foto e' un po' sfocata ma riesci a vedere il circuito?",
        "ho fotografato la breadboard di traverso, scusa, riesci a vedere?",
        "foto bruttissima ma guarda se i fili sono ok",
        "e' buia la foto ma dovresti vedere il LED e la resistenza",
        # With annotations
        "nella foto ho messo delle frecce rosse dove penso ci sia l'errore",
        "ho scritto con la penna sulla foto dove vanno i fili, vedi?",
        "ho cerchiato in rosso la parte che non funziona, guarda",
        "ho annotato la breadboard con i numeri delle righe, aiutami",
        # Diagnostic requests
        "il LED non si accende, guarda la foto e dimmi perche'",
        "il buzzer non suona, controlla la foto dei collegamenti",
        "il motore gira al contrario, guarda come l'ho collegato",
        "il servo non si muove, ecco la foto del circuito",
        "il potenziometro non cambia nulla, foto allegata",
        "il multimetro segna 0V, controlla i fili nella foto",
        # Volume/book comparison
        "guarda la foto e confrontala con l'immagine del libro",
        "la mia breadboard e' uguale a quella del volume 1?",
        "confronta il mio montaggio con il disegno Fritzing",
        "il circuito nella foto corrisponde all'esperimento 5?",
        # Platform screenshots
        "guarda lo screenshot della piattaforma, qualcosa non va",
        "lo screenshot mostra un errore nel codice, cosa sbaglio?",
        "ecco lo screenshot del Serial Monitor, i valori sono giusti?",
        "nella schermata vedo un warning, cosa significa?",
        # Complex diagnostics
        "ho 3 LED ma solo 2 si accendono, guarda la foto e trova il problema",
        "il circuito funzionava ieri ma oggi no, ecco la foto di oggi",
        "ho ricostruito il circuito del libro ma non funziona, confronta le foto",
        "il display LCD mostra caratteri strani, ecco la foto, cosa faccio?",
        "i fili sono tutti giusti ma il LED lampeggia quando non dovrebbe, foto allegata",
    ]

    for _ in range(3000):
        msg = random.choice(vision_msgs)
        # Add some noise
        if random.random() < 0.3:
            msg = msg.lower()
        if random.random() < 0.2:
            msg += random.choice([' dai', ' please', ' help', ' aiuto', ' perfavore'])
        if random.random() < 0.15:
            # Typos
            msg = msg.replace('circuito', random.choice(['circuto', 'circuio', 'circ']))
            msg = msg.replace('breadboard', random.choice(['bread', 'bb', 'breadbord']))

        examples.append(make_example(
            msg, "vision", [], ["[AZIONE:screenshot]"], True,
            llm_hint="Analisi visiva richiesta. Lo studente ha inviato una foto/screenshot del circuito e vuole aiuto diagnostico. Verifica collegamenti, componenti, polarita'.",
            context=make_context(tab=random.choice(['simulator', 'canvas']))
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 5: Memory/persistence + audio + slang (~3000)
# ═══════════════════════════════════════════════════════════════
def gen_memory_audio_slang():
    examples = []

    # Memory/persistence
    memory_msgs = [
        ("ricordi cosa abbiamo fatto prima?", "tutor", True, "Lo studente chiede se ricordiamo la sessione precedente."),
        ("torna al circuito che avevo prima", "navigation", False, None),
        ("rifai esattamente quello che ho fatto 5 minuti fa", "action", False, None),
        ("quale esperimento stavo facendo?", "tutor", True, "Lo studente non ricorda l'esperimento corrente."),
        ("salva questo circuito per dopo", "action", False, None),
        ("ripristina il mio ultimo progetto", "navigation", False, None),
        ("dove ero rimasto?", "tutor", True, "Lo studente vuole riprendere da dove aveva lasciato."),
        ("annulla le ultime 3 modifiche", "action", True, None),
    ]

    for _ in range(500):
        msg, intent, needs_llm, hint = random.choice(memory_msgs)
        actions = ["[AZIONE:undo]"] if "annulla" in msg else ["[AZIONE:loadexp]"] if "torna" in msg or "ripristina" in msg else []
        examples.append(make_example(
            msg, intent, [], actions, needs_llm,
            response=None if needs_llm else "Fatto!",
            llm_hint=hint,
            context=make_context()
        ))

    # Audio/sound requests
    audio_msgs = [
        ("fammi sentire il buzzer", "action", ["buzzer-piezo"], ["[AZIONE:play]"]),
        ("suona una nota a 440Hz", "action", ["buzzer-piezo"], ["[AZIONE:interact]"]),
        ("riproduci la melodia del buzzer", "action", ["buzzer-piezo"], ["[AZIONE:play]"]),
        ("il buzzer deve suonare piu' forte", "action", ["buzzer-piezo"], ["[AZIONE:setvalue]"]),
        ("cambia la frequenza del buzzer a 1000Hz", "action", ["buzzer-piezo"], ["[AZIONE:setvalue]"]),
        ("fai suonare l'altoparlante", "action", ["buzzer-piezo"], ["[AZIONE:play]"]),
        ("metti il volume al massimo", "action", [], ["[AZIONE:setvalue]"]),
        ("silenzia tutto", "action", [], ["[AZIONE:pause]"]),
        ("riproduci il suono SOS in morse", "action", ["buzzer-piezo"], ["[AZIONE:play]"]),
        ("fai un beep", "action", ["buzzer-piezo"], ["[AZIONE:interact]"]),
    ]

    for _ in range(500):
        msg, intent, entities, actions = random.choice(audio_msgs)
        examples.append(make_example(
            msg, intent, entities, actions, False,
            response=random.choice(ACTION_RESPONSES),
            context=make_context(tab='simulator')
        ))

    # Slang/typo/distorted Italian
    slang_msgs = [
        ("daje fallo partire sto circuito", "action", [], ["[AZIONE:play]"], False, "Partito!"),
        ("nn capisco nnt d qst roba", "tutor", [], [], True, None),
        ("bro metti n led", "circuit", ["led"], ["[AZIONE:addcomponent:led]"], False, "LED aggiunto!"),
        ("ao ma che fa sta cosa??", "tutor", [], [], True, None),
        ("ammazza quanto e' figo sto circuito, fallo andare", "action", [], ["[AZIONE:play]"], False, "Via!"),
        ("ma che e' er potenziometro?", "tutor", ["potentiometer"], [], True, None),
        ("spe spe ferma tt", "action", [], ["[AZIONE:pause]"], False, "Fermo!"),
        ("bella zio, come funziona er LED?", "tutor", ["led"], [], True, None),
        ("fra metti na resistenza", "circuit", ["resistor"], ["[AZIONE:addcomponent:resistor]"], False, "Resistenza aggiunta!"),
        ("Cmq la breadb e' troppo piccola", "tutor", ["breadboard-half"], [], True, None),
        ("vbb fai te tanto io nn capisco", "tutor", [], [], True, None),
        ("aiut aiut nn funziona nnt!!", "tutor", [], [], True, None),
        ("ooooo ma perche nn va???", "tutor", [], [], True, None),
        ("ok ok fai partire daje", "action", [], ["[AZIONE:play]"], False, "Si parte!"),
        ("cmnq il codice nn compila", "code", [], ["[AZIONE:compile]"], True, None),
        ("ma che cazz ha sto circuito??", "vision", [], ["[AZIONE:screenshot]"], True, None),
        ("ehm... come si fa?", "tutor", [], [], True, None),
        ("belloooo funzionaaaa!!!! avanti col prossimo", "navigation", [], ["[AZIONE:loadexp]"], False, "Prossimo esperimento!"),
        ("sto coso rosso cosè? il led?", "tutor", ["led"], [], True, None),
        ("mettici pure er buzzer va", "circuit", ["buzzer-piezo"], ["[AZIONE:addcomponent:buzzer-piezo]"], False, "Buzzer aggiunto!"),
    ]

    for _ in range(2000):
        msg, intent, entities, actions, needs_llm, response = random.choice(slang_msgs)
        hint = "Studente usa linguaggio informale/slang. Rispondi in modo divertente ma educativo." if needs_llm else None
        examples.append(make_example(
            msg, intent, entities, actions, needs_llm,
            response=response, llm_hint=hint,
            context=make_context()
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 6: Teacher/didactic complex (~3000)
# ═══════════════════════════════════════════════════════════════
def gen_teacher():
    examples = []

    teacher_msgs = [
        ("prepara una lezione sulla legge di Ohm per la mia classe di terza media",
         "teacher", [], [], True, "Docente richiede piano lezione su legge di Ohm. Livello: terza media. Preparare sequenza esperimenti + spiegazioni adatte."),
        ("come posso spiegare la corrente elettrica ai miei studenti di 12 anni?",
         "teacher", [], [], True, "Docente cerca strategia didattica per corrente elettrica. Target: 12 anni. Suggerire analogie (acqua, traffico) ed esperimenti pratici."),
        ("ho 25 studenti e 10 kit ELAB, come organizzo il laboratorio?",
         "teacher", [], [], True, "Docente pianifica laboratorio per 25 studenti con 10 kit. Suggerire rotazione gruppi, tempi, esperimenti paralleli."),
        ("quali esperimenti posso fare in 45 minuti con il volume 1?",
         "teacher", [], [], True, "Docente ha 45 minuti. Volume 1. Suggerire 2-3 esperimenti brevi con setup/cleanup inclusi."),
        ("crea un quiz di 10 domande sull'elettronica base",
         "teacher", [], ["[AZIONE:quiz]"], True, "Docente vuole quiz valutativo. 10 domande su elettronica base (tensione, corrente, resistenza, LED, circuiti)."),
        ("dammi una rubrica di valutazione per il progetto del semaforo",
         "teacher", [], [], True, "Docente richiede rubrica. Progetto semaforo. Criteri: correttezza circuito, codice, creativita', documentazione."),
        ("come valuto se uno studente ha capito i circuiti in serie e parallelo?",
         "teacher", [], [], True, "Docente chiede strumenti di valutazione. Serie vs parallelo. Suggerire esperimenti diagnostici e domande chiave."),
        ("prepara un compito in classe sulla breadboard",
         "teacher", [], [], True, "Docente vuole compito scritto sulla breadboard. Includere: schema, domande pratiche, esercizio di collegamento."),
        ("i miei studenti si annoiano, come rendo la lezione piu' divertente?",
         "teacher", [], [], True, "Docente cerca engagement. Suggerire gamification, sfide a tempo, progetti creativi, competizioni tra gruppi."),
        ("devo fare una lezione inclusiva, ho uno studente con DSA",
         "teacher", [], [], True, "Docente ha studente DSA. Suggerire: font grandi, istruzioni step-by-step, supporto visivo, tempo extra, peer tutoring."),
        ("come collego la lezione di elettronica alla fisica del programma ministeriale?",
         "teacher", [], [], True, "Docente vuole integrazione curricolare. Elettronica + fisica ministeriale. Riferimenti a tensione, corrente, potenza, energia."),
        ("prepara 3 livelli di difficolta' per l'esperimento del LED",
         "teacher", [], [], True, "Docente vuole differenziazione. 3 livelli: base (LED+resistenza), intermedio (3 LED serie/parallelo), avanzato (RGB PWM)."),
    ]

    for _ in range(3000):
        msg, intent, entities, actions, needs_llm, hint = random.choice(teacher_msgs)
        # Add variations
        if random.random() < 0.3:
            msg = msg.replace("miei studenti", random.choice(["miei alunni", "i ragazzi", "la classe"]))
        if random.random() < 0.2:
            msg += random.choice([" grazie", " per favore", " urgente", " per domani"])

        examples.append(make_example(
            msg, intent, entities, actions, needs_llm,
            llm_hint=hint,
            context=make_context(tab=random.choice(['simulator', 'manual', 'notebooks']))
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 7: Navigation boost (~2000)
# ═══════════════════════════════════════════════════════════════
def gen_navigation():
    examples = []

    nav_templates = [
        ("carica l'esperimento {exp}", "navigation", [], ["[AZIONE:loadexp:{exp}]"], False, "Caricato!"),
        ("apri il tab {tab}", "navigation", [], ["[AZIONE:opentab:{tab}]"], False, "Aperto!"),
        ("vai all'esperimento del capitolo {n} volume {v}", "navigation", [], ["[AZIONE:loadexp]"], False, "Caricato!"),
        ("mostrami il video dell'esperimento", "navigation", [], ["[AZIONE:opentab:video]"], False, "Ecco il video!"),
        ("apri il manuale del volume {v}", "navigation", [], ["[AZIONE:opentab:manual]"], False, "Ecco il manuale!"),
        ("vai avanti col montaggio", "navigation", [], ["[AZIONE:nextstep]"], False, "Prossimo passo!"),
        ("torna indietro di un passo", "navigation", [], ["[AZIONE:prevstep]"], False, "Passo precedente!"),
        ("fammi vedere il quaderno degli appunti", "navigation", [], ["[AZIONE:opentab:notebooks]"], False, "Ecco il quaderno!"),
        ("cambia esperimento, voglio il {exp}", "navigation", [], ["[AZIONE:loadexp:{exp}]"], False, "Esperimento cambiato!"),
        ("cerca un video su YouTube su come si usa il multimetro", "navigation", [], ["[AZIONE:searchvideo]"], True, None),
        ("mostrami tutti gli esperimenti del volume 2", "navigation", [], ["[AZIONE:opentab:experiments]"], False, "Ecco gli esperimenti!"),
        ("apri il canvas per disegnare", "navigation", [], ["[AZIONE:opentab:canvas]"], False, "Canvas aperto!"),
    ]

    for _ in range(2000):
        tmpl = random.choice(nav_templates)
        msg_tmpl, intent, entities, actions_tmpl, needs_llm, response = tmpl
        exp = random.choice(ALL_EXPERIMENTS)
        tab = random.choice(TABS)
        v = random.choice([1, 2, 3])
        n = random.randint(1, 13)

        msg = msg_tmpl.format(exp=exp, tab=tab, v=v, n=n)
        actions = [a.format(exp=exp, tab=tab) for a in actions_tmpl]

        examples.append(make_example(
            msg, intent, entities, actions, needs_llm,
            response=response,
            llm_hint="Richiesta di navigazione/caricamento esperimento." if needs_llm else None,
            context=make_context()
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 8: Arduino Nano R4 specific (~2000)
# ═══════════════════════════════════════════════════════════════
def gen_nano_specific():
    examples = []

    nano_msgs = [
        # Pin-specific
        ("quali pin sono PWM sul nano?", "tutor", ["nano-r4-board"], [], True,
         "Domanda sui pin PWM del Nano R4. PWM: D3, D5, D6, D9, D10, D11. Spiega cosa fa il PWM (modulazione larghezza impulso)."),
        ("come collego il servo al pin D9?", "circuit", ["servo", "wire"], ["[AZIONE:addwire]"], True,
         "Collegamento servo a D9 (PWM). Servo: segnale -> D9, rosso -> 5V, nero -> GND."),
        ("posso usare il pin A0 come digitale?", "tutor", ["nano-r4-board"], [], True,
         "Domanda su pin analogici come digitali. Si', i pin A0-A5 funzionano anche come digitali (14-19)."),
        ("quanta corrente posso prelevare dal pin D5?", "tutor", ["nano-r4-board"], [], True,
         "Limiti corrente pin digitale. Max 20mA per pin, 200mA totale. Sempre usare resistenze con LED!"),
        ("collega il LED al pin D13 senza resistenza, funziona?", "tutor", ["led", "nano-r4-board"], [], True,
         "Domanda pericolosa! D13 ha resistenza interna per il LED onboard, ma per LED esterni SERVE SEMPRE la resistenza."),
        ("il mio nano non si connette, cosa faccio?", "tutor", ["nano-r4-board"], [], True,
         "Problema connessione Nano. Verificare: cavo USB, driver, porta COM, IDE Arduino configurato su Nano R4."),
        # Specific component wiring
        ("come collego l'LCD al nano?", "circuit", ["lcd16x2", "nano-r4-board", "wire"], ["[AZIONE:addwire]"], True,
         "Collegamento LCD 16x2 al Nano. RS->D12, EN->D11, D4->D5, D5->D4, D6->D3, D7->D2. VSS->GND, VDD->5V, V0->potenziometro."),
        ("dove metto il sensore di temperatura?", "circuit", ["photo-resistor", "wire"], ["[AZIONE:addcomponent:photo-resistor]"], True,
         "Sensore temperatura su pin analogico A0. Con partitore di tensione (resistenza 10k)."),
    ]

    for _ in range(2000):
        msg, intent, entities, actions, needs_llm, hint = random.choice(nano_msgs)
        if random.random() < 0.3:
            msg = msg.lower()
        if random.random() < 0.2:
            msg += random.choice([' per favore', ' grazie', ' aiuto', '?', '??'])

        examples.append(make_example(
            msg, intent, entities, actions, needs_llm,
            llm_hint=hint,
            context=make_context(tab=random.choice(['simulator', 'editor']))
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# CATEGORY 9: Code complex (~3000)
# ═══════════════════════════════════════════════════════════════
def gen_code_complex():
    examples = []

    code_msgs = [
        ("scrivi il codice per far lampeggiare 3 LED in sequenza", "code", ["led"], ["[AZIONE:openeditor]"], True,
         "Codice per 3 LED sequenziali. Usare array di pin, loop con delay. Suggerire anche versione con millis()."),
        ("come faccio un fade con analogWrite?", "code", ["led"], ["[AZIONE:openeditor]"], True,
         "Fade LED con analogWrite. Loop 0-255, delay. Pin deve essere PWM (3,5,6,9,10,11)."),
        ("il codice non compila, dice 'expected ; before }', cosa sbaglio?", "code", [], ["[AZIONE:opentab:editor]"], True,
         "Errore sintassi C++. Manca punto e virgola prima di una graffa chiusa. Controllare tutte le righe prima del }."),
        ("converti questo codice da Arduino a Scratch", "code", [], ["[AZIONE:switcheditor:scratch]"], True,
         "Conversione Arduino->Scratch. Identificare i blocchi equivalenti (digitalWrite->Set Pin, delay->Wait, loop->Forever)."),
        ("come leggo il valore del potenziometro e lo mostro sul Serial Monitor?", "code", ["potentiometer"], ["[AZIONE:openeditor]"], True,
         "analogRead(A0) + Serial.println(). Setup: Serial.begin(9600). Loop: int val = analogRead(A0); Serial.println(val); delay(100)."),
        ("fai il codice del semaforo con i tempi giusti", "code", ["led"], ["[AZIONE:openeditor]"], True,
         "Semaforo: verde 5s, giallo 2s, rosso 5s. Usare digitalWrite + delay. 3 pin digitali per 3 LED."),
        ("come faccio un if in Scratch?", "code", [], ["[AZIONE:switcheditor:scratch]"], True,
         "In Scratch/Blockly: blocco 'if...do' nella categoria Logic. Condizione: blocco comparazione. Equivale a if() in C++."),
        ("scrivi un programma che suona una melodia col buzzer", "code", ["buzzer-piezo"], ["[AZIONE:openeditor]"], True,
         "Melodia buzzer: usare tone(pin, frequenza, durata). Array di note (DO=262, RE=294, MI=330, FA=349, SOL=392, LA=440, SI=494)."),
        ("il serial monitor non mostra nulla, perche'?", "code", [], ["[AZIONE:opentab:editor]"], True,
         "Serial Monitor vuoto. Cause: baud rate diverso (9600 vs 115200), manca Serial.begin(), cavo USB, porta COM sbagliata."),
        ("compila e dimmi se ci sono errori", "code", [], ["[AZIONE:compile]"], False, "Compilo!"),
    ]

    for _ in range(3000):
        msg, intent, entities, actions, needs_llm, hint = random.choice(code_msgs)
        if random.random() < 0.3:
            msg = msg.lower()
        if random.random() < 0.15:
            msg = msg.replace('codice', random.choice(['code', 'programma', 'sketch']))

        examples.append(make_example(
            msg, intent, entities, actions, needs_llm,
            llm_hint=hint,
            context=make_context(tab=random.choice(['editor', 'simulator']),
                                 editor_mode=random.choice(EDITOR_MODES))
        ))

    return examples


# ═══════════════════════════════════════════════════════════════
# MAIN: Generate all categories and merge
# ═══════════════════════════════════════════════════════════════
def main():
    print("Generating Galileo Brain v10 expansion dataset...")

    categories = [
        ("Precise circuit builds", gen_precise_circuit),
        ("Multi-action sequences", gen_multi_action),
        ("Multi-language", gen_multilang),
        ("Complex vision", gen_vision),
        ("Memory/audio/slang", gen_memory_audio_slang),
        ("Teacher complex", gen_teacher),
        ("Navigation boost", gen_navigation),
        ("Nano R4 specific", gen_nano_specific),
        ("Code complex", gen_code_complex),
    ]

    all_examples = []
    for name, gen_fn in categories:
        examples = gen_fn()
        all_examples.extend(examples)
        print(f"  {name:25} {len(examples):,} examples")

    random.shuffle(all_examples)
    print(f"\nTotal expansion: {len(all_examples):,}")

    # Save expansion dataset
    out_dir = os.path.dirname(os.path.abspath(__file__))
    expansion_path = os.path.join(out_dir, 'galileo-brain-v10-expansion.jsonl')
    with open(expansion_path, 'w') as f:
        for ex in all_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')
    print(f"Saved: {expansion_path} ({os.path.getsize(expansion_path)/1024**2:.1f} MB)")

    # Merge with v9
    v9_path = os.path.join(out_dir, 'galileo-brain-v9.jsonl')
    v10_path = os.path.join(out_dir, 'galileo-brain-v10.jsonl')

    if os.path.exists(v9_path):
        print(f"\nMerging with v9 ({v9_path})...")
        with open(v9_path) as f:
            v9_lines = f.readlines()
        print(f"  v9: {len(v9_lines):,}")
        print(f"  v10 expansion: {len(all_examples):,}")

        all_lines = v9_lines + [json.dumps(ex, ensure_ascii=False) + '\n' for ex in all_examples]
        random.shuffle(all_lines)

        with open(v10_path, 'w') as f:
            f.writelines(all_lines)
        print(f"  v10 merged: {len(all_lines):,}")
        print(f"Saved: {v10_path} ({os.path.getsize(v10_path)/1024**2:.1f} MB)")
    else:
        print(f"\nv9 not found at {v9_path}, saving expansion only")

    # Verify
    print("\nVerification:")
    from collections import Counter
    ic = Counter()
    for ex in all_examples:
        out = json.loads(ex['messages'][2]['content'])
        ic[out['intent']] += 1
    for k, v in sorted(ic.items(), key=lambda x: -x[1]):
        print(f"  {k:12} {v:,} ({100*v/len(all_examples):.1f}%)")


if __name__ == '__main__':
    main()
