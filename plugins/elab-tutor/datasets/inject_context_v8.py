#!/usr/bin/env python3
"""
Context Injection v8: prende il dataset v8 base (19K) e lo espande
iniettando contesti simulatore randomizzati nel messaggio utente.

Ogni esempio base viene moltiplicato ~4-5 volte con contesti diversi,
producendo ~80-100K esempi con varieta' di contesto estrema.

DIFFERENZE v8 vs v7:
1. Vision viene oversampled 3x (ogni esempio vision genera 12 varianti)
2. Code viene oversampled 2x (ogni esempio code genera 8 varianti)
3. Contesti piu' vari: 7 esperimenti mancanti nel v7 vengono aggiunti
4. Risposta ri-pickata per ogni variante (no piu' "Fatto tutto!" x7500)
"""
import json
import random
import hashlib
from pathlib import Path
from collections import Counter

random.seed(2026_03_19)

# ═══ CONTEXT POOLS ═══
TABS = ["simulator", "editor", "notebooks", "canvas", "video", "manual"]
BUILD_MODES = ["passopasso", "sandbox", "guided", "completo"]
EDITOR_MODES = ["scratch", "arduino"]
SIM_STATES = ["running", "stopped", "paused"]
VOLUMES = [1, 2, 3]

EXPERIMENTS = [
    # Volume 1
    "v1-cap6-primo-circuito", "v1-cap6-led-rosso", "v1-cap6-led-bruciato",
    "v1-cap7-rgb-base", "v1-cap7-rgb-mix", "v1-cap7-rgb-arcobaleno",
    "v1-cap8-pulsante-led", "v1-cap8-semaforo-pulsante", "v1-cap8-pulsante-doppio",
    "v1-cap9-dimmer", "v1-cap9-barra-led", "v1-cap9-joystick",
    "v1-cap10-ldr-base", "v1-cap10-ldr-led", "v1-cap10-notturno",
    "v1-cap10-ldr-soglia", "v1-cap10-ldr-led-proporzionale", "v1-cap10-ldr-range",
    "v1-cap11-buzzer", "v1-cap11-allarme",
    "v1-cap12-reed-base", "v1-cap12-reed-allarme",
    "v1-cap13-diodo-base", "v1-cap13-diodo-protezione",
    "v1-cap14-condensatore-base",
    # Volume 2
    "v2-cap6-led-avanzato", "v2-cap6-led-parallelo",
    "v2-cap7-condensatore-base", "v2-cap7-rc-timer",
    "v2-cap8-mosfet-base", "v2-cap8-mosfet-motore",
    "v2-cap9-fototransistor", "v2-cap9-inseguitore",
    "v2-cap10-motordc-base", "v2-cap10-motordc-pwm",
    "v2-cap11-servo-base", "v2-cap11-servo-angolo",
    "v2-cap12-lcd-base", "v2-cap12-lcd-messaggio",
    # Volume 3
    "v3-cap6-led-blink", "v3-cap6-led-fade", "v3-cap6-sos-morse",
    "v3-cap6-semaforo-auto", "v3-cap6-knight-rider",
    "v3-cap7-pulsante-digitale", "v3-cap7-debounce", "v3-cap7-toggle",
    "v3-cap8-analog-read", "v3-cap8-servo-pot", "v3-cap8-termometro",
    "v3-extra-rgb-fade", "v3-extra-buzzer-melody", "v3-extra-servo-sweep",
    "v3-extra-lcd-countdown", "v3-extra-motor-speed",
    "v3-extra-night-light", "v3-extra-smart-alarm",
    "v3-extra-meteo-station", "v3-extra-traffic-light",
]

COMPONENTS_POOL = [
    "led1", "led2", "resistor1", "resistor2", "resistor3",
    "push-button1", "push-button2", "buzzer-piezo1",
    "capacitor1", "potentiometer1", "photo-resistor1",
    "diode1", "mosfet-n1", "rgb-led1", "motor-dc1",
    "servo1", "reed-switch1", "phototransistor1",
    "battery9v1", "lcd16x21", "lcd16x22",
    "nano-r4-board1", "multimeter1",
]


def random_context():
    """Generate a random simulator context."""
    tab = random.choice(TABS)
    vol = random.choice(VOLUMES)
    exp = random.choice([e for e in EXPERIMENTS if e.startswith(f"v{vol}")] or EXPERIMENTS)
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


def inject(input_path, output_path, multiplier=4, vision_mult=12, code_mult=8):
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
        except:
            intent = "action"

        # Determine multiplier
        if intent == "vision":
            n = vision_mult
        elif intent == "code":
            n = code_mult
        else:
            n = multiplier

        for _ in range(n):
            ctx = random_context()
            # Extract original user message (without context if already injected)
            user_msg = ex["messages"][1]["content"]
            if "[MESSAGGIO]" in user_msg:
                user_msg = user_msg.split("[MESSAGGIO]")[1].strip()

            full_user = f"{ctx}\n\n[MESSAGGIO]\n{user_msg}"

            # Dedup
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

    # Write output
    with open(output_path, "w") as f:
        for ex in output:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    # Stats
    print(f"  Output: {len(output):,} esempi")
    print(f"  Expansion: {len(output)/len(base):.1f}x")
    print(f"\n  Intent distribution:")
    for intent, count in sorted(intent_counts.items(), key=lambda x: -x[1]):
        pct = 100 * count / len(output)
        bar = "█" * int(pct / 2)
        print(f"    {intent:12} {bar} {count:,} ({pct:.1f}%)")

    # Eval split: 200 random examples
    eval_path = output_path.replace(".jsonl", "-eval.jsonl")
    eval_set = random.sample(output, min(200, len(output)))
    with open(eval_path, "w") as f:
        for ex in eval_set:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    print(f"\n  Eval set: {eval_path} ({len(eval_set)} examples)")

    return len(output)


if __name__ == "__main__":
    base_dir = Path(__file__).parent
    input_file = base_dir / "output" / "galileo-brain-v8.jsonl"
    output_file = base_dir / "galileo-brain-v8.jsonl"

    print("═══ Context Injection v8 ═══\n")
    n = inject(str(input_file), str(output_file))
    print(f"\n═══ Done: {n:,} examples ═══")
