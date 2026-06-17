#!/usr/bin/env python3
"""
ELAB Tutor Brain Dataset Generator v3
Generates 5000+ ChatML JSONL training examples for Qwen3-4B fine-tuning
Comprehensive coverage of all interaction categories
"""

import json
import random
import sys
import os
from typing import Dict, List, Any

# ============================================================================
# CONSTANTS & DATA
# ============================================================================

EXPERIMENTS = {
    "v1": [f"v1-cap{cap}-esp{esp}" for cap in range(1, 7) for esp in range(1, 4)],
    "v2": [f"v2-cap{cap}-esp{esp}" for cap in range(1, 7) for esp in range(1, 4)],
    "v3": [f"v3-cap{cap}-esp{esp}" for cap in range(1, 7) for esp in range(1, 4)],
    "extra": [f"v3-extra-esp{i}" for i in range(1, 7)]
}
ALL_EXPERIMENTS = [exp for exps in EXPERIMENTS.values() for exp in exps]

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

TABS = ["simulator", "editor", "manual", "canvas"]
VOLUMES = ["volume1", "volume2", "volume3"]
PINS = ["D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "A0", "A1", "A2", "A3", "A4", "A5"]
WING_PINS = ["W_A0", "W_A1", "W_A2", "W_A3", "W_A4", "W_A5", "W_D3", "W_D4", "W_D5", "W_D6", "W_D7", "W_D8", "W_D9", "W_D10", "W_D11", "W_D12", "W_D13"]
BUS_NODES = ["bus-bot-plus", "bus-bot-minus", "bus-top-plus", "bus-top-minus"]

SYSTEM_PROMPT = """Sei il BRAIN di ELAB Tutor, un simulatore educativo di circuiti per bambini 8-14 anni.
Il tuo ruolo è comprendere l'intento dell'utente e instradare verso gli specialisti corretti.

CATEGORIE DI INTENTI:
- action: comandi diretti al simulatore (play, pause, reset, etc.)
- circuit: descrizioni/richieste di circuiti completi da costruire
- code: scritti/spiegazioni di codice Arduino/Scratch
- tutor: domande teoriche, concetti, spiegazioni
- vision: analisi di immagini/foto di circuiti
- navigation: navigazione tra esperimenti/tab/volumi

SPECIALISTI DISPONIBILI:
- SimulatorController: gestisce play/pause/reset/diagnose
- CircuitBuilder: piazza componenti e disegna circuiti
- CodeEditor: scrive/spiega codice
- TutorAI: spiega teoria, risponde a domande
- VisionAnalyzer: analizza foto di circuiti
- NavigationManager: gestisce menu e tab

CONTESTO FORNITO:
- tab: current simulator view (simulator|editor|manual|canvas)
- esperimento: current experiment ID (es: v1-cap6-esp1)
- componenti: lista di componenti attualmente nel progetto
- fili: numero di collegamenti
- volume_attivo: quale volume sta usando (1|2|3)

ISTRUZIONI:
1. Analizza il messaggio dell'utente in italiano informale (bambini)
2. Identifica l'INTENT correttamente
3. Estrai ENTITIES (componenti, pin, esperimenti menzionati)
4. Suggerisci ACTIONS concrete (usa formato [AZIONE:tipo:param])
5. Se puoi rispondere direttamente → needs_llm=false + "response"
6. Se serve specialista → needs_llm=true + "llm_hint" per il specialista
7. Includi sempre risposta amichevole per il bambino"""

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def random_context():
    """Generate random simulator context"""
    exp = random.choice(ALL_EXPERIMENTS)
    num_components = random.randint(1, 5)
    components = random.sample(ALL_COMPONENTS, min(num_components, len(ALL_COMPONENTS)))
    num_wires = random.randint(0, len(components) * 2)
    volume = random.choice(VOLUMES)

    context = f"""tab: {random.choice(TABS)}
esperimento: {exp}
componenti: {components}
fili: {num_wires}
volume_attivo: {volume[-1]}"""
    return context

def introduce_typos(text: str) -> str:
    """Introduce realistic typos/slang into text"""
    if random.random() > 0.4:
        return text

    typo_map = {
        "non": "nn",
        "per favore": "xfavore",
        "comunque": "cmq",
        "qualcosa": "qlcosa",
    }

    result = text
    for key, val in typo_map.items():
        if key in result.lower():
            result = result.replace(key, val)

    # Random character swap
    if len(result) > 5 and random.random() > 0.8:
        idx = random.randint(0, len(result) - 2)
        result = result[:idx] + result[idx+1] + result[idx] + result[idx+2:]

    return result

def make_training_example(user_text: str, intent: str, entities: List[str],
                         actions: List[str], needs_llm: bool,
                         response: str = "", llm_hint: str = "") -> Dict:
    """Create a single training example"""
    assistant_response = {
        "intent": intent,
        "entities": entities,
        "actions": actions,
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

def generate_c1(count: int = 800) -> List[Dict]:
    """C1: Simulator Actions"""
    examples = []

    # PLAY
    play_texts = [
        "Avvia il circuito", "Fai partire", "Play!", "Prova", "Manda!", "Via!",
        "Prova il circuito", "Esegui", "Fammi vedere", "Fai girare", "Accendi",
        "Inizia", "Avvia", "Parte!", "Simulazione!", "Prova adesso", "Fai un test",
        "avvia", "play", "start", "run", "vai", "prova!", "manda la simulazione",
        "awvia", "avvia!", "manda", "inizia la sim", "accenndi", "prova subito"
    ]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(play_texts))
        examples.append(make_training_example(text, "action", [], ["[AZIONE:play]"], False, "Perfetto! Avvio la simulazione... 🚀"))

    # PAUSE
    pause_texts = ["Ferma", "Pausa", "Stop!", "Metti in pausa", "Rallenta", "Aspetta",
                   "Fermati", "Pausi un attimo", "Stop la sim", "Fai pausa", "Blocca", "Stai fermo"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(pause_texts))
        examples.append(make_training_example(text, "action", [], ["[AZIONE:pause]"], False, "Simulazione in pausa ⏸️"))

    # RESET
    reset_texts = ["Ricomincia", "Reset", "Azzera", "Ricomincia da capo", "Torna all'inizio",
                   "Resetta", "Dall'inizio", "Cancella i risultati", "Reboot", "rricomincia"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(reset_texts))
        examples.append(make_training_example(text, "action", [], ["[AZIONE:reset]"], False, "Simulazione resettata ✨"))

    # CLEARALL
    clear_texts = ["Pulisci la breadboard", "Svuota tutto", "Rimuovi tutti i componenti",
                   "Cancella tutto", "Clear", "Pulisci", "Svuota la breadboard", "Togli tutto"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(clear_texts))
        examples.append(make_training_example(text, "action", [], ["[AZIONE:clearall]"], False, "Breadboard pulita! 🧹"))

    # COMPILE
    compile_texts = ["Compila il codice", "Verifica il codice", "Check errori", "Controlla",
                     "Compila", "Upload", "Verificami il codice", "Vai!", "Compila il progetto"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(compile_texts))
        examples.append(make_training_example(text, "code", [], ["[AZIONE:compile]"], False, "Compilazione in corso... ⚙️"))

    # DIAGNOSE
    diagnose_texts = ["Controlla gli errori", "Trova i problemi", "Diagnosi", "Cosa non va?",
                      "Dimmi cosa c'è di sbagliato", "Controlla il circuito", "Vedi gli errori"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(diagnose_texts))
        examples.append(make_training_example(text, "action", [], ["[AZIONE:diagnose]"], True,
                                            llm_hint="Analizza il circuito e identifica problemi"))

    # QUIZ
    quiz_texts = ["Verificami", "Testami", "Fammi domande", "Quiz!", "Domande sul circuito",
                  "Mi fai un test?", "Controlai se ho capito", "Domandami", "Test di verifica"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(quiz_texts))
        examples.append(make_training_example(text, "tutor", [], ["[AZIONE:quiz]"], True,
                                            llm_hint="Crea un quiz con 3-5 domande"))

    # YOUTUBE
    youtube_texts = ["Cerca video su LED", "Mostrami un tutorial", "Youtube LED", "Video su circuiti",
                     "Trovami un video", "Tutorial servo", "Cerka un video", "fammi un video"]
    for _ in range(count // 11):
        text = introduce_typos(random.choice(youtube_texts))
        examples.append(make_training_example(text, "navigation", [], ["[AZIONE:youtube:tutorial]"], False, "Apro YouTube con tutorial 📺"))

    # TAB SWITCHING
    tab_texts = [("Apri editor", "editor"), ("Vai all'editor", "editor"), ("Mostrami il codice", "editor"),
                 ("Simulator", "simulator"), ("Torna al simulatore", "simulator"), ("Manuale", "manual")]
    for text, tab in tab_texts[:count // 11]:
        for _ in range(5):
            examples.append(make_training_example(text, "navigation", [tab], [f"[AZIONE:opentab:{tab}]"], False, f"Apro {tab} 📋"))

    # HIGHLIGHT
    for _ in range(count // 11):
        comp = random.choice(ALL_COMPONENTS)
        text = random.choice([f"Evidenzia {comp}", f"Mostrami {comp}", f"Accendi {comp}"])
        examples.append(make_training_example(text, "action", [comp], [f"[AZIONE:highlight:{comp}]"], False, f"Evidenzio {comp} ✨"))

    return examples

def generate_c2(count: int = 600) -> List[Dict]:
    """C2: Component Placement"""
    examples = []

    # Single components
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        texts = [f"Aggiungi {comp}", f"Metti un {comp.split('_')[0]}", f"Piazza {comp}", f"Inserisci {comp}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "circuit", [comp], [], False, f"Aggiungo {comp} 🔌"))

    # Multiple components
    for _ in range(count // 3):
        num_comps = random.randint(2, 4)
        comps = random.sample(ALL_COMPONENTS, num_comps)
        text = f"Aggiungi {len(comps)} componenti"
        examples.append(make_training_example(text, "circuit", comps, [], True,
                                            llm_hint=f"Piazza: {', '.join(comps)}"))

    # Component with values
    for _ in range(count // 3):
        values = ["da 330 ohm", "da 100μF", "da 5mm", "da 1k", "da 10k"]
        value = random.choice(values)
        comp = random.choice(["resistore", "condensatore", "LED"])
        text = f"{comp} {value}"
        examples.append(make_training_example(text, "circuit", [f"{comp} {value}"], [], True,
                                            llm_hint=f"Aggiungi {text}"))

    return examples

def generate_c3(count: int = 400) -> List[Dict]:
    """C3: Complete Circuits"""
    examples = []

    circuits = [
        ("Costruisci un circuito con LED e resistore", ["led_rosso", "resistor_220"]),
        ("Fai un semaforo", ["led_rosso", "led_giallo", "led_verde"]),
        ("Crea un circuito con pulsante che accende LED", ["button1", "led_rosso"]),
        ("Fai lampeggiare un LED", ["led_rosso"]),
        ("Crea un buzzer che squilla", ["buzzer1", "button1"]),
        ("Circuito con servo motor", ["servo1"]),
        ("Accendi un RGB LED", ["rgb_led1"]),
        ("Fotoresistenza che misura luce", ["photoresistor1"]),
        ("Transistor come interruttore", ["transistor_npn", "led_rosso"]),
        ("Prova il LCD", ["lcd1"]),
    ]

    for desc, comps in circuits:
        for _ in range(count // 20):
            text = introduce_typos(desc)
            examples.append(make_training_example(text, "circuit", comps, [], True,
                                                llm_hint=f"Guida l'utente: {desc}"))

    return examples

def generate_c4(count: int = 500) -> List[Dict]:
    """C4: Wiring"""
    examples = []

    # Direct connections
    for _ in range(count // 3):
        comp1 = random.choice(ALL_COMPONENTS)
        comp2 = random.choice(ALL_COMPONENTS)
        pin = random.choice(PINS)
        texts = [f"Collega {comp1} a {comp2}", f"Metti un filo da {comp1} a {pin}", f"Unisci {comp1} e {comp2}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "circuit", [comp1, comp2],
                                            [f"[AZIONE:addwire:{comp1}:default:{comp2}:default]"], False))

    # Bus connections
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        bus = random.choice(BUS_NODES)
        texts = ["Collega a massa", "Collega al positivo", "GND", "VCC"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(f"{text} {comp}", "circuit", [comp, bus],
                                            [f"[AZIONE:addwire:{comp}:default:{bus}:default]"], False))

    # Remove wire
    for _ in range(count // 3):
        texts = ["Togli il filo", "Elimina questo collegamento", "Stacca il cavo", "Rimuovi il filo"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "circuit", [], ["[AZIONE:removewire:1]"], False, "Filo rimosso ❌"))

    return examples

def generate_c5(count: int = 400) -> List[Dict]:
    """C5: Navigation"""
    examples = []

    # Load experiments
    for exp in random.sample(ALL_EXPERIMENTS, min(20, len(ALL_EXPERIMENTS))):
        for _ in range(count // 100):
            texts = [f"Apri {exp}", f"Carica {exp}", f"Vai a {exp}"]
            text = introduce_typos(random.choice(texts))
            examples.append(make_training_example(text, "navigation", [exp],
                                                [f"[AZIONE:loadexp:{exp}]"], False, f"Carico {exp}... 📂"))

    # Back/Forward
    navs = [("Torna indietro", "back"), ("Vai avanti", "forward"), ("Previous", "back"), ("Next", "forward")]
    for text, direction in navs:
        for _ in range(count // 40):
            examples.append(make_training_example(text, "navigation", [direction],
                                                [f"[AZIONE:navigate:{direction}]"], False, f"Vado {direction} 🔄"))

    # Panels
    panels = [("Serial monitor", "serial"), ("Apri editor", "code"), ("Scratch", "scratch"), ("BOM", "bom")]
    for text, panel in panels:
        for _ in range(count // 40):
            examples.append(make_training_example(text, "navigation", [panel],
                                                [f"[AZIONE:openpanel:{panel}]"], False, f"Apro {panel} 📊"))

    # Volumes
    for vol in ["1", "2", "3"]:
        for _ in range(count // 60):
            text = f"Volume {vol}"
            examples.append(make_training_example(text, "navigation", [f"volume{vol}"],
                                                [f"[AZIONE:openvolume:{vol}]"], False, f"Apertura volume {vol}... 📖"))

    return examples

def generate_c6(count: int = 500) -> List[Dict]:
    """C6: Code"""
    examples = []

    # Write code
    code_reqs = [
        "Scrivi un codice che fa lampeggiare il LED", "Fai un blink", "Codice per il button",
        "Mi fai un programma semplice?", "Programma LED", "Serial print esempio", "Scrivi il codice"
    ]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(code_reqs))
        examples.append(make_training_example(text, "code", [], [], True,
                                            llm_hint=f"Scrivi codice Arduino per: {text}"))

    # Fix code
    fix_reqs = ["Il codice non funziona", "Correggi gli errori", "Cosa è sbagliato?", "C'è un bug",
                "Compilazione fallita", "Errore nel codice", "codice rotto", "non compila"]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(fix_reqs))
        examples.append(make_training_example(text, "code", [], [], True,
                                            llm_hint="Analizza il codice, identifica errori e correggi"))

    # Explain code
    explain_reqs = ["Spiega questo codice", "Cosa fa questo programma?", "Come funziona?",
                    "Che significa digitalWrite?", "Cosa è delay?", "Spiega il loop"]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(explain_reqs))
        examples.append(make_training_example(text, "code", [], [], True,
                                            llm_hint=f"Spiega semplicemente: {text}"))

    return examples

def generate_c7(count: int = 300) -> List[Dict]:
    """C7: Component Interactions"""
    examples = []

    # Button press
    for _ in range(count // 3):
        texts = ["Premi il pulsante", "Attiva il button", "Fai click", "Clicca il bottone"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "action", ["button1"],
                                            ["[AZIONE:interact:button1:pressed]"], False, "Pulsante premuto! 🔘"))

    # Potentiometer
    for _ in range(count // 3):
        value = random.randint(0, 1023)
        texts = [f"Gira il potenziometro a {value}", f"Potenziometro {value}", f"Regola a {value}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "action", ["potentiometer1"],
                                            [f"[AZIONE:interact:potentiometer1:{value}]"], False, f"Potenziometro a {value} 📊"))

    # Light level
    for _ in range(count // 3):
        value = random.randint(0, 1023)
        texts = [f"Illumina a {value}", f"Luce {value}", f"Luminosità {value}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "action", ["photoresistor1"],
                                            [f"[AZIONE:interact:photoresistor1:{value}]"], False, f"Luce impostata 💡"))

    return examples

def generate_c8(count: int = 600) -> List[Dict]:
    """C8: Tutor/Theory"""
    examples = []

    # Theory questions
    questions = [
        "Cos'è un LED?", "Come funziona un resistore?", "Spiega la legge di Ohm",
        "Cosa significa corrente?", "Differenza tra tensione e corrente?",
        "Come funziona un circuito?", "Cosa è un pin digitale?", "Analogo vs digitale?",
        "Come si disegna un circuito?", "Cosa è un transistor?", "Come funzionano i diodi?",
        "Cosa è un servo?", "Come funzionano i buzzer?", "Cosa è PWM?", "Come leggere il codice?"
    ]
    for _ in range(count // 3):
        text = introduce_typos(random.choice(questions))
        examples.append(make_training_example(text, "tutor", [], [], True,
                                            llm_hint=f"Spiega in modo semplice: {text}"))

    # Greetings
    greetings = ["Ciao!", "Come stai?", "Chi sei?", "Salve", "Ehy", "Ciaoo"]
    for _ in range(count // 6):
        text = introduce_typos(random.choice(greetings))
        examples.append(make_training_example(text, "tutor", [], [], False,
                                            response="Ciao! Sono il tuo tutor virtuale 👋"))

    # Off-topic
    offtopic = ["Che tempo fa?", "Mi racconti una barzelletta?", "Qual è il tuo colore preferito?",
                "Parli altre lingue?", "Dove abiti?", "Quanto anni hai?"]
    for _ in range(count // 6):
        text = introduce_typos(random.choice(offtopic))
        examples.append(make_training_example(text, "tutor", [], [], True,
                                            llm_hint=f"Rispondi amichevolmente: {text}"))

    # Help requests
    helps = ["Aiutami", "Ho bisogno di aiuto", "Non capisco", "Guidami", "Help!", "SOS"]
    for _ in range(count // 6):
        text = introduce_typos(random.choice(helps))
        examples.append(make_training_example(text, "tutor", [], [], True,
                                            llm_hint="Offri aiuto step-by-step"))

    return examples

def generate_c9(count: int = 300) -> List[Dict]:
    """C9: Removal/Modification"""
    examples = []

    # Remove component
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        texts = [f"Rimuovi il {comp}", f"Togliete il {comp}", f"Elimina il {comp}"]
        text = introduce_typos(random.choice(texts))
        examples.append(make_training_example(text, "circuit", [comp],
                                            [f"[AZIONE:removecomponent:{comp}]"], False, f"Rimosso ✂️"))

    # Replace component
    for _ in range(count // 3):
        comp1 = random.choice(ALL_COMPONENTS)
        comp2 = random.choice(ALL_COMPONENTS)
        text = f"Sostituisci {comp1} con {comp2}"
        examples.append(make_training_example(text, "circuit", [comp1, comp2],
                                            [f"[AZIONE:replacecomponent:{comp1}:{comp2}]"], True,
                                            llm_hint=f"Sostituisci {comp1} con {comp2}"))

    # Move component
    for _ in range(count // 3):
        comp = random.choice(ALL_COMPONENTS)
        text = f"Sposta il {comp}"
        examples.append(make_training_example(text, "circuit", [comp],
                                            [f"[AZIONE:movecomponent:{comp}:15:3]"], False, f"Spostato ↔️"))

    return examples

def generate_c10(count: int = 300) -> List[Dict]:
    """C10: Vision"""
    examples = []

    vision_reqs = [
        "Guarda il mio circuito", "Cosa vedi?", "Analizza questa foto",
        "È corretto?", "Cosa c'è che non va?", "Leggi il circuito",
        "che circuito è?", "è giusto?", "vedi errori?"
    ]

    for _ in range(count):
        text = introduce_typos(random.choice(vision_reqs))
        examples.append(make_training_example(f"{text} [IMAGE: circuit.jpg]", "vision", [],
                                            [], True, llm_hint=f"Analizza l'immagine: {text}"))

    return examples

def generate_c11(count: int = 300) -> List[Dict]:
    """C11: Memory/Context"""
    examples = []

    memory_reqs = [
        "Cosa stavo facendo?", "Dove eravamo?", "Ricordami l'esperimento",
        "Quanto ho fatto?", "Quanto ho progredito?", "Mi ricordi il circuito?",
        "cosa era quello?", "nn ricordo", "il mio progetto"
    ]

    for _ in range(count // 2):
        text = introduce_typos(random.choice(memory_reqs))
        examples.append(make_training_example(text, "tutor", [], [], True,
                                            llm_hint="Fornisci contesto sulla sessione attuale"))

    progress_reqs = [
        "Dimmi il mio progresso", "Quanti esperimenti ho completato?", "Statistiche",
        "Sono bravo?", "Come sto andando?", "ho sbagliato molto?"
    ]

    for _ in range(count // 2):
        text = introduce_typos(random.choice(progress_reqs))
        examples.append(make_training_example(text, "tutor", [], [], True,
                                            llm_hint="Analizza progresso e fornisci feedback"))

    return examples

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Generate complete dataset"""
    print("🚀 Starting ELAB Tutor Brain Dataset Generation v3...")
    print(f"📊 Target: 5000+ examples across 11 categories\n")

    all_examples = []

    generators = [
        ("C1: Simulator Actions", generate_c1, 950),
        ("C2: Component Placement", generate_c2, 700),
        ("C3: Complete Circuits", generate_c3, 550),
        ("C4: Wiring", generate_c4, 600),
        ("C5: Navigation", generate_c5, 550),
        ("C6: Code", generate_c6, 600),
        ("C7: Interactions", generate_c7, 400),
        ("C8: Theory/Tutor", generate_c8, 700),
        ("C9: Removal", generate_c9, 400),
        ("C10: Vision", generate_c10, 400),
        ("C11: Memory", generate_c11, 400),
    ]

    for cat_name, gen_func, count in generators:
        print(f"📝 {cat_name}... ", end="", flush=True)
        examples = gen_func(count)
        all_examples.extend(examples)
        print(f"✓ {len(examples)} examples")

    print(f"\n✨ Total examples generated: {len(all_examples)}")

    # Write JSONL
    output_path = "/sessions/optimistic-vibrant-feynman/mnt/VOLUME 3/PRODOTTO/elab-builder/galileo-brain-v3.jsonl"

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
    sys.exit(0 if total >= 5000 else 1)
