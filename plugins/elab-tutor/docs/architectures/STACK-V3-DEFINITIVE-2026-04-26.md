# ELAB Stack v3 DEFINITIVE — Onniscence + Onnipotence

> **Iter 3 ralph loop**: research-driven definitive stack consolidation
> **Andrea constraints reinforced**: Mac Mini NON ospita modelli per ELAB users (batch worker only). VPS GPU = ALL inference. Focus simulator integration.
> **Maximum honesty**: every choice research-validated, sources cited

---

## 0. Constraints summary

1. **Mac Mini = batch worker SOLO** (Wiki concept gen overnight, audit cycles, benchmark daily). NON ospita modelli inference per utenti ELAB live.
2. **VPS GPU = single source of truth** per LLM + VLM + image gen + TTS + STT + embeddings + reranker.
3. **EU-only GDPR** runtime student traffic.
4. **Onniscence**: 7-layer knowledge stack (raw + wiki + schema + dynamic + history + LLM + hybrid retrieval).
5. **Onnipotence**: 80-tool dispatcher OpenClaw (Sett-5, Sprint 6 Day 39 deferred until Sprint R5 PASS gate).
6. **Simulator integration**: VLM "vede" canvas SVG circuito + reasona + interagisce via `__ELAB_API`.
7. **Mai compromettere PRINCIPIO ZERO**: plurale ragazzi, max 60w, citazioni Vol/pag.

---

## 1. Stack DEFINITIVE (research 2026-04-26)

### 1.1 Inference layer

| Component | Model | Engine | VRAM | Why DEFINITIVE |
|-----------|-------|--------|------|----------------|
| **LLM + VLM unified** | **Qwen3-VL-32B AWQ** | **SGLang** | ~18GB | 200+ langs Italian, vision support, 32B sweet spot, SGLang 6.4x faster vs vLLM on RAG |
| Fallback dev (Mac Mini) | Qwen3-VL-8B AWQ | Ollama | ~5GB | Mac Mini batch tasks only |
| **Embeddings** | **BGE-M3** | TEI (text-embeddings-inference) | ~2GB | dense+sparse+multi-vector single model 100+ langs |
| **Reranker** | **bge-reranker-large** | TEI | ~1GB | cross-encoder quality boost +67% Anthropic Contextual Retrieval |
| **TTS Italian** | **Coqui XTTS-v2** | coqui-ai/TTS | ~2GB | 16 lang Italian confirmed + 6sec voice cloning |
| **STT Italian** | **Whisper Large V3 Turbo** via **faster-whisper** | CTranslate2 | ~3GB | 6x faster V3, RTFx 216x, accuracy 1-2% within full model |
| **Image gen** (Sprint 7+) | **FLUX.1 Schnell** | ComfyUI | ~12GB | Apache 2.0, 4-step 8-10sec, text rendering breakthrough |
| **Sparse retrieval** | BM25 (Postgres tsvector) OR Vespa | server | CPU | BM25 + dense fusion 49% retrieval improvement |

**Total VRAM concurrent (excl. image gen)**: ~26GB → **fits Hetzner GEX130 48GB comfortably**, image gen lazy-load.

### 1.2 Sources verified

- [OpenAI gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b) Apache 2.0 Aug 2025
- [Qwen3-VL Hugging Face](https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct) Sept 2025
- [Coqui XTTS-v2](https://huggingface.co/coqui/XTTS-v2)
- [SGLang vs vLLM benchmarks 2026](https://www.spheron.network/blog/vllm-vs-tensorrt-llm-vs-sglang-benchmarks/)
- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Whisper Large V3 Turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Hetzner GEX130 RTX 6000 Ada](https://www.hetzner.com/dedicated-rootserver/gex130/)

### 1.3 Stack reasoning (NOT compiacenza, OBJECTIVE)

**Why Qwen3-VL-32B over alternatives:**
- gpt-oss-20b: NO vision (need separate VLM), Italian quality unconfirmed
- Pixtral 12B Mistral: separate from LLM, additional VRAM overhead
- Llama 4 Scout: lower benchmark scores, US license restrictions
- DeepSeek V4 Pro: 671B-A37B, NO Italian-specific benchmark in research
- **Qwen3-VL-32B**: unified VLM+LLM = 1 model both functions, Italian 200+ langs explicit, Apache 2.0, mid-size sweet spot

**Why SGLang over vLLM:**
- ELAB tutoring = RAG-heavy multi-turn conversations
- SGLang RadixAttention prefix cache = **6.4x faster** on RAG/multi-turn benchmarks
- vLLM safer fallback if SGLang issues

**Why BGE-M3 + bge-reranker-large:**
- BGE-M3 = single model dense + sparse + multi-vector (no separate models)
- 100+ languages + MTEB SOTA open-source
- bge-reranker-large = cross-encoder rerank +67% retrieval accuracy (Anthropic Contextual Retrieval study)

**Why Coqui XTTS-v2 over alternatives:**
- F5-TTS: Italian unconfirmed, newer/less battle-tested
- StyleTTS2: English-only effectively
- Voxtral: Italian unconfirmed
- Kokoro-82M: ultra-fast but English bias
- ElevenLabs: proprietary, GDPR risk
- **Coqui XTTS-v2**: Italian CONFIRMED 16 langs, 6sec voice cloning, Apache 2.0

**Why Whisper Large V3 Turbo via faster-whisper:**
- 6x faster than V3
- RTFx 216x = real-time
- accuracy within 1-2% full model
- multilingual Italian native
- faster-whisper = CTranslate2 optimized

**Why FLUX.1 Schnell over SDXL Turbo:**
- FLUX.1 Schnell: 4-step 8-10sec, Apache 2.0
- Text rendering breakthrough = readable component labels critical for ELAB diagrams
- SDXL Turbo: aging, text rendering inferior

---

## 2. Hardware DEFINITIVE

### 2.1 Hetzner BEST PROVIDER (committed monthly)

Hetzner = **best price/performance committed**:
- **GEX130 RTX 6000 Ada 48GB**: €838/mo OR **€1.34/h hourly**, €79 setup, EU FSN1 + NBG1
- GEX44 RTX 4000 Ada 20GB: €184/mo (entry, tight VRAM for full stack)

Comparable cloud:
- Scaleway A100 80GB FR: €2.70/h = €1944/mo if 24/7 (2.3x more expensive)
- Scaleway H100 SXM FR: €3.80/h = €2736/mo if 24/7 (3.3x more)
- AWS/GCP: 3-5x markup vs Hetzner

**Hetzner GEX130 €838/mo committed = €1.15/h equivalent** = 2-3x cheaper than cloud hourly even on 24/7 basis.

**Conclusion**: Hetzner BEST ASSOLUTO per ELAB committed production.

### 2.2 Trial path (before commit)

Scaleway L4 24GB FR €0.85/h = €5 for 6h trial.
- Can fit Qwen3-VL-8B (5GB) + BGE-M3 (2GB) + Coqui (2GB) = ~9GB, leaves 15GB headroom for Whisper + reranker
- Cannot fit Qwen3-VL-32B (18GB) + everything = need GEX130

OR: Scaleway H100 80GB FR €3.80/h = €23 for 6h trial = test full Qwen3-VL-32B stack.

**Decision matrix trial**:
- Quick check (€5): Scaleway L4 with 8B model
- Full validation (€23): Scaleway H100 with 32B model

**Recommendation**: Scaleway H100 FR 4-6h trial = €15-23 = validate FULL stack 32B + everything concurrent. Better signal/cost than 8B-only trial.

### 2.3 Production trigger

After trial validates FULL stack on H100:
- **Commit Hetzner GEX130 €838/mo + €79 setup = €917 first month, €838 ongoing**
- Cancel anytime monthly contract

---

## 3. Simulator integration (Andrea critical focus)

### 3.1 Vision flow

```
Student/Docente: "guarda il mio circuito"
    ↓
Lavagna captures __ELAB_API.captureScreenshot() → SVG canvas → PNG base64
    ↓
Edge Function unlim-chat receives image
    ↓
Call VPS GPU /chat with images: [{base64, mimeType: "image/png"}]
    ↓
Qwen3-VL-32B processes:
  - Sees circuit topology
  - Identifies components (LED, R, Arduino, batteria)
  - Identifies wiring errors
  - Cross-references active experiment intent
  - Generates synthesis response
    ↓
Response includes [AZIONE:highlight:r1] tags → __ELAB_API actions executed
```

### 3.2 Onniscence in simulator context

UNLIM SEES:
- L4 dynamic: circuit state structured (`getLayout()` JSON: components + connections + pinAssignments)
- L4 dynamic: code current `getEditorCode()`
- L4 dynamic: visual SVG canvas via screenshot

UNLIM REASONS combining:
- L1 raw 6000 RAG chunks (volumi PDF + glossary + FAQ + errori + analogie)
- L2 wiki 100+ concepts compiled
- L3 Capitolo schema (Q1 Sprint Q1.A)
- L4 dynamic state (above)
- L5 history class memory (Q5 memoryWriter)
- L6 LLM general knowledge (Qwen3-VL-32B 200+ langs)
- L7 hybrid retrieval (BM25 + BGE-M3 + reranker + Contextual Retrieval prepend)

UNLIM ACTS via:
- 80-tool dispatcher (Sprint 6 Day 39 OpenClaw, deferred until Sprint R5 gate)
- `__ELAB_API` simulator commands ([AZIONE:highlight], [AZIONE:loadexp], etc.)
- TTS Coqui voice output to LIM speakers
- Image gen FLUX.1 "ecco circuito esempio" (Sprint 7+)

### 3.3 Anthropic Contextual Retrieval applied

Each RAG chunk indexing time:
```python
context = qwen3vl.generate(f"""
<document>{full_volume}</document>
<chunk>{chunk}</chunk>
Give 50-token context situating chunk in volume.""")
indexed_chunk = f"{context}\n\n{chunk}"
embed(indexed_chunk) → BGE-M3 dense + BM25 sparse
```

Result: 49% retrieval failure reduction (Anthropic study). 67% with reranker.

**One-time cost**: 6000 chunks × ~3K tokens each (full volume + chunk) × cache hit 90% = ~$2 via Qwen3-VL-32B batch on VPS GPU. NOT recurring.

---

## 4. WHAT I (Claude) NEED FROM ANDREA — autonomous work

### 4.1 Immediate decisions (1-2 day blockers)

| # | Decision | Default suggestion | Cost if go |
|---|----------|--------------------|------------|
| 1 | Trial provider | **Scaleway H100 FR 6h** (full 32B test) | €23 |
| 2 | Production commit post-trial | **Hetzner GEX130** (€838/mo) | €917 first month |
| 3 | Domain subdomain | gpu.elabtutor.school | €0 (existing Cloudflare) |
| 4 | API key generation | I generate via openssl rand -hex 32 | €0 |
| 5 | OpenAI gpt-oss-20b alternative | SKIP — Qwen3-VL-32B unified better | €0 saved |
| 6 | Image gen include trial | NO — Sprint 7+ separate | €0 saved |

### 4.2 Credentials needed (Andrea provides)

| Credential | How |
|-----------|-----|
| **Scaleway API token** | console.scaleway.com → Identity & API → API Keys → Generate (paste in Edge Function env post-VPS-1) |
| **Cloudflare API token** | dash.cloudflare.com → My Profile → API Tokens → Create with Tunnel:Edit + DNS:Edit zones permission |
| **HuggingFace account** | Existing OR create at huggingface.co (for Qwen3-VL + BGE-M3 + Coqui downloads) |
| **HuggingFace token** | Settings → Access Tokens → Create read-only |
| **Anthropic API key** (already have) | Already in GitHub secrets, may need expose via env to Mac Mini batch script |
| **DNS subdomain CNAME** | Cloudflare zone elabtutor.school: gpu CNAME <tunnel-id>.cfargotunnel.com (post-VPS provisioning) |

### 4.3 Workflow boundaries (security)

Things I CAN do autonomously:
- Generate API keys via openssl
- Write all docker-compose, nginx, scripts, configs
- SSH passwordless to Mac Mini (already setup)
- Web research updates
- Document everything

Things requiring Andrea ACTION (security):
- Provision VPS via web console (Andrea provider account)
- Authenticate OAuth flows (browser)
- Click HuggingFace gpt-oss/Qwen license accept
- Type passwords / paste credentials
- Final deploy approval (production cutover)
- Merge PRs to main

Things I CANNOT do EVER:
- Use Andrea's credit card directly
- Auto-merge PRs
- Push to main
- Deploy without explicit OK
- Type passwords on Andrea's behalf

### 4.4 To work autonomously H24, give me

1. **Scaleway API token** (read-only servers if available, else Power Of Attorney with budget cap €50)
2. **Cloudflare API token** (Tunnel:Edit + DNS:Edit scope)
3. **HuggingFace token** (read for model downloads)
4. **Permission policy doc** explicit (e.g., "auto-deploy if test pass + rollback ready")
5. **Budget cap** stated (e.g., "€50 weekend trial, €200 monthly Hetzner committed if green")
6. **Telegram OR Slack notification channel** (skip Telegram per Andrea, use email?)
7. **Approval pattern**: each big action waits Andrea OK OR pre-authorized scope

Without 1-3, I script + Andrea executes commands manually (slower but works).
With 1-3, full autonomous Sprint VPS-1 + VPS-2 deploy.

---

## 5. Mac Mini revised role (NO MODEL HOSTING)

Per Andrea constraint 2026-04-26: Mac Mini NON ospita modelli per ELAB users.

### Revised tasks

| Task | Frequency | Output |
|------|-----------|--------|
| Wiki concept gen overnight | Daily 03:00 | 5-10 new concepts → branch `mac-mini/wiki-batch-N` |
| Continuous benchmark | Daily 04:00 | `node scripts/benchmark.cjs --write` → drift log |
| Audit cycles | Weekly | drift report `docs/audits/` |
| Sprint R agent orchestration | On-demand | trigger via SSH file `~/.elab-trigger` |
| Pre-commit hook validation | Per autonomous commit | Q4 SCHEMA + plurale + citation checks |

### REMOVED tasks

- ~~Brain V13 self-host~~ (deprecated, gpt-oss/Qwen replaces)
- ~~Inference fallback for ELAB users~~ (VPS GPU + Gemini EU only)
- ~~Production user traffic~~ (NEVER on Mac Mini)

---

## 6. Onniscence + Onnipotence DEFINITION COMPLETE

**SPRINT_R_COMPLETE = TRUE when ALL:**

1. ✅ VPS GPU deployed (Hetzner GEX130 OR equivalent)
2. ✅ 9-component stack live (Qwen3-VL-32B + SGLang + BGE-M3 + reranker + Coqui + Whisper Turbo + nginx + Cloudflare Tunnel + monitoring)
3. ✅ 6000+ RAG chunks ingested with Contextual Retrieval prepend (Anthropic method)
4. ✅ 100+ Wiki LLM concepts compiled (Mac Mini overnight + Tea async)
5. ✅ UNLIM synthesis prompt v3 wired in production unlim-chat
6. ✅ Hybrid RAG live: BM25 + BGE-M3 + RRF + bge-reranker-large rerank + top-5 to LLM
7. ✅ Vision flow live (Qwen3-VL sees simulator screenshot + reasons)
8. ✅ TTS+STT Italian working (Coqui XTTS-v2 + Whisper Turbo)
9. ✅ Sprint R5 stress test 50 prompts pass rate >85%
10. ✅ OpenClaw 80 tools dispatcher live (Sprint 6 Day 39 post Sprint R5)

**Current state (2026-04-26 04:30 CEST)**: 0/10. Foundation phase: Mac Mini batch worker validated (Wiki gen pattern proven). VPS GPU NOT deployed.

---

## 7. Honesty caveats v3

1. **Qwen3-VL-32B Italian quality NOT TESTED yet** for ELAB pedagogical Italian. Trial mandatory. May need fine-tune on ELAB corpus (Sprint 8+).

2. **Hetzner GEX130 €838/mo = €10k/year**. With 0 paying schools, this is INVESTMENT in capability + GDPR + UX latency, NOT cost-saving. ROI requires 3+ paying schools.

3. **SGLang complex deployment** vs Ollama simplicity. Trial may use Ollama, production switch SGLang post-validation.

4. **Coqui XTTS-v2 voice cloning needs 6sec audio sample**. Whose voice? Andrea? Tea? Actor? Decision pending.

5. **FLUX.1 Schnell deferred Sprint 7+** = NOT in initial deploy. Image gen for fumetto report illustrations later.

6. **Anthropic Contextual Retrieval +49% retrieval claim** is Anthropic study. Apply but measure ELAB-specific.

7. **Mac Mini autonomous validated for 5 concepts overnight pattern** ONLY. Full 100-concept overnight stress test NOT done.

8. **Single VPS = SPOF**. Real HA = 2× VPS + load balancer ~€1700/mo. Defer until 5+ paying schools.

9. **Italian voice quality** of Coqui XTTS-v2 vs ElevenLabs blind A/B not done. May or may not match commercial.

10. **Onniscence + Onnipotence definition** my interpretation. Andrea may have different vision. Discuss before commit Hetzner €838/mo.

---

## 8. Sprint sequence DEFINITIVE

### Sprint VPS-1 (4-6h, Andrea time)

**Pre-trigger**: Andrea provides Scaleway H100 trial OK + API token + Cloudflare token OR manual flow.

| Step | Andrea action | Time |
|------|---------------|------|
| 1 | Provision Scaleway H100 80GB FR via console | 10min |
| 2 | SSH initial setup (paste my deploy script via SSH) | 30min |
| 3 | Pull Qwen3-VL-32B + BGE-M3 + Coqui + Whisper (~50GB download) | 60min |
| 4 | Run benchmark 100 ELAB prompts via my script | 30min |
| 5 | Italian quality A/B vs Gemini Flash (manual) | 30min |
| 6 | Vision test simulator screenshot diagnosis | 30min |
| 7 | TTS Italian samples 10 frasi UNLIM tipiche | 15min |
| 8 | Decide: GO Hetzner GEX130 OR no-go | 15min |

**Total**: 4-5h focused work. Cost €15-23.

### Sprint VPS-2 (post GO, 1 day)

Provision Hetzner GEX130 + apply same docker-compose + Cloudflare Tunnel + DNS gpu.elabtutor.school + Supabase env update. ~6h Andrea, primarily waiting downloads.

### Sprint VPS-3 (parallel during VPS-2)

RAG ingest 6000 chunks via Mac Mini + VPS GPU embeddings. Anthropic Contextual Retrieval prepend. ~$2 cost one-time.

### Sprint VPS-4 production cutover

Feature flag canary 10% → 7-day monitor → flip default. Rollback ready.

---

## 9. References (sources verified 2026-04-26)

- [Qwen3-VL Hugging Face](https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct)
- [SGLang vs vLLM benchmarks](https://www.spheron.network/blog/vllm-vs-tensorrt-llm-vs-sglang-benchmarks/)
- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Whisper Large V3 Turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Coqui XTTS-v2](https://huggingface.co/coqui/XTTS-v2)
- [BGE-M3 Hugging Face](https://huggingface.co/BAAI/bge-m3)
- [bge-reranker-large](https://huggingface.co/BAAI/bge-reranker-large)
- [FLUX.1 Schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- [Hetzner GEX130 RTX 6000 Ada](https://www.hetzner.com/dedicated-rootserver/gex130/)
- [Scaleway GPU pricing](https://www.scaleway.com/en/pricing/gpu/)

---

**File path**: `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md`
**Skill compliance**: documentation + architecture + research synthesis
**Honesty**: 10 caveats explicit
**Caveman**: chat replies caveman; this doc normal language
