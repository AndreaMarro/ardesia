# Release checklist

## Install policy and deterministic materialization

```bash
bash bin/monorepo.sh policy-studio-install-check && \
  npm --prefix apps/studio ci --ignore-scripts --no-audit --no-fund
```

## Mandatory RC quality gates

Run every command separately and preserve its exit status. Any failure blocks the release candidate.

```bash
set -euo pipefail
npm --prefix apps/studio run typecheck
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run build
npm --prefix apps/studio run storybook:build
npm --prefix apps/studio run storybook:test
npm --prefix apps/studio run e2e
```

## Publication binding gate

Run from the exact final candidate checkout. The candidate remains HEAD so the oracle also verifies every descendant after the evidence commit E.

```bash
set -euo pipefail
candidate_sha="$(git rev-parse HEAD)"
workflow_path=.github/workflows/ci.yml
workflow_anchor_sha="$(git log --first-parent --reverse \
  -S'ARD11_D0P_A_ORACLE_BINDING_V2=' --format=%H "$candidate_sha" -- "$workflow_path" | head -n 1)"
oracle_anchor_sha="$(git show "$workflow_anchor_sha:$workflow_path" | sed -n \
  's/^  # ARD11_D0P_A_ORACLE_COMMIT_V2=\([0-9a-f]\{40\}\)$/\1/p')"
test "${#workflow_anchor_sha}" -eq 40
test "${#oracle_anchor_sha}" -eq 40
state_root="$(mktemp -d /tmp/ardesia-studio-policy.XXXXXX)"
trap 'rm -r -- "$state_root"' EXIT
bash bin/monorepo.sh policy-studio-postcommit-binding-check \
  --candidate-sha "$candidate_sha" \
  --oracle-anchor-sha "$oracle_anchor_sha" \
  --workflow-anchor-sha "$workflow_anchor_sha" \
  --pending-task ARD-11-D0P-B-STUDIO-INSTALL-POLICY \
  --index-path docs/ops/evidence/studio-install-policy/index.jsonl \
  --records-dir docs/ops/evidence/studio-install-policy/records \
  --canonical-dir docs/ops/evidence/studio-install-policy/canonical \
  --revocations-dir docs/ops/evidence/studio-install-policy/revocations \
  --state-output "$state_root/publication-state.json" \
  --audit-mode receipt-intent \
  --expected-core 43 \
  --expected-ledger-generic 3 \
  --expected-receipt-semantic 16
node -e 'const fs=require("node:fs"); const s=JSON.parse(fs.readFileSync(process.argv[1], "utf8")); if (s.candidateSha !== process.argv[2] || s.publicationBindingV1 !== "COMPLETE") process.exit(1)' \
  "$state_root/publication-state.json" "$candidate_sha"
```

H01 H02 H03 H04 H05 H06 H07 H08 H09 are historical evidence only; their commands are not operational shortcuts.
