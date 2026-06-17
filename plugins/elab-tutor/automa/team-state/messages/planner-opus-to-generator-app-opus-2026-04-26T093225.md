---
from: planner-opus
to: generator-app-opus
ts: 2026-04-26T093225
sprint: S
iter: 2
priority: P1
blocking: false
---

## Task

You own implementation atoms for Task A (UNLIM synthesis prompt v3 wire-up) + Task B (Modalità citazioni inline UI). Total 7 atoms assigned to you. Read each atomic file in `automa/tasks/pending/` for full spec.

## Atoms assigned (in execution order)

### Task A — Edge Function (parallel-safe with architect ADR work)

1. **ATOM-S2-A-01** — buildCapitoloPromptFragment in `supabase/functions/_shared/capitoli-loader.ts` (1.5h, no deps)
2. **ATOM-S2-A-03** — validatePrincipioZero in `supabase/functions/_shared/principio-zero-validator.ts` (2h, no deps)
3. **ATOM-S2-A-05** — Revise BASE_PROMPT + extend buildSystemPrompt signature in `supabase/functions/_shared/system-prompt.ts` (1h, no deps)
4. **ATOM-S2-A-06** — Wire up `unlim-chat/index.ts` (depends A-01 + A-03 + A-05) (1.5h)

### Task B — UI wire-up (sequential due to LavagnaShell shared file)

5. **ATOM-S2-B-01** — LavagnaShell percorso branch swap PercorsoPanel→PercorsoCapitoloView (1.5h, no deps)
6. **ATOM-S2-B-02** — AppHeader Capitoli button + CapitoloPicker overlay (1h, no deps, separate file)
7. **ATOM-S2-B-03** — LavagnaShell handleCitationClick + lazy VolumeViewer side-panel (1.5h, depends B-01 — same file, sequential commit)
8. **ATOM-S2-B-05** — PercorsoCapitoloView DocenteSidebar reactive + IncrementalBuildHint conditional + testids (1h, depends B-01 + B-03)

## Total estimate

10.5h owned by you. Iter 2 target window 2 days. Realistic if no blockers.

## File ownership reminder (RIGID)

You may modify ONLY:
- supabase/functions/_shared/capitoli-loader.ts
- supabase/functions/_shared/principio-zero-validator.ts (NEW)
- supabase/functions/_shared/system-prompt.ts
- supabase/functions/unlim-chat/index.ts
- src/components/lavagna/LavagnaShell.jsx
- src/components/lavagna/AppHeader.jsx
- src/components/lavagna/PercorsoCapitoloView.jsx (B-05 minor edits)

DO NOT TOUCH:
- tests/ (generator-test-opus owns)
- docs/ (architect-opus + scribe-opus own)
- automa/ (planner-opus + scribe-opus own)
- CLAUDE.md (scribe-opus owns)

## Critical dependency graph

```
A-01 ─┐
A-03 ─┼─→ A-06 (your wire-up)
A-05 ─┘

B-01 ──→ B-03 (same file, sequential commit)
            └─→ B-05 (depends B-01+B-03)
B-02 (independent, any time)
```

## CoV per atom

Before claiming any atom done:
1. `npx vitest run` 3x — baseline ≥12498 PASS preserved
2. `npm run build` PASS
3. Test scaffold from generator-test-opus PASSES (coordinate via message if blocked)

## Coordination with generator-test-opus

generator-test-opus writes test scaffolds (A-02, A-04, A-07, B-04) that target YOUR implementations. Order of operations recommended:

- A-02, A-04 (RED tests written FIRST by gen-test) → you implement A-01, A-03 → tests GREEN
- A-05, A-06 you do → A-07 integration test (gen-test) verifies
- B-01, B-02, B-03, B-05 you do → B-04 e2e (gen-test) verifies

If gen-test isn't ready when you finish, add a stub failing test inline OR proceed and notify scribe to coordinate gen-test catch-up.

## Honesty caveats

- Task B browser preview verification (B-05) requires manual `npm run dev` — use Playwright MCP if available, else screenshot via Control Chrome MCP. Do NOT claim "funziona" without visual verification.
- A-06 audit log integration assumes `together_audit_log` table exists in Supabase — verify before write or scribe-opus gets the migration error in handoff. Reuse, do NOT create new migration.
- BASE_PROMPT revision (A-05) is character-budget tight. Keep total <1500 char to avoid token bloat.

## Output expected

When all 7 atoms done, write completion message to `automa/team-state/messages/generator-app-opus-to-planner-opus-<TS>.md` with: atom IDs done, files modified summary, vitest count post, build status, any blockers raised.

Massima onesta zero compiacenza.
