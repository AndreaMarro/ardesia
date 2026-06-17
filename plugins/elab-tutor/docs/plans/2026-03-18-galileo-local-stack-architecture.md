# Galileo 100% Locale — Architettura Multi-Modello

> **Documento di riferimento** per l'implementazione dello stack AI completamente locale su M1 8GB.
> Basato sulla verifica stato dell'arte del 18/03/2026.

**Autore:** Andrea Marro
**Data:** 18/03/2026
**Sessione:** Brain v7 Architecture Design

---

## 1. Obiettivo

Sostituire l'intero backend cloud (Render + API DeepSeek/Groq/Gemini) con uno stack 100% locale su MacBook M1 8GB. Zero costi, zero dipendenze esterne, 100% offline, privacy totale.

---

## 2. Stack Modelli — Stato dell'Arte Verificato

### 2.1 Brain Router — Qwen3.5-2B (fine-tuned)

| Parametro | Valore |
|-----------|--------|
| **Modello base** | `unsloth/Qwen3.5-2B` |
| **Ruolo** | Classifica intent + genera action tags JSON |
| **RAM (q4_k_m)** | ~1.5 GB |
| **Latenza M1** | ~80-150ms |
| **Persistenza** | `keep_alive: -1` (SEMPRE in RAM) |
| **Training** | bf16 LoRA (NON QLoRA — Unsloth docs specificano: differenze quantizzazione troppo alte su Qwen3.5) |
| **Dataset** | galileo-brain-v7.jsonl — 85,966 esempi, 11 strati |
| **Output** | JSON 6 campi: `{intent, entities, actions, needs_llm, response, llm_hint}` |
| **Intents** | 6: action, circuit, code, tutor, vision, navigation |

**Perche' Qwen3.5-2B e non altri:**
- Distillabs benchmark: Qwen3 famiglia #1 per fine-tuning
- Intelligence Index 16 = pareggia modelli 7B
- Architettura ibrida: Gated DeltaNet + MoE routing
- 201 lingue, 262K context, Apache 2.0
- Unsloth: train 1.5x piu' veloce, 50% meno VRAM
- bf16 LoRA = solo 5GB VRAM su Colab

**Alternative scartate:**
- Llama-3.2-1B: piu' "tunable" ma meno intelligente base
- SmolLM3-3B: buono ma 50% piu' grande senza vantaggio chiaro
- Gemma-3n-E2B: multimodale ma troppo nuovo, meno testato

### 2.2 Text LLM — Qwen3.5-4B

| Parametro | Valore |
|-----------|--------|
| **Modello** | `qwen3.5:4b` (Ollama) |
| **Ruolo** | Genera spiegazioni educative in italiano per bambini 10-14 |
| **RAM (q4_k_m)** | ~2.5 GB |
| **Latenza M1** | ~3-6s (streaming, prime parole dopo ~0.5s) |
| **Persistenza** | `keep_alive: 300` (5 min, on-demand) |
| **Token/sec** | ~15-25 tok/s su M1 8GB |

**Perche' Qwen3.5-4B:**
- Fine-tuned pareggia GPT-OSS-120B (30x piu' grande) su 7/8 benchmark
- 201 lingue (italiano ottimo), 262K context
- Migliore di Phi-4-mini per multilingue
- Migliore di Gemma-3 4B per lingue non-inglesi

### 2.3 Vision — Qwen3-VL 4B Thinking

| Parametro | Valore |
|-----------|--------|
| **Modello** | `qwen3-vl:4b` (Ollama) |
| **Variante** | THINKING (non Instruct) |
| **Ruolo** | Analisi screenshot circuiti, identificazione componenti/errori |
| **RAM (q4_k_m)** | ~2.8 GB |
| **Latenza M1** | ~5-12s per immagine |
| **Persistenza** | `keep_alive: 60` (1 min, on-demand) |

**Perche' Qwen3-VL Thinking e non LLaVA-Phi-3:**
- MMMU: ~48-52% vs ~38% LLaVA-Phi-3
- MathVista: ~58-62% (ragionamento quantitativo sui circuiti)
- Step-by-step reasoning prima di rispondere
- Risoluzione nativa (no resize a 896x896 come Gemma)
- Nota dettagli fini nei circuiti che LLaVA manca
- Stessa RAM (~2.8 GB vs 2.9 GB)

**Alternative scartate:**
- LLaVA-Phi-3 (2.9 GB): superato, qualita' inferiore
- MiniCPM-V 2.6 (3.4 GB): buono ma piu' pesante
- Moondream2 (1.2 GB): troppo debole per circuiti
- Gemma-3 4B (2.6 GB): resize immagini a 896x896, perde dettagli fili/pin

### 2.4 STT (Speech-to-Text) — Whisper-Large-V3-Distil-IT

| Parametro | Valore |
|-----------|--------|
| **Modello** | `whisper-large-v3-distil-it` (whisper.cpp) |
| **Ruolo** | Riconoscimento vocale italiano per bambini |
| **RAM** | ~400-500 MB |
| **Latenza M1** | ~1-2s per 5s di audio |
| **Formato** | whisper.cpp (M1 nativo, Metal GPU accelerated) |
| **Persistenza** | On-demand (carica quando utente preme microfono) |

**Perche' Whisper-Distil-IT e non Vosk:**
- Distillato SPECIFICAMENTE per italiano da bofenghuang (HuggingFace)
- 5.8x piu' veloce del Whisper full, 49% parametri
- Accuratezza quasi identica a Whisper Large V3
- Vosk: "noticeably less accurate, particularly on accented speech and technical vocabulary"
- Bambini 10-14 parlano con accenti regionali (romano, napoletano, siciliano)
- Vocabolario tecnico: "resistore", "breadboard", "LED" — Vosk fallirebbe
- Disponibile in formato whisper.cpp (M1 nativo con Metal)

**Backup zero-RAM:** Web Speech API (Safari = Siri, Chrome = Google STT)

### 2.5 TTS (Text-to-Speech) — Kokoro 82M

| Parametro | Valore |
|-----------|--------|
| **Modello** | Kokoro 82M |
| **Ruolo** | Voce naturale di Galileo in italiano |
| **RAM** | ~200 MB |
| **Latenza** | <0.3s per frase |
| **Licenza** | Apache 2.0 |
| **Persistenza** | SEMPRE in RAM (leggero) |

**Perche' Kokoro e non altri:**
- Italiano nativo confermato (fal.ai + HuggingFace)
- 82M params = piu' leggero di XTTS (467M), MetaVoice (1.2B)
- Qualita' vocale superiore a modelli 5x piu' grandi
- <0.3s per frase = risposta vocale istantanea

**Alternative scartate:**
- Sesame CSM 1B: voce piu' naturale MA 1GB RAM, richiede CUDA, no italiano nativo
- F5-TTS: qualita' top MA piu' pesante, italiano non confermato
- Spark TTS: "inferior to Kokoro in nearly every way"
- Web Speech API: 0 RAM MA voce robotica

**Futuro:** Kyutai Pocket TTS (100M, CPU-only, <50ms, voice cloning, italiano nel roadmap)

---

## 3. Budget RAM — 4 Scenari

```
M1 8GB = 8192 MB totali

RESIDENTI PERMANENTI:
  macOS + browser + FastAPI     2300 MB
  Brain (Qwen3.5-2B q4)        1500 MB
  Kokoro TTS (82M)               200 MB
  Ollama overhead                 200 MB
  ─────────────────────────────────────
  Totale permanente:            4200 MB
  Disponibile on-demand:        3992 MB

SCENARIO A: Azione diretta (70% messaggi)
  Nessun modello on-demand = 4200 MB           ✅ 4 GB liberi

SCENARIO B: Spiegazione educativa (25% messaggi)
  + Qwen3.5-4B (2500 MB) = 6700 MB            ✅ 1.5 GB liberi

SCENARIO C: Analisi foto (4% messaggi)
  + Qwen3-VL 4B (2800 MB) = 7000 MB           ✅ 1.2 GB liberi

SCENARIO D: Voce in → risposta (1% messaggi)
  + Whisper-Distil-IT (500 MB) = 4700 MB       ✅ 3.5 GB liberi
  (poi Brain routing → azione o Text LLM)

SCENARIO E: Foto + spiegazione (caso peggiore)
  Fase 1: Brain + Vision = 7000 MB             ✅ OK
  Fase 2: Ollama scarica Vision, carica Text LLM
           Brain + Text = 6700 MB              ✅ OK
  Picco: 7000 MB                               ✅ sotto 8192

❌ MAI: Text + Vision = 4200+2500+2800 = 9500  → swap!
✅ Soluzione: mutua esclusione (Ollama keep_alive gestisce auto)
```

---

## 4. Latenza Per Scenario

| Scenario | Frequenza | Latenza | Confronto Cloud |
|----------|-----------|---------|-----------------|
| Azione diretta | 70% | ~100-170ms | 5-10x PIU' VELOCE (cloud: 0.8-2s + cold start) |
| Spiegazione | 25% | 3-6s (streaming da 0.5s) | Simile (cloud: 2-5s) |
| Vision | 4% | 5-12s | Un po' piu' lento (cloud: 3-8s) ma ZERO rate limit |
| Voce input | <1% | 1-2s (Whisper) o 0.5s (Web Speech) | Simile |
| Voce output | <1% | <0.3s (Kokoro) | Simile |
| Cold start Render | — | 0s ✅ | Cloud: 5-30s ❌ |

---

## 5. Architettura di Orchestrazione

```
Browser (React)
  ├── Text Input → POST localhost:8000/chat {text, context}
  ├── 🎤 Voice Button → Web Speech API / Whisper-Distil-IT → text
  ├── 📷 Photo Button → canvas.toDataURL() → base64
  └── 🔊 Speaker Toggle → Kokoro TTS / Web Speech synthesis

Nanobot Locale (FastAPI, localhost:8000)
  ├── STEP 1: Ha immagine? → Qwen3-VL 4B (vision analysis)
  ├── STEP 2: Brain Qwen3.5-2B (routing JSON, SEMPRE in RAM)
  ├── STEP 3a: needs_llm=false → risposta diretta + action tags
  └── STEP 3b: needs_llm=true → Qwen3.5-4B (streaming text)

Ollama (localhost:11434)
  ├── galileo-brain    (Qwen3.5-2B fine-tuned)  SEMPRE ✅  keep:-1
  ├── qwen3.5:4b       (Text LLM)               on-demand  keep:300s
  ├── qwen3-vl:4b      (Vision)                  on-demand  keep:60s
  └── Mutua esclusione: Text e Vision MAI contemporanei
```

---

## 6. Dataset v7 — Statistiche

| Metrica | Valore |
|---------|--------|
| **File** | `datasets/galileo-brain-v7.jsonl` |
| **Esempi totali** | 85,966 |
| **Dimensione** | 133 MB |
| **Eval set** | `datasets/galileo-brain-v7-eval.jsonl` (196 esempi) |
| **Strati** | 11 (replay, action, context, tutor, adversarial, multi-action, implicit, experiments, long-confused, dialect, augmented) |
| **Intents** | 6: action (32.5%), circuit (24.7%), tutor (24.6%), navigation (11.2%), code (4.1%), vision (2.9%) |
| **Format** | ChatML con JSON 6 campi + system prompt allineato al test |
| **System prompt** | Identico a `scripts/test-brain-complete.py` |
| **Augmentation** | 5 dialetti IT, 13 categorie sinonimi verbi, 12 categorie sinonimi nomi, 30+ pattern riformulazione, typo engine, long confused templates |

---

## 7. Fonti Verificate

- [Distillabs: 12 SLMs Benchmarked](https://www.distillabs.ai/blog/we-benchmarked-12-small-language-models-across-8-tasks-to-find-the-best-base-model-for-fine-tuning)
- [BentoML: Best Open-Source SLMs 2026](https://www.bentoml.com/blog/the-best-open-source-small-language-models)
- [Unsloth: Qwen3.5 Fine-tuning Guide](https://unsloth.ai/docs/models/qwen3.5/fine-tune)
- [Artificial Analysis: Qwen3.5 Small Models](https://artificialanalysis.ai/articles/qwen3-5-small-models)
- [Qwen3-VL Technical Report](https://arxiv.org/abs/2511.21631)
- [DigitalOcean: Best TTS Models (Kokoro, F5, Sesame, Spark)](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models)
- [Kyutai: Pocket TTS](https://kyutai.org/blog/2026-01-13-pocket-tts)
- [HuggingFace: Whisper-Large-V3-Distil-IT](https://huggingface.co/bofenghuang/whisper-large-v3-distil-it-v0.2)
- [Jamy AI: Whisper vs Vosk](https://www.jamy.ai/blog/openai-whisper-vs-other-open-source-transcription-models/)
- [Northflank: Best STT 2026 Benchmarks](https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2026-benchmarks)
