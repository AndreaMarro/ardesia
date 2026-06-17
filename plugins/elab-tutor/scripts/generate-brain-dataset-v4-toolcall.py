#!/usr/bin/env python3
"""
ELAB Tutor Brain Dataset Generator v4 - Tool Calling Format
Generates 10,000+ ChatML JSONL training examples with structured tool_calls
Comprehensive coverage of all interaction categories with programmatic tool format
"""

import json
import random
import sys
import os
from typing import Dict, List, Any

# ============================================================================
# CONSTANTS & DATA
# ============================================================================

# All 69 experiments across 3 volumes
EXPERIMENTS = {
    "v1": [f"v1-cap{cap}-esp{esp}" for cap in range(1, 7) for esp in range(1, 4)],
    "v2": [f"v2-cap{cap}-esp{esp}" for cap in range(1, 7) for esp in range(1, 4)],
    "v3": [f"v3-cap{cap}-esp{esp}" for cap in range(1, 7) for esp in range(1, 4)],
    "extra": [f"v3-extra-esp{i}" for i in range(1, 7)]
}
ALL_EXPERIMENTS = [exp for exps in EXPERIMENTS.values() for exp in exps]

# 22 component types
COMPONENTS = {
    "LED": ["led_rosso", "led_verde", "led_blu", "led_giallo"],
    "RESISTORE": ["resistor_220", "resistor_1k", "resistor_10k", "resistor_4.7k"],
    "PULSANTE": ["button1", "button2"],
    "BUZZER": ["buzzer1"],
    "CAPACITORE": ["capacitor_10uf", "capacitor_100uf"],
    "POTENZIOMETRO": ["potentiometer1"],
    "MOTORE": ["motor1"],
    "SERVO": ["servo1"],
    "RGB_LED": ["rgb_led1"],
    "FOTORESISTENZA": ["photoresistor1"],
    "DIODO": ["diode1"],
    "TRANSISTOR": ["transistor_npn", "transistor_pnp"],
    "LCD": ["lcd1"],
    "MOSFET": ["mosfet1"]
}

ALL_COMPONENTS = [comp for comps in COMPONENTS.values() for comp in comps]

TABS = ["simulator", "editor", "manual", "scratch"]
VOLUMES = [1, 2, 3]
PINS = ["D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "A0", "A1", "A2", "A3", "A4", "A5"]
COLORS = ["red", "green", "blue", "black", "yellow"]
LANGUAGES = ["it", "en", "de", "es"]

SYSTEM_PROMPT = """Sei il BRAIN di ELAB Tutor, un simulatore educativo di circuiti per bambini 8-14 anni.
Il tuo ruolo è comprendere l'intento dell'utente e fornire tool_calls strutturati.

INTENTI SUPPORTATI:
- action: comandi diretti al simulatore
- circuit: costruzione di circuiti
- code: scrittura/spiegazione di codice
- tutor: domande teoriche
- vision: analisi di immagini
- navigation: navigazione
- voice: modalità vocale
- drawing: annotazioni/disegni

OUTPUT: JSON con intent, entities, tool_calls (array di {name, arguments}), needs_llm, response, llm_hint"""

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def random_context():
    """Generate random simulator context"""
    exp = random.choice(ALL_EXPERIMENTS)
    num_components = random.randint(0, 6)
    components = random.sample(ALL_COMPONENTS, min(num_components, len(ALL_COMPONENTS)))
    num_wires = random.randint(0, 15)
    volume = random.choice(VOLUMES)
    tab = random.choice(TABS)

    context = f"""tab: {tab}
esperimento: {exp}
componenti: {components}
fili: {num_wires}
volume_attivo: {volume}"""
    return context

def introduce_typos(text: str) -> str:
    """Introduce realistic Italian kid typos/slang"""
    if random.random() > 0.4:
        return text

    typo_map = {
        "non": "nn",
        "per favore": "xfavore",
        "comunque": "cmq",
        "qualcosa": "qlcosa",
        "perché": "xké",
        "anche": "anke",
        "niente": "nnt",
    }

    result = text
    for key, val in typo_map.items():
        if key in result.lower():
            result = result.replace(key, val)

    # Random character swap (typo)
    if len(result) > 5 and random.random() > 0.85:
        idx = random.randint(0, len(result) - 2)
        result = result[:idx] + result[idx+1] + result[idx] + result[idx+2:]

    return result

def make_training_example(user_text: str, intent: str, entities: List[str],
                         tool_calls: List[Dict], needs_llm: bool,
                         response: str = "", llm_hint: str = "") -> Dict:
    """Create a single training example with tool_calls format"""
    assistant_response = {
        "intent": intent,
        "entities": entities,
        "tool_calls": tool_calls,
        "needs_llm": needs_llm
    }
    if response:
        assistant_response["response"] = response
    if llm_hint:
        assistant_response["llm_hint"] = llm_hint

    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"{random_context()}\n\n{user_text}"},
            {"role": "assistant", "content": json.dumps(assistant_response, ensure_ascii=False)}
        ]
    }

# ============================================================================
# CATEGORY GENERATORS
# ============================================================================

def generate_simulator_actions(count: int = 1500) -> List[Dict]:
    """C1: Simulator Actions (play, pause, reset, compile, diagnose, quiz)"""
    examples = []

    # PLAY
    play_texts = [
        "Avvia il circuito", "Fai partire", "Play!", "Prova", "Manda!", "Via!",
        "Prova il circuito", "Esegui", "Fammi vedere", "Fai girare", "Accendi",
        "Inizia", "Avvia", "Parte!", "Simulazione!", "Prova adesso", "play", "start",
        "awvia", "avvia!", "manda", "accenndi", "prova subito", "esegui adesso"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(play_texts))
        examples.append(make_training_example(
            text, "action", [],
            [{"name": "simulator.play", "arguments": {}}],
            False, "Perfetto! Avvio la simulazione... 🚀"
        ))

    # PAUSE
    pause_texts = [
        "Ferma", "Pausa", "Stop!", "Metti in pausa", "Rallenta", "Aspetta",
        "Fermati", "Pausi un attimo", "Stop la sim", "Fai pausa", "Blocca", "Stai fermo"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(pause_texts))
        examples.append(make_training_example(
            text, "action", [],
            [{"name": "simulator.pause", "arguments": {}}],
            False, "Simulazione in pausa ⏸️"
        ))

    # RESET
    reset_texts = [
        "Ricomincia", "Reset", "Azzera", "Ricomincia da capo", "Torna all'inizio",
        "Resetta", "Dall'inizio", "Cancella i risultati", "Reboot", "rricomincia"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(reset_texts))
        examples.append(make_training_example(
            text, "action", [],
            [{"name": "simulator.reset", "arguments": {}}],
            False, "Simulazione resettata ✨"
        ))

    # CLEARALL
    clear_texts = [
        "Pulisci la breadboard", "Svuota tutto", "Rimuovi tutti i componenti",
        "Cancella tutto", "Clear", "Pulisci", "Svuota la breadboard", "Togli tutto"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(clear_texts))
        examples.append(make_training_example(
            text, "action", [],
            [{"name": "simulator.clearAll", "arguments": {}}],
            False, "Breadboard pulita! 🧹"
        ))

    # COMPILE
    compile_texts = [
        "Compila il codice", "Verifica il codice", "Check errori", "Controlla",
        "Compila", "Upload", "Verificami il codice", "Vai!", "Compila il progetto"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(compile_texts))
        examples.append(make_training_example(
            text, "code", [],
            [{"name": "simulator.compile", "arguments": {}}],
            False, "Compilazione in corso... ⚙️"
        ))

    # DIAGNOSE
    diagnose_texts = [
        "Controlla gli errori", "Trova i problemi", "Diagnosi", "Cosa non va?",
        "Dimmi cosa c'è di sbagliato", "Controlla il circuito", "Vedi gli errori"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(diagnose_texts))
        examples.append(make_training_example(
            text, "action", [],
            [{"name": "simulator.diagnose", "arguments": {}}],
            True, llm_hint="Analizza il circuito e identifica problemi"
        ))

    # QUIZ
    quiz_texts = [
        "Verificami", "Testami", "Fammi domande", "Quiz!", "Domande sul circuito",
        "Mi fai un test?", "Controlai se ho capito", "Domandami", "Test di verifica"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(quiz_texts))
        examples.append(make_training_example(
            text, "tutor", [],
            [{"name": "quiz.start", "arguments": {"topic": random.choice(["LED", "Resistore", "Button", "Circuito"])}}],
            True, llm_hint="Crea un quiz con 3-5 domande"
        ))

    return examples

def generate_component_placement(count: int = 1200) -> List[Dict]:
    """C2: Component Placement"""
    examples = []

    # Single components
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        comp_type = comp.split('_')[0]
        texts = [
            f"Aggiungi {comp}",
            f"Metti un {comp_type}",
            f"Piazza {comp}",
            f"Inserisci {comp}"
        ]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "circuit", [comp],
            [{"name": "component.add", "arguments": {"type": comp_type}}],
            False, f"Aggiungo {comp} 🔌"
        ))

    # Multiple components (multi-step)
    for _ in range(count // 3):
        num_comps = random.randint(2, 4)
        comps = random.sample(ALL_COMPONENTS, num_comps)
        text = f"Aggiungi {len(comps)} componenti"
        tool_calls = [{"name": "component.add", "arguments": {"type": c.split('_')[0]}} for c in comps]
        examples.append(make_training_example(
            text, "circuit", comps,
            tool_calls, True,
            llm_hint=f"Piazza: {', '.join(comps)}"
        ))

    # Component with specific values
    for _ in range(count // 3):
        values = ["da 330 ohm", "da 100μF", "da 5mm", "da 1k", "da 10k"]
        value = random.choice(values)
        comp_type = random.choice(["resistore", "condensatore", "LED"])
        text = f"{comp_type} {value}"
        examples.append(make_training_example(
            text, "circuit", [f"{comp_type} {value}"],
            [{"name": "component.add", "arguments": {"type": comp_type}}],
            True, llm_hint=f"Aggiungi {text}"
        ))

    return examples

def generate_complete_circuits(count: int = 800) -> List[Dict]:
    """C3: Complete Circuit Building"""
    examples = []

    circuits = [
        ("Costruisci un semaforo con 3 LED, resistori e un pulsante per cambiare",
         ["led_rosso", "led_giallo", "led_verde", "resistor_220", "button1"]),
        ("Fai un circuito con LED e resistore", ["led_rosso", "resistor_220"]),
        ("Crea un circuito che accende LED quando premo il pulsante",
         ["button1", "led_rosso", "resistor_220"]),
        ("Fai lampeggiare un LED", ["led_rosso"]),
        ("Crea un buzzer che squilla quando premo il bottone",
         ["buzzer1", "button1", "resistor_1k"]),
        ("Servo motor con controllo", ["servo1"]),
        ("Accendi un RGB LED con 3 colori", ["rgb_led1", "resistor_220"]),
        ("Fotoresistenza che misura luce", ["photoresistor1", "resistor_1k"]),
        ("Transistor come interruttore per LED potente",
         ["transistor_npn", "led_rosso", "resistor_1k"]),
        ("Prova l'LCD con testo", ["lcd1"]),
    ]

    for desc, comps in circuits:
        for _ in range(count // 20):
            text = introduce_typos(desc)
            tool_calls = [{"name": "component.add", "arguments": {"type": c.split('_')[0]}} for c in comps]
            examples.append(make_training_example(
                text, "circuit", comps,
                tool_calls, True,
                llm_hint=f"Guida l'utente: {desc}"
            ))

    return examples

def generate_wiring(count: int = 800) -> List[Dict]:
    """C4: Wiring Operations"""
    examples = []

    # Direct connections
    for _ in range(count // 3):
        comp1 = random.choice(ALL_COMPONENTS)
        comp2 = random.choice(ALL_COMPONENTS)
        pin_from = random.choice(PINS)
        pin_to = random.choice(PINS)
        texts = [
            f"Collega {comp1} a {comp2}",
            f"Metti un filo da {comp1} al pin {pin_from}",
            f"Unisci {comp1} e {comp2}"
        ]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "circuit", [comp1, comp2],
            [{"name": "wire.add", "arguments": {
                "from_component": comp1, "from_pin": "default",
                "to_component": comp2, "to_pin": "default"
            }}],
            False
        ))

    # Bus connections (GND/VCC)
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        bus = random.choice(["bus-bot-plus", "bus-bot-minus", "bus-top-plus", "bus-top-minus"])
        texts = ["Collega a massa", "Collega al positivo", "GND", "VCC"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            f"{text} {comp}", "circuit", [comp, bus],
            [{"name": "wire.add", "arguments": {
                "from_component": comp, "from_pin": "default",
                "to_component": bus, "to_pin": "default"
            }}],
            False
        ))

    # Remove wire
    for _ in range(count // 3):
        texts = ["Togli il filo", "Elimina questo collegamento", "Stacca il cavo", "Rimuovi il filo"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "circuit", [],
            [{"name": "wire.remove", "arguments": {"index": random.randint(0, 10)}}],
            False, "Filo rimosso ❌"
        ))

    return examples

def generate_navigation(count: int = 700) -> List[Dict]:
    """C5: Navigation (experiments, tabs, volumes)"""
    examples = []

    # Load specific experiments
    for exp in random.sample(ALL_EXPERIMENTS, min(40, len(ALL_EXPERIMENTS))):
        for _ in range(count // 140):
            texts = [f"Apri {exp}", f"Carica {exp}", f"Vai a {exp}"]
            text = introduce_typos(random.choice(texts))
            examples.append(make_training_example(
                text, "navigation", [exp],
                [{"name": "navigation.loadExperiment", "arguments": {"id": exp}}],
                False, f"Carico {exp}... 📂"
            ))

    # Tab switching
    for tab in TABS:
        for _ in range(count // 40):
            texts = [f"Apri {tab}", f"Vai a {tab}", f"Mostrami {tab}"]
            text = introduce_typos(random.choice(texts))
            examples.append(make_training_example(
                text, "navigation", [tab],
                [{"name": "navigation.openTab", "arguments": {"tab": tab}}],
                False, f"Apro {tab} 📋"
            ))

    # Volume navigation
    for vol in VOLUMES:
        for _ in range(count // 60):
            text = f"Volume {vol}"
            examples.append(make_training_example(
                text, "navigation", [f"volume{vol}"],
                [{"name": "navigation.openVolume", "arguments": {"volume": vol}}],
                False, f"Apertura volume {vol}... 📖"
            ))

    # Page navigation
    for _ in range(count // 30):
        page = random.randint(1, 50)
        text = f"Vai a pagina {page}"
        examples.append(make_training_example(
            text, "navigation", [f"page{page}"],
            [{"name": "navigation.goToPage", "arguments": {"page": page}}],
            False, f"Vado a pagina {page}... 📄"
        ))

    return examples

def generate_code(count: int = 800) -> List[Dict]:
    """C6: Code Writing/Editing"""
    examples = []

    # Write code
    code_reqs = [
        "Scrivi un codice che fa lampeggiare il LED",
        "Fai un blink",
        "Codice per il button",
        "Mi fai un programma semplice?",
        "Programma LED",
        "Serial print esempio",
        "Scrivi il codice Arduino",
        "Coda Arduino per il servo"
    ]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(code_reqs))
        code = "void setup() { Serial.begin(9600); }\nvoid loop() { digitalWrite(LED, HIGH); delay(1000); }"
        examples.append(make_training_example(
            text, "code", [],
            [{"name": "editor.setCode", "arguments": {"code": code}}],
            True, llm_hint=f"Scrivi codice Arduino per: {text}"
        ))

    # Fix code
    fix_reqs = [
        "Il codice non funziona",
        "Correggi gli errori",
        "Cosa è sbagliato?",
        "C'è un bug",
        "Compilazione fallita",
        "Errore nel codice",
        "codice rotto",
        "non compila"
    ]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(fix_reqs))
        examples.append(make_training_example(
            text, "code", [],
            [{"name": "simulator.compile", "arguments": {}}],
            True, llm_hint="Analizza il codice, identifica errori e correggi"
        ))

    # Mode switching
    for _ in range(count // 3):
        mode = random.choice(["arduino", "scratch"])
        texts = [f"Cambia a {mode}", f"Scritto in {mode}", f"Usa {mode}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "code", [mode],
            [{"name": "editor.switchMode", "arguments": {"mode": mode}}],
            False, f"Cambio a {mode} mode... 💻"
        ))

    return examples

def generate_component_interactions(count: int = 500) -> List[Dict]:
    """C7: Component Interactions (buttons, pots, sensors)"""
    examples = []

    # Button press
    for _ in range(count // 3):
        texts = [
            "Premi il pulsante",
            "Attiva il button",
            "Fai click",
            "Clicca il bottone",
            "Pressa il button",
            "Premi!"
        ]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "action", ["button1"],
            [{"name": "interaction.pressButton", "arguments": {"id": "button1"}}],
            False, "Pulsante premuto! 🔘"
        ))

    # Potentiometer
    for _ in range(count // 3):
        value = random.randint(0, 1023)
        texts = [
            f"Gira il potenziometro a {value}",
            f"Potenziometro {value}",
            f"Regola a {value}",
            f"Potenziometro su {value}"
        ]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "action", ["potentiometer1"],
            [{"name": "interaction.setPotentiometer", "arguments": {"id": "potentiometer1", "value": value}}],
            False, f"Potenziometro a {value} 📊"
        ))

    # Light level
    for _ in range(count // 3):
        value = random.randint(0, 1023)
        texts = [
            f"Illumina a {value}",
            f"Luce {value}",
            f"Luminosità {value}",
            f"Fotoresistenza {value}"
        ]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "action", ["photoresistor1"],
            [{"name": "interaction.setLightLevel", "arguments": {"id": "photoresistor1", "value": value}}],
            False, f"Luce impostata 💡"
        ))

    return examples

def generate_tutor_theory(count: int = 1000) -> List[Dict]:
    """C8: Tutor/Theory Questions"""
    examples = []

    # Theory questions
    questions = [
        "Cos'è un LED?", "Come funziona un resistore?", "Spiega la legge di Ohm",
        "Cosa significa corrente?", "Differenza tra tensione e corrente?",
        "Come funziona un circuito?", "Cosa è un pin digitale?", "Analogo vs digitale?",
        "Come si disegna un circuito?", "Cosa è un transistor?", "Come funzionano i diodi?",
        "Cosa è un servo?", "Come funzionano i buzzer?", "Cosa è PWM?",
        "Come leggere il codice?", "Cosa è una breadboard?", "Come si misura la tensione?",
        "Cosa sono i pin analogici?", "Come funziona un pulsante?", "Cosa è la corrente?"
    ]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(questions))
        examples.append(make_training_example(
            text, "tutor", [],
            [{"name": "quiz.start", "arguments": {"topic": random.choice(["LED", "Resistore", "Button"])}}],
            True, llm_hint=f"Spiega in modo semplice: {text}"
        ))

    # Greetings
    greetings = ["Ciao!", "Come stai?", "Chi sei?", "Salve", "Ehy", "Ciaoo", "Acciao"]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(greetings))
        examples.append(make_training_example(
            text, "tutor", [],
            [{"name": "memory.recall", "arguments": {"query": "introduzione"}}],
            False, "Ciao! Sono il tuo tutor virtuale 👋"
        ))

    # Help requests
    helps = [
        "Aiutami", "Ho bisogno di aiuto", "Non capisco", "Guidami", "Help!", "SOS",
        "Non nn capisco nnt", "Aiutooo", "Che cosa è?"
    ]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(helps))
        examples.append(make_training_example(
            text, "tutor", [],
            [{"name": "quiz.start", "arguments": {"topic": "generale"}}],
            True, llm_hint="Offri aiuto step-by-step"
        ))

    return examples

def generate_removal_modification(count: int = 500) -> List[Dict]:
    """C9: Component Removal/Modification"""
    examples = []

    # Remove component
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        texts = [f"Rimuovi il {comp}", f"Togliete il {comp}", f"Elimina il {comp}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(
            text, "circuit", [comp],
            [{"name": "component.remove", "arguments": {"id": comp}}],
            False, "Rimosso ✂️"
        ))

    # Replace component
    for _ in range(count // 3):
        comp1 = random.choice(ALL_COMPONENTS)
        comp2 = random.choice(ALL_COMPONENTS)
        text = f"Sostituisci {comp1} con {comp2}"
        examples.append(make_training_example(
            text, "circuit", [comp1, comp2],
            [{"name": "component.remove", "arguments": {"id": comp1}},
             {"name": "component.add", "arguments": {"type": comp2.split('_')[0]}}],
            True, llm_hint=f"Sostituisci {comp1} con {comp2}"
        ))

    # Move component
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        text = f"Sposta il {comp}"
        examples.append(make_training_example(
            text, "circuit", [comp],
            [{"name": "component.move", "arguments": {"id": comp, "position": f"row{random.randint(1, 10)}"}}],
            False, "Spostato ↔️"
        ))

    return examples

def generate_vision(count: int = 400) -> List[Dict]:
    """C10: Vision/Image Analysis"""
    examples = []

    vision_reqs = [
        "Guarda il mio circuito", "Cosa vedi?", "Analizza questa foto",
        "È corretto?", "Cosa c'è che non va?", "Leggi il circuito",
        "che circuito è?", "è giusto?", "vedi errori?", "Dimmi se è fatto bene"
    ]

    for _ in range(count):
        text = introduce_typos(random.choice(vision_reqs))
        examples.append(make_training_example(
            f"{text} [IMAGE: circuit.jpg]", "vision", [],
            [{"name": "component.highlight", "arguments": {"ids": random.sample(ALL_COMPONENTS, random.randint(1, 3))}}],
            True, llm_hint=f"Analizza l'immagine: {text}"
        ))

    return examples

def generate_voice_mode(count: int = 400) -> List[Dict]:
    """C11: Voice Mode Operations"""
    examples = []

    # Enable voice
    enable_texts = ["Attiva la voce", "Parla!", "Leggi ad alta voce", "Voce on", "Voice"]
    for _ in range(count // 4):
        text = introduce_typos(random.choice(enable_texts))
        examples.append(make_training_example(
            text, "voice", [],
            [{"name": "voice.enable", "arguments": {}}],
            False, "Modalità voce attivata! 🔊"
        ))

    # Disable voice
    disable_texts = ["Disattiva microfono", "Scrivi e basta", "Voce off", "Silenzio"]
    for _ in range(count // 4):
        text = introduce_typos(random.choice(disable_texts))
        examples.append(make_training_example(
            text, "voice", [],
            [{"name": "voice.disable", "arguments": {}}],
            False, "Modalità voce disattivata 🔇"
        ))

    # Language switch
    for lang in LANGUAGES:
        for _ in range(count // 20):
            lang_name = {"it": "italiano", "en": "inglese", "de": "tedesco", "es": "spagnolo"}[lang]
            texts = [f"Parla in {lang_name}", f"Cambia lingua a {lang_name}", f"Lingua {lang_name}"]
            text = introduce_typos(random.choice(texts))
            examples.append(make_training_example(
                text, "voice", [lang],
                [{"name": "voice.setLanguage", "arguments": {"lang": lang}}],
                False, f"Lingua cambiata a {lang_name} 🌍"
            ))

    return examples

def generate_drawing_mode(count: int = 400) -> List[Dict]:
    """C12: Drawing/Annotation Mode"""
    examples = []

    # Enable drawing
    enable_texts = ["Fammi disegnare", "Attiva la matita", "Voglio scrivere", "Disegno", "Drawing on"]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(enable_texts))
        examples.append(make_training_example(
            text, "drawing", [],
            [{"name": "drawing.enable", "arguments": {}}],
            False, "Modalità disegno attivata! 🎨"
        ))

    # Color selection
    for color in COLORS:
        for _ in range(count // 15):
            texts = [f"Disegna con il {color}", f"Cambio colore a {color}", f"Usa il {color}"]
            text = introduce_typos(random.choice(texts))
            examples.append(make_training_example(
                text, "drawing", [color],
                [{"name": "drawing.setColor", "arguments": {"color": color}}],
                False, f"Colore impostato a {color} 🖍️"
            ))

    # Clear drawing
    clear_texts = ["Cancella i miei appunti", "Pulisci", "Clear", "Cancella disegno"]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(clear_texts))
        examples.append(make_training_example(
            text, "drawing", [],
            [{"name": "drawing.clear", "arguments": {}}],
            False, "Disegno cancellato 🧹"
        ))

    return examples

def generate_memory_context(count: int = 500) -> List[Dict]:
    """C13: Memory/Context Recall"""
    examples = []

    # Memory recall
    memory_reqs = [
        "Cosa stavo facendo?", "Dove eravamo?", "Ricordami l'esperimento",
        "Quanto ho fatto?", "Quanto ho progredito?", "Mi ricordi il circuito?",
        "cosa era quello?", "nn ricordo", "il mio progetto", "Cosa ho fatto prima?"
    ]
    for _ in range(count // 2):
        text = introduce_typos(random.choice(memory_reqs))
        examples.append(make_training_example(
            text, "tutor", [],
            [{"name": "memory.recall", "arguments": {"query": text}}],
            True, llm_hint="Fornisci contesto sulla sessione attuale"
        ))

    # Progress report
    progress_reqs = [
        "Dimmi il mio progresso",
        "Quanti esperimenti ho completato?",
        "Statistiche",
        "Sono bravo?",
        "Come sto andando?",
        "ho sbagliato molto?",
        "Fammi un report",
        "Che statistiche ho?"
    ]
    for _ in range(count // 2):
        text = introduce_typos(random.choice(progress_reqs))
        examples.append(make_training_example(
            text, "tutor", [],
            [{"name": "report.generate", "arguments": {"type": "progress"}}],
            True, llm_hint="Analizza progresso e fornisci feedback"
        ))

    return examples

def generate_hard_multistep(count: int = 500) -> List[Dict]:
    """C14: Hard Multi-Step Requests"""
    examples = []

    hard_requests = [
        ("Costruisci un semaforo con 3 LED, resistori e un pulsante per cambiare",
         ["led_rosso", "led_giallo", "led_verde", "resistor_220", "button1"]),
        ("Carica l'esperimento del buzzer, modifica il codice per suonare una melodia, poi fallo partire",
         ["buzzer1", "button1"]),
        ("Togli il LED rosso, metti uno verde, collega al pin D5 e aggiungi un resistore da 330 ohm",
         ["led_verde", "resistor_220"]),
        ("Apri il volume 2, vai al capitolo sui condensatori, poi carica il primo esperimento",
         ["capacitor_10uf"]),
        ("Fai un circuito che lampeggia quando premo il bottone, scrivi il codice e compilalo",
         ["button1", "led_rosso"]),
        ("Metti 2 LED con colori diversi, collegali allo stesso resistore da 1k, poi prova",
         ["led_rosso", "led_blu", "resistor_1k"]),
        ("Costruisci un circuito che accende il LED quando la luce è al di sotto di 500",
         ["photoresistor1", "led_rosso"]),
        ("Scrivi un programma che controlla un servo a 90 gradi, caricalo e testalo",
         ["servo1"]),
    ]

    for desc, comps in hard_requests:
        for _ in range(count // 16):
            text = introduce_typos(desc)
            tool_calls = [{"name": "component.add", "arguments": {"type": c.split('_')[0]}} for c in comps]
            tool_calls.append({"name": "simulator.compile", "arguments": {}})
            tool_calls.append({"name": "simulator.play", "arguments": {}})
            examples.append(make_training_example(
                text, "circuit", comps,
                tool_calls, True,
                llm_hint=f"Multi-step: {desc}"
            ))

    return examples

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Generate complete dataset v4"""
    print("🚀 Starting ELAB Tutor Brain Dataset Generation v4 (Tool Calling)...")
    print(f"📊 Target: 10,000+ examples with structured tool_calls\n")

    all_examples = []

    generators = [
        ("C1: Simulator Actions", generate_simulator_actions, 1800),
        ("C2: Component Placement", generate_component_placement, 1500),
        ("C3: Complete Circuits", generate_complete_circuits, 1000),
        ("C4: Wiring", generate_wiring, 1000),
        ("C5: Navigation", generate_navigation, 900),
        ("C6: Code", generate_code, 1000),
        ("C7: Component Interactions", generate_component_interactions, 700),
        ("C8: Tutor/Theory", generate_tutor_theory, 1200),
        ("C9: Removal/Modification", generate_removal_modification, 600),
        ("C10: Vision", generate_vision, 500),
        ("C11: Voice Mode", generate_voice_mode, 500),
        ("C12: Drawing/Annotation", generate_drawing_mode, 500),
        ("C13: Memory/Context", generate_memory_context, 600),
        ("C14: Hard Multi-Step", generate_hard_multistep, 600),
    ]

    for cat_name, gen_func, count in generators:
        print(f"📝 {cat_name}... ", end="", flush=True)
        examples = gen_func(count)
        all_examples.extend(examples)
        print(f"✓ {len(examples)} examples")

    print(f"\n✨ Total examples generated: {len(all_examples)}")

    # Create output directory
    output_dir = "/sessions/optimistic-vibrant-feynman/mnt/VOLUME 3/PRODOTTO/elab-builder/datasets"
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "galileo-brain-v4-toolcall.jsonl")

    print(f"\n💾 Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        for example in all_examples:
            f.write(json.dumps(example, ensure_ascii=False) + '\n')

    file_size = os.path.getsize(output_path) / 1024 / 1024

    print(f"✅ Dataset complete!\n")
    print(f"📊 STATISTICS:")
    print(f"   - Total examples: {len(all_examples)}")
    print(f"   - File size: {file_size:.2f} MB")
    print(f"   - Output: {output_path}")

    return len(all_examples)

if __name__ == "__main__":
    total = main()
    sys.exit(0 if total >= 10000 else 1)
