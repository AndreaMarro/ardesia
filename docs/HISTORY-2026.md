# HISTORY-2026 (concise milestone timeline)

Source: WF1 audit evidence + firsthand `git log` on the mac-mini (2026-06-25). Recent-focused and honest — only what is grounded in commits or audit findings. Older/undated items are kept terse.

## June 2026 (recent, firsthand commit-grounded)

### lessonos (factory line `auto/main`) — latest 6 commits
- `20560ec` refactor(graph): remove redundant `bin/graph_lint.py` (duplicate of canonical `lessonos.graph.lint`).
- `781a02b` feat(graph): ZERO-LLM method-graph lint (cycles / orphans / ungrounded / dangling).
- `410562c` feat(factory): served-SHA done-gate (flag-gated, inert by default).
- `b368438` feat(health): expose served binary `git_sha` to detect a stale process.
- `ea6390e` fix(factory): `replenish.sh` STOP-guard — skip backlog when `~/lessonos/STOP` present (it was running on its own launchd cadence, churning backlog while paused). Anti-bloat.
- `9fac811` feat(api): `GET /v1/saved-lessons/{id}/living-manual` per-concept envelope for studio (additive, ZERO-LLM, gate 3737).

### ardesia-studio — latest commits
- `899a350` docs(studio): `.impeccable.md` design-context (carta/ardesia tokens, docenti audience).
- `9cb4a7c` style(studio): Impeccable restyle of `?demo=manual-storia` (carta/ardesia tokens, markdown→chips, 44px iPad targets).
- `7b11703` feat(studio): student-pack export + browser-gate done-marker in `?demo=manual-storia`.
- `2e5cf5f` feat(studio): citazione→lavagna in `?demo=manual-storia`.
- `dba5676` feat(studio): demo route `?demo=manual-storia` rendering the live served storia living-manual via ArdesiaApi.

### ardesia (monorepo hub) — latest commits
- `b6de5673` docs(knowledge): graph-lint dup REMOVED + deep-audit findings (studio 332-ahead, vercel preview-moat SSO-gated, lessonos `20560ec`, gate 3743).
- `902b98b` docs(knowledge): graph-lint + gate 3749 + lessonos `781a02b`; reconcile 30-vs-37 concepts.
- `6774b60` docs(knowledge): F2b served-SHA gate landed flag-gated.
- `e42b246` feat(knowledge): F1 `ops/knowledge` fabric — SoT STATE files + GSD context-packet.
- `9b7047a` docs: PROMPT-AUTONOMA-v12 (autonomous session prompt).
- `cd4029d8` docs(canon): ELAB-SCENE-FORGE — manual→identical-physical-scene moat.
- `6df1a4bd` docs(canon): ARDESIA plugin-native canon (architecture/product/marketplace/elab-as-plugin).
- `2b7c08ed` docs(monorepo): README + ARDESIA-MAP navigation.

## June 2026 — platform-state milestones (audit-grounded)

- **Knowledge Fabric introduced** — `ardesia` PR #1 (draft, CLEAN): `ops/knowledge` + GSD context-packet; SoT STATE files.
- **ZERO-LLM method-graph lint** landed on lessonos (`781a02b`), then de-duplicated against the canonical `lessonos.graph.lint` (`20560ec`).
- **Served-SHA done-gate + health git_sha** added to detect/prevent a stale served binary marking work done (`410562c`, `b368438`).
- **Studio demo slice** — `?demo=manual-storia` route built end-to-end (live served living-manual → citations → student-pack export → Impeccable restyle).
- **GitHub deep audit (read-only)** — confirmed 7 repos, branch-protection gap (5/7 unprotected defaults), 3 local-only tech branches, the local-bare-origin lineage trap, and the studio divergent lineage.
- **Vercel deep audit (read-only)** — confirmed ardesia-api-vercel prod 404 root cause (failed build, `functions:index.py` vs missing `api/`), the on-disk-only vercel.json fix, and the SSO-gated working preview `neaicikfq`.
- **ELAB PR triage** — 14-PR graveyard diagnosed: two independent shared CI breaks (governance Rule 5 + stale unit-test cluster); #198 identified as the green-able keystone.
- **llm_wiki evaluated** — nashsu/llm_wiki (GPLv3, 12.8k stars, v0.5.1) → decision SANDBOX-ADOPT (P1), Ollama-only, gated on a firsthand egress audit.

## Earlier (terse, from repo metadata)

- **elab-tutor** is the pre-ARDESIA product line: heavy iteration through April–May (tags `iter-37-phase-3-close-2026-04-30`, `demo-25may-deploy`, `baseline-iter42-pm-final`; ~700 `mac-mini/iter36-user-sim-*` 15-min snapshot branches May 1–8). Now parallel/legacy relative to the ARDESIA platform.

## Honesty notes

- SHAs and commit messages above are firsthand from the mac-mini on 2026-06-25; GitHub may lag for lessonos/ardesia-studio due to the local-bare-origin lineage trap (see BRANCH-MAP.md).
- Gate/test counts (e.g. "gate 3737/3743/3749") are as stated in the commit messages / audit, not independently re-run in this pass.
