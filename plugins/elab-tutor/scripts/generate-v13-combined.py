#!/usr/bin/env python3
"""
V13 — Dataset combinato con replay buffer.
Mescola V9 (campione) + V11 curriculum + Sprint finale + V12 sprints.
Corregge i conflitti di label per allinearsi al V9 ground truth.
"""
import json, os, random
from collections import Counter

random.seed(2026)

BASE = "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/datasets"
OUT = f"{BASE}/v13-combined"
os.makedirs(OUT, exist_ok=True)

# === LABEL CONFLICT RESOLUTION ===
# V9 is ground truth. These messages MUST use the V9 intent regardless of context.
# Exception: context-dependent routing is handled by keeping BOTH if context differs.
FORCE_V9_LABELS = {
    "compila": "action",
    "fai il build": "action",
    "passa a scratch": "action",
    "apri l'editor": "action",
    "foto del circuito": "vision",
    "controlla i fili": "action",
    "avanti": "navigation",
    "indietro": "navigation",
    "ricomincia da zero": "action",
    "voglio i blocchi": "action",
    "torna al codice": "action",
    "voglio programmare con i blocchi": "action",
}

def fix_label(example):
    """Fix intent conflicts to align with V9 ground truth."""
    user = example['messages'][1]['content']
    if '[MESSAGGIO]' in user:
        msg = user.split('[MESSAGGIO]')[-1].strip().lower()
    else:
        return example  # no message block, skip

    out = json.loads(example['messages'][2]['content'])

    if msg in FORCE_V9_LABELS:
        correct_intent = FORCE_V9_LABELS[msg]
        if out['intent'] != correct_intent:
            out['intent'] = correct_intent
            example['messages'][2]['content'] = json.dumps(out, ensure_ascii=False)

    return example

def load_jsonl(path):
    """Load JSONL file, return list of examples."""
    examples = []
    with open(path) as f:
        for line in f:
            try:
                examples.append(json.loads(line))
            except:
                pass
    return examples

# === LOAD ALL DATASETS ===
print("Loading datasets...")

# V9 — sample 15K (enough to prevent forgetting, not too much to overwhelm)
v9_all = load_jsonl(f"{BASE}/galileo-brain-v9.jsonl")
random.shuffle(v9_all)
v9_sample = v9_all[:15000]
print(f"  V9: {len(v9_all):,} total, sampled {len(v9_sample):,}")

# V9 eval
v9_eval = load_jsonl(f"{BASE}/galileo-brain-v9-eval.jsonl")
print(f"  V9 eval: {len(v9_eval):,}")

# V11 curriculum (all 5 tiers)
v11_train = []
v11_eval = []
curr_dir = f"{BASE}/curriculum-v11"
if os.path.exists(curr_dir):
    for fname in sorted(os.listdir(curr_dir)):
        path = os.path.join(curr_dir, fname)
        if fname.endswith('.jsonl'):
            data = load_jsonl(path)
            if 'eval' in fname:
                v11_eval.extend(data)
            else:
                v11_train.extend(data)
    print(f"  V11 curriculum: {len(v11_train):,} train, {len(v11_eval):,} eval")

# Sprint finale
sf_dir = f"{BASE}/sprint-finale"
sf_train = []
sf_eval = []
if os.path.exists(sf_dir):
    for fname in os.listdir(sf_dir):
        if fname.endswith('.jsonl'):
            path = os.path.join(sf_dir, fname)
            data = load_jsonl(path)
            if 'eval' in fname:
                sf_eval.extend(data)
            else:
                sf_train.extend(data)
    print(f"  Sprint finale: {len(sf_train):,} train, {len(sf_eval):,} eval")

# V12 sprints
v12_dir = f"{BASE}/sprint-v12"
v12_train = []
v12_eval = []
if os.path.exists(v12_dir):
    for fname in sorted(os.listdir(v12_dir)):
        if fname.endswith('.jsonl') and fname != 'test-200.jsonl':
            path = os.path.join(v12_dir, fname)
            data = load_jsonl(path)
            if 'eval' in fname:
                v12_eval.extend(data)
            else:
                v12_train.extend(data)
    print(f"  V12 sprints: {len(v12_train):,} train, {len(v12_eval):,} eval")

# === FIX LABELS ===
print("\nFixing label conflicts...")
fixed = 0
for dataset in [v11_train, v11_eval, sf_train, sf_eval, v12_train, v12_eval]:
    for i, ex in enumerate(dataset):
        original = ex['messages'][2]['content']
        dataset[i] = fix_label(ex)
        if dataset[i]['messages'][2]['content'] != original:
            fixed += 1
print(f"  Fixed {fixed} label conflicts")

# === COMBINE ===
all_train = v9_sample + v11_train + sf_train + v12_train
all_eval = v9_eval[:100] + v11_eval[:50] + sf_eval[:30] + v12_eval[:50]

random.shuffle(all_train)
random.shuffle(all_eval)

print(f"\nCombined V13:")
print(f"  Train: {len(all_train):,}")
print(f"    V9 sample:    {len(v9_sample):,}")
print(f"    V11 curriculum: {len(v11_train):,}")
print(f"    Sprint finale:  {len(sf_train):,}")
print(f"    V12 sprints:    {len(v12_train):,}")
print(f"  Eval: {len(all_eval):,}")

# === VALIDATE ===
print("\nValidating...")
errors = 0
intents = Counter()
for i, ex in enumerate(all_train):
    try:
        assert len(ex['messages']) == 3
        assert ex['messages'][0]['role'] == 'system'
        assert ex['messages'][1]['role'] == 'user'
        assert ex['messages'][2]['role'] == 'assistant'
        assert '[CONTESTO]' in ex['messages'][1]['content']
        out = json.loads(ex['messages'][2]['content'])
        assert out['intent'] in ['action', 'circuit', 'code', 'tutor', 'vision', 'navigation', 'teacher']
        intents[out['intent']] += 1
    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f"  ERROR {i}: {e}")

print(f"  Errors: {errors}")
print(f"  Intent distribution:")
for k, v in sorted(intents.items(), key=lambda x: -x[1]):
    pct = 100 * v / len(all_train)
    print(f"    {k:12} {v:>6,} ({pct:.1f}%)")

if errors > 0:
    print(f"\nWARNING: {errors} errors found!")
else:
    print("\n  ALL VALID")

# === WRITE ===
train_path = f"{OUT}/v13-combined.jsonl"
eval_path = f"{OUT}/v13-combined-eval.jsonl"

with open(train_path, 'w') as f:
    for ex in all_train:
        f.write(json.dumps(ex, ensure_ascii=False) + '\n')

with open(eval_path, 'w') as f:
    for ex in all_eval:
        f.write(json.dumps(ex, ensure_ascii=False) + '\n')

train_size = os.path.getsize(train_path) / 1024**2
eval_size = os.path.getsize(eval_path) / 1024
print(f"\nOutput:")
print(f"  {train_path} ({train_size:.1f} MB)")
print(f"  {eval_path} ({eval_size:.0f} KB)")
print(f"\nV13 READY!")
