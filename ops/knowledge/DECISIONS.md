# DECISIONS (append-only) - ADR index + Andrea gate-list
last-verified: 2026-06-25

## ADRs (~/ardesia-vault)
- ADR-FACTORY-SERVED-SHA-GATE-2026-06-25 - git_sha@/health (F2a DONE) + driver gate (prepared, not armed).
- ADR-AUTH-BROWSER-VERCEL-2026-06-24 - serverless token-proxy (T1, gate-Andrea).
- ADR-STUDIO-LINEAGE-2026-06-24 - studio lineage swap (T3, gate-Andrea force-push).
- ADR-ARDESIA-P0-2026-06-24 - canonical DB + done-detection + build-order.

## Open GATE-ANDREA (prepare ADR/PR, do NOT execute)
- T1 web: Vercel prod deploy + env/SSO (secrets + prod-deploy).
- T3 lineage: studio force-with-lease over github (force-push).
- F9 monorepo merge to main (main-merge).
- graph-extraction LLM key (cost/secret).

## Ratified
- Budget EUR3-5/g (Andrea). Builder=Opus, reviewer!=builder. STOP-until-served-SHA-gate (do not un-STOP before gate lands).
