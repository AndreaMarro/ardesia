# ELAB Local Server — Design Document + Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Data**: 21/03/2026
**Versione**: 1.1 (aggiunto piano implementazione)
**Stato**: Approvato

## Obiettivo

Creare un server Python locale che replica 1:1 l'API del nanobot cloud (Render), usando Ollama per l'inferenza AI. ELAB Tutor funziona 100% offline senza dipendenze cloud. Il sistema cloud esistente resta funzionante — switch automatico online↔offline.

## Architettura

```
Browser (qualsiasi, offline)
      │ HTTP
      ▼
┌─────────────────────────────────────────┐
│  elab-local-server (FastAPI :8000)       │
│                                          │
│  L0: Filters (profanity, injection)      │
│  L1: Brain Router (ollama:galileo-brain) │
│  L2: Specialist Prompts (YAML)           │
│  L3: LLM (ollama:qwen2.5-vl:7b)         │
│  L4: Post-processing (tags, sanitize)    │
│  Compiler: arduino-cli                   │
│  Memory: JSON files                      │
└──────────────┬──────────────────────────┘
               │ localhost:11434
               ▼
┌─────────────────────────────────────────┐
│  Ollama                                  │
│  ├── galileo-brain (2B q5, ~1.5 GB)     │
│  └── qwen2.5-vl:7b (tuttofare, ~4.5 GB)│
└─────────────────────────────────────────┘
```

## Dual Mode (Online ↔ Offline)

Il frontend (api.js) usa una cascata di fallback:

```
1. TRY  localhost:8000    (locale, se Ollama gira)
2. FALL Render cloud      (se online)
3. FALL n8n webhook       (se online)
4. FALL knowledge base    (sempre disponibile)
```

**Auto-detect**: se localhost:8000/health risponde in <2s → locale. Altrimenti → cloud. Zero configurazione utente.

**Cambio in api.js**: aggiungere `VITE_LOCAL_API_URL=http://localhost:8000` come primo nella catena. Il resto del frontend è INVARIATO.

## Endpoint Map 1:1

| Endpoint | Metodo | Cloud | Locale | Note |
|----------|--------|-------|--------|------|
| `/health` | GET | ✅ | ✅ | Formato risposta identico |
| `/chat` | POST | ✅ | ✅ | Brain + Ollama (no racing) |
| `/tutor-chat` | POST | ✅ | ✅ | Come /chat + experiment context |
| `/site-chat` | POST | ✅ | ✅ | Ollama + site prompt |
| `/diagnose` | POST | ✅ | ✅ | Ollama + circuit.yml |
| `/hints` | POST | ✅ | ✅ | Ollama + hints prompt |
| `/memory/{id}` | GET | ✅ | ✅ | Identico (file JSON) |
| `/memory/sync` | POST | ✅ | ✅ | Identico (file JSON) |
| `/compile` | POST | webhook | arduino-cli | NUOVO locale |
| `/brain-stats` | GET | ✅ | ✅ | Identico |
| `/brain-test` | GET | ✅ | ✅ | Identico |

**Non replicati** (non servono offline): `/stt`, `/tts`, `/voice-chat`, `/debug-vision`, `/preload`

## Flusso /chat dettagliato

```
REQUEST → L0 Filters (~1ms) → L1 Brain (~100ms) → needs_llm?
  │                                                    │
  │ no (azione diretta)                    yes (serve LLM)
  │                                                    │
  ▼                                                    ▼
L4 Post-processing                    L2 Specialist Prompt (~5ms)
  │                                                    │
  ▼                                                    ▼
RESPONSE (~150ms)                     L3 Ollama LLM (~3-8s)
                                                       │
                                                       ▼
                                      L4 Post-processing
                                                       │
                                                       ▼
                                      RESPONSE (~3-10s)
```

### Latenze attese

| Caso | Path | Latenza |
|------|------|---------|
| Azione semplice | L0→L1→L4 | ~150ms |
| Domanda teoria | L0→L1→L2→L3→L4 | ~3-5s |
| Vision | L0→L1→L2→L3(VL)→L4 | ~5-10s |
| Codice | L0→L1→L2→L3→L4 | ~5-8s |
| Compilazione | /compile→arduino-cli | ~2-5s |

## Modelli Ollama

| Modello | Ruolo | Size | RAM |
|---------|-------|------|-----|
| `galileo-brain` | Routing (intent + entities + actions) | Q5_K_M | ~1.5 GB |
| `qwen2.5-vl:7b` | Testo + Vision + Codice | Q4_K_M | ~4.5 GB |
| **Totale** | | | **~6 GB** |

Requisito minimo: Mac 16 GB RAM (M1/M2/M3).

## Struttura file

```
elab-builder/
├── nanobot/                    # Cloud (INVARIATO)
├── elab-local/                 # NUOVO
│   ├── server.py               # FastAPI main
│   ├── brain.py                # Ollama Brain wrapper
│   ├── llm.py                  # Ollama LLM wrapper
│   ├── compiler.py             # arduino-cli wrapper
│   ├── filters.py              # Profanity + injection
│   ├── postprocess.py          # Tag normalization
│   ├── specialists.py          # YAML prompt builder
│   ├── memory.py               # Session JSON storage
│   ├── config.py               # Settings
│   ├── requirements.txt
│   ├── install.sh              # Setup docente
│   └── yaml/                   # Specialist prompts
│       ├── shared.yml
│       ├── circuit.yml
│       ├── code.yml
│       ├── tutor.yml
│       ├── vision.yml
│       └── scratch.yml
└── src/
    └── api.js                  # MODIFICA: cascata locale-first
```

## Compilatore locale

```
POST /compile
{code: "...", board: "arduino:avr:nano:cpu=atmega328"}

Flow:
1. Scrivi in /tmp/elab-compile-{uuid}/sketch.ino
2. arduino-cli compile --fqbn {board} {dir}
3. Parse errori da stderr
4. Leggi .hex se successo
5. Cleanup /tmp/

Response:
{success, hex (base64), output, errors[]}
```

## Installazione docente

```bash
# install.sh
1. Installa Ollama (se non presente)
2. Scarica qwen2.5-vl:7b (~4.5 GB)
3. Importa galileo-brain dal GGUF
4. Installa arduino-cli + core arduino:avr
5. pip install fastapi uvicorn ollama pyyaml
```

## Fuori scope V1

- Speech-to-text / Text-to-speech
- Electron packaging
- Windows support
- Auto-update modelli
- Multi-utente concorrente

## Chain of Verification (CoV)

Ogni componente deve passare questi check prima di essere considerato completo:

### CoV Server
- [ ] `/health` risponde con modelli Ollama attivi
- [ ] `/chat` con messaggio semplice → risposta con action tag
- [ ] `/chat` con `needs_llm=true` → risposta da LLM
- [ ] `/chat` con immagine → risposta vision
- [ ] `/tutor-chat` con experiment context → risposta contestuale
- [ ] `/compile` con codice valido → hex
- [ ] `/compile` con codice invalido → errori
- [ ] `/memory/{id}` lettura/scrittura → persistenza
- [ ] Profanity filter → blocca parolacce
- [ ] Injection filter → blocca prompt injection
- [ ] Action tags normalizzati → [AZIONE:...] uppercase
- [ ] Deterministic fallback → regex inietta tag mancanti
- [ ] Identity leak sanitizer → nessun "specialista" in output

### CoV Frontend
- [ ] api.js con localhost attivo → usa locale
- [ ] api.js con localhost spento → fallback a cloud
- [ ] api.js con entrambi spenti → knowledge base
- [ ] Nessun cambio UI necessario
- [ ] Tutti i 15+ action tags funzionano identicamente

### CoV Modelli
- [ ] `ollama run galileo-brain` → routing JSON corretto
- [ ] `ollama run qwen2.5-vl:7b` → risposte teoria
- [ ] `ollama run qwen2.5-vl:7b` con immagine → analisi visiva
- [ ] Latenza Brain < 200ms
- [ ] Latenza LLM < 10s
- [ ] RAM totale < 8 GB

### CoV Compilatore
- [ ] arduino-cli installato e funzionante
- [ ] Compila blink.ino → hex valido
- [ ] Compila codice con errore → messaggio chiaro
- [ ] Cleanup /tmp/ dopo compilazione

### CoV End-to-End (20 scenari)
- [ ] "avvia la simulazione" → [AZIONE:play]
- [ ] "cos'è un LED?" → spiegazione per 10-14 anni
- [ ] "metti un LED rosso" → [INTENT:{...}]
- [ ] "guarda il mio circuito" + screenshot → analisi visiva
- [ ] "compila il codice" → compilazione arduino-cli
- [ ] "passa a Scratch" → [AZIONE:switcheditor:scratch]
- [ ] "carica il semaforo" → [AZIONE:loadexp:v1-cap5-semaforo]
- [ ] "come preparo la lezione?" → risposta teacher
- [ ] Parolaccia → bloccata
- [ ] Prompt injection → bloccata
- [ ] Input vuoto → risposta gentile
- [ ] Slang "daje fallo anda'" → [AZIONE:play]
- [ ] Multi-azione "pulisci e metti un buzzer" → clearall + addcomponent
- [ ] Vision "foto sfocata, è giusto?" → analisi best-effort
- [ ] Compilazione con errore → messaggio chiaro
- [ ] Offline completo (no internet) → tutto funziona
- [ ] Switch locale→cloud → seamless
- [ ] Switch cloud→locale → seamless
- [ ] 10 messaggi consecutivi → nessun crash/memory leak
- [ ] Sessione persistente → memory ricaricata dopo restart

---

## Piano di Implementazione — 13 Task

### Task 1: Scaffold (5 min)
Create `elab-local/config.py`, `requirements.txt`, `__init__.py`
Verify: `python3 -c "from config import *; print(VERSION)"` → `1.0.0`

### Task 2: YAML copy (2 min)
Copy `nanobot/prompts/*.yml` → `elab-local/prompts/`
Verify: All YAML files load with PyYAML

### Task 3: filters.py (15 min) — PARALLEL
Port `check_profanity()`, `check_injection()`, `sanitize_message()` from nanobot
Tests: clean passes, profanity blocked, injection blocked

### Task 4: postprocess.py (20 min) — PARALLEL
Port `normalize_action_tags()`, `sanitize_identity_leaks()`, `convert_addcomponent_to_intent()`, `deterministic_action_fallback()`, `deterministic_intent_injection()`
Tests: tag normalization, identity leaks, component conversion, fallback injection

### Task 5: specialists.py (15 min) — PARALLEL
`load_specialists()`, `get_specialist_prompt()`, `classify_intent()`, `format_circuit_context()`, `format_simulator_context()`
Tests: all specialists load, intent classification, context formatting

### Task 6: brain.py (20 min) — PARALLEL
Ollama Brain wrapper. Format [CONTESTO], call model, parse JSON, handle thinking tokens
Tests: context formatting, JSON parsing, thinking stripping

### Task 7: llm.py (15 min) — PARALLEL
Ollama LLM wrapper (text + vision). Message building, history, image handling
Tests: message building, history truncation, model selection

### Task 8: memory.py (10 min) — PARALLEL
JSON session storage. Save/load history, individual memory, TTL cleanup
Tests: save+load, max history, memory update

### Task 9: compiler.py (15 min) — PARALLEL
arduino-cli wrapper. Temp dir, compile, parse errors, return hex
Tests: valid code, invalid code, board validation

### Task 10: server.py (30 min) — depends on 3-9
FastAPI main. All endpoints. /chat flow: L0→L1→L2→L3→L4
Tests: health 200, profanity filtered, chat format

### Task 11: api.js (10 min) — independent
Add `tryLocalServer()` first in cascade. 2s health timeout
Verify: uses localhost when running, cloud when not

### Task 12: install.sh (10 min) — independent
Ollama + models + arduino-cli + Python deps

### Task 13: Integration test (20 min) — depends on all
25 test messages. Full CoV checklist

**Execution**: Tasks 3-9 in parallelo via subagents. ~3 ore totali.
