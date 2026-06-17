# ARDESIA — monorepo (piattaforma local-first per docenti)
5 repo consolidati, storia preservata. Bootstrap additivo 2026-06-17.

## Struttura
- `packages/engine` — motore Python (ex `lessonos`): ingest lezioni → grafo-metodo per-docente → recap grounded (ZERO-LLM). Gate: `cd packages/engine && uv run pytest`.
- `packages/studio` — lavagna TS/React/Vite (ex `ardesia-studio`), canvas Excalidraw, ToolHost↔plugin SDK Layer-0. Gate: `cd packages/studio && npx tsc -b --noEmit && npx vitest run`.
- `packages/tools` — tooling fabbrica (ex `ardesia-tools`): loop, deadman, strategos, replenish, architect.
- `docs/vault` — SoT (ex `ardesia-vault`). **ORIENTAMENTO COMPLETO → `docs/vault/ARDESIA-MAP.md`**.
- `docs/wiki` — wiki di progetto (ex `ardesia-wiki`).

## Regole
- Gate **per-package** (polyglot python+ts+bash; Nx full deferred — cattivo fit per python/bash, opzionale per studio JS).
- **GDPR**: il corpus reale (`maestro-data`) e la PII NON entrano MAI nel repo (gitignored, solo sul Mini).
- Branch: `auto/main` = bot (push diretti), `main` = ratificato (protetto). Vedi `docs/vault/ARDESIA-MAP.md` + `AGENTS.md`.

> Bootstrap **additivo**: i 5 repo originali restano come archivio E il loop live gira ancora lì. Il cutover del loop a questo monorepo = migrazione staged separata (non fatta qui).
