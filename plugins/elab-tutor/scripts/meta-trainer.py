#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
  GALILEO BRAIN — Meta-Trainer
═══════════════════════════════════════════════════════════════════
  Il sistema che SA ADDESTRARE qualsiasi modello futuro per ELAB.

  NON e' un semplice script di training — e' un ORCHESTRATORE
  che automatizza l'intero ciclo:
    Discovery → Generate → Train → Test → Analyze → Refine → Loop

  USO:
    # Scopri le caratteristiche di un modello
    python3 scripts/meta-trainer.py discover --base-model qwen3-4b

    # Genera dataset per un modello specifico
    python3 scripts/meta-trainer.py generate --base-model qwen3-4b --count 2000

    # Testa un modello gia addestrato (via Ollama)
    python3 scripts/meta-trainer.py test --model galileo-brain

    # Analizza l'ultimo report e identifica weak areas
    python3 scripts/meta-trainer.py analyze

    # Genera dati di raffinamento per le weak areas trovate
    python3 scripts/meta-trainer.py refine --model galileo-brain

    # Ciclo completo automatico (tutte le fasi)
    python3 scripts/meta-trainer.py full-cycle --base-model qwen3-4b --target-grade S

  (c) Andrea Marro — 07/03/2026
═══════════════════════════════════════════════════════════════════
"""

import json
import argparse
import subprocess
import sys
import os
import re
import time
import glob
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

# ─────────────────── PATHS ───────────────────
BASE_DIR = Path(__file__).parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"
SCRIPTS_DIR = BASE_DIR / "scripts"
REPORTS_DIR = DATASETS_DIR
DOCS_DIR = BASE_DIR / "docs"

# ─────────────────── MODEL REGISTRY ───────────────────
# Ogni modello supportato con le sue caratteristiche
MODEL_REGISTRY = {
    "qwen3-4b": {
        "full_name": "unsloth/Qwen3-4B-bnb-4bit",
        "params": "3.8B",
        "vram_min_gb": 6,
        "chat_template": "chatml",
        "unsloth_supported": True,
        "default_r": 64,
        "default_alpha": 128,
        "default_lr": 2e-4,
        "default_epochs": 3,
        "default_batch": 2,
        "max_seq": 2048,
        "stop_tokens": ["<|im_end|>", "<|im_start|>"],
        "notes": "Attuale modello di produzione. Proven V1+V2."
    },
    "qwen3-8b": {
        "full_name": "unsloth/Qwen3-8B-bnb-4bit",
        "params": "8B",
        "vram_min_gb": 10,
        "chat_template": "chatml",
        "unsloth_supported": True,
        "default_r": 64,
        "default_alpha": 128,
        "default_lr": 1.5e-4,
        "default_epochs": 2,
        "default_batch": 1,
        "max_seq": 2048,
        "stop_tokens": ["<|im_end|>", "<|im_start|>"],
        "notes": "Piu potente, stesso template. Richiede piu VRAM."
    },
    "llama-3.2-3b": {
        "full_name": "unsloth/Llama-3.2-3B-bnb-4bit",
        "params": "3.2B",
        "vram_min_gb": 5,
        "chat_template": "llama3",
        "unsloth_supported": True,
        "default_r": 32,
        "default_alpha": 64,
        "default_lr": 3e-4,
        "default_epochs": 4,
        "default_batch": 2,
        "max_seq": 2048,
        "stop_tokens": ["<|eot_id|>"],
        "notes": "Efficiente, ottimo reasoning. Template diverso da ChatML."
    },
    "llama-3.2-1b": {
        "full_name": "unsloth/Llama-3.2-1B-bnb-4bit",
        "params": "1.2B",
        "vram_min_gb": 3,
        "chat_template": "llama3",
        "unsloth_supported": True,
        "default_r": 32,
        "default_alpha": 64,
        "default_lr": 3e-4,
        "default_epochs": 5,
        "default_batch": 4,
        "max_seq": 2048,
        "stop_tokens": ["<|eot_id|>"],
        "notes": "Ultra-leggero. Potrebbe non avere capacita sufficiente per JSON complesso."
    },
    "mistral-7b": {
        "full_name": "unsloth/mistral-7b-bnb-4bit",
        "params": "7.3B",
        "vram_min_gb": 12,
        "chat_template": "mistral",
        "unsloth_supported": True,
        "default_r": 64,
        "default_alpha": 128,
        "default_lr": 1e-4,
        "default_epochs": 2,
        "default_batch": 1,
        "max_seq": 4096,
        "stop_tokens": ["</s>"],
        "notes": "Forte su struttura, puo essere verboso. Richiede GPU 12GB+."
    },
    "gemma-2-2b": {
        "full_name": "unsloth/gemma-2-2b-bnb-4bit",
        "params": "2.6B",
        "vram_min_gb": 4,
        "chat_template": "gemma",
        "unsloth_supported": True,
        "default_r": 32,
        "default_alpha": 64,
        "default_lr": 3e-4,
        "default_epochs": 4,
        "default_batch": 4,
        "max_seq": 2048,
        "stop_tokens": ["<end_of_turn>"],
        "notes": "Google, compatto, buon output JSON."
    },
    "phi-3-mini": {
        "full_name": "unsloth/Phi-3-mini-4k-instruct-bnb-4bit",
        "params": "3.8B",
        "vram_min_gb": 5,
        "chat_template": "phi3",
        "unsloth_supported": True,
        "default_r": 32,
        "default_alpha": 64,
        "default_lr": 2e-4,
        "default_epochs": 3,
        "default_batch": 2,
        "max_seq": 2048,
        "stop_tokens": ["<|end|>"],
        "notes": "Microsoft, forte reasoning. Buon candidato."
    },
}

# ─────────────────── CHAT TEMPLATES ───────────────────
CHAT_TEMPLATES = {
    "chatml": {
        "system_start": "<|im_start|>system\n",
        "system_end": "<|im_end|>\n",
        "user_start": "<|im_start|>user\n",
        "user_end": "<|im_end|>\n",
        "assistant_start": "<|im_start|>assistant\n",
        "assistant_end": "<|im_end|>\n",
        "ollama_template": '{{- if .System }}<|im_start|>system\n{{ .System }}<|im_end|>\n{{ end }}<|im_start|>user\n{{ .Prompt }}<|im_end|>\n<|im_start|>assistant\n{{ .Response }}<|im_end|>\n',
    },
    "llama3": {
        "system_start": "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n",
        "system_end": "<|eot_id|>",
        "user_start": "<|start_header_id|>user<|end_header_id|>\n\n",
        "user_end": "<|eot_id|>",
        "assistant_start": "<|start_header_id|>assistant<|end_header_id|>\n\n",
        "assistant_end": "<|eot_id|>",
        "ollama_template": '{{- if .System }}<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{{ .System }}<|eot_id|>{{ end }}<|start_header_id|>user<|end_header_id|>\n\n{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n{{ .Response }}<|eot_id|>',
    },
    "mistral": {
        "system_start": "[INST] ",
        "system_end": "\n\n",
        "user_start": "",
        "user_end": " [/INST]",
        "assistant_start": "",
        "assistant_end": "</s>",
        "ollama_template": '[INST] {{ if .System }}{{ .System }}\n\n{{ end }}{{ .Prompt }} [/INST]{{ .Response }}</s>',
    },
    "gemma": {
        "system_start": "<start_of_turn>user\n",
        "system_end": "\n",
        "user_start": "",
        "user_end": "<end_of_turn>\n",
        "assistant_start": "<start_of_turn>model\n",
        "assistant_end": "<end_of_turn>\n",
        "ollama_template": '<start_of_turn>user\n{{ if .System }}{{ .System }}\n{{ end }}{{ .Prompt }}<end_of_turn>\n<start_of_turn>model\n{{ .Response }}<end_of_turn>\n',
    },
    "phi3": {
        "system_start": "<|system|>\n",
        "system_end": "<|end|>\n",
        "user_start": "<|user|>\n",
        "user_end": "<|end|>\n",
        "assistant_start": "<|assistant|>\n",
        "assistant_end": "<|end|>\n",
        "ollama_template": '{{ if .System }}<|system|>\n{{ .System }}<|end|>\n{{ end }}<|user|>\n{{ .Prompt }}<|end|>\n<|assistant|>\n{{ .Response }}<|end|>\n',
    },
}

# ─────────────────── GRADING ───────────────────
GRADES = [
    ("S", 98.0, "Eccellenza — Pronto per produzione"),
    ("A", 95.0, "Ottimo — Quasi pronto, piccoli fix"),
    ("B", 90.0, "Buono — Necessita raffinamento mirato"),
    ("C", 80.0, "Sufficiente — Diverse aree deboli"),
    ("D", 70.0, "Insufficiente — Raffinamento sostanziale"),
    ("F", 0.0, "Fallimento — Considera cambio modello"),
]

def get_grade(score: float) -> Tuple[str, str]:
    for letter, threshold, desc in GRADES:
        if score >= threshold:
            return letter, desc
    return "F", "Fallimento"


# ═══════════════════════════════════════════════════════════════
# FASE 0: DISCOVERY
# ═══════════════════════════════════════════════════════════════

def cmd_discover(args):
    """Identifica le caratteristiche di un modello e suggerisce configurazione."""
    model_key = args.base_model.lower().replace(" ", "-")

    if model_key not in MODEL_REGISTRY:
        print(f"\n[ERRORE] Modello '{model_key}' non trovato nel registry.")
        print(f"Modelli supportati:")
        for k, v in MODEL_REGISTRY.items():
            print(f"  {k:20s} — {v['params']:6s} params, {v['vram_min_gb']}GB VRAM, template: {v['chat_template']}")
        print(f"\nPer aggiungere un modello, modifica MODEL_REGISTRY in meta-trainer.py")
        return

    model = MODEL_REGISTRY[model_key]
    template = CHAT_TEMPLATES[model["chat_template"]]

    print(f"""
{'='*60}
  GALILEO BRAIN META-TRAINER — DISCOVERY
{'='*60}

  Modello:        {model_key}
  Nome completo:  {model['full_name']}
  Parametri:      {model['params']}
  VRAM minima:    {model['vram_min_gb']} GB
  Chat template:  {model['chat_template']}
  Unsloth:        {'SI' if model['unsloth_supported'] else 'NO'}

  HYPERPARAMETERS CONSIGLIATI:
  LoRA rank (r):  {model['default_r']}
  LoRA alpha:     {model['default_alpha']}
  Learning rate:  {model['default_lr']}
  Epochs:         {model['default_epochs']}
  Batch size:     {model['default_batch']}
  Max seq length: {model['max_seq']}

  Stop tokens:    {model['stop_tokens']}

  NOTE: {model['notes']}

  OLLAMA TEMPLATE:
  {template['ollama_template'][:200]}...

{'='*60}
  Prossimo passo: python3 scripts/meta-trainer.py generate --base-model {model_key}
{'='*60}
""")


# ═══════════════════════════════════════════════════════════════
# FASE 1: DATASET GENERATION (converte formato)
# ═══════════════════════════════════════════════════════════════

def cmd_generate(args):
    """Genera o converte dataset nel formato del modello target."""
    model_key = args.base_model.lower().replace(" ", "-")

    if model_key not in MODEL_REGISTRY:
        print(f"[ERRORE] Modello '{model_key}' non in registry. Usa 'discover' prima.")
        return

    model = MODEL_REGISTRY[model_key]
    source = args.source or str(DATASETS_DIR / "galileo-brain-v2.jsonl")
    count = args.count or 0  # 0 = usa tutto il source

    if not os.path.exists(source):
        print(f"[ERRORE] Dataset sorgente non trovato: {source}")
        print(f"Genera prima con: python3 scripts/generate-brain-dataset-v2.py")
        return

    # Leggi dataset sorgente (formato ChatML)
    examples = []
    with open(source, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    examples.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    if count > 0 and count < len(examples):
        import random
        random.seed(2026)
        examples = random.sample(examples, count)

    # Se il modello usa ChatML, non serve conversione
    if model["chat_template"] == "chatml":
        output_path = DATASETS_DIR / f"galileo-brain-{model_key}-v1.jsonl"
        with open(output_path, 'w', encoding='utf-8') as f:
            for ex in examples:
                f.write(json.dumps(ex, ensure_ascii=True) + '\n')
        print(f"\n[OK] Dataset copiato (gia ChatML): {output_path}")
        print(f"     {len(examples)} esempi")
        return

    # Converti al formato del modello target
    output_path = DATASETS_DIR / f"galileo-brain-{model_key}-v1.jsonl"
    converted = 0

    with open(output_path, 'w', encoding='utf-8') as f:
        for ex in examples:
            msgs = ex.get("messages", [])
            if len(msgs) < 3:
                continue

            system_content = msgs[0].get("content", "")
            user_content = msgs[1].get("content", "")
            assistant_content = msgs[2].get("content", "")

            # Il formato di output dipende dal framework di training
            # Per Unsloth/HuggingFace, il formato messages e' universale
            # ma il tokenizer gestisce il template
            converted_ex = {
                "messages": [
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": user_content},
                    {"role": "assistant", "content": assistant_content},
                ]
            }
            f.write(json.dumps(converted_ex, ensure_ascii=True) + '\n')
            converted += 1

    print(f"\n[OK] Dataset convertito per {model_key}: {output_path}")
    print(f"     {converted} esempi (template: {model['chat_template']})")
    print(f"     Nota: Unsloth applica il chat_template del modello automaticamente.")


# ═══════════════════════════════════════════════════════════════
# FASE 3: TEST (delega a test-brain-complete.py)
# ═══════════════════════════════════════════════════════════════

def cmd_test(args):
    """Esegue i 200 test automatici via test-brain-complete.py."""
    model = args.model or "galileo-brain"
    test_script = SCRIPTS_DIR / "test-brain-complete.py"

    if not test_script.exists():
        print(f"[ERRORE] Script di test non trovato: {test_script}")
        return

    cmd = [sys.executable, str(test_script), "--full", "--report", "--model", model]
    if args.verbose:
        cmd.append("--verbose")

    print(f"\n{'='*60}")
    print(f"  GALILEO BRAIN META-TRAINER — TEST")
    print(f"  Modello: {model}")
    print(f"  Comando: {' '.join(cmd)}")
    print(f"{'='*60}\n")

    result = subprocess.run(cmd, capture_output=False)
    return result.returncode


# ═══════════════════════════════════════════════════════════════
# FASE 4: ANALYZE (trova weak areas nell'ultimo report)
# ═══════════════════════════════════════════════════════════════

def cmd_analyze(args):
    """Analizza l'ultimo report e identifica le weak areas."""
    # Trova l'ultimo report
    reports = sorted(glob.glob(str(REPORTS_DIR / "brain-test-report-*.md")))
    if not reports:
        print("[ERRORE] Nessun report trovato. Esegui 'test' prima.")
        return

    latest = reports[-1]
    print(f"\n{'='*60}")
    print(f"  ANALISI REPORT: {os.path.basename(latest)}")
    print(f"{'='*60}\n")

    with open(latest, 'r') as f:
        content = f.read()

    # Estrai grado
    grade_match = re.search(r'Overall Grade:\s*(\w)\s*\((\d+\.?\d*)%\)', content)
    if grade_match:
        grade = grade_match.group(1)
        score = float(grade_match.group(2))
        print(f"  Grado: {grade} ({score}%)")
        _, desc = get_grade(score)
        print(f"  Stato: {desc}")
    else:
        print("  [WARN] Grado non trovato nel report")
        score = 0

    # Estrai categorie con score basso
    weak_areas = []
    category_pattern = re.compile(r'(\w+)\s+\|\s+(\d+)/(\d+)\s+\|\s+(\d+\.?\d*)%')
    for match in category_pattern.finditer(content):
        cat = match.group(1)
        passed = int(match.group(2))
        total = int(match.group(3))
        pct = float(match.group(4))
        if pct < 95.0:
            weak_areas.append((cat, pct, passed, total))

    if weak_areas:
        print(f"\n  AREE DEBOLI (< 95%):")
        for cat, pct, passed, total in sorted(weak_areas, key=lambda x: x[1]):
            print(f"    {cat:20s}: {pct:5.1f}% ({passed}/{total})")

        print(f"\n  RACCOMANDAZIONI:")
        weak_map = {
            "action": "play_pause",
            "stress_action": "play_pause",
            "circuit": "circuit_placement",
            "stress_circuit": "circuit_placement",
            "navigation": "navigation",
            "stress_nav": "navigation",
            "code": "code",
            "stress_code": "code",
            "tutor": "tutor_theory",
            "stress_tutor": "tutor_theory",
            "vision": "vision",
            "stress_vision": "vision",
            "edge": "edge_typo",
            "stress_edge": "edge_typo",
        }

        for cat, pct, _, _ in weak_areas:
            area = weak_map.get(cat, "all")
            count = max(30, int((95 - pct) * 3))
            print(f"    python3 scripts/generate-refinement.py --weak-area {area} --count {count}")
    else:
        print(f"\n  Nessuna area debole! Il modello e' pronto per produzione.")

    return weak_areas


# ═══════════════════════════════════════════════════════════════
# FASE 5: REFINE (genera dati mirati per weak areas)
# ═══════════════════════════════════════════════════════════════

def cmd_refine(args):
    """Genera dati di raffinamento per le weak areas trovate."""
    # Prima analizza
    weak_areas = cmd_analyze(args)

    if not weak_areas:
        print("\n[OK] Nessun raffinamento necessario!")
        return

    refine_script = SCRIPTS_DIR / "generate-refinement.py"
    if not refine_script.exists():
        print(f"[ERRORE] Script di refinement non trovato: {refine_script}")
        return

    weak_map = {
        "action": "play_pause",
        "stress_action": "play_pause",
        "circuit": "circuit_placement",
        "stress_circuit": "circuit_placement",
        "navigation": "navigation",
        "code": "code",
        "tutor": "tutor_theory",
        "vision": "vision",
        "edge": "edge_typo",
    }

    generated_files = []

    for cat, pct, _, _ in weak_areas:
        area = weak_map.get(cat)
        if not area:
            continue
        count = max(30, int((98 - pct) * 3))
        output = DATASETS_DIR / f"refinement-{area}-{count}.jsonl"

        cmd = [sys.executable, str(refine_script),
               "--weak-area", area, "--count", str(count),
               "--output", str(output)]

        print(f"\n  Generando {count} esempi per '{area}'...")
        subprocess.run(cmd, capture_output=True)
        if output.exists():
            generated_files.append(str(output))
            print(f"  [OK] {output}")

    if generated_files:
        # Merge con dataset originale
        source = args.source or str(DATASETS_DIR / "galileo-brain-v2.jsonl")
        version = "v3"  # Incrementa dalla v2

        # Determina prossima versione
        existing = sorted(glob.glob(str(DATASETS_DIR / "galileo-brain-v*.jsonl")))
        if existing:
            last = os.path.basename(existing[-1])
            v_match = re.search(r'v(\d+)', last)
            if v_match:
                version = f"v{int(v_match.group(1)) + 1}"

        merged = DATASETS_DIR / f"galileo-brain-{version}.jsonl"

        print(f"\n  Merging dataset...")
        total = 0
        with open(merged, 'w', encoding='utf-8') as out:
            # Originale
            with open(source, 'r', encoding='utf-8') as f:
                for line in f:
                    out.write(line)
                    total += 1
            # Refinements
            for rf in generated_files:
                with open(rf, 'r', encoding='utf-8') as f:
                    for line in f:
                        out.write(line)
                        total += 1

        print(f"  [OK] Dataset merged: {merged} ({total} esempi)")
        print(f"\n  PROSSIMO PASSO:")
        print(f"  1. Carica {merged} su Google Drive")
        print(f"  2. Apri notebook Colab e aggiorna DATASET_PATH")
        print(f"  3. Addestra e esporta GGUF")
        print(f"  4. python3 scripts/meta-trainer.py test --model galileo-brain")


# ═══════════════════════════════════════════════════════════════
# FASE 6: FULL CYCLE (tutte le fasi in sequenza)
# ═══════════════════════════════════════════════════════════════

def cmd_full_cycle(args):
    """Esegue il ciclo completo: discover → generate → test → analyze → refine."""
    target = args.target_grade or "S"
    max_iterations = args.max_iterations or 5
    model_key = args.base_model or "qwen3-4b"

    target_score = {"S": 98.0, "A": 95.0, "B": 90.0, "C": 80.0}.get(target, 98.0)

    print(f"""
{'='*60}
  GALILEO BRAIN META-TRAINER — FULL CYCLE
{'='*60}
  Modello base:    {model_key}
  Target:          Grado {target} (>={target_score}%)
  Max iterazioni:  {max_iterations}
  Inizio:          {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}
""")

    # Fase 0: Discovery
    print("[FASE 0] Discovery...")
    args.base_model = model_key
    cmd_discover(args)

    # Fase 1: Generate (se non esiste gia)
    dataset_path = DATASETS_DIR / f"galileo-brain-{model_key}-v1.jsonl"
    if not dataset_path.exists():
        print(f"\n[FASE 1] Generazione dataset per {model_key}...")
        cmd_generate(args)
    else:
        print(f"\n[FASE 1] Dataset gia esistente: {dataset_path}")

    # Fase 2: Training (manuale — richiede Colab/GPU)
    print(f"""
{'='*60}
  [FASE 2] TRAINING — Azione manuale richiesta
{'='*60}
  Il training richiede GPU (Colab T4/A100).

  PASSI:
  1. Carica {dataset_path} su Google Drive
  2. Apri notebooks/galileo-brain-finetune-v2.ipynb
  3. Modifica:
     - MODEL_NAME = "{MODEL_REGISTRY.get(model_key, {}).get('full_name', '?')}"
     - DATASET_PATH = "/content/drive/MyDrive/{dataset_path.name}"
  4. Esegui tutte le celle
  5. Scarica il GGUF e mettilo in models/
  6. Aggiorna models/Modelfile
  7. Esegui: ollama create galileo-brain -f models/Modelfile

  Premi INVIO quando il modello e' pronto su Ollama...
""")

    try:
        input("  >>> ")
    except (EOFError, KeyboardInterrupt):
        print("\n  [SKIP] Training saltato")
        return

    # Ciclo iterativo: Test → Analyze → Refine
    for iteration in range(1, max_iterations + 1):
        print(f"\n{'='*60}")
        print(f"  ITERAZIONE {iteration}/{max_iterations}")
        print(f"{'='*60}")

        # Fase 3: Test
        print(f"\n[FASE 3] Test automatico (200 test)...")
        args.model = "galileo-brain"
        args.verbose = False
        cmd_test(args)

        # Fase 4: Analyze
        print(f"\n[FASE 4] Analisi risultati...")
        weak_areas = cmd_analyze(args)

        # Controlla grado
        reports = sorted(glob.glob(str(REPORTS_DIR / "brain-test-report-*.md")))
        if reports:
            with open(reports[-1], 'r') as f:
                content = f.read()
            grade_match = re.search(r'Overall Grade:\s*(\w)\s*\((\d+\.?\d*)%\)', content)
            if grade_match:
                score = float(grade_match.group(2))
                grade = grade_match.group(1)

                if score >= target_score:
                    print(f"\n{'='*60}")
                    print(f"  TARGET RAGGIUNTO! Grado {grade} ({score}%)")
                    print(f"  Iterazioni: {iteration}")
                    print(f"  Il modello e' pronto per produzione.")
                    print(f"{'='*60}")
                    return

        if not weak_areas:
            print("  Nessuna weak area trovata ma grado non sufficiente. Aumenta dataset.")
            return

        # Fase 5: Refine
        print(f"\n[FASE 5] Raffinamento mirato...")
        cmd_refine(args)

        # Fase 2 (ripetuta): Re-training
        print(f"""
  [FASE 2 — Iterazione {iteration}] Re-training richiesto
  Il dataset e' stato aggiornato. Ri-addestra su Colab.
  Premi INVIO quando pronto...
""")
        try:
            input("  >>> ")
        except (EOFError, KeyboardInterrupt):
            print(f"\n  [STOP] Ciclo interrotto all'iterazione {iteration}")
            return

    print(f"\n{'='*60}")
    print(f"  Max iterazioni ({max_iterations}) raggiunte.")
    print(f"  Considera di cambiare modello base.")
    print(f"{'='*60}")


# ═══════════════════════════════════════════════════════════════
# UTILITA
# ═══════════════════════════════════════════════════════════════

def cmd_status(args):
    """Mostra lo stato attuale del sistema."""
    print(f"""
{'='*60}
  GALILEO BRAIN META-TRAINER — STATUS
{'='*60}
""")

    # Modelli disponibili
    print("  MODELLI NEL REGISTRY:")
    for k, v in MODEL_REGISTRY.items():
        print(f"    {k:20s} — {v['params']:6s}, {v['vram_min_gb']}GB, {v['chat_template']}")

    # Dataset esistenti
    print(f"\n  DATASET:")
    for f in sorted(glob.glob(str(DATASETS_DIR / "galileo-brain-*.jsonl"))):
        size = os.path.getsize(f) / 1024
        lines = sum(1 for _ in open(f))
        print(f"    {os.path.basename(f):40s} — {lines:5d} esempi ({size:.0f} KB)")

    # GGUF esistenti
    print(f"\n  MODELLI GGUF:")
    for f in sorted(glob.glob(str(MODELS_DIR / "*.gguf"))):
        size = os.path.getsize(f) / (1024*1024*1024)
        print(f"    {os.path.basename(f):40s} — {size:.2f} GB")

    # Evaluation suite
    eval_path = DATASETS_DIR / "evaluation-suite.jsonl"
    if eval_path.exists():
        lines = sum(1 for _ in open(eval_path))
        print(f"\n  EVALUATION SUITE: {lines} test cases")

    # Ultimi report
    reports = sorted(glob.glob(str(REPORTS_DIR / "brain-test-report-*.md")))
    if reports:
        print(f"\n  ULTIMI REPORT:")
        for r in reports[-3:]:
            print(f"    {os.path.basename(r)}")

    # Ollama modelli
    print(f"\n  MODELLI OLLAMA:")
    try:
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                if 'galileo' in line.lower() or 'brain' in line.lower():
                    print(f"    {line}")
            if 'galileo' not in result.stdout.lower():
                print(f"    (nessun modello galileo-brain trovato)")
        else:
            print(f"    [WARN] Ollama non risponde")
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print(f"    [WARN] Ollama non installato o non raggiungibile")

    print(f"\n{'='*60}")


def cmd_modelfile(args):
    """Genera un Modelfile per il modello specificato."""
    model_key = args.base_model.lower().replace(" ", "-")

    if model_key not in MODEL_REGISTRY:
        print(f"[ERRORE] Modello '{model_key}' non in registry.")
        return

    model = MODEL_REGISTRY[model_key]
    template_info = CHAT_TEMPLATES[model["chat_template"]]

    gguf_name = args.gguf or f"galileo-brain-{model_key}-gguf.Q4_K_M.gguf"

    modelfile_content = f"""# Galileo Brain Modelfile — {model_key}
# Generato da meta-trainer.py il {datetime.now().strftime('%Y-%m-%d')}
# Modello base: {model['full_name']} ({model['params']})

FROM ./{gguf_name}

TEMPLATE \"\"\"{template_info['ollama_template']}\"\"\"

# Stop tokens
"""
    for st in model["stop_tokens"]:
        modelfile_content += f'PARAMETER stop "{st}"\n'

    modelfile_content += f"""
# System prompt
SYSTEM \"\"\"Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
Ricevi il messaggio dello studente + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura esatta:
{{
  "intent": "action|circuit|code|tutor|vision|navigation",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}}

REGOLE:
1. Rispondi SEMPRE in JSON valido, nessun testo fuori dal JSON
2. "intent" deve essere uno dei 6 valori esatti
3. "actions" contiene tag [AZIONE:...] o [INTENT:{{...}}] per costruire circuiti
4. "needs_llm"=false per azioni deterministiche, true per spiegazioni/educativi
5. Se needs_llm=false, "response" contiene la risposta breve
6. Se needs_llm=true, "llm_hint" contiene il contesto per il modello grande

COMPONENTI VALIDI (21): led, resistor, push-button, buzzer-piezo, capacitor, potentiometer,
photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo, reed-switch, phototransistor,
battery9v, multimeter, lcd16x2, nano-r4-board, breadboard-half, breadboard-full, wire

PIN MAP:
LED: anode, cathode | Resistor: pin1, pin2 | PushButton: pin1, pin2
BuzzerPiezo: positive, negative | Potentiometer: vcc, signal, gnd
Capacitor: positive, negative | RGB-LED: red, common, green, blue
Diode: anode, cathode | Mosfet-N: gate, drain, source
PhotoResistor: pin1, pin2 | Phototransistor: collector, emitter
MotorDC: positive, negative | Servo: signal, vcc, gnd | ReedSwitch: pin1, pin2

TAB VALIDI: simulator, manual, video, canvas, editor, taccuini, detective, poe, reverse, review
WING PINS: W_A0, W_A1, W_A2, W_A3, W_D3, W_D5, W_D6, W_D9, W_D10, W_D11, W_D12, W_D13,
W_A4/SDA, W_A5/SCL, W_D0/RX, W_D1/TX\"\"\"

# Inference parameters
PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_predict 512
PARAMETER repeat_penalty 1.1
"""

    output = MODELS_DIR / f"Modelfile-{model_key}"
    with open(output, 'w') as f:
        f.write(modelfile_content)

    print(f"\n[OK] Modelfile generato: {output}")
    print(f"     Per creare il modello:")
    print(f"     ollama create galileo-brain-{model_key} -f {output}")


# ═══════════════════════════════════════════════════════════════
# MAIN — CLI
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Galileo Brain Meta-Trainer — Sistema che addestra modelli futuri",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Comandi:
  discover    Identifica caratteristiche di un modello
  generate    Genera/converti dataset per un modello
  test        Testa un modello via Ollama (200 test)
  analyze     Analizza ultimo report, trova weak areas
  refine      Genera dati di raffinamento per weak areas
  full-cycle  Ciclo completo automatico
  status      Mostra stato attuale del sistema
  modelfile   Genera Modelfile Ollama per un modello

Esempi:
  python3 scripts/meta-trainer.py discover --base-model qwen3-4b
  python3 scripts/meta-trainer.py test --model galileo-brain
  python3 scripts/meta-trainer.py full-cycle --base-model qwen3-4b --target-grade S
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Comando da eseguire")

    # discover
    p_discover = subparsers.add_parser("discover", help="Identifica modello")
    p_discover.add_argument("--base-model", required=True, help="Nome modello (es. qwen3-4b)")

    # generate
    p_generate = subparsers.add_parser("generate", help="Genera dataset")
    p_generate.add_argument("--base-model", required=True, help="Nome modello target")
    p_generate.add_argument("--source", help="Dataset sorgente (default: galileo-brain-v2.jsonl)")
    p_generate.add_argument("--count", type=int, help="Numero esempi (default: tutti)")

    # test
    p_test = subparsers.add_parser("test", help="Testa modello")
    p_test.add_argument("--model", default="galileo-brain", help="Nome modello Ollama")
    p_test.add_argument("--verbose", action="store_true", help="Output dettagliato")

    # analyze
    p_analyze = subparsers.add_parser("analyze", help="Analizza report")

    # refine
    p_refine = subparsers.add_parser("refine", help="Genera refinement data")
    p_refine.add_argument("--source", help="Dataset sorgente per merge")

    # full-cycle
    p_cycle = subparsers.add_parser("full-cycle", help="Ciclo completo")
    p_cycle.add_argument("--base-model", default="qwen3-4b", help="Modello base")
    p_cycle.add_argument("--target-grade", default="S", help="Grado target (S/A/B/C)")
    p_cycle.add_argument("--max-iterations", type=int, default=5, help="Max iterazioni")
    p_cycle.add_argument("--verbose", action="store_true")

    # status
    p_status = subparsers.add_parser("status", help="Stato sistema")

    # modelfile
    p_modelfile = subparsers.add_parser("modelfile", help="Genera Modelfile")
    p_modelfile.add_argument("--base-model", required=True, help="Nome modello")
    p_modelfile.add_argument("--gguf", help="Nome file GGUF")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    commands = {
        "discover": cmd_discover,
        "generate": cmd_generate,
        "test": cmd_test,
        "analyze": cmd_analyze,
        "refine": cmd_refine,
        "full-cycle": cmd_full_cycle,
        "status": cmd_status,
        "modelfile": cmd_modelfile,
    }

    if args.command in commands:
        commands[args.command](args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
