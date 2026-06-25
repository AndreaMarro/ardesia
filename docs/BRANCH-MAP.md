# BRANCH-MAP

Source: WF1 GitHub deep audit (read-only, 2026-06-25). "Pushed" = present on GitHub; "local-only" = present on mac-mini, absent on GitHub (confirmed via `gh api` 404).

## ardesia (2 branches on GitHub)

| branch | GitHub SHA | mini state | note |
|---|---|---|---|
| `main` | `2b7c08e` | — | default; UNPROTECTED |
| `session/long-2026-06-25` | `902b98b` | mini `b6de5673` (+1 unpushed) | head of PR #1 |

**LOCAL-ONLY (absent on GitHub, 404):** `ci/engine-sync-guard` (CONFIRMED local-only tech branch), `claude/secret-purge-gemini`.

## lessonos (6 branches on GitHub)

| branch | GitHub SHA | note |
|---|---|---|
| `auto/main` | `20560ec` | default (factory line); UNPROTECTED |
| `main` | `92e393d` | ratified line (PR #3 target) |
| `fix/lti-aud-failclosed` | — | feature |
| `backup/mini-auto-main-2026-06-24-be3cbc6` | — | backup |
| `backup/ws3-cors-938f417` | — | backup |
| `HEAD` | — | — |

Mini `auto/main` HEAD = `20560ec` (unpushed vs origin = 5 commits).

**LOCAL-ONLY (absent on GitHub, 404):** `fix/auth-validator-flag-gated` (CONFIRMED), `feat/mcp-stdio-transport` (CONFIRMED), plus `claude/c1-ocr-local`, `claude/c5-export`, `claude/m1-seam`, `claude/sv-gates-lessonos`, `merge/serving-backport`, `t6r/*` (5).

## ardesia-studio (6 branches on GitHub)

| branch | GitHub SHA | note |
|---|---|---|
| `main` | `839e009` | default; PROTECTED (status check `gate`) |
| `auto/main` | `f881a78` | factory line — **diverges from mini** |
| `studio/consolidate-2026-06-25` | `899a350` | durable consolidation push; **MATCHES mini HEAD** |
| `design/shell-v1` | — | feature |
| `backup/mini-studio-2026-06-24-022f03c` | — | backup |
| `backup/storia-manual-demo` | — | backup |

### Divergent lineage (studio)

Mini `auto/main` HEAD = `899a350`, but GitHub `auto/main` = `f881a78`. The mini's work was pushed as a **new branch** `studio/consolidate-2026-06-25` (`899a350`), NOT onto `auto/main`. So GitHub `auto/main` is stale relative to the mini, while the mini's actual head lives under `studio/consolidate-*`. Mini reports 332 unpushed commits vs its LOCAL bare origin; the `899a350` SHA match suggests these are represented on GitHub via `studio/consolidate-2026-06-25` (full commit-set diff not computed — see unknowns).

## ardesia-vault / ardesia-tools / ardesia-wiki

Single default branch each (`main`/`main`/`master`); no tech or backup branches.

## elab-tutor (815 branches — pollution)

- Default `main`.
- **Meaningful:** `feat/*`, `fix/*`, `feature/*`, `audit/*`, `docs/*` sprint branches.
- **NOISE:** ~700+ `mac-mini/iter36-user-sim-YYYYMMDD-HHMM` (15-min-cadence user-sim snapshots, May 1–8) + ~33 `auto/test-<module>` + 8 `task-t_*`.
- Tags: `iter-37-phase-3-close-2026-04-30`, `demo-25may-deploy`, `baseline-iter42-pm-final`.

## The 3 local-only tech branches (consolidated)

| repo | branch | status |
|---|---|---|
| lessonos | `fix/auth-validator-flag-gated` | LOCAL-ONLY (404 on GitHub) |
| lessonos | `feat/mcp-stdio-transport` | LOCAL-ONLY (404 on GitHub) |
| ardesia | `ci/engine-sync-guard` | LOCAL-ONLY (404 on GitHub) |

These three carry real tech work but exist only on the mac-mini. If they should be durable, they must be explicitly pushed (gate-Andrea).

## Lineage-trap note

`lessonos` and `maestro-studio` (ardesia-studio) use a **LOCAL BARE repo as `origin`** (`/Users/progettibelli/lessonos.git`, `/Users/progettibelli/studio.git`); GitHub is only a **secondary push remote** (`github`). Consequence: factory commits land on the local bare repo, and **GitHub stays behind by design** unless something explicitly pushes to the `github` remote. `ardesia` is the only mini code repo whose `origin` is GitHub directly. This is the root cause of the GitHub lag and of the studio divergent lineage above. Future sessions: do not assume GitHub reflects the mini's latest work for lessonos/studio.
