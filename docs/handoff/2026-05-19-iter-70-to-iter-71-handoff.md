# Iter 70 → Iter 71 Handoff — 2026-05-19

**Date**: 2026-05-19 (orchestrator inline + 6 BG subagents paralleli + Codex BG Pattern V/C + Mac Mini)
**Iter 70 close**: 6 BG teams committed + iter63 merged + 7 worktree merge sequential mainwt HEAD `aa2460e3`
**Score iter 70 PHASE 3 close**: TBD post vitest full + Codex Pattern C cross-check
**Iter 71 target**: TBD → **9.7-9.9/10** conditional Andrea P0 action cascade + Codex Pattern C green + cleanup debito tecnico residuo

## §1 ACTIVATION STRING iter 71 (paste-ready)

```
ATTIVAZIONE ELAB TUTOR ITER 71 ENTRANCE — 2026-05-20

CONTEXT POST ITER 70 CLOSE
- Repo: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder
- Branch: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD aa2460e3
- 6 BG teams iter 70 merged mainwt: A+B+D+E+F+G + iter63 A2+A3 + iter63 inline
- TEAM C FAILED catastrophic iter 70 - re-dispatch iter 71 fresh worktree
- Vitest baseline TBD post merge (target ≥13517 iter 69 close + ~700-1000 NEW iter 70 = ~14200-14500 expected)
- 6 iter70 worktree pending cleanup post merge confirm
- Codex BG Pattern C 6 team verify outputs /tmp/codex-verify-iter70-team-*.txt
- Mac Mini queue iter 70 ALL FAILED 16:16:55Z - re-seed iter 71 entrance
- Cartella TEA: ~70% recovery iter 70 (top-tier 1-9), 30% residuo (bibbia + album runtime + fumetti pipeline + PLAN ChatGPT)

BOOTSTRAP STEP 0 iter 71 entrance (CoV mandatory parallel 6 actions)
1. bash scripts/agents/aiw.sh status
2. git log --oneline -10 (verifica 7 commits iter 70 + merge sequence)
3. npx vitest run --reporter=basic 2>&1 | tail -10 (target ≥13517 baseline OR new baseline post merge)
4. Read iter 70 close audit: docs/audits/2026-05-19-iter-70-CLOSE-multi-agent-audit.md
5. Read iter 70 → iter 71 handoff (THIS file)
6. Codex Pattern C 6 outputs review: ls -la /tmp/codex-verify-iter70-team-*.txt

MISSION ITER 71 P0 (10 atoms cascade target 9.7-9.9/10 ONESTO)

A-SECURITY (P0 SECURITY FIRST mandatory Andrea ~30min)
ELAB_API_KEY rotation iter 32 protocol — 11+ giorni exposure window iter 67-70 accumulated.
Steps Andrea: openssl rand -hex 32 → supabase secrets set + Vercel env Production+Development → edit ~/.elab-credentials/elab-keys.env → smoke curl 200 OK → backup -OLD-iter70.

A-NEW-3b matrix re-verify 1000q (Andrea deploy 15min)
Steps: supabase functions deploy unlim-chat --no-verify-jwt + python3 scripts/bench/run-1000-matrix.py → target ≥98% (expected lift offtopic 89→≥97% A-NEW-1b+1c + volume-only A-NEW-2d + page-only A-NEW-2c).

Sentry+PostHog OAuth (Andrea 30min)
3 dashboards seed: offtopic_hallucination_rate + volpag_citation_rate + matrix_pass_rate_24h.

TEAM C re-dispatch fresh worktree (iter 71 P0)
Scope: Vol3 Blink first-vertical-slice v3-cap5-esp1 + Error translator 7 categories. Pattern S r3 worktree isolato from mainwt aa2460e3 baseline.

Codex Pattern C cross-check 6 team output review (parallel BG 5min ognuno)
Apply HIGH/MED findings if any. iter 71 entrance gate before push origin Andrea.

code-reviewer:code-reviewer Anthropic agent per ogni team output (security + best practices + maintainability ~5min ognuno parallel).

Mac Mini re-seed valid task iter 71 entrance:
- Fix path mount differente (use Mac Mini /Users/progettibelli/Projects/elab-tutor/path NOT MacBook /Users/andreamarro/VOLUME\ 3/...)
- D1 Wiki batch 30 concepts (script Mac Mini-side native)
- D2 Vol3 chain prod test (post mainwt push origin + Mac Mini auto-pull)
- D3 OCR 6 Volume PDF (Mac Mini Tesseract Italian model verify)

Iter 71 PHASE atomization gruppo 12 carryover (Andrea ratify pending):
- Volume 3 capitoli canonical decision (4 repo vs 10-12 sito) iter 67 PHASE 5
- Renesas RA4M1 docs purge 76 file 3 options (post TEAM G audit iter 70)
- Matteo onboarding 2-day plan execution (iter 58 brief)
- claude-mem CLI fix + corpus re-prime iter 60-69 history

Iter 71+ scope multi-iter:
- Tea bibbia_stilistica.pdf 65KB deep apply (font + spacing + iconografia)
- Tea album_studente runtime integration (post scaffold iter 70)
- Fumetti pipeline atomization: Canva (MCP ready iter 67) + ComfyUI install + Leonardo.ai API
- iter 67 PHASE 5 A9 Vol3 esperimenti integration 14 esperimenti (iter 72+ multi-iter)
- iter 71 close A11 Manual Dream Protocol v1 prototype

Sprint V+ multi-week strategic:
- A12+A13 cross-platform installer + GPL-3.0 legal review (40-80h)
- A14 Mistral Vibe Red Team Mac Mini integration
- A15 ELAB Quality Harness Phase 2 (Crawlee + Pa11y + BackstopJS + ZAP + Langfuse + Ragas + DeepEval + Unlighthouse)
- PLAN-unlim-prof-pilot-chatgpt.md 35KB (Anthropic Managed Agents Memory + Claude Dreams + Vision validator + Custom GPT)

Pattern S r3 enforced iter 71 (13× consecutive validated iter 70)
- Single-agent orchestrator inline default
- Codex BG Pattern V pre-impl per atom critical
- Codex BG Pattern C post-impl mandatory ogni atom critical
- BG subagent only worktree isolato (race-cond mitigation iter 65 lesson)
```

## §2 Setup steps Andrea iter 71 entrance (~2-3h totale parallel)

```bash
# 1) Verify environment iter 71 entrance
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git log --oneline -10  # 7 commits iter 70 + iter 69 close
git status --short      # Expected clean OR auto-state minor

# 2) Pre-flight CoV
source ~/.elab-credentials/elab-keys.env
npx vitest run --reporter=basic 2>&1 | tail -10  # Target ≥13517 (target ≥14200 post merges iter 70)

# 3) A-SECURITY rotation P0 (~30min)
NEW_KEY=$(openssl rand -hex 32) && echo "$NEW_KEY"
npx supabase secrets set ELAB_API_KEY="$NEW_KEY" --project-ref euqpdueopmlllqjmqnyb
# Vercel Dashboard → VITE_ELAB_API_KEY Production+Development → Edit → paste NEW
cp ~/.elab-credentials/elab-keys.env ~/.elab-credentials/elab-keys.env-OLD-iter70
# Edit elab-keys.env → replace ELAB_API_KEY + VITE_ELAB_API_KEY
source ~/.elab-credentials/elab-keys.env
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "x-elab-api-key: $ELAB_API_KEY" -H "Content-Type: application/json" \
  -d '{"message":"Ciao"}' | jq .

# 4) A-NEW-3b deploy + matrix re-verify (~15min)
npx supabase functions deploy unlim-chat --no-verify-jwt --project-ref euqpdueopmlllqjmqnyb
sleep 45
python3 scripts/bench/run-1000-matrix.py 2>&1 | tee matrix-iter71-$(date +%Y%m%d-%H%M%S).log | tail -20
# Target: ≥98% PASS (vs 96.8% baseline iter 68)

# 5) Sentry+PostHog OAuth (~30min)
claude mcp authenticate plugin:sentry:sentry  # OAuth callback
claude mcp authenticate plugin:posthog:posthog  # OAuth callback
# 3 dashboards seed via MCP tools

# 6) Push origin (Andrea ratify mandate)
git push origin feat/iter-41-sprint-u-cycle-2-real-user-fix
# 8 commits iter 70 + 7 commits iter 69 close batch

# 7) Mac Mini re-seed valid task iter 71 entrance
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59
# Inside Mac Mini: git pull origin + cat >> ~/.elab-task-queue.jsonl << EOF ...
```

## §3 Iter 71 priorities P0 cascade target 9.5-9.7 → 9.7-9.9/10

| Atom | Scope | Effort | Priority | Lift |
|---|---|---|---|---|
| A-SECURITY | ELAB_API_KEY rotation iter 32 protocol | 30min Andrea | **P0 SECURITY** | + safety |
| A-NEW-3b | matrix re-verify ≥98% post deploy | 15min Andrea+orchestrator | **P0 verification** | +0.1 lift |
| Sentry+PostHog auth | OAuth + 3 dashboards seed | 30min Andrea | P1 observability | +0.05 |
| TEAM C re-dispatch | Vol3 Blink + Error translator fresh worktree | 5-6h subagent BG | P0 cross-compile | +0.1 |
| Codex Pattern C review | 6 team outputs apply HIGH findings | 30min orchestrator | P0 quality | + safety |
| code-reviewer Anthropic | 6 team outputs security+best+maintain | 30min orchestrator | P1 quality | + safety |
| Mac Mini re-seed | 3-4 tasks Mac Mini-side native path | 30min orchestrator | P1 automation | +0.05 |
| iter 67 PHASE 5 carryover | Vol3 capitoli + Renesas (Andrea ratify) | 1h Andrea | P1 clarity | + decisions |
| Matteo onboarding | brief refresh + 2-day plan execution | 1h Andrea | P2 team | + capacity |
| claude-mem fix | re-prime corpus iter 60-70 | 1h Andrea+orchestrator | P2 mem | + context |
| Tea bibbia_stilistica deep apply | font+spacing+iconografia | 4h subagent BG | P2 UI | +0.05 |
| Tea album_studente runtime | post scaffold iter 70 wire-up | 3h subagent BG | P2 UI | +0.05 |
| Fumetti pipeline atomization | Canva + ComfyUI install + Leonardo API | 6-8h multi-atom | P3 iter 71-73 | +0.1 multi-iter |

**Sprint U close projection iter 71-72+**: 9.7-9.9/10 ONESTO conditional A-NEW-3b ≥98% + iter 63 ELAB Agent A4+A5 (TEAM C re-dispatch) + 94 esperimenti audit completion + Vol3 narrative parità Tea deep + Opus indipendente review G45 mandate.

## §4 Honesty caveats iter 71 entrance (carryover iter 70)

1. **TEAM C catastrofico FAIL iter 70** — re-dispatch fresh worktree iter 71 P0.
2. **BG agents 6/6 output truncated** mid-action iter 70 — orchestrator inline recovery committed. Iter 71 BG agents need shorter scope OR explicit commit step mid-process.
3. **Vitest full post merge NOT verified yet iter 70 close** — BG running, results iter 71 entrance.
4. **Codex Pattern C 6 team verify outputs PENDING REVIEW** iter 71 entrance.
5. **code-reviewer:code-reviewer Anthropic agent NOT executed** ognuno team — iter 71 entrance security review.
6. **A-SECURITY rotation DEFERRED iter 71+ Andrea** — 11+ giorni exposure window iter 67-70.
7. **A-NEW-3b matrix re-verify ≥98% Andrea action** P0 iter 71 entrance.
8. **Mac Mini queue iter 70 ALL FAILED** — re-seed iter 71 entrance con fix path.
9. **Tea materials 30% residuo** (bibbia + album runtime + fumetti) iter 71+ multi-iter scope.
10. **Sprint V+ strategic deferrals**: cross-platform installer + GPL-3.0 + Mistral Vibe + ELAB Quality Harness Phase 2 + PLAN ChatGPT 35KB multi-week.

## §5 Anti-inflation G45 mandate iter 71 entrance

- NO claim "Sprint U close" (iter 72+ projection)
- NO claim "9.7+/10" senza Andrea P0 cascade completed (A-SECURITY + A-NEW-3b + matrix ≥98%)
- NO claim "TEAM C deliverables LIVE" (iter 71 re-dispatch fresh)
- NO claim "Tea 100% integrated" (~70% iter 70, 30% residuo iter 71+)
- NO claim "fumetti pipeline LIVE" (iter 71-73 atomization Canva+ComfyUI+Leonardo)
- NO override G45 cap based on interpretation (mechanical mandate iter 67 PHASE 6 lesson)
