# Sprint 6 Day 37 — Sprint Contract (Harness 2.0)

**Date:** 2026-04-23
**Branch:** `feature/sprint-6-day-37-handlers`
**Goal:** Wire 9 OpenClaw `unlim.*` handlers in `window.__ELAB_API.unlim` so `tools-registry.audit.test.ts` `live_broken=0` for them.

## Atomic Goal

Implement bridge layer for 9 Sprint-5 declared handlers in `src/services/simulator-api.js` `unlim:` namespace, delegating to existing services where present, emitting events for UI-bound actions. No new external dependency. No engine touch.

## Acceptance Criteria

| # | AC | Verify |
|---|----|--------|
| AC-1 | 9 functions exist on `window.__ELAB_API.unlim` (speakTTS, listenSTT, saveSessionMemory, recallPastSession, showNudge, generateQuiz, exportFumetto, videoLoad, alertDocente) | unit test `typeof === 'function'` |
| AC-2 | Each handler returns documented shape (Promise or sync object), no throw on minimal valid input | unit test per handler |
| AC-3 | Handlers wired to real services delegate (speakTTS→voiceService, listenSTT→voiceService, saveSessionMemory→projectHistoryService, recallPastSession→projectHistoryService, showNudge→nudgeService, alertDocente→nudgeService) | spy on service mock |
| AC-4 | Handlers UI-bound (generateQuiz, exportFumetto, videoLoad) emit named events via `__ELAB_EVENTS` | listener spy receives payload |
| AC-5 | `tools-registry.ts` updates: 6 wired handlers move `status: 'todo_sett5'` → `status: 'live'`. 3 remain `todo_sett5` (event-only, UI not yet listening) — explicit comment why | grep registry |
| AC-6 | `tools-registry.audit.test.ts` `live_broken` count for the 6 wired = 0 against mocked `__ELAB_API` | vitest |
| AC-7 | Vitest baseline ratchet: total ≥ 12164 + 9 (one test per handler minimum) | `automa/baseline-tests.txt` |
| AC-8 | CoV 5x identical pass count | shell loop |
| AC-9 | `npm run build` succeeds | shell |
| AC-10 | No engine file modified (`src/components/simulator/engine/**`) | git diff |

## Test Strategy (TDD RED → GREEN → REFACTOR)

1. **RED**: write `tests/unit/services/simulator-api-unlim-handlers.test.js` with 9+ test blocks. Mock voiceService, nudgeService, projectHistoryService.
2. **GREEN**: implement minimal handlers in `simulator-api.js` `unlim:` block.
3. **REFACTOR**: extract shared helpers if duplication; update tools-registry status.

## Rollback Plan

Single commit. If E2E or build breaks: `git revert HEAD` on branch (no main impact, branch ahead 0 currently).

## Success Metrics — 4 Grading (Harness 2.0)

| Dimension | Score 1-10 | Rationale |
|-----------|-----------|-----------|
| Design quality | TBD post | clean delegation pattern, no engine touch |
| Originality | TBD post | reuse existing services vs new infra |
| Craft | TBD post | TDD strict, CoV 5x, audit test integration |
| Functionality | TBD post | 6/9 truly wired honest, 3/9 event-only |

## Honest Caveats Pre-Impl

- **3 handlers (generateQuiz, exportFumetto, videoLoad) NOT fully end-to-end live**: emit events only. UI subscribers (QuizPanel, UnlimReport, video component) need separate Day 38+ work to listen and act. Marked event-stub in registry comments.
- **Supabase migrations `openclaw_tool_memory` + `together_audit_log` still NOT applied** (CLAUDE.md bug #8). saveSessionMemory uses localStorage path only via projectHistoryService.
- **Day 37 single agent (no team-dev dispatch)**: scope small enough for direct impl, dispatch overhead > benefit.

## MCP Calls Target

≥ 15 logged in audit:
- claude-mem search + save (≥ 4)
- serena find_symbol + search_for_pattern (≥ 3)
- supabase list_edge (≥ 1)
- context7 docs (≥ 2 — Vitest, EventTarget patterns)
- gh PR + run list (≥ 2)
- Playwright browser smoke (≥ 1 if dev server reachable)

## Out-of-Scope (Day 38+)

- QuizPanel listener wiring for `quizRequested`
- UnlimReport listener wiring for `fumettoExportRequested`
- Video component for `videoLoadRequested`
- Apply Supabase migrations
- E2E spec for handlers (debt: smoke unit only Day 37)
