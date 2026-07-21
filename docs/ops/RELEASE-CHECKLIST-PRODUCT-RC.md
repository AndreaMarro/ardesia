# Release checklist

## Install policy and deterministic materialization

```bash
bash bin/monorepo.sh policy-studio-install-check && \
  npm --prefix apps/studio ci --ignore-scripts --no-audit --no-fund
```

## Mandatory RC quality gates

Run every command separately and preserve its exit status. Any failure blocks the release candidate.

```bash
npm --prefix apps/studio run typecheck
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run build
npm --prefix apps/studio run storybook:build
npm --prefix apps/studio run storybook:test
npm --prefix apps/studio run e2e
```

H01 H02 H03 H04 H05 H06 H07 H08 H09 are historical evidence only; their commands are not operational shortcuts.
