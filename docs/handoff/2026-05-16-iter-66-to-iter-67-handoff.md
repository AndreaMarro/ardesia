# Iter 66 → Iter 67 Handoff — 2026-05-16

**Date**: 2026-05-16 AM CEST
**Iter 66 close score**: **9.0/10 ONESTO G45**
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD `713a9d81`
**Iter 67 target**: 9.0 → **9.3+/10** conditional Andrea ratify + v55 deploy + R7 ship

## §1 ACTIVATION STRING iter 67 (paste-ready)

```
ATTIVAZIONE ELAB TUTOR ITER 67 ENTRANCE — 2026-05-17 AM

CONTEXT POST ITER 66 CLOSE (LANDED + READY PUSH origin)
- Repo: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder (main worktree pulita)
- Branch: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD 713a9d81
- Iter 66 commits LANDED main work branch:
  * 314cb6e5 chore(iter-66-P0.-1): drift fix compileAgentDetect.js JSDoc @copyright
  * 2f7d7611 feat(iter-66-P0.3): R5 HomePage CompileAgentBanner widget (14/14 PASS)
  * 0a2c35b5 feat(iter-66-P0.0): Galileo→UNLIM mandate #14 cleanup (83→35 alias-only)
  * 713a9d81 merge: feat/iter-66-galileo-cleanup → main work branch
  * NEW iter 66 close (TBD): audit + handoff + CLAUDE.md APPEND
- Vitest baseline iter 66 close: 13428 PASS (preserve mandatory iter 67+)
- Build: PASS 18.5s
- Push origin status iter 66: PENDING Andrea ratify (NO --no-verify, NO push main)
- Worktrees clean: 2 iter-66 worktrees rimossi post-merge

BOOTSTRAP STEP 0 (CoV mandatory)
1. Read iter 66 close audit + handoff:
   - docs/audits/2026-05-16-iter-66-PHASE3-CLOSE-audit.md (9.0/10 G45)
   - docs/handoff/2026-05-16-iter-66-to-iter-67-handoff.md (THIS file)
   - docs/audits/2026-05-16-iter-66-ENTRANCE-truth-recalibration-audit.md (iter 65 PARTIAL stale correction)
2. Read .impeccable.md (design source truth)
3. Pre-flight CoV: npx vitest run (target ≥13428 PASS) + npm run build (PASS expected ~18s)
4. Andrea ratify queue gruppo 6 (5 voci max) — vedi §3 priorities P0
5. Honesty delta upfront state report iter 67 entrance vs iter 66 close

ITER 67 P0 PRIORITIES (cascade lift target 9.0 → 9.3+/10)
1. Andrea SQL push + v55 deploy + ENABLE_ONNISCENZA_V2 (~15min terminale)
2. Canary rollout v55 gradient 0→5→25→100% (Andrea ratify decisione)
3. R7 Lavagna+IDE Blockly integration (subagent ~6h, consume R4)
4. Atom 3 system-prompt v3.2 Sense 1.6 inject (subagent ~4h post v55)
5. Tea folder review iter 67+ scope decisione Andrea (PLAN-unlim-prof-pilot-chatgpt multi-week)
6. Renesas RA4M1 docs purge (~2h Andrea ratify scope first)
7. 94 esperimenti Playwright audit (subagent ~8-10h)
8. Iter 65 PARTIAL handoff archive con STALE marker
9. Codex plugin-cc install (Andrea slash command sequence)
10. galileo-mcp drift mystery investigation (if recurrent)

PATTERN S 5-PRONGED iter 66+ MANDATE (iter 65 race-cond lesson validated)
- NO 3+ BG agents stessa worktree
- OR git worktree isolation per BG agent
- Quick-regression delta scope test (NOT full vitest 5-10min)
- Filesystem implicit lock per worktree (.git/index isolation)
- Process cleanup post-agent termination
```

## §2 Setup steps Andrea iter 67 entrance (~15 min)

```bash
# 1) Verify environment iter 67 entrance
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git log --oneline -5  # Expect 713a9d81 HEAD
git status --short    # Expect clean (only auto-state regen if any)

# 2) Pre-flight CoV
npx vitest run --reporter=basic 2>&1 | tail -10  # Target ≥13428 PASS

# 3) Push iter 66 close to origin (Andrea ratify gate)
git push origin feat/iter-41-sprint-u-cycle-2-real-user-fix

# 4) Andrea terminal actions P0.2 (SQL push + v55 deploy)
npx supabase migration list --linked
npx supabase db push --linked
npx supabase secrets set ENABLE_ONNISCENZA_V2=true --project-ref euqpdueopmlllqjmqnyb
npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb

# 5) Smoke verify v55 telemetry
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao","class_key":"test-iter67"}'
# Verify response includes onniscenza_v2_used:true telemetry
```

## §3 Andrea ratify queue gruppo 6 iter 67 entrance

1. **SQL push + v55 deploy + ENABLE_ONNISCENZA_V2** — Andrea terminale ~15min
2. **Canary rollout strategy v55** — gradient (raccomandato) OR direct 100%
3. **R7 Lavagna+IDE Blockly subagent dispatch** — git worktree isolato OR inline serial
4. **Tea PLAN-unlim-prof-pilot-chatgpt scope decision** — iter 67-70 atomization OR defer iter 80+
5. **Renesas RA4M1 docs purge scope** — definire AVR-vs-Renesas precise replacements (Andrea ratify exact 36 file scope)

## §4 Iter 65 PARTIAL handoff archive plan

`docs/handoff/2026-05-15-iter-65-PARTIAL-to-iter-66-RECOVERY.md` è STALE post-iter-66-entrance truth recalibration. Iter 67 P0.10:

1. Add marker at top of file: `> ⚠️ STALE iter 66 entrance — iter 65 actual close 8.7/10 G45 verified, Atom 2.5 + npm audit + push origin all SHIPPED post-handoff write. See replacement audit: docs/audits/2026-05-16-iter-66-ENTRANCE-truth-recalibration-audit.md`
2. Move to `docs/handoff/archive/2026-05-15-iter-65-PARTIAL-STALE.md`
3. Update any cross-references

## §5 Honesty caveats critical iter 66 close

1. **Push origin iter 66 commits PENDING Andrea ratify** (no autonomous push branch by orchestrator — Andrea decision)
2. **Iter 65 PARTIAL handoff STALE** — Atom 2.5 + npm audit + push origin all shipped post-handoff write. Iter 67 archive cleanup.
3. **galileo-mcp drift origin NOT traced** — copyright comment injection cause hypothesis only (galileo-mcp MCP server local OR Andrea paste). Monitor recurrence iter 67+.
4. **Galileo cleanup partial (35 refs remain ALIAS-ONLY)** — `GalileoAdapter.jsx`/`module.css` + `GalileoResponsePanel.jsx` files preserved on disk for potential dynamic string imports. Verify safe delete iter 67+ post grep dynamic import scan.
5. **v55 deploy + canary + Atom 3 + R7 + Tea PLAN + Renesas purge + 94 esperimenti audit ALL DEFERRED iter 67+** — iter 66 scope limited to drift cleanup + R5 + Galileo cleanup. Sprint U close target ~iter 70+ realistic.

## §6 Iter 67 score target

**9.0 → 9.3+/10 ONESTO** conditional:
- v55 deploy LIVE prod (+0.1)
- Canary rollout 25% milestone (+0.05)
- R7 Lavagna+IDE ship (+0.1)
- Atom 3 system-prompt v3.2 deploy (+0.05)
- 94 esperimenti audit start (+0.05 if any subset complete)

Sprint U close projection **iter 70+**: 9.5+/10 ONESTO conditional Onnipotenza full Deno port + 94 esperimenti audit complete + Vol3 narrative refactor Davide co-author + grafica overhaul Impeccable+Fusion + Opus indipendente review G45 mandate.

## §7 Mac Mini SSH ad-hoc dispatch (iter 62 ratify PATH C)

- Tailscale ALIVE `100.124.198.59` (128ms latency verified iter 66 entrance)
- SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab` (MacBook only)
- 8 scripts ready `~/scripts/`: autonomous-loop v1+v2 + stress-runner + telegram-approval + iter36-env + crontab.elab-iter36
- Autonomous loop DORMANT (NOT dead, last log 2026-05-02 = 14 days ago)
- Andrea PATH C decision: NO cron install, ad-hoc delegation only

## §8 Files refs iter 66 close

| File | Path | Size |
|---|---|---|
| Iter 66 entrance truth audit | `docs/audits/2026-05-16-iter-66-ENTRANCE-truth-recalibration-audit.md` | ~3 KB |
| Iter 66 close audit (this companion) | `docs/audits/2026-05-16-iter-66-PHASE3-CLOSE-audit.md` | ~5 KB |
| Iter 66 → iter 67 handoff (this file) | `docs/handoff/2026-05-16-iter-66-to-iter-67-handoff.md` | ~4 KB |
| R5 CompileAgentBanner JSX | `src/components/HomePage/CompileAgentBanner.jsx` | 276 LOC |
| R5 CompileAgentBanner CSS | `src/components/HomePage/CompileAgentBanner.module.css` | 210 LOC |
| R5 CompileAgentBanner tests | `tests/unit/components/HomePage/CompileAgentBanner.test.jsx` | 507 LOC, 14 tests |
| Galileo→UNLIM Adapter | `src/components/lavagna/UnlimAdapter.{jsx,module.css}` | 933 + 51 LOC NEW |
| Galileo→UNLIM ResponsePanel | `src/components/simulator/panels/UnlimResponsePanel.jsx` | 314 LOC NEW |
| Iter 65 PARTIAL handoff (STALE) | `docs/handoff/2026-05-15-iter-65-PARTIAL-to-iter-66-RECOVERY.md` | archive iter 67 |

EOF
