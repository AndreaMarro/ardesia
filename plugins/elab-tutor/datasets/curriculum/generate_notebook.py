#!/usr/bin/env python3
"""Generate the Curriculum Learning Colab notebook."""
import json, os

SYSTEM_PROMPT_SHORT = "Sei il Galileo Brain, il cervello di routing..."  # truncated for display

cells = []

def add_md(source):
    cells.append({"cell_type": "markdown", "metadata": {}, "source": [source]})

def add_code(source):
    cells.append({
        "cell_type": "code", "metadata": {}, "source": [source],
        "execution_count": None, "outputs": []
    })

# ─── CELL 0: Header ───
add_md("""# Galileo Brain v10 — Curriculum Learning
**Resume from checkpoint-1000** → 5 Tier progressivi di difficolta crescente.

| Tier | Focus | Esempi | Tempo |
|------|-------|--------|-------|
| 1 | Precise breadboard/pin control | ~4,900 | ~2h |
| 2 | Multi-component chains + wiring | ~4,900 | ~2h |
| 3 | Slang/typos/multi-language | ~4,500 | ~1.5h |
| 4 | Vision + teacher + debugging | ~4,300 | ~1.5h |
| 5 | Adversarial edge cases | ~3,400 | ~1h |

**Workflow**: Cell 1 (install) → restart → Cell 2 (load checkpoint) → Cell 3 (upload tiers) → Cell 4+ (train tier by tier)""")

# ─── CELL 1: Install ───
add_code("""# === CELL 1: INSTALL (poi Runtime > Riavvia sessione) ===
import sys
if 'google.colab' in sys.modules:
    !pip install --no-deps trl peft accelerate bitsandbytes
    !pip install 'unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git'
    !pip install --no-deps xformers triton
    !pip install 'transformers>=5.2.0,<=5.3.0' 'trl==0.22.2' datasets matplotlib numpy
print('\\n=== ORA RIAVVIA: Runtime > Riavvia sessione ===')""")

# ─── CELL 2: Load checkpoint ───
add_code("""# === CELL 2: CARICA CHECKPOINT-1000 DA DRIVE ===
from unsloth import FastLanguageModel
from google.colab import drive
import torch, os

drive.mount('/content/drive')
DRIVE = '/content/drive/MyDrive/galileo-brain-v9-training'
CKPT = DRIVE + '/checkpoints/checkpoint-1000'

assert os.path.exists(CKPT), f'Checkpoint non trovato: {CKPT}'

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=CKPT, max_seq_length=768, dtype=None, load_in_4bit=True)

# Re-apply LoRA for continued training
model = FastLanguageModel.get_peft_model(
    model, r=16,
    target_modules=['q_proj','k_proj','v_proj','o_proj','gate_proj','up_proj','down_proj'],
    lora_alpha=32, lora_dropout=0, bias='none',
    use_gradient_checkpointing='unsloth', random_state=3407)

text_tok = tokenizer.tokenizer if hasattr(tokenizer, 'tokenizer') else tokenizer
if text_tok.pad_token is None:
    text_tok.pad_token = text_tok.eos_token

print(f'Checkpoint caricato: {CKPT}')
print(f'VRAM: {torch.cuda.memory_allocated()/1024**3:.1f} GB')""")

# ─── CELL 3: Upload all tier files ───
add_code("""# === CELL 3: UPLOAD TIER FILES DAL MAC ===
from google.colab import files
import os, json

print('Carica TUTTI i file tier dal Mac:')
print('  tier-1.jsonl, tier-1-eval.jsonl')
print('  tier-2.jsonl, tier-2-eval.jsonl')
print('  tier-3.jsonl, tier-3-eval.jsonl')
print('  tier-4.jsonl, tier-4-eval.jsonl')
print('  tier-5.jsonl, tier-5-eval.jsonl')
print()
uploaded = files.upload()

# Organize files
tier_files = {}
for f in uploaded:
    for t in range(1, 6):
        if f'tier-{t}' in f:
            key = f'tier-{t}'
            if 'eval' in f:
                tier_files.setdefault(key, {})['eval'] = f
            else:
                tier_files.setdefault(key, {})['train'] = f

# Verify
for t in range(1, 6):
    key = f'tier-{t}'
    if key in tier_files and 'train' in tier_files[key]:
        n = sum(1 for _ in open(tier_files[key]['train']))
        n_eval = sum(1 for _ in open(tier_files[key].get('eval', ''))) if tier_files[key].get('eval') else 0
        print(f'{key}: {n:,} train, {n_eval} eval')
    else:
        print(f'{key}: MANCANTE!')

print(f'\\nTier disponibili: {len(tier_files)}')""")

# ─── CELL 4: Training functions ───
add_code("""# === CELL 4: FUNZIONI DI TRAINING ===
from datasets import Dataset, load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments, DataCollatorForSeq2Seq, TrainerCallback
from unsloth import is_bfloat16_supported
import time, json, re, shutil, os, matplotlib.pyplot as plt, numpy as np

SEQ_LEN = 768
BATCH = 2
GRAD_ACC = 8
LR = 1e-4  # Lower LR for continued training (was 2e-4)

class LossLog(TrainerCallback):
    def __init__(self):
        self.t0 = None
        self.tl, self.el = [], []
    def on_train_begin(self, args, state, control, **kw):
        self.t0 = time.time()
        print(f'{\"Step\":>7} {\"Loss\":>10} {\"EvalLoss\":>10} {\"Tempo\":>8}')
        print('-' * 40)
    def on_log(self, args, state, control, logs=None, **kw):
        if not logs: return
        s = state.global_step
        t = (time.time() - self.t0) / 60 if self.t0 else 0
        loss = logs.get('loss')
        evl = logs.get('eval_loss')
        if loss is not None:
            self.tl.append((s, loss))
            ev_str = f'{evl:.4f}' if evl is not None else ''
            print(f'{s:>7} {loss:>10.4f} {ev_str:>10} {t:>7.0f}m')
        if evl is not None:
            self.el.append((s, evl))
    def on_save(self, args, state, control, **kw):
        print(f'  >> CHECKPOINT step {state.global_step} -> Drive')


def prepare_tier(tier_name):
    \"\"\"Load and prepare a tier dataset.\"\"\"
    train_file = tier_files[tier_name]['train']
    eval_file = tier_files[tier_name].get('eval')

    # Clean cache
    cache = f'/tmp/hf_cache_{tier_name}'
    if os.path.exists(cache): shutil.rmtree(cache)

    train_ds = load_dataset('json', data_files=train_file, split='train', cache_dir=cache)
    eval_ds = load_dataset('json', data_files=eval_file, split='train', cache_dir=cache) if eval_file else None

    def fmt(ex):
        return {'text': text_tok.apply_chat_template(
            ex['messages'], tokenize=False, add_generation_prompt=False)}

    train_ds = train_ds.map(fmt, num_proc=4)
    if eval_ds: eval_ds = eval_ds.map(fmt, num_proc=4)

    # Tokenize
    def tok_fn(ex):
        t = text_tok(ex['text'], truncation=True, max_length=SEQ_LEN)
        return {'input_ids': t['input_ids'], 'attention_mask': t['attention_mask'], 'labels': t['input_ids']}

    cols = [c for c in train_ds.column_names if c not in ['input_ids', 'attention_mask', 'labels']]
    tok_train = train_ds.map(tok_fn, remove_columns=cols, num_proc=4)
    tok_eval = None
    if eval_ds:
        ecols = [c for c in eval_ds.column_names if c not in ['input_ids', 'attention_mask', 'labels']]
        tok_eval = eval_ds.map(tok_fn, remove_columns=ecols, num_proc=4)

    # Pack
    def pack(ds, ml):
        eos = text_tok.eos_token_id
        ids, labs, masks = [], [], []
        bi, bl = [], []
        for ex in ds:
            bi.extend(list(ex['input_ids']) + [eos])
            bl.extend(list(ex['labels']) + [eos])
            while len(bi) >= ml:
                ids.append(bi[:ml]); labs.append(bl[:ml])
                masks.append([1]*ml); bi = bi[ml:]; bl = bl[ml:]
        return Dataset.from_dict({'input_ids': ids, 'attention_mask': masks, 'labels': labs})

    packed_train = pack(tok_train, SEQ_LEN)
    packed_eval = pack(tok_eval, SEQ_LEN) if tok_eval else None
    print(f'{tier_name}: {len(train_ds):,} -> {len(packed_train):,} packed')
    return packed_train, packed_eval


def train_tier(tier_name, packed_train, packed_eval, epochs=1):
    \"\"\"Train one tier and return stats.\"\"\"
    lcb = LossLog()
    save_steps = max(100, len(packed_train) // (BATCH * GRAD_ACC * 2))
    out_dir = f'{DRIVE}/curriculum/{tier_name}'
    os.makedirs(out_dir, exist_ok=True)

    trainer = SFTTrainer(
        model=model, tokenizer=text_tok,
        train_dataset=packed_train, eval_dataset=packed_eval,
        packing=False,
        data_collator=DataCollatorForSeq2Seq(tokenizer=text_tok, padding=False),
        callbacks=[lcb],
        args=TrainingArguments(
            per_device_train_batch_size=BATCH,
            gradient_accumulation_steps=GRAD_ACC,
            num_train_epochs=epochs,
            learning_rate=LR,
            lr_scheduler_type='cosine',
            warmup_steps=20,
            bf16=is_bfloat16_supported(),
            fp16=not is_bfloat16_supported(),
            optim='adamw_8bit',
            eval_strategy='steps' if packed_eval else 'no',
            eval_steps=save_steps if packed_eval else None,
            save_strategy='steps',
            save_steps=save_steps,
            save_total_limit=2,
            load_best_model_at_end=True if packed_eval else False,
            metric_for_best_model='eval_loss' if packed_eval else None,
            logging_steps=10,
            report_to='none',
            output_dir=out_dir + '/ckpt',
            seed=3407,
            remove_unused_columns=False,
        ),
    )

    steps = len(packed_train) // (BATCH * GRAD_ACC) * epochs
    print(f'\\n{"="*50}')
    print(f'TRAINING {tier_name} — {steps:,} steps, ~{steps*0.05/60:.0f}h')
    print(f'{"="*50}\\n')

    stats = trainer.train()

    # Plot
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(12, 4))
    if lcb.tl:
        s, l = zip(*lcb.tl)
        a1.plot(s, l, color='#1E4D8C', lw=1, alpha=0.6)
        a1.set_title(f'{tier_name} Train Loss'); a1.grid(True, alpha=0.3)
    if lcb.el:
        s, l = zip(*lcb.el)
        a2.plot(s, l, color='#7CB342', lw=2, marker='o', ms=4)
        a2.set_title(f'{tier_name} Eval Loss'); a2.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(f'{out_dir}/loss-{tier_name}.png', dpi=150)
    plt.show()

    return stats, lcb


# System prompt for testing
with open(tier_files['tier-1']['train']) as f:
    _sp = json.loads(f.readline())['messages'][0]['content']

def test_model(tier_name):
    \"\"\"Run 10 inference tests.\"\"\"
    from unsloth import FastLanguageModel as FLM
    FLM.for_inference(model)

    tests = [
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: [led1, resistor1]\\nfili: 2\\nvolume_attivo: 1\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\navvia la simulazione', 'action'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: [led1]\\nfili: 1\\nvolume_attivo: 1\\nsimulazione: running\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\nferma tutto', 'action'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: []\\nfili: 0\\nvolume_attivo: 1\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: false\\n\\n[MESSAGGIO]\\nmetti un LED rosso sul pin D3', 'circuit'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: [led1, resistor1]\\nfili: 2\\nvolume_attivo: 1\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\ncos\\'e\\' la legge di Ohm?', 'tutor'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: [led1]\\nfili: 2\\nvolume_attivo: 1\\nsimulazione: running\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\nguarda il mio circuito', 'vision'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v3-cap1-blink\\ncomponenti: [led1]\\nfili: 2\\nvolume_attivo: 3\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\nscrivi il codice per il LED', 'code'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: []\\nfili: 0\\nvolume_attivo: 1\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: false\\n\\n[MESSAGGIO]\\ncarica il blink', 'navigation'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v3-cap1-blink\\ncomponenti: [led1]\\nfili: 2\\nvolume_attivo: 3\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\npassa a Scratch', 'action'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap3-primo-led\\ncomponenti: []\\nfili: 0\\nvolume_attivo: 1\\nsimulazione: stopped\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: false\\n\\n[MESSAGGIO]\\nnn capisco nnt aiuto', 'tutor'),
        ('[CONTESTO]\\ntab: simulator\\nesperimento: v1-cap6-potenziometro\\ncomponenti: [potentiometer1]\\nfili: 3\\nvolume_attivo: 1\\nsimulazione: running\\nbuild_mode: sandbox\\neditor_mode: arduino\\ncodice_presente: true\\n\\n[MESSAGGIO]\\ngira il potenziometro', 'action'),
    ]

    passed = 0
    for user_msg, expected in tests:
        text = text_tok.apply_chat_template(
            [{'role': 'system', 'content': _sp}, {'role': 'user', 'content': user_msg}],
            tokenize=False, add_generation_prompt=True, enable_thinking=False)
        inputs = text_tok(text, return_tensors='pt').to('cuda')
        out = model.generate(**inputs, max_new_tokens=512, temperature=0.1, do_sample=True)
        resp = text_tok.decode(out[0][inputs['input_ids'].shape[-1]:], skip_special_tokens=True).strip()
        if '</think>' in resp: resp = resp.split('</think>')[-1].strip()
        try:
            intent = json.loads(resp).get('intent', '???')
        except json.JSONDecodeError:
            m = re.search(r'\"intent\"\\s*:\\s*\"(\\w+)\"', resp)
            intent = m.group(1) if m else '???'
        ok = intent == expected
        if ok: passed += 1
        msg_short = user_msg.split('[MESSAGGIO]')[-1].strip()[:40]
        print(f'{\"OK\" if ok else \"FAIL\"} [{intent:10}] {msg_short}')

    print(f'\\n{tier_name}: {passed}/{len(tests)} PASS')

    # Back to training mode
    from unsloth import FastLanguageModel as FLM2
    FLM2.for_training(model)
    return passed

print('Funzioni pronte!')""")

# ─── CELL 5-9: One cell per tier ───
for t in range(1, 6):
    tier_name = f"tier-{t}"
    tier_titles = {
        1: "Precise Breadboard/Pin Control",
        2: "Multi-Component Chains + Wiring",
        3: "Slang/Typos/Multi-Language",
        4: "Vision Complex + Teacher + Debug",
        5: "Adversarial Edge Cases",
    }
    add_code(f"""# === TIER {t}: {tier_titles[t]} ===
print('Preparing {tier_name}...')
packed_train, packed_eval = prepare_tier('{tier_name}')
stats, lcb = train_tier('{tier_name}', packed_train, packed_eval, epochs=1)
print(f'\\nLoss finale: {{stats.training_loss:.4f}}')
print(f'VRAM picco: {{torch.cuda.max_memory_allocated()/1024**3:.1f}} GB')

# Test
print('\\n--- TEST DOPO {tier_name.upper()} ---')
score = test_model('{tier_name}')
if score < 7:
    print('ATTENZIONE: score basso, potrebbe servire piu training')""")

# ─── CELL 10: Final export ───
add_code("""# === CELL FINALE: EXPORT GGUF ===
import glob, shutil, json
from unsloth import FastLanguageModel as FLM

FLM.for_inference(model)
print('Export GGUF Q5_K_M...')
model.save_pretrained_gguf('v10-gguf', tokenizer, quantization_method='q5_k_m')

for f in glob.glob('v10-gguf*/*.gguf'):
    gb = os.path.getsize(f) / 1024**3
    shutil.copy(f, DRIVE)
    print(f'{os.path.basename(f)}: {gb:.2f} GB -> Drive')

print(f'\\nTUTTO SU DRIVE: {DRIVE}')
print('Deploy: ollama create galileo-brain -f Modelfile')""")

# ─── Build notebook ───
nb = {
    "nbformat": 4,
    "nbformat_minor": 0,
    "metadata": {
        "colab": {"provenance": []},
        "kernelspec": {"name": "python3", "display_name": "Python 3"},
        "accelerator": "GPU",
        "gpuClass": "standard",
    },
    "cells": cells,
}

out_path = os.path.expanduser("~/Downloads/GalileoBrainV10-Curriculum.ipynb")
with open(out_path, 'w') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

# Validate
with open(out_path) as f:
    nb2 = json.load(f)
print(f"Notebook: {out_path}")
print(f"Celle: {len(nb2['cells'])} | JSON OK")
for i, c in enumerate(nb2['cells']):
    src = ''.join(c.get('source', []))
    print(f"  [{i}] {c['cell_type']:8} {src.split(chr(10))[0][:55]}")
