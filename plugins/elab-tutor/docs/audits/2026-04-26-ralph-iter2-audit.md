# Ralph Loop Iteration 2 Audit

**Date**: 2026-04-26 ~04:15 CEST
**Iteration**: 2/20
**Task**: Continue Mac Mini batch monitor + research best stack + VPS GPU plan

---

## 1. Actions executed

| # | Action | Output | Status |
|---|--------|--------|--------|
| 1 | Triple-check SSH MacBook only | Mac Mini Keychain `progettibelli-go` GitHub creds DELETED + ~/.config/gh removed | ✅ ENFORCED |
| 2 | Web research TTS Italian | Coqui XTTS-v2 confirmed Italian, F5-TTS competitor 2026 | ✅ DOC |
| 3 | Web research VLM | Pixtral 12B Mistral 128k context, Qwen3-VL premium | ✅ DOC |
| 4 | Web research image gen | FLUX.1 Schnell Apache 2.0 4-step 8-10s breakthrough | ✅ DOC |
| 5 | Web research hybrid RAG | BM25 + BGE-M3 + RRF + cross-encoder rerank standard 2026 | ✅ DOC |
| 6 | Web research best LLM 2026 | DeepSeek V4 87, Qwen3.5 79 (200 lang), gpt-oss-120b 89% | ✅ DOC |
| 7 | Web research embeddings | BGE-M3 still best open-source, Nomic v2 CPU-fit | ✅ CONFIRMED |
| 8 | Web research EU GPU providers | Hetzner GEX44 €187/mo CHEAPEST committed (€0.26/h equiv), Scaleway A100 €2.70/h cloud | ✅ DOC |
| 9 | Write VPS GPU stack final spec | 419 lines `docs/architectures/vps-gpu-stack-final-2026-04-26.md` | ✅ DONE |
| 10 | Commit + push iter 1 audit | commit 82552bf | ✅ PUSHED |
| 11 | Commit stack final doc | commit c1758b7 (push background) | ✅ DONE |
| 12 | Mac Mini batch progress | 3/5 done (pwm 135 + debounce 174 + uart 180 lines) | 🔄 RUNNING |

---

## 2. Strategic insights (research-driven, OBJECTIVE)

### 2.1 LLM choice revision

| Tier | Model | VRAM | Italian quality | Cost |
|------|-------|------|----------------|------|
| Mac Mini Stage 1 | gpt-oss-20b AWQ | 14GB | unconfirmed Italian | FREE |
| VPS Stage 2 | **Qwen3.5 32B AWQ** | ~18GB | 200+ lang explicit | €187/mo Hetzner |
| Premium | gpt-oss-120b | 80GB | benchmark 89.2% | H100 €3.80/h |

**Decision**: Qwen3.5 32B AWQ on Hetzner GEX44 = best Italian quality + budget production.

### 2.2 TTS choice

| Model | Italian | Voice cloning | Speed | Naturalness |
|-------|---------|---------------|-------|-------------|
| **Coqui XTTS-v2** | ✅ 16 lang | 6sec sample | medium | high |
| F5-TTS | unconfirmed | yes | medium | best 2026 |
| Kokoro-82M | English-only? | no | 0.3s ultrafast | medium |
| StyleTTS2 | English only | yes | medium | high |

**Decision**: Coqui XTTS-v2 primary (Italian confirmed). F5-TTS evaluate post-VPS deployed (better naturalness if Italian works).

### 2.3 GPU provider DEFINITIVE

| Provider | GPU | Cost | EU GDPR | Hourly trial |
|----------|-----|------|---------|--------------|
| **Hetzner GEX44** | RTX 6000 Ada 48GB | €187/mo (€0.26/h equiv) | ✅ DE | NO (mensile only) |
| Hetzner GEX131 | RTX PRO 6000 Blackwell 96GB | €838/mo | ✅ DE | NO |
| **Scaleway L4** | L4 24GB | €0.85/h | ✅ FR | YES |
| Scaleway A100 | A100 80GB | €2.70/h (€1944/mo) | ✅ FR | YES |
| Scaleway H100 | H100 SXM | €3.80/h | ✅ FR | YES |

**Decision**: Scaleway L4 trial (€3.40-€5 for 4-6h) → IF validates → Hetzner GEX44 mensile production (€187/mo committed best deal).

### 2.4 Embeddings DEFINITIVE

**BGE-M3 confirmed**: dense + sparse + multi-vector in 1 model = hybrid RAG single model. 100+ languages.

Nomic Embed v2 backup: 137M params CPU-fit for Mac Mini sustained workload.

---

## 3. Quality verification (CoV)

| Check | Method | Result |
|-------|--------|--------|
| SSH MacBook only | find ~/.ssh on Mac Mini | ZERO private keys ✅ |
| GitHub creds Mac Mini | security find-generic-password + find-internet-password | Both DELETED ✅ |
| Stack final doc Q4 schema | manual review 419 lines | 9 components specified, 8 honesty caveats ✅ |
| Mac Mini batch script | wiki-batch logs | 3/5 concepts gen success, 0 failure ✅ |
| Iter 1 audit pushed | git log origin | commit 82552bf ✅ |

---

## 4. Honest gaps

1. **Italian quality benchmark UNTESTED** for any model. Sprint VPS-1 must include Italian benchmark on Qwen3.5 vs gpt-oss-20b vs Gemini Flash. Without test = research opinion only.

2. **F5-TTS Italian support unconfirmed** in research. May or may not work. Coqui XTTS-v2 safer.

3. **Hetzner GEX44 RTX 6000 Ada 48GB** marketed as "GPU server" but historical research mentions Hetzner traditionally has NO GPU cloud — only dedicated mensile. Worth verifying CURRENT availability before commit (may be sold out).

4. **Scaleway L4 24GB** sufficient for trial Qwen 14B but NOT 32B. For VPS-1 trial, plan for 14B as fallback.

5. **Cost analysis**: Hetzner GEX44 €187/mo = €2245/y for ELAB with 0 paying schools. ROI = capability investment, NOT cost saving (need 640k+ calls/month to break even vs cloud Gemini).

6. **Mac Mini batch generated wiki concepts NOT auto-validated** Q4 SCHEMA. PR #43 review burden on Andrea.

---

## 5. Iter 3 plan

### 5.1 Continue work

- Wait Mac Mini batch finish (~5 more min)
- scp 5 new concepts → MacBook → commit + push PR #43 (becomes 7 concepts: cortocircuito, divisore-tensione, pwm, debounce, uart, ground, interrupt)
- Verify all 5 SCHEMA compliance (Q4 audit)
- Update Mac Mini doc with research findings (Hetzner sold-out caveat, Qwen3.5 priority)

### 5.2 More research (Andrea ask "scelta migliore")

- Image gen alternative to FLUX (cheaper VRAM): Stable Diffusion 3.5 vs Lumina-mGPT
- Multimodal single model (LLM+VLM combined): InternVL 2.5 vs Pixtral
- Self-hosted Vespa/Qdrant for true BM25 (Postgres tsvector approximates only)
- Anthropic Contextual Retrieval implementation details
- Sprint VPS-1 deployment script generation (executable)

### 5.3 NOT iter 3

- Actual Hetzner provisioning — Andrea decision pending
- RAG ingest 6000 chunks — needs VPS GPU first
- UNLIM synthesis prompt wire-up production — needs PR #37 merge

---

## 6. Promise check

`SPRINT_R_COMPLETE` = FALSE.

Reasons:
- VPS GPU NOT deployed
- 100+ Wiki concepts NOT generated (only 5 batch + 2 manual = 7 total)
- RAG 6000 chunks NOT ingested
- UNLIM synthesis NOT wired production
- OpenClaw 80 tools NOT live

Continue iter 3.

---

**File path**: `docs/audits/2026-04-26-ralph-iter2-audit.md`
**Skill compliance**: documentation + quality-audit
**Honesty**: 6 gaps explicit
