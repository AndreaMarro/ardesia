# Galileo Brain v5 — Training + Deploy

## Contesto
La Dataset Factory v5 e' COMPLETA. 10/10 task finiti. Ora serve:
1. Eseguire il training su Colab
2. Scaricare il GGUF
3. Configurare Ollama locale
4. Attivare shadow mode sul nanobot
5. Monitorare e poi attivare il Brain

## Cosa e' stato fatto (sessione precedente — 15/03/2026)

### Dataset Factory v5
- **22,480 training examples** generati in `datasets/output/galileo-brain-v5-extreme-25k.jsonl`
- **191 eval examples** in `datasets/output/galileo-brain-v5-eval-200.jsonl`
- **7 intents**: action (16.9%), circuit (30.7%), code (13.3%), tutor (24.0%), teacher (9.2%), vision (4.1%), navigation (1.6%)
- **needs_llm: 50.8%** (meta' risposte locali, meta' cloud)
- **42/42 test PASS** (`python3 -m pytest datasets/tests/ -v`)
- **21 sezioni YAML** in `datasets/configs/sections/`
- **12 corruption functions** con progressive escalation (level 1→4)
- Seed training: 20260314, seed eval: 9999 (zero overlap)

### Notebook Colab
- **`notebooks/galileo-brain-finetune-v5.ipynb`** — 11 celle, pronto per Colab
- Qwen3-4B-Instruct via Unsloth, QLoRA r=32 alpha=32
- Batch 4 x 4 = 16 effective, 3 epochs, LR 2e-4 cosine
- `train_on_responses_only` (loss solo su assistant)
- Eval ogni 200 steps, save ogni 500
- Export GGUF q4_k_m + Modelfile per Ollama
- Test inferenza 18 casi + evaluation suite 191 esempi con confusion matrix

### Nanobot Integration
- **`nanobot/brain.py`** — Client Ollama con shadow mode
  - `GalileoBrain.classify(message)` → JSON routing
  - `GalileoBrain.shadow_classify(message, regex_intent)` → log comparison
  - `get_brain()` singleton
  - Timeout 5s, in-memory log ultimi 1000 predictions
  - Env vars: `OLLAMA_URL`, `BRAIN_MODEL`, `BRAIN_MODE` (shadow|active|off)
- **`nanobot/server.py`** — Integrato shadow mode
  - `from brain import get_brain` importato
  - `asyncio.create_task(brain.shadow_classify(...))` in `route_to_specialist()`
  - Endpoint `/brain-stats` per monitoraggio match rate
  - Fire-and-forget: shadow NON blocca il routing principale

## File critici

```
datasets/
  output/galileo-brain-v5-extreme-25k.jsonl    — 22,480 training examples
  output/galileo-brain-v5-eval-200.jsonl       — 191 eval examples
  generate.py                                   — CLI: python3 datasets/generate.py --profile v5-extreme-25k
  brain_factory/engine.py                       — BrainEngine orchestrator
  brain_factory/corruption.py                   — 12 corruptors + pipeline
  brain_factory/sections/template_section.py    — Progressive corruption dedup
  brain_factory/sections/combo_section.py       — Multi-component combos
  configs/sections/*.yml                        — 21 section configs
  profiles/v5-extreme-25k.yml                   — Training profile
  profiles/eval-200.yml                         — Eval profile
  tests/                                        — 42 tests

notebooks/galileo-brain-finetune-v5.ipynb       — Colab training notebook

nanobot/brain.py                                — Ollama client + shadow mode
nanobot/server.py                               — Shadow integration + /brain-stats

docs/plans/2026-03-14-galileo-brain-factory-v5-design.md   — Design doc completo
docs/plans/2026-03-14-galileo-brain-factory-v5-plan.md     — Piano 10 task
```

## Prossimi passi

### STEP 1: Training su Colab
1. Vai su Google Colab (T4 gratis o A100 se disponibile)
2. Carica `notebooks/galileo-brain-finetune-v5.ipynb`
3. Esegui Cell 1 (installazione) → **Riavvia runtime**
4. Esegui celle 2-6 (carica modello, carica i 2 JSONL, configura trainer, training)
5. Tempo stimato: ~2h su T4, ~45min su A100
6. Target: loss finale < 0.1, intent accuracy eval > 90%
7. Esegui Cell 7-8 (test inferenza + evaluation suite)
8. Esegui Cell 9-10 (export GGUF + download)

### STEP 2: Setup Ollama locale
```bash
# Installa Ollama (se non gia' fatto)
curl -fsSL https://ollama.com/install.sh | sh

# Copia GGUF + Modelfile nella stessa cartella
mkdir -p models/galileo-brain-v5
# (copia il file .gguf scaricato da Colab qui)

# Crea modello
cd models/galileo-brain-v5
ollama create galileo-brain -f Modelfile

# Test
ollama run galileo-brain "metti un LED rosso"
# Deve rispondere JSON: {"intent": "circuit", ...}
```

### STEP 3: Shadow mode su Render
```bash
# Aggiungi env vars su Render dashboard:
OLLAMA_URL=http://localhost:11434    # o URL del server Ollama
BRAIN_MODEL=galileo-brain
BRAIN_MODE=shadow                    # NON active!

# Deploy
cd nanobot && git add brain.py && git commit -m "Add Brain shadow mode"
git push render main

# Monitora
curl https://elab-galileo.onrender.com/brain-stats
# Aspetta match_rate > 90%
```

### STEP 4: Attivazione
```bash
# Quando match_rate stabile > 90%:
BRAIN_MODE=active   # Switch da shadow a active

# Il Brain diventa il classificatore primario
# classify_intent() diventa fallback
```

## Note architetturali
- Il Brain e' un ROUTER, non un chatbot — output SOLO JSON
- 5 layer: L0 regex → L1 cache → L2 Brain locale → L3 cloud specialist → L4 memory
- Il Brain sostituisce `classify_intent()` (200+ regex) con un modello da 22K esempi
- Per 80% dei messaggi (needs_llm=false) il Brain risponde localmente senza cloud
- Shadow mode logga predizioni in-memory (ultimi 1000), endpoint `/brain-stats`
- Il dataset e' rigenerabile: `python3 datasets/generate.py --profile v5-extreme-25k`

## Comandi utili
```bash
# Rigenera dataset
cd "VOLUME 3/PRODOTTO/elab-builder"
python3 datasets/generate.py --profile v5-extreme-25k
python3 datasets/generate.py --profile eval-200

# Dry run (solo stats)
python3 datasets/generate.py --profile v5-extreme-25k --dry-run

# Genera solo alcune sezioni
python3 datasets/generate.py --profile v5-extreme-25k --only actions,circuit

# Test
python3 -m pytest datasets/tests/ -v
```
