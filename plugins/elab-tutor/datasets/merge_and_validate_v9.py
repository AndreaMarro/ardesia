#!/usr/bin/env python3
"""
Merge vision examples from v7 into v9, then validate against checklist.
"""
import json
import random
import hashlib
from pathlib import Path
from collections import Counter, defaultdict

random.seed(2026_03_19)

BASE_DIR = Path(__file__).parent


def merge_vision():
    """Extract vision examples from v7 and merge into v9."""
    print("═══ STEP 1: Merge Vision from v7 ═══\n")

    v7_path = BASE_DIR / "galileo-brain-v7.jsonl"
    v9_path = BASE_DIR / "galileo-brain-v9.jsonl"

    # Extract vision from v7
    vision_examples = []
    with open(v7_path) as f:
        for line in f:
            try:
                ex = json.loads(line)
                out = json.loads(ex["messages"][2]["content"])
                if out.get("intent") == "vision":
                    vision_examples.append(ex)
            except Exception:
                pass

    print(f"  Vision from v7: {len(vision_examples)}")

    # Load v9
    with open(v9_path) as f:
        v9 = [json.loads(line) for line in f]
    print(f"  v9 before merge: {len(v9)}")

    # Dedup by user message hash
    existing_hashes = set()
    for ex in v9:
        h = hashlib.md5(ex["messages"][1]["content"].encode()).hexdigest()
        existing_hashes.add(h)

    added = 0
    for ex in vision_examples:
        h = hashlib.md5(ex["messages"][1]["content"].encode()).hexdigest()
        if h not in existing_hashes:
            existing_hashes.add(h)
            v9.append(ex)
            added += 1

    print(f"  Vision added (deduped): {added}")
    print(f"  v9 after merge: {len(v9)}")

    # Shuffle and write
    random.shuffle(v9)
    with open(v9_path, "w") as f:
        for ex in v9:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    return v9


def validate(dataset):
    """Validate against v9 checklist."""
    print("\n═══ STEP 2: Validation ═══\n")

    # Counters
    intent_counts = Counter()
    action_tag_counts = Counter()
    entity_counts = Counter()
    response_counts = Counter()
    hint_set = set()
    experiment_counts = Counter()
    missing_fields = 0
    invalid_json = 0
    total = len(dataset)

    ALL_ACTION_TAGS = {
        "[AZIONE:play]", "[AZIONE:pause]", "[AZIONE:reset]",
        "[AZIONE:clearall]", "[AZIONE:compile]", "[AZIONE:undo]",
        "[AZIONE:redo]", "[AZIONE:diagnose]", "[AZIONE:quiz]",
        "[AZIONE:addcomponent]", "[AZIONE:addwire]", "[AZIONE:removewire]",
        "[AZIONE:highlight]", "[AZIONE:openeditor]", "[AZIONE:nextstep]",
        "[AZIONE:prevstep]", "[AZIONE:closeeditor]", "[AZIONE:switcheditor]",
        "[AZIONE:interact]", "[AZIONE:measure]", "[AZIONE:setvalue]",
        "[AZIONE:screenshot]", "[AZIONE:youtube]", "[AZIONE:getcode]",
    }

    ALL_COMPONENTS = {
        "led", "resistor", "capacitor", "push-button", "buzzer-piezo",
        "potentiometer", "photo-resistor", "diode", "mosfet-n", "rgb-led",
        "motor-dc", "servo", "reed-switch", "phototransistor", "battery9v",
        "multimeter", "lcd16x2", "nano-r4-board", "breadboard-half",
        "breadboard-full", "wire", "annotation",
    }

    REQUIRED_FIELDS = {"intent", "entities", "actions", "needs_llm", "response", "llm_hint"}

    for ex in dataset:
        try:
            out = json.loads(ex["messages"][2]["content"])
        except (json.JSONDecodeError, KeyError, IndexError):
            invalid_json += 1
            continue

        # Check required fields
        if not REQUIRED_FIELDS.issubset(out.keys()):
            missing_fields += 1

        intent = out.get("intent", "unknown")
        intent_counts[intent] += 1

        # Actions
        for action in out.get("actions", []):
            # Normalize: [AZIONE:switcheditor:scratch] -> [AZIONE:switcheditor]
            base_action = ":".join(action.split(":")[:2]) + "]"
            if not base_action.endswith("]]"):
                base_action = base_action.rstrip("]") + "]"
            # Even simpler: extract just the action name
            parts = action.replace("[AZIONE:", "").rstrip("]").split(":")
            tag = f"[AZIONE:{parts[0]}]"
            action_tag_counts[tag] += 1

        # Entities
        for entity in out.get("entities", []):
            if entity:  # Skip empty strings
                entity_counts[entity] += 1

        # Responses
        resp = out.get("response")
        if resp:
            response_counts[resp] += 1

        # Hints
        hint = out.get("llm_hint")
        if hint:
            hint_set.add(hint)

        # Experiments from context
        user_msg = ex["messages"][1]["content"]
        if "esperimento:" in user_msg:
            exp_line = [l for l in user_msg.split("\n") if "esperimento:" in l]
            if exp_line:
                exp = exp_line[0].split("esperimento:")[1].strip()
                experiment_counts[exp] += 1

    # ═══ REPORT ═══
    print("  ┌─────────────────────────────────────────────┐")
    print("  │           GALILEO BRAIN v9 REPORT            │")
    print("  └─────────────────────────────────────────────┘\n")

    print(f"  Total examples: {total:,}")
    print(f"  Invalid JSON:   {invalid_json}")
    print(f"  Missing fields: {missing_fields}")

    # Intent distribution
    print(f"\n  ── Intent Distribution ──")
    for intent, count in sorted(intent_counts.items(), key=lambda x: -x[1]):
        pct = 100 * count / total
        bar = "█" * int(pct / 2)
        print(f"    {intent:12} {bar} {count:,} ({pct:.1f}%)")

    # Action tags
    print(f"\n  ── Action Tags ({len(action_tag_counts)}/{len(ALL_ACTION_TAGS)}) ──")
    found_tags = set(action_tag_counts.keys())
    missing_tags = ALL_ACTION_TAGS - found_tags
    for tag in sorted(ALL_ACTION_TAGS):
        count = action_tag_counts.get(tag, 0)
        status = "✅" if count >= 500 else ("⚠️" if count > 0 else "❌")
        print(f"    {status} {tag:30} {count:,}")
    if missing_tags:
        print(f"\n    ❌ MISSING: {', '.join(sorted(missing_tags))}")

    # Components
    print(f"\n  ── Components ({len(entity_counts)}/{len(ALL_COMPONENTS)}) ──")
    found_comps = set(entity_counts.keys())
    missing_comps = ALL_COMPONENTS - found_comps
    for comp in sorted(ALL_COMPONENTS):
        count = entity_counts.get(comp, 0)
        status = "✅" if count >= 1000 else ("⚠️" if count > 0 else "❌")
        print(f"    {status} {comp:25} {count:,}")
    if missing_comps:
        print(f"\n    ❌ Not in entities: {', '.join(sorted(missing_comps))}")

    # Responses
    print(f"\n  ── Response Diversity ──")
    print(f"    Unique responses: {len(response_counts)}")
    top_responses = response_counts.most_common(5)
    max_rep = top_responses[0][1] if top_responses else 0
    print(f"    Max repetition:   {max_rep}")
    for resp, count in top_responses:
        status = "✅" if count <= 200 else "⚠️"
        print(f"    {status} [{count:,}x] {resp[:60]}...")

    # Hints
    print(f"\n  ── LLM Hint Diversity ──")
    print(f"    Unique hints: {len(hint_set)}")
    status = "✅" if len(hint_set) >= 150 else "⚠️"
    print(f"    {status} Target: ≥150")

    # Experiments
    print(f"\n  ── Experiment Coverage ──")
    print(f"    Experiments in context: {len(experiment_counts)}")
    low_exp = [(e, c) for e, c in experiment_counts.items() if c < 100]
    if low_exp:
        print(f"    ⚠️ {len(low_exp)} experiments with <100 occurrences")
        for e, c in sorted(low_exp, key=lambda x: x[1])[:5]:
            print(f"       {e}: {c}")

    # ═══ CHECKLIST ═══
    print(f"\n  ── CHECKLIST ──")
    checks = [
        ("All 24 action tags ≥500", all(action_tag_counts.get(t, 0) >= 500 for t in ALL_ACTION_TAGS)),
        ("All 22 components ≥1000 in entities", all(entity_counts.get(c, 0) >= 1000 for c in ALL_COMPONENTS)),
        ("All 70 experiments ≥100 in context", len(experiment_counts) >= 70 and all(c >= 100 for c in experiment_counts.values())),
        ("Vision ≥ 7%", intent_counts.get("vision", 0) / total * 100 >= 7),
        ("Code ≥ 15%", intent_counts.get("code", 0) / total * 100 >= 15),
        ("Teacher ≥ 8%", intent_counts.get("teacher", 0) / total * 100 >= 8),
        ("Max response ≤ 200", max_rep <= 200),
        ("≥150 unique hints", len(hint_set) >= 150),
        ("Valid JSON for all", invalid_json == 0),
        ("No missing fields", missing_fields == 0),
    ]

    passed = 0
    for label, ok in checks:
        status = "✅" if ok else "❌"
        print(f"    {status} {label}")
        if ok:
            passed += 1

    print(f"\n  Score: {passed}/{len(checks)} checks passed")
    return passed, len(checks)


if __name__ == "__main__":
    v9 = merge_vision()
    passed, total = validate(v9)
    print(f"\n═══ Final: {len(v9):,} examples, {passed}/{total} checks ═══")
