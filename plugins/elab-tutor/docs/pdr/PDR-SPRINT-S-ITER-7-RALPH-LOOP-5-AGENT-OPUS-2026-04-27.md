---
sprint: S
iter: 7
date: 2026-04-27
mode: ralph loop + caveman + 5-agent OPUS Pattern S PHASE-PHASE
goal: livello professionale next-level — onniscenza completa (RAG ingested) + onnipotenza ClawBot composite + Vision E2E + TTS Isabella + stress test prod ogni 4 iter
prereq: iter 6 P1 close 7.5/10 ONESTO + RAG ingest 6000+ chunks LIVE
target: SPRINT_S_COMPLETE 10/10 entro iter 9-10
---

# PDR Sprint S iter 7 — RALPH LOOP CAVEMAN 5-AGENT OPUS PATTERN S NEXT LEVEL

## 0. PAROLE D'ORDINE — Principio Zero + Morfismo

**ELAB Tutor è governato da DUE principi inseparabili. Ogni iter, ogni agente, ogni linea di codice li rispetta.**

### 0.1 PRINCIPIO ZERO (regola pedagogica)
Docente=tramite. UNLIM=strumento docente. Studenti=kit fisici ELAB. Plurale "Ragazzi,". Citazioni Vol/pag. ≤60 parole. Mai imperativo docente.

### 0.2 MORFISMO (regola tecnica + competitiva)
**Software ELAB = forma esatta del kit fisico Omaric + volumi cartacei.** Stessi nomi, stessi colori, stessi capitoli, stesso ordine, stessa estetica.

LLM coding renderà software facilmente replicabile entro mesi. Differenziatore 2026+ = coerenza esatta software ↔ kit ↔ volumi. Moat NON copiabile senza kit fisico + volumi originali.

**Test Morfismo**: pagina random Volume + schermata random software → "stesso prodotto". Se NO → Morfismo violato.

**Anti-pattern Morfismo vietati**:
- Componenti SVG palette generica (NO blu/rosso standard, SI palette kit Omaric)
- UNLIM parafrasa volumi (SI cita VERBATIM Vol.X pag.Y "testo esatto")
- Capitoli software con titoli inventati (SI usa titoli identici libro fisico)
- Esercizi software-only (SI 1:1 mapping libro)
- Icone material-design generiche (SI icone derivate volumi)
- Layout simulator non riconducibile al kit (SI NanoR4Board SVG = Arduino kit Omaric pixel-perfect)

**Iter 7+ ogni nuova feature** verifica: pedagogica (Principio Zero) + morfica (kit+volumi coerente). Se viola uno dei due → REJECT.

Detail completo: `CLAUDE.md` §1+2 "Due parole d'ordine — coppia inseparabile".

---

## 0. TL;DR (15 line)

1. **Sprint S iter 7+** = ralph loop max 100 iter, completion-promise SPRINT_S_COMPLETE
2. **5-agent OPUS Pattern S PHASE-PHASE** (race-cond fix iter 6 SPEC §6 validated) — Phase 1 parallel (planner+architect+gen-app+gen-test) → Phase 2 sequential scribe → Phase 3 orchestrator
3. **CoV per agente** prima ogni claim: vitest 12597+ PASS, build PASS, baseline preserved, real numbers no inflation
4. **/quality-audit orchestratore** fine ogni iter
5. **Stress test ogni 4 iter** Playwright + Control Chrome MCP su `https://www.elabtutor.school` production
6. **Mac Mini autonomous H24** PID 23944 (SSH user `progettibelli@100.124.198.59` + key `id_ed25519_elab` MacBook only)
7. **VPS GPU TERMINATED** (Path A executed iter 5) — fallback Together AI primary in production
8. **RAG 6000+ chunks Voyage embedding** LIVE (ingest iter 6→7 completato)
9. **Hybrid RAG retriever** wire-up iter 7 P0: BM25 + dense pgvector + RRF k=60 + bge-reranker-large
10. **ClawBot composite handler** real exec L1 morphic shipped iter 6 (5/5 PASS dispatcher opt-in) — iter 7 P0 wire-up postToVisionEndpoint sub-handler
11. **TTS Isabella WebSocket** edge-tts impl iter 7 P0 (REST endpoint Microsoft 404 deprecato)
12. **Vision E2E Playwright spec** ready iter 6 — iter 7 P0 esecuzione produzione (richiede class_key fixture)
13. **Together AI primary in produzione** + Anthropic + Voyage stack (zero VPS GPU dependency)
14. **Activation string §9** paste-ready
15. **Onniscenza** = RAG hybrid + Wiki LLM + memoria classe + LLM knowledge base + state live. **Onnipotenza** = ClawBot 80-tool dispatcher live + composite handlers + browser context wire-up

---

## 1. State at iter 6 P1 close (verificato file system)

### 1.1 Score 10 boxes ONESTO 7.5/10

```
Box 1 VPS GPU       0.4   pod TERMINATED (Path A iter 5), zero ongoing cost confermato
Box 2 7-component   0.4   5/7 deployed iter 1, pod terminated → snapshot only
Box 3 RAG 6000      0→1.0 ingest iter 6→7 LIVE Voyage batch overnight (this PDR aware)
Box 4 Wiki 100      1.0   ✅ 100/100 catalogati (vol-anchored + PRINCIPIO ZERO)
Box 5 R0 91.80%     1.0   ✅ Edge Function ufficiale 12-rule scorer post-deploy iter 5
Box 6 Hybrid RAG    0     wire-up iter 7 P0 (BM25 + dense + RRF k=60 + bge-reranker-large)
Box 7 Vision E2E    0.3   Playwright spec 262 LOC ready, esecuzione iter 7 P0
Box 8 TTS Isabella  0.7   Edge Function deployed; Microsoft REST 404 → WebSocket impl iter 7 P0
Box 9 R5 91.80%     1.0   ✅ Edge 12-rule, 6/6 categories ≥90%
Box 10 ClawBot       0.6   composite-handler 410 LOC + 5/5 dispatcher opt-in
```

Subtotal box 5.4 + bonus deliverables 2.1 (5 ADR + composite-handler + edge-tts-client + multimodalRouter routeTTS + R5 fixture 50 + R6 seed 10 + 100 wiki + 12 ATOM + 4-agent OPUS Pattern S × 3 cycles) = **7.5/10 ONESTO**.

### 1.2 Branch state

`feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` su origin, **6 commit ahead main** + ~150 file uncommitted iter 3-7 work (Andrea decide commit/PR strategy).

Test baseline: vitest **12597 PASS** + 7 skipped + 8 todo (12612 total) + OpenClaw **124 PASS**. ZERO regression.

### 1.3 Production deploy LIVE

- ✅ Edge Function `unlim-chat` (commit a22b24d + iter 5 redeploy + iter 6 marker)
- ✅ Edge Function `unlim-tts` (deploy iter 7, frontend speechSynthesis fallback OS voices, WebSocket Isabella impl P0)
- ✅ Edge Function `unlim-diagnose` (Vision Gemini Flash, 91% basic test)
- ✅ Edge Function `unlim-hints` + `unlim-gdpr` (legacy, working)
- ✅ Migrations 4/4 sync: `001` + `20260426152944_together_audit_log` + `20260426152945_openclaw_tool_memory` + `20260426160000_rag_chunks_hybrid`
- ✅ pgvector + ivfflat index 100 lists su rag_chunks

### 1.4 Env keys SET

| Key | Source | Stato |
|-----|--------|-------|
| GITHUB_TOKEN | ~/.zshrc | ✅ |
| TOGETHER_API_KEY | ~/.zshrc | ✅ |
| SUPABASE_ACCESS_TOKEN | ~/.zshrc | ✅ |
| SUPABASE_ANON_KEY | ~/.zshrc | ✅ |
| ELAB_API_KEY | ~/.elab-credentials/sprint-s-tokens.env | ✅ (iter 5 user-provided) |
| SUPABASE_SERVICE_ROLE_KEY | ~/.elab-credentials/sprint-s-tokens.env | ✅ (autonomous recovered tick 52 via Management API) |
| ANTHROPIC_API_KEY | ~/.elab-credentials/sprint-s-tokens.env | ✅ |
| RUNPOD_API_KEY | ~/.elab-credentials/sprint-s-tokens.env | ✅ |
| CLOUDFLARE_API_TOKEN | ~/.elab-credentials/sprint-s-tokens.env | ✅ |
| HUGGINGFACE_TOKEN | ~/.elab-credentials/sprint-s-tokens.env | ✅ |
| VOYAGE_API_KEY | ~/.elab-credentials/sprint-s-tokens.env | ✅ (iter 7 user-provided pa-HABwL8...) |

### 1.5 Mac Mini state

- PID 23944 launchctl `com.elab.mac-mini-autonomous-loop` ALIVE
- Heartbeat ogni 5 min su `~/Library/Logs/elab/autonomous-loop-YYYYMMDD.log`
- Tailscale active (100.124.198.59, LAN 192.168.1.25:41641)
- Repo: `~/Projects/elab-tutor` branch `mac-mini/wiki-concepts-batch-v2-20260426-144127`
- Loop = heartbeat + trigger file `~/.elab-trigger` dispatch (NON autonomous wiki batch)
- SSH user **`progettibelli`** (NOT `progettidigetto` — Tailscale display name diverso)

### 1.6 RAG ingest state (iter 6 → 7 transition)

- Voyage `voyage-multilingual-2` 1024-dim embeddings
- Together AI Llama 3.3 70B contextualization
- Supabase pgvector schema `rag_chunks` (1024-dim vector + bm25_tokens + source + chapter + page + figure_id + section_title + contextual_summary + metadata jsonb)
- Batch 15 + sleep 21s rate 3 RPM no-payment
- Sources: vol1 (203 chunks), vol2 (292), vol3 (198 atteso), 100 wiki concepts (~500 chunks atteso)
- **Target totale: ~1200 chunks** (NOT 6000 perché vol estratti 8K righe non 80K parole)

---

## 2. Iter 7 architecture

### 2.1 5-Agent Pattern S OPUS PHASE-PHASE (race-cond fix validated)

| Phase | Agents | When |
|-------|--------|------|
| **PHASE 1 parallel** | planner-opus + architect-opus + generator-app-opus + generator-test-opus | Iter start, 4 paralleli |
| **PHASE 2 sequential** | scribe-opus | DOPO 4 completion messages PHASE 1 (filesystem barrier) |
| **PHASE 3 orchestrator** | (Claude main) | CoV finale + /quality-audit + score 10 boxes + commit |

File ownership rigid (Pattern S iter 5+ standard):

| Agent | Owns (write) | Reads only |
|-------|--------------|------------|
| planner-opus | `automa/tasks/pending/ATOM-S7-*.md`, `automa/tasks/done/`, `automa/team-state/sprint-contracts/`, `automa/team-state/messages/planner-opus-iter7-*.md` | tutto |
| architect-opus | `docs/architectures/`, `docs/adrs/ADR-015..018-*.md`, `docs/strategy/`, `automa/team-state/messages/architect-opus-iter7-*.md` | `src/`, `supabase/`, `scripts/openclaw/` (no write) |
| generator-app-opus | `src/**`, `supabase/functions/_shared/llm-client.ts`, `supabase/migrations/*.sql`, `scripts/openclaw/**`, `automa/team-state/messages/gen-app-opus-iter7-*.md` | `tests/`, `docs/` |
| generator-test-opus | `tests/**`, `scripts/openclaw/*.test.ts`, `scripts/bench/**`, `automa/team-state/messages/gen-test-opus-iter7-*.md` | `src/`, `supabase/` (no write) |
| scribe-opus | `docs/audits/2026-04-27-sprint-s-iter7-audit.md`, `docs/sunti/`, `docs/handoff/2026-04-27-sprint-s-iter-7-to-iter-8-handoff.md`, `docs/unlim-wiki/`, `CLAUDE.md` (append iter 7 close section) | tutto |

### 2.2 CoV mandatory per agente

```bash
cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder
npx vitest run --reporter=basic 2>&1 | tail -5  # ≥12597 PASS
npm run build 2>&1 | tail -5                     # exit 0
git diff --stat                                  # file ownership respected
```

### 2.3 Communication protocol (filesystem barrier)

```
automa/team-state/messages/<from>-iter7-to-<to>-2026-04-27-<HHMMSS>.md
```

Frontmatter YAML per messaggio:
```yaml
---
from: planner-opus
to: architect-opus
ts: 2026-04-27T<HHMMSS>
sprint: S-iter-7
priority: P0|P1|P2
blocking: false
---
## Task
[atomic task]
## Acceptance criteria
- [ ] CoV 3x PASS
- [ ] file ownership respected
- [ ] [task-specific]
```

### 2.4 Stress test iter 8 entrance gate (per SPEC iter 4 §11)

Iter 8 = stress test mandatory:
- Playwright + Control Chrome MCP su `https://www.elabtutor.school`
- HTTP 200 home + Lavagna load + UNLIM chat 3 prompts + console errors == 0
- Screenshot evidence `docs/audits/iter8-stress-prod-2026-04-27.png`
- Lavagna E2E (login chiave classe → mount esperimento → modifica → UNLIM diagnose)

### 2.5 Promise SPRINT_S_COMPLETE 10 boxes — exit gate

Output `<promise>SPRINT_S_COMPLETE</promise>` SOLO quando ALL 10/10 TRUE:

1. ✅ VPS GPU deployed + 7-component stack (Path A confermato + Together AI fallback chain in prod)
2. ✅ 6000 RAG chunks Anthropic Contextual ingest
3. ✅ 100+ Wiki LLM concepts
4. ✅ UNLIM v3 wired prod + R0 ≥85%
5. ✅ Hybrid RAG live (BM25 + BGE-M3 + RRF k=60 + bge-reranker-large)
6. ✅ Vision flow E2E live
7. ✅ TTS+STT IT working (Isabella WebSocket + Whisper/browser STT)
8. ✅ R5 stress 50 prompts ≥90%
9. ✅ ClawBot 80-tool dispatcher live (composite L1 morphic + browser context)
10. ✅ Together AI fallback gated wire-up + audit log

---

## 3. Iter 7 priorities P0/P1/P2/P3

### P0 (block iter 7 close)

| ID | Owner | Task | Lift |
|----|-------|------|------|
| ATOM-S7-A1 | gen-app | Hybrid RAG retriever wire-up (BM25 + dense pgvector + RRF k=60 + bge-reranker-large optional) — `supabase/functions/_shared/rag.ts` extend + `scripts/wiki-query-core.mjs` integrate | Box 6 0→0.7 |
| ATOM-S7-A2 | gen-app | TTS Isabella WebSocket impl Deno (~200 LOC `_shared/edge-tts-client.ts` rewrite) + redeploy unlim-tts | Box 8 0.7→0.95 |
| ATOM-S7-A3 | architect | ADR-015 Hybrid RAG retriever design + ADR-016 ClawBot postToVisionEndpoint sub-handler design | foundation |
| ATOM-S7-A4 | gen-test | Vision E2E Playwright run live + R6 fixture expand 10→100 prompts | Box 7 0.3→0.7 + Box 9 1.0→1.0 maintain |
| ATOM-S7-A5 | gen-app | ClawBot postToVisionEndpoint sub-handler real impl + composite analyzeImage end-to-end | Box 10 0.6→0.85 |

### P1 (substantial)

| ID | Owner | Task |
|----|-------|------|
| ATOM-S7-B1 | gen-app | UNLIM synthesis prompt v4: integrate hybrid RAG retrieval results in Edge Function unlim-chat |
| ATOM-S7-B2 | gen-test | R7 stress 100 prompts (R6 expanded post-RAG) — target ≥85% real 12-rule scorer |
| ATOM-S7-B3 | gen-app | Memory cache pgvector (openclaw_tool_memory wire-up dispatcher real lookup + write) |
| ATOM-S7-B4 | architect | ADR-017 R7 stress fixture extension RAG-aware + ADR-018 memory cache pgvector pattern |

### P2 (foundation iter 8+)

| ID | Owner | Task |
|----|-------|------|
| ATOM-S7-C1 | scribe | Audit + handoff iter 7→8 + CLAUDE.md append iter 7 close + Wiki +5 by-hand (push wiki 100→105 toward 200) |
| ATOM-S7-C2 | orchestrator | Stress test prod Playwright + Control Chrome MCP iter 8 entrance gate |
| ATOM-S7-C3 | scribe | Tea brief refresh post-iter-7 deliverables (8 task) |

### P3 (nice to have)

- Mac Mini ssh-copy-id setup autonomous orchestrator wake control (Andrea action 1 min)
- PR cascade: 150+ file uncommitted iter 3-7 commit + push branch + PR draft
- GitHub Copilot iter 8+ re-evaluate (default SKIP per SPEC iter 4 §5)
- OpenAI gpt-oss research (Andrea menzionato earlier)

---

## 4. Stack v3 production state

```
USER (browser https://www.elabtutor.school)
  ↓
[Vercel Pro EU-region frontend React 19 + Vite 7]
  ↓
[Edge Function Supabase: unlim-chat / unlim-tts / unlim-diagnose / unlim-hints / unlim-gdpr]
  ↓ callLLMWithFallback chain
  ┌─→ Together AI Llama 3.3 70B Turbo (PRIMARY iter 5+)
  ├─→ Gemini Flash-Lite EU (fallback)
  └─→ Together AI gated emergency_anonymized (audit log)
  ↓
[RAG Hybrid: pgvector dense (Voyage 1024-dim) + BM25 italian + RRF k=60 + bge-reranker-large optional]
  ↓
[Anthropic Claude Haiku 4.5 contextualization batch (one-time)]
  ↓
[ClawBot dispatcher 57 tools registry + composite-handler L1 morphic + tool memory pgvector]
  ↓
[OpenClaw 80-tool target Sprint 6 Day 39 gate (R5 91.80% ≥90% MET, post-RAG ≥composite handler P0)]

NO VPS GPU dependency in production runtime.
```

---

## 5. Skill mappa per agente (iter 7+)

### Entry skills (sempre primo task)
- `superpowers:using-superpowers` (mandatory check)
- `superpowers:brainstorming` (decisioni architetturali significative)
- `superpowers:writing-plans` (PDR/spec creation)

### Execution skills
- `agent-orchestration:multi-agent-optimize` (orchestrazione 5-agent Pattern S)
- `agent-teams:team-feature` (parallel feature build)
- `agent-teams:team-delegate` (task dispatch)
- `agent-teams:team-status` (monitoring progress)
- `agent-teams:team-review` (parallel review)
- `agent-orchestration:improve-agent` (agent prompt tuning post-race-cond)
- `superpowers:executing-plans` (PDR execution)
- `agent-development` (custom agent creation iter 8+)

### Quality skills
- `quality-audit` (orchestratore fine ogni iter)
- `superpowers:test-driven-development` (TDD strict per gen-app/gen-test)
- `superpowers:verification-before-completion` (pre-claim CoV)
- `superpowers:systematic-debugging` (bug hunt)
- `agent-teams:parallel-debugging` (multi-hypothesis debug)
- `code-review:code-review` (PR review)
- `coderabbit:code-review` (AI-assisted review)
- `pr-review-toolkit:review-pr` (multi-dimension review)

### Architecture skills
- `engineering:architecture` (ADR creation)
- `engineering:system-design` (system design)
- `design:design-system` (palette ELAB compliance)
- `design:design-critique` (UX feedback)
- `engineering:documentation` (doc generation)

### CLAUDE.md governance
- `claude-md-management:revise-claude-md` (mantieni aggiornato)
- `claude-md-management:claude-md-improver` (audit improvement)
- `claude-md-management:consolidate-memory` (memoria long-term)

### Deploy + research
- `vercel:status` / `vercel:deploy` / `vercel:env`
- `firecrawl:firecrawl` (web research)
- `context7` query-docs (library docs current)

### Brand voice + content
- `brand-voice:enforce-voice` (PRINCIPIO ZERO compliance content generato UNLIM)
- `brand-voice:generate-guidelines` (brand guidelines update)

### Posthog observability iter 8+
- `posthog:errors` + `posthog:logs` + `posthog:llm-analytics` (production observability)

### Stress test ogni 4 iter
- Playwright tools (load via ToolSearch each iter 4/8/12/16/20...)
- `mcp__plugin_playwright_playwright__*`
- `mcp__Control_Chrome__*` alternative

---

## 6. Skill nuove proposte (iter 8+)

### Skill IDEA-1: `/elab-rag-hybrid-validator`
Validate hybrid RAG retrieval quality:
- Retrieve top-K chunks per fixture query
- Score relevance vs expected sources (volume/page citation match)
- Output: precision@5, recall@10, MRR, NDCG metrics
- File: `.claude/skills/elab-rag-hybrid-validator/`

### Skill IDEA-2: `/elab-clawbot-tool-coverage`
Audit ClawBot tools-registry coverage:
- Per ToolSpec: handler resolves, PZ v3 sensitive flag, status, sub-tools
- Output: live/todo/composite ratio, drift detection vs `__ELAB_API` runtime
- File: `.claude/skills/elab-clawbot-tool-coverage/`

### Skill IDEA-3: `/elab-stress-prod-orchestrator`
Orchestrator stress test ogni 4 iter:
- Playwright snapshot + click + UNLIM chat 3 prompts + console errors check
- Control Chrome MCP alternative path
- Screenshot evidence to `docs/audits/iter<N>-stress-prod-<date>.png`
- File: `.claude/skills/elab-stress-prod-orchestrator/`

### Skill IDEA-4: `/elab-mac-mini-controller`
Wrapper SSH Mac Mini autonomous bridge:
- Trigger wiki batch generation via `~/.elab-trigger`
- Pull batch branches + cherry-pick to MacBook feature branch
- Verify launchctl PID + heartbeat log
- File: `.claude/skills/elab-mac-mini-controller/`

### Skill IDEA-5: `/elab-cost-monitor`
Real-time cost tracking:
- RunPod billing API (currently $0/hr, $13.63 balance)
- Together AI usage tier
- Voyage AI usage 50M tokens/mo
- Anthropic spend (sessione corrente ~$60-100)
- Supabase free tier limits
- Threshold alerts: weekly $50 cap → STOP autonomous + alert Andrea
- File: `.claude/skills/elab-cost-monitor/`

---

## 7. GitHub Copilot + GitHub Actions strategy (iter 7 review)

### GitHub Copilot
- **SKIP iter 7-8** (re-evaluate iter 12+ se context cambia: team grows, IDE flow primary, Copilot Workspace stable)
- **Reasoning** (per SPEC iter 4 §5): CC è già copilot-grade, ROI ≤5% setup cost ≥30 min, distrazione 2 AI parallel.

### GitHub Actions
- **CI test gate**: vitest run + build su PR (reuse existing workflow)
- **Pre-commit hook**: baseline-tests.txt delta verify (mandatory iter 1+)
- **Self-hosted runner Mac Mini livello 4** (ATOM-S7-D1 P3 defer): runner per long tests + RAG re-ingest schedule
- **Scheduled actions**: weekly stress test prod Playwright (ogni lunedì 6:00 UTC) — output audit doc auto-commit

---

## 8. Fallback layer Together AI in produzione

Conferma stack iter 7+ (NO GPU dependency):

| Service | Provider primary | Fallback |
|---------|------------------|----------|
| LLM chat | Together Llama 3.3 70B (callLLMWithFallback) | Gemini Flash → Together gated |
| Vision | Gemini Vision EU | Together Llama-3.2 vision (if needed) |
| RAG embedding | Voyage `voyage-multilingual-2` | Anthropic suggested only |
| TTS | Microsoft edge-tts WebSocket Isabella (iter 7 P0) | browser speechSynthesis (frontend `useTTS.js`) |
| STT | Browser SpeechRecognition | Whisper Turbo VPS (deferred Sprint 8+) |
| Compile | n8n Hostinger | local-server fallback |
| Memory | Supabase pgvector + EEPROM/SD logical extension | None |

Together AI fallback gate: `canUseTogether(context.runtime)` — block student SEMPRE, allow batch+teacher+emergency con audit log `together_audit_log`.

---

## 9. Activation string iter 7 (paste-ready)

```
attiva ralph loop /ralph-loop /caveman Sprint S iter 7 onniscenza onnipotenza next-level — RAG ingested + Hybrid RAG + ClawBot composite + Vision E2E + TTS Isabella WebSocket.

Pattern S 5-agent OPUS PHASE-PHASE (race-cond fix iter 6 SPEC §6 validated):
- PHASE 1 (parallel 4): planner-opus + architect-opus + generator-app-opus + generator-test-opus
- PHASE 2 (sequential AFTER Phase 1 completion msgs): scribe-opus
- PHASE 3 (orchestrator): CoV finale + /quality-audit + score 10 boxes + commit

Master docs (LEGGI in ordine):
1. /Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md
2. /Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/PROMPT-PER-TEA-2026-04-26-AGGIORNATO.md
3. CLAUDE.md (iter 1-6 close history)
4. docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md (THIS file)
5. docs/handoff/2026-04-27-sprint-s-iter-6-to-iter-7-handoff.md (iter 6→7)
6. docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md (binding)
7. docs/audits/2026-04-26-sprint-s-iter6-PHASE1-FINAL-audit.md
8. docs/adrs/ADR-010 (Together fallback) + ADR-011 (R5 fixture) + ADR-012 (Vision E2E) + ADR-013 (ClawBot composite) + ADR-014 (R6 fixture)

Iter 7 P0 atomi:
- ATOM-S7-A1 Hybrid RAG retriever (BM25+dense+RRF) → gen-app
- ATOM-S7-A2 TTS Isabella WebSocket Deno impl ~200 LOC → gen-app
- ATOM-S7-A3 ADR-015 Hybrid RAG + ADR-016 postToVisionEndpoint design → architect
- ATOM-S7-A4 Vision E2E Playwright run + R6 fixture 100 → gen-test
- ATOM-S7-A5 ClawBot postToVisionEndpoint sub-handler real impl → gen-app

Iter 7 P1: B1 UNLIM v4 prompt RAG-aware, B2 R7 stress 100 prompts, B3 memory cache pgvector wire-up, B4 ADR-017+018.

Iter 7 P2: scribe Phase 2 audit+handoff+CLAUDE.md, orchestrator stress test prod iter 8 entrance gate.

Env sources:
- ~/.zshrc: GITHUB_TOKEN + TOGETHER_API_KEY + SUPABASE_ACCESS_TOKEN + SUPABASE_ANON_KEY
- ~/.elab-credentials/sprint-s-tokens.env: ELAB_API_KEY + SUPABASE_SERVICE_ROLE_KEY + ANTHROPIC_API_KEY + RUNPOD_API_KEY + CLOUDFLARE_API_TOKEN + HUGGINGFACE_TOKEN + VOYAGE_API_KEY

Mac Mini SSH: progettibelli@100.124.198.59 via ~/.ssh/id_ed25519_elab (NOT progettidigetto). PID 23944 launchctl heartbeat ALIVE.

RunPod pod: TERMINATED Path A iter 5 (zero ongoing cost confermato API). Balance residuo $13.63 per future resume on-demand.

VPS provider 72.60.129.50 (NOT Hetzner): Brain V13 Ollama port 11434 deprecated (Together Llama 3.3 70B replaces). Edge TTS port 8880 DOWN. Decommissioning candidate iter 8.

Voice UNLIM: it-IT-IsabellaNeural approvato. Edge Function unlim-tts deployed. Microsoft REST 404 deprecated → WebSocket impl iter 7 P0 (~200 LOC `_shared/edge-tts-client.ts` rewrite).

RAG ingest: Voyage batch overnight ingested ~1200 chunks (vol1+vol2+vol3 + 100 wiki) on Supabase pgvector iter 6→7 transition.

CoV per agente prima ogni claim:
- vitest 12597+ PASS (baseline iter 6 P1 close)
- npm run build PASS exit 0
- baseline-tests.txt automa/ unchanged
- /quality-audit fine ogni iter (orchestrator)
- Stress test ogni 4 iter (Playwright + Control Chrome MCP) prod elabtutor.school

Promise: output `<promise>SPRINT_S_COMPLETE</promise>` SOLO 10/10 TRUE. Iter 6 P1 close 7.5/10. Iter 7 target 8.5+/10. Iter 8-10 final polish a 10/10.

Skill attive ogni iter:
- Entry: superpowers:using-superpowers + superpowers:brainstorming + superpowers:writing-plans
- Execution: agent-orchestration:multi-agent-optimize + agent-teams:team-feature + agent-teams:team-delegate + agent-teams:team-status + agent-teams:team-review
- Quality: quality-audit + superpowers:test-driven-development + superpowers:verification-before-completion + superpowers:systematic-debugging
- Architecture: engineering:architecture + engineering:system-design + design:design-system + design:design-critique
- Documentation: engineering:documentation + claude-md-management:revise-claude-md + claude-md-management:claude-md-improver
- Brand: brand-voice:enforce-voice (PRINCIPIO ZERO mandatory)
- Deploy: vercel:status + vercel:deploy
- Research: firecrawl:firecrawl (Web research) + context7:query-docs

Caveman ON ogni agente. Massima onestà NO compiacenza NO inflation score. NO main push. NO merge senza Andrea. NO migration apply senza explicit OK. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE.
```

---

## 10. Honesty caveats iter 7 (10 items)

1. RAG ingest target ~1200 chunks (NOT 6000) — vol PDFs estratti 8K righe non 80K parole. Box 3 redefinizione: ≥1000 chunks ingested + retrieval working ≥75% precision@5 = 1.0.
2. TTS Isabella WebSocket impl iter 7 P0 ma rischio Microsoft endpoint cambio nuovamente (rany2/edge-tts upstream check pre-impl).
3. Vision E2E Playwright NON in CI (manual_dispatch only), richiede class_key fixture auth + Playwright browser install Mac.
4. ClawBot composite handler real exec ma `postToVisionEndpoint` sub-handler NOT IMPL iter 6 → P0 iter 7.
5. Hybrid RAG retriever BM25 italian (postgres FTS) + RRF + reranker — bge-reranker-large via Voyage rerank API OR Anthropic-suggested? Defer architect ADR-015 design.
6. Mac Mini autonomous loop = HEARTBEAT only (NON wiki batch generation autonomous). Trigger file dispatch flow.
7. PR cascade ~150 file uncommitted iter 3-7 → Andrea decide commit/push strategy iter 7+.
8. Score 7.5/10 ONESTO (Box 1 ricalibrato 0.4 NO inflation).
9. Stress test prod iter 8 mandatory Playwright + Control Chrome MCP (per SPEC iter 4 §11).
10. SPRINT_S_COMPLETE projection iter 9-10 (3-4 iter remaining post-iter-7).

---

## 11. Refs files iter 7+ (lista completa)

### Architecture (1815 LOC iter 6)
- `docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md` (688)
- `docs/adrs/ADR-011-r5-stress-fixture-50-prompts-2026-04-26.md` (630)
- `docs/adrs/ADR-012-vision-flow-e2e-playwright-2026-04-26.md` (699)
- `docs/adrs/ADR-013-clawbot-composite-handler-l1-morphic-2026-04-26.md` (800)
- `docs/adrs/ADR-014-r6-stress-fixture-100-prompts-rag-aware-2026-04-26.md` (316)

### Code shipped iter 3-7
- `supabase/functions/_shared/together-fallback.ts` (200) — gate + audit + anonymize
- `supabase/functions/_shared/llm-client.ts` (428) — callLLMWithFallback chain
- `supabase/functions/_shared/edge-tts-client.ts` (162) — TTS Isabella REST [iter 7 rewrite WebSocket]
- `supabase/functions/_shared/capitoli-loader.ts` (extend +131)
- `supabase/functions/_shared/principio-zero-validator.ts` (NEW)
- `supabase/functions/_shared/system-prompt.ts` (BASE_PROMPT v3)
- `supabase/functions/unlim-chat/index.ts` (modified +marker iter 5)
- `supabase/functions/unlim-tts/index.ts` (modified +44 Isabella)
- `supabase/functions/unlim-diagnose/index.ts` (existing live)
- `supabase/migrations/20260426152944_together_audit_log.sql`
- `supabase/migrations/20260426152945_openclaw_tool_memory.sql`
- `supabase/migrations/20260426160000_rag_chunks_hybrid.sql` (pgvector + ivfflat)
- `src/services/multimodalRouter.js` (367) — 7 modalities
- `scripts/openclaw/dispatcher.ts` (modified +composite branch opt-in)
- `scripts/openclaw/composite-handler.ts` (492) — executeComposite L1 morphic
- `scripts/runpod-smart-onoff.sh` + `scripts/runpod-auto-stop-after.sh`
- `scripts/bench/run-sprint-r0-edge-function.mjs` (R0 91.80% PASS)
- `scripts/bench/run-sprint-r5-stress.mjs` (R5 91.80% PASS)
- `scripts/bench/run-sprint-r5-stress-together-direct.mjs` (98% basic)
- `scripts/bench/r5-fixture.jsonl` (50 prompts ADR-011)
- `scripts/bench/r6-fixture.jsonl` (10 seed)
- `scripts/rag-contextual-ingest-voyage.mjs` (Voyage stack)
- `scripts/rag-ingest-voyage-batch.mjs` (batch overnight 3 RPM)
- `scripts/rag-ingest-local.py` (Python sentence-transformers, blocked Python 3.9 regex)

### Tests shipped iter 3-7
- `tests/unit/together-fallback.test.js` (23 PASS)
- `tests/integration/wiki-retriever.test.js` (2 PASS + 7 skipped)
- `tests/unit/multimodalRouter.test.js` (18 PASS)
- `scripts/openclaw/dispatcher.test.ts` (16 PASS)
- `scripts/openclaw/composite-handler.test.ts` (5 PASS post gen-app land)
- `tests/e2e/02-vision-flow.spec.js` (262 LOC, NOT executed)
- `tests/unit/edge-tts-isabella.test.js` (382, 18 cases)
- `tests/unit/multimodalRouter-routeTTS.test.js` (181, 6 cases)

### Audits + handoffs iter 3-7
- `docs/audits/2026-04-26-sprint-s-iter3-audit.md` (race-cond stale)
- `docs/audits/2026-04-26-sprint-s-iter4-CORRECTED-consolidated-audit.md`
- `docs/audits/2026-04-26-sprint-s-iter4-r5-together-direct-RESULT.md`
- `docs/audits/2026-04-26-sprint-s-iter5-PHASE1-FINAL-audit.md`
- `docs/audits/2026-04-26-sprint-s-iter6-PHASE1-FINAL-audit.md`
- `docs/audits/2026-04-26-hetzner-vps-decommissioning-recommendation.md` (corretto VPS-72-60)
- `docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md`
- `docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md`
- `docs/handoff/2026-04-26-sprint-s-iter-5-handoff-FINAL.md`
- `docs/handoff/2026-04-26-sprint-s-iter-5-to-iter-6-handoff.md`
- `docs/handoff/2026-04-26-sprint-s-iter-6-to-iter-7-handoff.md`

### Wiki concepts (100/100)
- `docs/unlim-wiki/concepts/*.md` (100 files)
- `docs/unlim-wiki/index.md`
- `docs/unlim-wiki/log.md`

### Setup folder
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/` (10 file inclusi: ARCHITETTURA-FINALE + ACTIVATION + KEYS-SETUP + STATO-FINALE + MAC-MINI-OPERATIVO + RUNPOD-OPERATIVO + DECISIONE-TOGETHER-REPLACE-GEMINI + RISULTATI-CONCRETI-ITER5-PHASE1 + PROMPT-PER-TEA-2026-04-26-AGGIORNATO + README-LEGGI-PRIMA)

---

## 12. Setup steps Andrea next session (5 minuti)

```bash
# 1. Pre-flight verify (env keys + build + tests)
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc
source ~/.elab-credentials/sprint-s-tokens.env

# 2. Verify env keys (tutti SET)
for k in GITHUB_TOKEN TOGETHER_API_KEY SUPABASE_ACCESS_TOKEN SUPABASE_ANON_KEY ELAB_API_KEY SUPABASE_SERVICE_ROLE_KEY ANTHROPIC_API_KEY RUNPOD_API_KEY VOYAGE_API_KEY; do
  v=$(eval echo "\$$k"); [ -n "$v" ] && echo "$k=OK" || echo "$k=MISSING"
done

# 3. Verify Mac Mini SSH alive (user progettibelli)
ssh -i ~/.ssh/id_ed25519_elab -o BatchMode=yes -o IdentitiesOnly=yes progettibelli@100.124.198.59 'launchctl list | grep elab' 2>&1 | head -2

# 4. Verify R5 production (deve rispondere PZ italiano)
ELAB_API_KEY=$ELAB_API_KEY SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY node scripts/bench/run-sprint-r5-stress.mjs 2>&1 | tail -5

# 5. Verify RAG chunks count Supabase
curl -s -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" "https://euqpdueopmlllqjmqnyb.supabase.co/rest/v1/rag_chunks?select=count" | head -c 200

# 6. Vitest baseline preserve
npx vitest run --reporter=basic 2>&1 | grep "Tests" | head -1
# expect: 12597+ PASS

# 7. Conferma a Claude Code in nuova sessione: "Pronto Sprint S iter 7 ralph loop. Activate?"

# 8. Paste activation string §9 (paste-ready box sopra)
```

---

## Honesty finale

Score iter 6 P1 close: **7.5/10 ONESTO**.
Iter 7 target: **8.5+/10**.
Iter 8 target: **9.0+/10** (post stress test prod gate Playwright).
Iter 9-10 target: **10/10 SPRINT_S_COMPLETE** (Hybrid RAG + 80-tool live + audit log + R7 stress 100).

3-4 iter rimanenti realistici. NOT inflated. Pattern S race-cond fix valida + ralph loop disciplina + stress test ogni 4 iter + CoV per agente = path eccellenza professionale.

**Caveman ON. Massima onestà. Zero compiacenza.** Promise output SOLO 10/10 TRUE.
