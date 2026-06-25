# ARDESIA Knowledge Map (ops/knowledge/)
last-verified: 2026-06-25
verified-by: F0 firsthand reverify (ssh/curl/sqlite3/gh/vercel) + A2 workflow wf_dcd673fd + F2a gate 3739

Operational knowledge layer. SoT = markdown (this dir + ~/ardesia-vault). Memory backends (AgentMemory :3111) are recall caches over it, NEVER the SoT. Vault wins on mismatch.

## Files
- PRODUCT-STATE.md  - vision, north-star chain, demo state, moat
- FACTORY-STATE.md  - STOP, done-detection, served-SHA gate, budget
- PLUGIN-STATE.md   - plugin-host, ToolHost, manifest-kind, host-boundary
- MARKETPLACE-STATE.md - greenfield spec (deferred per ADR-4)
- GITHUB-VERCEL-STATE.md - repos/SHA/PR/CI + Vercel proj/deploy
- TESTING-STATE.md  - gates, browser-gate, coverage backlog
- UX-STATE.md       - Impeccable, tokens, Goodnotes benchmark
- DECISIONS.md      - ADR index + Andrea gate-list (append-only)
- REGRESSIONS.md    - error history + guards (append-only)
- NO-REGRESSION.md  - the protocol every worker follows

## Update protocol
Before work: read ops/packets/<packet-in> + the relevant *-STATE.md. After: write packet-out, bump *-STATE.md last-verified, append REGRESSIONS if applicable, update AgentMemory. A2 verifies update==evidence. See NO-REGRESSION.md.

## Deep SoT
~/ardesia-vault/ : PROJECT-RECON-ARDESIA-2026-06-25, SYSTEM-DIAGNOSTIC-BRIEF-2026-06-25, REALITY-REVERIFY-2026-06-25, WORKLOG-2026-06-25, ADR-*, PRD-*, *-CANON.
