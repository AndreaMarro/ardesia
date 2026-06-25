# NEXT-GATES (gate-Andrea list)

Source: WF1 audit `gate_items` across all 4 areas (GitHub, Vercel, ELAB triage, llm_wiki). These are actions that require Andrea — they write to GitHub/Vercel, merge/close PRs, deploy prod, touch secrets, or install/ingest new systems. Each has a one-line rationale grounded in the audit.

## Vercel (deployment)

1. **Authorized prod redeploy of ardesia-api-vercel** (`vercel --prod` from `/Users/andreamarro/VOLUME 3/ardesia-api-vercel`) — clears the Error/404; the on-disk vercel.json fix is correct, only Andrea triggers prod.
2. **Attach a custom/exempt domain to ardesia-api-vercel** (DNS + alias) — makes the moat API public without an SSO bypass token (ssoProtection exempts custom domains).
3. **Review and ROTATE elab-tutor secrets** exposed as `VITE_`-prefixed in the client bundle (`VITE_SESSION_SECRET`, `VITE_ADMIN_PWD_HASH`, `VITE_ACCESS_HASH`, `VITE_ELAB_API_KEY`) — these are browser-readable; any real secret is effectively public.
4. **Any change to ssoProtection settings** on ardesia-api-vercel — affects whether previews/prod are gated.

## GitHub (repos / branches)

5. **Add branch protection** to `lessonos/auto/main` and `ardesia/main` — both canonical default lines are currently unprotected; anyone/anything can force-push the factory line.
6. **Push the 3 local-only tech branches** (`lessonos/fix/auth-validator-flag-gated`, `lessonos/feat/mcp-stdio-transport`, `ardesia/ci/engine-sync-guard`) to GitHub if they should be durable — they exist only on the mac-mini.
7. **Reconcile ardesia-studio divergent lineage** (mini `auto/main` `899a350` vs GitHub `auto/main` `f881a78`) — Andrea decision: force-push or merge.
8. **Merge ratifica PRs** lessonos #3 (BLOCKED) / ardesia-studio #2 — merges are gated to Andrea.
9. **Prune ~700 stale elab-tutor branches** (`mac-mini/iter36-user-sim-*`, `auto/test-*`) — bulk delete; major hygiene debt.
10. **Close/triage the 14 stale elab-tutor PRs** (#154–#200) — PR graveyard.

## ELAB (PR flow)

11. **Merge elab-tutor #198** into default (CI-unblock keystone) — its unit suite is fully green; only an E2E jsdom flake remains; merging it unblocks #199/#196/#197/#194.
12. **Close stale conflicting PRs** #161, #171, #154, #155, #156, #157, #158 — all CONFLICTING/DIRTY, 3–5 weeks stale.
13. **Rebase feature PRs #196, #199 onto #198 and push** — to inherit the unit-cluster fix; then add a CHANGELOG entry to clear governance Rule 5.

## Knowledge-Fabric / llm_wiki

14. **Download and install the llm_wiki `.dmg`** — installing a new GPLv3 desktop app requires Andrea approval.
15. **Run a firsthand egress audit** (network sniffer / Little Snitch) during a real ingest — confirm zero external connections in Ollama-only mode before any real data.
16. **Ingest any real corpus / PII / student data into llm_wiki** — BLOCKED until the egress audit (15) passes.
17. **Register the llm_wiki MCP server** into Claude Code / Hermes worker config.

## Priority read (from the audits)

- **HIGHEST product impact:** #1 (prod redeploy) + #2 (custom domain) bring the moat API back online and public.
- **HIGHEST security:** #3 (rotate browser-exposed VITE_ secrets).
- **HIGHEST hygiene/durability:** #5 (branch protection) + #6 (push tech branches) + #11 (merge #198 keystone).
