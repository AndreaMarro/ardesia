# PDR Sprint S iter 2 — Ralph Loop 5-Agent Orchestrato

**Date**: 2026-04-26 ~05:30 CEST (writing) → next session execution
**Author**: Andrea Marro via Claude Opus 4.7 1M context (Sprint S iter 1 close)
**Goal**: realizzare definitivamente UNLIM **onniscenza + onnipotenza** via ralph loop con 5-agent team orchestrato comunicanti, ClawBot come scheletro UNLIM, RunPod GPU on/off, Together AI fallback, Mac Mini autonomous H24 wiki batch.

---

## 0. TL;DR (15 line)

1. **Sprint S iter 2** = ralph loop max 100 iter (`--completion-promise SPRINT_S_COMPLETE`)
2. **5-agent team OPUS** (Andrea conferma): planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus
3. **Comunicazione**: filesystem messages `automa/team-state/messages/<from>-to-<to>-<ts>.md`
4. **CoV per agente**: 3x verify prima ogni claim "fatto" (test PASS, build PASS, baseline preserved)
5. **/quality-audit orchestratore**: fine ogni iter (Andrea + Claude main session)
6. **Stress test ogni 4 iter**: Playwright + Control Chrome MCP su https://www.elabtutor.school production
7. **ClawBot 80-tool dispatcher**: scheletro UNLIM, stub deployato pod port 8000, production wire-up post Sprint R5 PASS
8. **VPS GPU**: RunPod RTX 6000 Ada $0.74/h (on/off discipline) + Together AI fallback gated emergency
9. **Mac Mini autonomous**: continua Wiki batch 50→100+ overnight via launchctl loop
10. **6000 RAG chunks**: Anthropic Contextual Retrieval ingest via RunPod GPU embedding (~$2 one-time)
11. **PR cascade Sprint Q #34-#41**: review + merge cascade required (current main branch behind)
12. **PR #36/#37 merge**: UNLIM synthesis prompt v3 + Modalità citazioni inline UI
13. **Voice clone**: aspetta Andrea voce 6sec audio (cp WhatsApp video → /tmp/voice.mp4)
14. **Tokens forniti**: RunPod ✓, Cloudflare ✓ (free, 0 zones, DNS Vercel), HuggingFace ✓ (gated read)
15. **Auto-deploy permission granted**: con test PASS gate (≥90% Sprint R5 stress test)

---

## 1. State at iter 1 close

### 1.1 Pod RunPod LIVE

- **Pod ID**: `felby5z84fk3ly`
- **GPU**: RTX 6000 Ada 48GB (`NVIDIA RTX 6000 Ada Generation`)
- **Disk**: 30GB container + 50GB volume `/workspace` (modelli persisteranno on stop)
- **SSH**: `195.26.233.61:33994` via key `~/.ssh/id_ed25519_runpod`
- **Cost**: $0.74/h running, ~$0.33/mo storage when stopped
- **Status fine iter 1**: bootstrap + recovery in progress. Servizi parziali deployati (Ollama+Whisper OK, Embed/TTS/FLUX/ClawBot recovery).

### 1.2 Stack v3 deployment status

| Servizio | Port | Status iter 1 close | Note |
|----------|------|---------------------|------|
| Ollama (Qwen2.5-VL-7B + qwen2.5:7b) | 11434 | OK | Qwen3-VL-32B not on Ollama hub yet |
| BGE-M3 embeddings | 8080 | RECOVERY (torch 2.6 install) | FlagEmbedding requires torch>=2.6 (CVE-2025-32434) |
| bge-reranker-large | 8080 | RECOVERY (in same server) | FlagReranker shared port |
| Whisper Large V3 Turbo | 9000 | OK | Italian primary |
| Coqui XTTS-v2 | 8881 | RECOVERY | speaker_default placeholder, real voice pending |
| FLUX.1 Schnell (Gradio) | 7860 | RECOVERY (lazy load) | image gen Sprint 7+ |
| ClawBot dispatcher (12-tool stub) | 8000 | RECOVERY | 80-tool full = Sprint 6 Day 39 post R5 |

### 1.3 Tokens stato

| Token | Status | File / scope |
|-------|--------|--------------|
| RUNPOD_API_KEY | ✓ verified | `~/.elab-credentials/sprint-s-tokens.env` chmod 600 |
| CLOUDFLARE_API_TOKEN | ✓ verified | account `31b0f72ef02445f6a9987c994fe17b56`, 0 zones (DNS Vercel) |
| CLOUDFLARE_ACCOUNT_ID | ✓ saved | for Tunnel API calls |
| HUGGINGFACE_TOKEN | ✓ verified | gated read (Qwen3-VL access ok) |
| TOGETHER_API_KEY | ✓ in Supabase secrets | wired in `supabase/functions/_shared/llm-client.ts` (Andrea fornita giorni fa, accessibile via Deno.env.get) |
| VERCEL_API_TOKEN | ✓ via MCP connector | `mcp__plugin_vercel_vercel__authenticate` + `mcp__57ae1081-...__list_projects` available |
| Voice clone audio | ❌ macOS sandbox blocks Downloads | Andrea: cp file → /tmp/voice.mp4 |

### 1.4 Mac Mini autonomous H24 LIVE

- launchctl `com.elab.mac-mini-autonomous-loop` PID 23944 active
- SSH `progettibelli@100.124.198.59:22` via `id_ed25519_elab` (MacBook only)
- Wiki batch script `~/scripts/elab-wiki-batch-gen.sh`
- Branch `mac-mini/wiki-concepts-batch-20260426-061011`: 3 generated, 0 failed, batch ongoing
- Total wiki concepts: ~33-50 (batch dependent), target 100+

### 1.5 Repository state iter 1 close

- Branch `feat/sprint-s-iter-1-runpod-trial-2026-04-26`
- Branched from `docs/sprint-q-comprehensive-2026-04-25` (PR #41 base)
- 3 commits ahead: bootstrap scripts + helpers + auto-stop + Together fallback prep
- Test baseline: **12291 PASS** (verified pre-commit hook)
- NO main push, NO PR merge senza Andrea

### 1.6 Files added Sprint S iter 1

```
scripts/runpod-pod-create.sh           (95 lines)
scripts/runpod-deploy-stack.sh         (210 lines)
scripts/runpod-r0-bench.mjs            (155 lines)
scripts/runpod-bootstrap.sh            (310 lines, full stack inside pod)
scripts/runpod-stop.sh                 (24 lines, podStop)
scripts/runpod-resume.sh               (24 lines, podResume)
scripts/runpod-status.sh               (29 lines, query state)
scripts/runpod-auto-stop-after.sh      (39 lines, marker-watch + stop)
scripts/cloudflare-tunnel-setup.sh     (130 lines, prod routing prep)
scripts/together-ai-fallback-wireup.ts (175 lines, fallback chain)
docs/audits/2026-04-26-sprint-s-iter1-runpod-trial-prep.md (270 lines)
```

---

## 2. Sprint S iter 2 — Architecture Definitive

### 2.1 5-Agent team OPUS

Andrea CONFIRMS opus all (NOT sonnet). Reasoning: complex orchestration, planning, architecture decisions need full opus reasoning capacity. Generators benefit from opus context window for plan execution faithfulness.

| Agent | Role | File ownership | Skills/Connectors |
|-------|------|----------------|-------------------|
| **planner-opus** | Decompone task atomici per iter, schedule | `automa/tasks/pending/`, `automa/tasks/done/` | `superpowers:writing-plans`, `superpowers:brainstorming`, `agent-orchestration:multi-agent-optimize` |
| **architect-opus** | ADR + system design (read-only su src/) | `docs/architectures/`, `docs/adrs/`, `docs/strategy/` | `engineering:architecture`, `engineering:system-design`, `design:design-system` |
| **generator-app-opus** | Implementa src + supabase + edge fns + TDD red-green | `src/**`, `supabase/**`, `scripts/openclaw/**` | `superpowers:test-driven-development`, `backend-development:feature-development` |
| **generator-test-opus** | Test isolation + CoV per agente | `tests/**`, `scripts/openclaw/*.test.ts`, `scripts/bench/**` | `superpowers:test-driven-development`, `full-stack-orchestration:test-automator` |
| **scribe-opus** | Audit + sunti + Wiki L2 + handoff + CLAUDE.md | `docs/audits/`, `docs/sunti/`, `docs/handoff/`, `docs/unlim-wiki/`, `CLAUDE.md` | `engineering:documentation`, `claude-md-management:revise-claude-md` |

### 2.2 Comunicazione tra agenti

**Filesystem message passing**:
```
automa/team-state/messages/<from>-to-<to>-<timestamp>.md
automa/team-state/sprint-contracts/sprint-S-iter-N-contract.md
automa/team-state/handoffs/iter-N-to-iter-N+1.md
```

**Format messaggio**:
```yaml
---
from: planner-opus
to: generator-app-opus
ts: 2026-04-XX-HH-MM-SS
sprint: S-iter-N
priority: P1
blocking: false
---

## Task

[atomic task description]

## Dependencies

- waits: [list of pending blockers]
- provides: [list of outputs for next agent]

## Acceptance criteria

- [ ] CoV 3x test PASS
- [ ] file ownership respected
- [ ] [task-specific criteria]
```

### 2.3 Pattern iter Sprint S iter 2

```
ITER N (each iter):
1. orchestrator (Claude main session OR Mac Mini autonomous):
   - read team-state/sprint-contracts/sprint-S-iter-N-contract.md
   - dispatch 5 agents in parallel via Agent tool calls (single message)
2. each agent:
   a. Read assigned task message
   b. Work on file ownership rigid
   c. CoV 3x verification:
      - npx vitest run
      - npm run build
      - baseline preservation (12291+ PASS)
   d. Write completion message to next agent OR scribe
3. orchestrator post-agents:
   a. /quality-audit comprehensive
   b. CoV finale: npx vitest run 3x, npm run build
   c. Commit + push (no main, branch feat/sprint-s-iter-N-...)
   d. Audit doc iter N via scribe-opus
4. EVERY 4 iter (4, 8, 12, 16, 20, 24...):
   a. Stress test Playwright on https://www.elabtutor.school
   b. Control Chrome MCP test E2E user flow live
   c. Audit doc stress
5. PROMISE check SPRINT_S_COMPLETE 10 boxes:
   - SE TRUE → output <promise>
   - ELSE → continue iter N+1
```

### 2.4 SPRINT_S_COMPLETE definition (10 boxes)

1. ✅ VPS GPU deployed (RunPod RTX 6000 Ada minimum, Hetzner GEX130 future)
2. ✅ 7-component stack live (Ollama+Qwen-VL + BGE-M3 + reranker + Coqui XTTS-v2 + Whisper Turbo + FLUX.1 lazy)
3. ✅ 6000+ RAG chunks Anthropic Contextual Retrieval ingested + Supabase pgvector
4. ✅ 100+ Wiki LLM concepts compiled (Mac Mini overnight + Tea async)
5. ✅ UNLIM synthesis prompt v3 wired production unlim-chat (PR #37 merged)
6. ✅ Hybrid RAG live: BM25 + BGE-M3 + RRF + bge-reranker-large + top-5 to LLM
7. ✅ Vision flow live (Qwen2.5-VL OR Qwen3-VL-32B vede simulator screenshot + ragiona)
8. ✅ TTS+STT Italian working (Coqui XTTS-v2 voice clone Andrea + Whisper Turbo)
9. ✅ Sprint R5 stress test 50 prompts pass rate ≥90% (Sprint R0 fixture + scorer ready)
10. ✅ ClawBot Sprint 6 Day 39 dispatcher 80 tools live (post Sprint R5 PASS gate)

**+ Sprint S iter 2 extension**: Together AI fallback gated wired (post TOGETHER_API_KEY provision).

### 2.5 Stress test ogni 4 iter

| Iter | Scope stress test |
|------|-------------------|
| 4 | Smoke prod URL HTTP 200 + Lavagna load + UNLIM chat 5 prompts |
| 8 | E2E user flow (login → Capitolo → esp1 → modifica circuito → UNLIM diagnose) |
| 12 | RAG retrieval verify (chiede UNLIM concept → check Vol/pag citation accuracy vs PDF) |
| 16 | TTS+STT live (Coqui voice + Whisper transcribe round-trip) |
| 20 | Onnipotence: 80-tool dispatcher Stress (chiama 10 tool sequenziali) |
| 24+ | Repeat scenari edge (off-topic, deep-question, safety-warning) |

**Tools**: Playwright MCP (`mcp__plugin_playwright_playwright__browser_*`) + Control Chrome MCP (`mcp__Control_Chrome__*`) — load via ToolSearch each iter.

---

## 3. Documenti riferimento (lettura obbligatoria iter 2)

In ordine di importanza (lettura sequenziale prime 8):

### 3.1 Strategy + state docs (prime 8)

1. `CLAUDE.md` ← contesto base (sarà rivista a fine iter 1)
2. `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md` ← QUESTO doc
3. `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md` ← Sprint S originale
4. `docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md` ← session start guide
5. `docs/handoff/2026-04-26-ralph-loop-handoff.md` ← consolidato iter 1-7 precedenti
6. `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md` ← stack v3 definitivo
7. `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` ← master plan v2
8. `docs/audits/2026-04-26-sprint-s-iter1-runpod-trial-prep.md` ← iter 1 prep
9. `docs/audits/2026-04-26-sprint-s-iter1-FINAL-AUDIT.md` ← iter 1 close (this iter writes)

### 3.2 Mac Mini setup + management

10. `docs/audits/2026-04-25-c1-mac-mini-setup-validation.md` ← Mac Mini setup process
11. `docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md` ← SSH + commands reference
12. `automa/handoff.md` ← legacy automa handoff
13. `automa/PDR.md` ← legacy PDR
14. `automa/knowledge/INDEX.md` ← 110+ docs

### 3.3 Stack components

15. `scripts/runpod-bootstrap.sh` ← full stack provisioner (LLM+VLM+embed+TTS+STT+FLUX+ClawBot)
16. `scripts/runpod-{stop,resume,status,auto-stop-after}.sh` ← cost on/off discipline
17. `scripts/runpod-r0-bench.mjs` ← R0 benchmark harness
18. `scripts/cloudflare-tunnel-setup.sh` ← production routing gpu.elabtutor.school
19. `scripts/together-ai-fallback-wireup.ts` ← Together AI fallback chain
20. `scripts/rag-contextual-ingest.mjs` ← Anthropic Contextual ingest

### 3.4 OpenClaw (ClawBot scheletro)

21. `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md` ← Sprint 6 Day 39 plan
22. `scripts/openclaw/tools-registry.ts` ← 52→80 ToolSpec
23. `scripts/openclaw/morphic-generator.ts` ← L1+L2+L3 composition
24. `scripts/openclaw/pz-v3-validator.ts` ← Principio Zero v3 enforcement
25. `scripts/openclaw/tool-memory.ts` ← Supabase pgvector cache
26. `scripts/openclaw/state-snapshot-aggregator.ts` ← orchestratore parallelo
27. `scripts/openclaw/together-teacher-mode.ts` ← GDPR-gated fallback (legacy)

### 3.5 Sprint R bench fixture + scorer

28. `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` ← 10 prompts R0 baseline
29. `scripts/bench/score-unlim-quality.mjs` ← 12 PZ rules scorer
30. `supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql` ← hybrid RAG schema (NOT applied)

### 3.6 Tea async work + Wiki

31. `docs/tea/2026-04-26-tea-claude-brief.md` ← 9 task creative
32. `docs/unlim-wiki/concepts/*.md` ← 30 base + Mac Mini batches → target 100+
33. `automa/context/UNLIM-VISION-COMPLETE.md` ← visione completa prodotto
34. `automa/context/GALILEO-CAPABILITIES.md` ← 26+ azioni mappa

---

## 4. Concetti chiave (per agenti onboard)

### 4.1 PRINCIPIO ZERO v3.1 (immutabile, CLAUDE.md)

> "UNLIM parla ai RAGAZZI plurale, MAI imperativo al docente. Vol.X pag.Y. Max 60 parole. Testi duali CLASSE display centrale + DOCENTE sidebar colpo d'occhio."

Enforcement: `scripts/openclaw/pz-v3-validator.ts` IT primary + EN/ES/FR/DE stub. 12 rules in scorer.

### 4.2 Onniscenza (7-layer knowledge stack)

```
L1 raw         → 6000 RAG chunks (volumi PDF + glossary + FAQ + errori + analogie)
L2 wiki        → 100+ concept md compiled (Karpathy LLM Wiki pattern)
L3 schema      → Capitolo (Q1 Sprint Q1.A, 37 capitoli)
L4 dynamic     → simulator state (circuit + code + active esperimento + screenshot)
L5 history     → memoryWriter class + teacher (Q5)
L6 LLM         → general knowledge Qwen2.5-VL-7B (or 32B future)
L7 hybrid      → BM25 + BGE-M3 + RRF + bge-reranker-large + Anthropic Contextual prepend
```

### 4.3 Onnipotenza (80-tool dispatcher OpenClaw Sett-5)

ClawBot = scheletro UNLIM. Sprint 6 Day 39 wires production. Stub deployed pod port 8000.

Tools categories:
- **simulator.\*** (15+): highlight, loadexp, delta, getLayout, getEditorCode, captureScreenshot
- **wiki.\*** (5+): query, related, list, prerequisites, citations
- **rag.\*** (4+): retrieve, rerank, hybrid_search, semantic_search
- **memory.\*** (8+): read_class, write_class, read_teacher, write_teacher, read_session, write_session
- **tts.\*** + **stt.\*** (4): speak, transcribe, voices, languages
- **vision.\*** (3): diagnose, describe, compare
- **image.\*** (2): generate (FLUX.1), variations
- **dispatcher.\*** (5): multi_dispatch, sequential, parallel, conditional, retry

Total stub iter 1: 12 tools. Target Sprint 6 Day 39: 80.

### 4.4 GDPR + Sicurezza

- **Pod RunPod**: US-skewed → trial only, no PII reali, fixture sintetiche
- **Production**: Scaleway FR (€3.80/h GDPR clean) OR Hetzner DE
- **Together AI fallback**: anonimizzato + emergency_only + audit log
- **SSH key `id_ed25519_elab`**: SOLO MacBook locale, MAI archive GitHub/cloud
- **SSH key `id_ed25519_runpod`**: dedicated, public uploaded RunPod account
- **Supabase RLS**: aperto temp per Sprint Q (security review post merge)

### 4.5 Cost discipline

- RunPod RUNNING $0.74/h × tempo lavoro
- RunPod EXITED $0.33/mo storage 50GB
- Hetzner GEX130 €838/mo (no on/off, dedicated)
- Mac Mini = autonomous, no marginal cost (Andrea Max sub paid)
- Anthropic Claude Code Action $X/mese subscription

**Rule**: STOP pod after every work session. RESUME quando bench/test serve.

---

## 5. WHAT ANDREA NEEDS TO PROVIDE iter 2 (autonomous unblock)

### 5.1 Done iter 1 ✓

- ✓ RunPod API key
- ✓ Cloudflare API token
- ✓ HuggingFace token

### 5.2 Pending iter 2

1. **Voice clone audio**: `cp ~/Downloads/'WhatsApp Video 2026-03-13 at 13.39.50 (1).mp4' /tmp/voice.mp4` (NOT mandatory — Tammy Grit built-in default chosen)
2. ~~TOGETHER_API_KEY~~ ✓ già in Supabase secrets (Andrea fornita giorni fa)
3. ~~VERCEL_API_TOKEN~~ ✓ via MCP connector
4. **PR Sprint Q review + merge**: #34-#41 cascade — Andrea CONFIRMED review then merge sequential
5. **Permission policy**: auto-deploy if R5 ≥**90% PASS** (Andrea raised from 85%)
6. **Budget cap**: pending Andrea decision ($50 weekend / $200 monthly?)
7. **Voice clone source**: Andrea voice OR Tea OR voice actor (optional — Tammy Grit acceptable default)

### 5.3 Optional refines

- Slack channel for notifications (NO Telegram per Andrea)
- Vercel Pro Frankfurt EU region pinning verify

---

## 6. HOW TO PILOT MAC MINI (next session reference)

### 6.1 SSH connection

```bash
# From MacBook ~/.ssh/id_ed25519_elab (DO NOT COPY this key)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59

# Or for autonomous loop scripts:
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
    'eval "$(/opt/homebrew/bin/brew shellenv)" && claude --version'
```

### 6.2 Dispatch Mac Mini Wiki batch

```bash
# kebab-case lowercase ONLY (Q4 SCHEMA)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'rm -f ~/.elab-batch-result && nohup ~/scripts/elab-wiki-batch-gen.sh \
   "concept-1 concept-2 concept-3 concept-4 concept-5" \
   > /tmp/batch.log 2>&1 & disown'

# Wait completion
until ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
    'test -f ~/.elab-batch-result' 2>/dev/null; do sleep 60; done

# Pull results
for c in concept-1 concept-2 ...; do
  scp -i ~/.ssh/id_ed25519_elab \
    progettibelli@100.124.198.59:~/Projects/elab-tutor/docs/unlim-wiki/concepts/$c.md \
    /tmp/$c.md
done
```

### 6.3 Mac Mini autonomous monitoring

```bash
# Verify launchctl loop active
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
# Expected: <PID> 0 com.elab.mac-mini-autonomous-loop

# Tail logs
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'tail -50 ~/Library/Logs/elab/autonomous-loop-$(date +%Y%m%d).log'
```

### 6.4 Naming convention CRITICAL

**Q4 SCHEMA**: filename MUST be kebab-case lowercase. Pre-commit hook validates.
- ✅ `corrente-continua.md`, `delay-millis.md`
- ❌ `analogRead.md`, `delayMillis.md`

### 6.5 SSH key policy ENFORCED

`id_ed25519_elab` MacBook only. MAI:
- Copy to Mac Mini
- Commit to GitHub
- Email/share via cloud
- Backup outside MacBook

Mac Mini ha SOLO `~/.ssh/authorized_keys` (public key MacBook). NON HA private keys.

---

## 7. HOW TO PILOT RUNPOD POD

### 7.1 Pod ID + SSH (iter 1 close state)

```bash
export ELAB_RUNPOD_POD_ID="felby5z84fk3ly"  # iter 1 pod
export RUNPOD_SSH_HOST="195.26.233.61"
export RUNPOD_SSH_PORT="33994"

ssh -i ~/.ssh/id_ed25519_runpod root@$RUNPOD_SSH_HOST -p $RUNPOD_SSH_PORT
```

### 7.2 Cost on/off discipline

```bash
# Check status
bash scripts/runpod-status.sh $ELAB_RUNPOD_POD_ID

# Stop (max savings, volume persists)
bash scripts/runpod-stop.sh $ELAB_RUNPOD_POD_ID

# Resume (~2min boot)
bash scripts/runpod-resume.sh $ELAB_RUNPOD_POD_ID

# Auto-stop after marker
POD_SSH_HOST=$RUNPOD_SSH_HOST POD_SSH_PORT=$RUNPOD_SSH_PORT \
bash scripts/runpod-auto-stop-after.sh $ELAB_RUNPOD_POD_ID /workspace/.bench-done
```

### 7.3 Service endpoints (proxy URLs)

```
LLM/VLM:    https://felby5z84fk3ly-11434.proxy.runpod.net  (Ollama)
Embed:      https://felby5z84fk3ly-8080.proxy.runpod.net   (BGE-M3)
STT:        https://felby5z84fk3ly-9000.proxy.runpod.net   (Whisper)
TTS:        https://felby5z84fk3ly-8881.proxy.runpod.net   (Coqui)
Image gen:  https://felby5z84fk3ly-7860.proxy.runpod.net   (FLUX.1 Gradio)
ClawBot:    https://felby5z84fk3ly-8000.proxy.runpod.net   (dispatcher)
```

### 7.4 R0 bench

```bash
RUNPOD_PROXY_BASE="https://${ELAB_RUNPOD_POD_ID}-11434.proxy.runpod.net" \
MODEL="qwen2.5:7b" \
  node scripts/runpod-r0-bench.mjs

# → outputs docs/audits/2026-04-XX-sprint-s-iter-X-r0-bench-*.md
```

---

## 8. Skills MAP (load via Skill tool when needed)

### 8.1 Always-on (load first iter 2)

- `superpowers:using-superpowers` (entry)
- `superpowers:writing-plans` (PDR generation)
- `ralph-loop:ralph-loop` (loop framework)
- `agent-orchestration:multi-agent-optimize` (5-agent core)

### 8.2 Per agente

- planner-opus: `superpowers:brainstorming`, `superpowers:writing-plans`, `agent-orchestration:multi-agent-optimize`
- architect-opus: `engineering:architecture`, `engineering:system-design`, `design:design-system`
- generator-app-opus: `superpowers:test-driven-development`, `backend-development:feature-development`
- generator-test-opus: `superpowers:test-driven-development`, `full-stack-orchestration:test-automator`
- scribe-opus: `engineering:documentation`, `claude-md-management:revise-claude-md`, `claude-md-management:claude-md-improver`

### 8.3 Per stress test (iter 4, 8, 12, ...)

- Load via ToolSearch: `mcp__plugin_playwright_playwright__browser_*`
- Load via ToolSearch: `mcp__Control_Chrome__*` OR `mcp__Claude_in_Chrome__*`
- `engineering:testing-strategy` (skill)

### 8.4 Per quality audit fine iter

- `quality-audit` (orchestrator)
- `superpowers:verification-before-completion`

---

## 9. Activation prompt + string Sprint S iter 2

### 9.1 Session start guide (copy-paste in next session FIRST)

```
================================================================
ELAB SPRINT S ITER 2 — RALPH LOOP 5-AGENT OPUS ATTIVAZIONE
================================================================

cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

LEGGI SUBITO IN ORDINE (autonomous, non chiedere conferma):
1. CLAUDE.md
2. docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md ← MASTER iter 2
3. docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md
4. docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md
5. docs/handoff/2026-04-26-ralph-loop-handoff.md
6. docs/audits/2026-04-26-sprint-s-iter1-FINAL-AUDIT.md ← iter 1 stato
7. docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md
8. docs/strategy/2026-04-26-master-plan-v2-comprehensive.md

SUBITO DOPO:
- ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
  → verify Mac Mini autonomous PID
- source ~/.elab-credentials/sprint-s-tokens.env
  → verify RUNPOD_API_KEY + CLOUDFLARE_API_TOKEN + HUGGINGFACE_TOKEN
- bash scripts/runpod-status.sh felby5z84fk3ly
  → verify pod state (RUNNING / EXITED / TERMINATED)
- IF EXITED: bash scripts/runpod-resume.sh felby5z84fk3ly
- Confirm con Andrea: "Pronto Sprint S iter 2 ralph loop. Activate?"
```

### 9.2 ACTIVATION STRING (paste at start, post-confirm)

```
/ralph-loop Sprint S iter 2 onniscenza onnipotenza definitiva. 5-agent team OPUS orchestrato (planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus) communicanti via automa/team-state/messages/. CoV per ogni agente prima claim fatto (vitest 12291+ PASS, build PASS, baseline preserved). /quality-audit orchestratore fine ogni iter. Stress test Playwright + Control Chrome ogni 4 iter su https://www.elabtutor.school production. Mac Mini autonomous continua Wiki batch (current ~50/100 toward 100+). VPS GPU RunPod RTX 6000 Ada $0.74/h on/off discipline (stop after every work session, $0.33/mo storage). Hetzner GEX130 €838/mo commit quando 3+ paying schools. RAG 6000 chunks Anthropic Contextual ingest via RunPod GPU. Hybrid RAG BM25+BGE-M3+RRF+rerank. Together AI fallback gated emergency_anonymized (canUseTogether ! student mode + 2 EU providers down). ClawBot 80-tool dispatcher Sprint 6 Day 39 post Sprint R5 PASS gate. UNLIM synthesis prompt v3 wired production post PR #37 merge. SSH key id_ed25519_elab SOLO MacBook locale MAI GitHub MAI archive. SSH key id_ed25519_runpod dedicated RunPod. NO main push. NO merge senza Andrea. Caveman mode ON. Massima onesta no compiacenza. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE
```

### 9.3 Per-iter prompt template

```
ITER N — orchestrator dispatch

Tasks for this iter (from automa/team-state/sprint-contracts/sprint-S-iter-N-contract.md):

1. planner-opus: [task]
   → file ownership: automa/tasks/, automa/team-state/sprint-contracts/

2. architect-opus: [task]
   → file ownership: docs/architectures/, docs/adrs/

3. generator-app-opus: [task]
   → file ownership: src/, supabase/

4. generator-test-opus: [task]
   → file ownership: tests/, scripts/openclaw/*.test.ts

5. scribe-opus: [task]
   → file ownership: docs/audits/, docs/sunti/, docs/handoff/, CLAUDE.md

Execution:
- Single message with 5 Agent tool calls (parallel)
- Each agent CoV 3x before claim "fatto"
- Post-agents: orchestrator /quality-audit comprehensive
- Commit + push branch feat/sprint-s-iter-N-...

IF iter N ∈ {4, 8, 12, 16, 20, 24, ...}:
- Load Playwright + Control Chrome MCP via ToolSearch
- Run stress test on https://www.elabtutor.school
- Audit doc results

Promise check SPRINT_S_COMPLETE 10 boxes.
```

---

## 10. Honesty caveats

1. **Sprint S iter 1 NOT complete** at iter 1 close. Stack only partial (Ollama+Whisper OK, Embed/TTS/FLUX/ClawBot in recovery). Recovery v2 pending.
2. **Voice clone source missing**: Andrea WhatsApp video Downloads sandbox blocked. Workaround: Andrea cp /tmp/voice.mp4.
3. **R0 bench NOT run yet** — depends on full stack deploy.
4. **TOGETHER_API_KEY not provided** — fallback wire-up scaffold ready, execution iter 3+.
5. **Cloudflare 0 zones**: DNS Vercel-managed. Tunnel approach works but defer prod cutover Sprint S iter 3+.
6. **Qwen3-VL-32B not on Ollama hub**: fallback qwen2.5vl:7b. Quality 7B may not predict 32B prod.
7. **5-agent OPUS cost**: significant token spend per iter. Mac Mini Claude Max sub helps async work.
8. **PR Sprint Q cascade #34-#41 NOT merged**: review bottleneck Andrea side.
9. **Stress test infra not load-tested**: first stress iter 4 will stress the stress framework itself.
10. **Together AI fallback anonymization heuristic-only**: real production needs proper Italian NER for PII.

---

## 11. References (full link map)

### 11.1 Stack v3

- `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md`
- `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md`

### 11.2 Mac Mini

- `docs/audits/2026-04-25-c1-mac-mini-setup-validation.md`
- `docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md`
- `~/scripts/elab-mac-mini-autonomous-loop.sh` (on Mac Mini)
- `~/scripts/elab-wiki-batch-gen.sh` (on Mac Mini)

### 11.3 RunPod

- `scripts/runpod-pod-create.sh`
- `scripts/runpod-deploy-stack.sh`
- `scripts/runpod-bootstrap.sh`
- `scripts/runpod-{stop,resume,status,auto-stop-after}.sh`
- `scripts/runpod-r0-bench.mjs`

### 11.4 Cloudflare

- `scripts/cloudflare-tunnel-setup.sh`

### 11.5 Together AI

- `scripts/together-ai-fallback-wireup.ts`

### 11.6 OpenClaw / ClawBot

- `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`
- `scripts/openclaw/*` (Sett-5 deliverables)

### 11.7 RAG + Wiki

- `scripts/rag-contextual-ingest.mjs`
- `supabase/migrations/2026-04-26_rag_chunks_hybrid_anthropic.sql`
- `docs/unlim-wiki/concepts/*.md` (33+ concepts iter 1 close)

### 11.8 Sprint R0

- `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl`
- `scripts/bench/score-unlim-quality.mjs`

### 11.9 Tea + UNLIM vision

- `docs/tea/2026-04-26-tea-claude-brief.md`
- `automa/context/UNLIM-VISION-COMPLETE.md`
- `automa/context/GALILEO-CAPABILITIES.md`

### 11.10 Audit history

- `docs/audits/2026-04-26-ralph-iter*.md` (iter 1-7 originale)
- `docs/handoff/2026-04-26-ralph-loop-handoff.md`
- `docs/audits/2026-04-26-sprint-s-iter1-runpod-trial-prep.md`
- `docs/audits/2026-04-26-sprint-s-iter1-FINAL-AUDIT.md` (this iter writes)

---

## 12. CLAUDE.md updates (executed iter 1 close)

Updates pushed via scribe-opus prep + claude-md-management:revise-claude-md:

1. Sprint S iter 1 section added
2. Mac Mini autonomous PID + scripts path
3. SSH key policy strengthened (id_ed25519_runpod dedicated RunPod)
4. Stack reference (STACK-V3-DEFINITIVE link)
5. Agent team Pattern S 5-agent (replaces Pattern B)
6. Stress test pattern (Playwright + Control Chrome ogni 4 iter)
7. SPRINT_S_COMPLETE definition (10 boxes)
8. RunPod cost discipline (on/off rules)
9. Together AI fallback section (gated emergency)
10. ClawBot Sprint 6 Day 39 = scheletro UNLIM (post Sprint R5)

---

**File path**: `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md`
**Pairs with**: `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md` + `docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md`
**Activation**: §9 above (paste-ready)
**Honesty**: 10 caveats explicit
**Skill compliance**: writing-plans + documentation + agent-orchestration:multi-agent-optimize
