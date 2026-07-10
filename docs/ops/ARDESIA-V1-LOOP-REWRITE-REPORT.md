# ARDESIA V1 — loop rewrite report

Date: 2026-07-10. Current verified base:
`origin/main@9b7342fcbe8363a8033bc17be86766a1a0bdfd7d`.

## Verdict

The attached loop constitution remains directionally correct but is not
directly executable as-is: it repeats itself, mixes Claude-only and Codex
runtime assumptions, and contains stale facts about PR #150, `origin/main` and
Principio Zero runtime state. The rewritten prompt in
`ARDESIA-V1-LOOP-EXECUTABLE.md` is shorter, evidence-bound and executable for
regate, audit and one-slice execution. It does not reduce product ambition and
does not certify V1.

Current verdict: `A7_REVIEW_PASS_LOCAL`, pending PR CI before any product-code
slice.

## What Changed

| Area | Change | Why | Risk reduced |
|---|---|---|---|
| Reality gate | Updated baseline from stale `204ffefc/82bf629d` to `9b7342fc` | PR #150 and #163 are now merged and CI-green | stale execution plan |
| PR #150 | Changed from draft/blocker to merged evidence | GitHub PR #150 merged at `4f25f72c`; post-merge CI/readiness green | repeating obsolete integration work |
| P0 runtime | Changed from absolute RED to partial improvement + unknown e2e | PR #163 removed the browser prompt conflict and made book anchors active | hiding remaining tutor proof gaps |
| Tooling | Distinguished repository Claude artifacts from Codex runtime enforcement | `.claude` files exist, but Codex does not execute Claude hooks | imaginary enforcement |
| Scope | Kept only next mandatory slice in `V1-NEXT.md` | Prevents backlog-as-progress | activity without convergence |
| Security | Preserved RED/UNKNOWN gates despite scanner success | S-002/RLS/history/rotation remain unresolved | false security GREEN |
| Deploy | Split CI-green from deploy-proof | `9b7342fc` has CI evidence, not production smoke evidence | HTTP/deploy overclaim |

## Capability Mapping

| Capability | Evidence | Status |
|---|---|---|
| Codex local shell/git | Commands in this run against `/Users/andreamarro/ardesia-wt/tutor-ux` | VERIFIED |
| Worktree isolation | `GIT_DIR != GIT_COMMON`, branch `codex/v1-loop-executable-20260710` | VERIFIED |
| Multi-agent reviewer | `tool_search` exposed `multi_agent_v1.spawn_agent`; first A7 review `019f4c92-1c2a-7bf3-bddb-85e9ed3f47fe` found six issues; follow-up A7 review `019f4c96-98d5-78f2-8b29-aa54647d8a42` returned PASS | VERIFIED for this Codex Desktop run only; future runtime availability UNKNOWN |
| Claude project skill | `.claude/skills/ardesia-regate/SKILL.md` exists | VERIFIED as file, not runtime-executed here |
| Claude agents | `.claude/agents/ardesia-*.md` exist | VERIFIED as files, not runtime-executed here |
| Claude hook | `.claude/settings.json` references `scripts/guardrails/claude-pretool-safety.sh` | VERIFIED as config, runtime UNKNOWN in Codex |
| Production deploy proof for current SHA | No deploy/smoke evidence for `9b7342fc` | UNKNOWN |

## Rule Destinations

| Rule type | Destination now | Enforcement status |
|---|---|---|
| Stable repo guardrails | `AGENTS.md`, `.claude/settings.json` | partial; model + Claude hook when active |
| Regate procedure | `.claude/skills/ardesia-regate/SKILL.md` | file exists; use manually in Codex |
| Roles | `.claude/agents/ardesia-repo-cartographer.md`, `.claude/agents/ardesia-adversarial-reviewer.md` | file exists; Codex reviewer spawned manually when needed |
| Volatile state | `docs/ops/V1-LOOP-STATE.md`, `V1-NEXT.md`, claim/security matrices | document enforcement |
| Security hooks | CI secret scan plus documented hook targets | partial; S-002/RLS/history not closed |
| Product acceptance | prompt + future tests/matrices | not product-complete |

## Fundamental Requirement Check

| Fundamental requirement | Present? | Enforcement | Evidence | Residual risk |
|---|---:|---|---|---|
| Principio Zero authentic wording | yes | canon + prompt + tests target | `V1-PRINCIPIO-ZERO-CANON.md`, PR #163 | tutor e2e UNKNOWN |
| Teacher centrality and kit | yes | prompt/canon | `plugins/elab-tutor/CLAUDE.md` | runtime surfaces not fully audited |
| Vol./pag. anchors and exact book words target | yes | prompt target + limited PR #163 tests | PR #163 verifies browser prompt conflict removal and Vol./pag. anchor post-processing | exact wording e2e, backend and edge paths remain UNKNOWN |
| Book semantic/topological/visual parity | yes | prompt + matrices | `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md` | 0 certified experiments |
| mounted/steps equivalence | yes | prompt/test target | executable prompt | current implementation RED/UNKNOWN |
| SimulationScene as domain truth | yes | prompt/canon | executable prompt | duplicated models possible |
| Typed AI circuit commands | yes | prompt/schema target | executable prompt | implementation incomplete |
| ToolHost enforcement | yes | release gate | first P33 boundary | direct callback path likely RED |
| LessonOS spine | yes | integration gate | executable prompt | backend sync/reopen unknown |
| Graph/memory | yes | integration gate | executable prompt | not end-to-end proven |
| Knowledge Cards/post-it | yes | product gate | executable prompt | not next slice |
| UI simple/joyful/iPad/LIM | yes | UX gate | executable prompt | not verified now |
| Backend/RLS | yes | security/backend gate | security matrix | UNKNOWN |
| Deploy tied to SHA | yes | deploy-proof gate | executable prompt | current SHA deploy UNKNOWN |
| Security/GDPR/minors | yes | security matrix + scans | `V1-SECURITY-MATRIX.md` | S-002/history/RLS open |
| Independent verification | yes | agent/reviewer rule | multi-agent availability + A7 file | review must be run per slice |
| Honest RED/stop | yes | terminal states | executable prompt | operator discipline required |

The table proves preservation of requirements in the prompt, not product
completion.

## Instructions Removed or Reframed

- Removed stale claim that PR #150 is draft/open.
- Removed stale base SHA and stale `204ffefc` deploy assumptions.
- Reframed “create many docs/skills/agents” into “use/create only when the
  current slice exercises them”.
- Reframed broad swarm language into bounded reviewer/cartographer usage.
- Preserved the ambition of Tinkercad/book/teacher journey as matrices and
  gated scenarios, not slogans.

## Current Non-Applicability Notes

- Claude hook and agent files may be valid for Claude Code, but Codex Desktop
  does not prove their runtime execution.
- No provider key rotation, Vercel/Supabase secret inspection, or production
  deploy was performed in this docs update.
- No new product-code claim is made by this rewrite.

## Next Review Target

A7 should review these changed docs against:

1. stale facts;
2. weakened requirements;
3. overclaim around PR #150/#163;
4. fake enforcement from `.claude` files;
5. missing security/deploy caveats;
6. whether `V1-NEXT.md` names exactly one next slice.
