# Iter 69 → Iter 70 Handoff — 2026-05-18

**Date**: 2026-05-18 (orchestrator inline + Codex BG Pattern V/C + 1 BG subagent worktree isolato)
**Iter 69 close score**: **9.5/10 ONESTO G45** (+0.1 vs iter 68 9.4 — matrix re-verify pending iter 70 entrance)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD pending Phase 4 commit
**Iter 70 target**: 9.5 → **9.7+/10** conditional A-NEW-3b matrix ≥98% verified + A-SECURITY rotation + iter 63 A2+A3 BG subagent merge + Sentry/PostHog auth

## §1 ACTIVATION STRING iter 70 (paste-ready)

```
ATTIVAZIONE ELAB TUTOR ITER 70 ENTRANCE — 2026-05-19

CONTEXT POST ITER 69 CLOSE
- Repo: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder
- Branch: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD <iter 69 close SHA Phase 4>
- Score iter 69 close: 9.5/10 ONESTO G45 (volpag 84% + offtopic 89% → expected lift iter 70 post-deploy)
- Vitest baseline iter 69 close: ~13517 PASS (13483 + 34 NEW iter 69 tests: 26 A-NEW-1b + 8 A-NEW-2d)
- Edge Function unlim-chat v240 prod still iter 68 state (ENABLE_ONNISCENZA_V2=false PATH A) — A-NEW-1b+2d+1c shipped MA pending Andrea deploy v241
- ELAB_API_KEY: persistent ~/.elab-credentials/elab-keys.env (rotation P0 iter 70 mandatory iter 32 protocol)
- Mac Mini autonomous loop LIVE PROD PID 88901 launchctl service (iter 69 A-AUTOMATION-2)
- Codex CLI 0.130.0 GPT-5.5 high + 17+ plugins + .codex/AGENTS.md repo-level 4263B
- tmux orchestrator ready: scripts/tmux/elab-orchestrator.sh + docs/dev/TMUX-WORKFLOW.md
- Sentry+PostHog MCPs registered (auth OAuth pending Andrea iter 70 P0)
- BG subagent iter 63 A2+A3 worktree elab-builder-iter63-A2A3 - results post-merge review iter 70

BOOTSTRAP STEP 0 (CoV mandatory iter 70 entrance, parallel 5 actions)
1. bash scripts/agents/aiw.sh status
2. Read iter 69 close audit + handoff + Codex Pattern C output:
   - docs/audits/2026-05-18-iter-69-CLOSE-audit.md
   - docs/handoff/2026-05-18-iter-69-to-iter-70-handoff.md (THIS file)
   - /tmp/codex-verify-iter69-detectors.txt (Pattern C post-impl findings)
3. Verify creds: source ~/.elab-credentials/elab-keys.env && echo "len: ${#ELAB_API_KEY}" (64 expected pre-rotation, 64 post)
4. git log --oneline -5 (expect iter 69 close commits HEAD + iter 68 + iter 67 PHASE 6/7)
5. Pre-flight vitest: npx vitest run --reporter=basic 2>&1 | tail -8 (Target ≥13517 PASS)
6. Mac Mini health: ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'cat ~/.elab-health.json' (verify launchctl service alive + completed_count incrementing)

MISSION ITER 70 P0 (10 atoms ordered, cascade target 9.5 → 9.8+/10)

A-SECURITY (P0 SECURITY FIRST mandatory ~30min Andrea + 10min orchestrator)
ELAB_API_KEY rotation iter 32 protocol — 10-day exposure window accumulated iter 67-69.
Steps Andrea: openssl rand -hex 32 → supabase secrets set + Vercel env Production+Development → edit ~/.elab-credentials/elab-keys.env → smoke curl unlim-chat 200 OK → backup -OLD-iter69 keep 7 days.

A-NEW-3b matrix re-verify 1000q target ≥98% (Andrea deploy 5min + orchestrator 10min)
Steps: npx supabase functions deploy unlim-chat --no-verify-jwt --project-ref euqpdueopmlllqjmqnyb (PreToolUse hook guard-deploy-unlim-chat.sh enforced) → 30s warmup → source ~/.elab-credentials/elab-keys.env && python3 scripts/bench/run-1000-matrix.py → expected lift offtopic 89→≥97% (A-NEW-1b detector + A-NEW-1c BASE_PROMPT) + volume-only 3 cases handled (A-NEW-2d) + volpag 84% preserved.

A-NEW-2c page-only resolver session experimentId context (~2h orchestrator inline OR BG subagent)
Steps: extend buildDirectOperationalResponse signature add session?: SessionContext param → pass studentContext.currentExperimentId from unlim-chat/index.ts:384 → detect "Cosa dice il libro a pagina N?" pattern → derive volN from experimentId regex /^v([123])-/ → emit "Ragazzi, apriamo Vol.X pag.N sul kit ELAB..." canonical → 8 unit tests fixture iter 68 PHASE 6 page-only failures.

iter 63 A2+A3 BG subagent merge + verify (post iter 69 completion review)
Steps: review BG subagent output a9e6bca6 + verify worktree elab-builder-iter63-A2A3 commits + verify vitest 13517+ preserve + verify build PASS + Andrea ratify HTTP server binding port 8765 + merge to feat branch OR cherry-pick subset.

Andrea actions iter 70 entrance (~30min):
1. ELAB_API_KEY rotation (P0 SECURITY)
2. Deploy unlim-chat v241 (A-NEW-3b verification gate)
3. Sentry + PostHog OAuth + 3 dashboards seed (offtopic_hallucination_rate + volpag_citation_rate + matrix_pass_rate_24h)
4. Codex plugin-cc verify (/codex:review test - iter 69 install pending)
5. Mac Mini task queue seed 4 tasks (D1 Wiki batch + D2 ToolSpec L2 expand + D3 Vol3 narrative + D4 6 Volume PDF OCR overnight)

Pattern S r3 enforced iter 70 (13× consecutive validated iter 69)
- Single-agent orchestrator inline default
- Codex BG Pattern V (verify, sandbox read-only) pre-impl per atom critical
- Codex BG Pattern C (cross-check) post-impl mandatory ogni atom critical
- Filesystem barrier per atom (automa/team-state/messages or .ai/handoffs/)
- BG subagent only worktree isolato (race-cond mitigation iter 65 lesson)
```

## §2 Setup steps Andrea iter 70 entrance (~30 min)

```bash
# 1) Verify environment iter 70 entrance
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git log --oneline -5  # Expect iter 69 close commits HEAD
git status --short    # Expect clean (worktree elab-builder-iter63-A2A3 separate)

# 2) Pre-flight CoV
source ~/.elab-credentials/elab-keys.env
npx vitest run --reporter=basic 2>&1 | tail -8  # Target ≥13517 PASS

# 3) Mac Mini health verify
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'cat ~/.elab-health.json'
# Expect: launchctl PID running, completed_count > 3 (cycles since iter 69 install)

# 4) A-SECURITY rotation (P0)
NEW_KEY=$(openssl rand -hex 32)
echo "$NEW_KEY"  # SAVE for steps 4b+4c
# 4a) Supabase secrets
npx supabase secrets set ELAB_API_KEY="$NEW_KEY" --project-ref euqpdueopmlllqjmqnyb
# 4b) Vercel env Production+Development (Dashboard manual edit)
# 4c) Local env file update
cp ~/.elab-credentials/elab-keys.env ~/.elab-credentials/elab-keys.env-OLD-iter69
# Edit ~/.elab-credentials/elab-keys.env: replace ELAB_API_KEY and VITE_ELAB_API_KEY
# 4d) Smoke verify
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "x-elab-api-key: $NEW_KEY" -H "Content-Type: application/json" \
  -d '{"message":"Ciao"}' | jq .

# 5) A-NEW-3b matrix re-verify
npx supabase functions deploy unlim-chat --no-verify-jwt --project-ref euqpdueopmlllqjmqnyb
sleep 30  # cold start warmup
source ~/.elab-credentials/elab-keys.env
python3 scripts/bench/run-1000-matrix.py 2>&1 | tail -20
# Target: ≥98% PASS (vs 96.8% iter 68 baseline)
# Per-category: offtopic ≥97%, volume-only handled, volpag preserved ≥84%

# 6) Codex Pattern C verify-iter69-detectors output review
cat /tmp/codex-verify-iter69-detectors.txt
# Apply HIGH findings if any

# 7) iter 63 A2+A3 BG subagent merge
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter63-A2A3"
git log --oneline -5  # review BG subagent commits
npx vitest run --reporter=basic 2>&1 | tail -8
# If verified: cd back to main + merge OR cherry-pick
```

## §3 Iter 70 priorities P0 cascade target 9.5 → 9.7+/10

| Atom | Scope | Effort | Priority | Lift |
|---|---|---|---|---|
| A-SECURITY | ELAB_API_KEY rotation iter 32 protocol | 30min Andrea | **P0 SECURITY** | + safety |
| A-NEW-3b | matrix re-verify ≥98% post-deploy | 15min Andrea+orchestrator | **P0 verification** | +0.1 lift |
| A-NEW-2c | page-only resolver session context | 2h orchestrator OR BG | P0 matrix gap | +0.1 lift |
| iter 63 BG merge | verify backend-architect subagent output + merge worktree | 30min orchestrator | P0 carryover iter 69 | +0.05 |
| Sentry+PostHog auth | OAuth + 3 dashboards seed | 30min Andrea | P1 observability | +0.05 |
| Codex Pattern C review | apply HIGH findings if any from iter 69 verify | 30min orchestrator | P1 quality | + safety |
| Mac Mini task seed | D1+D2+D3+D4 queue tasks | 30min orchestrator | P1 automation | +0.05 |
| claude-mem fix | re-prime corpus iter 60-69 history | 1h Andrea+orchestrator | P2 mem | + context |
| iter 67 PHASE 5 carryover | Andrea ratify Volume 3 capitoli + Renesas | 2h Andrea | P2 carryover | + clarity |
| Matteo onboarding | brief refresh + 2-day plan execution | 1h Andrea | P2 team | + capacity |

**Sprint U close projection iter 70+**: 9.7-9.9/10 ONESTO conditional A-NEW-3b ≥98% verified + iter 63 ELAB Agent complete (A4 first-vertical-slice Blink iter 71) + 94 esperimenti audit iter 72+ + Vol3 narrative refactor Davide co-author + grafica overhaul Impeccable+Fusion + Opus indipendente review G45 mandate.

## §4 Honesty caveats iter 70 entrance (carryover iter 69)

1. **A-NEW-3b matrix verify NOT executed iter 69** — Andrea deploy gate P0 iter 70 entrance.
2. **A-SECURITY rotation DEFERRED iter 67-69** — 10-day exposure window accumulated, iter 70 P0 SECURITY mandatory.
3. **A-NEW-2c page-only resolver DEFERRED iter 70+** — Codex Pattern V confirmed needs experimentId context wire (signature change).
4. **iter 63 A2+A3 BG subagent results PENDING REVIEW** iter 70 entrance.
5. **Codex Pattern C verify-iter69-detectors output PENDING REVIEW** iter 70 entrance.
6. **claude-mem CLI BROKEN local** — corpus re-prime DEFERRED iter 70+ post install fix.
7. **Sentry + PostHog MCPs auth OAuth pending Andrea action** — 3 dashboards seed deferred post-auth.
8. **Mac Mini task queue EMPTY** (queue_size:0) — iter 70 entrance seed 4 tasks post Andrea ratify reliability.
9. **Build NOT re-run iter 69 Phase 1+2+3** — defer Phase 4 orchestrator pre-commit gate.
10. **Push origin iter 69 commits PENDING Andrea ratify Phase 4**.

## §5 Files refs iter 69 close

- iter 69 close audit: `docs/audits/2026-05-18-iter-69-CLOSE-audit.md` (195 LOC)
- iter 69 → iter 70 handoff (THIS file): `docs/handoff/2026-05-18-iter-69-to-iter-70-handoff.md`
- A-AUTOMATION-1 sync script: `scripts/sync-experiment-registry.mjs` (100 LOC NEW)
- A-AUTOMATION-3 tmux config: `~/.tmux.conf` (39 LOC NEW) + `scripts/tmux/elab-orchestrator.sh` (88 LOC NEW) + `docs/dev/TMUX-WORKFLOW.md` (~3.8 KB NEW)
- A-NEW-1b detector: `supabase/functions/_shared/operational-response.ts:273-289` (+20 LOC)
- A-NEW-1b tests: `tests/unit/operational-response-offtopic-redirect.test.js` (132 LOC NEW, 26/26 PASS)
- A-NEW-1c BASE_PROMPT: `supabase/functions/_shared/system-prompt.ts:264-274` (+13 LOC)
- A-NEW-2d detector: `supabase/functions/_shared/operational-response.ts:428-440` (+18 LOC)
- A-NEW-2d tests: `tests/unit/operational-response-volume-only.test.js` (48 LOC NEW, 8/8 PASS)
- Mac Mini plist (installed Mac): `~/Library/LaunchAgents/com.elab.mac-mini-autonomous-loop.plist`
- Codex Pattern V outputs: `/tmp/codex-verify-offtopic-failures.txt` + `/tmp/codex-verify-volpag-gap.txt`
- Codex Pattern C output: `/tmp/codex-verify-iter69-detectors.txt`
- iter 63 BG subagent worktree: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter63-A2A3`

## §6 Anti-inflation G45 mandate iter 70 entrance

- NO claim "Sprint U close" (iter 70+ projection)
- NO claim "9.7+/10" senza A-NEW-3b matrix ≥98% verified PROD + A-SECURITY rotation completed
- NO claim "iter 63 ELAB Agent FULLY shipped" (A4 first-vertical-slice iter 71 projection)
- NO claim "Volume 3 fully integrated" (iter 71+ A9 multi-iter scope)
- NO claim "94 esperimenti audit closed" (iter 72+ Sprint U close gate)
- NO override G45 cap based on interpretation (mechanical mandate iter 67 PHASE 6 + iter 68 lessons)

