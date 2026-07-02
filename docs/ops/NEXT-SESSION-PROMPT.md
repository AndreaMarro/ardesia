# NEXT-SESSION-PROMPT - ARDESIA Monorepo Integration

## Active Context

Date: 2026-07-02

You are Codex on Andrea's Mac, working in:

```text
/Users/andreamarro/VOLUME 3/ardesia
```

Goal: continue ARDESIA monorepo integration with small, verified PRs. Do not add new product ideas.

## Current State

- PR #8 merged: Vercel demo live evidence for board -> plugin -> Run -> export/import.
- PR #13 merged: ELAB Vol.1 cap.6 esp.1 context packet.
- PR #14 merged: canonical fixture plus drift guard.
- PR #15 merged: adapter contract.
- PR #16 is open, draft, and mergeable: board payload / embeddable contract for ELAB Vol.1 cap.6 esp.1.
- PR #6 remains dirty; ignore it.
- AgentMemory remains degraded; do not mutate it.
- Vercel demo exists, but it is MVP live smoke evidence, not product-ready.

## Just Completed

Track A was selected for the current monorepo sprint: safe root command surface.

This PR adds:
- `package.json`
- `bin/monorepo.sh`
- `docs/ops/MONOREPO-COMMAND-SURFACE-COV.md`
- this updated `docs/ops/NEXT-SESSION-PROMPT.md`

Why Track A:
- #16 was still draft, so no new Simulation/ELAB feature should start.
- The expected `docs/ops/VOLUME3-GITHUB-*.md/tsv` inventory filenames were not present on `origin/main`.
- Root command surface files existed locally as a small P0 candidate and were safe to import.

## Hard Rules

- No production deploy.
- No AgentMemory mutation.
- No launchd/scheduler changes.
- No PR #6.
- No mass import from Volume 3.
- No secrets, personal data, logs, dumps, cache, dependency directories, large assets, or unauthorized PDFs.
- No broad runtime refactor.
- Keep each PR to five files or fewer unless Andrea explicitly approves otherwise.
- Use COV for claims and verification.

## Immediate Next Action

1. Resolve PR #16 before starting another Simulation/ELAB micro-slice.
2. If #16 is still draft, either review it again or work only on monorepo docs/command-surface/onboarding.
3. If #16 is merged, the next Simulation/ELAB micro-slice may start only with Andrea's explicit direction.

## Suggested Next Monorepo Slice

If the command-surface PR is merged and #16 remains unresolved, use Track B:

```text
docs(ops): add monorepo collaborator onboarding
```

Target files, max three:
- `docs/ops/MONOREPO-WORKBOARD.md`
- `docs/ops/COLLABORATOR-ONBOARDING.md`
- `docs/ops/MONOREPO-NAVIGATION.md`

Keep it factual:
- what ARDESIA is;
- where apps/packages/plugins/docs/ops live;
- which PRs are merged;
- what not to touch;
- how to pick a micro-task;
- how to write COV;
- Codex vs Claude division;
- AgentMemory and Vercel status;
- Simulation/ELAB status.

## Verification Pattern

Before any commit:

```bash
git status -sb
git diff --check
git diff --stat
```

For command surface changes:

```bash
npm run --silent
bash -n bin/monorepo.sh
bash bin/monorepo.sh status
```

Run targeted tests if code changes. Do not run production deploys.
