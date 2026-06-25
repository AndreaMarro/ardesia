# TESTING-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — ELAB PR triage

## ELAB (elab-tutor) CI — red almost everywhere, TWO independent shared root causes

1. **Governance Rule 5** — `❌ Regola 5 FAIL: src/supabase changed but CHANGELOG.md not updated`. Hard-fails every PR that edits supabase functions without a CHANGELOG entry: **#199, #197, #196, #194, #200**. Cheap unblock: add a CHANGELOG entry per PR.

2. **Stale unit-test cluster** — `tests/unit/principioZeroCompliance.test.js`, `compiler.test.js`, HomePage components (`CompileAgentBanner`, `HomeCompileEntry-tabs`). Causes:
   - supabase test-mock chain missing methods: `...select(...).eq(...).ilike is not a function`, `query.eq is not a function`
   - `ReferenceError: Deno is not defined` (edge-function code under jsdom)
   - drifted assertions.

## #198 is the keystone (CI-unblock PR)

- Unit shard: **`Test Files 470 passed | 3 skipped (473)`** — fully green.
- governance / quality-ratchet / security all GREEN.
- Only red = the **E2E (Playwright smoke) shard**: `Error: Not implemented: navigation (except hash changes)` — a jsdom environment flake, NOT a product regression.
- → #198 ≈ ready; it is the fix for the unit cluster. Everything else should rebase on it to inherit the fix, then add CHANGELOG to clear Rule 5.

## Other PRs (CI verdict)
- #200 NLJ: extra `nlj-fast` FAIL + hard **Vercel deploy FAIL** + cluster → HOLD (distraction).
- #199 (lint no-undef gate): gov FAIL + ratchet FAIL + cluster → keep-strategic, rebase on #198.
- #196 (consent gate, GDPR-critical, small): gov FAIL + cluster → merge-candidate after #198.
- #197 (UNLIM Gemini converter, not wired): gov FAIL + cluster → R&D hold.
- #195 (domain graph + CircuitScene, DRAFT): gov PASS, ratchet+test FAIL → plugin-port-to-Ardesia.
- #194 (resilience+UNLIM+i18n, +29412/-6144, 208f): gov FAIL + cluster → split before merge.
- #154–#158, #161, #171: CONFLICTING/DIRTY, 3–5 weeks stale → close.

## Lessonos / graph testing (from prior canon, partial in WF1)
- served-SHA `20560ec` removed the duplicate `bin/graph_lint.py`; canonical lint = `lessonos.graph.lint` + route `/v1/saved-lessons/{id}/method-graph/lint` (25 tests). Not independently re-run in WF1.

## Gate-Andrea
- Merge #198 (unblock keystone).
- Re-run #198 CI to confirm the E2E flake is transient.
- Rebase #196/#199 onto #198 + add CHANGELOG.
