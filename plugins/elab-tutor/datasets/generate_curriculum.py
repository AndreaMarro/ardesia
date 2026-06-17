#!/usr/bin/env python3
"""
Galileo Brain v10 — Curriculum Learning Dataset Splitter

Splits the v10 expansion into 5 progressive difficulty tiers,
each ~6K examples (~2h training on A100).

Tier 1: Simple actions + basic circuit (foundation reinforcement)
Tier 2: Precise pins, breadboard positions, multi-component
Tier 3: Multi-action chains, slang, typos, distorted input
Tier 4: Multi-language, complex vision, audio
Tier 5: Teacher scenarios, code debugging, mixed everything
"""

import json, random, os
from collections import Counter, defaultdict

random.seed(42)

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
EXPANSION = os.path.join(DATA_DIR, 'galileo-brain-v10-expansion.jsonl')
OUT_DIR = os.path.join(DATA_DIR, 'curriculum')
os.makedirs(OUT_DIR, exist_ok=True)

# Load expansion
with open(EXPANSION) as f:
    examples = [json.loads(l) for l in f]
print(f"Total expansion examples: {len(examples):,}")


def classify_difficulty(ex):
    """Classify example into difficulty tier 1-5."""
    msg = ex['messages'][1]['content'].lower()
    out = json.loads(ex['messages'][2]['content'])
    intent = out['intent']
    n_actions = len(out.get('actions', []))
    n_entities = len(out.get('entities', []))
    needs_llm = out.get('needs_llm', False)

    # Tier 1: Simple single actions, basic components
    if n_actions <= 1 and n_entities <= 1 and not needs_llm:
        if intent in ('action', 'navigation'):
            return 1

    # Tier 2: Precise placement, pin references, multi-component
    has_pin = any(w in msg for w in ['pin d', 'pin a', 'd3', 'd5', 'd9', 'a0', 'a1', 'gnd', '5v'])
    has_breadboard = any(w in msg for w in ['riga', 'colonna', 'foro', 'fila', 'row', 'col'])
    if has_pin or has_breadboard or (n_entities > 2):
        return 2

    # Tier 3: Multi-action, slang, typos
    has_slang = any(w in msg for w in ['daje', 'bro', 'fra', 'ao', 'nn ', 'nnt', 'cmq', 'vbb',
                                         'spe', 'zio', 'bella', 'ammazza', 'cazz'])
    if n_actions >= 3 or has_slang:
        return 3

    # Tier 4: Multi-language, complex vision, audio
    has_foreign = any(w in msg for w in ['please', 'help', 'what', 'how', 'the',
                                          'por favor', 'como', 'donde', 'quiero',
                                          'bitte', 'wie', 'was', 'schau',
                                          'demarre', 'arrete', 'ajoute', 'regarde'])
    has_vision_complex = intent == 'vision' and any(w in msg for w in
        ['sfocata', 'buia', 'traverso', 'frecce', 'annotato', 'cerchiato', 'penna',
         'confronta', 'volume', 'fritzing', 'screenshot', 'warning', 'errore'])
    has_audio = any(w in msg for w in ['suona', 'melodia', 'frequenza', 'hz', 'volume', 'beep'])
    if has_foreign or has_vision_complex or has_audio:
        return 4

    # Tier 5: Teacher, code debugging, complex mixed
    if intent == 'teacher':
        return 5
    if intent == 'code' and needs_llm and any(w in msg for w in
        ['non compila', 'errore', 'sbaglio', 'non funziona', 'converti', 'serial monitor']):
        return 5

    # Default: assign based on complexity
    if needs_llm and n_entities > 1:
        return 4
    if needs_llm:
        return 3
    if n_actions > 1:
        return 2
    return 1


# Classify all examples
tiers = defaultdict(list)
for ex in examples:
    tier = classify_difficulty(ex)
    tiers[tier].append(ex)

# Balance tiers to ~6K each (pad smaller tiers by oversampling)
TARGET_PER_TIER = 6000

for tier_n in sorted(tiers.keys()):
    tier_examples = tiers[tier_n]
    if len(tier_examples) < TARGET_PER_TIER:
        # Oversample
        extra = TARGET_PER_TIER - len(tier_examples)
        tier_examples.extend(random.choices(tier_examples, k=extra))
    elif len(tier_examples) > TARGET_PER_TIER:
        tier_examples = random.sample(tier_examples, TARGET_PER_TIER)

    random.shuffle(tier_examples)
    tiers[tier_n] = tier_examples[:TARGET_PER_TIER]

# Save each tier
for tier_n in sorted(tiers.keys()):
    tier_examples = tiers[tier_n]
    path = os.path.join(OUT_DIR, f'tier-{tier_n}.jsonl')
    with open(path, 'w') as f:
        for ex in tier_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')

    # Intent distribution
    ic = Counter()
    for ex in tier_examples:
        ic[json.loads(ex['messages'][2]['content'])['intent']] += 1

    tier_names = {1: 'Foundation', 2: 'Precision', 3: 'Chaos', 4: 'Polyglot', 5: 'Master'}
    print(f"\nTier {tier_n} — {tier_names.get(tier_n, '???')} ({len(tier_examples):,} examples)")
    print(f"  File: {path} ({os.path.getsize(path)/1024**2:.1f} MB)")
    for k, v in sorted(ic.items(), key=lambda x: -x[1])[:5]:
        print(f"  {k:12} {v:,}")

# Also create tier eval sets (50 per tier)
for tier_n in sorted(tiers.keys()):
    eval_examples = random.sample(tiers[tier_n], min(50, len(tiers[tier_n])))
    path = os.path.join(OUT_DIR, f'tier-{tier_n}-eval.jsonl')
    with open(path, 'w') as f:
        for ex in eval_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')

print(f"\n{'='*50}")
print(f"Curriculum: 5 tiers x ~{TARGET_PER_TIER:,} = ~{5*TARGET_PER_TIER:,} examples")
print(f"Each tier: ~2h training on A100 (batch 2x8, seq 768)")
print(f"Files in: {OUT_DIR}")
