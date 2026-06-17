# Ralph Loop Iteration 1 Audit

**Date**: 2026-04-26 ~04:00 CEST
**Iteration**: 1/20
**Completion promise**: SPRINT_R_COMPLETE (NOT yet true)
**Task**: Sprint R UNLIM onniscence onnipotence: Mac Mini Wiki batch gen, VPS GPU setup, RAG 6000+ chunks, UNLIM synthesis

---

## 0. Goal iter 1

Open ralph loop framework, validate Mac Mini autonomous infra running, dispatch overnight Wiki batch, document VPS GPU standalone architecture.

---

## 1. Actions executed

| # | Action | Output | Status |
|---|--------|--------|--------|
| 1 | Re-verify SSH key MacBook only | Mac Mini: only `authorized_keys` 112 bytes, ZERO private keys | ✅ PASS |
| 2 | Web research OpenAI gpt-oss | gpt-oss-20b/120b Apache 2.0 Aug 2025, 16GB edge compatible (Mac Mini fit) | ✅ DOC |
| 3 | Web research Hetzner GPU 2026 | GEX44 RTX 6000 Ada 48GB €187/mo, GEX131 96GB premium tier | ✅ DOC |
| 4 | Pull divisore-tensione.md Mac Mini → MacBook | scp 5793 bytes, commit + push PR #43 (commit 6422244) | ✅ DONE |
| 5 | Dispatch Mac Mini overnight batch 5 concepts | PID 28664: pwm + debounce + comunicazione-seriale-uart + ground + interrupt | 🔄 RUNNING |
| 6 | Write VPS GPU standalone architecture doc | 735 lines `docs/architectures/vps-gpu-standalone-2026-04-26.md` (commit a344919) | ✅ DONE |
| 7 | Web research best TTS Italian | Coqui XTTS-v2 confirmed Italian + voice cloning 6sec | ✅ DOC |
| 8 | Web research best VLM | Qwen2.5-VL 7B (Mac Mini), Pixtral 12B (VPS GPU), Qwen3-VL 235B premium | ✅ DOC |
| 9 | Activate ralph loop | `.claude/ralph-loop.local.md` active, max 20 iter | ✅ DONE |

---

## 2. Outputs

### 2.1 Commits + PRs

| Item | SHA | Branch | PR |
|------|-----|--------|----|
| divisore-tensione.md | 6422244 | mac-mini/wiki-concepts-batch-1-2026-04-25 | PR #43 (extends from cortocircuito) |
| VPS GPU arch doc 735 lines | a344919 | docs/sprint-q-comprehensive-2026-04-25 | PR #41 (extends) |

### 2.2 Documents created

- `docs/architectures/vps-gpu-standalone-2026-04-26.md` (735 lines, complete deployment plan)
- `docs/audits/2026-04-26-ralph-iter1-audit.md` (this file)

### 2.3 Mac Mini state

- launchctl autonomous loop PID 23944 RUNNING H24
- Batch script PID 28664 RUNNING (5 concepts)
- 31 concepts present in `docs/unlim-wiki/concepts/` (30 Q4 + cortocircuito + divisore-tensione local pending push)
- Generated: cortocircuito.md (4902 bytes), divisore-tensione.md (5793 bytes)

---

## 3. Quality verification (CoV)

### 3.1 Verified objectively

| Check | Result | Evidence |
|-------|--------|----------|
| SSH MacBook only | PASS | `find ~/.ssh -name "id_*"` Mac Mini = empty |
| Cortocircuito SCHEMA compliance | 11/11 PASS | grep audit script |
| Mac Mini baseline tests | 12291 PASS | npx vitest run output |
| VPS arch doc length | 735 lines | wc -l output |
| PR #43 state | OPEN draft | gh pr view |
| Push origin sync | sync | git log origin |

### 3.2 NOT yet verified (deferred iter 2+)

| Check | Why deferred |
|-------|--------------|
| New 5 concepts SCHEMA compliance | Batch still running |
| Mac Mini autonomous overnight stability | < 1h elapsed, full validation = 12h+ |
| VPS GPU stack actually deployable | Requires Andrea provisioning Hetzner/Scaleway |
| TTS Italian quality (Coqui vs Voxtral) | Requires VPS GPU live |
| RAG 6000 chunk pipeline runs | Requires BGE-M3 embedding endpoint |

---

## 4. Honest gaps + caveats

1. **Mac Mini batch script bug fixed mid-iter**: `${VAR^^}` bash 4 syntax broke macOS bash 3.2. Fixed via `tr a-z A-Z`. Earlier batches FAILED silently. Lesson: macOS scripts MUST use POSIX-compatible syntax.

2. **VPS GPU arch doc is PLAN, not deployed**. Andrea decision points pending: provider choice, Cloudflare token, HF account, DNS subdomain.

3. **Voxtral 4B Italian support unconfirmed in research**. Best Italian TTS = Coqui XTTS-v2 (16 lang confirmed). VPS arch doc to be UPDATED with Coqui as primary TTS.

4. **gpt-oss-20b quality vs Gemini Flash for Italian tutoring NOT TESTED**. Research insight: gpt-oss runs on 16GB edge = Mac Mini compatible. But Italian quality benchmark required.

5. **PR #43 has 2 unrelated concepts** (cortocircuito + divisore-tensione). Batch test concepts on different Mac Mini local branch (mac-mini/wiki-concepts-batch-20260426-033956). Workflow: scp + commit MacBook side adds them piecemeal to PR #43.

6. **Andrea didn't yet review PR #42 (Vercel Pro Analytics)** or PR #43 (Wiki concepts). Backlog accumulates.

7. **Mac Mini ELABTUTOR folder has tres-jolie 1.5GB** but unused yet for ELAB software (assets import deferred Sprint 7 per v2 plan).

---

## 5. Iter 2 plan

### 5.1 Continue work

- Monitor batch progress (5 concepts ~17min total)
- Pull batch concepts when done → commit MacBook → push PR #43
- Web research image generation models (FLUX.1, SDXL Turbo)
- Update VPS arch doc with TTS=Coqui, VLM=Qwen2.5-VL/Pixtral choices
- Plan Sprint VPS-1 trial Scaleway L4 (concrete steps Andrea executable)

### 5.2 Decisions awaiting Andrea

1. VPS provider trial: Scaleway L4 FR (€3.50/4h) recommended
2. Cloudflare Tunnel: Andrea API token OR manual web flow
3. HuggingFace account: existing OR create new
4. Production trigger: Hetzner mensile commit OR stay cloud Gemini
5. Image generation: include in Sprint 7 OR defer further

### 5.3 NOT iter 2 (later)

- Sprint Q PR cascade merge — Andrea side
- Sprint R0 fixture build — needs PR #37 merge for full effect
- Telegram approval gate (Andrea explicit "fregatene")
- Mac Mini Brain V13 self-host (deprecated — gpt-oss-20b replaces)

---

## 6. Promise check

`SPRINT_R_COMPLETE` = FALSE.

Reasons:
- Mac Mini batch overnight NOT validated (only single concept tested)
- VPS GPU NOT deployed
- RAG 6000 chunks NOT ingested
- UNLIM synthesis NOT wired in production

Continue iter 2.

---

**File path**: `docs/audits/2026-04-26-ralph-iter1-audit.md`
**Skill compliance**: documentation + quality-audit
**Honesty**: 7 gaps explicit, no inflation
