# Monorepo Command Surface COV

Date: 2026-07-02

## Decision

Track A was selected: add a safe root command surface for ARDESIA.

Reason:
- PR #16 is still draft, so no new Simulation/ELAB feature should start on the same perimeter.
- The requested Volume 3 inventory files were not present under the exact expected names on `origin/main`.
- A root `package.json` plus `bin/monorepo.sh` existed locally as a small P0 candidate and could be reviewed without importing Volume 3 wholesale.

## Scope

Files in this PR:
- `package.json`
- `bin/monorepo.sh`
- `docs/ops/MONOREPO-COMMAND-SURFACE-COV.md`
- `docs/ops/NEXT-SESSION-PROMPT.md`

The command surface only routes existing workspace commands:
- `packages/engine` via `uv`
- `apps/studio` via `npm --prefix apps/studio`
- `plugins/elab-tutor` via `npm --prefix plugins/elab-tutor`
- `ops/tools` status/bootstrap only when its npm lockfile exists

## Safety Review

Confirmed in the edited files:
- no production deploy command;
- no AgentMemory mutation;
- no launchd or scheduler mutation;
- no broad runtime refactor;
- no file import from Volume 3;
- no `.env` file;
- no large asset, PDF, dump, cache, build artifact, or dependency directory;
- no secret-like value.

`factory:readonly` is intentionally read-only: it prints health/status data through `ssh macmini` and does not restart, kill, enable, disable, or edit services.

## Verification

Local checks run:

```bash
npm run --silent                         # pass, exit 0
bash -n bin/monorepo.sh                  # pass
bash bin/monorepo.sh status              # pass; detected engine, studio, ELABTutor, ops tools
git diff --check                         # pass
python3 <secret-scan-from-session-order> # pass on PR files: SECRET_SCAN_OK
wc -c <PR files>                         # 9,641 bytes total
```

Destructive scan:
- PR-file scan: no matches.
- Whole-repo scan: matches exist only in pre-existing tracked docs/scripts outside this PR, including historical deploy notes and engine driver files. No new match is introduced by this PR.

Full root `npm run verify` was not run in this PR because the change is a command wrapper, and the requested Track A verification is syntax/status/diff plus scans.

## Rollback

Revert this PR. That removes the root command surface and restores the previous per-workspace command flow.

## Next

Resolve PR #16 first. After #16 is merged or explicitly parked, choose one next monorepo micro-slice from the verified inventory path or add collaborator onboarding if the inventory remains unavailable.
