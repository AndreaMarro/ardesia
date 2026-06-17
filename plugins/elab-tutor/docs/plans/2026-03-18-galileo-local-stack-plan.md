# Galileo 100% Locale — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Trainare Galileo Brain v7 su 86K esempi, deployare su Ollama locale, e preparare lo stack multi-modello (Brain + Text LLM + Vision + STT + TTS) su M1 8GB. Zero cloud.

**Architecture:** 5 modelli orchestrati da Nanobot FastAPI locale. Brain (Qwen3.5-2B fine-tuned) sempre in RAM per routing <150ms. Text LLM (Qwen3.5-4B) e Vision (Qwen3-VL 4B) mutuamente esclusivi on-demand. STT (Whisper-Distil-IT) e TTS (Kokoro 82M) per voce I/O.

**Tech Stack:** Python 3 + Unsloth (training), Ollama (inference), FastAPI (nanobot locale), whisper.cpp (STT), Kokoro (TTS), React (frontend)

**Reference:** `docs/plans/2026-03-18-galileo-local-stack-architecture.md` per dettagli modelli e budget RAM.

---

## FASE 0 — Training Galileo Brain v7 su Colab (Priority: CRITICA)

### Task 0.1: Preparare notebook Colab v7

**Files:**
- Create: `notebooks/galileo-brain-finetune-v7.ipynb`
- Read: `notebooks/galileo-brain-finetune-v6.ipynb` (template)
- Read: `datasets/galileo-brain-v7.jsonl` (86K train)
- Read: `datasets/galileo-brain-v7-eval.jsonl` (196 eval)

**Step 1: Creare il notebook v7 partendo dal template v6**

Differenze critiche rispetto a v6:
```
1. Modello base: unsloth/Qwen3-4B → unsloth/Qwen3.5-2B
2. Quantizzazione training: load_in_4bit=True → load_in_4bit=False (bf16 LoRA)
   ⚠️ CRITICO: Unsloth docs dicono "NON fare QLoRA su Qwen3.5"
3. Dataset: v6 (20K) → v7 (86K)
4. Eval: v6-eval (108) → v7-eval (196)
5. Training args: batch_size, steps, save_steps adattati a 86K
6. Output dir: galileo-brain-v6 → galileo-brain-v7
7. GGUF export: galileo-brain-v6-gguf → galileo-brain-v7-gguf
8. Test cases: aggiornati per teacher→tutor mapping
```

**Step 2: Celle del notebook (11 celle)**

```python
# ═══ Cell 1: Installazione ═══
# Stessa di v6 ma verificare compatibilita' Qwen3.5
# pip install unsloth, trl, peft, accelerate, bitsandbytes
# NOTA: potrebbe servire unsloth nightly per Qwen3.5

# ═══ Cell 2: Caricamento modello ═══
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3.5-2B",   # ← CAMBIATO da Qwen3-4B
    max_seq_length = 2048,
    dtype = None,
    load_in_4bit = False,                  # ← CAMBIATO: bf16, NON 4bit
)

# ═══ Cell 3: LoRA ═══
# r=64, lora_alpha=64, stessi target modules
# NOTA: VRAM sara' ~8-10GB con bf16 (vs ~6GB con 4bit)
# A100 40GB ha abbondanza, T4 16GB potrebbe essere stretto

# ═══ Cell 4: Upload dataset ═══
# Upload galileo-brain-v7.jsonl (133MB) e v7-eval.jsonl
# ⚠️ 133MB e' grande per upload Colab — considerare Google Drive

# ═══ Cell 5: Preparazione dataset ═══
# Stessa logica di v6: apply_chat_template + map

# ═══ Cell 6: Training config ═══
# per_device_train_batch_size = 4    (ridotto da 8 — bf16 usa piu' VRAM)
# gradient_accumulation_steps = 4    (aumentato — effective batch = 16)
# num_train_epochs = 2               (ridotto da 3 — 86K e' gia' grande)
# learning_rate = 1e-4               (ridotto — dataset grande)
# eval_steps = 500                   (aumentato — piu' steps totali)
# save_steps = 500

# ═══ Cell 7: Training ═══
# Stima: ~2-4h su A100, ~4-8h su T4

# ═══ Cell 8: Test inferenza rapido ═══
# 45 test cases (stessi di v6 + correzioni teacher→tutor)

# ═══ Cell 9: Eval suite completa ═══
# 196 esempi dal v7-eval

# ═══ Cell 10: Export GGUF q4_k_m ═══
# ⚠️ q4_k_m va bene per DEPLOY ma NON per training

# ═══ Cell 11: Download GGUF ═══
```

**Step 3: Verificare che Unsloth supporti Qwen3.5-2B**

Run (in Colab):
```python
from unsloth import FastLanguageModel
print(FastLanguageModel.list_supported_models())
# Cercare "Qwen3.5" nella lista
```

Se Qwen3.5 NON e' supportato: fallback a `unsloth/Qwen3-4B` con QLoRA (come v6).

**Step 4: Commit notebook**

```bash
git add notebooks/galileo-brain-finetune-v7.ipynb
git commit -m "feat: add Galileo Brain v7 training notebook (Qwen3.5-2B, bf16 LoRA, 86K dataset)"
```

---

### Task 0.2: Eseguire training su Colab

**Step 1: Aprire Google Colab con GPU A100 (o T4 come fallback)**
- Runtime → Cambia tipo di runtime → GPU → A100 (richiede Colab Pro)
- Se T4: ridurre batch_size a 2, gradient_accumulation a 8

**Step 2: Eseguire celle 1-6 (setup)**
- Verificare output di ogni cella
- Se Cell 2 fallisce su Qwen3.5: usare Qwen3-4B con load_in_4bit=True

**Step 3: Eseguire Cell 7 (training)**
- Monitorare loss: deve scendere da ~2.0 a <0.1
- Monitorare VRAM: deve restare sotto il limite GPU
- Tempo stimato: ~2-4h (A100) / ~4-8h (T4)

**Step 4: Eseguire Cell 8-9 (test)**
- Target Cell 8: >=90% intent accuracy (40/45)
- Target Cell 9: >=95% eval accuracy (186/196)
- Se <90%: c'e' un problema nel dataset o nel training

**Step 5: Eseguire Cell 10-11 (export GGUF)**
- Scaricare il file .gguf (~1.5 GB per 2B, ~2.5 GB per 4B)
- Scaricare il Modelfile

---

### Task 0.3: Deploy su Ollama locale

**Step 1: Copiare GGUF nella directory corretta**
```bash
mkdir -p ~/models/galileo-brain-v7
cp ~/Downloads/galileo-brain-v7*.gguf ~/models/galileo-brain-v7/
cp ~/Downloads/Modelfile ~/models/galileo-brain-v7/
```

**Step 2: Creare il modello Ollama**
```bash
cd ~/models/galileo-brain-v7
ollama create galileo-brain -f Modelfile
```

**Step 3: Verificare che il modello funziona**
```bash
ollama run galileo-brain "avvia la simulazione"
# Deve rispondere con JSON valido contenente [AZIONE:play]
```

**Step 4: Testare con test-brain-complete.py**
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
python3 scripts/test-brain-complete.py --model galileo-brain --full --report
```
Expected: >=95% accuracy, 0 parse errors

**Step 5: Commit report**
```bash
git add datasets/brain-test-report-*.md
git commit -m "test: Galileo Brain v7 test report — local Ollama deployment"
```

---

## FASE 1 — Nanobot Locale (Priority: ALTA)

### Task 1.1: Creare server.py locale

**Files:**
- Create: `nanobot-local/server.py`
- Create: `nanobot-local/requirements.txt`
- Create: `nanobot-local/config.py`
- Read: `nanobot/server.py` (riferimento cloud)

**Step 1: Creare la struttura directory**
```bash
mkdir -p nanobot-local
```

**Step 2: Scrivere requirements.txt**
```
fastapi==0.115.0
uvicorn==0.30.0
httpx==0.27.0
pydantic==2.9.0
```

**Step 3: Scrivere config.py**
```python
"""Configurazione Galileo Local Stack."""

OLLAMA_URL = "http://localhost:11434"

# Modelli
BRAIN_MODEL = "galileo-brain"        # Qwen3.5-2B fine-tuned, SEMPRE in RAM
TEXT_MODEL  = "qwen3.5:4b"           # Spiegazioni educative, on-demand
VISION_MODEL = "qwen3-vl:4b"        # Analisi circuiti, on-demand

# Keep alive (secondi, -1 = per sempre)
BRAIN_KEEP_ALIVE = -1
TEXT_KEEP_ALIVE = 300    # 5 min
VISION_KEEP_ALIVE = 60   # 1 min

# Generazione
BRAIN_MAX_TOKENS = 256
TEXT_MAX_TOKENS = 1024
VISION_MAX_TOKENS = 1024
BRAIN_TEMPERATURE = 0.1
TEXT_TEMPERATURE = 0.7
VISION_TEMPERATURE = 0.3
```

**Step 4: Scrivere server.py con 4 endpoint**
```
POST /chat          — Main handler (brain routing + text/vision)
POST /vision        — Direct vision analysis
GET  /health        — Health check con status modelli
GET  /models        — Lista modelli disponibili
```

Il server.py deve implementare:
1. `route_brain()` — chiama Brain via Ollama, JSON parse, strip <think>
2. `analyze_vision()` — chiama Vision via Ollama con immagine base64
3. `generate_text()` — streaming da Text LLM via Ollama
4. `chat_handler()` — orchestratore: image? → vision → brain → text/direct

**Step 5: Commit**
```bash
git add nanobot-local/
git commit -m "feat: add nanobot-local server (FastAPI + Ollama orchestration)"
```

### Task 1.2: Testare nanobot locale

**Step 1: Avviare Ollama e precaricare Brain**
```bash
ollama serve &
ollama run galileo-brain --keepalive -1 "ping"
```

**Step 2: Avviare nanobot locale**
```bash
cd nanobot-local
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

**Step 3: Test health**
```bash
curl http://localhost:8000/health
# Deve mostrare: brain=loaded, text=available, vision=available
```

**Step 4: Test azione diretta**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "avvia la simulazione", "context": {}}'
# Expected: {"reply":"...","actions":["[AZIONE:play]"],"source":"brain-direct"}
# Latenza: <200ms
```

**Step 5: Test spiegazione**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "cos'\''e'\'' un resistore?", "context": {}}'
# Expected: streaming text educativo
# Latenza primo token: <1s
```

**Step 6: Test vision**
```bash
# Creare un test con immagine base64
python3 -c "
import base64, json, httpx
img = base64.b64encode(open('test-circuit.png','rb').read()).decode()
r = httpx.post('http://localhost:8000/chat',
    json={'message':'cosa vedi?','image':img,'context':{}}, timeout=60)
print(r.json())
"
```

**Step 7: Commit test results**
```bash
git commit -m "test: nanobot-local verified — brain <200ms, text streaming OK, vision OK"
```

---

## FASE 2 — Integrazione Frontend (Priority: MEDIA)

### Task 2.1: Aggiornare api.js per modalita' locale

**Files:**
- Modify: `src/services/api.js`

**Step 1: Aggiungere flag GALILEO_LOCAL**

In `api.js`, aggiungere logica per scegliere tra cloud e locale:
```javascript
const GALILEO_LOCAL = import.meta.env.VITE_GALILEO_LOCAL === 'true';
const LOCAL_URL = 'http://localhost:8000';
const CLOUD_URL = (import.meta.env.VITE_NANOBOT_URL || '').trim();
const BASE_URL = GALILEO_LOCAL ? LOCAL_URL : CLOUD_URL;
```

**Step 2: Commit**
```bash
git add src/services/api.js
git commit -m "feat: add GALILEO_LOCAL flag for local nanobot routing"
```

### Task 2.2: Integrare Kokoro TTS

**Files:**
- Create: `nanobot-local/tts.py`
- Modify: `src/components/simulator/ElabTutorV4.jsx` (bottone speaker)

**Step 1: Installare Kokoro**
```bash
pip install kokoro-onnx
# Scaricare modello italiano
```

**Step 2: Aggiungere endpoint TTS**
```
POST /tts  — Riceve testo, ritorna audio WAV
```

**Step 3: Aggiungere toggle speaker nel frontend**

In ElabTutorV4.jsx, aggiungere bottone 🔊 che:
- Cattura il testo della risposta di Galileo
- POST a `/tts` con il testo
- Riproduce l'audio WAV ricevuto

**Step 4: Commit**
```bash
git add nanobot-local/tts.py src/components/simulator/ElabTutorV4.jsx
git commit -m "feat: add Kokoro TTS integration — Galileo speaks Italian"
```

### Task 2.3: Integrare Whisper STT

**Files:**
- Create: `nanobot-local/stt.py`
- Modify: `src/components/simulator/ElabTutorV4.jsx` (bottone microfono)

**Step 1: Installare whisper.cpp con binding Python**
```bash
# Su M1: brew install whisper-cpp
# Scaricare modello distillato IT
```

**Step 2: Aggiungere endpoint STT**
```
POST /stt  — Riceve audio WAV/webm, ritorna testo
```

**Step 3: Aggiungere bottone microfono nel frontend**

Due approcci (l'utente sceglie):
- **Approccio A (consigliato):** Web Speech API nel browser (0 RAM, 0 latenza)
- **Approccio B:** Registra audio nel browser → POST a `/stt` → Whisper locale

**Step 4: Commit**
```bash
git add nanobot-local/stt.py src/components/simulator/ElabTutorV4.jsx
git commit -m "feat: add Whisper STT integration — voice input for Galileo"
```

---

## FASE 3 — Setup Script e Deploy Locale (Priority: BASSA)

### Task 3.1: Creare script setup one-click

**Files:**
- Create: `nanobot-local/setup.sh`

**Step 1: Scrivere setup.sh**
```bash
#!/bin/bash
# Galileo Local Setup — M1 8GB
# Installa Ollama, scarica modelli, avvia nanobot

# 1. Installa Ollama
# 2. Scarica modelli base (qwen3.5:4b, qwen3-vl:4b)
# 3. Installa Brain GGUF se presente
# 4. Preconfigura keep_alive
# 5. Installa dipendenze Python
# 6. Avvia nanobot
```

**Step 2: Commit**
```bash
chmod +x nanobot-local/setup.sh
git add nanobot-local/setup.sh
git commit -m "feat: add one-click local setup script"
```

### Task 3.2: Aggiornare .vercelignore e documentazione

**Files:**
- Modify: `.vercelignore` (aggiungere nanobot-local/)
- Modify: `docs/plans/2026-03-18-galileo-local-stack-architecture.md` (aggiornare con risultati reali)

**Step 1: Aggiungere nanobot-local/ a .vercelignore**
```
nanobot-local/
```

**Step 2: Aggiornare il documento architettura con i risultati reali del training**

**Step 3: Commit finale**
```bash
git add .vercelignore docs/
git commit -m "docs: update architecture doc with real training results"
```

---

## Checklist Pre-Training

Prima di eseguire il training su Colab, verificare:

- [ ] `datasets/galileo-brain-v7.jsonl` esiste (85,966 righe, 133 MB)
- [ ] `datasets/galileo-brain-v7-eval.jsonl` esiste (196 righe)
- [ ] System prompt nel dataset = system prompt in `test-brain-complete.py`
- [ ] Tutti gli esempi hanno 6 campi JSON: intent, entities, actions, needs_llm, response, llm_hint
- [ ] Nessun intent "teacher" nel dataset (tutti mappati a "tutor")
- [ ] Colab Pro attivo (per A100) o T4 disponibile
- [ ] Google Drive configurato per upload 133MB
- [ ] Ollama installato localmente (`ollama --version`)

## Dipendenze tra Task

```
Task 0.1 (notebook) ──→ Task 0.2 (training) ──→ Task 0.3 (Ollama deploy)
                                                        │
                                                        ▼
                                                  Task 1.1 (nanobot server)
                                                        │
                                                        ▼
                                                  Task 1.2 (test nanobot)
                                                        │
                                                        ▼
                                              ┌─── Task 2.1 (api.js)
                                              ├─── Task 2.2 (TTS)      ← parallelo
                                              └─── Task 2.3 (STT)      ← parallelo
                                                        │
                                                        ▼
                                              ┌─── Task 3.1 (setup.sh) ← parallelo
                                              └─── Task 3.2 (docs)     ← parallelo
```
