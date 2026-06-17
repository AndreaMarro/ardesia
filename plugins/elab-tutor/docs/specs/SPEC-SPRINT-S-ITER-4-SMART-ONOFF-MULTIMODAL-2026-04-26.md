---
sprint: S
iter: 4
type: spec (binding for iter 4 execution)
date: 2026-04-26 PM
author: Claude Opus 4.7 1M (orchestrator iter 3 close)
mode: caveman + max onestà + zero compiacenza
goal: smart on/off GPU VPS + Together AI test-mode alive + multi-modal orchestration LLM+VLM+ImgGen+ClawBot+Vox + audio default policy + GitHub Copilot assessment + agent improvements (race-condition fix)
references:
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md
  - docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md
  - docs/audits/2026-04-26-sprint-s-iter3-audit.md (race-condition stale, but useful structure)
  - docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md (race-condition stale, correct iter 4)
  - docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md (688 righe shipped iter 3)
  - docs/adrs/ADR-011-r5-stress-fixture-50-prompts-2026-04-26.md (630 righe shipped iter 3)
  - CLAUDE.md (iter 3 close addendum reale 4.3/10)
---

# SPEC Sprint S iter 4 — Smart On/Off + Multi-modal + Documenta tutto

> **Caveman + Max onestà + Zero compiacenza**. Fragments OK. No filler. Tech terms exact. Code blocks normal.

---

## 0. Reality check iter 3 close (file-verified, scribe stale corrected)

**4.3/10 ONESTO** (NOT 3.4 scribe race-condition error).

Major win: **R0 Edge Function 91.80% PASS** (vs 75.81% Render baseline) — **+15.99pp dramatic lift** post BASE_PROMPT v3 deploy. Target ≥85% MET, ≥90% R5 gate MET on R0 sample. Latency 4831ms (vs 15703ms Render cold start). Plurale_ragazzi 0/10→9/10 (PZ rules forced).

Architect+Gen-test SHIPPED post-scribe-collection. Pattern S race condition discovered.

---

## 1. Audio default policy (user request)

**Path**: `/Users/andreamarro/Downloads/Senza nome 2.m4a` (3.6MB m4a).

**Sandbox blocker**: Bash `cannot open: Operation not permitted`. Read tool: no audio support. Cannot transcribe in-session.

**Decision** (per user explicit authorization 2026-04-26):
- **Default voice (APPROVATO Andrea 2026-04-26)**: `it-IT-IsabellaNeural` (Microsoft Edge TTS, female warm professional Italian).
- **Pacchetto**: `pip install edge-tts` (MIT license, no API key)
- **Profilo**: gentile, trascinante, non fastidiosa, non entusiasta, non grave (matches user req)
- **Età percepita**: 28-35 (autorevole non maestra severa)
- **Velocità**: `--rate=-5%` slight slow per comprensione classe ragazzi 11-13
- **Fallback voice**: `it-IT-ElsaNeural` (più calma, alternativa) e Tammy Grit Coqui XTTS-v2 (RunPod, voice clone se Andrea cp `/tmp/voice.m4a` → `/workspace/speaker_default.wav` >10KB)
- **Test command**:
  ```bash
  pip install edge-tts
  edge-tts --voice "it-IT-IsabellaNeural" --rate=-5% \
    --text "Ragazzi, oggi vediamo come funziona un LED" \
    --write-media /tmp/test-isabella.mp3
  ```
- Use Tammy Grit unless user manually `cp` voice to RunPod `/workspace/speaker_default.wav`.
- DO NOT block iter 4 work waiting voice clone Andrea.
- DO NOT lie about transcription.

**Future option (iter 5+)**: setup local Whisper transcribe for inbox m4a → transcript.txt → Claude reads. Requires RunPod resume + WhisperPort 9000 active.

---

## 2. Smart on/off GPU VPS algorithm (user request: "algoritmo on off furbo")

### 2.1 State machine

```
[STOPPED] ←→ [BOOTING] → [RUNNING] → [IDLE_DETECTED] → [STOPPING] → [STOPPED]
   ↑                          ↓                                          ↓
   └────────────[TASK_ARRIVES]┴──[GRACE_5MIN]──[NO_NEW_TASK]──────────────┘
```

### 2.2 Decision tree

```
Task arrives:
├── Task type == "test_quality" (R0/R5 fixture, prompts ≤50)
│   ├── target_endpoint == "Edge Function elab-unlim"
│   │   └── NO GPU NEEDED → execute directly via Supabase, log cost $0
│   └── target_endpoint == "Render legacy"
│       └── NO GPU NEEDED → execute via Render (cold start 18s OK for bench)
│
├── Task type == "test_inference_local" (Qwen2.5:7b, Whisper, Coqui)
│   ├── pod_state == "EXITED" → BOOT (~2min) → execute → mark task done → check queue
│   │   ├── queue_empty AND idle_5min → STOP (auto)
│   │   └── queue_nonempty → KEEP_RUNNING
│   └── pod_state == "RUNNING" → execute directly
│
├── Task type == "rag_ingest" (Anthropic Contextual 6000 chunks)
│   └── Batch only. Wait queue ≥3 ingest tasks → BOOT → run all → STOP.
│
├── Task type == "vision" (Qwen2.5-VL screenshot diagnose)
│   ├── prod runtime → DO NOT use GPU live (latency unacceptable, GDPR EU)
│   │   └── route to Gemini Vision (Cloud, EU region)
│   └── benchmark only → BOOT → run → STOP
│
└── Task type == "image_gen" (FLUX.1)
    └── Defer iter 6+ (low priority Sprint S)
```

### 2.3 Algoritmo concreto (script)

File: `scripts/runpod-smart-onoff.sh` (NEW, write iter 4).

```bash
#!/usr/bin/env bash
# Smart on/off pod RunPod $POD_ID
# Usage: scripts/runpod-smart-onoff.sh <task_type> [<task_args>]

set -euo pipefail
POD_ID="${ELAB_RUNPOD_POD_ID:-5ren6xbrprhkl5}"
GRACE_IDLE_MIN="${GRACE_IDLE_MIN:-5}"

task_type="$1"
shift

case "$task_type" in
  test_quality|test_edge)
    echo "[smart-onoff] task=$task_type → Edge Function direct, NO GPU"
    exit 0  # caller invoke Edge directly
    ;;
  test_inference_local|rag_ingest|bench_vision)
    state=$(bash scripts/runpod-status.sh "$POD_ID" | grep -oE 'EXITED|RUNNING|BOOTING')
    if [ "$state" = "EXITED" ]; then
      echo "[smart-onoff] BOOT pod=$POD_ID"
      bash scripts/runpod-resume.sh "$POD_ID"
      until [ "$(bash scripts/runpod-status.sh "$POD_ID" | grep -oE RUNNING)" = "RUNNING" ]; do
        sleep 10
      done
    fi
    echo "[smart-onoff] RUNNING ready → exec task"
    # caller invoke task on pod via SSH
    # AFTER task done, schedule auto-stop
    bash scripts/runpod-auto-stop-after.sh "$POD_ID" "$GRACE_IDLE_MIN" &
    ;;
  *)
    echo "[smart-onoff] unknown task_type=$task_type" >&2
    exit 1
    ;;
esac
```

### 2.4 Cost projection iter 4 con on/off

| Scenario | Hours/iter | Cost |
|----------|-----------|------|
| 5 R5 stress 50-prompt runs (Edge only) | 0h GPU | $0.00 |
| 1 RAG ingest batch (6000 chunks) | 4h GPU | $1.96 |
| 1 vision bench (50 screenshots) | 1h GPU | $0.49 |
| Storage 130GB | always | $0.43/day = $13/mo |
| **Total iter 4 GPU** | ~5h | **~$3 + $13 storage** |

vs alternativa GPU sempre RUNNING: $0.49 × 24h × 7gg = **$82.32/sett** → smart on/off **96% saving**.

### 2.5 Gate condizioni STOP automatic

- Idle ≥5 min senza nuovo task (queue empty)
- Cost cumulato weekly ≥ $50 → STOP forzato + alert Andrea
- Failure rate test ≥30% → STOP + investigate (no waste)
- Manual override: `bash scripts/runpod-stop.sh $POD_ID --force`

---

## 3. Together AI test-mode alive (user request: "mantieni viva")

### 3.1 Use cases ALLOWED (no GPU consumption)

- **Test fixture R5 50 prompts**: Together API call vs Edge Function call → comparison report
- **Batch evaluation prompt v3 vs v4 candidates**: A/B test 100 prompts each
- **Anonymized teacher feedback**: consent-gated, audit logged
- **Emergency fallback**: gated `runtime=emergency` + `anonymized=true`

### 3.2 Use cases BLOCKED

- Student runtime SEMPRE BLOCK (per ADR-010 §gate D2)
- Non-anonymized payloads
- Recurring runtime usage (cost discipline)

### 3.3 Wire-up iter 4 (P0)

File: `supabase/functions/_shared/llm-client.ts` extend con `callLLMWithFallback(messages, opts)`:

```typescript
async function callLLMWithFallback(messages: Message[], opts: {
  context: TogetherContext  // { runtime, consent_id?, anonymized }
  preferred?: 'gemini' | 'together' | 'auto'
  testMode?: boolean  // iter 4: true → bypass GPU, use Edge+Together direct
}) {
  if (opts.testMode === true) {
    // Test mode: route to Together (canUseTogether check) OR Edge Function
    if (canUseTogether(opts.context)) {
      const startMs = Date.now()
      const r = await callTogether(messages)
      await logTogetherCall(supabase, anonymizePayload(messages), r.status, Date.now()-startMs)
      return r
    }
    return callGemini(messages)  // EU fallback
  }
  // Prod chain: RunPod (if reachable) → Gemini EU → Together gated
  // ... (full chain logic)
}
```

### 3.4 Acceptance criteria

- [ ] `callLLMWithFallback` exported, signature stable (no breaking changes existing `callLLM`)
- [ ] Unit test: `tests/unit/llm-client-fallback.test.js` 12 cases truth-table
- [ ] Integration: 1 fixture test invoca testMode → no GPU consumption
- [ ] Audit log row inserted per Together call (verifiable via Supabase query)

---

## 4. Multi-modal orchestration (user request: "tutti gli llm vlm image gen clawbot vox")

### 4.1 Tabella orchestrazione completa

| Modality | Provider primary | Fallback chain | Endpoint | GPU? | Test mode |
|----------|------------------|----------------|----------|------|-----------|
| **LLM chat** | Gemini Flash-Lite | Gemini Flash → Gemini Pro → Together (gated) | Edge Function `unlim-chat` | NO | ✅ |
| **LLM RAG** | Qwen2.5:7b local | Gemini Flash | RunPod Ollama port 11434 | YES (RunPod) | ❌ defer iter 5 |
| **VLM vision** | Gemini Vision | Qwen2.5-VL local (RunPod, bench only) | Edge Function `unlim-diagnose` | NO (Gemini) / YES (Qwen-VL bench) | ✅ Gemini |
| **Image gen** | FLUX.1 RunPod | none (defer) | RunPod port 5000 | YES | ❌ Sprint S+ |
| **STT** | Whisper Turbo | Browser SpeechRecognition | RunPod port 9000 | YES (Whisper) | ⚠️ partial |
| **TTS** | **Microsoft Edge TTS `it-IT-IsabellaNeural`** (approvato Andrea 2026-04-26) | Coqui XTTS-v2 (Tammy Grit fallback) | edge-tts Python pip (no GPU, no API key) / RunPod port 8000 (Coqui) | NO (edge-tts) / YES (Coqui fallback) | ✅ edge-tts default |
| **ClawBot 80-tool** | OpenClaw scaffold | none | local script `scripts/openclaw/` | NO (logic only) | ✅ |

### 4.2 Bind perfetto via routing layer

File: `src/services/multimodalRouter.js` (NEW, write iter 4):

```javascript
export const multimodalRouter = {
  async route(intent) {
    // intent = { modality: 'chat'|'rag'|'vision'|'imageGen'|'stt'|'tts'|'clawbot', payload, context }
    switch (intent.modality) {
      case 'chat': return callLLMWithFallback(intent.payload.messages, intent.context)
      case 'rag': return callRAG(intent.payload.query, intent.context)
      case 'vision': return callVision(intent.payload.imageBase64, intent.context)
      case 'imageGen': throw new Error('image-gen defer Sprint S+')
      case 'stt': return callSTT(intent.payload.audioBlob, intent.context)
      case 'tts': return callTTS(intent.payload.text, intent.context)
      case 'clawbot': return callClawBot(intent.payload.toolId, intent.payload.args, intent.context)
      default: throw new Error('unknown modality: '+intent.modality)
    }
  }
}
```

### 4.3 ClawBot scaffold iter 4 (subset 10/80 tools, foundation)

Per ADR-007 module extraction pattern. File: `scripts/openclaw/dispatcher.ts` minimal:

```typescript
export const clawBotDispatcher = {
  tools: new Map(/* 10 tools iter 4 seed: 
    setComponentValue, connectWire, mountExperiment, captureScreenshot,
    getCircuitState, highlightComponent, serialWrite, clearCircuit,
    getCircuitDescription, lessonNext */),
  async dispatch(toolId, args, context) {
    if (!this.tools.has(toolId)) throw new Error('unknown tool: '+toolId)
    const startMs = Date.now()
    const result = await this.tools.get(toolId).run(args, context)
    // log to openclaw_tool_memory (iter 4 B2 migration apply needed)
    return result
  }
}
```

Test: `scripts/openclaw/dispatcher.test.ts` 10 tools × 2 cases each = 20 tests.

---

## 5. GitHub Copilot assessment (user request: "vedi se serve")

### 5.1 Onestà brutale

**Claude Code è già Copilot-grade (e oltre)**. Capacità simili:
- Code completion in editor: VS Code Copilot ✓ / CC inline edits via Edit ✓
- Multi-file refactor: Copilot Workspace beta ✓ / CC Agent + Edit ✓✓ (più avanzato)
- Codebase Q&A: Copilot Chat ✓ / CC + Explore agent ✓✓
- Test generation: entrambi ✓
- PR descriptions: entrambi ✓

### 5.2 Where GH Copilot adds marginal value (honest)

1. **Inline VS Code IDE completion durante typing** — CC è CLI/terminal-focused, IDE typing flow Copilot più snappy.
2. **Copilot for Pull Requests**: auto-genera PR descriptions su web GitHub.com. Marginale (gh CLI + CC fa stesso meglio).
3. **Copilot in Codespaces**: IDE cloud su GitHub. Marginale (locally CC sufficiente).

### 5.3 Where GH Copilot does NOT help iter 4+

- Multi-agent orchestration Pattern S → CC Agent tool >>>> Copilot single-thread
- File system message passing → CC ha Bash+Edit+Read direct → Copilot needs MCP gateway
- ralph loop iter coordination → CC native, Copilot no equivalent
- Cost/budget tracking → CC has ralph-loop.local.md state, Copilot opaque

### 5.4 Recommendation iter 4

**SKIP GH Copilot integration in Sprint S iter 4**. Reasoning:
- ROI ≤5% (CC copre 95% use cases)
- Setup cost ≥30 min (auth, VS Code config, billing)
- Distraction risk: 2 AI assistant in parallel = confusion + duplicate edits
- Alternative pattern superior: CC ralph loop multi-agent + manual VS Code editing senza AI quando preferito

**Re-evaluate Sprint S iter 8+** if:
- Andrea passa da CLI a IDE flow
- Team grows (collaboratori + Copilot Business shared)
- Specific Copilot feature emerges (es. Copilot Workspace stable)

**Document decision**: this section. End of evaluation.

---

## 6. Agent improvements (user request: "/agent-orchestration:improve-agent" + "massimamente oggettivo")

### 6.1 Lessons learned iter 3 (race condition)

**Bug**: scribe-opus collected state at T+8min; architect-opus finished T+9min; gen-test-opus finished T+19min. Scribe audit/handoff/CLAUDE.md state stale (claimed ❌ NOT shipped) → wrong score 3.4/10 reported.

**Root cause**: Pattern S parallel dispatch lacks synchronization barrier. Scribe ran in parallel, not after others.

### 6.2 Pattern S iter 4+ fix — synchronization barrier

**Old pattern (iter 3)**:
```
orchestrator dispatches 5 agents PARALLEL → all return concurrent → orchestrator collects
```

**New pattern (iter 4)**:
```
PHASE 1 (parallel, T0):
  - planner-opus
  - architect-opus
  - generator-app-opus
  - generator-test-opus
PHASE 2 (after phase 1 ALL completion messages received):
  - scribe-opus (reads completion messages, writes audit)
PHASE 3 (orchestrator):
  - CoV finale vitest+build
  - /quality-audit
  - score 10 boxes
```

Implementation: orchestrator dispatches PHASE 1 in single message (4 Agent calls), waits for all returns, THEN dispatches PHASE 2 (1 Agent call scribe), waits, THEN PHASE 3.

### 6.3 Agent prompt template improvements (concrete)

For iter 4+ agent prompts, ADD these mandatory sections:

```markdown
## Synchronization protocol
- DO NOT START work until you read all PRECONDITION messages from agents listed in `wait_for` field.
- Write your COMPLETION message in `automa/team-state/messages/<self>-to-orchestrator-<TS>.md` ONLY when all your CoV passed.
- Mark frontmatter `status: completed` to signal orchestrator.

## Completion message MUST include
- Files created/modified (absolute paths + line counts)
- CoV results (vitest count, build status, baseline delta)
- Open issues / blockers
- Honest score for your deliverables (0-10 self-assessment, NO inflation)
```

### 6.4 Caveman discipline reinforcement

Each agent prompt iter 4+: include explicit caveman block at top:
```
CAVEMAN MODE FULL.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries (sure/certainly).
Fragments OK. Tech terms exact. Quote errors verbatim. Code blocks normal.
NO compiacenza. NO inflation. Max onestà.
```

### 6.5 Score self-assessment honesty rule

Each agent ends with **honest self-score 0-10** based ONLY on:
- Files actually written (verifiable file system)
- CoV passed (vitest + build PASS)
- Acceptance criteria from contract met (boolean checklist)

NOT based on:
- Effort spent
- Lines of code written (vanity metric)
- Self-confidence

Orchestrator can override down (NEVER up) if verification fails.

---

## 7. Iter 4 priorities (binding)

### P0 (block iter 4 close)

- **A1 callLLMWithFallback wire-up** (gen-app-opus): `_shared/llm-client.ts` add full chain logic (RunPod → Gemini → Together gated). Unit test `llm-client-fallback.test.js` 12 cases.
- **A2 Supabase migrations apply** (gen-app-opus + Andrea OK): `together_audit_log` + `openclaw_tool_memory` SQL apply via `supabase db push --linked`. Andrea must explicitly approve.
- **A3 R5 stress 50-prompt full execution** (gen-test-opus): expand `r5-fixture.jsonl` 10→50 per ADR-011 categories. Run `run-sprint-r5-stress.mjs` against Edge Function. Target ≥90% PASS overall, ≥80% per category. Output report.

### P1

- **B1 Smart on/off scripts** (gen-app-opus): `scripts/runpod-smart-onoff.sh` + `scripts/runpod-auto-stop-after.sh` (both NEW). Test: dry-run mode no actual pod call.
- **B2 multimodalRouter scaffold** (gen-app-opus): `src/services/multimodalRouter.js` 7 modality stubs. Unit test `multimodalRouter.test.js` 7 routes.
- **B3 ClawBot dispatcher 10 tools** (gen-app-opus): `scripts/openclaw/dispatcher.ts` minimal. Test 20 cases.

### P2

- **C1 Stress test prod Playwright + Control Chrome MCP** (orchestrator): smoke `https://www.elabtutor.school` HTTP 200 + Lavagna load + UNLIM chat 3 prompts + console errors == 0. Screenshot evidence `docs/audits/iter4-stress-prod-2026-04-26.png`. **MANDATORY iter 4** (every 4 iter rule).
- **C2 Audit + handoff iter 4→5** (scribe-opus AFTER phase 1): correct race-condition iter 3 retroactively.

### P3 (defer if budget tight)

- **D1 Wiki Mac Mini batch** (autonomous, no orchestrator action)
- **D2 Vision flow scaffold** (defer iter 5 if RunPod EXITED)

---

## 8. CoV iter 4 (binding)

```bash
cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder

# Pre-flight
git status
cat automa/baseline-tests.txt   # expect: 12290

# Per-agent CoV (3x):
npx vitest run --reporter=basic 2>&1 | tail -10   # ≥12557 PASS (iter 3 baseline)
npm run build 2>&1 | tail -5                       # exit 0
git diff --stat                                    # file ownership respected

# R5 stress run gate
node scripts/bench/run-sprint-r5-stress.mjs        # ≥90% PASS
ls scripts/bench/output/r5-*.{md,jsonl,json}       # 3 files

# Stress test prod (every 4 iter)
# (orchestrator runs Playwright + Control Chrome MCP)
```

---

## 9. Documentation policy (user request: "DOCUMENTA TUTTO")

Each iter 4+ delivery MUST include:

1. **Code change**: files modified + line count + CoV result
2. **ADR if architectural**: `docs/adrs/ADR-NNN-*.md` ≥300 righe
3. **Audit if iter close**: `docs/audits/<date>-sprint-s-iter-N-audit.md` 10-box update
4. **Handoff if iter close**: `docs/handoff/<date>-sprint-s-iter-N-to-iter-(N+1).md` activation string
5. **CLAUDE.md append iter close section**: ≤50 righe, 10-box reality, score onesto
6. **Spec if new feature**: `docs/specs/SPEC-*.md` (this file pattern)
7. **Wiki concept if new term**: `docs/unlim-wiki/concepts/<kebab>.md` Vol/pag citation

NO undocumented changes. Pre-commit hook should enforce (future iter 5+).

---

## 10. Promise SPRINT_S_COMPLETE 10 boxes — exit gate iter 4 target

Iter 4 honest target: **5.0/10** (vs iter 3 close 4.3/10 → +0.7 progress).

Likely ✅ NEW iter 4:
- Box 9 R5 ≥90% PASS (if stress execution + fixture expansion done) → +0.5
- Box 10 ClawBot 10/80 tools scaffold + tests → partial +0.3 (full Sprint 6 Day 39)
- Box 8 TTS Coqui Tammy Grit verify → if pod boot → +0.2

Output `<promise>SPRINT_S_COMPLETE</promise>` SOLO quando 10/10 TRUE. Iter 3 close 4.3/10 → still **5.7 boxes da risolvere**. Honest projection: SPRINT_S_COMPLETE iter 8-12 (4-8 iter da iter 3).

---

## 11. Honesty caveats iter 4 (10 items)

1. Scribe race-condition iter 3 has CORRUPTED audit + handoff scribe wrote (numbers wrong). Iter 4 stress test must correct retroactively.
2. R0 91.80% measured on 10 prompts only — small sample size, R5 50 prompts will validate or invalidate.
3. R0 `citation_vol_pag` still 2/10 — legacy experimentId not in Capitoli map. Architecture issue, not prompt issue. Defer iter 5.
4. Audio file Andrea sandbox blocked — Tammy Grit default voice (acknowledged user permission).
5. GH Copilot SKIP iter 4 — re-evaluate iter 8+ if context changes.
6. RunPod pod EXITED throughout iter 3 — host saturo OR cost discipline. Iter 4 BOOT required for vision/imageGen/STT-TTS bench tasks.
7. Mac Mini autonomous loop continues out-of-band — orchestrator does NOT block on its progress.
8. NO main push iter 4. NO merge senza Andrea OK. PR cascade iter 1-2 still open (6 commits ahead main).
9. Together AI fallback wire-up gated — block student SEMPRE. Audit log REQUIRES migrations applied (P0 A2 iter 4).
10. SPEC iter 4 binding ONLY for iter 4. Subsequent iter spec separate.

---

## 12. Activation string iter 4 (paste-ready next session)

```
attiva ralph loop /ralph-loop /caveman Sprint S iter 4 — smart on/off + multi-modal + R5 stress.

Pattern S 5-agent OPUS PHASE-PHASE (NOT pure parallel):
- PHASE 1 (parallel): planner + architect + gen-app + gen-test
- PHASE 2 (sequential after PHASE 1): scribe-opus
- PHASE 3 (orchestrator): CoV finale + /quality-audit + score 10 boxes

Master spec: docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md
Master PDR (still binding): docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md
Iter 3 close ONESTO: 4.3/10 (CLAUDE.md updated, scribe race-cond corrected).

Iter 4 priorities:
- P0 A1 callLLMWithFallback chain (gen-app)
- P0 A2 migrations apply (gen-app + Andrea OK)
- P0 A3 R5 stress 50-prompt full execution (gen-test)
- P1 B1 smart on/off scripts (gen-app)
- P1 B2 multimodalRouter scaffold (gen-app)
- P1 B3 ClawBot 10/80 dispatcher (gen-app)
- P2 C1 stress prod Playwright/Control Chrome MCP MANDATORY
- P2 C2 audit + handoff iter 4→5 + correct iter 3 retroactive

Voice default: Tammy Grit (audio Andrea sandbox blocked).
GH Copilot: SKIP iter 4 (re-eval iter 8+).
GPU on/off: smart algo per §2 spec — Edge Function direct (no GPU) for tests.
Together AI: keep alive test-mode gated (no GPU consumption).
Output `<promise>SPRINT_S_COMPLETE</promise>` SOLO 10/10 TRUE.
```
