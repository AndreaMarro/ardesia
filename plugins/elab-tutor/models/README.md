# Galileo Brain — Modello Fine-Tuned per ELAB

> &copy; Andrea Marro — 09/03/2026 — ELAB Tutor — Tutti i diritti riservati / All rights reserved

[Home](../../../README.md) > [PRODOTTO](../../README.md) > [elab-builder](../README.md) > **models**

## Quick Start

### 1. Scarica il GGUF da Colab
Esegui il notebook `notebooks/galileo-brain-finetune-v2.ipynb` su Colab.
Il GGUF (~2.5 GB) viene scaricato nell'ultima cella.

### 2. Metti il GGUF qui
```
models/galileo-brain-v2-gguf.Q4_K_M.gguf
```

### 3. Crea il modello Ollama
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
ollama create galileo-brain -f models/Modelfile
```

### 4. Testa
```bash
ollama run galileo-brain
```

Poi scrivi:
```
[CONTESTO]
tab: simulator
componenti: [led1]
fili: 1

[MESSAGGIO]
Avvia la simulazione
```

Risposta attesa:
```json
{"intent":"action","entities":[],"actions":["[AZIONE:play]"],"needs_llm":false,"response":"Simulazione avviata! ▶","llm_hint":null}
```

### 5. Valutazione
```bash
python3 scripts/evaluate-brain.py --backend ollama --model galileo-brain
```

## File

| File | Descrizione |
|------|-------------|
| `datasets/galileo-brain-v2.jsonl` | 2000 training examples |
| `datasets/evaluation-suite.jsonl` | 120 test cases |
| `datasets/quality-report-v2.md` | Report qualita V2 |
| `scripts/generate-brain-dataset-v2.py` | Generator script |
| `scripts/evaluate-brain.py` | Evaluation runner |
| `notebooks/galileo-brain-finetune-v2.ipynb` | Colab notebook V2 |
| `models/Modelfile` | Ollama Modelfile |

## Hyperparameters V2

| Param | V1 | V2 |
|-------|----|----|
| Dataset size | 500 | 2000 |
| LoRA rank | 32 | 64 |
| LoRA alpha | 32 | 128 |
| LoRA dropout | 0 | 0.05 |
| Batch size | 2 | 4 |
| Grad accum | 4 | 4 |
| Effective batch | 8 | 16 |
| Warmup steps | 10 | 30 |
| Train/eval split | 100/0 | 90/10 |
| Eval strategy | none | every 25 steps |
