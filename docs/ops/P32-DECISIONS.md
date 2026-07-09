# P32 — Decisions

## D1 — Reachability via activation + `elementFromPoint`, not a real click-through
**Decision:** close the P31 reachability caveat with a raw-mouse **activation**
(`dblclick`) + a topmost **hit-test** (`elementFromPoint`), keeping the logic click
as `dispatchEvent`.
**Why:** Excalidraw embeddables are inert until activated (verified:
`montaggio-canvas.spec.ts:55-57`), and the real-pointer *routing* to embedded
controls is the known flake source P31 fought. A hit-test proves reachability
(visible + enabled + topmost) deterministically — it fails if a regression overlays
the strip — without reintroducing the flaky click. This is exactly what P31-NEXT
follow-up #1 asked for ("raw-mouse activation + reachability assertion").
**Status:** implemented, GREEN (×5). Caveat closed.

## D2 — Defer a minimal Playwright smoke in CI (do NOT add it in this slice)
**Decision:** keep Playwright e2e out of CI for now; do not bundle a CI browser job
into the reachability slice.
**Why:** CI `studio` job (typecheck+vitest+build) already ~3.5 min; adding Playwright
needs browser install/caching, a headless vite server, and a flake budget — a
separate infra slice that deserves its own small ADR. The e2e reliability is
provable locally (`--repeat-each`) today; the reachability regression is now caught
by the spec. One narrow slice per iteration.
**Status:** recorded as a NEXT candidate (see [P32-NEXT.md](P32-NEXT.md)). Not done.

## D3 — Un-Draft / merge of PR #150 is Andrea's call
**Decision:** do not un-Draft or merge #150 autonomously.
**Why:** AGENTS.md governance — never auto-merge to main. #150 is now unambiguously
green (CI 4/4 + local e2e ×5 + reachability closed); the decision to un-Draft/merge
belongs to Andrea.
**Status:** open (human gate).

## D4 — Write only the `tutor-ux` worktree
**Decision:** confine all writes to `~/ardesia-wt/tutor-ux`.
**Why:** 28 worktrees share one `.git`; `VOLUME 3/ardesia` is dirty on a codex
branch. Single-writer safety + memory gotcha (checkout dirty → only worktrees).
**Status:** enforced.
