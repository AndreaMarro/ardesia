# REPO-BRANCH-MAP — AndreaMarro GitHub repos

_Dated 2026-06-26. Read-only audit. Claim→Evidence (see appendix). SHAs 7-char._

## TL;DR
- **ardesia monorepo = hub** (engine+studio+tools+docs, origin=github). Split live repos: `lessonos` (engine), `ardesia-studio` (ToolHost), `ardesia-tools` (loop tooling), `ardesia-wiki` (knowledge), `elab-tutor` (product).
- **No lineage trap**: mini `lessonos auto/main` = github `auto/main` = **98ac0f4**; served :8200 `git_sha=98ac0f4`. Serving == github == mini all agree.
- **`auto/main` is the active default** on autonomous-build repos (`lessonos`, `ardesia-studio`); their `main` is protected but stale/diverged legacy.
- **elab-tutor = 816 branches** (658 `mac-mini/*`); `main` HEAD `4760e2b` == #201 merge (theater removal); 6 PRs open (#194–197, #199, #200).

## Active repos — table

| Repo | Default branch | Key branches (sha) | Role | Origin |
|---|---|---|---|---|
| **ardesia** | `main` (02973e0) | main 02973e0; docs/knowledge-maps-2026-06-25 3420b18; session/long-2026-06-25 902b98b | **Hub** monorepo | github (mini origin = github URL) |
| **lessonos** | `auto/main` (98ac0f4) | auto/main 98ac0f4 (served+github+mini match); main 92e393d ⚠ protected/stale (diverged +1395/−2); fix/lti-aud-failclosed 5c60f3d; fix/auth-validator-flag-gated 9be3632; feat/mcp-stdio-transport 943fd38; backups be3cbc6/938f417 | **Engine** | mini origin = **local bare** /Users/progettibelli/lessonos.git (⚠ not github directly) |
| **ardesia-studio** | `auto/main` (f881a78) | auto/main f881a78; main 839e009 ⚠ protected/stale (diverged +55/−1); studio/consolidate-2026-06-25 899a350; design/shell-v1 4f50285; backups 022f03c/899a350 | **ToolHost** | github |
| **ardesia-tools** | `main` (6640219) | main 6640219 (single branch) | **Loop tooling** | github |
| **ardesia-wiki** | `main` (b42ed2e) | main b42ed2e; master f564419 ⚠ legacy (master→main moved) | **Knowledge** | github |
| **elab-tutor** | `main` (4760e2b) | main 4760e2b (== #201 merge); 815 others (658 mac-mini/, 33 auto/, 31 fix/, 21 feat/, 19 feature/, 8 sprint/, 8 docs/) | **Product** | github |
| **ardesia-vault** | `main` (f0145f6) | main f0145f6 (single branch) | SoT hub — remote present but **unused** (Syncthing) | github |

**elab-tutor open PRs (6):** #200 NLJ scaffold · #199 eslint no-undef gate · #197 Gemini fn-calling · #196 consent-gate · #195 ELAB domain graph · #194 elabcode resilience. (#198, #201 merged.)

## Lineage verification (no-trap)
| Surface | git_sha |
|---|---|
| github lessonos/auto/main | 98ac0f4 |
| mini ~/lessonos auto/main | 98ac0f4 |
| served :8200 /health | 98ac0f4 |

All three agree. ⚠ Nuance: mini lessonos `origin` = local bare repo, not github — github updated via separate push (stale push could re-open trap). `ardesia` origin points straight at github.

Dormant/archived (~20 repos): numeria/numeria-lab/numerical-lab-journey (Numeria side-project), elab-volumi, elab-website, unlim-intelligente, elab-galileo-nanobot, + ~14 archived (claudeco, COVID-19, scaffold names).

Full doc with diagram at `/Users/andreamarro/VOLUME 3/docs/REPO-BRANCH-MAP.md`.