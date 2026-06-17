# Ralph Loop Iter 3 + Iter 4 Audit

**Date**: 2026-04-26 ~04:30 CEST
**Iterations**: 3, 4 / 20
**Promise**: SPRINT_R_COMPLETE = FALSE (0/10 boxes — VPS not deployed, RAG not ingested, etc.)

---

## Iter 3 outputs

| # | Item | Output | SHA |
|---|------|--------|-----|
| 1 | Pull 5 batch concepts | scp + commit + push PR #43 | 2ec6307 |
| 2 | Sprint VPS-1 deploy script | scripts/vps-gpu-trial-scaleway.sh | 85790ec |
| 3 | Stack V3 DEFINITIVE doc | docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md (370 lines) | a309d93 |
| 4 | Web research multimodal LLM | Qwen3-VL-32B unified preferred | DOC |
| 5 | Web research Hetzner GEX130 specs | RTX 6000 Ada 48GB €838/mo correct, GEX44 20GB tight | DOC |
| 6 | Web research Anthropic Contextual Retrieval | +49% Embed+BM25, +67% rerank | DOC |
| 7 | Web research vLLM vs SGLang vs Ollama | SGLang 6.4x vLLM RAG, Ollama 19x slower | DOC |
| 8 | Web research STT Italian | Whisper Large V3 Turbo via faster-whisper | DOC |
| 9 | Mac Mini SSH triple-cleanup | Keychain progettibelli-go DELETED + ~/.config/gh removed | ✅ ENFORCED |
| 10 | Dispatch Mac Mini batch 3 | 5 concepts: circuito-aperto + corrente-alternata + corrente-continua + fusibile + relè | 🔄 RUNNING |

---

## Iter 4 outputs

| # | Item | Output | SHA |
|---|------|--------|-----|
| 1 | Sprint R0 fixture file | 10 prompts ELAB tutoring scenarios | (pending push) |
| 2 | Sprint R0 scorer (Principio Zero compliance) | 10 rules CRITICAL/HIGH/MEDIUM/LOW weighted | (pending push) |
| 3 | Verify stack v3 push | a309d93 origin confirmed | ✅ |
| 4 | Continue batch 3 monitor | 1/5 done (circuito-aperto 104 lines) | 🔄 |

### 2.1 Sprint R0 fixture details

**10 scenarios coverage**:
1. introduce-concept (LED basics, Vol1)
2. debug-circuit (LED non si accende)
3. verify-comprehension (serie LED corrente)
4. capitolo-intro (Vol2 cap11 diodi)
5. off-topic (ristorante out-of-scope)
6. deep-question (PWM 490Hz Arduino timer)
7. safety-warning (LED su 9V senza R)
8. action-request (evidenzia LED → expects [AZIONE:highlight])
9. narrative-transition (dopo esp1 cosa fare)
10. book-citation-request (verbatim ALLOWED edge case)

**10 scoring rules**:
1. plurale_ragazzi (HIGH)
2. no_imperativo_docente (**CRITICAL**)
3. max_words ≤60 (HIGH)
4. citation_vol_pag (MEDIUM, conditional)
5. analogia (MEDIUM, conditional)
6. no_verbatim_3plus_frasi (HIGH)
7. linguaggio_bambino (LOW)
8. action_tags_when_expected (HIGH)
9. synthesis_not_verbatim (**CRITICAL**, measured live RAG comparison)
10. off_topic_recognition (HIGH)

**Verdict thresholds**: ≥85% PASS, 70-84% WARN, <70% FAIL.

---

## 3. Strategic answers Andrea

### 3.1 Hetzner BEST assoluto?

**SI** confirmed:
- **GEX130 RTX 6000 Ada 48GB**: €838/mo OR €1.34/h, EU FSN1+NBG1, Apache compatible
- **€1.15/h equivalent committed** = 2-3x cheaper than cloud hourly even on 24/7
- Cloud comparison: Scaleway A100 €2.70/h (€1944/mo always-on), H100 €3.80/h (€2736/mo), AWS/GCP 3-5x markup

**Trade-off**: monthly commit not hourly. Trial PRIMA via Scaleway (€5-23 entry).

### 3.2 Combinazione perfetta

| Component | Choice | Reason |
|-----------|--------|--------|
| LLM+VLM | **Qwen3-VL-32B AWQ** | Unified, 200+ langs Italian, vision support |
| Engine | **SGLang RadixAttention** | 6.4x vLLM RAG, prefix caching ELAB conv |
| Embeddings | **BGE-M3** | dense+sparse+multi-vector single model |
| Reranker | **bge-reranker-large** | +67% retrieval (Anthropic) |
| TTS Italian | **Coqui XTTS-v2** | 16 lang Italian + 6sec voice clone |
| STT | **Whisper Large V3 Turbo** via faster-whisper | 6x V3 RTFx 216x |
| Image gen Sprint 7+ | **FLUX.1 Schnell** | Apache 2.0 4-step text rendering |
| Hybrid RAG | **BM25 + BGE-M3 + RRF + reranker + Anthropic Contextual** | +49% Contextual, +67% rerank |

### 3.3 Cosa darmi per autonomia

Critical (1-3):
1. **Scaleway API token** (server provisioning auto)
2. **Cloudflare API token** (DNS + Tunnel auto)
3. **HuggingFace token** (model download auto)

Optional (4-7):
4. Permission policy doc (auto-deploy if test PASS)
5. Budget cap (€50 trial weekend, €917 Hetzner first month)
6. Approval channel (NO Telegram per richiesta — email)
7. Voice clone 6sec audio source (Andrea/Tea/actor)

Without 1-3: I script + Andrea executes manually.
With 1-3: full autonomous Sprint VPS-1 + VPS-2 deploy.

---

## 4. Quality verification (CoV)

| Check | Method | Result |
|-------|--------|--------|
| Stack v3 doc 370 lines pushed | `git log origin` | a309d93 ✅ |
| Sprint R0 fixture 10 prompts valid JSONL | jq parse | ✅ |
| Sprint R0 scorer baseline mode runs | `node ... --baseline` | ✅ 10 fixtures listed |
| Mac Mini SSH state clean | find ~/.ssh + Keychain | ZERO private keys + GitHub creds DELETED ✅ |
| Batch 3 running | pgrep wiki-batch | PID 29806 active ✅ |
| Existing tests baseline | npx vitest run (last) | 12459 PASS Q4 branch ✅ |

---

## 5. Honest gaps remaining iter 5+

1. **VPS GPU NOT deployed** — Andrea credentials pending
2. **6000 RAG chunks NOT ingested** — needs VPS GPU
3. **Anthropic Contextual Retrieval NOT applied** — needs VPS GPU
4. **Sprint R0 baseline NOT run live** — needs production endpoint test
5. **Wiki LLM 100+ goal**: 7 concepts in PR #43 + 30 base = 37/100. ETA: ~7 more overnight batches × 3 days
6. **OpenClaw Sprint 6 Day 39 deferred** — gate Sprint R5
7. **PR cascade Sprint Q (#34-#40) NOT MERGED** — Andrea bottleneck
8. **Iter 4 audit doc NOT yet committed** (will commit end iter 4)

---

## 6. Iter 5 plan

- Wait batch 3 finish (5 concepts) → pull + commit + push to PR #43
- Write Anthropic Contextual Retrieval ingest script (executable, awaiting VPS GPU)
- Write hybrid RAG search RPC SQL (Supabase pgvector)
- Continue ralph loop unless Andrea tokens arrive

---

## 7. Promise check

`SPRINT_R_COMPLETE` = FALSE.

Status: 0/10 definition criteria met. Foundation phase. Mac Mini batch worker validated. Sprint R0 fixture ready. Stack v3 documented. VPS GPU + RAG ingest BLOCKED on Andrea credentials.

Continue iter 5.

---

**File path**: `docs/audits/2026-04-26-ralph-iter3-iter4-audit.md`
**Honesty**: 8 gaps explicit
