---
sprint: S
from_iter: 3
to_iter: 4
date: 2026-04-26
author: scribe-opus
status: FINAL (scribe deliverables)
---

# Sprint S iter 3 → iter 4 Handoff

> Handoff doc per Andrea + orchestrator: state at iter 3 close + activation string ralph loop iter 4 + setup guide + iter 4 priorities.
> Pairs with: `docs/audits/2026-04-26-sprint-s-iter3-audit.md`.

---

## 0. TL;DR (5 line)

1. Iter 3 work PARZIALE: Together fallback scaffold ✅ shipped, ADR-010+011 ❌, R0 re-run ❌, B2 migrations ❌.
2. Score iter 3 close ONESTO **3.4/10** (target 3.5+/10, miss -0.1).
3. Wiki count 59 → **61** (+2 by-hand scribe-opus: analog-write, if-else).
4. Iter 4 stress test mandatory (Playwright + Control Chrome MCP smoke prod).
5. Iter 4 P0: A1 R0 re-run Edge + C1 ADR-010 + B2 migrations apply.

---

## 1. State at iter 3 close (verified)

### 1.1 Test baseline + build

- Baseline file: `automa/baseline-tests.txt` = **12290** (unchanged iter 3, no test additions)
- Vitest atteso: ≥12532 PASS + 8 todo (preserved da iter 2 — gen-app together-fallback.ts NON aggiunge test, NON rompe nulla).
- Build atteso: PASS exit 0.
- **CoV finale**: orchestrator esegue + transcribe.

### 1.2 Branch state

```bash
git log --oneline -8
# fb83afa docs(sprint-s): iter 3 PDR + handoff + activation string + CLAUDE.md update
# 4695c88 fix(wiki): Mac Mini v2 script — checkout feature branch
# 611d25f feat(wiki): Mac Mini batch iter 16 — +4 (fade-led, semaforo, allarme, cronometro)
# f89b893 feat(wiki): Mac Mini batch v2 volumi-anchored — extract Vol1+Vol2+Vol3 text + script v2
# 8edb9d2 feat(wiki): Mac Mini batch iter 9 — +3 nuovi
# b00ef28 feat(sprint-s): iter 2 Task B — Modalità citazioni inline UI wire-up
# a22b24d feat(sprint-s): iter 2 SOFTWARE-only — UNLIM synthesis prompt v3
# 0af64c7 feat(sprint-s): iter 1 final — RunPod GPU trial
```

Iter 3 work UNCOMMITTED in working tree:
```bash
git status --short
# M automa/state/heartbeat
# M supabase/functions/_shared/llm-client.ts (re-exports +11 lines)
# ?? automa/tasks/pending/ATOM-S3-{A1,A2,B1,B2,B3,C1,C2,C3}-*.md (8 atoms)
# ?? automa/team-state/sprint-contracts/sprint-S-iter-3-contract.md
# ?? supabase/functions/_shared/together-fallback.ts (NEW 200 lines)
# (post scribe deliverables): docs/audits/2026-04-26-sprint-s-iter3-audit.md
# (post scribe deliverables): docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md
# (post scribe deliverables): docs/unlim-wiki/concepts/{analog-write,if-else}.md
# (post scribe deliverables): docs/unlim-wiki/{index,log}.md M
# (post scribe deliverables): CLAUDE.md M
```

### 1.3 Pod RunPod

- Pod corrente: `5ren6xbrprhkl5` RTX A6000 48GB
- Stato: EXITED throughout iter 3 (cost discipline)
- SSH endpoint cambia ogni resume
- Modelli persisteno volume 130GB ($13/mo storage)
- Resume: `bash scripts/runpod-resume.sh 5ren6xbrprhkl5` (~2min)

### 1.4 Mac Mini autonomous

- launchctl `com.elab.mac-mini-autonomous-loop` PID 23944 H24 (assumed running, NON verified iter 3 — scribe no SSH)
- SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab` (MacBook only)
- Wiki count local: **61** (+2 by-hand scribe iter 3, NO new Mac Mini batch SCP iter 3)
- Heartbeat NON verificato — orchestrator responsibility

### 1.5 Production deploy

- Frontend Vercel: `https://www.elabtutor.school` HTTP 200
- Edge Function elab-unlim: `unlim-chat` UNLIM v3 prompt LIVE (commit a22b24d iter 2)
- Render nanobot V2: `https://elab-galileo.onrender.com` (R0 75.81% WARN baseline iter 2)

### 1.6 SPRINT_S_COMPLETE 10 boxes (post iter 3)

| # | Box | Status iter 3 | Note |
|---|-----|---------------|------|
| 1 | VPS GPU deployed | ✅ (storage paid) | Pod EXITED |
| 2 | 7-component stack live | ⚠️ 5/7 | Pod resume needed |
| 3 | 6000 RAG chunks | ❌ | Depend GPU + B2 |
| 4 | 100+ Wiki concepts | ⚠️ **61/100** | +2 iter 3 |
| 5 | UNLIM v3 wired prod | ⚠️ R0 NON re-misurato | A1 NOT shipped |
| 6 | Hybrid RAG live | ❌ | Depend GPU |
| 7 | Vision flow live | ❌ | Depend GPU |
| 8 | TTS+STT IT | ⚠️ STT OK | Voice clone pending |
| 9 | R5 stress 50 prompts ≥90% | ⚠️ R0 75.81% | R5 fixture extension defer |
| 10 | ClawBot 80-tool | ❌ | Sprint 6 Day 39 |

**Score iter 3 close**: **3.4/10** (target 3.5+/10, miss -0.1).

---

## 2. SIMPLE SETUP GUIDE per Andrea (iter 4 next session)

### 2.1 STEP 1 — Apri terminal MacBook

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
```

### 2.2 STEP 2 — Verifica Mac Mini PID 23944

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
# Atteso: <PID> 0 com.elab.mac-mini-autonomous-loop
```

### 2.3 STEP 3 — Carica credentials

```bash
source ~/.elab-credentials/sprint-s-tokens.env
echo "RUNPOD: ${RUNPOD_API_KEY:0:10}..."
echo "SUPABASE: ${SUPABASE_ACCESS_TOKEN:0:10}..."
```

### 2.4 STEP 4 — Voice clone (sblocca box 8)

```bash
cp ~/Downloads/"Senza nome 2.m4a" /tmp/voice-andrea.m4a
chmod 644 /tmp/voice-andrea.m4a
ls -la /tmp/voice-andrea.m4a
```

### 2.5 STEP 5 — Pod state check

```bash
bash scripts/runpod-status.sh 5ren6xbrprhkl5
# Atteso JSON con desiredStatus: EXITED
```

### 2.6 STEP 6 — Resume pod IF stack work iter 4

```bash
# Solo se devi lavorare box 2,3,6,7,8:
bash scripts/runpod-resume.sh 5ren6xbrprhkl5
# ~2min boot
```

### 2.7 STEP 7 — Conferma a Claude

Type in chat: `Pronto Sprint S iter 4 ralph loop. Activate?`

### 2.8 STEP 8 — Paste activation string §3 sotto

---

## 3. ACTIVATION STRING (paste-ready iter 4)

```
/ralph-loop /caveman Sprint S iter 4 onniscenza onnipotenza definitiva. 5-agent OPUS Pattern S (planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus) communicating filesystem automa/team-state/messages/<from>-to-<to>-<TS>.md. CoV per agente prima ogni claim fatto (vitest 12532+ PASS, npm run build PASS, baseline preserved). /quality-audit orchestratore fine ogni iter. STRESS TEST iter 4 MANDATORY: Playwright + Control Chrome MCP smoke su https://www.elabtutor.school production (HTTP 200 + UNLIM 3 prompts + 0 console errors + screenshot docs/audits/iter8-stress-prod-<TS>.png). P0 iter 4: A1 R0 re-run Edge Function (scripts/bench/run-sprint-r0-edge.mjs NEW + 10 fixture identici + score JSON + report.md + delta vs 75.81% iter 2). C1 ADR-010 Together AI fallback design (architect-opus ~400 righe). B2 SQL migrations apply (openclaw_tool_memory + together_audit_log + RLS + GRANT). P1: B1 full callLLMWithFallback chain (RunPod → Gemini → Together gated, audit log row insert). C2 ADR-011 R5 stress fixture extension (50 prompts design, R0+40 hard). B3 wiki retriever offline integration test. Mac Mini autonomous H24 PID 23944 launchctl continua wiki batch v2 volumi-anchored (current 61/100 toward 100+ kebab-case lowercase). VPS GPU RunPod RTX A6000 48GB pod 5ren6xbrprhkl5 SMART ON/OFF discipline. Hetzner GEX130 €838/mo SOLO 3+ paying schools. Together API key Supabase secrets wired. UNLIM v3 prompt DEPLOYED prod (iter 2 commit a22b24d). R0 baseline 75.81% WARN iter 2 — re-run iter 4 atteso lift dramatic plurale_ragazzi 0/10→7+/10. UNLIM voice profile Tammy Grit XTTS-v2 default — auto-switch voice clone /workspace/speaker_default.wav >10KB. ClawBot 80-tool Sprint 6 Day 39 post R5 ≥90% gate. SSH key id_ed25519_elab SOLO MacBook locale MAI archive. id_ed25519_runpod dedicated RunPod. NO main push diretto. NO merge senza Andrea. Auto-deploy GRANTED IF R5 ≥90% PASS. Pattern S 5-agent file ownership rigid: planner-opus owns automa/tasks+sprint-contracts+messages, architect-opus owns docs/architectures+adrs+strategy, generator-app-opus owns src+supabase+scripts/openclaw, generator-test-opus owns tests+scripts/openclaw/*.test.ts+scripts/bench, scribe-opus owns docs/audits+sunti+handoff+unlim-wiki+CLAUDE.md. Promise check SPRINT_S_COMPLETE 10 boxes ogni iter (1.VPS GPU ✅ 2.Stack 5/7 ⚠️ 3.RAG ❌ 4.61/100 ⚠️ 5.UNLIM v3 deploy/R0 NOT re-misurato ⚠️ 6.Hybrid RAG ❌ 7.Vision ❌ 8.TTS+STT ⚠️ 9.R0 75.81% baseline ⚠️ 10.ClawBot ❌). Iter 3 close 3.4/10. Iter 4 target 4.0+/10. Output <promise>SPRINT_S_COMPLETE</promise> SOLO quando 10/10 TRUE verificati. Mai falso promise. Caveman ON chat replies, code/commits normal. Massima onestà zero compiacenza zero inflation. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE
```

---

## 4. Iter 4 P0 priorities

### 4.1 A1 R0 re-run Edge Function
- File: `scripts/bench/run-sprint-r0-edge.mjs` NEW (gen-test-opus)
- Endpoint: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
- Auth: `apikey: $SUPABASE_ANON_KEY` + `Authorization: Bearer $SUPABASE_ANON_KEY`
- Fixture: `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` (riusa)
- Output: `r0-edge-{report,responses,scores}-<TS>.{md,jsonl,json}`
- Verifica box 5 ✅ vs ⚠️.

### 4.2 C1 ADR-010 Together AI fallback design
- File: `docs/adrs/ADR-010-together-ai-fallback-design.md` NEW (architect-opus)
- ~400 righe.
- Block per gen-app B1 chain wire-up.

### 4.3 B2 SQL migrations apply
- Files: `supabase/migrations/2026-04-27_openclaw_tool_memory.sql` + `supabase/migrations/2026-04-27_together_audit_log.sql` (gen-app-opus)
- Schema match `together-fallback.ts` `logTogetherCall` row shape.
- RLS policies + GRANT.
- Block per audit log persistence.

### 4.4 R5 stress prompts execution prep
- Andrea decide trigger time (post B2 migration apply).
- Depend ADR-011 fixture extension.

### 4.5 Vision flow start
- Pod resume + Qwen2.5-VL deploy + screenshot diagnose test.
- Box 7.

### 4.6 ClawBot scaffold start
- `scripts/openclaw/dispatcher.ts` 80-tool registry skeleton.
- Sprint 6 Day 39 GATE Sprint R5 ≥90% PASS.
- Box 10.

---

## 5. Iter 4 file ownership (same Pattern S)

| Agent | Owns (write) | Reads (only) |
|-------|--------------|--------------|
| **planner-opus** | `automa/tasks/pending/ATOM-S4-*.md`, `automa/team-state/sprint-contracts/sprint-S-iter-4-contract.md`, `automa/team-state/messages/planner-*.md` | tutto |
| **architect-opus** | `docs/architectures/`, `docs/adrs/ADR-010-*.md`, `docs/adrs/ADR-011-*.md`, `docs/strategy/`, `automa/team-state/messages/architect-*.md` | `src/`, `supabase/`, `scripts/openclaw/` |
| **generator-app-opus** | `src/**`, `supabase/functions/_shared/llm-client.ts`, `supabase/migrations/*.sql`, `scripts/openclaw/**`, `automa/team-state/messages/gen-app-*.md` | `tests/`, `docs/` |
| **generator-test-opus** | `tests/**`, `scripts/openclaw/*.test.ts`, `scripts/bench/**`, `automa/team-state/messages/gen-test-*.md` | `src/`, `supabase/` |
| **scribe-opus** | `docs/audits/2026-04-26-sprint-s-iter4-audit.md`, `docs/sunti/`, `docs/handoff/2026-04-26-sprint-s-iter-4-to-iter-5.md`, `docs/unlim-wiki/`, `CLAUDE.md` (append iter 4 close), `automa/team-state/messages/scribe-*.md` | tutto |

---

## 6. Stress test iter 4 mandatory

```bash
# Playwright via plugin_playwright MCP:
# 1. Load https://www.elabtutor.school
# 2. browser_snapshot → verify Lavagna route
# 3. UNLIM chat 3 prompts: "ciao", "spiega Ohm", "che cos'è LED"
# 4. browser_console_messages → verify 0 errors
# 5. browser_take_screenshot → docs/audits/iter8-stress-prod-<TS>.png
# Output audit: docs/audits/2026-04-26-sprint-s-iter8-stress-smoke.md
```

---

## 7. Open blockers from iter 3

1. **ADR-010 + ADR-011 ASSENTI** — architect-opus iter 3 work incomplete
2. **R0 re-run NOT shipped** — gen-test ATOM-S3-A1 NON eseguito
3. **B1 callLLMWithFallback chain partial** — solo re-export, NO chain wire-up
4. **B2 migrations SQL NOT shipped** — `openclaw_tool_memory` + `together_audit_log` ASSENTI
5. **B3 wiki retriever test NOT shipped** — E2E corpus retrieve NON validato
6. **Mac Mini PID 23944 heartbeat NON verificato** — scribe no SSH access
7. **Pod 5ren6xbrprhkl5 EXITED** — resume on demand iter 4 quando pod work needed
8. **Voice clone Andrea sandbox blocked** — Andrea cp /tmp/voice-andrea.m4a manuale prerequisite

---

## 8. Mac Mini overnight target

While Andrea sleeps / iter 4 runs:

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'rm -f ~/.elab-batch-result && nohup bash -c "
~/scripts/elab-wiki-batch-gen-v2.sh \"while-loop for-loop array funzioni-arduino strutture-dati\"
sleep 30
~/scripts/elab-wiki-batch-gen-v2.sh \"watt-potenza frequenza periodo onda-quadra onda-sinusoidale\"
sleep 30
~/scripts/elab-wiki-batch-gen-v2.sh \"misurare-tensione misurare-corrente isolamento sicurezza-elettrica protezione-corto\"
" > /tmp/overnight-batch-iter4.log 2>&1 & disown'
```

Target overnight: 61 → 76+ concepts (76% verso 100+).

---

## 9. RunPod resume strategy iter 4

Resume SOLO se P0 iter 4 work needed pod GPU:
- A1 R0 re-run NON serve pod (Edge Function endpoint Supabase)
- B2 migrations NON serve pod
- C1+C2 ADR design NON serve pod
- → **Iter 4 può essere SOFTWARE-only** con pod EXITED. Resume defer iter 5+ quando RAG ingest 6000 chunks o Coqui TTS o Vision flow.

```bash
# IF pod resume needed iter 4:
bash scripts/runpod-resume.sh 5ren6xbrprhkl5
sleep 120  # boot 2min
bash scripts/runpod-status.sh 5ren6xbrprhkl5  # verify RUNNING
# Get new SSH port (cambia ogni resume)
```

---

## 10. Cost projection iter 4

| Item | Cost stima |
|------|-----------|
| RunPod RTX A6000 (skip iter 4 software-only) | ~$0 |
| RunPod storage continuo | $13/mo (ammortizzato) |
| Anthropic 5-agent OPUS dispatch ~iter 4 | $30-100 |
| Supabase free tier | $0 |
| Vercel Pro paid | already paid |
| Render free tier | $0 |
| Mac Mini overnight | $0 marginal |
| **Total iter 4 stima** | **$30-110** |

Cumulato Sprint S iter 1-4 ($100 iter 1 + $0 iter 2 + ~$50 iter 3 + ~$60 iter 4) = **~$210 totali**. Vs Hetzner GEX130 €838/mo = -75% saving.

---

## 11. Honesty caveats (10 explicit)

1. **Score iter 3 close 3.4/10** — miss target -0.1 punti. NO inflation. ADR-010 + ADR-011 + A1 R0 re-run + B1 chain + B2 migrations TUTTI mancanti.
2. **R0 quality lift CLAIM unmeasured** — deploy iter 2 ✅ ma R0 re-run iter 3 ❌. Box 5 STAYS ⚠️.
3. **Together fallback partial** — gate predicate + audit writer ✅, full chain wire-up ❌, audit table ❌. Production usage richiede B2 migration + B1 chain.
4. **Mac Mini iter 3 NO new batch** — wiki delta solo +2 by-hand scribe-opus. PID 23944 status NON verificato (no SSH dal scribe).
5. **CoV vitest + build NON eseguito da scribe** — file ownership rigid (read-only role).
6. **Pod 5ren6xbrprhkl5 EXITED throughout iter 3** — cost discipline OK ma block box 2,3,6,7,8.
7. **Iter 4 stress test smoke prod mandatory** — Playwright + Control Chrome MCP. NO defer.
8. **Voice clone Andrea pending da iter 1** — 4 iter consecutivi blocco. Box 8 stays ⚠️ fino Andrea cp manuale.
9. **5-agent OPUS cost iter 4 stima $30-100** — Andrea cap budget consigliato.
10. **Iter 5+ fixture R5 50 prompts** — design ADR-011 prerequisite. Iter 4 design + iter 5 execute.

---

**File path**: `docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md`
**Pairs with**: `docs/audits/2026-04-26-sprint-s-iter3-audit.md`
**Activation iter 4**: §3 above (paste-ready string)
**Setup**: §2 step-by-step Andrea
**Honesty**: 10 caveats explicit + 12 caveats audit
**Score iter 3 close**: 3.4/10 (target 3.5, miss -0.1)
**Score iter 4 target**: 4.0+/10
