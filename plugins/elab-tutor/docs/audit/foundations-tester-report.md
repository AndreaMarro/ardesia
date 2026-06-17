# Foundations Tester Report — 2026-04-21

## CoV 3x Vitest

| Run | Count | Files | Duration |
|-----|-------|-------|----------|
| 1   | 12149 | 206   | 69.77s   |
| 2   | 12149 | 206   | 51.43s   |
| 3   | 12149 | 206   | 45.33s   |

**Verdict: PASS.** All 3 identical. Above baseline 12137 (+12).

## Build

- Status: PASS (exit 0)
- Time: 56.44s
- PWA: 30 precache entries

## Script Smoke Tests

| Script | Exit | Notes |
|--------|------|-------|
| daily-preflight.sh --dry-run | 0 | JSON output, ready: true |
| daily-audit.sh --dry-run | 0 | Silent success |
| push-safe.sh --dry-run | 0 | Branch identified, dry-run |
| deploy-preview.sh --dry-run | 0 | Would build + vercel preview |
| deploy-prod.sh --dry-run | 0 | Blocks: "Approval file not found" (correct) |
| end-week-gate.sh --dry-run | 0 | 10/13 pass (post-bugfix deb48fc) |
| end-day-handoff.sh --dry-run | 0 | Writes handoff template |
| no-regression-guard.sh commit --dry-run | 0 | Reads baseline, dry-run skip |

## Playwright

- Spec files: 12 in tests/e2e/
- Total tests: 31
- Real run (01-homepage): 3/3 PASS (12.0s)

## PZ v3 Grep

- `supabase/functions/_shared/`: 1 match = FALSE POSITIVE (prohibition text "MAI ... Docente leggi")
- `src/`: 0 matches
- **Zero actual violations.**

## Prod Live

- https://www.elabtutor.school/ → HTTP 200, 0.69s

## CI Status

- Last 3 runs: SUCCESS / SUCCESS / SUCCESS
- Open PRs: #15 (sett1-day01), #12 (live-verify, DRAFT)

## Edge Function

- unlim-chat curl: HTTP 401 UNAUTHORIZED_LEGACY_JWT
- Access issue, not code bug. JWT may need rotation.

## Red Flags

1. **end-week-gate.sh had pipefail bug** — FIXED in deb48fc
2. **Edge Function JWT 401** — cannot verify PZ v3 live via CLI
3. **8 unpushed commits** — work not synced to remote
4. **daily-audit.sh --dry-run silent** — no stdout feedback
5. **Dual Supabase project refs** — euqpdueopmlllqjmqnyb vs vxvqalmxqtezvgiboxyv

## Verdict

Foundations PASS with caveats. No regressions. Scripts functional. E2E scaffold ready.
