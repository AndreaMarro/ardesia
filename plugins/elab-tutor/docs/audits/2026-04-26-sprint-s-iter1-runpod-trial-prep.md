# Sprint S iter 1 — RunPod Trial Prep

**Date**: 2026-04-26 ~05:55 CEST
**Branch**: `feat/sprint-s-iter-1-runpod-trial-2026-04-26` (from `docs/sprint-q-comprehensive-2026-04-25`)
**Goal**: prepare RunPod hourly GPU trial path as alternative/complement to Hetzner monthly commit, deliver scripts + bench harness, dispatch parallel Mac Mini Wiki batch.

---

## 0. Decision: RunPod hourly over Hetzner-direct

Andrea decided after Hetzner trial discussion:
- **No Hetzner trial available** (dedicated monthly only, €184-838/mo, €79 setup)
- **RunPod hourly on/off** = $0.79/h RTX 6000 Ada 48GB, instant stop, $0.10/GB/mo storage persists
- **Non-GDPR ok per test only** (fixture sintetiche, zero PII reali)
- **Strategy**: RunPod test fase, Scaleway FR validation finale, Hetzner commit when 5+ paying schools

Cost projection:
| Phase | Provider | $/h | Monthly burn | When |
|-------|----------|-----|--------------|------|
| Test fase (oggi-7d) | RunPod RTX 6000 Ada | $0.79 | ~$50-100 (60-120h on/off) | now |
| Pre-prod validation | Scaleway H100 FR GDPR | €3.80 | €23 burst (6h finale) | post test PASS |
| Production stable | Hetzner GEX130 €838/mo | - | €838 | post 3+ paying schools |

Risparmio fase test vs Hetzner direct: -90% ($100 vs €838).

---

## 1. Deliverables this iter

### 1.1 Scripts created

| File | Purpose | Lines |
|------|---------|-------|
| `scripts/runpod-pod-create.sh` | REST API pod creation, GPU type selectable, public proxy URLs returned | ~95 |
| `scripts/runpod-deploy-stack.sh` | Inside-pod provisioning: Ollama+BGE-M3+reranker+Coqui+Whisper, PyTorch base image, Python fallback if Docker absent | ~210 |
| `scripts/runpod-r0-bench.mjs` | R0 fixture (10 prompt) → Ollama API → score-unlim-quality scorer → audit doc generated | ~155 |

All chmod +x. Use `execFileSync` (not `exec`) per security hook guidance.

### 1.2 Mac Mini parallel batch dispatched

Branch: `mac-mini/wiki-concepts-batch-20260426-XXXXXX` (running)
Concepts: `diodo led-rosso transistor-npn condensatore-elettrolitico potenziometro` (5)
ETA: ~18min (5 × 3.6min Sonnet 4.6)
Status at iter close: `STILL_RUNNING` (will auto-commit on result)

### 1.3 R0 fixture + scorer verified ready

- `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` — 10 prompts (introduce, debug, verify, capitolo-intro, off-topic, deep-question, safety-warning, action-request, narrative-transition, book-citation-request)
- `scripts/bench/score-unlim-quality.mjs` — 305 lines, 12 PZ rules
- Bench harness `runpod-r0-bench.mjs` invokes scorer via execFileSync, generates audit md.

---

## 2. RunPod execution flow (Andrea instruction set)

### 2.1 Andrea side (5 min)

1. Signup https://www.runpod.io/console/signup
2. Add credit (min $10)
3. Settings → API Keys → Create → save `RUNPOD_API_KEY`
4. Provide to next session (chat OR file `~/.elab-credentials/sprint-s-tokens.env`)

### 2.2 Claude side (autonomous post API key)

```bash
export RUNPOD_API_KEY="..."

# 1. Create pod (RTX 6000 Ada 48GB default)
bash scripts/runpod-pod-create.sh "RTX 6000 Ada"
# → outputs Pod ID, save: export ELAB_RUNPOD_POD_ID="..."

# 2. Wait ~2min for pod boot, SSH in
runpodctl ssh "$ELAB_RUNPOD_POD_ID"
# OR web console RunPod → Pods → click pod → Web Terminal

# 3. Inside pod: deploy stack (~15-30min download + boot)
curl -fsSL https://raw.githubusercontent.com/AndreaMarro/elab-tutor/feat/sprint-s-iter-1-runpod-trial-2026-04-26/scripts/runpod-deploy-stack.sh | bash
# OR: scp script and bash

# 4. From MacBook: run R0 benchmark
RUNPOD_PROXY_BASE="https://${ELAB_RUNPOD_POD_ID}-11434.proxy.runpod.net" \
MODEL="qwen2.5:7b" \
  node scripts/runpod-r0-bench.mjs

# 5. Stop pod when done (storage persists, $0.10/GB/mo)
runpodctl stop pod "$ELAB_RUNPOD_POD_ID"
```

---

## 3. Stack v3 ↔ RunPod GPU mapping

| RTX 4090 24GB ($0.34/h) | RTX 6000 Ada 48GB ($0.79/h) | H100 80GB ($2.39/h) |
|---|---|---|
| qwen2.5:7b text only OR qwen2.5vl:7b VLM | qwen2.5vl:7b + BGE-M3 + Coqui + Whisper full | qwen2.5vl:32b (Qwen3-VL-32B not yet on Ollama) full stack |
| ~13GB used | ~26GB used (22GB free) | ~50GB used (30GB headroom) |
| Test minimal | **DEFAULT trial** | Stretch validation prod-grade |

---

## 4. Honesty caveats

1. **Qwen3-VL-32B not yet on Ollama hub** (as of 2026-04-26) — fallback `qwen2.5vl:7b` + `qwen2.5:7b` text. Quality test on 7B may not predict 32B prod quality. H100 trial step needed for true Qwen3-VL-32B AWQ via vLLM/SGLang manual install.
2. **RunPod regions US-skewed** — not GDPR-compliant for student production. Test only.
3. **Coqui XTTS-v2 placeholder speaker sample** in deploy script — `np.random.randn` noise. Real voice clone (Andrea/Tea/actor 6sec) required for quality TTS.
4. **R0 fixture 10 prompts** = small sample. Sprint R5 = 50-prompt stress.
5. **TEI Docker fallback to Python sentence-transformers** if pod base image lacks Docker. May add ~30s startup overhead.
6. **Scoring rubric 12 PZ rules** = my interpretation. Andrea may want different weights.
7. **Whisper STT Italian-only locked** in deploy (`language="it"`). Works for ELAB but limits multilingual.
8. **Public RunPod proxy URLs** — NO auth header by default. Pre-prod must add nginx auth gate. Trial = open OK because non-GDPR + ephemeral.
9. **`runpodctl` not installed on MacBook yet** — Andrea may need `brew install runpod/runpodctl/runpodctl` OR use web console.
10. **Mac Mini batch 5 concepts STILL RUNNING** at iter close — auto-pull on next iter.

---

## 5. Sprint S progression

### 5.1 SPRINT_S_COMPLETE 10-box check (iter 1 close)

| # | Box | Status | Note |
|---|-----|--------|------|
| 1 | VPS GPU Hetzner GEX130 deployed | ❌ | Pivot: RunPod hourly first, Hetzner later |
| 2 | 9-component stack live | ❌ | Scripts ready, awaits API key |
| 3 | 6000 RAG chunks Anthropic Contextual ingest | ❌ | depends VPS GPU + Supabase migration apply |
| 4 | 100+ Wiki LLM concepts | ⚠️ | 45 + 5 batch in progress (~50/100) |
| 5 | UNLIM synthesis prompt v3 wired prod | ❌ | depends PR #37 merge |
| 6 | Hybrid RAG live | ❌ | depends VPS GPU + migration |
| 7 | Vision flow live | ❌ | depends Qwen3-VL deploy |
| 8 | TTS+STT Italian working | ❌ | scripts ready, awaits pod |
| 9 | R5 stress 50-prompts ≥85% | ❌ | depends R0-R4 |
| 10 | ClawBot 80-tool dispatcher | ❌ | gate post R5 PASS |

**0/10 → 0/10**. No production change yet (foundation iter 1).

### 5.2 Iter 1 done deliverables

- 3 scripts (pod-create + deploy-stack + bench harness)
- 1 audit doc (this)
- 1 Mac Mini batch dispatched (5 concept incremental)
- R0 fixture path verified

### 5.3 Iter 2 trigger

- Andrea provides `RUNPOD_API_KEY`
- Iter 2: execute pod create + deploy + R0 bench
- Iter 3: analyze scorer output, decide next model size + Hetzner commit timing

---

## 6. CoV check

- Branch from Sprint Q PR #41 baseline (12291 PASS not re-verified this iter, infra-only changes)
- Scripts standalone: `chmod +x` applied, no test suite impact
- No src/ touched → no test regression possible
- No supabase/ migrations applied → no DB risk
- No prod deploy → zero blast radius
- Mac Mini batch isolated branch `mac-mini/wiki-concepts-batch-*`

---

## 7. Quality audit

| Axis | Score | Note |
|------|-------|------|
| Reproducibility | HIGH | scripts deterministic, env-var config |
| Security | MEDIUM | execFileSync (not exec), API key env var, public proxy NO auth (trial only) |
| Cost control | HIGH | hourly billing, stop-on-done documented, audit reminds Andrea |
| GDPR | LOW (trial) → must clarify Scaleway FR pre-prod path |
| Italian quality | UNTESTED | requires actual run, blocked on API key |
| Honesty | HIGH | 10 caveats explicit |

---

## 8. References

- Stack v3: `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md`
- PDR Sprint S: `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md`
- PDR Appendix: `docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md`
- Handoff: `docs/handoff/2026-04-26-ralph-loop-handoff.md`
- Scaleway alt script: `scripts/vps-gpu-trial-scaleway.sh`
- R0 fixture: `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl`
- Scorer: `scripts/bench/score-unlim-quality.mjs`

---

**File path**: `docs/audits/2026-04-26-sprint-s-iter1-runpod-trial-prep.md`
**Skill compliance**: quality-audit + writing-plans + documentation
**Sprint**: S iter 1
**Caveman**: chat replies caveman; this audit doc normal language per skill rule
