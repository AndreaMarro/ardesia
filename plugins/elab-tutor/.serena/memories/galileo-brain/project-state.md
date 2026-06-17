# Galileo Brain — Project State (Updated Session 76)

## Architecture: DUAL CAPABILITY
1. **Routing Brain** (Operativa): Qwen3-4B fine-tuned → intent classification + deterministic action resolution
2. **Meta-Trainer** (Evolutiva): Il sistema SA ADDESTRARE modelli futuri — ciclo Discovery→Generate→Train→Test→Analyze→Refine→Loop

## Key Files
| File | Lines | Purpose |
|------|-------|---------|
| `docs/GALILEO-BRAIN-MASTER-PROMPT.md` | 1397 | Single source of truth, 8-section anatomy, 7 appendices, v3.0.0 META-TRAINER EDITION |
| `scripts/meta-trainer.py` | 906 | Orchestrator — 8 commands (discover, generate, test, analyze, refine, full-cycle, status, modelfile) |
| `scripts/generate-brain-dataset-v2.py` | ~700 | Dataset generator — 2000 ChatML examples |
| `scripts/test-brain-complete.py` | ~600 | 200 test cases |
| `scripts/generate-refinement.py` | ~300 | Targeted refinement data generator |
| `datasets/galileo-brain-v2.jsonl` | 2000 | Training dataset v2 (7152 KB) |
| `datasets/evaluation-suite.jsonl` | 120 | Evaluation test cases |
| `models/Modelfile` | 81 | Ollama deployment config |

## Model Registry (7 models)
qwen3-4b (PRIMARY), qwen3-8b, llama-3.2-3b, llama-3.2-1b, mistral-7b, gemma-2-2b, phi-3-mini

## Training Results (PoC v1)
189 steps, 3 epochs, loss 1.48→0.013, 57min, 6.12GB VRAM, GGUF q4_k_m, Ollama: galileo-tutor:latest

## Grade System
S(≥98%), A(≥95%), B(≥90%), C(≥80%), D(≥70%), F(<70%)

## Next Steps
1. Test GGUF with automated suite (200 test cases)
2. V2 training on Colab
3. Integrate into nanobot/server.py (shadow mode)
