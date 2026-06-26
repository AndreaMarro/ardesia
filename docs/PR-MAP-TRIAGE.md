# PR Map & Triage — ardesia / lessonos / elab-tutor (2026-06-26)

Read-only. Recommendations only — NO merges. All states verified firsthand via gh on 2026-06-26.

## Cross-repo open PRs
| Repo | Open | Notes |
|---|---|---|
| elab-tutor | 6: #194 #195 #196 #197 #199 #200 | triage focus; #201 + #198 merged |
| lessonos | 1: #3 | auto/main→main, 100 commits, MERGEABLE/BLOCKED |
| ardesia | 2: #1 #2 | both draft + CONFLICTING/DIRTY, docs-only |

## Merged baseline (confirmed)
- #201 `chore(security): remove X-Elab-Api-Key theater` — MERGED 2026-06-26, sha `4760e2be` = **main HEAD**.
- #198 `fix(ci): sblocco CI rossa` — MERGED 2026-06-25, sha `d3589ac6`.

## ELAB classification
| PR | Draft | Mergeable | CI test | Size | Verdict |
|---|---|---|---|---|---|
| #196 consent P0 fix | no | CONFLICTING | fail (re-ran 06-25) | 6f +178/-22 | **REBASE→keep** |
| #199 eslint no-undef gate | no | CONFLICTING | fail (re-ran 06-25) | 11f +967/-3 | **REBASE→keep** |
| #197 Gemini FC converter | no | MERGEABLE/UNSTABLE | fail (06-01 stale) | 4f +270/-0 | **HOLD** (not wired) |
| #194 elabcode re-upload | no | CONFLICTING | fail | 208f +29412/-6144 | **HARVEST→close** |
| #195 domain graph/CircuitScene | yes | CONFLICTING | fail | 18f +11192/-0 | **HARVEST→close** |
| #200 NLJ MVP scaffold | yes | MERGEABLE/UNSTABLE | fail + Vercel fail | 216f +23433/-3 | **CLOSE** (own repo exists) |

### Rationale (short)
- **#196 keep**: real P0 — checkConsent joins non-existent `student_sessions.session_id` → UNLIM refused every real user under STRICT_CONSENT_UNKNOWN_REFUSE. Small. CONFLICTING + test-fail likely merge-rot; rebase + re-run.
- **#199 keep**: hard-fail lint gate + remoteCompileCode (TRACK-D root). A gate PR must itself be green/conflict-free before it polices others; rebase, green, land after #196.
- **#197 hold**: author states "NON wirato in hot-path — la regex resta default"; 4 new files, zero modifications = zero regression, but no consumer. Park.
- **#194 harvest+close**: 208f/+29k, month-old, CONFLICTING, gov+ratchet+3×test fail; won't rebase clean over #198/#201. Extract slices into small PRs, close mega-PR.
- **#195 harvest+close**: draft, +11k all-additions, CircuitScene is spec-only (0/88). Value = artifacts; move to docs, close draft.
- **#200 close**: 216f/+23k second product inside elab-tutor; standalone `numerical-lab-journey`/`numeria` repos already exist. Vercel + nlj-fast + gov + test all fail. Belongs in its own repo.

## Recommended order (ELAB) — one at a time, rebase→green→review→land
1. **#196** (consent P0) — rebase onto 4760e2be, land first (unblocks real users).
2. **#199** (lint gate) — rebase, make test green, land second.
3. **#197** — keep on HOLD until a hot-path consumer needs it.
4. **#194 / #195** — harvest usable slices into small PRs, then close.
5. **#200** — close; redirect to numerical-lab-journey repo.

## Other repos
- **lessonos #3**: MERGEABLE/BLOCKED, 100 commits (title says "12" — stale). Served :8200 sha=98ac0f4=auto/main already. **HOLD** — main-merge is gate-listed; BLOCKED = branch protection as designed. Owner-gated.
- **ardesia #1 (21f) / #2 (24f)**: both draft + CONFLICTING/DIRTY, docs-only. **REBASE→keep**; land #2 (maps/ADRs/audits) first, then #1, resolving ops/knowledge overlap.

Full doc with per-PR detail + evidence at the path.