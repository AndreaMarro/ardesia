#!/usr/bin/env python3
"""
Galileo Brain — Dataset Generator V2
Fixes all audit issues from v1: intent balance, vision coverage, context-aware IDs,
canvas tab, volume distribution, component naming consistency.

Usage:
    python scripts/generate-brain-dataset-v2.py                # 2000 examples
    python scripts/generate-brain-dataset-v2.py --count 500    # Custom count

Output: datasets/galileo-brain-v2.jsonl
(c) Andrea Marro — 06/03/2026
"""

import json
import random
import re
import argparse
import os
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

random.seed(2026)

# ─── Brain System Prompt (same as v1) ─────────────────────────────────
BRAIN_SYSTEM_PROMPT = """Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
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
3. "actions": array di action tag nel formato esatto [AZIONE:...] o [INTENT:{...}]
   - Comandi: [AZIONE:play] [AZIONE:pause] [AZIONE:reset] [AZIONE:clearall] [AZIONE:compile] [AZIONE:quiz]
   - Navigazione: [AZIONE:loadexp:ID] [AZIONE:opentab:NOME] [AZIONE:openvolume:VOL:PAG]
   - Componenti: [INTENT:{"action":"place_and_wire","components":[{"type":"TIPO"}],"wires":"auto"}]
   - Fili: [AZIONE:addwire:comp1:pin1:comp2:pin2] [AZIONE:removewire:INDICE]
   - Interazioni: [AZIONE:interact:ID:ACTION:VALUE] [AZIONE:highlight:ID]
   - Codice: [AZIONE:setcode:CODICE] [AZIONE:compile]
   - Rimozione: [AZIONE:removecomponent:ID] [AZIONE:clearall]
   - Altro: [AZIONE:movecomponent:ID:X:Y] [AZIONE:setvalue:ID:PROP:VAL]
   - Contenuti: [AZIONE:youtube:QUERY] [AZIONE:createnotebook:NOME] [AZIONE:quiz]
   - Misure: [AZIONE:measure:ID:PROPERTY] [AZIONE:diagnose]
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

TAB VALIDI: simulator, manual, video, canvas, editor, taccuini, detective, poe, reverse, review
WING PINS: W_A0, W_A1, W_A2, W_A3, W_D3, W_D5, W_D6, W_D9, W_D10, W_D11, W_D12, W_D13,
W_A4/SDA, W_A5/SCL, W_D0/RX, W_D1/TX"""


# ─── 69 Experiments ──────────────────────────────────────────────────
EXPERIMENTS = [
    ("v1-cap6-esp1", "Accendi il tuo primo LED", 1),
    ("v1-cap6-esp2", "LED senza resistore", 1),
    ("v1-cap6-esp3", "Cambia luminosita con resistenze diverse", 1),
    ("v1-cap7-esp1", "Accendi il rosso del RGB", 1),
    ("v1-cap7-esp2", "Accendi il verde del RGB", 1),
    ("v1-cap7-esp3", "Accendi il blu del RGB", 1),
    ("v1-cap7-esp4", "Mescola 2 colori: il viola", 1),
    ("v1-cap7-esp5", "Tutti e 3: bianco", 1),
    ("v1-cap7-esp6", "Crea il tuo colore", 1),
    ("v1-cap8-esp1", "LED con pulsante", 1),
    ("v1-cap8-esp2", "Cambia colore e luminosita", 1),
    ("v1-cap8-esp3", "RGB + pulsante = viola", 1),
    ("v1-cap8-esp4", "3 pulsanti, 3 colori RGB", 1),
    ("v1-cap8-esp5", "Mix avanzato con resistori diversi", 1),
    ("v1-cap9-esp1", "Dimmer LED con potenziometro", 1),
    ("v1-cap9-esp2", "Inverti la rotazione", 1),
    ("v1-cap9-esp3", "LED di colore diverso con pot", 1),
    ("v1-cap9-esp4", "Dimmer RGB azzurrino", 1),
    ("v1-cap9-esp5", "Pot miscelatore blu rosso", 1),
    ("v1-cap9-esp6", "Lampada RGB con 3 potenziometri", 1),
    ("v1-cap9-esp7", "Sfida: aggiungi pulsanti alla lampada", 1),
    ("v1-cap9-esp8", "Sfida: combina esperimenti 5+6", 1),
    ("v1-cap9-esp9", "Sfida: aggiungi pulsante all'esp 8", 1),
    ("v1-cap10-esp1", "LED controllato dalla luce", 1),
    ("v1-cap10-esp2", "LED diverso colore con LDR", 1),
    ("v1-cap10-esp3", "3 LDR controllano RGB", 1),
    ("v1-cap10-esp4", "LED bianco illumina LDR, LED blu", 1),
    ("v1-cap10-esp5", "Aggiungi pot per controllare LED bianco", 1),
    ("v1-cap10-esp6", "Aggiungi pulsante al circuito LDR", 1),
    ("v1-cap11-esp1", "Buzzer suona continuo", 1),
    ("v1-cap11-esp2", "Campanello con pulsante", 1),
    ("v1-cap12-esp1", "LED con reed switch", 1),
    ("v1-cap12-esp2", "Cambia luminosita con magnete", 1),
    ("v1-cap12-esp3", "Sfida: RGB + reed switch", 1),
    ("v1-cap12-esp4", "Sfida: pot + RGB + reed switch", 1),
    ("v1-cap13-esp1", "LED nell'elettropongo", 1),
    ("v1-cap13-esp2", "Circuiti artistici con plastilina", 1),
    ("v1-cap14-esp1", "Il Primo Robot ELAB", 1),
    ("v2-cap6-esp1", "LED in serie con 1 resistore", 2),
    ("v2-cap6-esp2", "LED in serie colori diversi", 2),
    ("v2-cap6-esp3", "Tre LED in serie", 2),
    ("v2-cap6-esp4", "Misurare Vf con multimetro", 2),
    ("v2-cap7-esp1", "Scarica condensatore + multimetro", 2),
    ("v2-cap7-esp2", "Scarica con LED rosso", 2),
    ("v2-cap7-esp3", "Condensatori in parallelo", 2),
    ("v2-cap7-esp4", "Variare R nella scarica RC", 2),
    ("v2-cap8-esp1", "MOSFET come interruttore", 2),
    ("v2-cap8-esp2", "MOSFET e carica del corpo", 2),
    ("v2-cap8-esp3", "MOSFET + pot + tensione soglia", 2),
    ("v2-cap9-esp1", "Fototransistor come sensore", 2),
    ("v2-cap9-esp2", "Luce notturna automatica", 2),
    ("v2-cap10-esp1", "Far girare il motore", 2),
    ("v2-cap10-esp2", "Invertire la rotazione", 2),
    ("v2-cap10-esp3", "Motore con pulsante", 2),
    ("v2-cap10-esp4", "Motore + pulsante + LED indicatore", 2),
    ("v2-cap12-esp1", "Robot Segui Luce", 2),
    ("v3-cap6-blink", "LED Blink esterno", 3),
    ("v3-cap6-pin5", "Cambia pin (D5)", 3),
    ("v3-cap6-morse", "SOS Morse", 3),
    ("v3-cap6-sirena", "Sirena 2 LED", 3),
    ("v3-cap6-semaforo", "Semaforo 3 LED", 3),
    ("v3-cap7-pullup", "Pulsante INPUT_PULLUP", 3),
    ("v3-cap7-pulsante", "Pulsante accende LED", 3),
    ("v3-cap7-mini", "2 LED + Pulsante toggle", 3),
    ("v3-cap8-id", "Trova A0 sulla board", 3),
    ("v3-cap8-pot", "Collegare potenziometro ad A0", 3),
    ("v3-cap8-serial", "analogRead + Serial Monitor", 3),
    ("v3-extra-lcd-hello", "LCD Hello World", 3),
    ("v3-extra-servo-sweep", "Servo Sweep", 3),
]

# ─── Component Types with Italian aliases ────────────────────────────
COMPONENT_TYPES = {
    "led": ["LED", "led", "lucina", "lampadina", "diodo luminoso"],
    "resistor": ["resistore", "resistenza", "resistor"],
    "push-button": ["pulsante", "bottone", "tasto", "pushbutton"],
    "buzzer-piezo": ["buzzer", "cicalino", "ronzatore", "buzzer piezo"],
    "capacitor": ["condensatore", "capacitor", "capacita"],
    "potentiometer": ["potenziometro", "pot", "manopola"],
    "photo-resistor": ["fotoresistore", "fotoresistenza", "LDR", "sensore di luce"],
    "diode": ["diodo", "diode"],
    "mosfet-n": ["mosfet", "transistor", "MOSFET"],
    "rgb-led": ["LED RGB", "led rgb", "rgb", "led multicolore"],
    "motor-dc": ["motore", "motorino", "motore DC"],
    "servo": ["servo", "servomotore", "servo motore"],
    "reed-switch": ["reed", "reed switch", "sensore magnetico"],
    "phototransistor": ["fototransistor", "fototransistore", "sensore ottico"],
    "battery9v": ["batteria", "pila", "batteria 9V"],
    "multimeter": ["multimetro", "tester", "misuratore"],
    "lcd16x2": ["LCD", "display LCD", "schermo LCD"],
    "nano-r4-board": ["Arduino", "scheda", "Nano", "board"],
    "breadboard-half": ["breadboard piccola", "basetta piccola"],
    "breadboard-full": ["breadboard", "basetta", "breadboard grande"],
    "wire": ["filo", "cavo", "connessione"],
}

# Placeable components (can go on breadboard)
PLACEABLE = [
    "led", "resistor", "push-button", "buzzer-piezo", "capacitor",
    "potentiometer", "photo-resistor", "diode", "mosfet-n", "rgb-led",
    "motor-dc", "servo", "reed-switch", "phototransistor"
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

# FIX: Consistent component ID mapping (type → ID prefix in context)
COMP_ID_MAP = {
    "led": "led", "resistor": "resistor", "push-button": "pushbutton",
    "buzzer-piezo": "buzzer", "capacitor": "capacitor",
    "potentiometer": "potentiometer", "photo-resistor": "photoresistor",
    "diode": "diode", "mosfet-n": "mosfet", "rgb-led": "rgb-led",
    "motor-dc": "motor", "servo": "servo", "reed-switch": "reedswitch",
    "phototransistor": "phototransistor",
    "battery9v": "battery9v", "multimeter": "multimeter",
    "lcd16x2": "lcd16x2", "nano-r4-board": "nano-r4-board",
    "breadboard-half": "breadboard-half", "breadboard-full": "breadboard-full",
    "wire": "wire",
}

WING_PINS = [
    "W_A0", "W_A1", "W_A2", "W_A3", "W_D3", "W_D5", "W_D6", "W_D9",
    "W_D10", "W_D11", "W_D12", "W_D13", "W_A4", "W_A5", "W_D0", "W_D1",
]

TABS = ["simulator", "manual", "video", "canvas", "editor",
        "taccuini", "detective", "poe", "reverse", "review"]

TAB_ALIASES = {
    "simulator": ["simulatore", "il simulatore", "sim"],
    "manual": ["manuale", "il manuale", "il libro"],
    "video": ["video", "i video", "tutorial"],
    "canvas": ["lavagna", "la lavagna", "canvas", "disegno"],
    "editor": ["editor", "codice", "il codice", "l'editor"],
    "taccuini": ["taccuini", "i taccuini", "gli appunti"],
    "detective": ["detective", "modalita detective"],
    "poe": ["poe", "modalita poe"],
    "reverse": ["reverse", "reverse engineering"],
    "review": ["review", "ripasso"],
}


# ═══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS (V2 — context-aware)
# ═══════════════════════════════════════════════════════════════════════

def make_comp_id(comp_type: str, index: int = 1) -> str:
    """Generate consistent component ID from type."""
    prefix = COMP_ID_MAP.get(comp_type, comp_type.replace("-", ""))
    return f"{prefix}{index}"


def make_context(
    tab: str = "simulator",
    experiment: Optional[str] = None,
    components: Optional[List[str]] = None,
    wires: int = 0,
    step: Optional[str] = None,
    volume: int = 1,
) -> str:
    lines = [f"tab: {tab}"]
    if experiment:
        lines.append(f"esperimento: {experiment}")
    if components:
        lines.append(f"componenti: [{', '.join(components)}]")
    else:
        lines.append("componenti: []")
    lines.append(f"fili: {wires}")
    if step:
        lines.append(f"step_corrente: {step}")
    lines.append(f"volume_attivo: {volume}")
    return "\n".join(lines)


def make_user_message(context: str, message: str) -> str:
    return f"[CONTESTO]\n{context}\n\n[MESSAGGIO]\n{message}"


def make_assistant_json(
    intent: str, entities: List[str], actions: List[str],
    needs_llm: bool, response: Optional[str] = None,
    llm_hint: Optional[str] = None,
) -> str:
    return json.dumps({
        "intent": intent, "entities": entities, "actions": actions,
        "needs_llm": needs_llm, "response": response, "llm_hint": llm_hint,
    }, ensure_ascii=False)


def make_example(user_msg: str, assistant_json: str) -> Dict:
    return {
        "messages": [
            {"role": "system", "content": BRAIN_SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": assistant_json},
        ]
    }


def random_context(tab: Optional[str] = None, force_volume: Optional[int] = None) -> str:
    """V2: balanced tab/volume distribution, realistic component contexts."""
    # FIX: balanced tab distribution (was 60% simulator)
    if tab is None:
        tab = random.choices(
            TABS,
            weights=[25, 15, 10, 12, 15, 5, 5, 5, 4, 4],  # canvas now 12%
            k=1
        )[0]

    exp = random.choice(EXPERIMENTS) if random.random() > 0.3 else None

    # FIX: balanced volume distribution
    if force_volume:
        vol = force_volume
    elif exp:
        vol = exp[2]
    else:
        vol = random.choices([1, 2, 3], weights=[40, 35, 25], k=1)[0]

    # FIX: context-aware component IDs (only use types that exist in context)
    n_comps = random.randint(0, random.choice([0, 2, 3, 4, 5, 6, 8]))
    comps = []
    if n_comps > 0:
        types = random.sample(PLACEABLE, min(n_comps, len(PLACEABLE)))
        for i, t in enumerate(types):
            cid = make_comp_id(t)
            # Add state info sometimes
            if t == "led" and random.random() > 0.5:
                cid += ":ON" if random.random() > 0.5 else ":OFF"
            elif t == "resistor" and random.random() > 0.5:
                cid += f":{random.choice(['220', '330', '470', '1000', '10000'])}ohm"
            comps.append(cid)

    wires = random.randint(0, len(comps) * 2) if comps else 0

    return make_context(
        tab=tab, experiment=exp[0] if exp else None,
        components=comps if comps else None, wires=wires, volume=vol,
    )


def context_with_components(comp_types: List[str], tab: str = "simulator") -> Tuple[str, List[str]]:
    """Create context that INCLUDES the specified components. Returns (context, comp_ids)."""
    exp = random.choice(EXPERIMENTS) if random.random() > 0.4 else None
    vol = exp[2] if exp else random.choice([1, 2, 3])
    comp_ids = []
    comps = []
    for t in comp_types:
        cid = make_comp_id(t, len([c for c in comp_ids if c.startswith(COMP_ID_MAP.get(t, t))]) + 1)
        comp_ids.append(cid)
        comps.append(cid)
    wires = random.randint(1, len(comps) * 2)
    ctx = make_context(tab=tab, experiment=exp[0] if exp else None,
                       components=comps, wires=wires, volume=vol)
    return ctx, comp_ids


def make_intent_json(comp_types: List[str], connect_to: Optional[str] = None) -> str:
    """Create [INTENT:{...}] action tag."""
    components = [{"type": t} for t in comp_types]
    if connect_to and len(components) == 1:
        components[0]["connectTo"] = connect_to
    return json.dumps({"action": "place_and_wire", "components": components, "wires": "auto"},
                      ensure_ascii=False)


# ═══════════════════════════════════════════════════════════════════════
# C1: SIMULATION COMMANDS — 120 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c1(count: int = 120) -> List[Dict]:
    examples = []

    play_msgs = [
        "Avvia la simulazione", "Fai partire il circuito", "Play!", "Start",
        "avvia", "fai partire la simulazione", "Avvia il simulatore",
        "fammi vedere se funziona", "prova il circuito", "fallo andare",
        "metti in funzione il circuito", "vai, avvia!", "accendi tutto",
        "prova a farlo girare", "fai start", "Avvia!", "inizia la simulazione",
        "metti in moto", "fai girare il circuito", "let's go",
    ]
    for msg in play_msgs:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], ["[AZIONE:play]"], False, "Simulazione avviata! \u25b6")))

    pause_msgs = [
        "Ferma la simulazione", "Stop!", "Metti in pausa", "Pausa",
        "ferma tutto", "stoppa il circuito", "fermati", "pausa un attimo",
        "ferma il simulatore", "metti in pausa la simulazione",
        "stop la simulazione", "blocca tutto", "fermala",
    ]
    for msg in pause_msgs:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], ["[AZIONE:pause]"], False, "Simulazione in pausa \u23f8")))

    reset_msgs = [
        "Resetta la simulazione", "Riavvia", "Reset", "Ricomincia",
        "resetta tutto", "riavvia la simulazione", "rifai da capo",
        "resetta il simulatore", "riparti dall'inizio", "fai reset",
        "restart", "ricominciamo", "da capo",
    ]
    for msg in reset_msgs:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], ["[AZIONE:reset]"], False, "Simulazione resettata \u21bb")))

    clearall_msgs = [
        "Pulisci tutto", "Cancella tutto", "Svuota la breadboard",
        "Rimuovi tutto", "Togli tutti i componenti", "Cancella il circuito",
        "Pulisci la breadboard", "Via tutto", "Elimina tutto il circuito",
        "Ripulisci tutto", "Svuota tutto", "Togli tutto",
        "ricomincia da zero pulisci", "butta via tutto", "fa piazza pulita",
        "sgombra la breadboard", "elimina ogni cosa",
    ]
    for msg in clearall_msgs:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], ["[AZIONE:clearall]"], False, "Tutto rimosso! Breadboard pulita 🧹")))

    compile_msgs = [
        "Compila il codice", "Verifica il codice", "Compila",
        "Prova a compilare", "Build", "Fai la build",
        "controlla se il codice e' giusto", "compila il programma",
        "verifica che compili", "compila e dimmi se va bene",
        "lancia la compilazione", "verifica errori nel codice",
    ]
    for msg in compile_msgs:
        examples.append(make_example(
            make_user_message(random_context(tab="editor"), msg),
            make_assistant_json("action", [], ["[AZIONE:compile]"], False, "Compilazione avviata... \u2699\ufe0f")))

    diagnose_msgs = [
        "Diagnostica il circuito", "Cosa c'e che non va?",
        "Trova gli errori", "Controlla il circuito",
        "Verifica se e' tutto collegato bene", "Diagnosi",
        "analizza il mio circuito", "perche non funziona?",
        "controlla i collegamenti", "c'e qualche errore?",
    ]
    for msg in diagnose_msgs:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], ["[AZIONE:diagnose]"], False, "Avvio diagnosi del circuito... 🔍")))

    quiz_msgs = [
        "Fammi un quiz", "Quiz!", "Verificami", "Testami",
        "Fammi il quiz sull'esperimento", "Voglio un quiz",
        "Metti alla prova le mie conoscenze", "Quiz sul LED",
        "Verifica se ho capito", "Esaminami",
    ]
    for msg in quiz_msgs:
        exp = random.choice(EXPERIMENTS)
        ctx = make_context(experiment=exp[0], volume=exp[2])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [], ["[AZIONE:quiz]"], False, "Quiz avviato! Vediamo cosa sai! 🎯")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C2: SINGLE COMPONENT PLACEMENT — 100 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c2(count: int = 100) -> List[Dict]:
    examples = []

    verbs = [
        "Metti {art} {comp} sulla breadboard", "Aggiungi {art} {comp}",
        "Piazza {art} {comp}", "Posiziona {art} {comp} sul circuito",
        "Inserisci {art} {comp}", "Mettimi {art} {comp}",
        "Aggiungimi {art} {comp}", "Voglio {art} {comp}",
        "Mi serve {art} {comp}", "Ho bisogno di {art} {comp}",
    ]
    articles = {
        "led": "un", "resistor": "un", "push-button": "un", "buzzer-piezo": "un",
        "capacitor": "un", "potentiometer": "un", "photo-resistor": "un",
        "diode": "un", "mosfet-n": "un", "rgb-led": "un", "motor-dc": "un",
        "servo": "un", "reed-switch": "un", "phototransistor": "un",
        "battery9v": "una", "multimeter": "un", "lcd16x2": "un",
    }

    for comp_type in PLACEABLE:
        aliases = COMPONENT_TYPES[comp_type]
        art = articles.get(comp_type, "un")
        for alias in aliases[:3]:
            msg = random.choice(verbs).format(art=art, comp=alias)
            ij = make_intent_json([comp_type])
            examples.append(make_example(
                make_user_message(random_context(), msg),
                make_assistant_json("circuit", [comp_type], [f"[INTENT:{ij}]"], False,
                                    f"Ecco, ho piazzato {alias} sulla breadboard! \u2705")))

    # Typo/informal
    for msg, ct, resp in [
        ("metti un leddd", "led", "LED aggiunto! \u2705"),
        ("aggiungi rezistenza", "resistor", "Resistore aggiunto! \u2705"),
        ("mettimi un buzer", "buzzer-piezo", "Buzzer piazzato! \u2705"),
        ("piazza il potenz", "potentiometer", "Potenziometro posizionato! \u2705"),
        ("voglio un mosf", "mosfet-n", "MOSFET aggiunto! \u2705"),
        ("metti lucina", "led", "LED posizionato! \u2705"),
        ("aggiungi lampadina", "led", "LED aggiunto! \u2705"),
        ("ho bisogno di un condensat", "capacitor", "Condensatore piazzato! \u2705"),
        ("inserisci una fotoresistenza", "photo-resistor", "Fotoresistore aggiunto! \u2705"),
        ("piazza sensore magnetico", "reed-switch", "Reed switch posizionato! \u2705"),
    ]:
        ij = make_intent_json([ct])
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("circuit", [ct], [f"[INTENT:{ij}]"], False, resp)))

    # With pin
    for msg, ct, pin in [
        ("Metti un LED collegato a D3", "led", "W_D3"),
        ("Aggiungi un resistore su D5", "resistor", "W_D5"),
        ("Piazza un buzzer su D9", "buzzer-piezo", "W_D9"),
        ("Metti un servo su D10", "servo", "W_D10"),
        ("LED su W_D6", "led", "W_D6"),
        ("Resistore collegato a W_A0", "resistor", "W_A0"),
    ]:
        ij = make_intent_json([ct], connect_to=pin)
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("circuit", [ct, pin], [f"[INTENT:{ij}]"], False,
                                f"Componente piazzato e collegato a {pin}! \u2705")))

    # Explicit addcomponent action tag (alternative to INTENT for simple placement)
    for msg, ct, alias in [
        ("Aggiungi un LED alla breadboard", "led", "LED"),
        ("Piazza un resistore", "resistor", "resistore"),
        ("Metti un buzzer", "buzzer-piezo", "buzzer"),
        ("Aggiungi un condensatore", "capacitor", "condensatore"),
        ("Piazza un potenziometro", "potentiometer", "potenziometro"),
        ("Metti un diodo", "diode", "diodo"),
        ("Aggiungi un motore DC", "motor-dc", "motore DC"),
        ("Piazza un servo motore", "servo", "servo"),
        ("Metti un RGB LED", "rgb-led", "LED RGB"),
        ("Aggiungi un MOSFET", "mosfet-n", "MOSFET"),
        ("Piazza una fotoresistenza", "photo-resistor", "fotoresistenza"),
        ("Metti un fototransistor", "phototransistor", "fototransistor"),
        ("Aggiungi un reed switch", "reed-switch", "reed switch"),
        ("Piazza un pulsante", "push-button", "pulsante"),
    ]:
        cid = make_comp_id(ct)
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("circuit", [ct], [f"[AZIONE:addcomponent:{cid}]"], False,
                                f"{alias} aggiunto sulla breadboard! ✅")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C3: MULTI-COMPONENT — 80 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c3(count: int = 80) -> List[Dict]:
    examples = []

    patterns = [
        ("Costruisci un circuito con un LED e un resistore", ["led", "resistor"]),
        ("Metti un LED e un pulsante", ["led", "push-button"]),
        ("Aggiungi LED e buzzer", ["led", "buzzer-piezo"]),
        ("Piazza un LED RGB e un potenziometro", ["rgb-led", "potentiometer"]),
        ("Metti un motore e un pulsante", ["motor-dc", "push-button"]),
        ("Aggiungi condensatore e resistore", ["capacitor", "resistor"]),
        ("Costruisci con diodo e LED", ["diode", "led"]),
        ("Piazza un MOSFET e un LED", ["mosfet-n", "led"]),
        ("Metti un servo e un potenziometro", ["servo", "potentiometer"]),
        ("Piazza un reed switch e un buzzer", ["reed-switch", "buzzer-piezo"]),
        ("Metti fotoresistenza e LED", ["photo-resistor", "led"]),
        ("Costruisci un circuito con LED, resistore e pulsante", ["led", "resistor", "push-button"]),
        ("Metti LED, buzzer e pulsante", ["led", "buzzer-piezo", "push-button"]),
        ("Piazza LED, resistore e potenziometro", ["led", "resistor", "potentiometer"]),
        ("Costruisci con motore, pulsante e LED", ["motor-dc", "push-button", "led"]),
        ("Metti MOSFET, LED e resistore", ["mosfet-n", "led", "resistor"]),
        ("Costruisci un semaforo con 3 LED e 3 resistori", ["led", "led", "led", "resistor", "resistor", "resistor"]),
        ("Fammi un circuito con LED, resistore, pulsante e buzzer", ["led", "resistor", "push-button", "buzzer-piezo"]),
        ("costruiscimi un circuito con due LED", ["led", "led"]),
        ("voglio 3 LED rossi", ["led", "led", "led"]),
        ("mettimi led, resistenza e bottone", ["led", "resistor", "push-button"]),
        ("aggiungi un led e una resistenza da 220 ohm", ["led", "resistor"]),
        ("piazza led con resistore", ["led", "resistor"]),
        ("Metti un LED e un resistore e un pulsante", ["led", "resistor", "push-button"]),
        ("Aggiungi LED con resistore", ["led", "resistor"]),
        ("Piazza motore, pulsante, LED", ["motor-dc", "push-button", "led"]),
        # V2: larger circuits (8-12 components)
        ("Costruisci circuito completo: 3 LED, 3 resistori, pulsante, potenziometro",
         ["led", "led", "led", "resistor", "resistor", "resistor", "push-button", "potentiometer"]),
        ("Fammi il circuito del robot: motore, 2 LED, buzzer, fototransistor, 3 resistori",
         ["motor-dc", "led", "led", "buzzer-piezo", "phototransistor", "resistor", "resistor", "resistor"]),
    ]

    for msg, comp_types in patterns:
        ij = make_intent_json(comp_types)
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("circuit", list(set(comp_types)),
                                [f"[INTENT:{ij}]"], False,
                                f"Circuito montato con {len(comp_types)} componenti! \u2705")))

    # Multi-component + action combos
    for msg, cts, extra in [
        ("Costruisci un LED con resistore e avvia la simulazione", ["led", "resistor"], ["play"]),
        ("Metti un pulsante e un LED e prova il circuito", ["push-button", "led"], ["play"]),
        ("Aggiungi buzzer, collegalo e fai partire", ["buzzer-piezo"], ["play"]),
        ("Piazza un LED, poi fai la diagnosi", ["led"], ["diagnose"]),
        ("Metti 2 LED con resistori e compila il codice", ["led", "led", "resistor", "resistor"], ["compile"]),
    ]:
        ij = make_intent_json(cts)
        actions = [f"[INTENT:{ij}]"] + [f"[AZIONE:{a}]" for a in extra]
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("circuit", list(set(cts)), actions, False,
                                "Componenti piazzati e azione eseguita! \u2705")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C4: WIRING — 70 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c4(count: int = 70) -> List[Dict]:
    examples = []

    # FIX: context-aware wiring (component must be in context)
    wire_specs = [
        ("Collega l'anodo del LED al pin D3", ["led"], "led1", "anode", "nano1", "W_D3"),
        ("Collega il catodo del LED al bus negativo", ["led"], "led1", "cathode", "breadboard1", "bus-bot-minus"),
        ("Connetti il resistore pin1 al pin D5", ["resistor"], "resistor1", "pin1", "nano1", "W_D5"),
        ("Collega il VCC del potenziometro al bus positivo", ["potentiometer"], "potentiometer1", "vcc", "breadboard1", "bus-bot-plus"),
        ("Metti un filo dal gate del MOSFET al pin D9", ["mosfet-n"], "mosfet1", "gate", "nano1", "W_D9"),
        ("Collega il positivo del buzzer a D6", ["buzzer-piezo"], "buzzer1", "positive", "nano1", "W_D6"),
        ("Filo dal catodo del diodo al GND", ["diode"], "diode1", "cathode", "breadboard1", "bus-bot-minus"),
        ("Collega il positivo del condensatore ad A0", ["capacitor"], "capacitor1", "positive", "nano1", "W_A0"),
        ("Connetti il signal del servo a D10", ["servo"], "servo1", "signal", "nano1", "W_D10"),
        ("Collega il pin1 del pulsante a D3", ["push-button"], "pushbutton1", "pin1", "nano1", "W_D3"),
        ("Filo dal positivo del motore a D9", ["motor-dc"], "motor1", "positive", "nano1", "W_D9"),
        ("Collega il collettore del fototransistor a D5", ["phototransistor"], "phototransistor1", "collector", "nano1", "W_D5"),
    ]
    for msg, ctx_types, c1, p1, c2, p2 in wire_specs:
        ctx, _ = context_with_components(ctx_types)
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [c1, p1, c2, p2],
                                [f"[AZIONE:addwire:{c1}:{p1}:{c2}:{p2}]"], False, "Filo collegato! \u2705")))

    # Wing pin wiring
    for msg, ctx_types, c1, p1, p2 in [
        ("Collega il LED a W_D10", ["led"], "led1", "anode", "W_D10"),
        ("Connetti al wing pin A0", ["potentiometer"], "potentiometer1", "signal", "W_A0"),
        ("Filo dal fotoresistore a W_A1", ["photo-resistor"], "photoresistor1", "pin1", "W_A1"),
        ("Collega servo a W_D11", ["servo"], "servo1", "signal", "W_D11"),
        ("LED su W_D5", ["led"], "led1", "anode", "W_D5"),
        ("Buzzer a W_D6", ["buzzer-piezo"], "buzzer1", "positive", "W_D6"),
        ("Collega il reed switch a W_D3", ["reed-switch"], "reedswitch1", "pin1", "W_D3"),
    ]:
        ctx, _ = context_with_components(ctx_types)
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [c1, p2],
                                [f"[AZIONE:addwire:{c1}:{p1}:nano1:{p2}]"], False,
                                f"Collegato a {p2}! \u2705")))

    # Bus connections
    for msg, ctx_types, c1, p1, bus in [
        ("Collega al bus positivo", ["led"], "led1", "anode", "bus-bot-plus"),
        ("Filo al bus negativo", ["resistor"], "resistor1", "pin2", "bus-bot-minus"),
        ("Connetti al GND", ["buzzer-piezo"], "buzzer1", "negative", "bus-bot-minus"),
        ("Collega al 5V", ["potentiometer"], "potentiometer1", "vcc", "bus-bot-plus"),
        ("Metti un filo al bus meno", ["led"], "led1", "cathode", "bus-bot-minus"),
    ]:
        ctx, _ = context_with_components(ctx_types)
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [c1, "bus"],
                                [f"[AZIONE:addwire:{c1}:{p1}:breadboard1:{bus}]"], False,
                                "Collegato al bus! \u2705")))

    # Ambiguous wiring → needs_llm
    for msg in ["connetti tutto", "collegali insieme", "collegalo"]:
        ctx, _ = context_with_components(["led", "resistor"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [], [], True, None,
                                "Lo studente chiede di collegare ma non specifica quali componenti/pin. Chiedi chiarimenti.")))

    # Remove wire
    for msg, idx in [
        ("Rimuovi il primo filo", 0), ("Togli il filo numero 2", 1),
        ("Scollega il terzo filo", 2), ("Rimuovi l'ultimo filo", -1),
        ("Togli il filo dal LED", 0), ("Scollega il resistore", 0),
    ]:
        ctx, _ = context_with_components(["led", "resistor", "push-button"])
        n_w = random.randint(2, 5)
        actual_idx = idx if idx >= 0 else n_w - 1
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [], [f"[AZIONE:removewire:{actual_idx}]"], False, "Filo rimosso! \u2705")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C5: NAVIGATION — 60 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c5(count: int = 60) -> List[Dict]:
    examples = []

    templates = [
        "Carica l'esperimento {title}", "Apri l'esperimento {id}",
        "Vai all'esperimento {title}", "Carica {title}", "Apri {id}",
        "Fammi vedere l'esperimento {title}", "Porta l'esperimento {title}",
    ]
    for exp_id, title, vol in random.sample(EXPERIMENTS, min(25, len(EXPERIMENTS))):
        msg = random.choice(templates).format(id=exp_id, title=title)
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("navigation", [exp_id],
                                [f"[AZIONE:loadexp:{exp_id}]"], False, f"Carico: {title} 📚")))

    # Informal loadexp
    for msg, eid, title in [
        ("carica il primo circuito", "v1-cap6-esp1", "Accendi il tuo primo LED"),
        ("apri il capitolo 7", "v1-cap7-esp1", "Accendi il rosso del RGB"),
        ("fammi il blink", "v3-cap6-blink", "LED Blink esterno"),
        ("carica il semaforo", "v3-cap6-semaforo", "Semaforo 3 LED"),
        ("apri il robot", "v1-cap14-esp1", "Il Primo Robot ELAB"),
        ("esperimento del buzzer", "v1-cap11-esp1", "Buzzer suona continuo"),
        ("carica la scarica del condensatore", "v2-cap7-esp1", "Scarica condensatore + multimetro"),
        ("mosfet come interruttore", "v2-cap8-esp1", "MOSFET come interruttore"),
        ("apri il servo sweep", "v3-extra-servo-sweep", "Servo Sweep"),
        ("carica lcd hello world", "v3-extra-lcd-hello", "LCD Hello World"),
    ]:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("navigation", [eid], [f"[AZIONE:loadexp:{eid}]"], False, f"Carico: {title} 📚")))

    # opentab — ALL 10 tabs
    for tab, aliases in TAB_ALIASES.items():
        for alias in aliases[:2]:
            msg = random.choice([f"Apri {alias}", f"Vai a {alias}", f"Mostra {alias}", f"Apri il tab {alias}"])
            examples.append(make_example(
                make_user_message(random_context(), msg),
                make_assistant_json("navigation", [tab], [f"[AZIONE:opentab:{tab}]"], False, f"Apro {alias}! 📂")))

    # openvolume
    for msg, vol, page in [
        ("Vai al volume 1", 1, None), ("Apri il volume 2", 2, None),
        ("Vai al volume 3", 3, None), ("Volume 1 pagina 45", 1, 45),
        ("Apri volume 2 a pagina 30", 2, 30), ("Volume 3 pagina 12", 3, 12),
        ("Portami al volume 1", 1, None), ("Fammi vedere il volume 2", 2, None),
        ("vai a pagina 60 del volume 1", 1, 60),
    ]:
        tag = f"[AZIONE:openvolume:{vol}:{page}]" if page else f"[AZIONE:openvolume:{vol}:]"
        resp = f"Apro Volume {vol} a pagina {page}! 📖" if page else f"Apro il Volume {vol}! 📖"
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("navigation", [f"volume{vol}"], [tag], False, resp)))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C6: CODE — 80 examples target (was 40 in v1)
# ═══════════════════════════════════════════════════════════════════════
def generate_c6(count: int = 80) -> List[Dict]:
    examples = []

    # Code requests that need LLM to generate
    code_questions = [
        "Scrivi un programma che faccia il semaforo",
        "Codice Arduino per il SOS in Morse",
        "Programma il LED RGB per fare l'arcobaleno",
        "Scrivi il codice per il dimmer con potenziometro",
        "Fammi il programma per il motore con pulsante",
        "Codice per leggere il fototransistor",
        "Programma Arduino per il sensore di luce",
        "Scrivi codice per far suonare una melodia col buzzer",
        "Codice per il display LCD che mostra Hello World",
        "Programma che legge il sensore magnetico",
        "Scrivi un sketch per il LED con fade",
        "Codice per contare le pressioni del pulsante",
        "Programma Arduino per 3 LED alternati",
        "Scrivi codice per PWM sul motore",
        "Fammi il codice per il reed switch con LED",
        "Scrivi il codice per far lampeggiare il LED",
        "Programma il LED per accendersi con il pulsante",
        "Scrivi codice per leggere il potenziometro",
        "Fammi il codice per il servo",
        "Codice per il buzzer che suona",
        "Programma per leggere il sensore analogico",
        "Codice per il LED che si accende gradualmente",
        "Scrivi sketch per 2 LED alternati con pulsante",
        "Codice per il Serial Monitor con temperatura",
        "Programma per il servo controllato dal pot",
        "Scrivi il codice per il cicalino con melodia",
        "Codice per la luce notturna automatica",
        "Programma per il semaforo con pulsante pedonale",
        "Scrivi codice per il motore DC con PWM",
        "Fammi il programma per leggere 3 sensori analogici",
    ]
    for msg in code_questions:
        examples.append(make_example(
            make_user_message(random_context(tab="editor"), msg),
            make_assistant_json("code", [], [], True, None,
                                "Richiesta di codice Arduino. Genera sketch completo con setup(), loop(), commenti educativi.")))

    # Code + compile combos
    for msg in [
        "Scrivi il codice per il blink e compilalo",
        "Fammi il programma del LED e verifica se compila",
        "Codice per il buzzer e poi compila",
        "Scrivi il codice del semaforo e compilalo subito",
        "Programma il servo e verifica",
    ]:
        examples.append(make_example(
            make_user_message(random_context(tab="editor"), msg),
            make_assistant_json("code", [], ["[AZIONE:compile]"], True, None,
                                "Lo studente vuole codice + compilazione. Genera il codice, poi [AZIONE:setcode:...] e [AZIONE:compile].")))

    # Code error questions
    for msg in [
        "Il codice non compila, cosa sbaglio?",
        "Errore di compilazione, aiutami",
        "C'e un errore nella riga 5",
        "Non funziona il programma",
        "Perche il LED non lampeggia?",
        "Ho un errore 'was not declared in this scope'",
        "Il Serial Monitor non stampa nulla",
        "Il servo non si muove, il codice e' giusto?",
        "Il programma compila ma il LED non si accende",
        "Errore: expected ';' before '}' token",
    ]:
        examples.append(make_example(
            make_user_message(random_context(tab="editor"), msg),
            make_assistant_json("code", [], [], True, None,
                                "Lo studente ha un errore nel codice. Analizza il codice nel contesto e suggerisci la correzione.")))

    # setcode with specific code — emits [AZIONE:setcode:...]
    setcode_examples = [
        ("Scrivi il codice per far lampeggiare il LED su D3",
         '[AZIONE:setcode:void setup(){pinMode(3,OUTPUT);}void loop(){digitalWrite(3,HIGH);delay(500);digitalWrite(3,LOW);delay(500);}]'),
        ("Metti il codice per il pulsante",
         '[AZIONE:setcode:void setup(){pinMode(2,INPUT_PULLUP);Serial.begin(9600);}void loop(){Serial.println(digitalRead(2));delay(100);}]'),
        ("Scrivi void setup con pinMode 3 OUTPUT",
         '[AZIONE:setcode:void setup(){pinMode(3,OUTPUT);}void loop(){}]'),
        ("Programma analogRead su A0",
         '[AZIONE:setcode:void setup(){Serial.begin(9600);}void loop(){int v=analogRead(A0);Serial.println(v);delay(100);}]'),
        ("Scrivi il codice per tone sul buzzer",
         '[AZIONE:setcode:void setup(){pinMode(8,OUTPUT);}void loop(){tone(8,1000);delay(500);noTone(8);delay(500);}]'),
        ("Scrivi il codice per accendere il LED su D13",
         '[AZIONE:setcode:void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);}]'),
        ("Metti il programma per leggere la temperatura",
         '[AZIONE:setcode:void setup(){Serial.begin(9600);}void loop(){int v=analogRead(A0);float temp=v*0.48828125;Serial.println(temp);delay(1000);}]'),
        ("Scrivi il codice per il servo a 90 gradi",
         '[AZIONE:setcode:#include<Servo.h>\nServo s;void setup(){s.attach(9);}void loop(){s.write(90);delay(1000);}]'),
    ]
    for msg, code_tag in setcode_examples:
        examples.append(make_example(
            make_user_message(random_context(tab="editor"), msg),
            make_assistant_json("code", [], [code_tag], False,
                                "Ecco il codice! Premi Compila per verificare.", None)))

    # Scratch/Blockly editor (V2 NEW)
    for msg in [
        "Apri l'editor a blocchi",
        "Voglio programmare con Scratch",
        "Passa all'editor Blockly",
        "Fammi usare i blocchi",
        "Apri l'editor visuale",
    ]:
        examples.append(make_example(
            make_user_message(random_context(tab="editor"), msg),
            make_assistant_json("code", ["scratch", "blockly"], [], True, None,
                                "Lo studente vuole usare l'editor a blocchi (Scratch/Blockly). Apri l'editor visuale.")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C7: INTERACTIONS — 60 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c7(count: int = 60) -> List[Dict]:
    examples = []

    # interact: press (FIX: context-aware)
    for msg, action, value in [
        ("Premi il pulsante", "press", ""), ("Schiaccia il bottone", "press", ""),
        ("Rilascia il pulsante", "release", ""), ("Tieni premuto il pulsante", "press", ""),
        ("Premi e rilascia il tasto", "press", ""),
    ]:
        ctx, ids = context_with_components(["push-button", "led", "resistor"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0]],
                                [f"[AZIONE:interact:{ids[0]}:{action}:{value}]"], False, "Pulsante premuto! 🔘")))

    # interact: potentiometer
    for msg, value in [
        ("Ruota il potenziometro al massimo", "1.0"),
        ("Metti il pot a meta", "0.5"), ("Potenziometro a zero", "0.0"),
        ("Gira la manopola al 75%", "0.75"), ("Ruota il pot un po' piu avanti", "0.6"),
    ]:
        ctx, ids = context_with_components(["potentiometer", "led", "resistor"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0]],
                                [f"[AZIONE:interact:{ids[0]}:setPosition:{value}]"], False,
                                f"Potenziometro regolato a {value}! 🔄")))

    # interact: servo angle
    for msg, value in [
        ("Metti il servo a 90 gradi", "90"), ("Servo a 0 gradi", "0"),
        ("Ruota il servo a 180", "180"), ("Servo a 45 gradi", "45"),
    ]:
        ctx, ids = context_with_components(["servo"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0]],
                                [f"[AZIONE:interact:{ids[0]}:setAngle:{value}]"], False,
                                f"Servo posizionato a {value} gradi! \u2699\ufe0f")))

    # interact: light level
    for msg, ct, value in [
        ("Aumenta la luce sul fotoresistore", "photo-resistor", "0.8"),
        ("Metti il buio sul sensore di luce", "photo-resistor", "0.1"),
        ("Luce massima sul fototransistor", "phototransistor", "1.0"),
        ("Simula la notte sul sensore", "photo-resistor", "0.0"),
    ]:
        ctx, ids = context_with_components([ct, "led", "resistor"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0]],
                                [f"[AZIONE:interact:{ids[0]}:setLightLevel:{value}]"], False,
                                f"Livello luce impostato a {value}! 💡")))

    # highlight (FIX: only highlight components in context)
    for ct, alias in [
        ("led", "il LED"), ("resistor", "il resistore"), ("push-button", "il pulsante"),
        ("buzzer-piezo", "il buzzer"), ("potentiometer", "il potenziometro"),
        ("capacitor", "il condensatore"), ("diode", "il diodo"),
        ("rgb-led", "l'RGB"), ("motor-dc", "il motore"), ("servo", "il servo"),
    ]:
        ctx, ids = context_with_components([ct])
        msg = random.choice([f"Evidenzia {alias}", f"Mostrami dove e' {alias}", f"Dov'e {alias}?", f"Trova {alias}"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0]], [f"[AZIONE:highlight:{ids[0]}]"], False,
                                f"Ecco dove si trova! 🔍")))

    # measure
    for msg, ct, prop in [
        ("Misura la tensione sul LED", "led", "voltage"),
        ("Quanti volt ci sono sul resistore?", "resistor", "voltage"),
        ("Che corrente passa nel LED?", "led", "current"),
        ("Misura la resistenza", "resistor", "resistance"),
        ("Qual e' la tensione sul condensatore?", "capacitor", "voltage"),
        ("Quanto vale la corrente nel motore?", "motor-dc", "current"),
    ]:
        ctx, ids = context_with_components([ct])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0], prop],
                                [f"[AZIONE:measure:{ids[0]}:{prop}]"], False,
                                f"Misuro {prop} su {ids[0]}... 📏")))

    # setvalue
    for msg, ct, prop, val in [
        ("Cambia la resistenza a 470 ohm", "resistor", "resistance", "470"),
        ("Metti 1000 ohm sul resistore", "resistor", "resistance", "1000"),
        ("Imposta la resistenza a 220 ohm", "resistor", "resistance", "220"),
        ("Cambia il valore del condensatore a 100uF", "capacitor", "capacitance", "100"),
        ("Resistenza a 10k ohm", "resistor", "resistance", "10000"),
    ]:
        ctx, ids = context_with_components([ct, "led"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0], prop],
                                [f"[AZIONE:setvalue:{ids[0]}:{prop}:{val}]"], False,
                                f"Valore aggiornato a {val}! \u2705")))

    # movecomponent
    for msg, ct, x, y in [
        ("Sposta il LED piu a destra", "led", 350, 200),
        ("Metti il resistore piu in basso", "resistor", 200, 350),
        ("Sposta il pulsante a sinistra", "push-button", 100, 200),
        ("Muovi il buzzer in alto", "buzzer-piezo", 200, 100),
    ]:
        ctx, ids = context_with_components([ct])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [ids[0]],
                                [f"[AZIONE:movecomponent:{ids[0]}:{x}:{y}]"], False,
                                "Componente spostato! \u2705")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C8: TUTOR — 150 examples target (was ~24 in v1!)
# ═══════════════════════════════════════════════════════════════════════
def generate_c8(count: int = 150) -> List[Dict]:
    examples = []

    tutor_questions = [
        # Electronics fundamentals
        "Cos'e un LED?", "Come funziona un resistore?", "Spiega la legge di Ohm",
        "Perche il LED si brucia senza resistore?", "A cosa serve il potenziometro?",
        "Cosa sono i condensatori?", "Come funziona un MOSFET?",
        "Qual e la differenza tra serie e parallelo?", "Perche servono i resistori?",
        "Come si calcola la resistenza giusta per un LED?",
        "Cos'e la breadboard?", "Spiega come funziona un fototransistor",
        "A cosa serve il bus sulla breadboard?",
        "Cosa succede se inverto la polarita del LED?",
        "Come funziona il sensore magnetico?",
        # Arduino/programming concepts
        "Cos'e un microcontrollore?", "Cosa fa pinMode?",
        "Differenza tra digitalRead e analogRead?",
        "Cos'e il PWM?", "A cosa serve il Serial Monitor?",
        "Cosa sono i pin digitali e analogici?",
        "Come funziona delay()?", "Cos'e una variabile in Arduino?",
        "Differenza tra INPUT e INPUT_PULLUP?",
        "Cos'e il baud rate?", "Come funziona analogWrite?",
        "Cos'e il duty cycle nel PWM?", "Perche servo usa la libreria Servo.h?",
        "Cos'e un loop infinito?", "Cosa vuol dire compilare?",
        # Circuit theory
        "Cos'e la tensione?", "Cos'e la corrente?", "Cos'e la resistenza?",
        "Cosa dice la legge di Kirchhoff?", "Cos'e un circuito chiuso?",
        "Differenza tra corrente continua e alternata?",
        "Cos'e un cortocircuito?", "Come funziona un diodo?",
        "Cos'e la capacita di un condensatore?", "Cosa succede in un circuito RC?",
        "Cos'e la tensione di soglia del MOSFET?",
        "Perche le LED hanno polarita?", "Cos'e un circuito in serie?",
        "Cos'e un circuito in parallelo?", "Come si misura la tensione col multimetro?",
        # Practical/hands-on
        "Come si legge il codice colore dei resistori?",
        "Dove collego il filo rosso?", "Dove collego il filo nero?",
        "Come si usa il multimetro?", "Qual e il verso giusto del LED?",
        "Come faccio a sapere se il circuito funziona?",
        "Perche il mio LED non si accende?", "Cosa sono le breadboard rails?",
        "Come si alimenta un circuito dalla batteria 9V?",
        "Cos'e il pin GND?", "Cos'e il pin 5V?",
        # Conceptual/fun
        "Perche si chiama breadboard?", "Chi ha inventato il LED?",
        "A cosa servono i circuiti nella vita reale?",
        "Come funziona un semaforo vero?",
        "Cos'e l'elettricita?", "Come si fa un robot?",
        "Posso accendere piu LED con un solo pin?",
        "Cosa succede se metto troppa corrente?",
        "Come funziona il mio telefono dentro?",
        "Perche servono i fili?",
        # V2 additions: deeper questions
        "Spiega la differenza tra NPN e MOSFET",
        "Come calcolo la resistenza per 3 LED in serie?",
        "Cos'e il pull-up interno dell'Arduino?",
        "Perche il fototransistor si comporta diversamente dalla fotoresistenza?",
        "Come funziona il debouncing di un pulsante?",
        "Cos'e la frequenza di un segnale PWM?",
        "Spiega il concetto di massa (GND)",
        "Perche il condensatore si carica e scarica?",
        "Qual e la differenza tra volt e ampere?",
        "Come funziona un servo motore internamente?",
    ]

    for msg in tutor_questions:
        # V2: varied tabs, not just simulator
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("tutor", [], [], True, None,
                                f"Domanda teorica: '{msg}'. Rispondi con analogie semplici per ragazzi 8-14 anni.")))

    # Greetings and off-topic
    for msg, hint in [
        ("ciao!", "Saluto generico. Rispondi come Galileo: amichevole, proponi un esperimento."),
        ("Ciao Galileo!", "Saluto con nome. Rispondi entusiasta, chiedi cosa vogliono fare."),
        ("buongiorno", "Saluto formale. Rispondi cordialmente e proponi un esperimento."),
        ("come stai?", "Conversazione informale. Rispondi in character come Galileo."),
        ("chi sei?", "Domanda identita. Presentati come Galileo, assistente AI di ELAB Tutor."),
        ("cosa sai fare?", "Domanda capacita. Elenca le tue funzioni: circuiti, codice, quiz, spiegazioni."),
        ("mi annoio", "Studente annoiato. Proponi un esperimento divertente o un quiz."),
        ("ho fame", "Off-topic. Scherza brevemente e riporta l'attenzione sugli esperimenti."),
        ("aiuto!", "Richiesta generica di aiuto. Chiedi in cosa aiutare: circuito, codice, esperimento?"),
        ("non capisco niente", "Frustrazione. Rassicura e proponi di ricominciare con qualcosa di semplice."),
    ]:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("tutor", [], [], True, None, hint)))

    # YouTube
    for msg, query in [
        ("Cerca un video sul LED", "LED come funziona tutorial"),
        ("Mostrami un tutorial sui circuiti", "circuiti elettrici tutorial bambini"),
        ("Video su come si usa la breadboard", "breadboard tutorial italiano"),
        ("Tutorial Arduino per principianti", "Arduino tutorial principianti italiano"),
        ("Cercami un video sul potenziometro", "potenziometro come funziona"),
        ("Video su come funziona un MOSFET", "MOSFET spiegazione semplice"),
        ("Tutorial sul servo motore", "servo motore Arduino tutorial"),
        ("Video sui condensatori", "condensatore come funziona tutorial"),
    ]:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], [f"[AZIONE:youtube:{query}]"], False, "Cerco un video per te! 🎬")))

    # Notebook
    for msg, name in [
        ("Crea un taccuino sugli esperimenti", "esperimenti"),
        ("Nuovo taccuino sul LED", "LED"),
        ("Apri un nuovo taccuino per gli appunti", "appunti"),
        ("Crea una lezione sul circuito", "circuito"),
        ("Nuovo notebook sulla legge di Ohm", "legge di Ohm"),
    ]:
        examples.append(make_example(
            make_user_message(random_context(), msg),
            make_assistant_json("action", [], [f"[AZIONE:createnotebook:{name}]"], False,
                                f"Taccuino '{name}' creato! 📓")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C9: REMOVAL / REPLACEMENT — 60 examples target
# ═══════════════════════════════════════════════════════════════════════
def generate_c9(count: int = 60) -> List[Dict]:
    examples = []

    # removecomponent (FIX: context-aware)
    for ct, alias in [
        ("led", "il LED"), ("resistor", "il resistore"), ("push-button", "il pulsante"),
        ("buzzer-piezo", "il buzzer"), ("potentiometer", "il potenziometro"),
        ("capacitor", "il condensatore"), ("mosfet-n", "il MOSFET"),
        ("diode", "il diodo"), ("rgb-led", "il LED RGB"), ("motor-dc", "il motore"),
        ("servo", "il servo"), ("reed-switch", "il reed switch"),
        ("phototransistor", "il fototransistor"), ("photo-resistor", "la fotoresistenza"),
    ]:
        ctx, ids = context_with_components([ct, "resistor"] if ct != "resistor" else [ct, "led"])
        msg = random.choice([f"Rimuovi {alias}", f"Togli {alias}", f"Elimina {alias}", f"Levami {alias}"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [ids[0]], [f"[AZIONE:removecomponent:{ids[0]}]"], False,
                                f"{ids[0]} rimosso! \u2705")))

    # Partial removal
    ctx, ids = context_with_components(["led", "resistor", "push-button", "buzzer-piezo"])
    examples.append(make_example(
        make_user_message(ctx, "Rimuovi solo il resistore, lascia il LED"),
        make_assistant_json("circuit", [ids[1]], [f"[AZIONE:removecomponent:{ids[1]}]"], False,
                            f"{ids[1]} rimosso, LED mantenuto! \u2705")))

    ctx, ids = context_with_components(["led", "resistor", "push-button", "buzzer-piezo"])
    examples.append(make_example(
        make_user_message(ctx, "Elimina tutti tranne il LED"),
        make_assistant_json("circuit", ids[1:],
                            [f"[AZIONE:removecomponent:{c}]" for c in ids[1:]], False,
                            f"Rimossi tutti tranne {ids[0]}! \u2705")))

    # Replacement
    for msg, old_ct, new_ct in [
        ("Sostituisci il LED con un buzzer", "led", "buzzer-piezo"),
        ("Al posto del resistore metti un potenziometro", "resistor", "potentiometer"),
        ("Rimpiazza il LED con un LED RGB", "led", "rgb-led"),
        ("Cambia il pulsante con un reed switch", "push-button", "reed-switch"),
        ("Sostituisci il buzzer con un LED", "buzzer-piezo", "led"),
        ("Cambia il motore con un servo", "motor-dc", "servo"),
    ]:
        ctx, ids = context_with_components([old_ct, "resistor"])
        ij = make_intent_json([new_ct])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("circuit", [ids[0], new_ct],
                                [f"[AZIONE:removecomponent:{ids[0]}]", f"[INTENT:{ij}]"], False,
                                f"Sostituito {ids[0]} con {new_ct}! \u2705")))

    # Clearall with removal context
    for msg in ["Smonta tutto il circuito", "Togli tutto dal breadboard",
                "Rimuovi ogni componente", "Fai piazza pulita", "Cancella e ricomincia"]:
        ctx, _ = context_with_components(["led", "resistor", "push-button", "buzzer-piezo"])
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("action", [], ["[AZIONE:clearall]"], False, "Tutto smontato! Breadboard vuota 🧹")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# C10: VISION — 80 examples target (was 1 in v1!!!)
# ═══════════════════════════════════════════════════════════════════════
def generate_c10(count: int = 80) -> List[Dict]:
    examples = []

    # Direct vision requests
    vision_msgs = [
        "Guarda il mio circuito e dimmi se e' giusto",
        "Controlla se ho collegato tutto bene",
        "Analizza il circuito che ho costruito",
        "Guarda cosa c'e sulla breadboard",
        "Vedi il mio circuito?",
        "Puoi guardare se va bene?",
        "Dimmi cosa vedi",
        "Guarda lo screenshot",
        "Controlla la mia costruzione",
        "Verifica visivamente il circuito",
        "Guarda e dimmi se funzionera",
        "Analizza questa foto del circuito",
        "Riesci a vedere il mio progetto?",
        "Dai un'occhiata al mio lavoro",
        "Guarda com'e venuto il circuito",
    ]
    for msg in vision_msgs:
        for tab in ["simulator", "canvas", "simulator", "simulator"]:
            ctx = random_context(tab=tab)
            examples.append(make_example(
                make_user_message(ctx, msg),
                make_assistant_json("vision", [], [], True, None,
                                    "Richiesta analisi visiva del circuito. Cattura screenshot e analizza componenti e collegamenti.")))

    # Vision + action chain
    for msg, action, hint in [
        ("Guarda il circuito e avvia se e' corretto", "play",
         "Analisi visiva + avvio condizionale. Se il circuito e' corretto, avvia la simulazione."),
        ("Controlla il circuito e correggi gli errori", None,
         "Analisi visiva + correzione. Analizza e suggerisci le modifiche necessarie."),
        ("Guarda e dimmi cosa manca", None,
         "Analisi visiva per componenti mancanti. Confronta con l'esperimento attivo."),
        ("Vedi il mio disegno sulla lavagna", None,
         "Analisi visiva del canvas/lavagna. Descrivi cosa vedi nel disegno dello studente."),
    ]:
        for tab in ["simulator", "canvas"]:
            ctx = random_context(tab=tab)
            actions = ["[AZIONE:play]"] if action else []
            examples.append(make_example(
                make_user_message(ctx, msg),
                make_assistant_json("vision", [], actions, True, None, hint)))

    # Canvas-specific vision
    for msg in [
        "Cosa ho disegnato?", "Guarda il mio disegno",
        "Riesci a vedere la lavagna?", "Analizza il mio schema sulla lavagna",
        "Cosa c'e sulla lavagna?", "Descrivi il mio disegno",
    ]:
        ctx = random_context(tab="canvas")
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("vision", [], [], True, None,
                                "Analisi visiva della lavagna/canvas. Descrivi il disegno dello studente.")))

    # Vision with context about what to check
    for msg, hint in [
        ("Il LED non si accende, guarda perche", "Analisi visiva per debug: LED non si accende. Cerca fili scollegati o polarita invertita."),
        ("Ho costruito il semaforo, e' giusto?", "Analisi visiva del semaforo. Verifica 3 LED, 3 resistori, collegamento corretto."),
        ("Controlla se ho messo il MOSFET giusto", "Analisi visiva del MOSFET. Verifica gate/drain/source nel verso corretto."),
        ("Guarda se il potenziometro e' collegato bene", "Analisi visiva del potenziometro. Verifica VCC/signal/GND."),
        ("Il motore non gira, cosa sbaglio?", "Debug visivo del motore. Cerca polarita, alimentazione, transistor driver."),
    ]:
        ctx = random_context(tab="simulator")
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("vision", [], [], True, None, hint)))

    # Implicit vision triggers (keywords that should trigger vision)
    for msg in [
        "Guarda", "Vedi", "Controlla visivamente", "Dai un'occhiata",
        "Osserva il circuito", "Ispeziona il mio lavoro",
    ]:
        ctx = random_context()
        examples.append(make_example(
            make_user_message(ctx, msg),
            make_assistant_json("vision", [], [], True, None,
                                "Trigger implicito di visione. Cattura screenshot e analizza.")))

    random.shuffle(examples)
    return examples[:count]


# ═══════════════════════════════════════════════════════════════════════
# EDGE CASES — 30+ examples
# ═══════════════════════════════════════════════════════════════════════
def generate_edge_cases() -> List[Dict]:
    examples = []

    # 1. Multi-intent
    ctx = random_context()
    ij = make_intent_json(["led"], connect_to="W_D3")
    examples.append(make_example(
        make_user_message(ctx, "Costruisci un LED, collegalo a D3, e avvia"),
        make_assistant_json("circuit", ["led", "W_D3"], [f"[INTENT:{ij}]", "[AZIONE:play]"], False,
                            "LED piazzato, collegato a D3 e simulazione avviata! \u2705")))

    # 2. Ambiguous component
    ctx = random_context()
    ij = make_intent_json(["led"])
    examples.append(make_example(
        make_user_message(ctx, "metti una lucina"),
        make_assistant_json("circuit", ["led"], [f"[INTENT:{ij}]"], False,
                            "Ecco il LED sulla breadboard! \u2705")))

    # 3. Invalid pin
    ctx, _ = context_with_components(["led"])
    examples.append(make_example(
        make_user_message(ctx, "collega il LED al pin D99"),
        make_assistant_json("circuit", ["led1", "D99"], [], True, None,
                            "Pin D99 non esiste. Pin validi: W_D3, W_D5, W_D6, W_D9-D13, W_A0-A5.")))

    # 4. Action on empty circuit
    ctx = make_context(components=[], wires=0)
    examples.append(make_example(
        make_user_message(ctx, "collega il LED"),
        make_assistant_json("circuit", ["led"], [], True, None,
                            "Non c'e nessun LED sul circuito. Chiedi se vuole aggiungerne uno.")))

    # 5. Typos
    ctx = random_context()
    ij = make_intent_json(["led", "resistor"])
    examples.append(make_example(
        make_user_message(ctx, "costrusci un circuito con led e rezistenza"),
        make_assistant_json("circuit", ["led", "resistor"], [f"[INTENT:{ij}]"], False,
                            "Circuito con LED e resistore montato! \u2705")))
    examples.append(make_example(
        make_user_message(random_context(), "aviva la simulazzione"),
        make_assistant_json("action", [], ["[AZIONE:play]"], False, "Simulazione avviata! \u25b6")))
    examples.append(make_example(
        make_user_message(random_context(), "fermma la simullazione"),
        make_assistant_json("action", [], ["[AZIONE:pause]"], False, "Simulazione in pausa \u23f8")))

    # 6. Question + action
    ctx = random_context()
    ij = make_intent_json(["led"])
    examples.append(make_example(
        make_user_message(ctx, "Come funziona un LED? Mettine uno sulla breadboard"),
        make_assistant_json("circuit", ["led"], [f"[INTENT:{ij}]"], True, None,
                            "Domanda teorica + piazzamento componente. Spiega brevemente e piazza il LED.")))

    # 7. Negation
    examples.append(make_example(
        make_user_message(random_context(), "non avviare la simulazione"),
        make_assistant_json("action", [], [], False, "Ok, non avvio la simulazione. Dimmi quando sei pronto! 👍")))
    examples.append(make_example(
        make_user_message(random_context(), "non toccare il circuito"),
        make_assistant_json("action", [], [], False, "Ok, non tocco niente. Cosa vorresti fare? 👍")))

    # 8. Conditional
    ctx, _ = context_with_components(["led", "resistor"])
    examples.append(make_example(
        make_user_message(ctx, "se il circuito e corretto, avvia"),
        make_assistant_json("action", [], ["[AZIONE:diagnose]", "[AZIONE:play]"], True, None,
                            "Verifica prima dell'avvio. Fai diagnosi e se ok avvia.")))

    # 9. Non-available wing pin
    ctx, _ = context_with_components(["led"])
    examples.append(make_example(
        make_user_message(ctx, "collega il LED al pin D8"),
        make_assistant_json("circuit", ["led1", "D8"], [], True, None,
                            "Pin D8 non disponibile sulla NanoBreakout. Suggerisci D10 (W_D10).")))
    examples.append(make_example(
        make_user_message(ctx, "collega al pin D2"),
        make_assistant_json("circuit", [], [], True, None,
                            "Pin D2 non disponibile. Suggerisci D3 (W_D3) come alternativa.")))

    # 10. Quantity
    ctx = random_context()
    ij = make_intent_json(["led", "led", "led"])
    examples.append(make_example(
        make_user_message(ctx, "metti 3 LED rossi"),
        make_assistant_json("circuit", ["led"], [f"[INTENT:{ij}]"], False,
                            "3 LED rossi posizionati! \u2705")))

    # 11. Mixed tab context
    ctx = make_context(tab="manual")
    examples.append(make_example(
        make_user_message(ctx, "avvia la simulazione"),
        make_assistant_json("action", [], ["[AZIONE:opentab:simulator]", "[AZIONE:play]"], False,
                            "Passo al simulatore e avvio! \u25b6")))
    ctx = make_context(tab="video")
    examples.append(make_example(
        make_user_message(ctx, "metti un LED"),
        make_assistant_json("circuit", ["led"],
                            [f"[AZIONE:opentab:simulator]", f"[INTENT:{make_intent_json(['led'])}]"], False,
                            "Passo al simulatore e piazzo il LED! \u2705")))

    # 12. Canvas tab (V2 NEW)
    ctx = make_context(tab="canvas")
    examples.append(make_example(
        make_user_message(ctx, "cosa vedi sulla lavagna?"),
        make_assistant_json("vision", [], [], True, None,
                            "Richiesta visione dalla lavagna. Cattura e analizza il canvas.")))

    # 13. Pronoun reference
    ctx, _ = context_with_components(["led", "resistor"])
    examples.append(make_example(
        make_user_message(ctx, "collegalo"),
        make_assistant_json("circuit", [], [], True, None,
                            "Pronome ambiguo 'collegalo'. Chiedi: 'Quale componente vuoi collegare e a quale pin?'")))

    # 14. Dio Mode sequence
    ctx = random_context()
    ij1 = make_intent_json(["led", "resistor"])
    ij2 = make_intent_json(["buzzer-piezo"])
    examples.append(make_example(
        make_user_message(ctx, "Costruisci LED con resistore, avvia, poi ferma e sostituisci il LED con un buzzer e riavvia"),
        make_assistant_json("circuit", ["led", "resistor", "buzzer-piezo"],
                            [f"[INTENT:{ij1}]", "[AZIONE:play]", "[AZIONE:pause]",
                             "[AZIONE:removecomponent:led1]", f"[INTENT:{ij2}]", "[AZIONE:play]"], False,
                            "Sequenza completata! Circuito costruito, modificato e riavviato! \u2705")))

    return examples


# ═══════════════════════════════════════════════════════════════════════
# MAIN GENERATOR + VALIDATION
# ═══════════════════════════════════════════════════════════════════════
def generate_dataset(target_count: int = 2000) -> List[Dict]:
    ratio = target_count / 850.0  # base count is ~850
    counts = {
        "C1": max(10, int(120 * ratio)),
        "C2": max(10, int(100 * ratio)),
        "C3": max(10, int(80 * ratio)),
        "C4": max(10, int(70 * ratio)),
        "C5": max(10, int(60 * ratio)),
        "C6": max(10, int(80 * ratio)),
        "C7": max(10, int(60 * ratio)),
        "C8": max(10, int(150 * ratio)),
        "C9": max(10, int(60 * ratio)),
        "C10": max(10, int(80 * ratio)),
    }

    print(f"Generating dataset v2 with target {target_count} examples...")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    print(f"  Edge cases: ~30")

    all_examples = []
    all_examples.extend(generate_c1(counts["C1"]))
    all_examples.extend(generate_c2(counts["C2"]))
    all_examples.extend(generate_c3(counts["C3"]))
    all_examples.extend(generate_c4(counts["C4"]))
    all_examples.extend(generate_c5(counts["C5"]))
    all_examples.extend(generate_c6(counts["C6"]))
    all_examples.extend(generate_c7(counts["C7"]))
    all_examples.extend(generate_c8(counts["C8"]))
    all_examples.extend(generate_c9(counts["C9"]))
    all_examples.extend(generate_c10(counts["C10"]))
    all_examples.extend(generate_edge_cases())

    # Pad if under target
    if len(all_examples) < target_count:
        deficit = target_count - len(all_examples)
        print(f"  Padding {deficit} variations...")
        for _ in range(deficit):
            base = random.choice(all_examples)
            varied = json.loads(json.dumps(base))
            parts = varied["messages"][1]["content"].split("\n\n[MESSAGGIO]\n", 1)
            if len(parts) == 2:
                varied["messages"][1]["content"] = f"[CONTESTO]\n{random_context()}\n\n[MESSAGGIO]\n{parts[1]}"
            all_examples.append(varied)

    random.shuffle(all_examples)
    return all_examples[:target_count]


def validate_dataset(examples: List[Dict]) -> Dict[str, Any]:
    metrics = {
        "total": len(examples), "json_valid": 0, "json_invalid": 0,
        "action_tag_counts": {}, "intents_found": set(), "components_found": set(),
        "needs_llm_true": 0, "needs_llm_false": 0, "multi_action": 0,
        "tabs_found": set(), "volumes_found": set(),
        "intent_counts": {},
    }
    for ex in examples:
        try:
            msgs = ex["messages"]
            data = json.loads(msgs[2]["content"])
            metrics["json_valid"] += 1
            intent = data["intent"]
            metrics["intents_found"].add(intent)
            metrics["intent_counts"][intent] = metrics["intent_counts"].get(intent, 0) + 1
            if data["needs_llm"]:
                metrics["needs_llm_true"] += 1
            else:
                metrics["needs_llm_false"] += 1
            actions = data["actions"]
            if len(actions) > 1:
                metrics["multi_action"] += 1
            for a in actions:
                m = re.match(r'\[AZIONE:(\w+)', a)
                if m:
                    tag = m.group(1)
                    metrics["action_tag_counts"][tag] = metrics["action_tag_counts"].get(tag, 0) + 1
                elif a.startswith("[INTENT:"):
                    metrics["action_tag_counts"]["INTENT"] = metrics["action_tag_counts"].get("INTENT", 0) + 1
            for e in data.get("entities", []):
                if e in COMPONENT_TYPES:
                    metrics["components_found"].add(e)
            # Also scan context for component references
            user = msgs[1]["content"]
            for ct in COMPONENT_TYPES:
                if ct in user or COMP_ID_MAP.get(ct, "") in user:
                    metrics["components_found"].add(ct)
            # Extract tab and volume
            user = msgs[1]["content"]
            tm = re.search(r'tab: (\w+)', user)
            if tm:
                metrics["tabs_found"].add(tm.group(1))
            vm = re.search(r'volume_attivo: (\d)', user)
            if vm:
                metrics["volumes_found"].add(int(vm.group(1)))
        except Exception:
            metrics["json_invalid"] += 1

    return metrics


def print_report(m: Dict):
    print("\n" + "=" * 60)
    print("QUALITY REPORT V2 — Galileo Brain Dataset")
    print("=" * 60)
    print(f"\nTotal: {m['total']} | Valid: {m['json_valid']} | Invalid: {m['json_invalid']}")
    print(f"\nIntent distribution:")
    for intent, count in sorted(m["intent_counts"].items(), key=lambda x: -x[1]):
        pct = count / m["total"] * 100
        bar = "#" * int(pct / 2)
        print(f"  {intent:12s} {count:4d} ({pct:5.1f}%) {bar}")
    print(f"\nAction tags ({len(m['action_tag_counts'])}):")
    for tag, count in sorted(m["action_tag_counts"].items(), key=lambda x: -x[1]):
        print(f"  {tag:25s} {count:4d}")
    print(f"\nComponents: {len(m['components_found'])}/21 (14 placeable + 7 infrastructure)")
    print(f"Tabs: {m['tabs_found']}")
    print(f"Volumes: {m['volumes_found']}")
    print(f"needs_llm=true: {m['needs_llm_true']} | false: {m['needs_llm_false']}")
    print(f"Multi-action: {m['multi_action']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=2000)
    args = parser.parse_args()

    dataset = generate_dataset(args.count)
    metrics = validate_dataset(dataset)
    print_report(metrics)

    # Write JSONL
    out_dir = Path(__file__).parent.parent / "datasets"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / "galileo-brain-v2.jsonl"
    with open(out_path, "w", encoding="utf-8") as f:
        for ex in dataset:
            f.write(json.dumps(ex, ensure_ascii=True) + "\n")
    print(f"\nDataset written to: {out_path}")
    print(f"File size: {out_path.stat().st_size / 1024:.1f} KB")
