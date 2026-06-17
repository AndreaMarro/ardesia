# Galileo Brain — Final Evaluation Report

**Date**: 2026-03-07
**Session**: S76 (Brain Pipeline Execution)
**Target**: Grade S (>=98%) on 120-test eval suite
**Hardware**: Apple M1, 8GB unified RAM, macOS Darwin 25.0.0
**Ollama**: v0.13.5

---

## Executive Summary

**Grade: F (9.2%) — Target S unachievable on current hardware without fine-tuned model.**

The Galileo Brain routing system was evaluated using 120 standardized tests across 7 intent categories. Two base models were tested on local Ollama:

| Model | Size | Speed | JSON Valid | Intent Acc | Overall | Grade |
|-------|------|-------|-----------|-----------|---------|-------|
| gemma2:2b | 1.6GB | ~6.6s/q | 97.5% | 23.3% | 9.2% | F |
| qwen3:4b | 2.5GB | >10min/q | N/A | N/A | N/A | UNUSABLE |
| galileo-tutor | 1.7GB | ~16s/q | 0% | 0% | 0% | F |

**Root cause**: No fine-tuned GGUF exists on this machine. The `galileo-brain-v2-gguf.Q4_K_M.gguf` referenced in `models/Modelfile` was created on Google Colab (Session 75) but never transferred to local disk. The base models lack the specialized training data to perform intent routing.

---

## Phase 1: Model Discovery & Validation

### Models Available
1. **galileo-tutor** (Gemma2 2B, 1.7GB) — Italian tutor system prompt, produces natural language, NOT JSON. Completely unsuitable for Brain routing.
2. **gemma2:2b** (1.6GB) — Base model with Brain system prompt injected at runtime. Produces JSON but poor intent accuracy.
3. **qwen3:4b** (2.5GB) — Base model, also tested as custom `galileo-brain` with Brain system prompt. Exceeds 8GB M1 memory capacity, causing >10min inference times.
4. **llava:7b** (4.7GB) — Vision model, not applicable to Brain routing.

### Validation Results (4 representative queries)

| Query | Expected Intent | gemma2:2b | qwen3:4b |
|-------|----------------|-----------|----------|
| "Avvia" | action | navigation | TIMEOUT |
| "Metti LED" | circuit | code | TIMEOUT |
| "tensione?" | tutor | code | TIMEOUT |
| "Apri manuale" | navigation | tutor | TIMEOUT |

**gemma2:2b**: 0/4 intent accuracy, ~16s cold start, ~6.6s warm
**qwen3:4b**: All queries exceeded 180s timeout, even with streaming API

---

## Phase 2: Full Evaluation (120 Tests)

### Test Configuration
- Model: `gemma2:2b` with Brain system prompt
- Timeout: 300s per query (streaming mode)
- Dataset: `datasets/evaluation-suite.jsonl` (120 tests)

### Overall Results

```
OVERALL: 11/120 (9.2%) — Grade: F
JSON Valid: 117/120 (97.5%)
Avg Latency: 6557ms
```

### Results by Category

| Category | Pass | Total | Rate | Bar |
|----------|------|-------|------|-----|
| action | 0 | 41 | 0.0% | -------------------- |
| circuit | 0 | 16 | 0.0% | -------------------- |
| navigation | 0 | 12 | 0.0% | -------------------- |
| edge | 0 | 18 | 0.0% | -------------------- |
| tutor | 4 | 14 | 28.6% | ++++++-------------- |
| vision | 4 | 11 | 36.4% | +++++++------------- |
| code | 3 | 8 | 37.5% | ++++++++------------ |

### Metric Breakdown

| Metric | Score | Rating |
|--------|-------|--------|
| Intent accuracy | 23.3% (28/120) | CRITICAL |
| Action tag accuracy | 36.7% (44/120) | CRITICAL |
| needs_llm accuracy | 49.2% (59/120) | POOR |
| JSON validity | 97.5% (117/120) | GOOD |
| Response non-empty | 92.5% (111/120) | GOOD |

### Latency Profile

| Metric | Value |
|--------|-------|
| Min | 3,290ms |
| P50 (Median) | 6,356ms |
| P95 | 10,944ms |
| Max | 16,311ms |

---

## Phase 3: Deep Analysis

### Intent Confusion Matrix (Top 10)

The model overwhelmingly misclassifies intents toward `code` and `navigation`:

| Expected → Predicted | Count | Impact |
|---------------------|-------|--------|
| action → navigation | 17 | Play/pause/reset misrouted |
| action → code | 14 | Component actions misrouted |
| edge → code | 12 | Multi-intent/ambiguous misrouted |
| circuit → code | 9 | Component placement misrouted |
| tutor → vision | 4 | Explanations misrouted |
| tutor → code | 4 | Theory questions misrouted |
| action → circuit | 4 | Simulation controls misrouted |
| action → tutor | 3 | Quiz/diagnose misrouted |
| vision → navigation | 3 | Screenshot requests misrouted |
| circuit → navigation | 2 | Wiring misrouted |

**Key finding**: `code` absorbs 44/120 predictions (37%), while the model almost never predicts `action` (the largest category at 41 tests). This suggests the base model interprets electrical/programming vocabulary as "code" rather than "deterministic simulator action".

### Failure Reason Breakdown

| Reason | Count | % of failures |
|--------|-------|--------------|
| Wrong intent | 89 | 81.7% |
| Wrong action tags | 73 | 67.0% |
| Wrong needs_llm | 58 | 53.2% |
| Empty response when no LLM | 6 | 5.5% |
| JSON parse failure | 3 | 2.8% |

### Action Tag Format Analysis

| Format | Count | Expected? |
|--------|-------|-----------|
| `[AZIONE:X]` | 113 | YES |
| `[INTENT:X]` | 25 | PARTIAL |
| No brackets | 19 | NO |
| `[ACTION:X]` | 10 | NO |
| Other `[...]` | 2 | NO |

The model produces the correct `[AZIONE:...]` format 67% of the time, but the tag VALUES inside are hallucinated (e.g., `[AZIONE:tag1]`, `[AZIONE:connetti_led_a_resistore]` instead of `[AZIONE:play]`).

### needs_llm Analysis

The model incorrectly sets `needs_llm=True` for 53 tests that should be `False` (deterministic actions). It treats almost everything as requiring LLM followup, defeating the purpose of the Brain as a fast routing layer.

---

## Phase 4: Re-Test

**SKIPPED** — Qwen3 4B is unusable on Apple M1 8GB. The model requires >8GB for inference + KV cache, causing severe swapping. Even with streaming API, a single query takes >10 minutes. Running 120 tests would take >20 hours.

The fine-tuned GGUF (`galileo-brain-v2-gguf.Q4_K_M.gguf`, ~2.5GB) created on Google Colab during Session 75 was never transferred to this machine. That model achieved:
- Training: 189 steps, 3 epochs, loss 1.48 → 0.013
- Validation: 3/3 PASS (action→play, circuit→place_and_wire, tutor→needs_llm)

---

## Phase 5: Integration Plan for Nanobot

### Current Architecture (nanobot v5.3.0)
```
Student Message → nanobot server.py → route_to_specialist() → Cloud LLM (DeepSeek/Groq)
                                     ↓
                        deterministic_action_fallback() (regex-based)
```

### Proposed Architecture with Galileo Brain
```
Student Message → nanobot server.py → Galileo Brain (Ollama) → Routing Decision
                                                                    ↓
                                        needs_llm=false → Direct action execution
                                        needs_llm=true  → Cloud LLM with context hint
```

### Integration Steps (when fine-tuned model is available)

1. **Transfer GGUF**: Download `galileo-brain-v2-gguf.Q4_K_M.gguf` from Colab to `models/`
2. **Create Ollama model**: `ollama create galileo-brain -f models/Modelfile`
3. **Add Brain endpoint to nanobot** (`server.py`):
   ```python
   async def brain_route(message: str, context: dict) -> dict:
       """Pre-LLM routing via local Galileo Brain"""
       prompt = f"[CONTESTO]\ntab: {context.get('activeTab', 'simulator')}\n...\n\n[MESSAGGIO]\n{message}"
       response = await call_ollama_async("galileo-brain", prompt)
       return json.loads(response)
   ```
4. **Modify `/chat` endpoint**: Call Brain first, then route based on `intent` and `needs_llm`
5. **Latency budget**: Brain adds ~6s on M1, ~1-2s on GPU. For Render deployment, consider:
   - Render GPU instance (adds $$$)
   - Keep Brain on local/edge device
   - Use Brain only for deterministic actions, bypass for known LLM-required intents

### Deployment Considerations

| Option | Cost | Latency | Feasibility |
|--------|------|---------|-------------|
| Brain on Render CPU | $7/mo (existing) | ~10-15s | TOO SLOW |
| Brain on Render GPU | ~$50/mo | ~1-2s | VIABLE but expensive |
| Brain on edge (M1) | $0 | ~6s | Only for local dev |
| Cloud Brain via API | Variable | ~1s | Defeats purpose (latency) |
| Skip Brain, keep regex | $0 | ~0ms | CURRENT APPROACH, WORKS |

**Recommendation**: The current `deterministic_action_fallback()` regex system in nanobot handles the most common action intents effectively (play, pause, clearall, reset, compile, loadexp, opentab, highlight). The Brain adds value primarily for:
- Circuit building intents (component placement + wiring)
- Multi-intent disambiguation
- Edge cases (typos, colloquial language)

These are already handled by cloud LLM routing. **The Brain's value proposition is cost reduction (fewer cloud API calls), not accuracy improvement.**

---

## Conclusions

### Why Grade S is Unachievable (Current Setup)

1. **No fine-tuned model on disk**: The GGUF from Colab training (loss 0.013) was never transferred
2. **Hardware limitation**: 8GB M1 cannot run Qwen3 4B at useful speeds
3. **Base model inadequacy**: Un-fine-tuned Gemma2 2B achieves only 9.2% — the intent taxonomy is too specialized for zero-shot

### What Would Be Needed for Grade S

| Requirement | Current State | Needed |
|-------------|---------------|--------|
| Fine-tuned GGUF | Missing | Transfer from Colab |
| Hardware | M1 8GB | M1 Pro 16GB+ or GPU |
| Inference speed | 6.6s (2B) / >10min (4B) | <2s target |
| Training data | 500 examples (PoC) → 2000 examples (v2) | Sufficient |
| Eval infrastructure | 120 tests ✅ | Ready |

### Action Items

1. **[IMMEDIATE]** Transfer `galileo-brain-v2-gguf.Q4_K_M.gguf` from Google Colab/Drive to local `models/` directory
2. **[IMMEDIATE]** Run `ollama create galileo-brain -f models/Modelfile` with actual GGUF
3. **[IMMEDIATE]** Re-run eval suite: `python3 scripts/test-brain-complete.py --model galileo-brain --report`
4. **[IF PASS]** Integrate Brain into nanobot server.py as pre-routing layer
5. **[IF FAIL]** Generate additional training examples from failure analysis, retrain on Colab
6. **[LONG-TERM]** Consider Render GPU instance for production Brain deployment

### Files Produced

| File | Description |
|------|-------------|
| `reports/GALILEO-BRAIN-FINAL-REPORT.md` | This report |
| `reports/test-report-20260307_031202.md` | Detailed test results (109 failures) |
| `reports/test-results-20260307_031202.jsonl` | Machine-readable results (120 records) |
| `datasets/brain-test-report-20260307_031202.md` | Compat copy for meta-trainer |
| `scripts/test-brain-complete.py` | Test runner (767 lines, streaming API) |
| `models/Modelfile.qwen3-brain` | Qwen3 4B + Brain system prompt |

### Test Infrastructure Ready

The evaluation pipeline is fully operational:
```bash
# Run eval suite
python3 scripts/test-brain-complete.py --model <MODEL> --report --timeout 300

# Analyze results
python3 scripts/meta-trainer.py analyze

# Full pipeline
python3 scripts/meta-trainer.py test && python3 scripts/meta-trainer.py analyze
```

---

*Report generated by Claude Opus 4.6 — Session 76*
*Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>*
