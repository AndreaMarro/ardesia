---
sprint: S
iter: 3
date: 2026-04-26 close → 2026-04-27 execution
author: Andrea Marro via Claude Opus 4.7 1M context (Sprint S iter 2 close)
status: master PDR session-next, ralph loop --completion-promise SPRINT_S_COMPLETE max-iterations 100
mode: ralph loop + caveman + 5-agent OPUS Pattern S + CoV per agente + /quality-audit orchestratore + stress test ogni 4 iter
goal: realizzare definitivamente UNLIM onniscenza + onnipotenza con team 5-agent OPUS comunicanti, ClawBot scheletro UNLIM, RunPod GPU on/off discipline + Together AI fallback gated
---

# PDR Sprint S iter 3 — Ralph Loop 5-Agent OPUS Definitivo

**Pairs with**: `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md` (iter 2), `docs/audits/2026-04-26-sprint-s-iter2-audit.md` (iter 2 close), `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md` (Sprint S originale)

---

## 0. TL;DR (15 line)

1. **Sprint S iter 3** = ralph loop max 100 iter, completion-promise SPRINT_S_COMPLETE
2. **5-agent team OPUS Pattern S** comunicanti via `automa/team-state/messages/<from>-to-<to>-<TS>.md`
3. **CoV per agente** prima ogni claim "fatto" (vitest 12532+ PASS, build PASS, baseline preserved)
4. **/quality-audit orchestratore** fine ogni iter
5. **Stress test ogni 4 iter** Playwright + Control Chrome MCP su `https://www.elabtutor.school` deployed
6. **Mac Mini autonomous H24** continua wiki batch volumi-anchored v2 (target 100+ concepts)
7. **VPS GPU RunPod RTX A6000 48GB** pod `5ren6xbrprhkl5` $0.49/h on/off discipline (resume ~2min)
8. **Together AI fallback gated** wire-up `_shared/llm-client.ts` (canUseTogether + audit log)
9. **ClawBot 80-tool dispatcher** = scheletro UNLIM, Sprint 6 Day 39 post Sprint R5 PASS gate
10. **UNLIM v3 prompt** GIÀ DEPLOYED prod (iter 2 commit `a22b24d`, Edge Function elab-unlim)
11. **R0 baseline 75.81% WARN** misurato iter 2, R1 re-run priority iter 3 (gap plurale_ragazzi 0/10)
12. **Voice clone Andrea** sandbox block — cp /tmp/voice-andrea.m4a manuale obbligatorio
13. **GitHub Copilot + Actions** strategy in §A2 Appendix
14. **New skill ideas** in §A4 Appendix (5 skill mancanti utili)
15. **Activation string** §9 paste-ready

---

## 1. State at iter 2 close (verificato)

### 1.1 Branch shipped

`feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` su origin, **6 commit** ahead main:
- `a22b24d` Task A UNLIM v3 wire-up (capitoli-loader.ts +131, principio-zero-validator.ts NEW, system-prompt.ts BASE_PROMPT v3 sintesi+plurale, unlim-chat/index.ts wire-up + post-LLM PZ validation)
- `b00ef28` Task B UI wire-up LavagnaShell + AppHeader (+136 lines, CapitoloPicker + handleCitationClick + activeCapitolo state + memoized lookup)
- `8edb9d2` Mac Mini iter 9 wiki +3 (blink-led, ground-massa, voltmetro)
- `f89b893` Mac Mini v2 script + volumi text extraction (8190 righe Vol1+Vol2+Vol3)
- `611d25f` Mac Mini iter 16 wiki +4 (fade-led, semaforo, allarme, cronometro)
- `4695c88` Fix v2 script checkout feature branch (volumi-text vive su feature, non main)

**Test baseline**: 12532 PASS + 8 todo (preserve, +34 vs Sprint S iter 1 baseline 12498)
**Build**: PASS exit 0 (13m54s, obfuscation lenta + esbuild CSS warnings non-fatal, PWA precache 36 entries 9285 KiB)

### 1.2 Production deploy

✅ **`unlim-chat` Edge Function LIVE** su elab-unlim (`euqpdueopmlllqjmqnyb`):
- BASE_PROMPT v3 (forza "Ragazzi," + USO DELLE FONTI rules + max 60 parole)
- `buildCapitoloPromptFragment` integrated (Capitolo schema injection)
- `validatePrincipioZero` post-LLM (6 PZ rules runtime, append-warning pattern, log CRITICAL)
- Defensive try/catch fallback per legacy lesson-paths

### 1.3 RunPod pod state

**Pod corrente**: `5ren6xbrprhkl5` RTX A6000 48GB, EXITED (cost discipline)
- Datacenter: US-WA-1
- SSH: `38.147.83.24:21041` (cambia post-resume)
- Cost: $0.49/h running, $13/mo storage 130GB volume
- Modelli persisteno: Ollama + Qwen2.5:7b (4.7GB) + Qwen2.5-VL:7b (6GB) + Whisper Turbo (port 9000) + pip packages (TTS, FlagEmbedding, faster-whisper, transformers)
- **Resume**: `bash scripts/runpod-resume.sh 5ren6xbrprhkl5` (~2min boot, SSH port cambia)

**Pod precedente terminate**: `felby5z84fk3ly` + `u5lq1dsouj0sal` (dockerArgs bug + host saturo)

### 1.4 Mac Mini autonomous

- launchctl `com.elab.mac-mini-autonomous-loop` PID 23944 ATTIVO H24
- SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab` (MacBook only)
- Scripts: `~/scripts/elab-wiki-batch-gen.sh` (v1) + `~/scripts/elab-wiki-batch-gen-v2.sh` (v2 volumi-anchored)
- v2 script auto-checkout feature branch per accesso volumi-text
- Wiki count local: **59 concepts** (target 100+)
- Branch pattern: `mac-mini/wiki-concepts-batch-v2-YYYYMMDD-HHMMSS`

### 1.5 Sprint R0 baseline

✅ Misurato LIVE iter 2 su Render endpoint nanobot V2:
- **75.81% WARN** overall (target 85% PASS, target 90% R5 gate)
- 10/10 fixture prompts succeeded
- Avg latency 15.7s (Render cold start visible)
- Failure clusters CRITICAL:
  - `plurale_ragazzi` **0/10 FAIL** (every response missed plural)
  - `citation_vol_pag` **0/10 FAIL**
  - `max_words` 3/10 FAIL
- **Atteso lift dramatic** post BASE_PROMPT v3 deploy iter 2 (forza "Ragazzi," + Vol/pag rules)
- **Iter 3 priority**: re-run R0 stesso fixture su NEW deployed Edge Function → misura delta vs 75.81%

### 1.6 SPRINT_S_COMPLETE 10 boxes (iter 2 close)

| # | Box | Status | Block |
|---|-----|--------|-------|
| 1 | VPS GPU deployed | ✅ pod EXITED storage paid | resume on demand |
| 2 | 7-component stack live | ⚠️ 2/7 (Ollama+Qwen + Whisper) | Coqui+ClawBot+BGE-M3 fix iter 3 |
| 3 | 6000 RAG chunks Anthropic Contextual | ❌ | depend GPU + Supabase migration apply |
| 4 | 100+ Wiki concepts | ⚠️ 59/100 | Mac Mini batches continue |
| 5 | UNLIM v3 wired prod | ✅ DEPLOYED Supabase | re-run R0 measure delta |
| 6 | Hybrid RAG live | ❌ | depend BGE-M3 + migration apply |
| 7 | Vision flow live | ❌ | depend Qwen-VL + simulator integration |
| 8 | TTS+STT IT working | ⚠️ STT OK (Whisper port 9000), TTS TODO Coqui | voice clone Andrea pending |
| 9 | R5 stress 50 prompts ≥90% | ⚠️ R0 baseline 75.81% measured | R5 expanded fixture iter 5+ |
| 10 | ClawBot 80-tool dispatcher | ❌ | Sprint 6 Day 39 post R5 PASS |

**Score iter 2 close: 2.5/10** (1 ✅ confermato + 1 ✅ nuovo box 5 + WARN box 4,8,9 + 1.5/10 → 2.5/10).

---

## 2. Sprint S iter 3 Architecture

### 2.1 5-Agent team OPUS Pattern S (file ownership rigid)

| Agent | Role | File ownership | Skills/Connectors |
|-------|------|----------------|-------------------|
| **planner-opus** | Decompone task atomici, assignment messages | `automa/tasks/pending/`, `automa/tasks/done/`, `automa/team-state/sprint-contracts/`, `automa/team-state/messages/` | superpowers:writing-plans, superpowers:brainstorming, agent-orchestration:multi-agent-optimize, agent-teams:team-delegate |
| **architect-opus** | ADR + system design (read-only su src/) | `docs/architectures/`, `docs/adrs/`, `docs/strategy/` | engineering:architecture, engineering:system-design, design:design-system, agent-orchestration:improve-agent |
| **generator-app-opus** | Implementa src + supabase + edge fns + scripts/openclaw + TDD red-green | `src/**`, `supabase/**`, `scripts/openclaw/**` | superpowers:test-driven-development, backend-development:feature-development, agent-teams:team-feature |
| **generator-test-opus** | Test isolation + CoV + bench | `tests/**`, `scripts/openclaw/*.test.ts`, `scripts/bench/**` | superpowers:test-driven-development, full-stack-orchestration:test-automator, agent-teams:team-review |
| **scribe-opus** | Audit + sunti + Wiki L2 + handoff + CLAUDE.md | `docs/audits/`, `docs/sunti/`, `docs/handoff/`, `docs/unlim-wiki/`, `CLAUDE.md` | engineering:documentation, claude-md-management:revise-claude-md, claude-md-management:claude-md-improver |

### 2.2 Comunicazione tra agenti

**Filesystem message passing** (NO Slack, NO Telegram):

```
automa/team-state/messages/<from>-to-<to>-<YYYYMMDD-HHMMSS>.md
automa/team-state/sprint-contracts/sprint-S-iter-N-contract.md
automa/team-state/handoffs/iter-N-to-iter-N+1.md
```

Format YAML frontmatter:
```yaml
---
from: planner-opus
to: generator-app-opus
ts: 2026-04-27T<HHMMSS>
sprint: S-iter-N
priority: P0|P1|P2
blocking: false
---
## Task
[atomic task description]
## Dependencies
- waits: [list pending blockers]
- provides: [list outputs for next agent]
## Acceptance criteria
- [ ] CoV 3x test PASS
- [ ] file ownership respected
- [ ] [task-specific criteria]
```

### 2.3 Pattern iter Sprint S iter 3+

```
ITER N (each iter):
1. orchestrator (Claude main session):
   a. Read team-state/sprint-contracts/sprint-S-iter-N-contract.md
   b. Dispatch 5 agents in parallel via Agent tool calls (single message multi tool_use)
2. Each agent:
   a. Read assigned task message
   b. Work on file ownership rigid
   c. CoV 3x verification:
      - npx vitest run (target 12532+ PASS)
      - npm run build (PASS exit 0)
      - baseline preservation
   d. Write completion message to next agent OR scribe
3. Orchestrator post-agents:
   a. /quality-audit comprehensive
   b. CoV finale: 3x verify
   c. Commit + push branch (no main, naming feat/sprint-s-iter-N-...)
   d. Audit doc iter N via scribe-opus
4. EVERY 4 iter (4, 8, 12, 16, 20, 24...):
   a. Stress test Playwright (load via ToolSearch) + Control Chrome MCP
   b. Test E2E user flow on https://www.elabtutor.school production
   c. Audit doc stress
5. PROMISE check SPRINT_S_COMPLETE 10 boxes:
   - SE 10/10 TRUE → output <promise>SPRINT_S_COMPLETE</promise>
   - ELSE continue iter N+1
```

### 2.4 Stress test ogni 4 iter

| Iter | Scope stress test |
|------|-------------------|
| 4 | Smoke prod URL HTTP 200 + Lavagna load + UNLIM chat 5 prompts |
| 8 | E2E user flow (login chiave → Capitolo → exp1 → modifica circuito → UNLIM diagnose) |
| 12 | RAG retrieval verify (chiede UNLIM concept → check Vol/pag citation accuracy vs PDF) |
| 16 | TTS+STT live (Coqui voice + Whisper transcribe round-trip) |
| 20 | Onnipotence: 80-tool dispatcher Stress (chiama 10 tool sequenziali) |
| 24+ | Repeat scenari edge (off-topic, deep-question, safety-warning) |

**Tools** (load via ToolSearch each iter):
- `mcp__plugin_playwright_playwright__browser_*` (navigate, snapshot, click, evaluate, take_screenshot, console_messages)
- `mcp__Control_Chrome__*` (alternative browser MCP)

### 2.5 SPRINT_S_COMPLETE definition (10 boxes)

1. ✅ VPS GPU deployed (RunPod RTX A6000 minimum, Hetzner GEX130 future)
2. ✅ 7-component stack live (Ollama+Qwen-VL + BGE-M3 + reranker + Coqui XTTS-v2 + Whisper Turbo + FLUX.1 lazy + ClawBot stub)
3. ✅ 6000+ RAG chunks Anthropic Contextual Retrieval ingested + Supabase pgvector
4. ✅ 100+ Wiki LLM concepts compiled (Mac Mini overnight + Tea async)
5. ✅ UNLIM synthesis prompt v3 wired production unlim-chat (DONE iter 2 ✅)
6. ✅ Hybrid RAG live: BM25 + BGE-M3 + RRF k=60 + bge-reranker-large + top-5 to LLM
7. ✅ Vision flow live (Qwen2.5-VL OR Qwen3-VL-32B vede simulator screenshot + ragiona)
8. ✅ TTS+STT Italian working (Coqui XTTS-v2 voice clone Andrea + Whisper Turbo)
9. ✅ Sprint R5 stress test 50 prompts pass rate ≥90% (Sprint R0 fixture + scorer ready)
10. ✅ ClawBot Sprint 6 Day 39 dispatcher 80 tools live (post Sprint R5 PASS gate)

---

## 3. RunPod cost discipline (CRITICAL — smart on/off mechanism)

### 3.1 Stato pod

```bash
export ELAB_RUNPOD_POD_ID="5ren6xbrprhkl5"
export RUNPOD_SSH_HOST="38.147.83.24"
# Port cambia ogni resume — query state prima:
bash scripts/runpod-status.sh $ELAB_RUNPOD_POD_ID
```

### 3.2 Resume + work + stop pattern

```bash
# 1. Resume pod (~2min boot)
bash scripts/runpod-resume.sh $ELAB_RUNPOD_POD_ID

# 2. Get new SSH port from status
SSH_PORT=$(bash scripts/runpod-status.sh $ELAB_RUNPOD_POD_ID | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['data']['pod']['runtime']['ports']:
  if p['privatePort'] == 22:
    print(p['publicPort']); break")

# 3. SSH and work
ssh -i ~/.ssh/id_ed25519_runpod -p $SSH_PORT root@$RUNPOD_SSH_HOST

# 4. Stop pod IMMEDIATELY post-task
bash scripts/runpod-stop.sh $ELAB_RUNPOD_POD_ID
```

### 3.3 Cost rules

- RUNNING $0.49/h × tempo lavoro EFFETTIVO
- EXITED $13/mo storage 130GB volume (modelli persisti)
- TERMINATED $0 ma volume eliminato (modelli da re-scaricare ~50GB)
- **Rule**: STOP pod IMMEDIATO post-task. Resume on-demand quando bench/test serve.
- **Auto-stop after marker**: `bash scripts/runpod-auto-stop-after.sh $POD_ID /workspace/.bench-done`

### 3.4 Hetzner GEX130 commit trigger

€838/mo (€10k/year) commit SOLO quando 3+ paying schools confermate. Fino a quel punto: RunPod on/off (~$10-50/mese stimato).

---

## 4. Stack v3 setup completo (lessons learned iter 2)

### 4.1 Bug noti + workarounds

1. **dockerArgs override SSH bug**: NON settare `dockerArgs: "bash -c 'sleep infinity'"` in pod create — disabilita SSHD startup. Lascia default RunPod entrypoint che setup SSH via PUBLIC_KEY env.

2. **zstd missing pre-Ollama**: Bootstrap script step 2 fail. Fix: `apt-get install -y zstd` PRIMA `curl ollama install`.

3. **transformers 5.6.2 incompatible FlagEmbedding**: BGE-M3 import error TrainingArguments. Fix: `pip install --ignore-installed "transformers==4.46.3"` (NOT latest).

4. **Coqui XTTS-v2 blinker uninstall fail**: distutils package conflict. Fix: `pip install --ignore-installed blinker TTS`.

5. **Container disk 30GB tight**: Use 80GB+ container OR symlink `/root/.local/share/tts → /workspace`.

### 4.2 Bootstrap sequence corretta (per next iter)

```bash
# Stack v3 install order (verified iter 2):
ssh root@pod 'bash -c "
apt-get update && apt-get install -y zstd ffmpeg lspci  # FIX 1+5
curl -fsSL https://ollama.com/install.sh | sh
OLLAMA_HOST=0.0.0.0:11434 nohup ollama serve > /workspace/ollama.log 2>&1 &
ollama pull qwen2.5:7b qwen2.5vl:7b
pip install --ignore-installed transformers==4.46.3 blinker TTS faster-whisper FlagEmbedding sentence_transformers
# Start servers (background)
nohup python3 /workspace/embed_server.py > /workspace/embed.log 2>&1 &     # port 8080
nohup python3 /workspace/whisper_server.py > /workspace/whisper.log 2>&1 & # port 9000  
nohup python3 /workspace/tts_server.py > /workspace/tts.log 2>&1 &         # port 8881
nohup python3 /workspace/clawbot_stub.py > /workspace/clawbot.log 2>&1 &   # port 8000
"'
```

### 4.3 7-component stack endpoints (post-bootstrap)

```
LLM/VLM:    http://${POD_IP}:60639  (Ollama port 11434, Qwen2.5 + Qwen2.5-VL)
Embed:      http://${POD_IP}:60635  (BGE-M3 port 8080, Flask + FlagEmbedding)
Reranker:   http://${POD_IP}:60636  (bge-reranker-large port 8081, FlagReranker)
STT:        http://${POD_IP}:60638  (Whisper Turbo port 9000, faster-whisper)
TTS:        http://${POD_IP}:60637  (Coqui XTTS-v2 port 8881)
Image gen:  http://${POD_IP}:60634  (FLUX.1 Schnell port 7860, Sprint 7+ defer)
ClawBot:    http://${POD_IP}:60634  (dispatcher port 8000, stub iter 3 → 80-tool Sprint 6 Day 39)
```

---

## 5. Together AI fallback wire-up (Sprint S iter 3 priority)

### 5.1 Architecture

```
Primary: VPS GPU RunPod RTX A6000 (Qwen2.5-VL EU)
   ↓ (if down OR latency >5s)
Fallback 1: Gemini EU (existing transitional)
   ↓ (if down)
Fallback 2: Together AI gated (per Sprint 5 canUseTogether)
   - mode: emergency_anonymized
   - require: NOT student_mode AND 2+ EU providers down
   - log: together_audit_log Supabase
   - PII anonymization heuristic (defer real Italian NER iter 5+)
```

### 5.2 Implementation (gen-app-opus Task iter 3)

**File**: `supabase/functions/_shared/llm-client.ts`

Add `callLLMWithFallback(request)` chain:
1. Try `callRunPod(request)` if VPS_GPU_URL env set
2. Try `callGemini(request)` (existing)
3. Try `callTogether(request)` IF `canUseTogether(request, providersDown)`
4. Return error chain with last failure

**File**: `scripts/openclaw/together-teacher-mode.ts` (existing scaffold) — wire production.

**File**: `supabase/functions/_shared/anonymize.ts` (NEW) — heuristic PII strip:
- Email regex
- Phone regex IT
- Italian name patterns (defer to iter 5 NER)

**Audit log table**: existing `together_audit_log` Supabase (verify schema).

### 5.3 Together API key

✅ GIÀ in Supabase secrets (Andrea fornita iter 1). Accessibile via `Deno.env.get("TOGETHER_API_KEY")`.

---

## 6. Mac Mini autonomous setup + use (CRITICAL — riferimento per Andrea)

### 6.1 Stato corrente

- **Hardware**: Mac Mini M4 16GB Strambino (Tailscale `100.124.198.59`)
- **launchctl**: `com.elab.mac-mini-autonomous-loop` PID 23944 LIVE H24
- **Claude Code CLI** installato + OAuth token persistent
- **Repo cloned**: `~/Projects/elab-tutor`
- **Scripts**:
  - `~/scripts/elab-wiki-batch-gen.sh` (v1, deprecato)
  - `~/scripts/elab-wiki-batch-gen-v2.sh` (v2 volumi-anchored ATTIVO)

### 6.2 SSH access (CRITICAL — MacBook only)

```bash
# Da MacBook Andrea SOLO (id_ed25519_elab MAI archive):
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59
```

Mac Mini ha SOLO `~/.ssh/authorized_keys` (public key MacBook). NON HA private keys.

### 6.3 Dispatch wiki batch v2 volumi-anchored

```bash
# Lista 5 concept kebab-case (NO camelCase, NO accenti, NO underscore):
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'rm -f ~/.elab-batch-result && nohup ~/scripts/elab-wiki-batch-gen-v2.sh \
   "concept-1 concept-2 concept-3 concept-4 concept-5" \
   > /tmp/batch.log 2>&1 & disown'

# Poll until DONE:
until ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
    'test -f ~/.elab-batch-result' 2>/dev/null; do sleep 60; done

# Pull results:
for c in concept-1 concept-2 ...; do
  scp -i ~/.ssh/id_ed25519_elab \
    progettibelli@100.124.198.59:~/Projects/elab-tutor/docs/unlim-wiki/concepts/$c.md \
    /tmp/$c.md
done
```

### 6.4 Naming convention CRITICAL (Q4 SCHEMA)

- ✅ `corrente-continua.md`, `delay-millis.md`, `loop-arduino.md`
- ❌ `analogRead.md`, `delayMillis.md`, `loopArduino.md`, `Corrente_Continua.md`

Pre-commit hook valida `tests/unit/wiki/wiki-concepts.test.js`.

### 6.5 v2 script behavior (volumi-anchored)

- Auto checkout `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` (volumi-text vive su feature branch)
- Per ogni concept: `grep -B5 -A25 -i "$CONCEPT_SEARCH" volumi-text/vol{1,2,3}.txt`
- Inject estratto come PRIMARY SOURCE in claude --print prompt
- Fallback: `source_status: general_knowledge_only` se no match

### 6.6 Concept candidates remaining (59 → 100)

Per arrivare a 100+ wiki concepts:
- Arduino code: `if-condizionali` `while-loop` `for-loop` `array` `funzioni-arduino` `return-arduino` `digitalRead` `serialPrint` `pinMode`
- Componenti: `transistor-saturazione` `transistor-cutoff` `diodo-zener` `transistor-pnp` `condensatore-ceramico` `led-giallo` `oscilloscopio` (in flight v2 batch iter 24)
- Concetti: `watt-potenza` `frequenza` `periodo` `onda-quadra` `onda-sinusoidale` `decibel` `impedenza` `capacita` `induttanza` `terra-impianto` `schermatura`
- Misure: `misurare-tensione` `misurare-corrente` `misurare-resistenza` `oscilloscopio`
- Sicurezza: `sicurezza-elettrica` `isolamento` `fasi-neutro` `dispositivo-residuo`

---

## 7. Voice clone Andrea (sandbox block — instruzioni)

### 7.1 Stato

❌ `Senza nome 2.m4a` 3.6MB in `~/Downloads` BLOCKED da macOS sandbox per Claude Code (cp/file/Read tool refused).

### 7.2 Workaround (Andrea action obbligatoria pre-iter-3 box 8)

```bash
# Andrea esegue SU MACBOOK:
cp ~/Downloads/"Senza nome 2.m4a" /tmp/voice-andrea.m4a
chmod 644 /tmp/voice-andrea.m4a
ls -la /tmp/voice-andrea.m4a  # verify presence

# Una volta presente, Claude può:
# 1. Convert m4a → wav 22050Hz mono per Coqui XTTS-v2
# 2. ffmpeg -i /tmp/voice-andrea.m4a -ar 22050 -ac 1 /tmp/voice-andrea.wav
# 3. SCP a pod /workspace/speaker_default.wav
# 4. Coqui auto-switch (per CLAUDE.md rule: file >10KB)
```

### 7.3 Default fallback

UNLIM voice profile **Tammy Grit** (XTTS-v2 built-in, gentle female mid-tone calm-warm) — accettabile finché voice clone Andrea pronto.

---

## 8. GitHub Copilot + Actions strategy (Andrea richiesta)

### 8.1 GitHub Actions (CI/CD automation)

**Already in place** (per CLAUDE.md):
- Pre-commit hook (baseline test check 12532 PASS gate)
- Pre-push hook (baseline + build)
- Branch protection main
- Auto-deploy Vercel su PR merge

**Add Sprint S iter 3+**:

```yaml
# .github/workflows/wiki-concept-validation.yml
name: Wiki Concept Validation
on:
  pull_request:
    paths: ['docs/unlim-wiki/concepts/**.md']
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx vitest run tests/unit/wiki/wiki-concepts.test.js
      - name: Q4 SCHEMA + PRINCIPIO ZERO check
        run: node scripts/bench/score-unlim-quality.mjs --baseline scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl

# .github/workflows/sprint-s-iter-audit.yml
name: Sprint S Iter Audit
on:
  push:
    branches: ['feat/sprint-s-iter-*']
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - name: CoV 3x baseline
        run: |
          for i in 1 2 3; do
            npx vitest run > /tmp/cov-$i.log
            grep -E "Tests" /tmp/cov-$i.log
          done
      - name: Quality audit
        run: node scripts/benchmark.cjs --write
      - uses: actions/upload-artifact@v4
        with:
          name: sprint-s-audit-${{ github.run_id }}
          path: automa/state/benchmark.json
```

### 8.2 GitHub Copilot

**Limited use case ELAB**:
- Andrea solo dev, prefers Claude Code
- Copilot useful for autocomplete tests/scripts boilerplate
- NOT replace Claude Code agents

**Optional integration** (defer Sprint S iter 5+):
- Enable Copilot su Andrea VS Code (paid)
- Use for boilerplate snippets only
- Claude Code remains primary AI dev assistant

### 8.3 Mac Mini self-hosted GitHub runner (Livello 4 deferred)

Per `docs/pdr/PDR-MAC-MINI.md`:

```bash
# On Mac Mini (Andrea action one-time):
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.319.1/actions-runner-osx-arm64-2.319.1.tar.gz
tar xzf actions-runner.tar.gz
./config.sh --url https://github.com/AndreaMarro/elab-tutor --token <REGISTRATION_TOKEN>
./svc.sh install
./svc.sh start
```

Speedup CI 3-5x for heavy jobs (vitest 12k tests, build 60s).

---

## 9. Activation prompt + string Sprint S iter 3

### 9.1 Session start guide (Andrea legge step-by-step)

```
================================================================
ELAB SPRINT S ITER 3 — RALPH LOOP 5-AGENT OPUS DEFINITIVO
================================================================

STEP 1 — Apri Claude Code MacBook:
  cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

STEP 2 — Verifica Mac Mini autonomous attivo:
  ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
  # Atteso: <PID> 0 com.elab.mac-mini-autonomous-loop

STEP 3 — Carica credentials:
  source ~/.elab-credentials/sprint-s-tokens.env
  echo "RUNPOD: ${RUNPOD_API_KEY:0:10}..."
  echo "CF: ${CLOUDFLARE_API_TOKEN:0:10}..."
  echo "HF: ${HUGGINGFACE_TOKEN:0:10}..."

STEP 4 — Verifica voice clone (CRITICAL per box 8):
  ls -la /tmp/voice-andrea.m4a 2>&1
  # Se "No such file": cp ~/Downloads/"Senza nome 2.m4a" /tmp/voice-andrea.m4a

STEP 5 — Pod state check:
  bash scripts/runpod-status.sh 5ren6xbrprhkl5
  # Atteso: status=EXITED OR RUNNING

STEP 6 — IF EXITED, resume pod (~2min boot):
  bash scripts/runpod-resume.sh 5ren6xbrprhkl5

STEP 7 — Get new SSH port:
  bash scripts/runpod-status.sh 5ren6xbrprhkl5 | grep -A1 '"privatePort": 22'
  # Annota publicPort per SSH

STEP 8 — Conferma con Andrea: "Pronto Sprint S iter 3 ralph loop. Activate?"

STEP 9 — Paste activation string §9.2 in chat dopo conferma Andrea.
================================================================
```

### 9.2 ACTIVATION STRING (paste-ready Sprint S iter 3)

```
/ralph-loop /caveman Sprint S iter 3 onniscenza onnipotenza definitiva. 5-agent team OPUS Pattern S (planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus) communicanti via automa/team-state/messages/<from>-to-<to>-<TS>.md. CoV per ogni agente prima ogni claim fatto (vitest 12532+ PASS, npm run build PASS, baseline preserved). /quality-audit orchestratore fine ogni iter. Stress test ogni 4 iter Playwright + Control Chrome MCP su https://www.elabtutor.school production (iter 4=smoke prod URL+console errors, iter 8=E2E flow login+Capitolo+exp+UNLIM, iter 12=RAG retrieval verify Vol/pag accuracy, iter 16=TTS+STT live Coqui+Whisper round-trip, iter 20=80-tool dispatcher 10 sequential). Mac Mini autonomous H24 PID 23944 launchctl continua wiki batch v2 volumi-anchored (current 59/100 toward 100+ kebab-case lowercase). VPS GPU RunPod RTX A6000 48GB pod 5ren6xbrprhkl5 $0.49/h SMART ON/OFF discipline (resume ~2min boot, stop IMMEDIATO post-task, $13/mo storage 130GB modelli persisti). Hetzner GEX130 €838/mo commit SOLO quando 3+ paying schools. RAG 6000 chunks Anthropic Contextual Retrieval ingest via RunPod GPU embedding ~$2 one-time. Hybrid RAG BM25 + BGE-M3 + RRF k=60 + bge-reranker-large + top-5 to LLM. Together AI fallback gated emergency_anonymized canUseTogether NOT student_mode + 2 EU providers down audit log together_audit_log. Together API key già in Supabase secrets wired supabase/functions/_shared/llm-client.ts (wire callLLMWithFallback chain iter 3). UNLIM synthesis prompt v3 GIÀ DEPLOYED prod elab-unlim Edge Function (iter 2 commit a22b24d). R0 baseline 75.81% WARN misurato iter 2 — re-run R0 iter 3 priority misura delta post-deploy v3 (atteso lift dramatic plurale_ragazzi 0/10→7+/10). UNLIM voice profile Tammy Grit XTTS-v2 built-in default — auto-switch a voice clone quando /workspace/speaker_default.wav esiste >10KB (Andrea cp /tmp/voice-andrea.m4a sandbox pre-step). ClawBot 80-tool dispatcher Sprint 6 Day 39 post Sprint R5 PASS gate ≥90% scheletro UNLIM. SSH key id_ed25519_elab SOLO MacBook locale MAI GitHub MAI archive. SSH key id_ed25519_runpod dedicated RunPod. NO main push diretto. NO merge senza Andrea. Auto-deploy permission GRANTED IF R5 stress test ≥90% PASS. Pattern S 5-agent file ownership rigid: planner-opus owns automa/tasks+sprint-contracts+messages, architect-opus owns docs/architectures+adrs+strategy, generator-app-opus owns src+supabase+scripts/openclaw, generator-test-opus owns tests+scripts/openclaw/*.test.ts+scripts/bench, scribe-opus owns docs/audits+sunti+handoff+unlim-wiki+CLAUDE.md. Promise check SPRINT_S_COMPLETE 10 boxes ogni iter (1.VPS GPU deployed ✅ 2.7-component stack live ⚠️ 2/7 3.6000 RAG chunks ❌ 4.59/100 wiki ⚠️ 5.UNLIM v3 wired prod ✅ 6.Hybrid RAG ❌ 7.Vision flow ❌ 8.TTS+STT IT ⚠️ STT OK 9.R5 ≥90% ⚠️ R0 75.81% 10.ClawBot 80-tool ❌). Iter 2 close 2.5/10 box. Bug noti workaround: NO dockerArgs sleep infinity (kill SSHD), apt install zstd PRE Ollama, pip --ignore-installed transformers==4.46.3 + blinker (FlagEmbedding compat), 80GB+ container disk (Coqui safety). Output <promise>SPRINT_S_COMPLETE</promise> SOLO quando 10/10 TRUE verificati. Mai falso promise per uscire loop. Caveman mode ON chat replies caveman, code/commits normal language. Massima onesta zero compiacenza zero inflation score. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE
```

### 9.3 Per-iter prompt template (orchestrator dispatch wave)

```
ITER N — orchestrator dispatch wave

Tasks for this iter (from automa/team-state/sprint-contracts/sprint-S-iter-N-contract.md):

1. planner-opus: [task]
   → file ownership: automa/tasks/, automa/team-state/sprint-contracts/+messages
   → skills: superpowers:writing-plans, agent-orchestration:multi-agent-optimize, agent-teams:team-delegate

2. architect-opus: [task]
   → file ownership: docs/architectures/, docs/adrs/, docs/strategy/
   → skills: engineering:architecture, engineering:system-design, agent-orchestration:improve-agent

3. generator-app-opus: [task]
   → file ownership: src/, supabase/, scripts/openclaw/
   → skills: superpowers:test-driven-development, backend-development:feature-development, agent-teams:team-feature

4. generator-test-opus: [task]
   → file ownership: tests/, scripts/openclaw/*.test.ts, scripts/bench/
   → skills: superpowers:test-driven-development, full-stack-orchestration:test-automator, agent-teams:team-review

5. scribe-opus: [task]
   → file ownership: docs/audits/, docs/sunti/, docs/handoff/, docs/unlim-wiki/, CLAUDE.md
   → skills: engineering:documentation, claude-md-management:revise-claude-md, claude-md-management:claude-md-improver

Execution:
- Single message with 5 Agent tool calls (parallel) — model: "opus" each
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

## 10. Documenti riferimento (lettura obbligatoria iter 3)

### 10.1 Strategy + state docs (lettura sequenziale prime 10)

1. `CLAUDE.md` ← contesto base aggiornato iter 2 close
2. `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` ← QUESTO doc MASTER
3. `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md` ← iter 2 PDR
4. `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md` ← Sprint S originale
5. `docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md` ← session start guide originale
6. `docs/handoff/2026-04-26-sprint-s-iter2-handoff.md` ← iter 2 → iter 3 handoff
7. `docs/handoff/2026-04-26-ralph-loop-handoff.md` ← consolidato iter 1-7 originale
8. `docs/audits/2026-04-26-sprint-s-iter2-audit.md` ← iter 2 close (12 honesty caveats, score 2.0/10)
9. `docs/audits/2026-04-26-sprint-s-iter1-FINAL-AUDIT.md` ← iter 1 close
10. `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md` ← stack v3 definitivo

### 10.2 ADR + design

11. `docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md` (architect-opus iter 2)
12. `docs/adrs/ADR-009-principio-zero-validator-middleware.md` (architect-opus iter 2)
13. `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` ← master plan v2

### 10.3 Mac Mini setup + management

14. `docs/audits/2026-04-25-c1-mac-mini-setup-validation.md` ← Mac Mini setup process
15. `docs/infra/MAC-MINI-LIVELLO-1-AUTONOMOUS-SETUP.md` ← SSH + commands reference
16. `automa/wiki-context/elab-wiki-batch-gen-v2.sh` ← script v2 volumi-anchored
17. `automa/wiki-context/volumi-text/vol{1,2,3}.txt` ← 8190 righe volumi extracted

### 10.4 RunPod scripts + bug-fixed bootstrap

18. `scripts/runpod-pod-create.sh` ← create pod (NO dockerArgs override applicato iter 2 fix)
19. `scripts/runpod-resume.sh` ← resume pod (~2min boot)
20. `scripts/runpod-stop.sh` ← stop pod (cost saving)
21. `scripts/runpod-status.sh` ← query state + ports
22. `scripts/runpod-auto-stop-after.sh` ← marker-watch + auto stop
23. `scripts/runpod-bootstrap.sh` ← full stack provisioner (310 lines, BUG zstd manuale fix iter 2)
24. `scripts/runpod-r0-bench.mjs` ← R0 benchmark harness RunPod
25. `scripts/bench/run-sprint-r0-render.mjs` ← R0 baseline runner Render endpoint (iter 2 LIVE 75.81% WARN)

### 10.5 Sprint R + UNLIM

26. `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` ← 10 prompts R0 baseline
27. `scripts/bench/score-unlim-quality.mjs` ← 12 PZ rules scorer
28. `supabase/functions/_shared/system-prompt.ts` ← BASE_PROMPT v3 (iter 2 deployed prod)
29. `supabase/functions/_shared/capitoli-loader.ts` ← buildCapitoloPromptFragment (+131 lines iter 2)
30. `supabase/functions/_shared/principio-zero-validator.ts` ← validatePrincipioZero (NEW iter 2)
31. `supabase/functions/unlim-chat/index.ts` ← wire-up Capitolo + post-LLM PZ validation (iter 2)

### 10.6 OpenClaw / ClawBot scheletro UNLIM

32. `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md` ← Sprint 6 Day 39 plan
33. `scripts/openclaw/tools-registry.ts` ← 52→80 ToolSpec
34. `scripts/openclaw/morphic-generator.ts` ← L1+L2+L3 composition
35. `scripts/openclaw/pz-v3-validator.ts` ← Principio Zero v3 enforcement
36. `scripts/openclaw/tool-memory.ts` ← Supabase pgvector cache
37. `scripts/openclaw/state-snapshot-aggregator.ts` ← orchestratore parallelo
38. `scripts/openclaw/together-teacher-mode.ts` ← GDPR-gated fallback (legacy, riusa per Together AI)

### 10.7 Tea + UNLIM vision

39. `docs/tea/2026-04-26-tea-claude-brief.md` ← 9 task creative Tea
40. `automa/context/UNLIM-VISION-COMPLETE.md` ← visione completa prodotto
41. `automa/context/GALILEO-CAPABILITIES.md` ← 26+ azioni mappa

---

## 11. Skills mappa Sprint S iter 3

### 11.1 Always-on (load first iter 3)

- `superpowers:using-superpowers` (entry, MANDATORY)
- `ralph-loop:ralph-loop` (loop framework)
- `superpowers:writing-plans` (PDR generation)
- `agent-orchestration:multi-agent-optimize` (5-agent core)
- `quality-audit` (orchestrator fine iter)

### 11.2 Per agente (load on demand)

- **planner-opus**: `superpowers:brainstorming`, `superpowers:writing-plans`, `agent-orchestration:multi-agent-optimize`, `agent-teams:team-delegate`
- **architect-opus**: `engineering:architecture`, `engineering:system-design`, `design:design-system`, `agent-orchestration:improve-agent`
- **generator-app-opus**: `superpowers:test-driven-development`, `backend-development:feature-development`, `agent-teams:team-feature`
- **generator-test-opus**: `superpowers:test-driven-development`, `full-stack-orchestration:test-automator`, `agent-teams:team-review`
- **scribe-opus**: `engineering:documentation`, `claude-md-management:revise-claude-md`, `claude-md-management:claude-md-improver`

### 11.3 Per stress test (iter 4, 8, 12, 16, 20)

- Load via ToolSearch each iter:
  - `mcp__plugin_playwright_playwright__browser_*` (navigate, snapshot, click, evaluate, take_screenshot, console_messages)
  - `mcp__Control_Chrome__*` (alternative browser MCP)
- `engineering:testing-strategy` (skill orchestratore stress test)

### 11.4 Per quality audit fine iter

- `quality-audit` (orchestrator)
- `superpowers:verification-before-completion`
- `claude-md-management:claude-md-improver`

### 11.5 NEW skill ideas (Andrea may create iter 3+)

#### Skill: `elab-pod-recreate`
Bake-in tutti i bug fixes iter 2: NO dockerArgs override + apt zstd pre-Ollama + transformers==4.46.3 + blinker --ignore-installed + 80GB container.

```yaml
name: elab-pod-recreate
description: Recreate RunPod pod with stack v3 best practices baked in. Avoids dockerArgs SSH bug, transformers compat issue, Coqui blinker conflict.
trigger: "recreate pod" OR "new runpod" OR "pod fresh"
inputs: gpu_type (default RTX A6000)
steps:
  1. Validate RUNPOD_API_KEY env var
  2. Inject PUBLIC_KEY env in pod create payload
  3. NO dockerArgs override (use default RunPod entrypoint)
  4. Container 80GB + volume 50GB
  5. Wait SSH ready ~2-3min
  6. Run bootstrap with apt install zstd FIRST
  7. pip install --ignore-installed transformers==4.46.3 blinker TTS faster-whisper FlagEmbedding
  8. Start servers (Ollama, Whisper, Coqui, BGE-M3, ClawBot stub)
  9. Health check 5/7 endpoints
  10. Output pod ID + SSH endpoint + endpoint URLs
```

#### Skill: `elab-r0-rerun-render`
Re-run Sprint R0 baseline su Render endpoint dopo deploy nuovi BASE_PROMPT version. Misura delta PZ score.

```yaml
name: elab-r0-rerun-render
description: Re-run Sprint R0 baseline 10 fixture prompts su Render production endpoint. Compare vs previous baseline (iter 2: 75.81% WARN). Output delta + verdetto WARN/PASS/FAIL.
trigger: "rerun R0" OR "R0 delta" OR "r0 measure post deploy"
steps:
  1. Verify Edge Function elab-unlim deployed latest
  2. Run scripts/bench/run-sprint-r0-render.mjs
  3. Score via score-unlim-quality.mjs
  4. Compare scores vs iter 2 baseline (75.81%)
  5. Generate audit doc with delta breakdown per rule
  6. Output verdetto WARN (70-84%) / PASS (≥85%) / FAIL (<70%)
```

#### Skill: `elab-mac-mini-batch-v2`
Wrapper Skill su `~/scripts/elab-wiki-batch-gen-v2.sh` Mac Mini volumi-anchored.

```yaml
name: elab-mac-mini-batch-v2
description: Dispatch wiki concept batch v2 volumi-anchored su Mac Mini autonomous. Validate kebab-case. Pull + commit results.
trigger: "wiki batch v2" OR "mac mini concept volumi" OR "dispatch batch"
inputs: list of concept names (kebab-case lowercase)
steps:
  1. Validate input kebab-case lowercase
  2. SSH dispatch v2 script
  3. Poll until batch result file exists (max 30min)
  4. SCP each new concept md local
  5. Validate Q4 SCHEMA + word count >300 + plurale + Vol/pag citations
  6. git add + commit + push branch
```

#### Skill: `elab-stack-bootstrap`
Bootstrap stack v3 in pod RunPod con tutti i workarounds.

```yaml
name: elab-stack-bootstrap
description: Bootstrap ELAB stack v3 in RunPod pod. Includes apt zstd fix, transformers compat fix, Coqui blinker fix. Verifies 5/7 endpoints healthy.
trigger: "bootstrap stack" OR "pod stack v3" OR "install stack"
inputs: pod_id, ssh_port
steps:
  1. SSH to pod
  2. apt-get install -y zstd ffmpeg lspci
  3. curl install Ollama + start serve
  4. ollama pull qwen2.5:7b qwen2.5vl:7b
  5. pip install --ignore-installed transformers==4.46.3 blinker TTS faster-whisper FlagEmbedding sentence_transformers
  6. SCP server scripts (embed, whisper, tts, clawbot stub)
  7. Start each server background
  8. Health check 5/7 endpoints
  9. Output endpoint URLs proxy
```

#### Skill: `elab-tres-jolie-curate`
Tea-driven curation Tres Jolie material per UNLIM context (FOTO + BOM + LOGO selection).

```yaml
name: elab-tres-jolie-curate
description: Tea curation pipeline per material Tres Jolie. Selezione foto demo + BOM components + LOGO branding. Output asset registry per UNLIM rendering.
trigger: "tres jolie curate" OR "tea asset selection"
steps:
  1. List ELAB - TRES JOLIE/ subdirs
  2. Categorize by Cap volume (1, 2, 3)
  3. Recommend top 5-10 foto per Cap
  4. Format WebP optimized
  5. Output docs/design/tres-jolie-asset-registry.md
```

---

## 12. Honesty caveats (10 esplicit)

1. **Pod recreate complex**: tre fix critici (no dockerArgs + zstd pre-Ollama + transformers compat) ancora manuali. Skill `elab-pod-recreate` defer iter 4+.
2. **R0 re-run iter 3 priority**: 75.81% WARN measured iter 2 SU Render OLD prompt. Post deploy v3 iter 2 dovrebbe lift dramatic — VERIFICA OBBLIGATORIA iter 3 prima ogni claim "v3 funziona".
3. **5-agent OPUS cost**: stima $30-100 per iter sostanzioso. 100 iter cap = $3-10k worst case. Andrea cost discipline rigorosa.
4. **Voice clone Andrea**: sandbox block PERSISTENTE iter 1+iter 2+iter 3. Andrea cp /tmp/voice-andrea.m4a OBBLIGATORIO o box 8 mai TRUE.
5. **Box 5 ✅ ma R0 NON verificato delta**: deploy success ≠ quality lift. Re-run R0 iter 3 obbligatorio per chiudere ciclo.
6. **Box 4 wiki 59/100 = 59%**: Mac Mini overnight rate ~3 concept/15min = 100 in 8h walltime distribuiti. Tea async parallel ridotto a 3-4 giorni.
7. **Box 6,7 hybrid RAG + vision flow**: dipendono BGE-M3 server + Qwen-VL prompt engineering. Non start iter 3 senza pod resume.
8. **Box 10 ClawBot 80-tool**: blocked Sprint 6 Day 39 post Sprint R5 PASS gate. Sprint R5 = iter 30+ stima.
9. **Tres Jolie material NON pedagogical**: ispezionato iter 23 = corporate/regulatory + foto + LOGO. Wiki concept generation usa SOLO volumi-text (correct per Andrea richiesta).
10. **Together AI fallback wire-up NOT done iter 2**: scaffold ready ma `callLLMWithFallback` chain non implementato. Iter 3 priority gen-app-opus task.

---

## 13. Cost discipline (smart on/off mechanism)

### 13.1 RunPod

- RUNNING $0.49/h × work session
- EXITED $13/mo storage 130GB
- Rule: STOP IMMEDIATO post-task

### 13.2 Mac Mini

- $0 marginal (Andrea Max sub paid)
- launchctl autonomous H24 — sempre on, no cost

### 13.3 Anthropic Claude Code

- Andrea Max sub: ~$X/mese
- 5-agent OPUS dispatch: significant token spend per iter
- Stima iter 3 sostanzioso: $30-100 per iter
- 100 iter cap: $3-10k worst case
- Mitigation: skip iter quando tutti box dipendono Andrea action (idle minimum check $0.05/iter)

### 13.4 Supabase + Vercel + Render

- Supabase free tier (Edge Function calls + Postgres + Auth)
- Vercel Pro paid (Analytics + Speed Insights + EU pinning)
- Render free (cold start 18s nanobot V2)

---

## 14. CLAUDE.md updates iter 2 close → iter 3

Updates applicate iter 2 close:
- Subsection "Iter 2 (26/04/2026 09:30-13:30 CEST)" aggiunta
- Box matrix updated 1.5/10 → 2.5/10
- Files Sprint S iter 2 listati (24+ file)
- Activation prompt rimando → handoff iter 2

Updates pending iter 3 (scribe-opus task fine iter 3):
- Subsection "Iter 3 (2026-04-27)" da aggiungere
- Box matrix update post iter 3 (target 5+/10)
- Files Sprint S iter 3 listati
- Activation prompt rimando → handoff iter 3

---

**File path**: `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md`
**Pairs with**: `docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md` (session start guide + setup)
**Activation**: §9 above (paste-ready)
**Honesty**: 10 caveats explicit
**Skill compliance**: writing-plans + documentation + agent-orchestration:multi-agent-optimize
**Caveman**: chat replies caveman; questo doc normal language per skill rules
