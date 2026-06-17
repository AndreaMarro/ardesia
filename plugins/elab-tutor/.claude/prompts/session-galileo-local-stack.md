# Galileo 100% Locale — Sessione di Implementazione

## Obiettivo
Implementare lo stack AI multi-modello 100% locale su M1 8GB per ELAB Tutor. Zero cloud, zero costi, zero dipendenze esterne.

## Documenti di Riferimento (LEGGILI TUTTI PRIMA DI INIZIARE)
1. **Architettura:** `docs/plans/2026-03-18-galileo-local-stack-architecture.md` — Stack 5 modelli, budget RAM, latenza, fonti
2. **Piano:** `docs/plans/2026-03-18-galileo-local-stack-plan.md` — 4 fasi, 9 task, comandi esatti
3. **Notebook:** `notebooks/galileo-brain-finetune-v7.ipynb` — 11 celle Colab pronte

## Stato Attuale
- Notebook v7 CREATO (11 celle, auto-detect Qwen3.5 vs Qwen3-4B fallback)
- Dataset v7 PRONTO: `datasets/galileo-brain-v7.jsonl` (85,966 esempi, 133 MB)
- Eval v7 PRONTO: `datasets/galileo-brain-v7-eval.jsonl` (196 esempi)
- Test suite PRONTA: `scripts/test-brain-complete.py` (120 eval + 80 stress)
- Documenti architettura e piano PRONTI

## Stack Modelli Verificato (stato dell'arte 18/03/2026)

| # | Modello | Ruolo | RAM | Ollama | Persistenza |
|---|---------|-------|-----|--------|-------------|
| 1 | **Qwen3.5-2B** (fine-tuned, bf16 LoRA) | Brain router | 1.5 GB | `galileo-brain` | SEMPRE (keep:-1) |
| 2 | **Qwen3.5-4B** | Text LLM educativo | 2.5 GB | `qwen3.5:4b` | on-demand (keep:300s) |
| 3 | **Qwen3-VL 4B Thinking** | Vision circuiti | 2.8 GB | `qwen3-vl:4b` | on-demand (keep:60s) |
| 4 | **Whisper-Large-V3-Distil-IT** | STT italiano | 0.5 GB | whisper.cpp | on-demand |
| 5 | **Kokoro 82M** | TTS italiano | 0.2 GB | kokoro-onnx | SEMPRE |

## REGOLE CRITICHE (NON IGNORARE)

1. **bf16 LoRA, MAI QLoRA su Qwen3.5** — Unsloth docs: differenze quantizzazione troppo alte
2. **System prompt IDENTICO** — training = test-brain-complete.py, carattere per carattere
3. **Mutua esclusione RAM** — Text LLM e Vision MAI contemporanei
4. **Test PRIMA del deploy** — >=95% su test-brain-complete.py
5. **Fallback automatico** — Il notebook auto-detecta se Qwen3.5 e' supportato, altrimenti usa Qwen3-4B

## Cosa Fare in Questa Sessione

### FASE 0: Training (LA PIU' IMPORTANTE)

**Task 0.1** — Notebook gia' pronto in `notebooks/galileo-brain-finetune-v7.ipynb`. L'utente lo eseguira' su Google Colab manualmente. Claude deve:
- Verificare che i 2 dataset JSONL esistano e siano corretti
- Aiutare con troubleshooting se il training fallisce
- Guidare l'utente nel download del GGUF

**Task 0.2** — L'utente esegue il training su Colab (2-4h su A100). Claude aspetta.

**Task 0.3** — Dopo il download del GGUF, deploy su Ollama locale:
```bash
mkdir -p ~/models/galileo-brain-v7
cp ~/Downloads/galileo-brain-v7*.gguf ~/models/galileo-brain-v7/
cp ~/Downloads/Modelfile ~/models/galileo-brain-v7/
cd ~/models/galileo-brain-v7
ollama create galileo-brain -f Modelfile
ollama run galileo-brain "avvia la simulazione"
# Deve rispondere JSON con [AZIONE:play]
```

Poi test completo:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
python3 scripts/test-brain-complete.py --model galileo-brain --full --report
```
Target: >=95% accuracy, 0 parse errors.

### FASE 1: Nanobot Locale

**Task 1.1** — Creare `nanobot-local/server.py` (FastAPI):
```
Directory: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot-local/
File: server.py, config.py, requirements.txt
Endpoint: POST /chat, POST /vision, GET /health, GET /models
```

Il server.py implementa:
1. `route_brain()` — Brain via Ollama (JSON, strip <think>)
2. `analyze_vision()` — Vision via Ollama con base64
3. `generate_text()` — Streaming da Text LLM
4. `chat_handler()` — Orchestratore: image? -> vision -> brain -> text/direct

**Task 1.2** — Test nanobot locale:
```bash
ollama serve &
ollama run galileo-brain --keepalive -1 "ping"
cd nanobot-local && python -m uvicorn server:app --port 8000

# Test azione (<200ms):
curl -X POST localhost:8000/chat -H "Content-Type: application/json" -d '{"message":"avvia","context":{}}'

# Test spiegazione (streaming 3-6s):
curl -X POST localhost:8000/chat -H "Content-Type: application/json" -d '{"message":"cos e un resistore?","context":{}}'
```

### FASE 2: Integrazioni Frontend

**Task 2.1** — In `src/services/api.js`: flag `VITE_GALILEO_LOCAL` per switch cloud/locale
**Task 2.2** — Kokoro TTS: `nanobot-local/tts.py` + endpoint `/tts` + bottone speaker
**Task 2.3** — STT: Web Speech API (v1, zero RAM) o Whisper locale (v2, +500MB)

### FASE 3: Setup e Deploy

**Task 3.1** — `nanobot-local/setup.sh` one-click (installa Ollama, scarica modelli, avvia)
**Task 3.2** — `.vercelignore` update + docs aggiornati

## Se Qualcosa Va Storto

| Problema | Soluzione |
|----------|-----------|
| Qwen3.5-2B non supportato Unsloth | Il notebook fa auto-fallback a Qwen3-4B QLoRA |
| VRAM insufficiente T4 bf16 | batch_size=1, grad_accum=16 |
| Loss non scende | LR a 5e-5, epoche a 4 |
| Test <90% | Verifica system prompt, controlla dataset format |
| GGUF troppo grande | Usa q3_k_m |
| RAM swap su M1 | TEXT_KEEP_ALIVE=60s, VISION_KEEP_ALIVE=30s |

## Dipendenze tra Task

```
0.1 (notebook FATTO) -> 0.2 (training Colab) -> 0.3 (Ollama deploy)
                                                       |
                                                       v
                                                 1.1 (nanobot server)
                                                       |
                                                       v
                                                 1.2 (test nanobot)
                                                       |
                                                       v
                                              +-- 2.1 (api.js)
                                              +-- 2.2 (TTS)        <- parallelo
                                              +-- 2.3 (STT)        <- parallelo
                                                       |
                                                       v
                                              +-- 3.1 (setup.sh)   <- parallelo
                                              +-- 3.2 (docs)       <- parallelo
```
