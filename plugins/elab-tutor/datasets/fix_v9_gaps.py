#!/usr/bin/env python3
"""
Fix all v9 dataset gaps:
1. Add missing action tags (addcomponent, highlight, nextstep, prevstep)
2. Boost vision to ≥7% via oversampling existing + generating new
3. Fix response repetition by diversifying {component} placeholders
4. Add missing components to entities (annotation, breadboard, nano-r4-board)
"""
import json
import random
import hashlib
from pathlib import Path
from collections import Counter

random.seed(2026_03_20)

BASE_DIR = Path(__file__).parent
V9_PATH = BASE_DIR / "galileo-brain-v9.jsonl"


def load_dataset():
    with open(V9_PATH) as f:
        return [json.loads(line) for line in f]


def save_dataset(dataset):
    random.shuffle(dataset)
    with open(V9_PATH, "w") as f:
        for ex in dataset:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    print(f"  Saved {len(dataset):,} examples to {V9_PATH.name}")


def get_system_prompt(dataset):
    """Extract system prompt from existing examples."""
    return dataset[0]["messages"][0]["content"]


def make_example(system_prompt, user_msg, output_dict, context=None):
    """Create a ChatML example."""
    if context:
        full_user = f"{context}\n\n[MESSAGGIO]\n{user_msg}"
    else:
        full_user = user_msg
    return {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_user},
            {"role": "assistant", "content": json.dumps(output_dict, ensure_ascii=False)},
        ]
    }


def random_context():
    """Generate a random simulator context."""
    TABS = ["simulator", "editor", "notebooks", "canvas", "video", "manual"]
    VOLUMES = [1, 2, 3]
    EXPERIMENTS = [
        "v1-cap6-primo-circuito", "v1-cap6-led-rosso", "v1-cap7-rgb-base",
        "v1-cap8-pulsante-led", "v1-cap9-dimmer", "v1-cap10-ldr-base",
        "v1-cap11-buzzer", "v1-cap12-reed-base", "v1-cap13-diodo-base",
        "v2-cap6-led-avanzato", "v2-cap8-mosfet-base", "v2-cap10-motordc-base",
        "v2-cap11-servo-base", "v2-cap12-lcd-base",
        "v3-cap6-led-blink", "v3-cap6-led-fade", "v3-cap7-pulsante-digitale",
        "v3-cap8-analog-read", "v3-cap8-servo-pot",
    ]
    COMPONENTS_POOL = [
        "led1", "resistor1", "push-button1", "buzzer-piezo1",
        "potentiometer1", "servo1", "lcd16x21", "nano-r4-board1",
    ]

    tab = random.choice(TABS)
    vol = random.choice(VOLUMES)
    exp = random.choice(EXPERIMENTS)
    n_comp = random.randint(0, 5)
    components = random.sample(COMPONENTS_POOL, min(n_comp, len(COMPONENTS_POOL)))
    sim = random.choice(["running", "stopped", "paused"])
    build = random.choice(["passopasso", "sandbox", "giamontato"])
    editor = random.choice(["scratch", "arduino"])

    return (
        f"[CONTESTO]\n"
        f"tab: {tab}\n"
        f"esperimento: {exp}\n"
        f"componenti: [{', '.join(components)}]\n"
        f"fili: {random.randint(0, 8)}\n"
        f"volume_attivo: {vol}\n"
        f"simulazione: {sim}\n"
        f"build_mode: {build}\n"
        f"editor_mode: {editor}\n"
        f"codice_presente: {'true' if random.random() > 0.5 else 'false'}"
    )


# ═══════════════════════════════════════════════════════════════
# FIX 1: Missing action tags
# ═══════════════════════════════════════════════════════════════
def fix_missing_action_tags(dataset, system_prompt):
    """Add examples for addcomponent, highlight, nextstep, prevstep."""
    print("\n── FIX 1: Missing Action Tags ──")

    new_examples = []

    # --- addcomponent ---
    addcomp_phrases = [
        ("metti un LED", "led", "LED in posizione!"),
        ("aggiungi una resistenza", "resistor", "Resistenza aggiunta!"),
        ("metti un buzzer", "buzzer-piezo", "Buzzer sulla breadboard!"),
        ("aggiungi un pulsante", "push-button", "Pulsante posizionato!"),
        ("metti un condensatore", "capacitor", "Condensatore aggiunto!"),
        ("aggiungi un potenziometro", "potentiometer", "Potenziometro in posizione!"),
        ("metti un servo", "servo", "Servo pronto!"),
        ("aggiungi un motore", "motor-dc", "Motore posizionato!"),
        ("metti un display LCD", "lcd16x2", "LCD sulla breadboard!"),
        ("aggiungi un fotoresistore", "photo-resistor", "Fotoresistore aggiunto!"),
        ("metti un diodo", "diode", "Diodo in posizione!"),
        ("aggiungi un mosfet", "mosfet-n", "MOSFET posizionato!"),
        ("metti un LED RGB", "rgb-led", "LED RGB pronto!"),
        ("aggiungi un reed switch", "reed-switch", "Reed switch aggiunto!"),
        ("metti un fototransistor", "phototransistor", "Fototransistor in posizione!"),
        ("aggiungi una batteria", "battery9v", "Batteria collegata!"),
        ("metti il multimetro", "multimeter", "Multimetro pronto!"),
        ("aggiungi la breadboard", "breadboard-full", "Breadboard posizionata!"),
        ("metti la mezza breadboard", "breadboard-half", "Mezza breadboard pronta!"),
        ("aggiungi un'annotazione", "annotation", "Annotazione aggiunta!"),
        ("metti Arduino", "nano-r4-board", "Arduino Nano in posizione!"),
        ("voglio un LED rosso", "led", "Ecco il LED rosso!"),
        ("dammi una resistenza da 220 ohm", "resistor", "Eccola la resistenza!"),
        ("piazza un pulsante", "push-button", "Pulsante piazzato!"),
        ("monta un buzzer", "buzzer-piezo", "Buzzer montato!"),
    ]

    addcomp_slang = [
        ("mettimi un led", "led"), ("voglio il led", "led"),
        ("la lucina per favore", "led"), ("aggiungi la lucetta", "led"),
        ("metti la resistenza", "resistor"), ("dammi la res", "resistor"),
        ("quella con le strisce", "resistor"), ("il bottone", "push-button"),
        ("metti il tastino", "push-button"), ("aggiungi il coso che suona", "buzzer-piezo"),
        ("il beep", "buzzer-piezo"), ("la rotella", "potentiometer"),
        ("il coso della luce", "photo-resistor"), ("la scheda arduino", "nano-r4-board"),
        ("la basetta", "breadboard-full"), ("il tester", "multimeter"),
        ("il motorino", "motor-dc"), ("il braccetto", "servo"),
        ("lo schermino", "lcd16x2"), ("il coso con 3 gambe", "mosfet-n"),
    ]

    responses = [
        "Ecco, posizionato!", "In posizione!", "Aggiunto!", "Eccolo!",
        "Fatto! Sulla breadboard.", "Piazzato!", "Montato!", "Ci siamo!",
        "Pronto!", "Eccolo qua!", "Via, in posizione!", "Tac!",
    ]

    for phrase, comp, resp in addcomp_phrases:
        for _ in range(30):  # 30 context variants each
            ctx = random_context()
            out = {
                "intent": "circuit",
                "entities": [comp],
                "actions": [f"[AZIONE:addcomponent:{comp}]"],
                "needs_llm": False,
                "response": random.choice(responses),
                "llm_hint": None,
            }
            new_examples.append(make_example(system_prompt, phrase, out, ctx))

    for phrase, comp in addcomp_slang:
        for _ in range(20):
            ctx = random_context()
            out = {
                "intent": "circuit",
                "entities": [comp],
                "actions": [f"[AZIONE:addcomponent:{comp}]"],
                "needs_llm": False,
                "response": random.choice(responses),
                "llm_hint": None,
            }
            new_examples.append(make_example(system_prompt, phrase, out, ctx))

    print(f"  addcomponent: {len(new_examples)} examples")

    # --- highlight ---
    highlight_phrases = [
        "mostrami dove sta il LED", "evidenzia la resistenza", "indicami il buzzer",
        "dov'e' il potenziometro?", "mostrami il pulsante", "trova il condensatore",
        "evidenzia il servo", "mostrami il motore", "dov'e' il display?",
        "indicami il diodo", "trova il fotoresistore", "mostrami il mosfet",
        "evidenzia il LED RGB", "dov'e' il reed switch?", "trova Arduino",
        "mostrami dov'e'", "fammelo vedere", "indicamelo", "illuminalo",
        "dove lo trovo?", "quale componente e'?", "mostra il componente",
    ]
    highlight_comps = [
        "led", "resistor", "buzzer-piezo", "potentiometer", "push-button",
        "capacitor", "servo", "motor-dc", "lcd16x2", "diode",
        "photo-resistor", "mosfet-n", "rgb-led", "reed-switch", "nano-r4-board",
    ]

    hl_responses = [
        "Eccolo, te lo evidenzio!", "Guarda qui!", "Lo illumino per te!",
        "Vedi? E' questo.", "Eccolo evidenziato.", "Te lo mostro!",
        "Guarda dove lampeggia!", "Ecco, lo vedi ora?", "Evidenziato!",
        "Tac! Eccolo illuminato.", "Lo trovi qui.", "Eccolo!",
    ]

    n_hl = 0
    for phrase in highlight_phrases:
        comp = random.choice(highlight_comps)
        for _ in range(30):
            ctx = random_context()
            out = {
                "intent": "action",
                "entities": [comp],
                "actions": [f"[AZIONE:highlight:{comp}]"],
                "needs_llm": False,
                "response": random.choice(hl_responses),
                "llm_hint": None,
            }
            new_examples.append(make_example(system_prompt, phrase, out, ctx))
            n_hl += 1
    print(f"  highlight: {n_hl} examples")

    # --- nextstep / prevstep ---
    next_phrases = [
        "avanti", "prossimo passo", "vai avanti", "next", "continua",
        "passo successivo", "prossimo", "avanti un passo", "step successivo",
        "e adesso?", "cosa devo fare ora?", "passo dopo", "prosegui",
        "continua col montaggio", "vai al prossimo", "avanza",
        "fammi vedere il prossimo passo", "avanti con la guida",
    ]
    prev_phrases = [
        "indietro", "passo precedente", "torna indietro", "back", "previous",
        "rifai il passo prima", "torna al passo precedente", "step precedente",
        "passo prima", "torna un passo", "ripetimi il passo", "rivediamo",
    ]

    step_next_responses = [
        "Ecco il prossimo passo!", "Avanti!", "Passo successivo!",
        "Si va avanti!", "Next!", "Proseguiamo!", "Ecco cosa fare ora.",
        "Prossimo passo — pronti?", "Avanti un passo!",
    ]
    step_prev_responses = [
        "Torno al passo precedente.", "Un passo indietro.", "Ecco il passo prima.",
        "Step precedente!", "Rivediamo il passo prima.", "Ok, torno indietro.",
    ]

    n_next = n_prev = 0
    for phrase in next_phrases:
        for _ in range(35):
            ctx = random_context()
            out = {
                "intent": "navigation",
                "entities": [],
                "actions": ["[AZIONE:nextstep]"],
                "needs_llm": False,
                "response": random.choice(step_next_responses),
                "llm_hint": None,
            }
            new_examples.append(make_example(system_prompt, phrase, out, ctx))
            n_next += 1

    for phrase in prev_phrases:
        for _ in range(45):
            ctx = random_context()
            out = {
                "intent": "navigation",
                "entities": [],
                "actions": ["[AZIONE:prevstep]"],
                "needs_llm": False,
                "response": random.choice(step_prev_responses),
                "llm_hint": None,
            }
            new_examples.append(make_example(system_prompt, phrase, out, ctx))
            n_prev += 1

    print(f"  nextstep: {n_next}, prevstep: {n_prev}")
    print(f"  Total FIX 1: {len(new_examples)} new examples")
    return new_examples


# ═══════════════════════════════════════════════════════════════
# FIX 2: Boost vision to ≥7%
# ═══════════════════════════════════════════════════════════════
def fix_vision(dataset, system_prompt):
    """Oversample existing vision examples to reach 7%."""
    print("\n── FIX 2: Vision Boost ──")

    total = len(dataset)
    vision_examples = []
    for ex in dataset:
        try:
            out = json.loads(ex["messages"][2]["content"])
            if out.get("intent") == "vision":
                vision_examples.append(ex)
        except Exception:
            pass

    current_vision = len(vision_examples)
    target_vision = int(total * 0.075)  # aim for 7.5% to have margin
    needed = target_vision - current_vision

    print(f"  Current vision: {current_vision} ({100*current_vision/total:.1f}%)")
    print(f"  Target: {target_vision} (7.5%)")
    print(f"  Need to add: {needed}")

    if needed <= 0:
        print("  Already at target!")
        return []

    # Generate new vision examples with different contexts
    new_vision_phrases = [
        "guarda il mio circuito",
        "analizza questo circuito",
        "cosa vedi?",
        "controlla la mia foto",
        "vedi qualcosa di sbagliato?",
        "il circuito e' giusto?",
        "guarda se va bene",
        "check visivo",
        "screenshot del circuito",
        "mostrami cosa non va",
        "verifica visivamente",
        "dai un'occhiata",
        "guarda qui",
        "vedi il mio lavoro",
        "foto del circuito",
        "analizza la foto",
        "controlla visivamente",
        "cosa c'e' nella foto?",
        "descrivi quello che vedi",
        "che circuito e' questo nella foto?",
        "il mio circuito nella foto funziona?",
        "guarda lo screenshot",
        "analizza questa immagine",
        "cosa vedi nel mio circuito?",
        "dimmi cosa c'e' di sbagliato guardando",
    ]

    vision_hints = [
        "Analisi visiva del circuito. Descrivi i componenti visibili, i collegamenti, e possibili errori.",
        "Vision: lo studente mostra il circuito. Verifica: componenti corretti? Fili collegati bene? Polarita'?",
        "Analisi screenshot. Identifica componenti, descrivi lo stato (LED acceso/spento), suggerisci correzioni.",
        "Foto circuito. Cerca errori comuni: fili scollegati, componenti al contrario, breadboard mal usata.",
        "Analisi visiva. Confronta con lo schema dell'esperimento. Evidenzia differenze e suggerisci fix.",
        "Vision del circuito fisico. Identifica tipo di breadboard, componenti, fili. Verifica correttezza.",
        "Screenshot analisi. Guarda il canvas del simulatore e descrivi cosa vedi in modo semplice.",
    ]

    new_examples = []
    seen = set()
    while len(new_examples) < needed:
        phrase = random.choice(new_vision_phrases)
        ctx = random_context()
        hint = random.choice(vision_hints)

        out = {
            "intent": "vision",
            "entities": [],
            "actions": ["[AZIONE:screenshot]"],
            "needs_llm": True,
            "response": None,
            "llm_hint": hint,
        }

        full_user = f"{ctx}\n\n[MESSAGGIO]\n{phrase}"
        h = hashlib.md5(full_user.encode()).hexdigest()
        if h in seen:
            continue
        seen.add(h)

        new_examples.append(make_example(system_prompt, phrase, out, ctx))

    print(f"  Generated: {len(new_examples)} new vision examples")
    return new_examples


# ═══════════════════════════════════════════════════════════════
# FIX 3: Response diversity
# ═══════════════════════════════════════════════════════════════
def fix_response_diversity(dataset):
    """Replace the most repeated responses with varied alternatives."""
    print("\n── FIX 3: Response Diversity ──")

    response_counts = Counter()
    for ex in dataset:
        try:
            out = json.loads(ex["messages"][2]["content"])
            resp = out.get("response", "")
            response_counts[resp] += 1
        except Exception:
            pass

    # Find responses with unreplaced {component} placeholders
    placeholders = [r for r, c in response_counts.items() if r and "{component}" in r and c > 100]
    print(f"  Responses with {{component}} placeholder: {len(placeholders)}")

    component_names = {
        "led": "LED", "resistor": "resistenza", "buzzer-piezo": "buzzer",
        "push-button": "pulsante", "capacitor": "condensatore",
        "potentiometer": "potenziometro", "photo-resistor": "fotoresistore",
        "diode": "diodo", "mosfet-n": "MOSFET", "rgb-led": "LED RGB",
        "motor-dc": "motore", "servo": "servo", "reed-switch": "reed switch",
        "phototransistor": "fototransistor", "lcd16x2": "display LCD",
        "battery9v": "batteria", "multimeter": "multimetro",
    }

    fixed_count = 0
    for ex in dataset:
        try:
            out = json.loads(ex["messages"][2]["content"])
            resp = out.get("response", "")
            if "{component}" in resp or "{components}" in resp:
                entities = out.get("entities", [])
                if entities:
                    # Replace {component} with actual name
                    comp_name = component_names.get(entities[0], entities[0])
                    resp = resp.replace("{component}", comp_name)
                    resp = resp.replace("{components}", " e ".join(
                        component_names.get(e, e) for e in entities
                    ))
                    out["response"] = resp
                    ex["messages"][2]["content"] = json.dumps(out, ensure_ascii=False)
                    fixed_count += 1
        except Exception:
            pass

    print(f"  Fixed {fixed_count} placeholder responses")

    # Now check max repetition
    response_counts2 = Counter()
    for ex in dataset:
        try:
            out = json.loads(ex["messages"][2]["content"])
            resp = out.get("response", "")
            response_counts2[resp] += 1
        except Exception:
            pass

    top = response_counts2.most_common(10)
    # Filter out None responses for display
    top = [(r, c) for r, c in top if r is not None][:5]
    print(f"  Max repetition after fix (non-None): {top[0][1] if top else 0}")
    for resp, count in top:
        print(f"    [{count}x] {str(resp)[:60]}")

    return dataset


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    print("═══ Fix v9 Gaps ═══\n")

    dataset = load_dataset()
    system_prompt = get_system_prompt(dataset)
    print(f"  Loaded: {len(dataset):,} examples")

    # FIX 1: Missing action tags
    new_action_examples = fix_missing_action_tags(dataset, system_prompt)
    dataset.extend(new_action_examples)

    # FIX 2: Vision boost
    new_vision_examples = fix_vision(dataset, system_prompt)
    dataset.extend(new_vision_examples)

    # FIX 3: Response diversity (in-place)
    dataset = fix_response_diversity(dataset)

    # Save
    print(f"\n  Final dataset: {len(dataset):,} examples")
    save_dataset(dataset)

    print("\n═══ Done! Re-run merge_and_validate_v9.py (skip merge) to check. ═══")


if __name__ == "__main__":
    main()
