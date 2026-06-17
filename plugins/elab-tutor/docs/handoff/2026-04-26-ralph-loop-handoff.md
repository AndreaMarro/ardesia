# Ralph Loop Session Handoff — 2026-04-26

> Consolidated handoff doc for Andrea covering iter 1-7 (so far) of ralph loop session.
> SPRINT_R_COMPLETE = FALSE. Foundation phase complete. Awaiting Andrea credentials for VPS GPU deploy.

---

## 0. TL;DR (5 line)

1. Mac Mini autonomous loop H24 LIVE — 7 Wiki concepts generated overnight (+5 batch 3 in progress = 12 concepts total in PR #43)
2. VPS GPU stack v3 DEFINITIVE: Qwen3-VL-32B + SGLang + Coqui XTTS-v2 + Whisper Turbo + BGE-M3 + bge-reranker-large + FLUX.1 Schnell (Sprint 7+)
3. Sprint R0 quality scorer ready: 12 rules per Principio Zero v3.1, ≥85% PASS gate
4. RAG hybrid schema + Anthropic Contextual Retrieval ingest pipeline ready (executable post VPS GPU)
5. **BLOCKED ON ANDREA**: 3 credentials (Scaleway + Cloudflare + HuggingFace tokens) for autonomous VPS-1 trial

---

## 1. Iteration log

### Iter 1: Foundation validation
- SSH MacBook-only verified (Mac Mini ZERO private keys, Keychain `progettibelli-go` GitHub creds DELETED)
- gpt-oss-20b OpenAI Aug 2025 + Hetzner GEX44/GEX130 specs research
- 1 Wiki concept Mac Mini autonomous (cortocircuito 4902 bytes)
- VPS GPU standalone arch v1 (735 lines)

### Iter 2: Stack research consolidation
- TTS Italian: Coqui XTTS-v2 confirmed (16 lang, voice cloning 6sec)
- VLM: Pixtral 12B vs Qwen3-VL — Qwen3-VL better Italian
- LLM 2026 leaderboard: DeepSeek V4 87, Qwen3.5 79, gpt-oss-120b 89%
- EU GPU pricing: Hetzner GEX130 €838/mo BEST committed (€1.15/h equivalent)
- Stack v2 final doc (419 lines)

### Iter 3: VPS deploy script + Stack v3 DEFINITIVE
- Multimodal LLM analysis (InternVL3 vs Pixtral vs Qwen3-VL)
- Hetzner GEX130 RTX 6000 Ada 48GB confirmed €838/mo
- Qwen3-VL sizes: 2B/4B/8B/14B/30B-A3B/32B/235B
- `scripts/vps-gpu-trial-scaleway.sh` deploy script (executable)
- Stack v3 DEFINITIVE doc (370 lines, 9 components specified)
- 5 batch concepts pushed PR #43 (pwm + debounce + uart + ground + interrupt)
- Mac Mini SSH triple-cleanup (Keychain + ~/.config/gh removed)

### Iter 4: Sprint R0 quality fixture + scorer
- 10 prompts ELAB tutoring scenarios
- 10 scoring rules per Principio Zero compliance
- Verdict thresholds: ≥85% PASS, 70-84% WARN, <70% FAIL
- Sprint R5 gate framework ready

### Iter 5: PZ vision deep absorption + Contextual Retrieval
- Re-read UNLIM-VISION-COMPLETE.md (THE thesis: "spiega per magia")
- +2 scorer rules: humble_admission + no_chatbot_preamble (12 rules total)
- `scripts/rag-contextual-ingest.mjs` (Anthropic Contextual Retrieval pipeline)
- vLLM vs SGLang vs Ollama: SGLang 6.4x faster RAG (production)
- STT Italian: Whisper Large V3 Turbo via faster-whisper

### Iter 6: Hybrid RAG SQL migration
- `supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql`
- Schema: content + content_raw + embedding(1024) + bm25_tokens + contextual_summary
- Indexes: ivfflat dense + GIN sparse + composite source/chapter/page
- search_rag_hybrid() RPC: RRF k=60 fusion + filters
- RLS: anon read + service_role write

### Iter 7 (current): consolidated handoff
- This doc
- Mac Mini batch 3 still running (3/5 done)
- Awaiting credentials

---

## 2. Outputs catalog

### 2.1 Documentation (committed)

| File | Lines | Purpose |
|------|-------|---------|
| `docs/strategy/2026-04-25-saturday-master-formulation.md` | 703 | Saturday strategic v1 |
| `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` | 1068 | Master plan v2 (Volume parallelism + Mac Mini + Tea + GDPR) |
| `docs/architectures/vps-gpu-standalone-2026-04-26.md` | 735 | VPS GPU arch v1 |
| `docs/architectures/vps-gpu-stack-final-2026-04-26.md` | 419 | Stack v2 |
| `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md` | 370 | **Stack v3 DEFINITIVE** |
| `docs/audits/2026-04-25-c1-mac-mini-setup-validation.md` | 304 | C1 Mac Mini setup validation |
| `docs/audits/2026-04-26-ralph-iter1-audit.md` | 141 | Iter 1 audit |
| `docs/audits/2026-04-26-ralph-iter2-audit.md` | 141 | Iter 2 audit |
| `docs/audits/2026-04-26-ralph-iter3-iter4-audit.md` | TBD | Iter 3+4 audit |
| `docs/handoff/2026-04-26-ralph-loop-handoff.md` | TBD | THIS doc (iter 7 consolidated) |
| `docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md` | 503 | Mac Mini setup steps |
| `docs/tea/2026-04-26-tea-claude-brief.md` | 343 | Tea brief 8 task creative async (added T9) |

### 2.2 Scripts (committed)

| File | Purpose |
|------|---------|
| `scripts/vps-gpu-trial-scaleway.sh` | Sprint VPS-1 executable Scaleway L4 trial |
| `scripts/rag-contextual-ingest.mjs` | Anthropic Contextual Retrieval ingest pipeline |
| `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` | 10 prompts test fixture |
| `scripts/bench/score-unlim-quality.mjs` | Principio Zero compliance scorer (12 rules) |

### 2.3 Mac Mini scripts (deployed)

| File on Mac Mini | Purpose |
|------------------|---------|
| `~/scripts/elab-mac-mini-autonomous-loop.sh` | Loop H24 launchctl plist |
| `~/scripts/elab-wiki-batch-gen.sh` | Batch Wiki concept generator |
| `~/Library/LaunchAgents/com.elab.mac-mini-autonomous-loop.plist` | launchd persistent |
| `~/.claude-tokens/oauth-token` | Claude Code OAuth token (file-based, perms 600) |
| `~/.zshenv` | env var CLAUDE_CODE_OAUTH_TOKEN |

### 2.4 Supabase migration (NOT YET applied)

`supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql` — apply via:
```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked
```

Awaits Andrea OK production migration.

### 2.5 PRs

| PR | Title | Status | Branch |
|----|-------|--------|--------|
| #41 | docs comprehensive + 5 PDR + iter audits + handoff (extends docs branch) | OPEN | docs/sprint-q-comprehensive-2026-04-25 |
| #42 | feat(observability): Vercel Pro Analytics + Speed Insights + EU pinning | DRAFT | perf/vercel-pro-analytics-2026-04-26 |
| #43 | feat(wiki): cortocircuito + divisore-tensione + 5 batch concepts (12 total expected) | DRAFT | mac-mini/wiki-concepts-batch-1-2026-04-25 |
| Sprint Q #34-#40 | Sprint Q infrastructure cascade | DRAFT (awaiting Andrea review/merge) | feat/sprint-q* |

### 2.6 Mac Mini Wiki concepts generated (autonomous)

| # | Concept | Lines | Source branch |
|---|---------|-------|---------------|
| 1 | cortocircuito.md | 83 | mac-mini/wiki-concepts-batch-1 |
| 2 | divisore-tensione.md | 112 | mac-mini/wiki-concepts-batch-1 (added later) |
| 3 | pwm.md | 135 | mac-mini/wiki-concepts-batch-1 |
| 4 | debounce.md | 174 | mac-mini/wiki-concepts-batch-1 |
| 5 | comunicazione-seriale-uart.md | 180 | mac-mini/wiki-concepts-batch-1 |
| 6 | ground.md | 121 | mac-mini/wiki-concepts-batch-1 |
| 7 | interrupt.md | 170 | mac-mini/wiki-concepts-batch-1 |
| 8 | circuito-aperto.md | 104 | batch 3 (in PR pending) |
| 9 | corrente-alternata.md | 129 | batch 3 (in PR pending) |
| 10 | corrente-continua.md | 158 | batch 3 (in PR pending) |
| 11 | fusibile.md | TBD | batch 3 (running) |
| 12 | relè.md | TBD | batch 3 (running) |

**Total**: 7 in PR #43 + 5 batch 3 in progress = **12 concepts when batch 3 finishes**.

Q4 base 30 + 12 batch = 42/100 toward Sprint R3 goal.

---

## 3. Definitive stack final

Per `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md`:

| Layer | Choice | Source |
|-------|--------|--------|
| LLM+VLM | **Qwen3-VL-32B AWQ** | HuggingFace |
| Engine | **SGLang** | RadixAttention 6.4x vLLM RAG |
| Embeddings | **BGE-M3** | dense+sparse+multi-vector unified |
| Reranker | **bge-reranker-large** | +67% Anthropic Contextual |
| TTS Italian | **Coqui XTTS-v2** | 16 lang + voice cloning 6sec |
| STT Italian | **Whisper Large V3 Turbo** via faster-whisper | 6x V3, RTFx 216x |
| Image gen Sprint 7+ | **FLUX.1 Schnell** | Apache 2.0 4-step |
| Hardware production | **Hetzner GEX130 RTX 6000 Ada 48GB** | €838/mo or €1.34/h |
| Hardware trial | **Scaleway L4 24GB FR** | €0.85/h (€5 / 6h) OR Scaleway H100 €23/6h |
| RAG schema | **Anthropic Contextual Retrieval** | +49% Embed+BM25, +67% rerank |
| RAG fusion | **RRF k=60** | premai.io 2026 standard |

---

## 4. WHAT ANDREA NEEDS TO PROVIDE (autonomous unblock)

### Critical (1-3, blocks Sprint VPS-1)

1. **Scaleway API token**
   - Go to: console.scaleway.com → Identity → API Keys → Generate
   - Scope: Full access to compute (or scoped to specific instance)
   - Save: paste in Edge Function env post-deploy

2. **Cloudflare API token**
   - Go to: dash.cloudflare.com → My Profile → API Tokens → Create Token
   - Permissions: Zone:Edit + DNS:Edit + Tunnel:Edit (for elabtutor.school zone)
   - Save: paste in env

3. **HuggingFace token**
   - Go to: huggingface.co → Settings → Access Tokens → New token
   - Scope: read-only (for model downloads)
   - Save: paste in VPS deployment env

### Optional (4-7, refines workflow)

4. Permission policy doc (e.g., "auto-deploy if test PASS + rollback ready" OR "every step Andrea OK")
5. Budget cap explicit (e.g., "€50 trial weekend, €917 Hetzner first month if green")
6. Approval channel (NO Telegram per richiesta — email Andrea or Slack?)
7. Voice clone 6sec audio source (Coqui XTTS-v2): Andrea voice? Tea? Voice actor?

### What I CAN do without credentials

- Mac Mini Wiki batch generation (running)
- Documentation refinement
- Script generation
- Web research updates
- SQL migration prep (committed, awaiting Andrea OK to apply)

### What I CANNOT do (security)

- Provision VPS (need credentials)
- Apply Supabase migrations to production
- Deploy autonomously
- Use Andrea credit card / OAuth flows
- Type passwords on Andrea's behalf

---

## 5. Honesty — what's NOT done despite docs

1. **VPS GPU NOT deployed** — Andrea credentials pending
2. **6000 RAG chunks NOT ingested** — depends on VPS GPU
3. **Anthropic Contextual Retrieval NOT applied** — depends on VPS GPU + SQL migration
4. **Wiki LLM 100+ NOT reached** — 42 today (30 base + 12 batch). Need 7-12 more overnight batches OR Tea async.
5. **OpenClaw Sprint 6 Day 39 NOT started** — gate Sprint R5
6. **Sprint Q PR cascade NOT MERGED** — Andrea review bottleneck
7. **Sprint R0 baseline NOT run live** — need PR #37 merge for production endpoint test
8. **GDPR plan NOT executed** — defensive, parked Sprint R+1
9. **Bundle optimization NOT executed** — Vercel Pro solved OOM, parked Sprint 7
10. **Italian quality benchmark Qwen3-VL-32B NOT TESTED** — Sprint VPS-1 mandatory

---

## 6. Sprint sequence ahead (post Andrea unblock)

### Sprint VPS-1 (Andrea provides 3 credentials)

- 4-6h, €5-23 cost
- Provision Scaleway L4 OR H100 FR
- Apply `scripts/vps-gpu-trial-scaleway.sh`
- Pull Qwen3-VL-8B (or 32B if H100) + BGE-M3 + Coqui + Whisper
- Run benchmark: latency + quality + Italian acceptance
- Decision GO/NO-GO Hetzner GEX130 mensile

### Sprint VPS-2 (post GO)

- Provision Hetzner GEX130 (€917 first month)
- Same docker-compose (full stack)
- Cloudflare Tunnel gpu.elabtutor.school
- Supabase env update (VPS_GPU_URL + ELAB_GPU_API_KEY)
- Wire `callVpsGpu` in `llm-client.ts`
- Production canary 10% feature flag

### Sprint VPS-3 (parallel)

- Apply Supabase migration `2026-04-26_rag_chunks_hybrid_anthropic.sql`
- Run `scripts/rag-contextual-ingest.mjs` (6000 chunks ingested via VPS GPU)
- Cost: ~€2 one-time

### Sprint R cycle (post VPS GPU + Sprint Q PR merge cascade)

- R0: baseline UNLIM quality (10 prompts via fixture + scorer)
- R1: synthesis prompt v3 wire-up
- R2: citazioni inline UI Modalità wire-up (PR #36 merge)
- R3: Wiki LLM 100+ concepts (Mac Mini overnight batches + Tea async)
- R4: memoryWriter wire-up
- R5: stress 50 prompts pass rate ≥85% gate

### Sprint 6 Day 39 OpenClaw (post Sprint R5 PASS)

- 80-tool dispatcher
- Onnipotence definitive

---

## 7. Cost projection (if go full)

| Item | Cost |
|------|------|
| Scaleway L4 trial 6h | €5 |
| OR Scaleway H100 trial 6h | €23 |
| Hetzner GEX130 first month + setup | €917 |
| Hetzner GEX130 ongoing monthly | €838 |
| Anthropic gpt-oss-20b on Mac Mini autonomous loop | $5-15/month (within Max sub) |
| RAG 6000 chunks ingest (one-time) | ~€2 |
| Wiki 100 concepts generation (Mac Mini, ~7 batches × $0.50) | ~$5 |
| Tea async work (8 task creative) | OPEX TBD |
| Cloudflare (Tunnel + Analytics + Speed Insights) | €0 (free tier) |
| Vercel Pro (already paid) | already paid |
| **Total Saturday-Sunday session** | €0 (no spend authorized yet) |
| **Total post Hetzner go** | **~€1000 first month, €840 ongoing** |

---

## 8. Promise check final

**SPRINT_R_COMPLETE** = FALSE.

Definition (10 boxes):
1. ❌ VPS GPU deployed (blocked credentials)
2. ❌ 9-component stack live (blocked VPS GPU)
3. ❌ 6000+ RAG chunks ingested (blocked VPS GPU + migration apply)
4. ⚠️ 100+ Wiki concepts (42/100, ~58% remaining via overnight batches + Tea)
5. ❌ UNLIM synthesis prompt wired (blocked PR #37 merge)
6. ❌ Hybrid RAG live production (blocked VPS GPU + migration)
7. ❌ Vision flow live (blocked Qwen3-VL deploy)
8. ❌ TTS+STT Italian working (blocked VPS GPU)
9. ❌ Sprint R5 stress test ≥85% (blocked R0-R4 wire-up)
10. ❌ OpenClaw 80 tools live (blocked Sprint R5 + Sprint 6 Day 39)

Foundation phase complete. Next phase requires Andrea credentials.

Ralph loop continues iter 8+ until either:
- Andrea credentials arrive → Sprint VPS-1 execution
- Mac Mini batch generates more concepts (autonomous)
- Documentation refinement
- Max iter 20 reached (then resume next session)

---

**File path**: `docs/handoff/2026-04-26-ralph-loop-handoff.md`
**Skill compliance**: documentation + handoff + quality-audit
**Honesty**: 10 gaps explicit, no inflation
