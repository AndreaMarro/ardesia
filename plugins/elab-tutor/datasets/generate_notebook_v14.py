#!/usr/bin/env python3
"""
Galileo Brain V14 — Colab Notebook Generator

Target: Qwen3-4B (GQA, NOT Gated Delta Rule like Qwen3.5-2B)
Changes from V9:
  - Model: Qwen3.5-2B → Qwen3-4B (standard GQA → longer seq OK)
  - seq_len: 768 → 1024 (GQA scales linearly, not quadratically)
  - V14 system prompt with 7 intents + 4 simplified action tags
  - Dataset: V14 (155K examples, 372MB)
  - Export: Q4_K_M (4B model → more aggressive quantization for VPS)
  - No tokenizer.tokenizer hack needed (Qwen3-4B is not VL model)

OOM budget: ~6GB model + ~18GB training ≈ 24GB on A100 40GB

Usage:
    python3 generate_notebook_v14.py [--output PATH] [--epochs N]
"""

import json
import argparse
import os

VERSION = "v14"
MODEL = "unsloth/Qwen3-4B"
DATASET_NAME = "galileo-brain-v14.jsonl"
DATASET_EVAL = "galileo-brain-v14-eval.jsonl"
DATASET_SIZE_MB = 372
DATASET_LINES = 155_280
EVAL_LINES = 350

# V14 system prompt — aligned with production shared-optimized.yml v5.6
SYSTEM_PROMPT = """Sei il Galileo Brain, il cervello di routing di ELAB Tutor.
ELAB Tutor e' una piattaforma educativa di elettronica per ragazzi 10-14 anni e per i loro docenti.

Ricevi il messaggio dell'utente (studente O docente) + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura:
{
  "intent": "action|circuit|code|tutor|vision|navigation|teacher",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tipo:dettagli]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}

REGOLE:
1. "intent" classifica: action (play/pause/reset/interact), circuit (componenti/fili), code (Arduino/Scratch), tutor (teoria/spiegazioni), vision (analisi immagini), navigation (carica esperimenti/tab), teacher (richieste didattiche docente)
2. "entities": componenti, pin, esperimenti menzionati
3. "actions": array di [AZIONE:tipo:dettagli] — 4 tipi:
   - [AZIONE:play:start/pause/reset/clearall]
   - [AZIONE:build:add/remove/wire/setvalue/interact]
   - [AZIONE:code:compile/switch/open/write]
   - [AZIONE:show:loadexp/tab/highlight/measure/screenshot/quiz/nextstep/prevstep]
4. "needs_llm": false se puoi rispondere da solo, true se serve ragionamento
5. "response": frase breve calda (max 15 parole). Linguaggio 10-14 anni.
6. "llm_hint": se needs_llm=true, descrivi contesto per LLM grande

COMPONENTI VALIDI: led, resistor, push-button, buzzer-piezo, capacitor, potentiometer, photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo, reed-switch, phototransistor, battery9v, multimeter, lcd16x2, nano-r4-board, breadboard-half, breadboard-full, wire"""


def make_cell(source, cell_type='code'):
    """Create a notebook cell."""
    cell = {
        'cell_type': cell_type,
        'metadata': {},
        'source': source.split('\n') if isinstance(source, str) else source,
    }
    lines = cell['source']
    cell['source'] = [l + '\n' for l in lines[:-1]] + [lines[-1]] if lines else []
    if cell_type == 'code':
        cell['execution_count'] = None
        cell['outputs'] = []
    return cell


def generate_notebook(epochs=2, seq_len=1024, batch=2, grad_acc=8, save_every=500):
    """Generate the complete V14 notebook."""
    cells = []

    # ─── Cell 0: Header ───
    cells.append(make_cell(
        f'# Galileo Brain {VERSION}\n'
        f'**Qwen3-4B** QLoRA 4-bit | seq={seq_len} | LoRA r=16 | '
        f'batch {batch}x{grad_acc}={batch*grad_acc} | {DATASET_LINES:,} esempi\n\n'
        f'**Upgrade da V13** (Qwen3.5-2B): modello piu\' grande (4B), risposte integrate,\n'
        f'tag azioni allineati alla produzione (4 categorie: play/build/code/show).\n\n'
        f'Qwen3-4B usa GQA standard (non Gated Delta Rule) → seq_len={seq_len} sicuro.\n\n'
        f'> **Cell 1**: install (poi riavvia runtime) | **Cell 2-10**: esegui in ordine',
        cell_type='markdown'
    ))

    # ─── Cell 1: Install ───
    cells.append(make_cell(
        '# === CELL 1: INSTALL (poi Runtime > Riavvia sessione) ===\n'
        'import sys\n'
        "if 'google.colab' in sys.modules:\n"
        '    !pip install --no-deps trl peft accelerate bitsandbytes\n'
        "    !pip install 'unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git'\n"
        '    !pip install --no-deps xformers triton\n'
        "    !pip install 'transformers>=5.2.0,<=5.3.0' 'trl==0.22.2' datasets matplotlib numpy\n"
        "print('\\n=== ORA RIAVVIA: Runtime > Riavvia sessione ===')"
    ))

    # ─── Cell 2: Model + LoRA ───
    cells.append(make_cell(
        '# === CELL 2: MODELLO + LORA (dopo restart) ===\n'
        'from unsloth import FastLanguageModel\n'
        'import torch\n'
        '\n'
        f"# Qwen3-4B: GQA standard, non Gated Delta Rule come Qwen3.5-2B\n"
        f"# Questo permette seq_len={seq_len} senza OOM\n"
        'model, tokenizer = FastLanguageModel.from_pretrained(\n'
        f"    model_name='{MODEL}',\n"
        f'    max_seq_length={seq_len},\n'
        '    dtype=None,\n'
        '    load_in_4bit=True,\n'
        ')\n'
        '\n'
        'model = FastLanguageModel.get_peft_model(\n'
        '    model, r=16,\n'
        "    target_modules=['q_proj','k_proj','v_proj','o_proj','gate_proj','up_proj','down_proj'],\n"
        "    lora_alpha=32, lora_dropout=0, bias='none',\n"
        "    use_gradient_checkpointing='unsloth', random_state=3407,\n"
        ')\n'
        '\n'
        '# Qwen3-4B: tokenizer diretto (non VL processor come Qwen3.5)\n'
        "text_tok = tokenizer.tokenizer if hasattr(tokenizer, 'tokenizer') else tokenizer\n"
        '\n'
        'trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)\n'
        'total = sum(p.numel() for p in model.parameters())\n'
        f"print(f'Qwen3-4B QLoRA 4-bit, seq={seq_len}, LoRA r=16')\n"
        "print(f'Parametri trainabili: {trainable:,} / {total:,} ({100*trainable/total:.2f}%)')\n"
        "print(f'VRAM: {torch.cuda.memory_allocated()/1024**3:.1f} GB')"
    ))

    # ─── Cell 3: Upload + integrity check ───
    cells.append(make_cell(
        '# === CELL 3: UPLOAD DAL MAC + VERIFICA INTEGRITA ===\n'
        'from google.colab import files\n'
        'import os, json\n'
        '\n'
        f"print('Carica dal Mac:')\n"
        f"print('  1) {DATASET_NAME} ({DATASET_SIZE_MB} MB)')\n"
        f"print('  2) {DATASET_EVAL} (eval)')\n"
        'print()\n'
        'uploaded = files.upload()\n'
        '\n'
        'train_file = None\n'
        'eval_file = None\n'
        'for f in uploaded:\n'
        "    if f.endswith('.jsonl') and 'eval' not in f:\n"
        '        train_file = f\n'
        "    elif f.endswith('.jsonl') and 'eval' in f:\n"
        '        eval_file = f\n'
        '\n'
        'if not train_file:\n'
        "    raise FileNotFoundError('Nessun file train .jsonl caricato!')\n"
        '\n'
        '# === VERIFICA INTEGRITA ===\n'
        'errors = 0\n'
        'n_lines = 0\n'
        'with open(train_file) as f:\n'
        '    for i, line in enumerate(f):\n'
        '        n_lines += 1\n'
        '        try:\n'
        '            ex = json.loads(line)\n'
        "            assert 'messages' in ex\n"
        "            assert len(ex['messages']) == 3\n"
        "            assert ex['messages'][0]['role'] == 'system'\n"
        "            assert ex['messages'][1]['role'] == 'user'\n"
        "            assert ex['messages'][2]['role'] == 'assistant'\n"
        "            asst = json.loads(ex['messages'][2]['content'])\n"
        "            assert asst['intent'] in ('action','circuit','code','tutor','vision','navigation','teacher')\n"
        '        except Exception as e:\n'
        '            errors += 1\n'
        '            if errors <= 3:\n'
        "                print(f'  ERRORE riga {i}: {e}')\n"
        '\n'
        "print(f'\\nTRAIN: {train_file}')\n"
        "print(f'  Righe:  {n_lines:,}')\n"
        "print(f'  Size:   {os.path.getsize(train_file)/1024**2:.0f} MB')\n"
        "print(f'  Errori: {errors}')\n"
        'if errors > 0:\n'
        "    raise ValueError(f'DATASET CORROTTO: {errors} errori!')\n"
        "print(f'  INTEGRITA: OK')\n"
        '\n'
        'if eval_file:\n'
        "    n_eval = sum(1 for _ in open(eval_file))\n"
        "    print(f'\\nEVAL: {eval_file} ({n_eval:,} righe)')\n"
        f"print(f'\\nDATASET V14 VERIFICATO')"
    ))

    # ─── Cell 4: Dataset prep ───
    cells.append(make_cell(
        '# === CELL 4: PREPARA DATASET ===\n'
        'from datasets import load_dataset\n'
        'from collections import Counter\n'
        'import json, shutil, os\n'
        '\n'
        'if text_tok.pad_token is None:\n'
        '    text_tok.pad_token = text_tok.eos_token\n'
        '\n'
        '# Pulisci cache per evitare DatasetGenerationError\n'
        f"CACHE = '/tmp/hf_cache_{VERSION}'\n"
        'if os.path.exists(CACHE):\n'
        '    shutil.rmtree(CACHE)\n'
        "for d in ['/root/.cache/huggingface/datasets']:\n"
        '    if os.path.exists(d):\n'
        '        shutil.rmtree(d)\n'
        '\n'
        "train_ds = load_dataset('json', data_files=train_file, split='train', cache_dir=CACHE)\n"
        "eval_ds = load_dataset('json', data_files=eval_file, split='train', cache_dir=CACHE) if eval_file else None\n"
        '\n'
        'def fmt(ex):\n'
        "    return {'text': text_tok.apply_chat_template(\n"
        "        ex['messages'], tokenize=False, add_generation_prompt=False,\n"
        "        enable_thinking=False)}\n"  # Qwen3 thinking mode OFF
        '\n'
        'train_ds = train_ds.map(fmt, num_proc=4)\n'
        'if eval_ds:\n'
        '    eval_ds = eval_ds.map(fmt, num_proc=4)\n'
        '\n'
        '# Distribuzione intent\n'
        'ic = Counter()\n'
        'with open(train_file) as f:\n'
        '    for line in f:\n'
        '        try:\n'
        "            ic[json.loads(json.loads(line)['messages'][2]['content']).get('intent', '?')] += 1\n"
        '        except: pass\n'
        '\n'
        "print(f'Train: {len(train_ds):,} | Eval: {len(eval_ds) if eval_ds else 0}')\n"
        'for intent, count in sorted(ic.items(), key=lambda x: -x[1]):\n'
        '    pct = 100 * count / len(train_ds)\n'
        """    print(f'  {intent:12} {"#" * int(pct/2)} {count:,} ({pct:.1f}%)')"""
    ))

    # ─── Cell 5: Tokenize + Pack ───
    cells.append(make_cell(
        f'# === CELL 5: TOKENIZE + PACK {seq_len} ===\n'
        'from datasets import Dataset\n'
        '\n'
        f'SEQ_LEN = {seq_len}\n'
        "print(f'Tokenizzazione (max {SEQ_LEN} tok)...')\n"
        '\n'
        'def tok_fn(ex):\n'
        "    t = text_tok(ex['text'], truncation=True, max_length=SEQ_LEN)\n"
        "    return {'input_ids': t['input_ids'], 'attention_mask': t['attention_mask'], 'labels': t['input_ids']}\n"
        '\n'
        "cols = [c for c in train_ds.column_names if c not in ['input_ids', 'attention_mask', 'labels']]\n"
        'tok_train = train_ds.map(tok_fn, remove_columns=cols, num_proc=4)\n'
        'tok_eval = None\n'
        'if eval_ds:\n'
        "    ecols = [c for c in eval_ds.column_names if c not in ['input_ids', 'attention_mask', 'labels']]\n"
        '    tok_eval = eval_ds.map(tok_fn, remove_columns=ecols, num_proc=4)\n'
        '\n'
        "trunc = sum(1 for ex in tok_train if len(ex['input_ids']) >= SEQ_LEN)\n"
        "print(f'Troncati: {trunc}/{len(tok_train)} ({100*trunc/len(tok_train):.1f}%)')\n"
        '\n'
        "print(f'Packing {SEQ_LEN}...')\n"
        'def pack(ds, ml):\n'
        '    eos = text_tok.eos_token_id\n'
        '    ids, labs, masks = [], [], []\n'
        '    bi, bl = [], []\n'
        '    for ex in ds:\n'
        "        bi.extend(list(ex['input_ids']) + [eos])\n"
        "        bl.extend(list(ex['labels']) + [eos])\n"
        '        while len(bi) >= ml:\n'
        '            ids.append(bi[:ml]); labs.append(bl[:ml])\n'
        '            masks.append([1] * ml)\n'
        '            bi = bi[ml:]; bl = bl[ml:]\n'
        "    return Dataset.from_dict({'input_ids': ids, 'attention_mask': masks, 'labels': labs})\n"
        '\n'
        'packed_train = pack(tok_train, SEQ_LEN)\n'
        'packed_eval = pack(tok_eval, SEQ_LEN) if tok_eval else None\n'
        "print(f'{len(train_ds):,} -> {len(packed_train):,} packed sequences ({SEQ_LEN} tok)')"
    ))

    # ─── Cell 6: Trainer config ───
    cells.append(make_cell(
        '# === CELL 6: TRAINER + SAVE SU DRIVE ===\n'
        'from trl import SFTTrainer\n'
        'from transformers import TrainingArguments, DataCollatorForSeq2Seq, TrainerCallback\n'
        'from unsloth import is_bfloat16_supported\n'
        'from google.colab import drive\n'
        'import os, time\n'
        '\n'
        "drive.mount('/content/drive', force_remount=False)\n"
        f"DRIVE = '/content/drive/MyDrive/galileo-brain-{VERSION}-training'\n"
        'os.makedirs(DRIVE, exist_ok=True)\n'
        '\n'
        '# Callback: stampa loss live\n'
        'class LossLog(TrainerCallback):\n'
        '    def __init__(self):\n'
        '        self.t0 = None\n'
        '        self.tl = []\n'
        '        self.el = []\n'
        '\n'
        '    def on_train_begin(self, args, state, control, **kw):\n'
        '        self.t0 = time.time()\n'
        """        print(f'{"Step":>7} {"Loss":>10} {"EvalLoss":>10} {"Tempo":>8}')\n"""
        "        print('-' * 40)\n"
        '\n'
        '    def on_log(self, args, state, control, logs=None, **kw):\n'
        '        if not logs: return\n'
        '        s = state.global_step\n'
        '        t = (time.time() - self.t0) / 60 if self.t0 else 0\n'
        "        loss = logs.get('loss')\n"
        "        evl = logs.get('eval_loss')\n"
        '        if loss is not None:\n'
        '            self.tl.append((s, loss))\n'
        "            ev_str = f'{evl:.4f}' if evl is not None else ''\n"
        "            print(f'{s:>7} {loss:>10.4f} {ev_str:>10} {t:>7.0f}m')\n"
        '        if evl is not None:\n'
        '            self.el.append((s, evl))\n'
        '\n'
        '    def on_save(self, args, state, control, **kw):\n'
        "        print(f'  >> CHECKPOINT step {state.global_step} -> Drive')\n"
        '\n'
        'lcb = LossLog()\n'
        '\n'
        f'BATCH = {batch}\n'
        f'GRAD_ACC = {grad_acc}\n'
        f'EPOCHS = {epochs}\n'
        f'SAVE_EVERY = {save_every}\n'
        '\n'
        'trainer = SFTTrainer(\n'
        '    model=model, tokenizer=text_tok,\n'
        '    train_dataset=packed_train, eval_dataset=packed_eval,\n'
        '    packing=False,\n'
        '    data_collator=DataCollatorForSeq2Seq(tokenizer=text_tok, padding=False),\n'
        '    callbacks=[lcb],\n'
        '    args=TrainingArguments(\n'
        '        per_device_train_batch_size=BATCH,\n'
        '        gradient_accumulation_steps=GRAD_ACC,\n'
        '        num_train_epochs=EPOCHS,\n'
        '        learning_rate=2e-4,\n'
        "        lr_scheduler_type='cosine',\n"
        '        warmup_steps=100,\n'  # More warmup for larger model
        '        bf16=is_bfloat16_supported(),\n'
        '        fp16=not is_bfloat16_supported(),\n'
        "        optim='adamw_8bit',\n"
        "        eval_strategy='steps' if packed_eval else 'no',\n"
        '        eval_steps=SAVE_EVERY if packed_eval else None,\n'
        "        save_strategy='steps',\n"
        '        save_steps=SAVE_EVERY,\n'
        '        save_total_limit=3,\n'
        '        load_best_model_at_end=True if packed_eval else False,\n'
        "        metric_for_best_model='eval_loss' if packed_eval else None,\n"
        '        logging_steps=25,\n'
        "        report_to='none',\n"
        f"        output_dir=DRIVE + '/checkpoints',\n"
        '        seed=3407,\n'
        '        remove_unused_columns=False,\n'
        '    ),\n'
        ')\n'
        '\n'
        'steps_epoch = len(packed_train) // (BATCH * GRAD_ACC)\n'
        "print(f'\\nTrainer pronto:')\n"
        "print(f'  Modello: Qwen3-4B QLoRA 4-bit')\n"
        "print(f'  Batch: {BATCH}x{GRAD_ACC} = {BATCH*GRAD_ACC}')\n"
        "print(f'  Steps: ~{steps_epoch*EPOCHS:,} totali ({EPOCHS} epoche)')\n"
        "print(f'  Checkpoint ogni {SAVE_EVERY} steps -> Drive')"
    ))

    # ─── Cell 7: Training + Graphs ───
    cells.append(make_cell(
        '# === CELL 7: TRAINING + GRAFICI ===\n'
        'import matplotlib.pyplot as plt\n'
        'import numpy as np\n'
        '\n'
        "print('TRAINING...\\n')\n"
        'stats = trainer.train()\n'
        '\n'
        "print(f'\\n{\"=\"*50}')\n"
        "print(f'Loss finale: {stats.training_loss:.4f}')\n"
        "print(f'Steps: {stats.global_step}')\n"
        "print(f'VRAM picco: {torch.cuda.max_memory_allocated()/1024**3:.1f} GB')\n"
        "print(f'{\"=\"*50}')\n"
        '\n'
        'fig, (a1, a2) = plt.subplots(1, 2, figsize=(14, 5))\n'
        '\n'
        'if lcb.tl:\n'
        '    s, l = zip(*lcb.tl)\n'
        "    a1.plot(s, l, color='#1E4D8C', lw=1, alpha=0.5, label='raw')\n"
        '    w = max(1, min(20, len(l) // 5))\n'
        '    if w > 1:\n'
        "        sm = np.convolve(l, np.ones(w) / w, mode='valid')\n"
        "        a1.plot(list(s)[w-1:], sm, color='red', lw=2, label='smooth')\n"
        f"    a1.legend(); a1.set_title('Train Loss — Qwen3-4B {VERSION}'); a1.set_xlabel('Step'); a1.grid(True, alpha=0.3)\n"
        '\n'
        'if lcb.el:\n'
        '    s, l = zip(*lcb.el)\n'
        "    a2.plot(s, l, color='#7CB342', lw=2, marker='o', ms=5)\n"
        '    mi = list(l).index(min(l))\n'
        "    a2.annotate(f'min: {l[mi]:.4f}', xy=(s[mi], l[mi]), fontsize=10, color='red',\n"
        "               xytext=(10, 10), textcoords='offset points',\n"
        "               arrowprops=dict(arrowstyle='->', color='red'))\n"
        "    a2.set_title('Eval Loss'); a2.set_xlabel('Step'); a2.grid(True, alpha=0.3)\n"
        'else:\n'
        "    a2.text(0.5, 0.5, 'No eval', ha='center', va='center', fontsize=14)\n"
        '\n'
        'plt.tight_layout()\n'
        f"plt.savefig(DRIVE + '/loss-{VERSION}.png', dpi=150)\n"
        'plt.show()\n'
        f"print(f'Grafici: {{DRIVE}}/loss-{VERSION}.png')"
    ))

    # ─── Cell 8: Test inference ───
    cells.append(make_cell(
        '# === CELL 8: TEST INFERENZA ===\n'
        'from unsloth import FastLanguageModel\n'
        'import json, re\n'
        '\n'
        'FastLanguageModel.for_inference(model)\n'
        '\n'
        "sp = '''" + SYSTEM_PROMPT + "'''\n"
        '\n'
        "CTX = '''[CONTESTO]\n"
        'tab: simulator\n'
        'esperimento: v1-cap6-esp1\n'
        'componenti: [led1, resistor1, nano-r4-board1]\n'
        'fili: 3\n'
        'volume_attivo: 1\n'
        'simulazione: stopped\n'
        'build_mode: sandbox\n'
        'editor_mode: arduino\n'
        'codice_presente: true\n'
        '\n'
        "[MESSAGGIO]\n'''\n"
        '\n'
        '# V14 test suite: focus sulle aree deboli (action, navigation, circuit)\n'
        'tests = [\n'
        '    # ACTION (era 2.4% — target: >=80%)\n'
        "    ('avvia la simulazione', 'action', '[AZIONE:play:start]'),\n"
        "    ('ferma tutto', 'action', '[AZIONE:play:pause]'),\n"
        "    ('gira il potenziometro', 'action', '[AZIONE:build:interact]'),\n"
        "    ('passa a Scratch', 'action', '[AZIONE:code:switch]'),\n"
        '    # CIRCUIT (era 0% — target: >=70%)\n'
        "    ('metti un LED rosso', 'circuit', '[AZIONE:build:add]'),\n"
        "    ('collega il filo dal LED alla resistenza', 'circuit', '[AZIONE:build:wire]'),\n"
        '    # NAVIGATION (era 0% — target: >=70%)\n'
        "    ('carica il primo esperimento', 'navigation', '[AZIONE:show:loadexp]'),\n"
        "    ('vai al prossimo passo', 'navigation', '[AZIONE:show:nextstep]'),\n"
        '    # TUTOR (era 92.9% — mantieni)\n'
        "    (\"cos'e' la legge di Ohm?\", 'tutor', None),\n"
        '    # CODE\n'
        "    ('scrivi il codice per il LED', 'code', '[AZIONE:code:write]'),\n"
        '    # VISION\n'
        "    ('guarda il mio circuito', 'vision', None),\n"
        '    # TEACHER\n'
        "    ('come spiego il LED ai ragazzi?', 'teacher', None),\n"
        '    # ADVERSARIAL\n'
        "    ('nn capisco nnt aiuto', 'tutor', None),\n"
        "    ('senti ho messo tutto ma nn va il led nn si accende', 'circuit', '[AZIONE:show:highlight]'),\n"
        ']\n'
        '\n'
        'passed = 0\n'
        'for msg, exp_intent, exp_action in tests:\n'
        '    text = text_tok.apply_chat_template(\n'
        "        [{'role': 'system', 'content': sp}, {'role': 'user', 'content': CTX + msg}],\n"
        '        tokenize=False, add_generation_prompt=True, enable_thinking=False)\n'
        "    inputs = text_tok(text, return_tensors='pt').to('cuda')\n"
        '    out = model.generate(**inputs, max_new_tokens=512, temperature=0.1, do_sample=True)\n'
        "    resp = text_tok.decode(out[0][inputs['input_ids'].shape[-1]:], skip_special_tokens=True).strip()\n"
        "    if '</think>' in resp:\n"
        "        resp = resp.split('</think>')[-1].strip()\n"
        '    try:\n'
        '        parsed = json.loads(resp)\n'
        "        intent = parsed.get('intent', '???')\n"
        "        actions = parsed.get('actions', [])\n"
        "        response = parsed.get('response', '')\n"
        '    except json.JSONDecodeError:\n'
        '        m = re.search(r\'"intent"\\s*:\\s*"(\\w+)"\', resp)\n'
        "        intent = m.group(1) if m else '???'\n"
        "        actions = []; response = ''\n"
        '\n'
        '    intent_ok = intent == exp_intent\n'
        '    action_ok = True\n'
        '    if exp_action:\n'
        '        action_ok = any(exp_action.split(":")[1] in str(a) for a in actions)\n'
        '    ok = intent_ok and action_ok\n'
        '    if ok: passed += 1\n'
        '\n'
        """    status = "OK" if ok else "FAIL"\n"""
        """    i_mark = "v" if intent_ok else "X"\n"""
        """    a_mark = "v" if action_ok else "X"\n"""
        """    print(f'{status} intent={i_mark} action={a_mark} [{intent:10}] {msg[:40]}')\n"""
        '    if response:\n'
        """        print(f'   Risposta: {str(response)[:60]}')\n"""
        '    if not ok:\n'
        """        print(f'   Raw: {resp[:100]}')\n"""
        '\n'
        "print(f'\\n{passed}/{len(tests)} PASS')\n"
        "print(f'Intent accuracy target: action>=80%, circuit>=70%, navigation>=70%')"
    ))

    # ─── Cell 9: Export GGUF ───
    cells.append(make_cell(
        f'# === CELL 9: EXPORT GGUF Q4_K_M + SALVA SU DRIVE ===\n'
        'import os, glob, shutil, json\n'
        '\n'
        f"print('Export GGUF Q4_K_M (4B → quantizzazione aggressiva per VPS)...')\n"
        f"model.save_pretrained_gguf('{VERSION}-gguf', tokenizer, quantization_method='q4_k_m')\n"
        '\n'
        f"for f in glob.glob('{VERSION}-gguf/*.gguf'):\n"
        '    gb = os.path.getsize(f) / 1024**3\n'
        '    shutil.copy(f, DRIVE)\n'
        "    print(f'{os.path.basename(f)}: {gb:.2f} GB -> Drive')\n"
        '\n'
        f"for f in glob.glob('{VERSION}-gguf/Modelfile*'):\n"
        '    shutil.copy(f, DRIVE)\n'
        '\n'
        f"with open(DRIVE + '/log-{VERSION}.json', 'w') as f:\n"
        '    json.dump(trainer.state.log_history, f)\n'
        f"with open(DRIVE + '/loss-data-{VERSION}.json', 'w') as f:\n"
        "    json.dump({'train': lcb.tl, 'eval': lcb.el}, f)\n"
        '\n'
        f"print(f'\\nTutto su Drive: {{DRIVE}}')\n"
        f"print(f'  - GGUF Q4_K_M (Qwen3-4B)')\n"
        f"print(f'  - loss-{VERSION}.png + loss-data-{VERSION}.json')\n"
        f"print(f'  - log-{VERSION}.json')\n"
        f"print(f'  - checkpoints/')\n"
        f"print(f'\\nDeploy:')\n"
        f"print(f'  ollama create galileo-brain-{VERSION} -f Modelfile')\n"
        f"print(f'  ollama run galileo-brain-{VERSION}')"
    ))

    # ─── Cell 10: Deploy instructions ───
    cells.append(make_cell(
        f'# Deploy su Mac/VPS\n'
        f'Dopo aver scaricato il GGUF da Google Drive:\n\n'
        f'```bash\n'
        f'# Download da Drive\n'
        f'mkdir -p ~/models/galileo-brain-{VERSION}\n'
        f'cp galileo-brain-{VERSION}-Q4_K_M.gguf ~/models/galileo-brain-{VERSION}/\n\n'
        f'# Crea Modelfile\n'
        f"cat > ~/models/galileo-brain-{VERSION}/Modelfile << 'EOF'\n"
        f'FROM ./galileo-brain-{VERSION}-Q4_K_M.gguf\n'
        f'PARAMETER temperature 0.1\n'
        f'PARAMETER top_p 0.9\n'
        f'PARAMETER num_ctx 2048\n'
        f'PARAMETER stop <|im_end|>\n'
        f'TEMPLATE """<|im_start|>system\n'
        f'{{{{ .System }}}}<|im_end|>\n'
        f'<|im_start|>user\n'
        f'{{{{ .Prompt }}}}<|im_end|>\n'
        f'<|im_start|>assistant\n'
        f'"""\n'
        f'EOF\n\n'
        f'# Build e test\n'
        f'cd ~/models/galileo-brain-{VERSION}\n'
        f'ollama create galileo-brain-{VERSION} -f Modelfile\n'
        f'ollama run galileo-brain-{VERSION}\n'
        f'```\n\n'
        f'**Verifica**: testa con il blocco [CONTESTO] + [MESSAGGIO] — il modello NON funziona senza contesto.',
        cell_type='markdown'
    ))

    # ─── Assemble notebook ───
    notebook = {
        'nbformat': 4,
        'nbformat_minor': 5,
        'metadata': {
            'kernelspec': {
                'display_name': 'Python 3',
                'language': 'python',
                'name': 'python3'
            },
            'language_info': {
                'name': 'python',
                'version': '3.10.0'
            },
            'accelerator': 'GPU',
            'gpuClass': 'premium'
        },
        'cells': cells
    }
    return notebook


def validate_notebook(nb):
    """Validate notebook JSON structure."""
    assert nb['nbformat'] == 4
    assert len(nb['cells']) >= 10, f"Expected >=10 cells, got {len(nb['cells'])}"
    for i, cell in enumerate(nb['cells']):
        assert 'cell_type' in cell, f'Cell {i}: missing cell_type'
        assert 'source' in cell, f'Cell {i}: missing source'
        if cell['cell_type'] == 'code':
            assert 'execution_count' in cell, f'Cell {i}: missing execution_count'
            assert 'outputs' in cell, f'Cell {i}: missing outputs'
    return True


def main():
    parser = argparse.ArgumentParser(description=f'Generate Galileo Brain {VERSION} training notebook')
    parser.add_argument('--output', '-o', default=os.path.expanduser(f'~/Downloads/GalileoBrain{VERSION.upper()}.ipynb'))
    parser.add_argument('--epochs', type=int, default=2)
    parser.add_argument('--seq-len', type=int, default=1024)
    parser.add_argument('--batch', type=int, default=2)
    parser.add_argument('--grad-acc', type=int, default=8)
    parser.add_argument('--save-every', type=int, default=500)
    args = parser.parse_args()

    nb = generate_notebook(
        epochs=args.epochs,
        seq_len=args.seq_len,
        batch=args.batch,
        grad_acc=args.grad_acc,
        save_every=args.save_every,
    )

    validate_notebook(nb)

    with open(args.output, 'w') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)

    # Verify valid JSON
    with open(args.output) as f:
        json.load(f)

    size = os.path.getsize(args.output)
    n_cells = len(nb['cells'])
    print(f'Notebook generato: {args.output}')
    print(f'  Celle: {n_cells} | Size: {size:,} bytes | JSON OK')
    print(f'  Modello: Qwen3-4B (GQA) | Epochs: {args.epochs} | Seq: {args.seq_len} | Batch: {args.batch}x{args.grad_acc}')
    print(f'  Dataset: {DATASET_NAME} ({DATASET_LINES:,} esempi, {DATASET_SIZE_MB} MB)')
    print(f'\nCarica su Colab:')
    print(f'  1. colab.research.google.com')
    print(f'  2. File > Carica notebook > Upload > {os.path.basename(args.output)}')
    print(f'  3. Runtime > Cambia tipo di runtime > A100')
    print(f'  4. Esegui Cell 1, riavvia, poi Cell 2 in poi')


if __name__ == '__main__':
    main()
