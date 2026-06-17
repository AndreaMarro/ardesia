# elab-local — Server Locale ELAB Tutor (Ollama)

Server Python che replica l'API del nanobot cloud usando Ollama per inferenza locale. Permette a ELAB Tutor di funzionare 100% offline.

## Stato: funzionante, testato, non in produzione

- 51 unit test PASS
- 21 E2E test PASS (con Ollama + qwen2.5:7b)
- Il frontend (api.js) lo rileva automaticamente su localhost:8000

## Quando serve

Se un docente non ha internet in classe. Il simulatore + Galileo AI funzionano localmente. Latenza ~8-25s (dipende dall'hardware).

## Setup

```bash
cd elab-local
bash install.sh          # Installa Ollama + modelli + arduino-cli
python3 server.py        # Avvia su localhost:8000
```

## Architettura

```
Browser → localhost:8000 (FastAPI)
           ├── L0: Filtri (profanity, injection)
           ├── L1: Brain routing (Ollama galileo-brain, opzionale)
           ├── L2: Prompt YAML (circuit, code, tutor, vision)
           ├── L3: LLM (Ollama qwen2.5:7b o cloud API)
           └── L4: Post-processing (tag, sanitize)
```

## File

```
config.py        — configurazione (modelli, timeout, path)
server.py        — FastAPI main, tutti gli endpoint
brain.py         — wrapper Ollama Brain (routing)
llm.py           — cascata cloud API → Ollama locale
specialists.py   — caricamento YAML + classificatore intent
filters.py       — profanity + injection detection
postprocess.py   — tag normalization + fallback deterministici
memory.py        — sessioni JSON persistenti
compiler.py      — wrapper arduino-cli
```
