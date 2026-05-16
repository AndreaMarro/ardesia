# Iter 68 → Iter 69 Handoff — 2026-05-17

**Date**: 2026-05-17
**Iter 68 PHASE 3 close score**: **9.6/10 ONESTO G45 PROJECTED** (matrix re-verify Andrea deploy gate)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD pending Phase 4 commit
**Iter 69 target**: 9.6 → **9.8+/10** conditional A-NEW-3 matrix ≥98% verified + A-SECURITY rotation + iter 63 ELAB Compile/Upload Agent A0+A1.5+A2+A3 atoms

## §1 ACTIVATION STRING iter 69 (paste-ready)

```
ATTIVAZIONE ELAB TUTOR ITER 69 ENTRANCE — 2026-05-18

## CONTEXT POST ITER 68 CLOSE
- Repo: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder
- Branch: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD <iter 68 close SHA Phase 4>
- Score iter 68 close: 9.6/10 ONESTO G45 PROJECTED (matrix re-verify pending iter 69 entrance Andrea ratify)
- Vitest baseline iter 68 close: 13478 PASS (13428 + 50 NEW A-NEW-1+2 tests)
- Edge Function unlim-chat v240+ prod ENABLE_ONNISCENZA_V2=false (PATH A permanent iter 68)
- ELAB_API_KEY: persistent ~/.elab-credentials/elab-keys.env + auto-source .zshrc (iter 68 entrance setup)
- Mac Mini Tailscale: ALIVE (verify ping iter 69 entrance)
- Codex plugin-cc: installed iter 68 entrance (verify /codex:review + /codex:adversarial-review + /codex:rescue iter 69)

## BOOTSTRAP STEP 0 (CoV mandatory iter 69 entrance, parallel)
1. bash scripts/agents/aiw.sh status
2. Read iter 68 close audit + handoff:
   - docs/audits/2026-05-17-iter-68-CLOSE-audit.md (9.6/10 G45 PROJECTED)
   - docs/handoff/2026-05-17-iter-68-to-iter-69-handoff.md (THIS file)
3. Verify creds: source ~/.elab-credentials/elab-keys.env + echo "len: ${#ELAB_API_KEY}" (must be 64)
4. git log --oneline -5 (expect iter 68 close SHAs + iter 67 PHASE 6/7 + iter 66+65)
5. Pre-flight vitest: npx vitest run --reporter=basic 2>&1 | tail -8 (Target ≥13478 PASS, ZERO drift)

## MISSION ITER 69 P0 (10 atoms ordered, cascade target 9.6 → 9.8+/10)

### A-SECURITY (FIRST iter 69 entrance, ~30min Andrea + ~10min orchestrator)
ELAB_API_KEY rotation iter 32 protocol (DEFERRED iter 68 per Andrea ratify). Key exposed iter 67 PHASE 5 conversation context + every conversation since iter 68. 8-day exposure window. Iter 32 mandate 7-day rotation.

Steps (Andrea):
1. openssl rand -hex 32 → new 64-char key
2. npx supabase secrets set ELAB_API_KEY=<NEW> --project-ref euqpdueopmlllqjmqnyb
3. Vercel Dashboard → Settings → Env Variables → VITE_ELAB_API_KEY Production + Development → Edit → paste NEW → Redeploy
4. Edit ~/.elab-credentials/elab-keys.env → replace ELAB_API_KEY + VITE_ELAB_API_KEY → save
5. Smoke verify: source + curl unlim-chat → expect 200 OK (NOT 401)
6. Backup ~/.elab-credentials/elab-keys.env-OLD-iter68 (keep 7 giorni then purge)

### A-NEW-3 1000q matrix re-verify post iter 68 deploy (5min BG)
**CONDITIONAL**: only if iter 68 PHASE 3 deploy + matrix re-run NOT executed.

Steps:
1. supabase functions deploy unlim-chat --no-verify-jwt --project-ref euqpdueopmlllqjmqnyb (Andrea ratify)
2. Wait 30s cold start warmup
3. source ~/.elab-credentials/elab-keys.env && python3 scripts/bench/run-1000-matrix.py 2>&1 | tail -30
4. Target ≥98% PASS (vs 92.1% baseline iter 67 PHASE 6 V2 OFF)
5. Per-category verify: volpag ≥95% / offtopic ≥98% / others 100%
6. If <98% OR regression → ROLLBACK git revert + redeploy v240+

### Iter 63 ELAB Compile/Upload Agent A0+A1.5+A2+A3 (iter 67 PHASE 5 carryover, ~10-13h iter 69+)
- A0 audit iter 63 P0.5 status (1h orchestrator) — verify 80-85% complete claim, identify residual gaps
- A1.5 create src/boards/arduino-nano-r4.json board profile (30min, spec iter 63 §3.1)
- A2 HTTP server binding Express/Fastify wrapper server.js (2-3h orchestrator inline)
- A3 Lavagna UI CompileUploadButton wire to agent HTTP API (4-6h subagent BG, R7 refined PHASE 1 §7 spec)

### Iter 67 PHASE 5 carryover atoms (Andrea ratify queue iter 69 entrance):
- A6 PreToolUse hook guard-forbidden-avr-patterns.sh (1h)
- A7 Volume 3 capitoli inconsistency audit + Andrea ratify canonical (2h)
- A8 Renesas RA4M1 docs purge 3 options (2-4h subagent legacy-modernizer)

### Iter 69 entrance Andrea actions (~5-10min):
1. ELAB_API_KEY rotation (P0 SECURITY)
2. Deploy unlim-chat iter 68 fixes (if not done Phase 4 iter 68)
3. Matrix re-verify 1000q ≥98%
4. Codex plugin-cc verify operational (/codex:review test)
5. Mac Mini SSH wake decision (Tea T1+T4 delegate OR skip)

### Pattern S r3 enforced iter 69 (12× consecutive validated iter 68)
- Single-agent orchestrator inline default (NO subagent BG senza Andrea ratify)
- Codex BG Pattern V (verify, sandbox read-only) for hypothesis verification
- Codex BG Pattern C (cross-check) post-impl mandatory ogni atom critical (Andrea iter 67 "fai usare codex gpt 5.5 high")
- Filesystem barrier per atom (automa/team-state/messages or .ai/handoffs/)
```

## §2 Setup steps Andrea iter 69 entrance (~5-10 min)

```bash
# 1) Verify environment iter 69 entrance
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git log --oneline -5  # Expect iter 68 close commits HEAD
git status --short    # Expect clean

# 2) Pre-flight CoV iter 69 entrance
source ~/.elab-credentials/elab-keys.env  # ELAB_API_KEY + VITE_ELAB_API_KEY len 64
npx vitest run --reporter=basic 2>&1 | tail -10  # Target ≥13478 PASS

# 3) Mac Mini Tailscale verify
ping -c 3 100.124.198.59  # ALIVE expected ~40-130ms

# 4) Codex plugin-cc verify
/codex:review --help  # operational verify post iter 68 install

# 5) Apply A-SECURITY (P0 iter 69)
openssl rand -hex 32  # generate new key
# ... follow A-SECURITY steps in §1 ACTIVATION STRING

# 6) Apply A-NEW-3 (if not done iter 68 Phase 4)
# npx supabase functions deploy unlim-chat --no-verify-jwt --project-ref euqpdueopmlllqjmqnyb
# python3 scripts/bench/run-1000-matrix.py
```

## §3 Iter 69 priorities P0 (cascade target 9.6 → 9.8+/10)

| Atom | Scope | Effort | Priority |
|---|---|---|---|
| A-SECURITY | ELAB_API_KEY rotation iter 32 protocol | 30min Andrea | **P0 SECURITY** |
| A-NEW-3 | 1000q matrix re-verify ≥98% (if iter 68 didn't run) | 5-10min Andrea+BG | **P0 verification gate** |
| A0 | Audit iter 63 P0.5 ELAB Compile/Upload Agent status | 1h orchestrator | **P0 carryover iter 67 PHASE 5** |
| A1.5 | Create src/boards/arduino-nano-r4.json | 30min orchestrator | P0 |
| A2 | HTTP server binding wrapper server.js | 2-3h orchestrator | P0 |
| A3 | Lavagna CompileUploadButton wire to agent API | 4-6h subagent BG | P1 (post A2) |
| A6 | PreToolUse hook guard-forbidden-avr-patterns | 1h orchestrator | P1 |
| A7 | Volume 3 capitoli canonical decision | 2h orchestrator | P1 carryover iter 67 PHASE 5 |
| A8 | Renesas RA4M1 docs purge 3 options | 2-4h subagent | P1 carryover iter 67 PHASE 5 |
| Iter 69 NEW | registry sync npm script auto-regen | 30min orchestrator | P2 (drift prevention iter 68 §6 caveat 6) |

## §4 Sprint U close projection iter 70+

**9.7-9.9/10 ONESTO** conditional iter 69 + iter 70+ scope:

- iter 69: A-SECURITY rotation + matrix ≥98% verified + iter 63 ELAB Agent A0+A2+A3 partial
- iter 70: iter 63 ELAB Agent A4 first-vertical-slice Blink v3-cap5-esp1 + A5 error translator + A8 Renesas purge
- iter 71: iter 63 A9 esperimenti integration 14 esperimenti + A10 Web Serial Monitor + A11 Manual Dream Protocol prototype
- iter 72+: 94 esperimenti Playwright UNO PER UNO audit completion (Andrea iter 21+ carryover Sprint U close gate)
- Sprint V+: Vol3 narrative refactor Davide co-author + grafica overhaul Impeccable+Fusion + Opus indipendente review G45 mandate + Mistral Vibe Red Team integration + ELAB Quality Harness Phase 1

## §5 Honesty caveats critical iter 68 entrance close (carryover iter 69)

1. **A-NEW-3 matrix re-verify NOT executed iter 68 PHASE 3** — Andrea deploy gate. Iter 69 P0 verify mandatory.
2. **BASE_PROMPT v3.1.1 fall-through enforcement UNVERIFIED prod** — LLM behavior dependent. Iter 69+ explicit detector if matrix shows insufficient lift.
3. **A-SECURITY rotation DEFERRED iter 68 → iter 69 P0** — 8-day exposure window accumulated.
4. **Push origin iter 68 commits PENDING Andrea ratify** (Phase 4 orchestrator post Phase 2).
5. **Codex Pattern C verify in flight at audit write time** — results captured iter 68 close audit §1 if completed.
6. **Iter 63 ELAB Compile/Upload Agent A0+A1.5+A2+A3+A6+A7+A8+A9 NOT started iter 68** — iter 67 PHASE 5 atomization carryover, multi-iter scope iter 69-72.
7. **Mac Mini SSH wake NOT done iter 68 entrance** (Andrea chose Codex plugin-cc install instead). Iter 69+ Tea T1+T4 delegate.
8. **registry 79 IDs hardcoded sync risk** (§6 caveat 6 audit) — iter 69+ npm script auto-regen.
9. **post-LLM scrubber NOT recursive** within nested INTENT JSON composite handler path (§6 caveat 7) — iter 69+ verify if fixture exercises composite fake IDs.
10. **Pre-existing fixture issues NOT fixed iter 68**: 11 cases (8 page-only + 3 volume-only) — iter 69+ context-aware resolver (session experimentId lookup).

## §6 Files refs iter 68 close

| File | Path | Size | Status |
|---|---|---|---|
| iter 68 close audit | `docs/audits/2026-05-17-iter-68-CLOSE-audit.md` | ~10 KB NEW | shipped iter 68 |
| iter 68 → iter 69 handoff (THIS file) | `docs/handoff/2026-05-17-iter-68-to-iter-69-handoff.md` | ~6 KB NEW | shipped iter 68 |
| iter 67 PHASE 6 root cause | `docs/audits/2026-05-16-iter-67-PHASE6-1000q-matrix-regression-diagnosis.md` | exists | input iter 68 |
| iter 67 → iter 68 handoff | `docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md` | exists | input iter 68 |
| experiment-registry.ts NEW | `supabase/functions/_shared/experiment-registry.ts` | 122 LOC | shipped iter 68 A-NEW-1 |
| operational-response volpag tests NEW | `tests/unit/operational-response-volpag-extended-regex.test.js` | 209 LOC | shipped iter 68 A-NEW-2 |
| offtopic validate tests NEW | `tests/unit/operational-response-offtopic-validate.test.js` | 184 LOC | shipped iter 68 A-NEW-1 |

## §7 Anti-inflation G45 mandate iter 69 entrance

- NO claim "Sprint U close" (iter 70+ projection)
- NO claim "9.8+/10" senza A-NEW-3 matrix ≥98% verified PROD + A-SECURITY rotation completed
- NO claim "iter 63 ELAB Compile/Upload Agent LIVE" (iter 69 A0+A2+A3 partial only)
- NO claim "Volume 3 fully integrated" (iter 71 A9 multi-iter scope)
- NO claim "94 esperimenti audit closed" (iter 72+ Sprint U close gate)
- NO override G45 cap based on interpretation (mechanical mandate iter 67 PHASE 6 lesson learned)

EOF
