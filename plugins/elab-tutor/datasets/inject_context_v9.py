#!/usr/bin/env python3
"""
Context Injection v9: prende il dataset v9 base (~25K) e lo espande
iniettando contesti simulatore randomizzati nel messaggio utente.

DIFFERENZE v9 vs v8:
1. Vision oversampled 15x (target 7% — compensare la bassa base)
2. Code oversampled 8x (target 15%)
3. Teacher oversampled 5x (target 10%)
4. Tutti i 70 esperimenti (v8 ne aveva ~60)
5. Build modes aggiornati: passopasso, sandbox, giamontato
6. Scratch/Arduino editor mode nel contesto
"""
import json
import random
import hashlib
from pathlib import Path
from collections import Counter

random.seed(2026_03_19)

# ═══ CONTEXT POOLS ═══
TABS = ["simulator", "editor", "notebooks", "canvas", "video", "manual"]
BUILD_MODES = ["passopasso", "sandbox", "giamontato"]
EDITOR_MODES = ["scratch", "arduino"]
SIM_STATES = ["running", "stopped", "paused"]
VOLUMES = [1, 2, 3]

# ALL 70 experiments
EXPERIMENTS = [
    # Volume 1 — 38 esperimenti
    "v1-cap6-primo-circuito", "v1-cap6-led-rosso", "v1-cap6-led-bruciato",
    "v1-cap6-led-senza-resistenza", "v1-cap6-due-led",
    "v1-cap7-rgb-base", "v1-cap7-rgb-mix", "v1-cap7-rgb-arcobaleno",
    "v1-cap8-pulsante-led", "v1-cap8-semaforo-pulsante", "v1-cap8-pulsante-doppio",
    "v1-cap8-pulsante-tre-led",
    "v1-cap9-dimmer", "v1-cap9-barra-led", "v1-cap9-joystick",
    "v1-cap10-ldr-base", "v1-cap10-ldr-led", "v1-cap10-notturno",
    "v1-cap10-ldr-soglia", "v1-cap10-ldr-led-proporzionale", "v1-cap10-ldr-range",
    "v1-cap11-buzzer", "v1-cap11-allarme", "v1-cap11-buzzer-pulsante",
    "v1-cap12-reed-base", "v1-cap12-reed-allarme",
    "v1-cap13-diodo-base", "v1-cap13-diodo-protezione",
    "v1-cap14-condensatore-base", "v1-cap14-condensatore-led",
    "v1-cap15-motore-base", "v1-cap15-motore-pulsante",
    "v1-cap16-fototransistor-base",
    "v1-cap17-mosfet-base", "v1-cap17-mosfet-motore",
    "v1-cap18-servo-base", "v1-cap18-servo-potenziometro",
    "v1-cap19-lcd-base",
    # Volume 2 — 18 esperimenti
    "v2-cap6-led-avanzato", "v2-cap6-led-parallelo",
    "v2-cap7-condensatore-base", "v2-cap7-rc-timer",
    "v2-cap8-mosfet-base", "v2-cap8-mosfet-motore",
    "v2-cap9-fototransistor", "v2-cap9-inseguitore",
    "v2-cap10-motordc-base", "v2-cap10-motordc-pwm",
    "v2-cap11-servo-base", "v2-cap11-servo-angolo",
    "v2-cap12-lcd-base", "v2-cap12-lcd-messaggio",
    "v2-cap13-progetto-finale", "v2-cap13-progetto-complesso",
    "v2-cap14-revisione", "v2-cap14-sfida",
    # Volume 3 — 14 esperimenti AVR
    "v3-cap6-led-blink", "v3-cap6-led-fade", "v3-cap6-sos-morse",
    "v3-cap6-semaforo-auto", "v3-cap6-knight-rider",
    "v3-cap7-pulsante-digitale", "v3-cap7-debounce", "v3-cap7-toggle",
    "v3-cap8-analog-read", "v3-cap8-servo-pot", "v3-cap8-termometro",
    "v3-extra-rgb-fade", "v3-extra-buzzer-melody", "v3-extra-simon",
]

COMPONENTS_POOL = [
    "led1", "led2", "led3", "resistor1", "resistor2", "resistor3",
    "push-button1", "push-button2", "buzzer-piezo1",
    "capacitor1", "potentiometer1", "photo-resistor1",
    "diode1", "mosfet-n1", "rgb-led1", "motor-dc1",
    "servo1", "reed-switch1", "phototransistor1",
    "battery9v1", "lcd16x21",
    "nano-r4-board1", "multimeter1",
]


def random_context():
    """Generate a random simulator context."""
    tab = random.choice(TABS)
    vol = random.choice(VOLUMES)
    vol_exps = [e for e in EXPERIMENTS if e.startswith(f"v{vol}")]
    exp = random.choice(vol_exps) if vol_exps else random.choice(EXPERIMENTS)
    n_components = random.randint(0, 8)
    components = random.sample(COMPONENTS_POOL, min(n_components, len(COMPONENTS_POOL)))
    fili = random.randint(0, 12)
    sim = random.choice(SIM_STATES)
    build = random.choice(BUILD_MODES)
    editor = random.choice(EDITOR_MODES)
    codice = random.choice([True, False])

    return (
        f"[CONTESTO]\n"
        f"tab: {tab}\n"
        f"esperimento: {exp}\n"
        f"componenti: [{', '.join(components)}]\n"
        f"fili: {fili}\n"
        f"volume_attivo: {vol}\n"
        f"simulazione: {sim}\n"
        f"build_mode: {build}\n"
        f"editor_mode: {editor}\n"
        f"codice_presente: {'true' if codice else 'false'}"
    )


def inject(input_path, output_path, multiplier=4, vision_mult=15, code_mult=8, teacher_mult=5):
    """Inject random contexts into each example, multiplying the dataset."""
    with open(input_path) as f:
        base = [json.loads(line) for line in f]

    print(f"  Base: {len(base):,} esempi")

    seen = set()
    output = []
    intent_counts = Counter()

    for ex in base:
        # Detect intent for oversampling
        try:
            assistant = json.loads(ex["messages"][2]["content"])
            intent = assistant.get("intent", "action")
        except Exception:
            intent = "action"

        # Determine multiplier per intent
        if intent == "vision":
            n = vision_mult
        elif intent == "code":
            n = code_mult
        elif intent == "teacher":
            n = teacher_mult
        else:
            n = multiplier

        for _ in range(n):
            ctx = random_context()
            user_msg = ex["messages"][1]["content"]
            if "[MESSAGGIO]" in user_msg:
                user_msg = user_msg.split("[MESSAGGIO]")[1].strip()

            full_user = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"

            h = hashlib.md5(full_user.encode()).hexdigest()
            if h in seen:
                continue
            seen.add(h)

            new_ex = {
                "messages": [
                    ex["messages"][0],
                    {"role": "user", "content": full_user},
                    ex["messages"][2],
                ]
            }
            output.append(new_ex)
            intent_counts[intent] += 1

    random.shuffle(output)

    with open(output_path, "w") as f:
        for ex in output:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    total = len(output)
    print(f"  Output: {total:,} esempi")
    print(f"  Expansion: {total / max(len(base), 1):.1f}x")
    print(f"\n  Intent distribution:")
    for intent, count in sorted(intent_counts.items(), key=lambda x: -x[1]):
        pct = 100 * count / total
        bar = "█" * int(pct / 2)
        print(f"    {intent:12} {bar} {count:,} ({pct:.1f}%)")

    # Eval split: 300 random examples (50 per intent where possible)
    eval_path = output_path.replace(".jsonl", "-eval.jsonl")
    eval_set = []
    by_intent = {}
    for ex in output:
        try:
            intent = json.loads(ex["messages"][2]["content"]).get("intent", "?")
        except Exception:
            intent = "?"
        by_intent.setdefault(intent, []).append(ex)

    for intent, examples in by_intent.items():
        eval_set.extend(random.sample(examples, min(50, len(examples))))
    random.shuffle(eval_set)

    with open(eval_path, "w") as f:
        for ex in eval_set:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    print(f"\n  Eval set: {eval_path} ({len(eval_set)} examples, balanced by intent)")

    return total


if __name__ == "__main__":
    base_dir = Path(__file__).parent
    input_file = base_dir / "output" / "galileo-brain-v9.jsonl"
    output_file = base_dir / "galileo-brain-v9.jsonl"

    print("═══ Context Injection v9 ═══\n")
    n = inject(str(input_file), str(output_file))
    print(f"\n═══ Done: {n:,} examples ═══")
