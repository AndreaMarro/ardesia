# PDR Sprint S — Onniscenza + Onnipotenza Definitiva

**Date**: 2026-04-26 (writing) → 2026-04-27+ (execution)
**Author**: Andrea Marro via Claude Opus 4.7 1M context (ralph loop session 2026-04-26)
**Goal**: realizzare definitivamente UNLIM onniscence + onnipotence via ralph loop con 5-agent team orchestrato
**Pattern**: ralph-loop + caveman + 5 agenti comunicanti + ClawBot scheletro + CoV per agente + quality-audit orchestratore + stress test ogni 4 iter (Playwright + Control Chrome on production deployed)

---

## 0. TL;DR (10 line)

1. **Sprint S** = compimento finale ralph loop (max 100 iter) per realizzare onniscence + onnipotence ELAB
2. **5-agent team orchestrated**: planner-opus + architect-opus + generator-app-sonnet + generator-test-sonnet + scribe-sonnet (skip Telegram, skip evaluator-haiku → integrato in CoV per agente)
3. **ClawBot = scheletro UNLIM** (Sprint 6 Day 39 dispatcher 80 tool wired in production)
4. **VPS GPU primary + Together AI fallback** (GDPR-gated per Sprint 5 canUseTogether)
5. **CoV per ogni agente** + **quality-audit orchestratore fine ogni iter** + stress test Playwright/Control Chrome ogni 4 iter
6. **Mac Mini autonomous H24** continua Wiki gen (target 100+ concepts), benchmark, audit
7. **Anthropic Contextual Retrieval applicato** — RAG schema migration applied, 6000 chunks ingested
8. **9-component stack DEFINITIVE** (Qwen3-VL-32B + SGLang + BGE-M3 + reranker + Coqui XTTS-v2 + Whisper Turbo + FLUX.1 Sprint 7)
9. **Activation string** in §10 — paste as ralph-loop prompt next session
10. **CRITICAL**: SSH key id_ed25519_elab DEVE rimanere SOLO MacBook locale, MAI archiviare GitHub, MAI committare

---

## 1. State at handoff (2026-04-26 ~05:30 CEST)

### 1.1 Foundation completata questa sessione (2026-04-26)

**Mac Mini autonomous H24 LIVE**:
- launchctl plist `com.elab.mac-mini-autonomous-loop` PID active (Mac Mini Strambino)
- Claude Code CLI v2.1.119 + OAuth token persistent (file `~/.claude-tokens/oauth-token` perms 600 + `~/.zshenv` env var)
- SSH passwordless da MacBook via `id_ed25519_elab` key
- User Mac Mini: `progettibelli@100.124.198.59` (Tailscale)
- Repo cloned `~/Projects/elab-tutor`, baseline 12291 PASS

**Mac Mini Wiki concepts generati (autonomous, 15 in PR #43)**:
- batch 1: cortocircuito, divisore-tensione (2)
- batch 2: pwm, debounce, comunicazione-seriale-uart, ground, interrupt (5)
- batch 3: circuito-aperto, corrente-alternata, corrente-continua, fusibile, rele (5)
- batch 4 (parziale): delay-millis, loop-arduino, variabili-arduino (3)
- **Skipped batch 4**: analogRead.md + digitalWrite.md (camelCase violate kebab-case Q4 SCHEMA)

Total Q4 base 30 + 15 batch = **45/100 toward Sprint R3 goal**.

### 1.2 PR aperte

| PR | Title | Status | Branch |
|----|-------|--------|--------|
| #41 | docs comprehensive + 5 PDR + iter audits + handoff + Sprint S PDR | OPEN | docs/sprint-q-comprehensive-2026-04-25 |
| #42 | feat(observability): Vercel Pro Analytics + Speed Insights + EU pinning | DRAFT | perf/vercel-pro-analytics-2026-04-26 |
| #43 | feat(wiki): 15 Mac Mini autonomous concepts | DRAFT | mac-mini/wiki-concepts-batch-1-2026-04-25 |
| Sprint Q #34-#40 | Sprint Q infrastructure cascade | DRAFT (awaits Andrea review) | feat/sprint-q* |

### 1.3 Stack v3 DEFINITIVE (research-validated 2026-04-26)

| Layer | Choice | VRAM | Source verified |
|-------|--------|------|----------------|
| LLM+VLM unified | **Qwen3-VL-32B AWQ** | ~18GB | HuggingFace, 200+ langs Italian |
| Engine | **SGLang RadixAttention** | - | 6.4x vLLM RAG (spheron.network 2026) |
| Embeddings | **BGE-M3** | ~2GB | dense+sparse+multi-vector (bentoml.com) |
| Reranker | **bge-reranker-large** | ~1GB | +67% Anthropic Contextual Retrieval |
| TTS Italian | **Coqui XTTS-v2** | ~2GB | 16 lang Italian + voice cloning 6sec |
| STT | **Whisper Large V3 Turbo** via faster-whisper | ~3GB | 6x V3, RTFx 216x |
| Image gen Sprint 7+ | **FLUX.1 Schnell** | ~12GB | Apache 2.0, 4-step text rendering |
| Hardware production | **Hetzner GEX130 RTX 6000 Ada 48GB** | - | €838/mo (€1.15/h equiv) BEST committed |
| Hardware trial | **Scaleway L4 24GB FR** | - | €0.85/h €5/6h OR Scaleway H100 €23/6h |

**Hetzner GEX44 €184/mo (RTX 4000 Ada 20GB)** = entry tight, NOT preferred per stack 9 components.

### 1.4 Documents committed this session

`docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md` (370 lines) — DEFINITIVE
`docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` (1068 lines)
`docs/handoff/2026-04-26-ralph-loop-handoff.md` (consolidated)
`docs/audits/2026-04-25-c1-mac-mini-setup-validation.md` (304 lines)
`docs/audits/2026-04-26-ralph-iter*.md` (4 iter audits)
`docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md` (503 lines)
`docs/tea/2026-04-26-tea-claude-brief.md` (343 lines, 9 task)
`scripts/vps-gpu-trial-scaleway.sh` (executable)
`scripts/rag-contextual-ingest.mjs` (Anthropic Contextual)
`scripts/bench/score-unlim-quality.mjs` (12 PZ rules)
`supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql` (NOT applied)

---

## 2. Sprint S Ralph Loop Architecture

### 2.1 5-agent team orchestrato

Sostituisce Pattern B esistente. Skip Telegram, skip evaluator-haiku (CoV integrato in agenti).

| Agent | Role | File ownership | Tools/skills |
|-------|------|----------------|--------------|
| **planner-opus** | Decompone task atomici | `automa/tasks/pending/` | superpowers:writing-plans, brainstorming |
| **architect-opus** | ADR + system design (read-only su codice) | `docs/architectures/`, `docs/adrs/` | architecture, system-design, design-system |
| **generator-app-sonnet** | Implementa src + supabase + TDD red-green | `src/**`, `supabase/**` | superpowers:test-driven-development |
| **generator-test-sonnet** | Test isolation + CoV | `tests/**`, `scripts/openclaw/*.test.ts` | TDD strict, vitest |
| **scribe-sonnet** | Audit + sunti + Wiki L2 + handoff | `docs/audits/`, `docs/sunti/`, `docs/handoff/` | documentation |

**Comunicazione tra agenti**: file system message passing
- `automa/team-state/messages/<from>-to-<to>-<timestamp>.md` (status, handoff, blocking)
- `automa/team-state/sprint-contracts/sprint-S-day-N-contract.md` (per iter)

### 2.2 Pattern Sprint S iteration

```
ITER N (ogni iter):
1. orchestrator (Claude main session) lancia 5 agenti paralleli su sub-task
2. Ogni agente:
   a. Lavora su file ownership rigido
   b. Esegue CoV 3x prima di claim "fatto"
   c. Aggiorna team-state messages
3. Orchestrator (post agenti):
   a. /quality-audit comprehensive
   b. CoV finale: npx vitest run 3x, npm run build, baseline check
   c. Commit + push (no main, branch feat/sprint-s-iter-N)
   d. Audit doc iter N
4. Ogni 4 iter:
   a. Stress test Playwright on https://www.elabtutor.school
   b. Control Chrome MCP test E2E user flow live
   c. Audit risultati stress
5. Promise check SPRINT_S_COMPLETE (10 boxes definition):
   - SE TRUE → output <promise>
   - ELSE → continue iter N+1
```

### 2.3 SPRINT_S_COMPLETE definition (10 boxes)

1. ✅ VPS GPU Hetzner GEX130 deployed (Andrea credentials provided + provisioned)
2. ✅ 9-component stack live (Qwen3-VL-32B + SGLang + BGE-M3 + reranker + Coqui + Whisper + nginx + Cloudflare Tunnel + monitoring)
3. ✅ 6000+ RAG chunks ingested + Anthropic Contextual prepend + Supabase pgvector
4. ✅ 100+ Wiki LLM concepts compiled (Mac Mini overnight + Tea async, 45+55 = 100)
5. ✅ UNLIM synthesis prompt v3 wired production unlim-chat (PR #37 merged)
6. ✅ Hybrid RAG live: BM25 + BGE-M3 + RRF + bge-reranker-large + top-5 to LLM
7. ✅ Vision flow live (Qwen3-VL-32B sees simulator screenshot + reasons)
8. ✅ TTS+STT Italian working (Coqui XTTS-v2 + Whisper Turbo via faster-whisper)
9. ✅ Sprint R5 stress test 50 prompts pass rate ≥90% (Sprint R0 fixture + scorer ready)
10. ✅ ClawBot Sprint 6 Day 39 dispatcher 80 tools live (post Sprint R5 PASS gate)

**+ Sprint S extension**: Together AI fallback gated wired (per Sprint 5 canUseTogether) per resilience.

### 2.4 Stress test ogni 4 iter (Playwright + Control Chrome)

| Iter | Scope stress test |
|------|-------------------|
| 4 | Smoke prod URL HTTP 200 + Lavagna load + UNLIM chat 5 prompts |
| 8 | E2E user flow (login → Capitolo → esp1 → modifica circuito → UNLIM diagnose) |
| 12 | RAG retrieval verify (chiede a UNLIM concept → check Vol/pag citation accuracy vs PDF) |
| 16 | TTS+STT live (Coqui voice + Whisper transcribe round-trip) |
| 20 | Onnipotence: 80-tool dispatcher Stress (chiama 10 tool sequenziali, verify executed) |
| 24+ | Repeat con scenari edge (off-topic, deep-question, safety-warning) |

Tools: Playwright MCP + Control Chrome MCP (load via ToolSearch all'iter).

---

## 3. WHAT ANDREA NEEDS TO PROVIDE (autonomous unblock)

### 3.1 Critical (3 tokens, blocks Sprint VPS-1)

1. **Scaleway API token** — console.scaleway.com → Identity → API Keys → Generate → READ+WRITE compute scope
2. **Cloudflare API token** — dash.cloudflare.com → API Tokens → permissions: `Zone:Edit + DNS:Edit + Tunnel:Edit` for `elabtutor.school`
3. **HuggingFace token** — huggingface.co → Settings → Access Tokens → read-only

### 3.2 Optional (4-7, refines workflow)

4. Permission policy doc: "auto-deploy if test PASS + rollback ready" OR "every step Andrea OK"
5. Budget cap: "€50 trial weekend, €917 Hetzner first month if benchmark green"
6. Approval channel: NOT Telegram per richiesta — email Andrea OR Slack? (default = email link to PR)
7. Voice clone 6sec audio: chi parla? Andrea/Tea/voice actor?

### 3.3 Tokens delivery method

**SAFE delivery**:
- Andrea creates tokens via web console
- Pastes in ENV vars on local MacBook OR in `.env.local` (gitignored)
- Provides tokens to next session via:
  a. Direct chat input (Claude reads + uses, never logs)
  b. OR file `~/.elab-credentials/sprint-s-tokens.env` (chmod 600, MacBook only, gitignored)

**NEVER**:
- Commit tokens to GitHub
- Send tokens via email
- Print tokens in logs

---

## 4. HOW TO PILOT MAC MINI (next session reference)

### 4.1 SSH connection

```bash
# From MacBook ~/.ssh/id_ed25519_elab (DO NOT COPY this key elsewhere)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59

# Or for autonomous loop scripts:
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'eval "$(/opt/homebrew/bin/brew shellenv)" && claude --version'
```

### 4.2 Dispatch Mac Mini Wiki batch

```bash
# Mac Mini already has script ~/scripts/elab-wiki-batch-gen.sh
# Dispatch 5 concepts (kebab-case lowercase ONLY):
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'rm -f ~/.elab-batch-result && nohup ~/scripts/elab-wiki-batch-gen.sh "concept-1 concept-2 concept-3 concept-4 concept-5" > /tmp/batch.log 2>&1 & disown'

# Wait for completion:
until ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'test -f ~/.elab-batch-result' 2>/dev/null; do sleep 60; done

# Pull results:
for c in concept-1 concept-2 ...; do
  scp -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59:~/Projects/elab-tutor/docs/unlim-wiki/concepts/$c.md /tmp/$c.md
done
```

### 4.3 Mac Mini autonomous loop monitoring

```bash
# Verify launchctl loop active
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
# Expected: <PID> 0 com.elab.mac-mini-autonomous-loop

# Tail logs
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'tail -50 ~/Library/Logs/elab/autonomous-loop-$(date +%Y%m%d).log'
```

### 4.4 Naming convention CRITICAL

**Q4 SCHEMA**: filename MUST be kebab-case lowercase. NO camelCase, NO underscores, NO accenti.
- ✅ `corrente-continua.md`, `delay-millis.md`, `loop-arduino.md`
- ❌ `analogRead.md`, `delayMillis.md`, `loopArduino.md`, `Corrente_Continua.md`

Pre-commit hook checks `wiki-concepts.test.js` → enforces kebab-case.

### 4.5 SSH key policy ENFORCED (CRITICAL)

**id_ed25519_elab key must STAY MacBook locale**. MAI:
- Copy to Mac Mini
- Commit to GitHub
- Email/share via cloud
- Backup outside MacBook local

Mac Mini ha SOLO `~/.ssh/authorized_keys` (public key MacBook). Mac Mini NON HA private keys.

---

## 5. Skills potentially useful next session

### 5.1 Already invoked / proven this session

- `superpowers:using-superpowers` (entry point)
- `superpowers:writing-plans` (plans + PDR)
- `ralph-loop:ralph-loop` (loop framework)
- `superpowers:brainstorming` (architectural decisions)

### 5.2 Suggested for Sprint S

- `agent-orchestration:multi-agent-optimize` — 5-agent orchestration pattern
- `agent-teams:team-feature` — Sprint S features parallel
- `agent-teams:team-delegate` — task dispatch dashboard
- `agent-teams:team-status` — monitor team progress
- `agent-teams:team-review` — multi-reviewer parallel
- `agent-teams:parallel-debugging` — multi-hypothesis debug
- `superpowers:test-driven-development` — TDD strict per agente
- `superpowers:verification-before-completion` — pre-claim CoV
- `superpowers:executing-plans` — PDR execution
- `quality-audit` — comprehensive quality
- `claude-md-management:revise-claude-md` — keep CLAUDE.md updated
- `playwright:browser_*` (load via ToolSearch on stress test iter 4/8/12/16/20)
- `Control_Chrome:execute_javascript` (via MCP)

### 5.3 New skill ideas potentially useful (Andrea may create)

- **elab-r0-bench**: orchestrate Sprint R0 baseline + scoring (uses `score-unlim-quality.mjs`)
- **elab-rag-ingest**: orchestrate Anthropic Contextual ingest 6000 chunks
- **elab-mac-mini-batch**: dispatch + pull + commit Wiki batch via SSH
- **elab-stress-prod**: Playwright + Control Chrome stress test live URL
- **elab-vps-deploy**: orchestrate Sprint VPS-1 + VPS-2 + VPS-3
- **elab-clawbot-skeleton**: Sprint 6 Day 39 dispatcher 80 tools wiring

---

## 6. ClawBot as UNLIM skeleton

Per Andrea constraint: ClawBot (OpenClaw Sett-5 architettura) = scheletro UNLIM.

Existing OpenClaw deliverables (Sett-5, branch `feature/pdr-sett5-openclaw-onnipotenza-morfica-v4`):
- `tools-registry.ts` — 52 → 57 ToolSpec declarative
- `morphic-generator.ts` — L1 composition + L2 template + L3 flag-DEV-ONLY
- `pz-v3-validator.ts` — Principio Zero v3 enforcement IT primary
- `tool-memory.ts` — Supabase pgvector cache + GC
- `state-snapshot-aggregator.ts` — orchestratore parallelo (circuit + Wiki + RAG + memoria + vision)
- `together-teacher-mode.ts` — GDPR-gated fallback

Sprint 6 Day 39 dispatcher = wire-up production. Plan esistente `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`.

**Sprint S integration**:
- Day 39 dispatcher GATE post Sprint R5 PASS (≥90% UNLIM quality)
- 80 tool dispatcher = onnipotence layer
- Tools: simulator API + Wiki query + RAG retrieve + Anthropic Contextual + Vision Qwen3-VL + TTS Coqui + STT Whisper + image gen FLUX.1 (Sprint 7) + Vol/pag citation jumper

---

## 7. Together AI fallback (Sprint S extension)

Per Andrea esplicito: "lavora per avere fallback rispetto VPS GPU (esempio Together AI)".

Architettura fallback chain:

```
Primary: VPS GPU Hetzner GEX130 (Qwen3-VL-32B EU GDPR)
   ↓ (if down)
Fallback 1: Gemini EU (existing, transitional)
   ↓ (if down)
Fallback 2: Together AI gated (per Sprint 5 canUseTogether)
   - mode: emergency_anonymized
   - require: 2+ EU providers down
   - log: together_audit_log
```

Already implemented in `scripts/openclaw/together-teacher-mode.ts`. Need wire `callLLM` chain in production.

GDPR safety: Together AI student runtime BLOCKED unless emergency + anonymized payload. Teacher batch + lesson_prep modes OK con consenso.

---

## 8. Mac Mini autonomous H24 — what it does

### 8.1 Daily routine (already configured)

- 03:00 daily: benchmark `node scripts/benchmark.cjs --write` (continuous tracking score)
- 04:00 daily: audit drift (script TBD)
- on-demand: dispatch via SSH file `~/.elab-trigger`

### 8.2 Continuous Wiki gen

Andrea OR next Claude session can dispatch batches of 5-10 concepts via:

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'rm -f ~/.elab-batch-result && nohup ~/scripts/elab-wiki-batch-gen.sh "kebab-case-list-of-5-concepts" > /tmp/batch.log 2>&1 & disown'
```

ETA per batch: ~18min for 5 concepts (~3.6min/concept Sonnet 4.6).

Sprint R3 thesis: 100 concepts × 3.6min = 6h overnight loop. ~$5 token cost.

### 8.3 Mac Mini autonomous next gen target

Remaining concepts to reach 100 (currently 45):
- Arduino code (kebab-case): analog-read, digital-write (renamed), digital-read, pin-mode, serial-print, serial-read, if-condizionali, while-loop, for-loop, array, funzioni-arduino, return-arduino
- Componenti: amperometro, voltmetro, diodo-zener, led-rosso, led-giallo, condensatore-elettrolitico, condensatore-ceramico, transistor-npn, transistor-pnp, transistor-saturazione, transistor-cutoff
- Concetti: ohm, watt-potenza, frequenza, periodo, onda-quadra, onda-sinusoidale, decibel, impedenza, capacità, induttanza, ground-massa, terra-impianto, schermatura
- Misure: misurare-tensione, misurare-corrente, misurare-resistenza, oscilloscopio
- Sicurezza: sicurezza-elettrica, isolamento, fasi-neutro, dispositivo-residuo
- Applicazioni: blink-led, fade-led, semaforo, allarme, contatore, cronometro

55 + buffer = 60+ concepts target Sprint S Mac Mini overnight.

---

## 9. Quality audit + CoV (this session, before close)

### 9.1 CoV check (3x verify)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git checkout main && git pull --quiet
npx vitest run 2>&1 | grep -E "Test Files|Tests"
# Expected: 12291 PASS (no regression vs baseline)
```

### 9.2 Live URL verify

```bash
curl -sI https://www.elabtutor.school | head -3
# Expected: HTTP/2 200
```

### 9.3 Mac Mini state verify

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'launchctl list | grep elab && cat ~/.claude-tokens/oauth-token | wc -c'
# Expected: <PID> 0 com.elab.mac-mini-autonomous-loop + ~108
```

### 9.4 SSH policy verify

```bash
# MacBook: keys MUST be present
ls -la ~/.ssh/id_ed25519_elab*
# Expected: id_ed25519_elab + id_ed25519_elab.pub

# Mac Mini: keys MUST be ABSENT
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'find ~/.ssh -type f -name "id_*" -not -name "*.pub" 2>&1'
# Expected: empty (no private keys)
```

---

## 10. ACTIVATION PROMPT next session (paste at start)

```
================================================================
SPRINT S — ONNISCENZA + ONNIPOTENZA DEFINITIVE (Ralph Loop)
================================================================

IDENTITÀ: Andrea Marro, solo-dev ELAB Tutor.
Repo: github.com/AndreaMarro/elab-tutor (main protected).
Live: https://www.elabtutor.school
Subscription: Claude Max + Vercel Pro + Supabase free.

CONTESTO SESSIONE PRECEDENTE (2026-04-26):
- Mac Mini autonomous H24 LIVE (PID launchctl)
- 15 Wiki concepts generated autonomous in PR #43
- VPS GPU stack v3 DEFINITIVE documented (Qwen3-VL-32B + SGLang + Coqui + Whisper Turbo + BGE-M3 + reranker + FLUX.1)
- Sprint R0 fixture + 12 PZ rules scorer ready
- Anthropic Contextual Retrieval ingest pipeline ready (awaits VPS GPU)
- Hybrid RAG SQL migration ready (NOT applied)

FILE OBBLIGATORI LETTURA (in ordine, prima azione):
1. CLAUDE.md
2. docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md ← THIS doc
3. docs/handoff/2026-04-26-ralph-loop-handoff.md
4. docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md
5. docs/strategy/2026-04-26-master-plan-v2-comprehensive.md
6. docs/audits/2026-04-25-c1-mac-mini-setup-validation.md (Mac Mini setup process)
7. docs/audits/2026-04-26-ralph-iter*.md (4 iter audits)
8. docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md (SSH + commands reference)
9. docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md (ClawBot dispatcher)
10. scripts/vps-gpu-trial-scaleway.sh (executable VPS deploy)
11. scripts/rag-contextual-ingest.mjs (Anthropic Contextual)
12. scripts/bench/score-unlim-quality.mjs (12 PZ rules)
13. supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql (NOT applied)

REGOLE IMMUTABILI:
- PRINCIPIO ZERO v3.1 (CLAUDE.md): UNLIM plurale ragazzi, no imperativo docente, max 60w + 1 analogia, citazioni Vol.X pag.Y
- SSH key id_ed25519_elab SOLO MacBook locale, MAI archive GitHub
- NO main push, NO merge PR senza Andrea, NO deploy autonomo
- TDD strict + CoV 3x per agente + quality-audit orchestratore
- Mac Mini = batch worker SOLO (NON ospita modelli per ELAB users)
- VPS GPU = ALL inference (LLM + VLM + TTS + STT + embeddings)
- GDPR EU-only runtime student, Together AI fallback gated

PATTERN SPRINT S:
- Ralph loop max 100 iter (--completion-promise SPRINT_S_COMPLETE)
- 5-agent team orchestrato: planner-opus + architect-opus + generator-app-sonnet + generator-test-sonnet + scribe-sonnet
- File ownership rigido enforced (per CLAUDE.md)
- CoV 3x per agente prima ogni claim "fatto"
- /quality-audit comprehensive fine ogni iter
- Stress test Playwright + Control Chrome ogni 4 iter (4, 8, 12, 16, 20, 24...)
- Stress test su https://www.elabtutor.school live (production)
- Caveman mode ON (terse, fragments OK, code/commits normal)
- Mac Mini autonomous continua Wiki batch gen (target 100+ concepts)

DOMANDE STRATEGICHE APERTE (risolvere Sprint S):
1. UNLIM synthesis production wire-up (PR #37 merge required)
2. RAG hybrid live (Supabase migration apply + 6000 chunks ingest)
3. VPS GPU Hetzner GEX130 deploy (Andrea credentials → Sprint VPS-1)
4. ClawBot 80-tool dispatcher (Sprint 6 Day 39 post Sprint R5 PASS)
5. Mac Mini Wiki 100+ concepts (current 45/100, ~11 batches × 5 = 55 more)
6. Tea async work (PR #43 review + Wiki concept review T1 + Vol3 bug fix T2)
7. Together AI fallback wire-up (`callLLM` chain)

WHAT ANDREA NEEDS TO PROVIDE (autonomous unblock):
1. Scaleway API token (provision VPS auto)
2. Cloudflare API token (DNS + Tunnel auto)
3. HuggingFace token (model download auto)
4. Optional: permission policy + budget cap + voice clone source

SKILLS LOAD (via Skill tool):
- ralph-loop:ralph-loop (entry)
- agent-orchestration:multi-agent-optimize
- agent-teams:team-feature
- agent-teams:team-delegate
- agent-teams:team-status
- agent-teams:team-review
- superpowers:writing-plans
- superpowers:test-driven-development
- superpowers:verification-before-completion
- quality-audit
- claude-md-management:revise-claude-md
- playwright (stress test iter 4+)
- Control Chrome MCP (stress test iter 4+)

ATTIVAZIONE:
1. Read 13 files context order
2. Confirm Andrea sequenza priorità (200w sintesi)
3. Andrea provides 3 credentials (Scaleway + Cloudflare + HuggingFace)
4. Activate ralph-loop:
   /ralph-loop Sprint S onniscenza onnipotenza definitiva. 5-agent team orchestrato (planner+architect+generator-app+generator-test+scribe). CoV per agente + quality-audit orchestratore. Stress test Playwright+Control Chrome ogni 4 iter su prod. Mac Mini autonomous continua Wiki batch (45->100+). VPS GPU Hetzner GEX130 deploy (Qwen3-VL-32B SGLang Coqui Whisper BGE-M3 reranker FLUX.1 Sprint7). RAG 6000 chunks Anthropic Contextual ingest. Hybrid RAG BM25+BGE-M3+RRF+rerank. Together AI fallback gated. ClawBot 80-tool dispatcher Sprint 6 Day 39. UNLIM synthesis prompt v3 wired production. SSH key id_ed25519_elab SOLO MacBook locale MAI GitHub. NO main push. NO merge senza Andrea. Caveman mode ON. Massima onestà no compiacenza. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE

NON merge PR autonomo. NON deploy autonomo. NON main push.

Caveman mode ON. Massima onestà. ZERO compiacenza.
================================================================
```

---

## 11. CLAUDE.md updates suggested

After Sprint S kickoff, recommend `/claude-md-management:revise-claude-md` updates:

1. Add Sprint S section (post Sprint Q + R)
2. Update Mac Mini autonomous section (add launchctl PID + scripts path)
3. Update stack reference (link STACK-V3-DEFINITIVE)
4. Update SSH key policy (MacBook only, enforce)
5. Update agent team to 5-agent (replace Pattern B 5-agent paralleli)
6. Add stress test pattern (Playwright + Control Chrome ogni 4 iter)
7. Add SPRINT_S_COMPLETE definition (10 boxes)
8. Update OpenClaw section (Day 39 = ClawBot UNLIM skeleton)
9. Update Together AI section (fallback gated post VPS GPU)

---

## 12. Honesty caveats final

1. **Sprint S scope ambitious**: 100 iter × 5 agents × CoV per agent = significant token spend. Budget projection: $50-150 next session.

2. **VPS GPU deploy DEPENDS on Andrea credentials**. Without 3 tokens, Sprint S iter blocked on infrastructure step.

3. **Mac Mini Wiki gen pattern proven** but rate ~5 concepts / 18min = 100 concepts ~6h overnight = 5+ days at this rate. Tea async parallel reduces to 2 weeks.

4. **Stress test ogni 4 iter** requires Playwright + Control Chrome MCP loaded via ToolSearch each invocation. Token overhead ~5-10K per stress run.

5. **5-agent team orchestrated** complex coordination via file system messages. Race conditions possible. Test small first (iter 1-3 single agent + scale).

6. **ClawBot Sprint 6 Day 39 plan exists** but NOT executed. Sprint R5 PASS gate required first. Could take weeks.

7. **Italian quality benchmark Qwen3-VL-32B vs Gemini Flash NOT TESTED**. Sprint VPS-1 mandatory.

8. **Together AI fallback wire-up** requires code change in `callLLM` chain. NOT done.

9. **Cost commitment**: Hetzner GEX130 €838/mo = €10k/year. With 0 paying schools = capability investment.

10. **PRINCIPIO ZERO**: enforce via Sprint R0 scorer + production runtime validator. Real-world testing gap.

---

## 13. References

**Stack**:
- `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md`
- `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md`

**Mac Mini**:
- `docs/audits/2026-04-25-c1-mac-mini-setup-validation.md`
- `docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md`

**VPS GPU**:
- `scripts/vps-gpu-trial-scaleway.sh`
- `scripts/rag-contextual-ingest.mjs`
- `supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql`

**Sprint R**:
- `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl`
- `scripts/bench/score-unlim-quality.mjs`

**ClawBot**:
- `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`
- `scripts/openclaw/*` (Sett-5)

**Tea**:
- `docs/tea/2026-04-26-tea-claude-brief.md` (9 task)

**Audit history**:
- `docs/audits/2026-04-26-ralph-iter*.md`
- `docs/handoff/2026-04-26-ralph-loop-handoff.md`

---

**File path**: `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md`
**Skill compliance**: writing-plans + quality-audit + documentation
**Caveman**: chat replies caveman; this PDR normal language
**Honesty**: 10 caveats explicit, no inflation
**SSH**: key MacBook-only enforced (NOT in this doc, NOT on GitHub, NOT shared)
