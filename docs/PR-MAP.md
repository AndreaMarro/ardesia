# PR-MAP

Source: WF1 GitHub deep audit + ELAB PR triage (read-only, 2026-06-25).

## Open PRs across canonical/support repos

| repo | PR | title | mergeState | verdict |
|---|---|---|---|---|
| ardesia | #1 | Knowledge Fabric (`ops/knowledge`) + GSD context-packet | DRAFT, CLEAN, MERGEABLE | merge gated to Andrea |
| lessonos | #3 | Ratifica `auto/main` → `main` (12 commits) | BLOCKED, MERGEABLE | merge gated to Andrea |
| ardesia-studio | #2 | Ratifica `auto/main` → `main` (3 commits) | CLEAN, MERGEABLE (stale, updated 2026-06-18) | merge gated to Andrea |

- **ardesia #1** head = `session/long-2026-06-25`. Clean draft.
- **lessonos #3** is BLOCKED *despite* no branch protection on its base `auto/main` → the block is on the base/`main` side or a non-protection check (not inspected this pass — see unknowns).
- **ardesia-studio #2** is the only CLEAN non-draft ratifica PR.

## elab-tutor — PR graveyard (14 open PRs)

All 14 are stale (latest update 2026-06-07, oldest May). Two INDEPENDENT shared CI breaks:
1. **Governance Rule 5** — `src/supabase changed but CHANGELOG.md not updated` hard-fails #199/#197/#196/#194/#200.
2. **Stale unit-test cluster** — `principioZeroCompliance`, `compiler`, HomePage component tests fail on supabase-mock-chain gaps (`.ilike`/`.eq` not a function), `Deno is not defined`, drifted expectations.

| PR | title | CI | mergeable | verdict |
|---|---|---|---|---|
| #198 | fix(ci): sblocco CI rossa — 3 bug prod veri + test stale | unit ALL PASS (470); gov/ratchet/security GREEN; only E2E smoke shard red | UNSTABLE | **merge-candidate / keystone** |
| #199 | ci(lint): hard-fail eslint no-undef gate + fix remoteCompileCode | gov FAIL (Rule 5) + ratchet + test FAIL | MERGEABLE | keep-strategic (rebase on #198) |
| #200 | feat(nlj): scaffold Numerical Lab Journey MVP | nlj-fast FAIL + Vercel deploy FAIL + test/ratchet/gov FAIL (+23433/-3, 216f) | MERGEABLE | HOLD (distraction) |
| #197 | feat(unlim): Gemini function-calling converter + eval (not wired) | gov FAIL (Rule 5) + cluster | MERGEABLE | R&D / hold |
| #196 | fix(consent): repair consent gate (teacher-attested) + wire FE grant | gov FAIL (Rule 5) + cluster (+158/-22, 5f) | MERGEABLE | keep-strategic (GDPR/privacy; merge after #198) |
| #195 | Phase 0 — Real ELAB domain graph + simulator audit + CircuitScene | gov PASS; ratchet+test FAIL (+11192/0, 18f, DRAFT) | MERGEABLE | plugin-port-to-Ardesia (strategic draft) |
| #194 | feat(elabcode): re-upload resilience + UNLIM agisce + i18n recovery | gov FAIL (Rule 5) + cluster (+29412/-6144, 208f) | MERGEABLE | useful-not-core; split before merge |
| #161 | feat(home): overhaul + UNLIM + cross-compile + edukit parity | gov PASS; test+ratchet FAIL; DIRTY | CONFLICTING | close-candidate (archive) |
| #171 | chore(repo): Phase 0/1 reorg — archive 39 root clutter files | DIRTY (+49/-36330) | CONFLICTING | close-candidate (re-do fresh) |
| #158 | style(b4-a7): anti-overflow guardrail #compile-home | DIRTY | CONFLICTING | close-candidate |
| #157 | style(b4-a2): editor dominante #compile-home | DIRTY | CONFLICTING | close-candidate |
| #156 | fix(b4-a3): DrawingOverlay color bar behind header | DIRTY | CONFLICTING | close-candidate |
| #155 | style(b4-a5): Serial Monitor tab distinct | DIRTY | CONFLICTING | close-candidate |
| #154 | style(b4-a1): compact #compile-home top bar | DIRTY | CONFLICTING | close-candidate |

### Why #198 is the keystone

#198's unit suite is now fully green (470 passed | 3 skipped). Its only red is the **E2E Playwright smoke shard**, failing on a jsdom limitation (`Error: Not implemented: navigation (except hash changes)`) — an environment flake, not a product regression. Merging #198 is the lever that unblocks #199/#196/#197/#194: rebase them onto #198 to inherit the unit-cluster fix, then add a CHANGELOG entry to clear governance Rule 5.

### Grouped lists

- **KEEP / STRATEGIC:** #198 (keystone), #199 (lint-gate quality), #196 (consent/privacy).
- **MERGE order:** #198 first → then rebase #196, #199 onto it.
- **HOLD:** #200 (NLJ distraction + own gate + Vercel fail), #197 (R&D not-wired), #194 (too large, split first).
- **PLUGIN-PORT-TO-ARDESIA:** #195 (CircuitScene + domain graph → Ardesia plugin host).
- **CLOSE / ARCHIVE:** #161, #171, #158, #157, #156, #155, #154 — all CONFLICTING/DIRTY, 3–5 weeks stale.

## Unknowns (per audit)

- Whether lessonos #3 BLOCKED is a failing required check vs a merge conflict on base — protection API shows none on `auto/main`, so the block is on the base/`main` side or an uninspected check.
- Exact failing-check detail for elab-tutor UNSTABLE PRs was not pulled this pass.
- Whether #198's E2E "navigation not implemented" is deterministic or a transient flake (needs a re-run).
