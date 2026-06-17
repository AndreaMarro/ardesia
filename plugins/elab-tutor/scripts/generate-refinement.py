#!/usr/bin/env python3
"""
Galileo Brain — Refinement Dataset Generator
Generates targeted training examples for weak areas identified by testing.

Usage:
    python3 scripts/generate-refinement.py --weak-area play_pause --count 50
    python3 scripts/generate-refinement.py --weak-area circuit_placement --count 30
    python3 scripts/generate-refinement.py --weak-area edge_typo --count 20
    python3 scripts/generate-refinement.py --weak-area all --count 200
    python3 scripts/generate-refinement.py --list  # Show available weak areas

(c) Andrea Marro — 06/03/2026
"""

import json
import argparse
import random
import sys
from pathlib import Path
from typing import Dict, List

OUTPUT_DIR = Path(__file__).parent.parent / "datasets"

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
}"""

# ─────────────────── CONTEXTS ───────────────────
def random_context():
    tabs = ["simulator", "manual", "video", "canvas", "editor", "taccuini", "detective", "poe", "reverse", "review"]
    volumes = [1, 2, 3]
    vol = random.choice(volumes)
    tab = random.choice(tabs)
    components_pool = ["led1", "resistor1", "pushbutton1", "buzzer1", "capacitor1", "potentiometer1",
                       "led2", "resistor2", "diode1", "mosfet1", "motor1", "servo1"]
    num_comp = random.randint(0, 5)
    comps = random.sample(components_pool, min(num_comp, len(components_pool)))
    wires = random.randint(0, num_comp * 2)
    exp = f"v{vol}-cap{random.randint(1, 13)}-esp{random.randint(1, 5)}" if random.random() > 0.3 else "nessuno"
    mode = "avr" if vol == 3 else "circuit"
    ctx = f"tab: {tab}\nesperimento: {exp}\ncomponenti: [{', '.join(comps)}]\nfili: {wires}\nvolume_attivo: {vol}"
    if vol == 3:
        ctx += f"\nsimulationMode: {mode}"
    return ctx

def make_example(user_input: str, intent: str, entities: list, actions: list,
                 needs_llm: bool, response: str = None, llm_hint: str = None,
                 context: str = None):
    if context is None:
        context = random_context()

    assistant_json = {
        "intent": intent,
        "entities": entities,
        "actions": actions,
        "needs_llm": needs_llm,
        "response": response if not needs_llm else None,
        "llm_hint": llm_hint if needs_llm else None,
    }

    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"[CONTESTO]\n{context}\n\n[MESSAGGIO]\n{user_input}"},
            {"role": "assistant", "content": json.dumps(assistant_json, ensure_ascii=True)},
        ]
    }


# ─────────────────── WEAK AREA GENERATORS ───────────────────

def gen_play_pause(count: int) -> List[Dict]:
    """Generate play/pause/reset/clearall action examples."""
    examples = []
    play_phrases = [
        "vai!", "parti!", "accendi tutto", "prova il circuito", "manda corrente",
        "fai vedere se funziona", "dai corrente al circuito", "alimenta il circuito",
        "inizia", "comincia", "esegui", "run", "go", "via!", "fai partire",
        "attiva il circuito", "prova a vedere", "fammi vedere se va",
        "dai energia", "accendiamo", "proviamo!", "esegui la simulazione",
        "metti in moto", "dai il via", "lancia la simulazione",
    ]
    pause_phrases = [
        "basta", "stop", "fermati", "metti in pausa", "blocca",
        "stoppalo", "interrompi", "aspetta", "non andare avanti", "halt",
        "tieni fermo", "pausa!", "stoppa", "sospendi", "freeze",
    ]
    reset_phrases = [
        "ricomincia", "riavvia", "ripristina", "da capo", "rifai da zero",
        "restart", "resetta il circuito", "torna all'inizio", "riparti",
        "azzera", "ricarica", "riportalo allo stato iniziale",
    ]
    clearall_phrases = [
        "pulisci", "cancella tutto", "svuota", "elimina tutto",
        "togli tutti i componenti", "ripulisci la breadboard",
        "sgombra il piano", "via tutto", "fai tabula rasa",
        "rimuovi tutto dal circuito", "smonta tutto",
    ]

    for _ in range(count):
        r = random.random()
        if r < 0.3:
            phrase = random.choice(play_phrases)
            examples.append(make_example(phrase, "action", [], ["[AZIONE:play]"], False, "Simulazione avviata!"))
        elif r < 0.55:
            phrase = random.choice(pause_phrases)
            examples.append(make_example(phrase, "action", [], ["[AZIONE:pause]"], False, "Simulazione in pausa."))
        elif r < 0.75:
            phrase = random.choice(reset_phrases)
            examples.append(make_example(phrase, "action", [], ["[AZIONE:reset]"], False, "Circuito resettato."))
        else:
            phrase = random.choice(clearall_phrases)
            examples.append(make_example(phrase, "action", [], ["[AZIONE:clearall]"], False, "Breadboard svuotata."))

    return examples


def gen_circuit_placement(count: int) -> List[Dict]:
    """Generate circuit placement examples with INTENT tags."""
    examples = []
    components = [
        ("led", "LED", ["anode", "cathode"]),
        ("resistor", "resistore", ["pin1", "pin2"]),
        ("push-button", "pulsante", ["pin1", "pin2"]),
        ("buzzer-piezo", "buzzer", ["positive", "negative"]),
        ("capacitor", "condensatore", ["positive", "negative"]),
        ("potentiometer", "potenziometro", ["vcc", "signal", "gnd"]),
        ("photo-resistor", "fotoresistenza", ["pin1", "pin2"]),
        ("diode", "diodo", ["anode", "cathode"]),
        ("mosfet-n", "MOSFET", ["gate", "drain", "source"]),
        ("rgb-led", "LED RGB", ["red", "common", "green", "blue"]),
        ("motor-dc", "motore DC", ["positive", "negative"]),
        ("servo", "servomotore", ["signal", "vcc", "gnd"]),
        ("reed-switch", "reed switch", ["pin1", "pin2"]),
        ("phototransistor", "fototransistor", ["collector", "emitter"]),
    ]

    single_templates = [
        "Metti un {name}", "Aggiungi un {name}", "Piazza un {name}",
        "Inserisci un {name}", "Mettimi un {name}", "Voglio un {name}",
        "Posiziona un {name}", "Dammi un {name}",
    ]
    multi_templates = [
        "Costruisci un circuito con {comp1} e {comp2}",
        "Metti un {comp1}, un {comp2} e un {comp3}",
        "Aggiungi {comp1} con {comp2}",
        "Voglio {comp1} e {comp2} sulla breadboard",
    ]

    for _ in range(count):
        if random.random() < 0.6:
            # Single component
            comp = random.choice(components)
            template = random.choice(single_templates)
            phrase = template.format(name=comp[1])
            intent_json = json.dumps({"action": "place_and_wire", "components": [{"type": comp[0]}], "wires": "auto"}, ensure_ascii=True)
            examples.append(make_example(phrase, "circuit", [comp[0]], [f"[INTENT:{intent_json}]"], False,
                                         f"{comp[1]} aggiunto alla breadboard."))
        else:
            # Multi component
            selected = random.sample(components, min(random.randint(2, 4), len(components)))
            names = [c[1] for c in selected]
            if len(names) == 2:
                phrase = random.choice(multi_templates[:2]).format(comp1=names[0], comp2=names[1])
            else:
                phrase = f"Costruisci un circuito con {', '.join(names[:-1])} e {names[-1]}"

            intent_comps = [{"type": selected[0][0]}]
            for i, c in enumerate(selected[1:]):
                intent_comps.append({"type": c[0], "near": f"{selected[0][0]}_NEW_0", "relation": "right"})
            intent_json = json.dumps({"action": "place_and_wire", "components": intent_comps, "wires": "auto"}, ensure_ascii=True)
            entities = [c[0] for c in selected]
            examples.append(make_example(phrase, "circuit", entities, [f"[INTENT:{intent_json}]"], False,
                                         f"Circuito con {', '.join(names)} creato."))

    return examples


def gen_navigation(count: int) -> List[Dict]:
    """Generate navigation examples (tabs, experiments, volumes)."""
    examples = []
    tab_map = {
        "simulator": ["simulatore", "sim", "circuito", "breadboard"],
        "manual": ["manuale", "libro", "pdf", "guida"],
        "video": ["video", "youtube", "tutorial video", "filmato"],
        "canvas": ["lavagna", "disegno", "canvas", "whiteboard"],
        "editor": ["editor", "codice", "programmazione", "ide"],
        "taccuini": ["taccuini", "appunti", "note", "notebook"],
        "detective": ["detective", "trova il bug", "investigatore"],
        "poe": ["POE", "predici osserva spiega", "predizione"],
        "reverse": ["reverse engineering", "reverse", "ingegneria inversa"],
        "review": ["review", "revisione", "controlla circuito"],
    }
    open_phrases = ["Apri", "Vai a", "Portami a", "Mostrami", "Andiamo a", "Apri il/la/i"]

    for _ in range(count):
        r = random.random()
        if r < 0.5:
            # Tab navigation
            tab_key = random.choice(list(tab_map.keys()))
            synonyms = tab_map[tab_key]
            synonym = random.choice(synonyms)
            opener = random.choice(open_phrases)
            phrase = f"{opener} {synonym}"
            examples.append(make_example(phrase, "navigation", [], [f"[AZIONE:opentab:{tab_key}]"], False,
                                         f"Tab {tab_key} aperto."))
        elif r < 0.8:
            # Load experiment
            vol = random.randint(1, 3)
            cap = random.randint(1, 13)
            esp = random.randint(1, 5)
            exp_id = f"v{vol}-cap{cap}-esp{esp}"
            phrases = [
                f"Carica l'esperimento {exp_id}",
                f"Apri capitolo {cap} esperimento {esp} del volume {vol}",
                f"Carica cap {cap} esp {esp}",
                f"Voglio fare il capitolo {cap}",
            ]
            phrase = random.choice(phrases)
            examples.append(make_example(phrase, "navigation", [], [f"[AZIONE:loadexp:{exp_id}]"], False,
                                         f"Esperimento {exp_id} caricato."))
        else:
            # Volume
            vol = random.randint(1, 3)
            phrases = [
                f"Apri il volume {vol}",
                f"Vai al volume {vol}",
                f"Mostrami il volume {vol}",
            ]
            phrase = random.choice(phrases)
            examples.append(make_example(phrase, "navigation", [], [f"[AZIONE:openvolume:{vol}]"], False,
                                         f"Volume {vol} aperto."))

    return examples


def gen_tutor_theory(count: int) -> List[Dict]:
    """Generate tutor/theory examples (needs_llm=true)."""
    examples = []
    theory_questions = [
        ("Come funziona un LED?", ["led"], "Spiegazione sul funzionamento dei LED"),
        ("Cos'e una resistenza?", ["resistor"], "Spiegazione sulle resistenze"),
        ("Spiegami la legge di Ohm", [], "Spiegazione legge di Ohm V=IR"),
        ("Qual e la differenza tra serie e parallelo?", [], "Confronto circuiti serie vs parallelo"),
        ("Come funziona un condensatore?", ["capacitor"], "Spiegazione condensatori"),
        ("A cosa serve un diodo?", ["diode"], "Spiegazione diodi e rettificazione"),
        ("Cos'e il PWM?", [], "Spiegazione modulazione larghezza impulso"),
        ("Come si calcola la corrente?", [], "Calcolo corrente con legge di Ohm"),
        ("Cosa succede se collego il LED al contrario?", ["led"], "Polarita LED e rischi"),
        ("Perche servono le resistenze con i LED?", ["led", "resistor"], "Limitazione corrente LED"),
        ("Cos'e la tensione?", [], "Spiegazione tensione elettrica"),
        ("Come funziona un MOSFET?", ["mosfet-n"], "Spiegazione transistor MOSFET"),
        ("Cosa fa un potenziometro?", ["potentiometer"], "Spiegazione potenziometri"),
        ("Cos'e la corrente continua?", [], "Spiegazione DC vs AC"),
        ("Come si legge il codice colori delle resistenze?", ["resistor"], "Codice colori resistenze"),
        ("Che differenza c'e tra analogico e digitale?", [], "Segnali analogici vs digitali"),
        ("Cos'e un circuito chiuso?", [], "Circuiti aperti e chiusi"),
        ("Come funziona un fotoresistore?", ["photo-resistor"], "Spiegazione fotoresistenze"),
        ("Perche il buzzer fa rumore?", ["buzzer-piezo"], "Funzionamento piezoelettrico"),
        ("Cos'e un cortocircuito?", [], "Spiegazione e pericoli dei cortocircuiti"),
    ]
    greetings = [
        ("Ciao!", "Saluto dello studente"),
        ("Come stai?", "Saluto informale"),
        ("Buongiorno Galileo!", "Saluto formale"),
        ("Eccomi!", "Studente che torna"),
    ]
    off_topics = [
        ("Che tempo fa?", "Domanda off-topic meteo"),
        ("Chi ha vinto la partita?", "Domanda off-topic sport"),
        ("Raccontami una barzelletta", "Richiesta intrattenimento"),
        ("Puoi fare i compiti di italiano?", "Richiesta fuori ambito"),
        ("Chi sei?", "Domanda identita"),
    ]

    for _ in range(count):
        r = random.random()
        if r < 0.65:
            q, entities, hint = random.choice(theory_questions)
            examples.append(make_example(q, "tutor", entities, [], True, llm_hint=hint))
        elif r < 0.85:
            q, hint = random.choice(greetings)
            examples.append(make_example(q, "tutor", [], [], True, llm_hint=hint))
        else:
            q, hint = random.choice(off_topics)
            examples.append(make_example(q, "tutor", [], [], True, llm_hint=hint))

    return examples


def gen_vision(count: int) -> List[Dict]:
    """Generate vision examples (needs_llm=true)."""
    examples = []
    vision_phrases = [
        ("Cosa vedi nel mio circuito?", "Analisi visiva del circuito dello studente"),
        ("Guarda il mio circuito", "Richiesta analisi visiva"),
        ("Controlla il mio lavoro", "Verifica visiva del montaggio"),
        ("E giusto il collegamento?", "Verifica correttezza cablaggio"),
        ("Analizza la mia breadboard", "Analisi completa breadboard"),
        ("Ho montato bene?", "Verifica montaggio componenti"),
        ("Guarda cosa ho disegnato", "Analisi disegno su canvas"),
        ("Il LED non si accende, guarda", "Debug visivo circuito"),
        ("Scatta uno screenshot", "Cattura schermata per analisi"),
        ("Descrivi il mio circuito", "Descrizione visiva componenti"),
        ("Confronta con il libro", "Confronto con schema atteso"),
        ("Fai una foto e dimmi se va bene", "Screenshot + verifica"),
        ("Guarda e correggilo se serve", "Vision + azione correttiva"),
        ("Ho messo il diodo nel verso giusto?", "Verifica polarita visiva"),
        ("Vedi qualche errore?", "Ricerca errori visiva"),
    ]

    for _ in range(count):
        phrase, hint = random.choice(vision_phrases)
        examples.append(make_example(phrase, "vision", [], [], True, llm_hint=hint))

    return examples


def gen_code(count: int) -> List[Dict]:
    """Generate code examples (setcode, compile, scratch)."""
    examples = []
    code_examples = [
        ("Scrivi il codice per accendere il LED", "code", ["[AZIONE:setcode:void setup(){pinMode(13,OUTPUT);digitalWrite(13,HIGH);}void loop(){}]"], False, "Codice caricato nell'editor."),
        ("Programma il blink", "code", ["[AZIONE:setcode:void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);delay(1000);digitalWrite(13,LOW);delay(1000);}]"], False, "Codice blink caricato."),
        ("Il codice non compila", "code", [], True, None),
        ("Errore: was not declared in this scope", "code", [], True, None),
        ("Cosa fa pinMode?", "code", [], True, None),
        ("Come si usa analogRead?", "code", [], True, None),
        ("Apri l'editor a blocchi", "code", ["[AZIONE:openeditor]", "[AZIONE:switcheditor:scratch]"], False, "Editor Scratch aperto."),
        ("Torna al codice Arduino", "code", ["[AZIONE:switcheditor:arduino]"], False, "Editor Arduino attivo."),
        ("Scrivi void setup con Serial.begin", "code", ["[AZIONE:setcode:void setup(){Serial.begin(9600);}void loop(){Serial.println(analogRead(A0));delay(100);}]"], False, "Codice Serial Monitor caricato."),
        ("Programma il fade con PWM", "code", ["[AZIONE:setcode:int led=9;void setup(){pinMode(led,OUTPUT);}void loop(){for(int i=0;i<256;i++){analogWrite(led,i);delay(10);}for(int i=255;i>=0;i--){analogWrite(led,i);delay(10);}}]"], False, "Codice fade PWM caricato."),
    ]

    for _ in range(count):
        phrase, intent, actions, needs_llm, resp = random.choice(code_examples)
        if needs_llm:
            examples.append(make_example(phrase, intent, [], actions, True, llm_hint=f"Aiuto con: {phrase}",
                                         context=random_context()))
        else:
            examples.append(make_example(phrase, intent, [], actions, False, response=resp,
                                         context=random_context()))

    return examples


def gen_edge_typo(count: int) -> List[Dict]:
    """Generate edge case examples with typos, slang, mixed language."""
    examples = []
    typo_examples = [
        ("costrusci un cirquito", "circuit", False, "Circuito in costruzione."),
        ("aviva la simulazzione", "action", False, "Simulazione avviata!"),
        ("mettti un leddd", "circuit", False, "LED aggiunto."),
        ("fermma la simullazione", "action", False, "Simulazione in pausa."),
        ("reseta tuto", "action", False, "Circuito resettato."),
        ("conpila il codise", "action", False, "Compilazione avviata."),
        ("dove sta il ressitore?", "action", False, "Resistore evidenziato."),
    ]
    slang = [
        ("buttaci un LED", "circuit", False, "LED aggiunto."),
        ("fallo andare", "action", False, "Simulazione avviata!"),
        ("toglimi sto coso", "action", False, "Componente rimosso."),
        ("che roba e quella?", "tutor", True, None),
    ]
    english = [
        ("run the simulation", "action", False, "Simulazione avviata!"),
        ("add a LED", "circuit", False, "LED aggiunto."),
        ("stop", "action", False, "Simulazione in pausa."),
        ("reset", "action", False, "Circuito resettato."),
        ("compile", "action", False, "Compilazione avviata."),
    ]

    pool = typo_examples + slang + english
    for _ in range(count):
        phrase, intent, needs_llm, resp = random.choice(pool)
        if intent == "action" and "avvi" in phrase.lower() or "run" in phrase.lower() or "andare" in phrase.lower():
            actions = ["[AZIONE:play]"]
        elif intent == "action" and ("ferm" in phrase.lower() or "stop" in phrase.lower()):
            actions = ["[AZIONE:pause]"]
        elif intent == "action" and "reset" in phrase.lower():
            actions = ["[AZIONE:reset]"]
        elif intent == "action" and "compil" in phrase.lower():
            actions = ["[AZIONE:compile]"]
        elif intent == "action" and "evidenzia" in phrase.lower() or "dove" in phrase.lower():
            actions = ["[AZIONE:highlight:resistor1]"]
        elif intent == "circuit":
            actions = ['[INTENT:{"action":"place_and_wire","components":[{"type":"led"}],"wires":"auto"}]']
        else:
            actions = []

        if needs_llm:
            examples.append(make_example(phrase, intent, [], actions, True, llm_hint=f"Interpretare: {phrase}"))
        else:
            examples.append(make_example(phrase, intent, [], actions, False, response=resp))

    return examples


def gen_multi_action(count: int) -> List[Dict]:
    """Generate multi-action chain examples."""
    examples = []
    chains = [
        ("Pulisci tutto e avvia", ["[AZIONE:clearall]", "[AZIONE:play]"], "action", "Breadboard pulita e simulazione avviata."),
        ("Resetta e riparti", ["[AZIONE:reset]", "[AZIONE:play]"], "action", "Circuito resettato e riavviato."),
        ("Compila e avvia", ["[AZIONE:compile]", "[AZIONE:play]"], "action", "Codice compilato e simulazione avviata."),
        ("Ferma e resetta", ["[AZIONE:pause]", "[AZIONE:reset]"], "action", "Simulazione fermata e resettata."),
        ("Pulisci tutto, metti un LED e avvia", ["[AZIONE:clearall]", '[INTENT:{"action":"place_and_wire","components":[{"type":"led"}],"wires":"auto"}]', "[AZIONE:play]"], "action", "Tutto pulito, LED piazzato e simulazione avviata."),
    ]

    for _ in range(count):
        phrase, actions, intent, resp = random.choice(chains)
        examples.append(make_example(phrase, intent, [], actions, False, response=resp))

    return examples


# ─────────────────── WEAK AREA REGISTRY ───────────────────

WEAK_AREAS = {
    "play_pause": ("Play/Pause/Reset/Clearall action tags", gen_play_pause),
    "circuit_placement": ("Circuit placement with INTENT tags", gen_circuit_placement),
    "navigation": ("Tab/experiment/volume navigation", gen_navigation),
    "tutor_theory": ("Tutor theory and off-topic handling", gen_tutor_theory),
    "vision": ("Vision/screenshot requests", gen_vision),
    "code": ("Code/Scratch/compile actions", gen_code),
    "edge_typo": ("Typos, slang, mixed language", gen_edge_typo),
    "multi_action": ("Multi-action chains", gen_multi_action),
    "all": ("All weak areas combined (balanced)", None),
}


# ─────────────────── CLI ───────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate refinement training data for weak areas")
    parser.add_argument("--weak-area", required=False, help="Weak area to target (use --list to see options)")
    parser.add_argument("--count", type=int, default=50, help="Number of examples to generate (default: 50)")
    parser.add_argument("--output", help="Output JSONL file (default: datasets/refinement-AREA.jsonl)")
    parser.add_argument("--list", action="store_true", help="List available weak areas")
    args = parser.parse_args()

    if args.list:
        print("\nAvailable weak areas:")
        for key, (desc, _) in WEAK_AREAS.items():
            print(f"  {key:25s} — {desc}")
        sys.exit(0)

    if not args.weak_area:
        print("ERROR: --weak-area required (use --list to see options)")
        sys.exit(1)

    area = args.weak_area
    if area not in WEAK_AREAS:
        print(f"ERROR: Unknown weak area '{area}'. Use --list to see options.")
        sys.exit(1)

    # Generate examples
    if area == "all":
        per_area = max(args.count // (len(WEAK_AREAS) - 1), 5)
        examples = []
        for key, (desc, gen_fn) in WEAK_AREAS.items():
            if key == "all":
                continue
            batch = gen_fn(per_area)
            examples.extend(batch)
            print(f"  Generated {len(batch)} examples for {key}")
        random.shuffle(examples)
    else:
        _, gen_fn = WEAK_AREAS[area]
        examples = gen_fn(args.count)

    # Validate
    valid = 0
    for ex in examples:
        try:
            assistant_content = ex["messages"][2]["content"]
            parsed = json.loads(assistant_content)
            assert "intent" in parsed
            valid += 1
        except Exception:
            pass

    print(f"\n  Generated {len(examples)} examples ({valid} valid JSON)")

    # Save
    output_path = args.output or str(OUTPUT_DIR / f"refinement-{area}.jsonl")
    with open(output_path, "w", encoding="utf-8") as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=True) + "\n")

    print(f"  Saved to: {output_path}")
    print(f"\n  To merge with main dataset:")
    print(f"  cat {output_path} >> datasets/galileo-brain-v2.jsonl")
